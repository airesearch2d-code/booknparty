# BookNParty - Phase 4 Roadmap

## Overview

Phase 4 focuses on usability and operations maturity while preserving the current manual booking confirmation model. Communication and profile foundations are now implemented, and the remaining scope is concentrated on availability, safeguards, and operational completeness.

## Current Status

- **Current Phase**: Phase 4 (In Progress)
- **Status**: Notifications, profiles, and admin settings are implemented; availability and hardening items remain
- **Last Updated**: September 2, 2026

## Completed in Phase 4

1. **Notifications system**
   - Resend-based email utility in `src/lib/email.ts`
   - Booking, enquiry, venue approval, and welcome notifications
2. **Profile management**
   - Role-based profile pages for customer, owner, and admin
   - `GET/PATCH /api/user/profile`
   - `POST /api/user/change-password`
3. **Admin settings foundation**
   - `/dashboard/admin/settings`
   - `PlatformSettingsForm` and summary cards

## Remaining Scope

- Venue availability calendar and owner block-dates flow
- Availability conflict detection for booking safety
- Password recovery with expiring reset tokens
- Invoice generation and booking modification workflow
- Admin export, bulk actions, and reporting polish
- Performance, monitoring, and QA improvements

## Priority Backlog

### P2: Calendar and Availability

- **Status**: Not Started
- **Estimated Effort**: 6-8 hours
- **Planned files**:
  - `src/components/AvailabilityCalendar.tsx`
  - `src/app/api/venues/[id]/availability/route.ts`
  - `src/app/api/venues/[id]/block-dates/route.ts`

### P3: Account and Operations Completion

- **Status**: Not Started / Partially complete
- **Estimated Effort**: 10-14 hours combined
- **Includes**:
  - Password recovery flow
  - Invoice generation
  - Booking modification requests
  - Admin export, filtering, and reporting improvements

### P4: Quality and Hardening

- **Status**: Not Started
- **Estimated Effort**: 10-13 hours combined
- **Includes**:
  - Testing setup (unit, integration, and E2E)
  - Performance optimization and query tuning
  - Error tracking and monitoring integration

## Sprint Plan (Remaining)

### Sprint A: Availability Core

- Implement availability APIs and calendar UI
- Add block-date support and conflict guards

### Sprint B: Account and Admin Completion

- Implement password recovery and invoice workflow
- Deliver admin export/filter/reporting improvements

### Sprint C: Quality Gate

- Add automated test baseline
- Add monitoring hooks and performance polish
- Run full verification pass and documentation update

## Completion Criteria

Phase 4 is complete when all of the following are true:

- Email and profile flows are verified across roles
- Availability calendar and conflict prevention are implemented
- Password recovery and invoice workflow are implemented
- Admin operational tooling is complete for daily platform use
- Documentation and verification artifacts reflect the final state
- Final production build passes in a clean environment

## Dependencies

### External Services

- Resend account and sender identity configured
- Cloudinary configuration available

### Technical Prerequisites

- Database migration for availability/block-date support
- Stable Next.js/Prisma environment for final build verification

### Deferred to Phase 5

- Razorpay account and payment processing infrastructure

---

**Last Updated**: September 2, 2026
**Status**: Execution Phase
**Payment Integration**: Deferred to Phase 5
