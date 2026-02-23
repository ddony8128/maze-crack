import type { Difficulty, Direction, MazeSpec, Position, WallKey } from './types';
import { applyDirection, directionBetween, inBounds, posKey } from './coord';
import { getAllPossibleWalls, hasPath, makeWallKey } from './maze';

function bfs(start: Position, goal: Position, walls: WallKey[]): Position[] | null {
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

export function generateAIMaze(difficulty: Difficulty): MazeSpec {
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

  const walls: WallKey[] = [];
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
  discoveredWalls: WallKey[],
  difficulty: Difficulty,
): Direction {
  const dirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  const validDirs = dirs.filter((d) => inBounds(applyDirection(pos, d)));
  if (validDirs.length === 0) return 'UP';

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
