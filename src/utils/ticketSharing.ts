import { Booking } from '../types';

export function formatFlightDate(isoOrDateStr: string): string {
  try {
    const d = new Date(isoOrDateStr);
    return isNaN(d.getTime()) ? isoOrDateStr : d.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoOrDateStr;
  }
}

export function generateTicketPlaintext(booking: Booking): string {
  const passengers = booking.passengers && booking.passengers.length > 0 ? booking.passengers : [booking.passenger];
  const manifest = passengers.map((p, i) =>
    `  ${i + 1}. ${p.fullName || 'Passenger'} | Seat: ${p.seatNumber || booking.seatNumber} | Passport: ${p.passportNumber || 'N/A'}`
  ).join('\n');

  return `=====================================================
AMERICAN AIRLINES ELECTRONIC TICKET & BOARDING PASS
=====================================================
PASSENGER & BOOKING DETAILS:
• Confirmation Code (PNR): ${booking.confirmationCode}
• Ticket Number: ${booking.ticketNumber}
• Lead Passenger: ${booking.passenger?.fullName || 'Valued Passenger'}
• Email: ${booking.passenger?.email || booking.autoEmailSentTo || 'N/A'}
• Total Passengers: ${booking.passengerCount || passengers.length} ${booking.isFamilyBooking ? `(Family/Group: ${booking.groupName || 'Group Ticket'})` : ''}

PASSENGER MANIFEST & SEATS:
${manifest}

FLIGHT ITINERARY:
• Flight Number: ${booking.flightNumber} (${booking.airline || 'American Airlines'})
• Aircraft: ${booking.aircraft || 'Boeing 787-9 Dreamliner'}
• Route: ${booking.origin.city} (${booking.origin.code}) ➔ ${booking.destination.city} (${booking.destination.code})
• Departure: ${formatFlightDate(booking.departureTime)}
• Arrival: ${formatFlightDate(booking.arrivalTime)}
• Terminal & Gate: Terminal ${booking.terminal || '8'}, Gate ${booking.gate || '24B'}
• Cabin Class: ${booking.cabinClass || 'Economy'}

PAYMENT & STATUS:
• Total Fare Paid: $${booking.pricePaid ?? 0} (${booking.paymentMethod || 'Credit Card'})
• Reservation Status: ${booking.status || 'CONFIRMED & TICKETED'}
• Booking Date: ${formatFlightDate(booking.bookingDate || new Date().toISOString())}
=====================================================
Thank you for flying American Airlines!`;
}

export function generateWhatsAppMessage(booking: Booking): string {
  const depTime = formatFlightDate(booking.departureTime);
  const passengers = booking.passengers && booking.passengers.length > 0 ? booking.passengers : [booking.passenger];
  
  let passengerLine = `👤 *Passenger:* ${booking.passenger?.fullName || 'Passenger'}`;
  if (passengers.length > 1) {
    passengerLine = `👥 *Passengers (${passengers.length}):* ${passengers.map(p => `${p.fullName} (Seat ${p.seatNumber || booking.seatNumber})`).join(', ')}`;
  }

  return `✈️ *AMERICAN AIRLINES E-TICKET & BOARDING PASS*
━━━━━━━━━━━━━━━━━━━━━━━━
${passengerLine}
🎫 *Ticket #:* ${booking.ticketNumber}
🔖 *PNR Code:* ${booking.confirmationCode}
🛫 *Flight:* ${booking.flightNumber} (${booking.airline || 'American Airlines'})
📍 *Route:* ${booking.origin.city} (${booking.origin.code}) ➔ ${booking.destination.city} (${booking.destination.code})
💺 *Seat:* ${booking.seatNumber} (${booking.cabinClass || 'Economy'})
🕒 *Departure:* ${depTime}
🚪 *Terminal / Gate:* Terminal ${booking.terminal || '8'}, Gate ${booking.gate || '24B'}
💰 *Fare Paid:* $${booking.pricePaid ?? 0} (${booking.paymentMethod || 'Paid'})
✅ *Status:* CONFIRMED & TICKETED
━━━━━━━━━━━━━━━━━━━━━━━━
_Search ticket #${booking.ticketNumber} in American Airlines Hub for live tracking & mobile boarding pass._`;
}

export function generateWhatsAppShareUrl(booking: Booking, phone?: string): string {
  const message = generateWhatsAppMessage(booking);
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  if (cleanPhone) {
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
  }
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

export function generateGmailShareUrl(booking: Booking, recipientEmail?: string): string {
  const target = (recipientEmail || booking.autoEmailSentTo || booking.passenger?.email || '').trim();
  const subject = `✈️ American Airlines e-Ticket Receipt & Boarding Pass [Flight ${booking.flightNumber} - PNR ${booking.confirmationCode}]`;
  const body = generateTicketPlaintext(booking);

  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(target)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function generateTwitterShareUrl(booking: Booking): string {
  const origin = `${booking.origin.city} (${booking.origin.code})`;
  const destination = `${booking.destination.city} (${booking.destination.code})`;
  const text = `✈️ Just booked my flight on @AmericanAir! Flight ${booking.flightNumber} from ${origin} to ${destination}. Seat ${booking.seatNumber} is locked in! 🛫💺 #AmericanAirlines #Travel #Flight #${booking.destination.code}`;
  
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function generateInstagramCaption(booking: Booking): string {
  const origin = booking.origin.city;
  const destination = booking.destination.city;
  const tagCity = destination.replace(/[^a-zA-Z0-9]/g, '');

  return `✈️ NEXT STOP: ${destination.toUpperCase()}! 🌍✨
────────────────────────
🛫 Flying with @AmericanAir • Flight ${booking.flightNumber}
📍 ${booking.origin.code} (${origin}) ➔ ${booking.destination.code} (${destination})
💺 Seat ${booking.seatNumber} (${booking.cabinClass || 'Economy'})
🎫 Ticket #${booking.ticketNumber} | PNR: ${booking.confirmationCode}
🕒 Departure: ${formatFlightDate(booking.departureTime)}
────────────────────────
Ready for takeoff! ☁️✨ #AmericanAirlines #Travel #Wanderlust #FlightLife #Vacation #${tagCity} #Aviation`;
}

export function generateMailtoUrl(booking: Booking, recipientEmail?: string): string {
  const target = (recipientEmail || booking.autoEmailSentTo || booking.passenger?.email || '').trim();
  const subject = encodeURIComponent(`Your American Airlines e-Ticket Receipt & Boarding Pass [Flight ${booking.flightNumber} - PNR ${booking.confirmationCode}]`);
  const body = encodeURIComponent(generateTicketPlaintext(booking));

  return `mailto:${target}?subject=${subject}&body=${body}`;
}

export async function shareViaDevice(booking: Booking): Promise<boolean> {
  const text = generateWhatsAppMessage(booking);
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: `American Airlines e-Ticket - Flight ${booking.flightNumber}`,
        text: text,
        url: window.location.href,
      });
      return true;
    } catch {
      // Fallback
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
