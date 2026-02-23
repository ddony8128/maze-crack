import { useMemo, useState } from 'react';
import type { BuilderTool } from '@/types/game';
import type { MazeSpec, Position } from '@/engine/types';
import { hasPath } from '@/engine/maze';
import MazeGrid from './MazeGrid';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Fence, Flag, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MazeBuilderProps {
  owner: string;
  onComplete: (maze: MazeSpec) => void;
  onBack?: () => void;
}

export default function MazeBuilder({ owner, onComplete, onBack }: MazeBuilderProps) {
  const [start, setStart] = useState<Position | null>(null);
  const [goal, setGoal] = useState<Position | null>(null);
  const [walls, setWalls] = useState<string[]>([]);
  const [tool, setTool] = useState<BuilderTool>('START');

  const isValid = useMemo(() => {
    if (!start || !goal) return false;
    return hasPath(start, goal, walls);
  }, [start, goal, walls]);

  const handleCellClick = (pos: Position) => {
    if (tool === 'START') {
      if (goal && pos.row === goal.row && pos.col === goal.col) return;
      setStart(pos);
      if (!goal) setTool('GOAL');
      return;
    }
    if (tool === 'GOAL') {
      if (start && pos.row === start.row && pos.col === start.col) return;
      setGoal(pos);
      setTool('WALL');
    }
  };

  const handleWallToggle = (wallKey: string) => {
    setWalls((prev) =>
      prev.includes(wallKey) ? prev.filter((w) => w !== wallKey) : [...prev, wallKey],
    );
  };

  const handleComplete = () => {
    if (!start || !goal || !isValid) return;
    onComplete({ start, goal, walls });
  };

  const tools: { id: BuilderTool; label: string; icon: React.ReactNode }[] = [
    { id: 'START', label: '출발', icon: <MapPin className="h-4 w-4" /> },
    { id: 'GOAL', label: '도착', icon: <Flag className="h-4 w-4" /> },
    { id: 'WALL', label: '벽', icon: <Fence className="h-4 w-4" /> },
  ];

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 p-4 sm:gap-6 sm:p-6">
      {onBack ? (
        <Button
          variant="ghost"
          size="default"
          className="text-muted-foreground absolute top-4 left-4"
          onClick={onBack}
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> 뒤로
        </Button>
      ) : null}

      <h2 className="text-primary text-2xl font-bold">{owner} — 미로 제작</h2>

      <div className="flex gap-2">
        {tools.map((t) => (
          <Button
            key={t.id}
            variant={tool === t.id ? 'default' : 'outline'}
            size="default"
            className={cn(
              'gap-1.5',
              tool === t.id
                ? 'bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground',
            )}
            onClick={() => setTool(t.id)}
          >
            {t.icon} {t.label}
          </Button>
        ))}
      </div>

      <p className="text-muted-foreground text-base">
        {tool === 'START' && '셀을 탭하여 출발점 지정'}
        {tool === 'GOAL' && '셀을 탭하여 도착점 지정'}
        {tool === 'WALL' && '칸 사이를 탭하여 벽 토글'}
      </p>

      <MazeGrid
        walls={walls}
        start={start}
        goal={goal}
        editable
        activeTool={tool}
        onCellClick={handleCellClick}
        onWallToggle={handleWallToggle}
      />

      <div className="text-base font-medium">
        {!start || !goal ? (
          <span className="text-muted-foreground">출발점과 도착점을 배치하세요</span>
        ) : isValid ? (
          <span className="text-green-400">✓ 유효한 미로</span>
        ) : (
          <span className="text-destructive">✗ 출발점부터 도착점까지 갈 수 있는 방법이 없습니다</span>
        )}
      </div>

      <Button
        size="lg"
        disabled={!isValid}
        className="neon-glow bg-primary text-primary-foreground hover:bg-primary/90 gap-2 disabled:opacity-40 disabled:shadow-none"
        onClick={handleComplete}
      >
        <Check className="h-4 w-4" /> 완료
      </Button>
    </div>
  );
}
