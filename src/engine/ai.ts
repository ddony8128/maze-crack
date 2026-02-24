import { DIRECTIONS } from './types';
import type { Difficulty, Direction, MazeSpec, Position, WallKey } from './types';
import { applyDirection, inBounds, posKey } from './coord';
import { getAllPossibleWalls, hasPath, makeWallKey } from './maze';

const GRID_SIZE = 5;

const EASY_WALL_COUNT = 16;

const HARD_EXPLORE_TARGET_PROB = 0.5;
const HARD_FRONTIER_JUMP_PROB = 0.25;

function randInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

function randomChoice<T>(arr: readonly T[]): T {
  return arr[randInt(arr.length)]!;
}

export class MazeAI {
  constructor(private readonly difficulty: Difficulty) {}

  private currentRoute: Direction[] = [];
  private routeIndex = 0;

  private readonly knownWalls = new Set<WallKey>();
  private readonly knownOpen = new Set<WallKey>();

  private lastFrom: Position | null = null;
  private lastExpectedTo: Position | null = null;

  private readonly visitedCells = new Set<string>();

  reset() {
    this.currentRoute = [];
    this.routeIndex = 0;
    this.knownWalls.clear();
    this.knownOpen.clear();
    this.lastFrom = null;
    this.lastExpectedTo = null;
    this.visitedCells.clear();
  }

  chooseDirection(pos: Position, goal: Position, discoveredWalls: WallKey[]): Direction {
    this.observe(pos, discoveredWalls);

    const validDirs = DIRECTIONS.filter((d) => inBounds(applyDirection(pos, d)));
    if (validDirs.length === 0) return 'UP';

    const next = this.nextDirectionFromRoute(pos);
    if (next) return next;

    const exploring = this.difficulty === 'HARD' && Math.random() < HARD_EXPLORE_TARGET_PROB;
    const target = exploring ? this.pickExplorationTarget(pos, goal) : goal;

    const route = this.findMinCostRoute(pos, target);
    if (!route || route.length === 0) {
      const safe = validDirs.filter((d) => !this.isKnownWall(pos, d));
      const pool = safe.length > 0 ? safe : validDirs;
      const dir = randomChoice(pool);
      this.rememberPlannedMove(pos, dir);
      return dir;
    }

    this.currentRoute = route;
    this.routeIndex = 0;
    const dir = this.currentRoute[this.routeIndex++]!;
    this.rememberPlannedMove(pos, dir);
    return dir;
  }

  private observe(pos: Position, discoveredWalls: WallKey[]) {
    const discoveredSet = new Set(discoveredWalls);

    for (const w of discoveredWalls) {
      this.knownWalls.add(w);
      this.knownOpen.delete(w);
    }

    this.visitedCells.add(posKey(pos));

    if (this.lastFrom && this.lastExpectedTo) {
      const sameAsFrom = pos.row === this.lastFrom.row && pos.col === this.lastFrom.col;
      const sameAsTo = pos.row === this.lastExpectedTo.row && pos.col === this.lastExpectedTo.col;

      if (sameAsTo) {
        const wk = makeWallKey(this.lastFrom, pos);
        if (!this.knownWalls.has(wk)) this.knownOpen.add(wk);
      } else if (sameAsFrom) {
        if (inBounds(this.lastExpectedTo)) {
          const wk = makeWallKey(this.lastFrom, this.lastExpectedTo);
          if (discoveredSet.has(wk)) {
            this.knownWalls.add(wk);
            this.knownOpen.delete(wk);
          }
        }
        this.currentRoute = [];
        this.routeIndex = 0;
      } else {
        this.currentRoute = [];
        this.routeIndex = 0;
      }

      this.lastFrom = null;
      this.lastExpectedTo = null;
    }
  }

  private rememberPlannedMove(from: Position, dir: Direction) {
    this.lastFrom = { ...from };
    this.lastExpectedTo = applyDirection(from, dir);
  }

  private isKnownWall(from: Position, dir: Direction): boolean {
    const to = applyDirection(from, dir);
    if (!inBounds(to)) return true;
    return this.knownWalls.has(makeWallKey(from, to));
  }

