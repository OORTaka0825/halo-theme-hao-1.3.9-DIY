(() => {

    // === Twikoo 提交兜底：拦截 fetch，把 nick 强制替换为我们回填的昵称 ===
    (function(){
      if (window.__nsmaoFetchPatched__) return;
      window.__nsmaoFetchPatched__ = true;
      const __origFetch = window.fetch;
      window.fetch = function(input, init){
        try{
          const url = (typeof input === 'string') ? input : (input && input.url) || '';
          const isPost = init && /post/i.test(init.method||'');
          const body = init && init.body;
          const maybeTwikoo = /twikoo/i.test(url) || (typeof GLOBAL_CONFIG!=='undefined' && GLOBAL_CONFIG?.source?.twikoo?.twikooUrl && url.indexOf(GLOBAL_CONFIG.source.twikoo.twikooUrl)===0);
          if (maybeTwikoo && isPost && body){
            let nick = window.__nsmaoNick
                || (function(){try{return localStorage.getItem('tk_nick')||localStorage.getItem('twikoo_nick')||localStorage.getItem('nick')||''}catch(e){return ''}})()

    // === Twikoo 提交兜底(2)：拦截 XHR，强制 nick 为回填昵称 ===
    (function(){
      if (window.__nsmaoXHRPatched__) return;
      window.__nsmaoXHRPatched__ = true;
      const _open = XMLHttpRequest.prototype.open;
      const _send = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.open = function(method, url){
        this.__nsmao_is_post = /post/i.test(method||'');
        this.__nsmao_url = url || '';
        return _open.apply(this, arguments);
      };
      XMLHttpRequest.prototype.send = function(body){
        try{
          const url = this.__nsmao_url || '';
          const isPost = this.__nsmao_is_post;
          const maybeTwikoo = /twikoo/i.test(url) || (typeof GLOBAL_CONFIG!=='undefined' && GLOBAL_CONFIG?.source?.twikoo?.twikooUrl && url.indexOf(GLOBAL_CONFIG.source.twikoo.twikooUrl)===0);
          if (maybeTwikoo && isPost && body){
            let nick = window.__nsmaoNick
                || (function(){try{return localStorage.getItem('tk_nick')||localStorage.getItem('twikoo_nick')||localStorage.getItem('nick')||''}catch(e){return ''}})();
            if (nick){
              if (typeof body === 'string'){
                try{
                  if (/^\s*\{/.test(body)){ // JSON
                    const obj = JSON.parse(body);
                    if (obj && typeof obj==='object') { obj.nick = nick; }
                    body = JSON.stringify(obj);
                  } else { // x-www-form-urlencoded
                    body = body.replace(/(^|&)(nick)=([^&]*)/g, (m,a,b,c)=> a+b+'='+encodeURIComponent(nick));
                  }
                }catch(e){ /* ignore */ }
              } else if (typeof FormData !== 'undefined' && body instanceof FormData){
                body.set('nick', nick);
              }
            }
          }
        }catch(e){/* ignore */}
        return _send.call(this, body);
      };
    })();
;
            if (nick){
              if (typeof body === 'string'){
                try{
                  if (/^\s*\{/.test(body)){ // JSON
                    const obj = JSON.parse(body);
                    if (obj && typeof obj==='object') { obj.nick = nick; }
                    init.body = JSON.stringify(obj);
                  } else { // x-www-form-urlencoded
                    init.body = body.replace(/(^|&)(nick)=([^&]*)/g, (m,a,b,c)=> a+b+'='+encodeURIComponent(nick));
                  }
                }catch(e){ /* ignore */ }
              } else if (typeof FormData !== 'undefined' && body instanceof FormData){
                body.set('nick', nick);
              }
            }
          }
        }catch(e){/* ignore */}
        return __origFetch(input, init);
      }
    })();

    /* === NSMAO QQ 昵称热补丁：不改 Twikoo 源码，保持样式不变 === */
    const __NSMAO_QQ_KEY__ = '75gKybFM054DarMUAvMaVVtZjb';
    function __nsmao_pickName__(d){
        try {
            return (d && d.data && (d.data.name || d.data.nickname || (d.data.qqInfo && d.data.qqInfo.nickname))) ||
                   d.nickname || (d.qqinfo && d.qqinfo.nickname) || '';
        } catch (e) { return ''; }
    }
    async function __nsmao_fetchNick__(qq){
        try {
            const r = await fetch(`https://api.nsmao.net/api/qq/v1/query?key=${__NSMAO_QQ_KEY__}&qq=${qq}`, { cache: 'no-store', credentials: 'omit' });
            const j = await r.json();
            return __nsmao_pickName__(j);
        } catch(e){ return ''; }
    }
    async function __nsmao_tryFill__(root){
        const nick = root.querySelector('input[name="nick"], input[placeholder*="昵称"], input[placeholder*="nick"]');
        const mail = root.querySelector('input[name="mail"], input[type="email"]');
        if(!nick) return;
        const v = (nick.value||'').trim();
        const m = v.match(/^\d{5,11}$/);
        if(!m) return;
        const qq = m[0];
        const name = await __nsmao_fetchNick__(qq);
        if(name){
            window.__nsmaoNick = name;
            // 回填到所有昵称输入框
            const nicks = root.querySelectorAll('input[name="nick"], input[placeholder*="昵称"], input[placeholder*="nick"]');
            nicks.forEach(function(it){
              it.value = name;
              try { it.dispatchEvent(new Event('input', {bubbles:true})); } catch(e){}
              try { it.dispatchEvent(new Event('change', {bubbles:true})); } catch(e){}
            });
            // 邮箱补全
            if(mail && !mail.value){
                mail.value = qq + '@qq.com';
                try { mail.dispatchEvent(new Event('input', {bubbles:true})); } catch(e){}
                try { mail.dispatchEvent(new Event('change', {bubbles:true})); } catch(e){}
            }
            // 尝试把昵称写入常见的本地存储键名
            try { localStorage.setItem('twikoo_nick', name); } catch(e){}
            try { localStorage.setItem('tk_nick', name); } catch(e){}
            try { localStorage.setItem('nick', name); } catch(e){}
        }
    }
    function __nsmao_bind__(){
        // 输入 5-11 位数字后，自动去取昵称（防止必须失焦/点击空白）
        (function(){
          const boxNow = document.getElementById('twikoo');
          if(!boxNow) return;
          const selector = 'input[name="nick"], input[placeholder*="昵称"], input[placeholder*="nick"]';
          const nickInput = boxNow.querySelector(selector);
          let typing = false, timer = null;
          function schedule(){
            clearTimeout(timer);
            timer = setTimeout(async ()=>{
              if (!nickInput) return;
              const v = (nickInput.value||'').trim();
              if (/^\d{5,11}$/.test(v)) { try { await __nsmao_tryFill__(boxNow); } catch(e){} }
            }, 380);
          }
          if (nickInput && !nickInput.__nsmaoInputBound__){
            nickInput.__nsmaoInputBound__ = true;
            nickInput.addEventListener('compositionstart', ()=>typing=true);
            nickInput.addEventListener('compositionend', ()=>{typing=false; schedule();});
            nickInput.addEventListener('input', ()=>{ if (!typing) schedule(); });
          }
          // 容器级别捕获 Enter
          boxNow.addEventListener('keydown', async function(ev){
            const key = ev.key || ev.code;
            if (key==='Enter' || ev.keyCode===13 || ev.which===13){
              const t = ev.target;
              if (t && t.matches && t.matches(selector)){
                ev.preventDefault(); ev.stopPropagation();
                try { await __nsmao_tryFill__(boxNow); } catch(e) {}
                const mail = boxNow.querySelector('input[name="mail"], input[type="email"]');
                if (mail) try { mail.focus(); } catch(e) {}
              }
            }
          }, true);
        })();
    
        if (window.__nsmaoQQNickPatched__) return;
        const box = document.getElementById('twikoo');
        if(!box) return;
        window.__nsmaoQQNickPatched__ = true;
        // 全局捕获 Enter：无论 Twikoo 内部如何处理，昵称输入框按回车都触发回填
        if (!window.__nsmaoEnterCaptureBound__) {
          window.__nsmaoEnterCaptureBound__ = true;
          const __nsmaoNickSel = 'input[name="nick"], input[placeholder*="昵称"], input[placeholder*="nick"]';
          const __nsmaoEnterHandler = async function(ev){
            if (ev.key !== 'Enter') return;
            const t = ev.target;
            const boxNow = document.getElementById('twikoo');
            if (!boxNow || !t || !boxNow.contains(t)) return;
            if (!(t.matches && t.matches(__nsmaoNickSel))) return;
            ev.preventDefault(); ev.stopPropagation();
            try { await __nsmao_tryFill__(boxNow); } catch(e) {}
            const mail = boxNow.querySelector('input[name="mail"], input[type="email"]');
            if (mail) try { mail.focus(); } catch(e) {}
          };
          document.addEventListener('keydown', __nsmaoEnterHandler, true);
          document.addEventListener('keyup', __nsmaoEnterHandler, true);
        }

        // 首次渲染后兜底
        setTimeout(()=>__nsmao_tryFill__(box), 800);
        
        // 拦截发送按钮/表单提交：提交前再兜底一次
        box.addEventListener('click', async function(e){
          const btn = e.target && (e.target.closest && e.target.closest('button'));
          if (btn && /发送|提交|發送|Send|submit/i.test(btn.textContent||'')) {
            await __nsmao_tryFill__(box);
          }
        }, true);
        box.addEventListener('submit', async function(e){
          try { await __nsmao_tryFill__(box); } catch(err){}
        }, true);
// 监听失焦触发
        box.addEventListener('blur', e=>{
            if(e.target && e.target.matches('input[name="nick"], input[placeholder*="昵称"], input[placeholder*="nick"]')){
                __nsmao_tryFill__(box);
            }
        }, true);
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

    // PJAX 场景下，二次进入页面也确保补丁生效
    document.addEventListener('pjax:complete', function(){ try{ __nsmao_bind__(); }catch(e){} });
