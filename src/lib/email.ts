import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "BookNParty <noreply@booknparty.com>";

function formatCurrencyEmail(amount: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDateEmail(date: Date | string) {
    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(date));
}

function baseLayout(title: string, bodyHtml: string) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #0f0f0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #e0e0e0; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #a855f7, #ec4899); padding: 32px 36px; }
    .header h1 { margin: 0; font-size: 22px; color: #fff; }
    .header p { margin: 6px 0 0; font-size: 14px; color: rgba(255,255,255,0.8); }
    .body { padding: 32px 36px; }
    .row { display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 10px 0; font-size: 14px; }
    .row .label { color: rgba(255,255,255,0.45); }
    .row .value { color: #fff; font-weight: 500; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-pending { background: rgba(250,204,21,0.15); color: #fde047; }
    .badge-confirmed { background: rgba(34,197,94,0.15); color: #4ade80; }
    .badge-cancelled { background: rgba(239,68,68,0.15); color: #f87171; }
    .btn { display: inline-block; margin-top: 24px; padding: 12px 28px; background: linear-gradient(135deg, #a855f7, #ec4899); color: #fff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; }
    .divider { height: 1px; background: rgba(255,255,255,0.07); margin: 20px 0; }
    .footer { padding: 20px 36px; font-size: 12px; color: rgba(255,255,255,0.25); text-align: center; border-top: 1px solid rgba(255,255,255,0.07); }
    .message-box { background: rgba(255,255,255,0.04); border-left: 3px solid #a855f7; border-radius: 0 8px 8px 0; padding: 14px 16px; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.7); margin: 16px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🎉 BookNParty</h1>
      <p>${title}</p>
    </div>
    <div class="body">${bodyHtml}</div>
    <div class="footer">© ${new Date().getFullYear()} BookNParty · You're receiving this because of your account activity.</div>
  </div>
</body>
</html>`;
}

// ─── Booking emails ────────────────────────────────────────────────────────

export async function sendBookingConfirmationToCustomer(params: {
    customerEmail: string;
    customerName: string;
    venueName: string;
    venueCity: string;
    eventDate: Date | string;
    hours: number;
    guestCount: number;
    totalAmount: number;
    eventType?: string | null;
    bookingId: string;
}) {
    if (!process.env.RESEND_API_KEY) return;
    const html = baseLayout("Booking Confirmed!", `
      <p style="font-size:16px;margin-top:0;">Hi ${params.customerName},</p>
      <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">Your booking request has been received. The venue owner will confirm it shortly.</p>
      <div class="divider"></div>
      <div class="row"><span class="label">Venue</span><span class="value">${params.venueName}, ${params.venueCity}</span></div>
      <div class="row"><span class="label">Event date</span><span class="value">${formatDateEmail(params.eventDate)}</span></div>
      <div class="row"><span class="label">Duration</span><span class="value">${params.hours} hour${params.hours !== 1 ? "s" : ""}</span></div>
      <div class="row"><span class="label">Guests</span><span class="value">${params.guestCount}</span></div>
      ${params.eventType ? `<div class="row"><span class="label">Event type</span><span class="value">${params.eventType}</span></div>` : ""}
      <div class="row"><span class="label">Total amount</span><span class="value">${formatCurrencyEmail(params.totalAmount)}</span></div>
      <div class="row"><span class="label">Status</span><span class="value"><span class="badge badge-pending">PENDING</span></span></div>
      <div class="divider"></div>
      <p style="font-size:13px;color:rgba(255,255,255,0.4);">We'll email you once the owner confirms your booking.</p>
    `);
    await resend.emails.send({ from: FROM, to: params.customerEmail, subject: `Booking Request Received · ${params.venueName}`, html });
}

export async function sendBookingRequestToOwner(params: {
    ownerEmail: string;
    ownerName: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string | null;
    venueName: string;
    eventDate: Date | string;
    hours: number;
    guestCount: number;
    totalAmount: number;
    eventType?: string | null;
    bookingId: string;
}) {
    if (!process.env.RESEND_API_KEY) return;
    const html = baseLayout("New Booking Request", `
      <p style="font-size:16px;margin-top:0;">Hi ${params.ownerName},</p>
      <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">You have a new booking request for <strong style="color:#fff;">${params.venueName}</strong>. Please confirm or cancel it from your dashboard.</p>
      <div class="divider"></div>
      <div class="row"><span class="label">Customer</span><span class="value">${params.customerName}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">${params.customerEmail}</span></div>
      ${params.customerPhone ? `<div class="row"><span class="label">Phone</span><span class="value">${params.customerPhone}</span></div>` : ""}
      <div class="row"><span class="label">Event date</span><span class="value">${formatDateEmail(params.eventDate)}</span></div>
      <div class="row"><span class="label">Duration</span><span class="value">${params.hours} hour${params.hours !== 1 ? "s" : ""}</span></div>
      <div class="row"><span class="label">Guests</span><span class="value">${params.guestCount}</span></div>
      ${params.eventType ? `<div class="row"><span class="label">Event type</span><span class="value">${params.eventType}</span></div>` : ""}
      <div class="row"><span class="label">Amount</span><span class="value">${formatCurrencyEmail(params.totalAmount)}</span></div>
      <a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/dashboard/owner/bookings" class="btn">Manage Bookings →</a>
    `);
    await resend.emails.send({ from: FROM, to: params.ownerEmail, subject: `New Booking Request · ${params.venueName}`, html });
}

export async function sendBookingStatusUpdateToCustomer(params: {
    customerEmail: string;
    customerName: string;
    venueName: string;
    eventDate: Date | string;
    totalAmount: number;
    newStatus: "CONFIRMED" | "CANCELLED" | "COMPLETED";
}) {
    if (!process.env.RESEND_API_KEY) return;
    const messages: Record<string, { subject: string; headline: string; blurb: string; badgeClass: string }> = {
        CONFIRMED: {
            subject: `Booking Confirmed 🎉 · ${params.venueName}`,
            headline: "Your booking is confirmed!",
            blurb: "Great news! The venue owner has confirmed your booking. See you there!",
            badgeClass: "badge-confirmed",
        },
        CANCELLED: {
            subject: `Booking Cancelled · ${params.venueName}`,
            headline: "Booking has been cancelled",
            blurb: "Unfortunately your booking was cancelled. Browse other venues on BookNParty.",
            badgeClass: "badge-cancelled",
        },
        COMPLETED: {
            subject: `Booking Completed · ${params.venueName}`,
            headline: "Hope you had a great event!",
            blurb: "Your event is marked complete. We'd love to hear how it went — leave a review!",
            badgeClass: "badge-confirmed",
        },
    };
    const meta = messages[params.newStatus];
    const html = baseLayout(meta.headline, `
      <p style="font-size:16px;margin-top:0;">Hi ${params.customerName},</p>
      <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">${meta.blurb}</p>
      <div class="divider"></div>
      <div class="row"><span class="label">Venue</span><span class="value">${params.venueName}</span></div>
      <div class="row"><span class="label">Event date</span><span class="value">${formatDateEmail(params.eventDate)}</span></div>
      <div class="row"><span class="label">Amount</span><span class="value">${formatCurrencyEmail(params.totalAmount)}</span></div>
      <div class="row"><span class="label">Status</span><span class="value"><span class="badge ${meta.badgeClass}">${params.newStatus}</span></span></div>
      <a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/dashboard/customer/bookings" class="btn">View My Bookings →</a>
    `);
    await resend.emails.send({ from: FROM, to: params.customerEmail, subject: meta.subject, html });
}

// ─── Enquiry emails ────────────────────────────────────────────────────────

export async function sendEnquiryNotificationToOwner(params: {
    ownerEmail: string;
    ownerName: string;
    venueName: string;
    senderName: string;
    senderEmail: string;
    senderPhone: string;
    message: string;
    eventType?: string | null;
    eventDate?: Date | string | null;
    guestCount?: number | null;
}) {
    if (!process.env.RESEND_API_KEY) return;
    const html = baseLayout("New Enquiry Received", `
      <p style="font-size:16px;margin-top:0;">Hi ${params.ownerName},</p>
      <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">You have a new enquiry for <strong style="color:#fff;">${params.venueName}</strong>.</p>
      <div class="divider"></div>
      <div class="row"><span class="label">From</span><span class="value">${params.senderName}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">${params.senderEmail}</span></div>
      <div class="row"><span class="label">Phone</span><span class="value">${params.senderPhone}</span></div>
      ${params.eventType ? `<div class="row"><span class="label">Event type</span><span class="value">${params.eventType}</span></div>` : ""}
      ${params.eventDate ? `<div class="row"><span class="label">Preferred date</span><span class="value">${formatDateEmail(params.eventDate)}</span></div>` : ""}
      ${params.guestCount ? `<div class="row"><span class="label">Guests</span><span class="value">${params.guestCount}</span></div>` : ""}
      <p style="color:rgba(255,255,255,0.4);font-size:12px;margin-bottom:6px;">Message</p>
      <div class="message-box">${params.message}</div>
      <a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/dashboard/owner/enquiries" class="btn">Reply to Enquiry →</a>
    `);
    await resend.emails.send({ from: FROM, to: params.ownerEmail, subject: `New Enquiry · ${params.venueName}`, html });
}

export async function sendEnquiryResponseToCustomer(params: {
    customerEmail: string;
    customerName: string;
    venueName: string;
    ownerName: string;
    ownerResponse: string;
}) {
    if (!process.env.RESEND_API_KEY) return;
    const html = baseLayout(`Response from ${params.venueName}`, `
      <p style="font-size:16px;margin-top:0;">Hi ${params.customerName},</p>
      <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;"><strong style="color:#fff;">${params.ownerName}</strong> has responded to your enquiry about <strong style="color:#fff;">${params.venueName}</strong>.</p>
      <p style="color:rgba(255,255,255,0.4);font-size:12px;margin-bottom:6px;">Their response</p>
      <div class="message-box">${params.ownerResponse}</div>
      <a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/dashboard/customer/enquiries" class="btn">View My Enquiries →</a>
    `);
    await resend.emails.send({ from: FROM, to: params.customerEmail, subject: `Enquiry Response · ${params.venueName}`, html });
}

// ─── Venue approval emails ─────────────────────────────────────────────────

export async function sendVenueApprovedToOwner(params: {
    ownerEmail: string;
    ownerName: string;
    venueName: string;
    venueSlug: string;
}) {
    if (!process.env.RESEND_API_KEY) return;
    const venueUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/venues/${params.venueSlug}`;
    const html = baseLayout("Venue Approved! 🎉", `
      <p style="font-size:16px;margin-top:0;">Hi ${params.ownerName},</p>
      <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">Great news! Your venue <strong style="color:#fff;">${params.venueName}</strong> has been reviewed and approved. It's now live on BookNParty and customers can book it.</p>
      <a href="${venueUrl}" class="btn">View Live Venue →</a>
    `);
    await resend.emails.send({ from: FROM, to: params.ownerEmail, subject: `Venue Approved · ${params.venueName}`, html });
}

export async function sendVenueRejectedToOwner(params: {
    ownerEmail: string;
    ownerName: string;
    venueName: string;
}) {
    if (!process.env.RESEND_API_KEY) return;
    const html = baseLayout("Venue Review Update", `
      <p style="font-size:16px;margin-top:0;">Hi ${params.ownerName},</p>
      <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">Your venue <strong style="color:#fff;">${params.venueName}</strong> was not approved at this time. Please review your listing for completeness and accuracy, then resubmit.</p>
      <a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/dashboard/owner/venues" class="btn">Review My Venues →</a>
    `);
    await resend.emails.send({ from: FROM, to: params.ownerEmail, subject: `Venue Not Approved · ${params.venueName}`, html });
}

// ─── Welcome email ─────────────────────────────────────────────────────────

export async function sendWelcomeEmail(params: {
    userEmail: string;
    userName: string;
    role: "CUSTOMER" | "OWNER";
}) {
    if (!process.env.RESEND_API_KEY) return;
    const isOwner = params.role === "OWNER";
    const dashboardUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/${isOwner ? "dashboard/owner" : "venues"}`;
    const html = baseLayout("Welcome to BookNParty! 🎉", `
      <p style="font-size:16px;margin-top:0;">Hi ${params.userName},</p>
      <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">
        Welcome to <strong style="color:#fff;">BookNParty</strong>! Your account has been created.
        ${isOwner
            ? "You can now list your venues, manage bookings and respond to enquiries — all from your owner dashboard."
            : "Browse and book from thousands of venues across India — from banquet halls to farmhouses."}
      </p>
      <a href="${dashboardUrl}" class="btn">${isOwner ? "Go to Owner Dashboard →" : "Explore Venues →"}</a>
    `);
    await resend.emails.send({ from: FROM, to: params.userEmail, subject: "Welcome to BookNParty! 🎉", html });
}
