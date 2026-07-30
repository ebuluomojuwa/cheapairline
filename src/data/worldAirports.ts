import { AirportLocation, Flight } from '../types';

export const WORLD_AIRPORTS: AirportLocation[] = [
  // --- UNITED STATES (BY STATE) ---
  { code: 'JFK', city: 'New York', airport: 'John F. Kennedy Intl Airport', country: 'United States', state: 'New York', flag: '🇺🇸' },
  { code: 'LGA', city: 'New York', airport: 'LaGuardia Airport', country: 'United States', state: 'New York', flag: '🇺🇸' },
  { code: 'EWR', city: 'Newark', airport: 'Newark Liberty Intl Airport', country: 'United States', state: 'New Jersey', flag: '🇺🇸' },
  { code: 'LAX', city: 'Los Angeles', airport: 'Los Angeles Intl Airport', country: 'United States', state: 'California', flag: '🇺🇸' },
  { code: 'SFO', city: 'San Francisco', airport: 'San Francisco Intl Airport', country: 'United States', state: 'California', flag: '🇺🇸' },
  { code: 'SAN', city: 'San Diego', airport: 'San Diego Intl Airport', country: 'United States', state: 'California', flag: '🇺🇸' },
  { code: 'SJC', city: 'San Jose', airport: 'San Jose Mineta Intl Airport', country: 'United States', state: 'California', flag: '🇺🇸' },
  { code: 'DFW', city: 'Dallas/Fort Worth', airport: 'Dallas/Fort Worth Intl Airport', country: 'United States', state: 'Texas', flag: '🇺🇸' },
  { code: 'IAH', city: 'Houston', airport: 'George Bush Intercontinental', country: 'United States', state: 'Texas', flag: '🇺🇸' },
  { code: 'AUS', city: 'Austin', airport: 'Austin-Bergstrom Intl Airport', country: 'United States', state: 'Texas', flag: '🇺🇸' },
  { code: 'SAT', city: 'San Antonio', airport: 'San Antonio Intl Airport', country: 'United States', state: 'Texas', flag: '🇺🇸' },
  { code: 'ORD', city: 'Chicago', airport: "O'Hare Intl Airport", country: 'United States', state: 'Illinois', flag: '🇺🇸' },
  { code: 'MDW', city: 'Chicago', airport: 'Chicago Midway Intl Airport', country: 'United States', state: 'Illinois', flag: '🇺🇸' },
  { code: 'MIA', city: 'Miami', airport: 'Miami Intl Airport', country: 'United States', state: 'Florida', flag: '🇺🇸' },
  { code: 'MCO', city: 'Orlando', airport: 'Orlando Intl Airport', country: 'United States', state: 'Florida', flag: '🇺🇸' },
  { code: 'FLL', city: 'Fort Lauderdale', airport: 'Fort Lauderdale-Hollywood Intl', country: 'United States', state: 'Florida', flag: '🇺🇸' },
  { code: 'TPA', city: 'Tampa', airport: 'Tampa Intl Airport', country: 'United States', state: 'Florida', flag: '🇺🇸' },
  { code: 'ATL', city: 'Atlanta', airport: 'Hartsfield-Jackson Atlanta Intl', country: 'United States', state: 'Georgia', flag: '🇺🇸' },
  { code: 'SEA', city: 'Seattle', airport: 'Seattle-Tacoma Intl Airport', country: 'United States', state: 'Washington', flag: '🇺🇸' },
  { code: 'DEN', city: 'Denver', airport: 'Denver Intl Airport', country: 'United States', state: 'Colorado', flag: '🇺🇸' },
  { code: 'BOS', city: 'Boston', airport: 'Boston Logan Intl Airport', country: 'United States', state: 'Massachusetts', flag: '🇺🇸' },
  { code: 'LAS', city: 'Las Vegas', airport: 'Harry Reid Intl Airport', country: 'United States', state: 'Nevada', flag: '🇺🇸' },
  { code: 'PHX', city: 'Phoenix', airport: 'Phoenix Sky Harbor Intl Airport', country: 'United States', state: 'Arizona', flag: '🇺🇸' },
  { code: 'PHL', city: 'Philadelphia', airport: 'Philadelphia Intl Airport', country: 'United States', state: 'Pennsylvania', flag: '🇺🇸' },
  { code: 'CLT', city: 'Charlotte', airport: 'Charlotte Douglas Intl Airport', country: 'United States', state: 'North Carolina', flag: '🇺🇸' },
  { code: 'DTW', city: 'Detroit', airport: 'Detroit Metropolitan Wayne County', country: 'United States', state: 'Michigan', flag: '🇺🇸' },
  { code: 'MSP', city: 'Minneapolis', airport: 'Minneapolis-Saint Paul Intl', country: 'United States', state: 'Minnesota', flag: '🇺🇸' },
  { code: 'BNA', city: 'Nashville', airport: 'Nashville Intl Airport', country: 'United States', state: 'Tennessee', flag: '🇺🇸' },
  { code: 'HNL', city: 'Honolulu', airport: 'Daniel K. Inouye Intl Airport', country: 'United States', state: 'Hawaii', flag: '🇺🇸' },
  { code: 'PDX', city: 'Portland', airport: 'Portland Intl Airport', country: 'United States', state: 'Oregon', flag: '🇺🇸' },
  { code: 'SLC', city: 'Salt Lake City', airport: 'Salt Lake City Intl Airport', country: 'United States', state: 'Utah', flag: '🇺🇸' },
  { code: 'MSY', city: 'New Orleans', airport: 'Louis Armstrong New Orleans Intl', country: 'United States', state: 'Louisiana', flag: '🇺🇸' },
  { code: 'BWI', city: 'Baltimore', airport: 'Baltimore/Washington Intl', country: 'United States', state: 'Maryland', flag: '🇺🇸' },

  // --- NIGERIA (WEST AFRICA) ---
  { code: 'LOS', city: 'Lagos', airport: 'Murtala Muhammed Intl Airport', country: 'Nigeria', state: 'Lagos State', flag: '🇳🇬' },
  { code: 'ABV', city: 'Abuja', airport: 'Nnamdi Azikiwe Intl Airport', country: 'Nigeria', state: 'Federal Capital Territory', flag: '🇳🇬' },
  { code: 'KAN', city: 'Kano', airport: 'Mallam Aminu Kano Intl Airport', country: 'Nigeria', state: 'Kano State', flag: '🇳🇬' },
  { code: 'PHC', city: 'Port Harcourt', airport: 'Port Harcourt Intl Airport', country: 'Nigeria', state: 'Rivers State', flag: '🇳🇬' },
  { code: 'ENU', city: 'Enugu', airport: 'Akanu Ibiam Intl Airport', country: 'Nigeria', state: 'Enugu State', flag: '🇳🇬' },
  { code: 'CBQ', city: 'Calabar', airport: 'Margaret Ekpo Intl Airport', country: 'Nigeria', state: 'Cross River State', flag: '🇳🇬' },

  // --- UNITED KINGDOM ---
  { code: 'LHR', city: 'London', airport: 'London Heathrow Airport', country: 'United Kingdom', state: 'Greater London', flag: '🇬🇧' },
  { code: 'LGW', city: 'London', airport: 'London Gatwick Airport', country: 'United Kingdom', state: 'West Sussex', flag: '🇬🇧' },
  { code: 'MAN', city: 'Manchester', airport: 'Manchester Airport', country: 'United Kingdom', state: 'Greater Manchester', flag: '🇬🇧' },
  { code: 'EDI', city: 'Edinburgh', airport: 'Edinburgh Airport', country: 'United Kingdom', state: 'Scotland', flag: '🇬🇧' },

  // --- CANADA ---
  { code: 'YYZ', city: 'Toronto', airport: 'Toronto Pearson Intl Airport', country: 'Canada', state: 'Ontario', flag: '🇨🇦' },
  { code: 'YVR', city: 'Vancouver', airport: 'Vancouver Intl Airport', country: 'Canada', state: 'British Columbia', flag: '🇨🇦' },
  { code: 'YUL', city: 'Montreal', airport: 'Montréal-Trudeau Intl Airport', country: 'Canada', state: 'Quebec', flag: '🇨🇦' },
  { code: 'YYC', city: 'Calgary', airport: 'Calgary Intl Airport', country: 'Canada', state: 'Alberta', flag: '🇨🇦' },

  // --- JAPAN ---
  { code: 'HND', city: 'Tokyo', airport: 'Tokyo Haneda Airport', country: 'Japan', state: 'Tokyo Prefecture', flag: '🇯🇵' },
  { code: 'NRT', city: 'Tokyo', airport: 'Narita Intl Airport', country: 'Japan', state: 'Chiba Prefecture', flag: '🇯🇵' },
  { code: 'KIX', city: 'Osaka', airport: 'Kansai Intl Airport', country: 'Japan', state: 'Osaka Prefecture', flag: '🇯🇵' },

  // --- FRANCE ---
  { code: 'CDG', city: 'Paris', airport: 'Paris Charles de Gaulle Airport', country: 'France', state: 'Île-de-France', flag: '🇫🇷' },
  { code: 'ORY', city: 'Paris', airport: 'Paris Orly Airport', country: 'France', state: 'Île-de-France', flag: '🇫🇷' },
  { code: 'NCE', city: 'Nice', airport: 'Nice Côte d’Azur Airport', country: 'France', state: 'Provence-Alpes-Côte d’Azur', flag: '🇫🇷' },

  // --- GERMANY ---
  { code: 'FRA', city: 'Frankfurt', airport: 'Frankfurt Airport', country: 'Germany', state: 'Hesse', flag: '🇩🇪' },
  { code: 'MUC', city: 'Munich', airport: 'Munich Airport', country: 'Germany', state: 'Bavaria', flag: '🇩🇪' },
  { code: 'BER', city: 'Berlin', airport: 'Berlin Brandenburg Airport', country: 'Germany', state: 'Brandenburg', flag: '🇩🇪' },

  // --- ITALY ---
  { code: 'FCO', city: 'Rome', airport: 'Leonardo da Vinci-Fiumicino Airport', country: 'Italy', state: 'Lazio', flag: '🇮🇹' },
  { code: 'MXP', city: 'Milan', airport: 'Milan Malpensa Airport', country: 'Italy', state: 'Lombardy', flag: '🇮🇹' },
  { code: 'VCE', city: 'Venice', airport: 'Venice Marco Polo Airport', country: 'Italy', state: 'Veneto', flag: '🇮🇹' },

  // --- SPAIN ---
  { code: 'MAD', city: 'Madrid', airport: 'Adolfo Suárez Madrid-Barajas', country: 'Spain', state: 'Community of Madrid', flag: '🇪🇸' },
  { code: 'BCN', city: 'Barcelona', airport: 'Josep Tarradellas Barcelona-El Prat', country: 'Spain', state: 'Catalonia', flag: '🇪🇸' },

  // --- UNITED ARAB EMIRATES ---
  { code: 'DXB', city: 'Dubai', airport: 'Dubai Intl Airport', country: 'United Arab Emirates', state: 'Emirate of Dubai', flag: '🇦🇪' },
  { code: 'AUH', city: 'Abu Dhabi', airport: 'Zayed Intl Airport (Abu Dhabi)', country: 'United Arab Emirates', state: 'Emirate of Abu Dhabi', flag: '🇦🇪' },

  // --- SOUTH AFRICA ---
  { code: 'JNB', city: 'Johannesburg', airport: 'O. R. Tambo Intl Airport', country: 'South Africa', state: 'Gauteng', flag: '🇿🇦' },
  { code: 'CPT', city: 'Cape Town', airport: 'Cape Town Intl Airport', country: 'South Africa', state: 'Western Cape', flag: '🇿🇦' },

  // --- BRAZIL ---
  { code: 'GRU', city: 'São Paulo', airport: 'São Paulo/Guarulhos Intl Airport', country: 'Brazil', state: 'State of São Paulo', flag: '🇧🇷' },
  { code: 'GIG', city: 'Rio de Janeiro', airport: 'Rio de Janeiro/Galeão Intl', country: 'Brazil', state: 'State of Rio de Janeiro', flag: '🇧🇷' },

  // --- ARGENTINA ---
  { code: 'EZE', city: 'Buenos Aires', airport: 'Ministro Pistarini Intl Airport', country: 'Argentina', state: 'Buenos Aires Province', flag: '🇦🇷' },

  // --- AUSTRALIA ---
  { code: 'SYD', city: 'Sydney', airport: 'Sydney Kingsford Smith Airport', country: 'Australia', state: 'New South Wales', flag: '🇦🇺' },
  { code: 'MEL', city: 'Melbourne', airport: 'Melbourne Airport', country: 'Australia', state: 'Victoria', flag: '🇦🇺' },
  { code: 'BNE', city: 'Brisbane', airport: 'Brisbane Airport', country: 'Australia', state: 'Queensland', flag: '🇦🇺' },

  // --- INDIA ---
  { code: 'DEL', city: 'New Delhi', airport: 'Indira Gandhi Intl Airport', country: 'India', state: 'Delhi NCR', flag: '🇮🇳' },
  { code: 'BOM', city: 'Mumbai', airport: 'Chhatrapati Shivaji Maharaj Intl', country: 'India', state: 'Maharashtra', flag: '🇮🇳' },
  { code: 'BLR', city: 'Bengaluru', airport: 'Kempegowda Intl Airport', country: 'India', state: 'Karnataka', flag: '🇮🇳' },

  // --- EGYPT ---
  { code: 'CAI', city: 'Cairo', airport: 'Cairo Intl Airport', country: 'Egypt', state: 'Cairo Governorate', flag: '🇪🇬' },

  // --- GHANA ---
  { code: 'ACC', city: 'Accra', airport: 'Kotoka Intl Airport', country: 'Ghana', state: 'Greater Accra', flag: '🇬🇭' },

  // --- KENYA ---
  { code: 'NBO', city: 'Nairobi', airport: 'Jomo Kenyatta Intl Airport', country: 'Kenya', state: 'Nairobi County', flag: '🇰🇪' },

  // --- MOROCCO ---
  { code: 'CMN', city: 'Casablanca', airport: 'Mohammed V Intl Airport', country: 'Morocco', state: 'Casablanca-Settat', flag: '🇲🇦' },

  // --- SINGAPORE ---
  { code: 'SIN', city: 'Singapore', airport: 'Singapore Changi Airport', country: 'Singapore', state: 'Singapore', flag: '🇸🇬' },

  // --- CHINA ---
  { code: 'PEK', city: 'Beijing', airport: 'Beijing Capital Intl Airport', country: 'China', state: 'Beijing Municipality', flag: '🇨🇳' },
  { code: 'PVG', city: 'Shanghai', airport: 'Shanghai Pudong Intl Airport', country: 'China', state: 'Shanghai Municipality', flag: '🇨🇳' },

  // --- SOUTH KOREA ---
  { code: 'ICN', city: 'Seoul', airport: 'Incheon Intl Airport', country: 'South Korea', state: 'Incheon', flag: '🇰🇷' },

  // --- NETHERLANDS ---
  { code: 'AMS', city: 'Amsterdam', airport: 'Amsterdam Airport Schiphol', country: 'Netherlands', state: 'North Holland', flag: '🇳🇱' },

  // --- SWITZERLAND ---
  { code: 'ZRH', city: 'Zurich', airport: 'Zurich Airport', country: 'Switzerland', state: 'Canton of Zürich', flag: '🇨🇭' },

  // --- MEXICO ---
  { code: 'MEX', city: 'Mexico City', airport: 'Benito Juárez Intl Airport', country: 'Mexico', state: 'CDMX', flag: '🇲🇽' },
  { code: 'CUN', city: 'Cancun', airport: 'Cancún Intl Airport', country: 'Mexico', state: 'Quintana Roo', flag: '🇲🇽' },

  // --- TURKEY ---
  { code: 'IST', city: 'Istanbul', airport: 'Istanbul Airport', country: 'Turkey', state: 'Istanbul Province', flag: '🇹🇷' },

  // --- SAUDI ARABIA ---
  { code: 'RUH', city: 'Riyadh', airport: 'King Khalid Intl Airport', country: 'Saudi Arabia', state: 'Riyadh Province', flag: '🇸🇦' },
  { code: 'JED', city: 'Jeddah', airport: 'King Abdulaziz Intl Airport', country: 'Saudi Arabia', state: 'Makkah Province', flag: '🇸🇦' },

  // --- QATAR ---
  { code: 'DOH', city: 'Doha', airport: 'Hamad Intl Airport', country: 'Qatar', state: 'Doha', flag: '🇶🇦' },
];

