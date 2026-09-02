# BookNParty - Database Schema

## Overview

BookNParty uses PostgreSQL with Prisma ORM. The schema is defined in [`prisma/schema.prisma`](../prisma/schema.prisma).

## Entity Relationship Diagram

```
User (1) ──────< (N) Venue
  │                    │
  │                    │
  ├──────< (N) Booking ┤
  │                    │
  ├──────< (N) Enquiry ┤
  │                    │
  └──────< (N) Review ─┘
```

## Enums

### Role

User access levels:

```prisma
enum Role {
  ADMIN      // Platform administrator
  OWNER      // Venue owner/manager
  CUSTOMER   // Event organizer/booker
}
```

### VenueType

Categories of venues:

```prisma
enum VenueType {
  BANQUET_HALL
  ROOFTOP
  FARMHOUSE
  RESTAURANT
  CLUB
  CONFERENCE_ROOM
  OUTDOOR
  VILLA
  OTHER
}
```

### BookingStatus

Booking lifecycle states:

```prisma
enum BookingStatus {
  PENDING    // Awaiting owner confirmation
  CONFIRMED  // Owner approved booking
  CANCELLED  // Cancelled by owner or customer
  COMPLETED  // Event has occurred
}
```

### EnquiryStatus

Enquiry communication states:

```prisma
enum EnquiryStatus {
  PENDING    // Awaiting owner response
  RESPONDED  // Owner has replied
  CLOSED     // Enquiry resolved/archived
}
```

## Models

### User

Platform users (all roles).

| Field       | Type     | Constraints       | Description            |
| ----------- | -------- | ----------------- | ---------------------- |
| `id`        | String   | PK, CUID          | Unique identifier      |
| `name`      | String   | Required          | Full name              |
| `email`     | String   | Unique, Required  | Email address (login)  |
| `password`  | String   | Required          | Bcrypt hash            |
| `role`      | Role     | Default: CUSTOMER | Access level           |
| `phone`     | String   | Optional          | Contact number         |
| `avatar`    | String   | Optional          | Cloudinary URL         |
| `createdAt` | DateTime | Auto              | Registration timestamp |
| `updatedAt` | DateTime | Auto              | Last update timestamp  |

**Relations:**

- `venues`: One-to-many with Venue (as owner)
- `bookings`: One-to-many with Booking (as customer)
- `enquiries`: One-to-many with Enquiry (as customer)
- `reviews`: One-to-many with Review (as author)

**Indexes:**

- `email` (unique)

---

### Venue

Venue listings created by owners.

| Field             | Type      | Constraints      | Description                  |
| ----------------- | --------- | ---------------- | ---------------------------- |
| `id`              | String    | PK, CUID         | Unique identifier            |
| `name`            | String    | Required         | Venue name                   |
| `slug`            | String    | Unique, Required | URL-friendly identifier      |
| `description`     | String    | Text, Required   | Full description             |
| `type`            | VenueType | Required         | Category                     |
| `capacity`        | Int       | Required         | Max guest count              |
| `pricePerHour`    | Float     | Required         | Hourly rate (₹)              |
| `minBookingHours` | Int       | Default: 2       | Minimum booking duration     |
| `address`         | String    | Required         | Street address               |
| `city`            | String    | Required         | City name                    |
| `state`           | String    | Required         | State/province               |
| `pincode`         | String    | Required         | Postal code                  |
| `latitude`        | Float     | Optional         | GPS coordinate               |
| `longitude`       | Float     | Optional         | GPS coordinate               |
| `images`          | String[]  | Array            | Cloudinary URLs              |
| `amenities`       | String[]  | Array            | Features (AC, Parking, etc.) |
| `highlights`      | String[]  | Array            | Selling points               |
| `isApproved`      | Boolean   | Default: false   | Admin approval status        |
| `isActive`        | Boolean   | Default: true    | Owner can deactivate         |
| `ownerId`         | String    | FK → User        | Venue owner reference        |
| `createdAt`       | DateTime  | Auto             | Listing creation timestamp   |
| `updatedAt`       | DateTime  | Auto             | Last update timestamp        |

**Relations:**

- `owner`: Many-to-one with User
- `bookings`: One-to-many with Booking
- `enquiries`: One-to-many with Enquiry
- `reviews`: One-to-many with Review

**Indexes:**

- `slug` (unique)
- `ownerId` (foreign key)

**Cascading:**

- `onDelete: Cascade` on owner → deletes venue if owner deleted

---

### Booking

Booking requests from customers.

| Field         | Type          | Constraints      | Description                           |
| ------------- | ------------- | ---------------- | ------------------------------------- |
| `id`          | String        | PK, CUID         | Unique identifier                     |
| `venueId`     | String        | FK → Venue       | Venue reference                       |
| `customerId`  | String        | FK → User        | Customer reference                    |
| `eventDate`   | DateTime      | Required         | Event start date/time                 |
| `hours`       | Int           | Required         | Booking duration                      |
| `eventType`   | String        | Optional         | Event category (wedding, party, etc.) |
| `guestCount`  | Int           | Required         | Expected attendees                    |
| `totalAmount` | Float         | Required         | Calculated: pricePerHour × hours      |
| `status`      | BookingStatus | Default: PENDING | Current state                         |
| `paymentId`   | String        | Optional         | Payment gateway ID (planned for Phase 5) |
| `notes`       | String        | Optional         | Customer notes to owner               |
| `createdAt`   | DateTime      | Auto             | Booking request timestamp             |
| `updatedAt`   | DateTime      | Auto             | Last status change                    |

**Relations:**

- `venue`: Many-to-one with Venue
- `customer`: Many-to-one with User

