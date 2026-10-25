# Implementation Plan

Maps to spec §17 phases. Each task is a checkbox; "AC#" refers to spec §15 acceptance criteria.

## Phase 0 – Foundation (setup)
- [x] Read spec, write plans (`.claude/specs`)
- [x] Next.js 16.4 (App Router, TS, Tailwind v4, ESLint, Turbopack) scaffolded at repo root; `npm run build` passes
- [x] Installed: `motion`, `zod`, `react-hook-form`, `@hookform/resolvers`, `clsx`, `tailwind-merge`, `date-fns`, `@date-fns/tz`  (add later: `sharp`, `resend`, Supabase client, `@dnd-kit`, `react-easy-crop`)
- [ ] **Read `node_modules/next/dist/docs/` before coding** – Next 16 differs from older versions (see AGENTS.md). Scaffold enables `cacheComponents` + `partialPrefetching`: data access must follow the new caching model (`use cache`, Suspense around dynamic data); revisit `revalidateTag` plan accordingly
- [ ] `npm audit` reports 5 high (transitive `braces`) – triage, likely dev-only
- [ ] Fonts via `next/font` (see 02-design-direction), tokens in `globals.css`
- [ ] `.env.example`, `src/lib/env.ts` (zod-validated env)
- [ ] Folder structure per 03-architecture-and-data.md
- [ ] Decide backend (Supabase recommended) → create project, run migrations, seed
- [ ] CI-lite: `npm run lint`, `typecheck`, `build` scripts; Prettier optional
- [ ] Vercel project + preview deploys; domain placeholder

## Progress log
- **M1 "Looks real" – done (static, seeded data)**: tokens/fonts/grain, botanical SVGs, leaf-wreath portrait, backdrop, social orbs, Book-a-Session sheet (WhatsApp / enquiry form w/ server-validated stub action), accordions, stories carousel, `/stories`, `/stories/submit` (UI + validation, no persistence), `/privacy` (draft), floating WhatsApp. Verified at 390 px and 1440 px with headless Chrome; build/lint/tsc clean.
- Still stubbed: all persistence, email, Turnstile, rate-limit, image processing (marked TODO in `src/app/actions/*`). Sample testimonials in `src/lib/seed.ts` must be removed before launch.
- Next: M2 (backend decision → DB, auth, admin shell, profile/links editing).

- **M1b "Practice website" – done (approved by Umair, pending client sign-off, see 05-sitemap-revision.md)**: `/` full site (hero, who-I-help, about teaser, how-it-works, stories carousel, FAQ, CTA band, footer), `/about`, `/services`, `/services/[slug]` x6, `/contact`, shared header/footer, `/links` = link-in-bio (moved from `/`). Copy in `src/lib/content.ts` is DRAFT and generic (no invented credentials). Remaining for this track: real portrait + photo brief, credentials/education from client, per-page JSON-LD/OG images, designed 404, `/faq` + blog (Phase 2).

- **M2-M4 backend + admin - built (Oct 2026), awaiting SQL 0003/0004 on the live DB before final end-to-end test of the visitor forms**:
  - Auth: `/admin/login`, password reset, `proxy.ts` gate, `requireAdmin()` on every page/action, rate-limited login.
  - Public site reads Supabase (cached with tags, instant updates via `updateTag`), falls back to seed.
  - Admin modules: dashboard, profile + photo crop/history, links, services/About/FAQs, settings, moderation (+manual story, bulk), homepage curation, booking requests, calendar (month/week/day/list, drag-reschedule, overlap + working-hours warnings), appointment cards (PNG/PDF/.ics/WhatsApp/email).
  - Visitor forms persist: enquiry + review/story with EXIF-stripping image pipeline; email via Resend (inactive until key set); Turnstile (inactive until keys set).
  - Hardening: CSP + security headers, 404/error pages, robots/sitemap/OG image/JSON-LD, 30-day purge cron (`vercel.json`).
  - Still to do: Resend + Turnstile keys, real portrait/credentials, privacy/terms approval, reminders (Phase 3), analytics, admin guide, backup restore test (needs Supabase Pro), 2FA.