  private nextDirectionFromRoute(pos: Position): Direction | null {
    if (this.routeIndex >= this.currentRoute.length) return null;
    const dir = this.currentRoute[this.routeIndex]!;
    const to = applyDirection(pos, dir);
    if (!inBounds(to)) {
      this.currentRoute = [];
      this.routeIndex = 0;
      return null;
    }
    const wk = makeWallKey(pos, to);
    if (this.knownWalls.has(wk)) {
      this.currentRoute = [];
      this.routeIndex = 0;
      return null;
    }
    this.routeIndex++;
    this.rememberPlannedMove(pos, dir);
    return dir;
  }

  private pickExplorationTarget(pos: Position, fallbackGoal: Position): Position {
    const candidates: Position[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const cell: Position = { row: r, col: c };
        const k = posKey(cell);
        if (!this.visitedCells.has(k)) candidates.push(cell);
      }
    }
    if (candidates.length === 0) return fallbackGoal;

    const filtered = candidates.filter((p) => !(p.row === pos.row && p.col === pos.col));
    const pool = filtered.length > 0 ? filtered : candidates;
    return randomChoice(pool);
  }

  private findMinCostRoute(from: Position, to: Position): Direction[] | null {
    if (from.row === to.row && from.col === to.col) return [];

    type Parent = { prev: Position; dir: Direction };

    const distUnknown = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => Infinity),
    );
    const distSteps = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => Infinity),
    );
    const parents: Parent[][][] = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => []),
    );

    const dq: Position[] = [];
    distUnknown[from.row]![from.col]! = 0;
    distSteps[from.row]![from.col]! = 0;
    dq.push({ ...from });

    while (dq.length > 0) {
      const cur = dq.shift()!;
      const cu = distUnknown[cur.row]![cur.col]!;
      const cs = distSteps[cur.row]![cur.col]!;

      for (const dir of DIRECTIONS) {
        const next = applyDirection(cur, dir);
        if (!inBounds(next)) continue;

        const wk = makeWallKey(cur, next);
        if (this.knownWalls.has(wk)) continue;

        const edgeU = this.knownOpen.has(wk) ? 0 : 1;
        const nu = cu + edgeU;
        const ns = cs + 1;

        const prevBestU = distUnknown[next.row]![next.col]!;
        const prevBestS = distSteps[next.row]![next.col]!;

        if (nu < prevBestU || (nu === prevBestU && ns < prevBestS)) {
          distUnknown[next.row]![next.col]! = nu;
          distSteps[next.row]![next.col]! = ns;
          parents[next.row]![next.col]! = [{ prev: { ...cur }, dir }];
          if (edgeU === 0) dq.unshift({ ...next });
          else dq.push({ ...next });
        } else if (nu === prevBestU && ns === prevBestS) {
          parents[next.row]![next.col]!.push({ prev: { ...cur }, dir });
        }
      }
    }

    if (!Number.isFinite(distUnknown[to.row]![to.col]!)) return null;
    if (parents[to.row]![to.col]!.length === 0) return null;

    const reversed: Direction[] = [];
    let cur: Position = { ...to };
    while (!(cur.row === from.row && cur.col === from.col)) {
      const opts = parents[cur.row]![cur.col]!;
      if (opts.length === 0) return null;
      const pick = randomChoice(opts);
      reversed.push(pick.dir);
      cur = { ...pick.prev };
    }
    reversed.reverse();
    return reversed;
  }
}

export function generateAIMaze(difficulty: Difficulty): MazeSpec {
  if (difficulty === 'HARD') return generateAIHardMaze();
  return generateAIEasyMaze();
}

function randomCell(): Position {
  return { row: randInt(GRID_SIZE), col: randInt(GRID_SIZE) };
}

function neighbors(pos: Position): Position[] {
  const result: Position[] = [];
  for (const d of DIRECTIONS) {
    const np = applyDirection(pos, d);
    if (inBounds(np)) result.push(np);
  }
  return result;
}

