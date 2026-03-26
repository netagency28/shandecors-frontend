import { Link } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Search, Heart } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { isAuthenticated, profile, user } = useAuth();
  const isAdmin = profile?.is_admin || user?.role === 'ADMIN';

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Shop' },
    { href: '/products?category=lamps', label: 'Lamps' },
    { href: '/products?category=vases', label: 'Vases' },
    { href: '/products?category=accessories', label: 'Accessories' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-border/20" data-testid="navbar">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 max-w-screen-2xl">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hover:bg-transparent"
              data-testid="mobile-menu-toggle"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>

          {/* Logo */}
          <Link 
            to="/" 
            className="font-display text-2xl md:text-3xl tracking-[0.15em] uppercase"
            data-testid="logo-link"
          >
            Shan Decors
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10" data-testid="desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm tracking-[0.1em] uppercase text-foreground/70 hover:text-foreground transition-colors"
                data-testid={`nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-3">
            <Button variant="ghost" size="icon" className="hover:bg-transparent" data-testid="search-btn">
              <Search size={20} className="text-foreground/70" />
            </Button>
            
            {isAuthenticated ? (
              <Link to={isAdmin ? '/admin' : '/profile'}>
                <Button variant="ghost" size="icon" className="hover:bg-transparent" data-testid="user-btn">
                  <User size={20} className="text-foreground/70" />
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="icon" className="hover:bg-transparent" data-testid="login-btn">
                  <User size={20} className="text-foreground/70" />
                </Button>
              </Link>
            )}

            <Button variant="ghost" size="icon" className="hover:bg-transparent hidden md:flex">
              <Heart size={20} className="text-foreground/70" />
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-transparent" data-testid="cart-btn">
                  <ShoppingBag size={20} className="text-foreground/70" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-foreground text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md p-0">
                <CartDrawer />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-border/20" data-testid="mobile-menu">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm tracking-[0.1em] uppercase text-foreground/70 hover:text-foreground transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
