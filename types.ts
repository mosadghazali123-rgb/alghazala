export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';

export type Category = 
  | 'honey' | 'oils' | 'halawa' | 'dates' | 'zamzam' 
  | 'candles' | 'sweeteners' | 'essential' | 'juices' 
  | 'packages' | 'offers' | 'other';

export type OrderStatus = 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'vodafone_cash';

export interface StoreSettings {
  logoUrl: string;
  heroImageUrl: string;
  storeName: { ar: string; en: string };
  slogan: { ar: string; en: string };
}

export interface WeightOption {
  weight: string;
  price: number;
}

export interface Product {
  id: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  botanical_source?: string; 
  weight_options: WeightOption[]; 
  price: number; 
  originalPrice?: number;
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  final_price: number; 
  category: Category;
  stock: number;
  minimum_stock_alert: number;
  images: string[];
  sku: string;
  status: 'active' | 'inactive';
  origin_country: string;
  production_date: string;
  expiration_date: string;
  createdAt: string;
  updatedAt: string;
  cartAddCount: number;
  purchaseCount: number;
  featured: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number; 
  comment: string;
  date: string;
  approved: boolean;
}

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  phone: string; 
  address: string; 
  items: { 
    productId: string; 
    name: string; 
    quantity: number; 
    price: number;
    selectedWeight: string;
  }[];
  totalPrice: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  date: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: 'login_success' | 'login_failed' | 'unauthorized_access' | 'data_export' | 'credential_change' | 'stock_alert' | 'price_manipulation_attempt';
  ip: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'customer';
  token?: string; 
  passwordHash?: string;
  loginAttempts?: number;
  isLocked?: boolean;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  averageRating: number;
  cartAnalytics: { productName: string; adds: number; sales: number }[];
  securityLogs: SecurityLog[];
}

export type Page = 'home' | 'shop' | 'admin_login' | 'admin_dashboard';