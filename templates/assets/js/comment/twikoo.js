(() => {

    /* === QQ 昵称+邮箱 热补丁（NSMAO接口）=== */
    // 仅 Enter 触发（关闭自动与失焦）
    const __NSMAO_ENTER_ONLY__ = true;
    const __NSMAO_QQ_KEY__ = '75gKybFM054DarMUAvMaVVtZjb';
    function __nsmao_pickName__(d){
        try { return d?.data?.name || d?.data?.nickname || d?.nickname || d?.qqinfo?.nickname || d?.data?.qqInfo?.nickname || ''; }
        catch(e){ return ''; }
    }
    async function __nsmao_fetchNick__(qq){
        try{
            const r = await fetch(`https://api.nsmao.net/api/qq/v1/query?key=${__NSMAO_QQ_KEY__}&qq=${qq}`, {cache:'no-store', credentials:'omit'});
            const j = await r.json(); return __nsmao_pickName__(j);
        }catch(e){ return ''; }
    }
    async function __nsmao_tryFill__(root, src){
        const scope = (src && (src.closest("form") || src.closest(".tk-reply") || src.closest(".tk-comment") || src.closest(".tk-comment-item") || src.closest(".tk-comments") || src.closest("#twikoo"))) || root;
        const nick = scope.querySelector('input[name="nick"], input[placeholder*="昵称"], input[placeholder*="nick"]');
        const mail = scope.querySelector('input[name="mail"], input[type="email"], input[placeholder*="邮箱"], input[placeholder*="mail"]');
        if(!nick) return;
        const v = (nick.value||'').trim();
        const m = v.match(/^\d{5,11}$/);
        if(!m) return;
        const qq = m[0];
        const name = await __nsmao_fetchNick__(qq);
        if(name){
            // 昵称
            nick.value = name;
            try { nick.dispatchEvent(new Event('input', {bubbles:true})); } catch(e){}
            try { nick.dispatchEvent(new Event('change', {bubbles:true})); } catch(e){}
            try { window.__nsmaoNick = name; } catch(e){}
            // 邮箱（统一为 qq@qq.com）
            const mailVal = qq + '@qq.com';
            const mailInputs = (scope||root).querySelectorAll('input[name="mail"], input[type="email"], input[placeholder*="邮箱"], input[placeholder*="mail"]');
            mailInputs.forEach(el=>{
                el.value = mailVal;
                try { el.dispatchEvent(new Event('input', {bubbles:true})); } catch(e){}
                try { el.dispatchEvent(new Event('change', {bubbles:true})); } catch(e){}
            });
            try { window.__nsmaoQQ = qq; window.__nsmaoMail = mailVal; } catch(e){}
            try { localStorage.setItem('tk_nick', name); localStorage.setItem('twikoo_nick', name); localStorage.setItem('nick', name); } catch(e){}
            try { localStorage.setItem('tk_mail', mailVal); localStorage.setItem('twikoo_mail', mailVal); localStorage.setItem('mail', mailVal); } catch(e){}
        }
    }
    function __nsmao_bind__(){
        const box = document.getElementById('twikoo');
        if(!box) return;
        if (box.__nsmaoBound__) return; box.__nsmaoBound__ = true;
        // 输入停止自动触发
        const sel = 'input[name="nick"], input[placeholder*="昵称"], input[placeholder*="nick"]';
        const nick = box.querySelector(sel);
        let composing = false, timer = null;
        function schedule(){ clearTimeout(timer); timer = setTimeout(()=>__nsmao_tryFill__(box), 380); }
        if (nick){
            if (false /* __NSMAO_ENTER_ONLY__ */) {
            nick.addEventListener('compositionstart', ()=>composing=true);
            nick.addEventListener('compositionend', ()=>{ composing=false; schedule(); });
            nick.addEventListener('input', ()=>{ if(!composing) schedule(); });
            // Enter 触发
            
            }
nick.addEventListener('keydown', e=>{
                if (e.key==='Enter' || e.keyCode===13 || e.which===13){
                    e.preventDefault(); e.stopPropagation();
                    __nsmao_tryFill__(box, nick).then(()=>{
                        const mail = box.querySelector('input[name="mail"], input[type="email"]');
                        if (mail) try { mail.focus(); } catch(e){}
                    });
                }
            }, true);
        }
        
        // 点击空白导致昵称框失焦时，触发一次获取（恢复你之前的“点空白也能取名”）
        if (!box.__nsmaoBlurBound__) {
            box.__nsmaoBlurBound__ = true;
            const sel = 'input[name="nick"], input[placeholder*="昵称"], input[placeholder*="nick"]';
            box.addEventListener('blur', function(e){
                try{
                    const t = e.target;
                    if (t && t.matches && t.matches(sel)) {
                        __nsmao_tryFill__(box, t);
                    }
                }catch(err){}
            }, true);
        }
// 容器捕获 Enter（更兜底）
        box.addEventListener('keydown', e=>{
            const t = e.target;
            if ((e.key==='Enter' || e.keyCode===13 || e.which===13) && t && t.matches && t.matches(sel)){
                e.preventDefault(); e.stopPropagation();
                __nsmao_tryFill__(box, t);
            }
        }, true);
        // 失焦兜底
        
        if (false /* __NSMAO_ENTER_ONLY__ */) {
        box.addEventListener('blur', e=>{
            if (e.target && e.target.matches && e.target.matches(sel)) __nsmao_tryFill__(box, e.target);
        }, true);
        }

        // PJAX 二次进入
        document.addEventListener('pjax:complete', ()=>__nsmao_bind__());
    }
    if (!document.getElementById('post-comment')) return
    const init = () => {
        twikoo.init(Object.assign({
            el: '#twikoo-wrap',
            envId: GLOBAL_CONFIG.source.twikoo.twikooUrl,
            region: '',
            path: location.pathname.replace(/\/page\/\d$/, ""),
            onCommentLoaded: function () {
                try{ __nsmao_bind__(); }catch(e){}

                btf.loadLightbox(document.querySelectorAll('#twikoo .tk-content img:not(.tk-owo-emotion)'))
                typeof hljs === 'object' && hljs.highlightAll()
                typeof Prism === 'object' && Prism.highlightAll()
                $("input").focus(function () {
                    heo_intype = true;
                });
                $("textarea").focus(function () {
                    heo_intype = true;
                });
                $("input").focusout(function () {
                    heo_intype = false;
                });
                $("textarea").focusout(function () {
                    heo_intype = false;
                });
            }
        }, null))
    }

    const getCount = () => {
        twikoo.getCommentsCount({
            envId: GLOBAL_CONFIG.source.twikoo.twikooUrl,
            region: '',
            urls: [window.location.pathname],
            includeReply: true
        }).then(function (res) {
            document.getElementById('twikoo-count').innerText = res[0].count
        }).catch(function (err) {
        });
    }

    const runFn = () => {
        init()
        true && getCount()
    }

    const loadTwikoo = () => {
        if (typeof twikoo === 'object') {
            setTimeout(runFn, 0)
            return
        }
        getScript(GLOBAL_CONFIG.source.twikoo.js).then(runFn)
    }

    if ('Twikoo' === 'Twikoo' || !GLOBAL_CONFIG.source.comments.lazyload) {
        if (GLOBAL_CONFIG.source.comments.lazyload) btf.loadComment(document.getElementById('twikoo-wrap'), loadTwikoo)
        else loadTwikoo()
    } else {
        window.loadOtherComment = () => {
            loadTwikoo()
        }
    }


})()


