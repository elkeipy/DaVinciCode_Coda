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

export function dealTiles(playerCount: number): Tile[][] {
  const deck = shuffleDeck(createFullDeck());
  const count = getDealCount(playerCount);
  const hands: Tile[][] = Array.from({ length: playerCount }, () => []);
  for (let i = 0; i < count * playerCount; i += 1) {
    hands[i % playerCount].push(deck[i]);
  }
  return hands;
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
