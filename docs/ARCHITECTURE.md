# BookNParty - Architecture

## Overview

BookNParty follows a modern **Next.js App Router** architecture with **Server Components** by default, **API Routes** for backend logic, and **Prisma ORM** for type-safe database access.

---

## Architecture Principles

1. **Server-First**: Use Server Components by default for better performance
2. **Type Safety**: TypeScript + Prisma for end-to-end type safety
3. **Role-Based Access**: Separate dashboards and permissions per user role
4. **RESTful APIs**: Standard HTTP methods and status codes
5. **Component Reusability**: Shared components in `/src/components`
6. **Single Source of Truth**: Prisma schema defines all data models

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│  - React 19 Components                                   │
│  - Tailwind CSS Styling                                  │
│  - NextAuth Session Management                           │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ HTTP Requests
                  ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js 16 (Server)                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │          App Router (src/app/)                   │   │
│  │  - Server Components (default)                   │   │
│  │  - Client Components ("use client")              │   │
│  │  - API Routes (api/*/route.ts)                   │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │       Middleware (middleware.ts)                 │   │
│  │  - Auth validation                               │   │
│  │  - Route protection                              │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ Prisma Client
                  ▼
┌─────────────────────────────────────────────────────────┐
│                PostgreSQL Database                       │
│  - Users, Venues, Bookings, Enquiries, Reviews          │
└─────────────────────────────────────────────────────────┘
```

---

## Folder Structure

### `/src/app` - Next.js App Router

```
app/
├── api/                    # API Routes (Backend)
│   ├── auth/               # NextAuth endpoints
│   ├── bookings/           # Booking CRUD
│   ├── enquiries/          # Enquiry CRUD
│   ├── register/           # User registration
│   ├── reviews/            # Review CRUD
│   └── venues/             # Venue CRUD
├── dashboard/              # Protected pages
│   ├── admin/              # Admin-only pages
│   ├── owner/              # Owner-only pages
│   └── customer/           # Customer-only pages
├── login/                  # Public login page
├── register/               # Public registration page
├── venues/                 # Public venue pages
│   ├── [slug]/             # Dynamic venue detail
│   │   ├── book/           # Booking form
│   │   └── page.tsx        # Venue detail page
│   └── page.tsx            # Venue listing
├── globals.scss            # Global styles
├── layout.tsx              # Root layout (Navbar, Footer)
└── page.tsx                # Homepage
```

**Pattern:**

- `page.tsx` = Route page
- `layout.tsx` = Shared layout for nested routes
- `route.ts` = API endpoint

---

### `/src/components` - Reusable Components

```
components/
├── AddVenueForm.tsx        # Venue creation form
├── DashboardLayout.tsx     # Dashboard sidebar layout
├── EditVenueForm.tsx       # Venue editing form
├── EnquiryModal.tsx        # Enquiry submission modal
├── Footer.tsx              # Site footer
├── Navbar.tsx              # Site header/navigation
├── OwnerBookingActions.tsx # Confirm/Cancel buttons
├── OwnerEnquiryResponse.tsx # Enquiry response form
├── ReviewModal.tsx         # Review submission modal
├── VenueCard.tsx           # Venue listing card
└── VenueGallery.tsx        # Image carousel
```

**Conventions:**

- PascalCase file names
- One component per file
- Props typed with TypeScript interfaces
- `"use client"` directive only when needed

---

### `/src/lib` - Utility Functions

```
lib/
├── auth.ts                 # NextAuth configuration
├── prisma.ts               # Prisma client singleton
└── utils.ts                # Helper functions (cn, etc.)
```

**Purpose:**

- **auth.ts**: Exports `auth()` helper and NextAuth config
- **prisma.ts**: Single Prisma client instance (prevents connection overflow)
- **utils.ts**: Utility functions (className merging, etc.)

---

## Key Patterns

### 1. Server Components (Default)

```typescript
// src/app/venues/page.tsx
import { prisma } from "@/lib/prisma";

export default async function VenuesPage() {
  // Fetch data directly in component
  const venues = await prisma.venue.findMany({
    where: { isApproved: true },
  });

  return (
    <div>
      {venues.map((venue) => (
        <VenueCard key={venue.id} venue={venue} />
      ))}
    </div>
  );
}
```

**Benefits:**

- No client-side JavaScript needed
- Direct database access
- Better SEO
- Faster initial load

---

### 2. Client Components (Interactive)

```typescript
// src/components/ReviewModal.tsx
"use client";

import { useState } from "react";

export default function ReviewModal() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    // API call
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Interactive elements */}
    </form>
  );
}
```

**When to use:**

- Forms with state
- onClick handlers
- useEffect, useState, etc.
- Third-party libraries requiring `window`

---

### 3. API Routes

```typescript
// src/app/api/venues/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");

  const venues = await prisma.venue.findMany({
    where: city ? { city } : undefined,
  });

  return NextResponse.json({ venues });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session || (session.user as any).role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const venue = await prisma.venue.create({ data: body });

  return NextResponse.json({ venue }, { status: 201 });
}
```

**Conventions:**

- Export functions: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- Use `auth()` for protected routes
- Return `NextResponse.json()`
- Proper HTTP status codes

---

### 4. Authentication & Authorization

#### Authentication Check

```typescript
import { auth } from "@/lib/auth";

const session = await auth();
if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

#### Role Check

