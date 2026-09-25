# BookNParty - Phase 6 Roadmap

## Overview

Phase 6 is the production-scale and payment phase. Phase 4 is complete (see [PHASE_4_ROADMAP.md](PHASE_4_ROADMAP.md)) and Phase 5 (see [PHASE_5_ROADMAP.md](PHASE_5_ROADMAP.md)) covers admin-managed content — Static Pages, Blog, and Contact form. Phase 6 focuses on payments and remaining production hardening.

**Current Status**: Not started  
**Target Start**: After Phase 5 (Content Management) completion  
**Estimated Duration**: 2-3 weeks  
**Priority**: Critical (required for real transactions)

> **Note**: Several items originally scoped in this phase — booking modification requests, invoice generation, and a testing/monitoring baseline — were delivered early as part of Phase 4. The sections below have been updated to reflect what remains.

---

## Phase 6 Goals

1. **Enable Real Transactions**: Integrate Razorpay payment gateway
2. **Prepare for Scale**: Add monitoring, error tracking, analytics
3. **Optimize Performance**: Improve loading times and responsiveness
4. **Advanced Features**: Advanced analytics, expanded testing
5. **Production Readiness**: Security hardening, final testing

---

## 🔴 Priority 1: Payment Integration (CRITICAL)

### Feature: Razorpay Payment Gateway

**Status**: Not Started  
**Estimated Effort**: 2-3 hours  
**Priority**: P0 (Highest)  
**Blocker**: Requires Razorpay account setup

**Description:**  
Integrate Razorpay for secure online payments. Booking flow changes from manual confirmation to payment-first workflow with automatic confirmation.

### Current vs Future Flow

**Current (Phase 4)**:

```
Customer submits booking → Status: PENDING → Owner confirms manually → CONFIRMED
```

**Future (Phase 6)**:

```
Customer pays via Razorpay → Status: CONFIRMED (automatic) → Owner manages
```

### Requirements

#### 1. Setup & Prerequisites

- Create Razorpay account at https://razorpay.com/
- Start with test mode (free)
- Get test credentials from dashboard
- Install SDK: `npm install razorpay`

**Environment Variables:**

```env
# Razorpay Credentials (Test Mode)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx

# For Production (later)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
```

#### 2. Backend Implementation

**Create Order Endpoint:**

File: `src/app/api/payments/create-order/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@/lib/auth";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, currency = "INR", bookingId } = await req.json();

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: `booking_${bookingId}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Payment order creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 },
    );
  }
}
```

**Verify Payment Endpoint:**

File: `src/app/api/payments/verify/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, paymentId, signature, bookingId } = await req.json();

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (generatedSignature !== signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 },
      );
    }

    // Update booking with payment info
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        paymentId: paymentId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Payment verification failed:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 },
    );
  }
}
```

#### 3. Frontend Integration

**Modify Booking Page:**

File: `src/app/venues/[slug]/book/page.tsx`

Changes needed:

1. Load Razorpay script in page head
2. Create booking first (status: PENDING)
3. Create Razorpay order
4. Open Razorpay checkout
5. On success, verify payment
6. Update booking to CONFIRMED

**Example Integration:**

```typescript
"use client";

import Script from "next/script";
import { useState } from "react";

