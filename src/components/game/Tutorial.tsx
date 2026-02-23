import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { PassScreen } from './Screens';
import MazeGrid from './MazeGrid';

interface TutorialProps {
  step: number;
  onNext: () => void;
  onPrev: () => void;
  onHome: () => void;
  onStartPVP: () => void;
  onStartPVE: () => void;
}

const EXAMPLE_START = { row: 0, col: 0 };
const EXAMPLE_GOAL = { row: 4, col: 4 };
const EXAMPLE_WALLS = ['0,0-0,1', '1,1-1,2', '2,2-3,2', '3,3-3,4', '0,2-1,2'];
const EXAMPLE_PLAYER = { row: 2, col: 1 };
const EXAMPLE_VISITED = ['0,0', '1,0', '2,0', '2,1'];
const WALL_HIT_PLAYER = { row: 1, col: 1 };
const WALL_HIT_WALLS = ['1,1-1,2'];

const steps = [
  {
    icon: '🏠',
    title: '모드 선택',
    desc: '2인 대전, 1인 PvE, 튜토리얼 중 하나를 선택합니다.\n2인 대전은 한 기기에서 번갈아 플레이합니다.',
  },
  {
    icon: '📍',
    title: '출발점 & 도착점',
    desc: '5×5 격자에서 출발점(S)과 도착점(G)을\n원하는 위치에 배치합니다.',
  },
  {
    icon: '🧱',
    title: '벽 설치',
    desc: '인접한 칸 사이에 벽을 설치합니다.\n단, S에서 G까지 최소 1개의 경로가 존재해야 합니다.',
  },
  {
    icon: '🔄',
    title: '기기 전달',
    desc: '2인 모드에서는 P1 미로 제작 후\n화면을 가리고 P2에게 기기를 넘깁니다.\n서로의 벽 위치는 비밀!',
  },
  {
    icon: '🎯',
    title: '이동 탐색',
    desc: '자기 턴에 상·하·좌·우 중 1방향으로 이동을 시도합니다.\n벽에 부딪힐 때까지 계속 이동할 수 있습니다.',
  },
  {
    icon: '🚧',
    title: '벽 충돌',
    desc: '벽이 있으면 이동하지 못하고\n그 즉시 턴이 종료됩니다.\n벽 정보는 양쪽 모두에게 공개됩니다.',
  },
  {
    icon: '🏆',
    title: '승리 조건',
    desc: '상대가 설계한 미로의 도착점(G)에\n먼저 도달하는 플레이어가 승리합니다!',
  },
];

function TutorialOverlay({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <div className="relative">
      <div className="pointer-events-none origin-top scale-90 opacity-70">{children}</div>
      <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-4">
        <div className="bg-background/90 border-primary/30 max-w-xs rounded-lg border p-3 text-center">
          <p className="text-muted-foreground text-sm whitespace-pre-line">{text}</p>
        </div>
      </div>
    </div>
  );
}