**Indexes:**

- `venueId` (foreign key)
- `customerId` (foreign key)

**Business Logic:**

- `totalAmount` calculated on creation (not user-editable)
- Status transitions: PENDING → CONFIRMED/CANCELLED → COMPLETED
- Only COMPLETED bookings allow review submission

---

### Enquiry

Direct customer-to-owner messages.

| Field        | Type          | Constraints      | Description                               |
| ------------ | ------------- | ---------------- | ----------------------------------------- |
| `id`         | String        | PK, CUID         | Unique identifier                         |
| `venueId`    | String        | FK → Venue       | Venue reference                           |
| `customerId` | String        | FK → User        | Customer reference                        |
| `name`       | String        | Required         | Customer name (can differ from User.name) |
| `email`      | String        | Required         | Contact email                             |
| `phone`      | String        | Required         | Contact phone                             |
| `message`    | String        | Text, Required   | Customer's message                        |
| `eventType`  | String        | Optional         | Event category                            |
| `eventDate`  | DateTime      | Optional         | Tentative event date                      |
| `guestCount` | Int           | Optional         | Expected attendees                        |
| `response`   | String        | Text, Optional   | Owner's response                          |
| `status`     | EnquiryStatus | Default: PENDING | Current state                             |
| `createdAt`  | DateTime      | Auto             | Enquiry submission timestamp              |
| `updatedAt`  | DateTime      | Auto             | Last response/update                      |

**Relations:**

- `venue`: Many-to-one with Venue
- `customer`: Many-to-one with User

**Indexes:**

- `venueId` (foreign key)
- `customerId` (foreign key)

**Business Logic:**

- Customer fills name/email/phone (may not be logged in)
- Owner responds via dashboard (updates `response` and `status`)

---

### Review

Customer reviews for completed bookings.

| Field       | Type     | Constraints    | Description                 |
| ----------- | -------- | -------------- | --------------------------- |
| `id`        | String   | PK, CUID       | Unique identifier           |
| `venueId`   | String   | FK → Venue     | Venue reference             |
| `userId`    | String   | FK → User      | Reviewer reference          |
| `rating`    | Int      | Required, 1-5  | Star rating                 |
| `comment`   | String   | Text, Required | Review text                 |
| `createdAt` | DateTime | Auto           | Review submission timestamp |

**Relations:**

- `venue`: Many-to-one with Venue
- `user`: Many-to-one with User

**Indexes:**

- `venueId` (foreign key)
- `userId` (foreign key)

**Business Logic:**

- Validation: User must have COMPLETED booking for venue
- Constraint: One review per user per venue (checked in API)
- Rating must be 1-5 (validated in API and frontend)

---

## Key Relationships

### User → Venue (Owner)

- **Type**: One-to-many
- **Cascade**: Deleting user deletes all their venues
- **Use Case**: Venue owners can manage multiple properties

### User → Booking (Customer)

- **Type**: One-to-many
- **Cascade**: No (bookings preserved for historical data)
- **Use Case**: Customers can have multiple bookings

### Venue → Booking

- **Type**: One-to-many
- **Cascade**: No (bookings preserved)
- **Use Case**: Venues can be booked multiple times

### Venue → Review

- **Type**: One-to-many
- **Cascade**: No (reviews preserved)
- **Use Case**: Aggregate ratings for venues

### User → Review

- **Type**: One-to-many
- **Cascade**: No (reviews preserved)
- **Use Case**: Track user's review history

---

## Data Constraints

### Application-Level (Enforced in API)

- Review rating: 1 ≤ rating ≤ 5
- Booking hours: Must be ≥ venue.minBookingHours
- Review eligibility: User must have COMPLETED booking for venue
- Unique review: One review per user per venue

### Database-Level (Enforced in Prisma)

- Email uniqueness: `@unique` on User.email
- Slug uniqueness: `@unique` on Venue.slug
- Required fields: Non-nullable columns
- Enum values: Strict enum constraints

---

## Seed Data

The [`prisma/seed.ts`](../prisma/seed.ts) script creates:

- 1 Admin user (email: admin@booknparty.com)
- 2 Owner users (each with 2 venues)
- 3 Customer users
- Sample bookings (various statuses)
- Sample enquiries
- Sample reviews

**Run with:** `npm run seed`

---

## Migration Strategy

### Development

```bash
npx prisma db push
```

Syncs schema changes directly (no migration files). Fast iteration.

### Production (Recommended)

```bash
npx prisma migrate dev --name description_of_change
npx prisma migrate deploy
```

Creates migration files for version control and audit trail.

---

## Prisma Client Generation

After schema changes:

```bash
npx prisma generate
```

This regenerates TypeScript types for type-safe queries.

---

## Prisma Studio

Visual database browser:

```bash
npx prisma studio
```

Access at http://localhost:5555 to view/edit data with a GUI.

---

## Common Query Patterns

### Get Venue with Reviews

```typescript
const venue = await prisma.venue.findUnique({
  where: { id: venueId },
  include: {
    owner: true,
    reviews: {
      include: { user: true },
      orderBy: { createdAt: "desc" },
    },
  },
});
```

### Get User's Bookings

```typescript
const bookings = await prisma.booking.findMany({
  where: { customerId: userId },
  include: { venue: true },
  orderBy: { eventDate: "desc" },
});
```

### Calculate Average Rating

```typescript
const avgRating = await prisma.review.aggregate({
  where: { venueId },
  _avg: { rating: true },
});
```

---

**Last Updated**: September 2, 2026  
**Schema Version**: Phase 4 execution baseline  
**Total Models**: 5 (User, Venue, Booking, Enquiry, Review)
