import React from 'react';
import { ShieldAlert, Lock, X, Crown, ArrowRight, UserCheck } from 'lucide-react';
import { AmericanAirlinesLogo } from './AmericanAirlinesLogo';
import { SUPER_ADMIN_EMAIL } from '../lib/firebase';

interface BookingRestrictedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const BookingRestrictedModal: React.FC<BookingRestrictedModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#001E42] via-[#002B5B] to-[#C41230] p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 p-2 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <AmericanAirlinesLogo size="sm" variant="dark-bg" />
            <span className="text-xs bg-amber-500/30 text-amber-300 font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-400/40 flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-400" /> Super Admin Authorization Required
            </span>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            Flight Booking Restricted
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Visitor flight bookings are disabled on this system.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-center sm:text-left">
          <div className="flex items-center gap-4 bg-amber-50 dark:bg-amber-950/60 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
              <div className="font-extrabold text-amber-900 dark:text-amber-200 text-sm">
                Super Admin Privilege Only
              </div>
              <p className="leading-relaxed">
                Visitors and standard passengers are restricted from making flight reservations. Flight ticket issuing is strictly reserved for the Super Admin:
              </p>
              <div className="pt-1 font-mono font-bold text-red-600 dark:text-red-400 text-xs break-all">
                {SUPER_ADMIN_EMAIL}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl text-xs space-y-2 text-slate-600 dark:text-slate-400">
            <div className="font-bold text-slate-800 dark:text-slate-200">What visitors can do:</div>
            <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400">
              <li>Search flight routes and compare prices</li>
              <li>Inspect real-time seat maps and cabin layouts</li>
              <li>Look up existing tickets using Ticket # or Passenger Name</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 transition transform active:scale-98"
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>Sign In as Super Admin to Book</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
            >
              Return to Flight Browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
