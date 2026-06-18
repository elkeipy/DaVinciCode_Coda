import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../hooks/useSocket';
import { useAppStore } from '../stores/sessionStore';
import ChatBox from '../components/common/ChatBox';
import RoomCreateModal from '../components/lobby/RoomCreateModal';
import RoomTile from '../components/lobby/RoomTile';
import OnlineUserList from '../components/lobby/OnlineUserList';

export default function LobbyPage() {
  const navigate = useNavigate();
  const lobby = useAppStore((s) => s.lobby);
  const nickname = useAppStore((s) => s.nickname);
  const messages = useAppStore((s) => s.lobbyMessages);
  const sessionId = useAppStore((s) => s.sessionId);
  const [showCreate, setShowCreate] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [pendingCreate, setPendingCreate] = useState(false);

  useEffect(() => {
    if (!pendingCreate || !sessionId || !lobby) {
      return;
    }
    const myRoom = lobby.rooms.find((r) => r.hostSessionId === sessionId);
    if (myRoom) {
      setPendingCreate(false);
      navigate(`/room/${myRoom.roomId}`);
    }
  }, [pendingCreate, sessionId, lobby, navigate]);

  const handleJoin = (roomId: string) => {
    getSocket().emit('room:join', { roomId });
    navigate(`/room/${roomId}`);
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
            className="w-full rounded-lg border border-dashed border-primary text-primary py-3 min-h-[44px] font-medium mb-4"
          >
            + 방 만들기
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lobby?.rooms.map((room) => (
              <RoomTile key={room.roomId} room={room} onJoin={() => handleJoin(room.roomId)} />
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
          onCreate={(title) => {
            getSocket().emit('room:create', { title });
            setShowCreate(false);
            setPendingCreate(true);
          }}
        />
      )}
    </div>
  );
}
