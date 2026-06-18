import type { PlayerBoard, Tile as TileType } from '@davinci/shared';

interface Props {
  tile: TileType;
  isOwn: boolean;
  selected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
}

export default function Tile({ tile, isOwn, selected, onSelect, disabled }: Props) {
  const hidden = !isOwn && !tile.revealed;
  const label = hidden
    ? '?'
    : tile.value === 'joker'
      ? tile.jokerAssignedValue !== undefined
        ? `J(${tile.jokerAssignedValue})`
        : '-'
      : String(tile.value);

  const colorClass = tile.color === 'black' ? 'bg-slate-900 text-white border-slate-500' : 'bg-white text-slate-900 border-slate-300';

  return (
    <button
      type="button"
      disabled={disabled || (hidden ? false : !onSelect)}
      onClick={onSelect}
      className={`
        min-w-[44px] h-14 rounded-lg border-2 font-bold text-sm shrink-0
        ${hidden ? 'bg-slate-700 border-slate-500 text-slate-300' : colorClass}
        ${selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface' : ''}
        ${onSelect && hidden ? 'active:scale-95' : ''}
      `}
    >
      {label}
    </button>
  );
}
