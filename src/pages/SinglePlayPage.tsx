import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { Difficulty, Direction, MazeSpec, PublicGameState } from '@/engine/types';
import { generateAIMaze } from '@/engine/ai';
import { MazeCrackGame } from '@/engine/game';
import GameScreen from '@/components/game/GameScreen';
import MazeBuilder from '@/components/game/MazeBuilder';
import { WinScreen } from '@/components/game/Screens';

export function SinglePlayPage() {
  const { difficulty } = useParams<{ difficulty: string }>();
  const navigate = useNavigate();

  const resolvedDifficulty: Difficulty = difficulty === 'hard' ? 'HARD' : 'EASY';

  const [phase, setPhase] = useState<'BUILD_P1' | 'AI_BUILD' | 'PLAY' | 'WIN'>('BUILD_P1');
  const [playerMaze, setPlayerMaze] = useState<MazeSpec | null>(null);
  const [aiBuildDone, setAiBuildDone] = useState(false);
  const gameRef = useRef<MazeCrackGame | null>(null);
  const [gameState, setGameState] = useState<PublicGameState | null>(null);

  const startGame = useCallback(
    (p1Maze: MazeSpec, p2Maze: MazeSpec) => {
      const game = new MazeCrackGame({
        mode: 'PVE',
        difficulty: resolvedDifficulty,
        p1Maze,
        p2Maze,
        startingPlayer: 'P1',
      });
      gameRef.current = game;
      setGameState(game.getPublicState());
      setPhase('PLAY');
    },
    [resolvedDifficulty],
  );

  useEffect(() => {
    if (phase !== 'AI_BUILD') return;
    if (!playerMaze) return;
    setAiBuildDone(false);
    const maze = generateAIMaze(resolvedDifficulty);
    const t = window.setTimeout(() => {
      setAiBuildDone(true);
      startGame(playerMaze, maze);
    }, 1800);
    return () => window.clearTimeout(t);
  }, [phase, playerMaze, resolvedDifficulty, startGame]);

  const handleMove = useCallback((d: Direction) => {
    const game = gameRef.current;
    if (!game) return;
    setGameState(game.move(d));
  }, []);

  const handleConfirmWallHit = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;
    setGameState(game.confirmWallHit());
  }, []);

  useEffect(() => {
    if (!gameState) return;
    if (gameState.phase === 'WIN') setPhase('WIN');
  }, [gameState]);

  if (phase === 'BUILD_P1') {
    return (
      <MazeBuilder
        owner="Player"
        onComplete={(m) => {
          setPlayerMaze(m);
          setPhase('AI_BUILD');
        }}
        onBack={() => navigate('/')}
      />
    );
  }

  if (phase === 'AI_BUILD') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <Loader2 className="text-primary h-12 w-12 animate-spin" />
        <h2 className="neon-text text-primary text-xl font-bold">AI가 미로를 제작 중...</h2>
        <p className="text-muted-foreground text-sm">
          {aiBuildDone ? '완료!' : '벽을 배치하고 있습니다'}
        </p>
      </div>
    );
  }

  if (phase === 'WIN' && gameState) {
    return (
      <WinScreen
        winner={gameState.winner!}
        mode={gameState.mode}
        mazes={gameState.mazes}
        onRestart={() => navigate('/')}
      />
    );
  }

  if (!gameState) return null;

  return (
    <GameScreen
      state={gameState}
      onMove={handleMove}
      onHome={() => navigate('/')}
      onConfirmWallHit={handleConfirmWallHit}
    />
  );
}
