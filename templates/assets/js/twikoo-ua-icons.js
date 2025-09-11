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
    // 地区统一图钉
    location: [[/.*/,'ri-map-pin-2-fill']]
  };

  const pick = (arr, txt) => (arr.find(([re]) => re.test(txt)) || [,''])[1];

  function classify(text) {
    // 先判浏览器/系统
    let cls = pick(MAP.browser, text) || pick(MAP.os, text);
    if (cls) return cls;
    // 再按“看起来像地名”的中文匹配
    if (/省|市|区|县|自治区|特别行政区/.test(text)) return pick(MAP.location, text);
    if (/^[\u4e00-\u9fa5]{2,8}$/.test(text)) return pick(MAP.location, text);
    return '';
  }

  function patchExtras(extras) {
    let hits = 0;
    // 针对每条 .tk-extra（里面通常有 .tk-extra-text）
    extras.querySelectorAll('.tk-extra').forEach(item => {
      if (item.dataset && item.dataset.iconDone) return;
      const textNode = item.querySelector('.tk-extra-text') || item;
      const t = (textNode.textContent || '').trim();
      if (!t || /^[\d\.\-:\/\s·|]+$/.test(t)) return; // 过滤纯分隔符/数字
      const cls = classify(t);
      if (!cls) return;

      const i = document.createElement('i');
      i.className = cls;
      item.prepend(i);
      if (item.dataset) item.dataset.iconDone = '1';
      hits++;
    });
    if (hits) {
      try {
        const probe = document.createElement('i');
        probe.className = 'ri-chrome-fill';
        probe.style.cssText = 'position:absolute;left:-9999px;opacity:0;';
        document.body.appendChild(probe);
        requestAnimationFrame(() => probe.remove());
      } catch {}
      try { console.debug('[UA icons] .tk-extras patched:', hits); } catch {}
    }
  }

  function run() {
    document.querySelectorAll('#twikoo .tk-extras').forEach(patchExtras);
  }

  if (document.readyState !== 'loading') run();
  else document.addEventListener('DOMContentLoaded', () => run());

  if (window.pjax) document.addEventListener('pjax:complete', () => run());

  const mo = new MutationObserver(() => run());
  mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
})();