import { HOME_FAQS } from './faqs';

export const SITE_URL = 'https://www.shandecors.store';
export const SITE_NAME = 'Shan Decor';
export const SITE_TAGLINE = 'Handcrafted Lamps & Home Decor for Indian Homes';
export const SITE_LOGO_URL =
  'https://qkrcnxrabkmqrnlplagf.supabase.co/storage/v1/object/public/uploads/logos/shandecors_column_logo.png';
export const DEFAULT_TITLE = `${SITE_NAME} – ${SITE_TAGLINE}`;
export const DEFAULT_DESCRIPTION =
  "Discover Shan Decor's curated collection of handcrafted lamps, wall art, and home decor. Thoughtfully designed for Indian interiors. Pan-India delivery. Shop now.";
export const DEFAULT_OG_DESCRIPTION =
  'Handcrafted lamps and home decor, curated for Indian homes. Explore our festive and everyday collections at Shan Decor.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/hero/1.jpg`;
export const THEME_COLOR = '#C4744A';
export const OG_LOCALE = 'en_IN';

const NOINDEX_PREFIXES = [
  '/admin',
  '/login',
  '/signup',
  '/reset-password',
  '/auth/callback',
  '/checkout',
  '/payment',
  '/orders',
  '/profile',
  '/wishlist',
];

const CATEGORY_SEO = {
  lamps: {
    title: 'Handcrafted Lamps',
    description:
      'Shop handcrafted table lamps, pendant lights, floor lamps, and wall sconces from Shan Decor. Artisan lighting for Indian homes. Free shipping above ₹999.',
  },
  vases: {
    title: 'Decorative Vases',
    description:
      'Explore handcrafted decorative vases from Shan Decor — artisan-made pieces for modern and classic Indian interiors. Pan-India delivery.',
  },
  accessories: {
    title: 'Home Decor Accessories',
    description:
      'Browse handcrafted home decor accessories from Shan Decor. Curated accents to complement your living spaces. Pan-India shipping available.',
  },
};

const STATIC_ROUTES = {
  '/': {
    fullTitle: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    ogDescription: DEFAULT_OG_DESCRIPTION,
  },
  '/about': {
    title: 'About Us',
    description:
      'Shan Decor celebrates Indian craftsmanship — handcrafted lamps and home decor made by skilled artisans. Pan-India delivery.',
  },
  '/products': {
    title: 'Shop Handcrafted Lamps & Decor',
    description:
      'Browse Shan Decor\'s collection of handcrafted table lamps, pendant lights, wall sconces, vases, and home accents. Pan-India shipping on orders above ₹999.',
  },
  '/contact': {
    title: 'Contact Us',
    description:
      'Contact Shan Decor for orders, custom lamp requests, and support. Based in Salem, Tamil Nadu — serving homes across India.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy',
    description: 'How Shan Decor collects, uses, and protects your personal information.',
  },
  '/terms-and-conditions': {
    title: 'Terms & Conditions',
    description: 'Terms and conditions for shopping at Shan Decor.',
  },
  '/refunds-cancellation-policy': {
    title: 'Returns & Refund Policy',
    description:
      'Shan Decor returns, exchanges, and refund policy. Clear timelines and process for Indian customers.',
  },
  '/shipping-policy': {
    title: 'Shipping Policy',
    description:
      'Pan-India shipping from Shan Decor. Delivery timelines, free shipping above ₹999, and order tracking information.',
  },
};

export function isNoIndexPath(pathname) {
  return NOINDEX_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function getSeoForPath(pathname, search = '') {
  if (isNoIndexPath(pathname)) {
    return { noindex: true, path: pathname };
  }

  if (pathname === '/products') {
    const category = new URLSearchParams(search).get('category');
    if (category && CATEGORY_SEO[category]) {
      return {
        ...CATEGORY_SEO[category],
        path: `/products?category=${category}`,
      };
    }
  }

  if (STATIC_ROUTES[pathname]) {
    return { ...STATIC_ROUTES[pathname], path: pathname };
  }

  if (pathname.startsWith('/products/') && pathname !== '/products/') {
    return { path: pathname };
  }

  return { noindex: true, path: pathname, title: 'Page Not Found' };
}

function buildFaqJsonLd() {
  const questions = HOME_FAQS.flatMap((section) => section.items);

  return {
    '@type': 'FAQPage',
    mainEntity: questions.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a,
      },
    })),
  };
}

export function buildBreadcrumbJsonLd(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function buildHomeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: SITE_LOGO_URL,
        description: DEFAULT_DESCRIPTION,
        address: {
          '@type': 'PostalAddress',
          streetAddress: '5th Cross Street, Periya Pudur, Near Sarada College Road',
          addressLocality: 'Salem',
          addressRegion: 'Tamil Nadu',
          postalCode: '636016',
          addressCountry: 'IN',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+91-9003342466',
          contactType: 'customer service',
          email: 'shandecor01@gmail.com',
          areaServed: 'IN',
          availableLanguage: ['English', 'Tamil'],
        },
        sameAs: ['https://www.instagram.com/shan.decorstore'],
      },
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        inLanguage: 'en-IN',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      buildFaqJsonLd(),
    ],
  };
}

export function buildProductJsonLd(product, { avgRating, totalReviews } = {}) {
  if (!product) return null;

  const price = product.sale_price || product.price;
  const images = (product.images || []).filter((url) => url && !/\.(mp4|webm|mov|avi|ogg)(\?.*)?$/i.test(url));

  const jsonLd = {
    '@type': 'Product',
    name: product.name,
    description: product.description || undefined,
    image: images.length > 0 ? images : undefined,
    sku: product.sku || undefined,
    url: `${SITE_URL}/products/${product.slug}`,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      price: String(price),
      priceCurrency: 'INR',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/products/${product.slug}`,
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
  };

  if (avgRating > 0 && totalReviews > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(avgRating),
      reviewCount: String(totalReviews),
    };
  }

  return jsonLd;
}

export function buildProductPageJsonLd(product, { avgRating, totalReviews } = {}) {
  const productLd = buildProductJsonLd(product, { avgRating, totalReviews });
  if (!productLd) return null;

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
  ];

  if (product.category?.slug) {
    breadcrumbs.push({
      name: product.category.name,
      path: `/products?category=${product.category.slug}`,
    });
  }

  breadcrumbs.push({
    name: product.name,
    path: `/products/${product.slug}`,
  });

  return {
    '@context': 'https://schema.org',
    '@graph': [buildBreadcrumbJsonLd(breadcrumbs), productLd],
  };
}

export function pushGtmPageView(path) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'page_view',
    page_path: path,
    page_location: `${SITE_URL}${path}`,
    page_title: document.title,
  });
}
