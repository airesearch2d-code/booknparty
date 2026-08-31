# BookNParty - Verification Checklist

This checklist reflects the current project state: Phase 3 functionality is in place, Phase 4 email/profile work is implemented in code, and the remaining open items are the calendar/availability layer and the final production hardening pass.

## Current Status Snapshot

- [x] Core booking, venue, enquiry, and review flows are implemented
- [x] Email notification utilities are wired into key flows
- [x] Profile management and password changes are present for all roles
- [x] Admin settings screen exists for platform controls
- [ ] Availability calendar and conflict detection are implemented
- [ ] Payment flow and Razorpay handoff are implemented
- [ ] Final build verification is rerun after clearing stale `next build` processes

## Pre-Verification Setup

### Environment Check

- [ ] `.env.local` contains all required variables
- [ ] Database is running and accessible
- [ ] `npm install` completed without errors
- [ ] `npx prisma generate` completed successfully

### Database Verification

- [ ] Database seeded with test data: `npm run seed`
- [ ] Prisma Studio opens successfully: `npx prisma studio`
- [ ] All tables visible in Prisma Studio

### Build Check

```bash
npm run build
```

- [ ] Build completes without TypeScript errors
- [ ] No ESLint errors reported
- [ ] Build output shows all routes compiled

---

## Phase 3 Feature Verification

### 1. Authentication & Authorization

#### Registration

- [ ] Navigate to `/register`
- [ ] Fill form with valid data
- [ ] Select role: CUSTOMER
- [ ] Submit form
- [ ] Verify redirect to `/dashboard/customer`
- [ ] Repeat for OWNER role → redirects to `/dashboard/owner`

#### Login

- [ ] Navigate to `/login`
- [ ] Login as customer: `customer1@example.com` / `password123`
- [ ] Verify redirect to customer dashboard
- [ ] Logout
- [ ] Login as owner: `owner1@example.com` / `password123`
- [ ] Verify redirect to owner dashboard
- [ ] Logout
- [ ] Login as admin: `admin@booknparty.com` / `admin123`
- [ ] Verify redirect to admin dashboard

#### Access Control

- [ ] As CUSTOMER, try to access `/dashboard/owner` → Should redirect/block
- [ ] As OWNER, try to access `/dashboard/admin` → Should redirect/block
- [ ] Logout, try to access `/dashboard/customer` → Should redirect to login

---

### 2. Venue Management

#### Public Venue Browsing (No Login Required)

- [ ] Navigate to `/venues`
- [ ] Verify venues are displayed
- [ ] Click on a venue → verify redirect to venue detail page
- [ ] Verify venue images, description, price, amenities visible
- [ ] Verify "Book Now" and "Send Enquiry" buttons present

#### Advanced Search & Filters

- [ ] On `/venues`, use city filter dropdown
- [ ] Select a city (e.g., "Mumbai")
- [ ] Verify URL updates with `?city=Mumbai`
- [ ] Verify only venues from that city displayed
- [ ] Clear filter → verify all venues shown again
- [ ] Use venue type filter → select "BANQUET_HALL"
- [ ] Verify only banquet halls shown
- [ ] Use capacity filter → enter 100
- [ ] Verify only venues with capacity ≥ 100 shown
- [ ] Use search bar → type venue name
- [ ] Verify matching venues displayed
- [ ] Test pagination → click next page
- [ ] Verify different venues loaded

#### Venue Creation (Owner)

- [ ] Login as owner
- [ ] Navigate to `/dashboard/owner/venues`
- [ ] Click "Add New Venue"
- [ ] Fill all required fields:
  - Name, description, type, capacity
  - Price per hour, min booking hours
  - Address, city, state, pincode
  - Images (URLs), amenities, highlights
- [ ] Submit form
- [ ] Verify redirect to venue list
- [ ] Verify new venue appears in list
- [ ] Verify venue shows "Pending Approval" badge

#### Venue Editing (Owner)

- [ ] From owner venue list, click "Edit" on a venue
- [ ] Verify form is pre-filled with existing data
- [ ] Change venue name
- [ ] Submit form
- [ ] Verify success message
- [ ] Verify venue name updated
- [ ] Verify venue status changed to "Pending Approval"

