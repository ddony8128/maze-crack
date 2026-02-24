import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { TutorialStepDemo } from '@/assets/tutorial/StepDemo';
import { tutorialSteps } from '@/assets/tutorial/steps';

interface TutorialProps {
  step: number;
  onNext: () => void;
  onPrev: () => void;
  onHome: () => void;
  onStartPVP: () => void;
  onStartPVE: () => void;
}

export default function Tutorial({
  step,
  onNext,
  onPrev,
  onHome,
  onStartPVP,
  onStartPVE,
}: TutorialProps) {
  const isLast = step >= tutorialSteps.length - 1;
  const s = tutorialSteps[Math.min(step, tutorialSteps.length - 1)]!;

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-4 p-5 sm:p-8">
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground absolute top-4 left-4"
        onClick={onHome}
        aria-label="메인으로"
      >
        <Home />
      </Button>

      <div className="flex gap-1.5">
        {tutorialSteps.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-border'}`}
          />
        ))}
      </div>

      <div className="text-center" key={step}>
        <h2 className="text-primary mb-2 text-[clamp(1.25rem,5vw,1.75rem)] font-bold">{s.title}</h2>
      </div>

      <div className="mb-1 w-full max-w-md px-3 text-left sm:px-4">
        <div className="text-foreground min-h-18 text-left text-sm leading-relaxed whitespace-pre-line sm:min-h-22 sm:text-base">
          {s.desc}
        </div>
      </div>

      <div className="w-full max-w-md">
        <TutorialStepDemo stepId={s.demo} />
      </div>

      <div className="flex gap-3">
        {step > 0 ? (
          <Button
            variant="outline"
            size="lg"
            className="border-border text-muted-foreground gap-1"
            onClick={onPrev}
          >
            <ArrowLeft className="h-4 w-4" /> 이전
          </Button>
        ) : null}

        {!isLast ? (
          <Button size="lg" className="bg-primary text-primary-foreground gap-1" onClick={onNext}>
            다음 <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <Button
              size="lg"
              className="neon-glow bg-primary text-primary-foreground gap-2"
              onClick={onStartPVP}
            >
              2인 대전 시작
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-accent/40 text-accent gap-2"
              onClick={onStartPVE}
            >
              1인 PvE 시작
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-1"
              onClick={onHome}
            >
              <Home className="h-3 w-3" /> 메인
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
