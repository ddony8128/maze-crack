import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Direction, MazeSpec, PublicGameState } from '@/engine/types';
import { MazeCrackGame } from '@/engine/game';
import MazeBuilder from '@/components/game/MazeBuilder';
import GameScreen from '@/components/game/GameScreen';
import { PassScreen, WinScreen } from '@/components/game/Screens';
import { Button } from '@/components/ui/button';
import { Swords } from 'lucide-react';

export function TwoPlayerPage() {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<'DUEL_SETUP' | 'BUILD_P1' | 'PASS' | 'BUILD_P2' | 'PLAY' | 'WIN'>('DUEL_SETUP');
  const [p1Name, setP1Name] = useState('');
  const [p2Name, setP2Name] = useState('');
  const [p1Maze, setP1Maze] = useState<MazeSpec | null>(null);
  const gameRef = useRef<MazeCrackGame | null>(null);
  const [gameState, setGameState] = useState<PublicGameState | null>(null);

  const playerNames: [string, string] = [p1Name || 'P1', p2Name || 'P2'];

  const startGame = useCallback((maze1: MazeSpec, maze2: MazeSpec) => {
    const game = new MazeCrackGame({
      mode: 'PVP',
      difficulty: null,
      p1Maze: maze1,
      p2Maze: maze2,
      startingPlayer: 'P1',
      memoryMode: true,
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

  if (phase === 'DUEL_SETUP') {
    const canStart = p1Name.trim() !== '' && p2Name.trim() !== '';
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-5 py-14 sm:px-8 sm:py-20">
        <div className="text-center">
          <Swords className="text-accent mx-auto mb-4 h-14 w-14 sm:h-16 sm:w-16" />
          <h2 className="neon-text text-foreground mb-2 text-[clamp(1.75rem,6vw,2.5rem)] font-bold">
            결투 신청
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            추리와 탐색 — 메이즈 크랙
          </p>
        </div>

        <div className="flex w-[clamp(260px,80vw,400px)] flex-col gap-5">
          <div>
            <label className="text-primary mb-1 block text-sm font-medium">도전자 (미로 제작 먼저)</label>
            <input
              type="text"
              placeholder="이름 입력"
              value={p1Name}
              onChange={(e) => setP1Name(e.target.value)}
              className="border-primary/30 bg-background text-foreground placeholder:text-muted-foreground focus:border-primary w-full rounded-md border px-4 py-3 text-lg outline-none"
              autoFocus
            />
          </div>
          <div className="text-muted-foreground text-center text-lg">에게 결투 신청</div>
          <div>
            <label className="text-accent mb-1 block text-sm font-medium">상대</label>
            <input
              type="text"
              placeholder="이름 입력"
              value={p2Name}
              onChange={(e) => setP2Name(e.target.value)}
              className="border-accent/30 bg-background text-foreground placeholder:text-muted-foreground focus:border-accent w-full rounded-md border px-4 py-3 text-lg outline-none"
            />
          </div>
        </div>

        <Button
          size="lg"
          className="neon-glow bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
          disabled={!canStart}
          onClick={() => setPhase('BUILD_P1')}
        >
          결투 시작
        </Button>
        <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => navigate('/')}
        >
          돌아가기
        </Button>
      </div>
    );
  }

  if (phase === 'BUILD_P1') {
    return (
      <MazeBuilder
        owner="P1"
        ownerName={playerNames[0]}
        onComplete={(m) => {
          setP1Maze(m);
          setPhase('PASS');
        }}
        onBack={() => navigate('/')}
      />
    );
  }

  if (phase === 'PASS') {
    return <PassScreen playerNames={playerNames} onReady={() => setPhase('BUILD_P2')} />;
  }

  if (phase === 'BUILD_P2') {
    return (
      <MazeBuilder
        owner="P2"
        ownerName={playerNames[1]}
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
        finalState={gameState}
        playerNames={playerNames}
        onRestart={() => {
          gameRef.current = null;
          setGameState(null);
          setP1Maze(null);
          setPhase('DUEL_SETUP');
        }}
        onHome={() => navigate('/')}
      />
    );
  }

  if (!gameState) return null;

  return (
    <GameScreen
      state={gameState}
      playerNames={playerNames}
      onMove={handleMove}
      onHome={() => navigate('/')}
      onConfirmWallHit={handleConfirmWallHit}
    />
  );
}
