---
name: verify-frontend-change
description: Verify any UI change end-to-end before declaring it done. Use after editing pages, components, styles, or client interactions.
---

# Verifying frontend changes

Never report a UI change as complete based on a successful edit alone. Verify it the way a human reviewer would.

1. Start the dev server (`npm run dev`) and open the edited page in the browser.
2. Interact with the change directly. For a new control (button, input, toggle): use it, confirm the expected state change, and capture before/after evidence (screenshot or clear notes).
3. Check the browser console: zero new errors or warnings from this change.
4. Run `npm run lint`. If the change could affect production output, also run `npm run build`.
5. If browser automation / DevTools MCP is available, use it for interaction and console checks. Prefer quantitative checks over "looks fine".

If any step fails, fix the issue and rerun from step 1 — do not hand back partially verified work.

## Recipe-app specifics

- Confirm Supabase status indicator (or equivalent) still reflects env configuration honestly
- After data UI lands: verify empty state and at least one seeded/happy-path record when Supabase is running
- Mobile width (~375px) and desktop width both checked for layout regressions