```typescript
const session = await auth();
if ((session.user as any).role !== "ADMIN") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

#### Accessing User Info

```typescript
const userId = (session.user as any).id;
const userRole = (session.user as any).role;
```

---

### 5. Database Access

#### Always Use Singleton

```typescript
import { prisma } from "@/lib/prisma";
```

**Never:**

```typescript
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient(); // ❌ Creates new connection
```

#### Type-Safe Queries

```typescript
// Prisma provides full TypeScript types
const venue = await prisma.venue.findUnique({
  where: { id: venueId },
  include: {
    owner: true, // Include related owner
    reviews: true, // Include related reviews
  },
});

// venue.owner is typed!
console.log(venue.owner.name);
```

---

### 6. Form Handling

#### Client-Side Form (React Hook Form + Zod)

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function LoginForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    // Submit to API
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

---

### 7. Styling Patterns

#### Tailwind Classes

```typescript
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold">Title</h2>
</div>
```

#### Conditional Classes (with `cn`)

```typescript
import { cn } from "@/lib/utils";

<button
  className={cn(
    "px-4 py-2 rounded",
    isPrimary ? "bg-blue-600 text-white" : "bg-gray-200",
    isDisabled && "opacity-50 cursor-not-allowed"
  )}
>
  Click Me
</button>
```

---

## Data Flow

### 1. Server Component → Database → Render

```
User visits /venues
    ↓
VenuesPage (Server Component) runs on server
    ↓
Fetches venues from database via Prisma
    ↓
Renders HTML with venue data
    ↓
Sends HTML to client (no JavaScript needed)
```

### 2. Client Component → API → Database → Response

```
User fills booking form
    ↓
Client component submits form
    ↓
POST /api/bookings
    ↓
API route validates session
    ↓
Creates booking in database
    ↓
Returns JSON response
    ↓
Client shows success message
```

---

## Role-Based Access Control

### Dashboard Routes

| Route                   | Admin | Owner | Customer |
| ----------------------- | ----- | ----- | -------- |
| `/dashboard/admin/*`    | ✅    | ❌    | ❌       |
| `/dashboard/owner/*`    | ❌    | ✅    | ❌       |
| `/dashboard/customer/*` | ❌    | ❌    | ✅       |

### API Permissions

| Endpoint                   | Admin | Owner          | Customer |
| -------------------------- | ----- | -------------- | -------- |
| `POST /api/venues`         | ✅    | ✅             | ❌       |
| `PUT /api/venues/[id]`     | ✅    | ✅ (own)       | ❌       |
| `DELETE /api/venues/[id]`  | ✅    | ✅ (own)       | ❌       |
| `POST /api/bookings`       | ❌    | ❌             | ✅       |
| `PATCH /api/bookings/[id]` | ✅    | ✅ (own venue) | ❌       |
| `POST /api/reviews`        | ❌    | ❌             | ✅       |

---

## Error Handling

### API Routes

```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation
    if (!body.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Business logic
    const result = await prisma.model.create({ data: body });

    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### Client Components

```typescript
"use client";

const handleSubmit = async (data) => {
  try {
    const res = await fetch("/api/endpoint", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      toast.error(error.message);
      return;
    }

    toast.success("Success!");
  } catch (error) {
    toast.error("Something went wrong");
  }
};
```

---

## Performance Optimizations

### 1. Server Components

- Reduce client-side JavaScript
- Direct database access (no API calls)

### 2. Image Optimization

```typescript
import Image from "next/image";

<Image
  src={venue.images[0]}
  alt={venue.name}
  width={400}
  height={300}
  loading="lazy"
/>
```

### 3. Prisma Select

```typescript
// Only fetch needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});
```

### 4. Pagination

```typescript
const page = parseInt(searchParams.get("page") || "1");
const limit = 20;

const venues = await prisma.venue.findMany({
  take: limit,
  skip: (page - 1) * limit,
});
```

---

## Security Best Practices

1. **Never expose secrets**: Use `.env.local` for sensitive data
2. **Validate all inputs**: Use Zod schemas
3. **Check authentication**: Use `auth()` in API routes
4. **Verify ownership**: Check user owns resource before edit/delete
5. **Hash passwords**: Use bcryptjs (already implemented)
6. **Sanitize output**: Prisma handles SQL injection, but validate file uploads

---

## Common Gotchas

### 1. Server vs Client Components

- ❌ Can't use `useState` in Server Component
- ❌ Can't `await` in Client Component (top-level)
- ✅ Client Components can render Server Components as children

### 2. Prisma Client

- ❌ Don't create new PrismaClient instances
- ✅ Always import from `@/lib/prisma`

### 3. NextAuth Session

- ❌ Session is null on unauthenticated requests
- ✅ Always check `if (!session)` before accessing user

### 4. Environment Variables

- ❌ Client can't access server-only variables
- ✅ Use `NEXT_PUBLIC_*` prefix for client-accessible vars

---

## File Naming Conventions

| Type       | Convention | Example               |
| ---------- | ---------- | --------------------- |
| Components | PascalCase | `VenueCard.tsx`       |
| Utils      | camelCase  | `auth.ts`, `utils.ts` |
| API Routes | route.ts   | `route.ts`            |
| Pages      | page.tsx   | `page.tsx`            |
| Layouts    | layout.tsx | `layout.tsx`          |

---

**Last Updated**: August 2026  
**Architecture**: Next.js 16 App Router + Server Components  
**Database**: PostgreSQL + Prisma 7
