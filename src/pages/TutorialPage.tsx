import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function TutorialPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-dvh">
      <PageHeader />
      <div className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
        <div className="card">
          <h2 className="mb-2 text-xl font-bold">튜토리얼(보일러플레이트)</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            `reverse-chess` 구조를 따라 라우팅/페이지/엔진/워커가 나뉜 상태만 먼저 만들어둔
            페이지입니다. 실제 maze-crack 규칙/UX에 맞게 교체하세요.
          </p>
        </div>
        <Button className="btn-menu" onClick={() => navigate('/')}>
          메인으로
        </Button>
      </div>
    </div>
  );
}
