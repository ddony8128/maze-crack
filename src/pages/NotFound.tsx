import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="bg-muted flex min-h-dvh items-center justify-center p-6">
      <div className="text-center">
        <h1 className="mb-3 text-[clamp(2.25rem,10vw,3rem)] font-bold">404</h1>
        <p className="text-muted-foreground mb-5 text-[clamp(1rem,4vw,1.25rem)]">
          Oops! Page not found
        </p>
        <a href="/" className="text-primary hover:text-primary/90 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
}
