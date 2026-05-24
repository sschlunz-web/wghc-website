/* Shared partials: header + footer rendered on every page */
(function () {
  const page = document.body.dataset.page || "";

  const header = `
    <header class="site-header">
      <div class="container nav">
        <a href="index.html" class="brand">
          <span class="logo">W</span>
          <span class="brand-text">
            Wisconsin Go Hiking Club
            <small>Est. 1924 · Wisconsin Trails</small>
          </span>
        </a>
        <button class="menu-toggle" aria-label="Open menu" onclick="document.getElementById('navLinks').classList.toggle('open')">☰</button>
        <ul class="nav-links" id="navLinks">
          <li><a href="index.html"      class="${page==='home'?'active':''}">Home</a></li>
          <li><a href="about.html"      class="${page==='about'?'active':''}">About</a></li>
          <li><a href="hikes.html"      class="${page==='hikes'?'active':''}">Hike Schedule</a></li>
          <li><a href="trails.html"     class="${page==='trails'?'active':''}">Trail Finder</a></li>
          <li><a href="membership.html" class="${page==='membership'?'active':''}">Membership</a></li>
          <li><a href="contact.html"    class="${page==='contact'?'active':''}">Contact</a></li>
        </ul>
        <a href="membership.html" class="nav-cta">Join the Club</a>
      </div>
    </header>
  `;

  const footer = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <a href="index.html" class="brand">
              <span class="logo">W</span>
              <span class="brand-text">
                Wisconsin Go Hiking Club
                <small>Boots on trails since 1924</small>
              </span>
            </a>
            <p style="font-size:.94rem; max-width:300px; margin-top:14px;">
              A non-profit community of hikers exploring Wisconsin's
              wild places — the Ice Age Trail, North Country Trail,
              state parks and forest paths.
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><a href="trails.html">Trail Finder</a></li>
              <li><a href="hikes.html">Hike Schedule</a></li>
              <li><a href="about.html">About the Club</a></li>
              <li><a href="membership.html">Become a Member</a></li>
            </ul>
          </div>
          <div>
            <h4>Trail Partners</h4>
            <ul>
              <li><a href="https://www.iceagetrail.org" target="_blank" rel="noopener">Ice Age Trail Alliance</a></li>
              <li><a href="https://northcountrytrail.org" target="_blank" rel="noopener">North Country Trail</a></li>
              <li><a href="https://dnr.wisconsin.gov" target="_blank" rel="noopener">Wisconsin DNR</a></li>
              <li><a href="https://www.fs.usda.gov/cnnf" target="_blank" rel="noopener">Chequamegon–Nicolet NF</a></li>
            </ul>
          </div>
          <div>
            <h4>Stay Connected</h4>
            <ul>
              <li><a href="contact.html">Contact Us</a></li>
              <li><a href="#">Newsletter</a></li>
              <li><a href="#">Facebook</a></li>
              <li><a href="#">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 Wisconsin Go Hiking Club. A 501(c)(3) non-profit organization.</span>
          <span><a href="#" style="color:rgba(247,241,225,.7)">Privacy</a> · <a href="#" style="color:rgba(247,241,225,.7)">Code of Conduct</a></span>
        </div>
      </div>
    </footer>
  `;

  const headerHost = document.getElementById("site-header");
  const footerHost = document.getElementById("site-footer");
  if (headerHost) headerHost.outerHTML = header;
  if (footerHost) footerHost.outerHTML = footer;
})();
