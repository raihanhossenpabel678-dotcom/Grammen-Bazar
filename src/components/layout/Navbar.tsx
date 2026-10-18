import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Search, X, User } from 'lucide-react';
import { Product } from '../../types';

import { GrameenBazarLogo } from '../brand/GrameenBazarLogo';

interface NavbarProps {
  cartCount: number;
  cartSubtotal: number;
  onOpenCart: () => void;
  onSelectCategory: (categorySlug: string) => void;
  activeCategory: string;
  onOpenTracking: () => void;
  onOpenAuth: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onViewStorefront: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  cartSubtotal,
  onOpenCart,
  onSelectCategory,
  activeCategory,
  onOpenTracking,
  onOpenAuth,
  products,
  onSelectProduct,
  onViewStorefront,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim()
    ? products
        .filter((p) => {
          const q = searchQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.banglaName.toLowerCase().includes(q) ||
            p.englishName.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.sourceLocation.toLowerCase().includes(q)
          );
        })
        .slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e5e9e5] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Bar 3-Zone Contract */}
        <div className="flex items-center justify-between gap-8 h-18">
          {/* Zone 1: Brand Logo & Wordmark */}
          <button
            onClick={onViewStorefront}
            className="flex items-center text-left cursor-pointer group shrink-0"
            aria-label="Grameen Bazar Home"
          >
            <GrameenBazarLogo variant="horizontal" size="md" />
          </button>

          {/* Zone 2: 4-5 single-line clean navigation links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#2d4738]">
            <button
              onClick={() => {
                onViewStorefront();
                onSelectCategory('all');
              }}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer hover:text-[#143d2b] pb-0.5 ${
                activeCategory === 'all'
                  ? 'text-[#143d2b] font-bold border-b-2 border-[#143d2b]'
                  : ''
              }`}
            >
              সব পণ্য (All)
            </button>
            <button
              onClick={() => {
                onViewStorefront();
                onSelectCategory('honey-gur');
              }}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer hover:text-[#143d2b] pb-0.5 ${
                activeCategory === 'honey-gur'
                  ? 'text-[#143d2b] font-bold border-b-2 border-[#143d2b]'
                  : ''
              }`}
            >
              খাঁটি মধু ও গুড়
            </button>
            <button
              onClick={() => {
                onViewStorefront();
                onSelectCategory('ghee-oils');
              }}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer hover:text-[#143d2b] pb-0.5 ${
                activeCategory === 'ghee-oils'
                  ? 'text-[#143d2b] font-bold border-b-2 border-[#143d2b]'
                  : ''
              }`}
            >
              ঘি ও সরিষার তেল
            </button>
            <button
              onClick={() => {
                onViewStorefront();
                onSelectCategory('rice-pulses');
              }}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer hover:text-[#143d2b] pb-0.5 ${
                activeCategory === 'rice-pulses'
                  ? 'text-[#143d2b] font-bold border-b-2 border-[#143d2b]'
                  : ''
              }`}
            >
              সুগন্ধি চাল ও ডাল
            </button>
            <button
              onClick={onOpenTracking}
              className="whitespace-nowrap shrink-0 text-[#143d2b] hover:text-[#0f2d20] transition-colors cursor-pointer"
            >
              অর্ডার ট্র্যাকিং
            </button>
          </nav>

          {/* Zone 3: Primary Action (Cart Drawer Trigger + Account) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenAuth}
              className="p-2 text-[#2d4738] hover:text-[#143d2b] hover:bg-[#f1f5f2] rounded-lg transition-colors cursor-pointer"
              title="একাউন্ট / ইউজার তথ্য"
              aria-label="User Account"
            >
              <User className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenCart}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-[#143d2b] hover:bg-[#1a4a35] text-white text-sm font-semibold rounded-lg transition-all shadow-xs cursor-pointer active:scale-98 whitespace-nowrap shrink-0"
              aria-label="View shopping cart"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4 text-[#e5b358]" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#d97706] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Cart</span>
              <span className="tabular-nums font-bold text-[#f7e3ad]">
                ৳{cartSubtotal.toLocaleString()}
              </span>
            </button>
          </div>
        </div>

        {/* Live Search Bar strip */}
        <div className="pb-3 pt-1 relative" ref={searchRef}>
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder="পণ্য খুঁজুন (যেমন: মধু, খাঁটি সরিষার তেল, দেশি ঘি, চিনিগুড়া চাল)..."
              className="w-full pl-10 pr-10 py-2 text-sm bg-[#f4f7f4] border border-[#d2ded4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#143d2b]/20 focus:border-[#143d2b] transition-all text-[#1a2e22] placeholder-[#789283]"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#607e6e]" />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchDropdown(false);
                }}
                className="absolute right-3 top-2.5 text-[#607e6e] hover:text-[#1a2e22] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showSearchDropdown && searchQuery.trim() && (
            <div className="absolute left-0 right-0 max-w-2xl mx-auto mt-1.5 bg-white border border-[#d2ded4] rounded-lg shadow-xl overflow-hidden z-50">
              {searchResults.length > 0 ? (
                <>
                  <div className="p-2 border-b border-[#edf2ee] bg-[#f9faf9] text-xs font-semibold text-[#547363]">
                    অনুসন্ধানের ফলাফল ({searchResults.length})
                  </div>
                  <div className="divide-y divide-[#f0f4f1]">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          onSelectProduct(product);
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-[#f4f8f5] cursor-pointer transition-colors"
                      >
                        <img
                          src={product.image}
                          alt={product.banglaName}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-cover rounded-md bg-[#eef3f0]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1a2e22] truncate">
                            {product.banglaName}
                          </p>
                          <p className="text-xs text-[#6a8778] truncate">
                            {product.englishName} · {product.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-[#143d2b] tabular-nums">
                            ৳{product.price}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="block text-xs line-through text-[#94a39b] tabular-nums">
                              ৳{product.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-xs text-[#527161]">
                  "{searchQuery}" নামে কোনো খাঁটি গ্রামীণ পণ্য পাওয়া যায়নি।
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
