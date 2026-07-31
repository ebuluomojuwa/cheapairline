import React, { useState, useMemo } from 'react';
import { Booking, Flight } from '../types';
import { 
  Search, 
  Armchair, 
  Ticket, 
  User, 
  Mail, 
  Phone, 
  Globe2, 
  Calendar, 
  ShieldCheck, 
  Plane, 
  Clock, 
  Utensils, 
  Luggage, 
  CreditCard, 
  Sparkles,
  Printer,
  XCircle,
  AlertCircle,
  Award,
  CheckCircle2,
  Building2,
  BadgeCheck,
  UserCheck
} from 'lucide-react';
import { AmericanAirlinesLogo } from './AmericanAirlinesLogo';
import confetti from 'canvas-confetti';

interface PassengerLookupProps {
  bookings: Booking[];
  flights: Flight[];
  userRole?: 'passenger' | 'admin' | 'superadmin';
  onViewBoardingPass: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
  onApproveGatePass?: (bookingId: string) => void;
  initialQuery?: string;
}

export const PassengerLookup: React.FC<PassengerLookupProps> = ({
  bookings,
  flights,
  userRole = 'passenger',
  onViewBoardingPass,
  onCancelBooking,
  onApproveGatePass,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedFlightFilter, setSelectedFlightFilter] = useState<string>('all');
  const [justApprovedId, setJustApprovedId] = useState<string | null>(null);

  const isAdmin = userRole === 'admin' || userRole === 'superadmin';

  // Filter logic: search by seat number, ticket number, confirmation code, or passenger name
  const matchedBookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Non-admins must enter a search query (ticket number or passenger name) to retrieve tickets
    if (!q) {
      return isAdmin ? bookings : [];
    }

    return bookings.filter((b) => {
      const matchFlight = selectedFlightFilter === 'all' || b.flightId === selectedFlightFilter || b.flightNumber.toLowerCase().includes(selectedFlightFilter.toLowerCase());
      if (!matchFlight) return false;

      const seat = b.seatNumber.toLowerCase();
      const ticket = b.ticketNumber.toLowerCase();
      const confirm = b.confirmationCode.toLowerCase();
      const name = b.passenger.fullName.toLowerCase();
      const email = b.passenger.email.toLowerCase();
      const passport = b.passenger.passportNumber.toLowerCase();
      const flightNum = b.flightNumber.toLowerCase();

      return (
        seat === q ||
        seat.endsWith(q) ||
        ticket.includes(q) ||
        confirm.includes(q) ||
        name.includes(q) ||
        email.includes(q) ||
        passport.includes(q) ||
        flightNum.includes(q)
      );
    });
  }, [query, bookings, selectedFlightFilter, isAdmin]);

  const handleQuickSample = (sampleText: string) => {
    setQuery(sampleText);
  };

  const handleGrantPass = (booking: Booking) => {
    if (onApproveGatePass) {
      onApproveGatePass(booking.id);
    }
    setJustApprovedId(booking.id);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    // Open boarding pass view after approval
    setTimeout(() => {
      onViewBoardingPass(booking);
    }, 400);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner: Front Desk Admin vs General Lookup */}
      <div className={`relative overflow-hidden rounded-3xl border p-8 shadow-2xl text-white ${
        userRole === 'admin' 
          ? 'bg-gradient-to-r from-[#001E42] via-[#002B5B] to-[#C41230]/90 border-red-500/40' 
          : 'bg-gradient-to-r from-[#001E42] via-[#002D62] to-[#00152E] border-slate-700/80'
      }`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0078D2]/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 text-sky-300 border border-slate-600/80 text-xs font-bold shadow-md">
            <AmericanAirlinesLogo size="sm" variant="dark-bg" />
            <span className="text-slate-400">|</span>
            {userRole === 'admin' ? (
              <span className="flex items-center gap-1.5 text-red-400 font-black tracking-wide uppercase">
                <Building2 className="w-4 h-4 text-red-500" /> Front Desk & Gate Agent Verification Terminal
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-400 font-extrabold">
                <Award className="w-3.5 h-3.5" /> Instant Flight Ticket & Seat Lookup
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {userRole === 'admin' 
              ? 'Front Desk Flight Ticket Check & Gate Clearance' 
              : 'Lookup Flight Ticket & Passenger Details'}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {userRole === 'admin' 
              ? 'Enter a passenger flight ticket number (e.g. 001-9482-7710), seat number, or passenger name. Review ticket records, passenger manifests, and issue official gate boarding clearance passes.'
              : 'Input your ticket number (e.g. 001-9482-7710) or assigned seat number (01A, 02B) to retrieve complete booking details and boarding clearance passes.'}
          </p>

          {/* Quick Test Chips */}
          <div className="pt-2">
            <p className="text-xs text-slate-300 font-bold mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Click to test flight ticket numbers:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleQuickSample('001-9482-7710')}
                className="bg-[#C41230] hover:bg-red-700 text-white text-xs font-mono px-3 py-1.5 rounded-lg border border-red-400/40 transition flex items-center gap-1.5 shadow-sm font-bold ring-2 ring-red-500/30"
              >
                <Ticket className="w-3.5 h-3.5 text-white" /> Ticket 001-9482-7710 (Elizabeth Gutierrez)
              </button>
              <button
                onClick={() => handleQuickSample('Elizabeth Gutierrez')}
                className="bg-slate-800/90 hover:bg-slate-700 text-slate-100 text-xs px-3 py-1.5 rounded-lg border border-slate-600 transition flex items-center gap-1.5 shadow-sm font-bold"
              >
                <User className="w-3.5 h-3.5 text-sky-400" /> Elizabeth Gutierrez
              </button>
              <button
                onClick={() => handleQuickSample('02B')}
                className="bg-[#0078D2]/80 hover:bg-[#0078D2] text-white text-xs font-mono px-3 py-1.5 rounded-lg border border-sky-400/30 transition flex items-center gap-1.5 shadow-sm font-bold"
              >
                <Armchair className="w-3.5 h-3.5 text-amber-300" /> Seat 02B
              </button>
              <button
                onClick={() => handleQuickSample('01A')}
                className="bg-[#0078D2]/80 hover:bg-[#0078D2] text-white text-xs font-mono px-3 py-1.5 rounded-lg border border-sky-400/30 transition flex items-center gap-1.5 shadow-sm font-bold"
              >
                <Armchair className="w-3.5 h-3.5 text-amber-300" /> Seat 01A
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Input Flight Ticket Number (e.g. 001-9482-7710), Seat (02B), or Name..."
              className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#C41230] focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/40 outline-none transition text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 font-bold placeholder-slate-400 dark:placeholder-slate-500 text-sm sm:text-base shadow-inner"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 p-1 rounded-full"
              >
                ✕
              </button>
            )}
          </div>

          <div className="w-full md:w-64">
            <select
              value={selectedFlightFilter}
              onChange={(e) => setSelectedFlightFilter(e.target.value)}
              className="w-full py-3.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0078D2] focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/40 outline-none text-slate-700 dark:text-slate-200 font-bold text-sm bg-white dark:bg-slate-800"
            >
              <option value="all">✈️ All AA Flight Manifests</option>
              {flights.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.flightNumber} ({f.origin.code} ➔ {f.destination.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Showing {matchedBookings.length} matching booking record(s)</span>
          {query && (
            <span className="font-mono text-[#C41230] dark:text-red-400 font-extrabold bg-red-50 dark:bg-red-950/60 px-2.5 py-0.5 rounded border border-red-200 dark:border-red-900/60">
              Filter: "{query}"
            </span>
          )}
        </div>
      </div>

      {/* Results List */}
      {matchedBookings.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-sky-100 dark:bg-sky-950 rounded-full flex items-center justify-center mx-auto text-[#0078D2] dark:text-sky-400">
            {!query ? <Ticket className="w-8 h-8" /> : <AlertCircle className="w-8 h-8 text-amber-500" />}
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
              {!query ? 'Search Your Flight Ticket' : 'No Booking Ticket Record Found'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
              {!query ? (
                <span>
                  Please enter your <strong>Ticket Number</strong> (e.g. <span className="font-mono font-extrabold text-red-600 dark:text-red-400">001-9482-7710</span>) or <strong>Passenger Name</strong> (e.g. Elizabeth Gutierrez) in the search box above to view your ticket.
                </span>
              ) : (
                <span>
                  We couldn't find any ticket matching "{query}". Please verify your ticket number or passenger name and try again.
                </span>
              )}
            </p>
          </div>
          {!query && (
            <div className="pt-2 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setQuery('001-9482-7710')}
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#0078D2] hover:bg-[#0060A9] px-4 py-2 rounded-xl transition shadow-sm"
              >
                <Ticket className="w-4 h-4 text-white" /> Try Sample Ticket: 001-9482-7710
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {matchedBookings.map((booking) => {
            const isApproved = booking.gatePassApproved || booking.status === 'Checked In' || booking.status === 'Boarded';

            return (
              <div
                key={booking.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden transition-all hover:shadow-xl"
              >
                {/* Card Header: Flight & Verification Status */}
                <div className="bg-gradient-to-r from-[#001E42] via-[#002D62] to-[#00152E] p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center font-black text-sky-300 text-lg">
                      {booking.flightNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold tracking-wide">{booking.airline}</h2>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 font-mono text-slate-300">
                          {booking.aircraft}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 flex items-center gap-2 mt-1">
                        <span>{booking.origin.city} ({booking.origin.code})</span>
                        <Plane className="w-3.5 h-3.5 text-red-400 transform rotate-90" />
                        <span>{booking.destination.city} ({booking.destination.code})</span>
                      </p>
                    </div>
                  </div>

                  {/* Seat & Ticket Highlight Box */}
                  <div className="flex items-center gap-3 bg-[#00152E] p-3.5 rounded-xl border border-slate-700/80 shadow-inner">
                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-medium">Assigned Seat</div>
                      <div className="text-2xl font-black font-mono text-amber-400 flex items-center justify-end gap-1">
                        <Armchair className="w-5 h-5 text-amber-400" />
                        {booking.seatNumber}
                      </div>
                    </div>
                    <div className="h-8 w-px bg-slate-700" />
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Ticket #</div>
                      <div className="text-sm font-mono font-bold text-sky-300">{booking.ticketNumber}</div>
                      <div className="text-[10px] text-slate-400 font-mono">PNR: {booking.confirmationCode}</div>
                    </div>
                  </div>
                </div>

                {/* Main Content: Passenger Profile & Flight Manifest */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Column 1: Passenger Personal Identity */}
                  <div className="space-y-4 lg:col-span-1 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 pb-6 lg:pb-0 lg:pr-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <User className="w-4 h-4 text-[#0078D2]" /> Passenger Profile
                      </h3>
                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                        isApproved
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      }`}>
                        {isApproved ? 'Gate Pass Issued' : booking.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-slate-400 block font-medium">Full Legal Name</label>
                        <div className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          {booking.passenger.fullName}
                          <BadgeCheck className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-xs text-slate-400 block font-medium">Gender / DOB</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {booking.passenger.gender}, {booking.passenger.dateOfBirth}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block font-medium">Nationality</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                            <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                            {booking.passenger.nationality}
                          </span>
                        </div>
                      </div>

                      <div className="text-sm space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate font-mono text-xs">{booking.passenger.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="font-mono text-xs">{booking.passenger.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="text-xs font-mono font-bold">Passport: {booking.passenger.passportNumber}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Flight Schedule & Gate Details */}
                  <div className="space-y-4 lg:col-span-1 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 pb-6 lg:pb-0 lg:pr-6">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Plane className="w-4 h-4 text-[#0078D2]" /> Flight Schedule & Gate
                    </h3>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                        <div>
                          <span className="text-[11px] text-slate-400 font-bold uppercase block">Departure</span>
                          <div className="text-lg font-black text-slate-800 dark:text-slate-100">{booking.origin.code}</div>
                          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">{booking.origin.city}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {new Date(booking.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] text-slate-400 font-bold uppercase block">Arrival</span>
                          <div className="text-lg font-black text-slate-800 dark:text-slate-100">{booking.destination.code}</div>
                          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">{booking.destination.city}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {new Date(booking.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400 block font-bold">Terminal & Gate</span>
                          <span className="font-extrabold text-red-600 dark:text-red-400">Terminal {booking.terminal} • Gate {booking.gate}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400 block font-bold">Cabin Class</span>
                          <span className="font-extrabold text-[#0078D2] dark:text-sky-300">{booking.cabinClass}</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Date: {new Date(booking.departureTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Front Desk Gate Action & Pass Approval */}
                  <div className="space-y-4 lg:col-span-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#C41230]" /> Front Desk Gate Pass Clearance
                      </h3>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Utensils className="w-3.5 h-3.5 text-amber-500" /> Meal Selection
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{booking.passenger.mealPreference}</span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Luggage className="w-3.5 h-3.5 text-sky-500" /> Checked Bags
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{booking.passenger.baggageCount} Piece(s)</span>
                        </div>

                        {/* Verification Clearance Status Card */}
                        <div className={`p-3.5 rounded-xl border transition-all ${
                          isApproved 
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200' 
                            : 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800 text-sky-950 dark:text-sky-200'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            {isApproved ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <BadgeCheck className="w-4 h-4 text-[#0078D2] dark:text-sky-400" />
                            )}
                            <span className="font-black text-xs uppercase tracking-wide">
                              {isApproved ? 'Gate Boarding Clearance Pass Active' : 'Ticket Valid - Ready for Gate Pass'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                            {isApproved 
                              ? `Cleared by Gate Agent. Pass issued for passenger ${booking.passenger.fullName}.` 
                              : `Ticket ${booking.ticketNumber} verified in system. Click below to grant gate boarding pass.`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons for Front Desk / Passenger */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      {userRole === 'admin' && !isApproved ? (
                        <button
                          onClick={() => handleGrantPass(booking)}
                          className="w-full bg-[#C41230] hover:bg-[#A00E26] text-white font-black py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-red-900/30"
                        >
                          <CheckCircle2 className="w-4.5 h-4.5 text-white" /> Grant Boarding Clearance Pass
                        </button>
                      ) : (
                        <button
                          onClick={() => onViewBoardingPass(booking)}
                          className="w-full bg-[#0078D2] hover:bg-[#0060A9] text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-sky-600/20"
                        >
                          <Printer className="w-4 h-4 text-sky-200" /> Print / View Official Boarding Pass
                        </button>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <button
                          onClick={() => onViewBoardingPass(booking)}
                          className="text-[#0078D2] dark:text-sky-400 hover:underline font-bold flex items-center gap-1"
                        >
                          View E-Ticket
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to cancel booking ${booking.ticketNumber} for ${booking.passenger.fullName}?`)) {
                              onCancelBooking(booking.id);
                            }
                          }}
                          className="text-rose-600 dark:text-rose-400 hover:underline font-semibold flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" /> Cancel Ticket
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
