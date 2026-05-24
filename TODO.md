# WGHC Website — TODO

Working list of follow-ups for the site. Update as items land.

---

## 🔌 Integrations needed before launch

- [ ] **Form-handler for membership applications.**
      Currently the form on `membership.html` redirects to payment but
      doesn't email anyone the application data. Wire up one of:
      - **Formspree** — free 50 submissions/mo. Change `<form>` to
        `<form action="https://formspree.io/f/YOUR_ID" method="POST">`.
      - **Netlify Forms** — free 100/mo, automatic if hosted on Netlify.
      - **Google Forms** — POST to a Google Form's prefill URL.
      Same treatment needed for the contact form on `contact.html`.

- [ ] **Real Google Calendar ID** in `config.js → calendarId`.
      Current placeholder: `wisconsingohikingclub%40gmail.com`. Replace
      with the real club calendar ID and make sure the calendar is set
      to public in Google Calendar settings.

- [ ] **Real payment-provider URLs** in `config.js → paymentUrls`.
      - Sign up at Donorbox (recommended for nonprofits) or Stripe
      - Create membership-dues items: Individual ($25), Household ($40)
      - Paste resulting checkout URLs into `config.js`
      - Set provider's post-payment redirect to `.../thanks.html`

- [ ] **Real contact email addresses** in `config.js → contact`.
      Currently uses `hello@wghc.example.org`. Update across the contact
      page footer text too (`contact.html` has the mailing address
      hardcoded — search for `wghc.example.org`).

## 📅 Calendar / scheduling

- [ ] Remove the placeholder June/July/August 2026 sample hikes from
      `hikes.html` once the live Google Calendar embed is working — they
      duplicate calendar events.

- [ ] Add `webcal://` and `.ics` subscribe links on `hikes.html`
      (Google Calendar provides them) so members can subscribe in
      Apple Calendar / Outlook.

## 🗺️ Trail Finder enhancements

- [ ] **Local-area polylines on the overview map** (~11 MB total).
      Currently only IAT + NCT polylines render. To add the 4,189 local
      polylines for state parks/forests:
      - Split `local_polylines.json` into per-area files at build time
      - Lazy-load each area's polyline only when a user clicks its
        marker or expands its detail panel
      - Optionally vector-tile the dataset with
        [tippecanoe](https://github.com/felt/tippecanoe) → PMTiles for
        instant pan/zoom

- [ ] **Simplify polyline coordinates** with mapshaper
      (`mapshaper -simplify 10%`) to shrink IAT polylines from ~1.4 MB
      to ~400 KB with no visible quality loss at typical zoom levels.

- [ ] **GPX download** per segment — generate `.gpx` files from the
      existing polyline geometry. Adds a "Download GPX" button to the
      detail panel.

- [ ] **Conditions / trail-status overlay** — pull recent reports from
      the Ice Age Trail Alliance's alerts feed (if available).

## 🎨 Design / content

- [ ] **Photo gallery** — add a `gallery.html` page with hike photos.
      Could pull from a Google Photos shared album embed, Flickr feed,
      or local images committed to `images/gallery/`.

- [ ] **Trail Talk blog/newsletter page** — list of recent club
      newsletters as PDFs or markdown posts.

- [ ] **Hike trip reports** — short member-written post-hike summaries
      linked from each calendar event in retrospect.

- [ ] **Hero photography** — currently the hero uses CSS gradients only.
      A real photo or two from a Wisconsin hike would lift it. Optimize
      with `cwebp` and serve at multiple sizes via `<picture>`.

- [ ] **Replace SVG logo fallbacks** — `images/logo-*.svg` files are
      no longer referenced anywhere. Delete them once you're confident
      the PNGs are stable:
      ```powershell
      Remove-Item C:\Users\scsch\projects\wghc-website\images\*.svg
      ```

## 🌐 Hosting / domain

- [ ] **Custom domain** — point `wisconsingohikingclub.org` (or a new
      domain) at GitHub Pages. Settings → Pages → Custom domain.

- [ ] **HTTPS** — automatic on GitHub Pages once custom domain DNS
      is verified. Just check the "Enforce HTTPS" box.

- [ ] **301 redirects** — when ready to retire the Weebly site, set up
      forwarding from `wisconsingohikingclub.weebly.com` to the new
      domain (Weebly has a redirect setting).

## 🧰 Tech debt / housekeeping

- [ ] **Remove sample event data from `index.html`** once the calendar
      is live — pull next 3-4 events from the Google Calendar feed
      instead (Google Calendar JSON API or iCal parsing).

- [ ] **Accessibility audit** — run Lighthouse / axe DevTools, fix any
      contrast issues, ensure all interactive elements have proper
      labels, test keyboard navigation through the trail finder.

- [ ] **Analytics (optional)** — Plausible or simple GoatCounter are
      privacy-friendly and free for small sites. Skip Google Analytics
      to keep the site cookie-banner-free.

## ✅ Done

- [x] Initial 6-page site (Home, About, Hikes, Trails, Membership, Contact)
- [x] Trail Finder with 228 segments + 70+ parks + 295 local areas
- [x] Elevation profiles + Leaflet map in trail detail panel
- [x] Drop NRT segments, add local areas to trail data
- [x] Mobile-first responsive design + logo integration
- [x] Real WGHC mission / Rambler–Level 4 difficulty system / guest-first policy
- [x] Google Calendar embed (placeholder ID — needs real one)
- [x] Payment flow: membership form → checkout redirect → `thanks.html`
- [x] `config.js` for one-place editing of payment URLs / calendar ID
- [x] GitHub repo + push instructions documented in README
