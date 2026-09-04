import {useEffect, useRef, type ReactNode} from 'react';
import {useLocation} from '@docusaurus/router';

declare global {
  interface Window {
    _hmt?: Array<unknown[]>;
  }
}

const HM_IDS: Record<string, string> = {
  'docs.undersilicon.cn': 'ce732a9c35d7f2fe102617da8624c24c',
  'docs.undersilicon.com': 'fcf301b9471d2e30b0362f85d770b3d0',
};

export default function BaiduTongji(): ReactNode {
  const location = useLocation();
  const firstPath = useRef(true);

  useEffect(() => {
    const hmId = HM_IDS[window.location.hostname];
    if (!hmId || document.querySelector(`script[src*="hm.js?${hmId}"]`)) {
      return;
    }
    window._hmt = window._hmt || [];
    const hm = document.createElement('script');
    hm.src = `https://hm.baidu.com/hm.js?${hmId}`;
    hm.async = true;
    document.head.appendChild(hm);
  }, []);

  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    window._hmt?.push(['_trackPageview', location.pathname + location.search]);
  }, [location]);

  return null;
}
