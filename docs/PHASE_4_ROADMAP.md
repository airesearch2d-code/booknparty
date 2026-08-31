# BookNParty - Phase 4 Roadmap

## Overview

Phase 4 was expected to expand the product with notifications, profile management, availability tooling, and deeper admin management. In the current codebase, the team has already shipped the notification and profile work, while the calendar and a few production-hardening items remain open.

**Current status (August 31, 2026):**

- ✅ Email notifications are live via Resend and triggered from booking, enquiry, venue approval, and welcome flows.
- ✅ Profile, password-change, and role-based account management pages are implemented.
- ✅ Admin settings UI exists for moderation toggles and communication defaults.
- ⏳ Availability calendar and conflict prevention remain pending.
- ⏳ Payment integration is deferred to Phase 5.

**Target state**: Complete the remaining UX and operational items before the payment and production scale phase.

---

## Phase 4 Status Summary

### Already implemented

1. **Notifications system**
   - Resend-based email utility in `src/lib/email.ts`
   - Booking confirmation emails and owner request alerts
   - Enquiry response emails and venue approval emails
   - Welcome email on registration

2. **Profile management**
   - `/dashboard/customer/profile`
   - `/dashboard/owner/profile`
   - `/dashboard/admin/profile`
   - `GET/PATCH /api/user/profile`
   - `POST /api/user/change-password`
   - `ProfileForm` and `ChangePasswordForm`

3. **Admin enhancements**
   - `/dashboard/admin/settings`
   - `PlatformSettingsForm`
   - Platform summary cards and moderation settings access

### Still pending

- Venue availability calendar and block-date logic
- Calendar conflict detection and date availability checks
- Password recovery via reset emails and secure tokens
- Invoices and booking modification workflows
- Performance and QA polish for the remaining Phase 4 surface area

---

## 🔴 Priority 1: Notifications System

### Feature: Email Notifications

**Status**: Complete in current codebase  
**Priority**: P0 (Done)

**Implemented files:**

- `src/lib/email.ts`
- `src/app/api/register/route.ts`
- `src/app/api/bookings/route.ts`
- `src/app/api/bookings/[id]/route.ts`
- `src/app/api/enquiries/route.ts`
- `src/app/api/enquiries/[id]/route.ts`
- `src/app/api/venues/[id]/route.ts`

**Live flows:**

- Booking request confirmation to customer
- Booking request notice to owner
- Booking status emails to customer
- Enquiry notification to owner
- Enquiry response to customer
- Venue approval/rejection to owner
- Welcome email on registration

**Remaining work:**

- Add unsubscribe or email preferences controls
- Add richer template customization for brand settings

---

## 🟡 Priority 2: Profile Management

### Feature: User Profile Pages

**Status**: Complete in current codebase  
**Priority**: P1 (Done)

**Implemented pages:**

- `/dashboard/customer/profile`
- `/dashboard/owner/profile`
- `/dashboard/admin/profile`

**Implemented API:**

- `GET /api/user/profile`
- `PATCH /api/user/profile`
- `POST /api/user/change-password`

**Implemented components:**

- `src/components/ProfileForm.tsx`
- `src/components/ChangePasswordForm.tsx`

**Remaining work:**

- Real avatar upload integration with Cloudinary or an upload widget
- Account deletion confirmation flow
- Email verification workflow for changed addresses

---

## 🟡 Priority 3: Calendar & Availability

### Feature: Venue Availability Calendar

**Status**: Not Started  
**Estimated Effort**: 6-8 hours  
**Priority**: P2 (Medium)

**Pending tasks:**

- Monthly/weekly availability calendar
- Show existing bookings and block dates
- Prevent double-booking before confirm
- Expose availability to customers on booking pages

**Planned files:**

- `src/components/AvailabilityCalendar.tsx`
- `src/app/api/venues/[id]/availability/route.ts`
- `src/app/api/venues/[id]/block-dates/route.ts`

**Acceptance criteria:**

- Calendar shows booked dates
- Owners can block dates
- Customer booking flow checks real availability
- Double-booking prevention is enforced

---

## 🟢 Priority 4: Admin Enhancements

### Features: Admin Dashboard Improvements

**Status**: Partially complete  
**Estimated Effort**: 3-4 hours  
**Priority**: P3 (Medium)

**Completed in code:**

- `src/app/dashboard/admin/settings/page.tsx`
- `src/components/PlatformSettingsForm.tsx`
- Summary cards for moderation overview

**Still pending:**

- Full export and bulk actions for bookings/enquiries
- Advanced filtering and reporting views
- Analytics and revenue reporting polish

---

## 🔵 Priority 5: Additional Features

### Password Recovery

**Status**: Not Started  
**Priority**: P3

### Invoice Generation

**Status**: Not Started  
**Priority**: P3

### Booking Modifications

**Status**: Not Started  
**Priority**: P3

### Analytics Dashboard

**Status**: Basic analytics exist; richer reporting remains pending  
**Priority**: P3

### Performance & QA

**Status**: Not Started  
**Priority**: P4

---

## Phase 4 Completion Checklist

Phase 4 is considered complete only when all of the following are true:

- ✅ All email notification flows are fully validated
- ✅ Profile management works across all roles
- ✅ Availability calendar and conflict detection are implemented
- ✅ Admin tools are complete enough for operational use
- ✅ Security and reset flows are in place
- ✅ Documentation reflects the latest code state
- ✅ Final production build passes after stale processes are cleared

---

## Success Criteria

Phase 4 is ready to close when:

- Users can manage account information confidently
- Owners can review booking communication cleanly
- Admins can operate moderation settings without manual code changes
- Payment and availability tasks are the only major remaining blocks before Phase 5

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

### Sprint 1 (Week 1): Notifications & Profile

- **Days 1-3**: Email notification system
- **Days 4-5**: Profile management pages

### Sprint 2 (Week 2): Calendar & Admin

- **Days 1-3**: Calendar availability feature
- **Days 4-5**: Admin dashboard enhancements

### Sprint 3 (Week 3): Additional Features & Polish

- **Days 1-2**: Password recovery
- **Days 3-4**: Invoice generation (optional)
- **Day 5**: Testing, bug fixes, documentation

---

## Success Criteria

Phase 4 is complete when:

- ✅ Email notifications sent for key events
- ✅ Profile management functional
- ✅ Calendar shows availability
- ✅ Password recovery works
- ✅ Admin dashboard complete
- ✅ All critical bugs fixed
- ✅ Documentation updated
- ✅ Build passes without errors
- ✅ Manual testing checklist passed

**Note**: Payment integration deferred to Phase 5 (requires Razorpay account)

---

## Dependencies

**External Services:**

- Email service account (Resend/SendGrid) - Required
- Cloudinary (already configured) - Ready

**Technical:**

- Database migration needed for calendar feature (VenueBlockedDate model)
- Compatible with current Next.js/Prisma versions

**Deferred to Phase 5:**

- Razorpay account (payment integration)
- Payment processing infrastructure

---

**Last Updated**: August 31, 2026  
**Status**: Planning Phase  
**Start Date**: After Phase 3 verification complete  
**Payment Integration**: Deferred to Phase 5
