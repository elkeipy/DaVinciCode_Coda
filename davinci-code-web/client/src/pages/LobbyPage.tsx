import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RoomState } from '@davinci/shared';
import { getSocket } from '../hooks/useSocket';
import { useAppStore } from '../stores/sessionStore';
import ChatBox from '../components/common/ChatBox';
import RoomCreateModal from '../components/lobby/RoomCreateModal';
import RoomTile from '../components/lobby/RoomTile';
import OnlineUserList from '../components/lobby/OnlineUserList';

const CREATE_TIMEOUT_MS = 8000;

export default function LobbyPage() {
  const navigate = useNavigate();
  const lobby = useAppStore((s) => s.lobby);
  const room = useAppStore((s) => s.room);
  const nickname = useAppStore((s) => s.nickname);
  const messages = useAppStore((s) => s.lobbyMessages);
  const sessionId = useAppStore((s) => s.sessionId);
  const [showCreate, setShowCreate] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!sessionId || !room?.room.roomId) {
      return;
    }
    navigate(`/room/${room.room.roomId}`);
  }, [sessionId, room, navigate]);

  const handleJoin = (roomId: string) => {
    getSocket().emit('room:join', { roomId });
    navigate(`/room/${roomId}`);
  };

  const handleCreate = (title: string) => {
    const socket = getSocket();
    setCreating(true);
    useAppStore.getState().setError(null);

    const cleanup = () => {
      socket.off('room:state', onRoomState);
      socket.off('error', onError);
      clearTimeout(timeoutId);
      setCreating(false);
    };

    const onRoomState = (state: RoomState) => {
      if (state.room.hostSessionId !== useAppStore.getState().sessionId) {
        return;
      }
      cleanup();
      setShowCreate(false);
      navigate(`/room/${state.room.roomId}`);
    };

    const onError = ({ message }: { message: string }) => {
      cleanup();
      setShowCreate(false);
      useAppStore.getState().setError(message);
    };

    const timeoutId = setTimeout(() => {
      cleanup();
      setShowCreate(false);
      useAppStore.getState().setError('방 생성에 실패했습니다. 이미 다른 방에 있으면 나간 뒤 다시 시도하세요.');
    }, CREATE_TIMEOUT_MS);

    socket.on('room:state', onRoomState);
    socket.once('error', onError);
    socket.emit('room:create', { title });
  };

  return (
    <div className="flex flex-1 flex-col md:flex-row min-h-0">
      <section className="flex flex-1 flex-col min-h-0 md:w-[70%]">
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <h1 className="text-lg font-bold">로비</h1>
          <span className="text-sm text-slate-400">{nickname}</span>
        </header>
        <div className="p-4">
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            disabled={creating}
            className="w-full rounded-lg border border-dashed border-primary text-primary py-3 min-h-[44px] font-medium mb-4 disabled:opacity-50"
          >
            {creating ? '방 생성 중...' : '+ 방 만들기'}
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lobby?.rooms.map((entry) => (
              <RoomTile key={entry.roomId} room={entry} onJoin={() => handleJoin(entry.roomId)} />
            ))}
          </div>
        </div>
        <div className="mt-auto">
          <ChatBox
            messages={messages}
            onSend={(text) => getSocket().emit('chat:send', { scope: 'lobby', text })}
          />
        </div>
      </section>
      <aside className="md:w-[30%] border-t md:border-t-0 md:border-l border-slate-700">
        <button
          type="button"
          className="md:hidden w-full px-4 py-3 text-left text-sm text-slate-400 min-h-[44px]"
          onClick={() => setUsersOpen(!usersOpen)}
        >
          접속자 ({lobby?.onlineUsers.length ?? 0}) {usersOpen ? '▲' : '▼'}
        </button>
        <div className={`${usersOpen ? 'block' : 'hidden'} md:block`}>
          <OnlineUserList users={lobby?.onlineUsers ?? []} />
        </div>
      </aside>
      {showCreate && (
        <RoomCreateModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
