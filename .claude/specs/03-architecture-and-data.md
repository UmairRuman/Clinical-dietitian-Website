# Architecture & Data

## Stack
| Concern | Choice |
|---|---|
| Framework | Next.js (App Router, RSC, Server Actions), TypeScript strict |
| Styling | Tailwind CSS v4 + CSS variables (tokens) |
| Motion | `motion` (Framer Motion) |
| Forms/validation | react-hook-form + zod (shared schemas client/server) |
| Backend | **Supabase** (recommended) – Postgres, Auth, Storage, RLS |
| Email | Resend (transactional) + React Email templates |
| Images | `sharp` server-side (resize, WebP, EXIF strip) |
| Bot protection | Cloudflare Turnstile + honeypot + rate limit (Upstash Redis or Postgres table) |
| Cards | `satori`/`@vercel/og` (PNG) + `pdf-lib` or print-CSS (PDF), `ics` for calendar |
| Calendar UI | evaluate FullCalendar vs custom (spike in 1.7) |
| Hosting | Vercel (HTTPS, previews); cron via Vercel Cron for purge/reminders |

## Backend decision: Supabase vs Neon (decide before M2)
- **Supabase (recommended)**: auth (email/password, reset, TOTP MFA), storage with CDN + signed URLs, RLS, daily backups – covers spec §12 in one service; fewest moving parts for a solo admin site.
- **Neon**: excellent serverless Postgres + branching, but auth and file storage must be added (Auth.js/Better Auth + R2/S3/UploadThing) → more code and more surface to secure.
- Mitigation either way: all DB access goes through `src/server/repositories/*` and typed DTOs so switching is localised. Use plain SQL migrations in `supabase/migrations` (portable to Neon).
- Public reads use the anon role restricted by RLS views (`public_stories`); admin writes use the service role **only in server code** (never shipped to the browser).

## Folder layout
```
src/
  app/
    (public)/            page.tsx (home), stories/, stories/submit, privacy/, terms/
    admin/               login/, (portal)/ dashboard, profile, bookings, requests,
                         moderation, curation, links, content, settings
    api/                 cards/[id], ics/[id], cron/purge, webhooks (if any)
    layout.tsx, not-found.tsx, error.tsx, sitemap.ts, robots.ts
  components/
    ui/                  primitives (PillButton, Sheet, Field, Toast, Lightbox…)
    brand/               botanicals (SVG), IconOrb, ProfilePortrait, Backdrop
    home/ stories/ booking/ admin/
  server/
    repositories/        profile, links, submissions, appointments, requests, settings
    services/            email, images, cards, rate-limit, turnstile, audit
    auth/                requireAdmin, session helpers
  lib/                   env.ts, dates.ts (PKT), schemas/ (zod), utils.ts, constants.ts
  styles/                tokens.css, fonts
supabase/ migrations/, seed.sql
.claude/specs/
```

## Data model (Postgres; times `timestamptz`, shown in Asia/Karachi)
- `profile` (singleton): name, experience_line, tagline, bio, photo_path, photo_alt, contact_email, contact_phone, address, whatsapp_number
- `profile_photos`: id, path, created_at, is_current (keep last 5)
- `links`: id, kind (`social`|`button`), key, label, url, icon, action (`url`|`about`|`services`|`stories`|`contact`), visible, sort_order
- `services`: id, title, description, sort_order, visible; `about_content` in `profile`/`settings`
- `appointments`: id, reference (unique), client_name, client_phone, client_email, starts_at, ends_at, duration_min, meeting_source (enum), meeting_link, location, service, session_type, internal_notes, status (scheduled|confirmed|completed|cancelled|no_show), cancel_reason, request_id?, created_at, updated_at
- `appointment_cards`: id, appointment_id, version, generated_at, superseded_at
- `booking_requests`: id, name, phone, preferred_at/text, concern, message, status (new|converted|closed), created_at
- `submissions`: id, type (review|story), display_name, name_pref (full|first|anonymous), private_contact, rating, body, original_body, result_summary, consent_publish, consent_photos, consent_at, status (pending|approved|featured|rejected|hidden|deleted), featured_order, rejection_reason, deleted_at, created_at, updated_at
- `submission_images`: id, submission_id, path, width, height, alt, sort_order
- `settings` (singleton JSON/columns): working_hours, days_off, blocked_dates, buffer_min, durations, notification_email, meeting_defaults, card_text
- `rate_limits`, `audit_log` (Suggested), `admin_profiles` (maps auth user → admin role)
- Views: `public_submissions` (status in approved/featured, no private_contact), consumed by anon role.

## Security essentials
- RLS on every table; anon can only: insert `submissions`/`booking_requests` (via server action with Turnstile), select public views.
- `requireAdmin()` in middleware **and** each server action/route; admin routes `noindex`, no caching.
- Zod validation on server; sanitise text (strip HTML), render as text only; Urdu bidi via `dir="auto"`.
- Uploads: size/type check by magic bytes, `sharp` re-encode, random names, pending bucket private.
- CSP + security headers in `next.config`; `rel="noopener noreferrer"` on external links.
- Secrets only in env (Vercel); `.env.local` git-ignored.
- Soft-delete purge cron after 30 days; data deletion on request procedure documented.

## Performance
Server components by default; client islands only for motion/forms; `next/image` AVIF/WebP; fonts self-hosted with `display: swap`; homepage statically generated with tag revalidation on admin saves; JS budget watch (calendar loaded only on admin routes).
