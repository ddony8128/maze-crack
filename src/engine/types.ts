/**
 * Maze Crack 엔진이 노출하는 타입들.
 *
 * UI는 이 타입들만 사용하고, 페이지/컴포넌트 내부에 규칙(이동/벽/승리/턴)을
 * 직접 구현하지 않도록 한다.
 *
 * 좌표/벽 표기는 `ui_sample`과 동일:
 * - Position: 0..4 인덱스 기반
 * - Direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
 * - WallKey: "r1,c1-r2,c2" (정렬된 키)
 */

export type Position = { row: number; col: number };

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

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
