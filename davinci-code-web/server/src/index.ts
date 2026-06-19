import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import type { NumberValue } from '@davinci/shared';
import { buildPlayerView } from '@davinci/shared';
import { AppStore } from './store.js';
import { parseClientOrigins, resolveCorsOrigin } from './corsOrigins.js';

const PORT = Number(process.env.PORT ?? 3001);
const clientOrigins = parseClientOrigins(process.env.CLIENT_ORIGIN ?? 'http://localhost:5173');
const isDev = process.env.NODE_ENV !== 'production';
const corsOrigin = resolveCorsOrigin(isDev, clientOrigins);

const app = express();
app.use(cors({ origin: corsOrigin }));
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: corsOrigin },
});

const store = new AppStore();

function emitLobby(): void {
  io.emit('lobby:state', store.getLobbyState());
}

function emitRoom(roomId: string): void {
  const state = store.getRoomState(roomId);
  if (state) {
    io.to(`room:${roomId}`).emit('room:state', state);
  }
}

function emitGame(roomId: string): void {
  const game = store.games.get(roomId);
  const room = store.rooms.get(roomId);
  if (!game || !room) {
    return;
  }
  for (const sessionId of room.playerIds) {
    const session = store.sessions.get(sessionId);
    if (!session) {
      continue;
    }
    io.to(session.socketId).emit('game:state', {
      gameState: game,
      playerView: buildPlayerView(game, sessionId),
      mySessionId: sessionId,
    });
  }
}

function broadcastRoomChats(roomId: string): void {
  const chats = store.roomChats.get(roomId) ?? [];
  io.to(`room:${roomId}`).emit('chat:history', { scope: 'room', roomId, messages: chats });
}

