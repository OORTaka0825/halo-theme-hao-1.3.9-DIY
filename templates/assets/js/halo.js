let halo = {
    darkComment: () => {
        if (document.querySelector('#comment div').shadowRoot.querySelector('.halo-comment-widget').classList != null) {
            let commentDOMclass = document.querySelector('#comment div').shadowRoot.querySelector('.halo-comment-widget').classList
            if (commentDOMclass.contains('light'))
                commentDOMclass.replace('light', 'dark')
            else
                commentDOMclass.replace('dark', 'light')
        }

    },

    dataCodeTheme: () => {

        var t = document.documentElement.getAttribute('data-theme')
        var e = document.querySelector("link[data-code-theme=light]"),
            o = document.querySelector("link[data-code-theme=dark]");
        (o || e) && ("light" === t ? (o.disabled = !0, e.disabled = !1) : (e.disabled = !0, o.disabled = !1))

    },

    /**
     * 代码
     * 只适用于halo的代码渲染
     */
    addPrismTool: () => {
        if (typeof Prism === 'undefined' || typeof document === 'undefined') {
            return;
        }

        if (!Prism.plugins.toolbar) {
            console.warn('Copy to Clipboard plugin loaded before Toolbar plugin.');
            return;
        }
        // 防重复挂载（避免 PJAX 多次叠加）
        if (window.__PRISM_TOOL_PATCHED__) return;
        window.__PRISM_TOOL_PATCHED__ = true;

        const enable = GLOBAL_CONFIG.prism.enable;
        if (!enable) return;
        const isEnableTitle = GLOBAL_CONFIG.prism.enable_title;
        const isEnableHr = GLOBAL_CONFIG.prism.enable_hr;
        const isEnableLine = GLOBAL_CONFIG.prism.enable_line;
        const isEnableCopy = GLOBAL_CONFIG.prism.enable_copy;
        const isEnableExpander = GLOBAL_CONFIG.prism.enable_expander;
        const prismLimit = Number(GLOBAL_CONFIG.prism.prism_limit || GLOBAL_CONFIG.prism.height_limit || 300);
        const isEnableHeightLimit = GLOBAL_CONFIG.prism.enable_height_limit;

        // 与主题保持一致：高度限制 +30 作为缓冲
        const LIMIT = prismLimit + 30;

        // https://stackoverflow.com/a/30810322/7595472

        /** @param {CopyInfo} copyInfo */
        function fallbackCopyTextToClipboard(copyInfo) {
            var textArea = document.createElement('textarea');
            textArea.value = copyInfo.getText();
            textArea.style.top = '0';
            textArea.style.left = '0';
            textArea.style.position = 'fixed';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                var successful = document.execCommand('copy');
                setTimeout(function () {
                    if (successful) {
                        copyInfo.success();
                    } else {
                        copyInfo.error();
                    }
                }, 1);
            } catch (err) {
                setTimeout(function () {
                    copyInfo.error(err);
                }, 1);
            }

            document.body.removeChild(textArea);
        }

        /** @param {CopyInfo} copyInfo */
        function copyTextToClipboard(copyInfo) {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(copyInfo.getText()).then(copyInfo.success, function () {
                    // try the fallback in case `writeText` didn't work
                    fallbackCopyTextToClipboard(copyInfo);
                });
            } else {
                fallbackCopyTextToClipboard(copyInfo);
            }
        }

        function selectElementText(element) {
            window.getSelection().selectAllChildren(element);
        }

        function getSettings(startElement) {
            var settings = {
                'copy': 'Copy',
                'copy-error': 'Press Ctrl+C to copy',
                'copy-success': 'Copied!',
                'copy-timeout': 5000
            };

            var prefix = 'data-prismjs-';
            for (var key in settings) {
                var attr = prefix + key;
                var element = startElement;
                while (element && !element.hasAttribute(attr)) {
                    element = element.parentElement;
                }
                if (element) {
                    settings[key] = element.getAttribute(attr);
                }
            }
            return settings;
        }

        // —— 这里开始挂钩 toolbar，注入复制/折叠/底部按钮 ——
        var r = Prism.plugins.toolbar.hook = function (a) {
            // r 是 <pre>，toolbar 是其紧邻工具条
            var r = a.element.parentNode;
            var toolbar = r.nextElementSibling;

            // 标题与分割线
            isEnableTitle && toolbar.classList.add("c-title")
            isEnableHr && toolbar.classList.add("c-hr")

            // 自定义工具容器（右上角）
            var customItem = document.createElement("div");
            customItem.className = 'custom-item absolute top-0'

            // 复制
            var copy;
            if (isEnableCopy) {
                copy = document.createElement("i");
                copy.className = 'haofont hao-icon-paste copy-button code-copy cursor-pointer'
                customItem.appendChild(copy)

                copy.addEventListener('click', function () {
                    copyTextToClipboard({
                        getText: function () {
                            return a.element.textContent;
                        },
                        success: function () {
                            btf.snackbarShow('复制成功')
                            setState('copy-success');
                            resetText();
                        },
                        error: function () {
                            setState('copy-error');
                            setTimeout(function () {
                                selectElementText(a.element);
                            }, 1);
                            resetText();
                        }
                    });
                });
            }

            // 顶部折叠/展开逻辑与底部按钮共用
            let expander;
            const prismToolsFn = function () {
                toggleExpand();
            };

            if (isEnableExpander) {
                expander = document.createElement("i");
                expander.className = 'fa-sharp fa-solid haofont hao-icon-angle-left code-expander cursor-pointer'
                customItem.appendChild(expander)
                expander.addEventListener('click', prismToolsFn)
            }

            // —— 新的底部“展开/收起”按钮（插在代码块之后，不遮挡代码） ——
            let bottomBtn;

            // 设置为“限制高度”状态
            function setLimited() {
                r.classList.remove('expand-done');
                r.style.maxHeight = LIMIT + 'px';
                r.style.overflow = 'hidden';
                if (bottomBtn) {
                    bottomBtn.classList.remove('expand-done');
                    // 保持向下图标，展开时通过 .expand-done 旋转，不切换类名
                    // if (i) i.className = 'haofont hao-icon-angle-double-down';
                    bottomBtn.style.display = 'flex';
                }
                if (expander) {
                    expander.classList.remove('hao-icon-angle-down');
                    expander.classList.add('hao-icon-angle-left');
                }
            }

            // 设置为“完全展开”状态
            function setExpanded() {
                r.classList.add('expand-done');
                r.style.maxHeight = 'none';
                r.style.overflow = 'visible';
                if (bottomBtn) {
                    bottomBtn.classList.add('expand-done'); // 旋转“向上”
                    // 保持向下图标，展开时通过 .expand-done 旋转，不切换类名
                    // if (i) i.className = 'haofont hao-icon-angle-double-up';
                    bottomBtn.style.display = 'flex';
                }
                if (expander) {
                    expander.classList.remove('hao-icon-angle-left');
                    expander.classList.add('hao-icon-angle-down');
                }
            }

            function toggleExpand() {
                if (r.classList.contains('expand-done')) setLimited();
                else setExpanded();
            }

            // 先清理老按钮，避免重复（包括容器内和相邻兄弟节点）
            r.querySelectorAll('.code-expand-btn').forEach(el => el.remove());
            let sib = r.nextElementSibling;
            while (sib && sib.classList && sib.classList.contains('code-expand-btn')) {
                sib.remove();
                sib = r.nextElementSibling;
            }

            // 仅当高度超过限制时才渲染底部按钮与限制高度
            const needLimit = isEnableHeightLimit && r.scrollHeight > LIMIT;
            if (needLimit) {
                // 默认限制高度
                setLimited();

                // 按钮插在代码块“后面”，避免遮挡最后一行
                bottomBtn = document.createElement("div");
                bottomBtn.className = "code-expand-btn";
                bottomBtn.innerHTML = '<i class="haofont hao-icon-angle-double-down"></i>';
                r.insertAdjacentElement('afterend', bottomBtn);
                bottomBtn.addEventListener("click", toggleExpand);
            } else {
                // 不需要限制：清理状态
                r.style.maxHeight = '';
                r.style.overflow = '';
                r.classList.remove('expand-done');
            }

            toolbar.appendChild(customItem)

            var settings = getSettings(a.element);

            function resetText() {
                setTimeout(function () {
                    setState('copy');
                }, settings['copy-timeout']);
            }

            /** @param {"copy" | "copy-error" | "copy-success"} state */
            function setState(state) {
                if (!copy) return;
                copy.setAttribute('data-copy-state', state);
            }
        };
        Prism.hooks.add("complete", r)
    },

    addScript: (e, t, n) => {
        if (document.getElementById(e))
            return n ? n() : void 0;
        let a = document.createElement("script");
        a.src = t,
            a.id = e,
        n && (a.onload = n),
            document.head.appendChild(a)
    },

    danmu: () => {
        const e = new EasyDanmakuMin({
            el: "#danmu",
            line: 10,
            speed: 20,
            hover: !0,
            loop: !0
        });
        let t = saveToLocal.get("danmu");
        if (t)
            e.batchSend(t, !0);
        else {
            let n = [];
            if (GLOBAL_CONFIG.source.comments.use == 'Twikoo') {
                fetch(GLOBAL_CONFIG.source.twikoo.twikooUrl, {
                    method: "POST",
                    body: JSON.stringify({
                        event: "GET_RECENT_COMMENTS",
                        accessToken: GLOBAL_CONFIG.source.twikoo.accessToken,
                        includeReply: !1,
                        pageSize: 5
                    }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then((e => e.json())).then((({data: t}) => {
                        t.forEach((e => {
                                null == e.avatar && (e.avatar = "https://cravatar.cn/avatar/d615d5793929e8c7d70eab5f00f7f5f1?d=mp"),
                                    n.push({
                                        avatar: e.avatar,
                                        content: e.nick + "：" + btf.changeContent(e.comment),
                                        href: e.url + '#' + e.id

                                    })
                            }
                        )),
                            e.batchSend(n, !0),
                            saveToLocal.set("danmu", n, .02)
                    }
                ))
            }
            if (GLOBAL_CONFIG.source.comments.use == 'Artalk') {
                const statheaderList = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Origin': window.location.origin
                    },
                    body: new URLSearchParams({
                        'site_name': GLOBAL_CONFIG.source.artalk.siteName,
                        'limit': '100',
                        'type': 'latest_comments'
                    })
                }
                fetch(GLOBAL_CONFIG.source.artalk.artalkUrl + 'api/stat', statheaderList)
                    .then((e => e.json())).then((({data: t}) => {
                        t.forEach((e => {
                                n.push({
                                    avatar: 'https://cravatar.cn/avatar/' + e.email_encrypted + '?d=mp&s=240',
                                    content: e.nick + "：" + btf.changeContent(e.content_marked),
                                    href: e.page_url + '#atk-comment-' + e.id

                                })
                            }
                        )),
                            e.batchSend(n, !0),
                            saveToLocal.set("danmu", n, .02)
                    }
                ))
            }
            if (GLOBAL_CONFIG.source.comments.use == 'Waline') {
                const loadWaline = () => {
                    Waline.RecentComments({
                        serverURL: GLOBAL_CONFIG.source.waline.serverURL,
                        count: 50
                    }).then(({comments}) => {
                        const walineArray = comments.map(e => {
                            return {
                                'content': e.nick + "：" + btf.changeContent(e.comment),
                                'avatar': e.avatar,
                                'href': e.url + '#' + e.objectId,
                            }
                        })
                        e.batchSend(walineArray, !0),
                            saveToLocal.set("danmu", walineArray, .02)
                    })
                }
                if (typeof Waline === 'object') loadWaline()
                else getScript(GLOBAL_CONFIG.source.waline.js).then(loadWaline)
            }

        }
        document.getElementById("danmuBtn").innerHTML = "<button class=\"hideBtn\" onclick=\"document.getElementById('danmu').classList.remove('hidedanmu')\">显示弹幕</button> <button class=\"hideBtn\" onclick=\"document.getElementById('danmu').classList.add('hidedanmu')\">隐藏弹幕</button>"
    },

    changeMarginLeft(element) {
        var randomMargin = Math.floor(Math.random() * 901) + 100; // 生成100-1000之间的随机数
        element.style.marginLeft = randomMargin + 'px';
    },

    getTopSponsors() {
        var user_id = GLOBAL_CONFIG.source.power.userId
        var show_num = GLOBAL_CONFIG.source.power.showNum

        function getPower() {
            const url = GLOBAL_CONFIG.source.power.url + user_id
            fetch(url)
                .then(res => res.json())
                .then(data => {
                    if (200 === data["ec"]) {
                        var values = data["data"]["list"]
                        saveToLocal.set('power-data', JSON.stringify(values), 10 / (60 * 24))
                        renderer(values);
                    }

                })
        }

        function renderer(values) {
            var data = getArrayItems(values, 1);
            let powerStar = document.getElementById("power-star")
            if (values.length === 0) {
                powerStar.href = GLOBAL_CONFIG.source.power.powerLink
                powerStar.innerHTML = ` 
                        <div id="power-star-image" style="background-image: url('/themes/theme-hao/assets/images/afadian/afadian.webp')">
                        </div>
                        <div class="power-star-body">
                            <div id="power-star-title">还没有人赞助～</div>
                            <div id="power-star-desc">为爱发电，点击赞助</div>
                        </div>`;
            } else {
                if (powerStar) {
                    powerStar.href = "https://afdian.net/u/" + data[0].user_id
                    powerStar.innerHTML = ` 
                        <div id="power-star-image" style="background-image: url(${data[0].avatar})">
                        </div>
                        <div class="power-star-body">
                            <div id="power-star-title">${data[0].name}</div>
                            <div id="power-star-desc">更多支持，为爱发电</div>
                        </div>`;
                }

                if (values.length > 1) {
                    var i = 0;
                    var htmlText = '';
                    for (let value of values) {
                        if (i > parseInt(show_num)) {
                            break;
                        }
                        htmlText += ` <a href="${"https://afdian.net/u/" + value["user_id"]}" rel="external nofollow" target="_blank" th:title="${value["name"]}">${value["name"]}</a>`;
                        i = i + 1;
                    }
                    if (document.getElementById("power-item-link")) {
                        document.getElementById("power-item-link").innerHTML = htmlText;
                    }
                }
            }
        }

        function init() {
            const data = saveToLocal.get('power-data')
            if (data) {
                renderer(JSON.parse(data))
            } else {
                getPower()
            }
        }

        document.getElementById("power-star") && init()
    },

    checkAd() {
        var default_enable = GLOBAL_CONFIG.source.footer.default_enable
        if (default_enable) {
            var adElement = document.getElementById("footer-banner");
            var notMusic = document.body.getAttribute("data-type") != "music"; // 检测是否为音乐页面
            if ((adElement.offsetWidth <= 0 || adElement.offsetHeight <= 0) && notMusic) {
                // 元素不可见，可能被拦截
                console.log("Element may be blocked by AdBlocker Ultimate");
                alert("页脚信息可能被AdBlocker Ultimate拦截，请检查广告拦截插件！")
            }
        }
    }
};

