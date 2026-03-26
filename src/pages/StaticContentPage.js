import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getContentPage } from '../lib/api';

export default function StaticContentPage({ slug, fallbackTitle }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getContentPage(slug);
        setPage(response.data);
      } catch (_err) {
        setError('Unable to load this page right now.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  return (
    <div className="min-h-screen py-10 md:py-14 px-4 md:px-8 lg:px-12">
      <div className="container mx-auto max-w-4xl">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-background border border-border p-6 md:p-10"
        >
          <h1 className="font-display text-3xl md:text-4xl mb-3">{page?.title || fallbackTitle}</h1>
          {page?.updated_at ? (
            <p className="text-sm text-muted-foreground mb-8">
              Last updated: {new Date(page.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          ) : null}

          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : (
            <div className="space-y-5 text-base leading-7 whitespace-pre-line">{page?.body || ''}</div>
          )}
        </motion.article>
      </div>
    </div>
  );
}

