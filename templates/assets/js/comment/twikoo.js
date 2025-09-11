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

<script id="nsmao-qqnick-patch" data-pjax>
(function(){
  if (window.__nsmaoQQNickPatched__) return; // 防重复绑定
  window.__nsmaoQQNickPatched__ = true;

  const KEY = '75gKybFM054DarMUAvMaVVtZjb';

  function pickName(d){
    try {
      // 兼容多种返回结构
      return d?.data?.name || d?.data?.nickname || d?.nickname ||
             d?.qqinfo?.nickname || d?.data?.qqInfo?.nickname || '';
    } catch(e){ return ''; }
  }

  async function fetchNick(qq){
    try{
      const r = await fetch(`https://api.nsmao.net/api/qq/v1/query?key=${KEY}&qq=${qq}`, {cache:'no-store', credentials:'omit'});
      const j = await r.json();
      return pickName(j);
    }catch(e){ return ''; }
  }

  async function tryFill(form){
    const nick = form.querySelector('input[name="nick"], input[placeholder*="昵称"], input[placeholder*="nick"]');
    const mail = form.querySelector('input[name="mail"], input[type="email"]');
    if(!nick) return;
    const v = (nick.value||'').trim();
    const m = v.match(/^\d{5,11}$/);       // QQ 号：5-11 位数字
    if(!m) return;
    const qq = m[0];
    const name = await fetchNick(qq);
    if(name){
      nick.value = name;
      nick.dispatchEvent(new Event('input',{bubbles:true}));
      if(mail && !mail.value){
        mail.value = qq + '@qq.com';
        mail.dispatchEvent(new Event('input',{bubbles:true}));
      }
    }
  }

<script id="nsmao-qqnick-patch" data-pjax>
(function(){
  if (window.__nsmaoQQNickPatched__) return; // 防重复绑定
  window.__nsmaoQQNickPatched__ = true;

  const KEY = '75gKybFM054DarMUAvMaVVtZjb';

  function pickName(d){
    try {
      // 兼容多种返回结构
      return d?.data?.name || d?.data?.nickname || d?.nickname ||
             d?.qqinfo?.nickname || d?.data?.qqInfo?.nickname || '';
    } catch(e){ return ''; }
  }

  async function fetchNick(qq){
    try{
      const r = await fetch(`https://api.nsmao.net/api/qq/v1/query?key=${KEY}&qq=${qq}`, {cache:'no-store', credentials:'omit'});
      const j = await r.json();
      return pickName(j);
    }catch(e){ return ''; }
  }

  async function tryFill(form){
    const nick = form.querySelector('input[name="nick"], input[placeholder*="昵称"], input[placeholder*="nick"]');
    const mail = form.querySelector('input[name="mail"], input[type="email"]');
    if(!nick) return;
    const v = (nick.value||'').trim();
    const m = v.match(/^\d{5,11}$/);       // QQ 号：5-11 位数字
    if(!m) return;
    const qq = m[0];
    const name = await fetchNick(qq);
    if(name){
      nick.value = name;
      nick.dispatchEvent(new Event('input',{bubbles:true}));
      if(mail && !mail.value){
        mail.value = qq + '@qq.com';
        mail.dispatchEvent(new Event('input',{bubbles:true}));
      }
    }
  }

<script id="nsmao-qqnick-patch" data-pjax>
(function(){
  if (window.__nsmaoQQNickPatched__) return; // 防重复绑定
  window.__nsmaoQQNickPatched__ = true;

  const KEY = '75gKybFM054DarMUAvMaVVtZjb';

  function pickName(d){
    try {
      // 兼容多种返回结构
      return d?.data?.name || d?.data?.nickname || d?.nickname ||
             d?.qqinfo?.nickname || d?.data?.qqInfo?.nickname || '';
    } catch(e){ return ''; }
  }

  async function fetchNick(qq){
    try{
      const r = await fetch(`https://api.nsmao.net/api/qq/v1/query?key=${KEY}&qq=${qq}`, {cache:'no-store', credentials:'omit'});
      const j = await r.json();
      return pickName(j);
    }catch(e){ return ''; }
  }

  async function tryFill(form){
    const nick = form.querySelector('input[name="nick"], input[placeholder*="昵称"], input[placeholder*="nick"]');
    const mail = form.querySelector('input[name="mail"], input[type="email"]');
    if(!nick) return;
    const v = (nick.value||'').trim();
    const m = v.match(/^\d{5,11}$/);       // QQ 号：5-11 位数字
    if(!m) return;
    const qq = m[0];
    const name = await fetchNick(qq);
    if(name){
      nick.value = name;
      nick.dispatchEvent(new Event('input',{bubbles:true}));
      if(mail && !mail.value){
        mail.value = qq + '@qq.com';
        mail.dispatchEvent(new Event('input',{bubbles:true}));
      }
    }
  }

  function bind(){
    const box = document.getElementById('twikoo');
    if(!box) return;
    // 评论表单渲染后再做一次兜底
    setTimeout(()=>tryFill(box), 800);
    // 在昵称输入框失焦时尝试回填
    box.addEventListener('blur', (e)=>{
      if(e.target && e.target.matches('input[name="nick"], input[placeholder*="昵称"], input[placeholder*="nick"]')){
        tryFill(box);
      }
    }, true);
  }

  if (document.readyState !== 'loading') bind();
  else document.addEventListener('DOMContentLoaded', bind);

  // PJAX 下二次进入页面也能重新绑定
  document.addEventListener('pjax:complete', bind);
})();
</script>