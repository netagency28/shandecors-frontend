import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { isAuthenticated, user, profile, updateProfile, refreshMe } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const me = await refreshMe();
        setName(me?.name || '');
        setPhone(me?.phone || '');
      } catch (_e) {
        setName(profile?.name || user?.name || '');
        setPhone(profile?.phone || '');
      }
    };

    if (isAuthenticated) {
      load();
    }
  }, [isAuthenticated, profile, user, refreshMe]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    const result = await updateProfile({ name, phone });
    if (result?.error) {
      setError(result.error);
    } else {
      setMessage('Profile updated successfully.');
    }

    setSaving(false);
  };

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 lg:px-12" data-testid="profile-page">
      <div className="container mx-auto max-w-screen-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-border/40 p-6 md:p-8"
        >
          <h1 className="font-display text-3xl mb-2">My Profile</h1>
          <p className="text-muted-foreground mb-8">Manage your account details.</p>

          {message && <div className="mb-4 p-3 bg-green-500/10 text-green-700 text-sm">{message}</div>}
          {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm">{error}</div>}

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <Label className="mb-2 block">Email</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={user?.email || ''} disabled className="pl-9 rounded-none bg-secondary/30" />
              </div>
            </div>

            <div>
              <Label htmlFor="profile-name" className="mb-2 block">Full Name</Label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 rounded-none"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="profile-phone" className="mb-2 block">Phone</Label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="profile-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9 rounded-none"
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link to="/orders" className="text-sm text-muted-foreground hover:text-foreground">
                View Orders
              </Link>
              <Button type="submit" disabled={saving} className="rounded-none bg-foreground text-background hover:bg-foreground/90">
                <Save size={16} className="mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
