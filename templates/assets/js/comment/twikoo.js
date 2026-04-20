<th:block  th:if="${#strings.equals(theme.config.comments.use, 'Twikoo') &&
not #strings.isEmpty(theme.config.comments.twikoos.envId)}">
    <div class="js-pjax">
        <script th:src="${assets_link + '/js/comment/twikoo.js'}"></script>
    </div>
    <script>
        window.addEventListener('load', () => {
            const getComment = () => {
                const runTwikoo = () => {
                    twikoo.getRecentComments({
                        envId: "[(${theme.config.comments.twikoos.envId})]",
                        region: '',
                        pageSize: 20,
                        includeReply: true
                    }).then(async function (res) {
                        // 并行处理所有评论的昵称获取
                        const twikooArray = await Promise.all(res.map(async (e) => {
                            let displayNick = e.nick; // 默认使用 Twikoo 存储的昵称
                            
                            // 尝试从邮箱提取 QQ 号
                            const qqMatch = e.mail ? e.mail.match(/^(\d+)@qq\.com$/i) : null;
                            
                            if (qqMatch) {
                                const qqNumber = qqMatch[1];
                                try {
                                    // 调用你指定的 API 接口
                                    const apiRes = await fetch(`https://api.xcvts.cn/api/qq_info?apiKey=fd13b4ace0f0f4071d08d618b09ed9f1&qq=${qqNumber}`);
                                    const apiJson = await apiRes.json();
                                    
                                    // 如果接口返回成功，则替换昵称
                                    if (apiJson.code === 200 && apiJson.data && apiJson.data.nickname) {
                                        displayNick = apiJson.data.nickname;
                                    }
                                } catch (err) {
                                    console.warn("QQ API 暂时无法连接，使用原始昵称");
                                }
                            }

                            return {
                                'content': btf.changeContent(e.comment, 150),
                                'avatar': e.avatar,
                                'nick': displayNick,
                                'url': e.url + '#' + e.id,
                                'date': new Date(e.created).toISOString()
                            }
                        }));

                        // 将处理后的数据存入本地缓存 (10分钟)
                        saveToLocal.set('twikoo-newest-comments', JSON.stringify(twikooArray), 10 / (60 * 24))
                        generateHtml(twikooArray)
                        document.querySelector('#newcomm') && necommHtml(twikooArray)
                    }).catch(function (err) {
                        console.error("Twikoo 加载失败: ", err);
                        const $dom = document.querySelector('#card-newest-comments .aside-list')
                        const $newcomm = document.querySelector('#newcomm')
                        if ($dom) $dom.innerHTML = "无法获取评论，请确认相关配置是否正确"
                        if ($newcomm) $newcomm.innerHTML = "无法获取评论，请确认相关配置是否正确"
                    })
                }

                if (typeof twikoo === 'object') {
                    runTwikoo()
                } else {
                    getScript(GLOBAL_CONFIG.source.twikoo.js).then(runTwikoo)
                }
            }

            const generateHtml = array => {
                let result = ''
                if (array.length) {
                    for (let i = 0; i < array.length; i++) {
                        if (i == 6) break;
                        let name = [[${isLazyload}]] ? 'data-lazy-src' : 'src';
                        
                        result += `<div class='aside-list-item'>
                            <a href='${array[i].url}' class='thumbnail'>
                                <img ${name}='${array[i].avatar}' alt='${array[i].nick}'>
                                <div class='name'><span>${array[i].nick}</span></div>
                            </a>
                            <div class='content'>
                                <a class='comment' href='${array[i].url}' title='${array[i].content}'>${array[i].content}</a>
                                <time datetime="${array[i].date}">${btf.diffDate(array[i].date, true)}</time>
                            </div>
                        </div>`
                    }
                } else {
                    result += '没有评论'
                }

                let $dom = document.querySelector('#card-newest-comments .aside-list')
                if ($dom) {
                    $dom.innerHTML = result
                    window.lazyLoadInstance && window.lazyLoadInstance.update()
                    window.pjax && window.pjax.refresh($dom)
                }
            }

            const necommHtml = array => {
                let result = ''
                const pagesize = [[${theme.config.sidebar.newcomment.newcommentnumber}]];
                const finalpagesize = pagesize <= 0 ? 5 : pagesize;

                if (array.length) {
                    for (let i = 0; i < array.length; i++) {
                        if (i == finalpagesize) break;
                        let name = [[${isLazyload}]] ? 'data-lazy-src' : 'src';
                        
                        result += `<div class="aside-list-item">
                            <a class="thumbnail" href="${array[i].url}">
                                <img alt="${array[i].nick}" ${name}="${array[i].avatar}">
                            </a>
                            <div class="content">
                                <a class="comment" style="display: -webkit-box;-webkit-line-clamp: 2;-webkit-box-orient: vertical;overflow: hidden;"
                                   href="${array[i].url}" title="${array[i].content}">
                                   ${array[i].content}
                                </a>
                                <div class="name">
                                    <span>${array[i].nick} / </span>
                                    <time datetime="${array[i].date}">${btf.diffDate(array[i].date, true)}</time>
                                </div>
                            </div>
                        </div>`
                    }
                } else {
                    result += '没有评论'
                }

                let $dom = document.querySelector('#newcomm')
                if ($dom) {
                    $dom.innerHTML = result
                    window.lazyLoadInstance && window.lazyLoadInstance.update()
                    window.pjax && window.pjax.refresh($dom)
                }
            }

            const newestCommentInit = () => {
                if (document.querySelector('#card-newest-comments .aside-list') || document.querySelector('#newcomm')) {
                    const data = saveToLocal.get('twikoo-newest-comments')
                    if (data) {
                        const parsedData = JSON.parse(data)
                        generateHtml(parsedData)
                        document.querySelector('#newcomm') && necommHtml(parsedData)
                    } else {
                        getComment()
                    }
                }
            }

            newestCommentInit()
            document.addEventListener('pjax:complete', newestCommentInit)
        })
    </script>
</th:block>