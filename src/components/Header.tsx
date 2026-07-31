import React, { useState } from 'react';
import { 
  Plane, 
  Search, 
  Ticket, 
  Armchair, 
  PlusCircle, 
  ShieldCheck, 
  UserCheck, 
  Building2, 
  Lock, 
  LogOut, 
  Sun, 
  Moon, 
  Calculator,
  Crown,
  User,
  Users,
  LogIn
} from 'lucide-react';
import { AmericanAirlinesLogo } from './AmericanAirlinesLogo';
import { AppUserProfile } from '../lib/firebase';

interface HeaderProps {
  userRole: 'passenger' | 'admin' | 'superadmin';
  setUserRole: (role: 'passenger' | 'admin' | 'superadmin') => void;
  currentUser: AppUserProfile | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  activeTab: 'search' | 'lookup' | 'seat-explorer' | 'my-bookings' | 'admin-users';
  setActiveTab: (tab: 'search' | 'lookup' | 'seat-explorer' | 'my-bookings' | 'admin-users') => void;
  bookingCount: number;
  onQuickBookClick: () => void;
  onOpenCalculator?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userRole,
  setUserRole,
  currentUser,
  onOpenAuthModal,
  onLogout,
  activeTab,
  setActiveTab,
  bookingCount,
  onQuickBookClick,
  onOpenCalculator,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const isSuperAdmin = currentUser?.role === 'superadmin' || currentUser?.email?.toLowerCase() === 'ebulupaulboyld@gmail.com';
  const isAdminOrSuper = isSuperAdmin || currentUser?.role === 'admin' || userRole === 'admin' || userRole === 'superadmin';

  return (
    <header className="bg-[#001E42] border-b border-slate-700/80 text-white sticky top-0 z-40 shadow-xl backdrop-blur-md bg-opacity-95">
      {/* Top micro banner */}
      <div className="bg-[#00142E] text-slate-300 text-[11px] py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5 font-bold text-sky-400">
              <ShieldCheck className="w-3.5 h-3.5" /> American Airlines • Official Reservation Portal
            </span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-slate-300 hidden md:inline font-medium">AAdvantage® Member Perks & Seat Management</span>
          </div>

          {/* Theme Toggle & Auth Section */}
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

            {/* Authentication Icon / User Profile Button at Top Right */}
            {currentUser && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-sky-500/40 text-xs font-bold transition shadow-sm"
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white ${
                    isSuperAdmin ? 'bg-gradient-to-r from-amber-500 to-red-600' : 'bg-sky-600'
                  }`}>
                    {isSuperAdmin ? <Crown className="w-3 h-3 text-amber-300" /> : currentUser.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-slate-200 hidden sm:inline font-mono font-bold max-w-[120px] truncate">
                    {currentUser.displayName}
                  </span>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                    isSuperAdmin ? 'bg-red-600 text-white' : currentUser.role === 'admin' ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {currentUser.role}
                  </span>
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 text-xs space-y-2 animate-in fade-in duration-150">
                    <div className="p-2 bg-slate-800/80 rounded-xl space-y-0.5 border border-slate-700">
                      <div className="font-extrabold text-slate-100 truncate">{currentUser.displayName}</div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">{currentUser.email}</div>
                      <div className="pt-1 flex items-center gap-1">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          isSuperAdmin ? 'bg-red-900/80 text-amber-300 border border-red-600' : 'bg-sky-900 text-sky-200'
                        }`}>
                          {isSuperAdmin ? '👑 Super Admin' : currentUser.role}
                        </span>
                      </div>
                    </div>

                    {isAdminOrSuper && (
                      <button
                        onClick={() => {
                          setActiveTab('admin-users');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left p-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-800/80 font-bold flex items-center gap-2 transition"
                      >
                        <Users className="w-4 h-4 text-red-400" />
                        <span>Admin Page (Manage Users)</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onLogout();
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold flex items-center gap-2 transition"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div 
            className="flex items-center cursor-pointer group py-1"
            onClick={() => setActiveTab('search')}
          >
            <AmericanAirlinesLogo size="md" variant="dark-bg" />
            <div className="ml-3 hidden lg:flex flex-col border-l border-slate-700 pl-3">
              <span className="text-xs font-black tracking-wider text-slate-200 uppercase">
                {isAdminOrSuper ? 'Admin & Flight Operations' : 'Passenger Hub'}
              </span>
              <span className="text-[10px] text-sky-400 font-mono">
                {isAdminOrSuper ? 'Full Manifests & Clearance' : 'Ticket Search & Duration'}
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
              Search Flights
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
              {isAdminOrSuper ? '🛂 Manifests & Gate Check' : 'Ticket Search'}
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

            {isAdminOrSuper && (
              <button
                onClick={() => setActiveTab('admin-users')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold transition-all duration-200 ${
                  activeTab === 'admin-users'
                    ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white shadow-md shadow-red-900/30 ring-1 ring-amber-400/40'
                    : 'text-amber-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Crown className="w-4 h-4 text-amber-400" />
                Admin Page
              </button>
            )}
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onOpenCalculator && (
              <button
                type="button"
                onClick={onOpenCalculator}
                className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-sky-300 hover:text-white text-xs font-extrabold px-3 py-2.5 rounded-xl border border-sky-500/40 shadow-sm transition hover:scale-[1.02] active:scale-[0.98]"
                title="Calculate flight hours, distance & arrival schedule"
              >
                <Calculator className="w-4 h-4 text-sky-400" />
                <span className="hidden lg:inline">Flight Calculator</span>
              </button>
            )}

            {isSuperAdmin && (
              <button
                type="button"
                onClick={onQuickBookClick}
                className="flex items-center gap-2 bg-gradient-to-r from-[#0078D2] to-[#00519E] hover:from-[#0060A9] hover:to-[#004280] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-sky-900/40 border border-sky-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">Book Flight (Super Admin)</span>
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
            Search
          </button>
          <button
            onClick={() => setActiveTab('lookup')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === 'lookup' ? 'text-red-400 font-bold' : 'hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            Lookup
          </button>
          <button
            onClick={() => setActiveTab('seat-explorer')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === 'seat-explorer' ? 'text-sky-400 font-bold' : 'hover:text-white'
            }`}
          >
            <Armchair className="w-4 h-4" />
            Seats
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
          {isAdminOrSuper && (
            <button
              onClick={() => setActiveTab('admin-users')}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
                activeTab === 'admin-users' ? 'text-amber-400 font-bold' : 'hover:text-white'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-400" />
              Admin
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
