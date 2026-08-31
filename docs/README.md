# BookNParty Documentation

Welcome to the comprehensive documentation for **BookNParty** - a modern venue booking platform.

## 📚 Documentation Index

### Getting Started

- **[Development Guide](DEVELOPMENT_GUIDE.md)** - Setup, installation, and local development
- **[Project Overview](PROJECT_OVERVIEW.md)** - What BookNParty is and its core features

### Technical Documentation

- **[Tech Stack](TECH_STACK.md)** - All technologies, dependencies, and rationale
- **[Architecture](ARCHITECTURE.md)** - Code structure, patterns, and conventions
- **[Database Schema](DATABASE_SCHEMA.md)** - Prisma models, relationships, and data design
- **[API Reference](API_REFERENCE.md)** - Complete endpoint documentation

### Project Planning

- **[Phase 3 Status](PHASE_3_STATUS.md)** - Current implementation status (85% complete)
- **[Phase 4 Roadmap](PHASE_4_ROADMAP.md)** - Upcoming features and priorities
- **[Verification Checklist](VERIFICATION_CHECKLIST.md)** - Testing procedures and flows

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials

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
| **PHASE_4_ROADMAP**        | Planning future work or new features                     |
| **VERIFICATION_CHECKLIST** | Testing features or validating implementation            |

## 🏗️ Project Status

**Current Phase**: Phase 3 (85% Complete)

**Completed:**

- ✅ Authentication & role-based access
- ✅ Venue management (CRUD, approval workflow)
- ✅ Booking system (create, status management)
- ✅ Enquiry system (customer-owner communication)
- ✅ Review & rating system
- ✅ Advanced search & filtering
- ✅ Dashboard analytics

**Pending (Phase 4):**

- 🔄 Payment integration (Razorpay)
- 🔄 Email notifications
- 🔄 Profile management
- 🔄 Calendar availability view

## 🤝 Contributing

Before making changes:

1. Read the relevant documentation
2. Understand the architecture and patterns
3. Check Phase 3/4 status to avoid duplicate work
4. Follow the conventions in `.instructions.md`
5. Test with multiple user roles
6. Run `npm run build` to verify

## 📞 Key Contacts

- **Tech Stack Questions**: See [TECH_STACK.md](TECH_STACK.md)
- **Database Questions**: See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
- **API Questions**: See [API_REFERENCE.md](API_REFERENCE.md)
- **Setup Issues**: See [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)

---

**Last Updated**: August 2026  
**Version**: Phase 3 (v0.85)
