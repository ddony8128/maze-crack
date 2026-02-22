import type { Barrier, Cell, Direction, MazeSpec, MazeWall } from './types';
import { EngineError, EngineErrorCode } from './errors';
import { areAdjacent, cellKey, isSameCell, moveCell } from './coord';

function wallKey(a: Cell, b: Cell): string {
  const ka = cellKey(a);
  const kb = cellKey(b);
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
}

export type MazeValidationResult = { ok: true } | { ok: false; reason: string };

export class Maze {
  readonly start: Cell;
  readonly goal: Cell;

  private readonly wallKeys: Set<string>;
  private readonly wallsByKey: Map<string, MazeWall>;

  constructor(spec: MazeSpec) {
    const validation = Maze.validateSpec(spec);
    if (!validation.ok) {
      throw new EngineError(EngineErrorCode.InvalidMazeSpec, validation.reason);
    }

    this.start = spec.start;
    this.goal = spec.goal;

    this.wallKeys = new Set<string>();
    this.wallsByKey = new Map<string, MazeWall>();
    for (const w of spec.walls) {
      const k = wallKey(w.a, w.b);
      if (!this.wallKeys.has(k)) {
        this.wallKeys.add(k);
        this.wallsByKey.set(k, w);
      }
    }
  }

  static validateSpec(spec: MazeSpec): MazeValidationResult {
    if (isSameCell(spec.start, spec.goal)) {
      return { ok: false, reason: 'start and goal must be different' };
    }

    for (const w of spec.walls) {
      if (!areAdjacent(w.a, w.b)) {
        return {
          ok: false,
          reason: `wall endpoints must be adjacent: ${cellKey(w.a)}-${cellKey(w.b)}`,
        };
      }
    }

    // Start must not be isolated (has at least one possible move).
    const neighbors: Array<Cell | null> = (['up', 'down', 'left', 'right'] as Direction[]).map(
      (dir) => moveCell(spec.start, dir),
    );

    const hasAnyOpenNeighbor = neighbors.some((to) => {
      if (!to) return false;
      const k = wallKey(spec.start, to);
      return !spec.walls.some((w) => wallKey(w.a, w.b) === k);
    });

    if (!hasAnyOpenNeighbor) {
      return { ok: false, reason: 'start is isolated' };
    }

    // Path existence: BFS over grid with walls.
    const wallSet = new Set(spec.walls.map((w) => wallKey(w.a, w.b)));
    const visited = new Set<string>();
    const queue: Cell[] = [spec.start];
    visited.add(cellKey(spec.start));

    while (queue.length > 0) {
      const cur = queue.shift()!;
      if (isSameCell(cur, spec.goal)) {
        return { ok: true };
      }

      for (const dir of ['up', 'down', 'left', 'right'] as Direction[]) {
        const nxt = moveCell(cur, dir);
        if (!nxt) continue;
        const k = wallKey(cur, nxt);
        if (wallSet.has(k)) continue;
        const nk = cellKey(nxt);
        if (visited.has(nk)) continue;
        visited.add(nk);
        queue.push(nxt);
      }
    }

    return { ok: false, reason: 'no path from start to goal' };
  }

  hasWallBetween(a: Cell, b: Cell): boolean {
    if (!areAdjacent(a, b)) return false;
    return this.wallKeys.has(wallKey(a, b));
  }

  canMove(from: Cell, direction: Direction): { to: Cell; barrier: Barrier | null } {
    const next = moveCell(from, direction);
    if (!next) {
      return { to: from, barrier: { type: 'boundary', from, direction } };
    }

    const k = wallKey(from, next);
    if (this.wallKeys.has(k)) {
      return {
        to: from,
        barrier: { type: 'wall', wall: this.wallsByKey.get(k) ?? { a: from, b: next } },
      };
    }

    return { to: next, barrier: null };
  }
}
