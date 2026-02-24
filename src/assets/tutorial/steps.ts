import raw from './steps.json';

export type TutorialStepId = 'build' | 'move' | 'hit' | 'win';

export type TutorialStep = {
  id: TutorialStepId;
  title: string;
  desc: string;
  demo: TutorialStepId;
};

export const tutorialSteps = raw as TutorialStep[];
