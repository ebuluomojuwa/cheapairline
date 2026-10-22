import React, { useState, useEffect, useMemo } from 'react';
import { Flight, Booking, Seat, AppUser, UserRole } from './types';
import { INITIAL_FLIGHTS, INITIAL_BOOKINGS } from './data/mockData';
import { Header } from './components/Header';
import { FlightSearch } from './components/FlightSearch';
import { FlightTrackerView } from './components/FlightTrackerView';
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
  isSuperAdminEmail,
  subscribeFlightPrices,
  updateFlightPriceInFirestore,
  subscribeFlightStatuses,
  updateFlightStatusInFirestore,
  clearFlightBookingsInFirestore
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

  const isSuperAdmin = currentUser?.role === 'superadmin' || isSuperAdminEmail(currentUser?.email);

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

  // Real-time Firestore Bookings State with instant localStorage fallback
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem('american_airlines_bookings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_BOOKINGS;
  });

  const superAdminBookingsCount = useMemo(() => {
    return bookings.filter((b) => 
      b.isSuperAdminBooking === true || 
      b.bookedByRole === 'superadmin' || 
      isSuperAdminEmail(b.bookedByEmail) || 
      isSuperAdminEmail(b.passenger?.email)
    ).length;
  }, [bookings]);

  useEffect(() => {
    // Subscribe to Firestore bookings
    const unsub = subscribeBookings((list) => {
      // Merge incoming Firestore list with any local bookings so freshly booked tickets are never lost
      setBookings((prev) => {
        const map = new Map<string, Booking>();
        // First add all incoming from Firestore
        list.forEach((b) => map.set(b.id, b));
        // Keep any recent local ones not yet returned by Firestore
        prev.forEach((b) => {
          if (!map.has(b.id)) map.set(b.id, b);
        });
        const combined = Array.from(map.values());
        try {
          localStorage.setItem('american_airlines_bookings', JSON.stringify(combined));
        } catch (e) {}
        return combined;
      });

      // Auto-reconstruct and merge any flights from bookings that aren't yet in flights state
      setFlights((prevFlights) => {
        let changed = false;
        const updated = [...prevFlights];
        list.forEach((b) => {
          if (!updated.some((f) => f.id === b.flightId || f.flightNumber.toLowerCase() === b.flightNumber.toLowerCase())) {
            updated.push({
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
            changed = true;
          }
        });
        if (changed) {
          try {
            localStorage.setItem('american_airlines_flights', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        }
        return prevFlights;
      });
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

  // Subscribe to flight statuses from Firestore (Super Admin overrides)
  useEffect(() => {
    const unsub = subscribeFlightStatuses((statusesMap) => {
      if (Object.keys(statusesMap).length > 0) {
        setFlights((prev) =>
          prev.map((f) => {
            if (statusesMap[f.id]) {
              return { ...f, status: statusesMap[f.id] };
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

  const handleClearFlightSeats = async (flightId: string) => {
    const targetFlight = flights.find((f) => f.id === flightId);
    if (!targetFlight) return;

    // Clear local bookings state for this flight
    setBookings((prev) => prev.filter((b) => b.flightId !== flightId && b.flightNumber !== targetFlight.flightNumber));

    // Clear Firestore bookings for this flight
    try {
      await clearFlightBookingsInFirestore(flightId, targetFlight.flightNumber);
    } catch (e) {
      console.error('Error clearing flight bookings in Firestore:', e);
    }
  };

  const handleUpdateFlightStatus = async (flightId: string, newStatus: Flight['status']) => {
    // Update local state
    setFlights((prev) => {
      const updated = prev.map((f) => (f.id === flightId ? { ...f, status: newStatus } : f));
      try {
        localStorage.setItem('american_airlines_flights', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Save to Firestore for real-time sync
    try {
      await updateFlightStatusInFirestore(flightId, newStatus, currentUser?.email || 'Super Admin');
    } catch (e) {
      console.error('Error saving flight status override to Firestore:', e);
    }

    // If marked as 'Unbooked' or 'Completed', automatically release/clear all booked seats
    if (newStatus === 'Unbooked' || newStatus === 'Completed') {
      await handleClearFlightSeats(flightId);
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
  const [activeTab, setActiveTab] = useState<'search' | 'tracker' | 'lookup' | 'seat-explorer' | 'my-bookings' | 'admin-users'>('search');
  const [lookupQuery, setLookupQuery] = useState<string>('');
  const [trackerFlightId, setTrackerFlightId] = useState<string>('fl-101');
  const [trackerQuery, setTrackerQuery] = useState<string>('');

  const handleTrackFlight = (flightOrBookingOrId: Flight | Booking | string, queryParam?: string) => {
    let targetFlightId = '';
    let targetQuery = '';
    let targetFlightObj: Flight | null = null;

    if (typeof flightOrBookingOrId === 'object' && flightOrBookingOrId !== null) {
      if ('ticketNumber' in flightOrBookingOrId) {
        // It's a Booking object
        const b = flightOrBookingOrId as Booking;
        targetFlightId = b.flightId;
        targetQuery = queryParam || b.flightNumber;
        targetFlightObj = {
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
        };
      } else {
        // It's a Flight object
        const f = flightOrBookingOrId as Flight;
        targetFlightId = f.id;
        targetQuery = queryParam || f.flightNumber;
        targetFlightObj = f;
      }
    } else if (typeof flightOrBookingOrId === 'string') {
      const cleanTarget = flightOrBookingOrId.trim();
      const cleanTargetNoSpace = cleanTarget.toLowerCase().replace(/[\s-]/g, '');

      // Check existing flights
      const foundInFlights = flights.find(
        (f) =>
          f.id === cleanTarget ||
          f.flightNumber.toLowerCase() === cleanTarget.toLowerCase() ||
          f.flightNumber.toLowerCase().replace(/[\s-]/g, '') === cleanTargetNoSpace
      );

      if (foundInFlights) {
        targetFlightId = foundInFlights.id;
        targetQuery = queryParam || foundInFlights.flightNumber;
        targetFlightObj = foundInFlights;
      } else {
        // Check bookings from current state AND localStorage
        let allKnownBookings = [...bookings];
        try {
          const cached = localStorage.getItem('american_airlines_bookings');
          if (cached) {
            const parsed: Booking[] = JSON.parse(cached);
            allKnownBookings = [...allKnownBookings, ...parsed];
          }
        } catch (e) {}

        const foundInBooking = allKnownBookings.find(
          (b) =>
            b.flightId === cleanTarget ||
            b.flightNumber.toLowerCase() === cleanTarget.toLowerCase() ||
            b.flightNumber.toLowerCase().replace(/[\s-]/g, '') === cleanTargetNoSpace ||
            b.ticketNumber.toLowerCase().includes(cleanTarget.toLowerCase()) ||
            b.ticketNumber.toLowerCase().replace(/[\s-]/g, '').includes(cleanTargetNoSpace) ||
            b.confirmationCode.toLowerCase() === cleanTarget.toLowerCase() ||
            b.confirmationCode.toLowerCase().replace(/[\s-]/g, '') === cleanTargetNoSpace ||
            b.passenger.fullName.toLowerCase().includes(cleanTarget.toLowerCase())
        );

        if (foundInBooking) {
          targetFlightId = foundInBooking.flightId;
          targetQuery = queryParam || foundInBooking.flightNumber;

          targetFlightObj = {
            id: foundInBooking.flightId,
            flightNumber: foundInBooking.flightNumber,
            airline: foundInBooking.airline || 'American Airlines',
            airlineCode: 'AA',
            aircraft: foundInBooking.aircraft || 'Boeing 787-9 Dreamliner',
            origin: foundInBooking.origin,
            destination: foundInBooking.destination,
            departureTime: foundInBooking.departureTime,
            arrivalTime: foundInBooking.arrivalTime,
            duration: foundInBooking.duration || '8h 00m',
            price: foundInBooking.pricePaid || 650,
            totalSeats: 180,
            availableSeats: 140,
            terminal: foundInBooking.terminal || 'T8',
            gate: foundInBooking.gate || 'B20',
            status: 'On Time',
          };
        } else {
          // If query looks like a flight number, synthesize flight so radar never shows a dead end
          const numMatch = cleanTarget.match(/(?:AA[-\s]?)?(\d+)/i);
          if (numMatch) {
            const num = numMatch[1];
            const synthNum = `AA-${num}`;
            targetFlightId = `fl-track-${num}`;
            targetQuery = queryParam || synthNum;
            targetFlightObj = {
              id: targetFlightId,
              flightNumber: synthNum,
              airline: 'American Airlines',
              airlineCode: 'AA',
              aircraft: 'Boeing 787-9 Dreamliner',
              origin: { code: 'DFW', city: 'Dallas / Fort Worth', airport: 'Dallas/Fort Worth International', country: 'United States', state: 'Texas' },
              destination: { code: 'LHR', city: 'London', airport: 'Heathrow Airport', country: 'United Kingdom' },
              departureTime: new Date().toISOString(),
              arrivalTime: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
              duration: '8h 15m',
              price: 650,
              totalSeats: 180,
              availableSeats: 140,
              terminal: 'T8',
              gate: 'B22',
              status: 'On Time',
            };
          } else {
            targetFlightId = flights[0]?.id || 'fl-101';
            targetQuery = '';
          }
        }
      }
    }

    // Ensure the tracked flight is immediately registered into flights state & localStorage
    if (targetFlightObj) {
      setFlights((prev) => {
        const withoutTarget = prev.filter(
          (f) =>
            f.id !== targetFlightObj!.id &&
            f.flightNumber.toLowerCase().replace(/[\s-]/g, '') !== targetFlightObj!.flightNumber.toLowerCase().replace(/[\s-]/g, '')
        );
        const updated = [targetFlightObj!, ...withoutTarget];
        try {
          localStorage.setItem('american_airlines_flights', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }

    if (targetFlightId) setTrackerFlightId(targetFlightId);
    if (targetQuery) setTrackerQuery(targetQuery);
    setActiveTab('tracker');
  };

  // Modals
  const [bookingFlight, setBookingFlight] = useState<Flight | null>(null);
  const [boardingPassBooking, setBoardingPassBooking] = useState<Booking | null>(null);

  // Handlers for Firestore CRUD
  const handleBookingComplete = async (newBooking: Booking) => {
    // 1. Immediately update local bookings state and localStorage synchronously
    setBookings((prev) => {
      const updated = [newBooking, ...prev.filter((b) => b.id !== newBooking.id)];
      try {
        localStorage.setItem('american_airlines_bookings', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 2. Reconstruct the booked flight and add it to flights state and localStorage immediately
    const bookedFlight: Flight = {
      id: newBooking.flightId,
      flightNumber: newBooking.flightNumber,
      airline: newBooking.airline || 'American Airlines',
      airlineCode: 'AA',
      aircraft: newBooking.aircraft || 'Boeing 787-9 Dreamliner',
      origin: newBooking.origin,
      destination: newBooking.destination,
      departureTime: newBooking.departureTime,
      arrivalTime: newBooking.arrivalTime,
      duration: newBooking.duration || '8h 00m',
      price: newBooking.pricePaid || 650,
      totalSeats: 180,
      availableSeats: Math.max(0, 180 - (newBooking.passengerCount || 1)),
      terminal: newBooking.terminal || 'T8',
      gate: newBooking.gate || 'B20',
      status: 'On Time',
    };

    setFlights((prev) => {
      const withoutSame = prev.filter(
        (f) =>
          f.id !== bookedFlight.id &&
          f.flightNumber.toLowerCase().replace(/[\s-]/g, '') !== bookedFlight.flightNumber.toLowerCase().replace(/[\s-]/g, '')
      );
      const updated = [bookedFlight, ...withoutSame];
      try {
        localStorage.setItem('american_airlines_flights', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 3. Immediately pre-set the tracker so that navigating to Live Radar tracks this booked flight
    setTrackerFlightId(newBooking.flightId);
    setTrackerQuery(newBooking.flightNumber);

    // 4. Save to Firestore asynchronously
    try {
      await addBookingToFirestore(newBooking);
    } catch (e) {
      console.warn('Booking preserved in local state, Firestore background write error:', e);
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
        superAdminBookingCount={superAdminBookingsCount}
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
            onTrackFlight={(flight) => handleTrackFlight(flight)}
            currentUser={currentUser}
            onGoToSuperAdminPortal={() => setActiveTab('admin-users')}
          />
        )}

        {activeTab === 'tracker' && (
          <FlightTrackerView
            flights={flights}
            bookings={bookings}
            initialFlightId={trackerFlightId}
            initialQuery={trackerQuery}
            onSelectFlightForBooking={(flight) => handleInitiateBooking(flight)}
            onViewSeatMap={(flight) => {
              setActiveTab('seat-explorer');
            }}
            onViewBoardingPass={(b) => setBoardingPassBooking(b)}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
            onGoToManifests={(queryText) => {
              setLookupQuery(queryText);
              setActiveTab('lookup');
            }}
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
            onTrackFlight={(flight) => handleTrackFlight(flight)}
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
            onUpdateFlightStatus={handleUpdateFlightStatus}
            onClearFlightSeats={handleClearFlightSeats}
          />
        )}

        {activeTab === 'my-bookings' && (
          <MyBookings
            bookings={bookings}
            onViewBoardingPass={(b) => setBoardingPassBooking(b)}
            onCancelBooking={handleCancelBooking}
            onInspectPassenger={handleInspectPassenger}
            onTrackFlight={(flightId, flightNumber) => handleTrackFlight(flightId, flightNumber)}
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
            onUpdateFlightStatus={handleUpdateFlightStatus}
            onClearFlightSeats={handleClearFlightSeats}
            onBookFlight={(flight) => handleInitiateBooking(flight)}
            onViewBoardingPass={(b) => setBoardingPassBooking(b)}
            onCancelBooking={handleCancelBooking}
            onTrackFlight={(flight) => handleTrackFlight(flight)}
            onInspectPassenger={handleInspectPassenger}
          />
        )}
      </main>

      {/* Footer */}
      <footer 
        onClick={handleFooterClick}
        className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8 px-4 text-center space-y-2 cursor-pointer select-none transition hover:bg-slate-850"
      >
        <p className="font-semibold text-slate-300">American Airlines • Flight Reservation & Ticket System</p>
        <p className="text-slate-500">
          Search by Ticket Number (e.g. 001-9482-7710) or Passenger Name to view flight tickets & duration.
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
          currentUser={currentUser}
          onUpdateFlightPrice={handleUpdateFlightPrice}
          onTrackFlight={(flightId, flightNumber) => handleTrackFlight(flightId, flightNumber)}
          onViewBoardingPass={(b) => setBoardingPassBooking(b)}
        />
      )}

      {/* Boarding Pass Modal */}
      {boardingPassBooking && (
        <BoardingPassModal
          booking={boardingPassBooking}
          onClose={() => setBoardingPassBooking(null)}
          onTrackFlight={(flightId, flightNumber) => handleTrackFlight(flightId, flightNumber)}
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
