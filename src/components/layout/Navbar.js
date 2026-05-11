import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Search, Heart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated, profile, user } = useAuth();
  const isAdmin = profile?.is_admin || user?.role === 'ADMIN';
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/products', label: 'Shop' },
    { href: '/products?category=lamps', label: 'Lamps' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      // Focus search input when opening
      setTimeout(() => {
        document.getElementById('navbar-search')?.focus();
      }, 100);
    }
  };

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

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
            className="flex items-center"
            data-testid="logo-link"
          >
            <img
              src="https://qkrcnxrabkmqrnlplagf.supabase.co/storage/v1/object/public/uploads/logos/shandecors_column_logo.png"
              alt="Shan Decors"
              className="h-16 md:h-15 w-auto object-contain"
            />
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
            <Link to="/wishlist" className="relative" data-testid="wishlist-link">
              <Heart size={20} className="text-foreground hover:text-accent transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-3">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-transparent" 
                onClick={toggleSearch}
                data-testid="search-btn"
              >
                <Search size={20} className="text-foreground/70" />
              </Button>
              
              {/* Search Dropdown */}
              {isSearchOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-border rounded-sm shadow-lg p-4">
                  <form onSubmit={handleSearch} className="space-y-3">
                    <Input
                      id="navbar-search"
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="rounded-none"
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" className="rounded-none flex-1">
                        Search
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleSearch}
                        className="rounded-none"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
            
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

            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
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
                <CartDrawer onClose={() => setIsCartOpen(false)} />
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
