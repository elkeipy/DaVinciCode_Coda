import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSocket } from '../hooks/useSocket';
import { useAppStore } from '../stores/sessionStore';
import PortraitGameLayout from '../layouts/PortraitGameLayout';
import PlayerBoardView from '../components/game/PlayerBoard';
import TurnIndicator from '../components/game/TurnIndicator';
import GameLog from '../components/game/GameLog';
import ChatBox from '../components/common/ChatBox';
import JokerPlacementPanel from '../components/game/JokerPlacementPanel';
import GuessPanel from '../components/game/GuessPanel';

export default function GameRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const room = useAppStore((s) => s.room);
  const game = useAppStore((s) => s.game);
  const sessionId = useAppStore((s) => s.sessionId);
  const messages = useAppStore((s) => s.roomMessages);
  const [chatCollapsed, setChatCollapsed] = useState(true);
  const [guessTarget, setGuessTarget] = useState<{ sessionId: string; index: number } | null>(null);
  const [showGuess, setShowGuess] = useState(false);

  useEffect(() => {
    if (roomId && !room) {
      getSocket().emit('room:join', { roomId });
    }
  }, [roomId, room]);

  if (!room || room.room.roomId !== roomId) {
    return <div className="p-8 text-center text-slate-400">방 로딩 중...</div>;
  }

  const isHost = room.room.hostSessionId === sessionId;
  const canStart = isHost && room.room.status === 'waiting' && room.players.length >= 2;
  const gameState = game?.gameState;
  const boards = game?.playerView ?? {};
  const myBoard = sessionId ? boards[sessionId] : null;
  const currentTurnId = gameState ? gameState.turnOrder[gameState.currentTurnIndex] : null;
  const isMyTurn = currentTurnId === sessionId;
  const isPlaying = gameState?.phase === 'playing';
  const isJokerSetup = gameState?.phase === 'joker_setup';
  const isFinished = gameState?.phase === 'finished';
  const isSpectator = myBoard?.spectator ?? false;
  const needsJoker = isJokerSetup && myBoard && !myBoard.jokerReady && myBoard.tiles.some((t) => t.value === 'joker');

  const handleLeave = () => {
    getSocket().emit('room:leave');
    useAppStore.getState().reset();
    navigate('/lobby');
  };

  const handleTileSelect = (targetSessionId: string, index: number) => {
    if (!isMyTurn || isSpectator || targetSessionId === sessionId) {
      return;
    }
    setGuessTarget({ sessionId: targetSessionId, index });
    setShowGuess(true);
  };

  return (
    <PortraitGameLayout
      header={
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="font-bold text-lg">{room.room.title}</h1>
            <p className="text-xs text-slate-400">
              {room.players.map((p) => p.nickname).join(', ')}
            </p>
          </div>
          <button type="button" onClick={handleLeave} className="text-sm text-slate-400 min-h-[44px] px-2">
            나가기
          </button>
        </div>
      }
      boards={
        <>
          {gameState ? (
            <>
              <TurnIndicator
                currentNickname={currentTurnId ? boards[currentTurnId]?.nickname ?? null : null}
                isMyTurn={isMyTurn}
              />
              <GameLog actions={gameState.actionLog} />
              {Object.entries(boards).map(([id, board]) => (
                <PlayerBoardView
                  key={id}
                  board={board}
                  isOwn={id === sessionId}
                  isCurrentTurn={id === currentTurnId}
                  canSelect={isPlaying && isMyTurn && !isSpectator && id !== sessionId}
                  onTileSelect={(index) => handleTileSelect(id, index)}
                />
              ))}
            </>
          ) : (
            <p className="text-center text-slate-400 py-8">게임 시작을 기다리는 중...</p>
          )}
          {isFinished && gameState?.winnerNickname && (
            <div className="text-center py-4 rounded-xl bg-primary/20 border border-primary">
              <p className="text-xl font-bold text-primary">🎉 {gameState.winnerNickname} 승리!</p>
              {isHost && (
                <button
                  type="button"
                  onClick={() => getSocket().emit('game:reset')}
                  className="mt-3 rounded-lg bg-primary text-surface px-6 py-2 min-h-[44px] font-semibold"
                >
                  다시 시작
                </button>
              )}
            </div>
          )}
        </>
      }
      actions={
        !gameState ? (
          canStart ? (
            <button
              type="button"
              onClick={() => getSocket().emit('game:start')}
              className="w-full rounded-lg bg-primary text-surface py-3 min-h-[44px] font-bold"
            >
              게임 시작 ({room.players.length}인)
            </button>
          ) : (
            <p className="text-center text-sm text-slate-400 py-2">
              {room.players.length < 2 ? '2인 이상 필요' : '방장 시작 대기'}
            </p>
          )
        ) : isPlaying && isMyTurn && !isSpectator ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowGuess(true)}
              className="flex-1 rounded-lg bg-primary text-surface py-3 min-h-[44px] font-bold"
            >
              추리
            </button>
            <button
              type="button"
              onClick={() => getSocket().emit('game:pass')}
              className="flex-1 rounded-lg border border-slate-500 py-3 min-h-[44px]"
            >
              패스
            </button>
          </div>
        ) : null
      }
      chat={
        <ChatBox
          messages={messages}
          collapsed={chatCollapsed}
          onToggle={() => setChatCollapsed(!chatCollapsed)}
          onSend={(text) => getSocket().emit('chat:send', { scope: 'room', text, roomId })}
        />
      }
      overlay={
        <>
          {needsJoker && myBoard && (
            <JokerPlacementPanel
              tileCount={myBoard.tiles.length}
              onPlace={(assignedValue, position) => {
                getSocket().emit('game:placeJoker', { assignedValue, position });
              }}
            />
          )}
          {showGuess && (
            <GuessPanel
              onClose={() => {
                setShowGuess(false);
                setGuessTarget(null);
              }}
              onGuess={(claim) => {
                if (guessTarget) {
                  getSocket().emit('game:guess', {
                    targetSessionId: guessTarget.sessionId,
                    tileIndex: guessTarget.index,
                    claim,
                  });
                }
                setShowGuess(false);
                setGuessTarget(null);
              }}
            />
          )}
        </>
      }
    />
  );
}
