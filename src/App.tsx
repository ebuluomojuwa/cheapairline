import React, { useState, useEffect } from 'react';
import { Flight, Booking, Seat, AppUser, UserRole } from './types';
import { INITIAL_FLIGHTS } from './data/mockData';
import { Header } from './components/Header';
import { FlightSearch } from './components/FlightSearch';
import { PassengerLookup } from './components/PassengerLookup';
import { SeatExplorerView } from './components/SeatExplorerView';
import { MyBookings } from './components/MyBookings';
import { BookingModal } from './components/BookingModal';
import { BoardingPassModal } from './components/BoardingPassModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { FlightCalculatorModal } from './components/FlightCalculatorModal';
import { AuthModal } from './components/AuthModal';
import { AdminUsersPage } from './components/AdminUsersPage';
import { BookingRestrictedModal } from './components/BookingRestrictedModal';
import { 
  auth, 
  db, 
  subscribeBookings, 
  addBookingToFirestore, 
  updateBookingInFirestore, 
  deleteBookingFromFirestore, 
  syncUserProfile, 
  AppUserProfile,
  SUPER_ADMIN_EMAIL,
  subscribeFlightPrices,
  updateFlightPriceInFirestore
} from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function App() {
  const [flights, setFlights] = useState<Flight[]>(() => {
    try {
      const saved = localStorage.getItem('american_airlines_flights');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_FLIGHTS;
  });
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isBookingRestrictedModalOpen, setIsBookingRestrictedModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AppUserProfile | null>(null);
  const [footerClicks, setFooterClicks] = useState<number>(0);

  const handleFooterClick = () => {
    setFooterClicks((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setIsAuthModalOpen(true);
        return 0;
      }
      return next;
    });
  };

  const isSuperAdmin = currentUser?.role === 'superadmin' || currentUser?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  const handleInitiateBooking = (flight?: Flight) => {
    if (!isSuperAdmin) {
      setIsBookingRestrictedModalOpen(true);
    } else {
      setBookingFlight(flight || flights[0]);
    }
  };

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

  // Real-time Firestore Bookings State
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    // Subscribe to Firestore bookings
    const unsub = subscribeBookings((list) => {
      setBookings(list);
    });

    return () => unsub();
  }, []);

  // Subscribe to custom flight prices from Firestore (Super Admin overrides)
  useEffect(() => {
    const unsub = subscribeFlightPrices((pricesMap) => {
      if (Object.keys(pricesMap).length > 0) {
        setFlights((prev) =>
          prev.map((f) => {
            if (pricesMap[f.id] !== undefined) {
              return { ...f, price: pricesMap[f.id] };
            }
            return f;
          })
        );
      }
    });

    return () => unsub();
  }, []);

  const handleUpdateFlightPrice = async (flightId: string, newPrice: number) => {
    // Update local state immediately
    setFlights((prev) => {
      const updated = prev.map((f) => (f.id === flightId ? { ...f, price: newPrice } : f));
      try {
        localStorage.setItem('american_airlines_flights', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Save to Firestore for real-time synchronization across all users
    try {
      await updateFlightPriceInFirestore(flightId, newPrice, currentUser?.email || 'Super Admin');
    } catch (e) {
      console.error('Error saving flight price override to Firestore:', e);
    }
  };

  const handleUpdateBookingPrice = async (bookingId: string, newPrice: number) => {
    // Update local state immediately
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, pricePaid: newPrice } : b))
    );

    // Save to Firestore for real-time synchronization across all users
    try {
      await updateBookingInFirestore(bookingId, { pricePaid: newPrice });
    } catch (e) {
      console.error('Error saving booked ticket price override to Firestore:', e);
    }
  };


  // User Role State: 'passenger' | 'admin' | 'superadmin'
  const [userRole, setUserRole] = useState<'passenger' | 'admin' | 'superadmin'>('passenger');
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await syncUserProfile(user);
          setCurrentUser(profile);
          if (profile.role === 'superadmin' || profile.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
            setUserRole('superadmin');
          } else if (profile.role === 'admin') {
            setUserRole('admin');
          } else {
            setUserRole('passenger');
          }
        } catch (e) {
          console.error('Error syncing user profile:', e);
        }
      } else {
        setCurrentUser(null);
        setUserRole('passenger');
      }
    });

    return () => unsub();
  }, []);

  const handleAuthLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserRole('passenger');
    setActiveTab('search');
  };

  const handleAdminAuthSuccess = () => {
    setUserRole('admin');
    setActiveTab('lookup');
    setIsAdminAuthModalOpen(false);
  };

  // Navigation State
  const [activeTab, setActiveTab] = useState<'search' | 'lookup' | 'seat-explorer' | 'my-bookings' | 'admin-users'>('search');
  const [lookupQuery, setLookupQuery] = useState<string>('');

  // Modals
  const [bookingFlight, setBookingFlight] = useState<Flight | null>(null);
  const [boardingPassBooking, setBoardingPassBooking] = useState<Booking | null>(null);

  // Handlers for Firestore CRUD
  const handleBookingComplete = async (newBooking: Booking) => {
    try {
      await addBookingToFirestore(newBooking);
    } catch (e) {
      console.error('Failed to add booking to Firestore, maintaining local fallback:', e);
      setBookings((prev) => [newBooking, ...prev]);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await updateBookingInFirestore(bookingId, { status: 'Cancelled' });
    } catch (e) {
      console.error('Failed to update booking status in Firestore:', e);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    }
  };

  const handleApproveGatePass = async (bookingId: string) => {
    const updates: Partial<Booking> = {
      status: 'Checked In',
      gatePassApproved: true,
      gatePassApprovedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      verifiedByAgent: currentUser ? `${currentUser.displayName} (${currentUser.role})` : 'AA Front Desk Agent #714',
    };

    try {
      await updateBookingInFirestore(bookingId, updates);
    } catch (e) {
      console.error('Failed to update gate pass in Firestore:', e);
    }
  };

  const handleInspectPassenger = (booking: Booking) => {
    setLookupQuery(booking.ticketNumber || booking.seatNumber);
    setActiveTab('lookup');
  };

  const handleBookSpecificSeat = (flight: Flight, seat: Seat) => {
    handleInitiateBooking(flight);
  };

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden font-sans flex flex-col transition-colors duration-200 selection:bg-sky-500 selection:text-white ${
      isDarkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Navbar Header */}
      <Header
        userRole={userRole}
        setUserRole={setUserRole}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleAuthLogout}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'lookup') setLookupQuery('');
        }}
        bookingCount={bookings.length}
        onQuickBookClick={() => handleInitiateBooking(flights[0])}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16 w-full max-w-full overflow-x-hidden">
        {activeTab === 'search' && (
          <FlightSearch
            flights={flights}
            onSelectFlight={(flight) => handleInitiateBooking(flight)}
            onGoToLookup={() => setActiveTab('lookup')}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
            currentUser={currentUser}
            onGoToSuperAdminPortal={() => setActiveTab('admin-users')}
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
            currentUser={currentUser}
          />
        )}

        {activeTab === 'my-bookings' && (
          <MyBookings
            bookings={bookings}
            onViewBoardingPass={(b) => setBoardingPassBooking(b)}
            onCancelBooking={handleCancelBooking}
            onInspectPassenger={handleInspectPassenger}
            currentUser={currentUser}
            onUpdateBookingPrice={handleUpdateBookingPrice}
          />
        )}

        {activeTab === 'admin-users' && (
          <AdminUsersPage
            currentUser={currentUser}
            flights={flights}
            bookings={bookings}
            onUpdateFlightPrice={handleUpdateFlightPrice}
            onUpdateBookingPrice={handleUpdateBookingPrice}
            onBookFlight={(flight) => handleInitiateBooking(flight)}
          />
        )}
      </main>

      {/* Footer */}
      <footer 
        onClick={handleFooterClick}
        className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8 px-4 text-center space-y-2 cursor-pointer select-none transition hover:bg-slate-850"
        title="Click 5 times to open Sign In / Authentication portal"
      >
        <p className="font-semibold text-slate-300">American Airlines • Flight Reservation & Ticket System</p>
        <p className="text-slate-500">
          Search by Ticket Number (e.g. 001-9482-7710) or Passenger Name to view flight tickets & duration.
        </p>
        {footerClicks > 0 && footerClicks < 5 && (
          <p className="text-[11px] font-bold text-sky-400 font-mono animate-pulse pt-1">
            🔒 Sign In Access: Click {5 - footerClicks} more time{5 - footerClicks > 1 ? 's' : ''} to open authentication
          </p>
        )}
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
          currentUser={currentUser}
        />
      )}

      {/* Boarding Pass Modal */}
      {boardingPassBooking && (
        <BoardingPassModal
          booking={boardingPassBooking}
          onClose={() => setBoardingPassBooking(null)}
        />
      )}

      {/* Auth Modal for optional user sign up / sign in */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => setIsAuthModalOpen(false)}
        onSetUser={(u) => {
          setCurrentUser(u);
          if (u.role === 'superadmin') setUserRole('superadmin');
        }}
      />

      {/* Restricted Booking Modal */}
      <BookingRestrictedModal
        isOpen={isBookingRestrictedModalOpen}
        onClose={() => setIsBookingRestrictedModalOpen(false)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

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
        onBookFlight={(f) => handleInitiateBooking(f)}
      />
    </div>
  );
}
