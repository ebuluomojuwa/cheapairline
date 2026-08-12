import React, { useState } from 'react';
import { Booking } from '../types';
import { Mail, CheckCircle2, Send, FileText, Copy, Check, X, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { AmericanAirlinesLogo } from './AmericanAirlinesLogo';
import { sendTicketEmail } from '../utils/emailService';

interface EmailTicketModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EmailTicketModal: React.FC<EmailTicketModalProps> = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null;

  const [targetEmail, setTargetEmail] = useState<string>(booking.autoEmailSentTo || booking.passenger.email || '');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sentSuccess, setSentSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const handleSendEmail = async () => {
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSending(true);
    setErrorMessage(null);
    setSentSuccess(null);

    const result = await sendTicketEmail(booking, targetEmail);
    setIsSending(false);

    if (result.success) {
      setSentSuccess(`Official e-Ticket & Boarding Pass sent to ${targetEmail}!`);
      if (result.previewUrl) {
        setPreviewUrl(result.previewUrl);
      }
      setTimeout(() => setSentSuccess(null), 6000);
    } else {
      setErrorMessage(result.error || 'Failed to dispatch email. Please check internet connection.');
    }
  };

  const handleCopyText = () => {
    const text = `
AMERICAN AIRLINES ELECTRONIC TICKET RECEIPT
Passenger: ${booking.passenger.fullName} (${booking.passenger.email})
Flight: ${booking.flightNumber} (${booking.origin.code} -> ${booking.destination.code})
Seat: ${booking.seatNumber} (${booking.cabinClass})
Ticket Number: ${booking.ticketNumber} | PNR: ${booking.confirmationCode}
Departure: ${new Date(booking.departureTime).toLocaleString()}
Terminal/Gate: Terminal ${booking.terminal}, Gate ${booking.gate}
Total Paid: $${booking.pricePaid} (${booking.paymentMethod})
Status: CONFIRMED & TICKETED
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0078D2] text-white flex items-center justify-center font-black shadow-md">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                Send e-Ticket to Email
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Flight {booking.flightNumber} • PNR {booking.confirmationCode}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Flight Ticket Summary Header */}
        <div className="bg-gradient-to-r from-[#001E42] via-[#002D62] to-[#00152E] text-white p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-sky-300">Passenger: {booking.passenger.fullName}</span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[10px] px-2 py-0.5 rounded-md font-bold">
              ${booking.pricePaid} Paid
            </span>
          </div>
          <div className="flex items-center justify-between font-mono text-sm">
            <span>{booking.origin.code} ➔ {booking.destination.code}</span>
            <span className="text-amber-400 font-bold">Seat {booking.seatNumber}</span>
          </div>
          <div className="text-[11px] text-slate-300 flex justify-between font-mono pt-1 border-t border-slate-700/80">
            <span>Ticket: {booking.ticketNumber}</span>
            <span>Gate {booking.gate}</span>
          </div>
        </div>

        {/* Destination Email Input Section */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-800 dark:text-slate-200 block">
            Recipient Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              placeholder="passenger@example.com"
              className="w-full pl-10 pr-3 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#0078D2]"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            The e-Ticket receipt and boarding pass details will be formatted and sent to this email address.
          </p>
        </div>

        {sentSuccess && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold p-3 rounded-2xl space-y-1.5 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{sentSuccess}</span>
            </div>
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-black text-sky-600 dark:text-sky-400 hover:underline pt-1"
              >
                <ExternalLink className="w-3 h-3" /> View Dispatched Email Receipt (SMTP Inbox Preview)
              </a>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 text-xs font-bold p-3 rounded-2xl flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Primary Dispatch Action Button */}
        <button
          type="button"
          disabled={isSending}
          onClick={handleSendEmail}
          className="w-full bg-[#0078D2] hover:bg-[#0060A9] text-white font-extrabold py-3.5 px-4 rounded-2xl text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-sky-600/25 active:scale-98"
        >
          {isSending ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Dispatching e-Ticket...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> Send Ticket to {targetEmail || 'Email'} Now
            </>
          )}
        </button>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleCopyText}
            className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Receipt!' : 'Copy Ticket Text'}
          </button>

          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
          >
            <FileText className="w-3.5 h-3.5" />
            {showPreview ? 'Hide Email Preview' : 'Preview Email'}
          </button>
        </div>

        {/* Collapsible Email Body Preview */}
        {showPreview && (
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs font-mono text-slate-700 dark:text-slate-300 max-h-48 overflow-y-auto animate-in fade-in">
            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between border-b pb-1 dark:border-slate-800">
              <span>AMERICAN AIRLINES E-TICKET PREVIEW</span>
              <AmericanAirlinesLogo size="sm" variant="light-bg" />
            </div>
            <p><strong>To:</strong> {targetEmail}</p>
            <p><strong>Subject:</strong> American Airlines e-Ticket Receipt: {booking.flightNumber} ({booking.confirmationCode})</p>
            <div className="pt-2 text-[11px] leading-relaxed whitespace-pre-wrap border-t border-slate-200 dark:border-slate-800">
{`Dear ${booking.passenger.fullName},

Your flight ticket is confirmed.
Ticket Number: ${booking.ticketNumber}
PNR: ${booking.confirmationCode}
Flight: ${booking.flightNumber} (${booking.origin.code} -> ${booking.destination.code})
Seat: ${booking.seatNumber} (${booking.cabinClass})
Departure: ${new Date(booking.departureTime).toLocaleString()}
Total Fare Paid: $${booking.pricePaid}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
