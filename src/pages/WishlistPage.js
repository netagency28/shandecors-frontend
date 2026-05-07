import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { getWishlist, removeFromWishlist, moveToCart, clearWishlist } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/product/ProductCard';
import { optimizeImageUrl } from '../lib/images';

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await getWishlist();
      setWishlistItems(response.data.items);
    } catch (err) {
      setError('Failed to load wishlist');
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
      setSelectedItems(prev => prev.filter(id => id !== productId));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      alert('Failed to remove item from wishlist');
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      await moveToCart(productId);
      setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
      setSelectedItems(prev => prev.filter(id => id !== productId));
    } catch (err) {
      console.error('Error moving to cart:', err);
      alert('Failed to move item to cart');
    }
  };

  const handleBulkMoveToCart = async () => {
    for (const productId of selectedItems) {
      try {
        await moveToCart(productId);
      } catch (err) {
        console.error('Error moving item to cart:', err);
      }
    }
    await fetchWishlist(); // Refresh the list
    setSelectedItems([]);
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        await clearWishlist();
        setWishlistItems([]);
        setSelectedItems([]);
      } catch (err) {
        console.error('Error clearing wishlist:', err);
        alert('Failed to clear wishlist');
      }
    }
  };

  const toggleSelectItem = (productId) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map(item => item.product.id));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-20 px-4 md:px-8 lg:px-16">
        <div className="container mx-auto max-w-4xl text-center">
          <Heart className="w-16 h-16 mx-auto text-foreground/20 mb-6" />
          <h1 className="font-display text-3xl md:text-4xl mb-4">Your Wishlist</h1>
          <p className="text-foreground/60 mb-8">Please log in to view and manage your wishlist</p>
          <Link to="/login">
            <Button className="rounded-none">
              Log In to View Wishlist
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen py-20 px-4 md:px-8 lg:px-16">
        <div className="container mx-auto max-w-screen-2xl">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-secondary animate-pulse rounded-sm" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-20 px-4 md:px-8 lg:px-16">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchWishlist}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 md:px-8 lg:px-16">
      <div className="container mx-auto max-w-screen-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl mb-2">Your Wishlist</h1>
              <p className="text-foreground/60">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            
            {wishlistItems.length > 0 && (
              <div className="flex items-center gap-3">
                {selectedItems.length > 0 && (
                  <Button
                    onClick={handleBulkMoveToCart}
                    className="rounded-none bg-foreground text-white"
                  >
                    <ShoppingBag size={16} className="mr-2" />
                    Move {selectedItems.length} to Cart
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleClearWishlist}
                  className="rounded-none"
                >
                  <Trash2 size={16} className="mr-2" />
                  Clear All
                </Button>
              </div>
            )}
          </div>

          {wishlistItems.length === 0 ? (
            <div className="text-center py-16 bg-secondary/20 rounded-sm">
              <Heart className="w-16 h-16 mx-auto text-foreground/20 mb-6" />
              <h2 className="font-display text-2xl mb-4">Your wishlist is empty</h2>
              <p className="text-foreground/60 mb-8">
                Save items you love for later by clicking the heart icon on products
              </p>
              <Link to="/products">
                <Button className="rounded-none bg-foreground text-white">
                  Start Shopping
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Bulk Actions */}
              {wishlistItems.length > 1 && (
                <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-sm">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === wishlistItems.length}
                    onChange={toggleSelectAll}
                    className="rounded-sm"
                  />
                  <span className="text-sm">
                    {selectedItems.length === wishlistItems.length 
                      ? 'Deselect all' 
                      : `Select all (${wishlistItems.length})`
                    }
                  </span>
                </div>
              )}

              {/* Wishlist Items */}
              <div className="grid grid-cols-1 gap-6">
                {wishlistItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white border border-border rounded-sm p-6"
                  >
                    <div className="flex items-center gap-6">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.product.id)}
                        onChange={() => toggleSelectItem(item.product.id)}
                        className="rounded-sm"
                      />

                      {/* Product Image */}
                      <div className="w-24 h-24 bg-secondary rounded-sm overflow-hidden flex-shrink-0">
                        {item.product.images?.[0] ? (
                          <img
                            src={optimizeImageUrl(item.product.images[0], { width: 200, quality: 70 })}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Heart size={24} className="text-foreground/20" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link to={`/products/${item.product.slug}`}>
                              <h3 className="font-display text-lg mb-2 hover:text-accent transition-colors">
                                {item.product.name}
                              </h3>
                            </Link>
                            <p className="text-foreground/60 text-sm mb-2">
                              {item.product.category?.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="font-display text-lg">
                                ₹{(item.product.sale_price || item.product.price).toLocaleString()}
                              </span>
                              {item.product.sale_price && (
                                <span className="text-sm text-foreground/40 line-through">
                                  ₹{item.product.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-foreground/40 mb-3">
                              Added {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleMoveToCart(item.product.id)}
                                className="rounded-none"
                              >
                                <ShoppingBag size={14} className="mr-1" />
                                Move to Cart
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveFromWishlist(item.product.id)}
                                className="rounded-none"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
