import React, { useState } from 'react';
import { ShieldCheck, KeyRound, Lock, X, AlertCircle, Building2, CheckCircle2 } from 'lucide-react';
import { AmericanAirlinesLogo } from './AmericanAirlinesLogo';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPasscode = passcode.trim();
    // Valid passcodes: 1926, AA8800, admin, 0000
    if (['1926', 'AA8800', 'ADMIN', 'admin', '0000'].includes(cleanPasscode)) {
      setError('');
      setPasscode('');
      onSuccess();
    } else {
      setError('Invalid Admin Passcode. Access restricted to authorized Front Desk staff.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#001E42] via-[#002D62] to-[#C41230] p-6 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-400/40 flex items-center justify-center text-red-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Front Desk Portal Security</h3>
              <p className="text-xs text-slate-300">Admin Authentication Required</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleVerify} className="p-6 space-y-5">
          <div className="space-y-2 text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
            <p>
              The <strong className="text-slate-900 dark:text-slate-100">Admin & Front Desk Ticket Verification Portal</strong> is protected. Please enter your authorized staff passcode to grant gate passes and manage passenger manifests.
            </p>
          </div>

          {/* Keycard Hint */}
          <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/80 p-3.5 rounded-2xl flex items-start gap-3">
            <KeyRound className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200">
              <span className="font-extrabold block">Authorized Administrator Access PIN:</span>
              <span className="font-mono font-black text-red-700 dark:text-red-400 text-sm">1926</span> or <span className="font-mono font-black text-red-700 dark:text-red-400 text-sm">AA8800</span>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 p-3 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-bold animate-pulse">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Enter Admin Security Passcode / PIN
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError('');
                }}
                placeholder="Enter passcode (e.g. 1926)"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-slate-100 focus:border-[#C41230] focus:ring-2 focus:ring-red-100 outline-none transition font-mono tracking-widest"
                autoFocus
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200"
            >
              Cancel (Stay as Passenger)
            </button>
            <button
              type="submit"
              className="bg-[#C41230] hover:bg-[#A00E26] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-red-900/30 flex items-center gap-2 transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Unlock Admin Portal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
