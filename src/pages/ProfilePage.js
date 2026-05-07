import { useEffect, useState, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Save, MapPin, Plus, Trash2, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { useAuth } from '../contexts/AuthContext';
import {
  getAddresses,
  createAddress,
  deleteAddress,
  setDefaultAddress,
} from '../lib/api';

const emptyAddress = {
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
};

export default function ProfilePage() {
  const { isAuthenticated, isLoading, user, profile, updateProfile, refreshMe } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const isAdmin = profile?.is_admin || user?.role === 'ADMIN';

  // Addresses state
  const [addresses, setAddresses] = useState([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState(emptyAddress);
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrErr, setAddrErr] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const me = await refreshMe();
        setName(me?.name || '');
        setPhone(me?.phone || '');
      } catch {
        setName(profile?.name || user?.name || '');
        setPhone(profile?.phone || '');
      }
    };
    if (isAuthenticated) load();
  }, [isAuthenticated, profile, user, refreshMe]);

  const fetchAddresses = useCallback(async () => {
    setAddrLoading(true);
    try {
      const res = await getAddresses();
      setAddresses(res.data || []);
    } catch {
      setAddresses([]);
    } finally {
      setAddrLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchAddresses();
  }, [isAuthenticated, fetchAddresses]);

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 px-4 md:px-8 lg:px-12">
        <div className="container mx-auto max-w-screen-md text-sm uppercase tracking-[0.18em] text-muted-foreground">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileMsg('');
    setProfileErr('');
    const result = await updateProfile({ name, phone });
    if (result?.error) {
      setProfileErr(result.error);
    } else {
      setProfileMsg('Profile updated successfully.');
    }
    setSaving(false);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddrSaving(true);
    setAddrErr('');
    try {
      await createAddress(newAddr);
      setNewAddr(emptyAddress);
      setShowAddForm(false);
      await fetchAddresses();
    } catch (err) {
      setAddrErr(err?.response?.data?.error || 'Failed to save address.');
    } finally {
      setAddrSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await deleteAddress(id);
      await fetchAddresses();
    } catch {
      // silently fail — addresses will still reflect correct state on next fetch
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      await fetchAddresses();
    } catch {
      // silently fail
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 lg:px-12" data-testid="profile-page">
      <div className="container mx-auto max-w-screen-md space-y-8">

        {/* Profile Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-border/40 p-6 md:p-8"
        >
          <h1 className="font-display text-3xl mb-2">My Profile</h1>
          <p className="text-muted-foreground mb-8">Manage your account details.</p>

          {profileMsg && <div className="mb-4 p-3 bg-green-500/10 text-green-700 text-sm">{profileMsg}</div>}
          {profileErr && <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm">{profileErr}</div>}

          <form onSubmit={handleSaveProfile} className="space-y-5">
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

        {/* Saved Addresses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white border border-border/40 p-6 md:p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl">Saved Addresses</h2>
              <p className="text-muted-foreground text-sm mt-1">Used to pre-fill checkout.</p>
            </div>
            {!showAddForm && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-none"
                onClick={() => setShowAddForm(true)}
              >
                <Plus size={14} className="mr-1" />
                Add Address
              </Button>
            )}
          </div>

          {/* Add address form */}
          {showAddForm && (
            <form onSubmit={handleAddAddress} className="mb-6 p-4 border border-dashed border-border space-y-3">
              <h3 className="text-sm font-medium uppercase tracking-widest">New Address</h3>
              {addrErr && <p className="text-destructive text-sm">{addrErr}</p>}
              <div>
                <Label htmlFor="addr-street">Street *</Label>
                <Input
                  id="addr-street"
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  required
                  className="mt-1 rounded-none"
                  placeholder="House / flat number, street name"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="addr-city">City *</Label>
                  <Input
                    id="addr-city"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    required
                    className="mt-1 rounded-none"
                  />
                </div>
                <div>
                  <Label htmlFor="addr-state">State *</Label>
                  <Input
                    id="addr-state"
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    required
                    className="mt-1 rounded-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="addr-postal">Postal Code *</Label>
                  <Input
                    id="addr-postal"
                    value={newAddr.postalCode}
                    onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                    required
                    className="mt-1 rounded-none"
                    maxLength={10}
                  />
                </div>
                <div>
                  <Label htmlFor="addr-country">Country</Label>
                  <Input
                    id="addr-country"
                    value={newAddr.country}
                    onChange={(e) => setNewAddr({ ...newAddr, country: e.target.value })}
                    className="mt-1 rounded-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={addrSaving} size="sm" className="rounded-none bg-foreground text-background hover:bg-foreground/90">
                  {addrSaving ? 'Saving...' : 'Save Address'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-none"
                  onClick={() => { setShowAddForm(false); setNewAddr(emptyAddress); setAddrErr(''); }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {addrLoading ? (
            <p className="text-sm text-muted-foreground">Loading addresses...</p>
          ) : addresses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No saved addresses yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr, i) => (
                <div key={addr.id}>
                  {i > 0 && <Separator className="mb-3" />}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="mt-0.5 flex-shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-sm leading-relaxed">
                          {addr.street}, {addr.city}, {addr.state} – {addr.postalCode}
                          {addr.country !== 'India' ? `, ${addr.country}` : ''}
                        </p>
                        {addr.isDefault && (
                          <span className="inline-flex items-center gap-1 mt-1 text-xs text-amber-600 font-medium">
                            <Star size={11} fill="currentColor" /> Default
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          className="text-xs text-muted-foreground hover:text-foreground underline"
                        >
                          Set default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Delete address"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
