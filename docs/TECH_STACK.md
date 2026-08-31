# BookNParty - Technology Stack

## Core Framework

### Next.js 16.3.3

- **Why**: Latest stable release with App Router for modern React architecture
- **Features Used**:
  - App Router for file-based routing
  - Server Components by default (client components only when needed)
  - API Routes for RESTful endpoints
  - Built-in TypeScript support
  - Optimized font loading (Geist font)
  - Image optimization (next/image)
- **Documentation**: https://nextjs.org/docs

## Database & ORM

### PostgreSQL

- **Why**: Robust relational database with excellent JSON support
- **Use Cases**: All application data (users, venues, bookings, enquiries, reviews)
- **Features**: ACID compliance, complex queries, great scaling options

### Prisma 7.10.0

- **Why**: Type-safe database client with excellent DX
- **Features Used**:
  - Prisma Schema for database modeling
  - Prisma Client for type-safe queries
  - Migrations via `prisma db push` (dev) / `prisma migrate` (production)
  - Enum support for Role, VenueType, BookingStatus, EnquiryStatus
  - Relations: one-to-many, cascading deletes
  - Prisma Studio for visual database management
- **Adapter**: `@prisma/adapter-pg` (v7.10.0) for PostgreSQL driver compatibility
- **Documentation**: https://www.prisma.io/docs

### pg 8.23.0

- **Why**: Native PostgreSQL client for Node.js
- **Use Cases**: Required by Prisma Adapter for direct PostgreSQL connection
- **Package**: `pg` + `@types/pg` for TypeScript support

## Authentication

### NextAuth v5 (beta.32)

- **Why**: Industry-standard auth for Next.js with JWT support
- **Configuration**:
  - **Strategy**: JWT (session stored client-side)
  - **Provider**: Credentials (email/password with bcrypt hashing)
  - **Callbacks**: Custom JWT and session callbacks for role injection
  - **Edge Compatible**: `auth.config.ts` for middleware (edge runtime)
- **Integration**: Custom session augmentation with user ID and role
- **Documentation**: https://authjs.dev/

### bcryptjs 3.0.3

- **Why**: Password hashing for secure credential storage
- **Use Cases**: User registration, login verification
- **Security**: Salted hashing, industry-standard algorithm

## UI Framework & Styling

### React 19.2.8

- **Why**: Latest stable React with improved hooks and suspense
- **Features**: Server Components, async components, improved hydration
- **Documentation**: https://react.dev/

### Tailwind CSS 4

- **Why**: Utility-first CSS for rapid development
- **Configuration**: PostCSS plugin via `@tailwindcss/postcss`
- **Customization**: Extended theme for brand colors and shadows
- **Documentation**: https://tailwindcss.com/

### Radix UI (Primitives)

**Components Used**:

- `@radix-ui/react-dialog` (v1.1.23) - Modals (EnquiryModal, ReviewModal)
- `@radix-ui/react-dropdown-menu` (v2.1.24) - User menu, action menus
- `@radix-ui/react-select` (v2.3.7) - Form selects
- `@radix-ui/react-tabs` (v1.1.21) - Dashboard navigation
- `@radix-ui/react-avatar` (v1.2.6) - User avatars
- `@radix-ui/react-label` (v2.1.15) - Form labels
- `@radix-ui/react-separator` (v1.1.15) - Visual separators
- `@radix-ui/react-slot` (v1.3.3) - Component composition

**Why**: Accessible, unstyled components with full keyboard navigation
**Documentation**: https://www.radix-ui.com/

### SASS 1.103.1

- **Why**: Complex component styling (globals.scss)
- **Use Cases**: Global styles, CSS variables, nested selectors
- **Integration**: Next.js built-in SCSS support

## Form Handling

### React Hook Form 7.86.0

- **Why**: Performant forms with minimal re-renders
- **Features**: Controlled inputs, form state management, error handling
- **Integration**: Used in all forms (login, register, venue creation, bookings)
- **Documentation**: https://react-hook-form.com/

### Zod 3.25.76

- **Why**: TypeScript-first schema validation
- **Use Cases**:
  - Form validation with `@hookform/resolvers` (v5.9.1) integration
  - API request validation
  - Credentials validation in NextAuth
- **Documentation**: https://zod.dev/

## Media Management

### Cloudinary 2.10.1

- **Why**: Cloud-based image storage and transformation
- **Use Cases**: Venue image uploads, profile avatars
- **Documentation**: https://cloudinary.com/documentation

