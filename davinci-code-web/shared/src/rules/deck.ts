import type { NumberValue, Tile, TileColor, TileValue } from '../types.js';

const NUMBER_VALUES: NumberValue[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const COLORS: TileColor[] = ['white', 'black'];

let tileIdCounter = 0;

function nextTileId(): string {
  tileIdCounter += 1;
  return `tile-${tileIdCounter}`;
}

export function resetTileIdCounter(): void {
  tileIdCounter = 0;
}

export function createFullDeck(): Tile[] {
  const tiles: Tile[] = [];
  for (const value of NUMBER_VALUES) {
    for (const color of COLORS) {
      tiles.push({
        id: nextTileId(),
        value,
        color,
        revealed: false,
        position: 0,
      });
    }
  }
  for (const color of COLORS) {
    tiles.push({
      id: nextTileId(),
      value: 'joker',
      color,
      revealed: false,
      position: 0,
      jokerPlaced: false,
    });
  }
  return tiles;
}

/** 전체 덱: 숫자 0~11 × 흰/검 24장 + 조커 흰/검 2장 = 26장 */
export const FULL_DECK_SIZE = 26;

export function sortDrawPileForDisplay(tiles: Tile[]): Tile[] {
  const rank = (tile: Tile): number => {
    if (tile.value === 'joker') {
      return 100 + (tile.color === 'black' ? 0 : 1);
    }
    return tile.value * 2 + (tile.color === 'black' ? 0 : 1);
  };
  return [...tiles].sort((a, b) => rank(a) - rank(b));
}

export function shuffleDeck<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getDealCount(playerCount: number): number {
  if (playerCount < 2 || playerCount > 4) {
    throw new Error('Player count must be between 2 and 4');
  }
  return playerCount === 4 ? 3 : 4;
}

export function dealTiles(playerCount: number): { hands: Tile[][]; drawPile: Tile[] } {
  const deck = shuffleDeck(createFullDeck());
  const count = getDealCount(playerCount);
  const hands: Tile[][] = Array.from({ length: playerCount }, () => []);
  const dealt = count * playerCount;
  for (let i = 0; i < dealt; i += 1) {
    hands[i % playerCount].push(deck[i]);
  }
  return { hands, drawPile: deck.slice(dealt) };
}

export function drawFromPile(pile: Tile[]): { tile: Tile; remaining: Tile[] } {
  if (pile.length === 0) {
    throw new Error('Draw pile is empty');
  }
  const index = Math.floor(Math.random() * pile.length);
  const tile = pile[index];
  const remaining = [...pile.slice(0, index), ...pile.slice(index + 1)];
  return { tile, remaining };
}

export function tileMatchesClaim(tile: Tile, claim: { type: 'number'; value: NumberValue } | { type: 'joker' }): boolean {
  if (claim.type === 'joker') {
    return tile.value === 'joker';
  }
  return tile.value === claim.value;
}

export function getTileDisplayValue(tile: Tile): TileValue | NumberValue {
  if (tile.value === 'joker' && tile.jokerAssignedValue !== undefined) {
    return tile.jokerAssignedValue;
  }
  return tile.value;
}
