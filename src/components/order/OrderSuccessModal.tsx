import React, { useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck, Package, MapPin, Phone, ArrowRight, Printer, Copy, Check } from 'lucide-react';
import { Order } from '../../types';
import { storeService } from '../../services/storeService';
import { GrameenBazarLogo } from '../brand/GrameenBazarLogo';

interface OrderSuccessModalProps {
  orderId: string;
  onClose: () => void;
  onOpenTracking: (orderId: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  orderId,
  onClose,
  onOpenTracking,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadOrder() {
      setIsLoading(true);
      const verified = await storeService.verifyServerPayment(orderId);
      if (isMounted) {
        setOrder(verified);
        setIsLoading(false);
      }
    }
    loadOrder();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const copyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-[#d2ded5] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#143d2b] text-white p-5 text-center relative">
          <div className="flex justify-center mb-2">
            <GrameenBazarLogo variant="full" size="md" />
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-7 h-7 text-[#e5b358]" />
          </div>
          <h2 className="text-xl font-bold font-display text-white">
            অর্ডার ও পেমেন্ট সফল হয়েছে!
          </h2>
          <p className="text-xs text-[#b8d4c3] mt-1">
            আপনার পেমেন্ট সার্ভার কর্তৃক অনুমোদিত ও ভেরিফাইড হয়েছে।
          </p>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {isLoading ? (
            <div className="py-8 text-center text-[#557564] text-xs space-y-2">
              <div className="w-8 h-8 border-3 border-[#143d2b] border-t-transparent rounded-full animate-spin mx-auto" />
              <p>অর্ডার ভাউচার লোড হচ্ছে...</p>
            </div>
          ) : order ? (
            <>
              {/* Receipt Box */}
              <div className="bg-[#f8faf8] border border-[#d8e5dd] rounded-xl p-4 text-xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#e2ece5] pb-2.5">
                  <div>
                    <span className="text-[#658574] text-[11px] block">অর্ডার ট্র্যাকিং নম্বর:</span>
                    <span className="font-extrabold text-[#143d2b] text-sm tabular-nums">
                      {order.orderNumber}
                    </span>
                  </div>
                  <button
                    onClick={copyOrderNumber}
                    className="p-1.5 rounded-lg border border-[#cfded4] hover:bg-white text-[#143d2b] cursor-pointer flex items-center gap-1 text-[11px]"
                    title="কপি করুন"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#658574]">পেমেন্ট স্ট্যাটাস:</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" />
                    <span>{order.paymentStatus === 'paid' ? 'পরিশোধিত (Paid)' : 'পেন্ডিং (Pending)'}</span>
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#658574]">পেমেন্ট পদ্ধতি:</span>
                  <span className="font-semibold text-[#143d2b]">
                    {order.paymentMethod === 'sslcommerz'
                      ? `SSLCommerz Online (${order.cardType || 'bKash/Gateway'})`
                      : order.paymentMethod === 'cod'
                      ? 'ক্যাশ অন ডেলিভারি'
                      : 'বিকাশ সেন্ড মানি'}
                  </span>
                </div>

                {order.tranId && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#658574]">ট্রানজেকশন ID:</span>
                    <span className="font-mono text-[#143d2b] font-semibold">{order.tranId}</span>
                  </div>
                )}

                {order.bankTranId && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#658574]">ব্যাংক রেফারেন্স:</span>
                    <span className="font-mono text-[#143d2b] font-semibold">{order.bankTranId}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-[#658574]">গ্রাহকের নাম:</span>
                  <span className="font-medium text-[#143d2b]">{order.customerName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#658574]">ডেলিভারি ঠিকানা:</span>
                  <span className="font-medium text-[#143d2b] text-right max-w-[200px] truncate">
                    {order.deliveryAddress}, {order.district}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-[#e2ece5] pt-2 font-bold text-sm text-[#143d2b]">
                  <span>পরিশোধিত মোট টাকা:</span>
                  <span className="tabular-nums text-base text-emerald-800">
                    ৳{order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTracking(order.orderNumber);
                  }}
                  className="flex-1 py-3 px-4 bg-[#143d2b] hover:bg-[#1a4e37] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Package className="w-4 h-4 text-[#e5b358]" />
                  <span>অর্ডার ট্র্যাক করুন</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-5 border border-[#cfded4] hover:bg-[#f3f7f4] text-[#143d2b] font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
                >
                  দোকানে ফিরে যান
                </button>
              </div>
            </>
          ) : (
            <div className="py-6 text-center text-[#557564] text-xs">
              <p>অর্ডারের তথ্য পাওয়া যায়নি। অনুগ্রহ করে ট্র্যাকিং সেকশন থেকে চেক করুন।</p>
              <button
                onClick={onClose}
                className="mt-3 px-4 py-2 bg-[#143d2b] text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
