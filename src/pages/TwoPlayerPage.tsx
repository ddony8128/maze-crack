import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { MazeGame } from '@/engine/game';
import type { MazeAction, MazeState } from '@/engine/types';

export function TwoPlayerPage() {
  const game = useMemo(() => new MazeGame({ seed: 1, step: 0 }), []);
  const [state, setState] = useState<MazeState>(game.getState());
  const [lastAction, setLastAction] = useState<MazeAction | null>(null);

  const stepOnce = (action: MazeAction) => {
    const next = game.apply(action);
    setState(next);
    setLastAction(action);
  };

  return (
    <div className="min-h-dvh">
      <PageHeader />
      <div className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
        <div className="card">
          <h2 className="mb-2 text-xl font-bold">둘이 하기(임시)</h2>
          <p className="text-muted-foreground text-sm">
            실제 2인 UX는 이후 교체하세요. 현재는 액션을 수동으로 적용하는 데모입니다.
          </p>
          <div className="mt-4 grid gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">state:</span> {JSON.stringify(state)}
            </div>
            <div>
              <span className="text-muted-foreground">lastAction:</span>{' '}
              {lastAction ? JSON.stringify(lastAction) : '-'}
            </div>
          </div>
        </div>

        <div className="card flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => stepOnce({ kind: 'move', direction: 'up' })}>
            위
          </Button>
          <Button variant="secondary" onClick={() => stepOnce({ kind: 'move', direction: 'down' })}>
            아래
          </Button>
          <Button variant="secondary" onClick={() => stepOnce({ kind: 'move', direction: 'left' })}>
            왼쪽
          </Button>
          <Button
            variant="secondary"
            onClick={() => stepOnce({ kind: 'move', direction: 'right' })}
          >
            오른쪽
          </Button>
        </div>
      </div>
    </div>
  );
}
