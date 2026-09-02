# BookNParty - API Reference

Complete reference for all REST API endpoints.

**Base URL**: `http://localhost:3000/api` (development)

---

## Authentication

All protected endpoints require authentication via NextAuth session cookies. Use `auth()` helper to validate sessions.

**Session Structure:**

```typescript
{
  user: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "OWNER" | "CUSTOMER";
  }
}
```

---

## Endpoints Overview

| Endpoint                     | Methods          | Auth                                 | Description                 |
| ---------------------------- | ---------------- | ------------------------------------ | --------------------------- |
| `/api/auth/[...nextauth]`    | GET, POST        | Public                               | NextAuth handlers           |
| `/api/register`              | POST             | Public                               | User registration           |
| `/api/venues`                | GET, POST        | GET: Public, POST: Owner             | List/create venues          |
| `/api/venues/[id]`           | GET, PUT, DELETE | GET: Public, PUT/DELETE: Owner/Admin | Venue details/update/delete |
| `/api/venues/by-slug/[slug]` | GET              | Public                               | Get venue by slug           |
| `/api/bookings`              | GET, POST        | Authenticated                        | List/create bookings        |
| `/api/bookings/[id]`         | GET, PATCH       | Authenticated                        | Booking details/update      |
| `/api/enquiries`             | GET, POST        | Authenticated                        | List/create enquiries       |
| `/api/enquiries/[id]`        | PATCH            | Owner/Admin                          | Respond to enquiry          |
| `/api/reviews`               | GET, POST        | GET: Public, POST: Customer          | List/create reviews         |
| `/api/user/profile`          | GET, PATCH       | Authenticated                        | Get/update current profile  |
| `/api/user/change-password`  | POST             | Authenticated                        | Update account password     |

---

## Auth Endpoints

### POST /api/auth/signin

**Description**: Login with credentials  
**Handler**: NextAuth (managed automatically)

**Usage:**

```typescript
import { signIn } from "next-auth/react";

await signIn("credentials", {
  email: "user@example.com",
  password: "password123",
  redirect: false,
});
```

---

### POST /api/register

