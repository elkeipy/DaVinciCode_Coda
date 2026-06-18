import type {
  ChatMessage,
  GameState,
  LobbyState,
  NumberValue,
  PlayerBoard,
  RoomState,
} from '@davinci/shared';
import { create } from 'zustand';

interface GameView {
  gameState: GameState;
  playerView: Record<string, PlayerBoard>;
  mySessionId: string;
}

interface AppState {
  connected: boolean;
  sessionId: string | null;
  nickname: string | null;
  lobby: LobbyState | null;
  room: RoomState | null;
  game: GameView | null;
  lobbyMessages: ChatMessage[];
  roomMessages: ChatMessage[];
  error: string | null;
  setConnected: (v: boolean) => void;
  setSession: (sessionId: string, nickname: string) => void;
  setLobby: (lobby: LobbyState) => void;
  setRoom: (room: RoomState | null) => void;
  setGame: (game: GameView | null) => void;
  addChat: (msg: ChatMessage) => void;
  setChatHistory: (scope: 'lobby' | 'room', messages: ChatMessage[]) => void;
  setError: (msg: string | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  connected: false,
  sessionId: null,
  nickname: null,
  lobby: null,
  room: null,
  game: null,
  lobbyMessages: [],
  roomMessages: [],
  error: null,
  setConnected: (connected) => set({ connected }),
  setSession: (sessionId, nickname) => {
    localStorage.setItem('davinci_sessionId', sessionId);
    localStorage.setItem('davinci_nickname', nickname);
    set({ sessionId, nickname });
  },
  setLobby: (lobby) => set({ lobby }),
  setRoom: (room) => set({ room }),
  setGame: (game) => set({ game }),
  addChat: (msg) =>
    set((s) => ({
      lobbyMessages: msg.scope === 'lobby' ? [...s.lobbyMessages, msg] : s.lobbyMessages,
      roomMessages: msg.scope === 'room' ? [...s.roomMessages, msg] : s.roomMessages,
    })),
  setChatHistory: (scope, messages) =>
    set(scope === 'lobby' ? { lobbyMessages: messages } : { roomMessages: messages }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      room: null,
      game: null,
      roomMessages: [],
    }),
}));

export type { NumberValue, GameView };
