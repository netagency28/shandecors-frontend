import { useLocation } from 'react-router-dom';
import PageMeta from './PageMeta';
import { getSeoForPath, buildHomeJsonLd } from '../lib/seo';

export default function SeoManager() {
  const { pathname, search } = useLocation();

  // Product detail pages set their own title, description, and JSON-LD
  if (pathname.startsWith('/products/') && pathname.length > '/products/'.length) {
    return null;
  }

  const seo = getSeoForPath(pathname, search);
  const jsonLd = pathname === '/' ? buildHomeJsonLd() : null;

  return <PageMeta {...seo} jsonLd={jsonLd} />;
}
