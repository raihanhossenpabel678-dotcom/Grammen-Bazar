import React from 'react';
import { Category } from '../../types';

interface CategoryNavigationProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
}

export const CategoryNavigation: React.FC<CategoryNavigationProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <div className="bg-white border-b border-[#e5ebe7] py-3 sticky top-18 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#143d2b] text-white shadow-xs'
                    : 'bg-[#f4f7f4] text-[#344f40] hover:bg-[#e8eee9] hover:text-[#143d2b]'
                }`}
              >
                <span>{cat.banglaName}</span>
                {cat.itemCount !== undefined && (
                  <span
                    className={`text-[11px] tabular-nums font-semibold ${
                      isActive ? 'text-[#e5b358]' : 'text-[#6b8c7b]'
                    }`}
                  >
                    ({cat.itemCount})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
