import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Direction, MazeSpec, PublicGameState } from '@/engine/types';
import { MazeCrackGame } from '@/engine/game';
import MazeBuilder from '@/components/game/MazeBuilder';
import GameScreen from '@/components/game/GameScreen';
import { PassScreen, WinScreen } from '@/components/game/Screens';

export function TwoPlayerPage() {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<'BUILD_P1' | 'PASS' | 'BUILD_P2' | 'PLAY' | 'WIN'>('BUILD_P1');
  const [p1Maze, setP1Maze] = useState<MazeSpec | null>(null);
  const gameRef = useRef<MazeCrackGame | null>(null);
  const [gameState, setGameState] = useState<PublicGameState | null>(null);

  const startGame = useCallback((maze1: MazeSpec, maze2: MazeSpec) => {
    const game = new MazeCrackGame({
      mode: 'PVP',
      difficulty: null,
      p1Maze: maze1,
      p2Maze: maze2,
      startingPlayer: 'P1',
    });
    gameRef.current = game;
    setGameState(game.getPublicState());
    setPhase('PLAY');
  }, []);

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
        owner="P1"
        onComplete={(m) => {
          setP1Maze(m);
          setPhase('PASS');
        }}
        onBack={() => navigate('/')}
      />
    );
  }

  if (phase === 'PASS') {
    return <PassScreen onReady={() => setPhase('BUILD_P2')} />;
  }

  if (phase === 'BUILD_P2') {
    return (
      <MazeBuilder
        owner="P2"
        onComplete={(m) => {
          if (p1Maze) startGame(p1Maze, m);
        }}
        onBack={() => navigate('/')}
      />
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
