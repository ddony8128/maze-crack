import { useState } from 'react';
import type { BuilderTool } from '@/types/game';
import type { Position, WallKey } from '@/engine/types';
import MazeGrid from '@/components/game/MazeGrid';
import type { TutorialStepId } from './steps';

const EXAMPLE_START: Position = { row: 0, col: 0 };
const EXAMPLE_GOAL: Position = { row: 4, col: 4 };
const EXAMPLE_WALLS: WallKey[] = ['0,0-0,1', '1,1-1,2', '2,2-3,2', '3,3-3,4', '0,2-1,2'];
const EXAMPLE_PLAYER: Position = { row: 2, col: 1 };
const EXAMPLE_VISITED: string[] = ['0,0', '1,0', '2,0', '2,1'];
const WALL_HIT_PLAYER: Position = { row: 1, col: 1 };
const WALL_HIT_WALLS: WallKey[] = ['1,1-1,2'];

function InteractiveBuildDemo() {
  const [start, setStart] = useState<Position | null>(null);
  const [goal, setGoal] = useState<Position | null>(null);
  const [walls, setWalls] = useState<WallKey[]>([]);

  const tool: BuilderTool = !start ? 'START' : !goal ? 'GOAL' : 'WALL';

  const handleCellClick = (pos: Position) => {
    if (tool === 'START') {
      if (goal && pos.row === goal.row && pos.col === goal.col) return;
      setStart(pos);
      return;
    }
    if (tool === 'GOAL') {
      if (start && pos.row === start.row && pos.col === start.col) return;
      setGoal(pos);
    }
  };

  const handleWallToggle = (wk: WallKey) => {
    if (tool !== 'WALL') return;
    setWalls((prev) => (prev.includes(wk) ? prev.filter((w) => w !== wk) : [...prev, wk]));
  };

  return (
    <MazeGrid
      walls={walls}
      start={start}
      goal={goal}
      editable
      activeTool={tool}
      onCellClick={handleCellClick}
      onWallToggle={handleWallToggle}
    />
  );
}

export function TutorialStepDemo({ stepId }: { stepId: TutorialStepId }) {
  switch (stepId) {
    case 'build':
      return <InteractiveBuildDemo />;
    case 'move':
      return (
        <MazeGrid
          walls={[]}
          start={EXAMPLE_START}
          goal={EXAMPLE_GOAL}
          playerPos={EXAMPLE_PLAYER}
          visitedCells={EXAMPLE_VISITED}
        />
      );
    case 'hit':
      return (
        <MazeGrid
          walls={WALL_HIT_WALLS}
          start={EXAMPLE_START}
          goal={EXAMPLE_GOAL}
          playerPos={WALL_HIT_PLAYER}
          visitedCells={['0,0', '1,0', '1,1']}
        />
      );
    case 'win':
      return (
        <MazeGrid
          walls={EXAMPLE_WALLS}
          start={EXAMPLE_START}
          goal={EXAMPLE_GOAL}
          playerPos={EXAMPLE_GOAL}
          visitedCells={['0,0', '1,0', '2,0', '2,1', '3,1', '4,1', '4,2', '4,3', '4,4']}
        />
      );
    default:
      return null;
  }
}
