(() => {
    // 强制前端补丁：避开 Vercel 后端连接失败的问题
    const QQ_KEY = '6bf46f7a38b6e3b3'; 

    async function fetchQQInfo(qq) {
        try {
            // 使用小小 API 的标准格式
            const response = await fetch(`https://api.qjqjq.cn/api/qqname?qq=${qq}`, {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + QQ_KEY }
            });
            const resData = await response.json();
            return resData?.data?.nick || resData?.data?.nickname || '';
        } catch (e) {
            return '';
        }
    }

    function bindEvents() {
        const el = document.getElementById('twikoo');
        if (!el || el._qqBound) return;
        el._qqBound = true;

        const nickInput = el.querySelector('input[name="nick"]');
        if (nickInput) {
            nickInput.addEventListener('blur', async () => {
                const val = nickInput.value.trim();
                if (/^\d{5,11}$/.test(val)) {
                    const name = await fetchQQInfo(val);
                    if (name) {
                        nickInput.value = name;
                        nickInput.dispatchEvent(new Event('input', { bubbles: true }));
                        // 顺便填下邮箱
                        const mailInput = el.querySelector('input[name="mail"]');
                        if (mailInput) {
                            mailInput.value = val + '@qq.com';
                            mailInput.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    }
                }
            });
        }
    }

    if (!document.getElementById('post-comment')) return;

    const init = () => {
        twikoo.init(Object.assign({
            el: '#twikoo-wrap',
            envId: GLOBAL_CONFIG.source.twikoo.twikooUrl,
            path: location.pathname.replace(/\/page\/\d$/, ""),
            onCommentLoaded: function () {
                bindEvents(); // 绑定获取逻辑
                
                // 修复你截图中的 Prism 报错
                if (typeof Prism === 'object' && typeof Prism.highlightAll === 'function') {
                    try { Prism.highlightAll(); } catch(e){}
                }
                
                // 基础美化
                try { btf.loadLightbox(document.querySelectorAll('#twikoo .tk-content img:not(.tk-owo-emotion)')); } catch(e){}
            }
        }, null));
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