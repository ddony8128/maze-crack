import type {
  Cell,
  Direction,
  GamePhase,
  MazeSpec,
  PlayerId,
  PublicGameState,
  TurnResult,
} from './types';
import { GamePhase as GamePhaseConst, PlayerId as PlayerIdConst } from './types';
import { Maze } from './maze';
import { EngineError, EngineErrorCode } from './errors';
import { isSameCell } from './coord';

export type MazeCrackGameConfig = {
  p1Maze: MazeSpec;
  p2Maze: MazeSpec;
  startingPlayer: PlayerId;
};

function opponentOf(player: PlayerId): PlayerId {
  return player === PlayerIdConst.P1 ? PlayerIdConst.P2 : PlayerIdConst.P1;
}

/**
 * Maze Crack 순수 엔진 (UI/네트워크/저장 등 외부 의존 없음)
 *
 * - 각 플레이어는 "상대 미로" 위에서 자신의 토큰을 움직인다.
 * - 이동은 1칸, 벽/경계면 충돌 시 제자리 유지 + 즉시 턴 종료.
 * - 상대의 벽 배치는 외부로 노출하지 않으며, 이동 결과(성공/충돌/좌표)는 공개 가능한 형태로 반환한다.
 */
export class MazeCrackGame {
  private readonly mazes: Record<PlayerId, Maze>;
  private readonly tokenPositions: Record<PlayerId, Cell>;
  private currentPlayer: PlayerId;
  private winner: PlayerId | null = null;
  private phase: GamePhase = GamePhaseConst.InProgress;
  private turn: number = 0;
  private readonly history: TurnResult[] = [];

  constructor(config: MazeCrackGameConfig) {
    this.mazes = {
      [PlayerIdConst.P1]: new Maze(config.p1Maze),
      [PlayerIdConst.P2]: new Maze(config.p2Maze),
    };

    this.currentPlayer = config.startingPlayer;

    // 토큰은 "상대 미로 start"에서 시작한다.
    this.tokenPositions = {
      [PlayerIdConst.P1]: { ...this.mazes[PlayerIdConst.P2].start },
      [PlayerIdConst.P2]: { ...this.mazes[PlayerIdConst.P1].start },
    };
  }

  getPublicState(): PublicGameState {
    return {
      phase: this.phase,
      currentPlayer: this.currentPlayer,
      winner: this.winner,
      tokenPositions: {
        [PlayerIdConst.P1]: { ...this.tokenPositions[PlayerIdConst.P1] },
        [PlayerIdConst.P2]: { ...this.tokenPositions[PlayerIdConst.P2] },
      },
      opponentStart: {
        [PlayerIdConst.P1]: { ...this.mazes[PlayerIdConst.P2].start },
        [PlayerIdConst.P2]: { ...this.mazes[PlayerIdConst.P1].start },
      },
      opponentGoal: {
        [PlayerIdConst.P1]: { ...this.mazes[PlayerIdConst.P2].goal },
        [PlayerIdConst.P2]: { ...this.mazes[PlayerIdConst.P1].goal },
      },
      turn: this.turn,
    };
  }

  getHistory(): TurnResult[] {
    return [...this.history];
  }

  applyTurn(player: PlayerId, direction: Direction): TurnResult {
    if (this.phase === GamePhaseConst.Finished) {
      throw new EngineError(EngineErrorCode.GameFinished, 'game already finished');
    }
    if (player !== this.currentPlayer) {
      throw new EngineError(EngineErrorCode.NotYourTurn, 'not your turn');
    }

    const defendingMazeOwner = opponentOf(player);
    const maze = this.mazes[defendingMazeOwner];

    const from = this.tokenPositions[player];
    const { to, barrier } = maze.canMove(from, direction);

    const moved = barrier === null && !isSameCell(from, to);
    if (moved) {
      this.tokenPositions[player] = { ...to };
    }

    this.turn += 1;

    const goal = maze.goal;
    const didWin = isSameCell(this.tokenPositions[player], goal);
    if (didWin) {
      this.phase = GamePhaseConst.Finished;
      this.winner = player;
    }

    const nextPlayer = didWin ? this.currentPlayer : opponentOf(this.currentPlayer);
    if (!didWin) {
      this.currentPlayer = nextPlayer;
    }

    const result: TurnResult = {
      turn: this.turn,
      player,
      direction,
      from: { ...from },
      to: { ...(moved ? this.tokenPositions[player] : from) },
      moved,
      hitBarrier: barrier !== null,
      barrier,
      nextPlayer: didWin ? player : this.currentPlayer,
      didWin,
      winner: this.winner,
    };

    this.history.push(result);
    return result;
  }
}
