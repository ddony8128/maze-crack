/// <reference lib="webworker" />

import type { Difficulty, Direction, Position } from './types';
import type { ComputeDirectionRequest, ComputeDirectionResponse } from '@/types/workerMessage';

const ctx: DedicatedWorkerGlobalScope = self as DedicatedWorkerGlobalScope;

let LOCK = false;

type SimpleAI = {
  reset: () => void;
  next: (from: Position, goal: Position) => Direction;
};

const aiInstances: Partial<Record<Difficulty, SimpleAI>> = {};

function createAI(level: Difficulty): SimpleAI {
  let counter = 0;

  const next = (from: Position, goal: Position): Direction => {
    counter++;
    const dr = goal.row - from.row;
    const dc = goal.col - from.col;

    const preferred: Direction[] = [];
    if (dr < 0) preferred.push('UP');
    if (dr > 0) preferred.push('DOWN');
    if (dc < 0) preferred.push('LEFT');
    if (dc > 0) preferred.push('RIGHT');

    const fallback: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    const candidates = preferred.length > 0 ? preferred : fallback;

    const idx = level === 'HARD' ? counter % candidates.length : (counter + 1) % candidates.length;
    return candidates[idx] ?? 'UP';
  };

  const reset = () => {
    counter = 0;
  };

  return { next, reset };
}

function getOrCreateAI(level: Difficulty): SimpleAI {
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
