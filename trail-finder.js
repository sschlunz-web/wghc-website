/* =========================================================================
   Trail Finder — search, filter, sort, elevation profiles, Leaflet map
   ========================================================================= */
(function () {
"use strict";

// ---------- Data ----------
const TRAILS_LIST = window.WGHC_TRAILS || [];
const SEGMENTS    = window.WGHC_SEGMENTS || [];
const PARKS       = window.WGHC_PARKS || [];
const AREAS       = window.WGHC_AREAS || [];
const ELEV_SUM    = window.WGHC_ELEV_SUMMARY || {};
const TRAIL_BY_ID = Object.fromEntries(TRAILS_LIST.map(t => [t.id, t]));

// Convert to a single unified row shape
const SEG_ROWS = SEGMENTS.map(s => ({ ...s, _kind: "segment" }));

const PARK_ROWS = PARKS.map(p => ({
  _kind: "park",
  id: "park-" + p.id,
  tid: "park",
  type: "park",
  name: p.name,
  county: p.county,
  feat: p.desc,
  endpoint_description: p.info_url || "",
  parkType: p.type,
  miles: null,
  lat: p.lat,
  lng: p.lng,
  diff: "",
}));

const AREA_ROWS = AREAS.map(a => ({
  _kind: "area",
  id: "area-" + a.id,
  tid: "area",
  type: "area",
  name: a.name,
  county: a.county,
  feat: a.desc,
  endpoint_description: a.info_url || "",
  areaType: a.type,
  operator: a.operator,
  ecoLandscape: a.eco_landscape,
  miles: null,
  lat: a.lat,
  lng: a.lng,
  diff: "",
}));

// Deduplicate parks vs areas: many state parks appear in both datasets.
// Match by (lowercase name + county). When a match exists, prefer the AREA
// record because it has more info (operator, eco-landscape, named trails).
const areaKeys = new Set(
  AREA_ROWS.map(a => (a.name || "").trim().toLowerCase() + "|" + (a.county || "").trim().toLowerCase())
);
const PARK_ROWS_DEDUPED = PARK_ROWS.filter(p => {
  const key = (p.name || "").trim().toLowerCase() + "|" + (p.county || "").trim().toLowerCase();
  return !areaKeys.has(key);
});

const ALL_ROWS = SEG_ROWS.concat(PARK_ROWS_DEDUPED).concat(AREA_ROWS);

// ---------- State ----------
const params = new URLSearchParams(location.search);
const state = {
  q: params.get("q") || "",
  kind: params.get("trail") || params.get("kind") || "all",   // all / iat / nct / park / area
  diff: "all",
  type: "segment",   // default: only "Trail" main segments (hide connecting routes)
  sort: "az",
};

// ---------- DOM ----------
const $search = document.getElementById("searchInput");
const $grid   = document.getElementById("resultsGrid");
const $summary= document.getElementById("summaryText");
const $clear  = document.getElementById("clearBtn");
const $reset  = document.getElementById("resetLink");
const $sort   = document.getElementById("sortSelect");
const $panel  = document.getElementById("detailPanel");
const $body   = document.getElementById("detailBody");
const $close  = document.getElementById("closeDetail");
const $mapBtn = document.getElementById("openMapBtn");
const $mapSec = document.getElementById("mapSection");

if (state.q) $search.value = state.q;
if (state.kind !== "all") setActiveChip("kindChips", state.kind);

// ---------- Helpers ----------
function setActiveChip(groupId, val) {
  const wrap = document.getElementById(groupId);
  const attr = groupId.replace("Chips", "");
  wrap.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c.dataset[attr] === val));
}

