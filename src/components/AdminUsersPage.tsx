import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Users, 
  UserCheck, 
  Search, 
  Crown, 
  Building2, 
  Lock, 
  CheckCircle2, 
  Mail, 
  DollarSign,
  Plane,
  Save,
  Tag,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Sliders,
  Check,
  Ticket,
  Receipt,
  Eye,
  Trash2,
  Copy,
  Calendar,
  Clock,
  MapPin,
  Compass,
  Radio,
  ExternalLink,
  PlusCircle,
  FileText,
  AlertTriangle,
  User,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { AppUserProfile, subscribeUserProfiles, updateUserRoleInFirestore, SUPER_ADMIN_EMAIL, isSuperAdminEmail, UserRole } from '../lib/firebase';
import { Flight, Booking, CabinClass } from '../types';
import { EmailTicketModal } from './EmailTicketModal';

interface AdminUsersPageProps {
  currentUser: AppUserProfile | null;
  flights: Flight[];
  bookings: Booking[];
  onUpdateFlightPrice: (flightId: string, newPrice: number) => Promise<void> | void;
  onUpdateBookingPrice: (bookingId: string, newPrice: number) => Promise<void> | void;
  onUpdateFlightStatus?: (flightId: string, newStatus: Flight['status']) => Promise<void> | void;
  onClearFlightSeats?: (flightId: string) => Promise<void> | void;
  onBookFlight?: (flight: Flight) => void;
  onViewBoardingPass?: (booking: Booking) => void;
  onCancelBooking?: (bookingId: string) => void;
  onTrackFlight?: (flight: Flight | string) => void;
  onInspectPassenger?: (booking: Booking) => void;
  initialTab?: 'superadmin-bookings' | 'pricing' | 'booked-pricing' | 'users';
}

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({
  currentUser,
  flights,
  bookings,
  onUpdateFlightPrice,
  onUpdateBookingPrice,
  onUpdateFlightStatus,
  onClearFlightSeats,
  onBookFlight,
  onViewBoardingPass,
  onCancelBooking,
  onTrackFlight,
  onInspectPassenger,
  initialTab = 'superadmin-bookings',
}) => {
  const [activeTab, setActiveTab] = useState<'superadmin-bookings' | 'pricing' | 'booked-pricing' | 'users'>(initialTab);
  const [users, setUsers] = useState<AppUserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // Search states
  const [superAdminSearchQuery, setSuperAdminSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Confirmed' | 'Checked In' | 'Boarded' | 'Cancelled'>('ALL');
  const [cabinFilter, setCabinFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [flightSearchQuery, setFlightSearchQuery] = useState('');
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [emailModalBooking, setEmailModalBooking] = useState<Booking | null>(null);

  // Editable price local state map for flights { [flightId]: string }
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [updatingFlightId, setUpdatingFlightId] = useState<string | null>(null);

  // Editable price local state map for existing bookings { [bookingId]: string }
  const [bookingPriceInputs, setBookingPriceInputs] = useState<Record<string, string>>({});
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);

  const isSuperAdmin = isSuperAdminEmail(currentUser?.email) || currentUser?.role === 'superadmin';

  useEffect(() => {
    const unsub = subscribeUserProfiles((list) => {
      setUsers(list);
      setLoadingUsers(false);
    });

    return () => unsub();
  }, []);

  // Sync flight prices into priceInputs state
  useEffect(() => {
    const map: Record<string, string> = {};
    flights.forEach((f) => {
      map[f.id] = f.price.toString();
    });
    setPriceInputs(map);
  }, [flights]);

  // Sync booking prices into bookingPriceInputs state
  useEffect(() => {
    const map: Record<string, string> = {};
    bookings.forEach((b) => {
      map[b.id] = (b.pricePaid ?? 0).toString();
    });
    setBookingPriceInputs(map);
  }, [bookings]);

  // Determine if a booking was created by Super Admin
  const isSuperAdminBooking = (b: Booking): boolean => {
    return (
      b.isSuperAdminBooking === true ||
      b.bookedByRole === 'superadmin' ||
      isSuperAdminEmail(b.bookedByEmail) ||
      isSuperAdminEmail(b.passenger?.email)
    );
  };

  // Super Admin Bookings & Metrics calculations
  const allSuperAdminBookings = useMemo(() => {
    return bookings.filter(isSuperAdminBooking);
  }, [bookings]);

  const totalSuperAdminFlights = allSuperAdminBookings.length;
  const totalSystemBookings = bookings.length;
  const superAdminPercentage = totalSystemBookings > 0 ? Math.round((totalSuperAdminFlights / totalSystemBookings) * 100) : 0;
  const totalSuperAdminRevenue = allSuperAdminBookings.reduce((sum, b) => sum + (b.pricePaid || 0), 0);
  const totalSuperAdminPassengers = allSuperAdminBookings.reduce((sum, b) => sum + (b.passengerCount || b.passengers?.length || 1), 0);
  const uniqueSuperAdminRoutes = new Set(allSuperAdminBookings.map((b) => b.flightNumber)).size;

  // Filtered Super Admin Bookings
  const filteredSuperAdminBookings = useMemo(() => {
    return allSuperAdminBookings.filter((b) => {
      const q = superAdminSearchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        b.flightNumber.toLowerCase().includes(q) ||
        b.ticketNumber.toLowerCase().includes(q) ||
        b.confirmationCode.toLowerCase().includes(q) ||
        b.passenger.fullName.toLowerCase().includes(q) ||
        b.passenger.email.toLowerCase().includes(q) ||
        (b.passenger.passportNumber && b.passenger.passportNumber.toLowerCase().includes(q)) ||
        b.origin.city.toLowerCase().includes(q) ||
        b.origin.code.toLowerCase().includes(q) ||
        b.destination.city.toLowerCase().includes(q) ||
        b.destination.code.toLowerCase().includes(q) ||
        b.seatNumber.toLowerCase().includes(q)
      );

      const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
      const matchesCabin = cabinFilter === 'ALL' || b.cabinClass === cabinFilter;

      return matchesSearch && matchesStatus && matchesCabin;
    });
  }, [allSuperAdminBookings, superAdminSearchQuery, statusFilter, cabinFilter]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRoleChange = async (uid: string, targetEmail: string, newRole: UserRole) => {
    if (isSuperAdminEmail(targetEmail) && newRole !== 'superadmin') {
      alert('A designated Super Admin account cannot be downgraded from superadmin role.');
      return;
    }

    setUpdatingUid(uid);
    try {
      await updateUserRoleInFirestore(uid, newRole);
      setStatusMsg(`Updated role for ${targetEmail} to ${newRole.toUpperCase()}`);
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      console.error('Failed to update role:', err);
      alert('Failed to update user role. Please check database permissions.');
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleSavePrice = async (flight: Flight) => {
    const val = priceInputs[flight.id];
    const parsed = parseFloat(val);
    if (isNaN(parsed) || parsed < 0) {
      alert('Please enter a valid price ($0 or greater).');
      return;
    }

    setUpdatingFlightId(flight.id);
    try {
      await onUpdateFlightPrice(flight.id, parsed);
      setStatusMsg(`Success: Flight ${flight.flightNumber} price updated to $${parsed.toLocaleString()}!`);
      setTimeout(() => setStatusMsg(null), 3500);
    } catch (err) {
      console.error('Failed to save price:', err);
      alert('Failed to update price. Please try again.');
    } finally {
      setUpdatingFlightId(null);
    }
  };

  const handleSaveBookingPrice = async (booking: Booking) => {
    const val = bookingPriceInputs[booking.id];
    const parsed = parseFloat(val);
    if (isNaN(parsed) || parsed < 0) {
      alert('Please enter a valid ticket price ($0 or greater).');
      return;
    }

    setUpdatingBookingId(booking.id);
    try {
      await onUpdateBookingPrice(booking.id, parsed);
      setStatusMsg(`Success: Ticket #${booking.ticketNumber} price updated to $${parsed.toLocaleString()}!`);
      setTimeout(() => setStatusMsg(null), 3500);
    } catch (err) {
      console.error('Failed to save booking price:', err);
      alert('Failed to update booking price. Please try again.');
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearchQuery.toLowerCase();
    return u.email.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  const filteredFlights = flights.filter((f) => {
    const q = flightSearchQuery.toLowerCase();
    return (
      f.flightNumber.toLowerCase().includes(q) ||
      f.origin.city.toLowerCase().includes(q) ||
      f.origin.code.toLowerCase().includes(q) ||
      f.destination.city.toLowerCase().includes(q) ||
      f.destination.code.toLowerCase().includes(q) ||
      f.aircraft.toLowerCase().includes(q)
    );
  });

  const filteredBookings = bookings.filter((b) => {
    const q = bookingSearchQuery.toLowerCase();
    if (!q) return true;
    return (
      b.ticketNumber.toLowerCase().includes(q) ||
      b.confirmationCode.toLowerCase().includes(q) ||
      b.passenger.fullName.toLowerCase().includes(q) ||
      b.passenger.email.toLowerCase().includes(q) ||
      b.flightNumber.toLowerCase().includes(q) ||
      b.seatNumber.toLowerCase().includes(q)
    );
  });

  if (!isSuperAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shadow-xl border border-red-200 dark:border-red-800">
          <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">
            Super Admin Access Required
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
            This management console and flight audit center is exclusively accessible to authorized Super Administrators ({SUPER_ADMIN_EMAIL}).
          </p>
        </div>
        <div className="inline-block p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-600 dark:text-slate-300">
          Current User: <strong>{currentUser?.email || 'Guest / Not Logged In'}</strong> (Role: {currentUser?.role || 'user'})
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-5 sm:space-y-8">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#001E42] via-[#002D62] to-[#C41230] p-4 sm:p-8 text-white shadow-2xl border border-red-500/30 space-y-4 sm:space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 text-amber-300 border border-amber-500/40 text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-md">
            <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> Super Admin Control & Audit Center
          </div>

          <h1 className="text-xl sm:text-4xl font-black text-white tracking-tight">
            American Airlines Super Admin Operations
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            Super Admin dashboard for tracking <strong className="text-amber-300">flights booked by Super Admin only</strong>, monitoring overall fleet bookings, and managing live flight base pricing and ticket price overrides.
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs pt-1 sm:pt-2">
            <div className="bg-slate-900/90 px-3 py-1.5 rounded-xl border border-amber-500/40 font-mono text-amber-300 flex items-center gap-2 font-black shadow-sm">
              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Super Admin Flights: {totalSuperAdminFlights}</span>
            </div>
            <div className="bg-slate-900/80 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-700 font-mono text-sky-300 flex items-center gap-1.5 font-bold">
              <Ticket className="w-3.5 h-3.5 text-sky-400 shrink-0" /> Total System Bookings: {totalSystemBookings}
            </div>
            <div className="bg-slate-900/80 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-700 font-mono text-emerald-300 flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {currentUser?.email}
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="relative z-10 flex items-center gap-1.5 sm:gap-2 bg-slate-950/80 p-1.5 sm:p-2 rounded-2xl border border-slate-700/80 max-w-3xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('superadmin-bookings')}
            className={`flex-1 min-w-[180px] sm:min-w-[210px] py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap min-h-[42px] ${
              activeTab === 'superadmin-bookings'
                ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg shadow-red-900/40 border border-amber-400/50'
                : 'text-amber-200 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Super Admin Bookings ({totalSuperAdminFlights})</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`flex-1 min-w-[140px] sm:min-w-[160px] py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap min-h-[42px] ${
              activeTab === 'pricing'
                ? 'bg-gradient-to-r from-[#0078D2] to-[#00519E] text-white shadow-lg border border-sky-400/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <DollarSign className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Flight Base Prices</span>
          </button>

          <button
            onClick={() => setActiveTab('booked-pricing')}
            className={`flex-1 min-w-[150px] sm:min-w-[170px] py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap min-h-[42px] ${
              activeTab === 'booked-pricing'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg border border-emerald-400/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Receipt className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Price Override</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 min-w-[120px] sm:min-w-[140px] py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap min-h-[42px] ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-[#0078D2] to-[#00519E] text-white shadow-lg border border-sky-400/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Users className="w-4 h-4 text-sky-300 shrink-0" />
            <span>User Roles</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 p-4 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-md animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* --- TAB 1: SUPER ADMIN BOOKED FLIGHTS & TOTALS STATS CONSOLE --- */}
      {activeTab === 'superadmin-bookings' && (
        <div className="space-y-6">
          {/* Key Stat Counters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Metric 1: Total Booked by Super Admin Only */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-5 rounded-2xl border-2 border-amber-400/60 dark:border-amber-500/40 shadow-lg relative overflow-hidden">
              <div className="absolute top-2 right-2 p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                <Crown className="w-5 h-5" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Super Admin Bookings
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100">
                  {totalSuperAdminFlights}
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  flights booked
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Exclusively by Super Admin only
              </p>
            </div>

            {/* Metric 2: Total System Bookings & Proportion */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  All System Bookings
                </p>
                <div className="p-1.5 bg-sky-100 dark:bg-sky-950 text-[#0078D2] dark:text-sky-400 rounded-lg">
                  <Ticket className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100">
                  {totalSystemBookings}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  total tickets
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#0078D2] dark:text-sky-400 font-bold">
                {superAdminPercentage}% booked by Super Admin
              </p>
            </div>

            {/* Metric 3: Total Passengers in Admin Bookings */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Admin Passengers
                </p>
                <div className="p-1.5 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100">
                  {totalSuperAdminPassengers}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  passengers
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                In Super Admin reservations
              </p>
            </div>

            {/* Metric 4: Total Value / Revenue Booked */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Value Booked
                </p>
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  ${totalSuperAdminRevenue.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  USD
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Sum of Super Admin ticket value
              </p>
            </div>

            {/* Metric 5: Distinct Routes Booked */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Unique Routes
                </p>
                <div className="p-1.5 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-lg">
                  <Compass className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100">
                  {uniqueSuperAdminRoutes}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  distinct routes
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Across domestic & international
              </p>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={superAdminSearchQuery}
                  onChange={(e) => setSuperAdminSearchQuery(e.target.value)}
                  placeholder="Filter Super Admin flights by Flight # (AA-104), Passenger, PNR, Ticket #, JFK, LHR..."
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0078D2] outline-none text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 min-h-[44px]"
                />
                {superAdminSearchQuery && (
                  <button
                    onClick={() => setSuperAdminSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* View Mode Toggle */}
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-2 rounded-lg transition text-xs font-bold flex items-center gap-1.5 ${
                      viewMode === 'cards'
                        ? 'bg-white dark:bg-slate-700 text-[#0078D2] dark:text-sky-300 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    }`}
                    title="Grid Cards View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden sm:inline">Cards</span>
                  </button>

                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-lg transition text-xs font-bold flex items-center gap-1.5 ${
                      viewMode === 'table'
                        ? 'bg-white dark:bg-slate-700 text-[#0078D2] dark:text-sky-300 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    }`}
                    title="Detailed Table View"
                  >
                    <TableIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Table</span>
                  </button>
                </div>

                {onBookFlight && flights.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onBookFlight(flights[0])}
                    className="bg-gradient-to-r from-[#0078D2] to-[#00519E] hover:from-[#0060A9] hover:to-[#004280] text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-md flex items-center gap-2 transition hover:scale-[1.02] active:scale-[0.98] min-h-[42px]"
                  >
                    <PlusCircle className="w-4 h-4 text-amber-300" />
                    <span>Book New Flight</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter chips row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Status:</span>
                {(['ALL', 'Confirmed', 'Checked In', 'Boarded', 'Cancelled'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${
                      statusFilter === st
                        ? 'bg-[#0078D2] text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {st === 'ALL' ? 'All Statuses' : st}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Cabin:</span>
                {['ALL', 'First', 'Business', 'Premium Economy', 'Economy'].map((cb) => (
                  <button
                    key={cb}
                    onClick={() => setCabinFilter(cb)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition ${
                      cabinFilter === cb
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cb === 'ALL' ? 'All Cabins' : cb}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bookings Display Container */}
          {filteredSuperAdminBookings.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 text-center border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
                <Crown className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  {allSuperAdminBookings.length === 0
                    ? 'No Super Admin Flight Bookings Yet'
                    : 'No Bookings Match Your Filter Criteria'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {allSuperAdminBookings.length === 0
                    ? 'When you book any flight while logged in as Super Admin, it will automatically appear here with complete audit telemetry, price control, and boarding pass tools.'
                    : `No Super Admin flights match query "${superAdminSearchQuery}". Try clearing filters.`}
                </p>
              </div>

              {onBookFlight && flights.length > 0 && (
                <button
                  type="button"
                  onClick={() => onBookFlight(flights[0])}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl shadow-lg transition hover:scale-105"
                >
                  <Crown className="w-4 h-4 text-amber-200" />
                  <span>Book First Flight as Super Admin</span>
                </button>
              )}
            </div>
          ) : viewMode === 'cards' ? (
            /* --- CARDS VIEW --- */
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {filteredSuperAdminBookings.map((b) => {
                const isModified = parseFloat(bookingPriceInputs[b.id] ?? (b.pricePaid ?? 0).toString()) !== (b.pricePaid ?? 0);
                const isSaving = updatingBookingId === b.id;

                return (
                  <div
                    key={b.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-md hover:shadow-xl transition-all space-y-4 relative overflow-hidden"
                  >
                    {/* Top Super Admin Tag Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-400/40 text-amber-800 dark:text-amber-300 text-[11px] font-black uppercase tracking-wider">
                          <Crown className="w-3.5 h-3.5 text-amber-500" />
                          <span>Super Admin Booking</span>
                        </span>
                        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                          {b.bookedByEmail || 'ebulupaulboyld@gmail.com'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide border ${
                          b.status === 'Confirmed'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : b.status === 'Checked In'
                            ? 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                            : b.status === 'Boarded'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                            : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800'
                        }`}>
                          {b.status}
                        </span>

                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {b.cabinClass}
                        </span>
                      </div>
                    </div>

                    {/* Flight & Route Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                      {/* Col 1: Flight & Passenger info */}
                      <div className="lg:col-span-7 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#001E42] text-white flex flex-col items-center justify-center shrink-0 font-black shadow-md border border-slate-700">
                            <Plane className="w-5 h-5 text-sky-400" />
                            <span className="text-[9px] text-slate-300 font-mono">{b.flightNumber.split('-')[1]}</span>
                          </div>

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                                Flight {b.flightNumber}
                              </h3>
                              <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-[#0078D2] dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                                {b.aircraft}
                              </span>
                            </div>

                            {/* Origin -> Destination Route */}
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex flex-wrap items-center gap-2">
                              <span className="text-slate-900 dark:text-slate-100 font-black">{b.origin.city} ({b.origin.code})</span>
                              <ArrowRight className="w-4 h-4 text-[#0078D2] shrink-0" />
                              <span className="text-slate-900 dark:text-slate-100 font-black">{b.destination.city} ({b.destination.code})</span>
                              <span className="text-xs text-slate-400 font-normal truncate">• Term {b.terminal}, Gate {b.gate}</span>
                            </div>

                            {/* Departure / Arrival Timestamps */}
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                Dep: {new Date(b.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span>•</span>
                              <span>
                                Arr: {new Date(b.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span>•</span>
                              <span>Date: {new Date(b.departureTime).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Passenger information card snippet */}
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-[#0078D2]" />
                              <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                                Lead Passenger: {b.passenger.fullName}
                              </span>
                            </div>

                            <span className="text-xs font-black font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                              Seat: {b.seatNumber}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                            <div className="truncate">Email: <strong className="text-slate-900 dark:text-slate-100">{b.passenger.email}</strong></div>
                            <div>Phone: <strong className="text-slate-900 dark:text-slate-100">{b.passenger.phone || 'N/A'}</strong></div>
                            <div>Passport: <strong className="font-mono text-slate-900 dark:text-slate-100">{b.passenger.passportNumber || 'On file'}</strong></div>
                            <div>Meal: <strong className="text-slate-900 dark:text-slate-100">{b.passenger.mealPreference || 'Standard'}</strong></div>
                          </div>

                          {b.passengers && b.passengers.length > 1 && (
                            <div className="pt-1 text-[11px] font-bold text-sky-600 dark:text-sky-400">
                              + {b.passengers.length - 1} other passenger(s) in party ({b.seats?.join(', ') || ''})
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Col 2: Ticket Identifiers, Price & Quick Price Override */}
                      <div className="lg:col-span-5 space-y-3">
                        {/* PNR & Ticket Number Badges */}
                        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400 font-bold">Confirmation (PNR):</span>
                            <button
                              onClick={() => handleCopy(b.confirmationCode, `pnr-${b.id}`)}
                              className="font-mono font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800 flex items-center gap-1 hover:scale-105 transition"
                            >
                              <span>{b.confirmationCode}</span>
                              {copiedId === `pnr-${b.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400 font-bold">E-Ticket #:</span>
                            <button
                              onClick={() => handleCopy(b.ticketNumber, `tkt-${b.id}`)}
                              className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 flex items-center gap-1 hover:scale-105 transition"
                            >
                              <span>{b.ticketNumber}</span>
                              {copiedId === `tkt-${b.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>

                          {/* Inline Super Admin Price Override */}
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Crown className="w-3 h-3 text-amber-500" /> Super Admin Price Paid
                              </label>
                              <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                                Current: ${b.pricePaid} USD
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-slate-500 text-sm">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="5"
                                  value={bookingPriceInputs[b.id] ?? (b.pricePaid ?? 0).toString()}
                                  onChange={(e) => {
                                    setBookingPriceInputs((prev) => ({
                                      ...prev,
                                      [b.id]: e.target.value,
                                    }));
                                  }}
                                  className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 font-black text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:border-[#0078D2] outline-none"
                                />
                              </div>

                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => handleSaveBookingPrice(b)}
                                className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition ${
                                  isModified
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white ring-2 ring-emerald-400'
                                    : 'bg-[#0078D2] hover:bg-[#0060A9] text-white'
                                }`}
                              >
                                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                <span>{isModified ? 'Save Price' : 'Update'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons Bar */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-400 font-mono">
                        Booked On: {new Date(b.bookingDate).toLocaleString()}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {onViewBoardingPass && (
                          <button
                            type="button"
                            onClick={() => onViewBoardingPass(b)}
                            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition min-h-[38px]"
                          >
                            <Ticket className="w-3.5 h-3.5 text-amber-400" />
                            <span>View Boarding Pass</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setEmailModalBooking(b)}
                          className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition min-h-[38px]"
                        >
                          <Mail className="w-3.5 h-3.5 text-sky-200" />
                          <span>Email Ticket</span>
                        </button>

                        {onTrackFlight && (
                          <button
                            type="button"
                            onClick={() => onTrackFlight(b.flightId || b.flightNumber)}
                            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition min-h-[38px]"
                          >
                            <Radio className="w-3.5 h-3.5 text-sky-500" />
                            <span>Track Radar</span>
                          </button>
                        )}

                        {onCancelBooking && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to cancel Super Admin flight booking #${b.confirmationCode}?`)) {
                                onCancelBooking(b.id);
                                setStatusMsg(`Booking #${b.confirmationCode} cancelled successfully.`);
                              }
                            }}
                            className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 font-black text-xs flex items-center gap-1.5 border border-red-200 dark:border-red-800 transition min-h-[38px]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* --- DETAILED TABLE VIEW --- */
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[850px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Flight</th>
                      <th className="py-3 px-4">Passenger / Party</th>
                      <th className="py-3 px-4">PNR / Ticket #</th>
                      <th className="py-3 px-4">Route & Schedule</th>
                      <th className="py-3 px-4">Seat / Cabin</th>
                      <th className="py-3 px-4">Price Paid</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredSuperAdminBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-black text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-[#001E42] text-white font-mono text-[10px]">
                              {b.flightNumber}
                            </span>
                            <span className="text-[11px] text-slate-500 font-normal">{b.aircraft.split(' ')[0]}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                          <div>{b.passenger.fullName}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{b.passenger.email}</div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <div className="font-black text-amber-700 dark:text-amber-400">{b.confirmationCode}</div>
                          <div className="text-slate-400 text-[10px]">{b.ticketNumber}</div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-extrabold text-slate-900 dark:text-slate-100">
                            {b.origin.code} ➔ {b.destination.code}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(b.departureTime).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono font-black text-slate-900 dark:text-slate-100">{b.seatNumber}</span>
                          <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {b.cabinClass}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-black font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          ${b.pricePaid} USD
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                            b.status === 'Confirmed'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                              : 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-300'
                          }`}>
                            {b.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {onViewBoardingPass && (
                              <button
                                onClick={() => onViewBoardingPass(b)}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                                title="View Boarding Pass"
                              >
                                <Ticket className="w-3.5 h-3.5 text-amber-500" />
                              </button>
                            )}

                            <button
                              onClick={() => setEmailModalBooking(b)}
                              className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-600 dark:text-sky-300 transition"
                              title="Email E-Ticket"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>

                            {onTrackFlight && (
                              <button
                                onClick={() => onTrackFlight(b.flightId || b.flightNumber)}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                                title="Track Radar"
                              >
                                <Radio className="w-3.5 h-3.5 text-sky-500" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: FLIGHT SCHEDULE BASE PRICE MANAGEMENT --- */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          {/* Security & Info Notice */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Crown className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Super Admin Flight Schedule Base Price Console</span>
                  <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    Super Admin Only
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Manually set the standard base price for any scheduled flight. When a customer or super admin books this flight, this base price is applied automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Search bar for flights */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-md border border-slate-200/80 dark:border-slate-800">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={flightSearchQuery}
                onChange={(e) => setFlightSearchQuery(e.target.value)}
                placeholder="Filter flights by Flight Number (e.g. AA-104), origin city (JFK), destination (London), or aircraft..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0078D2] outline-none text-sm font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Flight Price Cards Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredFlights.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center text-slate-400 font-bold border border-slate-200 dark:border-slate-800">
                No flight schedules match "{flightSearchQuery}".
              </div>
            ) : (
              filteredFlights.map((flight) => {
                const currentInputValue = priceInputs[flight.id] ?? flight.price.toString();
                const isModified = parseFloat(currentInputValue) !== flight.price;
                const isSaving = updatingFlightId === flight.id;

                return (
                  <div
                    key={flight.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-md hover:shadow-xl transition-all space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
                      {/* Flight Details */}
                      <div className="flex items-start gap-3 sm:gap-4 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#001E42] text-white flex flex-col items-center justify-center shrink-0 font-black shadow-md">
                          <span className="text-[11px] sm:text-xs text-sky-400">AA</span>
                          <span className="text-[9px] sm:text-[10px] text-slate-300 font-mono">{flight.flightNumber.split('-')[1]}</span>
                        </div>

                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                              Flight {flight.flightNumber}
                            </span>
                            <span className="text-[11px] sm:text-xs font-extrabold px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-[#0078D2] dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                              {flight.aircraft}
                            </span>
                            <select
                              value={flight.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value as Flight['status'];
                                if (onUpdateFlightStatus) {
                                  await onUpdateFlightStatus(flight.id, newStatus);
                                  setStatusMsg(`Flight ${flight.flightNumber} status updated to "${newStatus}"!`);
                                }
                              }}
                              className="text-[11px] sm:text-xs font-black px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 outline-none focus:ring-2 focus:ring-[#0078D2] cursor-pointer max-w-full"
                            >
                              <option value="On Time">On Time</option>
                              <option value="Scheduled">Scheduled</option>
                              <option value="Boarding">Boarding</option>
                              <option value="Delayed">Delayed</option>
                              <option value="Completed">Flight Completed</option>
                              <option value="Unbooked">Unbooked (All Seats Available)</option>
                            </select>
                          </div>

                          <div className="text-xs text-slate-600 dark:text-slate-300 font-bold flex flex-wrap items-center gap-1.5">
                            <span className="text-slate-900 dark:text-slate-100 font-extrabold">{flight.origin.city} ({flight.origin.code})</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-slate-900 dark:text-slate-100 font-extrabold">{flight.destination.city} ({flight.destination.code})</span>
                            <span className="text-slate-400 font-normal truncate">• Term {flight.terminal}, Gate {flight.gate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Manual Price Input Control (Super Admin) */}
                      <div className="bg-slate-50 dark:bg-slate-800/80 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 shrink-0 w-full lg:w-auto">
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block flex items-center gap-1">
                            <Tag className="w-3 h-3 text-amber-500" /> Manual Price ($ USD)
                          </label>

                          <div className="relative flex items-center">
                            <span className="absolute left-3 font-black text-base text-slate-900 dark:text-slate-100">$</span>
                            <input
                              type="number"
                              min="0"
                              step="5"
                              value={currentInputValue}
                              onChange={(e) => {
                                setPriceInputs((prev) => ({
                                  ...prev,
                                  [flight.id]: e.target.value,
                                }));
                              }}
                              className="pl-7 pr-3 py-2 w-full sm:w-36 rounded-xl border border-slate-300 dark:border-slate-600 font-black text-base sm:text-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:border-[#0078D2] focus:ring-2 focus:ring-[#0078D2] outline-none shadow-xs min-h-[40px]"
                            />
                          </div>
                        </div>

                        {/* Quick Presets & Save Button */}
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                          <div className="flex items-center gap-1 flex-wrap sm:flex-nowrap">
                            {['450', '650', '850', '1200'].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => {
                                  setPriceInputs((prev) => ({
                                    ...prev,
                                    [flight.id]: preset,
                                  }));
                                }}
                                className="px-2 py-1 bg-white dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg transition min-h-[30px]"
                              >
                                ${preset}
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleSavePrice(flight)}
                            className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-md min-h-[40px] ${
                              isModified
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-emerald-900/30 ring-2 ring-emerald-400/40'
                                : 'bg-[#0078D2] hover:bg-[#0060A9] text-white shadow-sky-900/30'
                            }`}
                          >
                            {isSaving ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            <span>{isModified ? 'Save Base Price' : 'Update Base Price'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Footer price comparison info & Seat Reset actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <div>
                        <span>Active Base: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">${flight.price} USD</strong></span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={async () => {
                            if (onUpdateFlightStatus) {
                              await onUpdateFlightStatus(flight.id, 'Unbooked');
                            } else if (onClearFlightSeats) {
                              await onClearFlightSeats(flight.id);
                            }
                            setStatusMsg(`Flight ${flight.flightNumber} status set to Unbooked. All seats released and 100% available!`);
                          }}
                          className="flex-1 sm:flex-initial px-3 py-2 sm:py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1 shadow-sm transition min-h-[38px]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Release Seats</span>
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            if (onUpdateFlightStatus) {
                              await onUpdateFlightStatus(flight.id, 'Completed');
                            } else if (onClearFlightSeats) {
                              await onClearFlightSeats(flight.id);
                            }
                            setStatusMsg(`Flight ${flight.flightNumber} marked as Flight Completed! All seats released and 100% available.`);
                          }}
                          className="flex-1 sm:flex-initial px-3 py-2 sm:py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-black text-xs flex items-center justify-center gap-1 shadow-sm transition min-h-[38px]"
                        >
                          <Plane className="w-3.5 h-3.5" />
                          <span>Complete Flight</span>
                        </button>

                        {onBookFlight && (
                          <button
                            type="button"
                            onClick={() => onBookFlight(flight)}
                            className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition min-h-[38px]"
                          >
                            <Crown className="w-3.5 h-3.5 text-amber-200" />
                            <span>Book Flight</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: BOOKED TICKET PRICE OVERRIDE (AFTER FLIGHT IS BOOKED) --- */}
      {activeTab === 'booked-pricing' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Security & Info Notice */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Post-Booking Price Override Console</span>
                  <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    After Flight is Booked
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  As Super Admin, you can manually input or edit the paid ticket price for any <strong className="text-slate-900 dark:text-slate-100 font-extrabold">already booked ticket</strong> below. Changes immediately update Firestore and sync across all boarding passes and manifests.
                </p>
              </div>
            </div>
          </div>

          {/* Search bar for bookings */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-md border border-slate-200/80 dark:border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={bookingSearchQuery}
                onChange={(e) => setBookingSearchQuery(e.target.value)}
                placeholder="Search booked tickets by Ticket #, PNR, Passenger, Seat..."
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0078D2] outline-none text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 min-h-[44px]"
              />
            </div>
          </div>

          {/* Booked Tickets Price List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredBookings.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 text-center text-slate-400 font-bold border border-slate-200 dark:border-slate-800 text-xs sm:text-sm">
                {bookings.length === 0 
                  ? 'No booked tickets found in the system database. Use the search page or quick booking to create a ticket first.'
                  : `No booked tickets match "${bookingSearchQuery}".`}
              </div>
            ) : (
              filteredBookings.map((booking) => {
                const currentInputValue = bookingPriceInputs[booking.id] ?? (booking.pricePaid ?? 0).toString();
                const isModified = parseFloat(currentInputValue) !== (booking.pricePaid ?? 0);
                const isSaving = updatingBookingId === booking.id;

                return (
                  <div
                    key={booking.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-md hover:shadow-xl transition-all space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
                      {/* Ticket & Passenger Information */}
                      <div className="flex items-start gap-3 sm:gap-4 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#001E42] to-[#002D62] text-white flex flex-col items-center justify-center shrink-0 font-black shadow-md border border-slate-700">
                          <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                          <span className="text-[9px] text-slate-300 font-mono mt-0.5">{booking.seatNumber}</span>
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                              {booking.passenger.fullName}
                            </span>
                            <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              Ticket: {booking.ticketNumber}
                            </span>
                            <span className="text-[10px] sm:text-xs font-mono font-black px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              PNR: {booking.confirmationCode}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 dark:text-slate-300 font-bold flex items-center gap-2 flex-wrap">
                            <span className="text-[#0078D2] dark:text-sky-300 font-extrabold">{booking.flightNumber}</span>
                            <span>•</span>
                            <span>{booking.origin.city} ({booking.origin.code}) ➔ {booking.destination.city} ({booking.destination.code})</span>
                            <span>•</span>
                            <span>Seat {booking.seatNumber} ({booking.cabinClass})</span>
                          </div>

                          <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">
                            Booked: {new Date(booking.bookingDate).toLocaleString()} • Email: {booking.passenger.email}
                          </div>
                        </div>
                      </div>

                      {/* Manual Booking Price Input Control (Super Admin) */}
                      <div className="bg-slate-50 dark:bg-slate-800/80 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 shrink-0 w-full lg:w-auto">
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-500" /> Manual Ticket Price ($ USD)
                          </label>

                          <div className="relative flex items-center">
                            <span className="absolute left-3 font-black text-base text-slate-900 dark:text-slate-100">$</span>
                            <input
                              type="number"
                              min="0"
                              step="5"
                              value={currentInputValue}
                              onChange={(e) => {
                                setBookingPriceInputs((prev) => ({
                                  ...prev,
                                  [booking.id]: e.target.value,
                                }));
                              }}
                              className="pl-7 pr-3 py-2 w-full sm:w-36 rounded-xl border border-slate-300 dark:border-slate-600 font-black text-base sm:text-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:border-[#0078D2] focus:ring-2 focus:ring-[#0078D2] outline-none shadow-xs min-h-[40px]"
                            />
                          </div>
                        </div>

                        {/* Quick Presets & Save Button */}
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                          <div className="flex items-center gap-1 flex-wrap sm:flex-nowrap">
                            {['350', '550', '850', '1500'].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => {
                                  setBookingPriceInputs((prev) => ({
                                    ...prev,
                                    [booking.id]: preset,
                                  }));
                                }}
                                className="px-2 py-1 bg-white dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg transition min-h-[30px]"
                              >
                                ${preset}
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleSaveBookingPrice(booking)}
                            className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-md min-h-[40px] ${
                              isModified
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-emerald-900/30 ring-2 ring-emerald-400/40'
                                : 'bg-[#0078D2] hover:bg-[#0060A9] text-white shadow-sky-900/30'
                            }`}
                          >
                            {isSaving ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            <span>{isModified ? 'Save Ticket Price' : 'Override Price'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                      <span>Currently Paid: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">${booking.pricePaid} USD</strong> ({booking.paymentMethod})</span>
                      <span>Seat: {booking.seatNumber} • Class: {booking.cabinClass}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* --- TAB 4: USER ROLES MANAGEMENT --- */}
      {activeTab === 'users' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0078D2]" />
                <span>Registered Passenger & Staff Accounts</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage user permissions and elevate crew members or admins. Super Admin cannot be downgraded.
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search users by email or role..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 outline-none focus:border-[#0078D2] min-h-[44px]"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 sm:py-4 px-4 sm:px-6">User / Email</th>
                    <th className="py-3 sm:py-4 px-4 sm:px-6">Current Role</th>
                    <th className="py-3 sm:py-4 px-4 sm:px-6">Registered Date</th>
                    <th className="py-3 sm:py-4 px-4 sm:px-6 text-right">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 text-sm font-bold">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0078D2]" />
                        Loading user directory...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 text-sm font-bold">
                        No registered users found matching "{userSearchQuery}".
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSuper = isSuperAdminEmail(u.email);
                      return (
                        <tr key={u.uid} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3 sm:py-4 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#001E42] to-[#0078D2] text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-sm">
                                {u.displayName ? u.displayName.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-black text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate flex items-center gap-1.5">
                                  <span>{u.displayName || u.email.split('@')[0]}</span>
                                  {isSuper && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                                </div>
                                <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                                  {u.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 sm:py-4 px-4 sm:px-6">
                            <span className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wide border whitespace-nowrap ${
                              u.role === 'superadmin'
                                ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800'
                                : u.role === 'admin'
                                ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                            }`}>
                              {u.role === 'superadmin' && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                              {u.role === 'admin' && <Building2 className="w-3.5 h-3.5 text-sky-500" />}
                              {u.role === 'user' && <UserCheck className="w-3.5 h-3.5 text-slate-400" />}
                              {u.role}
                            </span>
                          </td>

                          <td className="py-3 sm:py-4 px-4 sm:px-6 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Initial'}
                          </td>

                          <td className="py-3 sm:py-4 px-4 sm:px-6 text-right">
                            {isSuper ? (
                              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 italic whitespace-nowrap">
                                Protected Super Admin
                              </span>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <select
                                  disabled={updatingUid === u.uid}
                                  value={u.role}
                                  onChange={(e) => handleRoleChange(u.uid, u.email, e.target.value as UserRole)}
                                  className="py-1.5 px-2.5 sm:px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-black text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#0078D2] outline-none min-h-[38px]"
                                >
                                  <option value="user">Passenger (User)</option>
                                  <option value="admin">Desk Admin</option>
                                  <option value="superadmin">Super Admin</option>
                                </select>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Email E-Ticket Modal Integration */}
      <EmailTicketModal
        booking={emailModalBooking}
        isOpen={Boolean(emailModalBooking)}
        onClose={() => setEmailModalBooking(null)}
      />
    </div>
  );
};
