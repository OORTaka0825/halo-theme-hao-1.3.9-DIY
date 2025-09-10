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

  function patch(root=document){
    const nodes = root.querySelectorAll('#twikoo .tk-badge, #twikoo .tk-ua span, #twikoo .tk-ua .item');
    nodes.forEach(el=>{
      if (el.dataset.iconDone) return;
      const t = (el.textContent || '').trim();
      let cls = pick(MAP.browser, t) || pick(MAP.os, t) || pick(MAP.location, t);
      if (!cls) return;
      const i = document.createElement('i');
      i.className = cls;
      el.prepend(i);
      el.dataset.iconDone = '1';
    });
  }

  if (document.readyState !== 'loading') patch();
  else document.addEventListener('DOMContentLoaded', patch);

  if (window.pjax) document.addEventListener('pjax:complete', () => patch());

  const tw = document.getElementById('twikoo');
  if (tw) new MutationObserver(() => patch()).observe(tw, { childList:true, subtree:true });
})();