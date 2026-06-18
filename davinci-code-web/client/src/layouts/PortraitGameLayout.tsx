import { ReactNode } from 'react';

interface Props {
  header: ReactNode;
  boards: ReactNode;
  actions?: ReactNode;
  chat: ReactNode;
  overlay?: ReactNode;
}

export default function PortraitGameLayout({ header, boards, actions, chat, overlay }: Props) {
  return (
    <div className="flex flex-1 flex-col min-h-0 relative">
      <header className="shrink-0 border-b border-slate-700 px-4 py-3">{header}</header>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">{boards}</div>
      {actions && <div className="shrink-0 border-t border-slate-700 p-2">{actions}</div>}
      <div className="shrink-0">{chat}</div>
      {overlay}
    </div>
  );
}
