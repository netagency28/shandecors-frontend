import { createContext, useContext, useReducer, useCallback, useEffect, useMemo, useRef } from 'react';
import { getCart, addToCart as apiAddToCart, updateCartItem, removeFromCart as apiRemoveFromCart, clearCart as apiClearCart } from '../lib/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(undefined);

const initialState = {
  items: [],
  isLoading: false,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload, isLoading: false };
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) => item.product_id === action.payload.product_id
      );
      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + action.payload.quantity,
        };
        return { ...state, items: newItems };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'UPDATE_ITEM': {
      const newItems = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
      );
      return { ...state, items: newItems };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((item) => item.id !== action.payload) };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const normalizeCartItems = (backendItems) => {
  if (!Array.isArray(backendItems)) return [];
  return backendItems.map((item) => ({
    id: item.id,
    product_id: item.productId || item.product_id,
    product: item.product,
    quantity: item.quantity,
  }));
};

const getLocalCart = () => {
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, user } = useAuth();
  const prevAuthRef = useRef(isAuthenticated);
  const syncInProgress = useRef(false);

  // On auth state change: sync localStorage cart into backend then fetch authoritative cart
  useEffect(() => {
    const wasAuthenticated = prevAuthRef.current;
    prevAuthRef.current = isAuthenticated;

    if (!isAuthenticated) {
      // Load from localStorage for guests
      const localItems = getLocalCart();
      dispatch({ type: 'SET_ITEMS', payload: localItems });
      return;
    }

    if (syncInProgress.current) return;
    syncInProgress.current = true;

    const syncCart = async () => {
      try {
        const localItems = !wasAuthenticated ? getLocalCart() : [];

        // Merge local items into backend (only on fresh login)
        for (const localItem of localItems) {
          try {
            await apiAddToCart({
              product_id: localItem.product_id,
              quantity: localItem.quantity,
            });
          } catch {
            // Ignore individual item errors (e.g. product out of stock)
          }
        }

        // Fetch authoritative backend cart
        const response = await getCart();
        const backendItems = response.data?.items || response.data || [];
        dispatch({ type: 'SET_ITEMS', payload: normalizeCartItems(backendItems) });

        // Clear localStorage now that backend is authoritative
        localStorage.removeItem('cart');
      } catch {
        // Fallback: keep whatever is in state
      } finally {
        syncInProgress.current = false;
      }
    };

    syncCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  // Save to localStorage when not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(state.items));
    }
  }, [state.items, isAuthenticated]);

  const addItem = useCallback(async (product, quantity = 1) => {
    if (isAuthenticated) {
      try {
        await apiAddToCart({ product_id: product.id, quantity });
        const response = await getCart();
        const backendItems = response.data?.items || response.data || [];
        dispatch({ type: 'SET_ITEMS', payload: normalizeCartItems(backendItems) });
      } catch (err) {
        console.error('Failed to add item to cart:', err);
      }
    } else {
      const item = {
        id: `cart-${product.id}-${Date.now()}`,
        product_id: product.id,
        product,
        quantity,
      };
      dispatch({ type: 'ADD_ITEM', payload: item });
    }
  }, [isAuthenticated]);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    if (quantity <= 0) {
      if (isAuthenticated) {
        try {
          await apiRemoveFromCart(itemId);
          dispatch({ type: 'REMOVE_ITEM', payload: itemId });
        } catch (err) {
          console.error('Failed to remove cart item:', err);
        }
      } else {
        dispatch({ type: 'REMOVE_ITEM', payload: itemId });
      }
      return;
    }

    if (isAuthenticated) {
      try {
        await updateCartItem(itemId, { quantity });
        dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, quantity } });
      } catch (err) {
        console.error('Failed to update cart item:', err);
      }
    } else {
      dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, quantity } });
    }
  }, [isAuthenticated]);

  const removeItem = useCallback(async (itemId) => {
    if (isAuthenticated) {
      try {
        await apiRemoveFromCart(itemId);
      } catch (err) {
        console.error('Failed to remove cart item:', err);
      }
    }
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  }, [isAuthenticated]);

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await apiClearCart();
      } catch (err) {
        console.error('Failed to clear cart:', err);
      }
    }
    dispatch({ type: 'CLEAR_CART' });
    localStorage.removeItem('cart');
  }, [isAuthenticated]);

  const cartTotal = useMemo(() => {
    return state.items.reduce((total, item) => {
      const price = item.product?.sale_price || item.product?.comparePrice || item.product?.price || 0;
      return total + price * item.quantity;
    }, 0);
  }, [state.items]);

  const cartCount = useMemo(() => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  }, [state.items]);

  const value = useMemo(
    () => ({ ...state, addItem, updateQuantity, removeItem, clearCart, cartTotal, cartCount }),
    [state, addItem, updateQuantity, removeItem, clearCart, cartTotal, cartCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
