import type { Direction, Difficulty, GameMode, MazeSpec, PlayerId, Position, PublicGameState, WallKey } from './types';
import { EngineError, EngineErrorCode } from './errors';
import { isSamePos, posKey } from './coord';
import { Maze } from './maze';

export type MazeCrackGameConfig = {
  mode: GameMode;
  difficulty: Difficulty | null;
  p1Maze: MazeSpec;
  p2Maze: MazeSpec;
  startingPlayer: PlayerId;
  memoryMode?: boolean;
};

function opponentOf(player: PlayerId): PlayerId {
  return player === 'P1' ? 'P2' : 'P1';
}

function tokenIndexOf(player: PlayerId): 0 | 1 {
  return player === 'P1' ? 0 : 1;
}

function opponentMazeIndexOf(player: PlayerId): 0 | 1 {
  return player === 'P1' ? 1 : 0;
}

/**
 * Maze Crack 순수 엔진 (UI/저장/네트워크 등 외부 의존 없음)
 *
 * 규칙(`ui_sample`과 동일):
 * - 각 플레이어는 "상대 미로" 위에서 자신의 토큰을 움직인다.
 * - 성공적인 이동은 턴을 끝내지 않는다.
 * - 벽/경계 충돌 시 제자리 유지 + "wallHitPending"가 켜지고, UI 확인 후 턴을 넘긴다.
 */
export class MazeCrackGame {
  private readonly p1Maze: Maze;
  private readonly p2Maze: Maze;
  private readonly memoryMode: boolean;
  private state: PublicGameState;

  constructor(config: MazeCrackGameConfig) {
    this.memoryMode = config.memoryMode ?? false;
    this.p1Maze = new Maze(config.p1Maze);
    this.p2Maze = new Maze(config.p2Maze);

    const p1Pos = { ...this.p2Maze.start };
    const p2Pos = { ...this.p1Maze.start };

    this.state = {
      mode: config.mode,
      difficulty: config.difficulty,
      phase: 'PLAY',
      mazes: [config.p1Maze, config.p2Maze],
      positions: [p1Pos, p2Pos],
      currentTurn: config.startingPlayer,
      discoveredWalls: [[], []],
      visited: [[posKey(p1Pos)], [posKey(p2Pos)]],
      log: [],
      winner: null,
      wallHitPending: false,
    };
  }

  getPublicState(): PublicGameState {
    return {
      ...this.state,
      mazes: [{ ...this.state.mazes[0] }, { ...this.state.mazes[1] }],
      positions: [{ ...this.state.positions[0] }, { ...this.state.positions[1] }],
      discoveredWalls: [[...this.state.discoveredWalls[0]], [...this.state.discoveredWalls[1]]],
      visited: [[...this.state.visited[0]], [...this.state.visited[1]]],
      log: [...this.state.log],
    };
  }

  /**
   * 현재 턴 플레이어의 이동을 적용한다.
   * 성공 시에는 턴이 유지된다.
   * 충돌 시에는 wallHitPending=true가 되고, UI에서 confirmWallHit를 호출해야 턴이 넘어간다.
   */
  move(direction: Direction): PublicGameState {
    if (this.state.phase === 'WIN') {
      throw new EngineError(EngineErrorCode.GameFinished, 'game already finished');
    }
    if (this.state.wallHitPending) {
      return this.getPublicState();
    }

    const player = this.state.currentTurn;
    const idx = tokenIndexOf(player);
    const oppMazeIdx = opponentMazeIndexOf(player);
    const maze = oppMazeIdx === 0 ? this.p1Maze : this.p2Maze;

    const from = this.state.positions[idx];
    const { to, barrier, wallKey } = maze.canMove(from, direction);

    if (barrier !== null) {
      if (barrier === 'wall' && wallKey) {
        const known = this.state.discoveredWalls[idx];
        if (!known.includes(wallKey)) {
          const dw: [string[], string[]] = [
            idx === 0 ? [...known, wallKey] : this.state.discoveredWalls[0],
            idx === 1 ? [...known, wallKey] : this.state.discoveredWalls[1],
          ];
          this.state = { ...this.state, discoveredWalls: dw };
        }
      }

      this.state = {
        ...this.state,
        wallHitPending: true,
        log: [
          ...this.state.log,
          { playerId: player, direction, success: false, position: { ...from } },
        ],
      };

      return this.getPublicState();
    }

    const newPositions: [typeof from, typeof from] = [
      { ...this.state.positions[0] },
      { ...this.state.positions[1] },
    ];
    newPositions[idx] = { ...to };

    const newVisited: [string[], string[]] = [this.state.visited[0], this.state.visited[1]];
    newVisited[idx] = [...newVisited[idx], posKey(to)];

    const goal = (oppMazeIdx === 0 ? this.p1Maze : this.p2Maze).goal;
    const didWin = isSamePos(to, goal);

    this.state = {
      ...this.state,
      positions: newPositions,
      visited: newVisited,
      phase: didWin ? 'WIN' : 'PLAY',
      winner: didWin ? player : null,
      log: [...this.state.log, { playerId: player, direction, success: true, position: { ...to } }],
    };

    return this.getPublicState();
  }

  confirmWallHit(): PublicGameState {
    if (this.state.phase !== 'PLAY') return this.getPublicState();
    if (!this.state.wallHitPending) return this.getPublicState();

    const nextState: PublicGameState = {
      ...this.state,
      wallHitPending: false,
      currentTurn: opponentOf(this.state.currentTurn),
    };

    if (this.memoryMode) {
      const endingIdx = tokenIndexOf(this.state.currentTurn);
      const oppMazeIdx = opponentMazeIndexOf(this.state.currentTurn);
      const startPos = oppMazeIdx === 0 ? this.p1Maze.start : this.p2Maze.start;

      const newPositions: [Position, Position] = [
        { ...nextState.positions[0] },
        { ...nextState.positions[1] },
      ];
      newPositions[endingIdx] = { ...startPos };

      const newDiscoveredWalls: [WallKey[], WallKey[]] = [
        [...nextState.discoveredWalls[0]],
        [...nextState.discoveredWalls[1]],
      ];
      newDiscoveredWalls[endingIdx] = [];

      const newVisited: [string[], string[]] = [
        [...nextState.visited[0]],
        [...nextState.visited[1]],
      ];
      newVisited[endingIdx] = [posKey(startPos)];

      nextState.positions = newPositions;
      nextState.discoveredWalls = newDiscoveredWalls;
      nextState.visited = newVisited;
    }

    this.state = nextState;
    return this.getPublicState();
  }
}
