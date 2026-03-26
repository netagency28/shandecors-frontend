import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Edit, Trash2, Search,
  Package, MoreVertical, Tags
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import AdminRoute from '../../components/admin/AdminRoute';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { createCategory, deleteCategory, getAdminProducts, getCategories, deleteProduct, bulkDeleteProducts } from '../../lib/api';
import AdminLayout from '../../components/admin/AdminLayout';

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export default function AdminProducts() {
  return (
    <AdminRoute>
      <AdminProductsContent />
    </AdminRoute>
  );
}

function AdminProductsContent() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '' });
  const [categorySaving, setCategorySaving] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        getAdminProducts({ limit: 200 }),
        getCategories(),
      ]);
      setProducts(productsRes.data.products || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching products/categories:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct(deleteId);
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      setSelectedIds((prev) => prev.filter((id) => id !== deleteId));
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setDeleteId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) =>
      p.name?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q)
    );
  }, [products, search]);

  const allVisibleSelected = filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.includes(p.id));

  const toggleSelectAllVisible = (checked) => {
    if (checked) {
      const next = new Set(selectedIds);
      filteredProducts.forEach((p) => next.add(p.id));
      setSelectedIds(Array.from(next));
      return;
    }
    const visible = new Set(filteredProducts.map((p) => p.id));
    setSelectedIds((prev) => prev.filter((id) => !visible.has(id)));
  };

  const toggleSelect = (id, checked) => {
    setSelectedIds((prev) => {
      if (checked) return [...prev, id];
      return prev.filter((x) => x !== id);
    });
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    try {
      await bulkDeleteProducts(selectedIds);
      setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCategorySaving(true);
    try {
      const payload = {
        name: categoryForm.name,
        slug: categoryForm.slug || slugify(categoryForm.name),
        description: categoryForm.description || null,
      };
      await createCategory(payload);
      setCategoryForm({ name: '', slug: '', description: '' });
      await fetchAll();
    } catch (error) {
      console.error('Create category failed:', error);
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      await fetchAll();
    } catch (error) {
      console.error('Delete category failed:', error);
    }
  };

  return (
    <AdminLayout
      title="Products"
      subtitle="Manage catalog, categories, and stock"
      actions={(
        <>
          <Button variant="outline" className="rounded-none" onClick={() => setShowCategoryDialog(true)}>
            <Tags size={16} className="mr-2" />
            Categories
          </Button>
          <Link to="/admin/products/new">
            <Button className="rounded-none bg-foreground text-background hover:bg-foreground/90" data-testid="add-product-btn">
              <Plus size={16} className="mr-2" />
              Add Product
            </Button>
          </Link>
        </>
      )}
    >
      <div className="max-w-[1300px]" data-testid="admin-products-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="relative max-w-md w-full">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-none"
                data-testid="search-products"
              />
            </div>
            {selectedIds.length > 0 && (
              <Button variant="destructive" className="rounded-none md:ml-auto" onClick={handleBulkDelete}>
                <Trash2 size={16} className="mr-2" />
                Delete Selected ({selectedIds.length})
              </Button>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-secondary animate-pulse rounded-sm" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-background rounded-sm">
              <Package size={48} className="mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground mb-4">No products found</p>
              <Link to="/admin/products/new">
                <Button className="rounded-none">Add Your First Product</Button>
              </Link>
            </div>
          ) : (
            <div className="bg-background rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4 font-medium text-sm">
                        <Checkbox checked={allVisibleSelected} onCheckedChange={toggleSelectAllVisible} />
                      </th>
                      <th className="text-left p-4 font-medium text-sm">Product</th>
                      <th className="text-left p-4 font-medium text-sm">Category</th>
                      <th className="text-left p-4 font-medium text-sm">Price</th>
                      <th className="text-left p-4 font-medium text-sm">Stock Qty</th>
                      <th className="text-left p-4 font-medium text-sm">Status</th>
                      <th className="text-right p-4 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b border-border last:border-0" data-testid={`product-row-${product.id}`}>
                        <td className="p-4">
                          <Checkbox
                            checked={selectedIds.includes(product.id)}
                            onCheckedChange={(checked) => toggleSelect(product.id, checked === true)}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-secondary rounded-sm overflow-hidden flex-shrink-0">
                              {product.images?.[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package size={20} className="text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">{product.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{product.category?.name || '-'}</td>
                        <td className="p-4">
                          <p className="font-medium">₹{product.price?.toLocaleString()}</p>
                          {product.sale_price && (
                            <p className="text-sm text-accent">Sale: ₹{product.sale_price.toLocaleString()}</p>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={product.stock > 5 ? 'text-green-600' : 'text-red-600 font-medium'}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge variant={product.is_active ? 'default' : 'secondary'}>
                            {product.is_active ? 'Active' : 'Draft'}
                          </Badge>
                          {product.is_featured && (
                            <Badge variant="outline" className="ml-2">Featured</Badge>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`product-actions-${product.id}`}>
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/admin/products/${product.id}`}>
                                  <Edit size={16} className="mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/products/${product.slug}`} target="_blank">
                                  <Package size={16} className="mr-2" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteId(product.id)}
                              >
                                <Trash2 size={16} className="mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-none bg-destructive hover:bg-destructive/90"
              data-testid="confirm-delete-btn"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCategory} className="space-y-3">
            <Input
              placeholder="Category name (e.g. Decor)"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value, slug: slugify(e.target.value) }))}
              required
              className="rounded-none"
            />
            <Input
              placeholder="Slug"
              value={categoryForm.slug}
              onChange={(e) => setCategoryForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
              required
              className="rounded-none"
            />
            <Input
              placeholder="Description (optional)"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
              className="rounded-none"
            />
            <Button type="submit" className="rounded-none w-full" disabled={categorySaving}>
              {categorySaving ? 'Saving...' : 'Create Category'}
            </Button>
          </form>

          <div className="mt-4 space-y-2 max-h-48 overflow-auto">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between border border-border px-3 py-2">
                <div>
                  <p className="font-medium text-sm">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">{cat.slug}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteCategory(cat.id)}>
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
