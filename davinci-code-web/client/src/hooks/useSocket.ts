import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
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
  const bound = useRef(false);
  const store = useAppStore();

  useEffect(() => {
    if (bound.current) {
      return;
    }
    bound.current = true;
    const s = getSocket();

    s.on('connect', () => store.setConnected(true));
    s.on('disconnect', () => store.setConnected(false));
    s.on('session:assigned', ({ sessionId, nickname }) => store.setSession(sessionId, nickname));
    s.on('lobby:state', (lobby) => store.setLobby(lobby));
    s.on('room:state', (room) => store.setRoom(room));
    s.on('game:state', (payload) => store.setGame(payload));
    s.on('chat:message', (msg) => store.addChat(msg));
    s.on('chat:history', ({ scope, messages }) => store.setChatHistory(scope, messages));
    s.on('error', ({ message }) => store.setError(message));

    s.connect();
    const savedSession = localStorage.getItem('davinci_sessionId');
    if (savedSession) {
      s.emit('lobby:rejoin', { sessionId: savedSession });
    }

    return () => {
      s.off('connect');
      s.off('disconnect');
      s.off('session:assigned');
      s.off('lobby:state');
      s.off('room:state');
      s.off('game:state');
      s.off('chat:message');
      s.off('chat:history');
      s.off('error');
    };
  }, [store]);

  return getSocket();
}
