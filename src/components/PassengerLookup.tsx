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
  Award
} from 'lucide-react';
import { AmericanAirlinesLogo } from './AmericanAirlinesLogo';

interface PassengerLookupProps {
  bookings: Booking[];
  flights: Flight[];
  onViewBoardingPass: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
  initialQuery?: string;
}

export const PassengerLookup: React.FC<PassengerLookupProps> = ({
  bookings,
  flights,
  onViewBoardingPass,
  onCancelBooking,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedFlightFilter, setSelectedFlightFilter] = useState<string>('all');

  // Filter logic: search by seat number, ticket number, confirmation code, or passenger name
  const matchedBookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bookings;

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
  }, [query, bookings, selectedFlightFilter]);

  const handleQuickSample = (sampleText: string) => {
    setQuery(sampleText);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#001E42] via-[#002D62] to-[#00152E] border border-slate-700/80 p-8 shadow-2xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0078D2]/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 text-sky-300 border border-slate-600/60 text-xs font-bold shadow-sm">
            <AmericanAirlinesLogo size="sm" variant="dark-bg" />
            <span className="text-slate-400">|</span>
            <span className="flex items-center gap-1 text-red-400 font-extrabold">
              <Award className="w-3.5 h-3.5" /> Instant Passenger & Seat Lookup
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Lookup Passenger Details by Seat or Ticket Number
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Enter any seat number (e.g. <span className="bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono font-bold">01A</span>, <span className="bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono font-bold">12F</span>, <span className="bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono font-bold">18A</span>), ticket number (e.g. <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-mono font-bold">001-8942-0101</span>), or confirmation code to inspect complete passenger profiles and flight manifests.
          </p>

          {/* Quick Test Chips */}
          <div className="pt-2">
            <p className="text-xs text-slate-300 font-bold mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Click a sample query to test instantly:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleQuickSample('001-9482-7710')}
                className="bg-[#C41230] hover:bg-red-700 text-white text-xs font-mono px-3 py-1.5 rounded-lg border border-red-400/40 transition flex items-center gap-1.5 shadow-sm font-bold ring-2 ring-red-500/30"
              >
                <Ticket className="w-3.5 h-3.5 text-white" /> Ticket 001-9482-7710
              </button>
              <button
                onClick={() => handleQuickSample('Elizabeth Gutierrez')}
                className="bg-slate-800/90 hover:bg-slate-700 text-slate-100 text-xs px-3 py-1.5 rounded-lg border border-slate-600 transition flex items-center gap-1.5 shadow-sm font-bold"
              >
                <User className="w-3.5 h-3.5 text-sky-400" /> Elizabeth Gutierrez
              </button>
              <button
                onClick={() => handleQuickSample('01A')}
                className="bg-[#0078D2]/80 hover:bg-[#0078D2] text-white text-xs font-mono px-3 py-1.5 rounded-lg border border-sky-400/30 transition flex items-center gap-1.5 shadow-sm font-bold"
              >
                <Armchair className="w-3.5 h-3.5 text-amber-300" /> Seat 01A
              </button>
              <button
                onClick={() => handleQuickSample('02B')}
                className="bg-[#0078D2]/80 hover:bg-[#0078D2] text-white text-xs font-mono px-3 py-1.5 rounded-lg border border-sky-400/30 transition flex items-center gap-1.5 shadow-sm font-bold"
              >
                <Armchair className="w-3.5 h-3.5 text-amber-300" /> Seat 02B
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border border-slate-200/80 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter seat number (01A), ticket # (001-...), confirmation PNR, or name..."
              className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-slate-300 focus:border-[#0078D2] focus:ring-2 focus:ring-sky-100 outline-none transition text-slate-900 font-medium placeholder-slate-400 text-sm sm:text-base"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs bg-slate-100 hover:bg-slate-200 p-1 rounded-full"
              >
                ✕
              </button>
            )}
          </div>

          <div className="w-full md:w-64">
            <select
              value={selectedFlightFilter}
              onChange={(e) => setSelectedFlightFilter(e.target.value)}
              className="w-full py-3.5 px-4 rounded-xl border border-slate-300 focus:border-[#0078D2] focus:ring-2 focus:ring-sky-100 outline-none text-slate-700 font-bold text-sm bg-white"
            >
              <option value="all">✈️ All AA Flights Manifest</option>
              {flights.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.flightNumber} ({f.origin.code} ➔ {f.destination.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Showing {matchedBookings.length} matching booking record(s)</span>
          {query && (
            <span className="font-mono text-[#0078D2] font-extrabold bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
              Filter: "{query}"
            </span>
          )}
        </div>
      </div>

      {/* Results List */}
      {matchedBookings.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-200/70 rounded-full flex items-center justify-center mx-auto text-slate-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">No Booking Record Found</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              We couldn't find any passenger matching "{query}". Try checking the seat number (e.g. 01A, 12F, 18A) or ticket number (e.g. 001-8942-0101).
            </p>
          </div>
          <button
            onClick={() => setQuery('')}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#0078D2] hover:text-[#0060A9] bg-sky-50 px-4 py-2 rounded-xl border border-sky-200"
          >
            Clear Search & View All Bookings
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {matchedBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden transition-all hover:shadow-xl"
            >
              {/* Card Header: Flight & Status Badge */}
              <div className="bg-gradient-to-r from-[#001E42] via-[#002D62] to-[#00152E] p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center font-black text-sky-300 text-lg">
                    {booking.flightNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold tracking-wide">{booking.airline}</h2>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 font-mono text-slate-300">
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
                <div className="space-y-4 lg:col-span-1 border-b lg:border-b-0 lg:border-r border-slate-200 pb-6 lg:pb-0 lg:pr-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4 text-[#0078D2]" /> Passenger Profile
                    </h3>
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {booking.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 block font-medium">Full Legal Name</label>
                      <div className="text-lg font-black text-slate-900">{booking.passenger.fullName}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">Gender / DOB</span>
                        <span className="font-semibold text-slate-700">
                          {booking.passenger.gender}, {booking.passenger.dateOfBirth}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">Nationality</span>
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                          {booking.passenger.nationality}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate font-mono text-xs">{booking.passenger.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-mono text-xs">{booking.passenger.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-mono">Passport: {booking.passenger.passportNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Flight Schedule & Location Details */}
                <div className="space-y-4 lg:col-span-1 border-b lg:border-b-0 lg:border-r border-slate-200 pb-6 lg:pb-0 lg:pr-6">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Plane className="w-4 h-4 text-[#0078D2]" /> Itinerary & Flight Specs
                  </h3>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                      <div>
                        <span className="text-[11px] text-slate-400 font-bold uppercase block">Departure</span>
                        <div className="text-lg font-black text-slate-800">{booking.origin.code}</div>
                        <div className="text-xs font-semibold text-slate-600">{booking.origin.city}</div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {new Date(booking.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 font-bold uppercase block">Arrival</span>
                        <div className="text-lg font-black text-slate-800">{booking.destination.code}</div>
                        <div className="text-xs font-semibold text-slate-600">{booking.destination.city}</div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {new Date(booking.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block">Terminal & Gate</span>
                        <span className="font-bold text-slate-800">Terminal {booking.terminal} • Gate {booking.gate}</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block">Cabin Class</span>
                        <span className="font-bold text-[#0078D2]">{booking.cabinClass}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Flight Date: {new Date(booking.departureTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Column 3: Meal, Baggage, Financials & Actions */}
                <div className="space-y-4 lg:col-span-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-[#0078D2]" /> Flagship Amenities & Fare
                    </h3>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Utensils className="w-3.5 h-3.5 text-amber-500" /> Meal Preference
                        </span>
                        <span className="font-semibold text-slate-800">{booking.passenger.mealPreference}</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Luggage className="w-3.5 h-3.5 text-sky-500" /> Checked Bags
                        </span>
                        <span className="font-semibold text-slate-800">{booking.passenger.baggageCount} Piece(s)</span>
                      </div>

                      {booking.passenger.specialAssistance && (
                        <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                          <strong>Special Request:</strong> {booking.passenger.specialAssistance}
                        </div>
                      )}

                      <div className="p-3.5 rounded-xl bg-[#001E42] text-white flex items-center justify-between border border-slate-700">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Ticket Fare</div>
                          <div className="text-lg font-black text-emerald-400">${booking.pricePaid}</div>
                        </div>
                        <div className="text-right text-[11px] text-slate-300">
                          <div className="flex items-center gap-1 justify-end font-bold text-sky-300">
                            <CreditCard className="w-3.5 h-3.5 text-sky-400" />
                            <span>Paid</span>
                          </div>
                          <div className="text-[10px] text-slate-400">{booking.paymentMethod}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => onViewBoardingPass(booking)}
                      className="flex-1 bg-[#0078D2] hover:bg-[#0060A9] text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-sky-600/20"
                    >
                      <Printer className="w-3.5 h-3.5 text-sky-200" /> View Boarding Pass
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to cancel booking ${booking.ticketNumber} for ${booking.passenger.fullName}?`)) {
                          onCancelBooking(booking.id);
                        }
                      }}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-rose-200"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
