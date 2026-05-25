import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import { addToWishlist, removeFromWishlist, checkWishlist } from '../../lib/api';
import { optimizeImageUrl } from '../../lib/images';

export default function ProductCard({ product, index = 0 }) {
  const price = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Check if product is in wishlist when component mounts or auth state changes
  const checkWishlistStatus = useCallback(async () => {
    try {
      const response = await checkWishlist(product.id);
      setIsInWishlist(response.data.isInWishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  }, [product.id]);

  useEffect(() => {
    if (isAuthenticated && product?.id) {
      checkWishlistStatus();
    } else {
      setIsInWishlist(false);
    }
  }, [isAuthenticated, product?.id, checkWishlistStatus]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // Redirect to login or show login prompt
      window.location.href = '/login';
      return;
    }

    if (wishlistLoading) return;

    setWishlistLoading(true);
    
    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id);
        setIsInWishlist(false);
      } else {
        await addToWishlist({ productId: product.id });
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      // Show error message to user
      alert('Failed to update wishlist. Please try again.');
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group"
      data-testid={`product-card-${product.slug}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.slug}`}>
        {/* Product Image Container */}
        <div className="relative bg-[#F5F5F5] overflow-hidden">
          <div className="aspect-square overflow-hidden p-2 md:p-6">
            <img
              src={optimizeImageUrl(product.images?.[0], { width: 560, quality: 70 })}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          </div>
          
          {/* Badges */}
          {hasDiscount && (
            <span className="absolute top-4 left-4 bg-accent text-white text-[10px] px-2 py-1 uppercase tracking-wider font-medium">
              Sale
            </span>
          )}
          
          {/* Quick Actions - Show on Hover */}
          <motion.div 
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={handleAddToCart}
              className="w-10 h-10 bg-white flex items-center justify-center hover:bg-foreground hover:text-white transition-colors shadow-md"
              data-testid={`quick-add-${product.slug}`}
            >
              <ShoppingBag size={16} />
            </button>
            <button
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              className={`w-10 h-10 flex items-center justify-center transition-colors shadow-md ${
                isInWishlist 
                  ? 'bg-accent text-white hover:bg-accent/90' 
                  : 'bg-white hover:bg-foreground hover:text-white'
              }`}
              data-testid={`wishlist-${product.slug}`}
            >
              <Heart 
                size={16} 
                className={isInWishlist ? 'fill-current' : ''}
              />
            </button>
          </motion.div>
        </div>
        
        {/* Product Info - Centered Below */}
        <div className="pt-5 text-center">
          <h3 className="font-display text-base md:text-lg text-foreground group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-sm text-foreground/80">
              ₹{price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-sm text-foreground/40 line-through">
                ₹{product.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
