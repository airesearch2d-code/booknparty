# BookNParty - Phase 5 Roadmap

## Overview

Phase 5 introduces an admin-managed content system (a lightweight CMS) so the platform's static and editorial pages no longer need code changes to update. Phase 4 is complete (see [PHASE_4_ROADMAP.md](PHASE_4_ROADMAP.md)). Payment integration and further production hardening (previously scoped as "Phase 5") has been renumbered to **Phase 6** (see [PHASE_6_ROADMAP.md](PHASE_6_ROADMAP.md)) to make room for this content-management work.

**Scope**: Admin-manageable **About Us**, **Contact**, **Privacy Policy**, and **Terms of Service** static pages, plus a full **Blog** (list + post CRUD), and a working **Contact form** that notifies the admin by email. All five are already linked from the site [Footer](../src/components/Footer.tsx) (`/about`, `/blog`, `/contact`, `/privacy`, `/terms`) but the routes don't exist yet.

**Current Status**: Not started  
**Target Start**: Now (Phase 4 complete)  
**Estimated Duration**: 1-2 weeks  
**Priority**: High (footer links are currently dead; also unblocks marketing/SEO content updates without a code deploy)

---

## Key Decisions

- **Content format**: Markdown, authored via a plain textarea with a live preview pane (rendered with `react-markdown` + `remark-gfm`). No WYSIWYG editor (e.g. TipTap) — keeps dependencies and integration work minimal, consistent with the rest of the admin UI (plain `useState` forms, no rich editors anywhere else in the codebase).
- **Contact page**: Content (address/hours/etc., admin-edited) **plus** a working contact form. Submissions are stored in a `ContactSubmission` table and trigger an admin notification email via the existing Resend integration.
- **Blog**: Flat list of posts — no categories/tags in this phase (can be added later without breaking changes).
- **Core page slugs are protected**: `about`, `contact`, `privacy`, `terms` are seeded on setup and cannot be renamed or deleted via the admin UI/API, to guarantee the Footer links never 404. Admins can still create additional custom pages beyond these four.

---

## Architecture Summary

### Database (Prisma)

Three new models, following existing schema conventions (`String @id @default(cuid())`, `createdAt`/`updatedAt`, `@db.Text` for long content):

- **`Page`** — `slug` (unique), `title`, `content` (markdown), `metaDescription`, `isPublished`, `updatedBy` relation → `User`. Used for About/Contact/Privacy/Terms and any future static pages.
- **`BlogPost`** — `title`, `slug` (unique), `excerpt`, `content` (markdown), `featuredImage` (Cloudinary URL), `isPublished`, `publishedAt`, `author` relation → `User`.
- **`ContactSubmission`** — `name`, `email`, `phone`, `message`, `isRead`.

`User` gains back-relations: `pages Page[]`, `blogPosts BlogPost[]`.

### Public Routes (Server Components, Prisma queried directly — no self-API calls)

- `/about`, `/privacy`, `/terms` — fetch `Page` by fixed slug, `notFound()` if missing/unpublished, `generateMetadata()` from title/metaDescription, rendered via a shared `MarkdownContent` component.
- `/contact` — same `Page` pattern for slug `contact`, plus a `<ContactForm />` client component below the content.
- `/blog` — paginated grid of published posts (featured image, title, excerpt, publish date), same pagination pattern as `/venues`.
- `/blog/[slug]` — full post detail, published-only, `generateMetadata()`, markdown rendering.

### Admin Routes (ADMIN role only, mirrors the Venues CRUD pattern)

- `/dashboard/admin/pages` — list, `/pages/[id]/edit`, `/pages/new` (for extra custom pages).
- `/dashboard/admin/blog` — list, `/blog/[id]/edit`, `/blog/new` (title/excerpt/content/featured image/publish toggle).
- `/dashboard/admin/contact-submissions` — list submissions, mark read, delete.
- New nav items in `DashboardLayout`'s `navItems.ADMIN`: **Pages**, **Blog**, **Messages**.

### API Routes

- `GET/POST /api/pages`, `GET/PUT/DELETE /api/pages/[id]` (admin only; DELETE blocked for the 4 core slugs).
- `GET/POST /api/blog` (GET public for published posts, paginated), `GET/PUT/DELETE /api/blog/[id]` (admin only).
- `POST /api/blog/upload-image` — Cloudinary featured-image upload (folder `booknparty/blog`), mirrors the existing avatar upload endpoint.
- `POST /api/contact` (public, zod-validated, creates `ContactSubmission` + sends admin notification email), `GET /api/contact` (admin list), `PATCH/DELETE /api/contact/[id]` (admin).

### Email

