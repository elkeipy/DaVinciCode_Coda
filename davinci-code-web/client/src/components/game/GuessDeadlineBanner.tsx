import { useEffect, useState } from 'react';

interface Props {
  endsAt: number;
}

export default function GuessDeadlineBanner({ endsAt }: Props) {
  const [remainingSec, setRemainingSec] = useState(() =>
    Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)),
  );

  useEffect(() => {
    const tick = () => {
      setRemainingSec(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [endsAt]);

  if (remainingSec <= 0) {
    return null;
  }

  return (
    <div className="text-center py-2 bg-sky-900/40 border-b border-sky-700/50">
      <p className="text-sm text-sky-200">
        추리 남은 시간{' '}
        <span className="font-bold tabular-nums text-lg text-sky-100">{remainingSec}</span>초
      </p>
    </div>
  );
}
