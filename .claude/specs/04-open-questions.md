# Open Questions / Decisions

## Dev-side (Umair)
1. **Backend**: Supabase (recommended) vs Neon + Auth.js + object storage. Needed before Milestone M2.
2. **Hosting**: Vercel assumed. Confirm region/cost for quotation.
3. **Calendar library**: FullCalendar vs custom (decide after spike).
4. **Email provider**: Resend assumed; need a verified sending domain.

## Client-side (spec §16, still open)
- High-res portrait + logo (blocks final palette; we use spec hexes meanwhile).
- Is +92 320 8728620 her WhatsApp number? (enables pre-filled `wa.me/923208728620?text=` message; otherwise keep business short link).
- WhatsApp link: spec uses `wa.me/message/SAOMQFECCL7ZC1` (original doc mistakenly linked TikTok) – confirm.
- Clinic address (if office visits), domain name, admin login email.
- Working days/hours, session durations; default Teams/Zoom links.
- Final list of link buttons; existing reviews + permission to publish.
- Privacy policy/terms text (or approval to draft).
- Which "Suggested" items are approved (§11).

## Notes
- Spec wireframe shows a "Subscribe" pill at top-left of the phone frame that isn't described in the text. Treat as unconfirmed – ask client (newsletter? share?). Not built by default.
- Wireframe omits "Client Testimonials" button; text spec lists it – follow text spec.
