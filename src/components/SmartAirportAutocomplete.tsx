import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AirportLocation } from '../types';
import { WORLD_AIRPORTS } from '../data/worldAirports';
import { Plane, MapPin, Building2, Globe, Search, X, Sparkles, Check } from 'lucide-react';

interface SmartAirportAutocompleteProps {
  label?: string;
  placeholder?: string;
  value?: string; // Current search string or selected airport label
  selectedCode?: string; // Currently selected airport code if any
  onSelectAirport: (airport: AirportLocation) => void;
  onClear?: () => void;
  type?: 'takeoff' | 'landing' | 'general';
  className?: string;
}

export const SmartAirportAutocomplete: React.FC<SmartAirportAutocompleteProps> = ({
  label,
  placeholder = 'Type country, state, city, or airport name (e.g. Lagos, JFK, London)...',
  value = '',
  selectedCode = '',
  onSelectAirport,
  onClear,
  type = 'landing',
  className = '',
}) => {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronize internal query with incoming value when props change externally
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Filter airports instantly with smart priority scoring based on input query
  const filteredAirports = useMemo(() => {
    if (!query || query.trim() === '') {
      // Show top featured world hubs when query is empty
      return WORLD_AIRPORTS.slice(0, 15);
    }
    const q = query.trim().toLowerCase();

    // Priority scoring for instant matching on 1, 2, or 3 character inputs
    const scored = WORLD_AIRPORTS.map((ap) => {
      const code = ap.code.toLowerCase();
      const city = ap.city.toLowerCase();
      const airport = ap.airport.toLowerCase();
      const country = ap.country.toLowerCase();
      const state = ap.state ? ap.state.toLowerCase() : '';

      let score = -1;

      if (code === q) score = 1000;
      else if (code.startsWith(q)) score = 900;
      else if (city.startsWith(q)) score = 800;
      else if (country.startsWith(q) || (state && state.startsWith(q))) score = 700;
      else if (airport.startsWith(q)) score = 650;
      else if (code.includes(q)) score = 500;
      else if (city.includes(q)) score = 400;
      else if (country.includes(q) || (state && state.includes(q))) score = 300;
      else if (airport.includes(q)) score = 200;

      return { ap, score };
    });

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.ap)
      .slice(0, 15); // Top 15 instant results
  }, [query]);

  // Handle outside clicks to close popout
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredAirports.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredAirports.length) % Math.max(1, filteredAirports.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredAirports.length > 0 && selectedIndex < filteredAirports.length) {
        handleSelect(filteredAirports[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (ap: AirportLocation) => {
    const displayString = `${ap.city} (${ap.code}) - ${ap.airport}`;
    setQuery(displayString);
    onSelectAirport(ap);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setSelectedIndex(0);
    setIsOpen(true);
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    if (onClear) onClear();
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="text-xs font-black text-slate-800 dark:text-slate-200 block uppercase tracking-wide mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            {type === 'takeoff' ? (
              <Plane className="w-4 h-4 text-sky-600 dark:text-sky-400 transform -rotate-45" />
            ) : type === 'landing' ? (
              <Plane className="w-4 h-4 text-[#C41230] transform rotate-45" />
            ) : (
              <MapPin className="w-4 h-4 text-emerald-600" />
            )}
            {label}
          </span>
          <span className="text-[10px] text-red-600 dark:text-red-400 font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/60 font-mono">
            Instant Smart Autocomplete
          </span>
        </label>
      )}

      {/* Input Box */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {type === 'takeoff' ? (
            <Plane className="w-4 h-4 text-sky-600 dark:text-sky-400 transform -rotate-45" />
          ) : (
            <Search className="w-4 h-4 text-slate-400" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={(e) => {
            setIsOpen(true);
            e.target.select();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#C41230] focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/40 outline-none transition shadow-xs"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold bg-slate-200 dark:bg-slate-700 rounded-full w-5 h-5 flex items-center justify-center transition"
            title="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Instant Smart Popout Results Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-slate-900/10 dark:border-slate-700 overflow-hidden max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="bg-gradient-to-r from-[#001E42] to-[#002D62] px-4 py-2 text-white text-[11px] font-bold flex items-center justify-between border-b border-slate-800">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-300" />
              {!query.trim() ? 'Featured Takeoff & Destination Hubs' : `Matching Airports (${filteredAirports.length})`}
            </span>
            <span className="text-[10px] font-mono text-sky-200">
              Type code, city, state or country
            </span>
          </div>

          {filteredAirports.length === 0 ? (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-xs space-y-1">
              <p className="font-bold text-slate-700 dark:text-slate-300">No matching airports found for "{query}"</p>
              <p className="text-[11px]">Try typing a country name (e.g. Nigeria, USA, UK), state or city name.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredAirports.map((ap, idx) => {
                const isSelected = selectedCode === ap.code;
                const isFocused = idx === selectedIndex;

                return (
                  <button
                    key={`${ap.code}-${ap.city}-${idx}`}
                    type="button"
                    onClick={() => handleSelect(ap)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left p-3.5 transition flex items-center justify-between gap-3 ${
                      isFocused
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-[#0078D2]'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-2xl shrink-0 mt-0.5">{ap.flag || '✈️'}</span>
                      <div className="min-w-0">
                        {/* City and Airport Name */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm text-slate-900 dark:text-slate-100 tracking-tight">
                            {ap.city}
                          </span>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                            — {ap.airport}
                          </span>
                        </div>

                        {/* Location Details: State, Country */}
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          {ap.state && (
                            <span className="flex items-center gap-1 font-medium">
                              <Building2 className="w-3 h-3 text-amber-500 shrink-0" />
                              {ap.state}
                            </span>
                          )}
                          <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <Globe className="w-3 h-3 text-emerald-500 shrink-0" />
                            {ap.country}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* IATA Code Badge */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-[#001E42] text-white dark:bg-slate-800 dark:text-sky-300 border border-slate-700 shadow-2xs">
                        {ap.code}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
