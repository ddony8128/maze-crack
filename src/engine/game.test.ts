import { describe, expect, it } from 'vitest';
import { MazeCrackGame } from './game';
import { Maze, makeWallKey } from './maze';
import { EngineErrorCode } from './errors';
import type { MazeSpec, Position } from './types';

const pos = (row: number, col: number): Position => ({ row, col });

const openMaze = (start: Position, goal: Position, walls: string[] = []): MazeSpec => ({
  start,
  goal,
  walls,
});

describe('Maze (validation + movement)', () => {
  it('rejects start==goal', () => {
    expect(() => new Maze(openMaze(pos(0, 0), pos(0, 0)))).toThrowError(/start and goal/i);
  });

  it('rejects wall key with invalid format', () => {
    expect(() => new Maze(openMaze(pos(0, 0), pos(4, 4), ['bad-key']))).toThrowError(
      /invalid wall/i,
    );
  });

  it('rejects wall key out of bounds', () => {
    expect(() => new Maze(openMaze(pos(0, 0), pos(4, 4), ['0,0-9,9']))).toThrowError(
      /out of bounds/i,
    );
  });

  it('rejects wall key with non-adjacent endpoints', () => {
    expect(() => new Maze(openMaze(pos(0, 0), pos(4, 4), ['0,0-2,0']))).toThrowError(/adjacent/i);
  });

  it('rejects maze with no path from start to goal', () => {
    const start = pos(0, 0);
    const goal = pos(1, 1);
    const walls = [
      makeWallKey(goal, pos(0, 1)),
      makeWallKey(goal, pos(2, 1)),
      makeWallKey(goal, pos(1, 0)),
      makeWallKey(goal, pos(1, 2)),
    ];
    expect(() => new Maze(openMaze(start, goal, walls))).toThrowError(/no path/i);
  });

  it('blocks movement by explicit wall (bidirectional)', () => {
    const a = pos(0, 0);
    const b = pos(0, 1);
    const wk = makeWallKey(a, b);
    const maze = new Maze(openMaze(pos(2, 2), pos(4, 4), [wk]));

    const r1 = maze.canMove(a, 'RIGHT');
    expect(r1.barrier).toBe('wall');
    expect(r1.wallKey).toBe(wk);
    expect(r1.to).toEqual(a);

    const r2 = maze.canMove(b, 'LEFT');
    expect(r2.barrier).toBe('wall');
    expect(r2.wallKey).toBe(wk);
    expect(r2.to).toEqual(b);
  });
});

describe('MazeCrackGame (turn + pending confirm + win)', () => {
  const p1Maze = openMaze(pos(2, 2), pos(4, 4));
  const p2Maze = openMaze(pos(0, 0), pos(4, 0));

  it('initializes tokens at opponent start positions', () => {
    const game = new MazeCrackGame({
      mode: 'PVP',
      difficulty: null,
      p1Maze,
      p2Maze,
      startingPlayer: 'P1',
    });
    const s = game.getPublicState();
    expect(s.positions[0]).toEqual(p2Maze.start);
    expect(s.positions[1]).toEqual(p1Maze.start);
  });

  it('successful move does not end the turn', () => {
    const game = new MazeCrackGame({
      mode: 'PVP',
      difficulty: null,
      p1Maze,
      p2Maze,
      startingPlayer: 'P1',
    });
    const before = game.getPublicState();
    const after = game.move('DOWN');
    expect(after.currentTurn).toBe('P1');
    expect(after.wallHitPending).toBe(false);
    expect(after.positions[0]).not.toEqual(before.positions[0]);
  });

  it('failed move by boundary sets wallHitPending and keeps turn', () => {
    const game = new MazeCrackGame({
      mode: 'PVP',
      difficulty: null,
      p1Maze,
      p2Maze,
      startingPlayer: 'P1',
    });
    const before = game.getPublicState();
    const after = game.move('UP');
    expect(after.wallHitPending).toBe(true);
    expect(after.currentTurn).toBe('P1');
    expect(after.positions[0]).toEqual(before.positions[0]);
  });

  it('wall hit adds discovered wall and sets wallHitPending', () => {
    const wk = makeWallKey(pos(0, 0), pos(0, 1));
    const game = new MazeCrackGame({
      mode: 'PVP',
      difficulty: null,
      p1Maze,
      p2Maze: openMaze(pos(0, 0), pos(4, 4), [wk]),
      startingPlayer: 'P1',
    });

    const after = game.move('RIGHT');
    expect(after.wallHitPending).toBe(true);
    expect(after.discoveredWalls[0]).toContain(wk);
  });

  it('confirmWallHit switches turn and clears pending', () => {
    const game = new MazeCrackGame({
      mode: 'PVP',
      difficulty: null,
      p1Maze,
      p2Maze,
      startingPlayer: 'P1',
    });
    game.move('UP');
    const after = game.confirmWallHit();
    expect(after.wallHitPending).toBe(false);
    expect(after.currentTurn).toBe('P2');
  });

  it('cannot move while wallHitPending', () => {
    const game = new MazeCrackGame({
      mode: 'PVP',
      difficulty: null,
      p1Maze,
      p2Maze,
      startingPlayer: 'P1',
    });
    const s1 = game.move('UP');
    const s2 = game.move('DOWN');
    expect(s2.positions).toEqual(s1.positions);
    expect(s2.currentTurn).toBe('P1');
  });

  it('wins when reaching opponent goal', () => {
    const nearWinMaze = openMaze(pos(0, 0), pos(1, 0));
    const game = new MazeCrackGame({
      mode: 'PVP',
      difficulty: null,
      p1Maze,
      p2Maze: nearWinMaze,
      startingPlayer: 'P1',
    });
    const after = game.move('DOWN');
    expect(after.phase).toBe('WIN');
    expect(after.winner).toBe('P1');
  });

  it('throws after game finished', () => {
    const nearWinMaze = openMaze(pos(0, 0), pos(1, 0));
    const game = new MazeCrackGame({
      mode: 'PVP',
      difficulty: null,
      p1Maze,
      p2Maze: nearWinMaze,
      startingPlayer: 'P1',
    });
    game.move('DOWN');
    expect(() => game.move('DOWN')).toThrowError(
      expect.objectContaining({ code: EngineErrorCode.GameFinished }),
    );
  });
});
