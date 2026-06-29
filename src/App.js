import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from './components/ui/sonner';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/ScrollToTop';
import SeoManager from './components/SeoManager';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutPage from './pages/AboutPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentStatusPage from './pages/PaymentStatusPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProfilePage from './pages/ProfilePage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminUsers from './pages/admin/AdminUsers';
import AdminContent from './pages/admin/AdminContent';
import AdminReviews from './pages/admin/AdminReviews';
import './App.css';

// Layout wrapper for customer pages
function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function AnalyticsLoader() {
  const location = useLocation();

  useEffect(() => {
    const sensitivePaths = ['/auth/callback', '/reset-password'];
    if (sensitivePaths.some((path) => location.pathname.startsWith(path))) {
      return;
    }

    if (document.querySelector('script[data-gtm-loader="true"]')) {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-W7HSLFNC';
    script.dataset.gtmLoader = 'true';
    document.head.appendChild(script);
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AnalyticsLoader />
      <ScrollToTop />
      <SeoManager />
      <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
          <Routes>
            {/* Auth Routes (no layout) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            
            {/* Customer Routes */}
            <Route path="/" element={<CustomerLayout><HomePage /></CustomerLayout>} />
            <Route path="/about" element={<CustomerLayout><AboutPage /></CustomerLayout>} />
            <Route path="/products" element={<CustomerLayout><ProductsPage /></CustomerLayout>} />
            <Route path="/products/:slug" element={<CustomerLayout><ProductDetailPage /></CustomerLayout>} />
            <Route path="/wishlist" element={<CustomerLayout><WishlistPage /></CustomerLayout>} />
            <Route path="/checkout" element={<CustomerLayout><CheckoutPage /></CustomerLayout>} />
            <Route path="/payment/success" element={<CustomerLayout><PaymentStatusPage /></CustomerLayout>} />
            <Route path="/payment/failed" element={<CustomerLayout><PaymentStatusPage /></CustomerLayout>} />
            <Route path="/orders" element={<CustomerLayout><OrdersPage /></CustomerLayout>} />
            <Route path="/orders/:orderId" element={<CustomerLayout><OrderDetailPage /></CustomerLayout>} />
            <Route path="/profile" element={<CustomerLayout><ProfilePage /></CustomerLayout>} />
            <Route path="/contact" element={<CustomerLayout><ContactPage /></CustomerLayout>} />
            <Route path="/terms-and-conditions" element={<CustomerLayout><TermsPage /></CustomerLayout>} />
            <Route path="/refunds-cancellation-policy" element={<CustomerLayout><RefundPolicyPage /></CustomerLayout>} />
            <Route path="/shipping-policy" element={<CustomerLayout><ShippingPolicyPage /></CustomerLayout>} />
            <Route path="/privacy-policy" element={<CustomerLayout><PrivacyPolicyPage /></CustomerLayout>} />
            
            {/* Admin Routes (no customer layout) */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/new" element={<AdminProductForm />} />
            <Route path="/admin/products/:id" element={<AdminProductForm />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/content" element={<AdminContent />} />
            
            {/* 404 Catch-all */}
            <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><div><h1 className="text-2xl font-bold">404 - Page Not Found</h1><p className="text-gray-600">The page you're looking for doesn't exist.</p></div></div>} />
          </Routes>
          <Toaster position="bottom-right" />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default Sentry.withProfiler(App);
