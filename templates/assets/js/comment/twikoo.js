(() => {

    (() => {

    /* === QQ 昵称+邮箱 热补丁（小小 API 适配版）=== */
    // 仅 Enter 触发（关闭自动与失焦）
    const __NSMAO_ENTER_ONLY__ = true;
    // 使用你提供的新 Key
    const __NSMAO_QQ_KEY__ = '6bf46f7a38b6e3b3'; 

    function __nsmao_pickName__(d){
        try { 
            // 适配小小 API 的返回结构：d.data.nick
            return d?.data?.nick || d?.data?.nickname || d?.name || d?.nickname || ''; 
        }
        catch(e){ return ''; }
    }

    async function __nsmao_fetchNick__(qq){
        try{
            // 使用小小 API 的新接口地址
            const r = await fetch(`https://api.qjqjq.cn/api/qqname?qq=${qq}`, {
                method: 'GET',
                headers: {
                    // 关键：根据截图要求，Key 必须放在 Authorization Header 中
                    'Authorization': 'Bearer ' + __NSMAO_QQ_KEY__
                },
                cache: 'no-store'
            });
            const j = await r.json(); 
            return __nsmao_pickName__(j);
        }catch(e){ 
            console.error('获取QQ昵称失败:', e);
            return ''; 
        }
    }

    async function __nsmao_tryFill__(root, src){
        const scope = (src && (src.closest("form") || src.closest(".tk-reply") || src.closest(".tk-comment") || src.closest(".tk-comment-item") || src.closest(".tk-comments") || src.closest("#twikoo"))) || root;
        const nick = scope.querySelector('input[name="nick"], input[placeholder*="昵称"], input[placeholder*="nick"]');
        if(!nick) return;
        const v = (nick.value||'').trim();
        const m = v.match(/^\d{5,11}$/);
        if(!m) return;
        const qq = m[0];
        const name = await __nsmao_fetchNick__(qq);
        if(name){
            // 填入获取到的中文昵称
            nick.value = name;
            try { nick.dispatchEvent(new Event('input', {bubbles:true})); } catch(e){}
            try { nick.dispatchEvent(new Event('change', {bubbles:true})); } catch(e){}
            
            // 邮箱统一处理为 qq@qq.com
            const mailVal = qq + '@qq.com';
            const mailInputs = (scope||root).querySelectorAll('input[name="mail"], input[type="email"], input[placeholder*="邮箱"], input[placeholder*="mail"]');
            mailInputs.forEach(el=>{
                el.value = mailVal;
                try { el.dispatchEvent(new Event('input', {bubbles:true})); } catch(e){}
                try { el.dispatchEvent(new Event('change', {bubbles:true})); } catch(e){}
            });
            
            // 写入本地存储
            try { localStorage.setItem('tk_nick', name); localStorage.setItem('twikoo_nick', name); } catch(e){}
            try { localStorage.setItem('tk_mail', mailVal); localStorage.setItem('twikoo_mail', mailVal); } catch(e){}
        }
    }

    // ... 后续逻辑（__nsmao_bind__ 等）保持原样即可 ...
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
            
/* === Patch: Normalize invisible spaces in tk-extra badges === */
(function __fixTkExtraGaps__(root) {
  try {
    if (!root) root = document;
    var container = root.getElementById ? root.getElementById('twikoo') : root;
    (container || root).querySelectorAll('.tk-extra .tk-icon + *').forEach(function (el) {
      el.normalize();
      el.childNodes.forEach(function (n) {
        if (n.nodeType === 3) {
          n.textContent = n.textContent
            .replace(/[\u00A0\u202F\u2009\u200A\u200B\uFEFF]/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/^\s+/, '');
        }
      });
    });
  } catch (e) {
    console && console.debug && console.debug('[tk-extra patch]', e);
  }
})(document);
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