# BookNParty - Phase 4 Roadmap

## Overview

Phase 4 focuses on enhancing the BookNParty platform with notifications, profile management, and improved user experience features. This phase improves platform usability and communication while maintaining the manual booking confirmation workflow.

**Note**: Payment integration has been deferred to Phase 5 (requires Razorpay account setup).

**Target Start**: After Phase 3 verification  
**Estimated Duration**: 2-3 weeks  
**Priority**: High (improves platform usability)

---

## Phase 4 Goals

1. **Improve Communication**: Add email notifications for key events
2. **Enhance UX**: Add profile management and user preferences
3. **Prevent Conflicts**: Implement calendar-based availability system
4. **Admin Tools**: Complete admin dashboard functionality
5. **Essential Features**: Password recovery, invoice generation

---

## 🔴 Priority 1: Notifications System

### Feature: Email Notifications

**Status**: Not Started  
**Estimated Effort**: 4-5 hours  
**Priority**: P0 (Highest)

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

## � Priority 2: Profile Management

### Feature: User Profile Pages

**Status**: Not Started  
**Estimated Effort**: 3-4 hours  
**Priority**: P1 (High)

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
