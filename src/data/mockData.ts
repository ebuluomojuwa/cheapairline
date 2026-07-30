import { Flight, Booking, Seat, CabinClass } from '../types';

export const INITIAL_FLIGHTS: Flight[] = [
  {
    id: 'fl-101',
    flightNumber: 'AA-104',
    airline: 'American Airlines',
    airlineCode: 'AA',
    aircraft: 'Boeing 787-9 Dreamliner',
    origin: { code: 'JFK', city: 'New York', airport: 'John F. Kennedy Intl' },
    destination: { code: 'LHR', city: 'London', airport: 'Heathrow Airport' },
    departureTime: '2026-08-10T18:30:00',
    arrivalTime: '2026-08-11T06:45:00',
    duration: '7h 15m',
    price: 640,
    totalSeats: 180,
    availableSeats: 142,
    terminal: 'T8',
    gate: 'B24',
    status: 'On Time',
  },
  {
    id: 'fl-102',
    flightNumber: 'AA-302',
    airline: 'American Airlines',
    airlineCode: 'AA',
    aircraft: 'Boeing 777-300ER Flagship',
    origin: { code: 'LAX', city: 'Los Angeles', airport: 'Los Angeles Intl' },
    destination: { code: 'HND', city: 'Tokyo', airport: 'Haneda Airport' },
    departureTime: '2026-08-12T11:15:00',
    arrivalTime: '2026-08-13T15:20:00',
    duration: '11h 05m',
    price: 920,
    totalSeats: 210,
    availableSeats: 165,
    terminal: 'T4',
    gate: '42B',
    status: 'Scheduled',
  },
  {
    id: 'fl-103',
    flightNumber: 'AA-782',
    airline: 'American Airlines',
    airlineCode: 'AA',
    aircraft: 'Boeing 787-8 Dreamliner',
    origin: { code: 'DFW', city: 'Dallas/Fort Worth', airport: 'Dallas/Fort Worth Intl' },
    destination: { code: 'CDG', city: 'Paris', airport: 'Charles de Gaulle' },
    departureTime: '2026-08-15T15:40:00',
    arrivalTime: '2026-08-16T00:10:00',
    duration: '8h 30m',
    price: 780,
    totalSeats: 240,
    availableSeats: 188,
    terminal: 'T-D',
    gate: 'D22',
    status: 'On Time',
  },
  {
    id: 'fl-104',
    flightNumber: 'AA-512',
    airline: 'American Airlines',
    airlineCode: 'AA',
    aircraft: 'Boeing 777-200ER',
    origin: { code: 'ORD', city: 'Chicago', airport: "O'Hare Intl Airport" },
    destination: { code: 'LHR', city: 'London', airport: 'Heathrow Airport' },
    departureTime: '2026-08-18T22:05:00',
    arrivalTime: '2026-08-19T11:00:00',
    duration: '6h 55m',
    price: 710,
    totalSeats: 220,
    availableSeats: 175,
    terminal: 'T3',
    gate: 'H15',
    status: 'On Time',
  },
  {
    id: 'fl-105',
    flightNumber: 'AA-910',
    airline: 'American Airlines',
    airlineCode: 'AA',
    aircraft: 'Boeing 787-9 Dreamliner',
    origin: { code: 'MIA', city: 'Miami', airport: 'Miami Intl Airport' },
    destination: { code: 'EZE', city: 'Buenos Aires', airport: 'Ministro Pistarini' },
    departureTime: '2026-08-20T21:45:00',
    arrivalTime: '2026-08-21T06:15:00',
    duration: '9h 30m',
    price: 850,
    totalSeats: 190,
    availableSeats: 150,
    terminal: 'T-D',
    gate: 'D30',
    status: 'On Time',
  },
  {
    id: 'fl-106',
    flightNumber: 'AA-431',
    airline: 'American Airlines',
    airlineCode: 'AA',
    aircraft: 'Airbus A321T Transcontinental',
    origin: { code: 'SFO', city: 'San Francisco', airport: 'San Francisco Intl' },
    destination: { code: 'JFK', city: 'New York', airport: 'John F. Kennedy Intl' },
    departureTime: '2026-08-22T16:10:00',
    arrivalTime: '2026-08-23T00:30:00',
    duration: '5h 20m',
    price: 540,
    totalSeats: 102,
    availableSeats: 78,
    terminal: 'T2',
    gate: '54B',
    status: 'On Time',
  },
  {
    id: 'fl-107',
    flightNumber: 'AA-238',
    airline: 'American Airlines',
    airlineCode: 'AA',
    aircraft: 'Boeing 787-9 Dreamliner',
    origin: { code: 'JFK', city: 'New York', airport: 'John F. Kennedy Intl' },
    destination: { code: 'FCO', city: 'Rome', airport: 'Leonardo da Vinci-Fiumicino' },
    departureTime: '2026-08-25T17:15:00',
    arrivalTime: '2026-08-26T07:45:00',
    duration: '8h 30m',
    price: 890,
    totalSeats: 190,
    availableSeats: 154,
    terminal: 'T8',
    gate: 'B18',
    status: 'On Time',
  },
  {
    id: 'fl-108',
    flightNumber: 'AA-112',
    airline: 'American Airlines',
    airlineCode: 'AA',
    aircraft: 'Boeing 777-200ER',
    origin: { code: 'MIA', city: 'Miami', airport: 'Miami Intl Airport' },
    destination: { code: 'MAD', city: 'Madrid', airport: 'Adolfo Suárez Madrid-Barajas' },
    departureTime: '2026-08-28T19:20:00',
    arrivalTime: '2026-08-29T09:50:00',
    duration: '8h 30m',
    price: 760,
    totalSeats: 220,
    availableSeats: 180,
    terminal: 'T-D',
    gate: 'D14',
    status: 'Scheduled',
  },
  {
    id: 'fl-109',
    flightNumber: 'AA-73',
    airline: 'American Airlines',
    airlineCode: 'AA',
    aircraft: 'Boeing 787-9 Dreamliner',
    origin: { code: 'LAX', city: 'Los Angeles', airport: 'Los Angeles Intl' },
    destination: { code: 'SYD', city: 'Sydney', airport: 'Sydney Kingsford Smith' },
    departureTime: '2026-08-30T22:55:00',
    arrivalTime: '2026-09-01T07:15:00',
    duration: '15h 20m',
    price: 1250,
    totalSeats: 210,
    availableSeats: 140,
    terminal: 'T4',
    gate: '48A',
    status: 'On Time',
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bkg-1001',
    ticketNumber: '001-8942-0101',
    confirmationCode: 'AA-9821',
    flightId: 'fl-101',
    flightNumber: 'AA-104',
    airline: 'American Airlines',
    aircraft: 'Boeing 787-9 Dreamliner',
    origin: { code: 'JFK', city: 'New York', airport: 'John F. Kennedy Intl' },
    destination: { code: 'LHR', city: 'London', airport: 'Heathrow Airport' },
    departureTime: '2026-08-10T18:30:00',
    arrivalTime: '2026-08-11T06:45:00',
    terminal: 'T8',
    gate: 'B24',
    seatNumber: '01A',
    cabinClass: 'First',
    passenger: {
      fullName: 'Jonathan Edward Vance',
      email: 'jonathan.vance@techcorp.com',
      phone: '+1 (555) 234-8901',
      passportNumber: 'US982341029',
      nationality: 'United States',
      gender: 'Male',
      dateOfBirth: '1984-05-12',
      mealPreference: 'Flagship Dining Gourmet Steak',
      baggageCount: 3,
      specialAssistance: 'Admirals Club Lounge Access'
    },
    bookingDate: '2026-07-15T10:14:00',
    status: 'Confirmed',
    pricePaid: 2400,
    paymentMethod: 'Citi / AAdvantage Executive World Elite (*4019)'
  },
  {
    id: 'bkg-1002',
    ticketNumber: '001-8942-0102',
    confirmationCode: 'AA-9822',
    flightId: 'fl-101',
    flightNumber: 'AA-104',
    airline: 'American Airlines',
    aircraft: 'Boeing 787-9 Dreamliner',
    origin: { code: 'JFK', city: 'New York', airport: 'John F. Kennedy Intl' },
    destination: { code: 'LHR', city: 'London', airport: 'Heathrow Airport' },
    departureTime: '2026-08-10T18:30:00',
    arrivalTime: '2026-08-11T06:45:00',
    terminal: 'T8',
    gate: 'B24',
    seatNumber: '01B',
    cabinClass: 'First',
    passenger: {
      fullName: 'Sophia Maria Rodriguez',
      email: 'sophia.rodriguez@designstudio.io',
      phone: '+1 (555) 876-1234',
      passportNumber: 'US441092837',
      nationality: 'United States',
      gender: 'Female',
      dateOfBirth: '1990-11-23',
      mealPreference: 'Vegetarian Vegan Specialty',
      baggageCount: 2,
      specialAssistance: 'Priority Concierge Key Boarding'
    },
    bookingDate: '2026-07-16T14:22:00',
    status: 'Checked In',
    pricePaid: 2400,
    paymentMethod: 'AAdvantage Aviator Red MasterCard (*8812)'
  },
  {
    id: 'bkg-1003',
    ticketNumber: '001-3041-9921',
    confirmationCode: 'AA-4410',
    flightId: 'fl-102',
    flightNumber: 'AA-302',
    airline: 'American Airlines',
    aircraft: 'Boeing 777-300ER Flagship',
    origin: { code: 'LAX', city: 'Los Angeles', airport: 'Los Angeles Intl' },
    destination: { code: 'HND', city: 'Tokyo', airport: 'Haneda Airport' },
    departureTime: '2026-08-12T11:15:00',
    arrivalTime: '2026-08-13T15:20:00',
    terminal: 'T4',
    gate: '42B',
    seatNumber: '12F',
    cabinClass: 'Business',
    passenger: {
      fullName: 'Amina Bello',
      email: 'amina.bello@globalventures.org',
      phone: '+1 (310) 902-3341',
      passportNumber: 'NG771920384',
      nationality: 'Nigeria',
      gender: 'Female',
      dateOfBirth: '1988-03-04',
      mealPreference: 'Halal Certified Course',
      baggageCount: 2,
      specialAssistance: 'Extra Overhead Storage'
    },
    bookingDate: '2026-07-18T09:05:00',
    status: 'Confirmed',
    pricePaid: 1850,
    paymentMethod: 'Citi / AAdvantage Platinum (*3309)'
  },
  {
    id: 'bkg-1004',
    ticketNumber: '001-7712-4019',
    confirmationCode: 'AA-8801',
    flightId: 'fl-103',
    flightNumber: 'AA-782',
    airline: 'American Airlines',
    aircraft: 'Boeing 787-8 Dreamliner',
    origin: { code: 'DFW', city: 'Dallas/Fort Worth', airport: 'Dallas/Fort Worth Intl' },
    destination: { code: 'CDG', city: 'Paris', airport: 'Charles de Gaulle' },
    departureTime: '2026-08-15T15:40:00',
    arrivalTime: '2026-08-16T00:10:00',
    terminal: 'T-D',
    gate: 'D22',
    seatNumber: '18A',
    cabinClass: 'Premium Economy',
    passenger: {
      fullName: 'Jean-Luc Dubois',
      email: 'jl.dubois@architects-paris.fr',
      phone: '+33 6 12 34 56 78',
      passportNumber: 'FR901238471',
      nationality: 'France',
      gender: 'Male',
      dateOfBirth: '1976-09-18',
      mealPreference: 'Gluten-Free European Delight',
      baggageCount: 1,
      specialAssistance: 'None'
    },
    bookingDate: '2026-07-20T16:40:00',
    status: 'Confirmed',
    pricePaid: 950,
    paymentMethod: 'Apple Pay Visa (*9011)'
  },
  {
    id: 'bkg-1005',
    ticketNumber: '001-1049-5582',
    confirmationCode: 'AA-1209',
    flightId: 'fl-104',
    flightNumber: 'AA-512',
    airline: 'American Airlines',
    aircraft: 'Boeing 777-200ER',
    origin: { code: 'ORD', city: 'Chicago', airport: "O'Hare Intl Airport" },
    destination: { code: 'LHR', city: 'London', airport: 'Heathrow Airport' },
    departureTime: '2026-08-18T22:05:00',
    arrivalTime: '2026-08-19T11:00:00',
    terminal: 'T3',
    gate: 'H15',
    seatNumber: '24C',
    cabinClass: 'Economy',
    passenger: {
      fullName: 'Marcus Aurelius Chen',
      email: 'm.chen@analytics-group.sg',
      phone: '+44 7700 900123',
      passportNumber: 'SG882190341',
      nationality: 'Singapore',
      gender: 'Male',
      dateOfBirth: '1995-02-14',
      mealPreference: 'Standard Asian Meal',
      baggageCount: 1,
      specialAssistance: 'None'
    },
    bookingDate: '2026-07-22T11:55:00',
    status: 'Confirmed',
    pricePaid: 710,
    paymentMethod: 'AAdvantage MileUp Card (*1145)'
  },
  {
    id: 'bkg-1006',
    ticketNumber: '001-8942-0125',
    confirmationCode: 'AA-9825',
    flightId: 'fl-101',
    flightNumber: 'AA-104',
    airline: 'American Airlines',
    aircraft: 'Boeing 787-9 Dreamliner',
    origin: { code: 'JFK', city: 'New York', airport: 'John F. Kennedy Intl' },
    destination: { code: 'LHR', city: 'London', airport: 'Heathrow Airport' },
    departureTime: '2026-08-10T18:30:00',
    arrivalTime: '2026-08-11T06:45:00',
    terminal: 'T8',
    gate: 'B24',
    seatNumber: '14A',
    cabinClass: 'Economy',
    passenger: {
      fullName: 'Emily Rose Higgins',
      email: 'emily.higgins@oxford.ac.uk',
      phone: '+1 (212) 555-0199',
      passportNumber: 'UK490218301',
      nationality: 'United Kingdom',
      gender: 'Female',
      dateOfBirth: '1998-07-30',
      mealPreference: 'Kosher Meal Option',
      baggageCount: 2,
      specialAssistance: 'Wheelchair Assistance at Destination'
    },
    bookingDate: '2026-07-25T08:12:00',
    status: 'Confirmed',
    pricePaid: 640,
    paymentMethod: 'MasterCard Debit (*7731)'
  },
  {
    id: 'bkg-1007',
    ticketNumber: '001-9482-7710',
    confirmationCode: 'AA-EG77',
    flightId: 'fl-101',
    flightNumber: 'AA-104',
    airline: 'American Airlines',
    aircraft: 'Boeing 787-9 Dreamliner',
    origin: { code: 'JFK', city: 'New York', airport: 'John F. Kennedy Intl' },
    destination: { code: 'LHR', city: 'London', airport: 'Heathrow Airport' },
    departureTime: '2026-08-10T18:30:00',
    arrivalTime: '2026-08-11T06:45:00',
    terminal: 'T8',
    gate: 'B24',
    seatNumber: '02B',
    cabinClass: 'First',
    passenger: {
      fullName: 'Elizabeth Gutierrez',
      email: 'e.gutierrez@globalflight.org',
      phone: '+1 (305) 555-0182',
      passportNumber: 'US892104938',
      nationality: 'United States',
      gender: 'Female',
      dateOfBirth: '1991-11-22',
      mealPreference: 'Flagship First Gourmet',
      baggageCount: 2,
      specialAssistance: 'Priority Flagship Check-in'
    },
    bookingDate: '2026-07-28T14:20:00',
    status: 'Confirmed',
    pricePaid: 1450,
    paymentMethod: 'American Airlines AAdvantage Executive World Elite Mastercard (*4912)'
  }
];

