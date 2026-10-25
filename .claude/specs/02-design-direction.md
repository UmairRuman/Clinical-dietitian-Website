# Design Direction – "Botanical Editorial"

Goal: a site that looks art-directed by a seasoned studio, not generated. Constraint from client: **light-green theme**, mobile-first Beacons-style single column (spec §3). We keep that structure but give it craft.

## Concept
A dietitian's journal meets a herbarium: warm paper, pressed-leaf line art, soft organic shapes, restrained motion. Calm, trustworthy, clinical-but-human. Think boutique wellness brand, not SaaS template.

## Palette (tokens in `globals.css`; final shades to be matched to client logo)
| Token | Value | Use |
|---|---|---|
| `--mint-50` | `#F3FAF3` | page top |
| `--mint-100` | `#E4F3E6` | page bottom / panels |
| `--leaf-300` | `#A8D8B0` | primary button fill, icons (spec) |
| `--leaf-500` | `#6FB07E` | hover, accents |
| `--forest-700` | `#2F6B45` | headings, button text (spec) |
| `--forest-900` | `#173A26` | body text on light |
| `--paper` | `#FBFAF4` | cards (warm white, not pure `#fff`) |
| `--clay` | `#D98E6B` | rare warm accent (stars, highlights, one detail per screen) |
| `--sand` | `#EFE6D2` | secondary surfaces / dividers |
Contrast: forest on leaf-300 must pass AA (check with tooling; use `--forest-900` for button label if needed).

## Typography
- Display / name / headings: **Fraunces** (variable, optical size + soft axis) – characterful serif, not Playfair/“Inter-default” cliché.
- Body/UI: **Figtree** or **Plus Jakarta Sans** (pick after render test).
- Urdu / Nastaliq fallback: **Noto Nastaliq Urdu** (and Noto Naskh Arabic for UI-size text); apply `dir="auto"` to all user-submitted text.
- Scale: fluid `clamp()`; tight display tracking, generous body line-height (1.6; Urdu 2.0).

## Signature elements
1. **Profile portrait**: circular photo with an irregular hand-drawn leaf wreath ring (SVG, subtly "growing" on load) and a slow-breathing soft glow. Placeholder = illustrated botanical monogram "BN".
2. **Backdrop**: mint gradient + SVG paper-grain noise + large blurred leaf silhouettes drifting with parallax. On desktop the 520 px column sits like a card on a richer botanical scene (left/right illustrations), so it feels designed, not stretched.
3. **Buttons**: pill shapes with layered soft shadow, inner highlight, tactile press (scale 0.98), and a subtle sheen sweep on the primary CTA. "Book a Session" has a gentle pulse ring (stops under reduced motion).
4. **Social orbs**: custom-weight brand SVGs (not default icon-font look), spring hover/lift, tooltip label on desktop.
5. **Story cards**: paper cards with slightly irregular radius (22–28 px), quote-mark ornament, rating in clay, photo with soft corner mask; carousel with drag + snap and progress dots.
6. **Section dividers**: small vine/sprig SVG instead of `<hr>`.
7. **Micro-copy**: warm, human, specific (“Let’s plan your first consultation”) – no generic “Welcome to our platform”.

## Motion (library: `motion` / Framer Motion)
- Load: staged reveal – photo rings draw in → name rises → tagline fades → orbs stagger pop → buttons slide up (total < 1.2 s).
- Scroll: `whileInView` reveals once, parallax on leaf layers (transform only), carousel inertia.
- Sheets: spring bottom-sheet with drag-to-dismiss and backdrop blur.
- Page transitions: gentle fade/translate via `template.tsx`.
- Rules: animate `transform`/`opacity` only; 60 fps on mid-range Android; honour `prefers-reduced-motion`; no motion that delays interaction; LCP element (photo/name) must not wait on JS animation (CSS-first, JS enhances).

## "Does not look AI-made" checklist
- ✗ No purple/blue gradients, glassmorphism everywhere, emoji as icons, centered-everything hero clichés, three-identical-feature-cards grids, Lucide icons for brand/nav identity.
- ✗ No stock-looking gradient blobs; use authored SVG illustration with consistent stroke weight (1.5 px, rounded caps).
- ✓ Real photography treatment: warm grade, consistent crop; client portrait is hero. Until supplied use illustrated placeholder, never fake "person" stock.
- ✓ Consistent spacing scale (4 px base), optical alignment, deliberate asymmetry in ornaments.
- ✓ Real content: Section copy from spec; sample testimonials in realistic Roman Urdu/English clearly marked as seed data to remove before launch.
- ✓ Every state designed: empty stories, loading skeletons, form errors, offline.

## Admin portal look
Same brand tokens but calmer/denser: paper background, forest sidebar, clear data tables, calendar with leaf-toned event colours per status. Practical first, still on-brand; no animation overload.

## Assets needed
Client logo + portrait (blocks final palette), 5–8 custom SVG botanicals (author in-house), brand-icon SVGs (Simple Icons paths), OG image template.
