import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, AlertCircle, RefreshCw } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  activeCategoryName: string;
  isLoading?: boolean;
  error?: string | null;
  onAddToCart: (product: Product, quantity: number) => void;
  onQuickBuy: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onRetry?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  activeCategoryName,
  isLoading = false,
  error = null,
  onAddToCart,
  onQuickBuy,
  onViewDetails,
  onRetry,
}) => {
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  const sortedProducts = useMemo(() => {
    const list = [...products];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating);
      case 'featured':
      default:
        return list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    }
  }, [products, sortBy]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header with section title, product count, and sorting selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#e5ece7] mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#143d2b] font-display">
            {activeCategoryName}
          </h2>
          <p className="text-xs sm:text-sm text-[#5d7d6d] mt-1">
            {isLoading ? (
              <span>পণ্য লোড হচ্ছে...</span>
            ) : (
              <>
                মোট <span className="font-semibold text-[#143d2b] tabular-nums">{products.length}</span> টি পণ্য পাওয়া গেছে
              </>
            )}
          </p>
        </div>

        {/* Sort Selector */}
        {!isLoading && products.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <SlidersHorizontal className="w-4 h-4 text-[#5d7d6d]" />
            <span className="text-[#5d7d6d] font-medium">সর্ট করুন:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-[#cfddd3] text-[#143d2b] font-semibold py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#143d2b] text-xs cursor-pointer shadow-2xs"
            >
              <option value="featured">জনপ্রিয় ও বেস্ট সেলার</option>
              <option value="price-asc">দাম: কম থেকে বেশি (৳)</option>
              <option value="price-desc">দাম: বেশি থেকে কম (৳)</option>
              <option value="rating">সর্বোচ্চ রেটিং</option>
            </select>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-200/60 hover:bg-amber-200 text-amber-900 font-bold rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>পুনরায় চেষ্টা</span>
            </button>
          )}
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="bg-white rounded-xl border border-[#e5ebe7] p-4 flex flex-col justify-between space-y-3 animate-pulse"
            >
              <div className="w-full aspect-4/3 bg-[#ebf2ed] rounded-lg" />
              <div className="space-y-2">
                <div className="w-1/3 h-3 bg-[#e0eae3] rounded" />
                <div className="w-3/4 h-4 bg-[#d5e3da] rounded" />
                <div className="w-1/2 h-4 bg-[#e0eae3] rounded" />
              </div>
              <div className="pt-2 border-t border-[#edf3ef] flex justify-between items-center">
                <div className="w-16 h-5 bg-[#d5e3da] rounded" />
                <div className="w-20 h-7 bg-[#ebf2ed] rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onQuickBuy={onQuickBuy}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-[#e5ece7] p-8">
          <p className="text-lg font-bold text-[#143d2b] mb-2">এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি</p>
          <p className="text-sm text-[#668877]">অন্য কোনো ক্যাটাগরি বা সার্চ বার ব্যবহার করুন।</p>
        </div>
      )}
    </section>
  );
};