function StepDemo({ step }: { step: number }) {
  switch (step) {
    case 0:
      return (
        <TutorialOverlay text="모드를 선택하는 홈 화면입니다.">
          <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-5 sm:p-8">
            <div className="text-center">
              <h1 className="game-title mb-2">MAZE CRACK</h1>
              <p className="text-muted-foreground text-sm">미로 해독</p>
            </div>
            <div className="flex w-full max-w-xs flex-col gap-3">
              <Button variant="outline" size="lg" className="justify-center">
                2인 대전
              </Button>
              <Button variant="outline" size="lg" className="justify-center">
                1인 PvE
              </Button>
              <Button variant="outline" size="lg" className="justify-center">
                튜토리얼
              </Button>
            </div>
          </div>
        </TutorialOverlay>
      );
    case 1:
      return (
        <div className="mx-auto w-full max-w-[min(92vw,28rem)]">
          <p className="text-muted-foreground mb-2 text-center text-[clamp(0.72rem,2.8vw,0.8rem)]">
            S와 G를 배치한 예시
          </p>
          <MazeGrid walls={[]} start={EXAMPLE_START} goal={EXAMPLE_GOAL} />
        </div>
      );
    case 2:
      return (
        <div className="mx-auto w-full max-w-[min(92vw,28rem)]">
          <p className="text-muted-foreground mb-2 text-center text-[clamp(0.72rem,2.8vw,0.8rem)]">
            벽이 설치된 미로 예시
          </p>
          <MazeGrid walls={EXAMPLE_WALLS} start={EXAMPLE_START} goal={EXAMPLE_GOAL} />
        </div>
      );
    case 3:
      return (
        <TutorialOverlay text="상대에게 기기를 넘기는 화면입니다.">
          <PassScreen onReady={() => {}} />
        </TutorialOverlay>
      );
    case 4:
      return (
        <div className="mx-auto w-full max-w-[min(92vw,28rem)]">
          <p className="text-muted-foreground mb-2 text-center text-[clamp(0.72rem,2.8vw,0.8rem)]">
            탐색 중인 보드 (발견한 벽만 표시)
          </p>
          <MazeGrid
            walls={[]}
            start={EXAMPLE_START}
            goal={EXAMPLE_GOAL}
            playerPos={EXAMPLE_PLAYER}
            visitedCells={EXAMPLE_VISITED}
          />
        </div>
      );
    case 5:
      return (
        <div className="mx-auto w-full max-w-[min(92vw,28rem)]">
          <p className="text-muted-foreground mb-2 text-center text-[clamp(0.72rem,2.8vw,0.8rem)]">
            오른쪽으로 이동 시도 → 벽 발견!
          </p>
          <MazeGrid
            walls={WALL_HIT_WALLS}
            start={EXAMPLE_START}
            goal={EXAMPLE_GOAL}
            playerPos={WALL_HIT_PLAYER}
            visitedCells={['0,0', '1,0', '1,1']}
          />
          <p className="text-destructive mt-2 text-center text-[clamp(0.72rem,2.8vw,0.8rem)] font-bold">
            🚧 벽에 부딪혔습니다! → 턴 종료
          </p>
        </div>
      );
    case 6:
      return (
        <div className="mx-auto w-full max-w-[min(92vw,28rem)]">
          <p className="text-muted-foreground mb-2 text-center text-[clamp(0.72rem,2.8vw,0.8rem)]">
            Goal에 도달!
          </p>
          <MazeGrid
            walls={EXAMPLE_WALLS}
            start={EXAMPLE_START}
            goal={EXAMPLE_GOAL}
            playerPos={EXAMPLE_GOAL}
            visitedCells={['0,0', '1,0', '2,0', '2,1', '3,1', '4,1', '4,2', '4,3', '4,4']}
          />
        </div>
      );
    default:
      return null;
  }
}

export default function Tutorial({
  step,
  onNext,
  onPrev,
  onHome,
  onStartPVP,
  onStartPVE,
}: TutorialProps) {
  const isLast = step >= steps.length - 1;
  const s = steps[Math.min(step, steps.length - 1)]!;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-5 sm:p-8">
      <div className="flex gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-border'}`}
          />
        ))}
      </div>

      <div className="text-center" key={step}>
        <p className="mb-2 text-[clamp(2rem,9vw,2.75rem)]">{s.icon}</p>
        <h2 className="text-primary mb-2 text-[clamp(1.25rem,5vw,1.75rem)] font-bold">
          {s.title}
        </h2>
        <p className="text-muted-foreground mx-auto max-w-xs text-[clamp(0.85rem,3.2vw,0.95rem)] leading-relaxed whitespace-pre-line">
          {s.desc}
        </p>
      </div>

      <div className="w-full max-w-md">
        <StepDemo step={step} />
      </div>

      <div className="flex gap-3">
        {step > 0 ? (
          <Button
            variant="outline"
            size="lg"
            className="border-border text-muted-foreground gap-1"
            onClick={onPrev}
          >
            <ArrowLeft className="h-4 w-4" /> 이전
          </Button>
        ) : null}

        {!isLast ? (
          <Button size="lg" className="bg-primary text-primary-foreground gap-1" onClick={onNext}>
            다음 <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <Button
              size="lg"
              className="neon-glow bg-primary text-primary-foreground gap-2"
              onClick={onStartPVP}
            >
              2인 대전 시작
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-accent/40 text-accent gap-2"
              onClick={onStartPVE}
            >
              1인 PvE 시작
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-1"
              onClick={onHome}
            >
              <Home className="h-3 w-3" /> 메인으로
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
