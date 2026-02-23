import type { Difficulty, Direction, Maze, Position } from '@/types/game';

export function posKey(p: Position): string {
  return `${p.row},${p.col}`;
}

export function makeWallKey(a: Position, b: Position): string {
  if (a.row < b.row || (a.row === b.row && a.col < b.col)) {
    return `${a.row},${a.col}-${b.row},${b.col}`;
  }
  return `${b.row},${b.col}-${a.row},${a.col}`;
}

export function applyDirection(pos: Position, dir: Direction): Position {
  switch (dir) {
    case 'UP':
      return { row: pos.row - 1, col: pos.col };
    case 'DOWN':
      return { row: pos.row + 1, col: pos.col };
    case 'LEFT':
      return { row: pos.row, col: pos.col - 1 };
    case 'RIGHT':
      return { row: pos.row, col: pos.col + 1 };
  }
}

export function inBounds(p: Position): boolean {
  return p.row >= 0 && p.row < 5 && p.col >= 0 && p.col < 5;
}

export function directionBetween(from: Position, to: Position): Direction {
  if (to.row < from.row) return 'UP';
  if (to.row > from.row) return 'DOWN';
  if (to.col < from.col) return 'LEFT';
  return 'RIGHT';
}

function bfs(start: Position, goal: Position, walls: string[]): Position[] | null {
  const queue: Position[][] = [[start]];
  const seen = new Set<string>([posKey(start)]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const cur = path[path.length - 1]!;
    if (cur.row === goal.row && cur.col === goal.col) return path;

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

export function hasPath(start: Position, goal: Position, walls: string[]): boolean {
  return bfs(start, goal, walls) !== null;
}

export function getAllPossibleWalls(): string[] {
  const result: string[] = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (c < 4) result.push(makeWallKey({ row: r, col: c }, { row: r, col: c + 1 }));
      if (r < 4) result.push(makeWallKey({ row: r, col: c }, { row: r + 1, col: c }));
    }
  }
  return result;
}

export function generateAIMaze(difficulty: Difficulty): Maze {
  let start: Position;
  let goal: Position;

  if (difficulty === 'EASY') {
    start = { row: 0, col: 0 };
    goal = { row: 4, col: 4 };
  } else {
    start = { row: Math.floor(Math.random() * 5), col: Math.floor(Math.random() * 5) };
    do {
      goal = { row: Math.floor(Math.random() * 5), col: Math.floor(Math.random() * 5) };
    } while (goal.row === start.row && goal.col === start.col);
  }

  const targetWalls = difficulty === 'EASY' ? 8 : 16;
  const all = getAllPossibleWalls().sort(() => Math.random() - 0.5);

  const walls: string[] = [];
  for (const w of all) {
    if (walls.length >= targetWalls) break;
    walls.push(w);
    if (!hasPath(start, goal, walls)) walls.pop();
  }

  return { start, goal, walls };
}

export function aiChooseDirection(
  pos: Position,
  goal: Position,
  discoveredWalls: string[],
  difficulty: Difficulty,
): Direction {
  const dirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  const validDirs = dirs.filter((d) => inBounds(applyDirection(pos, d)));

  if (difficulty === 'EASY') {
    return validDirs[Math.floor(Math.random() * validDirs.length)]!;
  }

  const path = bfs(pos, goal, discoveredWalls);
  if (path && path.length > 1) {
    return directionBetween(path[0]!, path[1]!);
  }

  const safe = validDirs.filter((d) => {
    const np = applyDirection(pos, d);
    return !discoveredWalls.includes(makeWallKey(pos, np));
  });
  if (safe.length > 0) return safe[Math.floor(Math.random() * safe.length)]!;

  return validDirs[Math.floor(Math.random() * validDirs.length)]!;
}

export const ROW_LABELS = ['A', 'B', 'C', 'D', 'E'] as const;

export function posLabel(p: Position): string {
  return `${ROW_LABELS[p.row]}${p.col + 1}`;
}

export const DIR_LABELS: Record<Direction, string> = {
  UP: '↑',
  DOWN: '↓',
  LEFT: '←',
  RIGHT: '→',
};
