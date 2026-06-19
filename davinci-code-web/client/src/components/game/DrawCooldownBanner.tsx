import { useEffect, useState } from 'react';

interface Props {
  endsAt: number;
  label?: string;
}

export default function DrawCooldownBanner({ endsAt, label = '드로우 확인 중…' }: Props) {
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
    <div className="text-center py-2 bg-amber-900/40 border-b border-amber-700/50">
      <p className="text-sm text-amber-200">
        {label}{' '}
        <span className="font-bold tabular-nums text-lg text-amber-100">{remainingSec}</span>초
      </p>
    </div>
  );
}
