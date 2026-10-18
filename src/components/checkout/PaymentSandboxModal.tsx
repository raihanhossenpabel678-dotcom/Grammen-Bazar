import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft, CheckCircle2, XCircle, AlertCircle, Lock, Smartphone, CreditCard, Building } from 'lucide-react';
import { GrameenBazarLogo } from '../brand/GrameenBazarLogo';

interface PaymentSandboxModalProps {
  orderId: string;
  tranId: string;
  amount: number;
  customerName: string;
  token?: string;
  onClose: () => void;
}

export const PaymentSandboxModal: React.FC<PaymentSandboxModalProps> = ({
  orderId,
  tranId,
  amount,
  customerName,
  token,
  onClose,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<'bkash' | 'nagad' | 'rocket' | 'card'>('bkash');
  const [accountNumber, setAccountNumber] = useState('01712345678');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSimulatePayment = async (status: 'success' | 'fail' | 'cancel') => {
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `/api/payment/sslcommerz/callback?orderId=${encodeURIComponent(orderId)}&tranId=${encodeURIComponent(tranId)}&status=${status}`;

      const addField = (name: string, val: string) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = val;
        form.appendChild(input);
      };

      addField('value_a', orderId);
      addField('value_b', token || '');
      addField('value_c', tranId);
      addField('tran_id', tranId);
      addField('val_id', `SANDBOX-${Date.now()}`);
      addField('bank_tran_id', `TXN${Math.floor(10000000 + Math.random() * 90000000)}`);
      addField('status', status === 'success' ? 'VALID' : 'FAILED');
      addField('currency', 'BDT');
      addField('amount', String(amount));

      let cardName = 'bKash-PaymentGateway';
      if (selectedChannel === 'nagad') cardName = 'Nagad-PaymentGateway';
      if (selectedChannel === 'rocket') cardName = 'Rocket-PaymentGateway';
      if (selectedChannel === 'card') cardName = 'VISA-DebitCard';
      addField('card_type', cardName);

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error('Simulation submission error:', err);
      setIsProcessing(false);
      setErrorMsg('পেমেন্ট সার্ভারে সংযোগ ব্যর্থ হয়েছে।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-[#d2ded5] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Gateway Header */}
        <div className="bg-[#143d2b] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg border border-white/20">
              <ShieldCheck className="w-6 h-6 text-[#e5b358]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-wide font-display">
                  SSLCommerz Sandbox Gateway
                </span>
                <span className="text-[10px] bg-amber-400 text-[#143d2b] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Testbox
                </span>
              </div>
              <p className="text-xs text-[#bad0c3] mt-0.5">
                নিরাপদ পেমেন্ট গেটওয়ে সিমুলেশন · গ্রামীণ বাজার
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-xs flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ফিরে যান</span>
          </button>
        </div>

        {/* Invoice Summary Strip */}
        <div className="bg-[#f5f8f5] px-5 py-3 border-b border-[#e5ebe7] flex items-center justify-between text-xs">
          <div>
            <span className="text-[#628170]">গ্রাহক:</span>{' '}
            <span className="font-bold text-[#143d2b]">{customerName}</span>
            <span className="mx-2 text-[#9ab3a5]">|</span>
            <span className="text-[#628170]">ট্রানজেকশন ID:</span>{' '}
            <span className="font-mono text-[#143d2b] font-semibold">{tranId}</span>
          </div>
          <div className="text-right">
            <span className="text-[#628170] block text-[11px]">প্রদেয় মোট:</span>
            <span className="text-base font-extrabold text-[#143d2b] tabular-nums">
              ৳{amount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Channel Selection */}
        <div className="p-5 sm:p-6 space-y-5">
          <div>
            <p className="text-xs font-bold text-[#143d2b] mb-2.5">
              পেমেন্ট মাধ্যম বেছে নিন (Select Payment Channel):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedChannel('bkash')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedChannel === 'bkash'
                    ? 'border-[#e2136e] bg-[#fdf2f7] ring-2 ring-[#e2136e]/30'
                    : 'border-[#dbe6df] bg-white hover:bg-[#fafbfa]'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#e2136e] text-white flex items-center justify-center mx-auto mb-1.5 font-bold text-xs shadow-xs">
                  bK
                </div>
                <span className="text-xs font-bold text-[#143d2b] block">বিকাশ (bKash)</span>
                <span className="text-[10px] text-[#6b8b7a]">মোবাইল ব্যাংকিং</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannel('nagad')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedChannel === 'nagad'
                    ? 'border-[#f7941d] bg-[#fef7ee] ring-2 ring-[#f7941d]/30'
                    : 'border-[#dbe6df] bg-white hover:bg-[#fafbfa]'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#f7941d] text-white flex items-center justify-center mx-auto mb-1.5 font-bold text-xs shadow-xs">
                  না
                </div>
                <span className="text-xs font-bold text-[#143d2b] block">নগদ (Nagad)</span>
                <span className="text-[10px] text-[#6b8b7a]">মোবাইল ব্যাংকিং</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannel('rocket')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedChannel === 'rocket'
                    ? 'border-[#8c3494] bg-[#fbf2fc] ring-2 ring-[#8c3494]/30'
                    : 'border-[#dbe6df] bg-white hover:bg-[#fafbfa]'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#8c3494] text-white flex items-center justify-center mx-auto mb-1.5 font-bold text-xs shadow-xs">
                  DB
                </div>
                <span className="text-xs font-bold text-[#143d2b] block">রকেট (Rocket)</span>
                <span className="text-[10px] text-[#6b8b7a]">ডাচ-বাংলা</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedChannel('card')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedChannel === 'card'
                    ? 'border-[#1a1f71] bg-[#f2f4fc] ring-2 ring-[#1a1f71]/30'
                    : 'border-[#dbe6df] bg-white hover:bg-[#fafbfa]'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#1a1f71] text-white flex items-center justify-center mx-auto mb-1.5 font-bold text-xs shadow-xs">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#143d2b] block">কার্ড (Card)</span>
                <span className="text-[10px] text-[#6b8b7a]">Visa/Master</span>
              </button>
            </div>
          </div>

          {/* Test Account Input */}
          <div className="bg-[#f8faf8] border border-[#dce6df] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#143d2b]">
                {selectedChannel === 'card' ? 'কার্ড নম্বর (স্যান্ডবক্স টেস্ট):' : 'মোবাইল ওয়ালেট নম্বর (টেস্ট):'}
              </span>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold">
                Auto-filled Test Data
              </span>
            </div>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm font-mono rounded-lg border border-[#cfded4] bg-white focus:outline-none focus:ring-1 focus:ring-[#143d2b] tabular-nums"
              placeholder="017XXXXXXXX"
            />
            <p className="text-[11px] text-[#628170]">
              💡 এটি SSLCommerz স্যান্ডবক্স টেস্ট মোড। কোনও আসল টাকা কাটা হবে না। সার্ভার-সাইড ভ্যালিডেশন স্বয়ংক্রিয়ভাবে যাচাই করা হবে।
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleSimulatePayment('success')}
              className="w-full py-3.5 px-4 bg-[#143d2b] hover:bg-[#1a4e37] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-70"
            >
              <CheckCircle2 className="w-5 h-5 text-[#e5b358]" />
              <span>
                {isProcessing
                  ? 'সার্ভারে পেমেন্ট ভেরিফাই করা হচ্ছে...'
                  : `পেমেন্ট সম্পন্ন করুন (৳${amount.toLocaleString()})`}
              </span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleSimulatePayment('cancel')}
              className="w-full py-2.5 px-4 bg-white hover:bg-red-50 text-red-600 font-semibold text-xs rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70"
            >
              <XCircle className="w-4 h-4" />
              <span>পেমেন্ট বাতিল করুন (Cancel Transaction)</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-[#6f8d7e]">
            <Lock className="w-3 h-3" />
            <span>256-bit TLS SSLCommerz End-to-End Server-Side Verification Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
