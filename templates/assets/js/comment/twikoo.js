(() => {
    if (!document.getElementById('post-comment')) return
    const init = () => {
        twikoo.init(Object.assign({
            el: '#twikoo-wrap',
            envId: GLOBAL_CONFIG.source.twikoo.twikooUrl,
            region: '',
            path: location.pathname.replace(/\/page\/\d$/, ""),
            onCommentLoaded: function () {
                btf.loadLightbox(document.querySelectorAll('#twikoo .tk-content img:not(.tk-owo-emotion)'))
                typeof hljs === 'object' && hljs.highlightAll()
                typeof Prism === 'object' && Prism.highlightAll()
                $("input").focus(function () {
                    heo_intype = true;
                });
                $("textarea").focus(function () {
                    heo_intype = true;
                });
                $("input").focusout(function () {
                    heo_intype = false;
                });
                

                // === Fix region display: prefer City -> Province -> Country; hide '0' ===
                try {
                    const pickRegion = (s) => {
                        const parts = String(s || '').split('|'); // [country, area, province, city, isp]
                        const country = parts[0] || '';
                        const province = parts[2] || '';
                        const city = parts[3] || '';
                        return (city && city !== '0') ? city
                             : (province && province !== '0') ? province
                             : (country && country !== '0') ? country
                             : '';
                    };

                    const fixTwikooRegion = (root) => {
                        root = root || document;
                        // 1) explicit region elements often used by themes
                        const nodes = root.querySelectorAll('#twikoo .tk-region, #twikoo .comment-region, #twikoo .region-badge, #twikoo .twikoo-region, #twikoo .badge-region');
                        nodes.forEach((el) => {
                            const raw = el.getAttribute('data-ipRegion') || el.dataset.ipRegion || el.dataset.region || el.getAttribute('title') || el.getAttribute('aria-label') || el.textContent.trim();
                            const nice = pickRegion(raw);
                            if (nice) el.textContent = nice;
                            else if (el.textContent.trim() === '0') el.remove();
                        });

                        // 2) as a fallback, remove plain '0' badges within meta area
                        root.querySelectorAll('#twikoo .tk-meta .badge, #twikoo .tk-meta .tag, #twikoo .tk-meta .tk-tag').forEach((el) => {
                            if (el.textContent.trim() === '0') el.remove();
                        });
                    };

                    // run immediately for current render
                    fixTwikooRegion(document);
                    // also schedule once more after layout just in case
                    setTimeout(() => fixTwikooRegion(document), 0);
                } catch (e) {
                    console && console.debug && console.debug('[twikoo] region fix failed:', e);
                }
$("textarea").focusout(function () {
                    heo_intype = false;
                });
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
        }).catch(function (err) {
        });
    }

    const runFn = () => {
        init()
        true && getCount()
    }

    const loadTwikoo = () => {
        if (typeof twikoo === 'object') {
            setTimeout(runFn, 0)
            return
        }
        getScript(GLOBAL_CONFIG.source.twikoo.js).then(runFn)
    }

    if ('Twikoo' === 'Twikoo' || !GLOBAL_CONFIG.source.comments.lazyload) {
        if (GLOBAL_CONFIG.source.comments.lazyload) btf.loadComment(document.getElementById('twikoo-wrap'), loadTwikoo)
        else loadTwikoo()
    } else {
        window.loadOtherComment = () => {
            loadTwikoo()
        }
    }


})()