# BookNParty Documentation

Welcome to the comprehensive documentation for **BookNParty** - a modern venue booking platform.

## Documentation Index

### Getting Started

- **[Development Guide](DEVELOPMENT_GUIDE.md)** - Setup, installation, and local development
- **[Project Overview](PROJECT_OVERVIEW.md)** - What BookNParty is and its core features

### Technical Documentation

- **[Tech Stack](TECH_STACK.md)** - All technologies, dependencies, and rationale
- **[Architecture](ARCHITECTURE.md)** - Code structure, patterns, and conventions
- **[Database Schema](DATABASE_SCHEMA.md)** - Prisma models, relationships, and data design
- **[API Reference](API_REFERENCE.md)** - Complete endpoint documentation

### Execution and Roadmaps

- **[Phase 3 Status](PHASE_3_STATUS.md)** - Phase 3 completion and verification status
- **[Phase 4 Roadmap](PHASE_4_ROADMAP.md)** - UX and communication enhancements
- **[Phase 5 Roadmap](PHASE_5_ROADMAP.md)** - Content management (static pages & blog)
- **[Phase 6 Roadmap](PHASE_6_ROADMAP.md)** - Payment integration and production scaling
- **[Verification Checklist](VERIFICATION_CHECKLIST.md)** - Testing procedures and flows

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create local environment variables
copy NUL .env.local
# Edit .env.local with DATABASE_URL, AUTH_SECRET, RESEND_API_KEY, etc.

# Sync database schema
npx prisma db push

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

Visit http://localhost:3000

## 🎯 For AI Agents

All major AI agents (GitHub Copilot, Cursor, Claude, Windsurf, etc.) can read these docs for context:

- **Root**: `/.instructions.md` - Quick reference and conventions
- **This folder**: `/docs/*.md` - Comprehensive technical documentation

## 📖 Document Purposes

| Document                   | When to Read                                             |
| -------------------------- | -------------------------------------------------------- |
| **PROJECT_OVERVIEW**       | Understanding what BookNParty does, user roles, features |
| **TECH_STACK**             | Learning about technologies used and why                 |
| **ARCHITECTURE**           | Before writing code - understand patterns and structure  |
| **DATABASE_SCHEMA**        | Working with data models, relationships, or database     |
| **API_REFERENCE**          | Implementing/consuming API endpoints                     |
| **DEVELOPMENT_GUIDE**      | Setting up local environment, troubleshooting            |
| **PHASE_3_STATUS**         | Checking what's implemented and what's pending           |
| **PHASE_4_ROADMAP**        | Phase 4 completion summary (all items delivered)         |
| **PHASE_5_ROADMAP**        | Content management (static pages & blog) plan            |
| **PHASE_6_ROADMAP**        | Payment integration and production scaling plan          |
| **VERIFICATION_CHECKLIST** | Testing features or validating implementation            |

## Current Status

**Current Phase**: Phase 4 (Complete) — Phase 5 (Content Management) and Phase 6 (Payments) not started

**Latest development status (September 25, 2026):**

- ✅ Email delivery utilities and notification hooks are implemented for bookings, enquiries, venue approval, cancellations, modification requests, and welcome messages.
- ✅ Profile management is live for all three roles, including password change and account info updates.
- ✅ Admin settings screens and moderation toggles are in place.
- ✅ Availability calendar, block-dates, and booking conflict detection are implemented.
- ✅ Password recovery with expiring reset tokens is implemented.
- ✅ Invoice generation, customer booking cancellation, and booking modification (reschedule) workflow with owner approval are implemented.
- ✅ Admin export and bulk actions for bookings and enquiries are implemented.
- ✅ Vitest testing baseline and a Sentry monitoring scaffold are in place.
- ⏳ Admin-managed content (static pages, blog, contact form) is targeted for Phase 5.
- ⏳ Payment integration is targeted for Phase 6.

**Completed:**

- ✅ Authentication & role-based access
- ✅ Venue management (CRUD, approval workflow)
- ✅ Booking system (create, manage, confirm/cancel/reschedule)
- ✅ Enquiry system (customer-owner communication)
- ✅ Review & rating system
- ✅ Advanced search & filtering
- ✅ Dashboard analytics
- ✅ Email notifications infrastructure
- ✅ Account profile management
- ✅ Admin platform settings UI
- ✅ Venue availability calendar and date blocking
- ✅ Password reset workflow
- ✅ Invoice generation and booking modification requests
- ✅ Admin export and bulk actions
- ✅ Testing baseline (Vitest) and monitoring scaffold (Sentry)

**Still pending (Phase 5 - Content Management):**

- 🔄 Admin-managed static pages (About, Contact, Privacy, Terms)
- 🔄 Blog CRUD and public blog pages
- 🔄 Contact form with admin email notification

**Still pending (Phase 6 - Payments & Scale):**

- 🔄 Razorpay payment flow
- 🔄 Security hardening (rate limiting, CSP, brute-force protection)
- 🔄 Expanded automated test coverage (integration/E2E) and performance optimization

**Verification note:**

- Full production build (`npm run build`) passes cleanly end-to-end as of the last verification pass.

## 🤝 Contributing

Before making changes:

1. Read the relevant documentation
2. Understand the architecture and patterns
3. Check Phase 3/4/5/6 status to avoid duplicate work
4. Follow the conventions in `.instructions.md`
5. Test with multiple user roles
6. Run `npm run build` to verify

## 📞 Key Contacts

- **Tech Stack Questions**: See [TECH_STACK.md](TECH_STACK.md)
- **Database Questions**: See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
- **API Questions**: See [API_REFERENCE.md](API_REFERENCE.md)
- **Setup Issues**: See [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)

---

**Last Updated**: September 25, 2026  
**Version**: Phase 4 Complete (v1.0)
