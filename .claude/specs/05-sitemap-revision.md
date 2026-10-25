# Sitemap Revision – from "one page" to a full practice website

Status: PROPOSED (supersedes the single-page homepage in spec §5 pending client approval). Raised by Umair after M1 review: a lone link-in-bio page does not look like an established professional practice.

## Research (Oct 2026)
Pages inspected: dietitiandish.com, jilliangreaves.com, healthwithbec.com; roundup of ~20 dietitian sites (Colorlib list) incl. Aligned Nutrition, Simone Nutrition, Kara Lydon, Fika Nutrition. No Pakistan dietitian practice with a standalone site surfaced – local dietitians mostly live on Fiverr, Oladoc/Healthwire listings and Instagram, so a polished site is a real differentiator.

### What the established ones consistently do
| Pattern | Seen in |
|---|---|
| Sticky top nav: About · Services · Success Stories · Resources/Blog · Contact, with one persistent **Book** button in the header | all |
| Hero = headline + credentials + single primary CTA (discovery call / "Start now") + real portrait | all |
| Order: Hero → who-it's-for / pain points → short bio → services cards → testimonials → lead magnet / newsletter → footer | Dish, Greaves, Bec |
| Services as 3–6 cards linking to dedicated service pages; pricing usually behind "enquire" | all |
| Many testimonials with specific outcomes + "View all" page | Greaves (9), Bec |
| Trust: credentials line, years/clients count, press/"as seen in" if any, disclaimer | all |
| Free resource (diet guide, recipes, quiz) to capture leads | Greaves, Bec, Dish |
| Calm natural palette (sage, earth), nature illustration, serif + sans type | Aligned, Simone, Kara Lydon |
| Footer with licences/region line, nav, social, privacy/terms, medical disclaimer | all |
Anti-patterns to avoid (seen even on live sites): broken newsletter forms, stale copyright year, 12-item nav, inconsistent credentials.

## Recommended structure (two front doors, one brand)
1. **`/` – Practice website** (new, main URL): what Google and referrals see.
2. **`/links` – Link-in-bio page** (what we already built, Beacons-style, spec §5): the URL placed in Instagram/TikTok/Facebook bios. Preserves the client's stated primary goal (social follower → booked session). Spec's homepage components are reused as-is.
Both share the same data, admin, booking flow and design system.

### Pages
| Route | Purpose | Notes |
|---|---|---|
| `/` | Home | Header nav + Book button; hero with portrait; "Who I help" (6 conditions as illustrated tiles); about teaser; how it works (3 steps: Enquire → Consultation → Personalised plan & follow-up); services preview; featured stories carousel; FAQ teaser; lead-magnet strip; final CTA band; rich footer |
| `/about` | Bio, credentials, approach, philosophy, 6 yrs experience | Admin-editable; credentials/education to be supplied by client |
| `/services` | All services | 6 cards from spec |
| `/services/[slug]` | One page per condition: weight management, diabetic, uric acid, hypo/hypertension, sports nutrition, PCOS | Best SEO value ("PCOS diet plan Pakistan"); each: who it's for, approach, what you get, FAQ, CTA. Content editable in admin |
| `/stories` , `/stories/submit` | As built | Add lightbox, pagination from DB |
| `/how-it-works` (or section) | Process + FAQs | Can fold into Home + `/faq` |
| `/contact` | Enquiry form (same server action), WhatsApp, phone, email, clinic address/map if any | Replaces "Contact / Email Me" sheet as a page, sheet kept as shortcut |
| `/blog` (Phase 2) | Articles/recipes for SEO and trust | Needs content plan; optional |
| `/free-guide` (Phase 3) | Lead magnet | Already "Later" in spec §11 |
| `/privacy`, `/terms`, `/disclaimer` | Legal | Draft text |
| `/links` | Link-in-bio | Moved from current `/` |
| `/admin/**` | Portal | Unchanged (spec §9); add Services content + FAQ editors |

### Navigation
Header (desktop): logo wordmark · About · Services ▾ · Success Stories · Contact · **[Book a Session]**. Mobile: logo + Book + menu icon → full-screen sheet. Max 5 items. Footer: sitemap, contact, social, disclaimer, legal.

### Design implications
- Keep the Botanical Editorial identity (02-design-direction.md) but go wide: 1200 px container, 12-col grid, large serif display type, asymmetric hero (portrait with wreath right, copy left), alternating image/text bands, mint ↔ paper ↔ deep-forest section rhythm so the page has pacing.
- Real portrait photography is now essential; plan a photo brief for the client (3–5 images: portrait, consultation, healthy food flat-lay, clinic). Until then, use illustrated placeholders – never fake stock people.
- Section motion: scroll reveals, count-up stats (6 yrs, N clients – only real numbers), service tiles with hover-lift and leaf-draw.

## Impact on plan / scope
- Adds ~8 public routes + content editors; Phase 1 grows by roughly 1.5–2 weeks. Needs client sign-off because the spec (v1.1) describes a single-page homepage and the quotation was based on it.
- Data model additions: `services` gains slug, summary, body (rich text/markdown), seo fields, hero image; new `faqs` table; `pages` (about content).
- SEO moves from "Should" to "Must" (metadata per page, sitemap, JSON-LD `Physician/MedicalBusiness` + `Service`).

## Decision needed
Approve: (a) full website at `/` + link-in-bio at `/links`, (b) service sub-pages, (c) blog deferred to Phase 2. Then revise 01-implementation-plan.md (new Milestone M1b "Practice website") before M2.
