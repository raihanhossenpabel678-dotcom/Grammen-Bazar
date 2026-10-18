import React from 'react';
import { ShieldCheck, Sparkles, Truck, RotateCcw } from 'lucide-react';

export const TrustFeatures: React.FC = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: '১০০% খাঁটি ও নির্ভেজাল',
      desc: 'কোনো কৃত্রিম রাসায়নিক, ফ্লেভার বা প্রিজারভেটিভ ছাড়া শতভাগ প্রাকৃতিক খাদ্য।',
    },
    {
      icon: Sparkles,
      title: 'সরাসরি উৎপাদক থেকে',
      desc: 'সুন্দরবনের মৌয়াল ও সিরাজগঞ্জের ঘানি মালিকদের থেকে সরাসরি নিজস্ব তত্ত্বাবধানে সংগ্রহ।',
    },
    {
      icon: Truck,
      title: 'সারাদেশে হোম ডেলিভারি',
      desc: 'ঢাকা সিটিতে ২৪-৪৮ ঘণ্টা এবং সারাদেশে ৭২ ঘণ্টার মধ্যে ক্যাশ অন ডেলিভারি।',
    },
    {
      icon: RotateCcw,
      title: 'পণ্য দেখে মূল্য পরিশোধ',
      desc: 'ডেলিভারির সময় প্যাকেজ দেখে সন্তুষ্ট হয়ে টাকা পরিশোধ করুন, অসন্তুষ্ট হলে সহজ রিটার্ন।',
    },
  ];

  return (
    <section className="bg-white border-y border-[#e5ebe7] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-3 rounded-lg hover:bg-[#f7faf8] transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-[#eaf3ed] text-[#143d2b] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#143d2b] mb-1">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-[#527161] leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
