import React, { useState, useEffect, useMemo } from 'react';
import { Flight, Booking } from '../types';
import { 
  Plane, 
  Search, 
  Radio, 
  MapPin, 
  Clock, 
  Compass, 
  Gauge, 
  Wind, 
  Thermometer, 
  Wifi, 
  Tv, 
  Zap, 
  Utensils, 
  CheckCircle2, 
  AlertCircle, 
  Armchair, 
  Ticket, 
  Share2, 
  RefreshCw, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Luggage,
  Building2
} from 'lucide-react';
import { AmericanAirlinesLogo } from './AmericanAirlinesLogo';
import { calculateFlightDuration, getAirportCoords } from '../utils/flightCalculator';
import { WORLD_AIRPORTS } from '../data/worldAirports';

interface FlightTrackerViewProps {
  flights: Flight[];
  bookings: Booking[];
  initialFlightId?: string;
  initialQuery?: string;
  onSelectFlightForBooking?: (flight: Flight) => void;
  onViewSeatMap?: (flight: Flight) => void;
  onViewBoardingPass?: (booking: Booking) => void;
  onOpenCalculator?: () => void;
  onGoToManifests?: (query: string) => void;
}

export const FlightTrackerView: React.FC<FlightTrackerViewProps> = ({
  flights,
  bookings,
  initialFlightId,
  initialQuery = '',
  onSelectFlightForBooking,
  onViewSeatMap,
  onViewBoardingPass,
  onOpenCalculator,
  onGoToManifests,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [selectedFlightId, setSelectedFlightId] = useState<string>(initialFlightId || flights[0]?.id || 'fl-101');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [liveSeconds, setLiveSeconds] = useState<number>(0);
  const [isLiveRefreshing, setIsLiveRefreshing] = useState<boolean>(false);

  // Live timer tick to simulate dynamic live telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveSeconds((prev) => (prev + 1) % 3600);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update selected flight if initialFlightId prop changes
  useEffect(() => {
    if (initialFlightId) {
      setSelectedFlightId(initialFlightId);
    }
  }, [initialFlightId]);

  // Update searchQuery if initialQuery prop changes
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  // Unified list of all flights: provided flights + any flights reconstructed from active bookings
  const allTrackableFlights = useMemo(() => {
    const map = new Map<string, Flight>();
    flights.forEach((f) => map.set(f.id, f));

    bookings.forEach((b) => {
      const alreadyHas = Array.from(map.values()).some(
        (f) => f.id === b.flightId || f.flightNumber.toLowerCase() === b.flightNumber.toLowerCase()
      );
      if (!alreadyHas) {
        map.set(b.flightId, {
          id: b.flightId,
          flightNumber: b.flightNumber,
          airline: b.airline || 'American Airlines',
          airlineCode: 'AA',
          aircraft: b.aircraft || 'Boeing 787-9 Dreamliner',
          origin: b.origin,
          destination: b.destination,
          departureTime: b.departureTime,
          arrivalTime: b.arrivalTime,
          duration: b.duration || '8h 00m',
          price: b.pricePaid || 650,
          totalSeats: 180,
          availableSeats: 140,
          terminal: b.terminal || 'T8',
          gate: b.gate || 'B20',
          status: 'On Time',
        });
      }
    });

    return Array.from(map.values());
  }, [flights, bookings]);

  // Filtered flights based on search query
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allTrackableFlights;

    // Remove dashes or spaces for flight number, PNR, or ticket matching
    const cleanQ = q.replace(/[\s-]/g, '');

    return allTrackableFlights.filter((f) => {
      const cleanFlightNum = f.flightNumber.toLowerCase().replace(/[\s-]/g, '');
      const flightNumWithoutAA = cleanFlightNum.replace(/^aa/, '');
      const flightMatches =
        cleanFlightNum.includes(cleanQ) ||
        f.flightNumber.toLowerCase().includes(q) ||
        f.id.toLowerCase() === q ||
        f.id.toLowerCase().includes(cleanQ) ||
        (cleanQ.length >= 2 && flightNumWithoutAA === cleanQ);

      const originMatches =
        f.origin.code.toLowerCase().includes(q) ||
        f.origin.city.toLowerCase().includes(q) ||
        f.origin.airport.toLowerCase().includes(q) ||
        (f.origin.country && f.origin.country.toLowerCase().includes(q));

      const destMatches =
        f.destination.code.toLowerCase().includes(q) ||
        f.destination.city.toLowerCase().includes(q) ||
        f.destination.airport.toLowerCase().includes(q) ||
        (f.destination.country && f.destination.country.toLowerCase().includes(q));

      const aircraftMatches = f.aircraft.toLowerCase().includes(q);

      // Check if query matches any passenger ticket/name/PNR on this flight
      const bookingMatches = bookings.some((b) => {
        const isThisFlight =
          b.flightId === f.id ||
          b.flightNumber.toLowerCase() === f.flightNumber.toLowerCase() ||
          b.flightNumber.toLowerCase().replace(/[\s-]/g, '') === cleanFlightNum;

        if (!isThisFlight) return false;

        const cleanTicket = b.ticketNumber.toLowerCase().replace(/[\s-]/g, '');
        const cleanConfirm = b.confirmationCode.toLowerCase().replace(/[\s-]/g, '');

        const ticketMatches = b.ticketNumber.toLowerCase().includes(q) || cleanTicket.includes(cleanQ);
        const confirmMatches = b.confirmationCode.toLowerCase().includes(q) || cleanConfirm.includes(cleanQ);
        const seatMatches = b.seatNumber.toLowerCase().includes(q) || b.seatNumber.toLowerCase().replace(/[\s-]/g, '') === cleanQ;
        const passengerMatches =
          b.passenger.fullName.toLowerCase().includes(q) ||
          b.passenger.email.toLowerCase().includes(q) ||
          (b.passenger.passportNumber && b.passenger.passportNumber.toLowerCase().includes(q));

        const familyMatches = b.passengers?.some(
          (p) =>
            p.fullName.toLowerCase().includes(q) ||
            p.email?.toLowerCase().includes(q) ||
            p.seatNumber?.toLowerCase().includes(q)
        );

        return ticketMatches || confirmMatches || seatMatches || passengerMatches || familyMatches;
      });

      return flightMatches || originMatches || destMatches || aircraftMatches || bookingMatches;
    });
  }, [allTrackableFlights, bookings, searchQuery]);

  // Automatically select first matching flight if current selection isn't in filtered list
  useEffect(() => {
    if (searchResults.length > 0 && !searchResults.some((f) => f.id === selectedFlightId)) {
      setSelectedFlightId(searchResults[0].id);
    }
  }, [searchResults, selectedFlightId]);

  // Active tracked flight
  const activeFlight = useMemo(() => {
    return (
      allTrackableFlights.find((f) => f.id === selectedFlightId) ||
      allTrackableFlights.find((f) => f.flightNumber.toLowerCase() === selectedFlightId.toLowerCase()) ||
      searchResults[0] ||
      allTrackableFlights[0]
    );
  }, [allTrackableFlights, selectedFlightId, searchResults]);

  // Calculate detailed flight navigation metrics
  const flightMetrics = useMemo(() => {
    if (!activeFlight) return null;
    return calculateFlightDuration(
      activeFlight.origin,
      activeFlight.destination,
      activeFlight.departureTime
    );
  }, [activeFlight]);

  // Associated bookings for this flight
  const flightBookings = useMemo(() => {
    if (!activeFlight) return [];
    return bookings.filter(
      (b) =>
        b.flightId === activeFlight.id ||
        b.flightNumber.toLowerCase() === activeFlight.flightNumber.toLowerCase()
    );
  }, [bookings, activeFlight]);

  // Simulated live telemetry based on flight status and scheduled duration
  const telemetry = useMemo(() => {
    if (!activeFlight || !flightMetrics) {
      return {
        statusLabel: 'On Time',
        statusColor: 'emerald',
        progressPct: 45,
        currentAltitude: '37,000 FT (11,277 m)',
        groundSpeed: '554 MPH (892 km/h)',
        tailwind: '+28 MPH Tailwind',
        outsideTemp: '-58°F (-50°C)',
        timeElapsed: '3h 15m',
        timeRemaining: '4h 00m',
        distanceCoveredKm: Math.round(flightMetrics.distanceKm * 0.45),
        distanceRemainingKm: Math.round(flightMetrics.distanceKm * 0.55),
        phase: 'Cruising at Altitude',
        baggageClaim: 'Carousel 4',
      };
    }

    const st = activeFlight.status;
    let progress = 55;
    let phase = 'En Route • Cruising';
    let statusColor = 'emerald';
    let alt = '38,000 FT (11,582 m)';
    let speed = '558 MPH (898 km/h)';

    if (st === 'Boarding') {
      progress = 5;
      phase = 'Boarding at Gate • Pre-Flight Checks';
      statusColor = 'amber';
      alt = '0 FT (Ground)';
      speed = '0 MPH (Stationary)';
    } else if (st === 'Scheduled' || st === 'Unbooked') {
      progress = 0;
      phase = 'Gate Preparation • On Schedule';
      statusColor = 'sky';
      alt = '0 FT (Ground)';
      speed = '0 MPH (Parked)';
    } else if (st === 'Completed') {
      progress = 100;
      phase = 'Flight Arrived • At Gate';
      statusColor = 'indigo';
      alt = '0 FT (Taxied to Gate)';
      speed = '0 MPH (Deplaning)';
    } else if (st === 'Delayed') {
      progress = 25;
      phase = 'Holding Pattern • Air Traffic Advisory';
      statusColor = 'red';
      alt = '24,000 FT (7,315 m)';
      speed = '420 MPH (675 km/h)';
    } else {
      // On Time / In Flight
      progress = 62;
      phase = 'En Route • Smooth Cruising';
      statusColor = 'emerald';
      alt = '37,500 FT (11,430 m)';
      speed = '562 MPH (904 km/h)';
    }

    const totalKm = flightMetrics.distanceKm;
    const coveredKm = Math.round((totalKm * progress) / 100);
    const remainKm = Math.max(0, totalKm - coveredKm);

    const totalMinutes = flightMetrics.durationHours * 60 + flightMetrics.durationMinutes;
    const elapsedMinutes = Math.round((totalMinutes * progress) / 100);
    const remainMinutes = Math.max(0, totalMinutes - elapsedMinutes);

    const elapsedFormatted = `${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m`;
    const remainFormatted = `${Math.floor(remainMinutes / 60)}h ${remainMinutes % 60}m`;

    return {
      statusLabel: activeFlight.status,
      statusColor,
      progressPct: progress,
      currentAltitude: alt,
      groundSpeed: speed,
      tailwind: '+34 MPH Tailwind',
      outsideTemp: '-56°F (-49°C)',
      timeElapsed: elapsedFormatted,
      timeRemaining: remainFormatted,
      distanceCoveredKm: coveredKm,
      distanceRemainingKm: remainKm,
      phase,
      baggageClaim: `Carousel ${((activeFlight.flightNumber.charCodeAt(activeFlight.flightNumber.length - 1) % 6) + 1)}`,
    };
  }, [activeFlight, flightMetrics]);

  // Destination simulated weather
  const destinationWeather = useMemo(() => {
    if (!activeFlight) return { tempF: 72, tempC: 22, condition: 'Clear Sky', icon: '☀️', visibility: '10+ mi', wind: '8 mph NW' };
    const code = activeFlight.destination.code;
    const weatherMap: Record<string, { tempF: number; tempC: number; condition: string; icon: string; visibility: string; wind: string }> = {
      LHR: { tempF: 66, tempC: 19, condition: 'Partly Cloudy', icon: '⛅', visibility: '10 mi', wind: '11 mph SW' },
      HND: { tempF: 78, tempC: 26, condition: 'Clear Sky', icon: '☀️', visibility: '12 mi', wind: '6 mph E' },
      CDG: { tempF: 71, tempC: 22, condition: 'Sunny & Pleasant', icon: '☀️', visibility: '10+ mi', wind: '9 mph N' },
      EZE: { tempF: 62, tempC: 17, condition: 'Mild Breeze', icon: '🌤️', visibility: '10 mi', wind: '14 mph S' },
      JFK: { tempF: 75, tempC: 24, condition: 'Fair Sky', icon: '☀️', visibility: '10 mi', wind: '7 mph E' },
      LOS: { tempF: 84, tempC: 29, condition: 'Warm & Humid', icon: '🌤️', visibility: '8 mi', wind: '10 mph SW' },
      SYD: { tempF: 68, tempC: 20, condition: 'Ocean Breeze', icon: '🌊', visibility: '15 mi', wind: '12 mph NE' },
      FCO: { tempF: 82, tempC: 28, condition: 'Sunny Mediterranean', icon: '☀️', visibility: '12 mi', wind: '5 mph W' },
      MAD: { tempF: 86, tempC: 30, condition: 'Clear & Warm', icon: '☀️', visibility: '15 mi', wind: '7 mph NE' },
    };
    return weatherMap[code] || { tempF: 74, tempC: 23, condition: 'Fair Weather', icon: '☀️', visibility: '10+ mi', wind: '8 mph W' };
  }, [activeFlight]);

  const handleCopyShareLink = () => {
    if (!activeFlight) return;
    const text = `American Airlines Flight ${activeFlight.flightNumber} (${activeFlight.origin.code} ➔ ${activeFlight.destination.code}) | Status: ${activeFlight.status} | Gate: ${activeFlight.gate} | Duration: ${activeFlight.duration}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    });
  };

  const handleManualRefresh = () => {
    setIsLiveRefreshing(true);
    setTimeout(() => {
      setIsLiveRefreshing(false);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-[#001E42] via-[#002D62] to-[#00152E] border border-slate-700/80 rounded-3xl p-4 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-900/90 text-sky-300 border border-slate-600/80 text-[11px] sm:text-xs font-bold shadow-md">
              <AmericanAirlinesLogo size="sm" variant="dark-bg" />
              <span className="text-slate-400">|</span>
              <span className="flex items-center gap-1.5 text-sky-400 font-extrabold tracking-wide uppercase">
                <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" /> Live Radar & Flight Tracker
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Track Flight Status & Live Trajectory</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-base leading-relaxed max-w-2xl">
              Real-time flight radar, scheduled vs. actual departures, terminal gates, baggage claim carousels, and in-flight telemetry for all American Airlines routes.
            </p>
          </div>

          {/* Quick Stats Widget */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-900/80 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-700/80">
            <div className="text-left pr-3 border-r border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Schedules</span>
              <span className="text-lg sm:text-xl font-mono font-black text-sky-400">{flights.length} Flights</span>
            </div>
            <div className="text-left pr-3 border-r border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Issued Tickets</span>
              <span className="text-lg sm:text-xl font-mono font-black text-emerald-400">{bookings.length} Booked</span>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Radar Status</span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" /> Live Synced
              </span>
            </div>
          </div>
        </div>

        {/* Quick Sample Tracking Buttons */}
        <div className="pt-4 border-t border-slate-800/80 mt-4 space-y-3">
          {bookings.length > 0 && (
            <div>
              <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5 mb-2">
                <Ticket className="w-3.5 h-3.5 text-emerald-400" /> Your Booked Reservations ({bookings.length}):
              </span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {bookings.map((b) => {
                  const isSelected = activeFlight?.flightNumber === b.flightNumber;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setSelectedFlightId(b.flightId);
                        setSearchQuery(b.flightNumber);
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-2 min-h-[36px] shadow-sm cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-500/40 font-black'
                          : 'bg-emerald-950/70 text-emerald-200 border-emerald-800/80 hover:bg-emerald-900/90 hover:text-white'
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                      <span className="font-mono font-black">{b.flightNumber}</span>
                      <span className="opacity-90 text-[11px]">({b.origin.code} ➔ {b.destination.code})</span>
                      <span className="text-[10px] bg-slate-900/90 px-1.5 py-0.5 rounded font-mono text-amber-300 border border-emerald-700/50">
                        {b.seatNumber}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> One-Click Route Samples:
            </span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {allTrackableFlights.slice(0, 6).map((fl) => {
                const isSelected = activeFlight?.id === fl.id;
                return (
                  <button
                    key={fl.id}
                    type="button"
                    onClick={() => {
                      setSelectedFlightId(fl.id);
                      setSearchQuery(fl.flightNumber);
                    }}
                    className={`text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 min-h-[36px] shadow-sm cursor-pointer ${
                      isSelected
                        ? 'bg-[#C41230] text-white border-red-400 ring-2 ring-red-500/40 font-black'
                        : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <Plane className="w-3.5 h-3.5 text-sky-400" />
                    <span className="font-mono">{fl.flightNumber}</span>
                    <span className="opacity-80 text-[11px]">({fl.origin.code} ➔ {fl.destination.code})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Flight Search & Selector Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-center">
          {/* Universal Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Flight # (e.g. AA-104), Ticket # (001-...), PNR, Passenger Name, or Airport..."
              className="w-full pl-11 sm:pl-12 pr-10 py-3 sm:py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0078D2] focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/40 outline-none transition text-slate-900 dark:text-slate-100 font-bold placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-base shadow-inner min-h-[44px] bg-slate-50/50 dark:bg-slate-800/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs bg-slate-200 dark:bg-slate-700 p-1 rounded-full cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Flight Picker Dropdown */}
          <div className="w-full md:w-80">
            <select
              value={selectedFlightId}
              onChange={(e) => {
                setSelectedFlightId(e.target.value);
                const found = allTrackableFlights.find((f) => f.id === e.target.value);
                if (found) setSearchQuery(found.flightNumber);
              }}
              className="w-full py-3 sm:py-3.5 px-3 sm:px-4 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0078D2] focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/40 outline-none text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm bg-white dark:bg-slate-800 min-h-[44px]"
            >
              {searchResults.length === 0 ? (
                <option disabled value="">No matching flights found</option>
              ) : (
                searchResults.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.flightNumber}: {f.origin.code} ➔ {f.destination.code} ({f.origin.city} to {f.destination.city})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Search Results Summary / Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>
            {searchResults.length > 0 ? (
              <>
                Tracking Flight <strong className="text-slate-900 dark:text-slate-100 font-mono">{activeFlight?.flightNumber}</strong> ({activeFlight?.origin.city} to {activeFlight?.destination.city})
                {flightBookings.length > 0 && (
                  <span className="ml-2 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    ✓ {flightBookings.length} Active Booking(s) on this flight
                  </span>
                )}
              </>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                No active flight matched "{searchQuery}"
              </span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              className="flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline font-bold cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLiveRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Radar</span>
            </button>
            <span>•</span>
            <button
              onClick={handleCopyShareLink}
              className="flex items-center gap-1 text-[#C41230] dark:text-red-400 hover:underline font-bold cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copySuccess ? 'Copied Link!' : 'Share Status'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* No Record Found State */}
      {searchResults.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-12 border border-dashed border-slate-300 dark:border-slate-800 shadow-md text-center space-y-4">
          <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/80 rounded-2xl flex items-center justify-center mx-auto text-amber-500">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
              No Flight Radar Record Found for "{searchQuery}"
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              We couldn't locate an active flight route matching your search. Check for typos or track one of your booked reservations below.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="bg-[#0078D2] hover:bg-[#0060A9] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
            >
              Show All Flights ({allTrackableFlights.length})
            </button>
            {bookings.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFlightId(bookings[0].flightId);
                  setSearchQuery(bookings[0].flightNumber);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-white" />
                <span>Track Your Booked Flight ({bookings[0].flightNumber})</span>
              </button>
            )}
          </div>
        </div>
      ) : activeFlight && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
          {/* Main Flight Hero Radar Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            {/* Header: Flight Status, Number, Aircraft & Time */}
            <div className="bg-gradient-to-r from-[#001E42] via-[#002D62] to-[#00152E] p-4 sm:p-6 text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-sky-500/20 to-sky-600/30 border border-sky-400/40 flex flex-col items-center justify-center font-black text-sky-300 text-sm sm:text-base shrink-0 shadow-inner">
                  <span className="text-[10px] text-sky-400 font-bold">AA</span>
                  <span>{activeFlight.flightNumber.split('-')[1] || activeFlight.flightNumber}</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg sm:text-2xl font-black tracking-tight">{activeFlight.airline} {activeFlight.flightNumber}</h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 font-mono text-slate-300 font-bold">
                      {activeFlight.aircraft}
                    </span>
                  </div>
                  <p className="text-xs text-sky-300 flex items-center gap-1.5 mt-0.5">
                    <span>Terminal {activeFlight.terminal} • Gate {activeFlight.gate}</span>
                    <span className="text-slate-400">•</span>
                    <span>Aircraft Tail #N{activeFlight.flightNumber.replace(/\D/g, '') || '789'}AA</span>
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <div className={`px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-black flex items-center gap-2 shadow-sm ${
                  activeFlight.status === 'On Time'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : activeFlight.status === 'Delayed'
                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                    : activeFlight.status === 'Boarding'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : activeFlight.status === 'Completed'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                }`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-current animate-ping" />
                  <span>{telemetry.statusLabel} • {telemetry.phase}</span>
                </div>
              </div>
            </div>

            {/* Flight Route Visualizer (Origin ➔ In-Flight Radar ➔ Destination) */}
            <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* 1. Origin Airport Box */}
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-black text-sky-700 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1">
                      <Plane className="w-3.5 h-3.5 text-[#0078D2] transform -rotate-45" />
                      Take-off (Origin)
                    </span>
                    <span className="text-xs font-mono font-bold bg-sky-50 dark:bg-sky-950 text-[#0078D2] dark:text-sky-300 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                      Terminal {activeFlight.terminal} • Gate {activeFlight.gate}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">{activeFlight.origin.code}</span>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{activeFlight.origin.city}</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {activeFlight.origin.airport}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-xs flex justify-between items-center font-medium">
                    <span className="text-slate-500">Departure:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {new Date(activeFlight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* 2. Middle Animated Flight Trajectory Radar Bar */}
                <div className="space-y-3 text-center px-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>{telemetry.timeElapsed} elapsed</span>
                    <span className="text-[#0078D2] dark:text-sky-400 font-extrabold">{telemetry.progressPct}% Completed</span>
                    <span>{telemetry.timeRemaining} left</span>
                  </div>

                  {/* Progress Line with Animated Airplane */}
                  <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-visible flex items-center">
                    <div
                      className="h-full bg-gradient-to-r from-[#0078D2] via-sky-500 to-[#C41230] rounded-full transition-all duration-1000 relative"
                      style={{ width: `${telemetry.progressPct}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-7 h-7 bg-white dark:bg-slate-900 rounded-full border-2 border-[#C41230] shadow-lg flex items-center justify-center text-[#C41230] z-10">
                        <Plane className="w-4 h-4 transform rotate-90" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 pt-1">
                    <Compass className="w-3.5 h-3.5 text-sky-500" />
                    <span>
                      {flightMetrics?.distanceMiles.toLocaleString()} miles • {flightMetrics?.durationFormatted || activeFlight.duration}
                    </span>
                  </div>
                </div>

                {/* 3. Destination Airport Box */}
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-black text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
                      <Plane className="w-3.5 h-3.5 text-[#C41230] transform rotate-45" />
                      Landing (Destination)
                    </span>
                    <span className="text-xs font-mono font-bold bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 px-2 py-0.5 rounded border border-red-200 dark:border-red-800">
                      {telemetry.baggageClaim}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">{activeFlight.destination.code}</span>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{activeFlight.destination.city}</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {activeFlight.destination.airport}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-xs flex justify-between items-center font-medium">
                    <span className="text-slate-500">Estimated Arrival:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {new Date(activeFlight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Real-Time In-Flight Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
                <div className="bg-white dark:bg-slate-800/80 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-sky-500" /> Cruising Altitude
                  </span>
                  <div className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 font-mono">
                    {telemetry.currentAltitude}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-emerald-500" /> Ground Speed
                  </span>
                  <div className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 font-mono">
                    {telemetry.groundSpeed}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Destination Weather
                  </span>
                  <div className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 font-mono flex items-center gap-1.5">
                    <span>{destinationWeather.icon}</span>
                    <span>{destinationWeather.tempF}°F ({destinationWeather.tempC}°C)</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800/80 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Luggage className="w-3.5 h-3.5 text-purple-500" /> Baggage Claim
                  </span>
                  <div className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 font-mono">
                    {telemetry.baggageClaim}
                  </div>
                </div>
              </div>

              {/* In-Flight Amenities & Aircraft Specifications */}
              <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-500" /> Aircraft Configuration & In-Flight Experience
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <Wifi className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>High-Speed Satellite Wi-Fi</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>AC Outlet & Fast USB-C</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <Tv className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>4K Screen & Free Live TV</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <Utensils className="w-4 h-4 text-red-500 shrink-0" />
                    <span>Complimentary Dining</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for this Flight */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  {onViewSeatMap && (
                    <button
                      type="button"
                      onClick={() => onViewSeatMap(activeFlight)}
                      className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition flex items-center gap-2 min-h-[40px]"
                    >
                      <Armchair className="w-4 h-4 text-amber-300" />
                      <span>View Cabin Seat Map</span>
                    </button>
                  )}
                  {onGoToManifests && (
                    <button
                      type="button"
                      onClick={() => onGoToManifests(activeFlight.flightNumber)}
                      className="bg-[#0078D2] hover:bg-[#0060A9] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 min-h-[40px]"
                    >
                      <Ticket className="w-4 h-4 text-white" />
                      <span>View Manifest & Tickets ({flightBookings.length})</span>
                    </button>
                  )}
                  {onOpenCalculator && (
                    <button
                      type="button"
                      onClick={onOpenCalculator}
                      className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 transition flex items-center gap-2 min-h-[40px]"
                    >
                      <Clock className="w-4 h-4 text-sky-500" />
                      <span>Flight Calculator</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold">Base Fare:</span>
                  <span className="text-xl font-black text-[#001E42] dark:text-sky-400">${activeFlight.price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Associated Booked Tickets on this Flight */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#C41230]" />
                <span>Issued Tickets on Flight {activeFlight.flightNumber} ({flightBookings.length})</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">Click passenger ticket to launch boarding pass</span>
            </div>

            {flightBookings.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
                <Armchair className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">No Reserved Seats for this Flight Yet</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  All {activeFlight.availableSeats} of {activeFlight.totalSeats} seats on this aircraft are currently open for booking.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {flightBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 hover:border-sky-400 transition cursor-pointer"
                    onClick={() => onViewBoardingPass && onViewBoardingPass(b)}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                        {b.passenger.fullName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                        Ticket: {b.ticketNumber}
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                        {b.status} • PNR {b.confirmationCode}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-mono font-black text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-1 rounded-lg border border-amber-300 dark:border-amber-700 block">
                        Seat {b.seatNumber}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
