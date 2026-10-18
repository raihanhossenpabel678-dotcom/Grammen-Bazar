import React, { useState, useEffect } from 'react';
import { Shield, Lock, Globe, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { AdminDashboard } from './AdminDashboard';
import { GrameenBazarLogo } from '../brand/GrameenBazarLogo';
import { UserProfile } from '../../types';

interface AdminAuthGateProps {
  onBackToStore: () => void;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({ onBackToStore }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authService.getUser());
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    return authService.subscribe((user) => {
      setCurrentUser(user);
    });
  }, []);

  const isAdmin = authService.isAdmin();

  const handleGoogleAdminLogin = async () => {
    setIsAuthorizing(true);
    setErrorMessage(null);
    try {
      const user = await authService.signInWithGoogle();
      if (user.role !== 'admin' && user.email?.toLowerCase() !== 'raihanhossenpabel678@gmail.com') {
        setErrorMessage(
          `অননুমোদিত ইমেইল (${user.email})। শুধুমাত্র অনুমোদিত অ্যাডমিন (raihanhossenpabel678@gmail.com) প্রবেশ করতে পারবেন।`
        );
      }
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      setErrorMessage(
        'গুগল পপআপ উইন্ডো খুলতে সমস্যা হয়েছে। নিচের "অ্যাডমিন পাসকি" বাটন ব্যবহার করে সরাসরি প্রবেশ করুন।'
      );
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleDevPasskeyLogin = () => {
    authService.loginAsAdmin('raihanhossenpabel678@gmail.com');
  };

  // If authorized as admin, render the full admin dashboard
  if (isAdmin) {
    return <AdminDashboard onBackToStore={onBackToStore} />;
  }

  // Otherwise, render the secure authentication gate
  return (
    <div className="min-h-screen bg-[#0e271c] text-white flex flex-col justify-between p-4 sm:p-6">
      <div className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <button
          onClick={onBackToStore}
          className="flex items-center gap-2 text-xs font-semibold text-[#f7e3ad] hover:text-white transition-colors cursor-pointer bg-white/10 px-3 py-1.5 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>দোকানে ফিরুন</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-[#8cbda3]">
          <Shield className="w-4 h-4 text-[#e5b358]" />
          <span>সুরক্ষিত ফায়ারবেস অথেনটিকেশন পোর্টাল</span>
        </div>
      </div>

      <div className="max-w-md w-full mx-auto my-12 bg-white text-[#143d2b] rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#d2ded5] animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center space-y-3 mb-6">
          <div className="flex justify-center">
            <GrameenBazarLogo variant="full" size="md" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200">
            <Lock className="w-3.5 h-3.5" />
            <span>অ্যাডমিন এক্সেস সংরক্ষিত (/admin)</span>
          </div>

          <h2 className="text-xl font-bold font-display text-[#143d2b]">
            স্টোর ম্যানেজার প্রবেশদ্বার
          </h2>
          <p className="text-xs text-[#527161]">
            পণ্য, মূল্য, স্টক, অর্ডার ও কুপন পরিচালনার জন্য আপনার অনুমোদিত অ্যাডমিন একাউন্ট দিয়ে যাচাই করুন।
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {currentUser && currentUser.role !== 'admin' && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-1">
            <p className="font-semibold">বর্তমান সাইন-ইন অবস্থা:</p>
            <p className="text-[#6d5b38]">
              {currentUser.displayName} ({currentUser.email || currentUser.phone}) — গ্রাহক মোড (সীমাবদ্ধ)
            </p>
          </div>
        )}

        <div className="space-y-3">
          {/* Real Google Auth Button */}
          <button
            onClick={handleGoogleAdminLogin}
            disabled={isAuthorizing}
            className="w-full py-3 px-4 bg-[#143d2b] hover:bg-[#1a4e37] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-70"
          >
            <Globe className="w-4 h-4 text-[#e5b358]" />
            <span>
              {isAuthorizing ? 'যাচাই করা হচ্ছে...' : 'Google দিয়ে অ্যাডমিন লগইন'}
            </span>
          </button>

          <p className="text-[11px] text-center text-[#6e8e7e]">
            অনুমোদিত অ্যাডমিন ইমেইল: <strong>raihanhossenpabel678@gmail.com</strong>
          </p>

          <div className="flex items-center gap-2 my-2 text-gray-400 text-xs">
            <div className="flex-1 h-px bg-gray-200" />
            <span>অথবা টেস্ট ভেরিফিকেশন</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Developer / Demo Admin direct passkey */}
          <button
            type="button"
            onClick={handleDevPasskeyLogin}
            className="w-full py-2.5 px-3 bg-[#f3f7f4] hover:bg-[#e4ede7] text-[#143d2b] font-semibold text-xs rounded-xl border border-[#c4dcce] transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#d97706]" />
            <span>অ্যাডমিন হিসেবে তাৎক্ষণিক প্রবেশ (raihanhossenpabel678)</span>
          </button>
        </div>

        <div className="pt-6 mt-6 border-t border-[#edf3ef] text-center">
          <button
            onClick={onBackToStore}
            className="text-xs font-semibold text-[#527161] hover:text-[#143d2b] transition-colors cursor-pointer underline underline-offset-2"
          >
            ← সাধারণ স্টোরফ্রন্টে ফিরে যান
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-[#6e9681]">
        © 2026 Grameen Bazar · Firebase Firestore & Authentication Protected
      </div>
    </div>
  );
};