/* === 复制本文链接（挂到文章底部分享区的“链条图标”，支持 PJAX）=== */
(function () {
  function mountCopyOnShareLink() {
    if (typeof ClipboardJS === 'undefined') return;

    // 清理旧实例，避免 PJAX 叠加
    if (window.__shareLinkCopy__) {
      window.__shareLinkCopy__.destroy();
      window.__shareLinkCopy__ = null;
    }

    window.__shareLinkCopy__ = new ClipboardJS('.share-link .haofont.hao-icon-link', {
      text: () => location.href.split('#')[0]
    });

    const ok = () => (window.btf && btf.snackbarShow) ? btf.snackbarShow('链接已复制') : console.log('copied');
    window.__shareLinkCopy__.on('success', ok);
    window.__shareLinkCopy__.on('error', () => {
      try {
        const t = document.createElement('textarea');
        t.value = location.href.split('#')[0];
        t.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
        document.body.appendChild(t); t.select();
        document.execCommand('copy'); document.body.removeChild(t);
        ok();
      } catch (_) {}
    });
  }

  // 首屏 & PJAX 完成后都挂载
  window.addEventListener('load', mountCopyOnShareLink);
  document.addEventListener('pjax:complete', mountCopyOnShareLink);
  document.addEventListener('page:loaded', mountCopyOnShareLink);
})();

