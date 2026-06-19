import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ChatMessage, GameState, LobbyState, PlayerBoard, RoomState } from '@davinci/shared';
import { useAppStore } from '../stores/sessionStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3001';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, { autoConnect: false });
  }
  return socket;
}

export function useSocket(): Socket {
  useEffect(() => {
    const s = getSocket();

    const onConnect = () => useAppStore.getState().setConnected(true);
    const onDisconnect = () => useAppStore.getState().setConnected(false);
    const onSessionAssigned = ({
      sessionId,
      nickname,
    }: {
      sessionId: string;
      nickname: string;
    }) => useAppStore.getState().setSession(sessionId, nickname);
    const onLobbyState = (lobby: LobbyState) => useAppStore.getState().setLobby(lobby);
    const onRoomState = (room: RoomState | null) => useAppStore.getState().setRoom(room);
    const onGameState = (payload: {
      gameState: GameState;
      playerView: Record<string, PlayerBoard>;
      mySessionId: string;
    } | null) => useAppStore.getState().setGame(payload);
    const onChatMessage = (msg: ChatMessage) => useAppStore.getState().addChat(msg);
    const onChatHistory = ({
      scope,
      messages,
    }: {
      scope: 'lobby' | 'room';
      messages: ChatMessage[];
    }) => useAppStore.getState().setChatHistory(scope, messages);
    const onError = ({ code, message }: { code?: string; message: string }) => {
      if (code === 'SESSION_EXPIRED') {
        localStorage.removeItem('davinci_sessionId');
      }
      useAppStore.getState().setError(message);
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('session:assigned', onSessionAssigned);
    s.on('lobby:state', onLobbyState);
    s.on('room:state', onRoomState);
    s.on('game:state', onGameState);
    s.on('chat:message', onChatMessage);
    s.on('chat:history', onChatHistory);
    s.on('error', onError);

    if (s.connected) {
      useAppStore.getState().setConnected(true);
    }
    s.connect();

    const savedSession = localStorage.getItem('davinci_sessionId');
    if (savedSession) {
      s.emit('lobby:rejoin', { sessionId: savedSession });
    }

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('session:assigned', onSessionAssigned);
      s.off('lobby:state', onLobbyState);
      s.off('room:state', onRoomState);
      s.off('game:state', onGameState);
      s.off('chat:message', onChatMessage);
      s.off('chat:history', onChatHistory);
      s.off('error', onError);
    };
  }, []);

  return getSocket();
}
