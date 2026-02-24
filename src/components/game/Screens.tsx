import { useEffect, useMemo, useState } from 'react';
import type { Direction, Player, Position, PublicGameState } from '@/types/game';
import { Home, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MazeGrid from './MazeGrid';
import { posKey } from '@/engine/coord';

export function PassScreen({ onReady }: { onReady: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 p-5 sm:p-8">
      <div className="text-center">
        <p className="mb-4 text-[clamp(2.5rem,10vw,3.5rem)]">🔒</p>
        <h2 className="text-foreground mb-2 text-lg font-bold sm:text-2xl">
          다음 사람에게 넘겨주세요
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          P2가 미로를 제작합니다.
          <br />
          P1은 화면을 보지 마세요!
        </p>
      </div>
      <Button
        size="lg"
        className="neon-glow bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={onReady}
      >
        준비 완료
      </Button>
    </div>
  );
}

export function WinScreen({
  finalState,
  onRestart,
  onHome,
}: {
  finalState: PublicGameState;
  onRestart: () => void;
  onHome: () => void;
}) {
  const winner: Player = finalState.winner ?? 'P1';
  const mode = finalState.mode;

  const label = mode === 'PVE' ? (winner === 'P1' ? '당신' : 'AI') : winner;

  const [viewPlayer, setViewPlayer] = useState<Player>('P1');
  const [isPlaying, setIsPlaying] = useState(true);
  const [step, setStep] = useState(0);
  const [shake, setShake] = useState(false);

  const opponentMazeIndex = viewPlayer === 'P1' ? 1 : 0;
  const opponentMaze = finalState.mazes[opponentMazeIndex];
  const startPos = opponentMaze.start;

  const events = useMemo(() => {
    return finalState.log
      .filter((e) => e.playerId === viewPlayer)
      .map((e) => ({ position: e.position, success: e.success, direction: e.direction }));
  }, [finalState.log, viewPlayer]);

  const timeline: Array<{ position: Position; success: boolean; direction: Direction | null }> =
    useMemo(() => {
      return [{ position: startPos, success: true, direction: null }, ...events];
    }, [events, startPos]);

  const maxStep = Math.max(0, timeline.length - 1);

  const clampedStep = Math.min(step, maxStep);
  const current = timeline[clampedStep]!;

  const visitedCells = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (let i = 0; i <= clampedStep; i++) {
      const k = posKey(timeline[i]!.position);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(k);
    }
    return out;
  }, [clampedStep, timeline]);

  useEffect(() => {
    setStep(0);
    setIsPlaying(true);
  }, [viewPlayer]);

  useEffect(() => {
    if (!isPlaying) return;
    if (clampedStep >= maxStep) return;
    const t = window.setTimeout(() => setStep((s) => Math.min(maxStep, s + 1)), 420);
    return () => window.clearTimeout(t);
  }, [isPlaying, clampedStep, maxStep]);

  useEffect(() => {
    if (clampedStep === 0) return;
    const ev = timeline[clampedStep]!;
    if (ev.success) return;
    setShake(true);
    const t = window.setTimeout(() => setShake(false), 800);
    return () => window.clearTimeout(t);
  }, [clampedStep, timeline]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-5 sm:p-8">
      <div className="animate-float-in text-center">
        <Trophy className="animate-pulse-glow text-accent mx-auto mb-4 h-14 w-14 sm:h-16 sm:w-16" />
        <h2 className="neon-text-accent text-accent mb-2 text-[clamp(2rem,7vw,2.75rem)] font-bold">
          {label} 승리!
        </h2>
        <p className="text-muted-foreground text-base sm:text-xl">
          정답 미로와 이동 경로를 확인해보세요
        </p>
      </div>

      <div
        className="animate-float-in w-full max-w-[min(92vw,28rem)]"
        style={{ animationDelay: '0.15s' }}
      >
        <div className="mb-3 flex items-center justify-center gap-2">
          <Button
            variant={viewPlayer === 'P1' ? 'default' : 'outline'}
            size="default"
            className={
              viewPlayer === 'P1'
                ? 'bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground'
            }
            onClick={() => setViewPlayer('P1')}
          >
            P1
          </Button>
          <Button
            variant={viewPlayer === 'P2' ? 'default' : 'outline'}
            size="default"
            className={
              viewPlayer === 'P2'
                ? 'bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground'
            }
            onClick={() => setViewPlayer('P2')}
          >
            P2
          </Button>
        </div>

        <MazeGrid
          walls={opponentMaze.walls}
          start={opponentMaze.start}
          goal={opponentMaze.goal}
          playerPos={current.position}
          visitedCells={visitedCells}
          shake={shake}
        />

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="default"
              className="border-border text-muted-foreground"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              이전
            </Button>
            <Button
              variant={isPlaying ? 'secondary' : 'default'}
              size="default"
              className={
                isPlaying
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-primary text-primary-foreground'
              }
              onClick={() => setIsPlaying((v) => !v)}
            >
              {isPlaying ? '일시정지' : '재생'}
            </Button>
            <Button
              variant="outline"
              size="default"
              className="border-border text-muted-foreground"
              onClick={() => setStep((s) => Math.min(maxStep, s + 1))}
            >
              다음
            </Button>
          </div>

          <input
            type="range"
            min={0}
            max={maxStep}
            value={clampedStep}
            onChange={(e) => {
              setIsPlaying(false);
              setStep(Number(e.target.value));
            }}
            className="w-full"
          />
          <div className="text-muted-foreground flex items-center justify-between text-base">
            <span>0</span>
            <span>
              {clampedStep}/{maxStep}
            </span>
            <span>{maxStep}</span>
          </div>
        </div>
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
          onClick={onHome}
        >
          <Home className="h-4 w-4" /> 메인
        </Button>
      </div>
    </div>
  );
}
