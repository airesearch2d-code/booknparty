# BookNParty - Phase 4 Roadmap

## Overview

Phase 4 focused on usability and operations maturity while preserving the manual booking confirmation model. All planned scope — communication, profiles, availability, account safeguards, admin operations, and a baseline testing/monitoring setup — has been delivered.

## Current Status

- **Current Phase**: Phase 4 (Complete)
- **Status**: All planned Phase 4 scope is implemented and verified with a clean production build
- **Last Updated**: September 25, 2026

## Completed in Phase 4

1. **Notifications system**
   - Resend-based email utility in `src/lib/email.ts`
   - Booking, enquiry, venue approval, welcome, cancellation, and modification-request notifications
2. **Profile management**
   - Role-based profile pages for customer, owner, and admin
   - `GET/PATCH /api/user/profile`
   - `POST /api/user/change-password`
3. **Admin settings foundation**
   - `/dashboard/admin/settings`
   - `PlatformSettingsForm` and summary cards
4. **Venue availability calendar and block-dates**
   - `AvailabilityCalendar` and `OwnerAvailabilityManager` components
   - `GET /api/venues/[id]/availability`, block-dates management endpoints
   - Conflict detection against existing bookings and blocked dates
5. **Password recovery**
   - `/forgot-password` and `/reset-password` pages with expiring reset tokens
   - `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
6. **Customer booking cancellation**
   - `POST /api/bookings/[id]/cancel` with ownership/status/date validation and owner notification email
7. **Invoice generation**
   - Printable invoice page at `/dashboard/customer/bookings/[id]/invoice` with `print:` Tailwind styling
8. **Booking modification (reschedule) workflow**
   - `BookingModificationRequest` Prisma model
   - Customer request API (`POST/GET /api/bookings/[id]/modify-requests`) with conflict/capacity checks
   - Owner/Admin approval API (`PATCH /api/bookings/[id]/modify-requests/[requestId]`) with transactional booking updates
   - UI: `BookingModificationModal` (customer) and `OwnerModificationRequestActions` (owner)
9. **Admin export and bulk actions**
   - Bookings and enquiries CSV export endpoints
   - Bulk status update APIs (`/api/admin/bookings/bulk-update`, `/api/admin/enquiries/bulk-update`) with `AdminBookingsTable` / `AdminEnquiriesTable` multi-select UI
10. **Testing baseline**
    - Vitest configured (`vitest.config.ts`), sample unit tests for `src/lib/utils.ts` (`npm run test`)
11. **Error monitoring scaffold**
    - Sentry wired via native Next.js instrumentation file conventions: `src/instrumentation.ts` (server `register` + `onRequestError`), `src/instrumentation-client.ts` (client init + navigation breadcrumbs), `src/app/global-error.tsx` (root error boundary)
    - Gated behind `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` env vars; no-op until a real DSN is supplied

## Completion Criteria

Phase 4 is complete — all criteria met:

- ✅ Email and profile flows are verified across roles
- ✅ Availability calendar and conflict prevention are implemented
- ✅ Password recovery and invoice workflow are implemented
- ✅ Booking modification/reschedule workflow implemented with owner approval
- ✅ Admin operational tooling (export + bulk actions) is complete for daily platform use
- ✅ Testing baseline (Vitest) and monitoring scaffold (Sentry) are in place
- ✅ Final production build passes in a clean environment

## Dependencies

### External Services

- Resend account and sender identity configured
- Cloudinary configuration available
- Sentry DSN (optional — required only to activate the monitoring scaffold)

### Deferred to Phase 5

- Razorpay account and payment processing infrastructure
- Full test/monitoring maturity (E2E tests, alerting, security hardening) — see [PHASE_5_ROADMAP.md](PHASE_5_ROADMAP.md)

---

**Last Updated**: September 25, 2026
**Status**: Complete
**Payment Integration**: Deferred to Phase 5
