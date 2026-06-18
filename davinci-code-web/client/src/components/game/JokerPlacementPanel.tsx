import type { NumberValue } from '@davinci/shared';

const NUMBERS: NumberValue[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

interface Props {
  onPlace: (assignedValue: NumberValue, position: number) => void;
  tileCount: number;
}

export default function JokerPlacementPanel({ onPlace, tileCount }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 bg-surface-2 border-t border-slate-600 p-4 z-40 rounded-t-2xl">
      <h3 className="font-bold mb-3">조커 배치</h3>
      <p className="text-sm text-slate-400 mb-3">대표 숫자와 위치를 선택하세요.</p>
      <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
        {NUMBERS.map((n) =>
          Array.from({ length: tileCount + 1 }, (_, pos) => (
            <button
              key={`${n}-${pos}`}
              type="button"
              onClick={() => onPlace(n, pos)}
              className="rounded-lg bg-slate-700 py-2 min-h-[44px] text-sm active:bg-primary active:text-surface"
            >
              {n} @ {pos}
            </button>
          )),
        )}
      </div>
    </div>
  );
}