#### Venue Approval (Admin)

- [ ] Login as admin
- [ ] Navigate to `/dashboard/admin/venues`
- [ ] Verify pending venues section shows unapproved venues
- [ ] Click "Approve" on a pending venue
- [ ] Verify venue moves to approved list
- [ ] Verify venue `isApproved` = true in database
- [ ] Logout and check public `/venues` → approved venue should appear

---

### 3. Booking System

#### Create Booking (Customer)

- [ ] Login as customer
- [ ] Navigate to `/venues`
- [ ] Click on an approved venue
- [ ] Click "Book Now"
- [ ] Fill booking form:
  - Event date (future date)
  - Number of hours
  - Guest count
  - Event type
  - Notes (optional)
- [ ] Verify total amount calculated correctly (pricePerHour × hours)
- [ ] Submit booking
- [ ] Verify success message
- [ ] Verify redirect to customer dashboard
- [ ] Verify booking appears in "My Bookings" with PENDING status

#### View Bookings

- [ ] Customer dashboard → verify booking listed
- [ ] Navigate to `/dashboard/customer/bookings`
- [ ] Verify all customer's bookings displayed
- [ ] Verify booking details: venue name, date, amount, status

#### Booking Management (Owner)

- [ ] Login as owner
- [ ] Navigate to `/dashboard/owner/bookings`
- [ ] Verify pending bookings section
- [ ] Find a PENDING booking
- [ ] Click "Confirm" button
- [ ] Verify status changes to CONFIRMED
- [ ] Verify owner dashboard stats update (revenue increases)
- [ ] Find another PENDING booking
- [ ] Click "Cancel" button
- [ ] Verify status changes to CANCELLED

---

### 4. Enquiry System

#### Send Enquiry (Customer)

- [ ] Login as customer
- [ ] Navigate to a venue detail page
- [ ] Click "Send Enquiry" button
- [ ] Fill enquiry form:
  - Name, email, phone
  - Message
  - Event type, event date, guest count (optional)
- [ ] Submit enquiry
- [ ] Verify success message
- [ ] Navigate to `/dashboard/customer/enquiries`
- [ ] Verify enquiry appears with PENDING status

#### Respond to Enquiry (Owner)

- [ ] Login as owner
- [ ] Navigate to `/dashboard/owner/enquiries`
- [ ] Find a PENDING enquiry
- [ ] Click "Respond" or expand enquiry
- [ ] Enter response message
- [ ] Submit response
- [ ] Verify enquiry status changes to RESPONDED
- [ ] Logout

#### View Enquiry Response (Customer)

- [ ] Login as customer (same one who sent enquiry)
- [ ] Navigate to `/dashboard/customer/enquiries`
- [ ] Find the enquiry with RESPONDED status
- [ ] Verify owner's response is visible

---

### 5. Review & Rating System

#### Complete Booking (Setup)

- [ ] As admin, use Prisma Studio to change a booking status to COMPLETED
- [ ] Set `status` = "COMPLETED" for a booking where customer1 is the customer

#### Submit Review (Customer)

- [ ] Login as customer1
- [ ] Navigate to `/dashboard/customer/bookings`
- [ ] Find the COMPLETED booking
- [ ] Verify "Write Review" button appears
- [ ] Click "Write Review"
- [ ] ReviewModal should open
- [ ] Select rating (1-5 stars) by clicking stars
- [ ] Enter review comment
- [ ] Submit review
- [ ] Verify success message
- [ ] Verify "Write Review" button no longer appears for that booking

#### View Reviews

- [ ] Logout
- [ ] Navigate to the venue's detail page
- [ ] Scroll to reviews section
- [ ] Verify submitted review appears
- [ ] Verify rating, comment, and reviewer name displayed
- [ ] Verify average rating displayed at top of venue page

#### Review Validation

- [ ] Login as customer2 (different customer)
- [ ] Try to submit review for venue without completed booking
- [ ] Verify error message or button not available

---

### 6. Revenue Analytics (Owner)

#### Owner Dashboard Stats

- [ ] Login as owner
- [ ] Navigate to `/dashboard/owner`
- [ ] Verify statistics displayed:
  - Total venues count
  - Total revenue (sum of CONFIRMED + COMPLETED bookings)
  - Pending bookings count
  - Average rating across all venues
