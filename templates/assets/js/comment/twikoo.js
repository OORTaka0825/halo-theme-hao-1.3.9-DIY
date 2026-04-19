(() => {
    /* === QQ 昵称+邮箱 前端直接请求补丁（绕过后端）=== */
    const __QQ_API_KEY__ = '6bf46f7a38b6e3b3'; 

    async function __manual_fetchNick__(qq) {
        try {
            // 直接请求小小 API，带上验证头
            const r = await fetch(`https://api.qjqjq.cn/api/qqname?qq=${qq}`, {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + __QQ_API_KEY__ },
                cache: 'no-store'
            });
            const j = await r.json();
            // 解析路径适配
            return j?.data?.nick || j?.data?.nickname || j?.name || '';
        } catch (e) {
            console.error('前端获取QQ昵称失败:', e);
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
            // 触发 input 事件让 Twikoo 感知到内容变化
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
            // 失焦触发（点空白处）
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
                // 绑定手动获取逻辑
                try { __manual_bind__(); } catch(e){}

                // 基础美化与报错修复
                try { btf.loadLightbox(document.querySelectorAll('#twikoo .tk-content img:not(.tk-owo-emotion)')); } catch(e){}
                if (typeof hljs === 'object') { try { hljs.highlightAll(); } catch(e){} }
                
                // 修复你截图中的 Prism.highlightAll 报错
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

    const getCount = () => {
        twikoo.getCommentsCount({
            envId: GLOBAL_CONFIG.source.twikoo.twikooUrl,
            region: '',
            urls: [window.location.pathname],
            includeReply: true
        }).then(function (res) {
            const el = document.getElementById('twikoo-count');
            if (el) el.innerText = res[0].count;
        }).catch(function (err) {});
    }

    const loadTwikoo = () => {
        if (typeof twikoo === 'object') {
            init();
            getCount();
        } else {
            getScript(GLOBAL_CONFIG.source.twikoo.js).then(() => {
                init();
                getCount();
            });
        }
    }

    if (GLOBAL_CONFIG.source.comments.lazyload) {
        btf.loadComment(document.getElementById('twikoo-wrap'), loadTwikoo);
    } else {
        loadTwikoo();
    }
})();