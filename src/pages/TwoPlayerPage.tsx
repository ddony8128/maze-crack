import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { MazeCrackGame } from '@/engine/game';
import {
  Col,
  Direction,
  PlayerId,
  Row,
  type Cell,
  type PublicGameState,
  type TurnResult,
} from '@/engine/types';

export function TwoPlayerPage() {
  const game = useMemo(() => {
    const cell = (row: Row, col: Col): Cell => ({ row, col });
    return new MazeCrackGame({
      p1Maze: { start: cell(Row.B, Col.C2), goal: cell(Row.E, Col.C5), walls: [] },
      p2Maze: { start: cell(Row.A, Col.C1), goal: cell(Row.E, Col.C1), walls: [] },
      startingPlayer: PlayerId.P1,
    });
  }, []);

  const [publicState, setPublicState] = useState<PublicGameState>(game.getPublicState());
  const [lastTurn, setLastTurn] = useState<TurnResult | null>(null);

  const stepOnce = (direction: Direction) => {
    try {
      const result = game.applyTurn(publicState.currentPlayer, direction);
      setLastTurn(result);
      setPublicState(game.getPublicState());
    } catch (e) {
      console.error(e);
    }
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
              <span className="text-muted-foreground">publicState:</span>{' '}
              {publicState ? JSON.stringify(publicState) : '-'}
            </div>
            <div>
              <span className="text-muted-foreground">lastTurn:</span>{' '}
              {lastTurn ? JSON.stringify(lastTurn) : '-'}
            </div>
          </div>
        </div>

        <div className="card flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => stepOnce(Direction.Up)}>
            위
          </Button>
          <Button variant="secondary" onClick={() => stepOnce(Direction.Down)}>
            아래
          </Button>
          <Button variant="secondary" onClick={() => stepOnce(Direction.Left)}>
            왼쪽
          </Button>
          <Button variant="secondary" onClick={() => stepOnce(Direction.Right)}>
            오른쪽
          </Button>
        </div>
      </div>
    </div>
  );
}
