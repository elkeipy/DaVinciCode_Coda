import type { Tile } from '@davinci/shared';
import { sortDrawPileForDisplay } from '@davinci/shared';

interface Props {
  tiles: Tile[];
}

function pileBackClass(tile: Tile): string {
  return tile.color === 'black'
    ? 'bg-slate-800 border-slate-500'
    : 'bg-slate-200 border-slate-400';
}

export default function DrawPileView({ tiles }: Props) {
  const sorted = sortDrawPileForDisplay(tiles);

  return (
    <section className="rounded-xl bg-surface-2 p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-sm">남은 더미</h2>
        <span className="text-xs text-slate-400">{tiles.length}장</span>
      </div>
      {sorted.length === 0 ? (
        <p className="text-sm text-slate-500">더미가 비었습니다.</p>
      ) : (
        <div className="flex gap-0.5 overflow-x-auto py-0.5">
          {sorted.map((tile) => (
            <div
              key={tile.id}
              className={`
                min-w-[22px] h-7 rounded border shrink-0 p-0.5
                ${pileBackClass(tile)}
              `}
              aria-hidden
            >
              <div
                className={`
                  w-full h-full rounded-sm border
                  ${tile.color === 'black' ? 'border-slate-600 bg-slate-900/50' : 'border-slate-300 bg-white/40'}
                `}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