/* ===== Twikoo IPv6 属地：显示 + 入库 + 徽章渲染（前端版） ===== */
(function(){
  function onReady(fn){
    if (document.readyState === 'complete' || document.readyState === 'interactive') fn();
    else document.addEventListener('DOMContentLoaded', fn, {once:true});
  }
  onReady(async function(){
    const BOX = document.getElementById('twikoo') || document.getElementById('twikoo-wrap');
    if (!BOX) return;

    /* ---------- 获取 IP & 属地（支持 IPv6） ---------- */
    async function getIP(){
      const urls = ['https://api64.ipify.org?format=json','https://api.ipify.org?format=json'];
      for (const u of urls){
        try { const r = await fetch(u, {cache:'no-store'}); if (!r.ok) continue;
          const j = await r.json(); return {ip:j.ip, v: (j.ip||'').includes(':')?6:4};
        } catch(e) {}
      }
      return {ip:'', v:0};
    }
    async function ipToRegion(ip){
      const urls = [`https://ipapi.co/${encodeURIComponent(ip)}/json/`, `https://ip.sb/geoip/${encodeURIComponent(ip)}`];
      for (const u of urls){
        try { const r = await fetch(u, {cache:'no-store'}); if (!r.ok) continue;
          const d = await r.json();
          const country = d.country_name || d.country || '';
          const code = d.country_code || d.country_code2 || '';
          const region = d.region || d.region_code || d.region_name || d.state || '';
          const city = d.city || '';
          const isCN = code==='CN' || country==='China' || country==='中国';
          if (isCN) return [region, city].filter(Boolean).join(' ');
          return [country || code, region || city].filter(Boolean).join(' / ');
        } catch(e) {}
      }
      return '';
    }

    /* ---------- 编辑区提示 ---------- */
    function ensureTip(){
      let tip = BOX.querySelector('.tk-ip-tip');
      if (!tip){
        tip = document.createElement('div');
        tip.className = 'tk-ip-tip';
        tip.style.cssText = 'margin:6px 0;font-size:12px;opacity:.8;';
        (BOX.querySelector('textarea')?.parentNode || BOX).appendChild(tip);
      }
      return tip;
    }

    /* ---------- 生成并注入徽章 ---------- */
    function findMetaBar(item){
      return item.querySelector('.tk-extras, .tk-meta, .tk-footer, .tk-r, .tk-actions') || item;
    }
    function makeBadge(text){
      if (!text) return null;
      const span = document.createElement('span');
      span.className = 'tk-extra tk-ip-region';
      span.innerHTML = '<svg class="tk-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="currentColor"/></svg>' + text;
      return span;
    }
    const RE_PICK = /（\s*IP属地\s*：\s*([^（)）]+)\s*）/; // 从正文里提取
    function processOne(item, displayText){
      if (item.dataset.ipBadged) return;
      const contentEl = item.querySelector('.tk-content, .tk-comment-content') || item;
      let txt = contentEl.textContent || '';
      let show = displayText || '';
      const m = txt.match(RE_PICK);
      if (m){ // 从正文里移除 “（IP属地：xxx）”
        show = (m[1]||'').trim();
        // 只显示省份（与你截图一致）
        const province = show.split(/[ \\/]/)[0];
        show = province || show;
        // 替换文本
        if (contentEl.innerHTML) contentEl.innerHTML = contentEl.innerHTML.replace(RE_PICK, '').trim();
        else contentEl.textContent = txt.replace(RE_PICK, '').trim();
      }
      if (!show) return;
      const bar = findMetaBar(item);
      if (!bar) return;
      const badge = makeBadge(show);
      if (badge) bar.prepend(badge);
      item.dataset.ipBadged = '1';
    }
    function processAll(displayText){
      BOX.querySelectorAll('.tk-comment, .tk-item').forEach(el => processOne(el, displayText));
    }

    /* ---------- 提交流程：把属地写入正文（入库） ---------- */
    function attachRegion(text, region){
      if (!region) return text||'';
      const mark = `（IP属地：${region}）`;
      if (!text) return mark;
      if (String(text).includes('IP属地：')) return text;
      return (text + '\n' + mark).slice(0); // 不截断，交给主题校验长度
    }
    function patchNetwork(region){
      // 按钮兜底
      const ta  = BOX.querySelector('textarea');
      const btn = BOX.querySelector('.tk-submit, button[type=submit], .el-button--primary');
      if (btn && ta){
        btn.addEventListener('click', () => { ta.value = attachRegion(ta.value, region); }, true);
      }
      // fetch 拦截
      const _fetch = window.fetch;
      window.fetch = async function(input, init){
        try{
          const url = typeof input === 'string' ? input : (input && input.url);
          const method = (init && (init.method||'POST')).toUpperCase();
          if (/twikoo|\/api\//i.test(url||'') && method === 'POST'){
            const ct = (init.headers && (init.headers['content-type']||init.headers.get?.('content-type')||''))+'';
            if (/application\/json/i.test(ct)){
              let body = init.body;
              if (body && typeof body !== 'string') body = await (new Response(body)).text();
              if (body){
                const obj = JSON.parse(body);
                const isComment = (obj.comment || obj.content || /COMMENT/i.test(obj.event||obj.action||''));
                if (isComment){
                  const c = obj.comment || (obj.comment = {});
                  c.content = attachRegion(c.content || obj.content || '', region);
                  obj.content = c.content;
                  init.body = JSON.stringify(obj);
                }
              }
            }
          }
        }catch(e){}
        return _fetch.apply(this, arguments);
      };
      // XHR 拦截
      const _open = XMLHttpRequest.prototype.open;
      const _send = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.open = function(m, url){
        this.__tk_hit__ = /twikoo|\/api\//i.test(String(url||''));
        return _open.apply(this, arguments);
      };
      XMLHttpRequest.prototype.send = function(body){
        try{
          if (this.__tk_hit__ && typeof body === 'string'){
            const obj = JSON.parse(body);
            const isComment = (obj.comment || obj.content || /COMMENT/i.test(obj.event||obj.action||''));
            if (isComment){
              const c = obj.comment || (obj.comment = {});
              c.content = attachRegion(c.content || obj.content || '', region);
              obj.content = c.content;
              body = JSON.stringify(obj);
            }
          }
        }catch(e){}
        return _send.call(this, body);
      };
    }

    /* ---------- 主流程 ---------- */
    // 先显示/缓存属地
    const cacheKey = 'twikoo_region_badge_v1';
    let region = '';
    try { region = localStorage.getItem(cacheKey) || ''; } catch(e){}
    if (!region){
      const {ip} = await getIP();
      region = await ipToRegion(ip);
      try{ if(region) localStorage.setItem(cacheKey, region); }catch(e){}
    }

    // 编辑区提示
    const tip = ensureTip();
    tip.textContent = region ? `IP属地：${region}` : 'IP属地获取失败';

    // 新评论入库附加
    patchNetwork(region);

    // 现有评论渲染徽章
    processAll(region);
    const mo = new MutationObserver(() => processAll(region));
    mo.observe(BOX, {childList:true, subtree:true});
  });
})();
/* ===== /Twikoo IPv6 属地补丁结束 ===== */
