(() => {
    // 提示：已移除所有手动获取 QQ 昵称的补丁代码，避免干扰官方内置逻辑。
    // 请确保你在 Twikoo 后台的 QQ_API_KEY 中已填入: 6bf46f7a38b6e3b3

    if (!document.getElementById('post-comment')) return;

    const init = () => {
        twikoo.init(Object.assign({
            el: '#twikoo-wrap',
            envId: GLOBAL_CONFIG.source.twikoo.twikooUrl,
            region: '',
            path: location.pathname.replace(/\/page\/\d$/, ""),
            onCommentLoaded: function () {
                // 1. 基础美化逻辑（增加防御逻辑防止报错）
                try { 
                    if (typeof btf === 'object') btf.loadLightbox(document.querySelectorAll('#twikoo .tk-content img:not(.tk-owo-emotion)')); 
                } catch(e){}
                
                if (typeof hljs === 'object') { try { hljs.highlightAll(); } catch(e){} }
                
                // 解决 Prism 报错：先检查函数是否存在
                if (typeof Prism === 'object' && typeof Prism.highlightAll === 'function') { 
                    try { Prism.highlightAll(); } catch(e){} 
                }

                // 2. 修复布局偏移补丁
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
            const countEl = document.getElementById('twikoo-count');
            if (countEl) countEl.innerText = res[0].count;
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

    // 适配加载逻辑
    if (GLOBAL_CONFIG.source.comments.lazyload) {
        btf.loadComment(document.getElementById('twikoo-wrap'), loadTwikoo);
    } else {
        loadTwikoo();
    }
})();