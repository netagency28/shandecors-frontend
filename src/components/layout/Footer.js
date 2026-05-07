import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1A1918] text-white/80" data-testid="footer">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 max-w-screen-2xl py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="font-display text-2xl tracking-[0.15em] uppercase text-white">
              Shan Decors
            </Link>
            <p className="mt-6 text-sm leading-relaxed text-white/60">
              Curating timeless pieces for modern living. We believe in the power of thoughtful design to transform spaces.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-3 mt-6">
              <a href="#" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#1A1918] transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#1A1918] transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#1A1918] transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#1A1918] transition-colors">
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm tracking-[0.15em] uppercase font-medium text-white mb-6">Shop</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/products" className="text-sm text-white/60 hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?category=lamps" className="text-sm text-white/60 hover:text-white transition-colors">
                  Lamps
                </Link>
              </li>
              <li>
                <Link to="/products?category=vases" className="text-sm text-white/60 hover:text-white transition-colors">
                  Vases
                </Link>
              </li>
              <li>
                <Link to="/products?category=accessories" className="text-sm text-white/60 hover:text-white transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-sm tracking-[0.15em] uppercase font-medium text-white mb-6">Information</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-white/60 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-white/60 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-sm text-white/60 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="text-sm text-white/60 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refunds-cancellation-policy" className="text-sm text-white/60 hover:text-white transition-colors">
                  Refunds & Cancellation
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="text-sm text-white/60 hover:text-white transition-colors">
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm tracking-[0.15em] uppercase font-medium text-white mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <MapPin size={18} className="flex-shrink-0 text-white/40" />
                <span className="text-sm text-white/60">Shan Decor, India</span>
              </li>
              <li className="flex gap-3">
                <Phone size={18} className="flex-shrink-0 text-white/40" />
                <a href="tel:+919876543210" className="text-sm text-white/60 hover:text-white transition-colors">+91 98765 43210</a>
              </li>
              <li className="flex gap-3">
                <Mail size={18} className="flex-shrink-0 text-white/40" />
                <a href="mailto:support@shandecor.in" className="text-sm text-white/60 hover:text-white transition-colors">support@shandecor.in</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Seller Disclosure — Consumer Protection (E-Commerce) Rules 2020 */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-xs text-white/30 leading-relaxed max-w-3xl">
            <strong className="text-white/40">Shan Decor</strong> — Registered in India. All prices are inclusive of applicable taxes.
            Grievance Officer: <a href="mailto:support@shandecor.in" className="underline hover:text-white/60">support@shandecor.in</a>.
            For disputes, contact us within 30 days of purchase.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Shan Decor. All rights reserved.
          </p>
          <div className="flex gap-6">
            <img src="https://cdn.shopify.com/s/files/1/0012/9669/5765/files/payment-1_77da8ffc-f89c-4cb9-91a8-27c1c7e4e0d0.png?v=1627295970" alt="Payment methods" className="h-6 opacity-60" />
          </div>
        </div>
      </div>
    </footer>
  );
}
