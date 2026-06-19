import type { GameAction, GameState, GuessClaim, NumberValue, PlayerBoard, Tile } from '../types.js';
import { DRAW_COOLDOWN_MS, GUESS_TIMEOUT_MS } from '../config.js';
import { drawFromPile, tileMatchesClaim } from './deck.js';
import { pickRandomJokerValue } from './jokerAssign.js';
import { allJokersPlaced, placeJokerTile, sortTiles } from './sort.js';

export function isDrawCooldownActive(game: GameState, now = Date.now()): boolean {
  return game.drawCooldownEndsAt !== null && now < game.drawCooldownEndsAt;
}

export function isGuessDeadlineActive(game: GameState, now = Date.now()): boolean {
  return game.guessDeadlineEndsAt !== null && now < game.guessDeadlineEndsAt;
}

export function startGuessDeadline(game: GameState, now = Date.now()): GameState {
  if (game.phase !== 'playing' || game.pendingPenalty) {
    return { ...game, guessDeadlineEndsAt: null };
  }
  if (isDrawCooldownActive(game, now)) {
    return { ...game, guessDeadlineEndsAt: null };
  }
  const currentId = game.turnOrder[game.currentTurnIndex];
  const board = game.boards[currentId];
  if (!board || board.eliminated || board.spectator) {
    return { ...game, guessDeadlineEndsAt: null };
  }
  if (board.tiles.some((t) => t.value === 'joker' && !t.jokerPlaced)) {
    return { ...game, guessDeadlineEndsAt: null };
  }
  return { ...game, guessDeadlineEndsAt: now + GUESS_TIMEOUT_MS };
}

export function pickRandomHiddenTile(tiles: Tile[]): Tile | null {
  const hidden = tiles.filter((t) => !t.revealed);
  if (hidden.length === 0) {
    return null;
  }
  return hidden[Math.floor(Math.random() * hidden.length)];
}

export function revealTile(tiles: Tile[], tileId: string): Tile[] {
  return tiles.map((t) => (t.id === tileId ? { ...t, revealed: true } : t));
}

export function checkElimination(board: PlayerBoard): PlayerBoard {
  const allRevealed = board.tiles.every((t) => t.revealed);
  if (allRevealed) {
    return { ...board, eliminated: true, spectator: true };
  }
  return board;
}

export function getActivePlayers(game: GameState): string[] {
  return game.turnOrder.filter((id) => {
    const board = game.boards[id];
    return board && !board.eliminated;
  });
}

export function getWinner(game: GameState): { winnerId: string; winnerNickname: string } | null {
  const active = getActivePlayers(game);
  if (active.length === 1 && game.phase === 'playing') {
    const winnerId = active[0];
    return { winnerId, winnerNickname: game.boards[winnerId].nickname };
  }
  return null;
}

export function advanceTurn(game: GameState): GameState {
  const active = getActivePlayers(game);
  if (active.length <= 1) {
    return game;
  }
  let nextIndex = game.currentTurnIndex;
  for (let i = 0; i < game.turnOrder.length; i += 1) {
    nextIndex = (nextIndex + 1) % game.turnOrder.length;
    const sessionId = game.turnOrder[nextIndex];
    const board = game.boards[sessionId];
    if (board && !board.eliminated) {
      break;
    }
  }
  return { ...game, currentTurnIndex: nextIndex, drawnTileId: null, pendingPenalty: null, canContinueTurn: false, drawCooldownEndsAt: null, guessDeadlineEndsAt: null };
}

export function beginTurn(
  game: GameState,
  now = Date.now(),
  options?: { skipDrawCooldown?: boolean },
): GameState {
  if (game.phase !== 'playing' || game.pendingPenalty) {
    return game;
  }
  const currentId = game.turnOrder[game.currentTurnIndex];
  const board = game.boards[currentId];
  if (!board || board.eliminated) {
    return game;
  }
  if (game.drawPile.length === 0) {
    return startGuessDeadline({
      ...game,
      drawnTileId: null,
      canContinueTurn: false,
      drawCooldownEndsAt: null,
      guessDeadlineEndsAt: null,
    }, now);
  }
  const { tile, remaining } = drawFromPile(game.drawPile);
  const newTiles = sortTiles([...board.tiles, { ...tile, position: board.tiles.length }]);
  const skipDrawCooldown = options?.skipDrawCooldown ?? false;
  return {
    ...game,
    drawPile: remaining,
    drawnTileId: tile.id,
    canContinueTurn: false,
    drawCooldownEndsAt: skipDrawCooldown ? null : now + DRAW_COOLDOWN_MS,
    guessDeadlineEndsAt: null,
    boards: { ...game.boards, [currentId]: { ...board, tiles: newTiles } },
  };
}

