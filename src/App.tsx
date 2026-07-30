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
import { AdminAuthModal } from './components/AdminAuthModal';
import { FlightCalculatorModal } from './components/FlightCalculatorModal';

export default function App() {
  const [flights] = useState<Flight[]>(INITIAL_FLIGHTS);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  
  // Theme state: Dark mode vs Light mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aeroreserve_theme');
      if (saved) return saved === 'dark';
    } catch (e) {}
    return false;
  });

  useEffect(() => {
    try {
      localStorage.setItem('aeroreserve_theme', isDarkMode ? 'dark' : 'light');
    } catch (e) {}
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // LocalStorage persistence for bookings so user edits/new bookings persist
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem('aeroreserve_bookings');
      if (saved) {
        const parsed: Booking[] = JSON.parse(saved);
        // Deduplicate using a Map keyed by booking ID
        const bookingMap = new Map<string, Booking>();
        // First populate with INITIAL_BOOKINGS (ensures current default records are present)
        INITIAL_BOOKINGS.forEach((b) => bookingMap.set(b.id, b));
        // Then overlay saved bookings for any custom created bookings (or user modifications)
        if (Array.isArray(parsed)) {
          parsed.forEach((b) => {
            if (b && b.id) {
              // If it's a new booking created by user or updated default, set it
              bookingMap.set(b.id, b);
            }
          });
        }
        return Array.from(bookingMap.values());
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

  // User Role State: 'passenger' | 'admin'
  const [userRole, setUserRole] = useState<'passenger' | 'admin'>('passenger');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('aeroreserve_admin_auth') === 'true';
  });
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);

  const handleAdminAuthSuccess = () => {
    setIsAdminAuthenticated(true);
    localStorage.setItem('aeroreserve_admin_auth', 'true');
    setUserRole('admin');
    setActiveTab('lookup');
    setIsAdminAuthModalOpen(false);
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('aeroreserve_admin_auth');
    setUserRole('passenger');
    setActiveTab('search');
  };

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

  const handleApproveGatePass = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'Checked In',
              gatePassApproved: true,
              gatePassApprovedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              verifiedByAgent: 'AA Front Desk Desk Agent #714',
            }
          : b
      )
    );
  };

  const handleInspectPassenger = (booking: Booking) => {
    setLookupQuery(booking.seatNumber);
    setActiveTab('lookup');
  };

  const handleBookSpecificSeat = (flight: Flight, seat: Seat) => {
    setBookingFlight(flight);
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-200 selection:bg-sky-500 selection:text-white ${
      isDarkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Navbar Header */}
      <Header
        userRole={userRole}
        setUserRole={(role) => {
          if (role === 'admin' && !isAdminAuthenticated) {
            setIsAdminAuthModalOpen(true);
          } else {
            setUserRole(role);
          }
        }}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenAdminAuth={() => setIsAdminAuthModalOpen(true)}
        onAdminLogout={handleAdminLogout}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'lookup') setLookupQuery('');
        }}
        bookingCount={bookings.length}
        onQuickBookClick={() => setBookingFlight(flights[0])}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'search' && (
          <FlightSearch
            flights={flights}
            onSelectFlight={(flight) => setBookingFlight(flight)}
            onGoToLookup={() => setActiveTab('lookup')}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
          />
        )}

        {activeTab === 'lookup' && (
          <PassengerLookup
            bookings={bookings}
            flights={flights}
            userRole={userRole}
            onViewBoardingPass={(b) => setBoardingPassBooking(b)}
            onCancelBooking={handleCancelBooking}
            onApproveGatePass={handleApproveGatePass}
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
          allFlights={flights}
          onSelectFlight={(f) => setBookingFlight(f)}
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

      {/* Admin Security Auth Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onSuccess={handleAdminAuthSuccess}
      />

      {/* Global Flight Time & Duration Calculator Modal */}
      <FlightCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onBookFlight={(f) => setBookingFlight(f)}
      />
    </div>
  );
}