- New `sendContactFormSubmission(name, email, phone, message)` in `src/lib/email.ts`, following the existing `baseLayout()` template pattern, guarded by `RESEND_API_KEY` (no-op if unset) and sent to a new `CONTACT_NOTIFICATION_EMAIL` env var.

### New Dependency

- `react-markdown` + `remark-gfm` (no markdown/rich-text library currently installed).

---

## Phase 5 Goals

1. Replace the five dead Footer links (`/about`, `/blog`, `/contact`, `/privacy`, `/terms`) with real, admin-editable pages
2. Let admins update marketing/legal copy without a code deploy
3. Ship a simple blog the admin can publish posts to
4. Capture contact-form leads with an email notification to the admin
5. Keep scope minimal: Markdown content, no WYSIWYG editor, no blog categories/tags in this phase

---

## 🔴 Priority 1: Data Layer

### Feature: Prisma Models — `Page`, `BlogPost`, `ContactSubmission`

**Status**: Not Started  
**Estimated Effort**: 1-2 hours  
**Priority**: P0 (blocks everything else)

**Schema additions** (`prisma/schema.prisma`), following existing conventions:

```prisma
model Page {
  id              String   @id @default(cuid())
  slug            String   @unique
  title           String
  content         String   @db.Text
  metaDescription String?
  isPublished     Boolean  @default(true)
  updatedBy       User?    @relation(fields: [updatedById], references: [id])
  updatedById     String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model BlogPost {
  id            String    @id @default(cuid())
  title         String
  slug          String    @unique
  excerpt       String?
  content       String    @db.Text
  featuredImage String?
  isPublished   Boolean   @default(false)
  publishedAt   DateTime?
  author        User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId      String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model ContactSubmission {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String?
  message   String   @db.Text
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

Add to `User`: `pages Page[]`, `blogPosts BlogPost[]`.

**Tasks:**

- [ ] Add the three models + `User` back-relations to `prisma/schema.prisma`
- [ ] `npx prisma db push` then `npx prisma generate` (both required — see repo memory notes)
- [ ] Extend `prisma/seed.ts` to upsert the 4 core `Page` rows (`about`, `contact`, `privacy`, `terms`) with placeholder markdown content, plus one sample published `BlogPost`
- [ ] `npm install react-markdown remark-gfm`

**Acceptance Criteria:**

- [ ] `npm run seed` populates all 4 core pages without error
- [ ] `npx prisma generate` produces working types for `prisma.page`, `prisma.blogPost`, `prisma.contactSubmission`

---

## 🟠 Priority 2: Admin CRUD — Pages & Blog

### Feature: Admin Page Management

**Status**: Not Started  
**Estimated Effort**: 3-4 hours  
**Priority**: P1

**Files to Create:**

- `src/app/api/pages/route.ts` — GET (admin: list all), POST (admin: create, zod-validated slug)
- `src/app/api/pages/[id]/route.ts` — GET/PUT/DELETE (admin only; DELETE rejected for the 4 core slugs)
- `src/app/dashboard/admin/pages/page.tsx` — list view (title, slug, published badge, updated date)
- `src/app/dashboard/admin/pages/[id]/edit/page.tsx` and `.../pages/new/page.tsx`
- `src/components/EditPageForm.tsx` — title, slug (locked for core pages), markdown textarea + preview toggle, metaDescription, isPublished checkbox
- `src/components/MarkdownContent.tsx` — shared `react-markdown` + `remark-gfm` renderer, used by both the admin preview and all public pages

**Acceptance Criteria:**

- [ ] Admin can edit About/Contact/Privacy/Terms content and see it reflected on the public route immediately
- [ ] Admin can create an additional custom page (e.g. `/faq`) via "New Page"
- [ ] Attempting to delete a core page (about/contact/privacy/terms) is blocked with a clear error

### Feature: Admin Blog Management

**Status**: Not Started  
**Estimated Effort**: 4-5 hours  
**Priority**: P1

**Files to Create:**

- `src/app/api/blog/route.ts` — GET (public: published only, paginated like `/api/venues`), POST (admin create, slug via `generateSlug(title)`)
- `src/app/api/blog/[id]/route.ts` — GET/PUT/DELETE (admin only)
- `src/app/api/blog/upload-image/route.ts` — Cloudinary featured-image upload (folder `booknparty/blog`), mirrors `upload-avatar/route.ts`
- `src/app/dashboard/admin/blog/page.tsx` — list posts (title, draft/published badge, publishedAt)
- `src/components/AddBlogPostForm.tsx` / `src/components/EditBlogPostForm.tsx` — title, excerpt, markdown content + preview, featured image upload, isPublished toggle
- `src/app/dashboard/admin/blog/new/page.tsx` and `.../blog/[id]/edit/page.tsx`

**Acceptance Criteria:**

- [ ] Admin can create, edit, publish/unpublish, and delete blog posts
- [ ] Featured image uploads to Cloudinary and displays on the blog list/detail pages
- [ ] Draft posts are not visible on the public `/blog` routes

---

## 🟡 Priority 3: Contact Form

### Feature: Contact Form + Submissions Inbox

**Status**: Not Started  
**Estimated Effort**: 2-3 hours  
**Priority**: P2

**Files to Create:**

- `src/lib/email.ts` — add `sendContactFormSubmission(name, email, phone, message)`, guarded by `RESEND_API_KEY`, sent to a new `CONTACT_NOTIFICATION_EMAIL` env var
- `src/app/api/contact/route.ts` — POST (public, zod-validated name/email/message; creates `ContactSubmission` + sends email), GET (admin: list)
- `src/app/api/contact/[id]/route.ts` — PATCH (admin: mark read), DELETE (admin)
- `src/components/ContactForm.tsx` — client form, posts to `/api/contact`, toast feedback
- `src/app/dashboard/admin/contact-submissions/page.tsx` — list with unread indicator, mark-read/delete actions

**Environment Variables:**

```env
CONTACT_NOTIFICATION_EMAIL=   # Admin inbox address for contact form notifications
```

**Acceptance Criteria:**

- [ ] Submitting the contact form creates a `ContactSubmission` row
- [ ] If `RESEND_API_KEY` and `CONTACT_NOTIFICATION_EMAIL` are set, an email is sent to the admin
- [ ] Admin can view, mark as read, and delete submissions

---

## 🟢 Priority 4: Public Pages & Navigation

### Feature: Public Static Pages, Blog, Contact

**Status**: Not Started  
**Estimated Effort**: 3-4 hours  
**Priority**: P2

**Files to Create:**

- `src/app/about/page.tsx`, `src/app/privacy/page.tsx`, `src/app/terms/page.tsx` — fetch `Page` by fixed slug via Prisma, `notFound()` if missing/unpublished, `generateMetadata()`, render via `MarkdownContent`
- `src/app/contact/page.tsx` — same pattern for slug `contact`, plus `<ContactForm />`
- `src/app/blog/page.tsx` — paginated grid of published posts (mirrors `/venues` pagination)
- `src/app/blog/[slug]/page.tsx` — full post detail, published-only, `generateMetadata()`

**Files to Modify:**

- `src/components/DashboardLayout.tsx` — add **Pages**, **Blog**, **Messages** to `navItems.ADMIN`

**Acceptance Criteria:**

- [ ] All 5 Footer links (`/about`, `/blog`, `/contact`, `/privacy`, `/terms`) resolve without 404s
- [ ] `/blog/[slug]` renders markdown content correctly (headings, lists, links, tables via `remark-gfm`)
- [ ] Admin sidebar shows the 3 new nav items

---

## Phase 5 Sprint Plan

### Sprint 1 (Days 1-3): Data Layer + Admin Pages CRUD

- Day 1: Schema, migration, seed, install markdown deps
- Day 2-3: Pages API + admin UI + `MarkdownContent` shared renderer

### Sprint 2 (Days 4-6): Admin Blog CRUD

- Day 4-5: Blog API + admin UI + Cloudinary featured-image upload
- Day 6: Polish, edge cases (duplicate slugs, empty states)

### Sprint 3 (Days 7-9): Contact Form + Public Pages

- Day 7: Contact form, email, submissions inbox
- Day 8: Public routes (about/privacy/terms/contact/blog/blog detail)
- Day 9: Nav wiring, full build verification, manual QA pass

---

## Success Criteria

Phase 5 is complete when:

- ✅ `Page`, `BlogPost`, `ContactSubmission` models exist and are seeded
- ✅ Admin can fully manage static pages and blog posts from the dashboard
- ✅ Contact form submissions are captured and (when configured) emailed to the admin
- ✅ All 5 Footer-linked public routes exist and render admin-authored content
- ✅ `npm run build` passes cleanly
- ✅ Existing Vitest suite (`npm run test`) remains green

---

## Dependencies

**External Services:**

- Cloudinary (already configured, reused for featured images)
- Resend (already configured, reused for contact notifications)

**New npm packages:**

- `react-markdown`, `remark-gfm`

**Technical Prerequisites:**

- None beyond the schema migration — additive change, no impact on existing models

---

## Out of Scope (Deferred)

- Rich WYSIWYG editor (TipTap or similar)
- Blog categories/tags, comments
- Contact-form spam protection (captcha/rate-limiting) beyond basic validation
- SEO sitemap/RSS feed generation

---

**Last Updated**: September 25, 2026  
**Status**: Planning Phase  
**Prerequisites**: Phase 4 completion (done)  
**Payment Integration**: Deferred to Phase 6 (see [PHASE_6_ROADMAP.md](PHASE_6_ROADMAP.md))
