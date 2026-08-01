import React, { useState } from 'react';
import { Flight, Booking, Seat, CabinClass } from '../types';
import { generateFlightSeats } from '../data/mockData';
import { Armchair, User, Ticket, Check, ShieldAlert, Sparkles, Info, Crown, Briefcase, Award } from 'lucide-react';

interface SeatPickerProps {
  flight: Flight;
  bookings: Booking[];
  selectedSeatNumber: string | null;
  onSelectSeat: (seat: Seat) => void;
  onInspectPassenger: (booking: Booking) => void;
  isSuperAdmin?: boolean;
}

export const SeatPicker: React.FC<SeatPickerProps> = ({
  flight,
  bookings,
  selectedSeatNumber,
  onSelectSeat,
  onInspectPassenger,
  isSuperAdmin = false,
}) => {
  const seats = generateFlightSeats(flight, bookings);
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);

  // Group seats by row
  const rowsMap = new Map<number, Seat[]>();
  seats.forEach((s) => {
    if (!rowsMap.has(s.row)) {
      rowsMap.set(s.row, []);
    }
    rowsMap.get(s.row)!.push(s);
  });

  const rowNumbers = Array.from(rowsMap.keys()).sort((a, b) => a - b);

  // Helper to find booking for an occupied seat
  const getBookingForSeat = (seatNumber: string): Booking | undefined => {
    return bookings.find(
      (b) => b.flightId === flight.id && b.seatNumber === seatNumber && b.status !== 'Cancelled'
    );
  };

  const getSeatColor = (seat: Seat) => {
    if (selectedSeatNumber === seat.seatNumber) {
      return 'bg-amber-400 border-amber-500 text-slate-950 font-bold shadow-md shadow-amber-400/40 ring-2 ring-amber-300 scale-105';
    }
    if (seat.isBooked) {
      return 'bg-rose-100 border-rose-300 text-rose-800 hover:bg-rose-200 hover:border-rose-400 cursor-pointer';
    }
    switch (seat.cabinClass) {
      case 'First':
        return 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 hover:border-amber-400';
      case 'Business':
        return 'bg-indigo-50 border-indigo-300 text-indigo-900 hover:bg-indigo-100 hover:border-indigo-400';
      case 'Premium Economy':
        return 'bg-sky-50 border-sky-300 text-sky-900 hover:bg-sky-100 hover:border-sky-400';
      default:
        return 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100 hover:border-emerald-400';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-md bg-slate-900 text-sky-400">
              {flight.flightNumber}
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{flight.airline} Seat Map</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {flight.aircraft} • {flight.origin.code} to {flight.destination.code}
          </p>
        </div>

        {/* Selected Seat Banner */}
        {selectedSeatNumber ? (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/60 dark:to-orange-950/60 border border-amber-200 dark:border-amber-800/80 p-3 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black font-mono flex items-center justify-center text-lg shadow-sm">
              {selectedSeatNumber}
            </div>
            <div>
              <div className="text-xs text-amber-900 dark:text-amber-200 font-bold">Selected Seat</div>
              <div className="text-[11px] text-amber-700 dark:text-amber-400">
                Fare Modifier: +$
                {seats.find((s) => s.seatNumber === selectedSeatNumber)?.priceModifier || 0}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>
              {isSuperAdmin
                ? 'Super Admin Mode: Click any empty seat to issue a ticket, or click a red seat to inspect passenger.'
                : 'Seat Map Reference: Booking & seat reservation are strictly restricted to Super Admin.'}
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80">
        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
          <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-400" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
          <span className="w-3.5 h-3.5 rounded bg-amber-400 border border-amber-500 ring-1 ring-amber-300" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
          <span className="w-3.5 h-3.5 rounded bg-rose-200 border border-rose-400" />
          <span>Booked (Occupied)</span>
        </div>
        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
        <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
          <Crown className="w-3.5 h-3.5" /> First (1-3)
        </div>
        <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-semibold">
          <Briefcase className="w-3.5 h-3.5" /> Business (4-8)
        </div>
        <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400 font-semibold">
          <Award className="w-3.5 h-3.5" /> Premium Eco (9-12)
        </div>
      </div>

      {/* Aircraft Shell */}
      <div className="relative max-w-md mx-auto bg-slate-100 dark:bg-slate-950/80 border-2 border-slate-300 dark:border-slate-800 rounded-[50px] p-4 sm:p-6 shadow-inner space-y-6">
        {/* Cockpit Nose Graphic */}
        <div className="w-24 h-16 bg-slate-800 rounded-t-full mx-auto flex flex-col items-center justify-center text-white text-[10px] tracking-widest uppercase font-mono shadow-md border-t-2 border-slate-600">
          <span>COCKPIT</span>
          <span className="text-[8px] text-sky-400">FRONT</span>
        </div>

        {/* Seat Column Header Letters */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 pb-2 border-b border-slate-300">
          <div>A</div>
          <div>B</div>
          <div>C</div>
          <div className="text-[10px] text-slate-400 uppercase font-mono">Row</div>
          <div>D</div>
          <div>E</div>
          <div>F</div>
        </div>

        {/* Seat Rows */}
        <div className="space-y-2">
          {rowNumbers.map((rowNum) => {
            const rowSeats = rowsMap.get(rowNum) || [];
            const isExitRow = rowNum === 13 || rowNum === 14;

            // Divide into left (A,B,C) and right (D,E,F)
            const leftSeats = rowSeats.filter((s) => ['A', 'B', 'C'].includes(s.letter));
            const rightSeats = rowSeats.filter((s) => ['D', 'E', 'F'].includes(s.letter));

            return (
              <div key={rowNum} className="relative">
                {/* Cabin Class Banner Header if row start */}
                {rowNum === 1 && (
                  <div className="text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded text-center mb-1">
                    👑 First Class Suites
                  </div>
                )}
                {rowNum === 4 && (
                  <div className="text-[11px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded text-center mb-1 mt-3">
                    💼 Business Class Flatbeds
                  </div>
                )}
                {rowNum === 9 && (
                  <div className="text-[11px] font-bold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded text-center mb-1 mt-3">
                    ⭐️ Premium Economy
                  </div>
                )}
                {rowNum === 13 && (
                  <div className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded text-center mb-1 mt-3">
                    ⚡ Exit Row Extra Legroom
                  </div>
                )}

                <div className="grid grid-cols-7 gap-1 items-center">
                  {/* Left seats A, B, C */}
                  {['A', 'B', 'C'].map((lettr) => {
                    const seat = leftSeats.find((s) => s.letter === lettr);
                    if (!seat) return <div key={lettr} />;
                    const booking = seat.isBooked ? getBookingForSeat(seat.seatNumber) : undefined;

                    return (
                      <button
                        key={seat.seatNumber}
                        onClick={() => {
                          if (seat.isBooked) {
                            if (booking) onInspectPassenger(booking);
                          } else {
                            onSelectSeat(seat);
                          }
                        }}
                        onMouseEnter={() => setHoveredSeat(seat)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        title={
                          seat.isBooked
                            ? `Occupied by ${booking?.passenger.fullName || 'Passenger'} (Ticket #${booking?.ticketNumber || 'N/A'})`
                            : `Seat ${seat.seatNumber} (${seat.cabinClass}) - Click to select`
                        }
                        className={`h-9 sm:h-10 rounded-lg border text-xs font-mono font-semibold flex flex-col items-center justify-center transition-all ${getSeatColor(
                          seat
                        )}`}
                      >
                        <Armchair className="w-3.5 h-3.5 opacity-80" />
                        <span className="text-[10px]">{seat.letter}</span>
                      </button>
                    );
                  })}

                  {/* Middle Row Number */}
                  <div className="text-center font-mono font-bold text-xs text-slate-500 py-1 bg-slate-200/60 rounded">
                    {rowNum < 10 ? `0${rowNum}` : rowNum}
                  </div>

                  {/* Right seats D, E, F */}
                  {['D', 'E', 'F'].map((lettr) => {
                    const seat = rightSeats.find((s) => s.letter === lettr);
                    if (!seat) return <div key={lettr} />;
                    const booking = seat.isBooked ? getBookingForSeat(seat.seatNumber) : undefined;

                    return (
                      <button
                        key={seat.seatNumber}
                        onClick={() => {
                          if (seat.isBooked) {
                            if (booking) onInspectPassenger(booking);
                          } else {
                            onSelectSeat(seat);
                          }
                        }}
                        onMouseEnter={() => setHoveredSeat(seat)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        title={
                          seat.isBooked
                            ? `Occupied by ${booking?.passenger.fullName || 'Passenger'} (Ticket #${booking?.ticketNumber || 'N/A'})`
                            : `Seat ${seat.seatNumber} (${seat.cabinClass}) - Click to select`
                        }
                        className={`h-9 sm:h-10 rounded-lg border text-xs font-mono font-semibold flex flex-col items-center justify-center transition-all ${getSeatColor(
                          seat
                        )}`}
                      >
                        <Armchair className="w-3.5 h-3.5 opacity-80" />
                        <span className="text-[10px]">{seat.letter}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Aircraft Tail */}
        <div className="w-32 h-10 bg-slate-800 rounded-b-3xl mx-auto flex items-center justify-center text-white text-[10px] font-mono tracking-widest">
          TAIL / REAR
        </div>
      </div>

      {/* Hover Information Box */}
      {hoveredSeat && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg border border-slate-800 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 font-mono font-black flex items-center justify-center text-sm border border-sky-400/30">
                {hoveredSeat.seatNumber}
              </span>
              <div>
                <h4 className="text-sm font-bold">{hoveredSeat.cabinClass} Class</h4>
                <p className="text-[11px] text-slate-400">
                  {hoveredSeat.isWindow ? 'Window Seat' : hoveredSeat.isAisle ? 'Aisle Seat' : 'Middle Seat'}
                  {hoveredSeat.isExitRow && ' • Extra Legroom Exit Row'}
                </p>
              </div>
            </div>

            {hoveredSeat.isBooked ? (
              <div className="text-right">
                <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold inline-block">
                  Occupied
                </span>
                {getBookingForSeat(hoveredSeat.seatNumber) && (
                  <p className="text-[11px] text-amber-300 font-medium mt-1">
                    Passenger: {getBookingForSeat(hoveredSeat.seatNumber)?.passenger.fullName}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-right">
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold inline-block">
                  Available
                </span>
                <p className="text-xs font-bold text-sky-400 mt-0.5">
                  Total Fare: ${flight.price + hoveredSeat.priceModifier}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
