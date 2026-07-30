import React, { useState } from 'react';
import { Booking } from '../types';
import { Ticket, Search, User, Armchair, Plane, Printer, XCircle, Clock, Calendar, Utensils, Luggage, Award } from 'lucide-react';
import { AmericanAirlinesLogo } from './AmericanAirlinesLogo';

interface MyBookingsProps {
  bookings: Booking[];
  onViewBoardingPass: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
  onInspectPassenger: (booking: Booking) => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({
  bookings,
  onViewBoardingPass,
  onCancelBooking,
  onInspectPassenger,
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  const filtered = bookings.filter((b) => {
    const q = searchFilter.toLowerCase();
    if (!q) return true;
    return (
      b.ticketNumber.toLowerCase().includes(q) ||
      b.seatNumber.toLowerCase().includes(q) ||
      b.passenger.fullName.toLowerCase().includes(q) ||
      b.flightNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#001E42] via-[#002D62] to-[#00152E] border border-slate-700/80 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 text-sky-300 border border-slate-600/60 text-xs font-bold shadow-sm">
            <AmericanAirlinesLogo size="sm" variant="dark-bg" />
            <span className="text-slate-400">|</span>
            <span className="flex items-center gap-1 text-emerald-400 font-extrabold">
              <Ticket className="w-3.5 h-3.5" /> Issued Flagship® Tickets & Manifests
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Manage Booked Flights & Passenger Profiles
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Review active reservations, seat numbers, passenger passports, and issue electronic boarding passes instantly.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter by seat (01A), name, ticket #..."
            className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-600 bg-[#00152E] text-white text-xs font-medium outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
          />
        </div>
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3 shadow-md">
          <Ticket className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="font-bold text-slate-700 dark:text-slate-200 text-lg">No Bookings Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">There are no passenger bookings matching your search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((booking) => (
            <div
              key={booking.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#001E42] to-[#002D62] text-white p-5 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center font-black text-sky-300 text-sm">
                    {booking.flightNumber}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">{booking.airline}</h3>
                    <p className="text-[11px] text-slate-300 font-mono">{booking.aircraft}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-amber-400 flex items-center justify-end gap-1">
                    <Armchair className="w-4 h-4 text-amber-400" />
                    {booking.seatNumber}
                  </span>
                  <span className="text-[10px] text-slate-300 font-mono block">Ticket: {booking.ticketNumber}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Passenger</span>
                    <button
                      onClick={() => onInspectPassenger(booking)}
                      className="text-base font-black text-slate-900 dark:text-slate-100 hover:text-[#0078D2] dark:hover:text-sky-300 transition text-left"
                    >
                      {booking.passenger.fullName}
                    </button>
                  </div>

                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold border border-emerald-200 dark:border-emerald-800">
                    {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Route</span>
                    <span className="font-black text-slate-800 dark:text-slate-200">{booking.origin.code} ➔ {booking.destination.code}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{booking.origin.city} to {booking.destination.city}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Cabin Class</span>
                    <span className="font-extrabold text-[#0078D2] dark:text-sky-300">{booking.cabinClass}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">${booking.pricePaid} Paid</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <span className="flex items-center gap-1">
                    <Utensils className="w-3.5 h-3.5 text-amber-500" />
                    {booking.passenger.mealPreference}
                  </span>
                  <span className="flex items-center gap-1">
                    <Luggage className="w-3.5 h-3.5 text-sky-500" />
                    {booking.passenger.baggageCount} Bag(s)
                  </span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => onViewBoardingPass(booking)}
                  className="flex-1 bg-[#0078D2] hover:bg-[#0060A9] text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-sky-600/20"
                >
                  <Printer className="w-3.5 h-3.5 text-sky-200" /> Boarding Pass
                </button>

                <button
                  onClick={() => onInspectPassenger(booking)}
                  className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-3.5 rounded-xl text-xs transition"
                >
                  Inspect
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to cancel booking ${booking.ticketNumber}?`)) {
                      onCancelBooking(booking.id);
                    }
                  }}
                  className="bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold py-2.5 px-3 rounded-xl text-xs transition border border-rose-200 dark:border-rose-800/60 flex items-center gap-1"
                  title="Cancel Ticket"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
