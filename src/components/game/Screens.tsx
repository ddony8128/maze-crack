import { useState } from 'react';
import type { Difficulty, GameMode, Maze, Player } from '@/types/game';
import { Bot, GraduationCap, Home, RotateCcw, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MazeGrid from './MazeGrid';

export function HomeScreen({ onSelectMode }: { onSelectMode: (m: GameMode) => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 p-6">
      <div className="animate-float-in text-center">
        <h1 className="neon-text text-primary mb-2 text-5xl font-bold tracking-tight sm:text-6xl">
          MAZE CRACK
        </h1>
        <p className="text-muted-foreground text-lg">미로 해독</p>
      </div>
      <div
        className="animate-float-in flex w-full max-w-xs flex-col gap-4"
        style={{ animationDelay: '0.15s' }}
      >
        <Button
          variant="outline"
          size="lg"
          className="neon-glow border-primary/40 text-primary hover:bg-primary/10 h-16 gap-3 text-lg"
          onClick={() => onSelectMode('PVP')}
        >
          <Users className="h-5 w-5" /> 2인 대전
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="neon-glow-accent border-accent/40 text-accent hover:bg-accent/10 h-16 gap-3 text-lg"
          onClick={() => onSelectMode('PVE')}
        >
          <Bot className="h-5 w-5" /> 1인 PvE
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="border-muted-foreground/40 text-muted-foreground hover:bg-muted h-16 gap-3 text-lg"
          onClick={() => onSelectMode('TUTORIAL')}
        >
          <GraduationCap className="h-5 w-5" /> 튜토리얼
        </Button>
      </div>
    </div>
  );
}

export function DifficultySelect({
  onSelect,
  onBack,
}: {
  onSelect: (d: Difficulty) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground absolute top-4 left-4"
        onClick={onBack}
      >
        뒤로
      </Button>
      <h2 className="neon-text text-primary text-3xl font-bold">난이도 선택</h2>
      <div className="flex w-full max-w-xs flex-col gap-4">
        <Button
          variant="outline"
          size="lg"
          className="h-20 flex-col gap-1 border-green-500/40 text-lg text-green-400 hover:bg-green-500/10"
          onClick={() => onSelect('EASY')}
        >
          <span className="text-xl">😊</span>
          <span>Easy</span>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-20 flex-col gap-1 border-red-500/40 text-lg text-red-400 hover:bg-red-500/10"
          onClick={() => onSelect('HARD')}
        >
          <span className="text-xl">🔥</span>
          <span>Hard</span>
        </Button>
      </div>
    </div>
  );
}

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
