# BookNParty - Phase 4 Roadmap

## Overview

Phase 4 focuses on completing the BookNParty platform with payment integration, notifications, and enhanced user experience features. This phase transforms the platform from "production-ready (minus payments)" to "fully production-ready with all critical features."

**Target Start**: After Phase 3 verification  
**Estimated Duration**: 3-4 weeks  
**Priority**: High (required for real transactions)

---

## Phase 4 Goals

1. **Enable Real Transactions**: Integrate payment gateway for actual bookings
2. **Improve Communication**: Add email/SMS notifications
3. **Enhance UX**: Add profile management, calendar view, advanced features
4. **Optimize Performance**: Improve loading times and responsiveness
5. **Prepare for Scale**: Add monitoring, error tracking, analytics

---

## 🔴 Priority 1: Payment Integration (CRITICAL)

### Feature: Razorpay Payment Gateway

**Status**: Not Started  
**Estimated Effort**: 2-3 hours  
**Priority**: P0 (Highest)

**Description:**  
Integrate Razorpay for secure online payments. Booking flow changes from direct submission to payment-first workflow.

**Requirements:**

1. **Setup**:
   - Create Razorpay account (test mode free)
   - Add credentials to `.env.local`
   - Install SDK: `npm install razorpay`

2. **Backend Changes**:
   - Create `/api/payments/create-order` (POST)
     - Input: `{ amount, currency }`
     - Output: `{ orderId, amount, currency }`
   - Create `/api/payments/verify` (POST)
     - Input: `{ orderId, paymentId, signature }`
     - Verify signature with HMAC
     - Update booking status to CONFIRMED
     - Store `paymentId` in database

3. **Frontend Changes**:
   - Modify [`src/app/venues/[slug]/book/page.tsx`](../src/app/venues/[slug]/book/page.tsx)
   - Load Razorpay script via `<Script>` tag
   - On form submit:
     1. Call `/api/payments/create-order`
     2. Open Razorpay checkout popup
     3. On success, call `/api/payments/verify`
     4. Redirect to dashboard with success message

4. **Testing**:
   - Test mode card: `4111 1111 1111 1111`
   - Verify booking status changes to CONFIRMED
   - Verify `paymentId` stored correctly

**Files to Create:**

- `src/app/api/payments/create-order/route.ts`
- `src/app/api/payments/verify/route.ts`

**Files to Modify:**

- `src/app/venues/[slug]/book/page.tsx`

**Environment Variables:**

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

**Acceptance Criteria:**

- ✅ Customer can pay for booking via Razorpay
- ✅ Payment success triggers CONFIRMED status
- ✅ Payment failure shows error message
- ✅ Booking records payment ID
- ✅ Test mode works with test card

---

## 🟠 Priority 2: Notifications System

### Feature: Email Notifications

**Status**: Not Started  
**Estimated Effort**: 4-5 hours  
**Priority**: P1 (High)

**Description:**  
Send automated emails for key events (booking confirmations, enquiry responses, venue approvals).

**Email Service Options:**

1. **Resend** (recommended) - Modern, Next.js-friendly
2. **SendGrid** - Established, free tier available
3. **AWS SES** - Cost-effective for scale
4. **Nodemailer + Gmail** - Quick setup for testing

**Email Templates Needed:**

1. **Booking Confirmation** (to customer)
   - Booking details, venue info, event date
   - Payment receipt
   - Contact information

2. **Booking Request** (to owner)
   - Customer details, booking request
   - Confirm/Cancel action links

3. **Enquiry Submission** (to owner)
   - Customer message, contact info
   - Reply button/link

4. **Enquiry Response** (to customer)
   - Owner's response
   - Booking suggestion link

5. **Venue Approval** (to owner)
   - Approval/rejection notification
   - Feedback (if rejected)

6. **Welcome Email** (on registration)
   - Account confirmation
   - Getting started guide

**Implementation Steps:**

1. Install email service SDK
2. Create `/lib/email.ts` utility
3. Create email templates (React Email or HTML)
4. Add email sending to API routes:
   - After booking creation
   - After payment verification
   - After enquiry submission/response
   - After venue approval/rejection
5. Add email preferences to user profile

**Files to Create:**

- `src/lib/email.ts` - Email utility functions
- `src/emails/*.tsx` - Email templates (if using React Email)

