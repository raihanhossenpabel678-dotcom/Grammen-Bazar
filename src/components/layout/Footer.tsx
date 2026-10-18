import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';
import { GrameenBazarLogo } from '../brand/GrameenBazarLogo';

interface FooterProps {
  onSelectCategory: (slug: string) => void;
  onOpenTracking: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenTracking,
}) => {
  return (
    <footer className="bg-[#10291e] text-[#d6e5dc] text-xs pt-12 pb-8 border-t border-[#183d2c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#1b4330]">
          {/* Column 1: Brand & Origin Story */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="bg-white p-1 rounded-xl shadow-xs">
                <GrameenBazarLogo variant="icon" size="sm" />
              </div>
              <div className="flex flex-col leading-none">
                <div className="flex items-center gap-1 font-black text-lg">
                  <span className="text-white">Grameen</span>
                  <span className="text-[#e5b358]">Bazar</span>
                </div>
                <span className="text-[10px] text-[#8ab39c] font-medium tracking-wider mt-0.5">
                  Fresh | Local | Digital
                </span>
              </div>
            </div>
            <p className="text-xs text-[#a3c4b1] leading-relaxed">
              বাংলার ঐতিহ্যবাহী প্রাকৃতিক ও নিরাপদ খাদ্য সরাসরি মাঠ ও বনভূমি থেকে আপনার পরিবারে পৌঁছে দিতে গ্রামীণ বাজার বদ্ধপরিকর। ১০০% নির্ভেজাল নিশ্চয়তা।
            </p>
            <div className="flex items-center gap-2 text-[#e5b358] font-medium pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>ল্যাব সার্টিফাইড ও বিএসটিআই মানসম্পন্ন</span>
            </div>
          </div>

          {/* Column 2: Popular Categories */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 font-display">
              জনপ্রিয় ক্যাটাগরি
            </h4>
            <ul className="space-y-2 text-[#b0cec0]">
              <li>
                <button
                  onClick={() => onSelectCategory('honey-gur')}
                  className="hover:text-[#e5b358] transition-colors cursor-pointer"
                >
                  সুন্দরবনের খাঁটি মধু ও খেজুর গুড়
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('ghee-oils')}
                  className="hover:text-[#e5b358] transition-colors cursor-pointer"
                >
                  কাঠের ঘানি ভাঙা সরিষার তেল ও গাওয়া ঘি
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('rice-pulses')}
                  className="hover:text-[#e5b358] transition-colors cursor-pointer"
                >
                  সুগন্ধি চিনিগুড়া চাল ও দেশি ডাল
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('spices')}
                  className="hover:text-[#e5b358] transition-colors cursor-pointer"
                >
                  রোদে শুকানো খাঁটি গুঁড়া মসলা
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('nuts-seeds')}
                  className="hover:text-[#e5b358] transition-colors cursor-pointer"
                >
                  পাহাড়ি কাজু ও প্রিমিয়াম নাট মিক্স
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Services */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 font-display">
              গ্রাহক সেবা ও ট্র্যাকিং
            </h4>
            <ul className="space-y-2 text-[#b0cec0]">
              <li>
                <button
                  onClick={onOpenTracking}
                  className="hover:text-[#e5b358] transition-colors cursor-pointer font-semibold text-[#e5b358]"
                >
                  লাইভ অর্ডার ট্র্যাকিং (Track Order)
                </button>
              </li>
              <li>
                <span className="text-[#a3c4b1]">ঢাকার ভেতরে ডেলিভারি: ২৪-৪৮ ঘণ্টা (৳৬০)</span>
              </li>
              <li>
                <span className="text-[#a3c4b1]">ঢাকার বাইরে ডেলিভারি: ৪৮-৭২ ঘণ্টা (৳১২০)</span>
              </li>
              <li>
                <span className="text-[#a3c4b1]">পণ্য দেখে নেওয়ার শতভাগ নিশ্চয়তা</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Hotline & Contact Info */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 font-display">
              যোগাযোগ ও হটলাইন
            </h4>
            <div className="space-y-2.5 text-[#b0cec0]">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#e5b358] shrink-0" />
                <a
                  href="tel:01700123456"
                  className="hover:text-white tabular-nums font-bold text-white"
                >
                  01700-123456 (সকাল ৯টা - রাত ১০টা)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#e5b358] shrink-0" />
                <span>support@grameenbazar.com.bd</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#e5b358] shrink-0 mt-0.5" />
                <span>হাউজ ১২, রোড ৫, ধানমন্ডি, ঢাকা-১২০৫, বাংলাদেশ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#7da68f]">
          <p>© 2026 Grameen Bazar (গ্রামীণ বাজার) · সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-2">
            <span>ক্যাশ অন ডেলিভারি (Cash on Delivery) · বিকাশ · নগদ</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