function appendAction(game: GameState, text: string): GameState {
  const action: GameAction = {
    id: `action-${Date.now()}`,
    timestamp: Date.now(),
    text,
  };
  return { ...game, actionLog: [...game.actionLog, action] };
}

function finalizeAfterTurn(game: GameState): GameState {
  let updated = beginTurn(advanceTurn(game));
  const winner = getWinner(updated);
  if (winner) {
    updated = {
      ...updated,
      phase: 'finished',
      winnerId: winner.winnerId,
      winnerNickname: winner.winnerNickname,
    };
  }
  return updated;
}

export function evaluateGuess(
  game: GameState,
  guesserId: string,
  targetId: string,
  tileIndex: number,
  claim: GuessClaim,
): { game: GameState; log: string } {
  const targetBoard = game.boards[targetId];
  const guesserBoard = game.boards[guesserId];
  if (!targetBoard || !guesserBoard) {
    throw new Error('Invalid player');
  }
  const targetTile = targetBoard.tiles[tileIndex];
  if (!targetTile || targetTile.revealed) {
    throw new Error('Invalid target tile');
  }
  const correct = tileMatchesClaim(targetTile, claim);
  let boards = { ...game.boards };
  let logText: string;
  const claimLabel = claim.type === 'joker' ? '조커' : String(claim.value);
  if (correct) {
    boards[targetId] = checkElimination({
      ...targetBoard,
      tiles: revealTile(targetBoard.tiles, targetTile.id),
    });
    logText = `${guesserBoard.nickname} → ${targetBoard.nickname} [${tileIndex + 1}] = ${claimLabel} ✓`;
    let updated = appendAction({ ...game, boards, guessDeadlineEndsAt: null }, logText);
    updated = { ...updated, canContinueTurn: true };
    const winner = getWinner(updated);
    if (winner) {
      updated = {
        ...updated,
        phase: 'finished',
        winnerId: winner.winnerId,
        winnerNickname: winner.winnerNickname,
        canContinueTurn: false,
      };
      return { game: updated, log: logText };
    }
    updated = startGuessDeadline(updated, Date.now());
    return { game: updated, log: logText };
  }
  logText = `${guesserBoard.nickname} → ${targetBoard.nickname} [${tileIndex + 1}] = ${claimLabel} ✗`;
  let updated = appendAction({ ...game, boards, guessDeadlineEndsAt: null, canContinueTurn: false }, logText);
  if (updated.drawnTileId) {
    const penaltyId = updated.drawnTileId;
    boards = {
      ...boards,
      [guesserId]: checkElimination({
        ...guesserBoard,
        tiles: revealTile(guesserBoard.tiles, penaltyId),
      }),
    };
    updated = { ...updated, boards };
    updated = finalizeAfterTurn(updated);
    return { game: updated, log: logText };
  }
  updated = { ...updated, pendingPenalty: guesserId };
  return { game: updated, log: logText };
}

export function applyPenaltyTile(game: GameState, sessionId: string, tileId: string): GameState {
  if (game.pendingPenalty !== sessionId) {
    throw new Error('No penalty pending for this player');
  }
  const board = game.boards[sessionId];
  if (!board) {
    throw new Error('Invalid player');
  }
  const tile = board.tiles.find((t) => t.id === tileId);
  if (!tile || tile.revealed) {
    throw new Error('Invalid penalty tile');
  }
  const boards = {
    ...game.boards,
    [sessionId]: checkElimination({
      ...board,
      tiles: revealTile(board.tiles, tileId),
    }),
  };
  const logText = `${board.nickname} 패널티 — 타일 공개`;
  let updated = appendAction({ ...game, boards, pendingPenalty: null }, logText);
  updated = finalizeAfterTurn(updated);
  return updated;
}

export function applyPass(game: GameState, sessionId: string): GameState {
  const currentId = game.turnOrder[game.currentTurnIndex];
  if (currentId !== sessionId) {
    throw new Error('Not your turn');
  }
  if (!game.canContinueTurn) {
    throw new Error('Pass is only available after a successful guess this turn');
  }
  const board = game.boards[sessionId];
  if (!board) {
    throw new Error('Invalid player');
  }
  const logText = `${board.nickname} 패스`;
  let updated = appendAction({ ...game, canContinueTurn: false, guessDeadlineEndsAt: null }, logText);
  updated = finalizeAfterTurn(updated);
  return updated;
}

