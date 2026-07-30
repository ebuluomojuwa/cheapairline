import React, { useState } from 'react';
import { Flight, Booking, Seat } from '../types';
import { SeatPicker } from './SeatPicker';
import { Armchair, Plane, Ticket, Award } from 'lucide-react';
import { AmericanAirlinesLogo } from './AmericanAirlinesLogo';

interface SeatExplorerViewProps {
  flights: Flight[];
  bookings: Booking[];
  onBookSeat: (flight: Flight, seat: Seat) => void;
  onInspectPassenger: (booking: Booking) => void;
}

export const SeatExplorerView: React.FC<SeatExplorerViewProps> = ({
  flights,
  bookings,
  onBookSeat,
  onInspectPassenger,
}) => {
  const [selectedFlightId, setSelectedFlightId] = useState<string>(flights[0]?.id || '');

  const activeFlight = flights.find((f) => f.id === selectedFlightId) || flights[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#001E42] via-[#002D62] to-[#00152E] border border-slate-700/80 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 text-sky-300 border border-slate-600/60 text-xs font-bold shadow-sm">
            <AmericanAirlinesLogo size="sm" variant="dark-bg" />
            <span className="text-slate-400">|</span>
            <span className="flex items-center gap-1 text-amber-300 font-extrabold">
              <Armchair className="w-3.5 h-3.5" /> Flagship® Interactive Seat Explorer
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Aircraft Seat Maps & Passenger Inspector
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Select an American Airlines flight manifest below. Red seats are occupied—click any occupied seat to instantly reveal passenger identity, ticket number, and booking records. Click any available seat to reserve it!
          </p>
        </div>

        {/* Flight Selector */}
        <div className="w-full md:w-80 bg-[#00152E] p-3.5 rounded-2xl border border-slate-700 shadow-inner">
          <label className="text-xs text-slate-300 block font-bold mb-1.5">Choose AA Flight Manifest</label>
          <select
            value={selectedFlightId}
            onChange={(e) => setSelectedFlightId(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-600 bg-[#001E42] text-white font-bold text-sm focus:border-sky-400 outline-none"
          >
            {flights.map((f) => (
              <option key={f.id} value={f.id}>
                {f.flightNumber} - {f.origin.code} ➔ {f.destination.code} ({f.aircraft.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Seat Map Layout */}
      {activeFlight && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <SeatPicker
              flight={activeFlight}
              bookings={bookings}
              selectedSeatNumber={null}
              onSelectSeat={(seat) => onBookSeat(activeFlight, seat)}
              onInspectPassenger={onInspectPassenger}
            />
          </div>

          {/* Sidebar Flight & Manifest Overview */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Plane className="w-4 h-4 text-[#0078D2]" /> Flight Specifications
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Airline</span>
                  <span className="font-extrabold text-slate-900">{activeFlight.airline} ({activeFlight.flightNumber})</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Aircraft Specs</span>
                  <span className="font-bold text-slate-900">{activeFlight.aircraft}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Route</span>
                  <span className="font-bold text-slate-900">{activeFlight.origin.city} ➔ {activeFlight.destination.city}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Terminal & Gate</span>
                  <span className="font-bold text-slate-900">Terminal {activeFlight.terminal} • Gate {activeFlight.gate}</span>
                </div>
              </div>
            </div>

            {/* Current Occupied Seats Manifest on this Flight */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-[#C41230]" /> Booked Passengers Manifest
                </h3>
                <span className="text-xs bg-red-100 text-red-800 font-extrabold px-2.5 py-0.5 rounded-full">
                  {bookings.filter((b) => b.flightId === activeFlight.id && b.status !== 'Cancelled').length} Booked
                </span>
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {bookings.filter((b) => b.flightId === activeFlight.id && b.status !== 'Cancelled').length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No occupied seats on this flight yet.</p>
                ) : (
                  bookings
                    .filter((b) => b.flightId === activeFlight.id && b.status !== 'Cancelled')
                    .map((booking) => (
                      <div
                        key={booking.id}
                        onClick={() => onInspectPassenger(booking)}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#0078D2] cursor-pointer transition flex items-center justify-between hover:bg-sky-50/50 group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-red-600 text-white font-mono font-black text-xs flex items-center justify-center shadow-sm">
                            {booking.seatNumber}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-slate-900 group-hover:text-[#0078D2]">
                              {booking.passenger.fullName}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Ticket: {booking.ticketNumber}
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-[#0078D2] bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                          {booking.cabinClass}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
