(() => {
    // 彻底停用前端直连 fetch，避免产生 ERR_CONNECTION_CLOSED 报错
    if (!document.getElementById('post-comment')) return;

    const init = () => {
        twikoo.init(Object.assign({
            el: '#twikoo-wrap',
            envId: GLOBAL_CONFIG.source.twikoo.twikooUrl,
            path: location.pathname.replace(/\/page\/\d$/, ""),
            onCommentLoaded: function () {
                // 防御性检查，解决 Prism.highlightAll is not a function 报错
                if (typeof Prism === 'object' && typeof Prism.highlightAll === 'function') {
                    try { Prism.highlightAll(); } catch(e){}
                }
                // 基础美化加载
                try { if (typeof btf === 'object') btf.loadLightbox(document.querySelectorAll('#twikoo .tk-content img:not(.tk-owo-emotion)')); } catch(e){}
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