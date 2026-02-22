import { useNavigate } from 'react-router-dom';

export function PageHeader() {
  const navigate = useNavigate();

  return (
    <header className="border-border bg-card/40 flex items-center justify-between border-b px-6 py-4 backdrop-blur-sm">
      <h1 className="text-lg font-bold tracking-tight">maze-crack</h1>
      <button
        className="text-muted-foreground hover:text-foreground text-sm transition"
        onClick={() => navigate('/')}
      >
        메인 메뉴로
      </button>
    </header>
  );
}