export default function BookingPage() {
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const handlePayment = async (bookingData) => {
    // Step 1: Create booking
    const bookingRes = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    });
    const booking = await bookingRes.json();

    // Step 2: Create payment order
    const orderRes = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: booking.totalAmount,
        bookingId: booking.id,
      }),
    });
    const order = await orderRes.json();

    // Step 3: Open Razorpay checkout
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: "BookNParty",
      description: `Booking for ${booking.venue.name}`,
      handler: async (response) => {
        // Step 4: Verify payment
        await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            bookingId: booking.id,
          }),
        });

        // Redirect to success page
        router.push("/dashboard/customer/bookings?success=true");
      },
      prefill: {
        name: session.user.name,
        email: session.user.email,
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
      />
      {/* Booking form */}
    </>
  );
}
```

#### 4. Testing

**Test Cards:**

- Success: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date
- OTP: `000000`

**Test Scenarios:**

- [ ] Successful payment
- [ ] Payment failure
- [ ] User cancels payment
- [ ] Network error during payment
- [ ] Signature verification failure
- [ ] Booking status updates correctly
- [ ] Payment ID stored in database

### Files to Create

- `src/app/api/payments/create-order/route.ts`
- `src/app/api/payments/verify/route.ts`

### Files to Modify

- `src/app/venues/[slug]/book/page.tsx`
- `src/app/api/bookings/route.ts` (optional status handling)

### Acceptance Criteria

- ✅ Razorpay checkout opens on booking submission
- ✅ Payment success triggers CONFIRMED status
- ✅ Payment failure shows error message
- ✅ Booking records payment ID
- ✅ Test mode works with test cards
- ✅ Email sent after successful payment
- ✅ Invoice generated with payment details

---

## 🟠 Priority 2: Production Readiness

### Feature: Error Tracking & Monitoring

**Status**: Scaffolded in Phase 4 — activation pending  
**Estimated Effort**: 1-2 hours (remaining)  
**Priority**: P1 (High)

`@sentry/nextjs` is already installed and wired via native Next.js instrumentation file conventions rather than the `withSentryConfig` wizard flow (this repo's Next.js docs recommend file conventions over config wrapping):

- `src/instrumentation.ts` — server `register()` (Sentry.init) + `onRequestError` (Sentry.captureRequestError)
- `src/instrumentation-client.ts` — client Sentry.init + navigation breadcrumbs
- `src/app/global-error.tsx` — root error boundary reporting to Sentry

Everything currently no-ops because `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` are unset.

**Remaining work:**

1. Create a Sentry project, obtain a DSN
2. Set `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` in the environment
3. Configure alert rules in the Sentry dashboard
4. (Optional) Add **Vercel Analytics** or **PostHog** for performance/product analytics

**Acceptance Criteria:**

- ✅ Instrumentation code in place (done)
- ⏳ Errors logged to Sentry (needs real DSN)
- ⏳ Alerts configured

---

### Feature: Security Hardening

**Status**: Partially Complete  
**Estimated Effort**: 2-3 hours  
**Priority**: P1 (High)

**Security Checklist:**

- [ ] Enable HTTPS only (production)
- [ ] Add rate limiting to API routes
- [ ] Implement CSRF protection
- [ ] Add input sanitization
- [ ] Enable Content Security Policy
- [ ] Add API request logging
- [ ] Implement brute force protection on login
- [ ] Add payment webhook signature verification
- [ ] Secure environment variables
- [ ] Add database query timeouts

**Libraries:**

```bash
npm install express-rate-limit helmet
```

---

## 🟡 Priority 3: Performance Optimizations

### Feature: Caching & Data Fetching

**Status**: Not Started  
**Estimated Effort**: 3-4 hours  
**Priority**: P2 (Medium)

**Optimizations:**

1. **React Query / SWR** - Client-side caching
2. **ISR (Incremental Static Regeneration)** - For venue pages
3. **Edge Caching** - For API responses
4. **Database Query Optimization** - Add indexes
5. **Image Optimization** - WebP format, lazy loading
6. **Code Splitting** - Dynamic imports

**Database Indexes:**

```prisma
model Venue {
  @@index([city, type, isApproved])
  @@index([slug])
  @@index([ownerId])
}

