import React from 'react';
import { Booking } from '../types';
import { Plane, X, Printer, Ticket, Clock, Compass, CheckCircle2 } from 'lucide-react';
import { AmericanAirlinesLogo } from './AmericanAirlinesLogo';
import { calculateFlightDuration } from '../utils/flightCalculator';

interface BoardingPassModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const BoardingPassModal: React.FC<BoardingPassModalProps> = ({ booking, onClose }) => {
  if (!booking) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 max-h-[90vh] overflow-y-auto">
        {/* Modal Close & Actions */}
        <div className="bg-gradient-to-r from-[#001E42] via-[#002D62] to-[#00152E] px-6 py-4 flex items-center justify-between border-b border-slate-800 text-white">
          <div className="flex items-center gap-3">
            <AmericanAirlinesLogo size="sm" variant="dark-bg" />
            <h3 className="font-extrabold text-lg">Official Electronic Boarding Pass</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-[#0078D2] hover:bg-[#0060A9] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Boarding Pass Container (Printable Area) */}
        <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-950 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-900 dark:border-slate-700 shadow-xl overflow-hidden">
            {/* Airline Header Bar */}
            <div className="bg-gradient-to-r from-[#001E42] to-[#002D62] p-6 text-white flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-800">
              <div className="flex items-center gap-4">
                <AmericanAirlinesLogo size="md" variant="dark-bg" />
                <div>
                  <h2 className="text-xl font-black tracking-tight">{booking.airline}</h2>
                  <p className="text-xs text-sky-300 font-mono">{booking.aircraft}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold uppercase">
                  {booking.status}
                </span>
                <div className="text-xs text-slate-300 font-mono mt-1">
                  PNR: <strong className="text-white">{booking.confirmationCode}</strong>
                </div>
              </div>
            </div>

            {/* Boarding Pass Body */}
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Main Flight Route Section (2 cols) */}
              <div className="md:col-span-2 space-y-6 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-6 md:pb-0 md:pr-6">
                {/* Passenger Name & Seat Box */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase block">Passenger Name</span>
                    <span className="text-xl font-black text-slate-900 dark:text-slate-100">{booking.passenger.fullName}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-mono mt-0.5">
                      Passport: {booking.passenger.passportNumber}
                    </span>
                  </div>

                  <div className="text-center bg-[#001E42] text-amber-400 px-4 py-2.5 rounded-xl border border-slate-800 shadow-md">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">SEAT</span>
                    <span className="text-2xl font-black font-mono">{booking.seatNumber}</span>
                  </div>
                </div>

                {/* Route Visual Diagram */}
                <div className="flex items-center justify-between bg-gradient-to-r from-sky-50 via-white to-red-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 p-6 rounded-2xl border border-sky-100 dark:border-slate-700">
                  <div className="text-left">
                    <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{booking.origin.code}</span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">{booking.origin.city}</span>
                    <span className="text-[10px] text-slate-400 block">{booking.origin.airport}</span>
                  </div>

                  <div className="flex-1 px-6 flex flex-col items-center">
                    <span className="text-xs font-bold text-[#0078D2] dark:text-sky-400 font-mono mb-1">{booking.flightNumber}</span>
                    <div className="w-full flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0078D2]" />
                      <div className="flex-1 h-0.5 bg-sky-300 border-t border-dashed border-sky-400 relative">
                        <Plane className="w-4 h-4 text-[#C41230] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#C41230]" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">{booking.cabinClass} Class</span>
                  </div>

                  <div className="text-right">
                    <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{booking.destination.code}</span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">{booking.destination.city}</span>
                    <span className="text-[10px] text-slate-400 block">{booking.destination.airport}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Departure</span>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                      {new Date(booking.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-sky-500" /> Flying Time
                    </span>
                    <span className="text-xs font-black text-sky-600 dark:text-sky-400 font-mono">
                      {durationStr}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-amber-500" /> Est. Landing
                    </span>
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">
                      {arrDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Terminal / Gate</span>
                    <span className="text-xs font-black text-red-600 dark:text-red-400">{booking.terminal} • Gate {booking.gate}</span>
                  </div>
                </div>

                {/* Distance & Tracking Info Banner */}
                <div className="flex items-center justify-between bg-sky-950/80 p-3 rounded-xl border border-sky-800/60 text-xs text-sky-200">
                  <span className="flex items-center gap-1.5 font-mono font-bold">
                    <Compass className="w-4 h-4 text-sky-400" /> Calculated Distance: {flightCalc.distanceKm.toLocaleString()} km ({flightCalc.distanceMiles.toLocaleString()} miles)
                  </span>
                  <span className="bg-sky-500/20 text-sky-300 font-mono text-[10px] px-2 py-0.5 rounded border border-sky-400/40">
                    Auto-Tracked
                  </span>
                </div>
              </div>

              {/* Right Side Stub & Barcode */}
              <div className="md:col-span-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3 text-xs">
                  <div className="bg-[#001E42] text-white p-3.5 rounded-xl border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Ticket Number</div>
                    <div className="font-mono font-bold text-sky-300 text-sm">{booking.ticketNumber}</div>
                  </div>

                  <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px]">
                    <div className="flex justify-between text-slate-600">
                      <span>Meal:</span> <strong className="text-slate-900">{booking.passenger.mealPreference}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Baggage:</span> <strong className="text-slate-900">{booking.passenger.baggageCount} Bag(s)</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Class:</span> <strong className="text-[#0078D2] font-bold">{booking.cabinClass}</strong>
                    </div>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="bg-white p-4 rounded-xl border border-slate-300 text-center space-y-2">
                  <div className="h-12 bg-slate-900 flex items-center justify-around px-2 rounded overflow-hidden">
                    {/* Simulated barcode lines */}
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-full bg-white"
                        style={{ width: `${(i % 3) + 1.5}px`, opacity: i % 2 === 0 ? 1 : 0.2 }}
                      />
                    ))}
                  </div>
                  <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                    *{booking.ticketNumber}*
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
