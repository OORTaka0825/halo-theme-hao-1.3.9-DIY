(() => {
    // 已移除所有外部补丁，获取昵称功能请直接在 Twikoo 后台填入 Key 即可

    if (!document.getElementById('post-comment')) return;

    const init = () => {
        twikoo.init(Object.assign({
            el: '#twikoo-wrap',
            envId: GLOBAL_CONFIG.source.twikoo.twikooUrl,
            region: '',
            path: location.pathname.replace(/\/page\/\d$/, ""),
            onCommentLoaded: function () {
                // 仅保留基础美化逻辑，增加报错防御
                try { btf.loadLightbox(document.querySelectorAll('#twikoo .tk-content img:not(.tk-owo-emotion)')); } catch(e){}
                if (typeof hljs === 'object') { hljs.highlightAll(); }
                if (typeof Prism === 'object' && typeof Prism.highlightAll === 'function') { Prism.highlightAll(); }
                
                // 修复评论区一些不可见空格导致的布局偏移
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

    // 适配各种加载模式
    if (GLOBAL_CONFIG.source.comments.lazyload) {
        btf.loadComment(document.getElementById('twikoo-wrap'), loadTwikoo);
    } else {
        loadTwikoo();
    }
})();