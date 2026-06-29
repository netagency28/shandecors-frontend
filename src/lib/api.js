import axios from 'axios';

const isLocalDevHost = (hostname) => {
  if (!hostname) return false;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  return false;
};

const isLocalFrontend =
  typeof window !== 'undefined' &&
  isLocalDevHost(window.location.hostname);

// In local dev, use same-origin /api (proxied by craco) so HttpOnly auth cookies work.
const PRODUCTION_BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || 'https://api.shandecors.store';

const shouldUseDevProxy = () => {
  if (typeof window === 'undefined') return false;
  if (process.env.NODE_ENV === 'development') return true;
  return isLocalDevHost(window.location.hostname);
};

const BACKEND_URL = shouldUseDevProxy()
  ? ''
  : PRODUCTION_BACKEND_URL.replace(/\/$/, '');

export const API = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

const api = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const ALLOWED_PAYMENT_REDIRECT_HOSTS = [
  'instamojo.com',
  'www.instamojo.com',
  'test.instamojo.com',
  'cashfree.com',
  'payments.cashfree.com',
  'sandbox.cashfree.com',
];

export const isAllowedPaymentRedirect = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && !isLocalFrontend) return false;
    return ALLOWED_PAYMENT_REDIRECT_HOSTS.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`),
    );
  } catch {
    return false;
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const requestUrl = String(originalRequest.url || '');

    const shouldSkipRefresh = (
      requestUrl.includes('/auth/signin') ||
      requestUrl.includes('/auth/signup') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/session')
    );

    if (status === 401 && !originalRequest._retry && !shouldSkipRefresh) {
      originalRequest._retry = true;
      try {
        await axios.post(`${API}/auth/refresh`, {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        const onLoginPage = window.location.pathname.startsWith('/login');
        if (!onLoginPage) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Categories
export const getCategories = () => api.get('/categories');
export const getCategory = (slug) => api.get(`/categories/${slug}`);

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (slug) => api.get(`/products/${slug}`);
export const getProductById = (id) => api.get(`/products/id/${id}`);

// Cart (for authenticated users)
export const getCart = () => api.get('/cart');
export const addToCart = (data) => api.post('/cart', data);
export const updateCartItem = (itemId, data) => api.put(`/cart/${itemId}`, data);
export const removeFromCart = (itemId) => api.delete(`/cart/${itemId}`);
export const clearCart = () => api.delete('/cart');

// Orders
export const getOrders = () => api.get('/orders');
export const getOrder = (orderId) => api.get(`/orders/${orderId}`);
export const createOrder = (data) => api.post('/orders', data);
export const createGuestOrder = (data) => api.post('/orders/guest', data);

// Payments
export const createPaymentOrder = (data) => api.post('/payments/create-order', data);
export const verifyPayment = (orderId, params) => api.get(`/payments/verify/${orderId}`, { params });

// Authentication
export const signUp = (email, password, name) => api.post('/auth/signup', { email, password, name });
export const signIn = (email, password) => api.post('/auth/signin', { email, password });
export const signOut = () => api.post('/auth/signout');
export const exchangeSession = (tokens) => api.post('/auth/session', tokens);
export const resetPassword = (email) => api.post('/auth/reset-password', { email });
export const updatePassword = (password) => api.post('/auth/update-password', { password });

// Admin
export const getDashboardStats = () => api.get('/admin/dashboard');
export const getAdminProducts = (params) => api.get('/admin/products', { params });
export const createProduct = (data) => api.post('/admin/products', data);
export const updateProduct = (productId, data) => api.put(`/admin/products/${productId}`, data);
export const deleteProduct = (productId) => api.delete(`/admin/products/${productId}`);
export const bulkDeleteProducts = (ids) => api.post('/admin/products/bulk-delete', { ids });
export const getAdminOrders = (params) => api.get('/admin/orders', { params });
export const getAdminOrder = (orderId) => api.get(`/admin/orders/${orderId}`);
export const updateOrderStatus = (orderId, status) => api.put(`/admin/orders/${orderId}/status`, { status });
export const createCategory = (data) => api.post('/admin/categories', data);
export const deleteCategory = (categoryId) => api.delete(`/admin/categories/${categoryId}`);
export const getAdminUsers = () => api.get('/admin/users');
export const updateAdminUser = (userId, data) => api.put(`/admin/users/${userId}`, data);
export const deleteAdminUser = (userId) => api.delete(`/admin/users/${userId}`);
export const getAdminReviews = (params) => api.get('/admin/reviews', { params });
export const moderateAdminReview = (reviewId, moderationStatus) =>
  api.put(`/admin/reviews/${reviewId}/moderate`, { moderationStatus });
export const replyAdminReview = (reviewId, adminReply) =>
  api.put(`/admin/reviews/${reviewId}/reply`, { adminReply });
export const getAdminContent = () => api.get('/admin/content');
export const updateAdminContent = (slug, data) => api.put(`/admin/content/${slug}`, data);

// Uploads
export const uploadSingle = (file, type = 'product', path = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  if (path) formData.append('path', path);
  return api.post('/upload/single', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadMultiple = (files, type = 'product') => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  formData.append('type', type);
  return api.post('/upload/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Auth
export const getSession = () => api.get('/auth/session');
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.post('/auth/profile', data);

// Reviews
export const getProductReviews = (productId, params = {}) => api.get(`/reviews/product/${productId}`, { params });
export const getUserReview = (productId) => api.get(`/reviews/user/${productId}`);
export const createReview = (data) => api.post('/reviews', data);
export const updateReview = (id, data) => api.put(`/reviews/${id}`, data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

// Wishlist
export const getWishlist = (params = {}) => api.get('/wishlist', { params });
export const checkWishlist = (productId) => api.get(`/wishlist/check/${productId}`);
export const addToWishlist = (data) => api.post('/wishlist', data);
export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`);
export const clearWishlist = () => api.delete('/wishlist');
export const moveToCart = (productId) => api.post(`/wishlist/move-to-cart/${productId}`);

// User profile
export const getUserProfile = () => api.get('/users/profile');
export const updateUserProfile = (data) => api.put('/users/profile', data);

// Addresses
export const getAddresses = () => api.get('/addresses');
export const createAddress = (data) => api.post('/addresses', data);
export const updateAddress = (id, data) => api.put(`/addresses/${id}`, data);
export const deleteAddress = (id) => api.delete(`/addresses/${id}`);
export const setDefaultAddress = (id) => api.put(`/addresses/${id}/default`);

export const getContentPage = (slug) => api.get(`/content/${slug}`);
export const submitContactInquiry = (data) => api.post('/content/contact-inquiry', data);

export default api;
