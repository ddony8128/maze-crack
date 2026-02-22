import { Col, Row, type Cell, type Direction } from './types';

export const ROWS_IN_ORDER: Row[] = [Row.A, Row.B, Row.C, Row.D, Row.E];
export const COLS_IN_ORDER: Col[] = [Col.C1, Col.C2, Col.C3, Col.C4, Col.C5];

export function rowToIndex(row: Row): number {
  return ROWS_IN_ORDER.indexOf(row);
}

export function indexToRow(index: number): Row | null {
  return index >= 0 && index < ROWS_IN_ORDER.length ? ROWS_IN_ORDER[index]! : null;
}

export function colToIndex(col: Col): number {
  return COLS_IN_ORDER.indexOf(col);
}

export function indexToCol(index: number): Col | null {
  return index >= 0 && index < COLS_IN_ORDER.length ? COLS_IN_ORDER[index]! : null;
}

export function cellKey(cell: Cell): string {
  return `${cell.row}${cell.col}`;
}

export function isSameCell(a: Cell, b: Cell): boolean {
  return a.row === b.row && a.col === b.col;
}

export function moveCell(cell: Cell, direction: Direction): Cell | null {
  const r = rowToIndex(cell.row);
  const c = colToIndex(cell.col);

  let nr = r;
  let nc = c;
  switch (direction) {
    case 'up':
      nr = r - 1;
      break;
    case 'down':
      nr = r + 1;
      break;
    case 'left':
      nc = c - 1;
      break;
    case 'right':
      nc = c + 1;
      break;
    default:
      return null;
  }

  const nextRow = indexToRow(nr);
  const nextCol = indexToCol(nc);
  if (!nextRow || !nextCol) return null;
  return { row: nextRow, col: nextCol };
}

export function areAdjacent(a: Cell, b: Cell): boolean {
  const ar = rowToIndex(a.row);
  const ac = colToIndex(a.col);
  const br = rowToIndex(b.row);
  const bc = colToIndex(b.col);
  if (ar < 0 || ac < 0 || br < 0 || bc < 0) return false;
  const dr = Math.abs(ar - br);
  const dc = Math.abs(ac - bc);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}
