import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Heart, Check, ChevronRight, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { getProduct, getProducts } from '../lib/api';
import { createReview, updateReview, deleteReview, getUserReview } from '../lib/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/product/ProductCard';
import ReviewForm from '../components/review/ReviewForm';
import ReviewsList from '../components/review/ReviewsList';
import { optimizeImageUrl } from '../lib/images';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [userReview, setUserReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewKey, setReviewKey] = useState(0); // To refresh reviews list
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await getProduct(slug);
        setProduct(response.data);
        setSelectedImage(0);

        if (response.data?.category_id) {
          const relatedRes = await getProducts({ 
            category: response.data.category_id, 
            limit: 5 
          });
          setRelatedProducts(
            relatedRes.data.products?.filter(p => p.id !== response.data.id).slice(0, 4) || []
          );
        }

        // Fetch user's review if authenticated
        if (isAuthenticated && response.data?.id) {
          try {
            const reviewResponse = await getUserReview(response.data.id);
            setUserReview(reviewResponse.data);
          } catch (err) {
            // User hasn't reviewed yet
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
      if (userReview) {
        // Update existing review
        const response = await updateReview(userReview.id, reviewData);
        setUserReview(response.data);
      } else {
        // Create new review
        const response = await createReview(reviewData);
        setUserReview(response.data);
      }
      setShowReviewForm(false);
      setReviewKey(prev => prev + 1); // Refresh reviews list
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.error || 'Failed to submit review');
    }
  };

  const handleReviewUpdate = () => {
    setReviewKey(prev => prev + 1); // Refresh reviews list
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 lg:p-16 bg-white">
        <div className="container mx-auto max-w-screen-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <div className="aspect-square bg-secondary animate-pulse" />
            <div className="space-y-4 py-8">
              <div className="h-4 bg-secondary rounded w-1/4" />
              <div className="h-10 bg-secondary rounded w-3/4" />
              <div className="h-8 bg-secondary rounded w-1/4" />
              <div className="h-32 bg-secondary rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="font-display text-3xl mb-4">Product not found</h2>
          <Link to="/products">
            <Button variant="outline">Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const price = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.sale_price / product.price) * 100) : 0;

  return (
    <div className="min-h-screen bg-white" data-testid="product-detail-page">
      {/* Breadcrumb */}
      <div className="border-b border-border/30 py-4 px-4 md:px-8 lg:px-16">
        <div className="container mx-auto max-w-screen-2xl">
          <nav className="flex items-center gap-2 text-sm text-foreground/60">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight size={14} />
            <Link to="/products" className="hover:text-foreground">Products</Link>
            <ChevronRight size={14} />
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Section */}
      <section className="py-8 md:py-12 lg:py-16 px-4 md:px-8 lg:px-16">
        <div className="container mx-auto max-w-screen-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-[#F5F5F5] aspect-square relative overflow-hidden">
                <img
                  src={optimizeImageUrl(product.images?.[selectedImage] || product.images?.[0], { width: 1200, quality: 78 })}
                  alt={product.name}
                  className="w-full h-full object-contain p-8"
                  data-testid="product-image"
                  fetchPriority="high"
                  decoding="async"
                />
                {hasDiscount && (
                  <span className="absolute top-4 left-4 bg-accent text-white text-xs px-3 py-1 uppercase tracking-wider font-medium">
                    -{discountPercent}%
                  </span>
                )}
              </div>
              
              {/* Thumbnails */}
              {product.images?.length > 1 && (
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {product.images.slice(0, 4).map((img, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`bg-[#F5F5F5] aspect-square cursor-pointer hover:opacity-80 transition-opacity border ${selectedImage === i ? 'border-foreground' : 'border-transparent'}`}
                    >
                      <img
                        src={optimizeImageUrl(img, { width: 260, quality: 68 })}
                        alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-contain p-2"
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:py-4"
            >
              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm text-foreground/60 ml-2">(12 reviews)</span>
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl mb-4" data-testid="product-name">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-2xl md:text-3xl font-medium" data-testid="product-price">
                  ₹{price.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-foreground/40 line-through">
                    ₹{product.price.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-foreground/70 leading-relaxed mb-8" data-testid="product-description">
                {product.description}
              </p>

              {/* Stock Status */}
              <div className="mb-8">
                {product.stock > 0 ? (
                  <p className="text-sm flex items-center gap-2 text-green-600">
                    <Check size={16} />
                    In Stock ({product.stock} available)
                  </p>
                ) : (
                  <p className="text-sm text-red-600">Out of Stock</p>
                )}
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
                  <span className="w-14 text-center font-medium" data-testid="quantity-value">
                    {quantity}
                  </span>
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
                  className="flex-1 h-14 bg-foreground text-white hover:bg-foreground/90 uppercase tracking-[0.15em] text-sm font-medium"
                  data-testid="add-to-cart-btn"
                >
                  {addedToCart ? (
                    <>
                      <Check size={18} className="mr-2" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} className="mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 border-foreground/20 hover:bg-secondary"
                >
                  <Heart size={18} />
                </Button>
              </div>

              {/* Additional Info */}
              <Tabs defaultValue="description" className="mt-8">
                <TabsList className="w-full justify-start border-b border-foreground/10 rounded-none bg-transparent h-auto p-0 gap-8">
                  <TabsTrigger 
                    value="description" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent pb-3 px-0 text-sm uppercase tracking-wider"
                  >
                    Description
                  </TabsTrigger>
                  <TabsTrigger 
                    value="shipping" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent pb-3 px-0 text-sm uppercase tracking-wider"
                  >
                    Shipping
                  </TabsTrigger>
                  <TabsTrigger 
                    value="returns" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent pb-3 px-0 text-sm uppercase tracking-wider"
                  >
                    Returns
                  </TabsTrigger>
                  <TabsTrigger 
                    value="reviews" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent pb-3 px-0 text-sm uppercase tracking-wider"
                  >
                    Reviews
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="pt-6">
                  <p className="text-foreground/70 leading-relaxed">
                    {product.description}
                  </p>
                </TabsContent>
                <TabsContent value="shipping" className="pt-6">
                  <p className="text-foreground/70 leading-relaxed">
                    Free shipping on orders over ₹5,000. Standard delivery within 5-7 business days.
                    Express shipping available for an additional fee.
                  </p>
                </TabsContent>
                <TabsContent value="returns" className="pt-6">
                  <p className="text-foreground/70 leading-relaxed">
                    Easy 14-day returns. Items must be unused and in original packaging.
                    Contact our customer service for return authorization.
                  </p>
                </TabsContent>
                <TabsContent value="reviews" className="pt-6">
                  <div className="space-y-8">
                    {/* Review Form Section */}
                    <div className="border-b border-border pb-8">
                      <h3 className="font-display text-xl mb-4">
                        {userReview ? 'Update Your Review' : 'Write a Review'}
                      </h3>
                      {userReview?.moderationStatus === 'PENDING' && (
                        <p className="text-sm text-muted-foreground mb-4 border border-border bg-secondary/40 px-4 py-3">
                          Your review is awaiting moderation. It will appear publicly after the team approves it.
                        </p>
                      )}
                      {userReview?.moderationStatus === 'REJECTED' && (
                        <p className="text-sm text-destructive mb-4 border border-destructive/30 bg-destructive/5 px-4 py-3">
                          This review was not published. You can update it and it will be submitted again for review.
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
                          <Button onClick={() => setShowReviewForm(true)}>
                            Write a Review
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Reviews List */}
                    <ReviewsList
                      key={reviewKey}
                      productId={product.id}
                      onReviewUpdate={handleReviewUpdate}
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
              {relatedProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
