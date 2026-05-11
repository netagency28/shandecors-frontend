import { useEffect, useMemo, useState } from 'react';
import { Search, Users as UsersIcon, Pencil, Trash2 } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import AdminRoute from '../../components/admin/AdminRoute';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAdminUsers, updateAdminUser, deleteAdminUser } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminUsers() {
  return (
    <AdminRoute>
      <AdminUsersContent />
    </AdminRoute>
  );
}

function AdminUsersContent() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Edit state
  const [editTarget, setEditTarget] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('CUSTOMER');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadUsers = async () => {
    try {
      const response = await getAdminUsers();
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter((u) =>
      u.email?.toLowerCase().includes(q) ||
      u.name?.toLowerCase().includes(q) ||
      u.id?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const openEdit = (user) => {
    setEditTarget(user);
    setEditName(user.name || '');
    setEditRole(user.role);
    setEditError('');
  };

  const closeEdit = () => { setEditTarget(null); setEditError(''); };

  const handleEditSave = async () => {
    if (!editTarget) return;
    setEditSaving(true);
    setEditError('');
    try {
      const response = await updateAdminUser(editTarget.id, {
        name: editName.trim() || undefined,
        role: editRole,
      });
      setUsers((prev) => prev.map((u) => u.id === editTarget.id ? { ...u, ...response.data } : u));
      closeEdit();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setEditSaving(false);
    }
  };

  const openDelete = (user) => {
    setDeleteTarget(user);
    setDeleteError('');
  };

  const closeDelete = () => { setDeleteTarget(null); setDeleteError(''); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteAdminUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      closeDelete();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete user.');
      setDeleteLoading(false);
    }
  };

  return (
    <AdminLayout title="Users" subtitle="View and manage registered users">
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
                <th className="text-right p-4 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isSelf = user.id === currentUser?.id;
                return (
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
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(user)}
                          className="h-8 w-8 p-0"
                          title="Edit user"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDelete(user)}
                          disabled={isSelf}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-30"
                          title={isSelf ? 'Cannot delete your own account' : 'Delete user'}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) closeEdit(); }}>
        <DialogContent className="sm:max-w-md rounded-none" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {editError && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2">{editError}</p>
            )}
            <div>
              <Label htmlFor="edit-email" className="text-xs text-muted-foreground">Email</Label>
              <p id="edit-email" className="text-sm mt-1">{editTarget?.email}</p>
            </div>
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1 rounded-none"
                placeholder="Display name"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <select
                id="edit-role"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="mt-1 w-full border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="rounded-none" onClick={closeEdit} disabled={editSaving}>
              Cancel
            </Button>
            <Button className="rounded-none" onClick={handleEditSave} disabled={editSaving}>
              {editSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) closeDelete(); }}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name || deleteTarget?.email}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 -mt-2">{deleteError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none" onClick={closeDelete} disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
