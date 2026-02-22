import { Navigate, Route, Routes } from 'react-router-dom';
import { AnalyticsTracker } from '@/lib/analyticsTracker';
import { MainMenuPage } from '@/pages/MainMenuPage';
import { TutorialPage } from '@/pages/TutorialPage';
import { SinglePlayPage } from '@/pages/SinglePlayPage';
import { TwoPlayerPage } from '@/pages/TwoPlayerPage';

export default function App() {
  return (
    <div className="bg-background text-foreground min-h-dvh">
      <AnalyticsTracker />
      <main className="min-h-dvh">
        <Routes>
          <Route path="/" element={<MainMenuPage />} />
          <Route path="/tutorial" element={<TutorialPage />} />
          <Route path="/single/:difficulty" element={<SinglePlayPage />} />
          <Route path="/two" element={<TwoPlayerPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
