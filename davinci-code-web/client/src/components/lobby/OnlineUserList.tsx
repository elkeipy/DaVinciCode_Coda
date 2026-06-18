import type { OnlineUser } from '@davinci/shared';

interface Props {
  users: OnlineUser[];
}

export default function OnlineUserList({ users }: Props) {
  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-slate-400 mb-3 hidden md:block">접속자 ({users.length})</h2>
      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u.sessionId} className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
            <span className="font-medium">{u.nickname}</span>
            <span className="text-slate-500 truncate">
              {u.roomTitle ? u.roomTitle : '로비'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
