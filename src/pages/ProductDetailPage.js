import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Minus, Plus, ShoppingBag, Heart, Check, ChevronRight,
  Star, Play, ZoomIn, X, ChevronLeft,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { getProduct, getProducts } from '../lib/api';
import { createReview, updateReview, getUserReview } from '../lib/api';

import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/product/ProductCard';
import ReviewForm from '../components/review/ReviewForm';
import ReviewsList from '../components/review/ReviewsList';
import { optimizeImageUrl } from '../lib/images';
import PageMeta from '../components/PageMeta';
import { buildProductJsonLd } from '../lib/seo';

// ─── helpers ──────────────────────────────────────────────────────────────────
const isVideoUrl = (url) => /\.(mp4|webm|mov|avi|ogg)(\?.*)?$/i.test(url || '');

const safeImgUrl = (url, opts) =>
  isVideoUrl(url) ? url : optimizeImageUrl(url, opts);

// ─── MediaGallery ──────────────────────────────────────────────────────────────
function MediaGallery({ images = [], productName }) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const videoRef = useRef(null);

  // Reset to first item when product changes
  useEffect(() => { setSelected(0); }, [images]);

  // Pause/reset video when switching away from a video slide
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [selected]);

  if (!images || images.length === 0) {
    return (
      <div className="bg-[#F5F5F5] aspect-square flex items-center justify-center text-muted-foreground">
        No media
      </div>
    );
  }

  const currentUrl = images[selected];
  const isVideo = isVideoUrl(currentUrl);

  const prev = () => setSelected((s) => Math.max(0, s - 1));
  const next = () => setSelected((s) => Math.min(images.length - 1, s + 1));

  return (
    <div>
      {/* ── Main viewer ── */}
      <div className="bg-[#F5F5F5] aspect-square relative overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full"
          >
            {isVideo ? (
              <video
                ref={videoRef}
                src={currentUrl}
                controls
                playsInline
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={safeImgUrl(currentUrl, { width: 1200, quality: 78 })}
                alt={productName}
                className="w-full h-full object-contain p-8"
                fetchpriority="high"
                decoding="async"
                data-testid="product-image"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows (shown when multiple items) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              disabled={selected === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              disabled={selected === images.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Zoom button for images */}
        {!isVideo && (
          <button
            onClick={() => setLightbox(true)}
            className="absolute top-3 right-3 w-9 h-9 bg-white/80 hover:bg-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            title="View full size"
          >
            <ZoomIn size={16} />
          </button>
        )}

        {/* Dot counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === selected ? 'bg-foreground' : 'bg-foreground/25'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {images.map((url, i) => {
            const vid = isVideoUrl(url);
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(i)}
                className={`relative flex-shrink-0 w-20 h-20 bg-[#F5F5F5] overflow-hidden border-2 transition-colors ${
                  selected === i ? 'border-foreground' : 'border-transparent hover:border-foreground/30'
                }`}
              >
                {vid ? (
                  <>
                    <video
                      src={url}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                      <Play size={16} className="text-white fill-white" />
                    </div>
                  </>
                ) : (
                  <img
                    src={safeImgUrl(url, { width: 160, quality: 65 })}
                    alt={`${productName} ${i + 1}`}
                    className="w-full h-full object-contain p-1"
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Lightbox ── */}
      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent className="max-w-4xl p-0 bg-black border-0 overflow-hidden" aria-describedby={undefined}>
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white rounded-full"
          >
            <X size={18} />
          </button>

          {images.length > 1 && (
            <>
              <button onClick={prev} disabled={selected === 0} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-20">
                <ChevronLeft size={20} />
              </button>
              <button onClick={next} disabled={selected === images.length - 1} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-20">
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <img
            src={safeImgUrl(currentUrl, { width: 1600, quality: 90 })}
            alt={productName}
            className="w-full max-h-[85vh] object-contain"
          />

          {images.length > 1 && (
            <p className="text-white/50 text-xs text-center py-2">{selected + 1} / {images.length}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewKey, setReviewKey] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await getProduct(slug);
        setProduct(response.data);

        if (response.data?.category_id) {
          const relatedRes = await getProducts({ category: response.data.category_id, limit: 5 });
          setRelatedProducts(
            relatedRes.data.products?.filter((p) => p.id !== response.data.id).slice(0, 4) || []
          );
        }

        if (isAuthenticated && response.data?.id) {
          try {
            const rv = await getUserReview(response.data.id);
            setUserReview(rv.data);
          } catch {
            setUserReview(null);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug, isAuthenticated]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const response = userReview
        ? await updateReview(userReview.id, reviewData)
        : await createReview(reviewData);
      setUserReview(response.data);
      setShowReviewForm(false);
      setReviewKey((k) => k + 1);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 lg:p-16 bg-white">
        <div className="container mx-auto max-w-screen-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <div className="aspect-square bg-secondary animate-pulse" />
            <div className="space-y-4 py-8">
              <div className="h-4 bg-secondary rounded w-1/4 animate-pulse" />
              <div className="h-10 bg-secondary rounded w-3/4 animate-pulse" />
              <div className="h-8 bg-secondary rounded w-1/4 animate-pulse" />
              <div className="h-32 bg-secondary rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <>
        <PageMeta
          title="Product Not Found"
          path={`/products/${slug}`}
          noindex
        />
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <h2 className="font-display text-3xl mb-4">Product not found</h2>
            <Link to="/products"><Button variant="outline">Back to Products</Button></Link>
          </div>
        </div>
      </>
    );
  }

  const price = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.sale_price / product.price) * 100) : 0;
  const wishlisted = isInWishlist?.(product.id);

  const renderStars = (rating, size = 14) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={size}
        className={i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted'}
      />
    ));

  const productImage = (product.images || []).find((url) => url && !isVideoUrl(url));
  const productDescription =
    product.description?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) ||
    `Shop ${product.name} at Shan Decor.`;

  return (
    <div className="min-h-screen bg-white" data-testid="product-detail-page">
      <PageMeta
        title={product.name}
        description={productDescription}
        path={`/products/${product.slug}`}
        image={productImage ? safeImgUrl(productImage, { width: 1200, quality: 85 }) : undefined}
        jsonLd={buildProductJsonLd(product, { avgRating, totalReviews })}
      />
      {/* Breadcrumb */}
      <div className="border-b border-border/30 py-4 px-4 md:px-8 lg:px-16">
        <div className="container mx-auto max-w-screen-2xl">
          <nav className="flex items-center gap-2 text-sm text-foreground/60">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight size={14} />
            <Link to="/products" className="hover:text-foreground">Products</Link>
            <ChevronRight size={14} />
            {product.category && (
              <>
                <Link to={`/products?category=${product.category.slug}`} className="hover:text-foreground capitalize">
                  {product.category.name}
                </Link>
                <ChevronRight size={14} />
              </>
            )}
            <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Section */}
      <section className="py-8 md:py-12 lg:py-16 px-4 md:px-8 lg:px-16">
        <div className="container mx-auto max-w-screen-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

            {/* Gallery */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              {hasDiscount && (
                <div className="mb-3">
                  <span className="bg-accent text-white text-xs px-3 py-1 uppercase tracking-wider font-medium">
                    -{discountPercent}% off
                  </span>
                </div>
              )}
              <MediaGallery images={product.images || []} productName={product.name} />
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:py-4"
            >
              {/* Rating summary */}
              {totalReviews > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-0.5">{renderStars(avgRating)}</div>
                  <span className="text-sm text-foreground/60">
                    {avgRating.toFixed(1)} ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                  </span>
                </div>
              )}

              <h1 className="font-display text-4xl md:text-5xl mb-4" data-testid="product-name">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-2xl md:text-3xl font-medium" data-testid="product-price">
                  ₹{price.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-foreground/40 line-through">
                    ₹{product.price.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Tags */}
              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {product.tags.map((tag) => (
                    <span key={tag} className="text-xs border border-border px-2 py-0.5 text-muted-foreground rounded-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* <div
                className="text-foreground/70 leading-relaxed mb-6 prose prose-sm max-w-none [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_ul]:space-y-1 [&_ol]:space-y-1"
                dangerouslySetInnerHTML={{ __html: product.description }}
                data-testid="product-description"
              /> */}

              {/* Stock */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <p className="text-sm flex items-center gap-2 text-green-600">
                    <Check size={16} />
                    In Stock ({product.stock} available)
                  </p>
                ) : (
                  <p className="text-sm text-red-600 font-medium">Out of Stock</p>
                )}
              </div>

              {/* Quantity + Add to cart */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex items-center border border-foreground/20">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-14 w-14 rounded-none hover:bg-secondary"
                    data-testid="decrease-quantity"
                  >
                    <Minus size={16} />
                  </Button>
                  <span className="w-14 text-center font-medium" data-testid="quantity-value">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="h-14 w-14 rounded-none hover:bg-secondary"
                    disabled={quantity >= product.stock}
                    data-testid="increase-quantity"
                  >
                    <Plus size={16} />
                  </Button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addedToCart}
                  className="flex-1 h-14 bg-foreground text-white hover:bg-foreground/90 uppercase tracking-[0.15em] text-sm font-medium rounded-none"
                  data-testid="add-to-cart-btn"
                >
                  {addedToCart ? (
                    <><Check size={18} className="mr-2" /> Added to Cart</>
                  ) : (
                    <><ShoppingBag size={18} className="mr-2" /> Add to Cart</>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => wishlisted ? removeFromWishlist?.(product.id) : addToWishlist?.(product.id)}
                  className={`h-14 w-14 border-foreground/20 hover:bg-secondary rounded-none ${wishlisted ? 'text-red-500 border-red-200' : ''}`}
                  title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart size={18} className={wishlisted ? 'fill-red-500' : ''} />
                </Button>
              </div>

              {/* Trust bullets */}
              <div className="border-t border-border/30 pt-5 mb-6 grid grid-cols-3 gap-3 text-center text-xs text-foreground/60">
                <div>
                  <p className="font-medium text-foreground/80 mb-0.5">Free Shipping</p>
                  <p>Orders over ₹999</p>
                </div>
                <div>
                  <p className="font-medium text-foreground/80 mb-0.5">Handmade</p>
                  <p>One at a time</p>
                </div>
                <div>
                  <p className="font-medium text-foreground/80 mb-0.5">Easy Returns</p>
                  <p>Within 14 days</p>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="description">
                <TabsList className="w-full justify-start border-b border-foreground/10 rounded-none bg-transparent h-auto p-0 gap-6">
                  {['description', 'shipping', 'returns', 'reviews'].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent pb-3 px-0 text-sm uppercase tracking-wider capitalize"
                    >
                      {tab}
                      {tab === 'reviews' && totalReviews > 0 && (
                        <span className="ml-1.5 text-xs text-muted-foreground">({totalReviews})</span>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="description" className="pt-6">
                  <div
                    className="text-foreground/70 leading-relaxed prose prose-sm max-w-none [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_ul]:space-y-1 [&_ol]:space-y-1"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </TabsContent>

                <TabsContent value="shipping" className="pt-6 space-y-3 text-sm text-foreground/70">
                  <p>✦ Free shipping on orders above <strong>₹999</strong>.</p>
                  <p>✦ Standard delivery within <strong>5–7 business days</strong> across India.</p>
                  <p>✦ Items are carefully packed to ensure they arrive in perfect condition.</p>
                  <p>✦ You'll receive a tracking link once your order is dispatched.</p>
                </TabsContent>

                <TabsContent value="returns" className="pt-6 space-y-3 text-sm text-foreground/70">
                  <p>✦ <strong>14-day returns</strong> from the date of delivery.</p>
                  <p>✦ Items must be unused, unwashed, and in original packaging.</p>
                  <p>✦ Custom or personalised orders are non-refundable.</p>
                  <p>✦ To initiate a return, email us at <a href="mailto:shandecor01@gmail.com" className="underline hover:text-foreground">shandecor01@gmail.com</a>.</p>
                </TabsContent>

                <TabsContent value="reviews" className="pt-6">
                  <div className="space-y-8">
                    <div className="border-b border-border pb-8">
                      <h3 className="font-display text-xl mb-4">
                        {userReview ? 'Your Review' : 'Write a Review'}
                      </h3>
                      {userReview?.moderationStatus === 'PENDING' && (
                        <p className="text-sm text-muted-foreground mb-4 border border-border bg-secondary/40 px-4 py-3">
                          Your review is awaiting moderation.
                        </p>
                      )}
                      {userReview?.moderationStatus === 'REJECTED' && (
                        <p className="text-sm text-destructive mb-4 border border-destructive/30 bg-destructive/5 px-4 py-3">
                          This review was not published. You can update and resubmit.
                        </p>
                      )}
                      {showReviewForm || userReview ? (
                        <ReviewForm
                          productId={product.id}
                          existingReview={userReview}
                          onSubmit={handleReviewSubmit}
                          onCancel={() => setShowReviewForm(false)}
                        />
                      ) : (
                        <div className="text-center py-6 bg-secondary/20 rounded-sm">
                          <p className="text-foreground/70 mb-4">Share your experience with this product</p>
                          {isAuthenticated ? (
                            <Button onClick={() => setShowReviewForm(true)}>Write a Review</Button>
                          ) : (
                            <Link to="/auth/login">
                              <Button variant="outline">Sign in to Review</Button>
                            </Link>
                          )}
                        </div>
                      )}
                    </div>

                    <ReviewsList
                      key={reviewKey}
                      productId={product.id}
                      onReviewUpdate={() => setReviewKey((k) => k + 1)}
                      onStatsLoad={({ total, avg }) => { setTotalReviews(total); setAvgRating(avg); }}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 md:py-24 px-4 md:px-8 lg:px-16 bg-[#F5F5F5]" data-testid="related-products">
          <div className="container mx-auto max-w-screen-2xl">
            <h2 className="font-display text-3xl md:text-4xl text-center mb-12">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {relatedProducts.map((p, index) => (
                <ProductCard key={p.id} product={p} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
