import React, { useState, useMemo } from 'react';
import { Flight } from '../types';
import { Plane, MapPin, Search, ArrowRight, Sparkles, Armchair, ShieldCheck, Award } from 'lucide-react';
import { AmericanAirlinesLogo } from './AmericanAirlinesLogo';

interface FlightSearchProps {
  flights: Flight[];
  onSelectFlight: (flight: Flight) => void;
  onGoToLookup: () => void;
}

export const FlightSearch: React.FC<FlightSearchProps> = ({
  flights,
  onSelectFlight,
  onGoToLookup,
}) => {
  const [origin, setOrigin] = useState<string>('all');
  const [destination, setDestination] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(1500);

  // Filter flights
  const filteredFlights = useMemo(() => {
    return flights.filter((f) => {
      if (origin !== 'all' && f.origin.code !== origin) return false;
      if (destination !== 'all' && f.destination.code !== destination) return false;
      if (f.price > maxPrice) return false;
      return true;
    });
  }, [flights, origin, destination, maxPrice]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* American Airlines Flagship Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#001E42] via-[#002D62] to-[#00152E] border border-slate-700/80 p-8 sm:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#0078D2]/20 via-[#C41230]/10 to-transparent rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 text-sky-300 border border-slate-600/60 text-xs font-bold shadow-sm">
            <AmericanAirlinesLogo size="sm" variant="dark-bg" />
            <span className="text-slate-400">|</span>
            <span className="flex items-center gap-1 text-red-400 font-extrabold">
              <Award className="w-3.5 h-3.5" /> Flagship® Seat Reservation
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            American Airlines Flight Booking & Passenger Lookup
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Reserve your flight with real-time interactive seat map selection. Enter any <strong className="text-white">Seat Number</strong> (e.g. <span className="bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono font-bold">01A</span>, <span className="bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono font-bold">12F</span>) or <strong className="text-white">Ticket Number</strong> (e.g. <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-mono font-bold">001-8942-0101</span>) to instantly inspect full passenger profiles, meal choices, and baggage logs.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onGoToLookup}
              className="bg-[#0078D2] hover:bg-[#0060A9] text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl border border-sky-400/30 flex items-center gap-2 transition shadow-lg shadow-sky-900/40"
            >
              <Search className="w-4 h-4 text-white" />
              <span>Search Seat Number or Ticket Number</span>
            </button>
          </div>
        </div>
      </div>

      {/* Flight Filter Controls */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200/80 space-y-4">
        <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Search className="w-4 h-4 text-[#0078D2]" /> Search American Airlines Flight Schedules
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Origin */}
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Departure Airport</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 bg-white focus:border-[#0078D2] focus:ring-1 focus:ring-[#0078D2] outline-none"
              >
                <option value="all">Any Origin Hub</option>
                <option value="JFK">JFK - New York (Kennedy)</option>
                <option value="LAX">LAX - Los Angeles Intl</option>
                <option value="DFW">DFW - Dallas / Fort Worth</option>
                <option value="ORD">ORD - Chicago O'Hare</option>
                <option value="MIA">MIA - Miami Intl</option>
                <option value="SFO">SFO - San Francisco</option>
              </select>
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Destination Airport</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 bg-white focus:border-[#0078D2] focus:ring-1 focus:ring-[#0078D2] outline-none"
              >
                <option value="all">Any Destination Hub</option>
                <option value="LHR">LHR - London Heathrow</option>
                <option value="HND">HND - Tokyo Haneda</option>
                <option value="CDG">CDG - Paris Charles de Gaulle</option>
                <option value="EZE">EZE - Buenos Aires</option>
                <option value="JFK">JFK - New York Kennedy</option>
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-500">Max Fare Price</label>
              <span className="text-xs font-black text-[#0078D2]">${maxPrice}</span>
            </div>
            <input
              type="range"
              min={500}
              max={1500}
              step={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0078D2] mt-3"
            />
          </div>
        </div>
      </div>

      {/* Flight Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            Available American Airlines Schedules ({filteredFlights.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">Select a flight to launch the seat assignment matrix</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredFlights.map((flight) => (
            <div
              key={flight.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-sky-300"
            >
              {/* Airline & Route details */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#001E42] to-[#003A70] text-white p-2 flex flex-col items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                  <span className="font-black text-xs text-sky-400">AA</span>
                  <span className="text-[10px] font-mono text-slate-300">{flight.flightNumber.split('-')[1]}</span>
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-base">{flight.airline}</h3>
                    <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded bg-sky-50 text-[#0078D2] border border-sky-200/80">
                      Flight {flight.flightNumber}
                    </span>
                    <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full font-bold">
                      {flight.status}
                    </span>
                  </div>

                  {/* Route & Airport Details Box */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-b border-slate-200/80 pb-3">
                      {/* Take-off Airport & Origin */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                        <div className="text-[10px] text-sky-700 font-black uppercase tracking-wider flex items-center gap-1">
                          <Plane className="w-3.5 h-3.5 text-[#0078D2] transform -rotate-45" />
                          Starting From (Take-off Airport)
                        </div>
                        <div className="text-base font-black text-slate-900">{flight.origin.city} ({flight.origin.code})</div>
                        <div className="text-xs font-bold text-sky-800 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span>{flight.origin.airport}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-semibold pt-1 border-t border-slate-100 flex items-center gap-1.5">
                          <span className="text-slate-400">Flight Time:</span>
                          <span className="font-mono font-bold text-slate-900">
                            {new Date(flight.departureTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Landing Airport & Destination */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                        <div className="text-[10px] text-red-700 font-black uppercase tracking-wider flex items-center gap-1">
                          <Plane className="w-3.5 h-3.5 text-[#C41230] transform rotate-45" />
                          Heading To (Landing Airport)
                        </div>
                        <div className="text-base font-black text-slate-900">{flight.destination.city} ({flight.destination.code})</div>
                        <div className="text-xs font-bold text-red-800 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span>{flight.destination.airport}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-semibold pt-1 border-t border-slate-100 flex items-center gap-1.5">
                          <span className="text-slate-400">Arrival Time:</span>
                          <span className="font-mono font-bold text-slate-900">
                            {new Date(flight.arrivalTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 font-medium">
                      <span>Aircraft: <strong className="text-slate-900 font-bold">{flight.aircraft}</strong></span>
                      <span>Terminal <strong className="text-slate-900 font-bold">{flight.terminal}</strong> • Gate <strong className="text-slate-900 font-bold">{flight.gate}</strong></span>
                      <span>Duration: <strong className="text-slate-900 font-bold">{flight.duration}</strong></span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <Armchair className="w-3.5 h-3.5 text-emerald-600" />
                        {flight.availableSeats} Open Seats
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Book Button */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 gap-3">
                <div className="text-left md:text-right">
                  <span className="text-[10px] uppercase text-slate-400 font-extrabold block">Main Cabin & Up</span>
                  <span className="text-2xl font-black text-[#001E42]">${flight.price}</span>
                  <span className="text-[10px] text-slate-400 block">one way per passenger</span>
                </div>

                <button
                  onClick={() => onSelectFlight(flight)}
                  className="bg-[#0078D2] hover:bg-[#0060A9] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-sky-600/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Armchair className="w-4 h-4 text-sky-200" />
                  <span>Book & Select Seat</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
