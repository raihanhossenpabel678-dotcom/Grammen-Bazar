import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { HERO_BANNER_IMAGE } from '../../data/initialData';

interface HeroBannerProps {
  onExploreClick: () => void;
  onSpecialCategoryClick: (slug: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreClick,
  onSpecialCategoryClick,
}) => {
  return (
    <section className="relative overflow-hidden bg-[#102e21] text-white">
      {/* Background Image with Scrim Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_BANNER_IMAGE}
          alt="Traditional Bangladeshi Organic Harvest & Pantry"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d261b] via-[#0d261b]/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-18">
        <div className="max-w-2xl">
          {/* Subtle natural badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-xs border border-white/15 rounded-md text-xs font-medium text-[#f3e5be] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#e5b358]" />
            <span>সরাসরি মাঠ ও সুন্দরবন থেকে সংগৃহীত নিরাপদ খাদ্য</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.18] font-display text-balance mb-4">
            প্রকৃতির আসল স্বাদ ও পুষ্টি, <br />
            <span className="text-[#e5b358]">সরাসরি আপনার খাবার টেবিলে</span>
          </h1>

          <p className="text-sm sm:text-base text-[#d1e3d7] leading-relaxed mb-6 font-normal">
            সুন্দরবনের খাঁটি চাকের বুনো মধু, কাঠের ঘানি ভাঙা খাঁটি সরিষার তেল, দেশি গাওয়া ঘি ও ঐতিহ্যবাহী চিনিগুড়া চাল। কোনো কৃত্রিম প্রিজারভেটিভ বা ভেজাল নেই।
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onExploreClick}
              className="flex items-center gap-2 px-6 py-3 bg-[#e5b358] hover:bg-[#d8a142] text-[#143d2b] font-bold text-sm rounded-lg transition-all shadow-md cursor-pointer active:scale-98"
            >
              <span>পণ্যসমূহ দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSpecialCategoryClick('honey-gur')}
              className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-sm rounded-lg transition-all backdrop-blur-xs cursor-pointer"
            >
              <span>সুন্দরবনের মধু</span>
            </button>
          </div>

          {/* Clean trust markers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-8 mt-8 border-t border-white/15 text-xs text-[#c6ded0]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#e5b358] shrink-0" />
              <span>১০০% ল্যাব টেস্টেড খাঁটি</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#e5b358] shrink-0" />
              <span>ক্যাশ অন ডেলিভারি</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#e5b358] shrink-0" />
              <span>পছন্দ না হলে ক্যাশ রিফান্ড</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
