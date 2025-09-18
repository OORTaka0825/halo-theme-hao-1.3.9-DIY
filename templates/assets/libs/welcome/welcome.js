// 访客欢迎信息模块（NSMAO） —— PJAX安全版
let ipLocation;

// 默认中心点
const WELCOME_DEFAULT_CENTER = { lng: 111.64, lat: 21.54 };

function getWelcomeCenter() {
  const cfg = (window.GLOBAL_CONFIG && GLOBAL_CONFIG.source && GLOBAL_CONFIG.source.welcome)
    ? GLOBAL_CONFIG.source.welcome : {};
  const rawLng = (cfg.locationLng ?? '').toString().trim();
  const rawLat = (cfg.locationLat ?? '').toString().trim();
  const lng = rawLng === '' ? NaN : Number(rawLng);
  const lat = rawLat === '' ? NaN : Number(rawLat);
  return {
    lng: Number.isFinite(lng) ? lng : WELCOME_DEFAULT_CENTER.lng,
    lat: Number.isFinite(lat) ? lat : WELCOME_DEFAULT_CENTER.lat
  };
}

function getDistance(e1, n1, e2, n2) {
  const R = 6371;
  const { sin, cos, asin, PI, hypot } = Math;
  const P = (e, n) => { e*=PI/180; n*=PI/180; return {x:cos(n)*cos(e), y:cos(n)*sin(e), z:sin(n)}; };
  const a = P(e1,n1), b = P(e2,n2);
  const c = hypot(a.x-b.x, a.y-b.y, a.z-b.z);
  return Math.round(asin(c/2) * 2 * R);
}

function fetchIpLocation() {
  $.ajax({
    type: 'get',
    url: 'https://api.nsmao.net/api/ip/query',
    data: { key: (GLOBAL_CONFIG?.source?.welcome?.key || "") },
    dataType: 'json',
    success: function (res) {
      if (res.code !== 200) return;
      ipLocation = {
        ip: res.data.ip,
        location: { lat: res.data.lat, lng: res.data.lng },
        ad_info: {
          nation: res.data.country,
          province: res.data.prov || "",
          city: res.data.city || "",
          district: res.data.district || ""
        }
      };
      showWelcome();
    }
  });
}

function showWelcome() {
  if (!ipLocation) return;
  var box = document.getElementById('welcome-info');
  if (!box) return;

  const { lng: myLng, lat: myLat } = getWelcomeCenter();
  const dist = getDistance(myLng, myLat, ipLocation.location.lng, ipLocation.location.lat);

  let pos = ipLocation.ad_info.nation;
  let ip = ipLocation.ip;
  let desc = '带我去你的城市逛逛吧！';

  if (pos === "中国") {
    const province = ipLocation.ad_info.province || "";
    const city = ipLocation.ad_info.city || "";
    const district = ipLocation.ad_info.district || "";
    pos = `${province} ${city} ${district}`.trim();
    // ……（你原来的省市文案分支保持不变）
  } else {
    switch (pos) {
      case "日本": desc = "よろしく，一起去看樱花吗"; break;
      case "美国": desc = "Let us live in peace!"; break;
      case "英国": desc = "想同你一起夜乘伦敦眼"; break;
      case "俄罗斯": desc = "干了这瓶伏特加！"; break;
      case "法国": desc = "C'est La Vie"; break;
      case "德国": desc = "Die Zeit verging im Fluge."; break;
      case "澳大利亚": desc = "一起去大堡礁吧！"; break;
      case "加拿大": desc = "拾起一片枫叶赠予你"; break;
      default: desc = "带我去你的国家逛逛吧";
    }
    pos = "来自 " + pos + " 的朋友";
  }

  const hour = new Date().getHours();
  let greet = "夜深了，早点休息~";
  if (hour >= 5 && hour < 11) greet = "🌤️ 早上好，一日之计在于晨";
  else if (hour >= 11 && hour < 13) greet = "☀️ 中午好，记得午休喔~";
  else if (hour >= 13 && hour < 17) greet = "🕞 下午好，饮茶先啦！";
  else if (hour >= 17 && hour < 19) greet = "🚶‍♂️ 即将下班，记得按时吃饭~";
  else if (hour >= 19 && hour < 24) greet = "🌙 晚上好，夜生活嗨起来！";

  if (ip.includes(":")) ip = "好复杂，咱看不懂~(ipv6)";

  /* ★ 关键改动：真实 IP 文本常驻，用 .ip-blur 做模糊白雾 */
  const html = `欢迎来自 <b><span style="color: var(--kouseki-ip-color);">${pos}</span></b> 的小友 💖<br>
    ${desc}🍂<br>
    当前位置距博主约 <b><span style="color: var(--kouseki-ip-color)">${dist}</span></b> 公里！<br>
    您的IP地址为：<b><span class="ip-blur" title="悬停/点击显示">${ip}</span></b><br>
    ${greet} <br>`;

  box.innerHTML = html;

  // 触屏/键盘可切换显示
  try {
    var ipNode = box.querySelector('.ip-blur');
    if (ipNode) {
      ipNode.setAttribute('tabindex','0');
      ipNode.addEventListener('click', function(){ ipNode.classList.toggle('reveal'); });
      ipNode.addEventListener('keydown', function(e){
        if(e.key==='Enter' || e.key===' '){
          e.preventDefault();
          ipNode.classList.toggle('reveal');
        }
      });
    }
  } catch(e) {}
}

// 首次与 PJAX 触发
(function () {
  if (window.__WELCOME_BIND_ONCE__) return;
  window.__WELCOME_BIND_ONCE__ = true;

  function pjaxRecalc() {
    var box = document.getElementById('welcome-info');
    if (!box) return;
    try { window.showWelcome && window.showWelcome(); } catch (e) {}
    try { window.fetchIpLocation && window.fetchIpLocation(); } catch (e) {}
  }

  window.addEventListener('load', function () {
    try { window.fetchIpLocation && window.fetchIpLocation(); } catch (e) {}
  });

  document.addEventListener('pjax:complete', pjaxRecalc);
  document.addEventListener('pjax:success',  pjaxRecalc);
  document.addEventListener('page:loaded',   pjaxRecalc);
})();
