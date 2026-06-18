import type { RoomSummary } from '@davinci/shared';

interface Props {
  room: RoomSummary;
  onJoin: () => void;
}

export default function RoomTile({ room, onJoin }: Props) {
  const full = room.playerCount >= room.maxPlayers;
  const playing = room.status !== 'waiting';

  return (
    <div className="rounded-xl bg-surface-2 border border-slate-600 p-4 flex flex-col gap-3">
      <div>
        <h3 className="font-semibold text-lg">{room.title}</h3>
        <p className="text-sm text-slate-400">
          {room.playerCount}/{room.maxPlayers} · {room.status === 'waiting' ? '대기' : '게임 중'}
        </p>
      </div>
      <div className="flex flex-wrap gap-1">
        {room.players.map((p) => (
          <span key={p.sessionId} className="text-xs bg-slate-700 rounded-full px-2 py-1">
            {p.nickname}
          </span>
        ))}
      </div>
      <button
        type="button"
        disabled={full || playing}
        onClick={onJoin}
        className="rounded-lg bg-primary text-surface py-2 min-h-[44px] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {full ? '만석' : playing ? '진행 중' : '들어가기'}
      </button>
    </div>
  );
}
