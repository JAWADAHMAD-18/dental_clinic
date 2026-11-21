# Design System

Feel: calm, warm, premium, clinical-clean without looking cold. Closer to a boutique studio than a template. Not the usual teal-and-orange dental look. Not Zalvro's own green identity either.

## Colour tokens (all flat; no gradients)

| Token | Hex | Use |
|---|---|---|
| `--bone` | #F6F2EA | Page background |
| `--paper` | #FFFDF9 | Cards, form surfaces |
| `--sand` | #E9DFD2 | Section tint, avatar fill, dividers |
| `--line` | #E2DACB | Borders |
| `--ink` | #17263B | Headings, primary text, dark sections |
| `--ink-soft` | #4A5870 | Body secondary text |
| `--clay` | #B85C38 | Primary buttons (white text), highlights |
| `--clay-text` | #A84F2E | Accent text/links on bone (passes AA at body size) |
| `--focus` | #17263B | 2px focus ring with 2px offset |

Verify every text/background pair with a contrast checker before shipping. Dark sections use `--ink` background with `--bone` text. Status colours (success/error) are flat and muted, used only in the form and chat.

## Typography (via `next/font`, latin subset, `display: swap`)

- Headings: Fraunces (soft serif), weights 400-600, tight but readable line height (1.1-1.2).
- Body/UI: Figtree, weights 400-600.
- Scale: hero `clamp(2.5rem, 6vw, 4.5rem)`, h2 `clamp(1.9rem, 3.6vw, 2.75rem)`, body 17-18px, line height 1.6.
- Max line length ~65 characters for paragraphs.

## Layout

- Container max width 1200px, 16px gutter on mobile, 32px on desktop.
- Section vertical padding: 64px mobile, 96px desktop (inner page headers: about half of that so content starts in the first screen).
- 12-column grid on desktop, single column on mobile. Generous whitespace.
- Radii: 12px cards, 999px pills/buttons. Shadows: one very soft flat shadow only on hover lift.

## Header structure (top to bottom)

1. **Sample strip** (thin, `--sand` background, 12-13px text): "Sample website designed by Zalvro. Placeholder content." with a "zalvrohq.com" link. Visible on every page.
2. **Top info bar** (`--ink` background, small text): phone, email, address, opening hours summary. On mobile collapse to a single "Call" and "Directions" row.
3. **Navbar**: wordmark left; Home, Services, Fees, About, Contact; primary button "Make an enquiry" right. Sticky, flat, subtle bottom border on scroll. Mobile: sheet menu.

## Components

- Buttons: primary (clay fill, white text), secondary (ink outline), text link with underline offset. Press and hover states, visible focus.
- Cards: paper background, line border, 12px radius, 24px padding.
- Team cards: monogram circle (initials on `--sand`), name, role, short line. No photos of real or stock people.
- Fees table: clear rows, "Sample fees" label above it.
- FAQ: accessible accordion (Radix).
- Chat widget: one floating button bottom-right (no second WhatsApp icon); opens a panel; clear "Virtual assistant" label; suggested question chips; typing and error states.
- Map: static placeholder card with "Load map" button; loads the Google Maps iframe on click, `loading="lazy"`.

## Imagery

- Licensed free stock (Unsplash/Pexels). Keep a credit list in the repo.
- Subject: calm interiors, natural light, plants, tools laid out neatly, hands, texture. Avoid cliché close-ups of teeth and stock "perfect smile" faces.
- WebP/AVIF, explicit width/height, `priority` only for the hero image.

## Motion (Motion with `LazyMotion` + `domAnimation`, keep it subtle)

- Easing: `[0.22, 1, 0.36, 1]`. Durations 0.4-0.7s.
- **Hero:** CSS keyframes only (fade + 12px rise, stagger 80ms on headline lines, subtitle, buttons). Must not depend on JS to be visible.
- **Below the fold:** reveal on scroll (opacity 0 to 1, translateY 16px to 0), once, `viewport: { once: true, margin: "-80px" }`; stagger children by 60ms.
- **Hover:** cards lift 4px with soft shadow; buttons shift 1px and darken slightly; link underline slides in.
- **Accordion:** height animation via Radix.
- **Chat panel:** scale/opacity from the button, 200ms.
- Animate `transform` and `opacity` only. No parallax, no scroll-jacking, no smooth-scroll library, no looping decorative animation.
- `prefers-reduced-motion: reduce` disables all of the above except opacity fades.
