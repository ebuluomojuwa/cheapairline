import React, { useState } from 'react';
import { Booking } from '../types';
import { Plane, X, Printer, Ticket, Clock, Compass, CheckCircle2, Mail } from 'lucide-react';
import { AmericanAirlinesLogo } from './AmericanAirlinesLogo';
import { calculateFlightDuration } from '../utils/flightCalculator';
import { EmailTicketModal } from './EmailTicketModal';

interface BoardingPassModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const BoardingPassModal: React.FC<BoardingPassModalProps> = ({ booking, onClose }) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [activePassengerIdx, setActivePassengerIdx] = useState(0);

  if (!booking) return null;

  const passengersList = (booking.passengers && booking.passengers.length > 0)
    ? booking.passengers
    : [booking.passenger];

  const currentPassenger = passengersList[activePassengerIdx] || booking.passenger;
  const currentSeatNumber = currentPassenger.seatNumber || booking.seatNumber;

  const handlePrint = () => {
    window.print();
  };

  const flightCalc = calculateFlightDuration(
    booking.origin,
    booking.destination,
    booking.departureTime
  );

  const durationStr = booking.duration || flightCalc.durationFormatted;
  const arrDate = new Date(booking.arrivalTime || flightCalc.arrivalTimeISO);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] overflow-y-auto">
          {/* Modal Close & Actions */}
          <div className="bg-gradient-to-r from-[#001E42] via-[#002D62] to-[#00152E] px-4 sm:px-6 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 border-b border-slate-800 text-white">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <AmericanAirlinesLogo size="sm" variant="dark-bg" />
              <h3 className="font-extrabold text-sm sm:text-lg">Boarding Pass</h3>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setShowEmailModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-sm min-h-[36px]"
              >
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Email Ticket</span>
                <span className="xs:hidden">Email</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="bg-[#0078D2] hover:bg-[#0060A9] text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-sm min-h-[36px]"
              >
                <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Print / Save PDF</span>
                <span className="xs:hidden">Print</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

        {/* Boarding Pass Container (Printable Area) */}
        <div className="p-3 sm:p-8 bg-slate-50 dark:bg-slate-950 space-y-4 sm:space-y-6">
          {/* Family / Multi-Passenger Ticket Selector Bar */}
          {passengersList.length > 1 && (
            <div className="bg-slate-900 text-white p-3 sm:p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="text-[11px] sm:text-xs font-bold text-sky-400 uppercase tracking-wider font-mono">
                  👨‍👩‍👧‍👦 Manifest ({passengersList.length} Passengers on PNR {booking.confirmationCode})
                </span>
                <span className="text-[10px] text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded-full">
                  Select passenger
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {passengersList.map((p, idx) => {
                  const isActive = idx === activePassengerIdx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePassengerIdx(idx)}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border min-h-[36px] ${
                        isActive
                          ? 'bg-[#0078D2] text-white border-sky-400 shadow-md ring-2 ring-sky-300/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <span>{idx + 1}. {p.fullName || 'Passenger'}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-amber-300">
                        Seat {p.seatNumber || booking.seatNumber}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-300 dark:border-slate-700 shadow-xl overflow-hidden">
            {/* Airline Header Bar */}
            <div className="bg-gradient-to-r from-[#001E42] to-[#002D62] p-4 sm:p-6 text-white flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-800">
              <div className="flex items-center gap-3 sm:gap-4">
                <AmericanAirlinesLogo size="sm" variant="dark-bg" />
                <div>
                  <h2 className="text-base sm:text-xl font-black tracking-tight">{booking.airline}</h2>
                  <p className="text-[11px] sm:text-xs text-sky-300 font-mono">{booking.aircraft}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] sm:text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold uppercase">
                  {booking.status}
                </span>
                <div className="text-[11px] sm:text-xs text-slate-300 font-mono mt-1">
                  PNR: <strong className="text-white">{booking.confirmationCode}</strong>
                </div>
              </div>
            </div>

            {/* Boarding Pass Body */}
            <div className="p-4 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 relative">
              {/* Main Flight Route Section (2 cols) */}
              <div className="md:col-span-2 space-y-4 sm:space-y-6 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-5 md:pb-0 md:pr-6">
                {/* Passenger Name & Seat Box */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block">Passenger Name</span>
                      {currentPassenger.passengerType && (
                        <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300">
                          {currentPassenger.passengerType}
                        </span>
                      )}
                    </div>
                    <span className="text-base sm:text-xl font-black text-slate-900 dark:text-slate-100 truncate block">{currentPassenger.fullName || booking.passenger.fullName}</span>
                    <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 block font-mono mt-0.5 truncate">
                      Passport: {currentPassenger.passportNumber || booking.passenger.passportNumber}
                    </span>
                  </div>

                  <div className="text-center bg-[#001E42] text-amber-400 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-800 shadow-md shrink-0">
                    <span className="text-[9px] sm:text-[10px] uppercase text-slate-400 font-bold block">SEAT</span>
                    <span className="text-xl sm:text-2xl font-black font-mono">{currentSeatNumber}</span>
                  </div>
                </div>

                {/* Route Visual Diagram */}
                <div className="flex items-center justify-between bg-gradient-to-r from-sky-50 via-white to-red-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 p-3.5 sm:p-6 rounded-2xl border border-sky-100 dark:border-slate-700">
                  <div className="text-left">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">{booking.origin.code}</span>
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 block truncate max-w-[90px] sm:max-w-none">{booking.origin.city}</span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 hidden sm:block">{booking.origin.airport}</span>
                  </div>

                  <div className="flex-1 px-3 sm:px-6 flex flex-col items-center">
                    <span className="text-[10px] sm:text-xs font-bold text-[#0078D2] dark:text-sky-400 font-mono mb-1">{booking.flightNumber}</span>
                    <div className="w-full flex items-center gap-1.5 sm:gap-2">
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#0078D2]" />
                      <div className="flex-1 h-0.5 bg-sky-300 border-t border-dashed border-sky-400 relative">
                        <Plane className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C41230] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#C41230]" />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 truncate">{booking.cabinClass}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">{booking.destination.code}</span>
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 block truncate max-w-[90px] sm:max-w-none">{booking.destination.city}</span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 hidden sm:block">{booking.destination.airport}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase block">Departure</span>
                    <span className="text-[11px] sm:text-xs font-black text-slate-800 dark:text-slate-200">
                      {new Date(booking.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase block flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-sky-500" /> Duration
                    </span>
                    <span className="text-[11px] sm:text-xs font-black text-sky-600 dark:text-sky-400 font-mono">
                      {durationStr}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase block flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-amber-500" /> Arrival
                    </span>
                    <span className="text-[11px] sm:text-xs font-black text-amber-600 dark:text-amber-400 font-mono">
                      {arrDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase block">Terminal/Gate</span>
                    <span className="text-[11px] sm:text-xs font-black text-red-600 dark:text-red-400">T{booking.terminal} • G{booking.gate}</span>
                  </div>
                </div>

                {/* Distance & Tracking Info Banner */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-sky-950/80 p-2.5 sm:p-3 rounded-xl border border-sky-800/60 text-[11px] sm:text-xs text-sky-200">
                  <span className="flex items-center gap-1.5 font-mono font-bold truncate">
                    <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 shrink-0" /> Distance: {flightCalc.distanceKm.toLocaleString()} km ({flightCalc.distanceMiles.toLocaleString()} mi)
                  </span>
                  <span className="bg-sky-500/20 text-sky-300 font-mono text-[9px] sm:text-[10px] px-2 py-0.5 rounded border border-sky-400/40">
                    Auto-Tracked
                  </span>
                </div>
              </div>

              {/* Right Side Stub & Barcode */}
              <div className="md:col-span-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3 text-xs">
                  <div className="bg-[#001E42] text-white p-3 sm:p-3.5 rounded-xl border border-slate-700">
                    <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold">Ticket Number</div>
                    <div className="font-mono font-bold text-sky-300 text-xs sm:text-sm truncate">{booking.ticketNumber}</div>
                  </div>

                  <div className="space-y-1 bg-slate-50 dark:bg-slate-800/60 p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px]">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Meal:</span> <strong className="text-slate-900 dark:text-slate-100">{currentPassenger.mealPreference || booking.passenger.mealPreference}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Baggage:</span> <strong className="text-slate-900 dark:text-slate-100">{currentPassenger.baggageCount ?? booking.passenger.baggageCount} Bag(s)</strong>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Class:</span> <strong className="text-[#0078D2] dark:text-sky-400 font-bold">{booking.cabinClass}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span>Total Fare:</span> <strong className="text-emerald-600 dark:text-emerald-400 font-black text-xs">${booking.pricePaid ?? 0}</strong>
                    </div>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-300 dark:border-slate-700 text-center space-y-2">
                  <div className="h-10 sm:h-12 bg-slate-900 flex items-center justify-around px-2 rounded overflow-hidden">
                    {/* Simulated barcode lines */}
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-full bg-white"
                        style={{ width: `${(i % 3) + 1.5}px`, opacity: i % 2 === 0 ? 1 : 0.2 }}
                      />
                    ))}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">
                    *{booking.ticketNumber}*
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      <EmailTicketModal
        booking={booking}
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />
    </>
  );
};
