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
    <div className="fixed inset-[#0] z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#001E42] via-[#002D62] to-[#C41230] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <Calculator className="w-7 h-7 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black uppercase tracking-widest text-sky-300 bg-sky-950/80 px-2.5 py-0.5 rounded border border-sky-700/60">
                  Global Flight Time & Distance Calculator
                </span>
                <AmericanAirlinesLogo className="h-4 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                Flight Time & Duration Calculator
              </h2>
              <p className="text-xs text-slate-200 mt-0.5">
                Automatically calculates exact flying time, distance in km/miles, time zone offset, and arrival schedule globally.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          {/* Top Airport Inputs (Takeoff & Landing) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Aircraft Type */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-sky-400" /> Cruising Aircraft Model
              </label>
              <select
                value={selectedAircraft.name}
                onChange={(e) => {
                  const found = AIRCRAFT_SPEEDS.find((a) => a.name === e.target.value);
                  if (found) setSelectedAircraft(found);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-white outline-none focus:border-sky-400"
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
                className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-white outline-none focus:border-emerald-400"
              />
            </div>

            {/* Departure Time */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" /> Departure Time (Local)
              </label>
              <input
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-white outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* CALCULATED RESULTS BANNER */}
          <div className="bg-gradient-to-br from-slate-950 via-[#001E42] to-slate-950 p-6 rounded-3xl border-2 border-sky-500/40 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{takeoffAirport.flag || '✈️'}</span>
                <div>
                  <div className="text-xs text-slate-400 uppercase font-mono font-bold">From</div>
                  <div className="font-black text-white text-base">
                    {takeoffAirport.city} ({takeoffAirport.code})
                  </div>
                  <div className="text-[11px] text-slate-400">{takeoffAirport.country}</div>
                </div>
              </div>

              <div className="flex flex-col items-center px-4">
                <div className="flex items-center gap-2 text-sky-400 font-mono font-black text-lg bg-sky-950/90 px-4 py-1.5 rounded-2xl border border-sky-600/60 shadow-inner">
                  <Clock className="w-5 h-5 text-sky-400 animate-pulse" />
                  <span>{calculation.durationFormatted}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-sky-400" /> Non-Stop Direct Flight
                </div>
              </div>

              <div className="flex items-center gap-2 text-right">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-mono font-bold">To</div>
                  <div className="font-black text-white text-base">
                    {landingAirport.city} ({landingAirport.code})
                  </div>
                  <div className="text-[11px] text-slate-400">{landingAirport.country}</div>
                </div>
                <span className="text-2xl">{landingAirport.flag || '🛬'}</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Flight Duration */}
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-400" /> Total Flying Time
                </div>
                <div className="text-base font-black text-sky-300 font-mono">
                  {calculation.durationHours}h {calculation.durationMinutes}m
                </div>
                <div className="text-[10px] text-slate-500">Includes takeoff & landing</div>
              </div>

              {/* Distance */}
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" /> Air Distance
                </div>
                <div className="text-base font-black text-emerald-300 font-mono">
                  {calculation.distanceKm.toLocaleString()} km
                </div>
                <div className="text-[10px] text-slate-500">{calculation.distanceMiles.toLocaleString()} miles</div>
              </div>

              {/* Calculated Landing Timestamp */}
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Expected Landing
                </div>
                <div className="text-xs font-black text-amber-300 font-mono leading-tight">
                  {arrDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="text-[11px] font-bold text-white font-mono">
                  at {arrDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Timezone offset & speed */}
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-purple-400" /> Timezone Shift
                </div>
                <div className="text-base font-black text-purple-300 font-mono">
                  {calculation.timezoneDifferenceHours >= 0 ? `+${calculation.timezoneDifferenceHours}h` : `${calculation.timezoneDifferenceHours}h`}
                </div>
                <div className="text-[10px] text-slate-500">Speed: {calculation.avgSpeedKmh} km/h</div>
              </div>
            </div>

            {/* Environmental & Fuel Data */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Flame className="w-4 h-4 text-orange-400" /> Est. Jet Fuel: <strong className="text-white font-mono">{calculation.estimatedFuelLiters.toLocaleString()} L</strong>
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Est. CO2 per Seat: <strong className="text-emerald-300 font-mono">{calculation.co2EmissionsKg} kg</strong>
              </span>
              <span className="text-[11px] font-mono text-sky-400 bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-800/60">
                Cruise Altitude: ~38,000 FT
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border border-slate-700 hover:bg-slate-800 text-xs font-bold text-slate-300 transition"
            >
              Close Calculator
            </button>

            {onBookFlight && (
              <button
                type="button"
                onClick={handleCreateAndBook}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#C41230] to-[#E52040] hover:from-[#a00e26] hover:to-[#C41230] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-900/40 transition transform active:scale-95"
              >
                <span>Book This Calculated Flight</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
