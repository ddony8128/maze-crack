import type { MazeAction, MazeState } from './types';

export class MazeGame {
  private state: MazeState;

  constructor(initialState?: MazeState) {
    this.state = initialState ?? { seed: 1, step: 0 };
  }

  getState(): MazeState {
    return this.state;
  }

  apply(action: MazeAction): MazeState {
    // 실제 게임 규칙은 이후 교체할 영역
    this.state = {
      ...this.state,
      step: this.state.step + 1,
      seed: action.kind === 'move' ? this.state.seed + 1 : this.state.seed,
    };
    return this.state;
  }
}