## Phase 1 – Launch (all spec "Must" items)

### 1.1 Design system & shell
- [ ] Design tokens, typography scale, paper-grain texture, botanical SVG set
- [ ] Primitives: `PillButton` (primary/secondary/ghost), `Card`, `IconOrb` (social), `Sheet/Modal` (bottom sheet mobile, dialog desktop), `Field`, `Toast`, `Lightbox`, `StarRating`
- [ ] Desktop frame: centred 520 px column on an art-directed backdrop (not a stretched phone)
- [ ] Motion primitives: `Reveal`, `Stagger`, magnetic/press feedback, reduced-motion respect

### 1.2 Public homepage (AC1, AC3, AC12 consumers)
- [ ] Profile photo (circular, organic ring, placeholder state, responsive `next/image`, alt text)
- [ ] Name / "Clinical Dietitian – 6 Years of Experience" / tagline stacked, from DB
- [ ] Social orbs: Instagram, Facebook, TikTok, WhatsApp, Email – new tab, `rel="noopener noreferrer"`, ≥44 px target, data from `links`
- [ ] **Book a Session** primary CTA → Sheet "How would you like to book?" (AC4)
  - [ ] WhatsApp option → configured link (optionally pre-filled `wa.me/923208728620?text=` once client confirms)
  - [ ] Email option → enquiry form (name, phone, preferred date/time, concern, message) + Turnstile + honeypot + rate limit → saves `booking_requests` + emails admin via Resend + visitor confirmation (Should)
  - [ ] Admin session detected → button routes to `/admin/bookings` (AC5); visitors can never reach it
- [ ] Link buttons: About Me (accordion), Services (accordion list), WhatsApp Me, Client Testimonials → `/stories`, Contact/Email Me → same enquiry form; show/hide/rename/reorder from DB
- [ ] Client Success Stories: featured carousel (approved + featured only), "Share your story / review", "View all", health disclaimer
- [ ] Footer: phone (tap-to-call), email, optional clinic address, privacy link, copyright
- [ ] Discreet "Edit" entry for logged-in admin only
- [ ] Floating WhatsApp button (Should – cheap, include here)

### 1.3 Stories & reviews (public) (AC8, AC11)
- [ ] `/stories` with tabs Reviews | Success Stories, load-more pagination, lightbox, result line, stars
- [ ] `/stories/submit` (also opens as sheet from homepage): all fields per spec §8.2, 30–1000 chars, Urdu-safe (`dir="auto"`), name display preference, private contact, up to 3 images (JPG/PNG/WebP ≤5 MB), two consent checkboxes, Turnstile, honeypot, rate limit
- [ ] Server upload pipeline: MIME sniff (magic bytes), `sharp` resize/compress → WebP, strip EXIF, random filenames, private "pending" bucket → public bucket only on approval
- [ ] Thank-you state + admin notification email
- [ ] Sanitise text on write and escape on render; unapproved/deleted/hidden return 404 incl. direct URL

### 1.4 Auth & admin shell (AC5)
- [ ] `/admin/login` (email+password), password reset by email, session cookies (HTTP-only, SameSite), middleware guard + per-action `requireAdmin()`
- [ ] Inactivity logout, lockout after repeated failures (Suggested → do now, cheap); 2FA TOTP (Later-ish, stub the schema)
- [ ] Admin layout: sidebar (desktop) / bottom nav (mobile), unread badge, `noindex`
- [ ] Dashboard: today's appointments, pending submissions, new requests, quick links

### 1.5 Profile & branding (AC2)
- [ ] Photo upload, circular crop (e.g. `react-easy-crop`), preview, auto-resize, keep last 5 versions with restore
- [ ] Edit name, experience, tagline, bio, alt text; live preview; publish revalidates homepage (`revalidateTag`)

