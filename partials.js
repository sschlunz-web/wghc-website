/* Shared header + footer (rendered on every page) */
(function () {
  const page = document.body.dataset.page || "";

  const header = `
    <header class="site-header">
      <div class="container nav">
        <a href="index.html" class="brand" aria-label="Wisconsin Go Hiking Club home">
          <img src="images/logo-banner.png" alt="Wisconsin Go Hiking Club" class="brand-img-wide" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
          <img src="images/logo-mark.png"   alt="WGHC"                     class="brand-img-mark">
          <span class="brand-text">Wisconsin Go Hiking Club</span>
        </a>
        <button class="menu-toggle" aria-label="Open menu" onclick="document.getElementById('navLinks').classList.toggle('open')">☰</button>
        <ul class="nav-links" id="navLinks">
          <li><a href="index.html"      class="${page==='home'?'active':''}">Home</a></li>
          <li><a href="about.html"      class="${page==='about'?'active':''}">About</a></li>
          <li><a href="hikes.html"      class="${page==='hikes'?'active':''}">Hikes</a></li>
          <li><a href="trails.html"     class="${page==='trails'?'active':''}">Trail Finder</a></li>
          <li><a href="membership.html" class="${page==='membership'?'active':''}">Membership</a></li>
          <li><a href="contact.html"    class="${page==='contact'?'active':''}">Contact</a></li>
        </ul>
        <a href="membership.html" class="nav-cta">Join</a>
      </div>
    </header>
  `;

  const footer = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <img src="images/logo-banner.png" alt="WGHC" onerror="this.style.display='none'">
            <p style="font-size:.88rem; max-width:300px;">
              A non-profit community of hikers exploring Wisconsin's wild places — the
              Ice Age Trail, North Country Trail, state parks and forest paths.
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
            <h4>Connect</h4>
            <ul>
              <li><a href="contact.html">Contact Us</a></li>
              <li><a href="#">Newsletter</a></li>
              <li><a href="#">Facebook</a></li>
              <li><a href="#">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 Wisconsin Go Hiking Club · 501(c)(3) non-profit</span>
          <span><a href="#">Privacy</a> · <a href="#">Code of Conduct</a></span>
        </div>
      </div>
    </footer>
  `;

  const headerHost = document.getElementById("site-header");
  const footerHost = document.getElementById("site-footer");
  if (headerHost) headerHost.outerHTML = header;
  if (footerHost) footerHost.outerHTML = footer;
})();