/**
 * Searches global airports by country, state, city, airport name, or IATA code.
 */
export function searchWorldAirports(query: string): AirportLocation[] {
  if (!query || query.trim() === '') return WORLD_AIRPORTS;
  const q = query.trim().toLowerCase();
  return WORLD_AIRPORTS.filter(
    (ap) =>
      ap.country.toLowerCase().includes(q) ||
      (ap.state && ap.state.toLowerCase().includes(q)) ||
      ap.city.toLowerCase().includes(q) ||
      ap.airport.toLowerCase().includes(q) ||
      ap.code.toLowerCase().includes(q)
  );
}

/**
 * Dynamically generates a complete Flagship American Airlines flight for any given destination airport!
 */
export function createFlightForDestination(dest: AirportLocation): Flight {
  const flightNum = Math.floor(100 + Math.random() * 899);
  const price = Math.floor(520 + Math.random() * 650);
  
  // Choose origin hub
  const origin = {
    code: 'JFK',
    city: 'New York',
    airport: 'John F. Kennedy Intl Airport',
    country: 'United States',
    state: 'New York'
  };

  const aircrafts = [
    'Boeing 787-9 Dreamliner',
    'Boeing 777-300ER Flagship',
    'Airbus A350-900 Ultra Long-Range',
    'Boeing 787-8 Dreamliner',
    'Boeing 777-200ER'
  ];

  return {
    id: `fl-dyn-${dest.code.toLowerCase()}-${Date.now()}`,
    flightNumber: `AA-${flightNum}`,
    airline: 'American Airlines',
    airlineCode: 'AA',
    aircraft: aircrafts[Math.floor(Math.random() * aircrafts.length)],
    origin,
    destination: {
      code: dest.code,
      city: dest.city,
      airport: dest.airport,
      country: dest.country,
      state: dest.state
    },
    departureTime: '2026-09-01T18:45:00',
    arrivalTime: '2026-09-02T08:30:00',
    duration: '9h 45m',
    price,
    totalSeats: 180,
    availableSeats: 156,
    terminal: 'T8',
    gate: `B${Math.floor(10 + Math.random() * 30)}`,
    status: 'On Time'
  };
}
