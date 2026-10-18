import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowLeft, AlertCircle, CheckCircle2, Sparkles, Key } from 'lucide-react';
import { authService } from '../../services/authService';
import { GrameenBazarLogo } from '../brand/GrameenBazarLogo';

interface AdminLoginGateProps {
  onBackToStore: () => void;
  onSuccess: () => void;
}

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({ onBackToStore, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const adminEmail = authService.getAdminEmail();
  const currentFbUser = authService.getFirebaseUser();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await authService.signInWithGoogle();
      if (user.role === 'admin' || user.email?.toLowerCase() === adminEmail.toLowerCase()) {
        onSuccess();
      } else {
        setErrorMessage(
          `অ্যাক্সেস অস্বীকৃত: "${user.email}" অ্যাকাউন্টটিতে অ্যাডমিন পারমিশন নেই। অনুগ্রহ করে অনুমোদিত অ্যাডমিন অ্যাকাউন্ট (${adminEmail}) দিয়ে সাইন-ইন করুন।`
        );
      }
    } catch (err: any) {
      console.error('Admin Google sign in error:', err);
      if (err.code === 'auth/popup-blocked') {
        setErrorMessage('ব্রাউজার পপআপ ব্লক করেছে। অনুগ্রহ করে ব্রাউজার এড্রেস বার থেকে পপআপ এলাও করুন।');
      } else {
        setErrorMessage(err.message || 'গুগল সাইন-ইন সম্পন্ন করা যায়নি। পুনরায় চেষ্টা করুন।');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAdminLogin = () => {
    authService.loginAsAdmin();
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-[#F3F6F4] flex flex-col items-center justify-center p-4 sm:p-6 text-[#143D2B]">
      {/* Top Back Button */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center">
        <button
          onClick={onBackToStore}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#486B58] hover:text-[#143D2B] bg-white px-3 py-1.5 rounded-lg border border-[#DCEBE1] shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>দোকানে ফিরে যান (Storefront)</span>
        </button>

        <span className="text-[11px] font-semibold text-[#7E9F8E] flex items-center gap-1">
          <Lock className="w-3.5 h-3.5 text-[#E5B358]" />
          <span>রুট: /#admin</span>
        </span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#DCEBE1] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Card Header */}
        <div className="bg-[#143D2B] text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
          
          <div className="flex justify-center mb-3">
            <div className="bg-white p-2 rounded-xl shadow-md">
              <GrameenBazarLogo variant="full" size="md" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-[#E5B358] mb-2 border border-white/10">
            <ShieldCheck className="w-4 h-4" />
            <span>সুরক্ষিত অ্যাডমিন কন্ট্রোল রুম</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold font-display">
            অ্যাডমিন ভেরিফিকেশন ও প্রবেশ
          </h2>
          <p className="text-xs text-[#C2DFCE] mt-1.5 leading-relaxed">
            ফায়ারস্টোর ক্লাউড ডাটাবেজ ও সিকিউরিটি রুলস দ্বারা সুরক্ষিত সিস্টেম। শুধুমাত্র অনুমোদিত অ্যাডমিন ক্যাটালগ ও অর্ডার ম্যানেজ করতে পারবেন।
          </p>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Authorization Notice Box */}
          <div className="p-3.5 bg-[#F8FAF8] rounded-xl border border-[#DCEBE1] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#143D2B] flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#E5B358]" />
                অনুমোদিত সুপার অ্যাডমিন:
              </span>
              <span className="bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                Verified RBAC
              </span>
            </div>
            <p className="font-mono text-[11px] text-[#2C6246] bg-white p-2 rounded border border-[#E1EDE5] break-all select-all font-semibold">
              {adminEmail}
            </p>
            <p className="text-[11px] text-[#6A8B7A] leading-normal">
              ফায়ারস্টোর সিকিউরিটি রুলসে এই ইমেইল আইডিকে সরাসরি অ্যাডমিন প্রিভিলেজ দেওয়া হয়েছে।
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <span>{errorMessage}</span>
                {currentFbUser && (
                  <button
                    onClick={async () => {
                      await authService.logout();
                      setErrorMessage(null);
                    }}
                    className="block text-[11px] font-bold text-red-800 underline mt-1 cursor-pointer"
                  >
                    বর্তমান সেশন লগআউট করুন এবং অন্য অ্যাকাউন্ট দিয়ে চেষ্টা করুন
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Primary Action: Google Auth */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-[#143D2B] hover:bg-[#1A4E37] text-white p-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>যাচাইকরণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.4 7.5 23 12 23z"
                    />
                  </svg>
                  <span>Google দিয়ে অ্যাডমিন সাইন-ইন করুন</span>
                </>
              )}
            </button>

            {/* Sandbox / Local Demo Mode */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#E1EDE5]" />
              <span className="flex-shrink mx-3 text-[10px] text-[#7E9F8E] uppercase tracking-wider font-semibold">
                অথবা টেস্ট মোড
              </span>
              <div className="flex-grow border-t border-[#E1EDE5]" />
            </div>

            <button
              onClick={handleDemoAdminLogin}
              className="w-full bg-[#F3F7F4] hover:bg-[#E8F0EA] text-[#143D2B] p-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-[#CFDED4] transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E5B358]" />
              <span>লোকাল ডেমো অ্যাডমিন টেস্ট মোড (Preview)</span>
            </button>
          </div>

          {/* Security Guarantee Note */}
          <div className="pt-2 border-t border-[#EDF3EF] flex items-center justify-center gap-2 text-[11px] text-[#6A8B7A]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>ফায়ারস্টোর নিরাপত্তা রুলস সক্রিয় · Zero-Trust RBAC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
