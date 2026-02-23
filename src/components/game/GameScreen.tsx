import { useCallback, useEffect, useRef } from 'react';
import type { Direction, PublicGameState } from '@/engine/types';
import { aiChooseDirection } from '@/engine/ai';
import { DIR_LABELS, posLabel } from '@/engine/coord';
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
    log,
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
  const turnLabel = mode === 'PVE' ? (isP1 ? 'Player' : 'AI') : currentTurn;
  const logRef = useRef<HTMLDivElement>(null);
  const controlSize = 'clamp(44px, 14vw, 56px)';

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
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [log.length]);

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
              'neon-text text-[clamp(1rem,4.2vw,1.25rem)] font-bold',
              isP1 ? 'text-primary' : 'text-accent neon-text-accent',
            )}
          >
            {turnLabel}의 턴
          </span>
          <span className="text-muted-foreground ml-2 text-[clamp(0.7rem,2.6vw,0.8rem)]">
            #{log.length + 1}
          </span>
        </div>
        <div className="w-8" />
      </div>

      {isAITurn && !wallHitPending ? (
        <p className="text-accent animate-pulse text-sm">AI 생각 중...</p>
      ) : null}

      {wallHitPending ? (
        <div className="animate-float-in flex flex-col items-center gap-2">
          <p className="text-destructive text-sm font-bold">🚧 벽에 부딪혔습니다!</p>
          {!isAITurn ? (
            <Button
              size="sm"
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={onConfirmWallHit}
            >
              확인 (턴 넘기기)
            </Button>
          ) : null}
        </div>
      ) : null}

      <MazeGrid
        walls={discoveredWalls[idx]}
        start={maze.start}
        goal={maze.goal}
        playerPos={pos}
        visitedCells={visited[idx]}
      />

      <p className="text-muted-foreground font-mono-game text-[clamp(0.72rem,2.8vw,0.8rem)]">
        위치: {posLabel(pos)} → 목표: {posLabel(maze.goal)}
      </p>

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

      <div
        ref={logRef}
        className="bg-card border-border font-mono-game h-[clamp(6rem,18vh,8.5rem)] w-full max-w-[min(92vw,28rem)] overflow-y-auto rounded-lg border p-2 text-[clamp(0.72rem,2.8vw,0.8rem)] sm:p-3"
      >
        {log.length === 0 ? (
          <p className="text-muted-foreground">이동 로그가 여기에 표시됩니다</p>
        ) : null}
        <div className="space-y-0.5">
          {log.map((entry, i) => (
            <div
              key={`${i}-${entry.player}-${entry.direction}`}
              className={cn('flex gap-2', entry.success ? 'text-green-400' : 'text-destructive')}
            >
              <span className="text-muted-foreground w-6 text-right">#{i + 1}</span>
              <span className="w-12">{entry.player}</span>
              <span>{DIR_LABELS[entry.direction]}</span>
              <span>{entry.success ? '✓' : '✗ 벽'}</span>
              <span className="text-muted-foreground">→ {posLabel(entry.position)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
