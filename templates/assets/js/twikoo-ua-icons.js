(() => {
  const MAP = {
    os: [
      [/Windows/i,'ri-windows-fill'],
      [/Mac|macOS|OS X|iOS|iPhone|iPad/i,'ri-apple-fill'],
      [/Android/i,'ri-android-fill'],
      [/Linux|Ubuntu|Debian|Arch|Fedora/i,'ri-ubuntu-fill']
    ],
    browser: [
      [/Chrome/i,'ri-chrome-fill'],
      [/Edge/i,'ri-edge-fill'],
      [/Safari/i,'ri-safari-fill'],
      [/Firefox/i,'ri-firefox-fill'],
      [/Opera|OPR/i,'ri-opera-fill'],
      [/IE|Trident/i,'ri-ie-fill']
    ],
    location: [[/.*/,'ri-map-pin-2-fill']]
  };

  const pick = (arr, txt) => (arr.find(([re]) => re.test(txt)) || [,''])[1];

  const ROOT_SEL = '#twikoo, .twikoo, #tcomment, #comment, #post-comment';
  const getRoot = () => document.querySelector(ROOT_SEL) || document;

  function primeFont() {
    try {
      const probe = document.createElement('i');
      probe.className = 'ri-chrome-fill';
      probe.style.cssText = 'position:absolute;left:-9999px;opacity:0;';
      document.body.appendChild(probe);
      requestAnimationFrame(() => probe.remove());
    } catch {}
  }

  function patch(root = getRoot()) {
    // Guard: if event accidentally passed in
    if (!root || !root.querySelectorAll) root = document;
    let hits = 0;
    const nodes = root.querySelectorAll(
      '.tk-badge, .tk-ua *, .tk-meta *, .tk-admin-badge, span, a, div, em, b, i'
    );
    nodes.forEach(el => {
      if (!el || (el.dataset && el.dataset.iconDone)) return;
      const t = (el.textContent || '').trim();
      if (!t || t.length > 50) return;
      let cls = pick(MAP.browser, t) || pick(MAP.os, t);
      if (!cls && (/省|市|区|县|自治区|特别行政区/.test(t) || t.length <= 6)) {
        cls = pick(MAP.location, t);
      }
      if (!cls) return;
      const i = document.createElement('i');
      i.className = cls;
      el.prepend(i);
      if (el.dataset) el.dataset.iconDone = '1';
      hits++;
    });
    if (hits) {
      primeFont();
      try { console.debug('[UA icons] patched', hits, 'nodes'); } catch {}
    }
  }

  function run() { patch(getRoot()); }

  if (document.readyState !== 'loading') run();
  else document.addEventListener('DOMContentLoaded', () => run());

  if (window.pjax) document.addEventListener('pjax:complete', () => run());

  // Observe async renders
  const mo = new MutationObserver(() => run());
  mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
})();