import React, { useState } from 'react';
import { Booking } from '../types';
import { 
  Mail, 
  CheckCircle2, 
  Send, 
  FileText, 
  Copy, 
  Check, 
  X, 
  RefreshCw, 
  AlertCircle, 
  ExternalLink,
  Share2,
  MessageCircle,
  Twitter,
  Instagram,
  Smartphone,
  Phone,
  Sparkles
} from 'lucide-react';
import { AmericanAirlinesLogo } from './AmericanAirlinesLogo';
import { sendTicketEmail } from '../utils/emailService';
import {
  generateWhatsAppShareUrl,
  generateWhatsAppMessage,
  generateGmailShareUrl,
  generateTwitterShareUrl,
  generateInstagramCaption,
  generateTicketPlaintext,
  generateMailtoUrl,
  shareViaDevice,
  formatFlightDate
} from '../utils/ticketSharing';

export type ShareChannel = 'whatsapp' | 'email' | 'gmail' | 'twitter' | 'instagram' | 'device';

interface EmailTicketModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  defaultChannel?: ShareChannel;
}

export const EmailTicketModal: React.FC<EmailTicketModalProps> = ({ 
  booking, 
  isOpen, 
  onClose,
  defaultChannel = 'whatsapp'
}) => {
  if (!isOpen || !booking) return null;

  const [activeChannel, setActiveChannel] = useState<ShareChannel>(defaultChannel);
  const [targetEmail, setTargetEmail] = useState<string>(booking.autoEmailSentTo || booking.passenger?.email || '');
  const [targetPhone, setTargetPhone] = useState<string>(booking.passenger?.phone || '');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sentSuccess, setSentSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copiedAction, setCopiedAction] = useState<string | null>(null);
  const [showFullPreview, setShowFullPreview] = useState<boolean>(false);

  const handleCopy = (text: string, actionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAction(actionKey);
    setTimeout(() => setCopiedAction(null), 2500);
  };

  const handleSendDirectEmail = async () => {
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
      setSentSuccess(`Official e-Ticket & Boarding Pass dispatched to ${targetEmail}!`);
      if (result.previewUrl) {
        setPreviewUrl(result.previewUrl);
      }
      setTimeout(() => setSentSuccess(null), 6000);
    } else {
      setErrorMessage(result.error || 'Failed to dispatch email. Please check internet connection.');
    }
  };

  const handleOpenWhatsApp = () => {
    const url = generateWhatsAppShareUrl(booking, targetPhone);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenGmail = () => {
    const url = generateGmailShareUrl(booking, targetEmail);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenTwitter = () => {
    const url = generateTwitterShareUrl(booking);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenInstagram = () => {
    // Copy the caption first then open Instagram
    const caption = generateInstagramCaption(booking);
    handleCopy(caption, 'instagram');
    window.open('https://www.instagram.com', '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    const success = await shareViaDevice(booking);
    if (success) {
      setSentSuccess('Ticket shared via device!');
      setTimeout(() => setSentSuccess(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-3.5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#001E42] via-[#0078D2] to-sky-400 text-white flex items-center justify-center font-black shadow-md">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg flex items-center gap-2">
                Share & Dispatch e-Ticket
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Flight {booking.flightNumber} • PNR <strong className="font-mono text-sky-600 dark:text-sky-400">{booking.confirmationCode}</strong>
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

        {/* Flight Ticket Mini Card Banner */}
        <div className="bg-gradient-to-r from-[#001E42] via-[#002D62] to-[#00152E] text-white p-3.5 sm:p-4 rounded-2xl space-y-2 border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-sky-300 truncate max-w-[200px]">
              Passenger: {booking.passenger?.fullName || 'Passenger'}
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0">
              ${booking.pricePaid ?? 0} Paid • Confirmed
            </span>
          </div>
          <div className="flex items-center justify-between font-mono text-sm">
            <span className="font-bold">{booking.origin.code} ➔ {booking.destination.code}</span>
            <span className="text-amber-400 font-black">Seat {booking.seatNumber}</span>
          </div>
          <div className="text-[11px] text-slate-300 flex justify-between font-mono pt-1 border-t border-slate-700/80">
            <span>Ticket: {booking.ticketNumber}</span>
            <span>Gate {booking.gate || '24B'} • Term {booking.terminal || '8'}</span>
          </div>
        </div>

        {/* Channel Selection Tabs */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Choose Destination Channel:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={() => setActiveChannel('whatsapp')}
              className={`p-2 rounded-xl flex flex-col items-center gap-1 text-[11px] font-extrabold transition border ${
                activeChannel === 'whatsapp'
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 border-emerald-500 ring-2 ring-emerald-400/30'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <MessageCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>WhatsApp</span>
            </button>

            {/* Email (Direct) */}
            <button
              type="button"
              onClick={() => setActiveChannel('email')}
              className={`p-2 rounded-xl flex flex-col items-center gap-1 text-[11px] font-extrabold transition border ${
                activeChannel === 'email'
                  ? 'bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-300 border-sky-500 ring-2 ring-sky-400/30'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Mail className="w-5 h-5 text-sky-500 shrink-0" />
              <span>Direct Email</span>
            </button>

            {/* Gmail */}
            <button
              type="button"
              onClick={() => setActiveChannel('gmail')}
              className={`p-2 rounded-xl flex flex-col items-center gap-1 text-[11px] font-extrabold transition border ${
                activeChannel === 'gmail'
                  ? 'bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-300 border-red-500 ring-2 ring-red-400/30'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Mail className="w-5 h-5 text-red-500 shrink-0" />
              <span>Gmail</span>
            </button>

            {/* Twitter / X */}
            <button
              type="button"
              onClick={() => setActiveChannel('twitter')}
              className={`p-2 rounded-xl flex flex-col items-center gap-1 text-[11px] font-extrabold transition border ${
                activeChannel === 'twitter'
                  ? 'bg-slate-900 dark:bg-slate-800 text-white border-slate-600 ring-2 ring-slate-400/30'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Twitter className="w-5 h-5 text-sky-400 shrink-0" />
              <span>Twitter (X)</span>
            </button>

            {/* Instagram */}
            <button
              type="button"
              onClick={() => setActiveChannel('instagram')}
              className={`p-2 rounded-xl flex flex-col items-center gap-1 text-[11px] font-extrabold transition border ${
                activeChannel === 'instagram'
                  ? 'bg-pink-50 dark:bg-pink-950/80 text-pink-600 dark:text-pink-300 border-pink-500 ring-2 ring-pink-400/30'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Instagram className="w-5 h-5 text-pink-500 shrink-0" />
              <span>Instagram</span>
            </button>

            {/* Device Share */}
            <button
              type="button"
              onClick={() => setActiveChannel('device')}
              className={`p-2 rounded-xl flex flex-col items-center gap-1 text-[11px] font-extrabold transition border ${
                activeChannel === 'device'
                  ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border-indigo-500 ring-2 ring-indigo-400/30'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Smartphone className="w-5 h-5 text-indigo-500 shrink-0" />
              <span>Device Share</span>
            </button>
          </div>
        </div>

        {/* CHANNEL 1: WHATSAPP */}
        {activeChannel === 'whatsapp' && (
          <div className="space-y-3.5 animate-in fade-in">
            <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-extrabold text-xs">
                <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Send e-Ticket via WhatsApp</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Dispatch your complete flight itinerary, seat assignment, and confirmation code directly to any WhatsApp contact or chat.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Recipient Phone Number (Optional - include country code):
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000 or leave blank to choose in WhatsApp"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Message Preview Box */}
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
              {generateWhatsAppMessage(booking)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20 active:scale-98"
              >
                <MessageCircle className="w-4 h-4 text-slate-950" />
                <span>Open in WhatsApp ↗</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(generateWhatsAppMessage(booking), 'whatsapp')}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                {copiedAction === 'whatsapp' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAction === 'whatsapp' ? 'Copied WhatsApp Text!' : 'Copy WhatsApp Message'}</span>
              </button>
            </div>
          </div>
        )}

        {/* CHANNEL 2: DIRECT EMAIL (SMTP) */}
        {activeChannel === 'email' && (
          <div className="space-y-3.5 animate-in fade-in">
            <div className="bg-sky-50/80 dark:bg-sky-950/40 p-3.5 rounded-2xl border border-sky-200 dark:border-sky-800/60 space-y-2">
              <div className="flex items-center gap-2 text-sky-800 dark:text-sky-200 font-extrabold text-xs">
                <Mail className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Direct Automated e-Ticket Email Delivery</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Dispatches a formatted HTML electronic ticket receipt with barcode hash and boarding instructions directly to the passenger inbox.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Recipient Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="passenger@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#0078D2]"
                />
              </div>
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
                    <ExternalLink className="w-3 h-3" /> Open Dispatched HTML Email (Live Inbox Preview)
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isSending}
                onClick={handleSendDirectEmail}
                className="w-full bg-[#0078D2] hover:bg-[#0060A9] text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-sky-600/25 active:scale-98"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Dispatching e-Ticket...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Ticket to {targetEmail || 'Email'}
                  </>
                )}
              </button>

              <a
                href={generateMailtoUrl(booking, targetEmail)}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <Mail className="w-4 h-4 text-sky-500" />
                <span>Open Default Mail App</span>
              </a>
            </div>
          </div>
        )}

        {/* CHANNEL 3: GMAIL */}
        {activeChannel === 'gmail' && (
          <div className="space-y-3.5 animate-in fade-in">
            <div className="bg-red-50/80 dark:bg-red-950/40 p-3.5 rounded-2xl border border-red-200 dark:border-red-800/60 space-y-2">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200 font-extrabold text-xs">
                <Mail className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span>Compose in Gmail (One-Click)</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Launches Google Gmail Web Compose with the recipient, subject line, and formatted e-ticket manifest already filled out.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Recipient Email:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="recipient@gmail.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleOpenGmail}
                className="w-full bg-[#EA4335] hover:bg-[#D93025] text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-red-600/20 active:scale-98"
              >
                <Mail className="w-4 h-4 text-white" />
                <span>Open Compose in Gmail ↗</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(generateTicketPlaintext(booking), 'gmail')}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                {copiedAction === 'gmail' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAction === 'gmail' ? 'Copied Itinerary!' : 'Copy Formatted Text'}</span>
              </button>
            </div>
          </div>
        )}

        {/* CHANNEL 4: TWITTER / X */}
        {activeChannel === 'twitter' && (
          <div className="space-y-3.5 animate-in fade-in">
            <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-extrabold text-xs">
                <Twitter className="w-4 h-4 text-sky-400" />
                <span>Share Flight on X (Twitter)</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Share your upcoming flight journey and destination with followers on X (Twitter).
              </p>
            </div>

            {/* Tweet Preview */}
            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tweet Preview:</div>
              <p className="text-xs text-slate-800 dark:text-slate-200 font-sans leading-relaxed">
                ✈️ Just booked my flight on @AmericanAir! Flight {booking.flightNumber} from {booking.origin.city} ({booking.origin.code}) to {booking.destination.city} ({booking.destination.code}). Seat {booking.seatNumber} is locked in! 🛫 #AmericanAirlines #Travel #{booking.destination.code}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleOpenTwitter}
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md active:scale-98 border border-slate-700"
              >
                <Twitter className="w-4 h-4 text-sky-400" />
                <span>Post on X (Twitter) ↗</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(`✈️ Just booked my flight on @AmericanAir! Flight ${booking.flightNumber} from ${booking.origin.city} to ${booking.destination.city}. Seat ${booking.seatNumber}! 🛫 #AmericanAirlines #Travel`, 'twitter')}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                {copiedAction === 'twitter' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAction === 'twitter' ? 'Copied Tweet Text!' : 'Copy Tweet Text'}</span>
              </button>
            </div>
          </div>
        )}

        {/* CHANNEL 5: INSTAGRAM */}
        {activeChannel === 'instagram' && (
          <div className="space-y-3.5 animate-in fade-in">
            <div className="bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-amber-900/30 p-3.5 rounded-2xl border border-pink-500/40 space-y-2">
              <div className="flex items-center gap-2 text-pink-300 font-extrabold text-xs">
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>Instagram Story & DM Ticket Card</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Copy an aesthetic Instagram caption or ticket card to paste into your Instagram Story, Post, or Direct Messages (DM).
              </p>
            </div>

            {/* Instagram Story Aesthetic Snippet */}
            <div className="bg-gradient-to-b from-[#001E42] to-slate-900 p-4 rounded-2xl border border-pink-500/30 text-white space-y-2 text-center shadow-lg">
              <div className="text-[10px] uppercase font-black tracking-widest text-pink-400">INSTAGRAM STORY SNIPPET</div>
              <div className="text-base font-black text-white">✈️ NEXT STOP: {booking.destination.city.toUpperCase()}! 🌍✨</div>
              <div className="text-xs text-sky-300 font-mono">
                {booking.origin.code} ➔ {booking.destination.code} • Seat {booking.seatNumber} ({booking.cabinClass})
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                American Airlines {booking.flightNumber} • Ticket #{booking.ticketNumber}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleOpenInstagram}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-pink-600/20 active:scale-98"
              >
                <Instagram className="w-4 h-4 text-white" />
                <span>Copy Caption & Open Instagram ↗</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(generateInstagramCaption(booking), 'instagram')}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                {copiedAction === 'instagram' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAction === 'instagram' ? 'Copied Instagram Caption!' : 'Copy Caption Only'}</span>
              </button>
            </div>
          </div>
        )}

        {/* CHANNEL 6: DEVICE SHARE / NATIVE */}
        {activeChannel === 'device' && (
          <div className="space-y-3.5 animate-in fade-in">
            <div className="bg-indigo-50/80 dark:bg-indigo-950/40 p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 space-y-2">
              <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200 font-extrabold text-xs">
                <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Native Device Share & Copy</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Share directly via your phone or computer's native system sheet (AirDrop, Telegram, Messages, Messenger, etc.) or copy the raw plaintext ticket.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/25 active:scale-98"
              >
                <Share2 className="w-4 h-4 text-white" />
                <span>Launch System Share Sheet</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(generateTicketPlaintext(booking), 'plaintext')}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                {copiedAction === 'plaintext' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAction === 'plaintext' ? 'Copied Plaintext Receipt!' : 'Copy Plaintext Receipt'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Collapsible Full Ticket Details / Raw Text Toggle */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowFullPreview(!showFullPreview)}
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{showFullPreview ? 'Hide Full Receipt Text' : 'View Full Receipt Text'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleCopy(generateTicketPlaintext(booking), 'receipt')}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
          >
            {copiedAction === 'receipt' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAction === 'receipt' ? 'Copied Receipt!' : 'Copy Ticket Text'}</span>
          </button>
        </div>

        {showFullPreview && (
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs font-mono text-slate-700 dark:text-slate-300 max-h-48 overflow-y-auto animate-in fade-in">
            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between border-b pb-1 dark:border-slate-800">
              <span>AMERICAN AIRLINES OFFICIAL E-TICKET</span>
              <AmericanAirlinesLogo size="sm" variant="light-bg" />
            </div>
            <pre className="whitespace-pre-wrap text-[11px] leading-relaxed">
              {generateTicketPlaintext(booking)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export const ShareTicketModal = EmailTicketModal;
