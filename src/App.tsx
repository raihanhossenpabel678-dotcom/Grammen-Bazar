import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Product, CartItem, Order, Category } from './types';
import { storeService } from './services/storeService';
import { authService } from './services/authService';

// Layout & UI components
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroBanner } from './components/home/HeroBanner';
import { CategoryNavigation } from './components/home/CategoryNavigation';
import { TrustFeatures } from './components/home/TrustFeatures';
import { ProductGrid } from './components/products/ProductGrid';
import { ProductDetailModal } from './components/products/ProductDetailModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { OrderTrackingModal } from './components/order/OrderTrackingModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { PaymentSandboxModal } from './components/checkout/PaymentSandboxModal';
import { OrderSuccessModal } from './components/order/OrderSuccessModal';
import { ShoppingCart, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'store' | 'admin'>('store');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Live store data
  const [products, setProducts] = useState<Product[]>(() => storeService.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => storeService.getCategories());
  const [cartItems, setCartItems] = useState<CartItem[]>(() => storeService.getCart());
  const [isLoading, setIsLoading] = useState<boolean>(() => storeService.isLoading);
  const [storeError, setStoreError] = useState<string | null>(() => storeService.error);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | undefined>();
  const [initialDiscount, setInitialDiscount] = useState<number>(0);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState<string>('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Sync with store
  useEffect(() => {
    return storeService.subscribe(() => {
      setProducts(storeService.getProducts());
      setCategories(storeService.getCategories());
      setCartItems(storeService.getCart());
      setIsLoading(storeService.isLoading);
      setStoreError(storeService.error);
    });
  }, []);

  // Payment Gateway Sandbox & Success Handlers
  const [sandboxPaymentData, setSandboxPaymentData] = useState<{
    orderId: string;
    tranId: string;
    amount: number;
    customerName: string;
    token?: string;
  } | null>(null);
  const [paymentSuccessOrderId, setPaymentSuccessOrderId] = useState<string | null>(null);

  // Sync hash for /#admin direct navigation and payment callbacks
  useEffect(() => {
    const handleHash = () => {
      const fullHash = window.location.hash;
      const hashLower = fullHash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();

      // Check payment sandbox simulator
      if (hashLower.startsWith('#payment-sandbox')) {
        const queryPart = fullHash.includes('?') ? fullHash.split('?')[1] : window.location.search.replace(/^\?/, '');
        const params = new URLSearchParams(queryPart);
        const orderId = params.get('orderId') || '';
        const tranId = params.get('tranId') || '';
        const amount = Number(params.get('amount')) || 0;
        const customer = params.get('customer') || 'সম্মানিত গ্রাহক';
        const token = params.get('token') || '';

        if (orderId && tranId) {
          setSandboxPaymentData({ orderId, tranId, amount, customerName: customer, token });
        }
      }

      // Check payment success return
      if (hashLower.startsWith('#order-success')) {
        const queryPart = fullHash.includes('?') ? fullHash.split('?')[1] : window.location.search.replace(/^\?/, '');
        const params = new URLSearchParams(queryPart);
        const orderId = params.get('orderId');
        if (orderId) {
          setPaymentSuccessOrderId(orderId);
        }
      }

      // Check payment cancel or failure
      if (hashLower.startsWith('#order-status') && hashLower.includes('payment=cancelled')) {
        showToast('⚠️ পেমেন্ট বাতিল করা হয়েছে। আপনি চাইলে ক্যাশ অন ডেলিভারিতে অর্ডার করতে পারেন।');
      }

      if (hashLower === '#admin' || hashLower === '#/admin' || pathname.endsWith('/admin')) {
        setView('admin');
      } else {
        setView('store');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('popstate', handleHash);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('popstate', handleHash);
    };
  }, []);

  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cartItems]);

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  const activeCategoryName = useMemo(() => {
    if (activeCategory === 'all') return 'সকল খাঁটি গ্রামীণ পণ্য';
    const cat = categories.find((c) => c.slug === activeCategory);
    return cat ? cat.banglaName : 'পণ্যসমূহ';
  }, [categories, activeCategory]);

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number) => {
    const res = storeService.addToCart(product, quantity);
    if (res.success) {
      showToast(`"${product.banglaName}" কার্টে যোগ করা হয়েছে!`);
    } else {
      showToast(res.message || 'কার্টে যোগ করা সম্ভব হয়নি।');
    }
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    storeService.updateCartQuantity(productId, quantity);
  };

  const handleRemoveFromCart = (productId: string) => {
    storeService.removeFromCart(productId);
  };

  // Quick Buy: Opens checkout immediately with the selected product
  const handleQuickBuy = (product: Product, quantity = 1) => {
    setCheckoutItems([
      {
        product,
        quantity,
        selectedUnit: product.unit,
      },
    ]);
    setAppliedCouponCode(undefined);
    setInitialDiscount(0);
    setIsCartOpen(false);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  // Checkout with full cart
  const handleProceedToCheckout = (couponCode?: string, discount = 0) => {
    if (cartItems.length === 0) return;
    setCheckoutItems([...cartItems]);
    setAppliedCouponCode(couponCode);
    setInitialDiscount(discount);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setTrackingOrderNumber(order.orderNumber);
    showToast(`অর্ডার নং ${order.orderNumber} সফলভাবে গৃহীত হয়েছে!`);
  };

  const handleOpenTrackingWithOrder = (orderNum?: string) => {
    if (orderNum) {
      setTrackingOrderNumber(orderNum);
    }
    setIsTrackingOpen(true);
  };

  const handleBackToStore = () => {
    setView('store');
    window.location.hash = '';
    if (window.location.pathname.endsWith('/admin')) {
      window.history.pushState(null, '', window.location.pathname.replace(/\/admin$/, '') || '/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F6] text-[#143d2b] selection:bg-[#143d2b] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-60 bg-[#143d2b] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-[#235840] flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#e5b358]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Announcement Bar */}
      <AnnouncementBar
        onOpenTracking={() => handleOpenTrackingWithOrder()}
      />

      {/* View Switcher: Admin (accessible via /#admin) or Storefront */}
      {view === 'admin' ? (
        <AdminDashboard onBackToStore={handleBackToStore} />
      ) : (
        <>
          {/* Main Storefront Top Bar */}
          <Navbar
            cartCount={cartCount}
            cartSubtotal={cartSubtotal}
            onOpenCart={() => setIsCartOpen(true)}
            onSelectCategory={(slug) => {
              setActiveCategory(slug);
            }}
            activeCategory={activeCategory}
            onOpenTracking={() => handleOpenTrackingWithOrder()}
            onOpenAuth={() => setIsAuthOpen(true)}
            products={products}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onViewStorefront={() => {
              setActiveCategory('all');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* Hero Banner */}
          <HeroBanner
            onExploreClick={() => {
              const el = document.getElementById('products-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onSpecialCategoryClick={(slug) => {
              setActiveCategory(slug);
              const el = document.getElementById('products-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* Category Navigation Bar */}
          <CategoryNavigation
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={(slug) => setActiveCategory(slug)}
          />

          {/* Trust Pillars */}
          <TrustFeatures />

          {/* Product Catalog Grid */}
          <div id="products-section">
            <ProductGrid
              products={filteredProducts}
              activeCategoryName={activeCategoryName}
              isLoading={isLoading}
              error={storeError}
              onAddToCart={handleAddToCart}
              onQuickBuy={handleQuickBuy}
              onViewDetails={(product) => setSelectedProduct(product)}
            />
          </div>

          {/* Story & Heritage Editorial Rest Section */}
          <section className="bg-white border-y border-[#e5ebe7] py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="max-w-3xl mx-auto text-center space-y-4">
                <span className="text-xs font-bold text-[#b45309] tracking-wider uppercase">
                  আমাদের ঐতিহ্য ও প্রতিশ্রুতি
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#143d2b] font-display text-balance">
                  খাঁটি স্বাদে ফিরে আসুক বাঙালির ঐতিহ্যবাহী সুস্থতা
                </h3>
                <p className="text-xs sm:text-sm text-[#486b58] leading-relaxed">
                  ভেজাল আর রাসায়নিকের ভিড়ে খাঁটি প্রাকৃতিক পণ্যের নিশ্চয়তা দেওয়াই গ্রামীণ বাজারের মূল লক্ষ্য। আমরা মধ্যস্বত্বভোগী ছাড়া সরাসরি সুন্দরবনের মৌয়াল, সিরাজগঞ্জের তেল ঘানি এবং পাহাড়ি কৃষকদের থেকে পণ্য সংগ্রহ করে সর্বোচ্চ স্বাস্থ্যসম্মতভাবে আপনার দোরগোড়ায় পৌঁছে দিই।
                </p>
                <div className="pt-2 flex items-center justify-center gap-4 text-xs font-semibold text-[#143d2b]">
                  <span>✓ বিএসটিআই অনুমোদিত মান</span>
                  <span>·</span>
                  <span>✓ শতভাগ প্রিজারভেটিভমুক্ত</span>
                  <span>·</span>
                  <span>✓ ক্যাশ অন ডেলিভারি</span>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <Footer
            onSelectCategory={(slug) => {
              setActiveCategory(slug);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenTracking={() => handleOpenTrackingWithOrder()}
          />

          {/* Mobile Bottom Floating Cart Strip (respects 15% mobile viewport cap) */}
          {cartCount > 0 && !isCartOpen && !isCheckoutOpen && (
            <div className="md:hidden fixed bottom-3 left-3 right-3 z-30">
              <button
                onClick={() => setIsCartOpen(true)}
                className="w-full bg-[#143d2b] text-white p-3 rounded-xl shadow-xl flex items-center justify-between border border-[#2a684b] active:scale-98 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <ShoppingCart className="w-5 h-5 text-[#e5b358]" />
                    <span className="absolute -top-1.5 -right-1.5 bg-[#d97706] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  </div>
                  <span className="text-xs font-bold">Cart দেখুন</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold tabular-nums text-[#f7e3ad]">
                    ৳{cartSubtotal.toLocaleString()}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#e5b358]" />
                </div>
              </button>
            </div>
          )}
        </>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onQuickBuy={handleQuickBuy}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleProceedToCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={checkoutItems}
        appliedCouponCode={appliedCouponCode}
        initialDiscount={initialDiscount}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Live Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        initialOrderNumber={trackingOrderNumber}
      />

      {/* Auth & Customer Profile Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAdminSwitch={() => setView('admin')}
      />

      {/* SSLCommerz Payment Sandbox Simulator Modal */}
      {sandboxPaymentData && (
        <PaymentSandboxModal
          orderId={sandboxPaymentData.orderId}
          tranId={sandboxPaymentData.tranId}
          amount={sandboxPaymentData.amount}
          customerName={sandboxPaymentData.customerName}
          token={sandboxPaymentData.token}
          onClose={() => {
            setSandboxPaymentData(null);
            window.location.hash = '';
          }}
        />
      )}

      {/* Verified Online Order Payment Success Receipt Modal */}
      {paymentSuccessOrderId && (
        <OrderSuccessModal
          orderId={paymentSuccessOrderId}
          onClose={() => {
            setPaymentSuccessOrderId(null);
            window.location.hash = '';
          }}
          onOpenTracking={(ordNum) => {
            setPaymentSuccessOrderId(null);
            window.location.hash = '';
            setTrackingOrderNumber(ordNum);
            setIsTrackingOpen(true);
          }}
        />
      )}
    </div>
  );
}
