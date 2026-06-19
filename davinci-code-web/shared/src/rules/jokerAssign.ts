import type { GameState, NumberValue, Tile } from '../types.js';

const ALL_NUMBERS: NumberValue[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function tileNumber(tile: Tile): NumberValue | null {
  if (tile.value === 'joker') {
    return tile.jokerPlaced && tile.jokerAssignedValue !== undefined
      ? tile.jokerAssignedValue
      : null;
  }
  return tile.value;
}

/** 내 타일·공개 타일에 없는 숫자 중 랜덤 선택 */
export function pickRandomJokerValue(game: GameState, playerId: string): NumberValue {
  const taken = new Set<NumberValue>();
  for (const [boardId, board] of Object.entries(game.boards)) {
    for (const tile of board.tiles) {
      if (boardId === playerId || tile.revealed) {
        const num = tileNumber(tile);
        if (num !== null) {
          taken.add(num);
        }
      }
    }
  }
  const available = ALL_NUMBERS.filter((n) => !taken.has(n));
  const pool = available.length > 0 ? available : ALL_NUMBERS;
  return pool[Math.floor(Math.random() * pool.length)];
}
