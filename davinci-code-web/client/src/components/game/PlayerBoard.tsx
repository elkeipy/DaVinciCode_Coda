import type { PlayerBoard } from '@davinci/shared';
import Tile from './Tile';

interface Props {
  board: PlayerBoard;
  isOwn: boolean;
  isCurrentTurn: boolean;
  selectedIndex?: number | null;
  drawnTileId?: string | null;
  onTileSelect?: (index: number) => void;
  canSelect?: boolean;
}

export default function PlayerBoardView({
  board,
  isOwn,
  isCurrentTurn,
  selectedIndex,
  drawnTileId,
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
      <div className="flex gap-1 overflow-x-auto py-1">
        {board.tiles.map((tile, index) => (
          <div key={tile.id} className="shrink-0 p-1">
            <Tile
              tile={tile}
              isOwn={isOwn}
              selected={selectedIndex === index}
              isDrawnThisTurn={drawnTileId === tile.id}
              disabled={!canSelect || tile.revealed}
              onSelect={
                canSelect && !tile.revealed && onTileSelect ? () => onTileSelect(index) : undefined
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
