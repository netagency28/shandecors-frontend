import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Grid, LayoutGrid, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { getProducts, getCategories } from '../lib/api';
import ProductCard from '../components/product/ProductCard';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [gridCols, setGridCols] = useState(4);
  
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          getProducts({ category, search, limit: 50 }),
          getCategories()
        ]);
        setProducts(productsRes.data.products || []);
        setTotal(productsRes.data.total || 0);
        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [category, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput) {
      params.set('search', searchInput);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set('category', value);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchInput('');
  };

  const hasFilters = category || search;
  const currentCategory = categories.find(c => c.slug === category);

  return (
    <div className="min-h-screen bg-white" data-testid="products-page">
      {/* Header Banner */}
      <section className="bg-[#F5F5F5] py-16 md:py-24 px-4 md:px-8 lg:px-16">
        <div className="container mx-auto max-w-screen-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl italic mb-4">
              {currentCategory?.name || 'Our Products'}
            </h1>
            <p className="text-foreground/60 max-w-lg mx-auto">
              {currentCategory?.description || 'Find a bright ideal to suit your taste with our great selection.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="border-b border-border/30 sticky top-20 bg-white z-40">
        <div className="container mx-auto max-w-screen-2xl px-4 md:px-8 lg:px-16">
          <div className="flex items-center justify-between py-4">
            {/* Category Links */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`text-sm tracking-[0.1em] uppercase transition-colors ${!category ? 'text-foreground' : 'text-foreground/50 hover:text-foreground'}`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`text-sm tracking-[0.1em] uppercase transition-colors ${category === cat.slug ? 'text-foreground' : 'text-foreground/50 hover:text-foreground'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-4 ml-auto">
              {/* Search */}
              <form onSubmit={handleSearch} className="hidden md:flex items-center">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9 pr-4 py-2 w-48 border-foreground/20 focus:border-foreground text-sm"
                    data-testid="search-input"
                  />
                </div>
              </form>

              {/* Grid Toggle */}
              <div className="hidden md:flex items-center gap-1 border-l border-foreground/10 pl-4">
                <button
                  onClick={() => setGridCols(3)}
                  className={`p-2 ${gridCols === 3 ? 'text-foreground' : 'text-foreground/30'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setGridCols(4)}
                  className={`p-2 ${gridCols === 4 ? 'text-foreground' : 'text-foreground/30'}`}
                >
                  <LayoutGrid size={18} />
                </button>
              </div>

              {/* Mobile Filter */}
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="outline" size="sm" className="border-foreground/20">
                    <SlidersHorizontal size={16} className="mr-2" />
                    Filter
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[50vh]">
                  <SheetHeader>
                    <SheetTitle className="font-display text-2xl">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block tracking-wider uppercase">Category</label>
                      <Select value={category || 'all'} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.slug}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <form onSubmit={handleSearch}>
                      <label className="text-sm font-medium mb-2 block tracking-wider uppercase">Search</label>
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />
                    </form>
                    {hasFilters && (
                      <Button variant="outline" onClick={clearFilters} className="w-full">
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </section>

      {/* Active Filters */}
      {hasFilters && (
        <div className="container mx-auto max-w-screen-2xl px-4 md:px-8 lg:px-16 py-4">
          <div className="flex items-center gap-2">
            {category && (
              <span className="inline-flex items-center gap-2 text-sm bg-secondary px-3 py-1">
                {currentCategory?.name}
                <button onClick={() => handleCategoryChange('all')}>
                  <X size={14} />
                </button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-2 text-sm bg-secondary px-3 py-1">
                "{search}"
                <button onClick={() => {
                  setSearchInput('');
                  const params = new URLSearchParams(searchParams);
                  params.delete('search');
                  setSearchParams(params);
                }}>
                  <X size={14} />
                </button>
              </span>
            )}
            <button onClick={clearFilters} className="text-sm text-foreground/50 hover:text-foreground ml-2">
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <section className="py-12 md:py-16 px-4 md:px-8 lg:px-16">
        <div className="container mx-auto max-w-screen-2xl">
          {/* Results count */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-foreground/60">
              Showing {products.length} of {total} results
            </p>
          </div>

          {loading ? (
            <div className={`grid grid-cols-2 md:grid-cols-${gridCols} gap-6 md:gap-8`}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-secondary"></div>
                  <div className="mt-4 h-5 bg-secondary rounded w-2/3 mx-auto"></div>
                  <div className="mt-2 h-4 bg-secondary rounded w-1/3 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20" data-testid="no-products">
              <h3 className="font-display text-2xl mb-4">No products found</h3>
              <p className="text-foreground/60 mb-6">Try adjusting your filters</p>
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className={`grid grid-cols-2 ${gridCols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-6 md:gap-8`}>
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
