import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../hooks/useSocket';
import { useAppStore } from '../stores/sessionStore';

const JOIN_TIMEOUT_MS = import.meta.env.PROD ? 90_000 : 8_000;
const isLocalDev = import.meta.env.DEV;

export default function EntryPage() {
  const [nickname, setNickname] = useState(localStorage.getItem('davinci_nickname') ?? '');
  const [loading, setLoading] = useState(false);
  const connected = useAppStore((s) => s.connected);
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (trimmed.length < 2) {
      useAppStore.getState().setError('닉네임은 2자 이상이어야 합니다.');
      return;
    }
    setLoading(true);
    useAppStore.getState().setError(null);
    const socket = getSocket();
    let timeoutId: ReturnType<typeof setTimeout>;

    const cleanup = () => {
      socket.off('session:assigned', onAssigned);
      socket.off('connect_error', onConnectError);
      socket.off('error', onServerError);
      socket.off('connect', onConnect);
      clearTimeout(timeoutId);
    };

    const fail = (message: string) => {
      cleanup();
      setLoading(false);
      useAppStore.getState().setError(message);
    };

    const onAssigned = () => {
      cleanup();
      setLoading(false);
      navigate('/lobby');
    };

    const onConnectError = () => {
      fail(
        isLocalDev
          ? '서버에 연결할 수 없습니다. `davinci-code-web`에서 `npm run dev`로 서버·클라이언트를 함께 실행하세요.'
          : '서버에 연결할 수 없습니다. 무료 서버가 슬립 중이면 1분 정도 후 다시 시도하세요.',
      );
    };

    const onServerError = ({ message }: { message: string }) => {
      fail(message);
    };

    const submitJoin = () => {
      socket.emit('lobby:join', { nickname: trimmed });
    };

    const onConnect = () => {
      submitJoin();
    };

    timeoutId = setTimeout(() => {
      fail(
        isLocalDev
          ? '서버 응답이 없습니다. 서버(포트 3001)가 실행 중인지 확인하세요.'
          : '서버 응답이 없습니다. 슬립 해제 중일 수 있으니 잠시 후 다시 시도하세요.',
      );
    }, JOIN_TIMEOUT_MS);

    socket.on('session:assigned', onAssigned);
    socket.on('connect_error', onConnectError);
    socket.on('error', onServerError);

    if (socket.connected) {
      submitJoin();
    } else {
      socket.once('connect', onConnect);
      socket.connect();
    }
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-bold text-primary mb-2">Da Vinci Code</h1>
      <p className="text-slate-400 mb-8 text-center">다빈치코드 웹 보드게임</p>
      <p
        className={`mb-4 text-sm ${connected ? 'text-emerald-400' : 'text-amber-400'}`}
        role="status"
      >
        {connected
          ? '서버 연결됨'
          : isLocalDev
            ? '서버 연결 중… (연결 안 되면 npm run dev 확인)'
            : '서버 연결 중… (최대 1분 소요될 수 있음)'}
      </p>
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
          className="w-full rounded-lg bg-primary text-surface font-semibold py-3 min-h-[44px] active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? '입장 중...' : '로비 입장'}
        </button>
      </form>
    </main>
  );
}
