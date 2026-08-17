import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Transporter Cache
let cachedTransporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;

  if (host && user && pass) {
    console.log(`[Email Service] Using custom SMTP server: ${host}:${port}`);
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    return cachedTransporter;
  }

  // Fallback to auto-generated Ethereal test account for real SMTP email transport & preview links
  try {
    console.log("[Email Service] Creating Ethereal SMTP test transporter...");
    const testAccount = await nodemailer.createTestAccount();
    console.log(`[Email Service] Ethereal account generated: ${testAccount.user}`);
    cachedTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return cachedTransporter;
  } catch (err) {
    console.warn("[Email Service] Could not create Ethereal account, using direct SMTP fallback:", err);
    cachedTransporter = nodemailer.createTransport({
      host: "localhost",
      port: 25,
      tls: { rejectUnauthorized: false },
    });
    return cachedTransporter;
  }
}

// API Route: Send Flight Ticket Email
app.post("/api/send-ticket-email", async (req, res) => {
  try {
    const { recipientEmail, booking } = req.body;

    if (!recipientEmail || !recipientEmail.includes("@")) {
      res.status(400).json({ success: false, error: "A valid recipient email address is required." });
      return;
    }

    if (!booking || !booking.confirmationCode) {
      res.status(400).json({ success: false, error: "Valid booking details are required." });
      return;
    }

    const passengerName = booking.passenger?.fullName || "Valued Passenger";
    const pnr = booking.confirmationCode || "PNR-UNKNOWN";
    const ticketNo = booking.ticketNumber || `001-${Date.now()}`;
    const flightNo = booking.flightNumber || "AA-100";
    const origin = booking.origin?.code || "JFK";
    const originCity = booking.origin?.city || "New York";
    const destination = booking.destination?.code || "LAX";
    const destinationCity = booking.destination?.city || "Los Angeles";
    const seat = booking.seatNumber || "12A";
    const cabin = booking.cabinClass || "Economy";
    const price = booking.pricePaid ?? 0;
    const departureTime = booking.departureTime ? new Date(booking.departureTime).toLocaleString() : new Date().toLocaleString();
    const arrivalTime = booking.arrivalTime ? new Date(booking.arrivalTime).toLocaleString() : new Date().toLocaleString();
    const gate = booking.gate || "24B";
    const terminal = booking.terminal || "8";

    const passengerListHtml = (booking.passengers && booking.passengers.length > 0)
      ? booking.passengers.map((p: any, idx: number) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 4px; font-weight: 800; color: #001E42;">${idx + 1}. ${p.fullName}</td>
          <td style="padding: 8px 4px; font-weight: 800; color: #d97706; font-family: monospace;">Seat ${p.seatNumber || seat}</td>
          <td style="padding: 8px 4px; color: #475569;">${p.passengerType || 'Adult'}</td>
          <td style="padding: 8px 4px; color: #475569; font-family: monospace;">${p.passportNumber || 'N/A'}</td>
        </tr>
      `).join('')
      : `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 4px; font-weight: 800; color: #001E42;">1. ${passengerName}</td>
          <td style="padding: 8px 4px; font-weight: 800; color: #d97706; font-family: monospace;">Seat ${seat}</td>
          <td style="padding: 8px 4px; color: #475569;">Adult</td>
          <td style="padding: 8px 4px; color: #475569; font-family: monospace;">${booking.passenger?.passportNumber || 'N/A'}</td>
        </tr>
      `;

    const passengerCountStr = (booking.passengers && booking.passengers.length > 1)
      ? `${booking.passengers.length} Passengers (${booking.groupName || 'Family Booking'})`
      : '1 Passenger';

    const subject = `✈️ Your American Airlines e-Ticket Receipt & Boarding Pass [Flight ${flightNo} - PNR ${pnr} - ${passengerCountStr}]`;

    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>American Airlines e-Ticket Receipt</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #001E42 0%, #002D62 50%, #00152E 100%); padding: 24px; color: #ffffff; text-align: center; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 1px; color: #ffffff; }
        .header p { margin: 6px 0 0; font-size: 12px; color: #93c5fd; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .content { padding: 24px; }
        .greeting { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
        .intro { font-size: 13px; color: #475569; line-height: 1.5; margin-bottom: 20px; }
        .card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; margin-bottom: 20px; }
        .pnr-box { background: #0078D2; color: #ffffff; border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .pnr-label { font-size: 11px; text-transform: uppercase; font-weight: 700; opacity: 0.9; }
        .pnr-value { font-size: 18px; font-family: monospace; font-weight: 900; letter-spacing: 1px; }
        .flight-route { display: table; width: 100%; margin-bottom: 16px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 16px; }
        .route-col { display: table-cell; width: 45%; vertical-align: top; }
        .route-col.right { text-align: right; }
        .route-arrow { display: table-cell; width: 10%; text-align: center; vertical-align: middle; font-size: 20px; color: #0078D2; font-weight: bold; }
        .code { font-size: 24px; font-weight: 900; color: #001E42; margin: 0; }
        .city { font-size: 12px; color: #64748b; margin: 2px 0 0; font-weight: 600; }
        .grid { display: table; width: 100%; font-size: 12px; }
        .grid-row { display: table-row; }
        .grid-cell { display: table-cell; padding: 6px 0; color: #334155; }
        .grid-cell.label { font-weight: 700; color: #64748b; width: 40%; }
        .grid-cell.value { font-weight: 800; color: #0f172a; }
        .price-badge { background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; padding: 12px; border-radius: 8px; text-align: center; font-weight: 800; font-size: 14px; margin-bottom: 20px; }
        .barcode { text-align: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-family: monospace; letter-spacing: 3px; font-weight: bold; color: #64748b; font-size: 14px; }
        .footer { background: #0f172a; color: #94a3b8; padding: 18px; text-align: center; font-size: 11px; line-height: 1.5; }
        .footer a { color: #38bdf8; text-decoration: none; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AMERICAN AIRLINES</h1>
          <p>Electronic Ticket Receipt & Boarding Pass</p>
        </div>
        <div class="content">
          <div class="greeting">Dear ${passengerName},</div>
          <div class="intro">
            Your flight reservation with American Airlines has been successfully confirmed and ticketed. Below are your flight itinerary, ticket details, and boarding information.
          </div>

          <div class="pnr-box">
            <div>
              <div class="pnr-label">Booking Reference (PNR)</div>
              <div class="pnr-value">${pnr}</div>
            </div>
            <div style="text-align: right;">
              <div class="pnr-label">Ticket Number</div>
              <div class="pnr-value" style="font-size: 14px;">${ticketNo}</div>
            </div>
          </div>

          <div class="card">
            <div class="flight-route">
              <div class="route-col">
                <div class="code">${origin}</div>
                <div class="city">${originCity}</div>
              </div>
              <div class="route-arrow">➔</div>
              <div class="route-col right">
                <div class="code">${destination}</div>
                <div class="city">${destinationCity}</div>
              </div>
            </div>

            <div class="grid">
              <div class="grid-row">
                <div class="grid-cell label">Flight Number:</div>
                <div class="grid-cell value">${flightNo} (American Airlines)</div>
              </div>
              <div class="grid-row">
                <div class="grid-cell label">Passenger Email:</div>
                <div class="grid-cell value">${recipientEmail}</div>
              </div>
              <div class="grid-row">
                <div class="grid-cell label">Ticket Passenger Count:</div>
                <div class="grid-cell value" style="color: #0078D2; font-weight: 900;">${passengerCountStr}</div>
              </div>
              <div class="grid-row">
                <div class="grid-cell label">Departure Time:</div>
                <div class="grid-cell value">${departureTime}</div>
              </div>
              <div class="grid-row">
                <div class="grid-cell label">Arrival Time:</div>
                <div class="grid-cell value">${arrivalTime}</div>
              </div>
              <div class="grid-row">
                <div class="grid-cell label">Terminal & Gate:</div>
                <div class="grid-cell value">Terminal ${terminal}, Gate ${gate}</div>
              </div>
            </div>

            <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #cbd5e1;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 8px;">
                PASSENGER & SEAT ASSIGNMENT MANIFEST
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
                <thead>
                  <tr style="background: #f1f5f9; color: #475569; font-size: 10px; text-transform: uppercase; font-weight: 800;">
                    <th style="padding: 6px 4px;">Passenger Name</th>
                    <th style="padding: 6px 4px;">Seat</th>
                    <th style="padding: 6px 4px;">Type</th>
                    <th style="padding: 6px 4px;">Passport</th>
                  </tr>
                </thead>
                <tbody>
                  ${passengerListHtml}
                </tbody>
              </table>
            </div>
          </div>

          <div class="price-badge">
            STATUS: CONFIRMED & TICKETED • FARE PAID: $${price} (${booking.paymentMethod || "Credit Card"})
          </div>

          <div class="barcode">
            ||||| |||||||| |||| |||||||| |||||| ||||||<br>
            <span style="font-size: 10px; font-weight: normal; letter-spacing: 1px;">e-Ticket Barcode Security Hash #${pnr}</span>
          </div>
        </div>

        <div class="footer">
          American Airlines • Customer Reservation & Ticketing Service<br>
          This is an automated e-ticket dispatch to <strong>${recipientEmail}</strong>.<br>
          Have a safe and pleasant flight!
        </div>
      </div>
    </body>
    </html>
    `;

    const transporter = await getTransporter();
    const fromAddress = process.env.SMTP_FROM || '"American Airlines Ticketing" <ebulupaulboyld@gmail.com>';

    console.log(`[Email Service] Attempting to dispatch e-Ticket email to: ${recipientEmail}...`);

    const info = await transporter.sendMail({
      from: fromAddress,
      to: recipientEmail,
      subject,
      html: htmlBody,
      text: `AMERICAN AIRLINES ELECTRONIC TICKET RECEIPT\n
Dear ${passengerName},\n
Your flight ticket is confirmed.\n
Confirmation Code (PNR): ${pnr}\n
Ticket Number: ${ticketNo}\n
Flight: ${flightNo} (${origin} -> ${destination})\n
Seat: ${seat} (${cabin})\n
Departure: ${departureTime}\n
Terminal/Gate: Terminal ${terminal}, Gate ${gate}\n
Total Fare Paid: $${price}\n\n
Thank you for flying with American Airlines!`,
    });

    console.log(`[Email Service] Email dispatched successfully! Message ID: ${info.messageId}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Email Service] Ethereal Email Preview URL: ${previewUrl}`);
    }

    res.json({
      success: true,
      message: `Official e-Ticket successfully dispatched to ${recipientEmail}`,
      messageId: info.messageId,
      previewUrl: previewUrl || undefined,
      recipientEmail,
      sentAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Email Service Error] Failed to send email:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to dispatch email.",
    });
  }
});

async function startServer() {
  // Vite middleware for development mode with HMR explicitly disabled
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
