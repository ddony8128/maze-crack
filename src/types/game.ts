export type Position = { row: number; col: number };
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type GameMode = 'PVP' | 'PVE' | 'TUTORIAL';
export type Difficulty = 'EASY' | 'HARD';
export type Player = 'P1' | 'P2';
export type BuilderTool = 'START' | 'GOAL' | 'WALL';
export type GamePhase =
  | 'HOME'
  | 'DIFFICULTY'
  | 'BUILD_P1'
  | 'PASS'
  | 'BUILD_P2'
  | 'AI_BUILD'
  | 'PLAY'
  | 'WIN'
  | 'TUTORIAL';

export interface Maze {
  start: Position;
  goal: Position;
  walls: string[];
}

export interface LogEntry {
  player: string;
  direction: Direction;
  success: boolean;
  position: Position;
}

export interface GameState {
  mode: GameMode | null;
  phase: GamePhase;
  difficulty: Difficulty | null;
  mazes: [Maze | null, Maze | null];
  positions: [Position | null, Position | null];
  currentTurn: Player;
  discoveredWalls: [string[], string[]];
  visited: [string[], string[]];
  log: LogEntry[];
  winner: Player | null;
  tutorialStep: number;
  wallHitPending: boolean;
}
