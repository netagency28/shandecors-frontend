import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, X, Upload, Loader2, Film, Image, Link as LinkIcon, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import { getProductById, createProduct, updateProduct, getCategories, uploadSingle } from '../../lib/api';
import AdminRoute from '../../components/admin/AdminRoute';
import AdminLayout from '../../components/admin/AdminLayout';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const isVideoUrl = (url) => /\.(mp4|webm|mov|avi|ogg)(\?.*)?$/i.test(url);

// ── MediaUploader ──────────────────────────────────────────────────────────────
function MediaUploader({ urls, onChange, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [urlInput, setUrlInput] = useState('');
  const [urlMode, setUrlMode] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(null); // index of item in lightbox
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleFiles = useCallback(async (fileList) => {
    const files = Array.from(fileList);
    if (!files.length) return;

    const validTypes = /^(image\/(jpeg|png|gif|webp)|video\/(mp4|webm|quicktime|x-msvideo|ogg))$/;
    const invalid = files.filter((f) => !validTypes.test(f.type));
    if (invalid.length) {
      setUploadError(`Unsupported file type: ${invalid.map((f) => f.name).join(', ')}`);
      return;
    }

    setUploadError('');
    setUploading(true);
    setUploadCount(files.length);

    try {
      // Upload one at a time (avoids hitting multipart limits)
      const uploaded = [];
      for (const file of files) {
        const res = await uploadSingle(file, file.type.startsWith('video/') ? 'video' : 'product');
        const url = res.data?.data?.url;
        if (url) uploaded.push(url);
      }
      onChange([...urls, ...uploaded]);
    } catch (err) {
      setUploadError(err.response?.data?.error?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadCount(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [urls, onChange]);

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const remove = (index) => onChange(urls.filter((_, i) => i !== index));

  const move = (from, dir) => {
    const to = from + dir;
    if (to < 0 || to >= urls.length) return;
    const next = [...urls];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  };

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onChange([...urls, trimmed]);
    setUrlInput('');
    setUrlMode(false);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors
          ${isDragging ? 'border-foreground bg-secondary/40' : 'border-border hover:border-foreground/40 hover:bg-secondary/20'}
          ${disabled ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime,video/ogg"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={32} className="animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Uploading {uploadCount} file{uploadCount !== 1 ? 's' : ''}…
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <div className="flex gap-3 mb-1">
              <Image size={28} className="text-muted-foreground/60" />
              <Film size={28} className="text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium">Drag &amp; drop images or videos here</p>
            <p className="text-xs text-muted-foreground">or click to browse · JPEG, PNG, GIF, WebP, MP4, WebM, MOV · Max 100 MB each</p>
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2">{uploadError}</p>
      )}

      {/* Preview grid */}
      {urls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {urls.map((url, index) => (
            <div
              key={index}
              className="group relative bg-secondary rounded-sm overflow-hidden aspect-square"
            >
              {isVideoUrl(url) ? (
                <video
                  src={url}
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  onMouseEnter={(e) => e.target.play()}
                  onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                />
              ) : (
                <img src={url} alt={`Media ${index + 1}`} className="w-full h-full object-cover" />
              )}

              {/* Badge */}
              <div className="absolute top-1.5 left-1.5">
                {isVideoUrl(url)
                  ? <span className="bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1"><Film size={10} /> Video</span>
                  : index === 0 && <span className="bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded">Cover</span>
                }
              </div>

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                {/* Preview */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPreviewIndex(index); }}
                  className="w-7 h-7 bg-white/90 text-foreground rounded-full flex items-center justify-center hover:bg-white"
                  title="Preview"
                >
                  <Eye size={13} />
                </button>
                {/* Move left */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); move(index, -1); }}
                  disabled={index === 0}
                  className="w-7 h-7 bg-white/90 text-foreground rounded-full flex items-center justify-center hover:bg-white disabled:opacity-30"
                  title="Move left"
                >
                  <ChevronLeft size={13} />
                </button>
                {/* Move right */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); move(index, 1); }}
                  disabled={index === urls.length - 1}
                  className="w-7 h-7 bg-white/90 text-foreground rounded-full flex items-center justify-center hover:bg-white disabled:opacity-30"
                  title="Move right"
                >
                  <ChevronRight size={13} />
                </button>
                {/* Remove */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); remove(index); }}
                  className="w-7 h-7 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/80"
                  title="Remove"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* URL input toggle */}
      <div>
        {urlMode ? (
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste image or video URL…"
              className="rounded-none flex-1"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }}
            />
            <Button type="button" variant="outline" className="rounded-none" onClick={addUrl}>Add</Button>
            <Button type="button" variant="ghost" className="rounded-none" onClick={() => setUrlMode(false)}>Cancel</Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setUrlMode(true)}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 flex items-center gap-1"
          >
            <LinkIcon size={11} /> Add by URL instead
          </button>
        )}
      </div>

      {/* Lightbox preview */}
      <Dialog open={previewIndex !== null} onOpenChange={(open) => { if (!open) setPreviewIndex(null); }}>
        <DialogContent className="max-w-3xl p-2 bg-black border-0" aria-describedby={undefined}>
          {previewIndex !== null && (
            isVideoUrl(urls[previewIndex]) ? (
              <video
                src={urls[previewIndex]}
                controls
                autoPlay
                className="w-full max-h-[80vh] object-contain"
              />
            ) : (
              <img
                src={urls[previewIndex]}
                alt="Preview"
                className="w-full max-h-[80vh] object-contain"
              />
            )
          )}
          {/* Lightbox nav */}
          {urls.length > 1 && (
            <div className="flex justify-center gap-3 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-white hover:bg-white/20"
                onClick={() => setPreviewIndex((i) => Math.max(0, i - 1))}
                disabled={previewIndex === 0}
              >
                <ChevronLeft size={18} /> Prev
              </Button>
              <span className="text-white/60 text-sm self-center">{previewIndex + 1} / {urls.length}</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-white hover:bg-white/20"
                onClick={() => setPreviewIndex((i) => Math.min(urls.length - 1, i + 1))}
                disabled={previewIndex === urls.length - 1}
              >
                Next <ChevronRight size={18} />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Main form ──────────────────────────────────────────────────────────────────
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

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    sale_price: '',
    stock: '0',
    category_id: '',
    images: [],
    tags: [],
    is_active: true,
    is_featured: false,
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
            images: product.images || [],
            stock: product.stock?.toString() || '0',
            is_featured: product.is_featured || false,
            is_active: product.is_active !== false,
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'name') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value }));
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['clean']
    ]
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align'
  ];

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
        images: formData.images.filter((u) => u.trim() !== ''),
        stock: parseInt(formData.stock) || 0,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
      };

      if (isEditing) {
        await updateProduct(id, productData);
      } else {
        await createProduct(productData);
      }
      navigate('/admin/products');
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to save product');
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
          {saving ? 'Saving…' : 'Save Product'}
        </Button>
      )}
    >
      <div className="max-w-screen-lg" data-testid="admin-product-form">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive text-sm rounded-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Basic Info */}
            <div className="bg-background p-6 rounded-sm space-y-4">
              <h2 className="font-display text-lg mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 rounded-none" data-testid="product-name-input" />
                </div>
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input id="slug" name="slug" value={formData.slug} onChange={handleChange} required className="mt-1 rounded-none" data-testid="product-slug-input" />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <div className="mt-1">
                  <ReactQuill
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    modules={quillModules}
                    formats={quillFormats}
                    className="bg-background rounded-none [&_.ql-toolbar]:border-border [&_.ql-container]:border-border [&_.ql-editor]:min-h-[150px] [&_.ql-editor]:font-sans"
                    data-testid="product-description-input"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category_id">Category *</Label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData((prev) => ({ ...prev, category_id: value }))}>
                  <SelectTrigger className="mt-1 rounded-none" data-testid="product-category-select">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
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
                  <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required className="mt-1 rounded-none" data-testid="product-price-input" />
                </div>
                <div>
                  <Label htmlFor="sale_price">Sale Price (₹)</Label>
                  <Input id="sale_price" name="sale_price" type="number" step="0.01" value={formData.sale_price} onChange={handleChange} className="mt-1 rounded-none" data-testid="product-sale-price-input" />
                </div>
                <div>
                  <Label htmlFor="stock">Stock *</Label>
                  <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} required className="mt-1 rounded-none" data-testid="product-stock-input" />
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="bg-background p-6 rounded-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display text-lg">Images &amp; Videos</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formData.images.length > 0
                      ? `${formData.images.length} file${formData.images.length !== 1 ? 's' : ''} · first image is the cover`
                      : 'Add product images and/or a demo video'}
                  </p>
                </div>
                {formData.images.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={() => setFormData((prev) => ({ ...prev, images: [] }))}
                  >
                    Clear all
                  </Button>
                )}
              </div>
              <MediaUploader
                urls={formData.images}
                onChange={(next) => setFormData((prev) => ({ ...prev, images: next }))}
              />
            </div>

            {/* Settings */}
            <div className="bg-background p-6 rounded-sm space-y-4">
              <h2 className="font-display text-lg mb-4">Settings</h2>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Active</Label>
                  <p className="text-sm text-muted-foreground">Product is visible in store</p>
                </div>
                <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))} data-testid="product-active-switch" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Featured</Label>
                  <p className="text-sm text-muted-foreground">Show on homepage</p>
                </div>
                <Switch checked={formData.is_featured} onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_featured: checked }))} data-testid="product-featured-switch" />
              </div>
            </div>

            {/* Mobile submit */}
            <div className="md:hidden">
              <Button type="submit" disabled={saving} className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 py-6">
                <Save size={16} className="mr-2" />
                {saving ? 'Saving…' : 'Save Product'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
