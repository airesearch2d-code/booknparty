# BookNParty - Development Guide

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 20.x or later ([Download](https://nodejs.org/))
- **PostgreSQL** 14.x or later ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))
- **Code Editor** (VS Code recommended)

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd booknparty
```

### 2. Install Dependencies

```bash
npm install
```

This installs all packages from `package.json`.

### 3. Set Up Environment Variables

Create `.env.local` in the project root:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/booknparty"

# NextAuth
AUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (optional for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

**Generate AUTH_SECRET:**

```bash
npx auth secret
```

### 4. Set Up Database

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE booknparty;

# Exit psql
\q
```

#### Sync Prisma Schema

```bash
npx prisma db push
```

This creates all tables based on `prisma/schema.prisma`.

#### Seed Database (Optional)

```bash
npm run seed
```

This creates sample users, venues, bookings, etc. for testing.

**Default Users Created:**

- **Admin**: admin@booknparty.com / admin123
- **Owner 1**: owner1@example.com / password123
- **Owner 2**: owner2@example.com / password123
- **Customer 1**: customer1@example.com / password123
- **Customer 2**: customer2@example.com / password123
- **Customer 3**: customer3@example.com / password123

### 5. Start Development Server

```bash
npm run dev
```

Visit **http://localhost:3000**

---

## Common Commands

### Development

```bash
npm run dev          # Start dev server (hot reload)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database

```bash
npx prisma studio          # Open Prisma Studio (GUI)
npx prisma db push         # Sync schema to database (dev)
npx prisma generate        # Regenerate Prisma Client
npx prisma migrate dev     # Create migration (production)
npx prisma migrate deploy  # Apply migrations (production)
npm run seed              # Seed database with test data
```

### Prisma Studio

```bash
npx prisma studio
```

Access at **http://localhost:5555** to view/edit database records.

---

## Project Structure

```
booknparty/
├── docs/                    # Documentation
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed script
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # API endpoints
│   │   │   ├── auth/       # NextAuth handlers
│   │   │   ├── bookings/   # Booking endpoints
│   │   │   ├── enquiries/  # Enquiry endpoints
│   │   │   ├── register/   # Registration endpoint
│   │   │   ├── reviews/    # Review endpoints
│   │   │   └── venues/     # Venue endpoints
│   │   ├── dashboard/      # Role-based dashboards
│   │   │   ├── admin/      # Admin pages
│   │   │   ├── owner/      # Owner pages
│   │   │   └── customer/   # Customer pages
│   │   ├── login/          # Login page
│   │   ├── register/       # Registration page
│   │   ├── venues/         # Public venue pages
│   │   ├── globals.scss    # Global styles
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Reusable components
│   └── lib/                # Utilities
│       ├── auth.ts         # Auth utilities
│       ├── prisma.ts       # Prisma client singleton
│       └── utils.ts        # Helper functions
├── .env.local              # Environment variables (create this)
├── .instructions.md        # AI agent instructions
├── next.config.ts          # Next.js config
├── package.json            # Dependencies
├── prisma7.config.ts       # Prisma adapter config
└── tsconfig.json           # TypeScript config
```

---

## Development Workflow

### 1. Create a New Feature

```bash
# Create branch
git checkout -b feature/your-feature-name

# Make changes
# ...

# Test locally
npm run dev

# Build check
npm run build

# Commit
git add .
git commit -m "Add your feature"

# Push
git push origin feature/your-feature-name
```

### 2. Working with Database

**Modify Schema:**

1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push` (development)
3. Run `npx prisma generate` (regenerate types)

**View Data:**

```bash
npx prisma studio
```

**Reset Database (WARNING: Deletes all data):**

```bash
npx prisma db push --force-reset
npm run seed
```

### 3. Adding a New API Endpoint

1. Create `src/app/api/[endpoint]/route.ts`
2. Export GET, POST, PUT, DELETE handlers as needed
3. Use `auth()` from `@/lib/auth` for protected routes
4. Return `NextResponse.json()` with proper status codes

