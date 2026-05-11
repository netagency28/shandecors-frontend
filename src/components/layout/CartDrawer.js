import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../ui/button';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { SheetHeader, SheetTitle, SheetFooter } from '../ui/sheet';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

export default function CartDrawer({ onClose }) {
  const { items, updateQuantity, removeItem, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <SheetHeader className="p-6 border-b border-border">
          <SheetTitle className="font-display text-2xl">Your Cart</SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex flex-col items-center justify-center p-6" data-testid="empty-cart">
          <ShoppingBag size={48} className="text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground text-center">Your cart is empty</p>
          <Link to="/products">
            <Button className="mt-6 rounded-none bg-foreground text-background hover:bg-foreground/90 px-8 py-6 uppercase tracking-widest text-xs font-bold" data-testid="continue-shopping-btn">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" data-testid="cart-drawer">
      <SheetHeader className="p-6 border-b border-border">
        <SheetTitle className="font-display text-2xl">
          Your Cart ({cartCount})
        </SheetTitle>
      </SheetHeader>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4" data-testid={`cart-item-${item.product_id}`}>
              <div className="w-20 h-24 bg-secondary rounded-sm overflow-hidden flex-shrink-0">
                <img
                  src={item.product?.images?.[0] || '/placeholder.jpg'}
                  alt={item.product?.name}
                  className="w-full h-full object-cover img-warm"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link 
                  to={`/products/${item.product?.slug}`}
                  className="font-medium text-sm hover:text-accent transition-colors line-clamp-2"
                >
                  {item.product?.name}
                </Link>
                <p className="text-muted-foreground text-sm mt-1">
                  ₹{(item.product?.sale_price || item.product?.price || 0).toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-none"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    data-testid={`decrease-qty-${item.product_id}`}
                  >
                    <Minus size={14} />
                  </Button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-none"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    data-testid={`increase-qty-${item.product_id}`}
                  >
                    <Plus size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 ml-auto text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                    data-testid={`remove-item-${item.product_id}`}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <SheetFooter className="p-6 border-t border-border block">
        <div className="space-y-4">
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-display text-xl">₹{cartTotal.toLocaleString()}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Shipping calculated at checkout
          </p>
          <Button 
            className="w-full rounded-none bg-foreground text-background hover:bg-foreground/90 px-8 py-6 uppercase tracking-widest text-xs font-bold"
            data-testid="checkout-btn"
            onClick={() => {
              onClose?.();
              navigate('/checkout');
            }}
          >
            Proceed to Checkout
          </Button>
        </div>
      </SheetFooter>
    </div>
  );
}
