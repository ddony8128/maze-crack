import type { DifficultyLevel, MazeAction, MazeState } from '@/engine/types';
import type { ComputeActionRequest, ComputeActionResponse } from '@/types/workerMessage';

export class AIWorkerClient {
  private worker: Worker;
  private nextRequestId = 0;

  constructor() {
    this.worker = new Worker(new URL('./aiWorker.ts', import.meta.url), { type: 'module' });
  }

  async getNextAction(
    state: MazeState,
    difficulty: DifficultyLevel,
    resetAI: boolean = false,
  ): Promise<MazeAction> {
    const requestId = this.nextRequestId++;
    const payload: ComputeActionRequest = {
      type: 'computeAction',
      difficulty,
      state,
      requestId,
      resetAI,
    };

    return new Promise<MazeAction>((resolve, reject) => {
      const handleMessage = (event: MessageEvent<ComputeActionResponse>) => {
        const data = event.data;
        if (data.type !== 'action') return;
        if (data.requestId !== requestId) return;
        this.worker.removeEventListener('message', handleMessage);
        this.worker.removeEventListener('error', handleError);
        resolve(data.action);
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
