(() => {

    /* === QQ 昵称+邮箱 热补丁（使用 xcvts.cn 接口）=== */
    const __XCVTS_API_KEY__ = 'fd13b4ace0f0f4071d08d618b09ed9f1';
    
    // 提取昵称逻辑适配新接口
    function __nsmao_pickName__(d){
        try { 
            // 适配 xcvts.cn 的返回结构: d.data.nickname
            return d?.data?.nickname || d?.nickname || d?.data?.name || ''; 
        } catch(e){ return ''; }
    }

    async function __nsmao_fetchNick__(qq){
        try{
            // 切换为新接口地址
            const r = await fetch(`https://api.xcvts.cn/api/qq_info?apiKey=${__XCVTS_API_KEY__}&qq=${qq}`, {cache:'no-store', credentials:'omit'});
            const j = await r.json(); 
            return __nsmao_pickName__(j);
        }catch(e){ return ''; }
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
            // 填充昵称
            nick.value = name;
            try { nick.dispatchEvent(new Event('input', {bubbles:true})); } catch(e){}
            try { nick.dispatchEvent(new Event('change', {bubbles:true})); } catch(e){}
            
            // 填充邮箱（统一为 qq@qq.com）
            const mailVal = qq + '@qq.com';
            const mailInputs = (scope||root).querySelectorAll('input[name="mail"], input[type="email"], input[placeholder*="邮箱"], input[placeholder*="mail"]');
            mailInputs.forEach(el=>{
                el.value = mailVal;
                try { el.dispatchEvent(new Event('input', {bubbles:true})); } catch(e){}
                try { el.dispatchEvent(new Event('change', {bubbles:true})); } catch(e){}
            });
            
            // 存入本地缓存，下次不用重新输入
            try { 
                localStorage.setItem('tk_nick', name); 
                localStorage.setItem('twikoo_nick', name); 
                localStorage.setItem('tk_mail', mailVal); 
                localStorage.setItem('twikoo_mail', mailVal);
            } catch(e){}
        }
    }

    function __nsmao_bind__(){
        const box = document.getElementById('twikoo');
        if(!box) return;
        if (box.__nsmaoBound__) return; box.__nsmaoBound__ = true;

        const sel = 'input[name="nick"], input[placeholder*="昵称"], input[placeholder*="nick"]';
        const nick = box.querySelector(sel);

        if (nick){
            // 1. Enter 键触发
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
        
        // 2. 失焦（点击空白处）触发
        if (!box.__nsmaoBlurBound__) {
            box.__nsmaoBlurBound__ = true;
            box.addEventListener('blur', function(e){
                try{
                    const t = e.target;
                    if (t && t.matches && t.matches(sel)) {
                        __nsmao_tryFill__(box, t);
                    }
                }catch(err){}
            }, true);
        }

        // PJAX 适配
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
                
                // 修正 tk-extra 间距的 Patch
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
                    } catch (e) {}
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
        }).catch(function (err) {});
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