import React from 'react';
import { Phone, ShieldCheck, Truck } from 'lucide-react';

interface AnnouncementBarProps {
  onOpenTracking: () => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  onOpenTracking,
}) => {
  return (
    <div className="bg-[#143d2b] text-[#e2f0e8] text-xs py-2 px-4 border-b border-[#1b4b36]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#e5b358]" />
            ১০০% নিরাপদ ও নির্ভেজাল গ্রামীণ খাদ্যপণ্য
          </span>
          <span className="hidden md:inline text-[#7aa58d]">·</span>
          <span className="hidden md:flex items-center gap-1.5 text-[#c2dfce]">
            <Truck className="w-3.5 h-3.5 text-[#e5b358]" />
            সারাদেশে ক্যাশ অন ডেলিভারি (পণ্য দেখে মূল্য পরিশোধ)
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="tel:01700123456"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#e5b358]" />
            <span className="font-semibold tabular-nums">01700-123456</span>
          </a>

          <span className="text-[#416853]">|</span>

          <button
            onClick={onOpenTracking}
            className="hover:text-white transition-colors cursor-pointer underline decoration-[#416853] underline-offset-2"
          >
            অর্ডার ট্র্যাক করুন
          </button>
        </div>
      </div>
    </div>
  );
};
