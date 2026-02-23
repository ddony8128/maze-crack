import type { Difficulty, Direction, Position } from '@/engine/types';

export type ComputeDirectionRequest = {
  type: 'computeDirection';
  difficulty: Difficulty;
  from: Position;
  goal: Position;
  requestId: number;
  resetAI?: boolean;
};

export type ComputeDirectionResponse = {
  type: 'direction';
  requestId: number;
  direction: Direction;
};
