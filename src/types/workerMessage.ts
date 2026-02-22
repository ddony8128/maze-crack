import type { DifficultyLevel, MazeAction, MazeState } from '@/engine/types';

export type ComputeActionRequest = {
  type: 'computeAction';
  difficulty: DifficultyLevel;
  state: MazeState;
  requestId: number;
  resetAI?: boolean;
};

export type ComputeActionResponse = {
  type: 'action';
  requestId: number;
  action: MazeAction;
};