### 1.6 Links, services, about (AC12)
- [ ] CRUD + drag reorder (`@dnd-kit`) for social links and link buttons: label, URL, icon, visibility
- [ ] Services list (title + optional description) and About text editor
- [ ] Seed with exact spec §6 URLs

### 1.7 Bookings & calendar (AC6, AC7)
- [ ] Calendar: month/week/day/list, PKT, mobile-friendly (FullCalendar or custom; evaluate bundle – prefer custom week/day on mobile + FullCalendar-lite, decide in spike)
- [ ] Appointment form per spec §7.2 (all fields, source dropdown incl. Teams/WhatsApp/Zoom/Meet/Voice/Office/Other, service, session type, notes, status)
- [ ] Drag to reschedule with confirm; edit; cancel with reason; overlap warning with override
- [ ] Booking requests inbox → "Convert to appointment" prefill
- [ ] Appointment reference numbers (e.g. `BN-2610-0042`)
- [ ] Appointment card: branded portrait render (server-side `@vercel/og`/`satori` PNG + PDF), download, WhatsApp share link with prefilled text, email with attachment, `.ics`, supersede on reschedule/cancel

### 1.8 Moderation & curation (AC9, AC10, AC11)
- [ ] Filterable/searchable list (status/type/rating/date), preview-as-visitor, edit text before approval (original preserved)
- [ ] Actions: approve, reject (reason), hide, delete (soft, 30-day restore, purge job), restore, feature; bulk approve/reject
- [ ] Admin can add a story manually (e.g. from screenshot)
- [ ] Homepage curation: toggle + drag-reorder featured, recommended cap 6, live preview

### 1.9 Settings, legal, hardening
- [ ] Settings: contact, notification email, working hours/days off/buffers, durations, meeting defaults, card text, account/security
- [ ] Privacy policy + terms pages (draft standard text, client to approve), health disclaimer
- [ ] Security pass: OWASP checklist, CSRF (server actions + origin check), RLS policies tested, rate limits, upload validation, security headers/CSP
- [ ] Custom 404/500 pages, `robots`, `sitemap`
- [ ] Backups: Supabase daily backups (Pro) or scheduled `pg_dump` + storage sync; **test a restore** (AC14)

## Phase 2 – Enhancements (Should)
- [ ] SEO + OG image + JSON-LD (`Person`/`MedicalBusiness`), WhatsApp/Instagram preview checks
- [ ] Analytics: privacy-friendly (Plausible/Umami) + first-party click counters in dashboard
- [ ] Visitor confirmation emails, `.ics` polish, accessibility audit (axe, keyboard, AA contrast)
- [ ] Lighthouse mobile ≥ 90, LCP < 2.5 s on throttled 4G (AC13)

## Phase 3 – Growth (Later)
Reminders (24h/2h; cron), availability + self-serve booking, Google Calendar sync, intake form, payments status, English/Urdu toggle with RTL, lead magnet, audit log, assistant role.

## Cross-cutting definition of done (per feature)
1. Works at 320 / 390 / 768 / 1280 px. 2. Keyboard + screen-reader usable. 3. Reduced-motion safe. 4. Zod-validated on server. 5. Auth enforced server-side. 6. Empty/loading/error states designed. 7. No lorem ipsum or obvious placeholder copy shipped.

## Suggested order of attack (milestones)
1. **M1 – "Looks real"**: tokens, shell, full homepage with seeded static data + animations (get client buy-in on design early).
2. **M2 – Backend wired**: DB, auth, profile/links editable, photo upload.
3. **M3 – Stories**: submission → moderation → curation → public.
4. **M4 – Bookings**: enquiry form + admin calendar + cards.
5. **M5 – Hardening & launch**: security, backups, perf, legal, domain.
