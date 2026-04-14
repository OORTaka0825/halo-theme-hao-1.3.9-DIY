// 访客欢迎信息模块（适配 Cloudflare Worker 版） —— PJAX安全版
let ipLocation;

// 默认中心点（博主位置）
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
  let myUrl = (GLOBAL_CONFIG?.source?.welcome?.key || "").trim();

  if (!myUrl.startsWith('http')) {
    myUrl = 'https://api.nsmao.net/api/ip/query?key=' + myUrl;
  }

  $.ajax({
    type: 'get',
    url: myUrl,
    dataType: 'json',
    success: function (res) {
      const d = res.data || res; 
      if (res.code === 200 || res.status === "success" || d.ip) {
        ipLocation = {
          ip: d.ip || d.query,
          location: { 
            lat: parseFloat(d.lat) || 0, 
            lng: parseFloat(d.lng) || parseFloat(d.lon) || 0 
          },
          ad_info: {
            // 适配你现在的 JSON 结构
            nation: d.country || "外国",
            province: d.prov || d.region || "",
            city: d.city || "",
            district: d.district || ""
          }
        };
        showWelcome();
      }
    }
  });
}

function showWelcome() {
  if (!ipLocation) return;
  var box = document.getElementById('welcome-info');
  if (!box) return;

  const { lng: myLng, lat: myLat } = getWelcomeCenter();
  const dist = getDistance(myLng, myLat, ipLocation.location.lng, ipLocation.location.lat);

  let nation = ipLocation.ad_info.nation;
  let prov = ipLocation.ad_info.province;
  let city = ipLocation.ad_info.city;
  let distName = ipLocation.ad_info.district;
  let ip = ipLocation.ip;
  let desc = '带我去你的城市逛逛吧！';
  let pos = "";

  // 国内逻辑：包含“中国”字样
  if (nation.includes("中国") || nation === "CN") {
    // 拼接 省+市+区
    pos = `${prov}${city}${distName}`.trim();
    
    // 使用 city 匹配文案
    switch (city) {
      case "广州市": desc = "看小蛮腰，喝早茶了嘛~"; break;
      case "深圳市": desc = "今天你逛商场了嘛~"; break;
      case "阳江市": desc = "阳春合水！博主家乡~ 欢迎来玩~"; break;
      case "郑州市": desc = "豫州之域，天地之中"; break;
      case "南阳市": desc = "臣本布衣，躬耕于南阳，此南阳非彼南阳！"; break;
      case "驻马店市": desc = "峰峰有奇石，石石挟仙气嵖岈山的花很美哦！"; break;
      case "开封市": desc = "刚正不阿包青天"; break;
      case "洛阳市": desc = "洛阳牡丹甲天下"; break;
      default: desc = `来自 ${prov}${city} 的小伙伴你好呀~`;
    }
  } else {
    // 国外显示：国家 + 城市
    pos = city ? `${nation} ${city}` : nation;
    switch (nation) {
      case "US": case "United States": case "美国": desc = "Let us live in peace!"; break;
      case "JP": case "Japan": case "日本": desc = "よろしく，一起去看樱花吗"; break;
      case "UK": case "United Kingdom": case "英国": desc = "想同你一起夜乘伦敦眼"; break;
      default: desc = "带我去你的国家逛逛吧";
    }
  }

  const hour = new Date().getHours();
  let greet = "😴 夜深了，早点休息~";
  if (hour >= 5 && hour < 11) greet = "🌤️ 早上好，一日之计在于晨";
  else if (hour >= 11 && hour < 13) greet = "☀️ 中午好，记得午休喔~";
  else if (hour >= 13 && hour < 17) greet = "🕞 下午好，饮茶先啦！";
  else if (hour >= 17 && hour < 19) greet = "🚶‍♂️ 即将下班，记得按时吃饭~";
  else if (hour >= 19 && hour < 24) greet = "🌙 晚上好，夜生活嗨起来！";

  if (ip.includes(":")) ip = "好复杂，咱看不懂~(ipv6)";

  const html = `欢迎来自 <b><span style="color: var(--kouseki-ip-color);">${pos}</span></b> 的小友 💖<br>
    ${desc}🍂<br>
    当前位置距博主约 <b><span style="color: var(--kouseki-ip-color)">${dist}</span></b> 公里！<br>
    您的IP地址为：<b><span class="ip-blur">${ip}</span></b><br>
    ${greet} <br>`;

  box.innerHTML = html;
}

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