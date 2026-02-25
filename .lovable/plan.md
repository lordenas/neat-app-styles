

# Plan: 4 Features for CalcHub

## 1. PWA (Progressive Web App)

**What**: Make the app installable on phones and desktops with offline caching.

**Changes**:
- Create `public/manifest.json` with app name, icons, theme color, `display: standalone`
- Create `public/icons/` with icon sizes (192x192, 512x512) -- will use simple SVG-based icons
- Add `<link rel="manifest">` to `index.html`
- Add meta tags for iOS (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`)
- Create a service worker (`public/sw.js`) with cache-first strategy for static assets
- Register the service worker in `src/main.tsx`

## 2. Save Calculations from Calculator

**What**: Add a "Save to Dashboard" button in the credit calculator results section for logged-in users.

**Changes**:
- Import `useAuth` and `supabase` in `CreditCalculator.tsx`
- Add a "Save" button next to "Print" and "PDF" buttons in the results header (line ~700)
- On click: if not logged in, show toast with link to `/auth`; if logged in, insert into `saved_calculations` with `calculator_type: "credit"`, parameters (amount, rate, term), and result (monthly payment, overpayment, total)
- Show success/error toast after save
- Add a dialog for naming the calculation before saving (simple input + confirm)

## 3. Compare Calculations

**What**: Allow selecting 2-3 saved calculations in the dashboard and comparing them side by side.

**Changes**:
- Create `src/pages/Compare.tsx` -- page that receives calculation IDs via query params (`?ids=id1,id2,id3`)
- Add route in `App.tsx`
- In `Dashboard.tsx`: add checkboxes on each calculation card, show a floating "Compare (N)" button when 2-3 are selected
- Compare page: fetch selected calculations, render a comparison table with rows for each parameter (amount, rate, term, monthly payment, overpayment, total)
- Support both logged-in access (from dashboard) and shared link access (see feature 4)

**Database**: No schema changes needed -- uses existing `saved_calculations` table.

## 4. Share Results

**What**: Generate a unique public link for a calculation that anyone can view without login.

**Database changes**:
- Add `share_token` (text, nullable, unique) column to `saved_calculations`
- Add RLS policy: allow anonymous SELECT when `share_token` matches the request
- Migration SQL:
  ```sql
  ALTER TABLE public.saved_calculations ADD COLUMN share_token text UNIQUE;
  CREATE POLICY "Anyone can view shared calculations"
    ON public.saved_calculations FOR SELECT
    USING (share_token IS NOT NULL AND share_token = current_setting('request.headers', true)::json->>'x-share-token');
  ```
  Actually, simpler approach: create a separate permissive SELECT policy that allows reading rows where `share_token` is not null, filtered by token passed as a URL param. Since RLS policies are OR'd for permissive, we add:
  ```sql
  CREATE POLICY "Public shared calculations"
    ON public.saved_calculations FOR SELECT
    USING (share_token IS NOT NULL);
  ```
  Then filter by token in the query itself (`.eq('share_token', token)`). This is safe because `share_token` is a random UUID that's unguessable.

**Changes**:
- In `Dashboard.tsx`: add "Share" button on each calculation card
- On click: generate a random UUID token, update the calculation's `share_token`, copy link `https://.../shared/{token}` to clipboard
- Create `src/pages/SharedCalculation.tsx` -- public page that fetches calculation by `share_token` and displays results (read-only, no auth required)
- Add route `/shared/:token` in `App.tsx`
- Add a "Copy link" button with toast feedback

---

## Technical Details

**File changes summary**:
- `public/manifest.json` -- new
- `public/sw.js` -- new
- `index.html` -- add manifest link + iOS meta tags
- `src/main.tsx` -- register SW
- `src/pages/CreditCalculator.tsx` -- add Save button + logic (~30 lines)
- `src/pages/Dashboard.tsx` -- add checkboxes, compare button, share button
- `src/pages/Compare.tsx` -- new (~150 lines)
- `src/pages/SharedCalculation.tsx` -- new (~100 lines)
- `src/App.tsx` -- add 2 routes
- Database migration: add `share_token` column + public SELECT policy

**Order of implementation**: PWA first (isolated), then Save, then Share (needs migration), then Compare.