model Booking {
  @@index([customerId, status])
  @@index([venueId, eventDate])
}
```

**Acceptance Criteria:**

- ✅ Venue list page loads < 1 second
- ✅ API responses cached appropriately
- ✅ Images optimized and lazy-loaded
- ✅ Lighthouse score > 90

---

## 🟡 Priority 3: Advanced Features

### Feature: Booking Modifications

**Status**: ✅ Delivered in Phase 4  
**Priority**: P2 (Medium)

Implemented as the `BookingModificationRequest` Prisma model with customer request and owner/admin approval APIs (`src/app/api/bookings/[id]/modify-requests/`). See [PHASE_4_ROADMAP.md](PHASE_4_ROADMAP.md) for details.

**Remaining for Phase 6 (optional):** trigger a Razorpay refund/additional-payment flow when an approved modification changes the total amount.

---

### Feature: Advanced Analytics Dashboard

**Status**: Basic stats only  
**Estimated Effort**: 6-8 hours  
**Priority**: P2 (Medium)

**Features:**

- Revenue charts (daily, weekly, monthly)
- Booking trends over time
- Conversion rate tracking
- Top venues by revenue
- Customer lifetime value
- Booking cancellation rates
- Peak booking times

**Libraries:**

```bash
npm install recharts date-fns
```

---

### Feature: Automated Invoice Generation

**Status**: ✅ Delivered in Phase 4 (print-based)  
**Priority**: P3 (Low-Medium)

A printable invoice page is implemented at `/dashboard/customer/bookings/[id]/invoice` using `print:` Tailwind variants and an `InvoicePrintButton`.

**Remaining for Phase 6 (optional):** add payment method/ID once Razorpay is integrated; consider a server-generated PDF (`@react-pdf/renderer`) if print-to-PDF isn't sufficient.

---

## 🟢 Priority 4: Testing & Quality

### Feature: Automated Testing

**Status**: Baseline delivered in Phase 4 — expansion pending  
**Estimated Effort**: 6-8 hours (remaining)  
**Priority**: P3 (Nice to have)

Vitest is installed and configured (`vitest.config.ts`, `npm run test`) with sample unit tests for `src/lib/utils.ts`.

**Remaining work:**

1. **Integration Tests** - API route testing (e.g. bookings, modify-requests, bulk-update)
2. **E2E Tests** - Playwright for critical flows (auth, booking creation, admin approval)
3. **Visual Regression** - Percy or Chromatic (optional)

**Critical Tests to add:**

- Authentication flows
- Booking creation and payment
- Admin venue approval
- Email notification triggers
- Payment webhook handling

---

## Phase 6 Sprint Plan

### Sprint 1 (Week 1): Payment Integration

- **Day 1**: Razorpay account setup and credentials
- **Day 2**: Backend payment endpoints
- **Day 3**: Frontend Razorpay integration
- **Day 4**: Testing and error handling
- **Day 5**: Invoice generation

### Sprint 2 (Week 2): Production Readiness

- **Days 1-2**: Error tracking and monitoring
- **Days 3-4**: Security hardening
- **Day 5**: Performance optimizations

### Sprint 3 (Week 3): Advanced Features & Testing

- **Days 1-2**: Advanced analytics (optional)
- **Days 3-4**: Expanded automated testing (integration/E2E)
- **Day 5**: Final testing and documentation

---

## Success Criteria

Phase 6 is complete when:

- ✅ Payment integration works end-to-end (test mode)
- ✅ Error tracking configured and working
- ✅ Security audit passed
- ✅ Performance benchmarks met
- ✅ Invoice generation functional
- ✅ All critical bugs fixed
- ✅ Production deployment successful
- ✅ Payment flow tested with real users
- ✅ Documentation updated
- ✅ Build passes without errors

---

## Migration from Phase 4 / Phase 5

**No Breaking Changes:**

- Current manual booking flow remains functional
- Payment integration is additive
- Existing bookings unaffected
- Database schema already supports payment (optional field)

**Migration Steps:**

1. Add Razorpay credentials to environment
2. Deploy payment endpoints
3. Update booking page with payment option
4. Test thoroughly in test mode
5. Enable payment gateway in production
6. Monitor first 50 transactions closely

---

## Dependencies

**External Services (Required):**

- ✅ Razorpay account (test + production credentials)
- Email service (already configured in Phase 4)
- Cloudinary (already configured)
- Sentry account (optional but recommended)

**Technical:**

- No database migrations required
- Compatible with current Next.js/Prisma versions
- Requires Node.js 18+ for crypto APIs

---

## Risk Mitigation

**Payment Integration Risks:**

1. **Signature Verification Failure**
   - Mitigation: Extensive testing, logging
   - Fallback: Manual verification process

2. **Payment Gateway Downtime**
   - Mitigation: Show clear error messages
   - Fallback: Allow manual booking requests

3. **Webhook Delivery Failures**
   - Mitigation: Implement retry logic
   - Fallback: Polling mechanism

4. **Refund Processing**
   - Mitigation: Clear refund policy
   - Fallback: Manual refund via Razorpay dashboard

---

## Post-Phase 6 Roadmap

**Future Enhancements:**

- Multi-currency support
- Subscription plans for venue owners
- Mobile apps (React Native)
- WhatsApp integration
- AI-powered recommendations
- Dynamic pricing
- Multi-language support
- Venue comparison tool

---

**Last Updated**: September 25, 2026  
**Status**: Planning Phase  
**Prerequisites**: Phase 4 and Phase 5 completion, Razorpay account  
**Target Launch**: After 2-3 weeks of development and testing