**Description**: Register new user account  
**Auth**: None (public)

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "CUSTOMER",
  "phone": "+91 9876543210"
}
```

**Response (201):**

```json
{
  "user": {
    "id": "clxxxxxx",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER"
  }
}
```

**Errors:**

- `400`: Email already registered or validation failed

---

## Venue Endpoints

## User Account Endpoints

### GET /api/user/profile

**Description**: Get current authenticated user profile  
**Auth**: Required

### PATCH /api/user/profile

**Description**: Update current authenticated profile (name, email, phone, avatar)  
**Auth**: Required

### POST /api/user/change-password

**Description**: Change user password with current-password verification  
**Auth**: Required

---

## Venue Endpoints

### GET /api/venues

**Description**: Get filtered list of venues  
**Auth**: None (public)

**Query Parameters:**

- `city` (string): Filter by city
- `type` (VenueType): Filter by venue type
- `minPrice` (number): Minimum price per hour
- `maxPrice` (number): Maximum price per hour
- `capacity` (number): Minimum capacity
- `page` (number): Page number (default: 1)

**Example:**

```
GET /api/venues?city=Mumbai&type=BANQUET_HALL&capacity=100&page=1
```

**Response (200):**

```json
{
  "venues": [
    {
      "id": "clxxxxxx",
      "name": "Grand Ballroom",
      "slug": "grand-ballroom-xyz",
      "type": "BANQUET_HALL",
      "capacity": 200,
      "pricePerHour": 15000,
      "city": "Mumbai",
      "images": ["https://..."],
      "amenities": ["AC", "Parking"],
      "isApproved": true,
      "owner": {
        "name": "Owner Name"
      }
    }
  ],
  "total": 45,
  "pages": 3
}
```

---

### POST /api/venues

**Description**: Create new venue  
**Auth**: OWNER role required

**Request Body:**

```json
{
  "name": "Sunset Rooftop",
  "description": "Beautiful rooftop with city views...",
  "type": "ROOFTOP",
  "capacity": 150,
  "pricePerHour": 12000,
  "minBookingHours": 3,
  "address": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "images": ["https://cloudinary.com/..."],
  "amenities": ["AC", "Parking", "DJ Setup"],
  "highlights": ["City views", "Modern decor"]
}
```

**Response (201):**

```json
{
  "venue": {
    "id": "clxxxxxx",
    "slug": "sunset-rooftop-abc123",
    "name": "Sunset Rooftop",
    "isApproved": false,
    "ownerId": "clxxxxxx"
  }
}
```

**Errors:**

- `401`: Not authenticated or not an OWNER

---

### GET /api/venues/[id]

**Description**: Get single venue by ID  
**Auth**: None (public)

**Response (200):**

```json
{
  "venue": {
    "id": "clxxxxxx",
    "name": "Grand Ballroom",
    "slug": "grand-ballroom-xyz",
    "description": "...",
    "type": "BANQUET_HALL",
    "capacity": 200,
    "pricePerHour": 15000,
    "owner": {
      "id": "clxxxxxx",
      "name": "Owner Name",
      "phone": "+91 9876543210"
    },
    "reviews": [
      {
        "id": "clxxxxxx",
        "rating": 5,
        "comment": "Amazing venue!",
        "user": { "name": "Customer Name" }
      }
    ]
  }
}
```

**Errors:**

- `404`: Venue not found

---

### PUT /api/venues/[id]

**Description**: Update venue  
**Auth**: OWNER (own venue) or ADMIN

**Request Body:**

```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "pricePerHour": 18000
}
```

**Response (200):**

```json
{
  "venue": {
    "id": "clxxxxxx",
    "name": "Updated Name",
    "isApproved": false
  }
}
```

**Notes:**

- Owner edits reset `isApproved` to `false`
- Admin edits don't reset approval

**Errors:**

- `401`: Unauthorized
- `403`: Not your venue
- `404`: Venue not found

---

### DELETE /api/venues/[id]

**Description**: Delete venue  
**Auth**: OWNER (own venue) or ADMIN

**Response (200):**

```json
{
  "message": "Venue deleted successfully"
}
```

**Errors:**

- `401`: Unauthorized
- `403`: Not your venue

---

### GET /api/venues/by-slug/[slug]

**Description**: Get venue by slug (for public URLs)  
**Auth**: None

**Response (200):**

```json
{
  "venue": {
    /* same as GET /venues/[id] */
  }
}
```

---

## Booking Endpoints

### GET /api/bookings

**Description**: Get bookings (role-filtered)  
**Auth**: Authenticated

**Role Filtering:**

- **Customer**: Returns only their bookings
- **Owner**: Returns bookings for their venues
- **Admin**: Returns all bookings

**Query Parameters:**

- `venueId` (string): Filter by venue

**Response (200):**

```json
{
  "bookings": [
    {
      "id": "clxxxxxx",
      "venueId": "clxxxxxx",
      "customerId": "clxxxxxx",
      "eventDate": "2026-09-15T10:00:00Z",
      "hours": 4,
      "eventType": "Wedding",
      "guestCount": 150,
      "totalAmount": 60000,
      "status": "PENDING",
      "notes": "Need catering",
      "venue": {
        "name": "Grand Ballroom",
        "city": "Mumbai"
      },
      "customer": {
        "name": "John Doe",
        "phone": "+91 9876543210"
      }
    }
  ]
}
```

---

### POST /api/bookings

**Description**: Create booking  
**Auth**: CUSTOMER role required

**Request Body:**

```json
{
  "venueId": "clxxxxxx",
  "eventDate": "2026-09-15T10:00:00Z",
  "hours": 4,
  "eventType": "Wedding",
  "guestCount": 150,
  "notes": "Need catering"
}
```

**Response (201):**

```json
{
  "booking": {
    "id": "clxxxxxx",
    "totalAmount": 60000,
    "status": "PENDING"
  }
}
```

**Business Logic:**

- `totalAmount` = `venue.pricePerHour × hours`
- Default status: `PENDING`

**Errors:**

- `400`: Invalid date or hours < minBookingHours
- `401`: Not authenticated or not a CUSTOMER

---

### GET /api/bookings/[id]

**Description**: Get booking details  
**Auth**: Authenticated (own booking, own venue, or admin)

**Response (200):**

```json
{
  "booking": {
    /* same structure as GET /bookings */
  }
}
```

---

### PATCH /api/bookings/[id]

**Description**: Update booking status  
**Auth**: OWNER (for their venue) or ADMIN

**Request Body:**

```json
{
  "status": "CONFIRMED"
}
```

**Allowed Status Transitions:**

- `PENDING` → `CONFIRMED`
- `PENDING` → `CANCELLED`
- `CONFIRMED` → `CANCELLED`
- `CONFIRMED` → `COMPLETED`

**Response (200):**

```json
{
  "booking": {
    "id": "clxxxxxx",
    "status": "CONFIRMED"
  }
}
```

**Errors:**

- `401`: Unauthorized
- `403`: Not your venue's booking

---

## Enquiry Endpoints

### GET /api/enquiries

**Description**: Get enquiries (role-filtered)  
**Auth**: Authenticated

**Role Filtering:**

- **Customer**: Returns enquiries they sent
- **Owner**: Returns enquiries for their venues
- **Admin**: Returns all enquiries

**Query Parameters:**

- `venueId` (string): Filter by venue

**Response (200):**

```json
{
  "enquiries": [
    {
      "id": "clxxxxxx",
      "venueId": "clxxxxxx",
      "customerId": "clxxxxxx",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+91 9876543210",
      "message": "Interested in booking for corporate event",
      "eventType": "Corporate",
      "eventDate": "2026-09-20T09:00:00Z",
      "guestCount": 100,
      "response": "Thank you for your enquiry...",
      "status": "RESPONDED",
      "venue": {
        "name": "Conference Hall"
      },
      "createdAt": "2026-08-01T12:00:00Z"
    }
  ]
}
```

---

### POST /api/enquiries

**Description**: Send enquiry  
**Auth**: Authenticated

**Request Body:**

```json
{
  "venueId": "clxxxxxx",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+91 9876543210",
  "message": "Interested in booking",
  "eventType": "Corporate",
  "eventDate": "2026-09-20T09:00:00Z",
  "guestCount": 100
}
```

**Response (201):**

```json
{
  "enquiry": {
    "id": "clxxxxxx",
    "status": "PENDING"
  }
}
```

---

### PATCH /api/enquiries/[id]

**Description**: Respond to enquiry  
**Auth**: OWNER (for their venue) or ADMIN

**Request Body:**

```json
{
  "response": "Thank you for your enquiry. We have availability...",
  "status": "RESPONDED"
}
```

**Response (200):**

```json
{
  "enquiry": {
    "id": "clxxxxxx",
    "response": "Thank you for your enquiry...",
    "status": "RESPONDED"
  }
}
```

**Errors:**

- `401`: Unauthorized
- `403`: Not your venue's enquiry

---

## Review Endpoints

### GET /api/reviews

**Description**: Get reviews  
**Auth**: None (public)

**Query Parameters:**

- `venueId` (string, required): Filter by venue

**Response (200):**

```json
{
  "reviews": [
    {
      "id": "clxxxxxx",
      "venueId": "clxxxxxx",
      "userId": "clxxxxxx",
      "rating": 5,
      "comment": "Amazing venue! Great service.",
      "user": {
        "name": "John Doe",
        "avatar": "https://..."
      },
      "createdAt": "2026-08-15T14:30:00Z"
    }
  ],
  "average": 4.5,
  "count": 12
}
```

---

### POST /api/reviews

**Description**: Submit review  
**Auth**: CUSTOMER role required

**Validation:**

- User must have COMPLETED booking for the venue
- One review per user per venue

**Request Body:**

```json
{
  "venueId": "clxxxxxx",
  "rating": 5,
  "comment": "Amazing venue!"
}
```

**Response (201):**

```json
{
  "review": {
    "id": "clxxxxxx",
    "rating": 5,
    "comment": "Amazing venue!"
  }
}
```

**Errors:**

- `400`: No completed booking found
- `400`: Review already submitted
- `400`: Invalid rating (must be 1-5)
- `401`: Not authenticated or not a CUSTOMER

---

## Status Codes

| Code  | Meaning               | Usage                                      |
| ----- | --------------------- | ------------------------------------------ |
| `200` | OK                    | Successful GET, PUT, PATCH, DELETE         |
| `201` | Created               | Successful POST                            |
| `400` | Bad Request           | Validation error, missing fields           |
| `401` | Unauthorized          | Not authenticated                          |
| `403` | Forbidden             | Authenticated but insufficient permissions |
| `404` | Not Found             | Resource doesn't exist                     |
| `500` | Internal Server Error | Unexpected server error                    |

---

## Error Response Format

All errors return JSON:

```json
{
  "error": "Descriptive error message",
  "details": "Additional context (optional)"
}
```

---

## Rate Limiting

Currently no rate limiting implemented (planned for production hardening in Phase 5).

---

## CORS

All API routes allow same-origin requests only. CORS not yet configured for external clients.

---

**Last Updated**: September 2, 2026  
**API Version**: v1 (implicit)  
**Base URL**: `/api`