export function allPlayersJokerReady(boards: Record<string, PlayerBoard>): boolean {
  return Object.values(boards).every((b) => b.jokerReady);
}

export function markJokerReady(board: PlayerBoard): PlayerBoard {
  const hasJoker = board.tiles.some((t) => t.value === 'joker');
  if (!hasJoker) {
    return { ...board, jokerReady: true };
  }
  return { ...board, jokerReady: allJokersPlaced(board.tiles) };
}

export function applyGuessTimeout(game: GameState, now = Date.now()): GameState {
  if (game.guessDeadlineEndsAt === null || now < game.guessDeadlineEndsAt) {
    return game;
  }
  if (game.phase !== 'playing' || game.pendingPenalty) {
    return { ...game, guessDeadlineEndsAt: null };
  }
  const guesserId = game.turnOrder[game.currentTurnIndex];
  const guesserBoard = game.boards[guesserId];
  if (!guesserBoard) {
    return { ...game, guessDeadlineEndsAt: null };
  }
  const logText = `${guesserBoard.nickname} 시간 초과 ✗`;
  let updated = appendAction(
    { ...game, guessDeadlineEndsAt: null, canContinueTurn: false },
    logText,
  );
  if (updated.drawnTileId) {
    const boards = {
      ...updated.boards,
      [guesserId]: checkElimination({
        ...guesserBoard,
        tiles: revealTile(guesserBoard.tiles, updated.drawnTileId),
      }),
    };
    updated = { ...updated, boards };
    return finalizeAfterTurn(updated);
  }
  return { ...updated, pendingPenalty: guesserId };
}

export function resolveAllUnplacedJokers(game: GameState): GameState {
  let boards = { ...game.boards };
  for (const [playerId, board] of Object.entries(boards)) {
    const joker = board.tiles.find((t) => t.value === 'joker' && !t.jokerPlaced);
    if (!joker) {
      continue;
    }
    const assignedValue = pickRandomJokerValue({ ...game, boards }, playerId);
    const newTiles = placeJokerTile(board.tiles, joker.id, assignedValue, 0);
    boards[playerId] = markJokerReady({ ...board, tiles: newTiles });
  }
  return { ...game, boards };
}

export function resolveDrawCooldown(game: GameState, now = Date.now()): GameState {
  if (game.drawCooldownEndsAt === null) {
    return game;
  }
  let updated: GameState = { ...game, drawCooldownEndsAt: null };

  if (updated.drawnTileId === null) {
    updated = resolveAllUnplacedJokers(updated);
    updated = beginTurn(updated, now, { skipDrawCooldown: true });
    if (isDrawCooldownActive(updated, now)) {
      return updated;
    }
    return startGuessDeadline(updated, now);
  }

  const currentId = game.turnOrder[game.currentTurnIndex];
  const board = updated.boards[currentId];
  if (!board) {
    return startGuessDeadline(updated, now);
  }
  const joker = board.tiles.find(
    (t) => t.id === updated.drawnTileId && t.value === 'joker' && !t.jokerPlaced,
  );
  if (joker) {
    const assignedValue = pickRandomJokerValue(updated, currentId);
    const newTiles = placeJokerTile(board.tiles, joker.id, assignedValue, 0);
    updated = {
      ...updated,
      boards: {
        ...updated.boards,
        [currentId]: markJokerReady({ ...board, tiles: newTiles }),
      },
    };
  }
  return startGuessDeadline(updated, now);
}

export function buildPlayerView(game: GameState, viewerId: string, now = Date.now()): Record<string, PlayerBoard> {
  const currentId = game.turnOrder[game.currentTurnIndex];
  const hideDrawnTile = isDrawCooldownActive(game, now) && game.drawnTileId !== null;
  const result: Record<string, PlayerBoard> = {};
  for (const [id, board] of Object.entries(game.boards)) {
    let tiles = board.tiles;
    if (hideDrawnTile && id === currentId && viewerId !== currentId) {
      tiles = board.tiles.filter((t) => t.id !== game.drawnTileId);
    }
    if (id === viewerId) {
      result[id] = { ...board, tiles };
    } else {
      result[id] = {
        ...board,
        tiles: tiles.map((t) =>
          t.revealed
            ? t
            : {
                ...t,
                value: 'joker' as const,
                jokerAssignedValue: undefined,
              },
        ),
      };
    }
  }
  return result;
}

export function enterPlayingPhase(game: GameState): GameState {
  return beginTurn({ ...game, phase: 'playing', canContinueTurn: false });
}
