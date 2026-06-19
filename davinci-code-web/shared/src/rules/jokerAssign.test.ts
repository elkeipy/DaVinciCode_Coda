import { describe, expect, it } from 'vitest';
import type { GameState } from '../types.js';
import { pickRandomJokerValue } from './jokerAssign.js';

function mockGame(): GameState {
  return {
    roomId: 'room-1',
    boards: {
      me: {
        sessionId: 'me',
        nickname: 'Me',
        tiles: [
          { id: 't1', value: 3, color: 'black', revealed: false, position: 0 },
          { id: 'j1', value: 'joker', color: 'white', revealed: false, position: 1, jokerPlaced: false },
        ],
        eliminated: false,
        spectator: false,
        jokerReady: false,
      },
      other: {
        sessionId: 'other',
        nickname: 'Other',
        tiles: [
          { id: 't2', value: 5, color: 'white', revealed: true, position: 0 },
          { id: 't3', value: 7, color: 'black', revealed: false, position: 1 },
        ],
        eliminated: false,
        spectator: false,
        jokerReady: true,
      },
    },
    turnOrder: ['me', 'other'],
    currentTurnIndex: 0,
    phase: 'playing',
    winnerId: null,
    winnerNickname: null,
    actionLog: [],
    drawPile: [],
    drawnTileId: 'j1',
    canContinueTurn: false,
    pendingPenalty: null,
    drawCooldownEndsAt: Date.now() + 5000,
    guessDeadlineEndsAt: null,
  };
}

describe('pickRandomJokerValue', () => {
  it('excludes numbers on own tiles and revealed opponent tiles', () => {
    const game = mockGame();
    for (let i = 0; i < 30; i += 1) {
      const value = pickRandomJokerValue(game, 'me');
      expect(value).not.toBe(3);
      expect(value).not.toBe(5);
    }
  });
});
