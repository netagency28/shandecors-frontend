import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pushGtmPageView } from '../lib/seo';

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    pushGtmPageView(`${pathname}${search}`);
  }, [pathname, search]);

  return null;
}

export default ScrollToTop;
