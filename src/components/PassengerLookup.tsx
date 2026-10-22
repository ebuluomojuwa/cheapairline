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
  DollarSign,
  Sparkles,
  Printer,
  XCircle,
  AlertCircle,
  Award,
  CheckCircle2,
  Building2,
  BadgeCheck,
  UserCheck,
  Radio,
  ArrowRight,
  Share2,
  MessageCircle
} from 'lucide-react';
import { AmericanAirlinesLogo } from './AmericanAirlinesLogo';
import { EmailTicketModal, ShareChannel } from './EmailTicketModal';
import confetti from 'canvas-confetti';

interface PassengerLookupProps {
  bookings: Booking[];
  flights: Flight[];
  userRole?: 'passenger' | 'admin' | 'superadmin';
  onViewBoardingPass: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
  onApproveGatePass?: (bookingId: string) => void;
  onTrackFlight?: (target: Flight | Booking | string, flightNumber?: string) => void;
  initialQuery?: string;
}

export const PassengerLookup: React.FC<PassengerLookupProps> = ({
  bookings,
  flights,
  userRole = 'passenger',
  onViewBoardingPass,
  onCancelBooking,
  onApproveGatePass,
  onTrackFlight,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedFlightFilter, setSelectedFlightFilter] = useState<string>('all');
  const [justApprovedId, setJustApprovedId] = useState<string | null>(null);
  const [emailModalBooking, setEmailModalBooking] = useState<Booking | null>(null);
  const [shareChannel, setShareChannel] = useState<ShareChannel>('whatsapp');

  const isAdmin = userRole === 'admin' || userRole === 'superadmin';

  // Merge static flights with any flight present in active bookings
  const allLookupFlights = useMemo(() => {
    const map = new Map<string, Flight>();
    flights.forEach((f) => map.set(f.id, f));

    bookings.forEach((b) => {
      const alreadyHas = Array.from(map.values()).some(
        (f) => f.id === b.flightId || f.flightNumber.toLowerCase() === b.flightNumber.toLowerCase()
      );
      if (!alreadyHas) {
        map.set(b.flightId, {
          id: b.flightId,
          flightNumber: b.flightNumber,
          airline: b.airline || 'American Airlines',
          airlineCode: 'AA',
          aircraft: b.aircraft || 'Boeing 787-9 Dreamliner',
          origin: b.origin,
          destination: b.destination,
          departureTime: b.departureTime,
          arrivalTime: b.arrivalTime,
          duration: b.duration || '8h 00m',
          price: b.pricePaid || 650,
          totalSeats: 180,
          availableSeats: 140,
          terminal: b.terminal || 'T8',
          gate: b.gate || 'B20',
          status: 'On Time',
        });
      }
    });

    return Array.from(map.values());
  }, [flights, bookings]);

  // Filter logic: search by seat number, ticket number, confirmation code, passenger name, flight number, airport
  const matchedBookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cleanQ = q.replace(/[\s-]/g, '');

    // When query is empty, display all bookings (or filtered by selected flight)
    if (!q) {
      if (selectedFlightFilter === 'all') return bookings;
      return bookings.filter(
        (b) =>
          b.flightId === selectedFlightFilter ||
          b.flightNumber.toLowerCase() === selectedFlightFilter.toLowerCase()
      );
    }

    return bookings.filter((b) => {
      const matchFlight =
        selectedFlightFilter === 'all' ||
        b.flightId === selectedFlightFilter ||
        b.flightNumber.toLowerCase() === selectedFlightFilter.toLowerCase() ||
        b.flightNumber.toLowerCase().replace(/[\s-]/g, '') === selectedFlightFilter.toLowerCase().replace(/[\s-]/g, '');

      if (!matchFlight) return false;

      const cleanSeat = b.seatNumber.toLowerCase().replace(/[\s-]/g, '');
      const cleanTicket = b.ticketNumber.toLowerCase().replace(/[\s-]/g, '');
      const cleanConfirm = b.confirmationCode.toLowerCase().replace(/[\s-]/g, '');
      const cleanFlightNum = b.flightNumber.toLowerCase().replace(/[\s-]/g, '');
      const flightNumWithoutAA = cleanFlightNum.replace(/^aa/, '');
      const ticketWithoutPrefix = cleanTicket.replace(/^001/, '');

      const matchesLead = (
        b.seatNumber.toLowerCase() === q ||
        cleanSeat === cleanQ ||
        b.ticketNumber.toLowerCase().includes(q) ||
        cleanTicket.includes(cleanQ) ||
        (cleanQ.length >= 3 && ticketWithoutPrefix.includes(cleanQ)) ||
        b.confirmationCode.toLowerCase().includes(q) ||
        cleanConfirm.includes(cleanQ) ||
        b.passenger.fullName.toLowerCase().includes(q) ||
        b.passenger.email.toLowerCase().includes(q) ||
        b.passenger.passportNumber.toLowerCase().includes(q) ||
        cleanFlightNum.includes(cleanQ) ||
        b.flightNumber.toLowerCase().includes(q) ||
        (cleanQ.length >= 2 && flightNumWithoutAA === cleanQ) ||
        b.origin.city.toLowerCase().includes(q) ||
        b.origin.code.toLowerCase().includes(q) ||
        b.destination.city.toLowerCase().includes(q) ||
        b.destination.code.toLowerCase().includes(q) ||
        b.aircraft.toLowerCase().includes(q)
      );

      const matchesFamily = b.passengers?.some((p) => {
        const pCleanSeat = (p.seatNumber || '').toLowerCase().replace(/[\s-]/g, '');
        return (
          p.fullName.toLowerCase().includes(q) ||
          p.passportNumber?.toLowerCase().includes(q) ||
          pCleanSeat === cleanQ ||
          p.seatNumber?.toLowerCase() === q ||
          p.email?.toLowerCase().includes(q)
        );
      });

      return matchesLead || matchesFamily;
    });
  }, [query, bookings, selectedFlightFilter]);

  // Check if query also matches any flight schedules directly
  const matchedFlights = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const cleanQ = q.replace(/[\s-]/g, '');
    const flightNumWithoutAA = cleanQ.replace(/^aa/, '');

    return allLookupFlights.filter((f) => {
      const cleanFlightNum = f.flightNumber.toLowerCase().replace(/[\s-]/g, '');
      return (
        cleanFlightNum.includes(cleanQ) ||
        f.flightNumber.toLowerCase().includes(q) ||
        (cleanQ.length >= 2 && cleanFlightNum.replace(/^aa/, '') === flightNumWithoutAA) ||
        f.origin.code.toLowerCase().includes(q) ||
        f.origin.city.toLowerCase().includes(q) ||
        f.destination.code.toLowerCase().includes(q) ||
        f.destination.city.toLowerCase().includes(q) ||
        f.aircraft.toLowerCase().includes(q)
      );
    });
  }, [allLookupFlights, query]);

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
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header Banner: Front Desk Admin vs General Lookup */}
      <div className={`relative overflow-hidden rounded-3xl border p-4 sm:p-8 shadow-2xl text-white ${
        userRole === 'admin' 
          ? 'bg-gradient-to-r from-[#001E42] via-[#002B5B] to-[#C41230]/90 border-red-500/40' 
          : 'bg-gradient-to-r from-[#001E42] via-[#002D62] to-[#00152E] border-slate-700/80'
      }`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0078D2]/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-900/90 text-sky-300 border border-slate-600/80 text-[11px] sm:text-xs font-bold shadow-md">
            <AmericanAirlinesLogo size="sm" variant="dark-bg" />
            <span className="text-slate-400">|</span>
            {userRole === 'admin' ? (
              <span className="flex items-center gap-1.5 text-red-400 font-black tracking-wide uppercase">
                <Building2 className="w-4 h-4 text-red-500" /> Front Desk & Gate Clearance
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-400 font-extrabold">
                <Award className="w-3.5 h-3.5" /> Instant Flight Ticket Lookup
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            {userRole === 'admin' 
              ? 'Front Desk Flight Ticket Check & Gate Clearance' 
              : 'Lookup Flight Ticket & Passenger Details'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
            {userRole === 'admin' 
              ? 'Enter a passenger flight ticket number (e.g. 001-9482-7710), seat number, or passenger name. Review ticket records, passenger manifests, and issue official gate boarding clearance passes.'
              : 'Input your ticket number (e.g. 001-9482-7710) or assigned seat number (01A, 02B) to retrieve complete booking details and boarding clearance passes.'}
          </p>

          {/* Quick Test Chips & User's Booked Tickets */}
          <div className="pt-2 space-y-2">
            {bookings.length > 0 && (
              <div>
                <p className="text-xs text-emerald-300 font-extrabold mb-1.5 flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-emerald-400" /> Your Booked Flight Tickets ({bookings.length}):
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {bookings.slice(0, 5).map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleQuickSample(b.ticketNumber)}
                      className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 text-xs font-mono px-2.5 sm:px-3 py-1.5 rounded-lg border border-emerald-700/80 transition flex items-center gap-1.5 shadow-sm font-bold cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{b.ticketNumber} ({b.flightNumber})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-slate-300 font-bold mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Click to test sample ticket numbers:
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  onClick={() => handleQuickSample('001-9482-7710')}
                  className="bg-[#C41230] hover:bg-red-700 text-white text-xs font-mono px-2.5 sm:px-3 py-1.5 rounded-lg border border-red-400/40 transition flex items-center gap-1.5 shadow-sm font-bold ring-2 ring-red-500/30 cursor-pointer"
                >
                  <Ticket className="w-3.5 h-3.5 text-white" /> Ticket 001-9482-7710
                </button>
                <button
                  onClick={() => handleQuickSample('Elizabeth Gutierrez')}
                  className="bg-slate-800/90 hover:bg-slate-700 text-slate-100 text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-600 transition flex items-center gap-1.5 shadow-sm font-bold cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-sky-400" /> Elizabeth Gutierrez
                </button>
                <button
                  onClick={() => handleQuickSample('02B')}
                  className="bg-[#0078D2]/80 hover:bg-[#0078D2] text-white text-xs font-mono px-2.5 sm:px-3 py-1.5 rounded-lg border border-sky-400/30 transition flex items-center gap-1.5 shadow-sm font-bold cursor-pointer"
                >
                  <Armchair className="w-3.5 h-3.5 text-amber-300" /> Seat 02B
                </button>
                <button
                  onClick={() => handleQuickSample('01A')}
                  className="bg-[#0078D2]/80 hover:bg-[#0078D2] text-white text-xs font-mono px-2.5 sm:px-3 py-1.5 rounded-lg border border-sky-400/30 transition flex items-center gap-1.5 shadow-sm font-bold cursor-pointer"
                >
                  <Armchair className="w-3.5 h-3.5 text-amber-300" /> Seat 01A
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-6 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Ticket Number (001-...), PNR, Flight (AA-104), Seat, or Passenger Name..."
              className="w-full pl-11 sm:pl-12 pr-10 py-3 sm:py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#C41230] focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/40 outline-none transition text-slate-900 dark:text-slate-100 font-bold placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-base shadow-inner min-h-[44px]"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 p-1 rounded-full cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="w-full md:w-64">
            <select
              value={selectedFlightFilter}
              onChange={(e) => setSelectedFlightFilter(e.target.value)}
              className="w-full py-3 sm:py-3.5 px-3 sm:px-4 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0078D2] focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/40 outline-none text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm bg-white dark:bg-slate-800 min-h-[44px]"
            >
              <option value="all">✈️ All AA Flight Manifests ({allLookupFlights.length})</option>
              {allLookupFlights.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.flightNumber} ({f.origin.code} ➔ {f.destination.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Showing {matchedBookings.length} matching booking record(s)</span>
          {query && (
            <span className="font-mono text-[#C41230] dark:text-red-400 font-extrabold bg-red-50 dark:bg-red-950/60 px-2.5 py-0.5 rounded border border-red-200 dark:border-red-900/60 truncate max-w-[200px] sm:max-w-none">
              Filter: "{query}"
            </span>
          )}
        </div>
      </div>

      {/* Results List */}
      {matchedBookings.length === 0 ? (
        <div className="space-y-6">
          {matchedFlights.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800/60 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-500/10 dark:bg-sky-500/20 text-[#0078D2] dark:text-sky-400 flex items-center justify-center font-black">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                      Flight Schedule Matches for "{query}"
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No passenger reservation was found under this query, but we located {matchedFlights.length} matching active flight route(s).
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchedFlights.map((fl) => (
                  <div
                    key={fl.id}
                    className="bg-slate-50 dark:bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-sky-400 dark:hover:border-sky-500 transition space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-lg text-slate-900 dark:text-slate-100">{fl.flightNumber}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                          {fl.aircraft}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {fl.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm font-bold text-slate-800 dark:text-slate-200">
                      <div>
                        <div className="text-base font-black">{fl.origin.code}</div>
                        <div className="text-xs text-slate-500 font-normal">{fl.origin.city}</div>
                      </div>
                      <Plane className="w-4 h-4 text-sky-500 transform rotate-90" />
                      <div className="text-right">
                        <div className="text-base font-black">{fl.destination.code}</div>
                        <div className="text-xs text-slate-500 font-normal">{fl.destination.city}</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-slate-500">
                        Terminal {fl.terminal} • Gate {fl.gate}
                      </span>
                      {onTrackFlight && (
                        <button
                          type="button"
                          onClick={() => onTrackFlight(fl)}
                          className="text-xs font-bold bg-[#0078D2] hover:bg-[#0060A9] text-white px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                        >
                          <Radio className="w-3.5 h-3.5" />
                          <span>Track Live Radar</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-6 sm:p-12 text-center space-y-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-sky-100 dark:bg-sky-950 rounded-full flex items-center justify-center mx-auto text-[#0078D2] dark:text-sky-400">
                {!query ? <Ticket className="w-7 h-7 sm:w-8 sm:h-8" /> : <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500" />}
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100">
                  {!query ? 'Search Your Flight Ticket' : 'No Booking Ticket Record Found'}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                  {!query ? (
                    <span>
                      Please enter your <strong>Ticket Number</strong> (e.g. <span className="font-mono font-extrabold text-red-600 dark:text-red-400">001-9482-7710</span>), <strong>Passenger Name</strong>, or <strong>Flight Number</strong> in the search box above.
                    </span>
                  ) : (
                    <span>
                      We couldn't find any ticket or flight schedule matching "{query}". Please verify your ticket number or try one of our sample queries below.
                    </span>
                  )}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap justify-center gap-2">
                {bookings.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setSelectedFlightFilter('all');
                    }}
                    className="inline-flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-xl transition shadow-sm min-h-[40px] cursor-pointer"
                  >
                    <Ticket className="w-4 h-4 text-white" /> Show All Active Reservations ({bookings.length})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setQuery('001-9482-7710')}
                  className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#0078D2] hover:bg-[#0060A9] px-4 py-2.5 rounded-xl transition shadow-sm min-h-[40px] cursor-pointer"
                >
                  <Ticket className="w-4 h-4 text-white" /> Try Sample Ticket: 001-9482-7710
                </button>
                <button
                  type="button"
                  onClick={() => setQuery('AA-104')}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 transition shadow-sm min-h-[40px] cursor-pointer"
                >
                  <Plane className="w-4 h-4 text-sky-500" /> Search Flight: AA-104
                </button>
              </div>
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
                <div className="bg-gradient-to-r from-[#001E42] via-[#002D62] to-[#00152E] p-4 sm:p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center font-black text-sky-300 text-sm sm:text-lg shrink-0">
                      {booking.flightNumber}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base sm:text-xl font-bold tracking-wide">{booking.airline}</h2>
                        <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 font-mono text-slate-300">
                          {booking.aircraft}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 flex items-center gap-1.5 sm:gap-2 mt-1 truncate">
                        <span>{booking.origin.city} ({booking.origin.code})</span>
                        <Plane className="w-3.5 h-3.5 text-red-400 transform rotate-90 shrink-0" />
                        <span>{booking.destination.city} ({booking.destination.code})</span>
                      </p>
                    </div>
                  </div>

                  {/* Seat, Ticket & Price Highlight Box */}
                  <div className="grid grid-cols-3 sm:flex items-center gap-2 sm:gap-3 bg-[#00152E] p-2.5 sm:p-3.5 rounded-xl border border-slate-700/80 shadow-inner">
                    <div className="text-center sm:text-right">
                      <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Seat</div>
                      <div className="text-lg sm:text-2xl font-black font-mono text-amber-400 flex items-center justify-center sm:justify-end gap-0.5 sm:gap-1">
                        <Armchair className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
                        {booking.seatNumber}
                      </div>
                    </div>
                    <div className="hidden sm:block h-8 w-px bg-slate-700" />
                    <div className="text-center sm:text-left border-x sm:border-x-0 border-slate-700/60 px-1 sm:px-0">
                      <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Ticket #</div>
                      <div className="text-xs sm:text-sm font-mono font-bold text-sky-300 truncate">{booking.ticketNumber}</div>
                      <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono truncate">PNR: {booking.confirmationCode}</div>
                    </div>
                    <div className="hidden sm:block h-8 w-px bg-slate-700" />
                    <div className="text-center sm:text-right">
                      <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Fare</div>
                      <div className="text-base sm:text-lg font-black font-mono text-emerald-400 flex items-center justify-center sm:justify-end gap-0.5">
                        <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                        {booking.pricePaid ?? 0}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-emerald-300/80 font-mono truncate">{booking.paymentMethod || 'Paid'}</div>
                    </div>
                  </div>
                </div>

                {/* Main Content: Passenger Profile & Flight Manifest */}
                <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                  {/* Column 1: Passenger Personal Identity */}
                  <div className="space-y-4 lg:col-span-1 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 pb-6 lg:pb-0 lg:pr-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <User className="w-4 h-4 text-[#0078D2]" /> Passenger Profile
                      </h3>
                      <span className={`text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
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
                        <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          {booking.passenger.fullName}
                          <BadgeCheck className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                        <div>
                          <span className="text-[11px] sm:text-xs text-slate-400 block font-medium">Gender / DOB</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {booking.passenger.gender}, {booking.passenger.dateOfBirth}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] sm:text-xs text-slate-400 block font-medium">Nationality</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                            <Globe2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{booking.passenger.nationality}</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-xs sm:text-sm space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
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
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 sm:p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                        <div>
                          <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase block">Departure</span>
                          <div className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">{booking.origin.code}</div>
                          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">{booking.origin.city}</div>
                          <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 shrink-0" />
                            {new Date(booking.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase block">Arrival</span>
                          <div className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">{booking.destination.code}</div>
                          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">{booking.destination.city}</div>
                          <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 shrink-0" />
                            {new Date(booking.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 sm:p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400 block font-bold text-[9px] sm:text-[10px]">Terminal/Gate</span>
                          <span className="font-extrabold text-red-600 dark:text-red-400 text-[11px] sm:text-xs">T{booking.terminal} • G{booking.gate}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 sm:p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400 block font-bold text-[9px] sm:text-[10px]">Cabin Class</span>
                          <span className="font-extrabold text-[#0078D2] dark:text-sky-300 text-[11px] sm:text-xs truncate block">{booking.cabinClass}</span>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2 sm:p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <span className="text-emerald-700 dark:text-emerald-400 block font-bold text-[9px] sm:text-[10px]">Flight Fare</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-300 text-[11px] sm:text-xs">${booking.pricePaid ?? 0}</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">Date: {new Date(booking.departureTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Front Desk Gate Action & Pass Approval */}
                  <div className="space-y-4 lg:col-span-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#C41230]" /> Front Desk Gate Clearance
                      </h3>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Utensils className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Meal Preference
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{booking.passenger.mealPreference}</span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Luggage className="w-3.5 h-3.5 text-sky-500 shrink-0" /> Checked Bags
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{booking.passenger.baggageCount} Piece(s)</span>
                        </div>

                        {/* Verification Clearance Status Card */}
                        <div className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                          isApproved 
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200' 
                            : 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800 text-sky-950 dark:text-sky-200'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            {isApproved ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                              <BadgeCheck className="w-4 h-4 text-[#0078D2] dark:text-sky-400 shrink-0" />
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {userRole === 'admin' && !isApproved ? (
                          <button
                            onClick={() => handleGrantPass(booking)}
                            className="w-full bg-[#C41230] hover:bg-[#A00E26] text-white font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-red-900/30 min-h-[44px]"
                          >
                            <CheckCircle2 className="w-4 h-4 text-white" /> Grant Boarding Pass
                          </button>
                        ) : (
                          <button
                            onClick={() => onViewBoardingPass(booking)}
                            className="w-full bg-[#0078D2] hover:bg-[#0060A9] text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-sky-600/20 min-h-[44px]"
                          >
                            <Printer className="w-4 h-4 text-sky-200" /> Print / View Pass
                          </button>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShareChannel('whatsapp');
                              setEmailModalBooking(booking);
                            }}
                            className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm min-h-[44px]"
                            title="Send Ticket via WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4 text-slate-950" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShareChannel('email');
                              setEmailModalBooking(booking);
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-emerald-600/20 min-h-[44px]"
                            title="Share & Send Ticket (Email, Gmail, Twitter, Instagram)"
                          >
                            <Share2 className="w-4 h-4 text-white" />
                            <span>Share / Send</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onViewBoardingPass(booking)}
                            className="text-[#0078D2] dark:text-sky-400 hover:underline font-bold flex items-center gap-1"
                          >
                            View E-Ticket
                          </button>
                          {onTrackFlight && (
                            <button
                              onClick={() => {
                                const foundFlight = flights.find((f) => f.id === booking.flightId || f.flightNumber === booking.flightNumber);
                                if (foundFlight) {
                                  onTrackFlight(foundFlight);
                                } else {
                                  onTrackFlight(booking, booking.flightNumber);
                                }
                              }}
                              className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Radio className="w-3 h-3" /> Track Flight
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to cancel booking ${booking.ticketNumber} for ${booking.passenger.fullName}?`)) {
                              onCancelBooking(booking.id);
                            }
                          }}
                          className="text-rose-600 dark:text-rose-400 hover:underline font-semibold flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Cancel Ticket
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

      <EmailTicketModal
        booking={emailModalBooking}
        isOpen={!!emailModalBooking}
        onClose={() => setEmailModalBooking(null)}
        defaultChannel={shareChannel}
      />
    </div>
  );
};
