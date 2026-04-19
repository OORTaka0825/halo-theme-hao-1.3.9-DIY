(() => {
    // 已移除外部接口补丁，请直接在 Twikoo 管理面板的 QQ_API_KEY 处填入你的 Key

    if (!document.getElementById('post-comment')) return;

    const init = () => {
        twikoo.init(Object.assign({
            el: '#twikoo-wrap',
            envId: GLOBAL_CONFIG.source.twikoo.twikooUrl,
            region: '',
            path: location.pathname.replace(/\/page\/\d$/, ""),
            onCommentLoaded: function () {
                // 仅保留基础美化补丁
                btf.loadLightbox(document.querySelectorAll('#twikoo .tk-content img:not(.tk-owo-emotion)'))
                typeof hljs === 'object' && hljs.highlightAll()
                typeof Prism === 'object' && Prism.highlightAll()

                /* === Patch: Normalize invisible spaces in tk-extra badges === */
                (function __fixTkExtraGaps__(root) {
                    try {
                        if (!root) root = document;
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
                    } catch (e) {
                        console && console.debug && console.debug('[tk-extra patch]', e);
                    }
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