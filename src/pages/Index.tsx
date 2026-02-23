import { useEffect, useReducer, useState } from 'react';
import type {
  Difficulty,
  Direction,
  GamePhase,
  GameMode,
  GameState,
  LogEntry,
  Maze,
  Player,
  Position,
} from '@/types/game';
import { applyDirection, generateAIMaze, inBounds, makeWallKey, posKey } from '@/utils/maze';
import { DifficultySelect, HomeScreen, PassScreen, WinScreen } from '@/components/game/Screens';
import MazeBuilder from '@/components/game/MazeBuilder';
import GameScreen from '@/components/game/GameScreen';
import Tutorial from '@/components/game/Tutorial';
import { Loader2 } from 'lucide-react';

const initialState: GameState = {
  mode: null,
  phase: 'HOME',
  difficulty: null,
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
  | { type: 'SET_MODE'; mode: GameMode }
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'SUBMIT_MAZE'; maze: Maze }
  | { type: 'PASS_READY' }
  | { type: 'AI_READY'; maze: Maze }
  | { type: 'MOVE'; direction: Direction }
  | { type: 'CONFIRM_WALL_HIT' }
  | { type: 'TUTORIAL_NEXT' }
  | { type: 'TUTORIAL_PREV' }
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
    case 'SET_MODE': {
      if (action.mode === 'PVP') return { ...state, mode: 'PVP', phase: 'BUILD_P1' };
      if (action.mode === 'PVE') return { ...state, mode: 'PVE', phase: 'DIFFICULTY' };
      return { ...state, mode: 'TUTORIAL', phase: 'TUTORIAL', tutorialStep: 0 };
    }

    case 'SET_DIFFICULTY':
      return { ...state, difficulty: action.difficulty, phase: 'BUILD_P1' };

    case 'SUBMIT_MAZE': {
      if (state.phase === 'BUILD_P1') {
        const mazes: [Maze | null, Maze | null] = [action.maze, state.mazes[1]];
        if (state.mode === 'PVP') return { ...state, mazes, phase: 'PASS' };
        return { ...state, mazes, phase: 'AI_BUILD' };
      }
      if (state.phase === 'BUILD_P2') {
        const mazes: [Maze | null, Maze | null] = [state.mazes[0], action.maze];
        return { ...state, ...startPlay(mazes) };
      }
      return state;
    }

    case 'PASS_READY':
      return { ...state, phase: 'BUILD_P2' };

    case 'AI_READY': {
      const mazes: [Maze | null, Maze | null] = [state.mazes[0], action.maze];
      return { ...state, ...startPlay(mazes) };
    }

    case 'MOVE': {
      if (state.wallHitPending) return state;

      const isP1 = state.currentTurn === 'P1';
      const idx = isP1 ? 0 : 1;
      const mazeIdx = isP1 ? 1 : 0;
      const maze = state.mazes[mazeIdx]!;
      const pos = state.positions[idx]!;
      const np = applyDirection(pos, action.direction);

      const playerLabel = state.mode === 'PVE' ? (isP1 ? 'Player' : 'AI') : state.currentTurn;
      const logEntryFail: LogEntry = {
        player: playerLabel,
        direction: action.direction,
        success: false,
        position: pos,
      };

      if (!inBounds(np)) {
        return {
          ...state,
          wallHitPending: true,
          log: [...state.log, logEntryFail],
        };
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
        currentTurn: state.currentTurn,
        winner: isWin ? state.currentTurn : null,
        phase: isWin ? 'WIN' : 'PLAY',
        log: [...state.log, logEntryOk],
      };
    }

    case 'CONFIRM_WALL_HIT': {
      const isP1 = state.currentTurn === 'P1';
      return {
        ...state,
        wallHitPending: false,
        currentTurn: isP1 ? 'P2' : 'P1',
      };
    }

    case 'TUTORIAL_NEXT':
      return { ...state, tutorialStep: state.tutorialStep + 1 };
    case 'TUTORIAL_PREV':
      return { ...state, tutorialStep: Math.max(0, state.tutorialStep - 1) };
    case 'GO_HOME':
      return { ...initialState };
    default:
      return state;
  }
}

function AIBuildScreen({
  difficulty,
  onComplete,
}: {
  difficulty: Difficulty;
  onComplete: (m: Maze) => void;
}) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const maze = generateAIMaze(difficulty);
    const t = window.setTimeout(() => {
      setDone(true);
      onComplete(maze);
    }, 1800);
    return () => window.clearTimeout(t);
  }, [difficulty, onComplete]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <Loader2 className="text-primary h-12 w-12 animate-spin" />
      <h2 className="neon-text text-primary text-xl font-bold">AI가 미로를 제작 중...</h2>
      <p className="text-muted-foreground text-sm">{done ? '완료!' : '벽을 배치하고 있습니다'}</p>
    </div>
  );
}

export default function Index() {
  const [state, dispatch] = useReducer(reducer, initialState);

  switch (state.phase) {
    case 'HOME':
      return <HomeScreen onSelectMode={(m) => dispatch({ type: 'SET_MODE', mode: m })} />;
    case 'DIFFICULTY':
      return (
        <DifficultySelect
          onSelect={(d) => dispatch({ type: 'SET_DIFFICULTY', difficulty: d })}
          onBack={() => dispatch({ type: 'GO_HOME' })}
        />
      );
    case 'BUILD_P1':
      return (
        <MazeBuilder
          owner={state.mode === 'PVE' ? 'Player' : 'P1'}
          onComplete={(m) => dispatch({ type: 'SUBMIT_MAZE', maze: m })}
        />
      );
    case 'PASS':
      return <PassScreen onReady={() => dispatch({ type: 'PASS_READY' })} />;
    case 'BUILD_P2':
      return (
        <MazeBuilder owner="P2" onComplete={(m) => dispatch({ type: 'SUBMIT_MAZE', maze: m })} />
      );
    case 'AI_BUILD':
      return (
        <AIBuildScreen
          difficulty={state.difficulty!}
          onComplete={(m) => dispatch({ type: 'AI_READY', maze: m })}
        />
      );
    case 'PLAY':
      return (
        <GameScreen
          state={state}
          onMove={(d) => dispatch({ type: 'MOVE', direction: d })}
          onHome={() => dispatch({ type: 'GO_HOME' })}
          onConfirmWallHit={() => dispatch({ type: 'CONFIRM_WALL_HIT' })}
        />
      );
    case 'WIN':
      return (
        <WinScreen
          winner={state.winner!}
          mode={state.mode!}
          mazes={state.mazes}
          onRestart={() => dispatch({ type: 'GO_HOME' })}
        />
      );
    case 'TUTORIAL':
      return (
        <Tutorial
          step={state.tutorialStep}
          onNext={() => dispatch({ type: 'TUTORIAL_NEXT' })}
          onPrev={() => dispatch({ type: 'TUTORIAL_PREV' })}
          onHome={() => dispatch({ type: 'GO_HOME' })}
          onStartPVP={() => dispatch({ type: 'SET_MODE', mode: 'PVP' })}
          onStartPVE={() => dispatch({ type: 'SET_MODE', mode: 'PVE' })}
        />
      );
    default:
      return null;
  }
}
