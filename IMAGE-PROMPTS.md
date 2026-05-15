# XNLAB — Image generation brief

This document is the source of truth for every still image used across
`xnlab.io`. Hand the whole thing to the image-generation chat in one go, or
copy individual prompts one at a time. The orbs (the seven World Cores)
are out of scope here — those are already generated and live in
`public/images/worlds/`.

Output the files at the listed filenames into `public/images/` (or the
sub-folder noted). The site picks them up by path.

---

## 0. House style — applies to every prompt below

These rules are not optional. Repeat them inside each individual prompt or
prepend them as a system instruction.

**Aesthetic**
- Dark, cinematic, atmospheric. Editorial, not commercial.
- Deep blacks dominate (background ~ #060606). High dynamic range with
  soft, volumetric light and pronounced shadow.
- A single direction of light per image. Often warm tungsten or a single
  coloured key light. No mixed temperatures unless deliberate.
- Long-exposure / slow-shutter feel. Slight 35mm cinema grain.
- Matte surfaces preferred. Reflections only where they matter (water,
  polished stone, glass, lacquer).
- Always leave generous negative space — the site overlays headlines.
  Compose toward the lower-left or upper-right third; centre stays open
  for typography.

**Composition**
- 16:9 for wide hero panels; 4:5 for portrait-leaning sections; 1:1 for
  square accents. Each prompt below specifies the ratio.
- No text in images, no logos, no watermarks.
- No close-up faces. If a human presence is needed: distant figure,
  silhouette, partial gesture, or back-of-head only.
- Surfaces and atmosphere over objects. The room is the subject, not
  what is in it.

**Palette anchors** (use one per image, do not mix)
- Amber Gold — `#d8932a`, warm tungsten, copper
- Electric Violet — `#7a3dff`, ultraviolet smoke
- Ivory Pearl — `#e8e2d2`, soft champagne silver
- Mineral Stone Grey — `#8a8a86`, graphite, raw concrete
- Midnight Indigo — `#2c3a8a`, deep blue nebula
- Iridescent Cyan — `#46d6ce`, holographic refraction
- Neutral charcoal — for non-Core scenes, like the hero backdrop

**References to feed the model**
Wong Kar-wai cinematography · James Turrell light installations · Olafur
Eliasson atmospheric work · Aman resorts at dusk · COS / Loewe perfume
editorials · Studio MK27 interiors · Tadao Ando concrete · Apparatus
Studio lighting · Hilma af Klint vibration.

**Negative prompt (anti-list)**
text, watermark, logo, brand name, model release, smiling person, stock
photo lighting, HDR halo, oversaturated, plastic, vector illustration,
3D render look (unless explicitly requested), AI face artefacts, kitsch,
maximalism, busy composition, centre-weighted subject.

**Output specs**
- Width: 2400px minimum
- Format: PNG with transparency where noted, otherwise JPG quality 90
- File naming: exactly as listed below (case-sensitive on Linux/Vercel).

---

## 1. Hero backdrop — wide (desktop)

**Filename:** `public/images/hero/01_background_desktop.png`
**Ratio:** 16:9 — 2880×1620 ideal
**Used on:** the home page hero, behind the XNLAB wordmark and the arc of
six World Cores. The orbs sit in front of this image, so it must read as
distant atmosphere, not as the subject.

**Prompt:**
> A vast, dark cinematic atmosphere. Liquid black space with the faintest
> warm copper glow rising from below the horizon line, like a sun that
> sank an hour ago. Soft volumetric haze, no objects, no figures, no
> architecture. The frame breathes. Subtle dust particles drift in the
> low quarter. The centre of the frame is the deepest black so a logo can
> sit on top. 35mm film grain, long-exposure, Kar-wai night palette.
> Painterly depth, not photo-realistic detail.

**Anti-list reinforcement:** no stars, no celestial bodies, no nebula
clichés, no readable architecture, no specific shapes.

---

## 2. Hero backdrop — tall (mobile)

**Filename:** `public/images/hero/01_background_mobile.png`
**Ratio:** 3:4 (portrait) — 1620×2160 ideal
**Used on:** the same hero, but rendered on phones where the canvas is
portrait. It needs to feel like the same world, recomposed.

**Prompt:**
> Vertical reframe of the same dark cinematic atmosphere as the desktop
> hero. Deep liquid black with a low warm copper breath in the bottom
> third. Generous black space in the upper two thirds so the wordmark and
> orbs read cleanly. Slow drift of haze, no objects, no architecture, no
> figure. 35mm grain. Single direction of light, low and warm.

---

## 3. Top haze overlay (transparent)

**Filename:** `public/images/hero/02_haze_overlay.png`
**Ratio:** 16:9 — 2880×1620
**Format:** PNG with **transparent background**, screen-blend-ready.
**Used on:** sits over the hero with `mix-blend-mode: screen`, opacity
0.07. Adds atmospheric haze to the upper third of the screen.

**Prompt:**
> Subtle atmospheric haze drifting across a transparent canvas, brightest
> in the upper half, dissolving to nothing at the bottom. Soft warm
> off-white smoke and very faint dust motes. No structure, no figure,
> no colour bias. The whole image should look like a slow-shutter shot
> of a single beam of warm light catching dust in a dark room — except
> the room is invisible. Designed to be additively blended on a black
> background; black pixels must be transparent.

---

## 4. Hospitality — discipline atmosphere

**Filename:** `public/images/01_hospitality_amber.jpg`
**Ratio:** 16:9 — 2880×1620
**Replaces:** `public/images/03_emotional_curtains.jpg`
**Used on:** `/worlds/hospitality-experience`, the cinematic discipline
section between hero and material/energy.

**Prompt:**
> The interior of a quiet, expensive hotel suite an hour after midnight.
> Heavy velvet drapery the colour of dark wine, partly closed. A single
> warm tungsten lamp throws low amber light from the left. A polished
> mahogany surface catches a soft copper reflection. No people, no
> glasses, no food. The room has just been left. Slight cinema grain,
> low contrast, painterly. Aman Tokyo meets Wong Kar-wai. Palette anchor:
> Amber Gold `#d8932a`. Negative space in the centre and upper-right
> for headline overlay.

---

## 5. Nightlife — discipline atmosphere

**Filename:** `public/images/02_nightlife_violet.jpg`
**Ratio:** 16:9
**Replaces:** `public/images/04_sensorium_blue.jpg`
**Used on:** `/worlds/nightlife-cultural-events`.

**Prompt:**
> Interior of a high-design nightclub at 3am, seen from the back. Thick
> ultraviolet smoke fills the frame. A single distant figure stands in
> silhouette against a violet backlight. No crowd. The architecture is
> barely readable: concrete column, brushed steel handrail. The light is
> from one source only, low and violet. Slow shutter, slight motion in
> the smoke. Editorial, never EDM. Palette anchor: Electric Violet
> `#7a3dff`. Centre kept dark for text overlay.

---

## 6. Luxury / lifestyle — discipline atmosphere

**Filename:** `public/images/03_lifestyle_pearl.jpg`
**Ratio:** 16:9
**Replaces:** `public/images/05_identity_chrome.jpg` (this one stays in
the repo as a fallback; the new image takes over the Luxury World page).
**Used on:** `/worlds/luxury-lifestyle-brands`.

**Prompt:**
> A single pearl-white perfume bottle resting on raw linen, lit by a
> single soft top light. Background is a wall painted ivory, slightly
> textured. A faint champagne-silver reflection touches the rim of the
> bottle. No brand label. No box. Almost monochrome, the only colour is
> a hair of warm cream. Editorial perfume photography style — Aesop /
> COS / Loewe. Palette anchor: Ivory Pearl `#e8e2d2`. Negative space
> dominant; the bottle sits on the left third.

---

## 7. Architecture — discipline atmosphere

**Filename:** `public/images/04_architecture_stone.jpg`
**Ratio:** 16:9
**Replaces:** `public/images/07_sculptural_white.jpg`
**Used on:** `/worlds/architecture-spatial-design`.

**Prompt:**
> A long concrete passage in a brutalist building. Raking natural light
> enters from a single tall slit on the right wall and travels across
> the floor. The walls are raw, board-formed concrete. No furniture, no
> figure. The shadow on the left wall is deep enough that detail is
> lost. Tadao Ando / Studio MK27. The frame should feel weighted, slow,
> inevitable. Palette anchor: Mineral Stone Grey `#8a8a86`. Negative
> space in the upper-left.

---

## 8. Music — discipline atmosphere

**Filename:** `public/images/05_music_indigo.jpg`
**Ratio:** 16:9
**New image** — the Music World page currently has no dedicated
discipline image.
**Used on:** `/worlds/music-cultural-artists` (after we wire the
`discipline` field for this Core; see note at the bottom of this file).

**Prompt:**
> The empty stage of a small concert hall at 3am. A single warm-blue
> spotlight catches the centre of the floor; the rest is in deep
> midnight-indigo darkness. A tall microphone stand stands alone, no
> mic, no cables. Soft haze drifts across the beam. No audience, no
> band. Slow-shutter, painterly, faint film grain. Palette anchor:
> Midnight Indigo `#2c3a8a`. Centre is the light pool; sides are dark
> for text.

---

## 9. Cultural / Digital — discipline atmosphere

**Filename:** `public/images/06_digital_cyan.jpg`
**Ratio:** 16:9
**New image** — the Cultural Digital Worlds page currently has no
dedicated discipline image.
**Used on:** `/worlds/cultural-digital-worlds`.

**Prompt:**
> A sheet of iridescent holographic glass photographed against a deep
> black background. Soft cyan and pale green refractions ripple across
> the surface. A single sharp highlight near the upper-right edge. The
> rest of the frame is liquid black. Not glitchy, not maximalist —
> precise, expensive, atmospheric. Halfway between a James Turrell light
> piece and an Apple Vision Pro promo still. Palette anchor: Iridescent
> Cyan `#46d6ce`. Negative space in the lower-left.

---

## 10. Worldbuilding floating — home interstitial

**Filename:** `public/images/07_worldbuilding_floating.jpg`
**Ratio:** 16:9
**Replaces:** `public/images/02_worldbuilding_floating.jpg`
**Used on:** the home page, the big full-bleed atmospheric section under
the six-card World preview ("A world built for those who understand
silence").

**Prompt:**
> A vast dark interior space with a single, gently floating geometric
> object hovering in the middle distance. The object is undefined —
> could read as a stone, a piece of architecture, or a planet. It is
> small in frame, dwarfed by the surrounding atmosphere. A thin sliver
> of warm copper light edges its top. Everything else is liquid black
> haze. The viewer's eye is drawn to the lower-left so a headline can
> sit there. Painterly, slow-shutter, James Turrell territory. Neutral
> palette with a single warm accent.

---

## 11. Systems — home section image (left half)

**Filename:** `public/images/08_systems_green.jpg`
**Ratio:** 4:5 (portrait-leaning) — 1920×2400
**Replaces:** `public/images/06_spatial_green.jpg`
**Used on:** the home page two-column "Worldbuilding for modern luxury"
section (left image), and as the page-break image inside `/collaboration`.

**Prompt:**
> A still interior corner of a high-end architectural space. One
> half-open glass door at the right reveals a faint deep-green tropical
> shadow outside. The room is otherwise empty: polished concrete floor,
> a sliver of warm light from above. Materials over objects. Slow,
> meditative. Tadao Ando × Amangiri. Negative space in the top half so
> the room reads as larger than the photograph.

---

## 12. Reflective table — quote section + Process break

**Filename:** `public/images/09_reflective_table.jpg`
**Ratio:** 16:9
**Replaces:** `public/images/08_reflective_table.jpg`
**Used on:** the home page quote section ("Every gesture becomes
memory"), and the page-break image inside `/process`.

**Prompt:**
> A long, dark, polished stone table photographed from a low angle. A
> single warm overhead light catches the table's surface and dissolves
> into reflection. The room beyond the table is invisible — pure black.
> Slight haze rises from the surface. No objects on the table. Editorial
> stillness, Aman dining room at midnight. Palette: deep charcoal +
> single warm copper highlight. Centre kept dark for text overlay.

---

## 13. Services break image (between blocks)

**Filename:** `public/images/10_services_chrome.jpg`
**Ratio:** 16:9
**New image** for the Services page atmospheric break (between the six
service blocks and the FAQs). Currently re-uses the chrome image.

**Prompt:**
> A single suspended object: a polished obsidian sphere hovering in
> liquid black space. A faint cool highlight wraps the upper rim. The
> sphere is the only subject. The frame is otherwise empty atmosphere
> with subtle dust drift. Painterly, weightless, silent. Halfway between
> a Hilma af Klint vibration and a contemporary still life. Neutral
> charcoal palette with one cold highlight.

---

## 14. Optional — About page hero (future)

**Filename:** `public/images/11_about_silence.jpg`
**Ratio:** 16:9
**Used on:** `/about`, if and when we add a hero image to that page.

**Prompt:**
> A single human silhouette walking slowly across a vast dark space
> toward a distant warm light source. Back of the figure only. The
> proportions feel small against the room. Slight motion blur on the
> feet, the rest crisp. Suggests slow work, deliberate practice, a
> studio at night. No furniture, no architecture beyond the wall the
> light comes from. Cinematic, painterly. Neutral palette with a single
> warm copper accent.

---

## Quick filename map (paste-ready)

```
public/images/hero/01_background_desktop.png    Hero wide
public/images/hero/01_background_mobile.png     Hero tall (mobile)
public/images/hero/02_haze_overlay.png          Transparent haze
public/images/01_hospitality_amber.jpg          Hospitality discipline
public/images/02_nightlife_violet.jpg           Nightlife discipline
public/images/03_lifestyle_pearl.jpg            Luxury / lifestyle
public/images/04_architecture_stone.jpg         Architecture
public/images/05_music_indigo.jpg               Music
public/images/06_digital_cyan.jpg               Cultural digital
public/images/07_worldbuilding_floating.jpg     Home interstitial
public/images/08_systems_green.jpg              Systems / Collaboration
public/images/09_reflective_table.jpg           Quote / Process
public/images/10_services_chrome.jpg            Services break
public/images/11_about_silence.jpg              (optional) About hero
```

## After you drop the files

Drop the new files into `public/images/` (or `public/images/hero/` for
the three hero ones). Then tell me which ones landed and I will:

1. Wire the new filenames into the components (`_world.tsx`, `page.tsx`,
   `_process.tsx`, `_collaboration.tsx`, `_services.tsx`).
2. Add the `discipline.image` field to the Music and Cultural Digital
   Worlds in `app/_lib/worlds.ts` (they currently have no discipline
   image; the new music-indigo and digital-cyan images will fill that).
3. Delete the old placeholder JPGs that have been replaced.

## Generation tip

If your image-generation tool supports it, pass the **house style** block
once as a system or style preset, then run each numbered prompt as a
separate request. Going one image at a time keeps each piece coherent
and lets you regenerate single frames without disturbing the rest.
