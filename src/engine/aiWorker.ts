/// <reference lib="webworker" />

import { difficultyLevel, type DifficultyLevel, type MazeAction, type MazeState } from './types';
import type { ComputeActionRequest, ComputeActionResponse } from '@/types/workerMessage';

const ctx: DedicatedWorkerGlobalScope = self as any;

let LOCK = false;

type SimpleAI = {
  reset: () => void;
  next: (state: MazeState) => MazeAction;
};

const aiInstances: Partial<Record<DifficultyLevel, SimpleAI>> = {};

function createAI(level: DifficultyLevel): SimpleAI {
  let counter = 0;

  const next = (state: MazeState): MazeAction => {
    counter++;
    const dirs: MazeAction['direction'][] = ['up', 'down', 'left', 'right'];
    const index =
      level === difficultyLevel.Hard ? (state.seed + counter) % dirs.length : counter % dirs.length;
    return { kind: 'move', direction: dirs[index] };
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

ctx.onmessage = async (event: MessageEvent<ComputeActionRequest>) => {
  const data = event.data;
  if (data.type !== 'computeAction') return;

  while (LOCK) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  LOCK = true;

  const ai = getOrCreateAI(data.difficulty);
  if (data.resetAI) {
    ai.reset();
  }

  const action = ai.next(data.state);
  const response: ComputeActionResponse = { type: 'action', requestId: data.requestId, action };
  ctx.postMessage(response);

  LOCK = false;
};
