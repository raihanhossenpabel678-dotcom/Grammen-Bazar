import React, { useState } from 'react';
import { ShoppingCart, Star, Check, Zap } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onQuickBuy: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickBuy,
  onViewDetails,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    onAddToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    onQuickBuy(product);
  };

  return (
    <div
      onClick={() => onViewDetails(product)}
      className="group bg-white rounded-xl border border-[#e3ebe5] overflow-hidden hover:border-[#b9d4c2] hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col h-full"
    >
      {/* Product Image Area */}
      <div className="relative aspect-4/3 bg-[#f5f8f6] overflow-hidden">
        {!imgError ? (
          <img
            src={product.image}
            alt={product.banglaName}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#eef4f0] text-[#3d5a49]">
            <span className="font-semibold text-sm">{product.banglaName}</span>
            <span className="text-xs text-[#71917f] mt-1">{product.englishName}</span>
          </div>
        )}

        {/* Discount / Special tag */}
        {discountPercent > 0 && (
          <div className="absolute top-2.5 left-2.5 bg-[#d97706] text-white text-[11px] font-bold px-2 py-0.5 rounded-sm shadow-xs tabular-nums">
            {discountPercent}% ছাড়
          </div>
        )}

        {/* Out of Stock Tag */}
        {isOutOfStock && (
          <div className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-sm shadow-xs">
            স্টক শেষ
          </div>
        )}

        {/* Source origin badge */}
        <div className="absolute bottom-2.5 left-2.5 bg-[#143d2b]/85 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-sm">
          {product.sourceLocation.split(',')[0]}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata line with unboxed text */}
          <div className="flex items-center gap-2 text-xs text-[#638472] mb-1.5">
            <span>{product.unit}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-[#d97706] font-medium tabular-nums">
              <Star className="w-3.5 h-3.5 fill-[#d97706]" />
              {product.rating} ({product.reviewsCount})
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-[#143d2b] leading-snug line-clamp-1 group-hover:text-[#1b5e3f] transition-colors">
            {product.banglaName}
          </h3>
          <p className="text-xs text-[#527161] line-clamp-1 mb-2 font-normal">
            {product.englishName}
          </p>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-extrabold text-[#143d2b] tabular-nums">
              ৳{product.price.toLocaleString()}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-[#8ca898] line-through tabular-nums">
                ৳{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Quantity Controls & Action Buttons */}
        <div className="pt-2 border-t border-[#edf3ef] space-y-2">
          {/* Quantity Stepper */}
          <div
            className="flex items-center justify-between text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[#597a69] font-medium">পরিমাণ:</span>
            <div className="flex items-center border border-[#d2ded5] rounded-md bg-[#f7faf8]">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-6 flex items-center justify-center text-[#143d2b] hover:bg-[#e4ede7] rounded-l-md font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-[#143d2b] tabular-nums">
                {isOutOfStock ? 0 : quantity}
              </span>
              <button
                type="button"
                disabled={isOutOfStock || quantity >= product.stock}
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="w-7 h-6 flex items-center justify-center text-[#143d2b] hover:bg-[#e4ede7] rounded-r-md font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          {/* 2-Button Action Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : justAdded
                  ? 'bg-[#143d2b] text-white border-[#143d2b]'
                  : 'bg-[#f4f8f5] text-[#143d2b] border-[#cbe0d3] hover:bg-[#e9f2ec]'
              }`}
            >
              {isOutOfStock ? (
                <span>স্টক নেই</span>
              ) : justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#e5b358]" />
                  <span>যোগ হয়েছে</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>কার্টে যোগ</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleQuickBuy}
              className={`flex items-center justify-center gap-1 py-2 px-2 text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer active:scale-98 ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-[#143d2b] hover:bg-[#1a4e37] text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-[#e5b358]" />
              <span>{isOutOfStock ? 'স্টক শেষ' : 'অর্ডার করুন'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
