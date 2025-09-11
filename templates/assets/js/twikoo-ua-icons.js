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

  function patchUA(ua) {
    let hits = 0;
    const nodes = ua.querySelectorAll('span, a, div, em, b, i');
    nodes.forEach(el => {
      if (!el || (el.dataset && el.dataset.iconDone)) return;
      const t = (el.textContent || '').trim();
      if (!t) return;
      // 过滤纯分隔符/纯数字/评论统计等
      if (/^[\d\.\-:\/\s·|]+$/.test(t)) return;
      if (/评论|条|回复/.test(t)) return;

      let cls = pick(MAP.browser, t) || pick(MAP.os, t);
      if (!cls && (/省|市|区|县|自治区|特别行政区/.test(t) || (/^[\u4e00-\u9fa5]{2,6}$/.test(t)))) {
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
      // 探针触发字体下载
      try {
        const probe = document.createElement('i');
        probe.className = 'ri-chrome-fill';
        probe.style.cssText = 'position:absolute;left:-9999px;opacity:0;';
        document.body.appendChild(probe);
        requestAnimationFrame(() => probe.remove());
      } catch {}
      try { console.debug('[UA icons] UA patched:', hits); } catch {}
    }
  }

  function run() {
    document.querySelectorAll('#twikoo .tk-ua').forEach(patchUA);
  }

  if (document.readyState !== 'loading') run();
  else document.addEventListener('DOMContentLoaded', () => run());

  if (window.pjax) document.addEventListener('pjax:complete', () => run());

  const mo = new MutationObserver(() => run());
  mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
})();