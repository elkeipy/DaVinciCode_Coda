import type { NumberValue, Tile } from '../types.js';

function sortRank(tile: Tile): number {
  if (tile.value === 'joker') {
    const assigned = tile.jokerAssignedValue ?? 12;
    return assigned * 2 + (tile.color === 'black' ? 0 : 1);
  }
  return tile.value * 2 + (tile.color === 'black' ? 0 : 1);
}

export function sortTiles(tiles: Tile[]): Tile[] {
  const jokers = tiles.filter((t) => t.value === 'joker' && !t.jokerPlaced);
  const sortable = tiles.filter((t) => t.value !== 'joker' || t.jokerPlaced);
  const sorted = [...sortable].sort((a, b) => sortRank(a) - sortRank(b));
  return [...sorted, ...jokers].map((tile, index) => ({ ...tile, position: index }));
}

export function placeJokerTile(
  tiles: Tile[],
  jokerId: string,
  assignedValue: NumberValue,
  position: number,
): Tile[] {
  const joker = tiles.find((t) => t.id === jokerId && t.value === 'joker');
  if (!joker) {
    throw new Error('Joker tile not found');
  }
  const others = tiles.filter((t) => t.id !== jokerId);
  const placedJoker: Tile = {
    ...joker,
    jokerAssignedValue: assignedValue,
    jokerPlaced: true,
  };
  const clamped = Math.max(0, Math.min(position, others.length));
  const result = [...others];
  result.splice(clamped, 0, placedJoker);
  return sortTiles(result);
}

export function allJokersPlaced(tiles: Tile[]): boolean {
  return tiles.filter((t) => t.value === 'joker').every((t) => t.jokerPlaced === true);
}

export function hasUnplacedJoker(tiles: Tile[]): boolean {
  return tiles.some((t) => t.value === 'joker' && !t.jokerPlaced);
}
