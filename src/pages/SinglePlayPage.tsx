import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { AIWorkerClient } from '@/engine/aiWorkerClient';
import { MazeGame } from '@/engine/game';
import {
  difficultyLevel,
  type DifficultyLevel,
  type MazeAction,
  type MazeState,
} from '@/engine/types';

export function SinglePlayPage() {
  const { difficulty } = useParams<{ difficulty: string }>();
  const resolvedDifficulty: DifficultyLevel =
    difficulty === 'hard' ? difficultyLevel.Hard : difficultyLevel.Easy;

  const gameRef = useRef<MazeGame | null>(null);
  const aiClientRef = useRef<AIWorkerClient | null>(null);
  const aiRequestGenerationRef = useRef(0);

  const [state, setState] = useState<MazeState>({ seed: 1, step: 0 });
  const [lastAction, setLastAction] = useState<MazeAction | null>(null);
  const [autoPlay, setAutoPlay] = useState(true);

  const initGame = useCallback(() => {
    const g = new MazeGame({ seed: 1, step: 0 });
    gameRef.current = g;
    setState(g.getState());
    setLastAction(null);
    setAutoPlay(true);
    aiRequestGenerationRef.current++;
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame, resolvedDifficulty]);

  useEffect(() => {
    aiClientRef.current = new AIWorkerClient();
    return () => {
      aiClientRef.current?.dispose();
      aiClientRef.current = null;
    };
  }, [resolvedDifficulty]);

  const reset = () => {
    initGame();
  };

  const stepOnce = (action: MazeAction) => {
    const g = gameRef.current;
    if (!g) return;
    const next = g.apply(action);
    setState(next);
    setLastAction(action);
  };

  useEffect(() => {
    if (!autoPlay) return;
    const client = aiClientRef.current;
    if (!client) return;

    const requestGen = ++aiRequestGenerationRef.current;
    const timer = window.setTimeout(() => {
      client
        .getNextAction(state, resolvedDifficulty, false)
        .then((action) => {
          if (requestGen !== aiRequestGenerationRef.current) return;
          stepOnce(action);
        })
        .catch((e) => console.error(e));
    }, 200);

    return () => window.clearTimeout(timer);
  }, [autoPlay, state, resolvedDifficulty]);

  return (
    <div className="min-h-dvh">
      <PageHeader />
      <div className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
        <div className="card">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">싱글(Worker AI) 데모</h2>
            <Button variant="outline" onClick={reset}>
              리셋
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            실제 maze-crack 엔진/AI로 교체할 자리입니다. 현재는 Worker가 단순 방향 액션을
            생성합니다.
          </p>
          <div className="mt-4 grid gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">난이도:</span> {resolvedDifficulty}
            </div>
            <div>
              <span className="text-muted-foreground">state:</span> {JSON.stringify(state)}
            </div>
            <div>
              <span className="text-muted-foreground">lastAction:</span>{' '}
              {lastAction ? JSON.stringify(lastAction) : '-'}
            </div>
          </div>
        </div>

        <div className="card flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => setAutoPlay((v) => !v)}>
              {autoPlay ? '자동 멈춤' : '자동 시작'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => stepOnce({ kind: 'move', direction: 'up' })}
              disabled={autoPlay}
            >
              위
            </Button>
            <Button
              variant="secondary"
              onClick={() => stepOnce({ kind: 'move', direction: 'down' })}
              disabled={autoPlay}
            >
              아래
            </Button>
            <Button
              variant="secondary"
              onClick={() => stepOnce({ kind: 'move', direction: 'left' })}
              disabled={autoPlay}
            >
              왼쪽
            </Button>
            <Button
              variant="secondary"
              onClick={() => stepOnce({ kind: 'move', direction: 'right' })}
              disabled={autoPlay}
            >
              오른쪽
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
