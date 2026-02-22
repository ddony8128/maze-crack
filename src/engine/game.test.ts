import { describe, expect, it } from 'vitest';
import { MazeCrackGame } from './game';
import { Maze } from './maze';
import { EngineErrorCode } from './errors';
import { Col, Direction, PlayerId, Row, type Cell, type MazeSpec, type MazeWall } from './types';

const cell = (row: Row, col: Col): Cell => ({ row, col });
const openMaze = (start: Cell, goal: Cell, walls: MazeWall[] = []): MazeSpec => ({
  start,
  goal,
  walls,
});
const wall = (a: Cell, b: Cell): MazeWall => ({ a, b });

describe('Maze (validation + movement)', () => {
  it('rejects start==goal', () => {
    expect(() => new Maze(openMaze(cell(Row.A, Col.C1), cell(Row.A, Col.C1)))).toThrowError(
      /start and goal/i,
    );
  });

  it('rejects isolated start', () => {
    const start = cell(Row.C, Col.C3);
    const goal = cell(Row.A, Col.C1);
    const spec = openMaze(start, goal, [
      wall(start, cell(Row.B, Col.C3)),
      wall(start, cell(Row.D, Col.C3)),
      wall(start, cell(Row.C, Col.C2)),
      wall(start, cell(Row.C, Col.C4)),
    ]);

    expect(() => new Maze(spec)).toThrowError(/isolated/i);
  });

  it('rejects maze with no path from start to goal', () => {
    const start = cell(Row.A, Col.C1);
    const goal = cell(Row.C, Col.C3);
    const spec = openMaze(start, goal, [
      wall(goal, cell(Row.B, Col.C3)),
      wall(goal, cell(Row.D, Col.C3)),
      wall(goal, cell(Row.C, Col.C2)),
      wall(goal, cell(Row.C, Col.C4)),
    ]);

    expect(() => new Maze(spec)).toThrowError(/no path/i);
  });

  it('blocks movement by explicit wall (bidirectional)', () => {
    const a = cell(Row.A, Col.C1);
    const b = cell(Row.A, Col.C2);
    const maze = new Maze(openMaze(cell(Row.B, Col.C2), cell(Row.E, Col.C5), [wall(a, b)]));

    const r1 = maze.canMove(a, Direction.Right);
    expect(r1.barrier?.type).toBe('wall');
    expect(r1.to).toEqual(a);

    const r2 = maze.canMove(b, Direction.Left);
    expect(r2.barrier?.type).toBe('wall');
    expect(r2.to).toEqual(b);
  });

  it('blocks movement by boundary', () => {
    const maze = new Maze(openMaze(cell(Row.B, Col.C2), cell(Row.E, Col.C5)));
    const from = cell(Row.A, Col.C1);
    const r = maze.canMove(from, Direction.Up);
    expect(r.barrier?.type).toBe('boundary');
    expect(r.to).toEqual(from);
  });
});

describe('MazeCrackGame (turns + win condition)', () => {
  const p1Maze = openMaze(cell(Row.B, Col.C2), cell(Row.E, Col.C5));
  const p2Maze = openMaze(cell(Row.A, Col.C1), cell(Row.E, Col.C1));

  it('initializes tokens at opponent start positions', () => {
    const game = new MazeCrackGame({ p1Maze, p2Maze, startingPlayer: PlayerId.P1 });
    const s = game.getPublicState();
    expect(s.tokenPositions[PlayerId.P1]).toEqual(p2Maze.start);
    expect(s.tokenPositions[PlayerId.P2]).toEqual(p1Maze.start);
  });

  it('enforces turn order', () => {
    const game = new MazeCrackGame({ p1Maze, p2Maze, startingPlayer: PlayerId.P1 });
    expect(() => game.applyTurn(PlayerId.P2, Direction.Down)).toThrowError(
      expect.objectContaining({ code: EngineErrorCode.NotYourTurn }),
    );
  });

  it('applies a successful move and switches player', () => {
    const game = new MazeCrackGame({ p1Maze, p2Maze, startingPlayer: PlayerId.P1 });
    const before = game.getPublicState();
    const res = game.applyTurn(PlayerId.P1, Direction.Down);

    expect(res.moved).toBe(true);
    expect(res.hitBarrier).toBe(false);

    const after = game.getPublicState();
    expect(after.currentPlayer).toBe(PlayerId.P2);
    expect(after.turn).toBe(before.turn + 1);
  });

  it('failed move (boundary) keeps position but still ends turn', () => {
    const game = new MazeCrackGame({ p1Maze, p2Maze, startingPlayer: PlayerId.P1 });
    const before = game.getPublicState();

    // p1 토큰은 p2 start(A1)에서 시작 → up은 경계 충돌
    const res = game.applyTurn(PlayerId.P1, Direction.Up);
    expect(res.moved).toBe(false);
    expect(res.hitBarrier).toBe(true);
    expect(res.barrier?.type).toBe('boundary');

    const after = game.getPublicState();
    expect(after.tokenPositions[PlayerId.P1]).toEqual(before.tokenPositions[PlayerId.P1]);
    expect(after.currentPlayer).toBe(PlayerId.P2);
  });

  it('wins immediately when reaching opponent goal', () => {
    const nearWinMaze = openMaze(cell(Row.A, Col.C1), cell(Row.B, Col.C1));
    const game = new MazeCrackGame({
      p1Maze,
      p2Maze: nearWinMaze,
      startingPlayer: PlayerId.P1,
    });

    const res = game.applyTurn(PlayerId.P1, Direction.Down);
    expect(res.didWin).toBe(true);
    expect(res.winner).toBe(PlayerId.P1);

    const state = game.getPublicState();
    expect(state.phase).toBe('finished');
    expect(state.winner).toBe(PlayerId.P1);

    expect(() => game.applyTurn(PlayerId.P1, Direction.Down)).toThrowError(
      expect.objectContaining({ code: EngineErrorCode.GameFinished }),
    );
  });
});
