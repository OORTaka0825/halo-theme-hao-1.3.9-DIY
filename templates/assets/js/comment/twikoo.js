(() => {
    /* === QQ 昵称+邮箱 前端直连获取逻辑 === */
    const __QQ_API_KEY__ = '6bf46f7a38b6e3b3'; // 你的小小API KEY

    async function __manual_fetchNick__(qq) {
        try {
            // 使用 no-cors 模式往往无法获取内容，所以我们坚持使用标准 fetch，但增加错误捕捉
            const r = await fetch(`https://api.qjqjq.cn/api/qqname?qq=${qq}`, {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + __QQ_API_KEY__ },
                cache: 'no-store'
            });
            if (!r.ok) return '';
            const j = await r.json();
            return j?.data?.nick || j?.data?.nickname || j?.name || '';
        } catch (e) {
            // 如果依然 ERR_CONNECTION_CLOSED，这里会捕捉并静默处理
            console.warn('[Twikoo补丁] API直连受阻，请检查网络或更换代理');
            return '';
        }
    }

    async function __manual_tryFill__(box) {
        const nickInput = box.querySelector('input[name="nick"], input[placeholder*="昵称"]');
        if (!nickInput) return;
        const qq = nickInput.value.trim();
        if (!/^\d{5,11}$/.test(qq)) return;

        const name = await __manual_fetchNick__(qq);
        if (name) {
            nickInput.value = name;
            nickInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            // 自动填充邮箱
            const mailInput = box.querySelector('input[name="mail"], input[type="email"]');
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

        const nickInput = box.querySelector('input[name="nick"], input[placeholder*="昵称"]');
        if (nickInput) {
            // 回车触发
            nickInput.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    __manual_tryFill__(box);
                }
            });
            // 失焦触发
            nickInput.addEventListener('blur', () => __manual_tryFill__(box));
        }
    }

    /* === Twikoo 初始化逻辑 === */
    if (!document.getElementById('post-comment')) return;

    const init = () => {
        twikoo.init(Object.assign({
            el: '#twikoo-wrap',
            envId: GLOBAL_CONFIG.source.twikoo.twikooUrl,
            region: '',
            path: location.pathname.replace(/\/page\/\d$/, ""),
            onCommentLoaded: function () {
                try { __manual_bind__(); } catch(e){}

                // 修复 btf 报错
                try { 
                    if (typeof btf === 'object') btf.loadLightbox(document.querySelectorAll('#twikoo .tk-content img:not(.tk-owo-emotion)')); 
                } catch(e){}
                
                // 修复 hljs 报错
                if (typeof hljs === 'object') { try { hljs.highlightAll(); } catch(e){} }
                
                // 【核心修复】解决你截图中的 Prism.highlightAll 报错
                if (typeof Prism === 'object' && typeof Prism.highlightAll === 'function') { 
                    try { Prism.highlightAll(); } catch(e){} 
                }

                // 布局修正补丁
                (function __fixTkExtraGaps__(root) {
                    try {
                        var container = root.getElementById ? root.getElementById('twikoo') : root;
                        (container || root).querySelectorAll('.tk-extra .tk-icon + *').forEach(function (el) {
                            el.normalize();
                            el.childNodes.forEach(function (n) {
                                if (n.nodeType === 3) {
                                    n.textContent = n.textContent.replace(/[\u00A0\u202F\u2009\u200A\u200B\uFEFF]/g, ' ').replace(/\s+/g, ' ').replace(/^\s+/, '');
                                }
                            });
                        });
                    } catch (e) {}
                })(document);
            }
        }, null))
    }

    const loadTwikoo = () => {
        if (typeof twikoo === 'object') {
            init();
        } else {
            getScript(GLOBAL_CONFIG.source.twikoo.js).then(init);
        }
    }

    loadTwikoo();
})();