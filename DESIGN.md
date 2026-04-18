# Design System Document: The Precision Architect

## 1. Overview & Creative North Star
The visual identity of this design system is anchored by the Creative North Star: **"The Precision Architect."** 

MahaIND Overseas Pvt Ltd operates in an industrial landscape where engineering meets global logistics. This system eschews the generic "industrial" tropes of heavy metal and sharp edges. Instead, it embraces a high-end editorial aesthetic that signals mathematical precision through sophisticated dark modes, ultra-wide typography scales, and a signature "curved-industrial" geometry. 

By utilizing high corner roundness (`ROUND_FULL` or `16px+`) against a deep, technical background, we create a "Soft Industrial" look—one that feels technologically advanced yet human-centric. The layout moves away from rigid, boxed-in grids toward an expansive, layered environment that favors breathing room and tonal depth over structural lines.

---

## 2. Colors
Our palette is a technical study in dark-mode depth, using the core brand colors as precision accents rather than primary floods.

### Core Palette
- **Background (`#111316`):** The foundational ink. All primary surfaces originate here.
- **Primary / Industrial Orange (`#ffb599`):** Used for critical calls to action and structural highlights.
- **Secondary / Technical Blue (`#8aceff`):** Reserved for data visualization and secondary navigation.
- **Tertiary / Efficient Green (`#91da4d`):** Denotes success states and growth metrics.
- **Error / Regulatory Red (`#ffb4ab`):** High-visibility alerts and critical warnings.

### The "No-Line" Rule
To maintain a high-end editorial feel, **1px solid borders are strictly prohibited for sectioning.** Boundaries between content must be defined exclusively through:
1. **Background Color Shifts:** Use `surface_container_low` against a `surface` background.
2. **Negative Space:** Utilize the 4rem (`16`) or 6rem (`24`) spacing scale to separate conceptual blocks.

### Surface Hierarchy & Nesting
Think of the UI as physical layers of smoked glass. Use the Material tiers to create depth:
- **Level 1 (The Floor):** `surface` (#111316).
- **Level 2 (The Deck):** `surface_container_low` (#1a1c1f).
- **Level 3 (The Component):** `surface_container` (#1e2023).
- **Level 4 (The Interaction):** `surface_container_high` (#282a2d).

### The "Glass & Gradient" Rule
For main Hero CTAs or header backgrounds, use a subtle linear gradient transitioning from `primary` (#ffb599) to `primary_container` (#f26522). To elevate floating menus, apply `backdrop-blur` with a semi-transparent `surface_container_highest` color at 70% opacity.

---

## 3. Typography: Space Grotesk
We use **Space Grotesk** for its monospaced-adjacent aesthetic, which perfectly communicates the "Architect" persona.

*   **Display (Display-LG, 3.5rem):** Use for hero statements. Set with tight letter-spacing (-0.02em) to give a heavy, authoritative presence.
*   **Headlines (Headline-LG, 2rem):** Used for section titles. These should always sit on a `surface` or `surface_container_low` background with ample top padding.
*   **Body (Body-LG, 1rem):** Primary reading font. Ensure a high contrast ratio against the background (using `on_surface` #e2e2e6).
*   **Labels (Label-MD, 0.75rem):** All caps, letter-spaced (+0.05em), used for metadata or industrial specs.

---

## 4. Elevation & Depth
In "The Precision Architect" system, elevation is conveyed through **Tonal Layering**, not elevation shadows.

- **The Layering Principle:** A card should never have a shadow if it is sitting on a different tonal surface. Place a `surface_container_lowest` element on top of a `surface_container` section to create a "recessed" effect.
- **Ambient Shadows:** Only use shadows for elements that physically float (e.g., Modals, Tooltips). Shadows must use the `on_surface` color at 4% opacity with a blur of `3rem (xl)` to simulate soft ambient light.
- **The "Ghost Border" Fallback:** If accessibility requires a stroke, use `outline_variant` (#594138) at **15% opacity**. This creates a "hairline" suggestion that disappears into the dark background.

---

## 5. Components

### Buttons & Navigation
- **Corner Radius:** All buttons must use `ROUND_FULL` (Pill-shaped).
- **Primary Button:** `primary` background with `on_primary` text. No border.
- **Secondary Button:** `surface_container_highest` background with `on_surface` text.
- **States:** On hover, increase brightness by 10% rather than changing the hue.

### Input Fields
- **Styling:** Use `surface_container_low` as the field background. 
- **Corners:** `md` (1.5rem) or `DEFAULT` (1rem). 
- **Interactions:** The active state should be defined by a `primary` glow (2px) using a 20% opacity `primary` color.

### Cards & Lists
- **Rule of Separation:** Never use divider lines. Separate list items using `surface_container_low` backgrounds for every even-numbered item, or simply use 1.5rem (`6`) of vertical spacing.
- **Radius:** All cards must use `lg` (2rem) or `xl` (3rem) corner radius to lean into the modern, smooth aesthetic.

### Additional Industrial Components
- **Data Meters:** Use the `secondary` (Blue) or `tertiary` (Green) tokens for progress bars, using `ROUND_FULL` for the caps to match the button styling.
- **Spec Tags:** Use `Label-SM` typography inside a pill-shaped container (`surface_variant`) for technical specifications.

---

## 6. Do's and Don'ts

### Do:
- **Do** use asymmetrical layouts where text blocks are offset from center-aligned images to create editorial interest.
- **Do** use the `secondary_fixed_dim` color for icons to provide a muted, professional tech feel.
- **Do** lean heavily into negative space (4rem and above) to make the industrial data feel "breathable."

### Don't:
- **Don't** use 100% white (#FFFFFF). Always use `on_surface` (#e2e2e6) to prevent eye strain in dark mode.
- **Don't** use sharp 90-degree corners. Even in a "precision" system, our signature is the high-roundness curve.
- **Don't** use traditional drop shadows. Stick to background tonal shifts or extra-diffused ambient light.
- **Don't** crowd the interface. If the screen feels busy, increase the spacing scale by one increment.