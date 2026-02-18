
import { Product, Order, User, DashboardStats, SecurityLog, Review, StoreSettings } from '../types';
import { securityService } from './securityService';
import { REVIEWS as MOCK_REVIEWS } from '../constants';

const DB_KEYS = {
  PRODUCTS: 'gh_v12_products',
  ORDERS: 'gh_v12_orders',
  REVIEWS: 'gh_v12_reviews',
  LOGS: 'gh_v12_security_logs',
  SESSION: 'gh_v12_session',
  ADMIN_CREDENTIALS: 'gh_v12_admin_creds',
  SETTINGS: 'gh_v12_store_settings'
};

const DEFAULT_ADMIN_EMAIL = "mosadghazali123@gmail.com";

const DEFAULT_SETTINGS: StoreSettings = {
  logoUrl: "https://cdn-icons-png.flaticon.com/512/2619/2619283.png", 
  heroImageUrl: "https://images.unsplash.com/photo-1587049633562-ad3002f02574?q=80&w=2000",
  storeName: { ar: "الغزالي", en: "Al Ghazaly" },
  slogan: { ar: "أصل النقاء والجودة", en: "Origin of Purity" }
};

const get = <T>(key: string, fallback: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

const set = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const db = {
  getSettings: (): StoreSettings => get(DB_KEYS.SETTINGS, DEFAULT_SETTINGS),
  updateSettings: (settings: StoreSettings) => {
    set(DB_KEYS.SETTINGS, settings);
    db.addLog('credential_change', 'Store settings updated', 'medium');
  },
  addLog: (event: SecurityLog['event'], details: string, severity: SecurityLog['severity'] = 'low') => {
    const logs = get<SecurityLog[]>(DB_KEYS.LOGS, []);
    const newLog: SecurityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      event, details, severity,
      ip: securityService.getMockIP()
    };
    set(DB_KEYS.LOGS, [newLog, ...logs].slice(0, 500)); 
  },
  getLogs: (): SecurityLog[] => get(DB_KEYS.LOGS, []),
  login: async (email: string, pass: string): Promise<User | null> => {
    const hash = await securityService.hashPassword(pass);
    const storedCreds = localStorage.getItem(DB_KEYS.ADMIN_CREDENTIALS);
    let creds;
    if (!storedCreds) {
      creds = { email: DEFAULT_ADMIN_EMAIL, passwordHash: hash };
      set(DB_KEYS.ADMIN_CREDENTIALS, creds);
    } else creds = JSON.parse(storedCreds);
    if (email.toLowerCase() === creds.email.toLowerCase() && hash === creds.passwordHash) {
      const user: User = { id: 'admin-01', name: 'Mosad Ghazali', email: creds.email, role: 'super_admin' };
      set(DB_KEYS.SESSION, { user, expiry: Date.now() + 86400000 });
      db.addLog('login_success', `Admin ${email} logged in`, 'low');
      return user;
    }
    db.addLog('login_failed', `Failed login for: ${email}`, 'medium');
    return null;
  },
  getOrders: (): Order[] => {
    const orders = get<Order[]>(DB_KEYS.ORDERS, []);
    return orders.map(o => ({ ...o, phone: securityService.decrypt(o.phone), address: securityService.decrypt(o.address) }));
  },
  // Fix: Added createOrder method which was missing and required by the api service
  createOrder: (order: Order) => {
    const orders = get<Order[]>(DB_KEYS.ORDERS, []);
    // Encrypt sensitive customer data before saving to localStorage
    const secureOrder = {
      ...order,
      phone: securityService.encrypt(order.phone),
      address: securityService.encrypt(order.address)
    };
    set(DB_KEYS.ORDERS, [...orders, secureOrder]);
  },
  getProducts: (): Product[] => get<Product[]>(DB_KEYS.PRODUCTS, []),
  saveProduct: (p: Product) => {
    const prods = db.getProducts();
    const idx = prods.findIndex(x => x.id === p.id);
    if (idx > -1) prods[idx] = p; else prods.push(p);
    set(DB_KEYS.PRODUCTS, prods);
  },
  getReviews: (): Review[] => get(DB_KEYS.REVIEWS, MOCK_REVIEWS),
  getStats: (): DashboardStats => {
    const orders = db.getOrders();
    const reviews = db.getReviews();
    const avgRating = reviews.length ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 5;
    return {
      totalRevenue: orders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + o.totalPrice, 0),
      totalOrders: orders.length,
      totalProducts: db.getProducts().length,
      totalCustomers: new Set(orders.map(o => o.customerName)).size,
      averageRating: Number(avgRating.toFixed(1)),
      cartAnalytics: [],
      securityLogs: db.getLogs()
    };
  },
  getSession: (): User | null => {
    const session = get<{ user: User; expiry: number } | null>(DB_KEYS.SESSION, null);
    if (session && Date.now() < session.expiry) return session.user;
    return null;
  },
  logout: () => localStorage.removeItem(DB_KEYS.SESSION)
};
