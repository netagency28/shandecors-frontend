import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import AdminRoute from '../../components/admin/AdminRoute';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAdminContent, updateAdminContent } from '../../lib/api';

const contentKeys = ['contact', 'terms', 'refunds', 'shipping'];

const prettyNames = {
  contact: 'Contact Us',
  terms: 'Terms and Conditions',
  refunds: 'Refunds and Cancellation Policy',
  shipping: 'Shipping Policy',
};

export default function AdminContent() {
  return (
    <AdminRoute>
      <AdminContentBody />
    </AdminRoute>
  );
}

function AdminContentBody() {
  const [content, setContent] = useState({});
  const [activeSlug, setActiveSlug] = useState('contact');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getAdminContent();
        setContent(response.data || {});
      } catch (error) {
        console.error('Failed to load content:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const activeEntry = useMemo(
    () => content[activeSlug] || { title: prettyNames[activeSlug], body: '', updated_at: null },
    [content, activeSlug],
  );

  const updateField = (field, value) => {
    setContent((prev) => ({
      ...prev,
      [activeSlug]: {
        ...(prev[activeSlug] || {}),
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        title: activeEntry.title || prettyNames[activeSlug],
        body: activeEntry.body || '',
      };
      const response = await updateAdminContent(activeSlug, payload);
      setContent((prev) => ({ ...prev, [activeSlug]: response.data }));
      setMessage('Saved successfully.');
    } catch (error) {
      console.error('Failed to save content:', error);
      setMessage('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Site Content"
      subtitle="Edit footer pages visible to customers"
      actions={(
        <Button onClick={handleSave} disabled={saving} className="rounded-none bg-foreground text-background hover:bg-foreground/90">
          <Save size={16} className="mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      )}
    >
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-secondary animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
          <div className="bg-background border border-border p-2 h-fit">
            {contentKeys.map((slug) => (
              <button
                key={slug}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm ${
                  activeSlug === slug ? 'bg-foreground text-background' : 'hover:bg-secondary/70'
                }`}
                onClick={() => {
                  setActiveSlug(slug);
                  setMessage('');
                }}
              >
                {prettyNames[slug]}
              </button>
            ))}
          </div>

          <div className="bg-background border border-border p-5 space-y-4">
            <div>
              <Label className="mb-2 block">Page Title</Label>
              <Input
                value={activeEntry.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="rounded-none"
              />
            </div>

            <div>
              <Label className="mb-2 block">Page Content</Label>
              <Textarea
                value={activeEntry.body || ''}
                onChange={(e) => updateField('body', e.target.value)}
                className="rounded-none min-h-[360px]"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Last updated: {activeEntry.updated_at ? new Date(activeEntry.updated_at).toLocaleString('en-IN') : 'Never'}
            </p>
            {message ? <p className="text-sm">{message}</p> : null}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

