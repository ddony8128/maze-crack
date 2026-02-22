export const difficultyLevel = {
  Easy: 'Easy',
  Hard: 'Hard',
} as const;

export type DifficultyLevel = (typeof difficultyLevel)[keyof typeof difficultyLevel];

/**
 * maze-crack의 실제 상태/액션 타입은 이후 원하는 형태로 바꾸면 된다.
 * 보일러플레이트 목적상 "Worker로 전달 가능한" 최소 형태만 제공한다.
 */
export type MazeState = {
  seed: number;
  step: number;
};

export type MazeAction = {
  kind: 'wait' | 'move';
  direction?: 'up' | 'down' | 'left' | 'right';
};
