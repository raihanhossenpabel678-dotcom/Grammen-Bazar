import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Ticket,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Truck,
  RotateCcw,
  Eye,
  X,
  LogOut,
  FolderPlus,
  Database,
  Image as ImageIcon,
  Copy,
  ExternalLink,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { Product, Order, Coupon, Customer, Category, OrderStatus } from '../../types';
import { storeService } from '../../services/storeService';
import { authService } from '../../services/authService';
import { GrameenBazarLogo } from '../brand/GrameenBazarLogo';
import { AdminLoginGate } from './AdminLoginGate';
const CURATED_IMAGE_ASSETS = [
  {
    id: 'img-honey',
    name: 'সুন্দরবনের খাঁটি মধু',
    englishName: 'Raw Sundarban Wild Honey',
    url: '/images/product_sundarban_honey_1792210009913.jpg',
    category: 'honey-gur',
    desc: 'প্রাকৃতিক চাকের কাঁচা মধু',
  },
  {
    id: 'img-mustard',
    name: 'কাঠের ঘানি ভাঙা সরিষার তেল',
    englishName: 'Cold-Pressed Mustard Oil (Kachi Ghani)',
    url: '/images/product_mustard_oil_1792210009988.jpg',
    category: 'ghee-oils',
    desc: 'গাঢ় ঝাঁঝালো খাঁটি সরিষার তেল',
  },
  {
    id: 'img-ghee',
    name: 'গাওয়া দেশি দানাদার ঘি',
    englishName: 'Artisanal Desi Cow Ghee',
    url: '/images/product_desi_ghee_1792210011314.jpg',
    category: 'ghee-oils',
    desc: 'সিরাজগঞ্জের মাঠা থেকে তৈরি গাওয়া ঘি',
  },
  {
    id: 'img-rice',
    name: 'সুগন্ধি চিনিগুড়া পোলাও চাল',
    englishName: 'Chinigura Kalijira Aromatic Rice',
    url: '/images/product_kalijira_rice_1792210009975.jpg',
    category: 'rice-pulses',
    desc: 'উন্নত জাতের সুবাসিত ছোট দানা চাল',
  },
  {
    id: 'img-kalijira-oil',
    name: 'কালোজিরা তেল (কোল্ড প্রেসড)',
    englishName: 'Pure Cold-Pressed Black Seed Oil',
    url: '/images/product_kalijira_oil_1792212645927.jpg',
    category: 'ghee-oils',
    desc: 'শতভাগ বিশুদ্ধ ও ভেষজ গুণসম্পন্ন তেল',
  },
  {
    id: 'img-turmeric',
    name: 'রোদে শুকানো খাঁটি হলুদ গুঁড়া',
    englishName: 'Pure Sun-Dried Turmeric Powder',
    url: '/images/product_turmeric_powder_1792212662242.jpg',
    category: 'spices',
    desc: 'কেমিক্যালমুক্ত খাঁটি দেশি হলুদ গুঁড়া',
  },
];

interface AdminDashboardProps {
  onBackToStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  const [currentUser, setCurrentUser] = useState(() => authService.getUser());
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'images' | 'categories' | 'coupons' | 'customers'>('overview');

  // Live state from store
  const [products, setProducts] = useState<Product[]>(() => storeService.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => storeService.getCategories());
  const [orders, setOrders] = useState<Order[]>(() => storeService.getOrders());
  const [coupons, setCoupons] = useState<Coupon[]>(() => storeService.getCoupons());
  const [customers, setCustomers] = useState<Customer[]>(() => storeService.getCustomers());

  // Search & filter states
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');

