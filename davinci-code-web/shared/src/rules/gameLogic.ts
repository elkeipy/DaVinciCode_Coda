import type { GameAction, GameState, GuessClaim, NumberValue, PlayerBoard, Tile } from '../types.js';
import { tileMatchesClaim } from './deck.js';
import { allJokersPlaced } from './sort.js';

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
  return { ...game, currentTurnIndex: nextIndex };
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
  } else {
    const penalty = pickRandomHiddenTile(guesserBoard.tiles);
    if (penalty) {
      boards[guesserId] = checkElimination({
        ...guesserBoard,
        tiles: revealTile(guesserBoard.tiles, penalty.id),
      });
    }
    logText = `${guesserBoard.nickname} → ${targetBoard.nickname} [${tileIndex + 1}] = ${claimLabel} ✗`;
  }
  const action: GameAction = {
    id: `action-${Date.now()}`,
    timestamp: Date.now(),
    text: logText,
  };
  let updated: GameState = {
    ...game,
    boards,
    actionLog: [...game.actionLog, action],
  };
  updated = advanceTurn(updated);
  const winner = getWinner(updated);
  if (winner) {
    updated = {
      ...updated,
      phase: 'finished',
      winnerId: winner.winnerId,
      winnerNickname: winner.winnerNickname,
    };
  }
  return { game: updated, log: logText };
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

export function filterBoardForViewer(board: PlayerBoard, viewerId: string): PlayerBoard {
  if (board.sessionId === viewerId) {
    return board;
  }
  return {
    ...board,
    tiles: board.tiles.map((t) =>
      t.revealed
        ? t
        : { ...t, value: 'joker' as const, jokerAssignedValue: undefined, color: t.color },
    ),
  };
}

export function buildPlayerView(game: GameState, viewerId: string): Record<string, PlayerBoard> {
  const result: Record<string, PlayerBoard> = {};
  for (const [id, board] of Object.entries(game.boards)) {
    if (id === viewerId) {
      result[id] = board;
    } else {
      result[id] = {
        ...board,
        tiles: board.tiles.map((t) =>
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
