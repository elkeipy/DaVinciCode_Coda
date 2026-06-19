import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSocket } from '../hooks/useSocket';
import { useAppStore } from '../stores/sessionStore';
import PortraitGameLayout from '../layouts/PortraitGameLayout';
import PlayerBoardView from '../components/game/PlayerBoard';
import TurnIndicator from '../components/game/TurnIndicator';
import GameLog from '../components/game/GameLog';
import ChatBox from '../components/common/ChatBox';
import { hasUnplacedJoker } from '@davinci/shared';
import GuessPanel from '../components/game/GuessPanel';
import JokerPlacementPanel from '../components/game/JokerPlacementPanel';
import DrawCooldownBanner from '../components/game/DrawCooldownBanner';
import GuessDeadlineBanner from '../components/game/GuessDeadlineBanner';
import DrawPileView from '../components/game/DrawPileView';

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
  const [cooldownTick, setCooldownTick] = useState(0);

  const drawCooldownEndsAt = game?.gameState?.drawCooldownEndsAt ?? null;
  const guessDeadlineEndsAt = game?.gameState?.guessDeadlineEndsAt ?? null;
  const isDrawCooldown = Boolean(
    drawCooldownEndsAt && cooldownTick >= 0 && drawCooldownEndsAt > Date.now(),
  );
  const isGuessDeadline = Boolean(
    guessDeadlineEndsAt && cooldownTick >= 0 && guessDeadlineEndsAt > Date.now() && !isDrawCooldown,
  );

  useEffect(() => {
    if (!drawCooldownEndsAt && !guessDeadlineEndsAt) {
      return;
    }
    const tick = () => setCooldownTick(Date.now());
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [drawCooldownEndsAt, guessDeadlineEndsAt]);

  useEffect(() => {
    if (!roomId) {
      return;
    }
    const socket = getSocket();
    const currentRoom = useAppStore.getState().room;
    if (currentRoom?.room.roomId === roomId) {
      return;
    }
    socket.emit('room:join', { roomId });
  }, [roomId]);

  const gameStateForEffect = game?.gameState;
  const currentTurnIdForEffect = gameStateForEffect
    ? gameStateForEffect.turnOrder[gameStateForEffect.currentTurnIndex]
    : null;
  const isMyTurnForEffect = currentTurnIdForEffect === sessionId;
  const pendingPenaltyForEffect = gameStateForEffect?.pendingPenalty === sessionId;

  useEffect(() => {
    if (!isMyTurnForEffect || pendingPenaltyForEffect) {
      setGuessTarget(null);
      setShowGuess(false);
    }
  }, [isMyTurnForEffect, pendingPenaltyForEffect, currentTurnIdForEffect]);

  useEffect(() => {
    if (!game?.gameState) {
      setGuessTarget(null);
      setShowGuess(false);
    }
  }, [game?.gameState]);

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
  const isFinished = gameState?.phase === 'finished';
  const isSpectator = myBoard?.spectator ?? false;
  const pendingPenalty = gameState?.pendingPenalty === sessionId;
  const drawnTileId = gameState?.drawnTileId;
  const hasUnplacedJokerOnBoard = Boolean(myBoard && hasUnplacedJoker(myBoard.tiles));
  const isInitialDealJoker = Boolean(isPlaying && isDrawCooldown && !drawnTileId);
  const isTurnDrawJoker = Boolean(
    isPlaying && isDrawCooldown && drawnTileId && isMyTurn && !pendingPenalty,
  );
  const needsJoker = Boolean(
    myBoard &&
    hasUnplacedJokerOnBoard &&
    isDrawCooldown &&
    (isInitialDealJoker || isTurnDrawJoker),
  );
  const canContinueTurn = Boolean(isMyTurn && gameState?.canContinueTurn);
  const mustGuess = Boolean(
    isMyTurn && isPlaying && !pendingPenalty && !canContinueTurn && !needsJoker && !isDrawCooldown,
  );

  const handleLeave = () => {
    getSocket().emit('room:leave');
    useAppStore.getState().reset();
    navigate('/lobby');
  };

  const handleTileSelect = (targetSessionId: string, index: number) => {
    if (pendingPenalty && targetSessionId === sessionId) {
      const tile = myBoard?.tiles[index];
      if (tile && !tile.revealed) {
        getSocket().emit('game:penalty', { tileId: tile.id });
      }
      return;
    }
    if (!isMyTurn || isSpectator || targetSessionId === sessionId) {
      return;
    }
    setGuessTarget({ sessionId: targetSessionId, index });
    setShowGuess(false);
  };

  return (
    <PortraitGameLayout
      header={
        <>
              {isDrawCooldown && drawCooldownEndsAt && (
                <DrawCooldownBanner endsAt={drawCooldownEndsAt} />
              )}
          {isGuessDeadline && guessDeadlineEndsAt && (
            <GuessDeadlineBanner endsAt={guessDeadlineEndsAt} />
          )}
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
        </>
      }
      boards={
        <>
          {gameState ? (
            <>
              <TurnIndicator
                currentNickname={currentTurnId ? boards[currentTurnId]?.nickname ?? null : null}
                isMyTurn={isMyTurn}
              />
              {drawnTileId && isMyTurn && !canContinueTurn && !needsJoker && !isDrawCooldown && (
                <p className="text-sm text-amber-400 px-2">이번 턴 드로우 타일이 보드에 추가되었습니다.</p>
              )}
              {needsJoker && isInitialDealJoker && (
                <p className="text-sm text-amber-400 px-2">조커 숫자를 선택하세요.</p>
              )}
              {needsJoker && isTurnDrawJoker && (
                <p className="text-sm text-amber-400 px-2">드로우한 조커의 숫자를 선택하세요.</p>
              )}
              {mustGuess && (
                <p className="text-sm text-slate-300 px-2">추리가 필요합니다. 상대 타일을 선택하세요.</p>
              )}
              {canContinueTurn && (
                <p className="text-sm text-emerald-400 px-2">추리 성공! 추가 추리 또는 패스하세요.</p>
              )}
              {pendingPenalty && (
                <p className="text-sm text-red-400 px-2">패널티: 공개할 본인 타일을 선택하세요.</p>
              )}
              <GameLog actions={gameState.actionLog} />
              {isPlaying && <DrawPileView tiles={gameState.drawPile} />}
              {Object.entries(boards).map(([id, board]) => (
                <PlayerBoardView
                  key={id}
                  board={board}
                  isOwn={id === sessionId}
                  isCurrentTurn={id === currentTurnId}
                  selectedIndex={guessTarget?.sessionId === id ? guessTarget.index : null}
                  drawnTileId={drawnTileId}
                  canSelect={
                    (pendingPenalty && id === sessionId) ||
                    (isPlaying &&
                      isMyTurn &&
                      !isSpectator &&
                      !pendingPenalty &&
                      !needsJoker &&
                      !isDrawCooldown &&
                      id !== sessionId)
                  }
                  onTileSelect={(index) => handleTileSelect(id, index)}
                />
              ))}
            </>
          ) : (
            <p className="text-center text-slate-400 py-8">
              {room.room.status === 'waiting'
                ? '게임이 종료되었습니다. 방장이 다시 시작할 수 있습니다.'
                : '게임 시작을 기다리는 중...'}
            </p>
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
        ) : isPlaying && isMyTurn && !isSpectator && !pendingPenalty && !needsJoker && !isDrawCooldown ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowGuess(true)}
              disabled={!guessTarget}
              className="flex-1 rounded-lg bg-primary text-surface py-3 min-h-[44px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              추리
            </button>
            {canContinueTurn && (
              <button
                type="button"
                onClick={() => getSocket().emit('game:pass')}
                className="flex-1 rounded-lg border border-slate-500 py-3 min-h-[44px]"
              >
                패스
              </button>
            )}
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
              onPlace={(assignedValue) => {
                getSocket().emit('game:placeJoker', { assignedValue, position: 0 });
              }}
            />
          )}
          {showGuess && guessTarget && (
            <GuessPanel
              onClose={() => setShowGuess(false)}
              onGuess={(claim) => {
                getSocket().emit('game:guess', {
                  targetSessionId: guessTarget.sessionId,
                  tileIndex: guessTarget.index,
                  claim,
                });
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
