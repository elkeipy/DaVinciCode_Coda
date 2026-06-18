import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../hooks/useSocket';
import { useAppStore } from '../stores/sessionStore';

export default function EntryPage() {
  const [nickname, setNickname] = useState(localStorage.getItem('davinci_nickname') ?? '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (trimmed.length < 2) {
      useAppStore.getState().setError('닉네임은 2자 이상이어야 합니다.');
      return;
    }
    setLoading(true);
    const socket = getSocket();
    const onAssigned = () => {
      socket.off('session:assigned', onAssigned);
      setLoading(false);
      navigate('/lobby');
    };
    socket.on('session:assigned', onAssigned);
    socket.emit('lobby:join', { nickname: trimmed });
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-bold text-primary mb-2">Da Vinci Code</h1>
      <p className="text-slate-400 mb-8 text-center">다빈치코드 웹 보드게임</p>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <label className="block">
          <span className="text-sm text-slate-300 mb-1 block">닉네임</span>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={12}
            placeholder="닉네임 입력"
            className="w-full rounded-lg bg-surface-2 border border-slate-600 px-4 py-3 min-h-[44px] text-lg"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary text-surface font-semibold py-3 min-h-[44px] active:scale-[0.98]"
        >
          {loading ? '입장 중...' : '로비 입장'}
        </button>
      </form>
    </main>
  );
}
