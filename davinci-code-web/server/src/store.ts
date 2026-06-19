import { randomUUID } from 'node:crypto';
import type {
  ChatMessage,
  GameState,
  LobbyState,
  NumberValue,
  OnlineUser,
  PlayerBoard,
  PlayerSession,
  Room,
  RoomState,
  RoomSummary,
} from '@davinci/shared';
import {
  MAX_PLAYERS,
  allPlayersJokerReady,
  applyPass,
  applyPenaltyTile,
  dealTiles,
  enterPlayingPhase,
  evaluateGuess,
  markJokerReady,
  placeJokerTile,
  sortTiles,
} from '@davinci/shared';

export class AppStore {
  sessions = new Map<string, PlayerSession>();
  socketToSession = new Map<string, string>();
  rooms = new Map<string, Room>();
  games = new Map<string, GameState>();
  lobbyChats: ChatMessage[] = [];
  roomChats = new Map<string, ChatMessage[]>();
  nicknameCounts = new Map<string, number>();

  createUniqueNickname(nickname: string): string {
    const count = this.nicknameCounts.get(nickname) ?? 0;
    if (count === 0) {
      this.nicknameCounts.set(nickname, 1);
      return nickname;
    }
    const unique = `${nickname}#${count + 1}`;
    this.nicknameCounts.set(nickname, count + 1);
    return unique;
  }

  registerSession(socketId: string, nickname: string): PlayerSession {
    const uniqueNickname = this.createUniqueNickname(nickname.trim());
    const session: PlayerSession = {
      sessionId: randomUUID(),
      nickname: uniqueNickname,
      socketId,
      roomId: null,
      connectedAt: Date.now(),
    };
    this.sessions.set(session.sessionId, session);
    this.socketToSession.set(socketId, session.sessionId);
    return session;
  }

