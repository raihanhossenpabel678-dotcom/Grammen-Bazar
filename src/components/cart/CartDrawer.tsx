import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShoppingCart, Tag, Check, AlertCircle } from 'lucide-react';
import { CartItem } from '../../types';
import { storeService } from '../../services/storeService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: (appliedCouponCode?: string, discountAmount?: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponStatus, setCouponStatus] = useState<{ success: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const freeShippingThreshold = 1500;
  const neededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const finalTotal = Math.max(0, subtotal - couponDiscount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const res = storeService.validateCoupon(couponInput, subtotal);
    if (res.valid) {
      setAppliedCoupon(couponInput.trim().toUpperCase());
      setCouponDiscount(res.discount);
      setCouponStatus({ success: true, text: res.message });
    } else {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setCouponStatus({ success: false, text: res.message });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponStatus(null);
    setCouponInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-2xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-[#e5ebe7]">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#e5ebe7] flex items-center justify-between bg-[#f8faf8]">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#143d2b]" />
              <h2 className="text-base font-bold text-[#143d2b]">
                শপিং কার্ট ({cartItems.length} টি আইটেম)
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#557564] hover:text-[#143d2b] hover:bg-[#eaf1ec] transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          {cartItems.length > 0 && (
            <div className="p-3 bg-[#eef6f1] border-b border-[#dcebe1] text-xs">
              {neededForFreeShipping > 0 ? (
                <p className="text-[#143d2b] mb-1.5">
                  আর মাত্র <span className="font-bold tabular-nums">৳{neededForFreeShipping}</span> টাকার পণ্য যোগ করলেই ফ্রি ডেলিভারি (কুপন FREESHIP)!
                </p>
              ) : (
                <p className="text-[#143d2b] font-bold mb-1.5 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-[#143d2b]" />
                  অভিনন্দন! আপনি ফ্রি ডেলিভারি পাওয়ার যোগ্য হয়েছেন
                </p>
              )}
              <div className="w-full h-1.5 bg-[#d0e4d7] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#143d2b] transition-all duration-300"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-[#f0f4f1]">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item.product.id} className="pt-3 first:pt-0 flex gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.banglaName}
                    referrerPolicy="no-referrer"
                    className="w-18 h-18 object-cover rounded-lg bg-[#f0f5f2] border border-[#e1ece4] shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-[#143d2b] leading-snug line-clamp-1">
                          {item.product.banglaName}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-[#96aca0] hover:text-red-600 transition-colors cursor-pointer p-0.5"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-[#6b8c7b] mt-0.5">
                        {item.selectedUnit || item.product.unit}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#cfddd3] rounded-md bg-[#f9fbf9]">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-[#143d2b] hover:bg-[#e2ede5] rounded-l-md font-bold text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-7 text-center font-bold text-[#143d2b] tabular-nums text-xs">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={item.quantity >= item.product.stock}
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-[#143d2b] hover:bg-[#e2ede5] rounded-r-md font-bold text-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-[#143d2b] tabular-nums">
                          ৳{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#5b7a69]">
                <ShoppingCart className="w-12 h-12 text-[#9bb7a7] mb-3 stroke-1" />
                <p className="text-base font-bold text-[#143d2b] mb-1">আপনার কার্ট খালি</p>
                <p className="text-xs text-[#719280] mb-4">
                  আমাদের ঐতিহ্যবাহী প্রাকৃতিক গ্রামীণ পণ্যসমূহ ঘুরে দেখুন।
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-[#143d2b] text-white text-xs font-semibold rounded-lg hover:bg-[#1b4d37] transition-colors cursor-pointer"
                >
                  পণ্য বাছাই করুন
                </button>
              </div>
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#e5ebe7] bg-[#f9faf9] space-y-3">
              {/* Coupon input */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 absolute left-3 top-2.5 text-[#6c8c7c]" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="কুপন কোড (যেমন: GRAMEEN10)"
                    disabled={!!appliedCoupon}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#cfddd3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#143d2b] uppercase placeholder:normal-case font-semibold text-[#143d2b]"
                  />
                </div>
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                  >
                    বাতিল
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-3 py-2 text-xs font-bold text-white bg-[#143d2b] hover:bg-[#1a4d37] rounded-lg transition-colors cursor-pointer"
                  >
                    প্রয়োগ
                  </button>
                )}
              </form>

              {/* Coupon message feedback */}
              {couponStatus && (
                <div
                  className={`text-[11px] flex items-center gap-1.5 font-medium ${
                    couponStatus.success ? 'text-emerald-700' : 'text-amber-800'
                  }`}
                >
                  {couponStatus.success ? (
                    <Check className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{couponStatus.text}</span>
                </div>
              )}

              {/* Price Calculations */}
              <div className="space-y-1.5 text-xs text-[#4b6a58] pt-1">
                <div className="flex justify-between">
                  <span>পণ্যের মোট মূল্য:</span>
                  <span className="font-semibold text-[#143d2b] tabular-nums">
                    ৳{subtotal.toLocaleString()}
                  </span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>কুপন ছাড় ({appliedCoupon}):</span>
                    <span className="tabular-nums">-৳{couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#6b8c7b]">
                  <span>ডেলিভারি চার্জ:</span>
                  <span>পরবর্তী ধাপে নির্ধারিত হবে</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-[#143d2b] pt-2 border-t border-[#e2ece5]">
                  <span>মোট প্রদেয়:</span>
                  <span className="tabular-nums">৳{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={() => onCheckout(appliedCoupon || undefined, couponDiscount)}
                className="w-full py-3.5 px-4 bg-[#143d2b] hover:bg-[#1b4d37] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>অর্ডার সম্পন্ন করুন (ক্যাশ অন ডেলিভারি)</span>
                <ArrowRight className="w-4 h-4 text-[#e5b358]" />
              </button>

              <p className="text-[10px] text-center text-[#6e8e7e]">
                🔒 ক্যাশ অন ডেলিভারি · পণ্য হাতে পেয়ে টাকা দিন
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
