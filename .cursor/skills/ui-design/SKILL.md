---
name: ui-design
description: Change My Recipe landing or screen visual design. Use for layout, branding, hero, typography, and motion work.
---

# UI design

Update this skill when a design system solidifies.

## Before starting

1. Read `src/app/page.tsx`, `globals.css`, `layout.tsx`
2. If the change is functional (CRUD), also invoke [`recipe-feature`](../recipe-feature/SKILL.md)

## Hard rules (landing / promo surfaces)

- One composition in the first viewport (not a dashboard)
- Brand ("My Recipe") is hero-level; headlines must not overpower it
- Hero budget: brand + one headline + one short sentence + CTA group + dominant visual
- Full-bleed hero imagery by default (no inset cards/collages unless the system requires it)
- No badges/stickers overlaid on hero media
- Cards only as interaction containers; never in the hero
- One job per section
- 2–3 intentional motions, not decorative noise

## Avoid

- Default purple/indigo gradient themes
- Cream + terracotta + display-serif cliché
- Broadsheet hairlines / zero radius / dense columns
- Emoji clusters, heavy glow, meaningless pill stacks

## Typography and atmosphere

- Prefer expressive fonts over Inter/Roboto/Arial/system-only stacks; define CSS variables
- Avoid flat single-color backgrounds; use gradient, image, or subtle pattern
- Abstract gradients alone are not the main visual — anchor in food/product context

## Implementation

- Extend Tailwind 4 + existing `globals.css` tokens
- Verify mobile and desktop first viewport
- Accessibility: contrast, focus, heading hierarchy

## Done when

- [ ] Brand is clear even without nav
- [ ] First viewport has no secondary marketing clutter (stats, schedules, addresses)
- [ ] Cards are only used where interaction needs a container
- [ ] Mobile layout holds
- [ ] [`verify-frontend-change`](../verify-frontend-change/SKILL.md) completed for UI edits
