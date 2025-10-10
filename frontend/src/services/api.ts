import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { User, Role, Order, Product } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = 'auth-token';
const DEFAULT_SUPERUSER_NAMES = ['alfitestlmao', 'ralditestlmao', 'irustestlmao'];
const rawEnvSuperusers = (import.meta.env.VITE_SUPERUSER_NAMES ?? '') as string;
const SUPERUSER_NAMES: string[] = rawEnvSuperusers
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);
const SUPERUSER_LIST = SUPERUSER_NAMES.length ? SUPERUSER_NAMES : DEFAULT_SUPERUSER_NAMES;

export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}/storage/${imagePath}`;
};

interface LoginResponse {
  user: User;
  token: string;
}

class ApiService {
  private api: AxiosInstance;
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      maxContentLength: 50 * 1024 * 1024,
      maxBodyLength: 50 * 1024 * 1024
    });
    this.setupInterceptors();
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('warung-user');
        const storedUser = stored ? JSON.parse(stored) : null;
        if (storedUser && storedUser.role === 'manager') {
          this._tokenPingInterval = window.setInterval(() => {
            this.pingToken().catch(() => {});
          }, 60 * 1000);
        }
      } catch (e) {}
    }
  }

  private _tokenPingInterval: number | null = null;

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          const url = error.config?.url || '';
          if (!url.includes('/auth/login')){
            this.clearAuth();
            window.dispatchEvent(new CustomEvent('authStateChanged', { 
              detail: { 
                reason: 'token_invalid',
                url: error.config?.url,
                status: error.response?.status
              } 
            }));
            if (window.location.pathname !== '/login') {
              setTimeout(() => {
                window.location.href = '/login';
              }, 1000);
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async validateToken(): Promise<{ valid: boolean; user?: User; shouldClear?: boolean; reason?: 'endpoint_missing' | 'network_error' | 'unknown' | 'expired' | 'no_token' | 'unauthorized' }> {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return { valid: false, reason: 'no_token' };
    }
    const storedUser = localStorage.getItem('warung-user');
    let user: User | null = null;
    try {
      if (storedUser) {
        user = JSON.parse(storedUser);
      }
    } catch (error) {
      this.clearAuth();
      return { valid: false, shouldClear: true };
    }
    if (!user) {
      return { valid: false, shouldClear: true };
    }

    try {
      const stored = localStorage.getItem('warung-user');
      const storedUser = stored ? JSON.parse(stored) : null;
      if (storedUser && storedUser.role === 'manager') {
        try {
          await this.api.get('/manager/users', { timeout: 5000 });
          return { valid: true, user, reason: 'unknown' };
        } catch (err: any) {
          if (err?.response?.status === 401) {
            this.clearAuth();
            return { valid: false, shouldClear: true, reason: 'expired' };
          }
          if (!err?.response) {
            return { valid: false, reason: 'network_error' };
          }
          return { valid: false, reason: 'unknown' };
        }
      }

      return { valid: true, user, reason: 'unknown' };
    } catch (outerErr) {
      return { valid: false, reason: 'unknown' };
    }
  }
  clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('warung-user');
    window.dispatchEvent(new CustomEvent('authStateChanged', {
      detail: { reason: 'manual_logout' }
    }));
    if (this._tokenPingInterval) {
      clearInterval(this._tokenPingInterval);
      this._tokenPingInterval = null;
    }
  }

  async pingToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const stored = localStorage.getItem('warung-user');
      const storedUser = stored ? JSON.parse(stored) : null;
      if (!storedUser) return false;
      if (storedUser.role !== 'manager') {
        return true;
      }

      try {
        await this.api.get('/manager/users', { timeout: 5000 });
        return true;
      } catch (err: any) {
        if (err?.response?.status === 401) {
          this.clearAuth();
          window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { reason: 'token_expired' } }));
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            setTimeout(() => { window.location.href = '/login'; }, 500);
          }
          return false;
        }
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  isTokenValid(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    return token.length > 10 && typeof token === 'string';
  }

  async login(credentials: { email?: string; username?: string; password: string } | string, password?: string): Promise<LoginResponse> {
    let loginData: { email?: string; username?: string; password: string };
    if (typeof credentials === 'string') {
      loginData = { email: credentials, password: password! };
    } else {
      loginData = credentials;
    }

    const response = await this.api.post('/auth/login', loginData);
    
    let user, token;
    if (response.data.data?.user && response.data.data?.token) {
      user = response.data.data.user;
      token = response.data.data.token;
    } else if (response.data.user && response.data.token) {
      user = response.data.user;
      token = response.data.token;
    } else if (response.data.user && response.data.access_token) {
      user = response.data.user;
      token = response.data.access_token;
    } else if (response.data.success && response.data.data?.user) {
      user = response.data.data.user;
      token = response.data.data.token || response.data.data.access_token;
    } else {
      throw new Error('Invalid response format from server');
    }
    
    if (!user || !token) {
      throw new Error('Login failed: Invalid credentials');
    }
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem('warung-user', JSON.stringify(user));
    return { user, token };
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
    } finally {
      this.clearAuth();
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      const response = await this.api.get('/manager/products');

      if (response.data && response.data.success && response.data.data) {
        const productsData = response.data.data.data || [];
        return productsData.map((product: any) => ({
          id: product.id,
          name: product.name || '',
          description: '',
          category: product.category || 'food',
          price: Number(product.price) || 0,
          image: product.image_path || '',
          rating: 0,
          reviewCount: 0,
          stock: 999,
          isAvailable: product.is_available !== undefined ? product.is_available : true
        }));
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  async getProduct(id: string): Promise<Product> {
    const response = await this.api.get(`/products/${id}`);
    return response.data.data || response.data;
  }

  async createProduct(productData: Omit<Product, 'id'>, imageFile?: File, onUploadProgress?: (progressEvent?: import('axios').AxiosProgressEvent) => void): Promise<Product> {
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('name', productData.name);
        formData.append('price', productData.price.toString());
        formData.append('category', productData.category);
        formData.append('image', imageFile);
        
        try {
          const response = await this.api.post('/manager/products', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 45000,
            onUploadProgress
          });
          return response.data.data || response.data;
        } catch (err: any) {
          if (err?.code === 'ECONNABORTED' || !err?.response) {
            try {
              await new Promise(res => setTimeout(res, 800));
              const listResp = await this.api.get('/manager/products', { timeout: 20000 });
              const productsData = (listResp.data?.data?.data) || (listResp.data?.data) || listResp.data || [];
              const found = productsData.find((p: any) => (
                p.name === productData.name &&
                String(p.price) === String(productData.price) &&
                p.category === productData.category
              ));
              if (found) {
                return {
                  id: found.id,
                  name: found.name || '',
                  category: found.category || 'food',
                  price: Number(found.price) || 0,
                  image: found.image_path || ''
                };
              }
            } catch (confirmErr) {}

            await new Promise(res => setTimeout(res, 1000));
            const retryResponse = await this.api.post('/manager/products', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              timeout: 60000,
              onUploadProgress
            });
            return retryResponse.data.data || retryResponse.data;
          }
          throw err;
        }
      } else {
        const cleanData = {
          name: productData.name,
          price: productData.price.toString(),
          category: productData.category,
          ...(productData.image && { image: productData.image })
        };
        const response = await this.api.post('/manager/products', cleanData, { timeout: 30000 });
        return response.data.data || response.data;
      }
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        error.message = 'Connection timeout - please check your internet connection and try again';
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        error.message = 'Cannot connect to server - please check if the server is running';
      } else if (!error.response) {
        error.message = 'Network error - please check your internet connection';
      }
      throw error;
    }
  }

  async updateProduct(id: string, productData: Partial<Omit<Product, 'id'>>, imageFile?: File, onUploadProgress?: (progressEvent?: import('axios').AxiosProgressEvent) => void): Promise<Product> {
    try {
      if (imageFile) {
        const formData = new FormData();
        if (productData.name) formData.append('name', productData.name);
        if (productData.price !== undefined) formData.append('price', productData.price.toString());
        if (productData.category) formData.append('category', productData.category);
        formData.append('image', imageFile);
        try {
          const response = await this.api.put(`/manager/products/${id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 45000,
            onUploadProgress
          });
          return response.data.data || response.data;
        } catch (err: any) {
          if (err?.code === 'ECONNABORTED' || !err?.response) {
            try {
              await new Promise(res => setTimeout(res, 800));
              const getResp = await this.api.get(`/manager/products/${id}`, { timeout: 20000 });
              const existing = getResp.data?.data || getResp.data;
              const matches = (
                (!productData.name || existing.name === productData.name) &&
                (productData.price === undefined || Number(existing.price) === Number(productData.price)) &&
                (!productData.category || existing.category === productData.category)
              );
              if (matches) {
                return {
                  id: existing.id,
                  name: existing.name || '',
                  category: existing.category || 'food',
                  price: Number(existing.price) || 0,
                  image: existing.image_path || ''
                };
              }
            } catch (confirmErr) {}

            await new Promise(res => setTimeout(res, 1000));
            const retryResponse = await this.api.put(`/manager/products/${id}`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              timeout: 60000,
              onUploadProgress
            });
            return retryResponse.data.data || retryResponse.data;
          }
          throw err;
        }
      } else {
        const cleanData: any = {};
        if (productData.name) cleanData.name = productData.name;
        if (productData.price !== undefined) cleanData.price = productData.price.toString();
        if (productData.category) cleanData.category = productData.category;
        if (productData.image !== undefined && productData.image !== '') cleanData.image = productData.image;
        
        try {
          const response = await this.api.patch(`/manager/products/${id}`, cleanData, { timeout: 45000 });
          return response.data.data || response.data;
        } catch (err: any) {
          if (err?.code === 'ECONNABORTED' || !err?.response) {
            try {
              await new Promise(res => setTimeout(res, 800));
              const getResp = await this.api.get(`/manager/products/${id}`, { timeout: 20000 });
              const existing = getResp.data?.data || getResp.data;
              const matches = (
                (!cleanData.name || existing.name === cleanData.name) &&
                (cleanData.price === undefined || Number(existing.price) === Number(cleanData.price)) &&
                (!cleanData.category || existing.category === cleanData.category)
              );
              if (matches) {
                return {
                  id: existing.id,
                  name: existing.name || '',
                  category: existing.category || 'food',
                  price: Number(existing.price) || 0,
                  image: existing.image_path || ''
                };
              }
            } catch (confirmErr) {}

            await new Promise(res => setTimeout(res, 1000));
            const retryResponse = await this.api.patch(`/manager/products/${id}`, cleanData, { timeout: 60000 });
            return retryResponse.data.data || retryResponse.data;
          }
          throw err;
        }
      }
    } catch (error: any) {
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    await this.api.delete(`/manager/products/${id}`);
  }

  async getPublicProducts(): Promise<Product[]> {
    try {
      const response = await this.api.get('/products');

      let productsData: any[] = [];
      if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
        productsData = response.data.data.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        productsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response.data?.data && typeof response.data.data === 'object') {
        productsData = response.data.data || [];
      }

      return productsData.map((product: any) => ({
        id: product.id,
        name: product.name || '',
        category: product.category || 'food',
        price: Number(product.price) || 0,
        image: product.image_path || product.image || '',
      }));
    } catch (error) {
      return [];
    }
  }

  async getOrders(): Promise<Order[]> {
    const response = await this.api.get('/orders');
    return response.data.data || response.data || [];
  }

  async getCashierOrders(): Promise<Order[]> {
    const response = await this.api.get('/orders');
    return response.data.data || response.data || [];
  }

  async getCashierSummary(): Promise<any[]> {
    try {
      const response = await this.api.get('/summary/cashier/today');
      return response.data.data || response.data || [];
    } catch (error) {
      return [];
    }
  }

  async createOrder(orderData: {
    items: { product_id: string; quantity: number }[];
    total?: number;
  }): Promise<Order> {
    const response = await this.api.post('/orders', orderData);
    return response.data.data || response.data;
  }

  async getUsers(): Promise<User[]> {
    try {
      const response = await this.api.get('/manager/users');

      let users: User[];
      
      if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
        users = response.data.data.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        users = response.data.data;
      } else if (Array.isArray(response.data)) {
        users = response.data;
      } else {
        users = [];
      }
      return users || [];
    } catch (error: any) {
      return [];
    }
  }

  async createUser(userData: {
    name: string;
    username: string;
    password: string;
    password_confirmation: string;
    role: Role;
  }): Promise<User> {
    try {
      const requestData: any = {
        name: userData.name,
        username: userData.username,
        password: userData.password,
        password_confirmation: userData.password
      };
      
      const storedUser = localStorage.getItem('warung-user');
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      const isSuperuser = this.isSuperuserManager(currentUser);
      
      if (isSuperuser && userData.role === 'manager') {
        requestData.role = userData.role;
      }
      
      const response = await this.api.post('/manager/users', requestData, { 
        timeout: 30000 
      });
      return response.data.data || response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async updateUser(id: number | string, userData: Partial<{
    name: string;
    username: string;
    password: string;
    password_confirmation: string;
    role: Role;
  }>): Promise<User> {
    try {
      try {
        const response = await this.api.patch(`/manager/users/${id}`, userData, { timeout: 30000 });
        return response.data.data || response.data;
      } catch (err: any) {
        if (err?.code === 'ECONNABORTED' || !err?.response) {
          try {
            await new Promise(res => setTimeout(res, 800));
            const listResp = await this.api.get('/manager/users', { timeout: 20000 });
            let usersData = [];
            if (listResp.data?.data?.data && Array.isArray(listResp.data.data.data)) {
              usersData = listResp.data.data.data;
            } else if (listResp.data?.data && Array.isArray(listResp.data.data)) {
              usersData = listResp.data.data;
            } else if (Array.isArray(listResp.data)) {
              usersData = listResp.data;
            }
            
            const existing = usersData.find((u: any) => String(u.id) === String(id));
            
            if (existing) {
              const matches = (
                (!userData.name || existing.name === userData.name) &&
                (!userData.username || existing.username === userData.username) &&
                (!userData.role || existing.role === userData.role)
              );
              
              if (matches) {
                return existing;
              }
            }
          } catch (confirmErr) {}
          
          await new Promise(res => setTimeout(res, 1000));
          const retryResponse = await this.api.patch(`/manager/users/${id}`, userData, { timeout: 45000 });
          return retryResponse.data.data || retryResponse.data;
        }
        throw err;
      }
    } catch (error: any) {
      throw error;
    }
  }

  async deleteUser(id: number | string): Promise<void> {
    await this.api.delete(`/manager/users/${id}`);
  }

  isSuperuserManager(user: User | null): boolean {
    if (!user) return false;

    if ((user as any).is_superuser || (user as any).isSuperuser) return true;

    const role = String(user.role || '').toLowerCase();
    if (role !== 'manager') return false;

    let username = String(user.username || '').toLowerCase().trim();
    if (username.startsWith('@')) username = username.slice(1);
    return SUPERUSER_LIST.includes(username);
  }

  async getManagerUsers(): Promise<User[]> {
    const response = await this.api.get('/manager/users');
    const users = response.data.data || response.data || [];
    return users.filter((user: User) => user.role === 'manager');
  }

  async getCashierUsers(): Promise<User[]> {
    const response = await this.api.get('/manager/users');
    const users = response.data.data || response.data || [];
    return users.filter((user: User) => user.role === 'cashier');
  }

  async getSummary(filters?: { start_date?: string; end_date?: string }): Promise<any> {
    try {
      const response = await this.api.get('/summary', { params: filters || {} });
      return response.data.data || response.data || {};
    } catch (error) {
      return {};
    }
  }
}

export const apiService = new ApiService();
export default apiService;
