import { useCallback, useEffect, useRef, useState } from 'react';
import type { Direction, PublicGameState } from '@/engine/types';
import { aiChooseDirection } from '@/engine/ai';
import MazeGrid from './MazeGrid';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameScreenProps {
  state: PublicGameState;
  onMove: (dir: Direction) => void;
  onHome: () => void;
  onConfirmWallHit: () => void;
}

export default function GameScreen({ state, onMove, onHome, onConfirmWallHit }: GameScreenProps) {
  const {
    mode,
    currentTurn,
    mazes,
    positions,
    discoveredWalls,
    visited,
    difficulty,
    wallHitPending,
  } = state;
  const isP1 = currentTurn === 'P1';
  const idx = isP1 ? 0 : 1;
  const mazeIdx = isP1 ? 1 : 0;
  const maze = mazes[mazeIdx]!;
  const pos = positions[idx]!;
  const isAITurn = mode === 'PVE' && currentTurn === 'P2';
  const inputEnabled = !isAITurn && !wallHitPending;
  const headerText =
    mode === 'PVE'
      ? isP1
        ? '당신의 턴'
        : 'AI의 턴'
      : `${currentTurn}의 턴`;
  const controlSize = 'clamp(44px, 14vw, 56px)';
  const [shake, setShake] = useState(false);
  const prevPendingRef = useRef<boolean>(wallHitPending);

  useEffect(() => {
    if (isAITurn && state.phase === 'PLAY' && !wallHitPending) {
      const timer = window.setTimeout(
        () => {
          const dir = aiChooseDirection(pos, maze.goal, discoveredWalls[1], difficulty!);
          onMove(dir);
        },
        800 + Math.random() * 600,
      );
      return () => window.clearTimeout(timer);
    }
  }, [isAITurn, state.phase, wallHitPending, pos, maze.goal, discoveredWalls, difficulty, onMove]);

  useEffect(() => {
    if (isAITurn && wallHitPending) {
      const timer = window.setTimeout(onConfirmWallHit, 1200);
      return () => window.clearTimeout(timer);
    }
  }, [isAITurn, wallHitPending, onConfirmWallHit]);

  useEffect(() => {
    const wasPending = prevPendingRef.current;
    if (!wasPending && wallHitPending) {
      setShake(true);
      const t = window.setTimeout(() => setShake(false), 800);
      return () => window.clearTimeout(t);
    }
    prevPendingRef.current = wallHitPending;
  }, [wallHitPending]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!inputEnabled) return;
      const map: Record<string, Direction> = {
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        onMove(dir);
      }
    },
    [inputEnabled, onMove],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const dirButtons: { dir: Direction; icon: React.ReactNode; area: string }[] = [
    {
      dir: 'UP',
      icon: <ArrowUp className="h-[clamp(1.1rem,4.5vw,1.5rem)] w-[clamp(1.1rem,4.5vw,1.5rem)]" />,
      area: 'up',
    },
    {
      dir: 'LEFT',
      icon: <ArrowLeft className="h-[clamp(1.1rem,4.5vw,1.5rem)] w-[clamp(1.1rem,4.5vw,1.5rem)]" />,
      area: 'left',
    },
    {
      dir: 'RIGHT',
      icon: <ArrowRight className="h-[clamp(1.1rem,4.5vw,1.5rem)] w-[clamp(1.1rem,4.5vw,1.5rem)]" />,
      area: 'right',
    },
    {
      dir: 'DOWN',
      icon: <ArrowDown className="h-[clamp(1.1rem,4.5vw,1.5rem)] w-[clamp(1.1rem,4.5vw,1.5rem)]" />,
      area: 'down',
    },
  ];

  return (
    <div className="flex min-h-dvh flex-col items-center gap-3 p-3 sm:p-4">
      <div className="flex w-full max-w-[min(92vw,28rem)] items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onHome} className="text-muted-foreground">
          <Home className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <span
            className={cn(
              'neon-text text-[clamp(1.1rem,4.8vw,1.45rem)] font-bold',
              isP1 ? 'text-primary' : 'text-accent neon-text-accent',
            )}
          >
            {headerText}
          </span>
        </div>
        <div className="w-8" />
      </div>

      {isAITurn && !wallHitPending ? (
        <p className="text-accent animate-pulse text-base">AI 생각 중...</p>
      ) : null}

      <div className="flex w-full max-w-[min(92vw,28rem)] items-center justify-between">
        <div
          className={cn(
            'text-destructive text-base font-bold',
            wallHitPending ? 'opacity-100' : 'opacity-0',
          )}
          aria-live="polite"
        >
          🚧 벽에 부딪혔습니다!
        </div>

        <Button
          size="default"
          variant="outline"
          className={cn(
            'border-destructive/40 text-destructive hover:bg-destructive/10',
            !wallHitPending || isAITurn ? 'pointer-events-none opacity-0' : 'opacity-100',
          )}
          onClick={onConfirmWallHit}
        >
          턴 넘기기
        </Button>
      </div>

      <MazeGrid
        walls={discoveredWalls[idx]}
        start={maze.start}
        goal={maze.goal}
        playerPos={pos}
        visitedCells={visited[idx]}
        shake={shake}
      />

      <div
        className="grid w-fit gap-2"
        style={{
          gridTemplateAreas: '". up ." "left . right" ". down ."',
          gridTemplateColumns: `${controlSize} ${controlSize} ${controlSize}`,
          gridTemplateRows: `${controlSize} ${controlSize} ${controlSize}`,
        }}
      >
        {dirButtons.map(({ dir, icon, area }) => (
          <Button
            key={dir}
            variant="outline"
            disabled={!inputEnabled}
            className={cn(
              'border-primary/30 text-primary hover:border-primary/60 hover:bg-primary/10 h-full w-full p-0 disabled:opacity-30',
            )}
            style={{ gridArea: area }}
            onClick={() => (inputEnabled ? onMove(dir) : undefined)}
          >
            {icon}
          </Button>
        ))}
      </div>
    </div>
  );
}
