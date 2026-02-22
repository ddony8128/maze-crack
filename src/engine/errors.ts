export const EngineErrorCode = {
  InvalidMazeSpec: 'invalid_maze_spec',
  GameFinished: 'game_finished',
  NotYourTurn: 'not_your_turn',
} as const;

export type EngineErrorCode = (typeof EngineErrorCode)[keyof typeof EngineErrorCode];

export class EngineError extends Error {
  readonly code: EngineErrorCode;

  constructor(code: EngineErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
