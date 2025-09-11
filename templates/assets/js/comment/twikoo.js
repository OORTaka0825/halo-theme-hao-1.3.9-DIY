(() => {

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
            nick.value = name;
            try { nick.dispatchEvent(new Event('input', {bubbles:true})); } catch(e){}
            if(mail && !mail.value){
                mail.value = qq + '@qq.com';
                try { mail.dispatchEvent(new Event('input', {bubbles:true})); } catch(e){}
            }
        }
    }
    function __nsmao_bind__(){
        if (window.__nsmaoQQNickPatched__) return;
        const box = document.getElementById('twikoo');
        if(!box) return;
        window.__nsmaoQQNickPatched__ = true;
        // 首次渲染后兜底
        setTimeout(()=>__nsmao_tryFill__(box), 800);
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
