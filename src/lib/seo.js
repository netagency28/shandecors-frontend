export const SITE_URL = 'https://www.shandecors.store';
export const SITE_NAME = 'Shan Decor';
export const DEFAULT_DESCRIPTION =
  'Shan Decor – Premium Home Décor. Shop handcrafted furniture, décor, and accessories for your home.';
export const DEFAULT_OG_IMAGE =
  'https://qkrcnxrabkmqrnlplagf.supabase.co/storage/v1/object/public/uploads/logos/shandecors_column_logo.png';

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

const STATIC_ROUTES = {
  '/': {
    title: 'Premium Home Décor',
    description: DEFAULT_DESCRIPTION,
  },
  '/about': {
    title: 'About Us',
    description:
      'Learn about Shan Decor — handcrafted home décor made by skilled artisans across India.',
  },
  '/products': {
    title: 'Shop All Products',
    description:
      'Browse our collection of handcrafted furniture, décor, and home accessories.',
  },
  '/contact': {
    title: 'Contact Us',
    description: 'Get in touch with Shan Decor for orders, enquiries, and support.',
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
    title: 'Refunds & Cancellation Policy',
    description: 'Refund and cancellation policy for Shan Decor orders.',
  },
  '/shipping-policy': {
    title: 'Shipping Policy',
    description: 'Shipping timelines, coverage, and delivery information for Shan Decor.',
  },
};

export function isNoIndexPath(pathname) {
  return NOINDEX_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function getSeoForPath(pathname) {
  if (isNoIndexPath(pathname)) {
    return { noindex: true, path: pathname };
  }

  if (STATIC_ROUTES[pathname]) {
    return { ...STATIC_ROUTES[pathname], path: pathname };
  }

  if (pathname.startsWith('/products/') && pathname !== '/products/') {
    return { path: pathname };
  }

  return { noindex: true, path: pathname, title: 'Page Not Found' };
}

export function buildProductJsonLd(product, { avgRating, totalReviews } = {}) {
  if (!product) return null;

  const price = product.sale_price || product.price;
  const images = (product.images || []).filter((url) => url && !/\.(mp4|webm|mov|avi|ogg)(\?.*)?$/i.test(url));

  const jsonLd = {
    '@context': 'https://schema.org',
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
