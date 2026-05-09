import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Truck, Shield, Award, HandMetal } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { getProducts, getCategories } from '../lib/api';
import ProductCard from '../components/product/ProductCard';
import { optimizeImageUrl } from '../lib/images';

const faqs = [
  {
    category: 'Products',
    items: [
      {
        q: 'Are your products handmade or machine-made?',
        a: 'Every piece at Shan Decors is thoughtfully handcrafted by skilled artisans, carrying generations of craftsmanship — making each item truly one of a kind.',
      },
      {
        q: 'Will my product look exactly like the images shown?',
        a: 'Since our décor pieces are handmade, slight variations in colour, texture, or finish may occur — adding to the uniqueness and authenticity of each product.',
      },
      {
        q: 'Do your products support sustainable practices?',
        a: 'Yes, we prioritise sustainability by using eco-friendly materials and ethical production methods that support both the environment and artisan communities.',
      },
    ],
  },
  {
    category: 'Shipping',
    items: [
      {
        q: 'How long will it take to receive my order?',
        a: 'As each product is carefully crafted and handled with care, delivery typically takes 7–14 business days depending on your location.',
      },
      {
        q: 'Do you deliver across India?',
        a: 'Yes, we ship pan India — bringing handcrafted elegance right to your doorstep. Orders above ₹999 qualify for free shipping.',
      },
      {
        q: 'How can I track my order?',
        a: 'Currently, we do not offer live tracking. However, we keep you updated at every stage — order confirmation, processing, dispatch, and delivery — via email, SMS, and WhatsApp.',
      },
    ],
  },
  {
    category: 'Payments',
    items: [
      {
        q: 'What payment options are available?',
        a: 'We offer secure payment options including UPI, debit/credit cards, net banking, and digital wallets for your convenience.',
      },
      {
        q: 'Is my payment information safe?',
        a: 'Absolutely. We use trusted and encrypted payment gateways to ensure your transactions are completely secure.',
      },
      {
        q: 'Is Cash on Delivery (COD) available?',
        a: 'Yes, COD is available for selected locations — allowing you to pay once your handcrafted piece reaches you.',
      },
    ],
  },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, allProdsRes, categoriesRes] = await Promise.all([
          getProducts({ featured: true, limit: 4 }),
          getProducts({ limit: 8 }),
          getCategories()
        ]);
        setFeaturedProducts(productsRes.data.products || []);
        setAllProducts(allProdsRes.data.products || []);
        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-slide for hero
  useEffect(() => {
    if (featuredProducts.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredProducts.length]);

  useEffect(() => {
    if (!featuredProducts.length) return;
    const nextIndex = (currentSlide + 1) % featuredProducts.length;
    const nextImageUrl = optimizeImageUrl(featuredProducts[nextIndex]?.images?.[0], { width: 1800, quality: 72 });
    if (!nextImageUrl) return;
    const img = new Image();
    img.src = nextImageUrl;
  }, [currentSlide, featuredProducts]);

  const heroProduct = featuredProducts[currentSlide] || null;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  return (
    <div className="bg-white" data-testid="home-page">
      {/* Hero Section - Full Width Image Slider */}
      <section className="relative h-[92vh] min-h-[620px] overflow-hidden" data-testid="hero-section">
        {heroProduct ? (
          <>
            <motion.img
              key={`hero-bg-${currentSlide}`}
              src={optimizeImageUrl(heroProduct.images?.[0], { width: 2000, quality: 74 })}
              alt={heroProduct.name}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              fetchPriority="high"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />

            <div className="absolute inset-0 flex items-center">
              <div className="w-full max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-16 relative z-10">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="max-w-2xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-0.5 h-10 bg-white/80"></div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] font-semibold text-white/80">
                        {categories.find(c => c.id === heroProduct.category_id)?.name || 'Lighting'}
                      </p>
                      <p className="text-xs tracking-[0.15em] text-white/70">2026</p>
                    </div>
                  </div>
                  
                  <h1 className="font-display text-4xl md:text-6xl lg:text-7xl tracking-[0.08em] uppercase mb-6 text-white leading-tight">
                    {heroProduct.name}
                  </h1>
                  
                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-xs uppercase tracking-wider text-white/70">From</span>
                    <span className="font-display text-3xl md:text-4xl text-white">
                      ₹{(heroProduct.sale_price || heroProduct.price).toLocaleString()}
                    </span>
                  </div>
                  
                  <Link to={`/products/${heroProduct.slug}`}>
                    <Button 
                      className="rounded-none bg-white text-black hover:bg-white/90 px-10 py-6 text-sm tracking-[0.15em] uppercase font-medium transition-all duration-300"
                      data-testid="shop-now-btn"
                    >
                      Shop Now
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
            
            {/* Slider Controls */}
            <div className="absolute bottom-8 left-6 md:left-12 lg:left-16 flex items-center gap-4 z-20">
              <button 
                onClick={prevSlide}
                className="w-12 h-12 border border-white/45 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300"
                data-testid="prev-slide-btn"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextSlide}
                className="w-12 h-12 border border-white/45 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300"
                data-testid="next-slide-btn"
              >
                <ChevronRight size={20} />
              </button>
              <span className="ml-4 text-sm tracking-wider text-white">
                {String(currentSlide + 1).padStart(2, '0')} / {String(featuredProducts.length).padStart(2, '0')}
              </span>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="animate-pulse">
              <div className="w-48 h-8 bg-secondary rounded"></div>
            </div>
          </div>
        )}
      </section>

      {/* Categories Section - Two Column */}
      <section className="py-16 md:py-20 px-4 md:px-8 lg:px-16" data-testid="categories-section">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {categories.slice(0, 2).map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link 
                  to={`/products?category=${category.slug}`}
                  className="group block relative bg-[#F5F5F5] p-8 md:p-12 min-h-[400px] overflow-hidden"
                  data-testid={`category-card-${category.slug}`}
                >
                  <div className="absolute top-8 left-8 md:top-12 md:left-12 z-10">
                    <h3 className="font-display text-3xl md:text-4xl mb-2">{category.name}</h3>
                    <p className="text-sm text-foreground/60">
                      {allProducts.filter(p => p.category_id === category.id).length} items
                    </p>
                  </div>
                  
                  <img
                    src={optimizeImageUrl(category.image_url, { width: 900, quality: 70 })}
                    alt={category.name}
                    className="absolute bottom-0 right-0 w-2/3 h-3/4 object-contain transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  
                  <span className="absolute bottom-8 left-8 md:bottom-12 md:left-12 text-sm tracking-wider uppercase text-foreground/60 group-hover:text-foreground transition-colors">
                    + Show All
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending This Week */}
      <section className="py-16 md:py-24 px-4 md:px-8 lg:px-16" data-testid="trending-section">
        <div className="max-w-screen-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl italic mb-4">Trending This Week</h2>
            <p className="text-foreground/60 max-w-lg mx-auto">
              Find a bright ideal to suit your taste with our great selection of suspension, wall, floor and table lights.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-secondary"></div>
                  <div className="mt-4 h-5 bg-secondary rounded w-2/3 mx-auto"></div>
                  <div className="mt-2 h-4 bg-secondary rounded w-1/3 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {allProducts.slice(0, 8).map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
              
              <div className="text-center mt-12">
                <Link to="/products">
                  <Button 
                    variant="link"
                    className="text-foreground underline underline-offset-8 hover:no-underline text-sm tracking-[0.15em] uppercase"
                    data-testid="see-all-products-btn"
                  >
                    + See All Products
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Third Category Banner */}
      {categories[2] && (
        <section className="py-16 md:py-20 px-4 md:px-8 lg:px-16" data-testid="third-category-section">
          <div className="max-w-screen-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h2 className="font-display text-3xl md:text-4xl">New Design</h2>
            </motion.div>
            
            <Link 
              to={`/products?category=${categories[2].slug}`}
              className="group block relative bg-[#F5F5F5] p-8 md:p-12 min-h-[350px] overflow-hidden"
              data-testid={`category-banner-${categories[2].slug}`}
            >
              <div className="absolute top-8 left-8 md:top-12 md:left-12 z-10">
                <h3 className="font-display text-3xl md:text-4xl mb-2">{categories[2].name}</h3>
                <p className="text-sm text-foreground/60">
                  {allProducts.filter(p => p.category_id === categories[2].id).length} items
                </p>
              </div>
              
              <img
                src={optimizeImageUrl(categories[2].image_url, { width: 900, quality: 70 })}
                alt={categories[2].name}
                className="absolute bottom-0 right-12 w-1/3 h-3/4 object-contain transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              
              <span className="absolute bottom-8 left-8 md:bottom-12 md:left-12 text-sm tracking-wider uppercase text-foreground/60 group-hover:text-foreground transition-colors">
                + Show All
              </span>
            </Link>
          </div>
        </section>
      )}

      {/* New Design Products with Category Tabs */}
      <section className="py-16 md:py-24 px-4 md:px-8 lg:px-16 bg-white" data-testid="new-design-section">
        <div className="max-w-screen-2xl mx-auto">
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-12 md:mb-16">
            <Link 
              to="/products"
              className="text-sm tracking-[0.15em] uppercase text-foreground hover:text-accent transition-colors border-b-2 border-foreground pb-2"
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="text-sm tracking-[0.15em] uppercase text-foreground/60 hover:text-foreground transition-colors pb-2"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {allProducts.slice(0, 8).map((product, index) => (
              <ProductCard key={`new-${product.id}`} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-16 md:py-24 px-4 md:px-8 lg:px-16 bg-[#F5F5F5]" data-testid="promo-section">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-0.5 h-10 bg-foreground"></div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] font-semibold text-foreground/70">Lighting</p>
                  <p className="text-xs tracking-[0.15em] text-foreground/60">2024</p>
                </div>
              </div>
              
              <h2 className="font-display text-4xl md:text-5xl mb-6">
                Discover Our New Collection
              </h2>
              
              <Link to="/products">
                <Button 
                  className="rounded-none bg-foreground text-white hover:bg-foreground/90 px-10 py-6 text-sm tracking-[0.15em] uppercase"
                  data-testid="discover-now-btn"
                >
                  Discover NOW
                </Button>
              </Link>
            </div>
            
            <div className="relative h-[400px]">
              <img
                src={optimizeImageUrl(featuredProducts[0]?.images?.[0] || 'https://images.unsplash.com/photo-1758983304673-5a2d091e43e2', { width: 1100, quality: 72 })}
                alt="Featured product"
                className="w-full h-full object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter / Testimonial */}
      <section className="py-20 md:py-32 px-4 md:px-8 lg:px-16 bg-white" data-testid="testimonial-section">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <blockquote className="font-display text-2xl md:text-3xl italic leading-relaxed mb-8">
              "Very good Design. Flexible. Fast Support."
            </blockquote>
            <p className="text-sm tracking-[0.15em] uppercase text-foreground/60">
              Steve John
            </p>
            <p className="text-xs text-foreground/40 mt-1">
              (customer)
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-20 px-4 md:px-8 lg:px-16 bg-[#F5F5F5]" data-testid="why-choose-us-section">
        <div className="max-w-screen-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl mb-4">Why Choose Us</h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              We're committed to providing you with exceptional decor pieces and outstanding service.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Truck,
                title: "Free Shipping",
                description: "On orders above ₹999. We ship pan India — your handcrafted piece delivered to your door.",
                delay: 0
              },
              {
                icon: HandMetal,
                title: "Handmade, Always",
                description: "No conveyor belts, no shortcuts. Every piece is crafted by hand by skilled artisans who care.",
                delay: 0.1
              },
              {
                icon: Award,
                title: "Quality Guarantee",
                description: "From material selection to the finest detail — quality is never an afterthought.",
                delay: 0.2
              },
              {
                icon: Shield,
                title: "Secure Payments",
                description: "100% secure payment processing with UPI, cards, net banking, and COD options.",
                delay: 0.3
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: feature.delay }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-foreground text-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon size={24} />
                </div>
                <h3 className="font-display text-lg mb-3">{feature.title}</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-sm">
              <Award size={16} />
              <span className="text-sm font-medium">Handcrafted with Love</span>
            </div>
            <p className="text-sm text-foreground/60 mt-3 max-w-md mx-auto">
              Every piece is carefully crafted by skilled artisans who bring years of experience and passion to their work.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 lg:px-16 bg-white" data-testid="faq-section">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-foreground/50 mb-4">Got Questions?</p>
            <h2 className="font-display text-3xl md:text-4xl mb-4">Frequently Asked Questions</h2>
            <p className="text-foreground/60 max-w-lg mx-auto">
              Everything you need to know about our products, shipping, and payments. Can't find the answer? <Link to="/contact" className="underline underline-offset-4 hover:text-foreground transition-colors">Reach out to us.</Link>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {faqs.map((group) => (
              <div key={group.category} className="mb-8">
                <p className="text-xs uppercase tracking-[0.2em] text-foreground/40 font-medium mb-3 pl-1">
                  {group.category}
                </p>
                <Accordion type="single" collapsible className="border border-border">
                  {group.items.map((item, i) => (
                    <AccordionItem
                      key={i}
                      value={`${group.category}-${i}`}
                      className="border-b border-border last:border-b-0 px-5"
                    >
                      <AccordionTrigger className="text-sm font-medium text-left py-4 hover:no-underline">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-foreground/65 leading-relaxed pb-4">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
