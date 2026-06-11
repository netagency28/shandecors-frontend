/**
 * Generates public/sitemap.xml at build time, including all active product URLs.
 * Set REACT_APP_BACKEND_URL in the environment (or .env) before running.
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.shandecors.store';
const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || 'https://shandecors-backend.onrender.com';

const STATIC_PAGES = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/products', changefreq: 'daily', priority: '0.9' },
  { loc: '/about', changefreq: 'monthly', priority: '0.7' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.6' },
  { loc: '/privacy-policy', changefreq: 'monthly', priority: '0.5' },
  { loc: '/terms-and-conditions', changefreq: 'monthly', priority: '0.5' },
  { loc: '/refunds-cancellation-policy', changefreq: 'monthly', priority: '0.5' },
  { loc: '/shipping-policy', changefreq: 'monthly', priority: '0.5' },
];

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

async function fetchAllProducts() {
  const products = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const response = await fetch(`${BACKEND_URL}/api/products?limit=${limit}&page=${page}`);
    if (!response.ok) {
      throw new Error(`Products API returned ${response.status}`);
    }

    const payload = await response.json();
    const batch = payload.products || payload.data?.products || [];
    products.push(...batch);

    const total = payload.total ?? payload.data?.total ?? batch.length;
    if (products.length >= total || batch.length < limit) break;
    page += 1;
  }

  return products;
}

function buildXml(entries) {
  const urls = entries
    .map((entry) => {
      const lastmodTag = entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>\n` : '';
      return [
        '  <url>',
        `    <loc>${escapeXml(`${SITE_URL}${entry.loc}`)}</loc>`,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority}</priority>`,
        lastmodTag ? lastmodTag.trimEnd() : '',
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
}

async function main() {
  let productEntries = [];

  try {
    const products = await fetchAllProducts();
    productEntries = products.map((product) => ({
      loc: `/products/${product.slug}`,
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: product.updated_at
        ? new Date(product.updated_at).toISOString().split('T')[0]
        : undefined,
    }));
    console.log(`Sitemap: included ${productEntries.length} product URL(s).`);
  } catch (error) {
    console.warn(`Sitemap: could not fetch products (${error.message}). Static pages only.`);
  }

  const xml = buildXml([...STATIC_PAGES, ...productEntries]);
  const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`Sitemap written to ${outputPath}`);
}

main().catch((error) => {
  console.error('Sitemap generation failed:', error);
  process.exit(1);
});
