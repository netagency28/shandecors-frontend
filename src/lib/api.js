import axios from 'axios';

const isLocalFrontend =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

const BACKEND_URL = isLocalFrontend
  ? 'http://localhost:8000'
  : process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('supabase_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const requestUrl = String(originalRequest.url || '');

    const shouldSkipRefresh = (
      requestUrl.includes('/auth/signin') ||
      requestUrl.includes('/auth/signup') ||
      requestUrl.includes('/auth/refresh')
    );

    if (status === 401 && !originalRequest._retry && !shouldSkipRefresh) {
      const refreshToken = localStorage.getItem('supabase_refresh_token');
      if (refreshToken) {
        originalRequest._retry = true;
        try {
          const refreshResponse = await axios.post(`${API}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const newAccess = refreshResponse.data?.session?.access_token;
          const newRefresh = refreshResponse.data?.session?.refresh_token;

          if (newAccess) {
            localStorage.setItem('supabase_token', newAccess);
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          }
          if (newRefresh) {
            localStorage.setItem('supabase_refresh_token', newRefresh);
          }

          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('supabase_token');
          localStorage.removeItem('supabase_refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
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
export const refreshSession = (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken });
export const resetPassword = (email) => api.post('/auth/reset-password', { email });

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
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Auth
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

// Seed data
export const seedData = () => api.post('/seed');
export const getContentPage = (slug) => api.get(`/content/${slug}`);
export const submitContactInquiry = (data) => api.post('/content/contact-inquiry', data);

export default api;
