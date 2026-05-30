import { Link } from 'react-router-dom';
import { Facebook, Instagram, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1A1918] text-white/80" data-testid="footer">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 max-w-screen-2xl py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">

          {/* Brand */}
          <div>
            <Link to="/" className="inline-block">
              <img
                src="https://qkrcnxrabkmqrnlplagf.supabase.co/storage/v1/object/public/uploads/logos/shandecors_column_logo.png"
                alt="Shan Decors"
                className="h-16 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="mt-6 text-sm leading-relaxed text-white/60">
              Handcrafted with intention — celebrating India's timeless craftsmanship and bringing it into modern homes. Every piece is made by hand, shaped with care, and built to last.
            </p>

            <div className="flex gap-3 mt-6">
              <a href="#" aria-label="Facebook" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#1A1918] transition-colors">
                <Facebook size={16} />
              </a>
              <a href="https://www.instagram.com/shan.decorstore" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#1A1918] transition-colors">
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm tracking-[0.15em] uppercase font-medium text-white mb-6">Shop</h3>
            <ul className="space-y-3">
              <li><Link to="/products" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm text-white/60 hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/products?category=lamps" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm text-white/60 hover:text-white transition-colors">Lamps</Link></li>
              <li><Link to="/products?category=vases" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm text-white/60 hover:text-white transition-colors">Vases</Link></li>
              <li><Link to="/products?category=accessories" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm text-white/60 hover:text-white transition-colors">Accessories</Link></li>
              <li><Link to="/contact" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm text-white/60 hover:text-white transition-colors">Custom Orders</Link></li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-sm tracking-[0.15em] uppercase font-medium text-white mb-6">Information</h3>
            <ul className="space-y-3">
              <li><Link to="/about" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm text-white/60 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm text-white/60 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping-policy" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm text-white/60 hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link to="/refunds-cancellation-policy" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm text-white/60 hover:text-white transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/privacy-policy" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm text-white/60 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm text-white/60 hover:text-white transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm tracking-[0.15em] uppercase font-medium text-white mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <MapPin size={16} className="flex-shrink-0 text-white/40 mt-0.5" />
                <span className="text-sm text-white/60 leading-relaxed">
                  5th Cross Street, Periya Pudur,<br />
                  Near Sarada College Road,<br />
                  Salem, Tamil Nadu – 636016
                </span>
              </li>
              <li className="flex gap-3">
                <Phone size={16} className="flex-shrink-0 text-white/40 mt-0.5" />
                <a href="tel:+919003342466" className="text-sm text-white/60 hover:text-white transition-colors">
                  +91 90033 42466
                </a>
              </li>
              <li className="flex gap-3">
                <Mail size={16} className="flex-shrink-0 text-white/40 mt-0.5" />
                <a href="mailto:shandecor01@gmail.com" className="text-sm text-white/60 hover:text-white transition-colors">
                  shandecor01@gmail.com
                </a>
              </li>
            </ul>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-white/40 mb-1">Support Hours</p>
              <p className="text-xs text-white/50">Mon – Fri: 10 AM – 7 PM (IST)</p>
              <p className="text-xs text-white/50">Sat: 11 AM – 5 PM (IST)</p>
            </div>
          </div>
        </div>

        {/* Legal Disclosure */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-xs text-white/30 leading-relaxed max-w-3xl">
            <strong className="text-white/40">Shan Decors</strong> — Registered in India. All prices are inclusive of applicable taxes.
            As all products are handmade, slight variations in colour, texture, or finish may occur. These add to the uniqueness and authenticity of each piece.
            Grievance Officer: <a href="mailto:shandecor01@gmail.com" className="underline hover:text-white/60">shandecor01@gmail.com</a>.
            For disputes, contact us within 30 days of purchase.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Shan Decors. All rights reserved.
          </p>
          <p className="text-xs text-white/30 italic">Nature to Your Hands 🌿</p>
        </div>
      </div>
    </footer>
  );
}
