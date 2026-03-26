import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Plus, X, Upload, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { getProductById, createProduct, updateProduct, getCategories, uploadSingle } from '../../lib/api';
import AdminRoute from '../../components/admin/AdminRoute';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminProductForm() {
  return (
    <AdminRoute>
      <AdminProductFormContent />
    </AdminRoute>
  );
}

function AdminProductFormContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    comparePrice: '',
    sku: '',
    stock: 0,
    categoryId: '',
    images: [],
    tags: [],
    isActive: true,
    isFeatured: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catResponse = await getCategories();
        setCategories(catResponse.data || []);
        
        if (isEditing) {
          setLoading(true);
          const prodResponse = await getProductById(id);
          const product = prodResponse.data;
          setFormData({
            name: product.name || '',
            slug: product.slug || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            sale_price: product.sale_price?.toString() || '',
            category_id: product.category_id || '',
            images: product.images?.length > 0 ? product.images : [''],
            stock: product.stock?.toString() || '0',
            is_featured: product.is_featured || false,
            is_active: product.is_active !== false
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages.length > 0 ? newImages : [''] }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadSingle(file, 'product');
      const imageUrl = response.data?.data?.url;
      if (imageUrl) {
        setFormData((prev) => {
          const next = [...(prev.images || [])];
          const emptyIndex = next.findIndex((img) => !img);
          if (emptyIndex >= 0) {
            next[emptyIndex] = imageUrl;
          } else {
            next.push(imageUrl);
          }
          return { ...prev, images: next };
        });
      }
    } catch (uploadErr) {
      console.error('Image upload failed:', uploadErr);
      setError('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: parseFloat(formData.price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        category_id: formData.category_id,
        images: formData.images.filter(img => img.trim() !== ''),
        stock: parseInt(formData.stock) || 0,
        is_featured: formData.is_featured,
        is_active: formData.is_active
      };

      if (isEditing) {
        await updateProduct(id, productData);
      } else {
        await createProduct(productData);
      }
      
      navigate('/admin/products');
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.detail || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title={isEditing ? 'Edit Product' : 'New Product'}>
        <div className="animate-pulse space-y-4 max-w-2xl">
          <div className="h-8 bg-secondary rounded w-48" />
          <div className="h-12 bg-secondary rounded" />
          <div className="h-32 bg-secondary rounded" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isEditing ? 'Edit Product' : 'New Product'}
      subtitle="Create and manage product details"
      actions={(
        <Button 
          onClick={handleSubmit}
          disabled={saving}
          className="rounded-none bg-foreground text-background hover:bg-foreground/90"
          data-testid="save-product-btn"
        >
          <Save size={16} className="mr-2" />
          {saving ? 'Saving...' : 'Save Product'}
        </Button>
      )}
    >
      <div className="max-w-screen-lg" data-testid="admin-product-form">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive text-sm rounded-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="bg-background p-6 rounded-sm space-y-4">
              <h2 className="font-display text-lg mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 rounded-none"
                    data-testid="product-name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    className="mt-1 rounded-none"
                    data-testid="product-slug-input"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="mt-1 rounded-none"
                  data-testid="product-description-input"
                />
              </div>

              <div>
                <Label htmlFor="category_id">Category *</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger className="mt-1 rounded-none" data-testid="product-category-select">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-background p-6 rounded-sm space-y-4">
              <h2 className="font-display text-lg mb-4">Pricing & Inventory</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="mt-1 rounded-none"
                    data-testid="product-price-input"
                  />
                </div>
                <div>
                  <Label htmlFor="sale_price">Sale Price (₹)</Label>
                  <Input
                    id="sale_price"
                    name="sale_price"
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={handleChange}
                    className="mt-1 rounded-none"
                    data-testid="product-sale-price-input"
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    className="mt-1 rounded-none"
                    data-testid="product-stock-input"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-background p-6 rounded-sm space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg">Images</h2>
                <div className="flex items-center gap-2">
                  <input
                    id="product-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-none"
                    onClick={() => document.getElementById('product-image-upload')?.click()}
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 size={16} className="mr-1 animate-spin" /> : <Upload size={16} className="mr-1" />}
                    Upload
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addImageField}
                    className="rounded-none"
                  >
                    <Plus size={16} className="mr-1" />
                    Add URL
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                {formData.images.map((img, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={img}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder="Image URL"
                      className="flex-1 rounded-none"
                      data-testid={`product-image-${index}`}
                    />
                    {formData.images.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeImageField(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              {formData.images[0] && (
                <div className="flex gap-2 mt-4">
                  {formData.images.filter(img => img).slice(0, 4).map((img, i) => (
                    <div key={i} className="w-20 h-20 bg-secondary rounded-sm overflow-hidden">
                      <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="bg-background p-6 rounded-sm space-y-4">
              <h2 className="font-display text-lg mb-4">Settings</h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Active</Label>
                  <p className="text-sm text-muted-foreground">Product is visible in store</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  data-testid="product-active-switch"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Featured</Label>
                  <p className="text-sm text-muted-foreground">Show on homepage</p>
                </div>
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                  data-testid="product-featured-switch"
                />
              </div>
            </div>

            {/* Submit (mobile) */}
            <div className="md:hidden">
              <Button 
                type="submit"
                disabled={saving}
                className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 py-6"
              >
                <Save size={16} className="mr-2" />
                {saving ? 'Saving...' : 'Save Product'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
