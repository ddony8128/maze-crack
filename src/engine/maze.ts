import type { Direction, MazeSpec, Position, WallKey } from './types';
import { EngineError, EngineErrorCode } from './errors';
import {
  applyDirection,
  areAdjacent,
  directionBetween,
  inBounds,
  isSamePos,
  posKey,
} from './coord';

export type MazeValidationResult = { ok: true } | { ok: false; reason: string };

export function makeWallKey(a: Position, b: Position): WallKey {
  if (a.row < b.row || (a.row === b.row && a.col < b.col)) {
    return `${a.row},${a.col}-${b.row},${b.col}`;
  }
  return `${b.row},${b.col}-${a.row},${a.col}`;
}

function bfs(start: Position, goal: Position, walls: WallKey[]): Position[] | null {
  const queue: Position[][] = [[start]];
  const seen = new Set<string>([posKey(start)]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const cur = path[path.length - 1]!;
    if (isSamePos(cur, goal)) return path;

    for (const dir of ['UP', 'DOWN', 'LEFT', 'RIGHT'] as Direction[]) {
      const next = applyDirection(cur, dir);
      if (!inBounds(next)) continue;
      if (seen.has(posKey(next))) continue;
      const wk = makeWallKey(cur, next);
      if (walls.includes(wk)) continue;
      seen.add(posKey(next));
      queue.push([...path, next]);
    }
  }

  return null;
}

export function hasPath(start: Position, goal: Position, walls: WallKey[]): boolean {
  return bfs(start, goal, walls) !== null;
}

export function getAllPossibleWalls(): WallKey[] {
  const result: WallKey[] = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (c < 4) result.push(makeWallKey({ row: r, col: c }, { row: r, col: c + 1 }));
      if (r < 4) result.push(makeWallKey({ row: r, col: c }, { row: r + 1, col: c }));
    }
  }
  return result;
}

export class Maze {
  readonly start: Position;
  readonly goal: Position;
  readonly walls: WallKey[];
  private readonly wallSet: Set<WallKey>;

  constructor(spec: MazeSpec) {
    const validation = Maze.validateSpec(spec);
    if (!validation.ok) {
      throw new EngineError(EngineErrorCode.InvalidMazeSpec, validation.reason);
    }
    this.start = spec.start;
    this.goal = spec.goal;
    this.walls = [...spec.walls];
    this.wallSet = new Set(this.walls);
  }

  static validateSpec(spec: MazeSpec): MazeValidationResult {
    if (isSamePos(spec.start, spec.goal)) {
      return { ok: false, reason: 'start and goal must be different' };
    }

    for (const w of spec.walls) {
      const m = /^(\d+),(\d+)-(\d+),(\d+)$/.exec(w);
      if (!m) return { ok: false, reason: `invalid wall key: ${w}` };
      const a: Position = { row: Number(m[1]), col: Number(m[2]) };
      const b: Position = { row: Number(m[3]), col: Number(m[4]) };
      if (!inBounds(a) || !inBounds(b)) return { ok: false, reason: `wall out of bounds: ${w}` };
      if (!areAdjacent(a, b)) return { ok: false, reason: `wall endpoints must be adjacent: ${w}` };
    }

    if (!hasPath(spec.start, spec.goal, spec.walls)) {
      return { ok: false, reason: 'no path from start to goal' };
    }

    return { ok: true };
  }

  hasWallBetween(a: Position, b: Position): boolean {
    if (!areAdjacent(a, b)) return false;
    return this.wallSet.has(makeWallKey(a, b));
  }

  canMove(
    from: Position,
    direction: Direction,
  ): { to: Position; barrier: 'boundary' | 'wall' | null; wallKey: WallKey | null } {
    const next = applyDirection(from, direction);
    if (!inBounds(next)) return { to: from, barrier: 'boundary', wallKey: null };

    const wk = makeWallKey(from, next);
    if (this.wallSet.has(wk)) return { to: from, barrier: 'wall', wallKey: wk };

    return { to: next, barrier: null, wallKey: null };
  }

  shortestKnownPath(from: Position, goal: Position, knownWalls: WallKey[]): Direction | null {
    const path = bfs(from, goal, knownWalls);
    if (!path || path.length < 2) return null;
    return directionBetween(path[0]!, path[1]!);
  }
}
