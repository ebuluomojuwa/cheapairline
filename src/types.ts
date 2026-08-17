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
  seatNumber?: string;
  passengerType?: 'Adult' | 'Child' | 'Infant';
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

export interface AirportLocation {
  code: string;
  city: string;
  airport: string;
  country: string;
  state?: string;
  flag?: string;
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
    country?: string;
    state?: string;
  };
  destination: {
    code: string;
    city: string;
    airport: string;
    country?: string;
    state?: string;
  };
  departureTime: string; // ISO or formatted
  arrivalTime: string;
  duration: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  terminal: string;
  gate: string;
  status: 'On Time' | 'Scheduled' | 'Delayed' | 'Boarding' | 'Completed' | 'Unbooked';
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
  duration?: string;
  distanceKm?: number;
  distanceMiles?: number;
  terminal: string;
  gate: string;
  seatNumber: string;
  cabinClass: CabinClass;
  passenger: PassengerInfo;
  passengers?: PassengerInfo[];
  seats?: string[];
  passengerCount?: number;
  groupName?: string;
  isFamilyBooking?: boolean;
  bookingDate: string;
  status: 'Confirmed' | 'Checked In' | 'Boarded' | 'Cancelled';
  pricePaid: number;
  paymentMethod: string;
  autoEmailSent?: boolean;
  autoEmailSentTo?: string;
  autoEmailSentAt?: string;
  gatePassApproved?: boolean;
  gatePassApprovedAt?: string;
  verifiedByAgent?: string;
  isSuperAdminBooking?: boolean;
  bookedByRole?: 'superadmin' | 'admin' | 'user';
  bookedByEmail?: string;
  bookedByUid?: string;
  bookedByName?: string;
}

export type UserRole = 'superadmin' | 'admin' | 'user';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt?: string;
}
