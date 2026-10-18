import React, { useState } from 'react';
import { X, CheckCircle, Truck, ShieldCheck, MapPin, Phone, User, FileText, ArrowRight, Package, CreditCard, AlertCircle, Lock, Sparkles } from 'lucide-react';
import { CartItem, DeliveryArea, PaymentMethod, Order } from '../../types';
import { BANGLADESH_DISTRICTS } from '../../data/initialData';
import { storeService } from '../../services/storeService';
import { authService } from '../../services/authService';

import { GrameenBazarLogo } from '../brand/GrameenBazarLogo';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  appliedCouponCode?: string;
  initialDiscount?: number;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  appliedCouponCode,
  initialDiscount = 0,
  onOrderSuccess,
}) => {
  const currentUser = authService.getUser();

  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || '');
  const [district, setDistrict] = useState(currentUser?.district || 'Dhaka (ঢাকা)');
  const [deliveryArea, setDeliveryArea] = useState<DeliveryArea>('inside_dhaka');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const deliveryFee = deliveryArea === 'inside_dhaka' ? 60 : 120;
  const discount = initialDiscount;
  const grandTotal = Math.max(0, subtotal - discount + deliveryFee);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!customerName.trim()) {
      errs.customerName = 'দয়া করে আপনার পূর্ণ নাম লিখুন';
    }
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (!customerPhone.trim() || cleanPhone.length < 11) {
      errs.customerPhone = 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)';
    }
    if (!deliveryAddress.trim() || deliveryAddress.trim().length < 10) {
      errs.deliveryAddress = 'পূর্ণ ডেলিভারি ঠিকানা দিন (বাসা নং, রোড, এলাকা/থানা)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const orderItems = items.map((i) => ({
        productId: i.product.id,
        name: i.product.banglaName,
        banglaName: i.product.banglaName,
        price: i.product.price,
        quantity: i.quantity,
        unit: i.selectedUnit || i.product.unit,
        image: i.product.image,
      }));

      // Route A: SSLCommerz Online Payment Gateway
      if (paymentMethod === 'sslcommerz') {
        const result = await storeService.initiateOnlinePayment({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: currentUser?.email || '',
          deliveryAddress: deliveryAddress.trim(),
          district,
          deliveryArea,
          deliveryFee,
          items: orderItems,
          subtotal,
          discount,
          couponCode: appliedCouponCode,
          totalAmount: grandTotal,
          paymentMethod: 'sslcommerz',
          paymentStatus: 'pending',
          orderStatus: 'pending',
          specialInstructions: specialInstructions.trim() || undefined,
          estimatedDelivery: deliveryArea === 'inside_dhaka' ? '২৪-৪৮ ঘণ্টার মধ্যে' : '৪৮-৭২ ঘণ্টার মধ্যে',
        });

        if (result.success && result.redirectUrl) {
          window.location.href = result.redirectUrl;
          return;
        } else {
          setErrors({ submit: result.error || 'পেমেন্ট গেটওয়েতে সংযোগ করা যায়নি।' });
          setIsSubmitting(false);
          return;
        }
      }

      // Route B: Cash on Delivery or Manual Send Money
      const newOrder = await storeService.createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: currentUser?.email || '',
        deliveryAddress: deliveryAddress.trim(),
        district,
        deliveryArea,
        deliveryFee,
        items: orderItems,
        subtotal,
        discount,
        couponCode: appliedCouponCode,
        totalAmount: grandTotal,
        paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'pending',
        specialInstructions: specialInstructions.trim() || undefined,
        estimatedDelivery: deliveryArea === 'inside_dhaka' ? '২৪-৪৮ ঘণ্টার মধ্যে' : '৪৮-৭২ ঘণ্টার মধ্যে',
      });

      setCompletedOrder(newOrder);
      onOrderSuccess(newOrder);
    } catch (err: any) {
      console.error('Failed to submit order:', err);
      setErrors({ submit: err?.message || 'অর্ডার সংরক্ষণ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div
        className="relative bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#d2ded5] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#e5ebe7] flex items-center justify-between bg-[#f8faf8]">
          <div className="flex items-center gap-2.5">
            <GrameenBazarLogo variant="icon" size="sm" />
            <h2 className="text-base sm:text-lg font-bold text-[#143d2b] font-display">
              {completedOrder ? 'অর্ডার সফলভাবে গৃহীত হয়েছে' : 'নিরাপদ চেকআউট · ক্যাশ অন ডেলিভারি'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#557564] hover:text-[#143d2b] hover:bg-[#eaf1ec] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {completedOrder ? (
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="flex justify-center mb-2">
              <GrameenBazarLogo variant="full" size="md" />
            </div>
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-[#143d2b] font-display">
                ধন্যবাদ, {completedOrder.customerName}!
              </h3>
              <p className="text-sm text-[#486b58] mt-1.5">
                আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে। আমাদের প্রতিনিধি দ্রুত আপনার সাথে ফোনে যোগাযোগ করবে।
              </p>
            </div>

            {/* Order Voucher Box */}
            <div className="max-w-md mx-auto bg-[#f8faf8] border border-[#d2ded5] rounded-xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-[#e5ece7] pb-2">
                <span className="text-[#658574]">অর্ডার ট্র্যাকিং নম্বর:</span>
                <span className="font-extrabold text-[#143d2b] text-sm tabular-nums">
                  {completedOrder.orderNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#658574]">ডেলিভারি ঠিকানা:</span>
                <span className="font-medium text-[#143d2b] text-right max-w-[200px] truncate">
                  {completedOrder.deliveryAddress}, {completedOrder.district}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#658574]">আনুমানিক সময়:</span>
                <span className="font-bold text-emerald-800">
                  {completedOrder.estimatedDelivery}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#e5ece7] pt-2 text-sm font-extrabold text-[#143d2b]">
                <span>ক্যাশ অন ডেলিভারি পরিশোধ:</span>
                <span className="tabular-nums">৳{completedOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#143d2b] text-white font-bold text-xs sm:text-sm rounded-lg hover:bg-[#1a4e37] transition-colors cursor-pointer"
              >
                আরও কেনাকাটা করুন
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form View */
          <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Customer Form (7 cols) */}
              <div className="md:col-span-7 space-y-4">
                <h3 className="text-sm font-bold text-[#143d2b] flex items-center gap-2 border-b border-[#edf3ef] pb-2">
                  <User className="w-4 h-4 text-[#e5b358]" />
                  <span>গ্রাহক ও ডেলিভারি তথ্য</span>
                </h3>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#143d2b] mb-1">
                    আপনার পূর্ণ নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="যেমন: তানভীর আহমেদ"
                    className={`w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border bg-white focus:outline-none focus:ring-1 ${
                      errors.customerName
                        ? 'border-red-400 focus:ring-red-500'
                        : 'border-[#cfded4] focus:ring-[#143d2b]'
                    }`}
                  />
                  {errors.customerName && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.customerName}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-[#143d2b] mb-1">
                    মোবাইল নম্বর <span className="text-red-500">*</span> (অর্ডার কনফার্মেশনের জন্য)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-[#739282]" />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className={`w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-lg border bg-white focus:outline-none focus:ring-1 tabular-nums ${
                        errors.customerPhone
                          ? 'border-red-400 focus:ring-red-500'
                          : 'border-[#cfded4] focus:ring-[#143d2b]'
                      }`}
                    />
                  </div>
                  {errors.customerPhone && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.customerPhone}</p>
                  )}
                </div>

                {/* District Selection */}
                <div>
                  <label className="block text-xs font-semibold text-[#143d2b] mb-1">
                    জেলা নির্বাচন করুন <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      if (e.target.value.toLowerCase().includes('dhaka')) {
                        setDeliveryArea('inside_dhaka');
                      } else {
                        setDeliveryArea('outside_dhaka');
                      }
                    }}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#cfded4] bg-white focus:outline-none focus:ring-1 focus:ring-[#143d2b] text-[#143d2b] cursor-pointer"
                  >
                    {BANGLADESH_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Delivery Area Segmented Selection */}
                <div>
                  <label className="block text-xs font-semibold text-[#143d2b] mb-1.5">
                    ডেলিভারি এরিয়া ও চার্জ
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryArea('inside_dhaka')}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        deliveryArea === 'inside_dhaka'
                          ? 'border-[#143d2b] bg-[#eef6f1] ring-1 ring-[#143d2b]'
                          : 'border-[#d0dfd5] bg-white hover:bg-[#f7faf8]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#143d2b]">ঢাকার ভেতরে</span>
                        <span className="text-xs font-extrabold text-[#143d2b] tabular-nums">
                          ৳60
                        </span>
                      </div>
                      <p className="text-[10px] text-[#557564] mt-0.5">২৪-৪৮ ঘণ্টার মধ্যে হোম ডেলিভারি</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryArea('outside_dhaka')}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        deliveryArea === 'outside_dhaka'
                          ? 'border-[#143d2b] bg-[#eef6f1] ring-1 ring-[#143d2b]'
                          : 'border-[#d0dfd5] bg-white hover:bg-[#f7faf8]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#143d2b]">ঢাকার বাইরে</span>
                        <span className="text-xs font-extrabold text-[#143d2b] tabular-nums">
                          ৳120
                        </span>
                      </div>
                      <p className="text-[10px] text-[#557564] mt-0.5">৪৮-৭২ ঘণ্টার মধ্যে স্টিডফাস্ট কুরিয়ার</p>
                    </button>
                  </div>
                </div>

                {/* Full Delivery Address */}
                <div>
                  <label className="block text-xs font-semibold text-[#143d2b] mb-1">
                    সম্পূর্ণ ঠিকানা <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-[#739282]" />
                    <textarea
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="বাসা নং, রোড নং, এলাকা/মহল্লা, থানা ও ল্যান্ডমার্ক..."
                      className={`w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-lg border bg-white focus:outline-none focus:ring-1 ${
                        errors.deliveryAddress
                          ? 'border-red-400 focus:ring-red-500'
                          : 'border-[#cfded4] focus:ring-[#143d2b]'
                      }`}
                    />
                  </div>
                  {errors.deliveryAddress && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.deliveryAddress}</p>
                  )}
                </div>

                {/* Special delivery instructions */}
                <div>
                  <label className="block text-xs font-medium text-[#527161] mb-1">
                    ডেলিভারি নোট বা বিশেষ নির্দেশনা (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="যেমন: বিকেলে ডেলিভারি দিন অথবা ফোন দিয়ে আসুন"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#cfded4] bg-white focus:outline-none focus:ring-1 focus:ring-[#143d2b]"
                  />
                </div>
              </div>

              {/* Right Column: Order Summary & Payment (5 cols) */}
              <div className="md:col-span-5 flex flex-col justify-between bg-[#f8faf8] p-4 rounded-xl border border-[#dcebe1]">
                <div>
                  <h3 className="text-sm font-bold text-[#143d2b] flex items-center gap-2 border-b border-[#dcebe1] pb-2 mb-3">
                    <Package className="w-4 h-4 text-[#e5b358]" />
                    <span>অর্ডারের পণ্যসমূহ ({items.length})</span>
                  </h3>

                  {/* Items mini list */}
                  <div className="max-h-48 overflow-y-auto divide-y divide-[#e9f1ec] pr-1 mb-4 space-y-2">
                    {items.map((i) => (
                      <div key={i.product.id} className="pt-2 first:pt-0 flex items-center gap-2 text-xs">
                        <img
                          src={i.product.image}
                          alt={i.product.banglaName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded-md bg-white border border-[#dcebe1] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#143d2b] truncate">
                            {i.product.banglaName}
                          </p>
                          <p className="text-[11px] text-[#6b8c7b] tabular-nums">
                            {i.quantity} x ৳{i.product.price}
                          </p>
                        </div>
                        <span className="font-bold text-[#143d2b] tabular-nums">
                          ৳{(i.product.price * i.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-2.5 pt-2 border-t border-[#dcebe1] mb-4">
                    <p className="text-xs font-bold text-[#143d2b] flex items-center justify-between">
                      <span>পেমেন্ট পদ্ধতি নির্বাচন করুন:</span>
                      <span className="text-[10px] text-[#557564] font-normal">ক্যাশ অথবা অনলাইন</span>
                    </p>

                    {/* Option 1: Cash on Delivery */}
                    <label
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-[#143d2b] bg-[#eef6f1] ring-1 ring-[#143d2b]'
                          : 'border-[#d2ded5] bg-white hover:bg-[#f7faf8]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-0.5 text-[#143d2b] focus:ring-[#143d2b]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#143d2b]">
                            ক্যাশ অন ডেলিভারি (Cash on Delivery)
                          </span>
                          <span className="text-[10px] bg-[#dbe8e0] text-[#143d2b] font-semibold px-2 py-0.5 rounded-full">
                            জনপ্রিয়
                          </span>
                        </div>
                        <p className="text-[10px] text-[#557564] mt-0.5">
                          পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানকে নগদ টাকা পরিশোধ করুন
                        </p>
                      </div>
                    </label>

                    {/* Option 2: Bangladeshi Online Payment Gateway (SSLCommerz) */}
                    <label
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'sslcommerz'
                          ? 'border-[#143d2b] bg-[#eef6f1] ring-1 ring-[#143d2b]'
                          : 'border-[#d2ded5] bg-white hover:bg-[#f7faf8]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'sslcommerz'}
                        onChange={() => setPaymentMethod('sslcommerz')}
                        className="mt-0.5 text-[#143d2b] focus:ring-[#143d2b]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#143d2b] flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-[#143d2b]" />
                            <span>অনলাইন পেমেন্ট (SSLCommerz Gateway)</span>
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-700" />
                            ১০০% নিরাপদ
                          </span>
                        </div>
                        <p className="text-[10px] text-[#557564] mt-0.5">
                          বিকাশ, নগদ, রকেট, ডেবিট/ক্রেডিট কার্ড এবং ইন্টারনেট ব্যাংকিং
                        </p>

                        {/* Bangladeshi Gateway Provider Badges */}
                        <div className="flex flex-wrap items-center gap-1 mt-2">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#e2136e] text-white text-[9px] font-bold shadow-2xs">
                            বিকাশ
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#f7941d] text-white text-[9px] font-bold shadow-2xs">
                            নগদ
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#8c3494] text-white text-[9px] font-bold shadow-2xs">
                            রকেট
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#1a1f71] text-white text-[9px] font-bold shadow-2xs">
                            VISA / Master
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#006a4e] text-white text-[9px] font-bold shadow-2xs">
                            Net Banking
                          </span>
                        </div>

                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                          <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>স্যান্ডবক্স টেস্ট সক্রিয় · নিরাপদ সার্ভার-সাইড ভ্যালিডেশন</span>
                        </div>
                      </div>
                    </label>

                    {/* Option 3: Direct Send Money / Personal */}
                    <label
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === 'bkash'
                          ? 'border-[#143d2b] bg-[#eef6f1] ring-1 ring-[#143d2b]'
                          : 'border-[#d2ded5] bg-white hover:bg-[#f7faf8]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'bkash'}
                        onChange={() => setPaymentMethod('bkash')}
                        className="mt-0.5 text-[#143d2b] focus:ring-[#143d2b]"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-[#143d2b]">
                          বিকাশ / নগদ সেন্ড মানি (ম্যানুয়াল)
                        </span>
                        <p className="text-[10px] text-[#557564] mt-0.5">
                          অর্ডার কনফার্মেশনের পর আমাদের অফিশিয়াল পার্সোনাল নাম্বারে সেন্ড মানি
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Price Calculations */}
                  <div className="space-y-1.5 text-xs text-[#527161] border-t border-[#dcebe1] pt-3">
                    <div className="flex justify-between">
                      <span>সাব-টোটাল:</span>
                      <span className="font-semibold text-[#143d2b] tabular-nums">
                        ৳{subtotal.toLocaleString()}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>কুপন ছাড়:</span>
                        <span className="tabular-nums">-৳{discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>ডেলিভারি চার্জ:</span>
                      <span className="font-semibold text-[#143d2b] tabular-nums">
                        ৳{deliveryFee}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-[#143d2b] border-t border-[#dcebe1] pt-2">
                      <span>সর্বমোট প্রদেয়:</span>
                      <span className="tabular-nums text-lg text-[#143d2b]">
                        ৳{grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 mt-2">
                  {errors.submit && (
                    <div className="mb-3 p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errors.submit}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 bg-[#143d2b] hover:bg-[#1a4e37] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-70"
                  >
                    <span>
                      {isSubmitting
                        ? paymentMethod === 'sslcommerz'
                          ? 'পেমেন্ট গেটওয়েতে সংযোগ করা হচ্ছে...'
                          : 'অর্ডার প্রক্রিয়া করা হচ্ছে...'
                        : paymentMethod === 'sslcommerz'
                          ? 'অনলাইন পেমেন্ট করুন (৳' + grandTotal.toLocaleString() + ')'
                          : 'অর্ডার নিশ্চিত করুন (৳' + grandTotal.toLocaleString() + ')'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#e5b358]" />
                  </button>

                  <p className="text-[10px] text-center text-[#6e8d7d] mt-2 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3 text-[#143d2b]" />
                    <span>SSLCommerz ও ফায়ারস্টোর এনক্রিপশনে শতভাগ সুরক্ষিত</span>
                  </p>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
