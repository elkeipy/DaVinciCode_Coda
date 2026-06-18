import type { PlayerBoard } from '@davinci/shared';
import Tile from './Tile';

interface Props {
  board: PlayerBoard;
  isOwn: boolean;
  isCurrentTurn: boolean;
  selectedIndex?: number | null;
  onTileSelect?: (index: number) => void;
  canSelect?: boolean;
}

export default function PlayerBoardView({
  board,
  isOwn,
  isCurrentTurn,
  selectedIndex,
  onTileSelect,
  canSelect,
}: Props) {
  return (
    <div className={`rounded-xl p-3 ${isCurrentTurn ? 'ring-2 ring-primary' : 'bg-surface-2'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold">{board.nickname}</span>
        {board.spectator && <span className="text-xs text-amber-400">관전</span>}
        {isCurrentTurn && <span className="text-xs text-primary">턴</span>}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {board.tiles.map((tile, index) => (
          <Tile
            key={tile.id}
            tile={tile}
            isOwn={isOwn}
            selected={selectedIndex === index}
            disabled={!canSelect || tile.revealed}
            onSelect={
              canSelect && !tile.revealed && onTileSelect ? () => onTileSelect(index) : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
