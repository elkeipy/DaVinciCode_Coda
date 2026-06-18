interface Props {
  currentNickname: string | null;
  isMyTurn: boolean;
}

export default function TurnIndicator({ currentNickname, isMyTurn }: Props) {
  if (!currentNickname) {
    return null;
  }
  return (
    <div className={`text-center py-2 text-sm ${isMyTurn ? 'text-primary font-bold' : 'text-slate-400'}`}>
      {isMyTurn ? '내 턴입니다' : `${currentNickname}의 턴`}
    </div>
  );
}
