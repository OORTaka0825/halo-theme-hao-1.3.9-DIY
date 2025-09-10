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
    // 只在 UA 容器内找，避免误命中页面其它文本
    // :scope 在旧浏览器可能不支持，但现代浏览器可以；退化也没问题
    const items = ua.querySelectorAll(':scope > *');
    items.forEach(el => {
      if (!el || (el.dataset && el.dataset.iconDone)) return;
      const t = (el.textContent || '').trim();
      if (!t) return;
      // 过滤纯分隔符/纯数字/评论统计
      if (/^[\d\.\-:\/\s·|]+$/.test(t)) return;
      if (/评论|条|回复/.test(t)) return;

      let cls = pick(MAP.browser, t) || pick(MAP.os, t);
      // 位置：带省市区等字样，或长度 2-6 的中文词
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
      // 探针：强制字体加载一次
      try {
        const probe = document.createElement('i');
        probe.className = 'ri-chrome-fill';
        probe.style.cssText = 'position:absolute;left:-9999px;opacity:0;';
        document.body.appendChild(probe);
        requestAnimationFrame(() => probe.remove());
      } catch {}
      try { console.debug('[UA icons] patched in UA box:', hits); } catch {}
    }
  }

  function run() {
    document.querySelectorAll('#twikoo .tk-ua').forEach(patchUA);
  }

  if (document.readyState !== 'loading') run();
  else document.addEventListener('DOMContentLoaded', () => run());

  if (window.pjax) document.addEventListener('pjax:complete', () => run());

  // 监听 Twikoo 异步渲染
  const mo = new MutationObserver(() => run());
  mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
})();