**Example:**

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await prisma.model.findMany();
  return NextResponse.json({ data });
}
```

### 4. Adding a New Page

1. Create `src/app/[path]/page.tsx`
2. Use Server Components by default
3. Add `"use client"` only if using hooks/interactivity

**Server Component (default):**

```typescript
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

**Client Component:**

```typescript
"use client";

import { useState } from "react";

export default function Page() {
  const [state, setState] = useState();
  return <div>Interactive content</div>;
}
```

---

## Troubleshooting

### Database Connection Issues

**Error:** `Can't reach database server`

**Solution:**

1. Verify PostgreSQL is running:
   ```bash
   # Windows (check services)
   # macOS/Linux
   pg_ctl status
   ```
2. Check `DATABASE_URL` in `.env.local`
3. Verify database exists:
   ```bash
   psql -U postgres -l
   ```

---

### Prisma Client Issues

**Error:** `@prisma/client did not initialize yet`

**Solution:**

```bash
npx prisma generate
```

---

### NextAuth Session Issues

**Error:** `JWT expired` or `No session`

**Solution:**

1. Clear cookies and login again
2. Verify `AUTH_SECRET` is set in `.env.local`
3. Check `NEXTAUTH_URL` matches your app URL

---

### Build Errors

**Error:** `Type error` during build

**Solution:**

1. Check TypeScript errors: `npm run lint`
2. Ensure all dependencies installed: `npm install`
3. Check for missing imports or type issues

---

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill
```

Or use different port:

```bash
PORT=3001 npm run dev
```

---

## Testing Your Changes

### Manual Testing Checklist

1. **Authentication**
   - ✅ Register new user
   - ✅ Login with credentials
   - ✅ Logout

2. **Venue Management (Owner)**
   - ✅ Create venue
   - ✅ Edit venue
   - ✅ Delete venue
   - ✅ Upload images

3. **Booking Flow (Customer)**
   - ✅ Browse venues
   - ✅ Create booking
   - ✅ View booking status
   - ✅ Submit review (after completion)

4. **Admin Functions**
   - ✅ Approve/reject venues
   - ✅ View all users
   - ✅ View platform stats

### Browser Testing

Test in multiple browsers:

- Chrome (primary)
- Firefox
- Safari (if on macOS)
- Edge

---

## Environment Variables Reference

| Variable                            | Required | Description                            |
| ----------------------------------- | -------- | -------------------------------------- |
| `DATABASE_URL`                      | Yes      | PostgreSQL connection string           |
| `AUTH_SECRET`                       | Yes      | NextAuth secret for JWT                |
| `NEXTAUTH_URL`                      | Yes      | App URL (http://localhost:3000 in dev) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | No       | Cloudinary cloud name                  |
| `CLOUDINARY_API_KEY`                | No       | Cloudinary API key                     |
| `CLOUDINARY_API_SECRET`             | No       | Cloudinary API secret                  |

**Phase 4 (Future):**

- `RAZORPAY_KEY_ID` - Razorpay API key
- `RAZORPAY_KEY_SECRET` - Razorpay secret
- `EMAIL_SERVICE_API_KEY` - Email service key

---

## Production Deployment

### Pre-Deployment Checklist

- ✅ All environment variables set in production
- ✅ Database migrations applied
- ✅ Build succeeds: `npm run build`
- ✅ No console errors in production mode
- ✅ Auth flow works
- ✅ Payment integration tested (Phase 4)

### Vercel Deployment (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Manual Deployment

```bash
npm run build
npm run start
```

---

## Getting Help

- **Documentation**: Check `/docs` folder
- **API Reference**: See [API_REFERENCE.md](API_REFERENCE.md)
- **Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Database**: See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

---

**Last Updated**: August 2026  
**Node Version**: 20.x  
**Next.js Version**: 16.3.3
