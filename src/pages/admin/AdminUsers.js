import { useEffect, useMemo, useState } from 'react';
import { Search, Users as UsersIcon } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import AdminRoute from '../../components/admin/AdminRoute';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAdminUsers } from '../../lib/api';

export default function AdminUsers() {
  return (
    <AdminRoute>
      <AdminUsersContent />
    </AdminRoute>
  );
}

function AdminUsersContent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getAdminUsers();
        setUsers(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter((u) =>
      u.email?.toLowerCase().includes(q) ||
      u.name?.toLowerCase().includes(q) ||
      u.id?.toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <AdminLayout title="Users" subtitle="View registered users and roles">
      <div className="relative max-w-md mb-5">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or user id..."
          className="pl-10 rounded-none"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-secondary animate-pulse" />)}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-background border border-border p-10 text-center">
          <UsersIcon size={40} className="mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No users found.</p>
        </div>
      ) : (
        <div className="bg-background border border-border overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/60">
              <tr>
                <th className="text-left p-4 text-sm">Name</th>
                <th className="text-left p-4 text-sm">Email</th>
                <th className="text-left p-4 text-sm">Role</th>
                <th className="text-left p-4 text-sm">User ID</th>
                <th className="text-left p-4 text-sm">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-border">
                  <td className="p-4 font-medium">{user.name || '-'}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="p-4 font-mono text-xs text-muted-foreground">{user.id}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}

