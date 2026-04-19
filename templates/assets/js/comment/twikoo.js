(() => {
    // 逻辑：彻底放弃前端 fetch 直连，改用 Twikoo 后端内置功能
    // 请确保 Twikoo 后台的 QQ_API_KEY 已填入：6bf46f7a38b6e3b3

    if (!document.getElementById('post-comment')) return;

    const init = () => {
        twikoo.init(Object.assign({
            el: '#twikoo-wrap',
            envId: GLOBAL_CONFIG.source.twikoo.twikooUrl,
            region: '',
            path: location.pathname.replace(/\/page\/\d$/, ""),
            onCommentLoaded: function () {
                // 1. 基础美化与报错兜底
                try { 
                    if (typeof btf === 'object') btf.loadLightbox(document.querySelectorAll('#twikoo .tk-content img:not(.tk-owo-emotion)')); 
                } catch(e){}
                
                if (typeof hljs === 'object') { try { hljs.highlightAll(); } catch(e){} }
                
                // 【核心修复】解决你截图中的 Prism.highlightAll 报错
                // 只有当函数确实存在时才运行，防止脚本在此处中断
                if (typeof Prism === 'object' && typeof Prism.highlightAll === 'function') { 
                    try { Prism.highlightAll(); } catch(e){} 
                }

                // 2. 布局修正补丁
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