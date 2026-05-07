import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { getWishlist as apiGetWishlist, addToWishlist as apiAddToWishlist, removeFromWishlist as apiRemoveFromWishlist, clearWishlist as apiClearWishlist } from '../lib/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(undefined);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const response = await apiGetWishlist();
      const items = response.data?.items || response.data || [];
      setWishlistItems(Array.isArray(items) ? items : []);
    } catch {
      setWishlistItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [isAuthenticated, fetchWishlist]);

  const addToWishlist = useCallback(async (productId) => {
    if (!isAuthenticated) return;
    try {
      await apiAddToWishlist({ productId });
      await fetchWishlist();
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
    }
  }, [isAuthenticated, fetchWishlist]);

  const removeFromWishlist = useCallback(async (productId) => {
    if (!isAuthenticated) return;
    try {
      await apiRemoveFromWishlist(productId);
      setWishlistItems((prev) => prev.filter((item) => item.productId !== productId && item.product?.id !== productId));
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  }, [isAuthenticated]);

  const clearWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      await apiClearWishlist();
      setWishlistItems([]);
    } catch (err) {
      console.error('Failed to clear wishlist:', err);
    }
  }, [isAuthenticated]);

  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some((item) => item.productId === productId || item.product?.id === productId);
  }, [wishlistItems]);

  const wishlistCount = useMemo(() => wishlistItems.length, [wishlistItems]);

  const value = useMemo(() => ({
    wishlistItems,
    wishlistCount,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    fetchWishlist,
  }), [wishlistItems, wishlistCount, isLoading, addToWishlist, removeFromWishlist, clearWishlist, isInWishlist, fetchWishlist]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