**Files to Modify:**

- `src/app/api/bookings/route.ts` - Send booking emails
- `src/app/api/enquiries/route.ts` - Send enquiry emails
- `src/app/api/venues/[id]/route.ts` - Send approval emails

**Environment Variables:**

```env
EMAIL_SERVICE_API_KEY=xxxxxxxxxxxx
EMAIL_FROM=noreply@booknparty.com
EMAIL_FROM_NAME=BookNParty
```

**Acceptance Criteria:**

- ✅ Customers receive booking confirmation emails
- ✅ Owners receive booking notification emails
- ✅ Enquiry responses trigger emails
- ✅ Venue approval/rejection sends emails
- ✅ Email unsubscribe option available

---

## 🟡 Priority 3: Profile Management

### Feature: User Profile Pages

**Status**: Not Started  
**Estimated Effort**: 3-4 hours  
**Priority**: P2 (Medium)

**Description:**  
Allow users to manage their profiles, change passwords, update contact information, and upload avatars.

**Pages to Create:**

1. `/dashboard/customer/profile` - Customer profile
2. `/dashboard/owner/profile` - Owner profile
3. `/dashboard/admin/profile` - Admin profile

**Features:**

- Update name, phone, email
- Change password (with current password verification)
- Upload avatar (Cloudinary integration)
- View account statistics
- Delete account (with confirmation)

**API Endpoints:**

- `GET /api/user/profile` - Get current user profile
- `PATCH /api/user/profile` - Update profile
- `POST /api/user/change-password` - Change password
- `POST /api/user/upload-avatar` - Upload avatar

**Files to Create:**

- `src/app/dashboard/customer/profile/page.tsx`
- `src/app/dashboard/owner/profile/page.tsx`
- `src/app/dashboard/admin/profile/page.tsx`
- `src/app/api/user/profile/route.ts`
- `src/app/api/user/change-password/route.ts`
- `src/components/ProfileForm.tsx`
- `src/components/ChangePasswordForm.tsx`
- `src/components/AvatarUpload.tsx`

**Acceptance Criteria:**

- ✅ Users can update their information
- ✅ Password change requires current password
- ✅ Avatar upload works via Cloudinary
- ✅ Email change sends verification (if implemented)
- ✅ Account deletion works with confirmation

---

## 🟡 Priority 3: Calendar & Availability

### Feature: Venue Availability Calendar

**Status**: Not Started  
**Estimated Effort**: 6-8 hours  
**Priority**: P2 (Medium)

**Description:**  
Add calendar view for venue availability, preventing double-bookings and showing owners their booking schedule.

**Features:**

- Monthly/weekly calendar view
- Show existing bookings on calendar
- Block out unavailable dates (owners)
- Check availability before booking (customers)
- Conflict detection

**Components:**

- Use `react-big-calendar` or `@fullcalendar/react`
- Month view with booking indicators
- Day/time slot selection

**API Endpoints:**

- `GET /api/venues/[id]/availability?month=2026-08` - Get availability
- `POST /api/venues/[id]/block-dates` - Owner blocks dates

**Database Changes:**

```prisma
model VenueBlockedDate {
  id        String   @id @default(cuid())
  venueId   String
  date      DateTime
  reason    String?
  venue     Venue    @relation(fields: [venueId], references: [id])
  createdAt DateTime @default(now())
}
```

**Files to Create:**

- `src/components/AvailabilityCalendar.tsx`
- `src/app/api/venues/[id]/availability/route.ts`
- `src/app/api/venues/[id]/block-dates/route.ts`

**Acceptance Criteria:**

- ✅ Calendar shows booked dates
- ✅ Double-booking prevention
- ✅ Owners can block dates
- ✅ Customers see real-time availability
- ✅ Date selection is intuitive

---

## 🟢 Priority 4: Admin Enhancements

### Features: Admin Dashboard Improvements

**Status**: Partially Complete  
**Estimated Effort**: 3-4 hours  
**Priority**: P3 (Low-Medium)

**Missing Pages:**

1. `/dashboard/admin/bookings` - All bookings view
2. `/dashboard/admin/enquiries` - All enquiries view
3. `/dashboard/admin/settings` - Platform settings

**Features:**

