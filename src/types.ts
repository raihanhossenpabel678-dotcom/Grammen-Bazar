export type DeliveryArea = 'inside_dhaka' | 'outside_dhaka';

export type PaymentMethod = 'cod' | 'bkash' | 'sslcommerz';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Product {
  id: string;
  name: string;
  banglaName: string;
  englishName: string;
  slug: string;
  category: string;
  price: number;
  originalPrice: number;
  unit: string;
  stock: number;
  image: string;
  description: string;
  benefits?: string[];
  sourceLocation: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  rating: number;
  reviewsCount: number;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  banglaName: string;
  slug: string;
  iconName?: string;
  itemCount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedUnit?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  banglaName?: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  district: string;
  deliveryArea: DeliveryArea;
  deliveryFee: number;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  orderStatus: OrderStatus;
  specialInstructions?: string;
  courierName?: string;
  trackingCode?: string;
  tranId?: string;
  valId?: string;
  bankTranId?: string;
  cardType?: string;
  paymentGateway?: string;
  verificationToken?: string;
  createdAt: string;
  updatedAt?: string;
  estimatedDelivery?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend: number;
  validUntil: string;
  isActive: boolean;
  usageCount: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  ordersCount: number;
  totalSpent: number;
  firstOrderDate: string;
  lastOrderDate: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  phone?: string;
  role: 'customer' | 'admin';
  address?: string;
  district?: string;
}
