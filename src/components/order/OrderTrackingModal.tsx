import React, { useState } from 'react';
import { X, Search, Package, CheckCircle2, Clock, Truck, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { storeService } from '../../services/storeService';

import { GrameenBazarLogo } from '../brand/GrameenBazarLogo';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderNumber?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderNumber = '',
}) => {
  const [searchInput, setSearchInput] = useState(initialOrderNumber);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(() => {
    if (initialOrderNumber) {
      return storeService.getOrderById(initialOrderNumber) || null;
    }
    return null;
  });
  const [notFound, setNotFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) return;

    setIsSearching(true);
    setNotFound(false);

    // 1. Search local memory by order ID or order number
    let order: Order | null | undefined = storeService.getOrderById(query);
    if (!order) {
      // 2. Search local memory by customer phone
      const orders = storeService.getOrdersByPhone(query);
      if (orders.length > 0) {
        order = orders[0];
      }
    }

    // 3. Fallback to Firestore remote get (supports tracking cross-browser/device)
    if (!order) {
      try {
        order = await storeService.fetchOrderByIdFromFirestore(query);
      } catch (err) {
        console.warn('Firestore remote order fetch error:', err);
      }
    }

    setIsSearching(false);
    if (order) {
      setSearchedOrder(order);
      setNotFound(false);
    } else {
      setSearchedOrder(null);
      setNotFound(true);
    }
  };

  const steps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'pending', label: 'অর্ডার গৃহীত', desc: 'অর্ডার সিস্টেমে গ্রহণ করা হয়েছে' },
    { key: 'confirmed', label: 'কনফার্মড', desc: 'গ্রাহকের সাথে ফোনে যোগাযোগ নিশ্চিত' },
    { key: 'processing', label: 'প্যাকেজিং', desc: 'মান নিয়ন্ত্রণ ও সুরক্ষা সিলিং' },
    { key: 'shipped', label: 'শিপড', desc: 'কুরিয়ার সার্ভিসে হস্তান্তর' },
    { key: 'delivered', label: 'ডেলিভার্ড', desc: 'পণ্য সফলভাবে গ্রাহকের হাতে পৌঁছেছে' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentStepIndex = searchedOrder ? getStepIndex(searchedOrder.orderStatus) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div
        className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#d2ded5] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#e5ebe7] flex items-center justify-between bg-[#f8faf8]">
          <div className="flex items-center gap-2.5">
            <GrameenBazarLogo variant="icon" size="sm" />
            <h2 className="text-base sm:text-lg font-bold text-[#143d2b] font-display">
              লাইভ অর্ডার ট্র্যাকিং (Order Tracking)
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

        {/* Search Input Bar */}
        <div className="p-4 sm:p-6 bg-[#f7faf8] border-b border-[#e5ece7]">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#628472]" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="অর্ডার নম্বর (যেমন: GB-9021) বা মোবাইল নম্বর দিন..."
                className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border border-[#cfddd3] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#143d2b] text-[#143d2b] font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-5 py-2.5 bg-[#143d2b] hover:bg-[#1a4e37] text-white font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer whitespace-nowrap disabled:opacity-70"
            >
              {isSearching ? 'অনুসন্ধান হচ্ছে...' : 'ট্র্যাক করুন'}
            </button>
          </form>

          {/* Quick Click Samples */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-[#527161]">
            <span className="font-medium">ডেমো দেখতে ক্লিক করুন:</span>
            <button
              type="button"
              onClick={() => {
                setSearchInput('GB-9021');
                setSearchedOrder(storeService.getOrderById('GB-9021') || null);
                setNotFound(false);
              }}
              className="px-2 py-0.5 rounded-sm bg-white border border-[#d2ded5] text-[#143d2b] hover:bg-[#ebf3ed] font-semibold tabular-nums cursor-pointer"
            >
              GB-9021 (ডেলিভার্ড)
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchInput('GB-9022');
                setSearchedOrder(storeService.getOrderById('GB-9022') || null);
                setNotFound(false);
              }}
              className="px-2 py-0.5 rounded-sm bg-white border border-[#d2ded5] text-[#143d2b] hover:bg-[#ebf3ed] font-semibold tabular-nums cursor-pointer"
            >
              GB-9022 (শিপড)
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
          {searchedOrder ? (
            <div className="space-y-6">
              {/* Order Status Badge & Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#f8faf8] rounded-xl border border-[#dcebe1]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#668675]">অর্ডার ট্র্যাকিং আইডি:</span>
                    <span className="text-base font-extrabold text-[#143d2b] tabular-nums">
                      {searchedOrder.orderNumber}
                    </span>
                  </div>
                  <p className="text-xs text-[#597a69] mt-0.5">
                    অর্ডার তারিখ:{' '}
                    <span className="tabular-nums">
                      {new Date(searchedOrder.createdAt).toLocaleDateString('bn-BD')}
                    </span>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="inline-block px-3 py-1 bg-[#143d2b] text-[#f7e3ad] text-xs font-bold rounded-md">
                    {searchedOrder.orderStatus === 'delivered'
                      ? '✓ ডেলিভারি সম্পন্ন'
                      : searchedOrder.orderStatus === 'shipped'
                      ? '🚚 কুরিয়ারে চলমান'
                      : searchedOrder.orderStatus === 'processing'
                      ? '📦 প্যাকেজিং চলছে'
                      : searchedOrder.orderStatus === 'confirmed'
                      ? '👍 কনফার্ম করা হয়েছে'
                      : '⏳ পর্যালোচনাধীন'}
                  </span>
                  <p className="text-[11px] text-[#6b8c7b] mt-1">
                    আনুমানিক ডেলিভারি: {searchedOrder.estimatedDelivery || '২৪-৪৮ ঘণ্টা'}
                  </p>
                </div>
              </div>

              {/* Courier Information if shipped */}
              {searchedOrder.courierName && (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#cfded4] text-xs">
                  <div className="flex items-center gap-2 text-[#143d2b]">
                    <Truck className="w-4 h-4 text-[#e5b358]" />
                    <span className="font-semibold">
                      ডেলিভারি পার্টনার: {searchedOrder.courierName}
                    </span>
                  </div>
                  {searchedOrder.trackingCode && (
                    <span className="text-[#597a69] font-medium tabular-nums">
                      ট্র্যাকিং কোড: <strong className="text-[#143d2b]">{searchedOrder.trackingCode}</strong>
                    </span>
                  )}
                </div>
              )}

              {/* Progress Stepper */}
              <div>
                <h4 className="text-xs font-bold text-[#143d2b] mb-4">অর্ডারের চলমান পর্যায়:</h4>
                <div className="space-y-4">
                  {steps.map((step, idx) => {
                    const isPassed = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;

                    return (
                      <div key={step.key} className="flex items-start gap-3 relative">
                        {idx < steps.length - 1 && (
                          <div
                            className={`absolute left-3.5 top-7 w-0.5 h-7 -ml-[1px] ${
                              currentStepIndex > idx ? 'bg-[#143d2b]' : 'bg-[#e2ece5]'
                            }`}
                          />
                        )}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 font-bold z-10 ${
                            isPassed
                              ? 'bg-[#143d2b] text-white shadow-xs'
                              : 'bg-[#edf3ef] text-[#719281] border border-[#d2ded5]'
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-xs font-bold leading-tight ${
                              isCurrent
                                ? 'text-[#143d2b]'
                                : isPassed
                                ? 'text-[#355342]'
                                : 'text-[#8da396]'
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-[11px] text-[#6b8c7b]">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer Delivery Details */}
              <div className="p-3.5 bg-[#fbfdfc] rounded-xl border border-[#e5ebe7] text-xs space-y-2">
                <div className="flex items-center gap-2 text-[#143d2b] font-semibold">
                  <MapPin className="w-4 h-4 text-[#e5b358]" />
                  <span>
                    প্রাপক: {searchedOrder.customerName} ({searchedOrder.customerPhone})
                  </span>
                </div>
                <p className="text-[#597a69] pl-6">
                  {searchedOrder.deliveryAddress}, {searchedOrder.district}
                </p>
              </div>

              {/* Itemized list */}
              <div>
                <h4 className="text-xs font-bold text-[#143d2b] mb-2">অর্ডারের আইটেমসমূহ:</h4>
                <div className="divide-y divide-[#edf3ef] border border-[#edf3ef] rounded-xl overflow-hidden">
                  {searchedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded-md bg-[#f0f5f2]"
                        />
                        <div>
                          <p className="font-semibold text-[#143d2b]">{item.name}</p>
                          <p className="text-[11px] text-[#6b8c7b]">
                            {item.quantity} x {item.unit}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-[#143d2b] tabular-nums">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="p-3 bg-[#f8faf8] flex justify-between font-extrabold text-sm text-[#143d2b]">
                    <span>সর্বমোট (ক্যাশ অন ডেলিভারি):</span>
                    <span className="tabular-nums">৳{searchedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : notFound ? (
            <div className="text-center py-10 space-y-2">
              <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
              <p className="text-sm font-bold text-[#143d2b]">
                এই নম্বর দিয়ে কোনো অর্ডার পাওয়া যায়নি
              </p>
              <p className="text-xs text-[#6e8e7e]">
                দয়া করে সঠিক অর্ডার নম্বর (যেমন: GB-9021) অথবা যে ফোন নম্বর দিয়ে অর্ডার করেছেন তা দিন।
              </p>
            </div>
          ) : (
            <div className="text-center py-12 space-y-2 text-[#638472]">
              <Package className="w-10 h-10 text-[#96b2a2] mx-auto stroke-1" />
              <p className="text-sm font-bold text-[#143d2b]">
                আপনার অর্ডারের বর্তমান অবস্থা জানুন
              </p>
              <p className="text-xs text-[#719280]">
                উপরের সার্চ বক্সে আপনার অর্ডার আইডি অথবা ফোন নম্বর লিখে ট্র্যাক বাটনে চাপুন।
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