/* === Prism 主题同步（轻量版，仅在加载/ PJAX 完成时触发，不监听、不延迟） === */
(function () {
  function applyCodeTheme() {
    try {
      if (window.halo && typeof halo.dataCodeTheme === 'function') {
        halo.dataCodeTheme();
      }
    } catch (e) {}
  }
  window.addEventListener('load', applyCodeTheme, { once: false });
  document.addEventListener('page:loaded', applyCodeTheme, { once: false });
  document.addEventListener('pjax:complete', applyCodeTheme, { once: false });
})();
/* 代码块底部展开按钮：日间/夜间两套颜色 */
/* ——日间（浅色模式）—— */
:root[data-theme="light"] #article-container .code-expand-btn,
:root[data-theme="light"] #post-comment .code-expand-btn{
  background: #0075eaff !important;          /* 改这里：日间背景色 */
  border-top: 1px solid #e5e7eb !important; /* 可选：分隔线颜色 */
}
:root[data-theme="light"] .code-expand-btn i{
  color: #2563eb !important;                /* 改这里：日间图标颜色 */
}
:root[data-theme="light"] #article-container .code-expand-btn:hover,
:root[data-theme="light"] #post-comment .code-expand-btn:hover{
  background: #0135e0ff !important;           /* 可选：日间悬停背景 */
}

/* ——夜间（深色模式）—— */
:root[data-theme="dark"] #article-container .code-expand-btn,
:root[data-theme="dark"] #post-comment .code-expand-btn{
  background: rgba(255, 12, 12, 0.05) !important;   /* 改这里：夜间背景色 */
  border-top: 1px solid rgba(148,163,184,.15) !important; /* 可选：分隔线 */
}
:root[data-theme="dark"] .code-expand-btn i{
  color: #70fa07ff !important;                       /* 改这里：夜间图标颜色 */
}
:root[data-theme="dark"] #article-container .code-expand-btn:hover,
:root[data-theme="dark"] #post-comment .code-expand-btn:hover{
  background: rgba(12, 108, 225, 0.88) !important;     /* 可选：夜间悬停背景 */
}
