import { useNavigate } from 'react-router-dom';

export function PageHeader() {
  const navigate = useNavigate();

  return (
    <header className="border-border bg-card/40 flex items-center justify-between border-b px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-4">
      <h1 className="text-[clamp(1rem,4vw,1.125rem)] font-bold tracking-tight">maze-crack</h1>
      <button
        className="text-muted-foreground hover:text-foreground text-[clamp(0.8rem,3vw,0.9rem)] transition"
        onClick={() => navigate('/')}
      >
        메인 메뉴로
      </button>
    </header>
  );
}
