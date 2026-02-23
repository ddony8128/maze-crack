import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Tutorial from '@/components/game/Tutorial';

export function TutorialPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  return (
    <Tutorial
      step={step}
      onNext={() => setStep((s) => s + 1)}
      onPrev={() => setStep((s) => Math.max(0, s - 1))}
      onHome={() => navigate('/')}
      onStartPVP={() => navigate('/two')}
      onStartPVE={() => navigate('/single/easy')}
    />
  );
}
