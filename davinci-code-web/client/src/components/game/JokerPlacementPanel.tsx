import type { NumberValue } from '@davinci/shared';

const NUMBERS: NumberValue[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

interface Props {
  onPlace: (assignedValue: NumberValue) => void;
}

export default function JokerPlacementPanel({ onPlace }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 bg-surface-2 border-t border-slate-600 p-4 z-40 rounded-t-2xl">
      <h3 className="font-bold mb-3">조커 배치</h3>
      <p className="text-sm text-slate-400 mb-3">조커가 대표할 숫자를 선택하세요.</p>
      <div className="grid grid-cols-4 gap-2">
        {NUMBERS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPlace(n)}
            className="rounded-lg bg-slate-700 py-3 min-h-[44px] font-medium active:bg-primary active:text-surface"
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
