# Anon E-Commerce Design System
*As reflected in the Auth Modal & Account Settings components*

This document outlines the core UI tokens and patterns used to create the clean, modern, and premium aesthetic of the Anon E-Commerce platform's custom components.

## 1. Color Palette

The color system relies on high-contrast neutrals combined with a strong, trustworthy brand blue.

### Primary Brand Colors
- **Brand Blue (Base)**: `#185FA5` — Used for primary buttons, active states, and focus rings.
- **Brand Blue (Hover)**: `#124b82` — A slightly darkened shade used for button hover states.
- **Brand Blue (Subtle/Background)**: `#E6F1FB` — Used for soft backgrounds like the avatar circle.

### Neutrals (from `style-prefix.css`)
- **Card Background**: `#ffffff` — Crisp white for maximum legibility.
- **Eerie Black**: `var(--eerie-black)` / `#212121` — Used for headings, active tabs, and primary form inputs.
- **Sonic Silver**: `var(--sonic-silver)` / `#787878` — Used for secondary text, labels, and inactive tabs.
- **Cultured**: `var(--cultured)` / `#f0f0f0` — Used for subtle borders, card outlines, and inactive background states.

### Semantic Status Colors
- **Error/Destructive**: `#ef4444` (Border/Text), `#fef2f2` (Background)
- **Success**: `#15803d` (Text), `#f0fdf4` (Background)

---

## 2. Border Radius & Shape

We use soft, generous corner rounding to make the interface feel approachable and modern, moving away from harsh sharp edges.

- **Modals & Large Cards**: `24px`
- **Primary Buttons**: `12px`
- **Form Inputs**: `10px`
- **Inner Tabs/Pills**: `9px`
- **Avatars & Icons**: `50%` (Perfect Circle)

---

## 3. Elevation & Shadows

Shadows are kept exceptionally soft, with large blur radii and very low opacity, creating a "floating" effect rather than a harsh drop shadow.

- **Modal Card Elevation**: `0 24px 48px rgba(0, 0, 0, 0.08)`
  *Creates a deep, realistic spatial separation from the blurred background.*
- **Button Glow/Elevation**: `0 4px 12px rgba(24, 95, 165, 0.15)`
  *Gives primary buttons a subtle, clickable prominence.*
- **Button Hover Elevation**: `0 6px 16px rgba(24, 95, 165, 0.25)`
  *Expands when hovered, paired with a `-1px` upward translation.*
- **Active Tab/Inner Element**: `0 2px 6px rgba(0, 0, 0, 0.05)`
  *Provides a very tight, subtle lift against a gray background.*

---

## 4. Typography & Layout

- **Font Family**: Inherited from the global `Poppins` stack.
- **Font Weights**: 
  - `400` (Regular) for input text.
  - `500` (Medium) for labels and secondary text.
  - `600` (Semi-bold) for Buttons, Page Titles, and Active Tabs.
- **Spacing**: Consistent use of `4px` / `8px` / `16px` / `24px` / `32px` gaps in Flexbox and Grid layouts.

---

## 5. Interactions & Micro-Animations

Smooth interactions make the app feel premium and responsive.

- **Form Focus Rings**: Instead of harsh outlines, inputs receive a combination of border-color change and a soft colored shadow:
  ```css
  input:focus {
    border-color: #185FA5;
    box-shadow: 0 0 0 3px rgba(24, 95, 165, 0.1);
  }
  ```
- **Button Hover**: Primary buttons translate upwards (`transform: translateY(-1px);`) and cast a wider shadow, giving a tactile "pressable" feel.
- **Modal Entry Animation**: Modals slide up slightly and scale in (`transform: translateY(20px) scale(0.95)` to `scale(1)`) over `0.3s` using a snappy `cubic-bezier` timing function.
- **Overlay Blur**: Background overlays utilize `backdrop-filter: blur(4px)` to maintain context of the page behind the modal without distracting the user.
