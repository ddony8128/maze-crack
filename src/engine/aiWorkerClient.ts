import type { Difficulty, Direction, Position } from '@/engine/types';
import type { ComputeDirectionRequest, ComputeDirectionResponse } from '@/types/workerMessage';

export class AIWorkerClient {
  private worker: Worker;
  private nextRequestId = 0;

  constructor() {
    this.worker = new Worker(new URL('./aiWorker.ts', import.meta.url), { type: 'module' });
  }

  async getNextDirection(
    from: Position,
    goal: Position,
    difficulty: Difficulty,
    resetAI: boolean = false,
  ): Promise<Direction> {
    const requestId = this.nextRequestId++;
    const payload: ComputeDirectionRequest = {
      type: 'computeDirection',
      difficulty,
      from,
      goal,
      requestId,
      resetAI,
    };

    return new Promise<Direction>((resolve, reject) => {
      const handleMessage = (event: MessageEvent<ComputeDirectionResponse>) => {
        const data = event.data;
        if (data.type !== 'direction') return;
        if (data.requestId !== requestId) return;
        this.worker.removeEventListener('message', handleMessage);
        this.worker.removeEventListener('error', handleError);
        resolve(data.direction);
      };

      const handleError = (err: ErrorEvent) => {
        this.worker.removeEventListener('error', handleError);
        reject(err);
      };

      this.worker.addEventListener('message', handleMessage);
      this.worker.addEventListener('error', handleError);
      this.worker.postMessage(payload);
    });
  }

  dispose() {
    this.worker.terminate();
  }
}