function buildPerfectMazeHybridOpenEdges(pJump: number): Set<WallKey> {
  const visited = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => false),
  );
  const open = new Set<WallKey>();

  type FrontierEntry = { key: string; pos: Position };
  const frontier: FrontierEntry[] = [];
  const frontierIndex = new Map<string, number>();

  const removeFrontier = (key: string) => {
    const idx = frontierIndex.get(key);
    if (idx === undefined) return;
    const last = frontier.pop()!;
    frontierIndex.delete(key);
    if (idx < frontier.length) {
      frontier[idx] = last;
      frontierIndex.set(last.key, idx);
    }
  };

  const hasUnvisitedNeighbor = (pos: Position): boolean => {
    for (const n of neighbors(pos)) {
      if (!visited[n.row]![n.col]!) return true;
    }
    return false;
  };

  const syncFrontier = (pos: Position) => {
    const key = posKey(pos);
    if (!hasUnvisitedNeighbor(pos)) {
      removeFrontier(key);
      return;
    }
    if (frontierIndex.has(key)) return;
    frontierIndex.set(key, frontier.length);
    frontier.push({ key, pos: { ...pos } });
  };

  const seed = randomCell();
  visited[seed.row]![seed.col]! = true;

  let cur: Position = { ...seed };
  syncFrontier(cur);

  while (frontier.length > 0) {
    if (!hasUnvisitedNeighbor(cur) || Math.random() < pJump) {
      while (frontier.length > 0) {
        const pick = frontier[randInt(frontier.length)]!;
        if (hasUnvisitedNeighbor(pick.pos)) {
          cur = { ...pick.pos };
          break;
        }
        removeFrontier(pick.key);
      }
      if (frontier.length === 0) break;
    }

    const unvisited = neighbors(cur).filter((n) => !visited[n.row]![n.col]!);
    if (unvisited.length === 0) {
      syncFrontier(cur);
      continue;
    }

    const next = unvisited[randInt(unvisited.length)]!;
    open.add(makeWallKey(cur, next));
    visited[next.row]![next.col]! = true;

    syncFrontier(cur);
    syncFrontier(next);
    cur = { ...next };
  }

  return open;
}

function wallsFromOpenEdges(open: Set<WallKey>): WallKey[] {
  return getAllPossibleWalls().filter((w) => !open.has(w));
}

function degree(pos: Position, wallSet: Set<WallKey>): number {
  let deg = 0;
  for (const n of neighbors(pos)) {
    if (!wallSet.has(makeWallKey(pos, n))) deg++;
  }
  return deg;
}

function bfsDistancesOnOpenGraph(start: Position, wallSet: Set<WallKey>): number[][] {
  const dist = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => Infinity),
  );
  const q: Position[] = [start];
  dist[start.row]![start.col]! = 0;

  for (let qi = 0; qi < q.length; qi++) {
    const cur = q[qi]!;
    const cd = dist[cur.row]![cur.col]!;
    for (const n of neighbors(cur)) {
      if (wallSet.has(makeWallKey(cur, n))) continue;
      const nd = cd + 1;
      if (nd < dist[n.row]![n.col]!) {
        dist[n.row]![n.col]! = nd;
        q.push(n);
      }
    }
  }

  return dist;
}

function generateAIEasyMaze(): MazeSpec {
  const start: Position = { row: 0, col: 0 };
  const goal: Position = { row: 4, col: 4 };

  const targetWalls = EASY_WALL_COUNT;
  const all = getAllPossibleWalls().sort(() => Math.random() - 0.5);

  const walls: WallKey[] = [];
  for (const w of all) {
    if (walls.length >= targetWalls) break;
    walls.push(w);
    if (!hasPath(start, goal, walls)) walls.pop();
  }

  return { start, goal, walls };
}

function generateAIHardMaze(): MazeSpec {
  const pJump = HARD_FRONTIER_JUMP_PROB;
  const open = buildPerfectMazeHybridOpenEdges(pJump);
  const walls = wallsFromOpenEdges(open);
  const wallSet = new Set(walls);

  const start = randomCell();

  const deadends: Position[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell: Position = { row: r, col: c };
      if (degree(cell, wallSet) === 1) deadends.push(cell);
    }
  }

  const dist = bfsDistancesOnOpenGraph(start, wallSet);
  let maxD = -1;
  let candidates: Position[] = [];
  for (const d of deadends) {
    const dd = dist[d.row]![d.col]!;
    if (!Number.isFinite(dd)) continue;
    if (dd > maxD) {
      maxD = dd;
      candidates = [d];
    } else if (dd === maxD) {
      candidates.push(d);
    }
  }

  let goal: Position;
  if (candidates.length > 0) {
    goal = candidates[randInt(candidates.length)]!;
    if (goal.row === start.row && goal.col === start.col && candidates.length > 1) {
      do {
        goal = candidates[randInt(candidates.length)]!;
      } while (goal.row === start.row && goal.col === start.col);
    }
  } else {
    goal = randomCell();
    while (goal.row === start.row && goal.col === start.col) goal = randomCell();
  }

  return { start, goal, walls };
}
