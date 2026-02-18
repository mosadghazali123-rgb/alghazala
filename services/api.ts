
import { Product, Order, User, WeightOption, Category } from '../types';
import { db } from './db';
import { securityService } from './securityService';

/**
 * 🐝 Al Ghazaly Honey API System (Simulation)
 * Optimized for Production-Level Security and REST Architecture
 */

class HoneyAPI {
  private getAuthToken(): string | null {
    return localStorage.getItem('gh_v12_auth_token');
  }

  private isAdmin(): boolean {
    const session = db.getSession();
    return session?.role === 'super_admin' || session?.role === 'admin';
  }

  // --- Price Engine ---
  calculateFinalPrice(basePrice: number, discountType?: 'percent' | 'fixed', discountValue?: number): number {
    if (!discountValue || discountValue <= 0) return basePrice;
    
    let final = basePrice;
    if (discountType === 'percent') {
      final = basePrice - (basePrice * discountValue / 100);
    } else {
      final = basePrice - discountValue;
    }
    
    return Math.max(0, final);
  }

  // --- Product Management (Protected) ---
  async getProducts(params?: { category?: Category, activeOnly?: boolean }): Promise<Product[]> {
    let prods = db.getProducts();
    if (params?.activeOnly) prods = prods.filter(p => p.status === 'active');
    if (params?.category) prods = prods.filter(p => p.category === params.category);
    return prods;
  }

  async saveProduct(data: Partial<Product>): Promise<{ success: boolean; data?: Product; error?: string }> {
    if (!this.isAdmin()) {
      db.addLog('unauthorized_access', 'Attempted to save product without admin rights', 'high');
      return { success: false, error: 'Unauthorized' };
    }

    // Validation
    if (!data.name?.ar || !data.weight_options?.length) {
      return { success: false, error: 'Missing required fields' };
    }

    // Final price calculation for the base option (or updated)
    const basePrice = data.weight_options[0].price;
    const finalPrice = this.calculateFinalPrice(basePrice, data.discountType, data.discountValue);

    const product: Product = {
      id: data.id || `p-${Date.now()}`,
      name: data.name as any,
      description: data.description as any,
      botanical_source: data.botanical_source || 'Unknown',
      weight_options: data.weight_options,
      price: basePrice,
      originalPrice: basePrice,
      discountType: data.discountType,
      discountValue: data.discountValue,
      final_price: finalPrice,
      category: data.category || 'honey',
      stock: data.stock || 0,
      minimum_stock_alert: data.minimum_stock_alert || 5,
      images: data.images || [],
      sku: data.sku || `SKU-${Date.now()}`,
      status: data.status || 'active',
      origin_country: data.origin_country || 'Egypt',
      production_date: data.production_date || new Date().toISOString(),
      expiration_date: data.expiration_date || new Date().toISOString(),
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cartAddCount: data.cartAddCount || 0,
      purchaseCount: data.purchaseCount || 0,
      featured: data.featured || false
    };

    db.saveProduct(product);
    db.addLog('data_export', `Product ${product.id} saved/updated by admin`, 'low');
    return { success: true, data: product };
  }

  // --- Order System ---
  async placeOrder(orderData: Omit<Order, 'id' | 'status' | 'date'>): Promise<{ success: boolean; orderId?: string }> {
    // 1. Inventory Check
    const products = db.getProducts();
    for (const item of orderData.items) {
      const p = products.find(x => x.id === item.productId);
      if (!p || p.stock < item.quantity) {
        return { success: false };
      }
    }

    // 2. Create Secure Order
    const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      status: 'new',
      date: new Date().toISOString()
    };

    db.createOrder(newOrder);

    // 3. Update Inventory & Analytics
    for (const item of orderData.items) {
      const p = products.find(x => x.id === item.productId);
      if (p) {
        p.stock -= item.quantity;
        p.purchaseCount += item.quantity;
        db.saveProduct(p);

        if (p.stock <= p.minimum_stock_alert) {
          db.addLog('stock_alert', `Low stock for ${p.name.ar}: ${p.stock} remaining`, 'medium');
        }
      }
    }

    return { success: true, orderId };
  }

  // --- Security ---
  async login(email: string, pass: string): Promise<{ success: boolean; user?: User }> {
    const user = await db.login(email, pass);
    if (user) {
      // Simulate JWT Token creation
      const token = btoa(`${user.id}.${Date.now()}.${Math.random()}`);
      localStorage.setItem('gh_v12_auth_token', token);
      return { success: true, user: { ...user, token } };
    }
    return { success: false };
  }
}

export const api = new HoneyAPI();
