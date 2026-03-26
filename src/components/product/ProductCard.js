import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useState } from 'react';
import { optimizeImageUrl } from '../../lib/images';

export default function ProductCard({ product, index = 0 }) {
  const price = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
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
          <div className="aspect-square overflow-hidden p-6">
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
              className="w-10 h-10 bg-white flex items-center justify-center hover:bg-foreground hover:text-white transition-colors shadow-md"
            >
              <Heart size={16} />
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
