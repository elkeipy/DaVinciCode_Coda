import { Routes, Route, Navigate } from 'react-router-dom';
import { useSocket } from './hooks/useSocket';
import EntryPage from './pages/EntryPage';
import LobbyPage from './pages/LobbyPage';
import GameRoomPage from './pages/GameRoomPage';
import { useAppStore } from './stores/sessionStore';

export default function App() {
  useSocket();
  const sessionId = useAppStore((s) => s.sessionId);
  const error = useAppStore((s) => s.error);

  return (
    <div className="min-h-dvh flex flex-col">
      {error && (
        <div className="bg-red-900/80 text-red-100 px-4 py-2 text-sm text-center" role="alert">
          {error}
          <button type="button" className="ml-2 underline" onClick={() => useAppStore.getState().setError(null)}>
            닫기
          </button>
        </div>
      )}
      <Routes>
        <Route path="/" element={sessionId ? <Navigate to="/lobby" replace /> : <EntryPage />} />
        <Route path="/lobby" element={sessionId ? <LobbyPage /> : <Navigate to="/" replace />} />
        <Route path="/room/:roomId" element={sessionId ? <GameRoomPage /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
