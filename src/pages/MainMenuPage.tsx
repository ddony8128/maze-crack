import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Rabbit, Turtle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

export function MainMenuPage() {
  const navigate = useNavigate();
  const [isSingleOpen, setIsSingleOpen] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-14 sm:px-8 sm:py-20">
      <div className="mb-10 text-center sm:mb-14">
        <img
          src={logo}
          alt="Maze Crack 로고"
          className="neon-glow mx-auto mb-4 h-[clamp(72px,30vw,300px)] w-auto select-none"
          decoding="async"
          draggable={false}
        />
        <h1 className="game-title mb-2 text-[clamp(2.25rem,7vw,3.75rem)]">Maze Crack</h1>
        <p className="text-muted-foreground text-base sm:text-xl">상대의 미로를 해독하라!</p>
      </div>

      <div className="flex w-[clamp(220px,70vw,440px)] flex-col gap-4 sm:gap-6">
        <Button className="btn-menu" onClick={() => navigate('/tutorial')}>
          튜토리얼
        </Button>

        <Button
          className="btn-menu flex items-center justify-center gap-2"
          onClick={() => setIsSingleOpen((v) => !v)}
        >
          혼자 하기
          <ChevronDown className="h-5 w-5" />
        </Button>
        {isSingleOpen && (
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <Button className="btn-menu w-4/5" onClick={() => navigate('/single/easy')}>
              쉬움 <Turtle className="h-5 w-5" />
            </Button>
            <Button className="btn-menu w-4/5" onClick={() => navigate('/single/hard')}>
              어려움 <Rabbit className="h-5 w-5" />
            </Button>
          </div>
        )}

        <Button className="btn-menu" onClick={() => navigate('/two')}>
          결투!
        </Button>
      </div>
    </div>
  );
}