io.on('connection', (socket) => {
  socket.on('lobby:join', ({ nickname }: { nickname: string }) => {
    if (!nickname?.trim() || nickname.trim().length < 2) {
      socket.emit('error', { code: 'INVALID_NICKNAME', message: '닉네임은 2자 이상이어야 합니다.' });
      return;
    }
    const session = store.registerSession(socket.id, nickname);
    socket.emit('session:assigned', { sessionId: session.sessionId, nickname: session.nickname });
    socket.emit('chat:history', { scope: 'lobby', messages: store.lobbyChats });
    emitLobby();
  });

  socket.on('lobby:rejoin', ({ sessionId }: { sessionId: string }) => {
    const session = store.reconnectSession(socket.id, sessionId);
    if (!session) {
      socket.emit('error', { code: 'SESSION_EXPIRED', message: '세션이 만료되었습니다. 다시 입장해주세요.' });
      return;
    }
    socket.emit('session:assigned', { sessionId: session.sessionId, nickname: session.nickname });
    if (session.roomId) {
      socket.join(`room:${session.roomId}`);
      emitRoom(session.roomId);
      if (store.games.has(session.roomId)) {
        emitGame(session.roomId);
      }
      broadcastRoomChats(session.roomId);
    }
    socket.emit('chat:history', { scope: 'lobby', messages: store.lobbyChats });
    emitLobby();
  });

  socket.on('room:create', ({ title }: { title: string }) => {
    const session = store.getSessionBySocket(socket.id);
    if (!session) {
      socket.emit('error', { code: 'NO_SESSION', message: '세션이 없습니다. 다시 로비에 입장해주세요.' });
      return;
    }
    try {
      const room = store.createRoom(session.sessionId, title);
      socket.join(`room:${room.roomId}`);
      emitLobby();
      const state = store.getRoomState(room.roomId);
      if (state) {
        socket.emit('room:state', state);
      }
      emitRoom(room.roomId);
    } catch (e) {
      socket.emit('error', { code: 'ROOM_CREATE_FAILED', message: (e as Error).message });
    }
  });

  socket.on('room:join', ({ roomId }: { roomId: string }) => {
    const session = store.getSessionBySocket(socket.id);
    if (!session) {
      socket.emit('error', { code: 'NO_SESSION', message: '세션이 없습니다. 다시 로비에 입장해주세요.' });
      return;
    }
    if (session.roomId === roomId) {
      socket.join(`room:${roomId}`);
      emitRoom(roomId);
      broadcastRoomChats(roomId);
      return;
    }
    if (session.roomId) {
      socket.emit('error', { code: 'ROOM_JOIN_FAILED', message: '이미 다른 방에 있습니다.' });
      return;
    }
    try {
      const room = store.joinRoom(session.sessionId, roomId);
      socket.join(`room:${roomId}`);
      emitLobby();
      emitRoom(room.roomId);
      broadcastRoomChats(room.roomId);
    } catch (e) {
      socket.emit('error', { code: 'ROOM_JOIN_FAILED', message: (e as Error).message });
    }
  });

  socket.on('room:leave', () => {
    const session = store.getSessionBySocket(socket.id);
    if (!session?.roomId) {
      return;
    }
    const roomId = session.roomId;
    socket.leave(`room:${roomId}`);
    store.leaveRoom(session.sessionId);
    emitLobby();
    emitRoom(roomId);
  });

  socket.on('chat:send', ({ scope, text, roomId }: { scope: 'lobby' | 'room'; text: string; roomId?: string }) => {
    const session = store.getSessionBySocket(socket.id);
    if (!session || !text?.trim()) {
      return;
    }
    const message = store.addChat(scope, session.nickname, text, roomId);
    if (scope === 'lobby') {
      io.emit('chat:message', message);
    } else if (roomId) {
      io.to(`room:${roomId}`).emit('chat:message', message);
    }
  });

  socket.on('game:start', () => {
    const session = store.getSessionBySocket(socket.id);
    if (!session?.roomId) {
      return;
    }
    try {
      store.startGame(session.roomId, session.sessionId);
      emitRoom(session.roomId);
      emitGame(session.roomId);
      emitLobby();
    } catch (e) {
      socket.emit('error', { code: 'GAME_START_FAILED', message: (e as Error).message });
    }
  });

  socket.on('game:placeJoker', ({ assignedValue, position }: { assignedValue: NumberValue; position: number }) => {
    const session = store.getSessionBySocket(socket.id);
    if (!session?.roomId) {
      return;
    }
    try {
      store.placeJoker(session.roomId, session.sessionId, assignedValue, position);
      emitGame(session.roomId);
    } catch (e) {
      socket.emit('error', { code: 'JOKER_PLACE_FAILED', message: (e as Error).message });
    }
  });

  socket.on(
    'game:guess',
    ({
      targetSessionId,
      tileIndex,
      claim,
    }: {
      targetSessionId: string;
      tileIndex: number;
      claim: { type: 'number'; value: NumberValue } | { type: 'joker' };
    }) => {
      const session = store.getSessionBySocket(socket.id);
      if (!session?.roomId) {
        return;
      }
      try {
        store.guess(session.roomId, session.sessionId, targetSessionId, tileIndex, claim);
        emitGame(session.roomId);
        emitRoom(session.roomId);
      } catch (e) {
        socket.emit('error', { code: 'GUESS_FAILED', message: (e as Error).message });
      }
    },
  );

  socket.on('game:pass', () => {
    const session = store.getSessionBySocket(socket.id);
    if (!session?.roomId) {
      return;
    }
    try {
      store.pass(session.roomId, session.sessionId);
      emitGame(session.roomId);
    } catch (e) {
      socket.emit('error', { code: 'PASS_FAILED', message: (e as Error).message });
    }
  });

  socket.on('game:penalty', ({ tileId }: { tileId: string }) => {
    const session = store.getSessionBySocket(socket.id);
    if (!session?.roomId) {
      return;
    }
    try {
      store.penalty(session.roomId, session.sessionId, tileId);
      emitGame(session.roomId);
      emitRoom(session.roomId);
    } catch (e) {
      socket.emit('error', { code: 'PENALTY_FAILED', message: (e as Error).message });
    }
  });

  socket.on('game:reset', () => {
    const session = store.getSessionBySocket(socket.id);
    if (!session?.roomId) {
      return;
    }
    try {
      store.resetRoomToWaiting(session.roomId, session.sessionId);
      emitRoom(session.roomId);
      emitLobby();
      io.to(`room:${session.roomId}`).emit('game:state', null);
    } catch (e) {
      socket.emit('error', { code: 'RESET_FAILED', message: (e as Error).message });
    }
  });

  socket.on('disconnect', () => {
    store.removeSocket(socket.id);
    emitLobby();
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