// Show/hide the Segments + Difficulty groups based on the selected kind.
// Parks and Areas don't have segments or difficulty, so those filters are
// meaningless and just add clutter.
function updateFilterVisibility() {
  const hideSegmentFilters = (state.kind === "park" || state.kind === "area");
  const typeGroup = document.getElementById("typeGroup");
  const diffGroup = document.getElementById("diffGroup");
  if (typeGroup) typeGroup.style.display = hideSegmentFilters ? "none" : "";
  if (diffGroup) diffGroup.style.display = hideSegmentFilters ? "none" : "";
}
function cap(s)  { return s ? s[0].toUpperCase() + s.slice(1) : ""; }
function esc(s)  { if (s == null) return ""; return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
function mToFt(m){ return m == null ? null : Math.round(m * 3.28084); }
function tidLabel(r) {
  if (r._kind === "park") return "Park / Forest";
  if (r._kind === "area") return "Local Area";
  const t = TRAIL_BY_ID[r.tid];
  return t ? t.abbr : r.tid.toUpperCase();
}
function tidClass(r) {
  if (r._kind === "park") return "park";
  if (r._kind === "area") return "area";
  return r.tid;
}

// ---------- Filtering ----------
function applyFilters() {
  const q = state.q.trim().toLowerCase();
  let rows = ALL_ROWS.slice();

  // kind filter
  if (state.kind !== "all") {
    rows = rows.filter(r => {
      if (state.kind === "park") return r._kind === "park";
      if (state.kind === "area") return r._kind === "area";
      return r._kind === "segment" && r.tid === state.kind;
    });
  }

  // diff filter (segments only)
  if (state.diff !== "all") {
    rows = rows.filter(r => r.diff === state.diff);
  }

  // type filter (segment/connecting) — parks/areas pass through
  if (state.type !== "all") {
    rows = rows.filter(r => r._kind !== "segment" || r.type === state.type);
  }

  // text search
  if (q) {
    rows = rows.filter(r => {
      const hay = [r.name, r.county, r.feat, r.endpoint_description, r.parkType, r.areaType, r.operator]
        .filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }

  // sort
  const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
  const elevGain = r => (ELEV_SUM[r.id]?.gain_m ?? -1);
  switch (state.sort) {
    case "az":         rows.sort((a,b) => collator.compare(a.name, b.name)); break;
    case "za":         rows.sort((a,b) => collator.compare(b.name, a.name)); break;
    case "miles-asc":  rows.sort((a,b) => (a.miles ?? 9999) - (b.miles ?? 9999)); break;
    case "miles-desc": rows.sort((a,b) => (b.miles ?? -1) - (a.miles ?? -1)); break;
    case "gain-desc":  rows.sort((a,b) => elevGain(b) - elevGain(a)); break;
    case "kind":       rows.sort((a,b) => {
                          const ord = { iat:1, nct:2, park:3, area:4 };
                          const ak = a._kind === "segment" ? a.tid : a._kind;
                          const bk = b._kind === "segment" ? b.tid : b._kind;
                          return (ord[ak]||9) - (ord[bk]||9) || collator.compare(a.name, b.name);
                        }); break;
  }
  return rows;
}

// ---------- Render ----------
function render() {
  const rows = applyFilters();
  const segs  = rows.filter(r => r._kind === "segment");
  const parks = rows.filter(r => r._kind === "park").length;
  const areas = rows.filter(r => r._kind === "area").length;
  const miles = segs.reduce((s, r) => s + (r.miles || 0), 0);
  const gain  = segs.reduce((s, r) => s + (ELEV_SUM[r.id]?.gain_m || 0), 0);

  $summary.innerHTML = rows.length
    ? `<strong>${rows.length}</strong> result${rows.length===1?"":"s"} · ${segs.length} segment${segs.length===1?"":"s"} · ${parks} park${parks===1?"":"s"} · ${areas} area${areas===1?"":"s"} · <strong>${miles.toFixed(1)}</strong> mi · <strong>${mToFt(gain).toLocaleString()}</strong> ft elev. gain`
    : `<strong>No matches.</strong> Try widening your filters.`;

  const cap = 240;
  const display = rows.slice(0, cap);
  $grid.innerHTML = display.map(cardHTML).join("") ||
    `<div class="no-results"><h3>Nothing matched.</h3><p>Try clearing some filters or searching for a different county or feature.</p></div>`;

  if (rows.length > cap) {
    $grid.insertAdjacentHTML("beforeend",
      `<div class="no-results"><h3>Showing ${cap} of ${rows.length}</h3><p>Refine your search to narrow the list.</p></div>`);
  }

  // Update overview map if open
  if (!$mapSec.classList.contains("hidden")) updateOverviewMap(rows);
}

function cardHTML(r) {
  const klass = tidClass(r);
  const diffTag = r.diff ? `<span class="tag diff-${r.diff}">${cap(r.diff)}</span>` : "";
  const typeTag = r._kind === "segment" && r.type === "connecting"
    ? `<span class="tag connecting">Connecting</span>` : "";
  const parkTag = r._kind === "park"
    ? `<span class="tag park">${esc(r.parkType || "Park")}</span>` : "";
  const areaTag = r._kind === "area"
    ? `<span class="tag area">${esc(formatAreaType(r.areaType))}</span>` : "";
  const milesBadge = (typeof r.miles === "number" && r.miles)
    ? `<span class="miles-badge">${r.miles.toFixed(1)} mi</span>` : "";

  // Elevation hint for segments
  const elev = ELEV_SUM[r.id];
  const elevLine = elev
    ? `<div class="result-county" style="margin-top:4px;">⛰️ ${mToFt(elev.gain_m).toLocaleString()} ft gain · max ${mToFt(elev.max_elev_m).toLocaleString()} ft</div>`
    : "";

  return `
    <article class="result-card tid-${klass}" data-id="${esc(r.id)}">
      <span class="trail-stripe"></span>
      <div class="result-head">
        <h3>${esc(r.name || "Unnamed")}</h3>
        ${milesBadge}
      </div>
      <div class="result-tags">
        <span class="tag ${klass}">${tidLabel(r)}</span>
        ${diffTag}${typeTag}${parkTag}${areaTag}
      </div>
      ${r.county ? `<div class="result-county">${esc(r.county)} County</div>` : ""}
      ${r.feat ? `<p class="result-feat">${esc(r.feat)}</p>` : ""}
      ${elevLine}
      ${r.endpoint_description && r._kind === "segment"
          ? `<p class="result-endpoint"><strong>Endpoints:</strong> ${esc(r.endpoint_description)}</p>` : ""}
      <div class="result-actions">
        <a href="#" class="js-detail" data-id="${esc(r.id)}">Details</a>
        ${r.lat && r.lng ? `<a href="https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}" target="_blank" rel="noopener">Map →</a>` : ""}
      </div>
    </article>`;
}

function formatAreaType(t) {
  return ({
    national:       "National Forest/Park",
    state_park:     "State Park",
    state_forest:   "State Forest",
    state_trail:    "State Trail",
    historic:       "Historic Site",
    county_park:    "County Park",
    trail_network:  "Trail Network",
    recreation:     "Recreation Area",
  })[t] || (t ? t.replace(/_/g, " ") : "Area");
}

// ---------- Detail panel (with elevation profile chart) ----------
function openDetail(id) {
  const r = ALL_ROWS.find(x => String(x.id) === String(id));
  if (!r) return;
  const klass = tidClass(r);
  const diffTag = r.diff ? `<span class="tag diff-${r.diff}">${cap(r.diff)}</span>` : "";
  const typeTag = r._kind === "segment" && r.type === "connecting"
    ? `<span class="tag connecting">Connecting route</span>` : "";
  const parkTag = r._kind === "park" ? `<span class="tag park">${esc(r.parkType || "Park")}</span>` : "";
  const areaTag = r._kind === "area" ? `<span class="tag area">${esc(formatAreaType(r.areaType))}</span>` : "";
  const milesBadge = (typeof r.miles === "number" && r.miles)
    ? `<span class="miles-badge">${r.miles.toFixed(1)} mi</span>` : "";

  const elev = ELEV_SUM[r.id];
  let elevHTML = "";
  if (elev) {
    elevHTML = `
      <div class="detail-section">
        <div class="lbl">Elevation</div>
        <div class="elev-stats">
          <div class="stat-mini"><span>Gain</span><strong>${mToFt(elev.gain_m).toLocaleString()} ft</strong></div>
          <div class="stat-mini"><span>Loss</span><strong>${mToFt(elev.loss_m).toLocaleString()} ft</strong></div>
          <div class="stat-mini"><span>High</span><strong>${mToFt(elev.max_elev_m).toLocaleString()} ft</strong></div>
          <div class="stat-mini"><span>Low</span><strong>${mToFt(elev.min_elev_m).toLocaleString()} ft</strong></div>
          <div class="stat-mini"><span>Max slope</span><strong>${elev.max_up_slope_deg.toFixed(1)}°</strong></div>
        </div>
        <div id="elevChart" class="elev-chart-wrap"><div class="elev-loading">Loading profile…</div></div>
      </div>`;
  }

  $body.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:10px;">
      <h2 style="margin:0;">${esc(r.name)}</h2>
      ${milesBadge}
    </div>
    <div class="detail-meta">
      <span class="tag ${klass}">${tidLabel(r)}</span>
      ${diffTag}${typeTag}${parkTag}${areaTag}
      ${r.segmentNumber ? `<span class="tag" style="background:var(--cream);color:var(--ink-soft);">Segment #${r.segmentNumber}</span>` : ""}
    </div>

    ${r.county ? `<div class="detail-section"><div class="lbl">Region</div><p>📍 ${esc(r.county)} County${r.ecoLandscape ? ` · ${esc(r.ecoLandscape)}` : ""}${r.operator ? ` · Managed by ${esc(r.operator)}` : ""}</p></div>` : ""}

    ${r.feat ? `<div class="detail-section"><div class="lbl">Trail features</div><p>${esc(r.feat)}</p></div>` : ""}

    ${r.endpoint_description && r._kind === "segment"
        ? `<div class="detail-section"><div class="lbl">Endpoints</div><p>${esc(r.endpoint_description)}</p></div>` : ""}

    ${(r._kind === "park" || r._kind === "area") && r.endpoint_description
        ? `<div class="detail-section"><div class="lbl">More info</div><p><a href="${esc(r.endpoint_description)}" target="_blank" rel="noopener">${esc(r.endpoint_description)}</a></p></div>` : ""}

    ${elevHTML}

    <div class="detail-section">
      <div class="lbl">Location</div>
      <div id="detailMap" class="detail-map"></div>
    </div>

    <div class="detail-actions">
      ${r.lat && r.lng
        ? `<a href="https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}" target="_blank" rel="noopener" class="btn">Open in Google Maps →</a>` : ""}
      ${TRAIL_BY_ID[r.tid]?.url
        ? `<a href="${esc(TRAIL_BY_ID[r.tid].url)}" target="_blank" rel="noopener" class="btn secondary">Visit ${tidLabel(r)} site</a>` : ""}
    </div>
  `;
  $panel.classList.add("open");
  document.body.style.overflow = "hidden";

  // Init detail mini-map + load elevation profile
  setTimeout(() => {
    initDetailMap(r);
    if (elev) loadElevProfile(r.id);
  }, 60);
}

function closeDetail() {
  $panel.classList.remove("open");
  document.body.style.overflow = "";
  if (window.__detailMap) {
    window.__detailMap.remove();
    window.__detailMap = null;
  }
}

// ---------- Elevation profile loader + SVG chart ----------
window.__WGHC_PROFILE__ = function (profile) {
  // Profile arrives via dynamic <script> tag injection
  if (!window.__profileWaiters) return;
  const cb = window.__profileWaiters[profile.id];
  if (cb) {
    cb(profile.points);
    delete window.__profileWaiters[profile.id];
  }
};

const PROFILE_CACHE = {};

function loadElevProfile(id) {
  if (PROFILE_CACHE[id]) return drawElevChart(PROFILE_CACHE[id]);
  window.__profileWaiters = window.__profileWaiters || {};
  window.__profileWaiters[id] = pts => {
    PROFILE_CACHE[id] = pts;
    drawElevChart(pts);
  };
  const s = document.createElement("script");
  s.src = "data/profiles/" + id + ".js";
  s.onerror = () => {
    const host = document.getElementById("elevChart");
    if (host) host.innerHTML = `<p style="color:var(--muted);font-size:.9rem;margin:0;">No profile data available.</p>`;
  };
  document.head.appendChild(s);
}

function drawElevChart(points) {
  const host = document.getElementById("elevChart");
  if (!host || !points || !points.length) return;

  const W = 660, H = 160, P = 28;
  const distM   = points.map(p => p[0]);
  const elevFt  = points.map(p => p[1]);
  const dMax    = distM[distM.length - 1] || 1;
  const eMin    = Math.min(...elevFt);
  const eMax    = Math.max(...elevFt);
  const eRange  = Math.max(eMax - eMin, 30);
  const xs = d => P + (d / dMax) * (W - P * 2);
  const ys = e => H - P - ((e - eMin) / eRange) * (H - P * 2);

  let line = `M ${xs(distM[0]).toFixed(1)} ${ys(elevFt[0]).toFixed(1)}`;
  let area = line;
  for (let i = 1; i < points.length; i++) {
    line += ` L ${xs(distM[i]).toFixed(1)} ${ys(elevFt[i]).toFixed(1)}`;
  }
  area = line + ` L ${xs(dMax).toFixed(1)} ${H - P} L ${xs(0).toFixed(1)} ${H - P} Z`;

  const distMi = (dMax / 1609.34).toFixed(1);

  host.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" width="100%" height="${H}" role="img" aria-label="Elevation profile chart">
      <defs>
        <linearGradient id="elevG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="#2d5a3f" stop-opacity=".5"/>
          <stop offset="100%" stop-color="#2d5a3f" stop-opacity=".05"/>
        </linearGradient>
      </defs>
      <path d="${area}" fill="url(#elevG)"/>
      <path d="${line}" fill="none" stroke="#2d5a3f" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>

      <line x1="${P}" y1="${H-P}" x2="${W-P}" y2="${H-P}" stroke="#d9d0b8" stroke-width="1"/>
      <line x1="${P}" y1="${P}"   x2="${P}"   y2="${H-P}" stroke="#d9d0b8" stroke-width="1"/>

      <text x="${P-4}" y="${P+4}"     text-anchor="end" font-size="10" fill="#6b7763">${Math.round(eMax)} ft</text>
      <text x="${P-4}" y="${H-P+2}"   text-anchor="end" font-size="10" fill="#6b7763">${Math.round(eMin)} ft</text>
      <text x="${P}"   y="${H-P+16}"  font-size="10" fill="#6b7763">0 mi</text>
      <text x="${W-P}" y="${H-P+16}"  text-anchor="end" font-size="10" fill="#6b7763">${distMi} mi</text>
    </svg>`;
}

// ---------- Leaflet maps ----------
let __polylinesLoaded = false;
let __polylinesLoading = null;
function loadPolylines() {
  if (__polylinesLoaded) return Promise.resolve();
  if (__polylinesLoading) return __polylinesLoading;
  __polylinesLoading = new Promise((resolve, reject) => {
    let pending = 2;
    const done = () => { if (--pending === 0) { __polylinesLoaded = true; resolve(); } };
    const fail = () => reject(new Error("Polyline load failed"));
    for (const file of ["data/polylines_iat.js", "data/polylines_nct.js"]) {
      const s = document.createElement("script");
      s.src = file; s.onload = done; s.onerror = fail;
      document.head.appendChild(s);
    }
  });
  return __polylinesLoading;
}

function trailColor(tid) {
  return { iat: "#c8a13e", nct: "#4a90d9" }[tid] || "#2d5a3f";
}

function featuresForRow(r) {
  if (r._kind !== "segment") return [];
  const fc = r.tid === "iat" ? window.WGHC_PL_IAT : (r.tid === "nct" ? window.WGHC_PL_NCT : null);
  if (!fc) return [];
  return fc.features.filter(f => f.properties && f.properties.seg_id === r.id);
}

// Detail mini-map
function initDetailMap(r) {
  const host = document.getElementById("detailMap");
  if (!host || !window.L || !r.lat || !r.lng) {
    if (host) host.innerHTML = '<p style="color:var(--muted);font-size:.9rem;margin:0;">No map data.</p>';
    return;
  }
  const map = L.map(host, { scrollWheelZoom: false }).setView([r.lat, r.lng], 12);
  window.__detailMap = map;
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 18
  }).addTo(map);

  // Marker
  L.circleMarker([r.lat, r.lng], {
    radius: 8, color: "#2d5a3f", fillColor: "#e9c46a", fillOpacity: 1, weight: 2
  }).addTo(map).bindPopup(esc(r.name));

  // Lazy load polylines for segments and draw the matching one
  if (r._kind === "segment") {
    loadPolylines().then(() => {
      const feats = featuresForRow(r);
      if (!feats.length) return;
      const layer = L.geoJSON({ type: "FeatureCollection", features: feats }, {
        style: { color: trailColor(r.tid), weight: 4, opacity: .9 }
      }).addTo(map);
      try { map.fitBounds(layer.getBounds(), { padding: [20, 20] }); } catch(e) {}
    }).catch(() => {});
  }
  setTimeout(() => map.invalidateSize(), 100);
}

// Overview map (toggleable)
let __overviewMap = null, __overviewLayers = [];
function ensureOverviewMap() {
  if (__overviewMap) return Promise.resolve(__overviewMap);
  return loadPolylines().then(() => {
    __overviewMap = L.map("overviewMap").setView([44.5, -89.5], 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap', maxZoom: 16
    }).addTo(__overviewMap);
    return __overviewMap;
  });
}

