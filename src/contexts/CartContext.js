import { createContext, useContext, useReducer, useCallback, useEffect, useMemo } from 'react';

const CartContext = createContext(undefined);

const initialState = {
  items: [],
  isLoading: false,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload,
        isLoading: false,
      };
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        item => item.product_id === action.payload.product_id
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
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return { ...state, items: newItems };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        dispatch({ type: 'SET_ITEMS', payload: items });
      } catch (e) {
        console.error('Failed to parse cart from localStorage');
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  const addItem = useCallback((product, quantity = 1) => {
    const item = {
      id: `cart-${product.id}-${Date.now()}`,
      product_id: product.id,
      product: product,
      quantity,
    };
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity <= 0) {
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
    } else {
      dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, quantity } });
    }
  }, []);

  const removeItem = useCallback((itemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
    localStorage.removeItem('cart');
  }, []);

  const cartTotal = useMemo(() => {
    return state.items.reduce((total, item) => {
      const price = item.product?.sale_price || item.product?.price || 0;
      return total + price * item.quantity;
    }, 0);
  }, [state.items]);

  const cartCount = useMemo(() => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  }, [state.items]);

  const value = useMemo(() => ({
    ...state,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    cartTotal,
    cartCount,
  }), [state, addItem, updateQuantity, removeItem, clearCart, cartTotal, cartCount]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
