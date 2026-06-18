import type { ChatMessage } from '@davinci/shared';

interface ChatBoxProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  placeholder?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function ChatBox({ messages, onSend, placeholder = '메시지 입력', collapsed, onToggle }: ChatBoxProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('text') as HTMLInputElement;
    const text = input.value.trim();
    if (!text) {
      return;
    }
    onSend(text);
    input.value = '';
  };

  return (
    <div className="flex flex-col border-t border-slate-700 bg-surface-2">
      {onToggle && (
        <button type="button" onClick={onToggle} className="px-4 py-2 text-sm text-slate-400 text-left min-h-[44px]">
          채팅 {collapsed ? '펼치기' : '접기'} ({messages.length})
        </button>
      )}
      {!collapsed && (
        <>
          <div className="h-32 overflow-y-auto px-3 py-2 space-y-1 text-sm">
            {messages.map((m) => (
              <div key={m.id}>
                <span className="text-primary font-medium">{m.senderNickname}</span>
                <span className="text-slate-500 text-xs ml-2">
                  {new Date(m.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <p className="text-slate-200">{m.text}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 p-2">
            <input
              name="text"
              className="flex-1 rounded-lg bg-surface border border-slate-600 px-3 py-2 min-h-[44px]"
              placeholder={placeholder}
            />
            <button type="submit" className="rounded-lg bg-primary text-surface px-4 min-h-[44px] font-medium">
              전송
            </button>
          </form>
        </>
      )}
    </div>
  );
}
