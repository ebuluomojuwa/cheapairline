import React, { useState, useEffect } from 'react';
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
  Receipt
} from 'lucide-react';
import { AppUserProfile, subscribeUserProfiles, updateUserRoleInFirestore, SUPER_ADMIN_EMAIL, UserRole } from '../lib/firebase';
import { Flight, Booking } from '../types';

interface AdminUsersPageProps {
  currentUser: AppUserProfile | null;
  flights: Flight[];
  bookings: Booking[];
  onUpdateFlightPrice: (flightId: string, newPrice: number) => Promise<void> | void;
  onUpdateBookingPrice: (bookingId: string, newPrice: number) => Promise<void> | void;
  onBookFlight?: (flight: Flight) => void;
}

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({
  currentUser,
  flights,
  bookings,
  onUpdateFlightPrice,
  onUpdateBookingPrice,
  onBookFlight,
}) => {
  const [activeTab, setActiveTab] = useState<'pricing' | 'booked-pricing' | 'users'>('pricing');
  const [users, setUsers] = useState<AppUserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [flightSearchQuery, setFlightSearchQuery] = useState('');
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Editable price local state map for flights { [flightId]: string }
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [updatingFlightId, setUpdatingFlightId] = useState<string | null>(null);

  // Editable price local state map for existing bookings { [bookingId]: string }
  const [bookingPriceInputs, setBookingPriceInputs] = useState<Record<string, string>>({});
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || currentUser?.role === 'superadmin';

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

  const handleRoleChange = async (uid: string, targetEmail: string, newRole: UserRole) => {
    if (targetEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() && newRole !== 'superadmin') {
      alert('The designated Super Admin account cannot be downgraded from superadmin role.');
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
        <div className="w-20 h-20 bg-red-100 dark:bg-red-950/80 rounded-3xl flex items-center justify-center mx-auto text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 shadow-xl">
          <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Access Restricted</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This Super Admin Portal is strictly reserved for <strong className="text-red-600 dark:text-red-400 font-mono">{SUPER_ADMIN_EMAIL}</strong>. Only Super Admin has privilege to manage flight pricing and system permissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#001E42] via-[#002D62] to-[#C41230] p-6 sm:p-8 text-white shadow-2xl border border-red-500/30 space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider shadow-md">
            <Crown className="w-4 h-4 text-amber-400" /> Super Admin Control Portal
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            American Airlines Super Admin Operations
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            As Super Admin, you can manually input flight prices <strong className="text-amber-300">when a flight is booked</strong> or manually override ticket prices <strong className="text-amber-300">after it has been booked</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs pt-2">
            <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700 font-mono text-amber-300 flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Super Admin: {currentUser?.email}
            </div>
            <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700 font-mono text-sky-300 flex items-center gap-1.5 font-bold">
              <Plane className="w-4 h-4 text-sky-400" /> Total Active Flights: {flights.length}
            </div>
            <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700 font-mono text-emerald-300 flex items-center gap-1.5 font-bold">
              <Ticket className="w-4 h-4 text-emerald-400" /> Booked Tickets: {bookings.length}
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-700/80 max-w-2xl">
          <button
            onClick={() => setActiveTab('pricing')}
            className={`flex-1 min-w-[160px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'pricing'
                ? 'bg-gradient-to-r from-[#0078D2] to-[#00519E] text-white shadow-lg border border-sky-400/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <DollarSign className="w-4 h-4 text-amber-300" />
            <span>Flight Schedule Base Prices</span>
          </button>

          <button
            onClick={() => setActiveTab('booked-pricing')}
            className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'booked-pricing'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg border border-emerald-400/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Receipt className="w-4 h-4 text-emerald-300" />
            <span>Booked Ticket Price Override</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-[#0078D2] to-[#00519E] text-white shadow-lg border border-sky-400/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Users className="w-4 h-4 text-sky-300" />
            <span>User Roles & Permissions</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 p-4 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-md animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* --- TAB 1: FLIGHT SCHEDULE BASE PRICE MANAGEMENT --- */}
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
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-md hover:shadow-xl transition-all space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Flight Details */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-[#001E42] text-white flex flex-col items-center justify-center shrink-0 font-black shadow-md">
                          <span className="text-xs text-sky-400">AA</span>
                          <span className="text-[10px] text-slate-300 font-mono">{flight.flightNumber.split('-')[1]}</span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-slate-900 dark:text-slate-100 text-base">
                              Flight {flight.flightNumber}
                            </span>
                            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-[#0078D2] dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                              {flight.aircraft}
                            </span>
                            <span className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full font-bold">
                              {flight.status}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 dark:text-slate-300 font-bold flex items-center gap-2">
                            <span className="text-slate-900 dark:text-slate-100 font-extrabold">{flight.origin.city} ({flight.origin.code})</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-900 dark:text-slate-100 font-extrabold">{flight.destination.city} ({flight.destination.code})</span>
                            <span className="text-slate-400 font-normal">• Terminal {flight.terminal}, Gate {flight.gate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Manual Price Input Control (Super Admin) */}
                      <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4 shrink-0">
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block flex items-center gap-1">
                            <Tag className="w-3 h-3 text-amber-500" /> Manual Ticket Price ($ USD)
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
                              className="pl-7 pr-3 py-2 w-36 rounded-xl border border-slate-300 dark:border-slate-600 font-black text-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:border-[#0078D2] focus:ring-2 focus:ring-[#0078D2] outline-none shadow-xs"
                            />
                          </div>
                        </div>

                        {/* Quick Presets & Save Button */}
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                          <div className="flex items-center gap-1.5">
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
                                className="px-2 py-1 bg-white dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg transition"
                              >
                                ${preset}
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleSavePrice(flight)}
                            className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-md ${
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

                    {/* Footer price comparison info & Book Flight action */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <div>
                        <span>Active Base Price in Booking Engine: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">${flight.price} USD</strong></span>
                      </div>

                      {onBookFlight && (
                        <button
                          type="button"
                          onClick={() => onBookFlight(flight)}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition"
                        >
                          <Crown className="w-4 h-4 text-amber-200" />
                          <span>Book Flight & Issue Ticket</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: BOOKED TICKET PRICE OVERRIDE (AFTER FLIGHT IS BOOKED) --- */}
      {activeTab === 'booked-pricing' && (
        <div className="space-y-6">
          {/* Security & Info Notice */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-md border border-slate-200/80 dark:border-slate-800">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={bookingSearchQuery}
                onChange={(e) => setBookingSearchQuery(e.target.value)}
                placeholder="Search booked tickets by Ticket # (e.g. 001-9482), Confirmation Code, Passenger Name, or Seat..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0078D2] outline-none text-sm font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Booked Tickets Price List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredBookings.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center text-slate-400 font-bold border border-slate-200 dark:border-slate-800">
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
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-md hover:shadow-xl transition-all space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Ticket & Passenger Information */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#001E42] to-[#002D62] text-white flex flex-col items-center justify-center shrink-0 font-black shadow-md border border-slate-700">
                          <Ticket className="w-5 h-5 text-amber-400" />
                          <span className="text-[9px] text-slate-300 font-mono mt-0.5">{booking.seatNumber}</span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-slate-900 dark:text-slate-100 text-base">
                              {booking.passenger.fullName}
                            </span>
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              Ticket: {booking.ticketNumber}
                            </span>
                            <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
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

                          <div className="text-[11px] text-slate-400 font-mono">
                            Booked: {new Date(booking.bookingDate).toLocaleString()} • Email: {booking.passenger.email}
                          </div>
                        </div>
                      </div>

                      {/* Manual Booking Price Input Control (Super Admin) */}
                      <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4 shrink-0">
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-500" /> Manual Booked Ticket Price ($ USD)
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
                              className="pl-7 pr-3 py-2 w-36 rounded-xl border border-slate-300 dark:border-slate-600 font-black text-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none shadow-xs"
                            />
                          </div>
                        </div>

                        {/* Quick Presets & Save Button */}
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                          <div className="flex items-center gap-1.5">
                            {['0', '150', '350', '500', '750'].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => {
                                  setBookingPriceInputs((prev) => ({
                                    ...prev,
                                    [booking.id]: preset,
                                  }));
                                }}
                                className="px-2 py-1 bg-white dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg transition"
                              >
                                ${preset}
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleSaveBookingPrice(booking)}
                            className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-md ${
                              isModified
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-emerald-900/30 ring-2 ring-emerald-400/40'
                                : 'bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white shadow-slate-900/20'
                            }`}
                          >
                            {isSaving ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            <span>{isModified ? 'Save Ticket Price' : 'Update Booked Price'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Footer price comparison info */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <span>Recorded Ticket Price Paid: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">${booking.pricePaid ?? 0} USD</strong></span>
                      <span className="text-[11px] italic">Post-booking manual override by Super Admin</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: USER ROLES & PERMISSIONS --- */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User Search & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search registered accounts by email, name, or role..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0078D2] outline-none text-sm font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                Showing {filteredUsers.length} account(s)
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-wider">
                    <th className="py-4 px-6">User / Email</th>
                    <th className="py-4 px-6">Current Role</th>
                    <th className="py-4 px-6">Registered Date</th>
                    <th className="py-4 px-6 text-right">Role Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400 font-bold">
                        Loading registered user profiles from Firestore...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400 font-bold">
                        No user accounts found matching "{userSearchQuery}".
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSuper = u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

                      return (
                        <tr key={u.uid} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm ${
                                isSuper 
                                  ? 'bg-gradient-to-tr from-amber-500 to-red-600 shadow-md' 
                                  : u.role === 'admin'
                                  ? 'bg-[#0078D2]'
                                  : 'bg-slate-600'
                              }`}>
                                {u.displayName?.charAt(0).toUpperCase() || u.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                  {u.displayName || 'User'}
                                  {isSuper && (
                                    <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-md font-black border border-amber-300 dark:border-amber-800 uppercase flex items-center gap-1">
                                      <Crown className="w-3 h-3 text-amber-500" /> Super Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3" /> {u.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide border ${
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

                          <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400 font-mono">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Initial'}
                          </td>

                          <td className="py-4 px-6 text-right">
                            {isSuper ? (
                              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 italic">
                                Protected Super Admin
                              </span>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <select
                                  disabled={updatingUid === u.uid}
                                  value={u.role}
                                  onChange={(e) => handleRoleChange(u.uid, u.email, e.target.value as UserRole)}
                                  className="py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-black text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#0078D2] outline-none"
                                >
                                  <option value="user">Regular Passenger (User)</option>
                                  <option value="admin">Airline Front Desk Admin</option>
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
    </div>
  );
};
