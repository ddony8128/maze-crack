import type { Direction, Position } from './types';

export function posKey(p: Position): string {
  return `${p.row},${p.col}`;
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

export function isSamePos(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

export function areAdjacent(a: Position, b: Position): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}
