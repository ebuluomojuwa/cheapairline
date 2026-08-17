import React, { useState, useMemo } from 'react';
import { AirportLocation, Flight } from '../types';
import { WORLD_AIRPORTS } from '../data/worldAirports';
import { SmartAirportAutocomplete } from './SmartAirportAutocomplete';
import { calculateFlightDuration, FlightCalculationResult } from '../utils/flightCalculator';
import {
  Calculator,
  Clock,
  Plane,
  MapPin,
  Calendar,
  Gauge,
  Compass,
  Zap,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldAlert,
  Globe,
  Flame,
  Sparkles,
} from 'lucide-react';
import { AmericanAirlinesLogo } from './AmericanAirlinesLogo';

interface FlightCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookFlight?: (flight: Flight) => void;
  initialOrigin?: AirportLocation;
  initialDestination?: AirportLocation;
}

const AIRCRAFT_SPEEDS = [
  { name: 'Boeing 787-9 Dreamliner', speed: 900, icon: '✈️' },
  { name: 'Airbus A350-900 Ultra Long-Range', speed: 905, icon: '✈️' },
  { name: 'Boeing 777-300ER Flagship', speed: 890, icon: '✈️' },
  { name: 'Boeing 737 MAX 8 Regional', speed: 840, icon: '✈️' },
  { name: 'Concorde Supersonic Jet', speed: 2150, icon: '🚀' },
];

