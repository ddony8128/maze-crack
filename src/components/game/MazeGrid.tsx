import { useCallback, useState } from 'react';
import type { BuilderTool } from '@/types/game';
import type { Position, WallKey } from '@/engine/types';
import { posKey } from '@/engine/coord';
import { makeWallKey } from '@/engine/maze';
import { cn } from '@/lib/utils';

interface MazeGridProps {
  walls: WallKey[];
  start: Position | null;
  goal: Position | null;
  playerPos?: Position | null;
  visitedCells?: string[];
  editable?: boolean;
  activeTool?: BuilderTool;
  onCellClick?: (pos: Position) => void;
  onWallToggle?: (wallKey: WallKey) => void;
  compact?: boolean;
}

const GRID_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns:
    'var(--mc-cell) var(--mc-wall) var(--mc-cell) var(--mc-wall) var(--mc-cell) var(--mc-wall) var(--mc-cell) var(--mc-wall) var(--mc-cell)',
  gridTemplateRows:
    'var(--mc-cell) var(--mc-wall) var(--mc-cell) var(--mc-wall) var(--mc-cell) var(--mc-wall) var(--mc-cell) var(--mc-wall) var(--mc-cell)',
};

export default function MazeGrid({
  walls,
  start,
  goal,
  playerPos,
  visitedCells = [],
  editable = false,
  activeTool,
  onCellClick,
  onWallToggle,
  compact = false,
}: MazeGridProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'add' | 'remove' | null>(null);

  const handleWallPointerDown = useCallback(
    (wk: string, active: boolean) => {
      if (!editable || activeTool !== 'WALL') return;
      setIsDragging(true);
      setDragMode(active ? 'remove' : 'add');
      onWallToggle?.(wk);
    },
    [editable, activeTool, onWallToggle],
  );

  const handleWallPointerEnter = useCallback(
    (wk: string, active: boolean) => {
      if (!isDragging || !editable || activeTool !== 'WALL' || dragMode === null) return;
      if (dragMode === 'add' && !active) onWallToggle?.(wk);
      if (dragMode === 'remove' && active) onWallToggle?.(wk);
    },
    [isDragging, dragMode, editable, activeTool, onWallToggle],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setDragMode(null);
  }, []);

  const items: React.ReactNode[] = [];

  for (let gr = 0; gr < 9; gr++) {
    for (let gc = 0; gc < 9; gc++) {
      const key = `${gr}-${gc}`;
      const isCell = gr % 2 === 0 && gc % 2 === 0;
      const isVWall = gr % 2 === 0 && gc % 2 === 1;
      const isHWall = gr % 2 === 1 && gc % 2 === 0;

      if (isCell) {
        const r = gr / 2;
        const c = gc / 2;
        const pos: Position = { row: r, col: c };
        const isS = !!start && r === start.row && c === start.col;
        const isG = !!goal && r === goal.row && c === goal.col;
        const isP = !!playerPos && r === playerPos.row && c === playerPos.col;
        const isV = visitedCells.includes(posKey(pos));

        items.push(
          <div
            key={key}
            className={cn(
              'flex items-center justify-center rounded-sm font-mono text-[clamp(0.65rem,2.6vw,0.8rem)] font-bold transition-all duration-200 select-none',
              isP
                ? 'bg-primary neon-glow text-primary-foreground z-10'
                : isG
                  ? 'bg-accent/20 animate-pulse-glow'
                  : isS
                    ? 'bg-primary/10'
                    : isV
                      ? 'bg-secondary/80'
                      : 'bg-card',
              editable && activeTool !== 'WALL' && 'hover:bg-muted cursor-pointer',
            )}
            onClick={() => (editable ? onCellClick?.(pos) : undefined)}
          >
            {isP ? (
              '●'
            ) : isG ? (
              <span className="neon-text-accent text-accent">G</span>
            ) : isS ? (
              <span className="text-primary/60">S</span>
            ) : (
              ''
            )}
          </div>,
        );
      } else if (isVWall) {
        const r = gr / 2;
        const c = (gc - 1) / 2;
        const wk = makeWallKey({ row: r, col: c }, { row: r, col: c + 1 });
        const active = walls.includes(wk);
        items.push(
          <div
            key={key}
            className={cn(
              'touch-none rounded-full transition-all duration-150',
              active ? 'bg-primary/70' : 'bg-border/20',
              editable && activeTool === 'WALL' && 'hover:bg-primary/40 cursor-pointer',
            )}
            onPointerDown={() => handleWallPointerDown(wk, active)}
            onPointerEnter={() => handleWallPointerEnter(wk, active)}
          />,
        );
      } else if (isHWall) {
        const r = (gr - 1) / 2;
        const c = gc / 2;
        const wk = makeWallKey({ row: r, col: c }, { row: r + 1, col: c });
        const active = walls.includes(wk);
        items.push(
          <div
            key={key}
            className={cn(
              'touch-none rounded-full transition-all duration-150',
              active ? 'bg-primary/70' : 'bg-border/20',
              editable && activeTool === 'WALL' && 'hover:bg-primary/40 cursor-pointer',
            )}
            onPointerDown={() => handleWallPointerDown(wk, active)}
            onPointerEnter={() => handleWallPointerEnter(wk, active)}
          />,
        );
      } else {
        items.push(<div key={key} className="bg-border/10 rounded-full" />);
      }
    }
  }

  return (
    <div
      className={cn(
        'border-primary/20 aspect-square w-full overflow-hidden rounded-lg border-2',
        compact
          ? 'max-w-[min(56vw,220px)] sm:max-w-[min(40vw,240px)]'
          : 'max-w-[min(92vw,420px)] sm:max-w-[min(80vw,460px)]',
        'mx-auto',
      )}
      style={
        {
          '--mc-wall': compact ? 'clamp(3px, 1.2vw, 6px)' : 'clamp(4px, 1.6vw, 7px)',
          // 그리드가 컨테이너를 꽉 채우도록 셀 크기는 % 기반으로 산출한다.
          '--mc-cell': 'calc((100% - (4 * var(--mc-wall))) / 5)',
        } as React.CSSProperties
      }
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="h-full w-full" style={GRID_STYLE}>
        {items}
      </div>
    </div>
  );
}
