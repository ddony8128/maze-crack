import { describe, expect, it } from 'vitest';
import { MazeGame } from './game';

describe('MazeGame boilerplate', () => {
  it('increments step on apply()', () => {
    const game = new MazeGame({ seed: 1, step: 0 });
    const next = game.apply({ kind: 'wait' });
    expect(next.step).toBe(1);
  });
});