function updateOverviewMap(rows) {
  if (!__overviewMap) return;
  __overviewLayers.forEach(l => __overviewMap.removeLayer(l));
  __overviewLayers = [];

  // Polylines for segments
  const segRows = rows.filter(r => r._kind === "segment");
  const segIds = new Set(segRows.map(r => r.id));
  for (const tid of ["iat", "nct"]) {
    const fc = tid === "iat" ? window.WGHC_PL_IAT : window.WGHC_PL_NCT;
    if (!fc) continue;
    const matched = fc.features.filter(f => segIds.has(f.properties?.seg_id));
    if (!matched.length) continue;
    const layer = L.geoJSON({ type: "FeatureCollection", features: matched }, {
      style: { color: trailColor(tid), weight: 3, opacity: .85 },
      onEachFeature: (f, lyr) => {
        const seg = segRows.find(r => r.id === f.properties?.seg_id);
        if (seg) lyr.bindPopup(`<strong>${esc(seg.name)}</strong><br><span style="color:#6b7763;font-size:12px">${esc(seg.county || "")}</span><br><a href="#" onclick="event.preventDefault(); window.__openDetail('${esc(seg.id)}');">Details →</a>`);
      }
    }).addTo(__overviewMap);
    __overviewLayers.push(layer);
  }

  // Markers for parks + areas
  const markers = L.layerGroup().addTo(__overviewMap);
  for (const r of rows) {
    if (r._kind === "segment" || !r.lat || !r.lng) continue;
    const isPark = r._kind === "park";
    const m = L.circleMarker([r.lat, r.lng], {
      radius: 5, color: isPark ? "#6d4c2c" : "#515e3c",
      fillColor: isPark ? "#b08968" : "#8aa074", fillOpacity: .85, weight: 1.5
    });
    m.bindPopup(`<strong>${esc(r.name)}</strong><br><span style="color:#6b7763;font-size:12px">${esc(r.county || "")}</span><br><a href="#" onclick="event.preventDefault(); window.__openDetail('${esc(r.id)}');">Details →</a>`);
    m.addTo(markers);
  }
  __overviewLayers.push(markers);

  // Fit bounds
  const bounds = [];
  __overviewLayers.forEach(l => {
    try {
      const b = l.getBounds && l.getBounds();
      if (b && b.isValid()) bounds.push(b);
    } catch(e) {}
  });
  if (bounds.length) {
    let combined = bounds[0];
    for (let i = 1; i < bounds.length; i++) combined = combined.extend(bounds[i]);
    __overviewMap.fitBounds(combined, { padding: [30, 30], maxZoom: 11 });
  }
}

