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
- **[Phase 5 Roadmap](PHASE_5_ROADMAP.md)** - Payment integration and production scaling
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
| **PHASE_4_ROADMAP**        | Tracking delivered and pending Phase 4 work              |
| **PHASE_5_ROADMAP**        | Payment integration and production scaling plan          |
| **VERIFICATION_CHECKLIST** | Testing features or validating implementation            |

## Current Status

**Current Phase**: Phase 4 (In Progress)

**Latest development status (September 2, 2026):**

- ✅ Email delivery utilities and notification hooks are implemented for bookings, enquiries, venue approval, and welcome messages.
- ✅ Profile management is live for all three roles, including password change and account info updates.
- ✅ Admin settings screens and moderation toggles are in place.
- ⏳ Availability calendar and conflict detection remain open.
- ⏳ Payment integration is still targeted for Phase 5.
- ⏳ Password recovery, invoice generation, and final production hardening are pending.

**Completed:**

- ✅ Authentication & role-based access
- ✅ Venue management (CRUD, approval workflow)
- ✅ Booking system (create, manage, confirm/cancel)
- ✅ Enquiry system (customer-owner communication)
- ✅ Review & rating system
- ✅ Advanced search & filtering
- ✅ Dashboard analytics
- ✅ Email notifications infrastructure
- ✅ Account profile management
- ✅ Admin platform settings UI

**Still pending:**

- 🔄 Venue availability calendar and date blocking
- 🔄 Razorpay payment flow
- 🔄 Password reset workflow
- 🔄 Invoice generation and booking modifications
- 🔄 Security hardening, monitoring, and QA automation

**Verification note:**

- The project has active code for Phase 4 features, but the final build verification should be rerun after clearing an existing stale `next build` process in the environment.

## 🤝 Contributing

Before making changes:

1. Read the relevant documentation
2. Understand the architecture and patterns
3. Check Phase 3/4/5 status to avoid duplicate work
4. Follow the conventions in `.instructions.md`
5. Test with multiple user roles
6. Run `npm run build` to verify

## 📞 Key Contacts

- **Tech Stack Questions**: See [TECH_STACK.md](TECH_STACK.md)
- **Database Questions**: See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
- **API Questions**: See [API_REFERENCE.md](API_REFERENCE.md)
- **Setup Issues**: See [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)

---

**Last Updated**: September 2, 2026  
**Version**: Phase 4 Execution (v1.0)
