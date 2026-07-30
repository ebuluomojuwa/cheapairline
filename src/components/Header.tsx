import React from 'react';
import { Plane, Search, Ticket, Armchair, PlusCircle, ShieldCheck } from 'lucide-react';
import { AmericanAirlinesLogo } from './AmericanAirlinesLogo';

interface HeaderProps {
  activeTab: 'search' | 'lookup' | 'seat-explorer' | 'my-bookings';
  setActiveTab: (tab: 'search' | 'lookup' | 'seat-explorer' | 'my-bookings') => void;
  bookingCount: number;
  onQuickBookClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  bookingCount,
  onQuickBookClick,
}) => {
  return (
    <header className="bg-[#001E42] border-b border-slate-700/80 text-white sticky top-0 z-40 shadow-xl backdrop-blur-md bg-opacity-95">
      {/* Top micro banner */}
      <div className="bg-[#00142E] text-slate-300 text-[11px] py-1 px-4 border-b border-slate-800 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-sky-400">
              <ShieldCheck className="w-3.5 h-3.5" /> American Airlines Official Direct Hub
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">AAdvantage® Elite Loyalty & Seat Search Engine</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <span className="text-slate-400">STATUS: ONLINE</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
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
                  ? 'bg-gradient-to-r from-[#0078D2] to-[#00519E] text-white shadow-md shadow-sky-600/30 ring-1 ring-sky-300/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-4 h-4 text-red-400" />
              Seat & Passenger Lookup
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
              Interactive Seat Maps
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
            <button
              onClick={onQuickBookClick}
              className="flex items-center gap-2 bg-gradient-to-r from-[#C41230] to-[#990B22] hover:from-[#d91638] hover:to-[#b30d29] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-red-900/40 border border-red-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Reserve Seat</span>
              <span className="sm:hidden">Book</span>
            </button>
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
            Flights
          </button>
          <button
            onClick={() => setActiveTab('lookup')}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === 'lookup' ? 'text-sky-400 font-bold' : 'hover:text-white'
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
