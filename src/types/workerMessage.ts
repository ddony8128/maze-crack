import type { Cell, DifficultyLevel, Direction } from '@/engine/types';

export type ComputeDirectionRequest = {
  type: 'computeDirection';
  difficulty: DifficultyLevel;
  from: Cell;
  goal: Cell;
  requestId: number;
  resetAI?: boolean;
};

export type ComputeDirectionResponse = {
  type: 'direction';
  requestId: number;
  direction: Direction;
};
