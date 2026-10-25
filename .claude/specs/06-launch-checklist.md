# Launch Checklist

Status as of 25 Oct 2026. Preview is live at https://clinical-dietition-bushra.netlify.app/ (Netlify, from GitHub).
DB migrations 0001-0004 are applied. Code is feature-complete for spec Phase 1 except items marked TODO.

## A. Do now (blocks a working site on Netlify)
- [ ] **Netlify > Site configuration > Environment variables** (then trigger a redeploy; `NEXT_PUBLIC_*` are baked in at build time):
  - `NEXT_PUBLIC_SUPABASE_URL` = https://fmrlnupprxallxckbjuw.supabase.co
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SECRET_KEY` (mark as secret)
  - `NEXT_PUBLIC_SITE_URL` = https://clinical-dietition-bushra.netlify.app (later the custom domain)
  - `CRON_SECRET` = long random string (mark as secret)
  - If Netlify's secret scanner fails the build on the two public Supabase values, add `SECRETS_SCAN_OMIT_KEYS=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- [ ] **Supabase > Authentication > URL Configuration**: Site URL = the Netlify URL; add `https://clinical-dietition-bushra.netlify.app/**` (and the custom domain later) to Redirect URLs. Password-reset links fail without this.
- [ ] **Rotate the Supabase secret key** (it was pasted into a chat during development): Project Settings > API Keys > regenerate; update Netlify + `.env.local`.
- [ ] Confirm the GitHub repo is **private** and contains no `.env*` file other than `.env.example`.

## B. Before real visitors
- [ ] **Email (Resend)**: create account, verify the sending domain, set `RESEND_API_KEY` and `EMAIL_FROM`. Until then enquiry/review alerts and appointment-card emails are skipped (the data is still saved and shown in the portal).
- [ ] **Cloudflare Turnstile** (free): set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`. Honeypot + rate limit already protect the forms without it.
- [ ] **Supabase Pro plan** (~US$25/mo): daily backups are a spec requirement; free plan has none and pauses after a week idle. Then do and document one **test restore** (acceptance criterion 14).
- [ ] **Custom domain** with HTTPS (Netlify > Domain management). Update `NEXT_PUBLIC_SITE_URL`, Supabase redirect URLs, Resend domain.
- [ ] Client logs in, **changes her password**, and tries every module once (acceptance walk-through).
- [ ] Client supplies: high-res portrait (+ logo), credentials/education, clinic address (if any), confirms the WhatsApp number (+92 320 8728620?) for pre-filled messages, working hours, default Teams/Zoom links.
- [ ] Client **approves the copy** in `src/lib/content.ts` (about/services/FAQ wording is draft) and the **privacy policy** text; add terms if wanted.
- [ ] Add real reviews with permission (Admin > Reviews & stories > Add a story yourself), then feature the best on the homepage.

## C. Soon after launch
- [ ] Daily purge of deleted reviews: Netlify scheduled function `netlify/functions/purge.mjs` (needs `CRON_SECRET`; untested on Netlify). `vercel.json` is only used if hosting moves to Vercel.
- [ ] Analytics (Plausible/Umami) + click counters; Google Search Console (submit sitemap.xml); Google Business profile.
- [ ] Lighthouse mobile run on the live URL (target >= 90) and fix what it reports (photos will change LCP).
- [ ] Two-factor authentication for the admin account; admin inactivity logout.
- [ ] Short admin guide with screenshots (profile photo, bookings, moderation, homepage stories) for handover.

## D. Later (spec Phase 3)
Appointment reminders (24h / 2h), Google Calendar sync, pre-consultation intake form, payment status, English/Urdu toggle with RTL, lead magnet, activity log, assistant role, blog.

## Known limitations
- Drag-to-reschedule uses mouse drag (desktop); on phones use the edit form.
- Appointment card uses a standard sans font (not the site serif).
- Next.js dev shows a `Date.now()` validation warning on admin pages (dev only; production build is clean).
- Tested: forms, photo pipeline (EXIF stripped, private until approved), moderation, caching, rate limiting, calendar, cards (PNG/PDF/ics). Not yet tested: real email sending, Turnstile, WhatsApp share on a phone, Netlify runtime behaviour with env vars.
