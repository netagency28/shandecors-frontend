import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { getContentPage, submitContactInquiry } from '../lib/api';

export default function ContactPage() {
  const [page, setPage] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getContentPage('contact');
        setPage(response.data);
      } catch {
        setError('Unable to load contact details right now.');
      } finally {
        setLoadingPage(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await submitContactInquiry(form);
      setSuccess('Thanks! We received your message and will contact you shortly.');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit your message. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen py-10 md:py-14 px-4 md:px-8 lg:px-12">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-background border border-border p-6 md:p-10"
          >
            <h1 className="font-display text-3xl md:text-4xl mb-3">{page?.title || 'Contact Us'}</h1>
            {page?.updated_at ? (
              <p className="text-sm text-muted-foreground mb-8">
                Last updated: {new Date(page.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            ) : null}

            {loadingPage ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <div className="space-y-5 text-base leading-7 whitespace-pre-line">{page?.body || ''}</div>
            )}
          </motion.article>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="bg-background border border-border p-6 md:p-10"
          >
            <h2 className="font-display text-2xl md:text-3xl mb-2">Send Us A Message</h2>
            <p className="text-sm text-muted-foreground mb-6">Share your query and our team will get back to you.</p>

            {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
            {success ? <p className="mb-4 text-sm text-green-600">{success}</p> : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="mt-1 rounded-none"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-1 rounded-none"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="mt-1 rounded-none"
                />
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  className="mt-1 rounded-none min-h-[160px]"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90"
              >
                {saving ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

