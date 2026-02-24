export type Position = { row: number; col: number };

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export const DIRECTIONS: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

export type PlayerId = 'P1' | 'P2';

export type GameMode = 'PVP' | 'PVE';

export type Difficulty = 'EASY' | 'HARD';

export type GamePhase = 'PLAY' | 'WIN';

export type WallKey = string;

export type MazeSpec = {
  start: Position;
  goal: Position;
  walls: WallKey[];
};

export type LogEntry = {
  playerId: PlayerId;
  direction: Direction;
  success: boolean;
  position: Position;
};

export type PublicGameState = {
  mode: GameMode;
  difficulty: Difficulty | null;
  phase: GamePhase;
  mazes: [MazeSpec, MazeSpec];
  positions: [Position, Position];
  currentTurn: PlayerId;
  discoveredWalls: [WallKey[], WallKey[]];
  visited: [string[], string[]];
  log: LogEntry[];
  winner: PlayerId | null;
  wallHitPending: boolean;
};
