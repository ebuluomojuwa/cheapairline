import React, { useState, useMemo } from 'react';
import { Flight } from '../types';
import { Plane, MapPin, Search, ArrowRight, Sparkles, Armchair, ShieldCheck, Award, Globe, Building2 } from 'lucide-react';
import { AmericanAirlinesLogo } from './AmericanAirlinesLogo';
import { WORLD_AIRPORTS, searchWorldAirports, createFlightForDestination } from '../data/worldAirports';

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
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [destinationCode, setDestinationCode] = useState<string>('all');
  const [destinationSearchText, setDestinationSearchText] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(1800);

  // List of all unique countries available
  const uniqueCountries = useMemo(() => {
    const set = new Set(WORLD_AIRPORTS.map((a) => a.country));
    return Array.from(set).sort();
  }, []);

  // List of states for the currently selected country
  const statesForCountry = useMemo(() => {
    if (selectedCountry === 'all') return [];
    const set = new Set(
      WORLD_AIRPORTS.filter((a) => a.country === selectedCountry && a.state)
        .map((a) => a.state as string)
    );
    return Array.from(set).sort();
  }, [selectedCountry]);

  // List of airports matching current country & state selection
  const airportsForSelection = useMemo(() => {
    return WORLD_AIRPORTS.filter((a) => {
      if (selectedCountry !== 'all' && a.country !== selectedCountry) return false;
      if (selectedState !== 'all' && a.state !== selectedState) return false;
      return true;
    });
  }, [selectedCountry, selectedState]);

  // Combined flights: static initial flights + dynamically generated flights for airports matching the destination search
  const displayFlights = useMemo(() => {
    let list: Flight[] = [...flights];

    // Filter by departure origin hub
    if (origin !== 'all') {
      list = list.filter((f) => f.origin.code === origin);
    }

    // Filter by max price
    list = list.filter((f) => f.price <= maxPrice);

    // Filter by specific destination code if explicitly picked in dropdown
    if (destinationCode !== 'all') {
      const existing = list.filter((f) => f.destination.code === destinationCode);
      if (existing.length > 0) {
        return existing;
      } else {
        const destAp = WORLD_AIRPORTS.find((a) => a.code === destinationCode);
        if (destAp) {
          return [createFlightForDestination(destAp)];
        }
      }
    }

    // Filter by selected Country & State
    if (selectedCountry !== 'all') {
      list = list.filter(
        (f) =>
          f.destination.country === selectedCountry ||
          WORLD_AIRPORTS.some(
            (wa) => wa.code === f.destination.code && wa.country === selectedCountry
          )
      );
    }

    if (selectedState !== 'all') {
      list = list.filter(
        (f) =>
          f.destination.state === selectedState ||
          WORLD_AIRPORTS.some(
            (wa) => wa.code === f.destination.code && wa.state === selectedState
          )
      );
    }

    // Text search matching country, state, city, airport name, or code
    if (destinationSearchText.trim() !== '') {
      const query = destinationSearchText.toLowerCase().trim();
      list = list.filter((f) => {
        const matchesCity = f.destination.city.toLowerCase().includes(query);
        const matchesAirport = f.destination.airport.toLowerCase().includes(query);
        const matchesCode = f.destination.code.toLowerCase().includes(query);
        const matchesCountry = f.destination.country?.toLowerCase().includes(query);
        const matchesState = f.destination.state?.toLowerCase().includes(query);
        return matchesCity || matchesAirport || matchesCode || matchesCountry || matchesState;
      });

      // If text query didn't return static flight items, search world airports and auto-generate flights
      if (list.length === 0) {
        const matchingWorldAirports = searchWorldAirports(query);
        if (matchingWorldAirports.length > 0) {
          return matchingWorldAirports.slice(0, 6).map((ap) => createFlightForDestination(ap));
        }
      }
    } else if (selectedCountry !== 'all' && list.length === 0) {
      // If country selected but no static flight, generate flight for first airport in that country
      const matchedAps = WORLD_AIRPORTS.filter((a) => a.country === selectedCountry);
      if (matchedAps.length > 0) {
        return matchedAps.map((ap) => createFlightForDestination(ap));
      }
    }

    return list;
  }, [flights, origin, selectedCountry, selectedState, destinationCode, destinationSearchText, maxPrice]);

  const quickCountries = [
    { country: 'Nigeria', flag: '🇳🇬', code: 'LOS', name: 'Lagos / Abuja' },
    { country: 'United States', flag: '🇺🇸', code: 'JFK', name: 'New York / LAX / Chicago' },
    { country: 'United Kingdom', flag: '🇬🇧', code: 'LHR', name: 'London Heathrow' },
    { country: 'Canada', flag: '🇨🇦', code: 'YYZ', name: 'Toronto / Vancouver' },
    { country: 'Japan', flag: '🇯🇵', code: 'HND', name: 'Tokyo Haneda' },
    { country: 'France', flag: '🇫🇷', code: 'CDG', name: 'Paris CDG' },
    { country: 'Germany', flag: '🇩🇪', code: 'FRA', name: 'Frankfurt' },
    { country: 'Italy', flag: '🇮🇹', code: 'FCO', name: 'Rome Fiumicino' },
    { country: 'Spain', flag: '🇪🇸', code: 'MAD', name: 'Madrid' },
    { country: 'United Arab Emirates', flag: '🇦🇪', code: 'DXB', name: 'Dubai / Abu Dhabi' },
    { country: 'South Africa', flag: '🇿🇦', code: 'JNB', name: 'Johannesburg' },
    { country: 'Brazil', flag: '🇧🇷', code: 'GRU', name: 'São Paulo' },
    { country: 'India', flag: '🇮🇳', code: 'DEL', name: 'New Delhi / Mumbai' },
    { country: 'Egypt', flag: '🇪🇬', code: 'CAI', name: 'Cairo' },
    { country: 'Ghana', flag: '🇬🇭', code: 'ACC', name: 'Accra' },
    { country: 'Kenya', flag: '🇰🇪', code: 'NBO', name: 'Nairobi' },
    { country: 'Australia', flag: '🇦🇺', code: 'SYD', name: 'Sydney' },
  ];

  const handleResetFilters = () => {
    setOrigin('all');
    setSelectedCountry('all');
    setSelectedState('all');
    setDestinationCode('all');
    setDestinationSearchText('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* American Airlines Travel Search Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#001E42] via-[#002D62] to-[#00152E] border border-slate-700/80 p-6 sm:p-10 text-white shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#0078D2]/20 via-[#C41230]/10 to-transparent rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-700/80 pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 text-sky-300 border border-slate-600/60 text-xs font-semibold">
              <AmericanAirlinesLogo size="sm" variant="dark-bg" />
              <span className="text-slate-500">|</span>
              <span className="text-red-400 font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> AAdvantage® Travel Hub
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
              Where to next? Find American Airlines flights
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Book direct flights with real-time seat map preview. Looking up an existing reservation? Enter a <strong className="text-white">Seat Number</strong> (e.g. <span className="bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono font-bold">01A</span>, <span className="bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono font-bold">12F</span>) or <strong className="text-white">Ticket Number</strong>.
            </p>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={onGoToLookup}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 flex items-center gap-2 transition backdrop-blur-xs"
            >
              <Search className="w-4 h-4 text-sky-300" />
              <span>Lookup Seat or Ticket</span>
            </button>
          </div>
        </div>

        {/* Trip Parameters Selector Bar (Roundtrip / Cabin / Passengers) */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-200">
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700/80">
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-[#0078D2] text-white shadow-xs"
            >
              One-way
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition"
            >
              Roundtrip
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-700/80 text-slate-300">
            <Armchair className="w-3.5 h-3.5 text-sky-400" />
            <span>1 Traveler (Adult)</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-700/80 text-slate-300">
            <Award className="w-3.5 h-3.5 text-red-400" />
            <span>Main Cabin / Premium Economy / Flagship®</span>
          </div>
        </div>
      </div>

      {/* Global Destination & Route Search Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#C41230]" /> Global Destination, Country & State Airport Directory
          </h2>
          {(origin !== 'all' || selectedCountry !== 'all' || selectedState !== 'all' || destinationCode !== 'all' || destinationSearchText !== '') && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-[#C41230] hover:underline flex items-center gap-1"
            >
              ✕ Reset All Destination Filters
            </button>
          )}
        </div>

        {/* Primary Freeform Input Search Box */}
        <div className="bg-gradient-to-r from-red-50/70 via-slate-50 to-sky-50/70 dark:from-red-950/30 dark:via-slate-900 dark:to-sky-950/30 p-4 rounded-xl border border-red-200/80 dark:border-red-900/40 space-y-2">
          <label className="text-xs font-black text-slate-800 dark:text-slate-200 block uppercase tracking-wide flex items-center justify-between">
            <span>1. Search / Input Any Destination Country, State, City, or Airport</span>
            <span className="text-[10px] text-red-600 dark:text-red-400 font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/60 font-mono">Worldwide Coverage</span>
          </label>
          <div className="relative">
            <Plane className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C41230] transform rotate-45" />
            <input
              type="text"
              value={destinationSearchText}
              onChange={(e) => {
                setDestinationSearchText(e.target.value);
                setDestinationCode('all');
              }}
              placeholder="Type any country (e.g. Nigeria, United States, Japan, France), state/province, or airport..."
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#C41230] focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/40 outline-none transition shadow-xs"
            />
            {destinationSearchText && (
              <button
                onClick={() => setDestinationSearchText('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold bg-slate-200 dark:bg-slate-700 rounded-full w-5 h-5 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 3-Step Destination Dropdowns (Country -> State -> Airport) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Country Selector */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Select Country</label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
              <select
                value={selectedCountry}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCountry(val);
                  setSelectedState('all');
                  setDestinationCode('all');
                }}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:border-[#0078D2] focus:ring-1 focus:ring-[#0078D2] outline-none"
              >
                <option value="all">🌍 All Countries ({uniqueCountries.length})</option>
                {uniqueCountries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. State / Province Selector */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Select State / Province</label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-600 dark:text-amber-400" />
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setDestinationCode('all');
                }}
                disabled={selectedCountry === 'all'}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:border-[#0078D2] focus:ring-1 focus:ring-[#0078D2] outline-none disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 dark:disabled:text-slate-600"
              >
                <option value="all">
                  {selectedCountry === 'all' ? 'Select a Country First' : `All States in ${selectedCountry}`}
                </option>
                {statesForCountry.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Specific Airport Selector */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Select Airport</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-red-500 dark:text-red-400" />
              <select
                value={destinationCode}
                onChange={(e) => {
                  setDestinationCode(e.target.value);
                }}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:border-[#C41230] focus:ring-1 focus:ring-[#C41230] outline-none"
              >
                <option value="all">Any Airport Option ({airportsForSelection.length})</option>
                {airportsForSelection.map((ap) => (
                  <option key={ap.code} value={ap.code}>
                    {ap.flag || '✈️'} {ap.city} ({ap.code}) - {ap.airport}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Departure Hub Origin */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Departure Origin Hub</label>
            <div className="relative">
              <Plane className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sky-600 dark:text-sky-400 transform -rotate-45" />
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:border-[#0078D2] focus:ring-1 focus:ring-[#0078D2] outline-none"
              >
                <option value="all">Any Origin Hub</option>
                <option value="JFK">JFK - New York Kennedy</option>
                <option value="LAX">LAX - Los Angeles Intl</option>
                <option value="DFW">DFW - Dallas / Fort Worth</option>
                <option value="ORD">ORD - Chicago O'Hare</option>
                <option value="MIA">MIA - Miami Intl</option>
                <option value="SFO">SFO - San Francisco</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Country Destination Pills */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 block mb-2 uppercase tracking-wide">
            Or Quick Click Destination Country & Major Hub:
          </span>
          <div className="flex flex-wrap gap-2">
            {quickCountries.map((item) => {
              const isActive = selectedCountry === item.country;
              return (
                <button
                  key={item.country}
                  onClick={() => {
                    if (isActive) {
                      setSelectedCountry('all');
                      setDestinationCode('all');
                    } else {
                      setSelectedCountry(item.country);
                      setDestinationCode('all');
                      setDestinationSearchText('');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                    isActive
                      ? 'bg-[#C41230] text-white border-[#A00E26] shadow-sm scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="text-sm">{item.flag}</span>
                  <span>{item.country}</span>
                  <span className="text-[10px] opacity-75 font-mono">({item.code})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Flight Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Available American Airlines Schedules ({displayFlights.length})
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">Select a flight to launch the seat assignment matrix</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {displayFlights.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Plane className="w-6 h-6 transform rotate-45 text-slate-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">No flights match your filter criteria</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Try clearing your search query or selecting a different country or state airport.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="bg-[#0078D2] text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[#0060A9] transition inline-flex items-center gap-2"
              >
                <span>Reset All Destination Filters</span>
              </button>
            </div>
          ) : (
            displayFlights.map((flight) => (
              <div
                key={flight.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-sky-300 dark:hover:border-sky-500"
              >
              {/* Airline & Route details */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#001E42] to-[#003A70] text-white p-2 flex flex-col items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                  <span className="font-black text-xs text-sky-400">AA</span>
                  <span className="text-[10px] font-mono text-slate-300">{flight.flightNumber.split('-')[1]}</span>
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">{flight.airline}</h3>
                    <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-[#0078D2] dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80">
                      Flight {flight.flightNumber}
                    </span>
                    <span className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full font-bold">
                      {flight.status}
                    </span>
                  </div>

                  {/* Route & Airport Details Box */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-b border-slate-200/80 dark:border-slate-700/80 pb-3">
                      {/* Take-off Airport & Origin */}
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-1">
                        <div className="text-[10px] text-sky-700 dark:text-sky-400 font-black uppercase tracking-wider flex items-center gap-1">
                          <Plane className="w-3.5 h-3.5 text-[#0078D2] transform -rotate-45" />
                          Starting From (Take-off Airport)
                        </div>
                        <div className="text-base font-black text-slate-900 dark:text-slate-100">{flight.origin.city} ({flight.origin.code})</div>
                        <div className="text-xs font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                          <span>{flight.origin.airport}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                          <span className="text-slate-400 dark:text-slate-500">Flight Time:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-200">
                            {new Date(flight.departureTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Landing Airport & Destination */}
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-1">
                        <div className="text-[10px] text-red-700 dark:text-red-400 font-black uppercase tracking-wider flex items-center gap-1">
                          <Plane className="w-3.5 h-3.5 text-[#C41230] transform rotate-45" />
                          Heading To (Landing Airport)
                        </div>
                        <div className="text-base font-black text-slate-900 dark:text-slate-100">{flight.destination.city} ({flight.destination.code})</div>
                        <div className="text-xs font-bold text-red-800 dark:text-red-300 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
                          <span>{flight.destination.airport}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                          <span className="text-slate-400 dark:text-slate-500">Arrival Time:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-200">
                            {new Date(flight.arrivalTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-2 font-medium">
                      <span>Aircraft: <strong className="text-slate-900 dark:text-slate-100 font-bold">{flight.aircraft}</strong></span>
                      <span>Terminal <strong className="text-slate-900 dark:text-slate-100 font-bold">{flight.terminal}</strong> • Gate <strong className="text-slate-900 dark:text-slate-100 font-bold">{flight.gate}</strong></span>
                      <span>Duration: <strong className="text-slate-900 dark:text-slate-100 font-bold">{flight.duration}</strong></span>
                      <span className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                        <Armchair className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        {flight.availableSeats} Open Seats
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Book Button */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 gap-3">
                <div className="text-left md:text-right">
                  <span className="text-[10px] uppercase text-slate-400 font-extrabold block">Main Cabin & Up</span>
                  <span className="text-2xl font-black text-[#001E42] dark:text-sky-400">${flight.price}</span>
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
          )))
        }
        </div>
      </div>
    </div>
  );
};
