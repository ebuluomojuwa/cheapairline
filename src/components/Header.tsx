import React from 'react';
import { Plane, Search, Ticket, Armchair, PlusCircle, ShieldCheck, UserCheck, KeyRound, Building2, Lock, LogOut, Sun, Moon } from 'lucide-react';
import { AmericanAirlinesLogo } from './AmericanAirlinesLogo';

interface HeaderProps {
  userRole: 'passenger' | 'admin';
  setUserRole: (role: 'passenger' | 'admin') => void;
  isAdminAuthenticated: boolean;
  onOpenAdminAuth: () => void;
  onAdminLogout: () => void;
  activeTab: 'search' | 'lookup' | 'seat-explorer' | 'my-bookings';
  setActiveTab: (tab: 'search' | 'lookup' | 'seat-explorer' | 'my-bookings') => void;
  bookingCount: number;
  onQuickBookClick: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userRole,
  setUserRole,
  isAdminAuthenticated,
  onOpenAdminAuth,
  onAdminLogout,
  activeTab,
  setActiveTab,
  bookingCount,
  onQuickBookClick,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="bg-[#001E42] border-b border-slate-700/80 text-white sticky top-0 z-40 shadow-xl backdrop-blur-md bg-opacity-95">
      {/* Top micro banner with Role Selector & Dark Mode Toggle */}
      <div className="bg-[#00142E] text-slate-300 text-[11px] py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5 font-bold text-sky-400">
              <ShieldCheck className="w-3.5 h-3.5" /> American Airlines • Official Reservation Portal
            </span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-slate-300 hidden md:inline font-medium">AAdvantage® Member Perks & Seat Management</span>
          </div>

          {/* Theme Toggle & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark Mode Theme Button */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-bold transition shadow-xs group"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
                  <span className="text-amber-300 hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-300 group-hover:-rotate-12 transition-transform" />
                  <span className="text-slate-300 hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">Portal View:</span>
            <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setUserRole('passenger');
                  if (activeTab === 'lookup') setActiveTab('search');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  userRole === 'passenger'
                    ? 'bg-[#0078D2] text-white shadow-sm ring-1 ring-sky-300/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Passenger</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isAdminAuthenticated) {
                    setUserRole('admin');
                    setActiveTab('lookup');
                  } else {
                    onOpenAdminAuth();
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  userRole === 'admin'
                    ? 'bg-[#C41230] text-white shadow-sm ring-1 ring-red-400/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isAdminAuthenticated ? (
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Gate Agent Terminal</span>
                {!isAdminAuthenticated && (
                  <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">Desk Only</span>
                )}
              </button>

              {isAdminAuthenticated && (
                <button
                  type="button"
                  onClick={onAdminLogout}
                  title="Lock Agent Terminal & Return to Passenger View"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-rose-300 hover:text-white hover:bg-rose-900/50 transition border border-rose-500/30"
                >
                  <LogOut className="w-3 h-3 text-rose-400" />
                  <span>Lock</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div 
            className="flex items-center cursor-pointer group py-1"
            onClick={() => {
              if (userRole === 'admin') setActiveTab('lookup');
              else setActiveTab('search');
            }}
          >
            <AmericanAirlinesLogo size="md" variant="dark-bg" />
            <div className="ml-3 hidden lg:flex flex-col border-l border-slate-700 pl-3">
              <span className="text-xs font-black tracking-wider text-slate-200 uppercase">
                {userRole === 'admin' ? 'Front Desk Gate Terminal' : 'Passenger Hub'}
              </span>
              <span className="text-[10px] text-sky-400 font-mono">
                {userRole === 'admin' ? 'Ticket Verification & Pass Issue' : 'Direct Booking & Seat Map'}
              </span>
            </div>
          </div>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-[#00152e]/90 p-1.5 rounded-2xl border border-slate-700/70 shadow-inner">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'search'
                  ? 'bg-gradient-to-r from-[#0078D2] to-[#00519E] text-white shadow-md shadow-sky-600/30 ring-1 ring-sky-300/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Plane className="w-4 h-4 text-sky-400" />
              Book Flights
            </button>

            <button
              onClick={() => setActiveTab('lookup')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'lookup'
                  ? 'bg-gradient-to-r from-[#C41230] to-[#990B22] text-white shadow-md shadow-red-900/30 ring-1 ring-red-400/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-4 h-4 text-red-400" />
              {userRole === 'admin' ? '🛂 Front Desk Ticket Check' : 'Seat & Ticket Lookup'}
            </button>

            <button
              onClick={() => setActiveTab('seat-explorer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'seat-explorer'
                  ? 'bg-gradient-to-r from-[#0078D2] to-[#00519E] text-white shadow-md shadow-sky-600/30 ring-1 ring-sky-300/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Armchair className="w-4 h-4 text-sky-400" />
              Seat Maps
            </button>

            <button
              onClick={() => setActiveTab('my-bookings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'my-bookings'
                  ? 'bg-gradient-to-r from-[#0078D2] to-[#00519E] text-white shadow-md shadow-sky-600/30 ring-1 ring-sky-300/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Ticket className="w-4 h-4 text-amber-400" />
              My Bookings
              {bookingCount > 0 && (
                <span className="ml-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
                  {bookingCount}
                </span>
              )}
            </button>
          </nav>

          {/* Quick Action Button */}
          <div className="flex items-center gap-3">
            {userRole === 'admin' ? (
              <button
                onClick={() => {
                  setActiveTab('lookup');
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-[#C41230] to-[#990B22] text-white text-xs sm:text-sm font-extrabold px-4 py-2.5 rounded-xl shadow-lg shadow-red-900/40 border border-red-500/30 transition-all hover:scale-[1.02]"
              >
                <Building2 className="w-4 h-4" />
                <span>Front Desk Terminal</span>
              </button>
            ) : (
              <button
                onClick={onQuickBookClick}
                className="flex items-center gap-2 bg-gradient-to-r from-[#0078D2] to-[#00519E] hover:from-[#0060A9] hover:to-[#004280] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-sky-900/40 border border-sky-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Book Flight</span>
                <span className="sm:hidden">Book</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Tab bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-xs font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === 'search' ? 'text-sky-400 font-bold' : 'hover:text-white'
            }`}
          >
            <Plane className="w-4 h-4" />
            Book
          </button>
          <button
            onClick={() => setActiveTab('lookup')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === 'lookup' ? 'text-red-400 font-bold' : 'hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            {userRole === 'admin' ? 'Front Desk' : 'Lookup'}
          </button>
          <button
            onClick={() => setActiveTab('seat-explorer')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === 'seat-explorer' ? 'text-sky-400 font-bold' : 'hover:text-white'
            }`}
          >
            <Armchair className="w-4 h-4" />
            Seat Map
          </button>
          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg relative ${
              activeTab === 'my-bookings' ? 'text-sky-400 font-bold' : 'hover:text-white'
            }`}
          >
            <Ticket className="w-4 h-4" />
            Bookings
            {bookingCount > 0 && (
              <span className="absolute -top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
