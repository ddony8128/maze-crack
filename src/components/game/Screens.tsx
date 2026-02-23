import { useState } from 'react';
import type { GameMode, Maze, Player } from '@/types/game';
import { Home, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MazeGrid from './MazeGrid';

export function PassScreen({ onReady }: { onReady: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <p className="mb-4 text-5xl">🔒</p>
        <h2 className="text-foreground mb-2 text-2xl font-bold">기기를 넘겨주세요</h2>
        <p className="text-muted-foreground">
          P2가 미로를 제작합니다.
          <br />
          P1은 화면을 보지 마세요!
        </p>
      </div>
      <Button
        size="lg"
        className="neon-glow bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 text-lg"
        onClick={onReady}
      >
        준비 완료
      </Button>
    </div>
  );
}

export function WinScreen({
  winner,
  mode,
  mazes,
  onRestart,
}: {
  winner: Player;
  mode: GameMode;
  mazes: [Maze | null, Maze | null];
  onRestart: () => void;
}) {
  const label = mode === 'PVE' ? (winner === 'P1' ? 'Player' : 'AI') : winner;
  const [viewIdx, setViewIdx] = useState(0);

  const mazeLabels = mode === 'PVE' ? ['Player의 미로', 'AI의 미로'] : ['P1의 미로', 'P2의 미로'];
  const currentMaze = mazes[viewIdx];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <div className="animate-float-in text-center">
        <Trophy className="animate-pulse-glow text-accent mx-auto mb-4 h-16 w-16" />
        <h2 className="neon-text-accent text-accent mb-2 text-4xl font-bold">{label} 승리!</h2>
        <p className="text-muted-foreground">축하합니다 🎉</p>
      </div>

      <div className="animate-float-in w-full max-w-sm" style={{ animationDelay: '0.15s' }}>
        <div className="mb-3 flex justify-center gap-2">
          {mazeLabels.map((lbl, i) => (
            <Button
              key={lbl}
              variant={viewIdx === i ? 'default' : 'outline'}
              size="sm"
              className={
                viewIdx === i
                  ? 'bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground'
              }
              onClick={() => setViewIdx(i)}
            >
              {lbl}
            </Button>
          ))}
        </div>

        {currentMaze ? (
          <MazeGrid walls={currentMaze.walls} start={currentMaze.start} goal={currentMaze.goal} />
        ) : null}
      </div>

      <div className="animate-float-in flex gap-4" style={{ animationDelay: '0.3s' }}>
        <Button
          variant="outline"
          size="lg"
          className="border-primary/40 text-primary gap-2"
          onClick={onRestart}
        >
          <RotateCcw className="h-4 w-4" /> 다시 시작
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="border-muted-foreground/40 text-muted-foreground gap-2"
          onClick={onRestart}
        >
          <Home className="h-4 w-4" /> 메인
        </Button>
      </div>
    </div>
  );
}