/**
 * Generate a complete seat layout array for a given flight and list of bookings
 */
export function generateFlightSeats(flight: Flight, bookings: Booking[]): Seat[] {
  const seats: Seat[] = [];
  const bookedSeatNumbers = new Set(
    bookings.filter(b => b.flightId === flight.id && b.status !== 'Cancelled').map(b => b.seatNumber)
  );

  // Total 25 rows, 6 seats per row: A, B, C (aisle) D, E, F
  // Row 1-3: First Class
  // Row 4-8: Business Class
  // Row 9-12: Premium Economy
  // Row 13-25: Economy
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  for (let r = 1; r <= 25; r++) {
    const rowStr = r < 10 ? `0${r}` : `${r}`;
    
    let cabinClass: CabinClass = 'Economy';
    let priceModifier = 0;

    if (r <= 3) {
      cabinClass = 'First';
      priceModifier = 800;
    } else if (r <= 8) {
      cabinClass = 'Business';
      priceModifier = 450;
    } else if (r <= 12) {
      cabinClass = 'Premium Economy';
      priceModifier = 180;
    } else {
      cabinClass = 'Economy';
      priceModifier = 0;
    }

    const isExitRow = r === 13 || r === 14;
    if (isExitRow) {
      priceModifier += 35; // extra legroom
    }

    letters.forEach((lettr) => {
      const seatNumber = `${rowStr}${lettr}`;
      const isWindow = lettr === 'A' || lettr === 'F';
      const isAisle = lettr === 'C' || lettr === 'D';
      const isBooked = bookedSeatNumbers.has(seatNumber);

      seats.push({
        seatNumber,
        row: r,
        letter: lettr,
        cabinClass,
        isBooked,
        isWindow,
        isAisle,
        isExitRow,
        priceModifier,
      });
    });
  }

  return seats;
}
