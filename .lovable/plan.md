

## Problem

Components use `framer-motion` with `initial={{ opacity: 0 }}`, which in an SSR/Next.js environment means:

1. **Server renders HTML with `opacity: 0`** (inline style from framer-motion)
2. **Before hydration, content is invisible** to both users and crawlers
3. **Googlebot may index empty-looking pages** since it sometimes captures pre-hydration state
4. **CLS (Cumulative Layout Shift)** increases when content "pops in" after hydration

## Affected Components

| Component | Animation | Risk |
|-----------|-----------|------|
| `TabsContent` (`src/components/ui/tabs.tsx`) | `initial={{ opacity: 0, y: 4 }}` | Content hidden until hydration |
| `ShowcaseSection` (`src/components/showcase/ShowcaseSection.tsx`) | `initial={{ opacity: 0, y: 12 }}` | Sections invisible on first render |

## Solution

Replace `initial` with a **hydration-safe** pattern that only animates on the client after mount.

### Approach: Use `initial={false}` or a `useReducedMotion` + `isMounted` guard

**For `TabsContent`** (UI component, will be reused in Next.js):
- Remove `motion.div` wrapper entirely from the base UI component
- Animation in tab content is a "nice-to-have" that causes real SSR issues
- If animation is desired, make it opt-in via a prop like `animated={true}`, defaulting to `false`

**For `ShowcaseSection`** (showcase-only, not a reusable UI component):
- This is a demo/showcase wrapper, not a component that ships to Next.js projects
- Can keep animations as-is since it won't be imported in SSR contexts
- But for safety, add a comment marking it as client-only

### Technical Details

**`src/components/ui/tabs.tsx`** -- Remove the `motion.div` wrapper from `TabsContent`:

```tsx
// Before (SSR-unsafe):
<motion.div
  initial={{ opacity: 0, y: 4 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2, ease: "easeOut" }}
>
  {children}
</motion.div>

// After (SSR-safe):
{children}
```

This removes the `framer-motion` dependency from the core UI component entirely. The `TabsContent` already has a CSS-based `animate-fade-in` available via Tailwind if subtle animation is needed.

**`src/components/ui/tabs.tsx`** -- Also remove unused `motion` and `AnimatePresence` imports to reduce bundle size.

**`src/components/showcase/ShowcaseSection.tsx`** -- Add a `"use client"` comment/marker to document that this component is client-only and should not be used in SSR contexts.

### Additional Benefit

Removing `framer-motion` from core UI components means:
- **Smaller bundle** for consumers (no 30-40KB dependency required)
- **Tree-shakeable** -- Next.js projects only pay for what they use
- **No hydration mismatch warnings** in React 18 strict mode

### Files to Modify

1. `src/components/ui/tabs.tsx` -- Remove `motion.div` wrapper and unused imports
2. `src/components/showcase/ShowcaseSection.tsx` -- Add client-only annotation comment

