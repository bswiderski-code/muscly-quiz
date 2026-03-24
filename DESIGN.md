# Design System Strategy: Kinetic Noir



## 1. Overview & Creative North Star

**Creative North Star: "The High-Velocity Monolith"**



This design system moves beyond the standard "fitness app" aesthetic. Instead of bright, friendly gym vibes, we are leaning into an editorial, high-performance aesthetic that mirrors elite athletic training. The goal is "Kinetic Noir"—a high-contrast, moody environment where the `primary` (Electric Lime) acts as a laser-focused pulse of energy against a sophisticated, dark architectural backdrop.



To break the "template" look, we utilize **Intentional Asymmetry**. Headers are rarely centered; instead, they are pushed to the edges of the grid, utilizing large `display-lg` typography to create "tension" and "momentum." Overlapping elements—such as a `primary_fixed` action chip bleeding over the edge of a `surface_container_high` card—create a sense of physical movement and depth that flat layouts lack.



---



## 2. Colors & Surface Architecture

The color palette is designed to minimize cognitive load while maximizing emotional impact.



* **Primary (`#e1fa6d`):** Use sparingly. It is a "functional" color, reserved for critical CTAs, progress indicators, and active states. It represents the "energy" within the system.

* **Neutral Palette:** The transition from `background` (#0e0e11) to `surface_container_highest` (#25252a) provides a rhythmic depth.



### The "No-Line" Rule

**Explicit Instruction:** Do not use 1px solid borders to define sections. Boundaries must be established through tonal shifts. For example, a hero section using `surface` should transition into a feature grid using `surface_container_low`. This creates a seamless, "molded" appearance rather than a "boxed" one.



### Surface Hierarchy & Nesting

Treat the UI as a physical stack.

1. **Base:** `surface` (The foundation).

2. **Sectioning:** `surface_container_low` (For large content blocks).

3. **Components:** `surface_container_high` (For cards and interactive modules).

4. **Floating Elements:** `surface_bright` (For modals or elevated alerts).



### The "Glass & Gradient" Rule

To add "soul" to the dark theme:

* **CTAs:** Use a subtle linear gradient from `primary` to `primary_container` at a 135-degree angle. This prevents the Electric Lime from looking "flat" or "plastic."

* **Glassmorphism:** For sticky navigation or floating headers, use `surface` at 70% opacity with a `backdrop-blur` of 20px. This allows the high-energy content to peak through the edges, maintaining the "Kinetic" feel.



---



## 3. Typography: The Editorial Edge

We use **Inter** not as a utility font, but as a bold, architectural element.



* **Display (lg/md):** These are your "Hype" headers. Use `display-lg` for hero statements. Tighten the letter-spacing by `-0.04em` to create a dense, powerful block of text.

* **Headlines:** Used for section titles. Always pair a `headline-lg` with a `label-md` in `primary` color to create a high-contrast hierarchy.

* **Body (lg/md):** Keep these clean and spacious. Use `on_surface_variant` for secondary descriptions to ensure the user's eye is always drawn to the `on_surface` (white) headlines first.



---



## 4. Elevation & Depth

In a dark, energetic system, traditional drop shadows feel muddy. We use **Tonal Layering**.



* **The Layering Principle:** To lift a card, move it from `surface_container_low` to `surface_container_highest`. The 4% brightness increase provides enough visual "pop" without breaking the noir aesthetic.

* **Ambient Shadows:** If a floating element requires a shadow (e.g., a "Start Workout" FAB), use a blur of `32px`, an opacity of `8%`, and tint the shadow color with `surface_tint`. This creates a glow rather than a dark stain.

* **The Ghost Border Fallback:** For interactive inputs, use the `outline_variant` at **15% opacity**. This provides a "suggestion" of a boundary that only becomes solid (`primary`) upon focus.



---



## 5. Components



### Buttons

* **Primary:** `primary` background, `on_primary` text. Shape: `rounded-sm` (4px) for a sharp, aggressive look.

* **Secondary:** `surface_container_highest` background. No border. Use for "Save for Later" or "Settings."

* **Tertiary:** Transparent background with `primary` text. Underline only on hover.



### Cards & Lists

* **The Divider Ban:** Strictly forbid `px` dividers. Separate workout list items using `1.5` (0.5rem) vertical spacing and alternating `surface_container_low` and `surface_container_high` backgrounds for a striped, high-performance look.

* **Action Chips:** Use `secondary_container` for inactive filters. When active, transition to `primary` with `on_primary` text.



### Performance Inputs

* **Data Fields:** Use `surface_container_lowest` for the field background. This "hollows out" the UI, making the input feel like a physical void to be filled with data.



### Signature Component: The "Pulse" Progress Bar

* A thick (8px) track using `surface_container_highest` with a `primary` fill. Add a subtle outer glow to the leading edge of the progress bar using the `primary` color at 30% opacity.



---



## 6. Do's and Don'ts



### Do

* **DO** use extreme scale. Pair a `display-lg` headline with a `body-sm` caption for an editorial feel.

* **DO** use "Bleed" imagery. Let athlete photography break out of containers or overlap typography to suggest power that can't be contained.

* **DO** use the Spacing Scale `20` (7rem) for section breathing room. High performance requires room to breathe.



### Don't

* **DON'T** use `error` red for everything negative. Use `on_surface_variant` for empty states to keep the mood "Noir." Reserve `error` for critical failures only.

* **DON'T** use 100% white (`#FFFFFF`) for body text. Always use `on_surface` or `on_surface_variant` to prevent eye strain against the near-black background.

* **DON'T** use rounded-full (pill) buttons unless it's a floating action button. The `rounded-sm` (4px) or `rounded-md` (6px) scale feels more technical and precise.



---

**Director's Closing Note:** This system is about the "Burn." Every pixel should feel like it's vibrating with potential energy. If a screen feels static or "safe," increase the typographic contrast or adjust the surface nesting to create more architectural depth.