import React, { useState, useEffect } from 'react';
import { Flight, Booking, Seat } from './types';
import { INITIAL_FLIGHTS, INITIAL_BOOKINGS } from './data/mockData';
import { Header } from './components/Header';
import { FlightSearch } from './components/FlightSearch';
import { PassengerLookup } from './components/PassengerLookup';
import { SeatExplorerView } from './components/SeatExplorerView';
import { MyBookings } from './components/MyBookings';
import { BookingModal } from './components/BookingModal';
import { BoardingPassModal } from './components/BoardingPassModal';

export default function App() {
  const [flights] = useState<Flight[]>(INITIAL_FLIGHTS);
  
  // LocalStorage persistence for bookings so user edits/new bookings persist
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem('aeroreserve_bookings');
      if (saved) {
        const parsed: Booking[] = JSON.parse(saved);
        // Ensure default INITIAL_BOOKINGS (like Elizabeth Gutierrez 001-9482-7710) are always present
        const existingTicketNumbers = new Set(parsed.map((b) => b.ticketNumber));
        const missingDefaults = INITIAL_BOOKINGS.filter((b) => !existingTicketNumbers.has(b.ticketNumber));
        return [...parsed, ...missingDefaults];
      }
    } catch (e) {
      console.error('Failed to load saved bookings', e);
    }
    return INITIAL_BOOKINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('aeroreserve_bookings', JSON.stringify(bookings));
    } catch (e) {
      console.error('Failed to save bookings', e);
    }
  }, [bookings]);

  // Navigation State
  const [activeTab, setActiveTab] = useState<'search' | 'lookup' | 'seat-explorer' | 'my-bookings'>('search');
  const [lookupQuery, setLookupQuery] = useState<string>('');

  // Modals
  const [bookingFlight, setBookingFlight] = useState<Flight | null>(null);
  const [boardingPassBooking, setBoardingPassBooking] = useState<Booking | null>(null);

  // Handlers
  const handleBookingComplete = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  const handleInspectPassenger = (booking: Booking) => {
    setLookupQuery(booking.seatNumber);
    setActiveTab('lookup');
  };

  const handleBookSpecificSeat = (flight: Flight, seat: Seat) => {
    setBookingFlight(flight);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Navbar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'lookup') setLookupQuery('');
        }}
        bookingCount={bookings.length}
        onQuickBookClick={() => setBookingFlight(flights[0])}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'search' && (
          <FlightSearch
            flights={flights}
            onSelectFlight={(flight) => setBookingFlight(flight)}
            onGoToLookup={() => setActiveTab('lookup')}
          />
        )}

        {activeTab === 'lookup' && (
          <PassengerLookup
            bookings={bookings}
            flights={flights}
            onViewBoardingPass={(b) => setBoardingPassBooking(b)}
            onCancelBooking={handleCancelBooking}
            initialQuery={lookupQuery}
          />
        )}

        {activeTab === 'seat-explorer' && (
          <SeatExplorerView
            flights={flights}
            bookings={bookings}
            onBookSeat={handleBookSpecificSeat}
            onInspectPassenger={handleInspectPassenger}
          />
        )}

        {activeTab === 'my-bookings' && (
          <MyBookings
            bookings={bookings}
            onViewBoardingPass={(b) => setBoardingPassBooking(b)}
            onCancelBooking={handleCancelBooking}
            onInspectPassenger={handleInspectPassenger}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8 px-4 text-center space-y-2">
        <p className="font-semibold text-slate-300">AeroReserve • Flight Booking & Seat Lookup System</p>
        <p className="text-slate-500">
          Enter any seat number (e.g. 01A, 12F) or ticket number to view complete passenger manifests.
        </p>
      </footer>

      {/* Booking Flow Modal */}
      {bookingFlight && (
        <BookingModal
          flight={bookingFlight}
          bookings={bookings}
          onClose={() => setBookingFlight(null)}
          onBookingComplete={handleBookingComplete}
          onInspectPassenger={handleInspectPassenger}
        />
      )}

      {/* Boarding Pass Modal */}
      {boardingPassBooking && (
        <BoardingPassModal
          booking={boardingPassBooking}
          onClose={() => setBoardingPassBooking(null)}
        />
      )}
    </div>
  );
}
