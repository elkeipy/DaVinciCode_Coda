import type { PlayerBoard, Tile as TileType } from '@davinci/shared';

interface Props {
  tile: TileType;
  isOwn: boolean;
  selected?: boolean;
  isDrawnThisTurn?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
}

export default function Tile({ tile, isOwn, selected, isDrawnThisTurn, onSelect, disabled }: Props) {
  const hidden = !isOwn && !tile.revealed;
  const isPublicRevealed = isOwn && tile.revealed;
  const label = hidden
    ? '?'
    : tile.value === 'joker'
      ? tile.jokerAssignedValue !== undefined
        ? `J(${tile.jokerAssignedValue})`
        : '-'
      : String(tile.value);

  const colorClass =
    tile.color === 'black'
      ? 'bg-slate-900 text-white border-slate-600'
      : 'bg-white text-slate-900 border-slate-300';
  const hiddenColorClass =
    tile.color === 'black'
      ? 'bg-slate-900 text-slate-400 border-slate-600'
      : 'bg-white text-slate-500 border-slate-300';

  const highlightClass = selected
    ? 'border-primary ring-2 ring-primary'
    : isDrawnThisTurn
      ? 'border-violet-400 ring-2 ring-violet-400'
      : isPublicRevealed
        ? 'border-orange-600 ring-2 ring-orange-600'
        : '';

  return (
    <button
      type="button"
      disabled={disabled || (hidden ? false : !onSelect)}
      onClick={onSelect}
      className={`
        min-w-[44px] h-14 rounded-lg border-2 font-bold text-sm shrink-0
        ${hidden ? hiddenColorClass : colorClass}
        ${highlightClass}
        ${onSelect && hidden ? 'active:scale-95' : ''}
      `}
    >
      {label}
    </button>
  );
}
