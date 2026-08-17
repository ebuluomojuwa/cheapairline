import { Booking } from '../types';

export interface EmailSendResult {
  success: boolean;
  message: string;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

export async function sendTicketEmail(booking: Booking, recipientEmail?: string | any): Promise<EmailSendResult> {
  let target = '';
  if (typeof recipientEmail === 'string') {
    target = recipientEmail.trim();
  } else if (booking?.autoEmailSentTo && typeof booking.autoEmailSentTo === 'string') {
    target = booking.autoEmailSentTo.trim();
  } else if (booking?.passenger?.email && typeof booking.passenger.email === 'string') {
    target = booking.passenger.email.trim();
  }

  if (!target || !target.includes('@')) {
    return {
      success: false,
      message: 'Invalid email address provided.',
      error: 'Please enter a valid email address.'
    };
  }

  try {
    const response = await fetch('/api/send-ticket-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipientEmail: target,
        booking,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        message: data.message || `Official e-Ticket sent to ${target}`,
        messageId: data.messageId,
        previewUrl: data.previewUrl,
      };
    } else {
      return {
        success: false,
        message: data.error || 'Failed to send ticket email.',
        error: data.error,
      };
    }
  } catch (err: any) {
    console.error('Email service network error:', err);
    return {
      success: false,
      message: 'Network error while requesting email dispatch.',
      error: err.message || 'Unknown network error',
    };
  }
}
