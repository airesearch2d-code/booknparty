# BookNParty - Project Overview

## What is BookNParty?

BookNParty is a comprehensive venue booking platform that connects venue owners with customers looking for spaces to host events. It provides a complete marketplace ecosystem with role-based dashboards, booking management, enquiry systems, and review capabilities.

## Vision

Create a seamless experience for discovering, booking, and managing event venues—from intimate banquet halls to large outdoor spaces—with transparent pricing, real-time availability, and verified reviews.

## Core Features

### For Customers (Event Organizers)

- **Venue Discovery**: Browse venues with advanced filtering (city, type, capacity, price range)
- **Detailed Venue Pages**: High-quality image galleries, amenities, pricing, reviews
- **Booking System**: Request bookings with event details, guest count, duration
- **Enquiry System**: Direct communication with venue owners
- **Review & Ratings**: Submit reviews after completing bookings (1-5 stars)
- **Booking Management**: Track booking status (Pending → Confirmed → Completed)

### For Venue Owners

- **Venue Management**: Add, edit, and manage multiple venue listings
- **Booking Management**: Accept/reject booking requests
- **Enquiry Responses**: Respond to customer enquiries
- **Revenue Analytics**: Track bookings and revenue over time
- **Image Management**: Upload venue photos via Cloudinary

### For Administrators

- **User Management**: View and manage all users
- **Venue Approval**: Approve/reject new venue listings
- **Platform Oversight**: Monitor all bookings, enquiries, and reviews
- **Content Moderation**: Ensure quality and compliance

## User Roles

| Role         | Description                        | Key Permissions                                              |
| ------------ | ---------------------------------- | ------------------------------------------------------------ |
| **CUSTOMER** | Event organizers and venue seekers | Browse venues, create bookings/enquiries, submit reviews     |
| **OWNER**    | Venue owners and managers          | Manage venues, respond to enquiries, confirm/cancel bookings |
| **ADMIN**    | Platform administrators            | Full access, user management, venue approval                 |

## Core Entities

1. **Users**: All platform users (admin, owner, customer)
2. **Venues**: Venue listings with details, pricing, images
3. **Bookings**: Booking requests with status tracking
4. **Enquiries**: Direct communication between customers and owners
5. **Reviews**: Customer feedback on completed bookings

## Development Phases

### ✅ Phase 1: Foundation (Complete)

- Project setup (Next.js, Prisma, NextAuth)
- Database schema design
- Basic authentication (login, register, logout)
- Role-based access control
- Basic dashboards for all roles

### ✅ Phase 2: Core Features (Complete)

- Venue CRUD operations
- Booking system (create, view, status management)
- Enquiry system (create, view, respond)
- Public venue browsing
- Image upload integration (Cloudinary)

### ✅ Phase 3: Production Features (85% Complete)

**Completed:**

1. ✅ Prisma schema alignment (eventDate, hours, eventType)
2. ✅ Review & rating system (with booking completion validation)
3. ✅ Venue edit functionality for owners
4. ✅ Advanced search & filtering (city, type, price, capacity)
5. ✅ Real revenue analytics for owners
6. ✅ Booking status management (confirm/cancel actions)
7. ✅ Build verification and TypeScript error fixes

**Deferred:**

- 🔴 Payment integration (Razorpay) → Moved to Phase 5

**Status**: Technical implementation 100% complete. Browser testing optional.

### ✅ Phase 4: UX & Communication (Complete)

**Implementation status (September 25, 2026):**

- ✅ Email notifications for bookings, enquiries, venue approvals, cancellations, modification requests, and welcome messages via Resend
- ✅ Role-based profile management pages for customer, owner, and admin accounts
- ✅ Password change workflow and profile editing
- ✅ Admin settings dashboard with moderation toggles
- ✅ Venue availability calendar and owner date-blocking logic
- ✅ Booking conflict detection and double-booking prevention
- ✅ Password recovery flow with expiring reset tokens
- ✅ Customer booking cancellation and invoice generation
- ✅ Booking modification (reschedule) workflow with owner/admin approval
- ✅ Admin export and bulk actions for bookings and enquiries
- ✅ Testing baseline (Vitest) and error monitoring scaffold (Sentry, via native instrumentation)

