import type { GameAction } from '@davinci/shared';

interface Props {
  actions: GameAction[];
}

export default function GameLog({ actions }: Props) {
  if (actions.length === 0) {
    return null;
  }
  return (
    <div className="text-xs text-slate-400 space-y-1 max-h-20 overflow-y-auto px-2">
      {actions.slice(-5).map((a) => (
        <p key={a.id}>{a.text}</p>
      ))}
    </div>
  );
}