export const FlightCalculatorModal: React.FC<FlightCalculatorModalProps> = ({
  isOpen,
  onClose,
  onBookFlight,
  initialOrigin,
  initialDestination,
}) => {
  const [takeoffAirport, setTakeoffAirport] = useState<AirportLocation>(
    initialOrigin || WORLD_AIRPORTS[0] // Default JFK
  );
  const [landingAirport, setLandingAirport] = useState<AirportLocation>(
    initialDestination || WORLD_AIRPORTS[39] // Default Lagos Murtala LOS
  );
  const [selectedAircraft, setSelectedAircraft] = useState(AIRCRAFT_SPEEDS[0]);
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [departureTime, setDepartureTime] = useState('14:30');

  // Compute flight duration calculation
  const departureISO = `${departureDate}T${departureTime}:00`;
  const calculation: FlightCalculationResult = useMemo(() => {
    return calculateFlightDuration(
      takeoffAirport,
      landingAirport,
      departureISO,
      selectedAircraft.speed
    );
  }, [takeoffAirport, landingAirport, departureISO, selectedAircraft]);

  if (!isOpen) return null;

  const handleCreateAndBook = () => {
    const price = Math.floor(480 + calculation.distanceKm * 0.08);
    const generatedFlight: Flight = {
      id: `fl-calc-${Date.now()}`,
      flightNumber: `AA-${Math.floor(100 + Math.random() * 899)}`,
      airline: 'American Airlines',
      airlineCode: 'AA',
      aircraft: selectedAircraft.name,
      origin: takeoffAirport,
      destination: landingAirport,
      departureTime: departureISO,
      arrivalTime: calculation.arrivalTimeISO,
      duration: calculation.durationFormatted,
      price,
      totalSeats: 180,
      availableSeats: 154,
      terminal: 'T8',
      gate: `C${Math.floor(10 + Math.random() * 20)}`,
      status: 'On Time',
    };

    if (onBookFlight) {
      onBookFlight(generatedFlight);
      onClose();
    }
  };

  const arrDate = new Date(calculation.arrivalTimeISO);
  const depDate = new Date(departureISO);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#001E42] via-[#002D62] to-[#C41230] p-4 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-3.5 sm:top-5 right-3.5 sm:right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 sm:p-2 rounded-full transition min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 pr-10">
            <div className="p-2 sm:p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shrink-0">
              <Calculator className="w-5 h-5 sm:w-7 sm:h-7 text-sky-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-700/60">
                  Calculator
                </span>
                <AmericanAirlinesLogo className="h-3.5 sm:h-4 text-white" />
              </div>
              <h2 className="text-base sm:text-2xl font-black tracking-tight mt-1">
                Flight Time & Duration Calculator
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-200 mt-0.5 line-clamp-2 sm:line-clamp-none">
                Automatically calculates flying time, air distance in km/miles, time zone offset, and arrival schedule globally.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6">
          {/* Top Airport Inputs (Takeoff & Landing) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 bg-slate-800/80 p-3.5 sm:p-5 rounded-2xl border border-slate-700/80">
            {/* Takeoff Origin */}
            <SmartAirportAutocomplete
              type="takeoff"
              label="Takeoff Departure Airport (Origin)"
              placeholder="Type takeoff city, state, country or airport..."
              value={`${takeoffAirport.city} (${takeoffAirport.code}) - ${takeoffAirport.airport}`}
              selectedCode={takeoffAirport.code}
              onSelectAirport={(ap) => setTakeoffAirport(ap)}
            />

            {/* Landing Destination */}
            <SmartAirportAutocomplete
              type="landing"
              label="Landing Arrival Airport (Destination)"
              placeholder="Type landing city, state, country or airport..."
              value={`${landingAirport.city} (${landingAirport.code}) - ${landingAirport.airport}`}
              selectedCode={landingAirport.code}
              onSelectAirport={(ap) => setLandingAirport(ap)}
            />
          </div>

          {/* Aircraft Model & Departure Time Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Aircraft Type */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-sky-400" /> Aircraft Model
              </label>
              <select
                value={selectedAircraft.name}
                onChange={(e) => {
                  const found = AIRCRAFT_SPEEDS.find((a) => a.name === e.target.value);
                  if (found) setSelectedAircraft(found);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-white outline-none focus:border-sky-400 min-h-[44px]"
              >
                {AIRCRAFT_SPEEDS.map((ac) => (
                  <option key={ac.name} value={ac.name}>
                    {ac.icon} {ac.name} ({ac.speed} km/h)
                  </option>
                ))}
              </select>
            </div>

            {/* Departure Date */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" /> Departure Date
              </label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-white outline-none focus:border-emerald-400 min-h-[44px]"
              />
            </div>

            {/* Departure Time */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" /> Local Departure Time
              </label>
              <input
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-white outline-none focus:border-amber-400 min-h-[44px]"
              />
            </div>
          </div>

          {/* CALCULATED RESULTS BANNER */}
          <div className="bg-gradient-to-br from-slate-950 via-[#001E42] to-slate-950 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-sky-500/40 shadow-xl space-y-4 sm:space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl sm:text-2xl">{takeoffAirport.flag || '✈️'}</span>
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-xs text-slate-400 uppercase font-mono font-bold">From</div>
                  <div className="font-black text-white text-sm sm:text-base truncate">
                    {takeoffAirport.city} ({takeoffAirport.code})
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">{takeoffAirport.country}</div>
                </div>
              </div>

              <div className="flex flex-col items-center px-2 sm:px-4 order-last sm:order-none w-full sm:w-auto mt-2 sm:mt-0">
                <div className="flex items-center gap-2 text-sky-400 font-mono font-black text-base sm:text-lg bg-sky-950/90 px-3.5 sm:px-4 py-1.5 rounded-2xl border border-sky-600/60 shadow-inner">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 animate-pulse" />
                  <span>{calculation.durationFormatted}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-sky-400" /> Non-Stop Direct Flight
                </div>
              </div>

              <div className="flex items-center gap-2 text-right min-w-0">
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-xs text-slate-400 uppercase font-mono font-bold">To</div>
                  <div className="font-black text-white text-sm sm:text-base truncate">
                    {landingAirport.city} ({landingAirport.code})
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">{landingAirport.country}</div>
                </div>
                <span className="text-xl sm:text-2xl">{landingAirport.flag || '🛬'}</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {/* Flight Duration */}
              <div className="bg-slate-900/90 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-800 space-y-1">
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400" /> Flying Time
                </div>
                <div className="text-sm sm:text-base font-black text-sky-300 font-mono">
                  {calculation.durationHours}h {calculation.durationMinutes}m
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-500 truncate">Takeoff to landing</div>
              </div>

              {/* Distance */}
              <div className="bg-slate-900/90 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-800 space-y-1">
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" /> Air Distance
                </div>
                <div className="text-sm sm:text-base font-black text-emerald-300 font-mono">
                  {calculation.distanceKm.toLocaleString()} km
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-500 truncate">{calculation.distanceMiles.toLocaleString()} mi</div>
              </div>

              {/* Calculated Landing Timestamp */}
              <div className="bg-slate-900/90 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-800 space-y-1">
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" /> Landing
                </div>
                <div className="text-[11px] sm:text-xs font-black text-amber-300 font-mono leading-tight truncate">
                  {arrDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="text-[10px] sm:text-[11px] font-bold text-white font-mono truncate">
                  {arrDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Timezone offset & speed */}
              <div className="bg-slate-900/90 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-800 space-y-1">
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400" /> Timezone Shift
                </div>
                <div className="text-sm sm:text-base font-black text-purple-300 font-mono">
                  {calculation.timezoneDifferenceHours >= 0 ? `+${calculation.timezoneDifferenceHours}h` : `${calculation.timezoneDifferenceHours}h`}
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-500 truncate">{calculation.avgSpeedKmh} km/h</div>
              </div>
            </div>

            {/* Environmental & Fuel Data */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs bg-slate-900/60 p-3 sm:p-3.5 rounded-2xl border border-slate-800 text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400 text-[11px] sm:text-xs">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 shrink-0" /> Jet Fuel: <strong className="text-white font-mono">{calculation.estimatedFuelLiters.toLocaleString()} L</strong>
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 text-[11px] sm:text-xs">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" /> CO2: <strong className="text-emerald-300 font-mono">{calculation.co2EmissionsKg} kg/seat</strong>
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-sky-400 bg-sky-950/60 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-sky-800/60">
                Altitude: ~38k FT
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-700 hover:bg-slate-800 text-xs font-bold text-slate-300 transition text-center min-h-[44px]"
            >
              Close Calculator
            </button>

            {onBookFlight && (
              <button
                type="button"
                onClick={handleCreateAndBook}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#C41230] to-[#E52040] hover:from-[#a00e26] hover:to-[#C41230] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 transition transform active:scale-95 min-h-[44px]"
              >
                <span>Book This Flight</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
