export type CabinClass = 'Economy' | 'Premium Economy' | 'Business' | 'First';

export interface PassengerInfo {
  fullName: string;
  email: string;
  phone: string;
  passportNumber: string;
  nationality: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  mealPreference: string;
  baggageCount: number;
  specialAssistance?: string;
}

export interface Seat {
  seatNumber: string; // e.g., "12A"
  row: number;
  letter: string; // 'A', 'B', 'C', 'D', 'E', 'F'
  cabinClass: CabinClass;
  isBooked: boolean;
  isWindow: boolean;
  isAisle: boolean;
  isExitRow: boolean;
  priceModifier: number; // e.g. +$50 for extra legroom or business
}

export interface Flight {
  id: string;
  flightNumber: string; // e.g. "AA-104"
  airline: string;
  airlineCode: string;
  aircraft: string; // e.g., "Boeing 787-9 Dreamliner"
  origin: {
    code: string;
    city: string;
    airport: string;
  };
  destination: {
    code: string;
    city: string;
    airport: string;
  };
  departureTime: string; // ISO or formatted
  arrivalTime: string;
  duration: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  terminal: string;
  gate: string;
  status: 'On Time' | 'Scheduled' | 'Delayed' | 'Boarding';
}

export interface Booking {
  id: string;
  ticketNumber: string; // e.g. "TKT-8921-4091"
  confirmationCode: string; // e.g. "SKY-7821"
  flightId: string;
  flightNumber: string;
  airline: string;
  aircraft: string;
  origin: {
    code: string;
    city: string;
    airport: string;
  };
  destination: {
    code: string;
    city: string;
    airport: string;
  };
  departureTime: string;
  arrivalTime: string;
  terminal: string;
  gate: string;
  seatNumber: string;
  cabinClass: CabinClass;
  passenger: PassengerInfo;
  bookingDate: string;
  status: 'Confirmed' | 'Checked In' | 'Boarded' | 'Cancelled';
  pricePaid: number;
  paymentMethod: string;
  gatePassApproved?: boolean;
  gatePassApprovedAt?: string;
  verifiedByAgent?: string;
}