- [ ] Verify recent bookings list
- [ ] Verify recent enquiries list
- [ ] Check if revenue chart renders (may be basic)

#### Revenue Calculation

- [ ] Navigate to `/dashboard/owner/bookings`
- [ ] Note total revenue displayed
- [ ] Manually sum totalAmount from CONFIRMED + COMPLETED bookings
- [ ] Verify numbers match

---

### 7. Admin Dashboard

#### Admin Overview

- [ ] Login as admin
- [ ] Navigate to `/dashboard/admin`
- [ ] Verify stats:
  - Total users (all roles)
  - Total venues
  - Pending venue approvals count
  - Total bookings
  - Total revenue
- [ ] Verify pending venue approvals section
- [ ] Verify recent users list

#### User Management

- [ ] Navigate to `/dashboard/admin/users`
- [ ] Verify all users displayed in table
- [ ] Verify columns: Name, Email, Role, Bookings, Venues
- [ ] Verify stats by role (Admin: X, Owner: Y, Customer: Z)

#### Venue Management

- [ ] Navigate to `/dashboard/admin/venues`
- [ ] Verify all venues displayed
- [ ] Verify pending venues section
- [ ] Test approve/reject actions
- [ ] Verify approved venues show in "Approved Venues" section

---

## Edge Cases & Error Handling

### Validation

- [ ] Try to register with existing email → Verify error
- [ ] Try to login with wrong password → Verify error
- [ ] Try to create venue with missing required fields → Verify validation errors
- [ ] Try to create booking with past date → Verify error
- [ ] Try to submit review without completing booking → Verify error

### Authorization

- [ ] Try to edit another owner's venue → Verify blocked
- [ ] Try to confirm booking for venue you don't own → Verify blocked
- [ ] Try to access admin pages as customer → Verify redirect

### Data Integrity

- [ ] Create venue → verify slug is unique
- [ ] Create duplicate review (same user, same venue) → verify blocked
- [ ] Delete venue as owner → verify cascade to bookings/enquiries/reviews

---

## Browser Compatibility

Test in multiple browsers:

- [ ] Chrome
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Edge

---

## Performance Checks

- [ ] Venue list page loads < 2 seconds
- [ ] Venue detail page loads < 2 seconds
- [ ] Dashboard pages load < 2 seconds
- [ ] No console errors in browser dev tools
- [ ] Images load properly (no broken links)

---

## Mobile Responsiveness (Basic Check)

- [ ] Open homepage on mobile viewport
- [ ] Verify navigation menu works
- [ ] Verify venue cards stack properly
- [ ] Verify forms are usable
- [ ] Verify dashboards are readable

---

## Known Limitations (Acceptable)

These are expected and documented:

- ✅ Payment integration not implemented (Phase 5)
- ✅ No email notifications (Phase 4)
- ✅ No password recovery (Phase 4)
- ✅ No profile edit pages (Phase 4)
- ✅ No calendar availability view (Phase 4)

---

## Verification Sign-Off

| Area             | Status          | Notes | Verified By | Date |
| ---------------- | --------------- | ----- | ----------- | ---- |
| Authentication   | ☐ Pass / ☐ Fail |       |             |      |
| Venue Management | ☐ Pass / ☐ Fail |       |             |      |
| Booking System   | ☐ Pass / ☐ Fail |       |             |      |
| Enquiry System   | ☐ Pass / ☐ Fail |       |             |      |
| Review System    | ☐ Pass / ☐ Fail |       |             |      |
| Owner Analytics  | ☐ Pass / ☐ Fail |       |             |      |
| Admin Dashboard  | ☐ Pass / ☐ Fail |       |             |      |

**Overall Phase 3 Status**: ☐ PASS / ☐ FAIL

**Comments:**

```
[Add any issues found or notes here]
```

---

## Post-Verification

After all checks pass:

- [ ] Document any bugs found
- [ ] Create issues for bug fixes
- [ ] Update Phase 3 status to "Complete"
- [ ] Begin Phase 4 planning

---

**Last Updated**: August 2026  
**Phase**: 3 Verification  
**Next**: Phase 4 Implementation
