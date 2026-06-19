export const MAX_PLAYERS = 4 as const;

export type TileColor = 'white' | 'black';
export type NumberValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type TileValue = NumberValue | 'joker';

export interface Tile {
  id: string;
  value: TileValue;
  color: TileColor;
  revealed: boolean;
  position: number;
  jokerAssignedValue?: NumberValue;
  jokerPlaced?: boolean;
}

export interface PlayerBoard {
  sessionId: string;
  nickname: string;
  tiles: Tile[];
  eliminated: boolean;
  spectator: boolean;
  jokerReady: boolean;
}

export type GuessClaim =
  | { type: 'number'; value: NumberValue }
  | { type: 'joker' };

export type GamePhase = 'joker_setup' | 'playing' | 'finished';
export type RoomStatus = 'waiting' | 'playing' | 'finished';

export interface GameAction {
  id: string;
  timestamp: number;
  text: string;
}

export interface GameState {
  roomId: string;
  boards: Record<string, PlayerBoard>;
  turnOrder: string[];
  currentTurnIndex: number;
  phase: GamePhase;
  winnerId: string | null;
  winnerNickname: string | null;
  actionLog: GameAction[];
  /** 남은 중앙 더미 */
  drawPile: Tile[];
  /** 이번 턴에 드로우한 타일 id (패널티용) */
  drawnTileId: string | null;
  /** 추리 성공 후 같은 턴에 재추리·패스 선택 가능 */
  canContinueTurn: boolean;
  /** 오답·더미 소진 시 본인 타일 선택 패널티 대기 */
  pendingPenalty: string | null;
  /** 드로우 후 대기 종료 시각(ms). null이면 대기 없음 */
  drawCooldownEndsAt: number | null;
  /** 추리 제한 종료 시각(ms). null이면 제한 없음 */
  guessDeadlineEndsAt: number | null;
}

export interface PlayerSession {
  sessionId: string;
  nickname: string;
  socketId: string;
  roomId: string | null;
  connectedAt: number;
}

export interface Room {
  roomId: string;
  title: string;
  hostSessionId: string;
  playerIds: string[];
  maxPlayers: typeof MAX_PLAYERS;
  status: RoomStatus;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  scope: 'lobby' | 'room';
  roomId?: string;
  senderNickname: string;
  text: string;
  timestamp: number;
}

export interface OnlineUser {
  sessionId: string;
  nickname: string;
  roomId: string | null;
  roomTitle: string | null;
}

export interface RoomSummary {
  roomId: string;
  title: string;
  hostSessionId: string;
  playerCount: number;
  maxPlayers: number;
  status: RoomStatus;
  players: { sessionId: string; nickname: string }[];
}

export interface LobbyState {
  rooms: RoomSummary[];
  onlineUsers: OnlineUser[];
}

export interface RoomState {
  room: Room;
  players: { sessionId: string; nickname: string }[];
}

export interface PlayerGameView {
  gameState: GameState;
  mySessionId: string;
  boards: Record<string, PlayerBoard>;
}
