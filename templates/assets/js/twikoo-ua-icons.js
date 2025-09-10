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

  // Simple helper to pick class by text
  const pick = (arr, txt) => (arr.find(([re]) => re.test(txt)) || [,''])[1];

  // Robust root lookup (different themes may wrap Twikoo differently)
  const ROOT_SEL = '#twikoo, .twikoo, #tcomment, #comment, #post-comment';
  const getRoot = () => document.querySelector(ROOT_SEL);

  // Force the font to load once (creates a hidden icon briefly)
  function primeFont() {
    try {
      const probe = document.createElement('i');
      probe.className = 'ri-chrome-fill';
      probe.style.cssText = 'position:absolute;left:-9999px;opacity:0;';
      document.body.appendChild(probe);
      // Clean after next frame
      requestAnimationFrame(() => probe.remove());
    } catch {}
  }

  // Main patcher
  function patch(root = getRoot() || document) {
    if (!root) return;
    let hits = 0;
    // Common selectors first
    const sel = [
      '.tk-badge', '.tk-ua *', '.tk-meta *', '.tk-admin-badge',
      'span', 'a', 'div', 'em', 'b', 'i'
    ].join(',');
    const nodes = root.querySelectorAll(sel);
    nodes.forEach(el => {
      if (!el || el.dataset && el.dataset.iconDone) return;
      const t = (el.textContent || '').trim();
      if (!t || t.length > 50) return; // avoid huge blocks
      let cls = pick(MAP.browser, t) || pick(MAP.os, t);
      // Heuristic for location:小短词或含省市区/自治区/特别行政区
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
      if (window && window.console) console.debug('[UA icons] patched', hits, 'nodes');
    }
  }

  // Run asap
  if (document.readyState !== 'loading') patch();
  else document.addEventListener('DOMContentLoaded', patch);

  // PJAX / color-mode changes etc
  if (window.pjax) document.addEventListener('pjax:complete', () => patch());

  // Observe Twikoo async renders
  const rootNow = getRoot();
  if (rootNow) {
    const mo = new MutationObserver(() => patch(rootNow));
    mo.observe(rootNow, { childList: true, subtree: true });
  } else {
    // fallback: try later
    setTimeout(() => patch(getRoot()), 1500);
  }
})();