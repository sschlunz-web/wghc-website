# Wisconsin Go Hiking Club — Website

A modern static website for the Wisconsin Go Hiking Club, featuring an
interactive **Trail Finder** for the Ice Age Trail, North Country Trail,
Wisconsin state parks, and 295 local trail areas.

No build step, no server required. Open `index.html` in a browser and it
runs.

## Features

- **Trail Finder** — Search 228 Ice Age &amp; North Country Trail segments,
  70+ state parks and forests, and 295 local trail areas by name, county,
  terrain feature, or endpoint.
- **Filtering &amp; sorting** — by trail system, difficulty, segment type,
  miles, or elevation gain.
- **Interactive map** — Leaflet + OpenStreetMap shows polylines for every
  filtered segment, with markers for parks and trail areas.
- **Elevation profiles** — Per-segment SVG profile charts with total gain,
  loss, max elevation, and max slope. Loaded on demand.
- **Hike schedule** — Sample upcoming group hikes with filters.
- **Membership &amp; contact** — Tiered membership signup and contact form.
- **Responsive** — Mobile-friendly throughout.

## Quick start

```bash
# Just open it
open index.html         # macOS
xdg-open index.html     # Linux
start index.html        # Windows
```

Or serve it locally:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Project structure

```
.
├── index.html              Home page
├── about.html              About the club
├── hikes.html              Hike schedule
├── trails.html             Trail Finder
├── membership.html         Membership tiers + signup
├── contact.html            Contact form + FAQ
├── styles.css              Shared design system
├── partials.js             Shared header &amp; footer
├── trail-finder.js         Trail Finder logic
└── data/
    ├── trails.js           Trail systems (IAT, NCT)
    ├── segments.js         228 trail segments
    ├── parks.js            State parks &amp; forests
    ├── areas.js            295 local trail areas
    ├── elevation_summary.js  Per-segment elevation stats
    ├── polylines_iat.js    GeoJSON LineStrings for IAT segments
    ├── polylines_nct.js    GeoJSON LineStrings for NCT segments
    └── profiles/           Lazy-loaded per-segment elevation curves
```

## Data sources

- Ice Age Trail segments — OpenStreetMap &amp; Ice Age Trail Alliance public data
- North Country Trail segments — North Country Trail Association
- Wisconsin state parks &amp; forests — Wisconsin DNR open data
- Local trail areas — OpenStreetMap, Wisconsin DNR
- Elevation profiles — derived from USGS 3DEP elevation data

## Deployment

This is a pure static site. It deploys to any static host with zero
configuration:

- **GitHub Pages** — push to `main`, then Settings → Pages → Source: `main`
- **Cloudflare Pages** — "New site from Git", no build command, output: `/`
- **Netlify** — Drop the folder onto [Netlify Drop](https://app.netlify.com/drop)
- **Vercel** — `vercel deploy --prod`

## Tech notes

- **No bundler.** Browser-native modules with global namespaces
  (`window.WGHC_*`) for data files. This keeps the project simple to fork
  and inspect.
- **Map library.** Leaflet 1.9.4 loaded from unpkg CDN. Open-source
  OpenStreetMap tiles.
- **Lazy loading.** Polylines (~1.6 MB) load only when the map is opened.
  Elevation profiles load per-segment on detail-panel open.
- **Total page weight on cold load** is ~290 KB (~80 KB gzipped) for
  everything except the map polylines.

## License

Content and code: MIT License — see [LICENSE](LICENSE).

Trail data is sourced from public-domain government datasets and
open-license community projects. Map tiles &copy; OpenStreetMap
contributors.

## Contributing

Found a trail-segment error? Have a new hike to add? Open an issue or
pull request, or email `trails@wghc.example.org`.
