import { useLocation } from 'react-router-dom';
import PageMeta from './PageMeta';
import { getSeoForPath } from '../lib/seo';

export default function SeoManager() {
  const { pathname } = useLocation();

  // Product detail pages set their own title, description, and JSON-LD
  if (pathname.startsWith('/products/') && pathname.length > '/products/'.length) {
    return null;
  }

  const seo = getSeoForPath(pathname);
  return <PageMeta {...seo} />;
}
