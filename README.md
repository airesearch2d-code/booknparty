# BookNParty - Venue Booking Platform

A comprehensive venue booking platform built with Next.js 16, Prisma 7, and PostgreSQL. BookNParty connects venue owners with customers looking for spaces to host events.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables (see .env.local.example)
cp .env.local.example .env.local

# Sync database schema
npx prisma db push

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

Visit **http://localhost:3000**

## 📚 Documentation

Comprehensive documentation is available in the [`/docs`](docs/) folder:

- **[📖 Project Overview](docs/PROJECT_OVERVIEW.md)** - Features, roles, and development phases
- **[🛠️ Development Guide](docs/DEVELOPMENT_GUIDE.md)** - Setup, installation, and troubleshooting
- **[🏗️ Architecture](docs/ARCHITECTURE.md)** - Code structure and patterns
- **[💾 Database Schema](docs/DATABASE_SCHEMA.md)** - Data models and relationships
- **[🔌 API Reference](docs/API_REFERENCE.md)** - Complete endpoint documentation
- **[⚙️ Tech Stack](docs/TECH_STACK.md)** - Technologies and dependencies
- **[📊 Phase 3 Status](docs/PHASE_3_STATUS.md)** - Phase 3 completion and verification results
- **[🗺️ Phase 4 Roadmap](docs/PHASE_4_ROADMAP.md)** - UX and communication enhancements
- **[🗺️ Phase 5 Roadmap](docs/PHASE_5_ROADMAP.md)** - Payment integration and production scaling
- **[✅ Verification Checklist](docs/VERIFICATION_CHECKLIST.md)** - Testing procedures

## 🎯 For AI Agents

All major AI coding assistants (GitHub Copilot, Cursor, Claude, Windsurf, etc.) can read:

- **[`.instructions.md`](.instructions.md)** - Quick reference and conventions
- **[`/docs/*.md`](docs/)** - Comprehensive technical documentation

## ✨ Features

- **🔐 Role-Based Access**: Admin, Owner, and Customer dashboards
- **🏢 Venue Management**: Full CRUD with approval workflow
- **📅 Booking System**: Request, confirm, and track bookings
- **💬 Enquiry System**: Direct customer-owner communication
- **⭐ Reviews & Ratings**: Verified customer feedback
- **🔍 Advanced Search**: Filter by city, type, price, capacity
- **📊 Analytics**: Revenue tracking and booking insights

## 🛠️ Tech Stack

- **Framework**: Next.js 16.3.3 (App Router)
- **Database**: PostgreSQL with Prisma 7
- **Authentication**: NextAuth v5
- **UI**: React 19 + Tailwind CSS 4 + Radix UI
- **Forms**: React Hook Form + Zod
- **Images**: Cloudinary

## 📦 Project Status

**Current Phase**: Phase 4 (Planning/Execution)

**Phase 3**: Feature delivery complete (6/7), payment intentionally deferred to Phase 5

**✅ Verified in Build:**

- Production build successful
- TypeScript check passed (0 errors)
- Phase 3 dashboard and API regressions fixed

**✅ Complete:**

- Authentication & role-based access
- Venue management (CRUD, approval)
- Booking system (create, manage)
- Enquiry system
- Review & rating system
- Advanced search & filtering
- Dashboard analytics

**⏳ Planned in Phase 4:**

- Email notifications
- Profile management
- Calendar availability
- Admin enhancements

**⏳ Planned in Phase 5:**

- Payment integration (Razorpay)
- Production monitoring and security hardening
- Performance optimization and advanced analytics

## 🚦 Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run lint             # Run ESLint

# Database
npx prisma studio        # Open database GUI
npx prisma db push       # Sync schema to database
npx prisma generate      # Regenerate Prisma Client
npm run seed             # Seed test data
```

## 🔑 Default Test Users

After running `npm run seed`:

| Role     | Email                 | Password    |
| -------- | --------------------- | ----------- |
| Admin    | admin@booknparty.com  | admin123    |
| Owner    | owner1@example.com    | password123 |
| Customer | customer1@example.com | password123 |

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth Documentation](https://authjs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🤝 Contributing

See [Development Guide](docs/DEVELOPMENT_GUIDE.md) for setup instructions and [Architecture](docs/ARCHITECTURE.md) for code patterns.

---

**Last Updated**: August 31, 2026  
**Version**: Phase 4 Plan (v0.9)
