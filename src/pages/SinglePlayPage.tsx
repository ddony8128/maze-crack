import { useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type {
  Difficulty,
  Direction,
  GamePhase,
  GameState,
  LogEntry,
  Maze,
  Player,
  Position,
} from '@/types/game';
import { applyDirection, generateAIMaze, inBounds, makeWallKey, posKey } from '@/utils/maze';
import GameScreen from '@/components/game/GameScreen';
import MazeBuilder from '@/components/game/MazeBuilder';
import { WinScreen } from '@/components/game/Screens';

export function SinglePlayPage() {
  const { difficulty } = useParams<{ difficulty: string }>();
  const navigate = useNavigate();

  const resolvedDifficulty: Difficulty = difficulty === 'hard' ? 'HARD' : 'EASY';

  const initialState: GameState = {
    mode: 'PVE',
    phase: 'BUILD_P1',
    difficulty: resolvedDifficulty,
    mazes: [null, null],
    positions: [null, null],
    currentTurn: 'P1',
    discoveredWalls: [[], []],
    visited: [[], []],
    log: [],
    winner: null,
    tutorialStep: 0,
    wallHitPending: false,
  };

  type Action =
    | { type: 'SUBMIT_MAZE_P1'; maze: Maze }
    | { type: 'AI_READY'; maze: Maze }
    | { type: 'MOVE'; direction: Direction }
    | { type: 'CONFIRM_WALL_HIT' }
    | { type: 'GO_HOME' };

  function startPlay(mazes: [Maze | null, Maze | null]): Partial<GameState> {
    const p1OpponentMaze = mazes[1]!;
    const p2OpponentMaze = mazes[0]!;
    return {
      mazes,
      phase: 'PLAY' as GamePhase,
      currentTurn: 'P1' as Player,
      positions: [p1OpponentMaze.start, p2OpponentMaze.start],
      visited: [[posKey(p1OpponentMaze.start)], [posKey(p2OpponentMaze.start)]],
      discoveredWalls: [[], []],
      log: [],
      winner: null,
      wallHitPending: false,
    };
  }

  function reducer(state: GameState, action: Action): GameState {
    switch (action.type) {
      case 'SUBMIT_MAZE_P1': {
        const mazes: [Maze | null, Maze | null] = [action.maze, state.mazes[1]];
        return { ...state, mazes, phase: 'AI_BUILD' };
      }
      case 'AI_READY': {
        const mazes: [Maze | null, Maze | null] = [state.mazes[0], action.maze];
        return { ...state, ...startPlay(mazes) };
      }
      case 'MOVE': {
        if (state.wallHitPending) return state;
        if (state.phase !== 'PLAY') return state;

        const isP1 = state.currentTurn === 'P1';
        const idx = isP1 ? 0 : 1;
        const mazeIdx = isP1 ? 1 : 0;
        const maze = state.mazes[mazeIdx]!;
        const pos = state.positions[idx]!;
        const np = applyDirection(pos, action.direction);

        const playerLabel = isP1 ? 'Player' : 'AI';
        const logEntryFail: LogEntry = {
          player: playerLabel,
          direction: action.direction,
          success: false,
          position: pos,
        };

        if (!inBounds(np)) {
          return { ...state, wallHitPending: true, log: [...state.log, logEntryFail] };
        }

        const wk = makeWallKey(pos, np);
        if (maze.walls.includes(wk)) {
          const dw: [string[], string[]] = [
            idx === 0
              ? state.discoveredWalls[0].includes(wk)
                ? state.discoveredWalls[0]
                : [...state.discoveredWalls[0], wk]
              : state.discoveredWalls[0],
            idx === 1
              ? state.discoveredWalls[1].includes(wk)
                ? state.discoveredWalls[1]
                : [...state.discoveredWalls[1], wk]
              : state.discoveredWalls[1],
          ];
          return {
            ...state,
            discoveredWalls: dw,
            wallHitPending: true,
            log: [...state.log, logEntryFail],
          };
        }

        const newPositions: [Position | null, Position | null] = [
          state.positions[0],
          state.positions[1],
        ];
        newPositions[idx] = np;

        const newVisited: [string[], string[]] = [state.visited[0], state.visited[1]];
        newVisited[idx] = [...newVisited[idx], posKey(np)];

        const isWin = np.row === maze.goal.row && np.col === maze.goal.col;

        const logEntryOk: LogEntry = {
          player: playerLabel,
          direction: action.direction,
          success: true,
          position: np,
        };

        return {
          ...state,
          positions: newPositions,
          visited: newVisited,
          winner: isWin ? state.currentTurn : null,
          phase: isWin ? 'WIN' : 'PLAY',
          log: [...state.log, logEntryOk],
        };
      }
      case 'CONFIRM_WALL_HIT': {
        const isP1 = state.currentTurn === 'P1';
        return { ...state, wallHitPending: false, currentTurn: isP1 ? 'P2' : 'P1' };
      }
      case 'GO_HOME':
        return { ...initialState, phase: 'BUILD_P1' };
      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  const [aiBuildDone, setAiBuildDone] = useState(false);

  useEffect(() => {
    if (state.phase !== 'AI_BUILD') return;
    setAiBuildDone(false);
    const maze = generateAIMaze(state.difficulty!);
    const t = window.setTimeout(() => {
      setAiBuildDone(true);
      dispatch({ type: 'AI_READY', maze });
    }, 1800);
    return () => window.clearTimeout(t);
  }, [state.phase, state.difficulty]);

  if (state.phase === 'BUILD_P1') {
    return (
      <MazeBuilder
        owner="Player"
        onComplete={(m) => dispatch({ type: 'SUBMIT_MAZE_P1', maze: m })}
        onBack={() => navigate('/')}
      />
    );
  }

  if (state.phase === 'AI_BUILD') {
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

  if (state.phase === 'WIN') {
    return (
      <WinScreen
        winner={state.winner!}
        mode={state.mode!}
        mazes={state.mazes}
        onRestart={() => navigate('/')}
      />
    );
  }

  return (
    <GameScreen
      state={state}
      onMove={(d) => dispatch({ type: 'MOVE', direction: d })}
      onHome={() => navigate('/')}
      onConfirmWallHit={() => dispatch({ type: 'CONFIRM_WALL_HIT' })}
    />
  );
}
