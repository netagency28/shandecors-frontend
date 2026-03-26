export const optimizeImageUrl = (url, options = {}) => {
  if (!url || typeof url !== 'string') return '/placeholder.jpg';

  const { width, quality = 72, format = 'webp' } = options;

  // Keep data/blob URLs untouched
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  try {
    const parsed = new URL(url);
    if (width) parsed.searchParams.set('width', String(width));
    if (quality) parsed.searchParams.set('quality', String(quality));
    if (format) parsed.searchParams.set('format', format);
    return parsed.toString();
  } catch {
    return url;
  }
};

