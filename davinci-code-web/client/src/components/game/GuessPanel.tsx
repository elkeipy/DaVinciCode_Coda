import type { NumberValue } from '@davinci/shared';

const NUMBERS: NumberValue[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

interface Props {
  onGuess: (claim: { type: 'number'; value: NumberValue } | { type: 'joker' }) => void;
  onClose: () => void;
}

export default function GuessPanel({ onGuess, onClose }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 bg-surface-2 border-t border-slate-600 p-4 z-40 rounded-t-2xl max-h-[60dvh] overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold">추리 선언</h3>
        <button type="button" onClick={onClose} className="text-slate-400 min-h-[44px] px-2">
          닫기
        </button>
      </div>
      <button
        type="button"
        onClick={() => onGuess({ type: 'joker' })}
        className="w-full mb-3 rounded-lg bg-amber-600 py-3 min-h-[44px] font-semibold"
      >
        조커다
      </button>
      <div className="grid grid-cols-4 gap-2">
        {NUMBERS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onGuess({ type: 'number', value: n })}
            className="rounded-lg bg-slate-700 py-3 min-h-[44px] font-medium active:bg-primary active:text-surface"
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
