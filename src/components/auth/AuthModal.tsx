import React, { useState } from 'react';
import { X, User, Shield, Check, LogOut, Phone, MapPin, Globe } from 'lucide-react';
import { authService } from '../../services/authService';
import { UserProfile } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminSwitch?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAdminSwitch }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authService.getUser());
  const [name, setName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const updated = authService.loginAsCustomer(name.trim(), phone.trim());
    updated.address = address.trim();
    setCurrentUser(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setAuthError(null);
    try {
      const user = await authService.signInWithGoogle();
      setCurrentUser(user);
      if (user.role === 'admin' && onAdminSwitch) {
        onAdminSwitch();
      }
      onClose();
    } catch (err: any) {
      console.warn('Google sign in error:', err);
      setAuthError('গুগল সাইন-ইন সম্পন্ন করা যায়নি। ডেমো বা ফোন নাম্বার দিয়ে চালিয়ে যান।');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAdminLogin = () => {
    const adminUser = authService.loginAsAdmin();
    setCurrentUser(adminUser);
    if (onAdminSwitch) {
      onAdminSwitch();
    }
    onClose();
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#d2ded5] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#edf3ef] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#143d2b]" />
            <h3 className="text-base font-bold text-[#143d2b] font-display">
              আমার একাউন্ট ও ডেলিভারি প্রোফাইল
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#f1f6f3] rounded-md cursor-pointer">
            <X className="w-5 h-5 text-[#557564]" />
          </button>
        </div>

        {authError && (
          <div className="mb-3 p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {authError}
          </div>
        )}

        {currentUser ? (
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="p-3 bg-[#f8faf8] rounded-xl border border-[#dcebe1] flex items-center justify-between">
              <div>
                <p className="font-bold text-[#143d2b] text-sm">{currentUser.displayName}</p>
                <p className="text-[#688a78]">{currentUser.email || currentUser.phone}</p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-sm font-bold text-[10px] ${
                  currentUser.role === 'admin'
                    ? 'bg-[#143d2b] text-[#e5b358]'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {currentUser.role === 'admin' ? 'এডমিন' : 'গ্রাহক'}
              </span>
            </div>

            {/* Profile fields */}
            <div>
              <label className="block font-semibold text-[#143d2b] mb-1">পূর্ণ নাম</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-[#cfded4] rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#143d2b] mb-1">মোবাইল নম্বর</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#739282]" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-[#cfded4] rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#143d2b] mb-1">ডিফল্ট ডেলিভারি ঠিকানা</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#739282]" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="বাসা নং, রোড, এলাকা..."
                  className="w-full pl-8 pr-3 py-2 border border-[#cfded4] rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-[#143d2b] hover:bg-[#1a4e37] text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-[#e5b358]" />
                    <span>সংরক্ষিত হয়েছে!</span>
                  </>
                ) : (
                  <span>প্রোফাইল আপডেট করুন</span>
                )}
              </button>

              {/* Real Firebase Google Sign-in */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-2.5 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-lg border border-gray-300 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
              >
                <Globe className="w-4 h-4 text-emerald-700" />
                <span>
                  {isGoogleLoading ? 'সাইন-ইন হচ্ছে...' : 'Firebase Google একাউন্ট দিয়ে লগইন'}
                </span>
              </button>

              {/* Admin toggle for testing convenience */}
              <button
                type="button"
                onClick={handleAdminLogin}
                className="w-full py-2 bg-[#f4f8f5] hover:bg-[#e6efe9] text-[#143d2b] font-semibold rounded-lg border border-[#c4dcce] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-[#d97706]" />
                <span>অ্যাডমিন মোডে প্রবেশ করুন (/admin)</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-1.5 text-gray-500 hover:text-red-600 transition-colors cursor-pointer flex items-center justify-center gap-1 text-[11px]"
              >
                <LogOut className="w-3 h-3" />
                <span>সাইন আউট করুন</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            <p className="text-[#557564]">
              দ্রুত অর্ডার সম্পন্ন ও ট্র্যাক করতে আপনার নাম ও ফোন নম্বর অথবা গুগল দিয়ে সাইন ইন করুন:
            </p>

            <button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full py-2.5 bg-white hover:bg-gray-50 text-gray-800 font-bold rounded-lg border border-gray-300 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
            >
              <Globe className="w-4 h-4 text-emerald-700" />
              <span>Firebase Google দিয়ে লগইন</span>
            </button>

            <div className="flex items-center gap-2 my-2 text-gray-400">
              <div className="flex-1 h-px bg-gray-200" />
              <span>অথবা ফোন দিয়ে</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <input
              type="text"
              placeholder="আপনার নাম"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-[#cfded4] rounded-lg"
            />
            <input
              type="text"
              placeholder="মোবাইল নম্বর (017...)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border border-[#cfded4] rounded-lg"
            />
            <button
              onClick={() => {
                if (name.trim()) {
                  const user = authService.loginAsCustomer(name.trim(), phone.trim());
                  setCurrentUser(user);
                  onClose();
                }
              }}
              className="w-full py-2.5 bg-[#143d2b] text-white font-bold rounded-lg cursor-pointer hover:bg-[#1a4e37]"
            >
              সাইন ইন করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
