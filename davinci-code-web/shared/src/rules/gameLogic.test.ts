import { describe, expect, it } from 'vitest';
import { dealTiles } from './deck.js';
import { applyPass, beginTurn, evaluateGuess } from './gameLogic.js';
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

describe('applyPass', () => {
  it('ends turn only after success', () => {
    const game = beginTurn(baseGame());
    const { game: afterSuccess } = evaluateGuess(game, 'player-a', 'player-b', 0, { type: 'number', value: 1 });
    const afterPass = applyPass(afterSuccess, 'player-a');
    expect(afterPass.canContinueTurn).toBe(false);
    expect(afterPass.currentTurnIndex).toBe(1);
  });
});
