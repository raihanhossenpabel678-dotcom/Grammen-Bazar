import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testFirestoreConnection } from './firebase';
import { Product, Category, Order, Coupon, CartItem, Customer } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_COUPONS, INITIAL_ORDERS } from '../data/initialData';

const PRODUCTS_KEY = 'grameen_bazar_products_v1';
const CATEGORIES_KEY = 'grameen_bazar_categories_v1';
const ORDERS_KEY = 'grameen_bazar_orders_v1';
const COUPONS_KEY = 'grameen_bazar_coupons_v1';
const CART_KEY = 'grameen_bazar_cart_v1';

type Listener = () => void;

class StoreService {
  private products: Product[] = [];
  private categories: Category[] = [];
  private orders: Order[] = [];
  private coupons: Coupon[] = [];
  private cart: CartItem[] = [];
  private listeners: Set<Listener> = new Set();

  public isLoading = true;
  public error: string | null = null;
  public isFirestoreConnected = false;

  constructor() {
    this.initCart();
    this.initFirestore();
  }

  private initCart() {
    try {
      const storedCart = localStorage.getItem(CART_KEY);
      this.cart = storedCart ? JSON.parse(storedCart) : [];
    } catch {
      this.cart = [];
    }
  }

  private async initFirestore() {
    this.isLoading = true;
    this.notify();

    try {
      // Test Firestore connection
      const connected = await testFirestoreConnection();
      this.isFirestoreConnected = connected;

      // 1. Fetch or Seed Products
      const productsPath = 'products';
      try {
        const prodSnap = await getDocs(collection(db, productsPath));
        if (prodSnap.empty) {
          // Attempt seeding to Firestore if admin
          for (const p of INITIAL_PRODUCTS) {
            try {
              await setDoc(doc(db, productsPath, p.id), p);
            } catch {
              // Non-admin visitor cannot seed remote documents
            }
          }
          this.products = [...INITIAL_PRODUCTS];
        } else {
          this.products = prodSnap.docs.map((d) => d.data() as Product);
        }
      } catch (err) {
        console.warn('Firestore products fetch warning:', err);
        const local = localStorage.getItem(PRODUCTS_KEY);
        this.products = local ? JSON.parse(local) : INITIAL_PRODUCTS;
      }

      // 2. Fetch or Seed Categories
      const categoriesPath = 'categories';
      try {
        const catSnap = await getDocs(collection(db, categoriesPath));
        if (catSnap.empty) {
          for (const c of INITIAL_CATEGORIES) {
            try {
              await setDoc(doc(db, categoriesPath, c.id), c);
            } catch {
              // Non-admin visitor
            }
          }
          this.categories = [...INITIAL_CATEGORIES];
        } else {
          this.categories = catSnap.docs.map((d) => d.data() as Category);
        }
      } catch {
        const local = localStorage.getItem(CATEGORIES_KEY);
        this.categories = local ? JSON.parse(local) : INITIAL_CATEGORIES;
      }

      // 3. Initialize Orders (stored locally for customer; remote listing requires admin privileges)
      try {
        const local = localStorage.getItem(ORDERS_KEY);
        this.orders = local ? JSON.parse(local) : INITIAL_ORDERS;
      } catch {
        this.orders = [...INITIAL_ORDERS];
      }

      // 4. Fetch or Seed Coupons
      const couponsPath = 'coupons';
      try {
        const couponSnap = await getDocs(collection(db, couponsPath));
        if (couponSnap.empty) {
          for (const cp of INITIAL_COUPONS) {
            try {
              await setDoc(doc(db, couponsPath, cp.id), cp);
            } catch {
              // Non-admin visitor
            }
          }
          this.coupons = [...INITIAL_COUPONS];
        } else {
          this.coupons = couponSnap.docs.map((d) => d.data() as Coupon);
        }
      } catch {
        const local = localStorage.getItem(COUPONS_KEY);
        this.coupons = local ? JSON.parse(local) : INITIAL_COUPONS;
      }

      // Set up real-time listener for products
      onSnapshot(
        collection(db, productsPath),
        (snapshot) => {
          if (!snapshot.empty) {
            this.products = snapshot.docs.map((d) => d.data() as Product);
            localStorage.setItem(PRODUCTS_KEY, JSON.stringify(this.products));
            this.notify();
          }
        },
        (error) => {
          console.warn('Products realtime sync warning:', error);
        }
      );

      // Set up real-time listener for categories
      onSnapshot(
        collection(db, categoriesPath),
        (snapshot) => {
          if (!snapshot.empty) {
            this.categories = snapshot.docs.map((d) => d.data() as Category);
            localStorage.setItem(CATEGORIES_KEY, JSON.stringify(this.categories));
            this.notify();
          }
        },
        (error) => {
          console.warn('Categories realtime sync warning:', error);
        }
      );

      // Set up real-time listener for coupons
      onSnapshot(
        collection(db, couponsPath),
        (snapshot) => {
          if (!snapshot.empty) {
            this.coupons = snapshot.docs.map((d) => d.data() as Coupon);
            localStorage.setItem(COUPONS_KEY, JSON.stringify(this.coupons));
            this.notify();
          }
        },
        (error) => {
          console.warn('Coupons realtime sync warning:', error);
        }
      );

      // Cache locally
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(this.products));
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(this.categories));
      localStorage.setItem(ORDERS_KEY, JSON.stringify(this.orders));
      localStorage.setItem(COUPONS_KEY, JSON.stringify(this.coupons));

