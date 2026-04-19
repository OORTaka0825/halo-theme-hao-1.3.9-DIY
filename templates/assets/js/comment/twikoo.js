(() => {
    /* === QQ 昵称+邮箱 补丁 (使用你的 CF Worker 接口) === */
    const __CF_PROXY_URL__ = 'https://qq.oortaka.top/?qq=';

    async function __manual_fetchNick__(qq) {
        try {
            const r = await fetch(`${__CF_PROXY_URL__}${qq}`, { cache: 'no-store' });
            if (!r.ok) return '';
            const j = await r.json();
            // 根据你 CF Worker 返回的格式提取 nickname
            return j.nickname || '';
        } catch (e) {
            console.error('[Twikoo补丁] 获取昵称失败:', e);
            return '';
        }
    }

    async function __manual_tryFill__(root, src) {
        const scope = (src && (src.closest("form") || src.closest(".tk-reply") || src.closest(".tk-comment") || src.closest("#twikoo"))) || root;
        const nickInput = scope.querySelector('input[name="nick"], input[placeholder*="昵称"]');
        if (!nickInput) return;
        
        const qqMatch = nickInput.value.trim().match(/^\d{5,11}$/);
        if (!qqMatch) return;
        
        const qq = qqMatch[0];
        const name = await __manual_fetchNick__(qq);
        
        if (name) {
            nickInput.value = name;
            nickInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            // 填充邮箱
            const mailInput = scope.querySelector('input[name="mail"], input[type="email"]');
            if (mailInput) {
                mailInput.value = qq + '@qq.com';
                mailInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    }

    function __manual_bind__() {
        const box = document.getElementById('twikoo');
        if (!box || box.__manualBound__) return;
        box.__manualBound__ = true;

        const sel = 'input[name="nick"], input[placeholder*="昵称"]';
        
        // 绑定回车事件
        box.addEventListener('keydown', e => {
            const t = e.target;
            if ((e.key === 'Enter' || e.keyCode === 13) && t && t.matches && t.matches(sel)) {
                e.preventDefault();
                __manual_tryFill__(box, t);
            }
        }, true);

        // 绑定失焦事件（点空白处触发）
        box.addEventListener('blur', e => {
            const t = e.target;
            if (t && t.matches && t.matches(sel)) {
                __manual_tryFill__(box, t);
            }
        }, true);
    }

    if (!document.getElementById('post-comment')) return;

    const init = () => {
        twikoo.init(Object.assign({
            el: '#twikoo-wrap',
            envId: GLOBAL_CONFIG.source.twikoo.twikooUrl,
            region: '',
            path: location.pathname.replace(/\/page\/\d$/, ""),
            onCommentLoaded: function () {
                try { __manual_bind__(); } catch(e) {}

                // 基础美化加载
                if (typeof btf === 'object') btf.loadLightbox(document.querySelectorAll('#twikoo .tk-content img:not(.tk-owo-emotion)'));
                if (typeof hljs === 'object') hljs.highlightAll();
                
                // 【核心修复】解决 Prism.highlightAll is not a function 报错
                if (typeof Prism === 'object' && typeof Prism.highlightAll === 'function') {
                    try { Prism.highlightAll(); } catch(e) {}
                }

                // 移除不可见空格补丁
                (function __fixTkExtraGaps__(root) {
                    try {
                        const container = root.getElementById ? root.getElementById('twikoo') : root;
                        (container || root).querySelectorAll('.tk-extra .tk-icon + *').forEach(el => {
                            el.normalize();
                            el.childNodes.forEach(n => {
                                if (n.nodeType === 3) {
                                    n.textContent = n.textContent.replace(/[\u00A0\u202F\u2009\u200A\u200B\uFEFF]/g, ' ').replace(/\s+/g, ' ').replace(/^\s+/, '');
                                }
                            });
                        });
                    } catch (e) {}
                })(document);
            }
        }, null));
    }

    const getCount = () => {
        twikoo.getCommentsCount({
            envId: GLOBAL_CONFIG.source.twikoo.twikooUrl,
            region: '',
            urls: [window.location.pathname],
            includeReply: true
        }).then(res => {
            const countEl = document.getElementById('twikoo-count');
            if (countEl) countEl.innerText = res[0].count;
        }).catch(() => {});
    }

    const runFn = () => {
        init();
        getCount();
    }

    const loadTwikoo = () => {
        if (typeof twikoo === 'object') {
            setTimeout(runFn, 0);
            return;
        }
        getScript(GLOBAL_CONFIG.source.twikoo.js).then(runFn);
    }

    if (!GLOBAL_CONFIG.source.comments.lazyload) {
        loadTwikoo();
    } else {
        window.loadOtherComment = loadTwikoo;
    }
})();