window.__openDetail = openDetail;

// ---------- Event wiring ----------
let searchTimer;
$search.addEventListener("input", e => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { state.q = e.target.value; render(); }, 120);
});
document.getElementById("searchGo").addEventListener("click", () => { state.q = $search.value; render(); });
$search.addEventListener("keydown", e => { if (e.key === "Enter") { state.q = $search.value; render(); } });
$clear.addEventListener("click", () => { $search.value = ""; state.q = ""; render(); $search.focus(); });

document.getElementById("kindChips").addEventListener("click", e => {
  const b = e.target.closest(".chip"); if (!b) return;
  state.kind = b.dataset.kind;
  setActiveChip("kindChips", state.kind);
  updateFilterVisibility();
  render();
});
document.getElementById("diffChips").addEventListener("click", e => {
  const b = e.target.closest(".chip"); if (!b) return;
  state.diff = b.dataset.diff;
  setActiveChip("diffChips", state.diff);
  render();
});
document.getElementById("typeChips").addEventListener("click", e => {
  const b = e.target.closest(".chip"); if (!b) return;
  state.type = b.dataset.type;
  setActiveChip("typeChips", state.type);
  render();
});
$sort.addEventListener("change", () => { state.sort = $sort.value; render(); });

$reset.addEventListener("click", e => {
  e.preventDefault();
  state.q = ""; state.kind = "all"; state.diff = "all"; state.type = "segment"; state.sort = "az";
  $search.value = ""; $sort.value = "az";
  setActiveChip("kindChips", "all");
  setActiveChip("diffChips", "all");
  setActiveChip("typeChips", "segment");
  updateFilterVisibility();
  render();
});

