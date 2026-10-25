# Dn. Bushra Naseem – Website Specs Index

Source brief: `Website_Developer_Specification_Dn_Bushra_Naseem.docx` (v1.1, 29 Sep 2026).
Single-page link-in-bio site + booking + reviews/stories + admin portal for a clinical dietitian (Pakistan audience, mobile-first, English + Roman Urdu/Urdu text).

| File | Purpose |
|---|---|
| [01-implementation-plan.md](01-implementation-plan.md) | Phased, checkable build plan (the master plan) |
| [02-design-direction.md](02-design-direction.md) | Visual identity, motion, "not-AI-looking" rules |
| [03-architecture-and-data.md](03-architecture-and-data.md) | Stack, folder layout, data model, security, backend decision (Supabase vs Neon) |
| [04-open-questions.md](04-open-questions.md) | Client/dev decisions blocking work |
| [05-sitemap-revision.md](05-sitemap-revision.md) | PROPOSED: multi-page practice site at `/`, link-in-bio moves to `/links` (based on competitor research) |

Rules for everyone working in this repo:
- Mobile-first: design at 390 px, min 320 px, public column max ~520 px (spec §3).
- Public pages never import admin code; admin lives under `/admin` behind auth in middleware **and** in every server action.
- All dates/times are Asia/Karachi (PKT, UTC+5, no DST). Store UTC, render PKT.
- Only `approved`/`featured` submissions are ever readable by the public (enforced in DB policy/query, not just UI).
- Social URLs are seeded **exactly** as given in spec §6 and are editable in admin.
