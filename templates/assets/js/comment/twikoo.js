(() => {
    /* === QQ 昵称+邮箱 热补丁（小小 API / 青桔 适配版）=== */
    const __NSMAO_ENTER_ONLY__ = true;
    // 这里已经帮你填好了你截图中的 KEY
    const __NSMAO_QQ_KEY__ = '6bf46f7a38b6e3b3'; 

    function __nsmao_pickName__(d){
        try { 
            // 按照新接口路径解析：d.data.nick
            return d?.data?.nick || d?.data?.nickname || d?.name || d?.nickname || ''; 
        }
        catch(e){ return ''; }
    }

    async function __nsmao_fetchNick__(qq){
        try{
            // 使用小小 API 的接口地址
            const r = await fetch(`https://api.qjqjq.cn/api/qqname?qq=${qq}`, {
                method: 'GET',
                headers: {
                    // 必须带上这个 Authorization 头
                    'Authorization': 'Bearer ' + __NSMAO_QQ_KEY__
                },
                cache: 'no-store'
            });
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
            nick.value = name;
            try { nick.dispatchEvent(new Event('input', {bubbles:true})); } catch(e){}
            try { nick.dispatchEvent(new Event('change', {bubbles:true})); } catch(e){}
            
            const mailVal = qq + '@qq.com';
            const mailInputs = (scope||root).querySelectorAll('input[name="mail"], input[type="email"], input[placeholder*="邮箱"], input[placeholder*="mail"]');
            mailInputs.forEach(el=>{
                el.value = mailVal;
                try { el.dispatchEvent(new Event('input', {bubbles:true})); } catch(e){}
                try { el.dispatchEvent(new Event('change', {bubbles:true})); } catch(e){}
            });
            try { localStorage.setItem('tk_nick', name); localStorage.setItem('twikoo_nick', name); } catch(e){}
            try { localStorage.setItem('tk_mail', mailVal); localStorage.setItem('twikoo_mail', mailVal); } catch(e){}
        }
    }

    function __nsmao_bind__(){
        const box = document.getElementById('twikoo');
        if(!box) return;
        if (box.__nsmaoBound__) return; 
        box.__nsmaoBound__ = true;
        const sel = 'input[name="nick"], input[placeholder*="昵称"], input[placeholder*="nick"]';
        const nick = box.querySelector(sel);
        if (nick){
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
        
        box.addEventListener('blur', function(e){
            try{
                const t = e.target;
                if (t && t.matches && t.matches(sel)) {
                    __nsmao_tryFill__(box, t);
                }
            }catch(err){}
        }, true);
    }

    // 核心 Twikoo 初始化逻辑，不做任何删减
    if (!document.getElementById('post-comment')) return;
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

    const loadTwikoo = () => {
        if (typeof twikoo === 'object') {
            init();
            getCount();
            return;
        }
        getScript(GLOBAL_CONFIG.source.twikoo.js).then(() => {
            init();
            getCount();
        });
    }

    loadTwikoo();
})();