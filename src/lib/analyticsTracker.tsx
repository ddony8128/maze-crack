import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * gtag가 없는 환경에서도 안전하게 동작하도록 optional chaining을 사용한다.
 * (추후 필요 시 index.html에 gtag 스니펫을 추가하면 자동으로 활성화됨)
 */
export function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    window.gtag?.('config', 'G-XXXXXXXXXX', {
      page_path: location.pathname,
    });
  }, [location.pathname]);

  return null;
}