- Advanced filtering and search
- Export data as CSV
- Bulk actions
- Platform statistics
- Revenue reports

**Files to Create:**

- `src/app/dashboard/admin/bookings/page.tsx`
- `src/app/dashboard/admin/enquiries/page.tsx`
- `src/app/dashboard/admin/settings/page.tsx`

**Acceptance Criteria:**

- ✅ Admin can view all bookings with filters
- ✅ Admin can view all enquiries
- ✅ Admin can configure platform settings
- ✅ Export functionality works
- ✅ Bulk actions available

---

## 🟢 Priority 4: Additional Features

### Feature: Password Recovery

**Status**: Not Started  
**Estimated Effort**: 2-3 hours  
**Priority**: P3 (Low-Medium)

**Implementation:**

- "Forgot Password" link on login page
- Send password reset email with token
- Reset password page with token validation
- Token expiration (1 hour)

**Database Changes:**

```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}
```

---

### Feature: Invoice Generation

**Status**: Not Started  
**Estimated Effort**: 3-4 hours  
**Priority**: P3 (Low-Medium)

**Implementation:**

- Generate PDF invoices for bookings
- Use `jspdf` or `react-pdf`
- Include booking details, pricing breakdown, GST
- Email invoice with booking confirmation
- Download invoice from dashboard

---

### Feature: Booking Modifications

**Status**: Not Started  
**Estimated Effort**: 4-5 hours  
**Priority**: P3 (Low-Medium)

**Implementation:**

- Allow customers to request reschedule
- Owner approves/rejects modification
- Handle date conflicts
- Refund calculation if price changes

---

### Feature: Analytics Dashboard

**Status**: Basic stats only  
**Estimated Effort**: 6-8 hours  
**Priority**: P3 (Low-Medium)

**Features:**

- Revenue charts (line, bar)
- Booking trends over time
- Top venues by bookings/revenue
- Customer demographics
- Conversion funnel

**Libraries:**

- Chart.js or Recharts
- Date range selector
- Export charts as images

---

## 🔵 Priority 5: Performance & Quality

### Performance Optimizations

**Estimated Effort**: 2-3 hours  
**Priority**: P4 (Nice to have)

**Tasks:**

- Add React Query for data caching
- Implement ISR for venue pages
- Optimize images (WebP, lazy loading)
- Bundle analysis and code splitting
- Database query optimization

---

### Testing Setup

**Estimated Effort**: 6-8 hours  
**Priority**: P4 (Nice to have)

**Implementation:**

- Unit tests (Jest + React Testing Library)
- Integration tests for API routes
- E2E tests (Playwright)
- Test coverage reporting

---

### Error Tracking & Monitoring

**Estimated Effort**: 2-3 hours  
**Priority**: P4 (Nice to have)

**Tools:**

- Sentry for error tracking
- Vercel Analytics for performance
- PostHog for user analytics

---

## Phase 4 Sprint Plan

### Sprint 1 (Week 1): Payment & Notifications

- **Days 1-2**: Razorpay integration
- **Days 3-5**: Email notification system

### Sprint 2 (Week 2): Profile & Calendar

- **Days 1-2**: Profile management
- **Days 3-5**: Calendar availability

### Sprint 3 (Week 3): Admin & Features

- **Days 1-2**: Admin dashboard pages
- **Days 3-5**: Password recovery, invoice generation

### Sprint 4 (Week 4): Polish & Testing

- **Days 1-2**: Bug fixes, refinements
- **Days 3-4**: Testing and verification
- **Day 5**: Documentation and handoff

---

## Success Criteria

Phase 4 is complete when:

- ✅ Payment integration works end-to-end
- ✅ Email notifications sent for key events
- ✅ Profile management functional
- ✅ Calendar shows availability
- ✅ Admin dashboard complete
- ✅ All critical bugs fixed
- ✅ Documentation updated
- ✅ Build passes without errors
- ✅ Manual testing checklist passed

---

## Dependencies

**External Services:**

- Razorpay account (free test mode)
- Email service account (Resend/SendGrid)
- Cloudinary (already configured)

**Technical:**

- No database migrations required (except calendar feature)
- Compatible with current Next.js/Prisma versions

---

**Last Updated**: August 2026  
**Status**: Planning Phase  
**Start Date**: After Phase 3 verification
