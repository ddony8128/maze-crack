/// <reference lib="webworker" />

import {
  Direction,
  difficultyLevel,
  type Cell,
  type DifficultyLevel,
  type Direction as Dir,
} from './types';
import { colToIndex, rowToIndex } from './coord';
import type { ComputeDirectionRequest, ComputeDirectionResponse } from '@/types/workerMessage';

const ctx: DedicatedWorkerGlobalScope = self as DedicatedWorkerGlobalScope;

let LOCK = false;

type SimpleAI = {
  reset: () => void;
  next: (from: Cell, goal: Cell) => Dir;
};

const aiInstances: Partial<Record<DifficultyLevel, SimpleAI>> = {};

function createAI(level: DifficultyLevel): SimpleAI {
  let counter = 0;

  const next = (from: Cell, goal: Cell): Dir => {
    counter++;
    const dr = rowToIndex(goal.row) - rowToIndex(from.row);
    const dc = colToIndex(goal.col) - colToIndex(from.col);

    const preferred: Dir[] = [];
    if (dr < 0) preferred.push(Direction.Up);
    if (dr > 0) preferred.push(Direction.Down);
    if (dc < 0) preferred.push(Direction.Left);
    if (dc > 0) preferred.push(Direction.Right);

    const fallback: Dir[] = [Direction.Up, Direction.Down, Direction.Left, Direction.Right];
    const candidates = preferred.length > 0 ? preferred : fallback;

    const idx =
      level === difficultyLevel.Hard
        ? counter % candidates.length
        : (counter + 1) % candidates.length;
    return candidates[idx] ?? Direction.Up;
  };

  const reset = () => {
    counter = 0;
  };

  return { next, reset };
}

function getOrCreateAI(level: DifficultyLevel): SimpleAI {
  if (!aiInstances[level]) {
    aiInstances[level] = createAI(level);
  }
  return aiInstances[level]!;
}

ctx.onmessage = async (event: MessageEvent<ComputeDirectionRequest>) => {
  const data = event.data;
  if (data.type !== 'computeDirection') return;

  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  LOCK = true;

  const ai = getOrCreateAI(data.difficulty);
  if (data.resetAI) {
    ai.reset();
  }

  const direction = ai.next(data.from, data.goal);
  const response: ComputeDirectionResponse = {
    type: 'direction',
    requestId: data.requestId,
    direction,
  };
  ctx.postMessage(response);

  LOCK = false;
};
