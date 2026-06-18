import { FormEvent, useState } from 'react';

interface Props {
  onClose: () => void;
  onCreate: (title: string) => void;
}

export default function RoomCreateModal({ onClose, onCreate }: Props) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onCreate(title.trim() || 'ROOM 1');
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-surface-2 rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">방 만들기</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ROOM 1"
            className="w-full rounded-lg bg-surface border border-slate-600 px-4 py-3 min-h-[44px]"
          />
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg border border-slate-600 min-h-[44px]">
              취소
            </button>
            <button type="submit" className="flex-1 py-3 rounded-lg bg-primary text-surface font-semibold min-h-[44px]">
              생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
