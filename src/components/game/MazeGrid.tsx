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
  shake?: boolean;
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
  shake = false,
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
              'flex items-center justify-center rounded-sm font-mono text-[clamp(0.75rem,2.9vw,0.95rem)] font-bold transition-all duration-200 select-none',
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
              <span className="neon-text-accent text-accent text-[0.95em]">도착</span>
            ) : isS ? (
              <span className="text-primary/70 text-[0.95em]">출발</span>
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
        const interactive = editable && activeTool === 'WALL';
        items.push(
          <div
            key={key}
            className={cn(
              'relative touch-none rounded-full transition-all duration-150',
              active ? 'bg-primary/70' : 'bg-border/20',
              interactive && 'hover:bg-primary/40 cursor-pointer',
            )}
          >
            <div
              className={cn(
                'absolute top-0 left-1/2 h-full w-[calc(var(--mc-wall)*5)] -translate-x-1/2 touch-none rounded-full',
                interactive ? 'pointer-events-auto' : 'pointer-events-none',
              )}
              onPointerDown={() => handleWallPointerDown(wk, active)}
              onPointerEnter={() => handleWallPointerEnter(wk, active)}
            />
          </div>,
        );
      } else if (isHWall) {
        const r = (gr - 1) / 2;
        const c = gc / 2;
        const wk = makeWallKey({ row: r, col: c }, { row: r + 1, col: c });
        const active = walls.includes(wk);
        const interactive = editable && activeTool === 'WALL';
        items.push(
          <div
            key={key}
            className={cn(
              'relative touch-none rounded-full transition-all duration-150',
              active ? 'bg-primary/70' : 'bg-border/20',
              interactive && 'hover:bg-primary/40 cursor-pointer',
            )}
          >
            <div
              className={cn(
                'absolute top-1/2 left-0 h-[calc(var(--mc-wall)*5)] w-full -translate-y-1/2 touch-none rounded-full',
                interactive ? 'pointer-events-auto' : 'pointer-events-none',
              )}
              onPointerDown={() => handleWallPointerDown(wk, active)}
              onPointerEnter={() => handleWallPointerEnter(wk, active)}
            />
          </div>,
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
        shake && 'mc-shake',
        compact
          ? 'max-w-[min(56vw,220px)] sm:max-w-[min(40vw,240px)]'
          : 'max-w-[min(76vw,420px)] sm:max-w-[min(80vw,460px)]',
        'mx-auto',
      )}
      style={
        {
          '--mc-wall': compact ? 'clamp(3px, 1.2vw, 6px)' : 'clamp(4px, 1.6vw, 7px)',
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
