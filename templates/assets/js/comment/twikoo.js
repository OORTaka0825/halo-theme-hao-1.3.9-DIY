(() => {
    /* === QQ 昵称+邮箱 热补丁（修复跨域版）=== */
    
    // 自动寻找填充范围
    async function __nsmao_tryFill__(root, src) {
        const scope = (src && (src.closest(".tk-submit") || src.closest(".tk-reply") || src.closest("#twikoo"))) || root;
        const nickInput = scope.querySelector('input[name="nick"], input[placeholder*="昵称"]');
        const mailInput = scope.querySelector('input[name="mail"], input[type="email"]');
        
        if (!nickInput) return;
        const qq = nickInput.value.trim();
        if (!/^\d{5,11}$/.test(qq)) return;

        try {
            // 更换为支持跨域(CORS)的公共接口，无需 Key，且稳定
            const response = await fetch(`https://api.paugram.com/qq/?qq=${qq}`);
            const data = await response.json();
            
            if (data && data.name) {
                const nickname = data.name;
                const mailVal = qq + '@qq.com';

                // 填充昵称
                nickInput.value = nickname;
                nickInput.dispatchEvent(new Event('input', { bubbles: true }));
                nickInput.dispatchEvent(new Event('change', { bubbles: true }));

                // 填充邮箱
                if (mailInput) {
                    mailInput.value = mailVal;
                    mailInput.dispatchEvent(new Event('input', { bubbles: true }));
                    mailInput.dispatchEvent(new Event('change', { bubbles: true }));
                }

                // 同步到 Twikoo 本地存储
                localStorage.setItem('tk_nick', nickname);
                localStorage.setItem('tk_mail', mailVal);
            }
        } catch (err) {
            console.error("QQ 获取失败，可能是接口波动", err);
        }
    }

    function __nsmao_bind__() {
        const box = document.getElementById('twikoo');
        if (!box || box.__nsmaoBound__) return;
        box.__nsmaoBound__ = true;

        // 绑定事件：回车或失去焦点时触发
        box.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.matches('input[name="nick"], input[placeholder*="昵称"]')) {
                __nsmao_tryFill__(box, e.target);
            }
        }, true);

        box.addEventListener('focusout', (e) => {
            if (e.target.matches('input[name="nick"], input[placeholder*="昵称"]')) {
                __nsmao_tryFill__(box, e.target);
            }
        }, true);
    }

    // Twikoo 初始化逻辑
    const init = () => {
        const envId = GLOBAL_CONFIG.source.twikoo.twikooUrl;
        if (!envId) return;

        twikoo.init(Object.assign({
            el: '#twikoo-wrap',
            envId: envId,
            region: '',
            path: location.pathname.replace(/\/page\/\d$/, ""),
            onCommentLoaded: function () {
                // 核心：绑定补丁
                try { __nsmao_bind__(); } catch (e) {}

                // 原有插件初始化
                if (typeof btf !== 'undefined') {
                    btf.loadLightbox(document.querySelectorAll('#twikoo .tk-content img:not(.tk-owo-emotion)'));
                }
                if (typeof hljs === 'object') hljs.highlightAll();
                if (typeof Prism === 'object') Prism.highlightAll();
            }
        }, null));
    }

    const loadTwikoo = () => {
        if (typeof twikoo === 'object') {
            init();
        } else {
            const script = document.createElement('script');
            script.src = GLOBAL_CONFIG.source.twikoo.js;
            script.onload = init;
            document.head.appendChild(script);
        }
    }

    // 启动
    if (document.getElementById('post-comment')) {
        loadTwikoo();
    }
    
    // 兼容 PJAX
    document.addEventListener('pjax:complete', loadTwikoo);

})();