  // Modals & image selection
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prefilledImageForNewProduct, setPrefilledImageForNewProduct] = useState<string | undefined>();
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [previewingImageUrl, setPreviewingImageUrl] = useState<string | null>(null);

  // Toast notification
  const [adminToast, setAdminToast] = useState<string | null>(null);
  const toastTimerRef = useRef<any>(null);

  const showAdminToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setAdminToast(msg);
    toastTimerRef.current = setTimeout(() => {
      setAdminToast(null);
    }, 3200);
  };

  // Subscribe to auth state
  useEffect(() => {
    return authService.subscribe((user) => {
      setCurrentUser(user);
    });
  }, []);

  const isAdmin = useMemo(() => {
    return authService.isAdmin();
  }, [currentUser]);

  const isFbAdmin = useMemo(() => {
    return authService.isFirebaseAuthAdmin();
  }, [currentUser]);

  // When admin is authorized, fetch real orders from Firestore and subscribe in real-time
  useEffect(() => {
    if (isAdmin) {
      storeService.fetchOrdersFromFirestore().catch((err) => {
        console.warn('Initial admin order fetch warning:', err);
      });
      const unsub = storeService.subscribeToOrdersRealtime();
      return () => {
        unsub();
      };
    }
  }, [isAdmin]);

  // Subscribe to store updates
  useEffect(() => {
    return storeService.subscribe(() => {
      setProducts(storeService.getProducts());
      setCategories(storeService.getCategories());
      setOrders(storeService.getOrders());
      setCoupons(storeService.getCoupons());
      setCustomers(storeService.getCustomers());
    });
  }, []);

  const stats = useMemo(() => storeService.getAdminStats(), [orders, products]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerPhone.includes(orderSearch);
      const matchStatus = orderFilterStatus === 'all' || o.orderStatus === orderFilterStatus;
      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderFilterStatus]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.banglaName.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.englishName.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sourceLocation.toLowerCase().includes(productSearch.toLowerCase());
      const matchCat = productCategoryFilter === 'all' || p.category === productCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, productSearch, productCategoryFilter]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await storeService.updateOrderStatus(orderId, newStatus);
      showAdminToast(`✓ অর্ডার নং ${orderId} এর স্ট্যাটাস '${newStatus}' ফায়ারস্টোরে আপডেট হয়েছে!`);
    } catch (err: any) {
      showAdminToast(`⚠️ ফায়ারস্টোর আপডেট ব্যর্থ: ${err.message || 'অনুমতি নেই'}`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান? এটি ফায়ারস্টোর থেকেও ডিলিট হবে।')) {
      try {
        await storeService.deleteProduct(productId);
        showAdminToast('✓ পণ্যটি ফায়ারস্টোর থেকে সফলভাবে মুছে ফেলা হয়েছে!');
      } catch (err: any) {
        showAdminToast(`⚠️ ডিলিট ব্যর্থ: ${err.message || 'অনুমোদন ত্রুটি'}`);
      }
    }
  };

  const handleAdjustStock = async (productId: string, delta: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const newStock = Math.max(0, prod.stock + delta);
    try {
      await storeService.updateProduct(productId, { stock: newStock });
      showAdminToast(`✓ "${prod.banglaName}" এর নতুন স্টক: ${newStock} টি (ফায়ারস্টোরে সেভ হয়েছে)`);
    } catch (err: any) {
      showAdminToast(`⚠️ স্টক আপডেট ব্যর্থ: ${err.message || 'অনুমোদন ত্রুটি'}`);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('এই ক্যাটাগরিটি মুছে ফেলতে চান? এটি ফায়ারস্টোর থেকেও ডিলিট হবে।')) {
      try {
        await storeService.deleteCategory(categoryId);
        showAdminToast('✓ ক্যাটাগরি সফলভাবে ফায়ারস্টোর থেকে ডিলিট হয়েছে!');
      } catch (err: any) {
        showAdminToast(`⚠️ ক্যাটাগরি ডিলিট ব্যর্থ: ${err.message || 'অনুমোদন ত্রুটি'}`);
      }
    }
  };

  const handleToggleCoupon = async (couponId: string) => {
    try {
      await storeService.toggleCouponStatus(couponId);
      showAdminToast('✓ কুপনের স্ট্যাটাস ফায়ারস্টোরে পরিবর্তিত হয়েছে!');
    } catch (err: any) {
      showAdminToast(`⚠️ কুপন আপডেট ব্যর্থ: ${err.message || 'অনুমোদন ত্রুটি'}`);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (confirm('এই কুপনটি ডিলিট করতে চান?')) {
      try {
        await storeService.deleteCoupon(couponId);
        showAdminToast('✓ কুপন ফায়ারস্টোর থেকে ডিলিট করা হয়েছে!');
      } catch (err: any) {
        showAdminToast(`⚠️ কুপন ডিলিট ব্যর্থ: ${err.message || 'অনুমোদন ত্রুটি'}`);
      }
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('এই অর্ডার রেকর্ডটি স্থায়ীভাবে ফায়ারস্টোর থেকে মুছে ফেলতে চান?')) {
      try {
        await storeService.deleteOrder(orderId);
        if (selectedOrderDetails?.id === orderId) {
          setSelectedOrderDetails(null);
        }
        showAdminToast('✓ অর্ডার রেকর্ড ফায়ারস্টোর থেকে ডিলিট হয়েছে!');
      } catch (err: any) {
        showAdminToast(`⚠️ অর্ডার ডিলিট ব্যর্থ: ${err.message || 'অনুমোদন ত্রুটি'}`);
      }
    }
  };

  const handleManualSync = async () => {
    showAdminToast('ফায়ারস্টোর ক্লাউড সিংক হচ্ছে...');
    try {
      await storeService.fetchOrdersFromFirestore();
      showAdminToast('✓ ফায়ারস্টোর ডাটা সফলভাবে রিফ্রেশ হয়েছে!');
    } catch {
      showAdminToast('⚠️ ফায়ারস্টোর রিফ্রেশ সম্পন্ন হয়েছে।');
    }
  };

  const handleResetData = async () => {
    if (confirm('সমস্ত ডেমো ও নমুনা ডাটা প্রথম অবস্থায় ফিরিয়ে নিতে চান? এটি ফায়ারস্টোর ক্যাটালগও রিসেট করবে।')) {
      try {
        await storeService.resetToSampleData();
        showAdminToast('✓ ডাটা সফলভাবে প্রথম অবস্থায় রিসেট করা হয়েছে!');
      } catch (err: any) {
        showAdminToast(`⚠️ রিসেট ব্যর্থ: ${err.message}`);
      }
    }
  };

  const handleLogoutAdmin = async () => {
    await authService.logout();
    onBackToStore();
  };

  // ACCESS GATE: If current user is not recognized as an authorized admin, show the secure login gate
  if (!isAdmin) {
    return (
      <AdminLoginGate
        onBackToStore={onBackToStore}
        onSuccess={() => {
          showAdminToast('✓ অ্যাডমিন হিসেবে সফলভাবে প্রবেশ করেছেন!');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#143d2b] flex flex-col relative">
      {/* Toast Notification */}
      {adminToast && (
        <div className="fixed bottom-6 right-6 z-60 bg-[#143d2b] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-[#235840] flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#e5b358]" />
          <span>{adminToast}</span>
        </div>
      )}

      {/* Admin Top Header */}
      <header className="bg-[#143d2b] text-white px-4 sm:px-8 py-3 border-b border-[#1b4b36] flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBackToStore}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#f7e3ad] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>দোকানে ফিরুন</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="bg-white p-1 rounded-lg shadow-xs hidden sm:block">
              <GrameenBazarLogo variant="icon" size="sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold font-display tracking-wide leading-tight">
                  গ্রামীণ বাজার · সুরক্ষিত অ্যাডমিন কন্ট্রোল রুম
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E5B358]/20 text-[#F7E3AD] border border-[#E5B358]/30">
                  <ShieldCheck className="w-3 h-3 text-[#E5B358]" />
                  Protected /#admin
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#9ec4af]">
                <span className="flex items-center gap-1 text-emerald-300">
                  <Database className="w-3 h-3" />
                  Firestore: কানেক্টেড (lunar-totem-6hl8x)
                </span>
                <span>·</span>
                {isFbAdmin ? (
                  <span className="text-[#e5b358] font-semibold">
                    ✓ Firebase Auth Verified: {currentUser?.email}
                  </span>
                ) : (
                  <span className="text-amber-300 font-medium">
                    Demo Mode (Cloud Auth Recommended)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleManualSync}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white/90 hover:text-white bg-white/10 hover:bg-white/15 rounded-lg border border-white/15 transition-colors cursor-pointer"
            title="ফায়ারস্টোর থেকে নতুন অর্ডার ও পণ্য রিফ্রেশ করুন"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#e5b358]" />
            <span className="hidden sm:inline">ফায়ারস্টোর রিফ্রেশ</span>
          </button>

          <button
            onClick={handleResetData}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors cursor-pointer"
            title="নমুনা ডাটা সিংক/রিসেট করুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডাটা রিসেট</span>
          </button>

          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-white block">
              {currentUser?.displayName || 'Store Administrator'}
            </span>
            <span className="text-[10px] text-[#e5b358]">{currentUser?.email || 'Admin'}</span>
          </div>

          <button
            onClick={handleLogoutAdmin}
            className="p-1.5 rounded-lg bg-red-900/40 hover:bg-red-800 text-red-200 transition-colors cursor-pointer"
            title="লগআউট"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <div className="bg-white border-b border-[#e1e9e3] px-4 sm:px-8 shadow-2xs">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'overview'
                ? 'bg-[#143d2b] text-white shadow-2xs'
                : 'text-[#486b58] hover:bg-[#f1f6f3]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>সারসংক্ষেপ (Overview)</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'orders'
                ? 'bg-[#143d2b] text-white shadow-2xs'
                : 'text-[#486b58] hover:bg-[#f1f6f3]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>অর্ডারসমূহ ({orders.length})</span>
            {stats.pendingOrders > 0 && (
              <span className="bg-[#d97706] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums">
                {stats.pendingOrders}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'products'
                ? 'bg-[#143d2b] text-white shadow-2xs'
                : 'text-[#486b58] hover:bg-[#f1f6f3]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>পণ্য ও স্টক ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('images')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'images'
                ? 'bg-[#143d2b] text-white shadow-2xs'
                : 'text-[#486b58] hover:bg-[#f1f6f3]'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>ছবি ও মিডিয়া (Images)</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'categories'
                ? 'bg-[#143d2b] text-white shadow-2xs'
                : 'text-[#486b58] hover:bg-[#f1f6f3]'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>ক্যাটাগরি ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'coupons'
                ? 'bg-[#143d2b] text-white shadow-2xs'
                : 'text-[#486b58] hover:bg-[#f1f6f3]'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>কুপন ও ভাউচার ({coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'customers'
                ? 'bg-[#143d2b] text-white shadow-2xs'
                : 'text-[#486b58] hover:bg-[#f1f6f3]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>গ্রাহক ডাটাবেজ ({customers.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#dcebe1] shadow-2xs">
                <div className="flex items-center justify-between text-[#597a69] mb-2">
                  <span className="text-xs font-semibold">মোট আয় (বিক্রি)</span>
                  <DollarSign className="w-4 h-4 text-[#143d2b]" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#143d2b] tabular-nums">
                  ৳{stats.totalRevenue.toLocaleString()}
                </div>
                <p className="text-[11px] text-[#6b8c7b] mt-1">ক্যাশ অন ডেলিভারি ও প্রিপেইড</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#dcebe1] shadow-2xs">
                <div className="flex items-center justify-between text-[#597a69] mb-2">
                  <span className="text-xs font-semibold">মোট অর্ডার</span>
                  <ShoppingBag className="w-4 h-4 text-[#143d2b]" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#143d2b] tabular-nums">
                  {stats.totalOrders} টি
                </div>
                <p className="text-[11px] text-[#6b8c7b] mt-1">
                  {stats.deliveredOrders} টি সফল ডেলিভারি
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#dcebe1] shadow-2xs">
                <div className="flex items-center justify-between text-[#597a69] mb-2">
                  <span className="text-xs font-semibold">অপেক্ষমান অর্ডার</span>
                  <TrendingUp className="w-4 h-4 text-[#d97706]" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#d97706] tabular-nums">
                  {stats.pendingOrders} টি
                </div>
                <p className="text-[11px] text-[#6b8c7b] mt-1">প্যাকেজিং ও শিপিং প্রয়োজন</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#dcebe1] shadow-2xs">
                <div className="flex items-center justify-between text-[#597a69] mb-2">
                  <span className="text-xs font-semibold">মোট পণ্য ও স্টক</span>
                  <Package className="w-4 h-4 text-[#143d2b]" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#143d2b] tabular-nums">
                  {stats.totalProducts} টি
                </div>
                <p className="text-[11px] text-[#6b8c7b] mt-1">
                  {stats.lowStockProducts} টি পণ্যে স্টক সীমিত (&le;২৫)
                </p>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white rounded-xl border border-[#dcebe1] overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-[#edf3ef] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#143d2b]">সাম্প্রতিক অর্ডারসমূহ (ফায়ারস্টোর সিংক)</h3>
                  <p className="text-xs text-[#6a8b7a]">নতুন আসা কাস্টমার অর্ডার তালিকা</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-[#143d2b] hover:underline cursor-pointer"
                >
                  সবগুলো দেখুন →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8faf8] text-[#557564] border-b border-[#edf3ef]">
                    <tr>
                      <th className="p-3 font-semibold">অর্ডার নং</th>
                      <th className="p-3 font-semibold">গ্রাহকের নাম ও ফোন</th>
                      <th className="p-3 font-semibold">ঠিকানা</th>
                      <th className="p-3 font-semibold">মোট মূল্য</th>
                      <th className="p-3 font-semibold">স্ট্যাটাস</th>
                      <th className="p-3 font-semibold text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf3ef]">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-[#f9fbf9]">
                        <td className="p-3 font-bold text-[#143d2b] tabular-nums">
                          {order.orderNumber}
                        </td>
                        <td className="p-3">
                          <p className="font-semibold text-[#143d2b]">{order.customerName}</p>
                          <p className="text-[#6d8d7d] tabular-nums">{order.customerPhone}</p>
                        </td>
                        <td className="p-3 max-w-[200px] truncate text-[#557564]">
                          {order.deliveryAddress}, {order.district}
                        </td>
                        <td className="p-3 font-bold text-[#143d2b] tabular-nums">
                          ৳{order.totalAmount.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <select
                            value={order.orderStatus}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                            }
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border cursor-pointer ${
                              order.orderStatus === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : order.orderStatus === 'shipped'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : order.orderStatus === 'processing'
                                ? 'bg-purple-100 text-purple-800 border-purple-300'
                                : order.orderStatus === 'cancelled'
                                ? 'bg-red-100 text-red-800 border-red-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedOrderDetails(order)}
                            className="p-1 text-[#143d2b] hover:bg-[#eaf3ed] rounded-md transition-colors cursor-pointer"
                            title="ইনভয়েস দেখুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-[#dcebe1] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6c8c7c]" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="অর্ডার নম্বর, গ্রাহকের নাম বা ফোন নম্বর খুঁজুন..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#cfded4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#143d2b]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-[#557564]" />
                <select
                  value={orderFilterStatus}
                  onChange={(e) => setOrderFilterStatus(e.target.value)}
                  className="w-full sm:w-auto text-xs border border-[#cfded4] bg-white rounded-lg px-3 py-2 font-medium text-[#143d2b] cursor-pointer"
                >
                  <option value="all">সব অর্ডার ({orders.length})</option>
                  <option value="pending">অপেক্ষমান (Pending)</option>
                  <option value="confirmed">কনফার্মড (Confirmed)</option>
                  <option value="processing">প্যাকেজিং (Processing)</option>
                  <option value="shipped">শিপড (Shipped)</option>
                  <option value="delivered">ডেলিভার্ড (Delivered)</option>
                  <option value="cancelled">বাতিল (Cancelled)</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-[#dcebe1] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8faf8] text-[#557564] border-b border-[#edf3ef]">
                    <tr>
                      <th className="p-3 font-semibold">অর্ডার আইডি</th>
                      <th className="p-3 font-semibold">তারিখ</th>
                      <th className="p-3 font-semibold">গ্রাহকের নাম ও ফোন</th>
                      <th className="p-3 font-semibold">ডেলিভারি ঠিকানা ও এলাকা</th>
                      <th className="p-3 font-semibold">পণ্যের তালিকা</th>
                      <th className="p-3 font-semibold">মূল্য</th>
                      <th className="p-3 font-semibold">বর্তমান অবস্থা</th>
                      <th className="p-3 font-semibold text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf3ef]">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#f9fbf9]">
                          <td className="p-3 font-bold text-[#143d2b] tabular-nums whitespace-nowrap">
                            {order.orderNumber}
                          </td>
                          <td className="p-3 text-[#6a8b7a] whitespace-nowrap tabular-nums">
                            {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                          </td>
                          <td className="p-3">
                            <p className="font-semibold text-[#143d2b]">{order.customerName}</p>
                            <p className="text-[#6d8d7d] tabular-nums">{order.customerPhone}</p>
                          </td>
                          <td className="p-3 text-[#557564]">
                            <p className="max-w-[180px] truncate">{order.deliveryAddress}</p>
                            <span className="text-[10px] text-[#6a8b7a] font-medium">
                              {order.district} ({order.deliveryArea === 'inside_dhaka' ? 'ঢাকা' : 'বাইরে'})
                            </span>
                          </td>
                          <td className="p-3 text-[#557564]">
                            {order.items.map((i, idx) => (
                              <span key={idx} className="block truncate max-w-[150px]">
                                {i.quantity}x {i.name}
                              </span>
                            ))}
                          </td>
                          <td className="p-3 font-bold text-[#143d2b] tabular-nums whitespace-nowrap">
                            ৳{order.totalAmount.toLocaleString()}
                          </td>
                          <td className="p-3">
                            <select
                              value={order.orderStatus}
                              onChange={(e) =>
                                handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                              }
                              className={`text-[11px] font-bold rounded-md px-2 py-1 border border-[#cfded4] cursor-pointer focus:outline-none ${
                                order.orderStatus === 'delivered'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : order.orderStatus === 'shipped'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : order.orderStatus === 'processing'
                                  ? 'bg-purple-50 text-purple-800 border-purple-300'
                                  : order.orderStatus === 'cancelled'
                                  ? 'bg-red-50 text-red-800 border-red-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => setSelectedOrderDetails(order)}
                              className="px-2 py-1 bg-[#143d2b] text-white rounded-md text-[11px] font-semibold hover:bg-[#1a4e37] transition-colors cursor-pointer mr-1"
                            >
                              ইনভয়েস
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                              title="অর্ডার রেকর্ড ডিলিট করুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-[#6e8e7e]">
                          কোনো অর্ডার পাওয়া যায়নি।
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS & INVENTORY MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-[#dcebe1] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row items-center gap-2 flex-1 w-full">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6c8c7c]" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="পণ্য খুঁজুন (নাম বা অঞ্চল)..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#cfded4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#143d2b]"
                  />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="w-full sm:w-auto text-xs border border-[#cfded4] bg-white rounded-lg px-3 py-2 font-medium text-[#143d2b]"
                >
                  <option value="all">সব ক্যাটাগরি</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.banglaName}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowAddProductModal(true);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-[#143d2b] hover:bg-[#1a4e37] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              >
                <Plus className="w-4 h-4 text-[#e5b358]" />
                <span>নতুন পণ্য যুক্ত করুন</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl border border-[#dcebe1] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8faf8] text-[#557564] border-b border-[#edf3ef]">
                    <tr>
                      <th className="p-3 font-semibold">ছবি ও নাম</th>
                      <th className="p-3 font-semibold">ক্যাটাগরি</th>
                      <th className="p-3 font-semibold">একক</th>
                      <th className="p-3 font-semibold">বিক্রয় মূল্য</th>
                      <th className="p-3 font-semibold">রেগুলার মূল্য</th>
                      <th className="p-3 font-semibold">স্টক ইনভেন্টরি</th>
                      <th className="p-3 font-semibold">উৎস</th>
                      <th className="p-3 font-semibold text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf3ef]">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-[#f9fbf9]">
                        <td className="p-3 flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.banglaName}
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 object-cover rounded-md bg-[#edf3ef] shrink-0 border border-[#dcebe1]"
                          />
                          <div>
                            <p className="font-bold text-[#143d2b]">{product.banglaName}</p>
                            <p className="text-[11px] text-[#6d8d7d]">{product.englishName}</p>
                          </div>
                        </td>
                        <td className="p-3 text-[#557564] font-medium">{product.category}</td>
                        <td className="p-3 text-[#557564]">{product.unit}</td>
                        <td className="p-3 font-bold text-[#143d2b] tabular-nums">
                          ৳{product.price}
                        </td>
                        <td className="p-3 text-[#7b9c8b] tabular-nums">
                          ৳{product.originalPrice}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleAdjustStock(product.id, -5)}
                              className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs cursor-pointer"
                              title="৫ টি কমান"
                            >
                              -
                            </button>
                            <span
                              className={`font-bold tabular-nums px-2 py-0.5 rounded-sm text-[11px] ${
                                product.stock <= 20
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-emerald-50 text-emerald-800'
                              }`}
                            >
                              {product.stock} টি
                            </span>
                            <button
                              onClick={() => handleAdjustStock(product.id, 5)}
                              className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs cursor-pointer"
                              title="৫ টি বাড়ান"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-3 text-[#557564] truncate max-w-[140px]">
                          {product.sourceLocation}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setShowAddProductModal(true);
                            }}
                            className="p-1.5 text-[#143d2b] hover:bg-[#ebf4ee] rounded-md transition-colors cursor-pointer mr-1"
                            title="সম্পাদনা"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: IMAGES & MEDIA ASSETS */}
        {activeTab === 'images' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-[#dcebe1] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
              <div>
                <h3 className="text-base font-bold text-[#143d2b] flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#e5b358]" />
                  <span>পণ্য ছবি ও মিডিয়া গ্যালারি (Image Assets & Presets)</span>
                </h3>
                <p className="text-xs text-[#6a8b7a] mt-0.5">
                  গ্রামীণ বাজারের প্রিমিয়াম পণ্য ও ব্যানার ফটো লাইব্রেরি। যে কোনো ছবি কপি করে বা সরাসরি নতুন পণ্যে যুক্ত করতে পারেন।
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setPrefilledImageForNewProduct('/images/product_sundarban_honey_1792210009913.jpg');
                  setShowAddProductModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#143d2b] hover:bg-[#1a4e37] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              >
                <Plus className="w-4 h-4 text-[#e5b358]" />
                <span>নতুন পণ্যে ছবি সংযুক্ত করুন</span>
              </button>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {CURATED_IMAGE_ASSETS.map((imgItem) => {
                const usedInCount = products.filter((p) => p.image === imgItem.url).length;
                return (
                  <div
                    key={imgItem.id}
                    className="bg-white rounded-xl border border-[#dcebe1] overflow-hidden shadow-2xs flex flex-col group hover:border-[#143d2b] transition-all"
                  >
                    <div className="relative aspect-4/3 bg-[#f1f6f3] overflow-hidden">
                      <img
                        src={imgItem.url}
                        alt={imgItem.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                          {imgItem.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-bold text-[#143d2b] text-sm">{imgItem.name}</h4>
                        <p className="text-xs text-[#6b8c7b]">{imgItem.englishName}</p>
                        <p className="text-[11px] text-[#557564] font-medium mt-1">
                          ব্যবহৃত হয়েছে: <strong className="text-[#143d2b]">{usedInCount}</strong> টি পণ্যে
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#edf3ef] flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(imgItem.url);
                            showAdminToast('✓ ছবির URL ক্লিপবোর্ডে কপি হয়েছে!');
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#f3f7f4] hover:bg-[#e6f0e9] text-[#143d2b] rounded-lg text-xs font-semibold border border-[#dcebe1] transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5 text-[#e5b358]" />
                          <span>কপি URL</span>
                        </button>

                        <button
                          onClick={() => {
                            setEditingProduct(null);
                            setPrefilledImageForNewProduct(imgItem.url);
                            setShowAddProductModal(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#143d2b] hover:bg-[#1a4e37] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#e5b358]" />
                          <span>পণ্য তৈরি</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Image URL Tester & Validator */}
            <div className="bg-white p-5 rounded-xl border border-[#dcebe1] shadow-2xs space-y-3">
              <h4 className="font-bold text-[#143d2b] text-sm flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-[#e5b358]" />
                <span>অনলাইন ইমেজ URL প্রিভিউ ও ভ্যালিডেশন</span>
              </h4>
              <p className="text-xs text-[#6a8b7a]">
                ইন্টারনেট থেকে সরাসরি কোনো ইমেজ লিংক ব্যবহার করার পূর্বে এখানে দিয়ে ছবি লোড হচ্ছে কি না দেখে নিন।
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... বা যে কোনো ছবির পাবলিক URL দিন"
                  value={previewingImageUrl || ''}
                  onChange={(e) => setPreviewingImageUrl(e.target.value)}
                  className="flex-1 p-2.5 text-xs border border-[#cfded4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#143d2b]"
                />
                {previewingImageUrl && (
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setPrefilledImageForNewProduct(previewingImageUrl);
                      setShowAddProductModal(true);
                    }}
                    className="px-4 py-2 bg-[#143d2b] text-white rounded-lg text-xs font-bold hover:bg-[#1a4e37] transition-colors cursor-pointer shrink-0"
                  >
                    এই ছবিতে নতুন পণ্য খুলুন
                  </button>
                )}
              </div>
              {previewingImageUrl && (
                <div className="p-3 bg-[#f8faf8] rounded-lg border border-[#dcebe1] flex items-center gap-3">
                  <img
                    src={previewingImageUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 object-cover rounded-md border border-[#cfded4] bg-white"
                    onError={(e) => {
                      (e.target as HTMLElement).style.opacity = '0.3';
                    }}
                  />
                  <div className="text-xs">
                    <p className="font-bold text-[#143d2b]">ইমেজ প্রিভিউ সফল!</p>
                    <p className="text-[11px] text-[#6a8b7a] truncate max-w-md">{previewingImageUrl}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-[#dcebe1] flex items-center justify-between shadow-2xs">
              <div>
                <h3 className="text-sm font-bold text-[#143d2b]">ক্যাটালগ ক্যাটাগরি ম্যানেজমেন্ট</h3>
                <p className="text-xs text-[#6a8b7a]">নতুন ক্যাটাগরি যুক্ত করুন বা নাম পরিবর্তন করুন</p>
              </div>

              <button
                onClick={() => {
                  setEditingCategory(null);
                  setShowAddCategoryModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#143d2b] hover:bg-[#1a4e37] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#e5b358]" />
                <span>নতুন ক্যাটাগরি</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat.slug).length;
                return (
                  <div
                    key={cat.id}
                    className="bg-white p-4 rounded-xl border border-[#dcebe1] shadow-2xs flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-[#143d2b] text-sm">{cat.banglaName}</h4>
                      <p className="text-xs text-[#6b8c7b]">{cat.name} ({cat.slug})</p>
                      <span className="text-[11px] font-semibold text-[#143d2b] tabular-nums mt-1 inline-block">
                        {count} টি পণ্য বর্তমানে যুক্ত
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setShowAddCategoryModal(true);
                        }}
                        className="p-1.5 text-[#143d2b] hover:bg-[#ebf4ee] rounded-md transition-colors cursor-pointer"
                        title="সম্পাদনা"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: COUPONS MANAGEMENT */}
        {activeTab === 'coupons' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-[#dcebe1] flex items-center justify-between shadow-2xs">
              <div>
                <h3 className="text-sm font-bold text-[#143d2b]">কুপন ও প্রমোশনাল ডিসকাউন্ট</h3>
                <p className="text-xs text-[#6a8b7a]">গ্রাহকদের বিশেষ ছাড় ও ভাউচার ম্যানেজ করুন</p>
              </div>

              <button
                onClick={() => setShowAddCouponModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#143d2b] hover:bg-[#1a4e37] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#e5b358]" />
                <span>নতুন কুপন তৈরি করুন</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className={`bg-white p-4 rounded-xl border ${
                    coupon.isActive ? 'border-[#b8d6c3]' : 'border-gray-200 opacity-60'
                  } shadow-2xs space-y-3`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-[#143d2b] text-[#f7e3ad] text-xs font-bold rounded-md uppercase tracking-wider tabular-nums">
                      {coupon.code}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleCoupon(coupon.id)}
                        className={`text-xs font-semibold cursor-pointer px-2 py-0.5 rounded-sm ${
                          coupon.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {coupon.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer p-0.5"
                        title="কুপন মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-[#527161]">
                    <p>
                      ছাড়ের পরিমাণ:{' '}
                      <strong className="text-[#143d2b] tabular-nums">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}%`
                          : `৳${coupon.discountValue} ফ্ল্যাট`}
                      </strong>
                    </p>
                    <p>
                      সর্বনিম্ন কেনাকাটা:{' '}
                      <strong className="text-[#143d2b] tabular-nums">৳{coupon.minSpend}</strong>
                    </p>
                    <p>
                      মেয়াদ শেষ:{' '}
                      <strong className="text-[#143d2b]">{coupon.validUntil}</strong>
                    </p>
                    <p>
                      মোট ব্যবহার হয়েছে:{' '}
                      <strong className="text-[#143d2b] tabular-nums">
                        {coupon.usageCount} বার
                      </strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-[#dcebe1] shadow-2xs">
              <h3 className="text-sm font-bold text-[#143d2b]">নিবন্ধিত ও সক্রিয় গ্রাহক তালিকা</h3>
              <p className="text-xs text-[#6a8b7a]">ফায়ারস্টোর অর্ডার হিস্টোরি থেকে সংগৃহীত গ্রাহক ডাটাবেজ</p>
            </div>

            <div className="bg-white rounded-xl border border-[#dcebe1] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f8faf8] text-[#557564] border-b border-[#edf3ef]">
                    <tr>
                      <th className="p-3 font-semibold">গ্রাহকের নাম</th>
                      <th className="p-3 font-semibold">মোবাইল নম্বর</th>
                      <th className="p-3 font-semibold">ইমেইল</th>
                      <th className="p-3 font-semibold">ঠিকানা</th>
                      <th className="p-3 font-semibold">মোট অর্ডার</th>
                      <th className="p-3 font-semibold">মোট খরচ (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf3ef]">
                    {customers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-[#f9fbf9]">
                        <td className="p-3 font-bold text-[#143d2b]">{cust.name}</td>
                        <td className="p-3 text-[#557564] tabular-nums">{cust.phone}</td>
                        <td className="p-3 text-[#6a8b7a]">{cust.email || '—'}</td>
                        <td className="p-3 text-[#557564] max-w-[200px] truncate">{cust.address}</td>
                        <td className="p-3 font-bold text-[#143d2b] tabular-nums">
                          {cust.ordersCount} টি
                        </td>
                        <td className="p-3 font-extrabold text-[#143d2b] tabular-nums">
                          ৳{cust.totalSpent.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {showAddProductModal && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          initialImage={prefilledImageForNewProduct}
          onClose={() => {
            setShowAddProductModal(false);
            setEditingProduct(null);
            setPrefilledImageForNewProduct(undefined);
          }}
          onSave={async (data) => {
            try {
              if (editingProduct) {
                await storeService.updateProduct(editingProduct.id, data);
                showAdminToast('✓ পণ্য তথ্য ফায়ারস্টোরে আপডেট হয়েছে!');
              } else {
                await storeService.addProduct(data);
                showAdminToast('✓ নতুন পণ্য সফলভাবে ফায়ারস্টোরে যুক্ত হয়েছে!');
              }
              setShowAddProductModal(false);
              setEditingProduct(null);
              setPrefilledImageForNewProduct(undefined);
            } catch (err: any) {
              showAdminToast(`⚠️ সেভ ব্যর্থ: ${err.message || 'অনুমোদন ত্রুটি'}`);
            }
          }}
        />
      )}

      {/* MODAL: ADD / EDIT CATEGORY */}
      {showAddCategoryModal && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => {
            setShowAddCategoryModal(false);
            setEditingCategory(null);
          }}
          onSave={async (data) => {
            try {
              if (editingCategory) {
                await storeService.updateCategory(editingCategory.id, data);
                showAdminToast('✓ ক্যাটাগরি ফায়ারস্টোরে আপডেট হয়েছে!');
              } else {
                await storeService.addCategory(data);
                showAdminToast('✓ নতুন ক্যাটাগরি ফায়ারস্টোরে যুক্ত হয়েছে!');
              }
              setShowAddCategoryModal(false);
              setEditingCategory(null);
            } catch (err: any) {
              showAdminToast(`⚠️ ক্যাটাগরি সেভ ব্যর্থ: ${err.message || 'অনুমোদন ত্রুটি'}`);
            }
          }}
        />
      )}

      {/* MODAL: CREATE COUPON */}
      {showAddCouponModal && (
        <CouponFormModal
          onClose={() => setShowAddCouponModal(false)}
          onSave={async (data) => {
            try {
              await storeService.addCoupon(data);
              showAdminToast('✓ নতুন কুপন ফায়ারস্টোরে সফলভাবে তৈরি হয়েছে!');
              setShowAddCouponModal(false);
            } catch (err: any) {
              showAdminToast(`⚠️ কুপন সেভ ব্যর্থ: ${err.message || 'অনুমোদন ত্রুটি'}`);
            }
          }}
        />
      )}

      {/* MODAL: ORDER DETAILS / INVOICE & COURIER DISPATCH */}
      {selectedOrderDetails && (
        <OrderDetailsModal
          order={selectedOrderDetails}
          onClose={() => setSelectedOrderDetails(null)}
          onUpdateStatus={handleUpdateOrderStatus}
          onUpdateCourier={async (orderId, courierName, trackingCode) => {
            try {
              await storeService.updateOrderCourier(orderId, courierName, trackingCode);
              showAdminToast('✓ কুরিয়ার ও ট্র্যাকিং কোড ফায়ারস্টোরে আপডেট হয়েছে!');
            } catch (err: any) {
              showAdminToast(`⚠️ কুরিয়ার আপডেট ব্যর্থ: ${err.message}`);
            }
          }}
          onDeleteOrder={handleDeleteOrder}
        />
      )}
    </div>
  );
};

// Sub-component: Product Form Modal with Image presets
interface ProductFormModalProps {
  product: Product | null;
  categories: Category[];
  initialImage?: string;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  categories,
  initialImage,
  onClose,
  onSave,
}) => {
  const [banglaName, setBanglaName] = useState(product?.banglaName || '');
  const [englishName, setEnglishName] = useState(product?.englishName || '');
  const [category, setCategory] = useState(product?.category || (categories[0]?.slug || 'honey-gur'));
  const [price, setPrice] = useState(product?.price || 500);
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice || 600);
  const [unit, setUnit] = useState(product?.unit || '৫০০ গ্রাম');
  const [stock, setStock] = useState(product?.stock || 50);
  const [sourceLocation, setSourceLocation] = useState(product?.sourceLocation || 'সুন্দরবন, সাতক্ষীরা');
  const [description, setDescription] = useState(product?.description || '');
  const [image, setImage] = useState(
    product?.image || initialImage || '/images/product_sundarban_honey_1792210009913.jpg'
  );
  const [isSaving, setIsSaving] = useState(false);

  const availableImagePresets = [
    { label: 'সুন্দরবনের মধু (Honey)', url: '/images/product_sundarban_honey_1792210009913.jpg' },
    { label: 'সরিষার তেল (Mustard Oil)', url: '/images/product_mustard_oil_1792210009988.jpg' },
    { label: 'গাওয়া দেশি ঘি (Desi Ghee)', url: '/images/product_desi_ghee_1792210011314.jpg' },
    { label: 'চিনিগুড়া চাল (Kalijira Rice)', url: '/images/product_kalijira_rice_1792210009975.jpg' },
    { label: 'কালোজিরা তেল (Kalijira Oil)', url: '/images/product_kalijira_oil_1792212645927.jpg' },
    { label: 'হলুদ গুঁড়া (Turmeric Powder)', url: '/images/product_turmeric_powder_1792212662242.jpg' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        name: banglaName,
        banglaName,
        englishName,
        slug: englishName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category,
        price: Number(price),
        originalPrice: Number(originalPrice),
        unit,
        stock: Number(stock),
        sourceLocation,
        description,
        image,
        rating: product?.rating || 4.9,
        reviewsCount: product?.reviewsCount || 12,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#edf3ef] pb-3">
          <h3 className="text-base font-bold text-[#143d2b]">
            {product ? 'পণ্য তথ্য সম্পাদনা করুন' : 'নতুন পণ্য যুক্ত করুন (Firestore Sync)'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-[#f1f6f3] rounded-md cursor-pointer">
            <X className="w-5 h-5 text-[#557564]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">বাংলা নাম *</label>
              <input
                type="text"
                required
                value={banglaName}
                onChange={(e) => setBanglaName(e.target.value)}
                placeholder="যেমন: সুন্দরবনের খাঁটি মধু"
                className="w-full p-2 border border-[#cfded4] rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">ইংরেজি নাম *</label>
              <input
                type="text"
                required
                value={englishName}
                onChange={(e) => setEnglishName(e.target.value)}
                placeholder="e.g. Raw Sundarban Honey"
                className="w-full p-2 border border-[#cfded4] rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1">ক্যাটাগরি</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-[#cfded4] rounded-lg bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.banglaName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">বিক্রয় মূল্য (৳) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full p-2 border border-[#cfded4] rounded-lg tabular-nums"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">রেগুলার মূল্য (৳)</label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full p-2 border border-[#cfded4] rounded-lg tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">একক ও পরিমাপ (Unit)</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="যেমন: ৫০০ গ্রাম (Jar) বা ১ লিটার"
                className="w-full p-2 border border-[#cfded4] rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">ইনভেন্টরি স্টক (সংখ্যা) *</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full p-2 border border-[#cfded4] rounded-lg tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">উৎসের অঞ্চল / ফার্ম</label>
            <input
              type="text"
              value={sourceLocation}
              onChange={(e) => setSourceLocation(e.target.value)}
              placeholder="যেমন: উল্লাপাড়া, সিরাজগঞ্জ"
              className="w-full p-2 border border-[#cfded4] rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">পণ্য বিবরণ</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-[#cfded4] rounded-lg"
            />
          </div>

          {/* Image preset selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold">ছবি নির্বাচন (Presets বা কাস্টম URL) *</label>
              {image && (
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ছবি লোড হয়েছে
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
              {availableImagePresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImage(preset.url)}
                  className={`p-1 rounded-lg border text-left flex flex-col items-center gap-1 cursor-pointer transition-all ${
                    image === preset.url
                      ? 'border-[#143d2b] bg-[#eef6f1] ring-2 ring-[#143d2b]'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    referrerPolicy="no-referrer"
                    className="w-12 h-10 object-cover rounded bg-white"
                  />
                  <span className="text-[9px] truncate max-w-full font-medium text-center">
                    {preset.label.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="বা কাস্টম ইমেজ URL দিন"
                className="flex-1 p-2 border border-[#cfded4] rounded-lg text-xs"
              />
              {image && (
                <img
                  src={image}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded object-cover border border-[#cfded4] bg-gray-50 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.opacity = '0.3';
                  }}
                />
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#edf3ef] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#143d2b] hover:bg-[#1a4e37] text-white font-bold rounded-lg cursor-pointer disabled:opacity-70"
            >
              {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sub-component: Category Form Modal
interface CategoryFormModalProps {
  category: Category | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ category, onClose, onSave }) => {
  const [banglaName, setBanglaName] = useState(category?.banglaName || '');
  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!banglaName.trim()) return;
    setIsSaving(true);
    try {
      await onSave({
        banglaName,
        name: name || banglaName,
        slug: slug.trim().toLowerCase() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#edf3ef] pb-3">
          <h3 className="text-base font-bold text-[#143d2b]">
            {category ? 'ক্যাটাগরি সম্পাদনা' : 'নতুন ক্যাটাগরি তৈরি'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-[#f1f6f3] rounded-md cursor-pointer">
            <X className="w-5 h-5 text-[#557564]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">বাংলা নাম *</label>
            <input
              type="text"
              required
              value={banglaName}
              onChange={(e) => setBanglaName(e.target.value)}
              placeholder="যেমন: ভেষজ চা ও কাওয়া"
              className="w-full p-2 border border-[#cfded4] rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">ইংরেজি নাম</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Herbal Tea"
              className="w-full p-2 border border-[#cfded4] rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">স্লাগ (Slug / URL Identifier)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. herbal-tea"
              className="w-full p-2 border border-[#cfded4] rounded-lg font-mono text-[11px]"
            />
          </div>

          <div className="pt-3 border-t border-[#edf3ef] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#143d2b] hover:bg-[#1a4e37] text-white font-bold rounded-lg cursor-pointer"
            >
              {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sub-component: Coupon Form Modal
interface CouponFormModalProps {
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

const CouponFormModal: React.FC<CouponFormModalProps> = ({ onClose, onSave }) => {
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [minSpend, setMinSpend] = useState(500);
  const [validUntil, setValidUntil] = useState('2026-12-31');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setIsSaving(true);
    try {
      await onSave({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minSpend: Number(minSpend),
        validUntil,
        isActive: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#edf3ef] pb-3">
          <h3 className="text-base font-bold text-[#143d2b]">নতুন কুপন ভাউচার তৈরি</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#f1f6f3] rounded-md cursor-pointer">
            <X className="w-5 h-5 text-[#557564]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">কুপন কোড (ইংরেজি বড় হাত) *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="যেমন: EID20 বা GRAMEEN15"
              className="w-full p-2 border border-[#cfded4] rounded-lg uppercase font-bold text-[#143d2b]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">ছাড়ের ধরন</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full p-2 border border-[#cfded4] rounded-lg bg-white"
              >
                <option value="percentage">শতকরা (%) ছাড়</option>
                <option value="fixed">নির্দিষ্ট টাকা (৳) ছাড়</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">ছাড়ের মান *</label>
              <input
                type="number"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full p-2 border border-[#cfded4] rounded-lg tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">সর্বনিম্ন কেনাকাটা (৳)</label>
              <input
                type="number"
                value={minSpend}
                onChange={(e) => setMinSpend(Number(e.target.value))}
                className="w-full p-2 border border-[#cfded4] rounded-lg tabular-nums"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">মেয়াদ শেষ তারিখ</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full p-2 border border-[#cfded4] rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#edf3ef] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#143d2b] hover:bg-[#1a4e37] text-white font-bold rounded-lg cursor-pointer disabled:opacity-70"
            >
              {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'কুপন সক্রিয় করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sub-component: Order Details Modal / Invoice & Courier
interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (id: string, s: OrderStatus) => Promise<void>;
  onUpdateCourier: (id: string, courierName: string, trackingCode: string) => Promise<void>;
  onDeleteOrder: (id: string) => Promise<void>;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
  onUpdateCourier,
  onDeleteOrder,
}) => {
  const [courierName, setCourierName] = useState(order.courierName || 'Steadfast Courier');
  const [trackingCode, setTrackingCode] = useState(order.trackingCode || '');
  const [courierSaved, setCourierSaved] = useState(false);

  const handleSaveCourier = async () => {
    await onUpdateCourier(order.id, courierName, trackingCode);
    setCourierSaved(true);
    setTimeout(() => setCourierSaved(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#edf3ef] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#143d2b]">
              অর্ডার মেমো: {order.orderNumber}
            </h3>
            <p className="text-[11px] text-[#6b8c7b]">
              তারিখ: {new Date(order.createdAt).toLocaleString('bn-BD')}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#f1f6f3] rounded-md cursor-pointer">
            <X className="w-5 h-5 text-[#557564]" />
          </button>
        </div>

        {/* Payment & Customer Details */}
        <div className="p-3 bg-[#f8faf8] rounded-xl border border-[#dcebe1] space-y-1">
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-[#e5ebe7]">
            <span className="font-bold text-[#143d2b]">গ্রাহক: {order.customerName}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {order.paymentStatus === 'paid' ? '✓ পরিশোধিত (PAID)' : 'অপেক্ষমান (PENDING)'}
            </span>
          </div>
          <p className="text-[#557564]">মোবাইল: {order.customerPhone}</p>
          <p className="text-[#557564]">
            ঠিকানা: {order.deliveryAddress}, {order.district}
          </p>
          <p className="text-[#143d2b] font-medium pt-0.5">
            পদ্ধতি: <span className="font-bold">{order.paymentMethod === 'sslcommerz' ? `SSLCommerz Gateway (${order.cardType || 'Online'})` : order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি (COD)' : 'বিকাশ সেন্ড মানি'}</span>
          </p>
          {order.tranId && (
            <p className="text-[#557564] text-[10px] font-mono">
              TrxID: {order.tranId} {order.valId ? `· ValID: ${order.valId}` : ''}
            </p>
          )}
          {order.specialInstructions && (
            <p className="text-amber-800 font-medium pt-1">
              নোট: {order.specialInstructions}
            </p>
          )}
        </div>

        {/* Status Selector */}
        <div className="flex items-center justify-between p-2.5 bg-white border border-[#cfded4] rounded-lg">
          <span className="font-semibold text-[#143d2b]">অর্ডারের স্ট্যাটাস পরিবর্তন:</span>
          <select
            value={order.orderStatus}
            onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
            className="p-1 font-bold rounded-md bg-[#f0f6f2] border border-[#cfded4] text-[#143d2b] cursor-pointer"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Courier dispatch controls */}
        <div className="p-3 bg-white border border-[#cfded4] rounded-lg space-y-2">
          <p className="font-bold text-[#143d2b] flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#e5b358]" />
            <span>কুরিয়ার অ্যাসাইন ও ট্র্যাকিং কোড:</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-gray-500 mb-0.5">কুরিয়ার সার্ভিস</label>
              <select
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                className="w-full p-1.5 border border-[#cfded4] rounded-md bg-white text-[11px]"
              >
                <option value="Steadfast Courier">Steadfast Courier</option>
                <option value="RedX Express">RedX Express</option>
                <option value="Sundarban Courier">Sundarban Courier</option>
                <option value="Grameen Express Dhaka">Grameen Express Dhaka</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-0.5">ট্র্যাকিং নম্বর</label>
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="ST-10492"
                className="w-full p-1.5 border border-[#cfded4] rounded-md text-[11px]"
              />
            </div>
          </div>
          <button
            onClick={handleSaveCourier}
            className="px-3 py-1 bg-[#143d2b] text-white rounded text-[11px] font-semibold hover:bg-[#1a4e37] transition-colors cursor-pointer"
          >
            {courierSaved ? '✓ সেভ হয়েছে' : 'কুরিয়ার আপডেট সেভ করুন'}
          </button>
        </div>

        {/* Item List */}
        <div className="space-y-2">
          <p className="font-bold text-[#143d2b]">আইটেম তালিকা:</p>
          <div className="divide-y divide-[#edf3ef] border border-[#edf3ef] rounded-lg p-2 max-h-36 overflow-y-auto">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-1.5 first:pt-0 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-[#143d2b]">{item.name}</span>
                  <span className="block text-[11px] text-[#6b8c7b]">
                    {item.quantity} x {item.unit}
                  </span>
                </div>
                <span className="font-bold tabular-nums">
                  ৳{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Summary */}
        <div className="p-3 bg-[#f8faf8] rounded-xl border border-[#dcebe1] space-y-1">
          <div className="flex justify-between">
            <span>সাব-টোটাল:</span>
            <span className="tabular-nums">৳{order.subtotal.toLocaleString()}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>কুপন ছাড়:</span>
              <span className="tabular-nums">-৳{order.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>ডেলিভারি চার্জ:</span>
            <span className="tabular-nums">৳{order.deliveryFee}</span>
          </div>
          <div className="flex justify-between font-extrabold text-sm text-[#143d2b] border-t border-[#dcebe1] pt-1">
            <span>সর্বমোট প্রদেয়:</span>
            <span className="tabular-nums">৳{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <button
            onClick={() => onDeleteOrder(order.id)}
            className="text-red-600 hover:text-red-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>অর্ডার রেকর্ড মুছুন</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#143d2b] text-white font-semibold rounded-lg cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
