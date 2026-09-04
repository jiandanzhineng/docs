import {useEffect, useRef, type ReactNode} from 'react';
import {useLocation} from '@docusaurus/router';

declare global {
  interface Window {
    _hmt?: Array<unknown[]>;
  }
}

export default function BaiduTongji(): ReactNode {
  const location = useLocation();
  const firstPath = useRef(true);

  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    window._hmt?.push(['_trackPageview', location.pathname + location.search]);
  }, [location]);

  return null;
}