### 🔜 Phase 5: Content Management (Planned - 1-2 weeks)

**Scope**: Admin-manageable static pages, blog, and contact form

- Admin CRUD for static pages (About, Contact, Privacy, Terms) with Markdown content
- Blog CRUD (posts, featured images via Cloudinary, publish/draft)
- Working contact form with `ContactSubmission` storage and admin email notification (via Resend)
- Public routes: `/about`, `/privacy`, `/terms`, `/contact`, `/blog`, `/blog/[slug]` — replacing currently dead Footer links

See [PHASE_5_ROADMAP.md](PHASE_5_ROADMAP.md) for full details.

### 🔜 Phase 6: Payment & Scale (Planned - 2-3 weeks)

**Critical**: Payment Integration

- Razorpay payment gateway integration
- Automated booking confirmation on payment
- Payment details on invoices

**Production Readiness**:

- Security hardening and rate limiting
- Performance optimizations
- Caching strategies
- Activating the Sentry scaffold with a real DSN and alerting

**Advanced Features**:

- Advanced analytics dashboard
- Expanded automated test coverage (integration/E2E)

**Prerequisites**: Razorpay account

See [PHASE_6_ROADMAP.md](PHASE_6_ROADMAP.md) for full details.

## Project Goals

1. **Usability**: Intuitive interface for all user types
2. **Reliability**: Robust error handling and validation
3. **Scalability**: Database design supports growth
4. **Security**: Role-based access control, secure authentication
5. **Maintainability**: Clean architecture, TypeScript, comprehensive docs

## Technical Approach

- **Modern Stack**: Latest Next.js with App Router for SSR and API routes
- **Type Safety**: TypeScript + Prisma for end-to-end type safety
- **Component Architecture**: Reusable components with Radix UI primitives
- **Database Design**: Normalized schema with proper relationships and cascades
- **Form Handling**: React Hook Form + Zod for validation
- **Styling**: Utility-first with Tailwind CSS 4

## Success Metrics

- ✅ All user roles functional with proper access control
- ✅ Venue owners can manage complete lifecycle
- ✅ Customers can discover and book venues seamlessly
- ✅ Admin can oversee platform operations
- ⏳ Payment integration (pending Phase 5)
- ✅ Email notifications (implemented)

## Current State (September 25, 2026)

Phase 4 is **complete**. The platform supports:

- Full venue management workflow, including availability calendar and block-dates
- Complete booking lifecycle (create, confirm/cancel, reschedule with approval — minus payments)
- Enquiry communication with admin bulk actions
- Review system with validation
- Advanced search and filtering
- Revenue tracking
- Password recovery, invoice generation, and admin export tooling
- Vitest testing baseline and a Sentry monitoring scaffold

**Ready for**: Beta testing, demo deployments, further feature development  
**Not ready for**: Production with real transactions (requires Phase 5 payment integration)

## Key Differentiators

1. **Role-Based Architecture**: Separate dashboards optimized for each user type
2. **Approval Workflow**: Admin reviews venues before going live
3. **Review Verification**: Only customers with completed bookings can review
4. **Owner Analytics**: Real-time revenue tracking and booking insights
5. **Advanced Filtering**: Multi-parameter search for precise venue discovery

## Future Vision

- Multi-language support for international markets
- Mobile app (React Native)
- Real-time chat between customers and owners
- AI-powered venue recommendations
- Dynamic pricing based on demand
- Integration with event planning tools
- Vendor marketplace (catering, decoration, photography)

---

**Last Updated**: September 25, 2026  
**Phase**: 4 (Complete)  
**Status**: Phase 5 (payment integration) not started
