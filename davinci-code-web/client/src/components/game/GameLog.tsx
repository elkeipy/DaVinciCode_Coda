import type { GameAction } from '@davinci/shared';

interface Props {
  actions: GameAction[];
}

export default function GameLog({ actions }: Props) {
  if (actions.length === 0) {
    return null;
  }
  const latestActions = actions.slice(-5).reverse();
  const getActionColorClass = (text: string): string => {
    if (text.includes('✓')) {
      return 'text-emerald-400';
    }
    if (text.includes('✗')) {
      return 'text-rose-400';
    }
    return 'text-slate-400';
  };
  return (
    <div className="text-xs space-y-1 max-h-20 overflow-y-auto px-2">
      {latestActions.map((a) => (
        <p key={a.id} className={getActionColorClass(a.text)}>
          {a.text}
        </p>
      ))}
    </div>
  );
}