$grid.addEventListener("click", e => {
  const link = e.target.closest(".js-detail");
  if (link) { e.preventDefault(); openDetail(link.dataset.id); return; }
  const card = e.target.closest(".result-card");
  if (card && !e.target.closest("a[target='_blank']")) openDetail(card.dataset.id);
});

$close.addEventListener("click", closeDetail);
$panel.addEventListener("click", e => { if (e.target === $panel) closeDetail(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeDetail(); });

// Overview map toggle
$mapBtn.addEventListener("click", () => {
  const hidden = $mapSec.classList.toggle("hidden");
  if (hidden) {
    $mapBtn.textContent = "🗺️ Show map";
    return;
  }
  $mapBtn.textContent = "✕ Hide map";
  $mapBtn.disabled = true;
  ensureOverviewMap().then(() => {
    $mapBtn.disabled = false;
    setTimeout(() => __overviewMap.invalidateSize(), 50);
    updateOverviewMap(applyFilters());
  }).catch(err => {
    $mapBtn.disabled = false;
    console.error(err);
    $mapSec.querySelector(".container").innerHTML = '<p style="color:var(--muted)">Map could not load — check your connection.</p>';
  });
});

// Load Leaflet script
(function loadLeaflet() {
  const s = document.createElement("script");
  s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
  s.crossOrigin = "";
  document.head.appendChild(s);
})();

// First render
updateFilterVisibility();
render();

})();