  reconnectSession(socketId: string, sessionId: string): PlayerSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }
    this.socketToSession.delete(session.socketId);
    session.socketId = socketId;
    this.socketToSession.set(socketId, sessionId);
    return session;
  }

  getSessionBySocket(socketId: string): PlayerSession | undefined {
    const id = this.socketToSession.get(socketId);
    return id ? this.sessions.get(id) : undefined;
  }

  removeSocket(socketId: string): PlayerSession | undefined {
    const session = this.getSessionBySocket(socketId);
    if (!session) {
      return undefined;
    }
    this.socketToSession.delete(socketId);
    if (session.roomId) {
      const room = this.rooms.get(session.roomId);
      if (room?.status === 'playing') {
        const game = this.games.get(session.roomId);
        if (game) {
          const board = game.boards[session.sessionId];
          if (board && !board.eliminated) {
            game.boards[session.sessionId] = {
              ...board,
              eliminated: true,
              spectator: true,
              tiles: board.tiles.map((t) => ({ ...t, revealed: true })),
            };
          }
        }
      }
      this.leaveRoom(session.sessionId);
    }
    return session;
  }

  getLobbyState(): LobbyState {
    const rooms: RoomSummary[] = [...this.rooms.values()].map((room) => this.toRoomSummary(room));
    const onlineUsers: OnlineUser[] = [...this.sessions.values()].map((s) => ({
      sessionId: s.sessionId,
      nickname: s.nickname,
      roomId: s.roomId,
      roomTitle: s.roomId ? this.rooms.get(s.roomId)?.title ?? null : null,
    }));
    return { rooms, onlineUsers };
  }

  toRoomSummary(room: Room): RoomSummary {
    return {
      roomId: room.roomId,
      title: room.title,
      hostSessionId: room.hostSessionId,
      playerCount: room.playerIds.length,
      maxPlayers: room.maxPlayers,
      status: room.status,
      players: room.playerIds.map((id) => ({
        sessionId: id,
        nickname: this.sessions.get(id)?.nickname ?? '?',
      })),
    };
  }

  createRoom(sessionId: string, title: string): Room {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    if (session.roomId) {
      throw new Error('Already in a room');
    }
    const room: Room = {
      roomId: randomUUID(),
      title: title.trim() || 'ROOM 1',
      hostSessionId: sessionId,
      playerIds: [sessionId],
      maxPlayers: MAX_PLAYERS,
      status: 'waiting',
      createdAt: Date.now(),
    };
    this.rooms.set(room.roomId, room);
    session.roomId = room.roomId;
    this.roomChats.set(room.roomId, []);
    return room;
  }

  joinRoom(sessionId: string, roomId: string): Room {
    const session = this.sessions.get(sessionId);
    const room = this.rooms.get(roomId);
    if (!session || !room) {
      throw new Error('Invalid room or session');
    }
    if (session.roomId) {
      throw new Error('Already in a room');
    }
    if (room.playerIds.length >= room.maxPlayers) {
      throw new Error('Room is full');
    }
    if (room.status !== 'waiting') {
      throw new Error('Game already in progress');
    }
    room.playerIds.push(sessionId);
    session.roomId = roomId;
    if (!this.roomChats.has(roomId)) {
      this.roomChats.set(roomId, []);
    }
    return room;
  }

  leaveRoom(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session?.roomId) {
      return;
    }
    const room = this.rooms.get(session.roomId);
    if (!room) {
      session.roomId = null;
      return;
    }
    room.playerIds = room.playerIds.filter((id) => id !== sessionId);
    session.roomId = null;
    if (room.playerIds.length === 0) {
      this.rooms.delete(room.roomId);
      this.games.delete(room.roomId);
      this.roomChats.delete(room.roomId);
      return;
    }
    if (room.hostSessionId === sessionId) {
      room.hostSessionId = room.playerIds[0];
    }
    if (room.status === 'playing') {
      this.games.delete(room.roomId);
      room.status = 'waiting';
    }
  }

  getRoomState(roomId: string): RoomState | null {
    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }
    return {
      room,
      players: room.playerIds.map((id) => ({
        sessionId: id,
        nickname: this.sessions.get(id)?.nickname ?? '?',
      })),
    };
  }

  addChat(scope: 'lobby' | 'room', senderNickname: string, text: string, roomId?: string): ChatMessage {
    const message: ChatMessage = {
      id: randomUUID(),
      scope,
      roomId,
      senderNickname,
      text: text.trim(),
      timestamp: Date.now(),
    };
    if (scope === 'lobby') {
      this.lobbyChats.push(message);
      if (this.lobbyChats.length > 100) {
        this.lobbyChats.shift();
      }
    } else if (roomId) {
      const chats = this.roomChats.get(roomId) ?? [];
      chats.push(message);
      if (chats.length > 100) {
        chats.shift();
      }
      this.roomChats.set(roomId, chats);
    }
    return message;
  }

  startGame(roomId: string, hostSessionId: string): GameState {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    if (room.hostSessionId !== hostSessionId) {
      throw new Error('Only host can start');
    }
    if (room.playerIds.length < 2 || room.playerIds.length > MAX_PLAYERS) {
      throw new Error('Need 2-4 players');
    }
    const { hands, drawPile } = dealTiles(room.playerIds.length);
    const boards: Record<string, PlayerBoard> = {};
    room.playerIds.forEach((sessionId, index) => {
      const session = this.sessions.get(sessionId)!;
      const sorted = sortTiles(
        hands[index].map((t, i) => ({ ...t, position: i })),
      );
      const hasJoker = sorted.some((t) => t.value === 'joker');
      boards[sessionId] = {
        sessionId,
        nickname: session.nickname,
        tiles: sorted,
        eliminated: false,
        spectator: false,
        jokerReady: !hasJoker,
      };
    });
    const hasJokerSetup = Object.values(boards).some((b) => !b.jokerReady);
    let game: GameState = {
      roomId,
      boards,
      turnOrder: [...room.playerIds],
      currentTurnIndex: 0,
      phase: hasJokerSetup ? 'joker_setup' : 'playing',
      winnerId: null,
      winnerNickname: null,
      actionLog: [],
      drawPile,
      drawnTileId: null,
      canContinueTurn: false,
      pendingPenalty: null,
    };
    if (!hasJokerSetup) {
      game = enterPlayingPhase(game);
    }
    room.status = 'playing';
    this.games.set(roomId, game);
    return game;
  }

  placeJoker(
    roomId: string,
    sessionId: string,
    assignedValue: NumberValue,
    position: number,
  ): GameState {
    const game = this.games.get(roomId);
    if (!game) {
      throw new Error('Game not found');
    }
    const board = game.boards[sessionId];
    if (!board) {
      throw new Error('Player not in game');
    }
    const joker = board.tiles.find((t) => t.value === 'joker');
    if (!joker) {
      throw new Error('No joker to place');
    }
    const newTiles = placeJokerTile(board.tiles, joker.id, assignedValue, position);
    const updatedBoard = markJokerReady({ ...board, tiles: newTiles });
    game.boards[sessionId] = updatedBoard;
    if (allPlayersJokerReady(game.boards)) {
      const playing = enterPlayingPhase({ ...game, phase: 'playing' });
      this.games.set(roomId, playing);
      return playing;
    }
    this.games.set(roomId, game);
    return game;
  }

  guess(
    roomId: string,
    guesserId: string,
    targetId: string,
    tileIndex: number,
    claim: { type: 'number'; value: NumberValue } | { type: 'joker' },
  ): GameState {
    const game = this.games.get(roomId);
    if (!game || game.phase !== 'playing') {
      throw new Error('Game not in playing phase');
    }
    const currentId = game.turnOrder[game.currentTurnIndex];
    if (currentId !== guesserId) {
      throw new Error('Not your turn');
    }
    if (game.pendingPenalty) {
      throw new Error('Resolve penalty first');
    }
    const guesser = game.boards[guesserId];
    if (guesser.eliminated || guesser.spectator) {
      throw new Error('Cannot act while spectating');
    }
    const { game: updated } = evaluateGuess(game, guesserId, targetId, tileIndex, claim);
    this.games.set(roomId, updated);
    const room = this.rooms.get(roomId);
    if (room && updated.phase === 'finished') {
      room.status = 'finished';
    }
    return updated;
  }

  pass(roomId: string, sessionId: string): GameState {
    const game = this.games.get(roomId);
    if (!game || game.phase !== 'playing') {
      throw new Error('Game not in playing phase');
    }
    const currentId = game.turnOrder[game.currentTurnIndex];
    if (currentId !== sessionId) {
      throw new Error('Not your turn');
    }
    const board = game.boards[sessionId];
    if (board.eliminated) {
      throw new Error('Cannot pass while eliminated');
    }
    if (game.pendingPenalty) {
      throw new Error('Resolve penalty first');
    }
    const updated = applyPass(game, sessionId);
    this.games.set(roomId, updated);
    const room = this.rooms.get(roomId);
    if (room && updated.phase === 'finished') {
      room.status = 'finished';
    }
    return updated;
  }

  penalty(roomId: string, sessionId: string, tileId: string): GameState {
    const game = this.games.get(roomId);
    if (!game || game.phase !== 'playing') {
      throw new Error('Game not in playing phase');
    }
    const updated = applyPenaltyTile(game, sessionId, tileId);
    this.games.set(roomId, updated);
    const room = this.rooms.get(roomId);
    if (room && updated.phase === 'finished') {
      room.status = 'finished';
    }
    return updated;
  }

  resetRoomToWaiting(roomId: string, hostSessionId: string): void {
    const room = this.rooms.get(roomId);
    if (!room || room.hostSessionId !== hostSessionId) {
      throw new Error('Only host can reset');
    }
    room.status = 'waiting';
    this.games.delete(roomId);
  }
}