### next-cloudinary 6.18.8

- **Why**: Next.js-optimized Cloudinary components
- **Features**: CldUploadWidget, CldImage with automatic optimization
- **Documentation**: https://next-cloudinary.dev/

## UI Utilities

### lucide-react 1.34.0

- **Why**: Beautiful, customizable icon library
- **Use Cases**: Navigation icons, action buttons, status indicators
- **Features**: Tree-shakeable, TypeScript support
- **Documentation**: https://lucide.dev/

### Framer Motion 13.1.1

- **Why**: Production-ready animation library
- **Use Cases**: Page transitions, modal animations, hover effects
- **Documentation**: https://www.framer.com/motion/

### Swiper 14.1.0

- **Why**: Touch-enabled image carousel
- **Use Cases**: Venue image galleries on detail pages
- **Documentation**: https://swiperjs.com/

### date-fns 4.4.0

- **Why**: Modern date utility library (smaller than moment.js)
- **Use Cases**: Date formatting, booking date calculations
- **Documentation**: https://date-fns.org/

### react-hot-toast 2.6.0

- **Why**: Lightweight toast notifications
- **Use Cases**: Success/error messages for API operations
- **Documentation**: https://react-hot-toast.com/

## Utility Libraries

### clsx 2.1.1

- **Why**: Conditional className composition
- **Use Cases**: Dynamic class names based on state

### tailwind-merge 3.6.0

- **Why**: Merge Tailwind classes without conflicts
- **Pattern**: Combined in `lib/utils.ts` as `cn()` helper

### class-variance-authority 0.7.1

- **Why**: Type-safe variant-based component styling
- **Use Cases**: Button variants, card styles (via shadcn/ui pattern)
- **Documentation**: https://cva.style/

## Development Dependencies

### TypeScript 5.x

- **Why**: Type safety, better IDE support, fewer runtime errors
- **Configuration**: Strict mode enabled in `tsconfig.json`
- **Features**: Path aliases (@/), strict null checks

### ESLint 9.x + eslint-config-next 16.3.3

- **Why**: Code quality, consistent style, Next.js best practices
- **Configuration**: `eslint.config.mjs`

### ts-node 10.9.2

- **Why**: TypeScript execution for seed scripts
- **Use Cases**: `prisma/seed.ts` execution
- **Configuration**: CommonJS module mode for Prisma compatibility

### dotenv 17.4.2

- **Why**: Environment variable management for local development
- **Use Cases**: Database credentials, API keys, auth secrets

## Why This Stack?

### Type Safety

- TypeScript + Prisma = End-to-end type safety from database to UI
- Zod for runtime validation
- React Hook Form for typed form state

### Developer Experience

- Next.js App Router: Modern patterns, great DX
- Prisma Studio: Visual database browser
- Hot reload: Fast iteration
- Comprehensive TypeScript support

### Performance

- React Server Components: Reduced client-side JavaScript
- Tailwind CSS: Optimized CSS bundle (purged in production)
- Next.js Image Optimization: Automatic WebP conversion
- JWT sessions: No database lookups on auth checks

### Scalability

- PostgreSQL: Battle-tested, scales horizontally
- Prisma: Efficient query generation, connection pooling ready
- Next.js: Edge-ready, Vercel-optimized
- Cloudinary: CDN-backed image delivery

### Maintainability

- Modular architecture: Clear separation of concerns
- Component library: Radix UI primitives ensure consistency
- Prisma schema: Single source of truth for data models
- TypeScript: Catch errors at compile time

## Version Compatibility Notes

- **Next.js 16.3.3**: Requires React 19.x (canary features stable)
- **Prisma 7**: Breaking changes from v6 (requires adapter pattern)
- **NextAuth v5 (beta)**: Different API from v4 (stable enough for production)
- **Tailwind 4**: PostCSS plugin replaces JIT mode from v3

## Not Included (Yet)

### Testing (Planned for Phase 4)

- No Jest/Vitest setup
- No E2E testing (Playwright/Cypress)
- No component testing

### State Management

- Using React Context + Server Components
- No Redux/Zustand needed for current complexity

### Real-time Features

- No WebSockets (Socket.io)
- No Server-Sent Events

### Payment (Phase 4)

- Razorpay SDK integration pending

### Monitoring

- No error tracking (Sentry)
- No analytics (Google Analytics, Mixpanel)

---

**Last Updated**: August 2026  
**Total Dependencies**: 26 production + 11 development  
**Bundle Size**: Optimized with tree-shaking and code splitting
