import React, { useState, useMemo, useEffect } from 'react';
import { Flight, Booking, Seat, PassengerInfo } from '../types';
import { SeatPicker } from './SeatPicker';
import confetti from 'canvas-confetti';
import { 
  Plane, 
  X, 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  Armchair, 
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
  Globe,
  Calendar,
  Crown,
  Tag,
  DollarSign,
  Send,
  FileText,
  RefreshCw,
  Copy,
  Check,
  Share2,
  MessageCircle,
  Twitter,
  Instagram,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { AmericanAirlinesLogo } from './AmericanAirlinesLogo';
import { WORLD_AIRPORTS, searchWorldAirports, createFlightForDestination } from '../data/worldAirports';
import { SmartAirportAutocomplete } from './SmartAirportAutocomplete';
import { calculateFlightDuration } from '../utils/flightCalculator';
import { AppUserProfile, SUPER_ADMIN_EMAIL, isSuperAdminEmail } from '../lib/firebase';
import { sendTicketEmail } from '../utils/emailService';
import { EmailTicketModal, ShareChannel } from './EmailTicketModal';
import {
  generateWhatsAppShareUrl,
  generateWhatsAppMessage,
  generateGmailShareUrl,
  generateTwitterShareUrl,
  generateInstagramCaption,
  generateTicketPlaintext,
  generateMailtoUrl,
  shareViaDevice
} from '../utils/ticketSharing';

interface BookingModalProps {
  flight: Flight | null;
  allFlights?: Flight[];
  onSelectFlight?: (flight: Flight) => void;
  bookings: Booking[];
  onClose: () => void;
  onBookingComplete: (newBooking: Booking) => void;
  onInspectPassenger: (booking: Booking) => void;
  currentUser?: AppUserProfile | null;
  onUpdateFlightPrice?: (flightId: string, newPrice: number) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  flight,
  allFlights = [],
  onSelectFlight,
  bookings,
  onClose,
  onBookingComplete,
  onInspectPassenger,
  currentUser,
  onUpdateFlightPrice,
}) => {
  if (!flight) return null;

  const [step, setStep] = useState<'seat' | 'passenger' | 'payment' | 'confirmation'>('seat');

  // Flight Date Selection Input State
  const [flightDateInput, setFlightDateInput] = useState<string>(() => {
    if (flight?.departureTime && flight.departureTime.includes('T')) {
      return flight.departureTime.split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    if (flight?.departureTime && flight.departureTime.includes('T')) {
      setFlightDateInput(flight.departureTime.split('T')[0]);
    }
  }, [flight?.id, flight?.departureTime]);

  const effectiveDepartureTime = useMemo(() => {
    if (!flight) return '';
    const timePart = flight.departureTime.includes('T')
      ? flight.departureTime.split('T')[1]
      : '18:30:00';
    return flightDateInput ? `${flightDateInput}T${timePart}` : flight.departureTime;
  }, [flight, flightDateInput]);

  const calculatedMetrics = useMemo(() => {
    if (!flight) return null;
    return calculateFlightDuration(
      flight.origin,
      flight.destination,
      effectiveDepartureTime
    );
  }, [flight, effectiveDepartureTime]);

  const effectiveArrivalTime = useMemo(() => {
    if (calculatedMetrics?.arrivalTimeISO) {
      return calculatedMetrics.arrivalTimeISO;
    }
    return flight?.arrivalTime || '';
  }, [calculatedMetrics, flight?.arrivalTime]);

  const effectiveDuration = useMemo(() => {
    if (calculatedMetrics?.durationFormatted) {
      return calculatedMetrics.durationFormatted;
    }
    return flight?.duration || '';
  }, [calculatedMetrics, flight?.duration]);

  // Modal Destination Search & Filter State
  const [destinationSearchInput, setDestinationSearchInput] = useState('');
  const [isChangingDestination, setIsChangingDestination] = useState(false);

  // Form State & Multi-Passenger Party Setup
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [isFamilyBooking, setIsFamilyBooking] = useState<boolean>(false);
  const [groupName, setGroupName] = useState<string>('');
  const [activePassengerIdx, setActivePassengerIdx] = useState<number>(0);

  const [passengerSeats, setPassengerSeats] = useState<(Seat | null)[]>([null]);
  const [passengersList, setPassengersList] = useState<PassengerInfo[]>([
    {
      fullName: '',
      email: currentUser?.email || '',
      phone: '+1 (555) 019-2834',
      passportNumber: '',
      nationality: 'United States',
      gender: 'Male',
      dateOfBirth: '1994-06-15',
      mealPreference: 'Flagship First Gourmet',
      baggageCount: 1,
      specialAssistance: '',
      seatNumber: '',
      passengerType: 'Adult',
    },
  ]);

  // Lead Passenger Convenience Shortcuts (sync with passengersList[0])
  const leadPassenger = passengersList[0] || {};
  const fullName = leadPassenger.fullName || '';
  const email = leadPassenger.email || '';
  const phone = leadPassenger.phone || '';
  const passportNumber = leadPassenger.passportNumber || '';
  const nationality = leadPassenger.nationality || 'United States';
  const gender = leadPassenger.gender || 'Male';
  const dateOfBirth = leadPassenger.dateOfBirth || '1994-06-15';
  const mealPreference = leadPassenger.mealPreference || 'Flagship First Gourmet';
  const baggageCount = leadPassenger.baggageCount ?? 1;
  const specialAssistance = leadPassenger.specialAssistance || '';

  const [paymentMethod, setPaymentMethod] = useState('American Airlines AAdvantage Executive World Elite Mastercard');
  const [issuedBooking, setIssuedBooking] = useState<Booking | null>(null);

  // Auto e-Ticket Email & Multi-Channel Sharing States
  const [autoSendEmail, setAutoSendEmail] = useState<boolean>(true);
  const [customDeliveryEmail, setCustomDeliveryEmail] = useState<string>('');
  const [isResendingEmail, setIsResendingEmail] = useState<boolean>(false);
  const [resendSuccessMsg, setResendSuccessMsg] = useState<string | null>(null);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareModalChannel, setShareModalChannel] = useState<ShareChannel>('whatsapp');
  const [emailCopied, setEmailCopied] = useState<boolean>(false);
  const [copiedShareKey, setCopiedShareKey] = useState<string | null>(null);
  const [etherealPreviewUrl, setEtherealPreviewUrl] = useState<string | null>(null);

  const openShareModalWith = (channel: ShareChannel) => {
    setShareModalChannel(channel);
    setShowShareModal(true);
  };

  const handleQuickCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedShareKey(key);
    setTimeout(() => setCopiedShareKey(null), 2500);
  };

  // Super Admin Manual Price Input State (When flight is booked)
  const isSuperAdmin = currentUser?.role === 'superadmin' || isSuperAdminEmail(currentUser?.email);
  const [customPriceInput, setCustomPriceInput] = useState<string>('');
  const [priceUpdatedMsg, setPriceUpdatedMsg] = useState<string | null>(null);

  // Handle party size update (1 to 9 passengers)
  const handleSetPassengerCount = (count: number) => {
    const validCount = Math.max(1, Math.min(9, count));
    setPassengerCount(validCount);
    if (validCount > 1) {
      setIsFamilyBooking(true);
    }

    setPassengerSeats((prevSeats) => {
      const updated = [...prevSeats];
      while (updated.length < validCount) updated.push(null);
      return updated.slice(0, validCount);
    });

    setPassengersList((prevList) => {
      const updated = [...prevList];
      const lead = updated[0] || {};
      while (updated.length < validCount) {
        const idx = updated.length + 1;
        updated.push({
          fullName: '',
          email: lead.email || currentUser?.email || '',
          phone: lead.phone || '+1 (555) 019-2834',
          passportNumber: '',
          nationality: lead.nationality || 'United States',
          gender: 'Male',
          dateOfBirth: '2000-01-01',
          mealPreference: 'Standard Executive',
          baggageCount: 1,
          specialAssistance: '',
          seatNumber: '',
          passengerType: idx === 1 ? 'Adult' : 'Adult',
        });
      }
      return updated.slice(0, validCount);
    });

    if (activePassengerIdx >= validCount) {
      setActivePassengerIdx(validCount - 1);
    }
  };

  const handleUpdatePassengerField = (idx: number, field: keyof PassengerInfo, value: any) => {
    setPassengersList((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleCopyLeadInfoToPassenger = (targetIdx: number) => {
    if (targetIdx <= 0 || !passengersList[0]) return;
    const lead = passengersList[0];
    const leadLastName = lead.fullName.trim().split(' ').pop() || '';

    setPassengersList((prev) => {
      const copy = [...prev];
      const currentObj = copy[targetIdx];
      copy[targetIdx] = {
        ...currentObj,
        fullName: currentObj.fullName ? currentObj.fullName : (leadLastName ? `Passenger ${targetIdx + 1} ${leadLastName}` : ''),
        email: lead.email,
        phone: lead.phone,
        nationality: lead.nationality,
      };
      return copy;
    });
  };

  const calculateTotalFare = () => {
    let total = 0;
    for (let i = 0; i < passengerCount; i++) {
      const base = flight.price;
      const seatObj = passengerSeats[i];
      const modifier = seatObj ? seatObj.priceModifier : 0;
      const passObj = passengersList[i];
      const bagCount = passObj ? passObj.baggageCount : 1;
      const baggageFee = bagCount > 1 ? (bagCount - 1) * 35 : 0;
      total += base + modifier + baggageFee;
    }
    return total;
  };

  const getFinalPricePaid = () => {
    if (isSuperAdmin && customPriceInput !== '' && !isNaN(parseFloat(customPriceInput)) && parseFloat(customPriceInput) >= 0) {
      return parseFloat(customPriceInput);
    }
    return calculateTotalFare();
  };

  const handleSaveBasePriceToDb = async () => {
    const currentVal = customPriceInput !== '' ? parseFloat(customPriceInput) : calculateTotalFare();
    if (!isNaN(currentVal) && currentVal >= 0 && onUpdateFlightPrice && flight) {
      onUpdateFlightPrice(flight.id, currentVal);
      setPriceUpdatedMsg(`Saved $${currentVal} as permanent base price for Flight ${flight.flightNumber} in database!`);
      setTimeout(() => setPriceUpdatedMsg(null), 4000);
    }
  };

  const handleResendEmail = async (overrideEmail?: string | React.MouseEvent | unknown) => {
    if (!issuedBooking) return;
    const targetOverride = typeof overrideEmail === 'string' ? overrideEmail.trim() : '';
    const recipient = targetOverride || customDeliveryEmail.trim() || issuedBooking.autoEmailSentTo || issuedBooking.passenger.email;
    setIsResendingEmail(true);

    const result = await sendTicketEmail(issuedBooking, recipient);
    setIsResendingEmail(false);

    if (result.success) {
      if (result.previewUrl) {
        setEtherealPreviewUrl(result.previewUrl);
      }
      setResendSuccessMsg(`Official e-Ticket successfully dispatched to ${recipient}!`);
    } else {
      setResendSuccessMsg(`Email dispatch note: ${result.error || 'Server processed email payload.'}`);
    }
    setTimeout(() => setResendSuccessMsg(null), 6000);
  };

  const getMailtoUrl = (bkg: Booking, recipientEmail?: string | React.MouseEvent | unknown) => {
    const targetOverride = typeof recipientEmail === 'string' ? recipientEmail.trim() : '';
    const target = targetOverride || customDeliveryEmail.trim() || bkg.autoEmailSentTo || bkg.passenger.email;
    const subject = encodeURIComponent(`Your American Airlines e-Ticket Receipt & Boarding Pass [Flight ${bkg.flightNumber} - PNR ${bkg.confirmationCode}]`);
    
    const manifest = (bkg.passengers || [bkg.passenger]).map((p, i) =>
      `${i + 1}. ${p.fullName} | Seat: ${p.seatNumber || bkg.seatNumber} | Passport: ${p.passportNumber}`
    ).join('\n');

    const body = encodeURIComponent(
`AMERICAN AIRLINES ELECTRONIC TICKET RECEIPT

Dear ${bkg.passenger.fullName},

Thank you for choosing American Airlines. Your flight reservation is confirmed and ticketed!

BOOKING & TICKET DETAILS:
------------------------------------------
Confirmation Code (PNR): ${bkg.confirmationCode}
Ticket Number: ${bkg.ticketNumber}
Lead Passenger: ${bkg.passenger.fullName}
Email: ${bkg.passenger.email}
Party Size: ${bkg.passengerCount || 1} Passenger(s) ${bkg.isFamilyBooking ? `(Family: ${bkg.groupName || 'Group Ticket'})` : ''}

PASSENGER MANIFEST & SEATS:
------------------------------------------
${manifest}

FLIGHT INFORMATION:
------------------------------------------
Flight Number: ${bkg.flightNumber} (${bkg.airline})
Aircraft: ${bkg.aircraft}
Route: ${bkg.origin.city} (${bkg.origin.code}) -> ${bkg.destination.city} (${bkg.destination.code})
Departure: ${new Date(bkg.departureTime).toLocaleString()}
Arrival: ${new Date(bkg.arrivalTime).toLocaleString()}
Terminal / Gate: Terminal ${bkg.terminal}, Gate ${bkg.gate}

PAYMENT SUMMARY:
------------------------------------------
Total Fare Paid: $${bkg.pricePaid}
Payment Method: ${bkg.paymentMethod}
Status: CONFIRMED & TICKETED

To manage your booking or view your live boarding pass, search your ticket number (${bkg.ticketNumber}) in the American Airlines Portal.

Have a safe flight!
American Airlines Customer Service`
    );
    return `mailto:${target}?subject=${subject}&body=${body}`;
  };

  const handleCopyEmailText = (bkg: Booking) => {
    const manifest = (bkg.passengers || [bkg.passenger]).map((p) => `${p.fullName} (Seat ${p.seatNumber || bkg.seatNumber})`).join(', ');
    const text = `
American Airlines e-Ticket Receipt
Party: ${manifest}
Flight: ${bkg.flightNumber} (${bkg.origin.code} -> ${bkg.destination.code})
Ticket Number: ${bkg.ticketNumber} | PNR: ${bkg.confirmationCode}
Total Paid: $${bkg.pricePaid}
`;
    navigator.clipboard.writeText(text);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2500);
  };

  const handleSeatSelect = (seat: Seat) => {
    // Check if another passenger already has this seat
    const existingIndex = passengerSeats.findIndex((s) => s?.seatNumber === seat.seatNumber);
    if (existingIndex !== -1 && existingIndex !== activePassengerIdx) {
      alert(`Seat ${seat.seatNumber} is already selected by Passenger ${existingIndex + 1} (${passengersList[existingIndex]?.fullName || 'Party Member'}).`);
      return;
    }

    // Set seat for active passenger
    setPassengerSeats((prev) => {
      const copy = [...prev];
      copy[activePassengerIdx] = seat;
      return copy;
    });

    handleUpdatePassengerField(activePassengerIdx, 'seatNumber', seat.seatNumber);

    // Auto advance to next unassigned passenger if any
    const nextUnassigned = passengerSeats.findIndex((s, idx) => idx !== activePassengerIdx && !s);
    if (nextUnassigned !== -1) {
      setActivePassengerIdx(nextUnassigned);
    }
  };

  // Sync selectedSeat for legacy prop compatibility
  const selectedSeat = passengerSeats[activePassengerIdx] || passengerSeats[0] || null;

  const handleProceedToPassenger = () => {
    // Verify every passenger has a selected seat
    for (let i = 0; i < passengerCount; i++) {
      if (!passengerSeats[i]) {
        setActivePassengerIdx(i);
        alert(`Please select an aircraft seat for Passenger ${i + 1} (${passengersList[i]?.fullName || 'Party Member'}) before proceeding.`);
        return;
      }
    }
    setStep('passenger');
  };

  const handlePassengerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    for (let i = 0; i < passengerCount; i++) {
      const p = passengersList[i];
      if (!p.fullName.trim() || !p.passportNumber.trim()) {
        alert(`Please fill out required details (Full Name and Passport Number) for Passenger ${i + 1}.`);
        return;
      }
    }
    if (!passengersList[0].email.trim()) {
      alert('Please fill out a valid contact email for the lead passenger.');
      return;
    }
    setStep('payment');
  };

  const handleConfirmPayment = () => {
    // Generate Ticket & PNR (American Airlines stock code 001)
    const randomTicketSuffix = Math.floor(1000 + Math.random() * 9000);
    const randomPNRSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `001-${randomTicketSuffix}-${randomPNRSuffix}`;
    const confirmationCode = `AA-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Finalize seats in passenger objects
    const finalPassengersList: PassengerInfo[] = passengersList.map((p, idx) => ({
      ...p,
      seatNumber: passengerSeats[idx]?.seatNumber || p.seatNumber || '12A',
    }));

    const leadPass = finalPassengersList[0];
    const primarySeatNumber = passengerSeats[0]?.seatNumber || '12A';
    const primaryCabinClass = passengerSeats[0]?.cabinClass || 'Economy Flagship';

    const finalPrice = getFinalPricePaid();
    const targetEmail = customDeliveryEmail.trim() || leadPass.email.trim();

    const newBooking: Booking = {
      id: `bkg-${Date.now()}`,
      ticketNumber,
      confirmationCode,
      flightId: flight.id,
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      aircraft: flight.aircraft,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: effectiveDepartureTime,
      arrivalTime: effectiveArrivalTime,
      duration: effectiveDuration,
      distanceKm: calculatedMetrics?.distanceKm,
      distanceMiles: calculatedMetrics?.distanceMiles,
      terminal: flight.terminal,
      gate: flight.gate,
      seatNumber: primarySeatNumber,
      cabinClass: primaryCabinClass,
      passenger: leadPass,
      passengers: finalPassengersList,
      seats: passengerSeats.map((s) => s?.seatNumber || '').filter(Boolean),
      passengerCount,
      isFamilyBooking,
      groupName: groupName.trim() ? groupName.trim() : (isFamilyBooking ? `${leadPass.fullName.split(' ').pop()} Family` : ''),
      bookingDate: new Date().toISOString(),
      status: 'Confirmed',
      pricePaid: finalPrice,
      paymentMethod,
      autoEmailSent: autoSendEmail,
      autoEmailSentTo: targetEmail,
      autoEmailSentAt: new Date().toISOString(),
      isSuperAdminBooking: isSuperAdminEmail(currentUser?.email) || currentUser?.role === 'superadmin',
      bookedByRole: (isSuperAdminEmail(currentUser?.email) || currentUser?.role === 'superadmin') ? 'superadmin' : (currentUser?.role || 'user'),
      bookedByEmail: currentUser?.email || (isSuperAdminEmail(currentUser?.email) ? 'ebulupaulboyld@gmail.com' : ''),
      bookedByUid: currentUser?.uid || '',
      bookedByName: currentUser?.displayName || '',
    };

    // Auto-dispatch e-Ticket email if enabled
    if (autoSendEmail) {
      sendTicketEmail(newBooking, targetEmail).then((res) => {
        if (res.success) {
          if (res.previewUrl) {
            setEtherealPreviewUrl(res.previewUrl);
          }
          setResendSuccessMsg(`Official e-Ticket & Boarding Pass automatically sent to ${targetEmail}!`);
        } else {
          setResendSuccessMsg(`Auto-dispatch note: ${res.error || 'Server logged email dispatch.'}`);
        }
        setTimeout(() => setResendSuccessMsg(null), 6000);
      }).catch((e) => {
        console.error('Auto email dispatch error:', e);
      });
    }

    // Trigger celebratory confetti!
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });

    setIssuedBooking(newBooking);
    onBookingComplete(newBooking);
    setStep('confirmation');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-2 sm:my-6 max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#001E42] via-[#002D62] to-[#00152E] px-4 sm:px-6 py-3 sm:py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <AmericanAirlinesLogo size="sm" variant="dark-bg" />
            <div className="h-5 sm:h-6 w-px bg-slate-700 shrink-0" />
            <div className="min-w-0">
              <h3 className="font-black text-sm sm:text-lg truncate">
                Flight {flight.flightNumber} ({flight.origin.code} ➔ {flight.destination.code})
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-300 truncate">{flight.airline} • {flight.aircraft}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition shrink-0 ml-2 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-slate-100 dark:bg-slate-800/90 px-3 sm:px-6 py-2.5 sm:py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-around text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
          <div className={`flex items-center gap-1 sm:gap-1.5 ${step === 'seat' ? 'text-[#0078D2] dark:text-sky-400' : step !== 'seat' ? 'text-emerald-700 dark:text-emerald-400' : ''}`}>
            <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] ${step === 'seat' ? 'bg-[#0078D2] text-white' : step !== 'seat' ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>1</span>
            <span className="truncate">Seats</span>
          </div>
          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
          <div className={`flex items-center gap-1 sm:gap-1.5 ${step === 'passenger' ? 'text-[#0078D2] dark:text-sky-400' : ['payment', 'confirmation'].includes(step) ? 'text-emerald-700 dark:text-emerald-400' : ''}`}>
            <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] ${step === 'passenger' ? 'bg-[#0078D2] text-white' : ['payment', 'confirmation'].includes(step) ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>2</span>
            <span className="truncate">Passenger</span>
          </div>
          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
          <div className={`flex items-center gap-1 sm:gap-1.5 ${step === 'payment' ? 'text-[#0078D2] dark:text-sky-400' : step === 'confirmation' ? 'text-emerald-700 dark:text-emerald-400' : ''}`}>
            <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] ${step === 'payment' ? 'bg-[#0078D2] text-white' : step === 'confirmation' ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>3</span>
            <span className="truncate">Payment</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-6">
          {/* Flight Itinerary & Airport Details Banner with Destination Input Option */}
          {step !== 'confirmation' && (
            <div className="bg-[#001E42] text-white p-4 sm:p-5 rounded-2xl border border-slate-700 shadow-md space-y-4">
              {/* Destination Input & Selector Option */}
              <div className="bg-[#00142E] p-3.5 rounded-xl border border-slate-700/90 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/70 pb-2">
                  <label className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-400" /> Choose / Input Destination Option
                  </label>
                  <span className="text-[10px] text-slate-300 bg-sky-950 px-2 py-0.5 rounded font-mono font-bold border border-sky-800">
                    Active Flight: {flight.flightNumber}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Takeoff Departure Hub Smart Autocomplete */}
                  <SmartAirportAutocomplete
                    type="takeoff"
                    label="Takeoff Departure Hub"
                    placeholder="Type takeoff hub (e.g. JFK, LAX, DFW, Lagos, London, Tokyo)..."
                    value={`${flight.origin.city} (${flight.origin.code}) - ${flight.origin.airport}`}
                    selectedCode={flight.origin.code}
                    onSelectAirport={(ap) => {
                      if (onSelectFlight) {
                        const updatedFlight: Flight = {
                          ...flight,
                          origin: {
                            code: ap.code,
                            city: ap.city,
                            airport: ap.airport,
                            country: ap.country,
                            state: ap.state,
                          },
                        };
                        onSelectFlight(updatedFlight);
                      }
                    }}
                  />

                  {/* Landing Destination Smart Autocomplete */}
                  <SmartAirportAutocomplete
                    type="landing"
                    label="Landing Destination"
                    placeholder="Type destination (e.g. Nigeria, London, Tokyo, Paris, California, Sydney)..."
                    value={destinationSearchInput || `${flight.destination.city} (${flight.destination.code}) - ${flight.destination.airport}`}
                    selectedCode={flight.destination.code}
                    onSelectAirport={(ap) => {
                      setDestinationSearchInput(`${ap.city} (${ap.code}) - ${ap.airport}`);
                      if (onSelectFlight) {
                        const existingFlight = allFlights.find((f) => f.destination.code === ap.code);
                        if (existingFlight) {
                          onSelectFlight({
                            ...existingFlight,
                            origin: flight.origin,
                          });
                        } else {
                          onSelectFlight(createFlightForDestination(ap, flight.origin));
                        }
                        setPassengerSeats([null]);
                      }
                    }}
                    onClear={() => {
                      setDestinationSearchInput('');
                    }}
                  />
                  {/* World Airports Dropdown Select Destination */}
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" />
                    <select
                      value={flight.destination.code}
                      onChange={(e) => {
                        const targetCode = e.target.value;
                        const existingFlight = allFlights.find((f) => f.destination.code === targetCode);
                        if (existingFlight && onSelectFlight) {
                          onSelectFlight(existingFlight);
                          setPassengerSeats([null]);
                        } else {
                          const worldAp = WORLD_AIRPORTS.find((a) => a.code === targetCode);
                          if (worldAp && onSelectFlight) {
                            onSelectFlight(createFlightForDestination(worldAp));
                            setPassengerSeats([null]);
                          }
                        }
                      }}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-600 bg-slate-900 text-xs font-bold text-white focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none"
                    >
                      <option disabled value="">Select Global Airport Destination</option>
                      {WORLD_AIRPORTS.map((ap) => (
                        <option key={ap.code} value={ap.code}>
                          {ap.flag || '✈️'} {ap.country}: {ap.city} ({ap.code}) - {ap.airport}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Destination Quick Option Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Quick Select Destination:</span>
                  {allFlights.map((f) => {
                    const isCurrent = f.id === flight.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          if (onSelectFlight) {
                            onSelectFlight(f);
                            setPassengerSeats([null]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition flex items-center gap-1 border ${
                          isCurrent
                            ? 'bg-[#C41230] text-white border-red-500 shadow'
                            : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700'
                        }`}
                      >
                        <Plane className="w-3 h-3 text-white transform rotate-45" />
                        <span>{f.destination.city} ({f.destination.code})</span>
                      </button>
                    );
                  })}
                </div>
                {/* Flight Departure Date Input & Customize Option */}
                <div className="bg-[#00142E] p-3.5 rounded-xl border border-slate-700/90 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/70 pb-2">
                    <label className="text-xs font-black uppercase text-sky-300 tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-sky-400" /> Input Date of Flight (Departure Date)
                    </label>
                    <span className="text-[11px] font-mono font-extrabold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-700/60 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {new Date(effectiveDepartureTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sky-400 pointer-events-none" />
                      <input
                        type="date"
                        value={flightDateInput}
                        onChange={(e) => setFlightDateInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-600 bg-slate-900 text-xs font-bold text-white focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none"
                      />
                    </div>

                    {/* Quick Date Shortcut Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setFlightDateInput(new Date().toISOString().split('T')[0])}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 1);
                          setFlightDateInput(d.toISOString().split('T')[0]);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                      >
                        Tomorrow
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 3);
                          setFlightDateInput(d.toISOString().split('T')[0]);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                      >
                        +3 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + 7);
                          setFlightDateInput(d.toISOString().split('T')[0]);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                      >
                        +7 Days
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Itinerary Banner Specifications */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/80 pb-2.5">
                <span className="text-xs font-black uppercase text-sky-400 flex items-center gap-1.5">
                  <Plane className="w-4 h-4 text-sky-400" /> Confirmed Flight Itinerary & Airport Specifications
                </span>
                <span className="text-xs font-mono font-black text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-700/60 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  Calculated Duration: {effectiveDuration} ({calculatedMetrics?.distanceKm.toLocaleString()} km / {calculatedMetrics?.distanceMiles.toLocaleString()} mi)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Take-off Airport & Departure */}
                <div className="bg-[#00142E] p-3 rounded-xl border border-slate-700/80 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-sky-400 flex items-center gap-1">
                    <Plane className="w-3 h-3 transform -rotate-45" /> Starting From (Take-Off Airport)
                  </div>
                  <div className="text-base font-black text-white">{flight.origin.city} ({flight.origin.code})</div>
                  <div className="text-xs text-sky-200 font-extrabold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{flight.origin.airport}</span>
                  </div>
                  <div className="text-xs text-slate-300 pt-1 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Flight Time: <strong>{new Date(effectiveDepartureTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(effectiveDepartureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                  </div>
                </div>

                {/* Landing Airport & Arrival */}
                <div className="bg-[#00142E] p-3 rounded-xl border border-slate-700/80 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-red-400 flex items-center gap-1">
                    <Plane className="w-3 h-3 transform rotate-45" /> Heading To (Landing Airport)
                  </div>
                  <div className="text-base font-black text-white">{flight.destination.city} ({flight.destination.code})</div>
                  <div className="text-xs text-red-200 font-extrabold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{flight.destination.airport}</span>
                  </div>
                  <div className="text-xs text-slate-300 pt-1 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>Arrival Time: <strong>{new Date(effectiveArrivalTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(effectiveArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Super Admin Price & Base Price Control Panel */}
          {isSuperAdmin && step !== 'confirmation' && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 dark:from-amber-950/60 dark:to-amber-900/50 border-2 border-amber-400 dark:border-amber-600 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-lg relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 dark:border-amber-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-sm">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-amber-900 dark:text-amber-200 tracking-wider flex items-center gap-1.5">
                      Super Admin Manual Price & Fare Control
                    </h4>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                      Manually set ticket booking price or update the flight's permanent base fare in Firestore.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-red-600 text-white font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    Super Admin Privilege
                  </span>
                </div>
              </div>

              {priceUpdatedMsg && (
                <div className="bg-emerald-600 text-white text-xs font-extrabold p-2.5 rounded-xl flex items-center gap-2 animate-in fade-in shadow-md">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{priceUpdatedMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Manual Ticket Booking Price Input */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-amber-900 dark:text-amber-200 block">
                    Set Custom Booking Fare ($)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-600 dark:text-amber-400 pointer-events-none" />
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={customPriceInput}
                        onChange={(e) => setCustomPriceInput(e.target.value)}
                        placeholder={`Standard: $${calculateTotalFare()}`}
                        className="pl-8 pr-3 py-2 rounded-xl border border-amber-400 dark:border-amber-600 font-black text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-amber-500 outline-none w-full shadow-xs"
                      />
                    </div>
                    {customPriceInput !== '' && (
                      <button
                        type="button"
                        onClick={() => setCustomPriceInput('')}
                        className="text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:underline px-2.5 py-2 bg-amber-100 dark:bg-amber-900/60 rounded-xl border border-amber-300 dark:border-amber-700 shrink-0"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* DB Permanent Base Price Update Button */}
                <div className="space-y-2 flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={handleSaveBasePriceToDb}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-98 border border-amber-500"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Save ${getFinalPricePaid()} as Permanent Base Fare for Flight {flight.flightNumber}</span>
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-extrabold uppercase text-amber-900 dark:text-amber-200 mr-1">
                  Quick Price Presets:
                </span>
                {[
                  { label: '$0 Free (VIP)', val: '0' },
                  { label: '$50', val: '50' },
                  { label: '$100', val: '100' },
                  { label: '$250', val: '250' },
                  { label: '$500', val: '500' },
                  { label: '$1,000', val: '1000' },
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setCustomPriceInput(p.val)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition border ${
                      customPriceInput === p.val
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-slate-700 border-amber-300 dark:border-amber-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1: SEAT SELECTION & PARTY SETUP */}
          {step === 'seat' && (
            <div className="space-y-6">
              {/* Party Size & Booking Mode Selector Bar */}
              <div className="bg-gradient-to-r from-slate-900 via-[#001E42] to-slate-900 text-white p-5 rounded-2xl border border-slate-700 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
                      👨‍👩‍👧‍👦
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-amber-300 tracking-wider">
                        Party Size & Multi-Passenger Booking Mode
                      </h4>
                      <p className="text-[11px] text-slate-300 font-medium">
                        Book single or multiple family members/passengers on a single ticket & confirmation code (PNR).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-300 font-extrabold flex items-center gap-1.5 cursor-pointer bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                      <input
                        type="checkbox"
                        checked={isFamilyBooking}
                        onChange={(e) => setIsFamilyBooking(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400"
                      />
                      <span>Family / Group Ticket</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Passenger Count Selection Buttons */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-200 block">
                      Number of Passengers on Ticket: <span className="text-amber-400 font-mono font-black">{passengerCount} Person(s)</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { label: '1 Passenger', count: 1 },
                        { label: '2 (Couple)', count: 2 },
                        { label: '3 (Family)', count: 3 },
                        { label: '4 (Family)', count: 4 },
                        { label: '5 (Group)', count: 5 },
                        { label: '6+ Group', count: 6 },
                      ].map((item) => (
                        <button
                          key={item.count}
                          type="button"
                          onClick={() => handleSetPassengerCount(item.count)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition border ${
                            passengerCount === item.count
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                              : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}

                      <div className="flex items-center gap-1 ml-auto bg-slate-800 p-1 rounded-xl border border-slate-700">
                        <button
                          type="button"
                          onClick={() => handleSetPassengerCount(passengerCount - 1)}
                          disabled={passengerCount <= 1}
                          className="w-7 h-7 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white rounded-lg font-black text-sm flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-black font-mono text-amber-300">{passengerCount}</span>
                        <button
                          type="button"
                          onClick={() => handleSetPassengerCount(passengerCount + 1)}
                          disabled={passengerCount >= 9}
                          className="w-7 h-7 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white rounded-lg font-black text-sm flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Group / Family Name Optional Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-200 block">
                      Group / Family Name (Optional Tag)
                    </label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="e.g. The Smith Family or Corporate Group"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs font-bold text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                {/* Passenger Seat Tabs Selector */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-sky-300 uppercase tracking-wider text-[11px]">
                      Seat Assignment Roster (Click passenger to choose seat on map below):
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {passengerSeats.filter(Boolean).length} of {passengerCount} seats selected
                    </span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {Array.from({ length: passengerCount }).map((_, idx) => {
                      const seatObj = passengerSeats[idx];
                      const passObj = passengersList[idx];
                      const isActive = idx === activePassengerIdx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActivePassengerIdx(idx)}
                          className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap border ${
                            isActive
                              ? 'bg-[#0078D2] text-white border-sky-400 shadow-md ring-2 ring-sky-400/40'
                              : seatObj
                              ? 'bg-emerald-950/80 text-emerald-200 border-emerald-700/80'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          <span>{idx + 1}. {passObj?.fullName ? passObj.fullName.split(' ')[0] : idx === 0 ? 'Lead Passenger' : `Passenger ${idx + 1}`}</span>
                          <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${seatObj ? 'bg-amber-400 text-slate-950 font-extrabold' : 'bg-slate-900 text-slate-400'}`}>
                            {seatObj ? seatObj.seatNumber : 'Assign Seat'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Aircraft Seat Picker */}
              <SeatPicker
                flight={flight}
                bookings={bookings}
                selectedSeatNumber={selectedSeat?.seatNumber || null}
                selectedSeatNumbers={passengerSeats.map((s) => s?.seatNumber || '').filter(Boolean)}
                onSelectSeat={handleSeatSelect}
                onInspectPassenger={onInspectPassenger}
              />

              {/* Step 1 Footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Assigned Seats ({passengerSeats.filter(Boolean).length}/{passengerCount}):{' '}
                    <strong className="font-mono text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                      {passengerSeats.map((s) => s?.seatNumber || '___').join(', ')}
                    </strong>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Active Assignee: <strong className="text-slate-900 dark:text-slate-100">Passenger {activePassengerIdx + 1} ({passengersList[activePassengerIdx]?.fullName || 'Party Member'})</strong>
                  </div>
                </div>

                <button
                  onClick={handleProceedToPassenger}
                  className="bg-[#0078D2] hover:bg-[#0060A9] disabled:opacity-50 text-white text-sm font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 shadow-md shadow-sky-600/20"
                >
                  Continue to Passenger Profiles <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PASSENGER DETAILS FORM */}
          {step === 'passenger' && (
            <form onSubmit={handlePassengerSubmit} className="space-y-6">
              {/* Header Summary Bar */}
              <div className="bg-sky-50 dark:bg-sky-950/80 p-4 rounded-2xl border border-sky-200 dark:border-sky-800 flex flex-wrap items-center justify-between gap-3 text-xs text-sky-950 dark:text-sky-200">
                <div className="flex items-center gap-2 font-bold">
                  <Armchair className="w-4 h-4 text-[#0078D2] dark:text-sky-400" />
                  <span>
                    Seats Reserved ({passengerCount}):{' '}
                    <strong className="font-mono text-red-600 dark:text-red-400">
                      {passengerSeats.map((s) => s?.seatNumber || 'Unassigned').join(', ')}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#0078D2] dark:text-sky-400" /> Date of Flight:
                  </label>
                  <input
                    type="date"
                    value={flightDateInput}
                    onChange={(e) => setFlightDateInput(e.target.value)}
                    className="py-1 px-2.5 rounded-lg border border-sky-300 dark:border-sky-700 text-xs font-bold bg-white text-slate-900 outline-none focus:ring-1 focus:ring-[#0078D2]"
                  />
                </div>
                <div className="font-black text-[#0078D2] dark:text-sky-300 text-sm">
                  Total Ticket Price: ${getFinalPricePaid()} ({passengerCount} Passengers)
                </div>
              </div>

              {/* Automatic e-Ticket Email Delivery Options */}
              <div className="bg-sky-50 dark:bg-sky-950/50 p-4 rounded-2xl border border-sky-200 dark:border-sky-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSendEmail}
                      onChange={(e) => setAutoSendEmail(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-[#0078D2] focus:ring-sky-500"
                    />
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">
                        Automatically send official e-Tickets & Boarding Passes upon booking
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 block leading-tight">
                        Dispatches official ticket receipt, flight itinerary, passenger manifest, and confirmation code directly to email.
                      </span>
                    </div>
                  </label>
                </div>

                {autoSendEmail && (
                  <div className="pt-2 border-t border-sky-200 dark:border-sky-800 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                        Primary Ticket Delivery Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={passengersList[0]?.email || ''}
                        onChange={(e) => handleUpdatePassengerField(0, 'email', e.target.value)}
                        placeholder="primary.passenger@example.com"
                        className="w-full px-3 py-2 rounded-xl border border-sky-300 dark:border-sky-700 text-xs font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-sky-500/30"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                        Alternative / Secondary Delivery Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={customDeliveryEmail}
                        onChange={(e) => setCustomDeliveryEmail(e.target.value)}
                        placeholder="family.member@example.com"
                        className="w-full px-3 py-2 rounded-xl border border-sky-300 dark:border-sky-700 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-sky-500/30"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Roster of Passenger Profiles (1 to N) */}
              <div className="space-y-6">
                {passengersList.map((pass, idx) => {
                  const isLead = idx === 0;
                  const seatObj = passengerSeats[idx];
                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-3xl border ${
                        isLead
                          ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-md'
                          : 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                      } space-y-4 relative`}
                    >
                      {/* Passenger Header Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                            isLead ? 'bg-[#001E42] text-amber-400' : 'bg-slate-800 text-slate-200'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                              {isLead ? 'Lead Passenger Details (Primary Contact)' : `Passenger ${idx + 1} Profile`}
                            </h4>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              Assigned Seat: <strong className="text-sky-600 dark:text-sky-400">{seatObj?.seatNumber || pass.seatNumber || '12A'}</strong> ({seatObj?.cabinClass || 'Economy'})
                            </span>
                          </div>
                        </div>

                        {!isLead && (
                          <button
                            type="button"
                            onClick={() => handleCopyLeadInfoToPassenger(idx)}
                            className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-sky-100 dark:bg-sky-950 text-[#0078D2] dark:text-sky-300 border border-sky-300 dark:border-sky-800 hover:bg-sky-200 transition"
                          >
                            ⚡ Copy Surname & Contact from Lead
                          </button>
                        )}
                      </div>

                      {/* Input Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                            Full Legal Name *
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              required
                              value={pass.fullName}
                              onChange={(e) => handleUpdatePassengerField(idx, 'fullName', e.target.value)}
                              placeholder={isLead ? "e.g. Dr. Alexander Vance" : `e.g. Passenger ${idx + 1} Vance`}
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 dark:text-slate-100 dark:bg-slate-950 placeholder:text-slate-400 focus:border-[#0078D2] outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                            Customer / Passenger Email Address {isLead ? '*' : '(Optional)'}
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="email"
                              required={isLead}
                              value={pass.email || ''}
                              onChange={(e) => handleUpdatePassengerField(idx, 'email', e.target.value)}
                              placeholder="customer.email@example.com"
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-sky-300 dark:border-sky-700 text-sm font-bold text-slate-900 dark:text-slate-100 dark:bg-slate-950 placeholder:text-slate-400 focus:border-[#0078D2] focus:ring-2 focus:ring-sky-100 outline-none"
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                            {isLead ? '✈️ Official e-Ticket & Boarding Pass will be automatically sent to this address upon booking.' : 'Optional direct email for this passenger.'}
                          </span>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                            Passport Number *
                          </label>
                          <div className="relative">
                            <ShieldCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              required
                              value={pass.passportNumber}
                              onChange={(e) => handleUpdatePassengerField(idx, 'passportNumber', e.target.value)}
                              placeholder="e.g. US98012341"
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-900 dark:text-slate-100 dark:bg-slate-950 placeholder:text-slate-400 focus:border-[#0078D2] outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                            Passenger Type & Category
                          </label>
                          <select
                            value={pass.passengerType || 'Adult'}
                            onChange={(e) => handleUpdatePassengerField(idx, 'passengerType', e.target.value)}
                            className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-sm bg-white dark:bg-slate-950 font-bold text-slate-900 dark:text-slate-100 outline-none"
                          >
                            <option value="Adult">Adult (12+ yrs)</option>
                            <option value="Child">Child (2 - 11 yrs)</option>
                            <option value="Infant">Infant (Under 2 yrs)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                            Gender / Date of Birth
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={pass.gender}
                              onChange={(e) => handleUpdatePassengerField(idx, 'gender', e.target.value)}
                              className="w-full py-2.5 px-2 rounded-xl border border-slate-300 text-sm bg-white dark:bg-slate-950 font-bold text-slate-900 dark:text-slate-100"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                            <input
                              type="date"
                              value={pass.dateOfBirth}
                              onChange={(e) => handleUpdatePassengerField(idx, 'dateOfBirth', e.target.value)}
                              className="w-full py-2.5 px-2 rounded-xl border border-slate-300 text-sm bg-white dark:bg-slate-950 font-bold text-slate-900 dark:text-slate-100"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                            Nationality
                          </label>
                          <select
                            value={pass.nationality}
                            onChange={(e) => handleUpdatePassengerField(idx, 'nationality', e.target.value)}
                            className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-sm bg-white dark:bg-slate-950 font-bold text-slate-900 dark:text-slate-100 outline-none"
                          >
                            <option value="United States">United States</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Canada">Canada</option>
                            <option value="France">France</option>
                            <option value="Germany">Germany</option>
                            <option value="Nigeria">Nigeria</option>
                            <option value="Japan">Japan</option>
                            <option value="Singapore">Singapore</option>
                            <option value="Australia">Australia</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                            Meal Preference
                          </label>
                          <select
                            value={pass.mealPreference}
                            onChange={(e) => handleUpdatePassengerField(idx, 'mealPreference', e.target.value)}
                            className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-sm bg-white dark:bg-slate-950 font-bold text-slate-900 dark:text-slate-100 outline-none"
                          >
                            <option value="Flagship First Gourmet">Flagship First Gourmet Meal</option>
                            <option value="Halal Certified Course">Halal Certified Option</option>
                            <option value="Kosher Meal Option">Kosher Meal Option</option>
                            <option value="Vegetarian Vegan Specialty">Vegetarian / Vegan</option>
                            <option value="Gluten-Free European">Gluten-Free Option</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add / Remove Passenger Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSetPassengerCount(passengerCount + 1)}
                  disabled={passengerCount >= 9}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-slate-100 text-xs font-black transition border border-slate-300 dark:border-slate-700 flex items-center gap-1.5"
                >
                  <span>+ Add Another Passenger to Ticket</span>
                </button>
                {passengerCount > 1 && (
                  <button
                    type="button"
                    onClick={() => handleSetPassengerCount(passengerCount - 1)}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-black transition border border-rose-200 dark:border-rose-800"
                  >
                    - Remove Passenger
                  </button>
                )}
              </div>

              {/* Step 2 Form Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep('seat')}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-4 py-2"
                >
                  ← Back to Seat Map
                </button>

                <button
                  type="submit"
                  className="bg-[#0078D2] hover:bg-[#0060A9] text-white text-sm font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 shadow-md shadow-sky-600/20"
                >
                  Proceed to Payment (${getFinalPricePaid()}) <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: PAYMENT & CONFIRMATION */}
          {step === 'payment' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#001E42] to-[#002D62] text-white p-6 rounded-2xl space-y-4 shadow-md">
                <h4 className="text-xs font-black uppercase tracking-wider text-sky-300 flex items-center gap-2">
                  <AmericanAirlinesLogo size="sm" variant="dark-bg" /> American Airlines Booking Summary
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="col-span-2">
                    <span className="text-slate-300 block">Passenger Roster ({passengerCount})</span>
                    <span className="font-black text-sm text-white">
                      {passengersList.map((p) => p.fullName || 'Passenger').join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-300 block">Flight</span>
                    <span className="font-black text-sm text-white">{flight.flightNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-300 block">Assigned Seats</span>
                    <span className="font-black text-sm text-amber-400 font-mono">
                      {passengerSeats.map((s) => s?.seatNumber || 'Unassigned').join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-300 block">Total Ticket Price</span>
                    <span className="font-black text-base text-emerald-400">${getFinalPricePaid()}</span>
                  </div>
                </div>
              </div>

              {/* Super Admin Manual Price Override Panel */}
              {isSuperAdmin && (
                <div className="bg-gradient-to-r from-amber-50 to-amber-100/60 dark:from-amber-950/50 dark:to-amber-900/40 border border-amber-300 dark:border-amber-700/80 rounded-2xl p-4 sm:p-5 space-y-3 shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-500" /> Super Admin Manual Price Input (When Flight is Booked)
                    </span>
                    <span className="text-[10px] bg-red-600 text-white font-black px-2.5 py-0.5 rounded-full uppercase">
                      Super Admin Privilege
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    As Super Admin, you can manually type a custom ticket price below before completing this booking:
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 font-black text-base text-slate-900 dark:text-slate-100">$</span>
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={customPriceInput}
                        onChange={(e) => setCustomPriceInput(e.target.value)}
                        placeholder={calculateTotalFare().toString()}
                        className="pl-8 pr-3 py-2.5 w-44 rounded-xl border border-amber-400 dark:border-amber-600 font-black text-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-amber-500 outline-none shadow-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setCustomPriceInput(calculateTotalFare().toString())}
                      className="text-xs text-amber-800 dark:text-amber-300 hover:underline font-bold bg-amber-200/60 dark:bg-amber-900/60 px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700"
                    >
                      Reset to standard fare (${calculateTotalFare()})
                    </button>
                    {customPriceInput !== '' && (
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ✓ Manual price active: ${getFinalPricePaid()}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* AUTOMATED E-TICKET EMAIL DISPATCH TARGET LOG */}
              <div className="bg-gradient-to-r from-sky-900 via-[#001E42] to-sky-950 text-white p-5 rounded-2xl border border-sky-700 shadow-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center justify-center font-black">
                      📧
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-sky-300 tracking-wider">
                        Automated e-Ticket Email Delivery Log
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        Confirm or update the customer email address for automatic ticket dispatch upon payment.
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Auto-Dispatch Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-black text-sky-200 block mb-1">
                      Customer / Passenger Target Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" />
                      <input
                        type="email"
                        required
                        value={passengersList[0]?.email || ''}
                        onChange={(e) => handleUpdatePassengerField(0, 'email', e.target.value)}
                        placeholder="customer.email@example.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-sky-500 bg-slate-900 text-xs font-bold text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-sky-200 block mb-1">
                      Alternative Delivery Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={customDeliveryEmail}
                      onChange={(e) => setCustomDeliveryEmail(e.target.value)}
                      placeholder="secondary.email@example.com"
                      className="w-full px-3 py-2 rounded-xl border border-sky-700 bg-slate-900 text-xs font-bold text-slate-200 placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-sky-200/90 pt-1 border-t border-sky-800/80">
                  <span>
                    Direct Dispatch Target:{' '}
                    <strong className="font-mono text-amber-300 font-extrabold">
                      {customDeliveryEmail.trim() || passengersList[0]?.email || 'No email specified'}
                    </strong>
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={autoSendEmail}
                      onChange={(e) => setAutoSendEmail(e.target.checked)}
                      className="rounded text-sky-500 focus:ring-sky-400"
                    />
                    <span>Auto-send upon completing booking</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 block">Select Payment Method</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('AA AAdvantage Executive World Elite Mastercard')}
                    className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition ${
                      paymentMethod.includes('Mastercard') ? 'border-[#0078D2] bg-sky-50/70 ring-2 ring-sky-200' : 'border-slate-200'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-[#0078D2]" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">AAdvantage® Card</div>
                      <div className="text-[10px] text-slate-500">World Elite *4912</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Apple Pay Instant')}
                    className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition ${
                      paymentMethod.includes('Apple') ? 'border-[#0078D2] bg-sky-50/70 ring-2 ring-sky-200' : 'border-slate-200'
                    }`}
                  >
                    <Sparkles className="w-5 h-5 text-[#C41230]" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Apple Pay</div>
                      <div className="text-[10px] text-slate-500">Instant Authorization</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Corporate Travel Voucher (*8801)')}
                    className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition ${
                      paymentMethod.includes('Voucher') ? 'border-[#0078D2] bg-sky-50/70 ring-2 ring-sky-200' : 'border-slate-200'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Corporate Voucher</div>
                      <div className="text-[10px] text-slate-500">Account #8801</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep('passenger')}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  ← Edit Passenger Profile
                </button>

                <button
                  onClick={handleConfirmPayment}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-black px-8 py-3 rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-5 h-5" /> Issue Ticket & Book Seat
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION SUCCESS */}
          {step === 'confirmation' && issuedBooking && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">Flight Ticket Issued!</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                  Your seat reservation on American Airlines has been recorded in the live passenger manifest.
                </p>
              </div>

              {/* AUTOMATED E-TICKET EMAIL DISPATCH NOTIFICATION CARD */}
              <div className="bg-gradient-to-r from-emerald-950 via-[#002D62] to-[#00152E] text-white p-5 rounded-3xl border-2 border-emerald-500/60 shadow-2xl max-w-lg mx-auto text-left space-y-3.5 relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                      <Mail className="w-5 h-5 text-slate-950" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-emerald-300 tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        Automated e-Ticket Dispatched
                      </h4>
                      <p className="text-[11px] text-slate-300 font-medium">
                        Official e-Ticket & boarding pass sent to passenger email.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Auto-Delivered
                  </span>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs font-sans">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold">Passenger Email:</span>
                    <span className="font-mono font-black text-sky-300 text-sm">{issuedBooking.passenger.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold">Delivery Status:</span>
                    <span className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                      Delivered to Inbox (200 OK)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold">Dispatch Timestamp:</span>
                    <span className="font-mono text-slate-300 text-[11px]">
                      {issuedBooking.autoEmailSentAt ? new Date(issuedBooking.autoEmailSentAt).toLocaleString() : new Date().toLocaleString()}
                    </span>
                  </div>
                </div>

                {resendSuccessMsg && (
                  <div className="bg-emerald-600 text-white text-xs font-bold p-2.5 rounded-xl flex items-center gap-2 animate-in fade-in shadow-md">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{resendSuccessMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowEmailPreviewModal(true)}
                    className="py-2.5 px-3 bg-sky-600 hover:bg-sky-500 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm active:scale-98"
                  >
                    <FileText className="w-3.5 h-3.5" /> Email Preview
                  </button>

                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={isResendingEmail}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition border border-slate-700 active:scale-98"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResendingEmail ? 'animate-spin text-amber-400' : ''}`} />
                    {isResendingEmail ? 'Sending...' : 'Resend Email'}
                  </button>

                  <button
                    type="button"
                    onClick={() => openShareModalWith('email')}
                    className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm active:scale-98"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share Options
                  </button>
                </div>

                {etherealPreviewUrl && (
                  <div className="pt-2 border-t border-slate-800 flex flex-col items-center gap-1">
                    <a
                      href={etherealPreviewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Open Live Ethereal Mail Web Inbox Preview ↗</span>
                    </a>
                    <span className="text-[10px] text-slate-400">
                      (Test mode active: Click above to view the exact HTML email generated by the backend)
                    </span>
                  </div>
                )}
              </div>

              {/* MULTI-CHANNEL INSTANT TICKET SHARING HUB */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-lg mx-auto text-left space-y-3.5 shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between border-b pb-2.5 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-[#0078D2]" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                      Send & Share Ticket Instantly
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    6 Channels Available
                  </span>
                </div>

                {/* Instant Share Buttons Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* WhatsApp */}
                  <a
                    href={generateWhatsAppShareUrl(issuedBooking, issuedBooking.passenger.phone)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 flex items-center gap-2 text-emerald-800 dark:text-emerald-200 transition group"
                  >
                    <div className="w-7 h-7 rounded-xl bg-[#25D366] text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition">WhatsApp</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Chat / DM</div>
                    </div>
                  </a>

                  {/* Gmail */}
                  <a
                    href={generateGmailShareUrl(issuedBooking, issuedBooking.passenger.email)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-2xl bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-300 dark:border-red-800 flex items-center gap-2 text-red-800 dark:text-red-200 transition group"
                  >
                    <div className="w-7 h-7 rounded-xl bg-[#EA4335] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-red-600 transition">Gmail</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Web Compose</div>
                    </div>
                  </a>

                  {/* Direct Email (SMTP) */}
                  <button
                    type="button"
                    onClick={() => openShareModalWith('email')}
                    className="p-2.5 rounded-2xl bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-300 dark:border-sky-800 flex items-center gap-2 text-sky-800 dark:text-sky-200 transition group text-left"
                  >
                    <div className="w-7 h-7 rounded-xl bg-[#0078D2] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Send className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-sky-600 transition">Direct Email</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">HTML Dispatch</div>
                    </div>
                  </button>

                  {/* Twitter / X */}
                  <a
                    href={generateTwitterShareUrl(issuedBooking)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 flex items-center gap-2 text-slate-800 dark:text-slate-200 transition group"
                  >
                    <div className="w-7 h-7 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Twitter className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-sky-500 transition">Twitter (X)</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Tweet Status</div>
                    </div>
                  </a>

                  {/* Instagram */}
                  <button
                    type="button"
                    onClick={() => {
                      handleQuickCopyText(generateInstagramCaption(issuedBooking), 'instagram');
                      window.open('https://www.instagram.com', '_blank', 'noopener,noreferrer');
                    }}
                    className="p-2.5 rounded-2xl bg-pink-50 dark:bg-pink-950/60 hover:bg-pink-100 dark:hover:bg-pink-900/60 border border-pink-300 dark:border-pink-800 flex items-center gap-2 text-pink-800 dark:text-pink-200 transition group text-left"
                  >
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Instagram className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-pink-600 transition">Instagram</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Story Caption</div>
                    </div>
                  </button>

                  {/* Device / Native Share */}
                  <button
                    type="button"
                    onClick={async () => {
                      await shareViaDevice(issuedBooking);
                      handleQuickCopyText(generateTicketPlaintext(issuedBooking), 'device');
                    }}
                    className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-300 dark:border-indigo-800 flex items-center gap-2 text-indigo-800 dark:text-indigo-200 transition group text-left"
                  >
                    <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition">Device Share</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">System Sheet</div>
                    </div>
                  </button>
                </div>

                {/* Quick copy confirmation status */}
                {copiedShareKey && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold p-2.5 rounded-xl flex items-center justify-between animate-in fade-in">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      {copiedShareKey === 'instagram' ? 'Instagram caption copied! Opening Instagram...' : 'Ticket details copied to clipboard!'}
                    </span>
                    <span className="text-[10px] uppercase font-mono bg-emerald-200 dark:bg-emerald-900 px-1.5 py-0.5 rounded">Ready</span>
                  </div>
                )}
              </div>

              {/* Ticket Details Summary Card */}
              <div className="bg-gradient-to-br from-[#001E42] via-[#002D62] to-[#00152E] text-white rounded-3xl p-6 max-w-lg mx-auto text-left space-y-4 shadow-2xl border border-slate-700">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <AmericanAirlinesLogo size="sm" variant="dark-bg" />
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">Passenger Name</span>
                      <span className="text-lg font-black text-white">{issuedBooking.passenger.fullName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Assigned Seat</span>
                    <span className="text-2xl font-black font-mono text-amber-400">{issuedBooking.seatNumber}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-bold">Ticket Number</span>
                    <span className="font-mono font-bold text-sky-300 text-sm">{issuedBooking.ticketNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">Confirmation Code (PNR)</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">{issuedBooking.confirmationCode}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 bg-[#00152E] p-3.5 rounded-xl border border-slate-700">
                  ⚡ <strong>Seat Lookup Ready:</strong> Search seat <strong className="text-amber-300">{issuedBooking.seatNumber}</strong> or ticket <strong className="text-sky-300">{issuedBooking.ticketNumber}</strong> in the passenger lookup to view full profile details.
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                  }}
                  className="bg-[#0078D2] hover:bg-[#0060A9] text-white text-sm font-bold px-8 py-3 rounded-xl transition shadow-md shadow-sky-600/20"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AUTOMATED E-TICKET EMAIL PREVIEW MODAL */}
      {showEmailPreviewModal && issuedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#0078D2]" />
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                  Automated e-Ticket Email Preview
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Inbox Header Simulation */}
            <div className="bg-slate-100 dark:bg-slate-800/80 p-4 rounded-2xl text-xs space-y-2 border border-slate-200 dark:border-slate-700 font-sans">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span className="font-bold">Subject:</span>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-right">
                  American Airlines e-Ticket Receipt: {issuedBooking.flightNumber} ({issuedBooking.confirmationCode})
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span className="font-bold">From:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  American Airlines Automated Ticketing &lt;no-reply@aa.com&gt;
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span className="font-bold">To:</span>
                <span className="font-bold text-sky-600 dark:text-sky-400">
                  {issuedBooking.passenger.fullName} &lt;{issuedBooking.passenger.email}&gt;
                </span>
              </div>
            </div>

            {/* Styled Email Content Body */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs">
              <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                <AmericanAirlinesLogo size="sm" variant="light-bg" />
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Status</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase">Confirmed & Ticketed</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Dear {issuedBooking.passenger.fullName},
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Thank you for choosing American Airlines. Below is your official electronic ticket receipt and flight itinerary.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">Booking Reference (PNR)</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">{issuedBooking.confirmationCode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">Ticket Number</span>
                  <span className="font-mono font-black text-[#0078D2] dark:text-sky-400 text-sm">{issuedBooking.ticketNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">Flight Number</span>
                  <span className="font-black text-slate-900 dark:text-slate-100">{issuedBooking.flightNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">Assigned Seat</span>
                  <span className="font-black text-amber-600 dark:text-amber-400">{issuedBooking.seatNumber} ({issuedBooking.cabinClass})</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">Route</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{issuedBooking.origin.code} ➔ {issuedBooking.destination.code}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">Total Fare Paid</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">${issuedBooking.pricePaid}</span>
                </div>
              </div>

              <div className="text-center pt-2 space-y-1">
                <div className="font-mono text-xs tracking-widest text-slate-400 font-bold">|||||| |||||||| ||| ||||||| ||||||</div>
                <div className="text-[10px] text-slate-400">American Airlines Automated PNR Security Hash • Stock 001</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleCopyEmailText(issuedBooking)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition"
              >
                {emailCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {emailCopied ? 'Copied Email Body!' : 'Copy Email Text'}
              </button>

              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(false)}
                className="px-6 py-2 bg-[#0078D2] text-white rounded-xl text-xs font-bold hover:bg-[#0060A9] transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL MULTI-CHANNEL SHARE TICKET MODAL */}
      <EmailTicketModal
        booking={issuedBooking}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        defaultChannel={shareModalChannel}
      />
    </div>
  );
};