      this.isLoading = false;
      this.error = null;
      this.notify();
    } catch (err: any) {
      console.error('Store initialization error:', err);
      this.error = err.message || 'ডাটাবেজ লোড করতে সমস্যা হয়েছে। লোকাল মোডে চালানো হচ্ছে।';
      this.isLoading = false;
      this.notify();
    }
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- Products ---
  public getProducts(): Product[] {
    return [...this.products];
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  public getProductBySlug(slug: string): Product | undefined {
    return this.products.find((p) => p.slug === slug);
  }

  public async addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    // Optimistic local update
    this.products.unshift(newProduct);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(this.products));
    this.notify();

    // Firestore sync
    const path = `products/${newProduct.id}`;
    try {
      await setDoc(doc(db, 'products', newProduct.id), newProduct);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }

    return newProduct;
  }

  public async updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return false;

    this.products[index] = { ...this.products[index], ...updates };
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(this.products));
    this.notify();

    const path = `products/${id}`;
    try {
      await updateDoc(doc(db, 'products', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }

    return true;
  }

  public async deleteProduct(id: string): Promise<boolean> {
    const initialLen = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
    if (this.products.length !== initialLen) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(this.products));
      this.notify();

      const path = `products/${id}`;
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
      return true;
    }
    return false;
  }

  // --- Categories CRUD ---
  public getCategories(): Category[] {
    return [...this.categories];
  }

  public async addCategory(cat: Omit<Category, 'id'>): Promise<Category> {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    this.categories.push(newCat);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(this.categories));
    this.notify();

    const path = `categories/${newCat.id}`;
    try {
      await setDoc(doc(db, 'categories', newCat.id), newCat);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
    return newCat;
  }

  public async updateCategory(id: string, updates: Partial<Category>): Promise<boolean> {
    const idx = this.categories.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.categories[idx] = { ...this.categories[idx], ...updates };
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(this.categories));
    this.notify();

    const path = `categories/${id}`;
    try {
      await updateDoc(doc(db, 'categories', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
    return true;
  }

  public async deleteCategory(id: string): Promise<boolean> {
    this.categories = this.categories.filter((c) => c.id !== id);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(this.categories));
    this.notify();

    const path = `categories/${id}`;
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
    return true;
  }

  // --- Cart Management ---
  public getCart(): CartItem[] {
    return [...this.cart];
  }

  public addToCart(product: Product, quantity = 1, selectedUnit?: string): { success: boolean; message?: string } {
    const currentProduct = this.products.find((p) => p.id === product.id) || product;
    if (currentProduct.stock <= 0) {
      return { success: false, message: `"${currentProduct.banglaName}" বর্তমানে স্টকে নেই।` };
    }

    const existingIndex = this.cart.findIndex((item) => item.product.id === product.id);
    if (existingIndex > -1) {
      const currentQty = this.cart[existingIndex].quantity;
      if (currentQty >= currentProduct.stock) {
        return {
          success: false,
          message: `"${currentProduct.banglaName}" এর সর্বোচ্চ স্টক (${currentProduct.stock} টি) ইতিমধ্যেই আপনার কার্টে রয়েছে।`,
        };
      }
      this.cart[existingIndex].quantity = Math.min(currentProduct.stock, currentQty + quantity);
    } else {
      const initialQty = Math.min(currentProduct.stock, Math.max(1, quantity));
      this.cart.push({
        product: currentProduct,
        quantity: initialQty,
        selectedUnit: selectedUnit || currentProduct.unit,
      });
    }
    localStorage.setItem(CART_KEY, JSON.stringify(this.cart));
    this.notify();
    return { success: true };
  }

  public updateCartQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    const item = this.cart.find((i) => i.product.id === productId);
    if (item) {
      const prod = this.products.find((p) => p.id === productId) || item.product;
      item.quantity = Math.min(Math.max(1, prod.stock), quantity);
      localStorage.setItem(CART_KEY, JSON.stringify(this.cart));
      this.notify();
    }
  }

  public removeFromCart(productId: string) {
    this.cart = this.cart.filter((item) => item.product.id !== productId);
    localStorage.setItem(CART_KEY, JSON.stringify(this.cart));
    this.notify();
  }

  public clearCart() {
    this.cart = [];
    localStorage.setItem(CART_KEY, JSON.stringify(this.cart));
    this.notify();
  }

  // --- Coupons ---
  public getCoupons(): Coupon[] {
    return [...this.coupons];
  }

  public validateCoupon(
    code: string,
    currentSubtotal: number
  ): { valid: boolean; message: string; discount: number; coupon?: Coupon } {
    const cleanCode = code.trim().toUpperCase();
    const coupon = this.coupons.find((c) => c.code.toUpperCase() === cleanCode && c.isActive);

    if (!coupon) {
      return { valid: false, message: 'কুপন কোডটি সঠিক নয় বা মেয়াদ শেষ হয়েছে', discount: 0 };
    }

    if (currentSubtotal < coupon.minSpend) {
      return {
        valid: false,
        message: `এই কুপনের জন্য সর্বনিম্ন ৳${coupon.minSpend} টাকার পণ্য প্রয়োজন`,
        discount: 0,
      };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((currentSubtotal * coupon.discountValue) / 100);
    } else {
      discount = coupon.discountValue;
    }

    return {
      valid: true,
      message: `অভিনন্দন! ৳${discount} ছাড় প্রযোজ্য হয়েছে`,
      discount,
      coupon,
    };
  }

  public async addCoupon(coupon: Omit<Coupon, 'id' | 'usageCount'>): Promise<Coupon> {
    const newCoupon: Coupon = {
      ...coupon,
      id: `c-${Date.now()}`,
      usageCount: 0,
    };
    this.coupons.unshift(newCoupon);
    localStorage.setItem(COUPONS_KEY, JSON.stringify(this.coupons));
    this.notify();

    const path = `coupons/${newCoupon.id}`;
    try {
      await setDoc(doc(db, 'coupons', newCoupon.id), newCoupon);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }

    return newCoupon;
  }

  public async toggleCouponStatus(id: string): Promise<boolean> {
    const coupon = this.coupons.find((c) => c.id === id);
    if (!coupon) return false;
    coupon.isActive = !coupon.isActive;
    localStorage.setItem(COUPONS_KEY, JSON.stringify(this.coupons));
    this.notify();

    const path = `coupons/${id}`;
    try {
      await updateDoc(doc(db, 'coupons', id), { isActive: coupon.isActive });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
    return true;
  }

  public async deleteCoupon(id: string): Promise<boolean> {
    this.coupons = this.coupons.filter((c) => c.id !== id);
    localStorage.setItem(COUPONS_KEY, JSON.stringify(this.coupons));
    this.notify();

    const path = `coupons/${id}`;
    try {
      await deleteDoc(doc(db, 'coupons', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
    return true;
  }

  // --- Orders ---
  private ordersUnsubscribe: (() => void) | null = null;

  public async fetchOrdersFromFirestore(): Promise<Order[]> {
    const ordersPath = 'orders';
    try {
      const orderSnap = await getDocs(collection(db, ordersPath));
      if (!orderSnap.empty) {
        this.orders = orderSnap.docs.map((d) => d.data() as Order);
        localStorage.setItem(ORDERS_KEY, JSON.stringify(this.orders));
        this.notify();
      }
    } catch (err) {
      console.warn('Orders fetch error (requires admin permission):', err);
    }
    return this.getOrders();
  }

  public subscribeToOrdersRealtime(): () => void {
    if (this.ordersUnsubscribe) {
      this.ordersUnsubscribe();
    }
    const ordersPath = 'orders';
    try {
      this.ordersUnsubscribe = onSnapshot(
        collection(db, ordersPath),
        (snapshot) => {
          this.orders = snapshot.docs.map((d) => d.data() as Order);
          localStorage.setItem(ORDERS_KEY, JSON.stringify(this.orders));
          this.notify();
        },
        (error) => {
          console.warn('Orders realtime listener warning (requires admin):', error);
        }
      );
      return this.ordersUnsubscribe;
    } catch (err) {
      console.warn('Could not subscribe to orders:', err);
      return () => {};
    }
  }

  public getOrders(): Order[] {
    return [...this.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getOrderById(idOrNumber: string): Order | undefined {
    const clean = idOrNumber.trim().toUpperCase();
    return this.orders.find(
      (o) => o.id === idOrNumber || o.orderNumber.toUpperCase() === clean
    );
  }

  public getOrdersByPhone(phone: string): Order[] {
    const digits = phone.replace(/[^0-9]/g, '');
    return this.orders.filter((o) => o.customerPhone.replace(/[^0-9]/g, '').includes(digits));
  }

  public async createOrder(
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>
  ): Promise<Order> {
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('কার্ট খালি। কোনো পণ্য অর্ডার করার জন্য নেই।');
    }

    // Strict Stock Validation
    for (const item of orderData.items) {
      const prod = this.products.find((p) => p.id === item.productId);
      if (!prod || prod.stock < item.quantity) {
        const available = prod ? prod.stock : 0;
        throw new Error(
          `দুঃখিত, "${item.banglaName || prod?.banglaName || 'পণ্য'}" পর্যাপ্ত স্টকে নেই। বর্তমান স্টক: ${available} টি, অনুরোধ: ${item.quantity} টি।`
        );
      }
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `GB-${randomSuffix}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      courierName:
        orderData.deliveryArea === 'inside_dhaka'
          ? 'Grameen Express Dhaka'
          : 'Steadfast Courier',
      trackingCode: `ST-${Date.now().toString().slice(-6)}`,
    };

    // Deduct stock locally and in Firestore
    newOrder.items.forEach((item) => {
      const prod = this.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        updateDoc(doc(db, 'products', prod.id), { stock: prod.stock }).catch((err) => {
          console.warn('Firestore stock update non-fatal warning:', err);
        });
      }
    });

    this.orders.unshift(newOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(this.orders));

    // Clear cart
    this.clearCart();
    this.notify();

    // Firestore write
    const path = `orders/${newOrder.id}`;
    try {
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }

    return newOrder;
  }

  /**
   * Initiate SSLCommerz Online Payment through server
   */
  public async initiateOnlinePayment(
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>
  ): Promise<{
    success: boolean;
    redirectUrl?: string;
    orderId?: string;
    orderNumber?: string;
    tranId?: string;
    error?: string;
  }> {
    if (!orderData.items || orderData.items.length === 0) {
      return { success: false, error: 'কার্ট খালি। কোনো পণ্য অর্ডার করার জন্য নেই।' };
    }

    // Strict Stock Validation
    for (const item of orderData.items) {
      const prod = this.products.find((p) => p.id === item.productId);
      if (!prod || prod.stock < item.quantity) {
        const available = prod ? prod.stock : 0;
        return {
          success: false,
          error: `দুঃখিত, "${item.banglaName || prod?.banglaName || 'পণ্য'}" পর্যাপ্ত স্টকে নেই। বর্তমান স্টক: ${available} টি, অনুরোধ: ${item.quantity} টি।`,
        };
      }
    }

    try {
      const response = await fetch('/api/payment/sslcommerz/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderData }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'পেমেন্ট গেটওয়ে ইনিশিয়ালাইজেশনে ব্যর্থ হয়েছে।',
        };
      }

      // Deduct stock for initiated order
      orderData.items.forEach((item) => {
        const prod = this.products.find((p) => p.id === item.productId);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
          updateDoc(doc(db, 'products', prod.id), { stock: prod.stock }).catch((err) => {
            console.warn('Firestore stock update non-fatal warning:', err);
          });
        }
      });

      this.clearCart();
      this.notify();

      return data;
    } catch (err) {
      console.error('Error initiating online payment:', err);
      return {
        success: false,
        error: 'নেটওয়ার্ক বা সার্ভার ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।',
      };
    }
  }

  /**
   * Verify server-side payment status and sync local order
   */
  public async verifyServerPayment(orderId: string): Promise<Order | null> {
    try {
      const res = await fetch(`/api/payment/verify-order/${encodeURIComponent(orderId)}`);
      if (res.ok) {
        const verifiedData = await res.json();
        // Update local memory cache if present
        const existing = this.orders.find((o) => o.id === orderId);
        if (existing) {
          Object.assign(existing, verifiedData);
          localStorage.setItem(ORDERS_KEY, JSON.stringify(this.orders));
          this.notify();
          return existing;
        }
      }
    } catch (err) {
      console.warn('Could not verify order via API, attempting direct Firestore get:', err);
    }

    return this.fetchOrderByIdFromFirestore(orderId);
  }

  /**
   * Fetch single order directly from Firestore by ID (safe public get allowed by rules)
   */
  public async fetchOrderByIdFromFirestore(orderId: string): Promise<Order | null> {
    try {
      const snap = await getDoc(doc(db, 'orders', orderId));
      if (snap.exists()) {
        const remoteOrder = snap.data() as Order;
        const idx = this.orders.findIndex((o) => o.id === orderId);
        if (idx >= 0) {
          this.orders[idx] = remoteOrder;
        } else {
          this.orders.unshift(remoteOrder);
        }
        localStorage.setItem(ORDERS_KEY, JSON.stringify(this.orders));
        this.notify();
        return remoteOrder;
      }
    } catch (err) {
      console.error('Error fetching order by ID from Firestore:', err);
    }
    return this.getOrderById(orderId) || null;
  }

  public async updateOrderStatus(orderId: string, status: Order['orderStatus']): Promise<boolean> {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return false;
    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();
    if (status === 'delivered') {
      order.paymentStatus = 'paid';
    }
    localStorage.setItem(ORDERS_KEY, JSON.stringify(this.orders));
    this.notify();

    const path = `orders/${orderId}`;
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        orderStatus: status,
        updatedAt: order.updatedAt,
        ...(status === 'delivered' ? { paymentStatus: 'paid' } : {}),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }

    return true;
  }

  public async updateOrderCourier(
    orderId: string,
    courierName: string,
    trackingCode: string
  ): Promise<boolean> {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return false;
    order.courierName = courierName;
    order.trackingCode = trackingCode;
    order.updatedAt = new Date().toISOString();
    localStorage.setItem(ORDERS_KEY, JSON.stringify(this.orders));
    this.notify();

    const path = `orders/${orderId}`;
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        courierName,
        trackingCode,
        updatedAt: order.updatedAt,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
    return true;
  }

  public async deleteOrder(orderId: string): Promise<boolean> {
    this.orders = this.orders.filter((o) => o.id !== orderId);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(this.orders));
    this.notify();

    const path = `orders/${orderId}`;
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
    return true;
  }

  // --- Customers compiled from orders ---
  public getCustomers(): Customer[] {
    const map = new Map<string, Customer>();

    this.orders.forEach((order) => {
      const key = order.customerPhone.replace(/[^0-9]/g, '') || order.customerName;
      if (!map.has(key)) {
        map.set(key, {
          id: `cust-${key}`,
          name: order.customerName,
          phone: order.customerPhone,
          email: order.customerEmail,
          address: `${order.deliveryAddress}, ${order.district}`,
          ordersCount: 1,
          totalSpent: order.totalAmount,
          firstOrderDate: order.createdAt,
          lastOrderDate: order.createdAt,
        });
      } else {
        const c = map.get(key)!;
        c.ordersCount += 1;
        c.totalSpent += order.totalAmount;
        if (new Date(order.createdAt) > new Date(c.lastOrderDate)) {
          c.lastOrderDate = order.createdAt;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }

  // --- Statistics for Admin ---
  public getAdminStats() {
    const totalOrders = this.orders.length;
    const totalRevenue = this.orders
      .filter((o) => o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingOrders = this.orders.filter((o) => o.orderStatus === 'pending').length;
    const deliveredOrders = this.orders.filter((o) => o.orderStatus === 'delivered').length;
    const lowStockProducts = this.products.filter((p) => p.stock <= 25).length;
    const totalProducts = this.products.length;

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      lowStockProducts,
      totalProducts,
    };
  }

  public async resetToSampleData() {
    this.products = [...INITIAL_PRODUCTS];
    this.categories = [...INITIAL_CATEGORIES];
    this.orders = [...INITIAL_ORDERS];
    this.coupons = [...INITIAL_COUPONS];
    this.cart = [];

    localStorage.removeItem(PRODUCTS_KEY);
    localStorage.removeItem(CATEGORIES_KEY);
    localStorage.removeItem(ORDERS_KEY);
    localStorage.removeItem(COUPONS_KEY);
    localStorage.removeItem(CART_KEY);

    // Sync to Firestore
    try {
      for (const p of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', p.id), p);
      }
    } catch {
      // ignore
    }

    this.notify();
  }
}

export const storeService = new StoreService();
