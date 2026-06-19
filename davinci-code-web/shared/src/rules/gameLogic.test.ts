import { describe, expect, it } from 'vitest';
import { dealTiles } from './deck.js';
import { applyPass, applyGuessTimeout, beginTurn, evaluateGuess, resolveDrawCooldown } from './gameLogic.js';
import type { GameState, PlayerBoard } from '../types.js';

function mockBoard(sessionId: string, nickname: string): PlayerBoard {
  return {
    sessionId,
    nickname,
    tiles: [
      { id: 't1', value: 1, color: 'black', revealed: false, position: 0 },
      { id: 't2', value: 5, color: 'white', revealed: false, position: 1 },
    ],
    eliminated: false,
    spectator: false,
    jokerReady: true,
  };
}

function baseGame(): GameState {
  const a = 'player-a';
  const b = 'player-b';
  const { drawPile } = dealTiles(2);
  return {
    roomId: 'room-1',
    boards: { [a]: mockBoard(a, 'A'), [b]: mockBoard(b, 'B') },
    turnOrder: [a, b],
    currentTurnIndex: 0,
    phase: 'playing',
    winnerId: null,
    winnerNickname: null,
    actionLog: [],
    drawPile,
    drawnTileId: null,
    canContinueTurn: false,
    pendingPenalty: null,
    drawCooldownEndsAt: null,
    guessDeadlineEndsAt: null,
  };
}

describe('beginTurn', () => {
  it('draws a tile into current player board', () => {
    const game = baseGame();
    const pileBefore = game.drawPile.length;
    const tilesBefore = game.boards['player-a'].tiles.length;
    const updated = beginTurn(game);
    expect(updated.drawPile.length).toBe(pileBefore - 1);
    expect(updated.boards['player-a'].tiles.length).toBe(tilesBefore + 1);
    expect(updated.drawnTileId).not.toBeNull();
    expect(updated.canContinueTurn).toBe(false);
    expect(updated.drawCooldownEndsAt).not.toBeNull();
  });

  it('skips cooldown when draw pile is empty', () => {
    const game = { ...baseGame(), drawPile: [] };
    const updated = beginTurn(game);
    expect(updated.drawnTileId).toBeNull();
    expect(updated.drawCooldownEndsAt).toBeNull();
  });
});

describe('evaluateGuess', () => {
  it('allows continue turn on success without advancing', () => {
    const game = beginTurn(baseGame());
    const turnBefore = game.currentTurnIndex;
    const { game: updated } = evaluateGuess(game, 'player-a', 'player-b', 0, { type: 'number', value: 1 });
    expect(updated.canContinueTurn).toBe(true);
    expect(updated.currentTurnIndex).toBe(turnBefore);
  });

  it('reveals drawn tile on failure when pile was drawn', () => {
    const started = beginTurn(baseGame());
    const drawnId = started.drawnTileId!;
    const { game: updated } = evaluateGuess(started, 'player-a', 'player-b', 0, { type: 'number', value: 9 });
    const tile = updated.boards['player-a'].tiles.find((t) => t.id === drawnId);
    expect(tile?.revealed).toBe(true);
    expect(updated.currentTurnIndex).not.toBe(0);
  });
});

describe('resolveDrawCooldown', () => {
  it('begins first turn without second draw cooldown after initial joker wait', () => {
    const game = {
      ...baseGame(),
      phase: 'playing' as const,
      boards: {
        'player-a': {
          ...baseGame().boards['player-a'],
          tiles: [
            { id: 'j1', value: 'joker' as const, color: 'white' as const, revealed: false, position: 0, jokerPlaced: false },
            { id: 't1', value: 3 as const, color: 'black' as const, revealed: false, position: 1 },
          ],
          jokerReady: false,
        },
        'player-b': baseGame().boards['player-b'],
      },
      drawnTileId: null,
      drawCooldownEndsAt: Date.now() - 1,
      guessDeadlineEndsAt: null,
    };
    const updated = resolveDrawCooldown(game);
    expect(updated.drawCooldownEndsAt).toBeNull();
    expect(updated.drawnTileId).not.toBeNull();
    expect(updated.boards['player-a'].tiles.find((t) => t.id === 'j1')?.jokerPlaced).toBe(true);
    expect(updated.guessDeadlineEndsAt).not.toBeNull();
  });
});

describe('applyGuessTimeout', () => {
  it('ends turn like a failed guess when drawn tile exists', () => {
    const started = beginTurn(baseGame());
    const turnBefore = started.currentTurnIndex;
    const updated = applyGuessTimeout(
      { ...started, guessDeadlineEndsAt: Date.now() - 1 },
    );
    expect(updated.actionLog.at(-1)?.text).toContain('시간 초과');
    expect(updated.currentTurnIndex).not.toBe(turnBefore);
    expect(updated.guessDeadlineEndsAt).toBeNull();
  });
});

describe('applyPass', () => {
  it('ends turn only after success', () => {
    const game = beginTurn(baseGame());
    const { game: afterSuccess } = evaluateGuess(game, 'player-a', 'player-b', 0, { type: 'number', value: 1 });
    const afterPass = applyPass(afterSuccess, 'player-a');
    expect(afterPass.canContinueTurn).toBe(false);
    expect(afterPass.currentTurnIndex).toBe(1);
  });
});
