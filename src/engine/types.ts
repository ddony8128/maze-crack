export const difficultyLevel = {
  Easy: 'Easy',
  Hard: 'Hard',
} as const;

export type DifficultyLevel = (typeof difficultyLevel)[keyof typeof difficultyLevel];

export const PlayerId = {
  P1: 'p1',
  P2: 'p2',
} as const;

export type PlayerId = (typeof PlayerId)[keyof typeof PlayerId];

export const Direction = {
  Up: 'up',
  Down: 'down',
  Left: 'left',
  Right: 'right',
} as const;

export type Direction = (typeof Direction)[keyof typeof Direction];

export const Row = {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
  E: 'E',
} as const;

export type Row = (typeof Row)[keyof typeof Row];

export const Col = {
  C1: 1,
  C2: 2,
  C3: 3,
  C4: 4,
  C5: 5,
} as const;

export type Col = (typeof Col)[keyof typeof Col];

export type Cell = {
  row: Row;
  col: Col;
};

export type MazeWall = {
  a: Cell;
  b: Cell;
};

export type MazeSpec = {
  start: Cell;
  goal: Cell;
  walls: MazeWall[];
};

export const GamePhase = {
  InProgress: 'in_progress',
  Finished: 'finished',
} as const;

export type GamePhase = (typeof GamePhase)[keyof typeof GamePhase];

export type PublicGameState = {
  phase: GamePhase;
  currentPlayer: PlayerId;
  winner: PlayerId | null;
  tokenPositions: Record<PlayerId, Cell>;
  opponentStart: Record<PlayerId, Cell>;
  opponentGoal: Record<PlayerId, Cell>;
  turn: number;
};

export type Barrier =
  | { type: 'wall'; wall: MazeWall }
  | { type: 'boundary'; from: Cell; direction: Direction };

export type TurnResult = {
  turn: number;
  player: PlayerId;
  direction: Direction;
  from: Cell;
  to: Cell;
  moved: boolean;
  hitBarrier: boolean;
  barrier: Barrier | null;
  nextPlayer: PlayerId;
  didWin: boolean;
  winner: PlayerId | null;
};
