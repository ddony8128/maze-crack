import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { AIWorkerClient } from '@/engine/aiWorkerClient';
import {
  Col,
  Direction,
  GamePhase,
  PlayerId,
  Row,
  difficultyLevel,
  type Cell,
  type DifficultyLevel,
  type PublicGameState,
  type TurnResult,
} from '@/engine/types';
import { MazeCrackGame } from '@/engine/game';

export function SinglePlayPage() {
  const { difficulty } = useParams<{ difficulty: string }>();
  const resolvedDifficulty: DifficultyLevel =
    difficulty === 'hard' ? difficultyLevel.Hard : difficultyLevel.Easy;

  const gameRef = useRef<MazeCrackGame | null>(null);
  const aiClientRef = useRef<AIWorkerClient | null>(null);
  const aiRequestGenerationRef = useRef(0);

  const [publicState, setPublicState] = useState<PublicGameState | null>(null);
  const [lastTurn, setLastTurn] = useState<TurnResult | null>(null);
  const [autoPlay, setAutoPlay] = useState(true);

  const initGame = useCallback(() => {
    const cell = (row: Row, col: Col): Cell => ({ row, col });

    const game = new MazeCrackGame({
      // p1Maze / p2Maze는 "각 플레이어가 설계한 비밀 미로"에 해당
      // (싱글 데모에선 벽이 없는 단순 미로로 구성)
      p1Maze: {
        start: cell(Row.B, Col.C2),
        goal: cell(Row.E, Col.C5),
        walls: [],
      },
      p2Maze: {
        start: cell(Row.A, Col.C1),
        goal: cell(Row.E, Col.C1),
        walls: [],
      },
      startingPlayer: PlayerId.P1,
    });

    gameRef.current = game;
    setPublicState(game.getPublicState());
    setLastTurn(null);
    setAutoPlay(true);
    aiRequestGenerationRef.current += 1;
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

  const stepOnce = useCallback((player: PlayerId, direction: Direction) => {
    const game = gameRef.current;
    if (!game) return;

    try {
      const result = game.applyTurn(player, direction);
      setLastTurn(result);
      setPublicState(game.getPublicState());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (!autoPlay) return;
    const client = aiClientRef.current;
    if (!client) return;
    if (!publicState) return;
    if (publicState.phase === GamePhase.Finished) return;

    const requestGen = ++aiRequestGenerationRef.current;
    const timer = window.setTimeout(() => {
      const player = publicState.currentPlayer;
      const from = publicState.tokenPositions[player];
      const goal = publicState.opponentGoal[player];

      client
        .getNextDirection(from, goal, resolvedDifficulty, false)
        .then((dir) => {
          if (requestGen !== aiRequestGenerationRef.current) return;
          stepOnce(player, dir);
        })
        .catch((e) => console.error(e));
    }, 200);

    return () => window.clearTimeout(timer);
  }, [autoPlay, publicState, resolvedDifficulty, stepOnce]);

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
            Maze Crack 엔진(턴/벽 판정/승리)을 사용해 Worker가 방향을 추천하는 데모입니다.
          </p>
          <div className="mt-4 grid gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">난이도:</span> {resolvedDifficulty}
            </div>
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

        <div className="card flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => setAutoPlay((v) => !v)}>
              {autoPlay ? '자동 멈춤' : '자동 시작'}
            </Button>
            <Button variant="secondary" onClick={() => publicState && stepOnce(publicState.currentPlayer, Direction.Up)} disabled={autoPlay}>
              위
            </Button>
            <Button variant="secondary" onClick={() => publicState && stepOnce(publicState.currentPlayer, Direction.Down)} disabled={autoPlay}>
              아래
            </Button>
            <Button variant="secondary" onClick={() => publicState && stepOnce(publicState.currentPlayer, Direction.Left)} disabled={autoPlay}>
              왼쪽
            </Button>
            <Button variant="secondary" onClick={() => publicState && stepOnce(publicState.currentPlayer, Direction.Right)} disabled={autoPlay}>
              오른쪽
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
