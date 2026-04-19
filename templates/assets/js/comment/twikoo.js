(() => {
    // 逻辑说明：由于前端直连 API 被封锁 (ERR_CONNECTION_CLOSED)
    // 本脚本已移除前端 fetch 逻辑，请确保 Twikoo 管理面板已配置 QQ_API_KEY

    if (!document.getElementById('post-comment')) return;

    const init = () => {
        twikoo.init(Object.assign({
            el: '#twikoo-wrap',
            envId: GLOBAL_CONFIG.source.twikoo.twikooUrl,
            region: '',
            path: location.pathname.replace(/\/page\/\d$/, ""),
            onCommentLoaded: function () {
                // 1. 基础美化兜底
                try { 
                    if (typeof btf === 'object') btf.loadLightbox(document.querySelectorAll('#twikoo .tk-content img:not(.tk-owo-emotion)')); 
                } catch(e){}
                
                if (typeof hljs === 'object') { try { hljs.highlightAll(); } catch(e){} }
                
                // 2. 【深度修复】解决 Prism.highlightAll is not a function 报错
                // 只有当插件函数确实存在时才运行，防止脚本运行中断
                if (typeof Prism === 'object' && typeof Prism.highlightAll === 'function') { 
                    try { Prism.highlightAll(); } catch(e){} 
                }

                // 3. 布局修正补丁
                (function __fixTkExtraGaps__(root) {
                    try {
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

    const loadTwikoo = () => {
        if (typeof twikoo === 'object') {
            init();
        } else {
            getScript(GLOBAL_CONFIG.source.twikoo.js).then(init);
        }
    }

    loadTwikoo();
})();