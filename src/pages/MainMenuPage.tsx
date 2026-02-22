import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Rabbit, Turtle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MainMenuPage() {
  const navigate = useNavigate();
  const [isSingleOpen, setIsSingleOpen] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-5xl font-extrabold tracking-tight">maze-crack</h1>
        <p className="text-muted-foreground">미로를 “깨는” 게임 엔진/AI 실험장</p>
      </div>

      <div className="flex w-[min(90vw,360px)] flex-col gap-4">
        <Button className="btn-menu" onClick={() => navigate('/tutorial')}>
          튜토리얼(임시)
        </Button>

        <Button
          className="btn-menu flex items-center justify-center gap-2"
          onClick={() => setIsSingleOpen((v) => !v)}
        >
          혼자 하기(임시)
          <ChevronDown className="h-5 w-5" />
        </Button>
        {isSingleOpen && (
          <div className="flex flex-col items-center gap-3">
            <Button className="btn-menu w-4/5" onClick={() => navigate('/single/easy')}>
              쉬움 <Turtle className="h-5 w-5" />
            </Button>
            <Button className="btn-menu w-4/5" onClick={() => navigate('/single/hard')}>
              어려움 <Rabbit className="h-5 w-5" />
            </Button>
          </div>
        )}

        <Button className="btn-menu" onClick={() => navigate('/two')}>
          둘이 하기(임시)
        </Button>
      </div>

      <div className="text-muted-foreground mt-10 text-center text-xs">
        엔진/규칙/AI 구조는 이후 `src/engine`에서 교체/확장하세요.
      </div>
    </div>
  );
}
