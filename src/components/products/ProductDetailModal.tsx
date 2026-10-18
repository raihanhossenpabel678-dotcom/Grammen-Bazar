import React, { useState } from 'react';
import { X, Star, ShoppingCart, Zap, CheckCircle2, MapPin, PackageCheck, Shield } from 'lucide-react';
import { Product } from '../../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onQuickBuy: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onQuickBuy,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;

  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleQuickBuy = () => {
    if (isOutOfStock) return;
    onQuickBuy(product, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#d2ded5] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#143d2b] shadow-md flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Product Image & Origin */}
          <div className="relative bg-[#f4f8f5] p-6 flex flex-col justify-between">
            <div className="aspect-4/3 rounded-xl overflow-hidden border border-[#dce8e0] shadow-xs">
              <img
                src={product.image}
                alt={product.banglaName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-4 p-3 bg-white rounded-xl border border-[#dce8e0] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#143d2b] font-medium">
                <MapPin className="w-4 h-4 text-[#e5b358] shrink-0" />
                <span>উৎস: {product.sourceLocation}</span>
              </div>
              <div className="flex items-center gap-2 text-[#567765]">
                <PackageCheck className="w-4 h-4 text-[#143d2b] shrink-0" />
                {isOutOfStock ? (
                  <span className="font-bold text-red-600">
                    বর্তমানে স্টক শেষ (পরবর্তী লটের জন্য অপেক্ষা করুন)
                  </span>
                ) : (
                  <span>
                    <span className="tabular-nums font-semibold text-[#143d2b]">
                      {product.stock} টি
                    </span>{' '}
                    প্যাকেট বর্তমানে স্টকে প্রস্তুত
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Purchase Module & Purity Specs */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center gap-2 text-xs text-[#638472] mb-2">
                <span>{product.unit}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-[#d97706] font-semibold tabular-nums">
                  <Star className="w-4 h-4 fill-[#d97706]" />
                  {product.rating} ({product.reviewsCount} গ্রাহক রিভিউ)
                </span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-[#143d2b] font-display leading-tight">
                {product.banglaName}
              </h2>
              <p className="text-xs text-[#527161] font-medium mt-1 mb-4">
                {product.englishName}
              </p>

              {/* Pricing Box */}
              <div className="flex items-baseline gap-3 p-3 bg-[#f7faf8] rounded-xl border border-[#e2ece5] mb-5">
                <span className="text-3xl font-extrabold text-[#143d2b] tabular-nums">
                  ৳{product.price.toLocaleString()}
                </span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-sm text-[#8ca898] line-through tabular-nums">
                      ৳{product.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-white bg-[#d97706] px-2 py-0.5 rounded-sm tabular-nums">
                      {discountPercent}% ছাড়
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#3b5948] leading-relaxed mb-4">
                {product.description}
              </p>

              {/* Key Benefits */}
              {product.benefits && product.benefits.length > 0 && (
                <div className="mb-6 space-y-1.5 bg-[#fbfdfc] p-3.5 rounded-xl border border-[#edf3ef]">
                  <p className="text-xs font-bold text-[#143d2b] flex items-center gap-1.5 mb-2">
                    <Shield className="w-3.5 h-3.5 text-[#e5b358]" />
                    কেন গ্রামীণ বাজারের এই পণ্যটি নেবেন?
                  </p>
                  {product.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#486b57]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#143d2b] shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="pt-4 border-t border-[#e8efe9] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#143d2b]">অর্ডারের পরিমাণ:</span>
                <div className="flex items-center border border-[#cfddd3] rounded-lg bg-[#f7faf8]">
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-8 flex items-center justify-center text-[#143d2b] hover:bg-[#e4ede7] rounded-l-lg font-bold text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-[#143d2b] tabular-nums text-sm">
                    {isOutOfStock ? 0 : quantity}
                  </span>
                  <button
                    type="button"
                    disabled={isOutOfStock || quantity >= product.stock}
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-9 h-8 flex items-center justify-center text-[#143d2b] hover:bg-[#e4ede7] rounded-r-lg font-bold text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex items-center justify-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold rounded-xl border transition-all cursor-pointer ${
                    isOutOfStock
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : added
                      ? 'bg-[#143d2b] text-white border-[#143d2b]'
                      : 'bg-[#f4f8f5] text-[#143d2b] border-[#c4dcce] hover:bg-[#e8f2ec]'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{isOutOfStock ? 'স্টক শেষ' : added ? 'কার্টে যুক্ত হয়েছে' : 'কার্টে যোগ করুন'}</span>
                </button>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleQuickBuy}
                  className={`flex items-center justify-center gap-1.5 py-3 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer active:scale-98 ${
                    isOutOfStock
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                      : 'bg-[#143d2b] hover:bg-[#1a4e37] text-white'
                  }`}
                >
                  <Zap className="w-4 h-4 text-[#e5b358]" />
                  <span>{isOutOfStock ? 'স্টক নেই' : 'ক্যাশ অন ডেলিভারি'}</span>
                </button>
              </div>

              <p className="text-[11px] text-center text-[#6e8d7d]">
                🌿 পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধ করার ১০০% নিশ্চয়তা
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
