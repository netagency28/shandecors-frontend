import { useEffect } from 'react';
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  THEME_COLOR,
  OG_LOCALE,
} from '../lib/seo';

function upsertMeta(attr, key, content) {
  if (content == null || content === '') return;

  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  if (!href) return;

  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

const JSON_LD_ID = 'page-json-ld';

export default function PageMeta({
  title,
  fullTitle,
  description = DEFAULT_DESCRIPTION,
  ogDescription,
  path = '/',
  noindex = false,
  image = DEFAULT_OG_IMAGE,
  jsonLd = null,
}) {
  useEffect(() => {
    const resolvedTitle = fullTitle || (title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE);
    const resolvedOgDescription = ogDescription || description;
    const canonical = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const robots = noindex ? 'noindex, nofollow' : 'index, follow';

    document.title = resolvedTitle;
    upsertLink('canonical', canonical);
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', robots);
    upsertMeta('name', 'theme-color', THEME_COLOR);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:locale', OG_LOCALE);
    upsertMeta('property', 'og:title', resolvedTitle);
    upsertMeta('property', 'og:description', resolvedOgDescription);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', image);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', resolvedTitle);
    upsertMeta('name', 'twitter:description', resolvedOgDescription);
    upsertMeta('name', 'twitter:image', image);

    const existing = document.getElementById(JSON_LD_ID);
    if (jsonLd) {
      const script = existing || document.createElement('script');
      script.id = JSON_LD_ID;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      if (!existing) document.head.appendChild(script);
    } else if (existing) {
      existing.remove();
    }
  }, [title, fullTitle, description, ogDescription, path, noindex, image, jsonLd]);

  return null;
}
