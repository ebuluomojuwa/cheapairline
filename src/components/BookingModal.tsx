import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';
import { AmericanAirlinesLogo } from './AmericanAirlinesLogo';

interface BookingModalProps {
  flight: Flight | null;
  bookings: Booking[];
  onClose: () => void;
  onBookingComplete: (newBooking: Booking) => void;
  onInspectPassenger: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  flight,
  bookings,
  onClose,
  onBookingComplete,
  onInspectPassenger,
}) => {
  if (!flight) return null;

  const [step, setStep] = useState<'seat' | 'passenger' | 'payment' | 'confirmation'>('seat');
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [nationality, setNationality] = useState('United States');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dateOfBirth, setDateOfBirth] = useState('1994-06-15');
  const [mealPreference, setMealPreference] = useState('Flagship First Gourmet');
  const [baggageCount, setBaggageCount] = useState(1);
  const [specialAssistance, setSpecialAssistance] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('American Airlines AAdvantage Executive World Elite Mastercard');

  const [issuedBooking, setIssuedBooking] = useState<Booking | null>(null);

  const calculateTotalFare = () => {
    const base = flight.price;
    const modifier = selectedSeat ? selectedSeat.priceModifier : 0;
    const baggageFee = baggageCount > 1 ? (baggageCount - 1) * 35 : 0;
    return base + modifier + baggageFee;
  };

  const handleSeatSelect = (seat: Seat) => {
    setSelectedSeat(seat);
  };

  const handleProceedToPassenger = () => {
    if (!selectedSeat) {
      alert('Please select a seat from the aircraft seat map before proceeding.');
      return;
    }
    setStep('passenger');
  };

  const handlePassengerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !passportNumber) {
      alert('Please fill out all required passenger details (Full Name, Email, Passport Number).');
      return;
    }
    setStep('payment');
  };

  const handleConfirmPayment = () => {
    if (!selectedSeat) return;

    // Generate Ticket & PNR (American Airlines stock code 001)
    const randomTicketSuffix = Math.floor(1000 + Math.random() * 9000);
    const randomPNRSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `001-${randomTicketSuffix}-${randomPNRSuffix}`;
    const confirmationCode = `AA-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const newPassenger: PassengerInfo = {
      fullName,
      email,
      phone: phone || '+1 (555) 019-2834',
      passportNumber,
      nationality,
      gender,
      dateOfBirth,
      mealPreference,
      baggageCount,
      specialAssistance: specialAssistance || undefined,
    };

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
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      terminal: flight.terminal,
      gate: flight.gate,
      seatNumber: selectedSeat.seatNumber,
      cabinClass: selectedSeat.cabinClass,
      passenger: newPassenger,
      bookingDate: new Date().toISOString(),
      status: 'Confirmed',
      pricePaid: calculateTotalFare(),
      paymentMethod,
    };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#001E42] via-[#002D62] to-[#00152E] px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <AmericanAirlinesLogo size="sm" variant="dark-bg" />
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <h3 className="font-black text-base sm:text-lg">
                Book Flight {flight.flightNumber} ({flight.origin.code} ➔ {flight.destination.code})
              </h3>
              <p className="text-xs text-slate-300">{flight.airline} • {flight.aircraft}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-around text-xs font-bold text-slate-500">
          <div className={`flex items-center gap-1.5 ${step === 'seat' ? 'text-[#0078D2]' : step !== 'seat' ? 'text-emerald-700' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'seat' ? 'bg-[#0078D2] text-white' : step !== 'seat' ? 'bg-emerald-600 text-white' : 'bg-slate-300'}`}>1</span>
            Seat Selection
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          <div className={`flex items-center gap-1.5 ${step === 'passenger' ? 'text-[#0078D2]' : ['payment', 'confirmation'].includes(step) ? 'text-emerald-700' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'passenger' ? 'bg-[#0078D2] text-white' : ['payment', 'confirmation'].includes(step) ? 'bg-emerald-600 text-white' : 'bg-slate-300'}`}>2</span>
            Passenger Profile
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          <div className={`flex items-center gap-1.5 ${step === 'payment' ? 'text-[#0078D2]' : step === 'confirmation' ? 'text-emerald-700' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'payment' ? 'bg-[#0078D2] text-white' : step === 'confirmation' ? 'bg-emerald-600 text-white' : 'bg-slate-300'}`}>3</span>
            Payment & Issue Ticket
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Flight Itinerary & Airport Details Banner */}
          {step !== 'confirmation' && (
            <div className="bg-[#001E42] text-white p-4 sm:p-5 rounded-2xl border border-slate-700 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
                <span className="text-xs font-black uppercase text-sky-400 flex items-center gap-1.5">
                  <Plane className="w-4 h-4 text-sky-400" /> Confirmed Flight Itinerary & Airport Specifications
                </span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20">
                  {flight.flightNumber} ({flight.duration})
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
                    <span>Flight Time: <strong>{new Date(flight.departureTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
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
                    <span>Arrival Time: <strong>{new Date(flight.arrivalTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: SEAT SELECTION */}
          {step === 'seat' && (
            <div className="space-y-6">
              <SeatPicker
                flight={flight}
                bookings={bookings}
                selectedSeatNumber={selectedSeat?.seatNumber || null}
                onSelectSeat={handleSeatSelect}
                onInspectPassenger={onInspectPassenger}
              />

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  {selectedSeat ? (
                    <div className="text-sm">
                      Selected Seat: <strong className="font-mono text-red-600 text-base">{selectedSeat.seatNumber}</strong> ({selectedSeat.cabinClass})
                    </div>
                  ) : (
                    <div className="text-xs text-rose-500 font-bold">Please click a green seat in the seat map above</div>
                  )}
                </div>

                <button
                  disabled={!selectedSeat}
                  onClick={handleProceedToPassenger}
                  className="bg-[#0078D2] hover:bg-[#0060A9] disabled:opacity-50 text-white text-sm font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 shadow-md shadow-sky-600/20"
                >
                  Continue to Passenger Profile <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PASSENGER DETAILS FORM */}
          {step === 'passenger' && (
            <form onSubmit={handlePassengerSubmit} className="space-y-6">
              <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200 flex items-center justify-between text-xs text-sky-950">
                <div className="flex items-center gap-2 font-bold">
                  <Armchair className="w-4 h-4 text-[#0078D2]" />
                  <span>Reserved Seat: <strong className="font-mono text-red-600">{selectedSeat?.seatNumber}</strong> ({selectedSeat?.cabinClass})</span>
                </div>
                <div className="font-black text-[#0078D2] text-sm">Flight Fare: ${calculateTotalFare()}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Legal Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Alexander Vance"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#0078D2] focus:ring-2 focus:ring-sky-100 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex.vance@example.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#0078D2] focus:ring-2 focus:ring-sky-100 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#0078D2] focus:ring-2 focus:ring-sky-100 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Passport Number *</label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                      placeholder="e.g. US98012341"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#0078D2] focus:ring-2 focus:ring-sky-100 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nationality</label>
                  <select
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-sm focus:border-[#0078D2] focus:ring-2 focus:ring-sky-100 outline-none bg-white font-medium text-slate-800"
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
                  <label className="text-xs font-bold text-slate-700 block mb-1">Gender / DOB</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full py-2.5 px-2 rounded-xl border border-slate-300 text-sm bg-white font-medium"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full py-2.5 px-2 rounded-xl border border-slate-300 text-sm bg-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Flagship Onboard Meal Preference</label>
                  <select
                    value={mealPreference}
                    onChange={(e) => setMealPreference(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-sm bg-white font-medium text-slate-800"
                  >
                    <option value="Flagship First Gourmet">Flagship First Gourmet Meal</option>
                    <option value="Halal Certified Course">Halal Certified Option</option>
                    <option value="Kosher Meal Option">Kosher Meal Option</option>
                    <option value="Vegetarian Vegan Specialty">Vegetarian / Vegan</option>
                    <option value="Gluten-Free European">Gluten-Free Option</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Checked Baggage Allowance</label>
                  <select
                    value={baggageCount}
                    onChange={(e) => setBaggageCount(Number(e.target.value))}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-sm bg-white font-medium text-slate-800"
                  >
                    <option value={1}>1 Carry-on + 1 Checked Bag (Included)</option>
                    <option value={2}>2 Checked Bags (+$35)</option>
                    <option value={3}>3 Checked Bags (+$70)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Special Assistance or Requests</label>
                <input
                  type="text"
                  value={specialAssistance}
                  onChange={(e) => setSpecialAssistance(e.target.value)}
                  placeholder="e.g. Priority Wheelchair, Infant Seat, Extra Pillow"
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-sm focus:border-[#0078D2] outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep('seat')}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2"
                >
                  ← Back to Seat Selection
                </button>

                <button
                  type="submit"
                  className="bg-[#0078D2] hover:bg-[#0060A9] text-white text-sm font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 shadow-md shadow-sky-600/20"
                >
                  Proceed to Payment (${calculateTotalFare()}) <ArrowRight className="w-4 h-4" />
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
                  <div>
                    <span className="text-slate-300 block">Passenger</span>
                    <span className="font-black text-sm text-white">{fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-300 block">Flight</span>
                    <span className="font-black text-sm text-white">{flight.flightNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-300 block">Assigned Seat</span>
                    <span className="font-black text-sm text-amber-400 font-mono">{selectedSeat?.seatNumber} ({selectedSeat?.cabinClass})</span>
                  </div>
                  <div>
                    <span className="text-slate-300 block">Total Due</span>
                    <span className="font-black text-base text-emerald-400">${calculateTotalFare()}</span>
                  </div>
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
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Flight Ticket Issued!</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Your seat reservation on American Airlines has been recorded in the live passenger manifest.
                </p>
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
    </div>
  );
};
