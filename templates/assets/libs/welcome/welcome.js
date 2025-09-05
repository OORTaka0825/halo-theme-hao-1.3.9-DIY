// 访客欢迎信息模块（NSMAO） —— PJAX安全版
let ipLocation;

// 统一：实时读取后台配置（避免被“常量缓存”）
function getWelcomeCenter() {
  const cfg = (window.GLOBAL_CONFIG && GLOBAL_CONFIG.source && GLOBAL_CONFIG.source.welcome) ? GLOBAL_CONFIG.source.welcome : {};
  const lng = Number(cfg.locationLng);
  const lat = Number(cfg.locationLat);
  return {
    // 只在不是数字的情况下才回落到默认值，避免 0 被当成“假值”
    lng: Number.isFinite(lng) ? lng : 116.703781,
    lat: Number.isFinite(lat) ? lat : 39.927334
  };
}

// 计算两点间距离
function getDistance(e1, n1, e2, n2) {
  const R = 6371;
  const { sin, cos, asin, PI, hypot } = Math;
  const getPoint = (e, n) => {
    e *= PI / 180; n *= PI / 180;
    return { x: cos(n) * cos(e), y: cos(n) * sin(e), z: sin(n) };
  };
  const a = getPoint(e1, n1);
  const b = getPoint(e2, n2);
  const c = hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  return Math.round(asin(c / 2) * 2 * R);
}

// 获取 IP 定位信息
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

// 展示欢迎语（每次都“实时”拿后台中心点）
function showWelcome() {
  if (!ipLocation) return;

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

    switch (province) {
      case "北京市": desc = "北——京——欢迎你~"; break;
      case "天津市": desc = "讲段相声吧"; break;
      case "河北省": desc = "山势巍巍成壁垒，天下雄关铁马金戈由此向，无限江山"; break;
      case "江苏省":
        switch (city) {
          case "南京市": desc = "这是我挺想去的城市啦"; break;
          case "苏州市": desc = "上有天堂，下有苏杭"; break;
          default: desc = "散装是必须要散装的"; break;
        }
        break;
      case "广东省":
        switch (city) {
          case "广州市": desc = "看小蛮腰，喝早茶了嘛~"; break;
          case "深圳市": desc = "今天你逛商场了嘛~"; break;
          case "阳江市": desc = "阳春合水！博主家乡~ 欢迎来玩~"; break;
          default: desc = "来两斤福建人~"; break;
        }
        break;
      case "河南省":
        switch (city) {
          case "郑州市": desc = "豫州之域，天地之中"; break;
          case "南阳市": desc = "臣本布衣，躬耕于南阳，此南阳非彼南阳！"; break;
          case "驻马店市": desc = "峰峰有奇石，石石挟仙气嵖岈山的花很美哦！"; break;
          case "开封市": desc = "刚正不阿包青天"; break;
          case "洛阳市": desc = "洛阳牡丹甲天下"; break;
          default: desc = "可否带我品尝河南烩面啦？"; break;
        }
        break;
      // ……其余省份略（保持你原来的文案表）
      case "湖南省": desc = "74751，长沙斯塔克"; break;
      case "四川省": desc = "康康川妹子"; break;
      case "广西壮族自治区": desc = "桂林山水甲天下"; break;
      case "新疆维吾尔自治区": desc = "驼铃古道丝绸路，胡马犹闻唐汉风"; break;
      case "香港特别行政区": desc = "永定贼有残留地鬼嚎，迎击光非岁玉"; break;
      default: desc = `来自 ${city} 的小伙伴你好呀~`;
    }
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

  const html = ` <b><span style="color: var(--kouseki-ip-color);font-size: var(--kouseki-gl-size)">${pos}</span></b> 的小友💖<br>${desc}🍂<br>当前位置距博主约 <b><span style="color: var(--kouseki-ip-color)">${dist}</span></b> 公里！<br>您的IP地址为：<b><span>${ip}</span></b><br>${greet} <br>`;
  try { document.getElementById("welcome-info").innerHTML = html; }
  catch (err) { console.log("欢迎模块插入失败:", err); }
}

// 页面加载与 PJAX 兼容
window.addEventListener('load', function () {
  try { fetchIpLocation && fetchIpLocation(); } catch (e) {}
});

// PJAX：优先用现成的 ipLocation 立刻重算一次，再拉取最新数据
function pjaxRecalc() {
  try { if (ipLocation) showWelcome(); } catch (e) {}
  try { fetchIpLocation && fetchIpLocation(); } catch (e) {}
}
document.addEventListener('pjax:complete', pjaxRecalc);
document.addEventListener('pjax:success',  pjaxRecalc);
document.addEventListener('page:loaded',    pjaxRecalc);

// ---- welcome.js 末尾：统一触发器（首屏 + PJAX）----
(function () {
  if (window.__WELCOME_BIND_ONCE__) return;      // ★ 防重复
  window.__WELCOME_BIND_ONCE__ = true;

  function pjaxRecalc() {
    try { window.showWelcome && window.showWelcome(); } catch (e) {}
    try { window.fetchIpLocation && window.fetchIpLocation(); } catch (e) {}
  }

  // 首次加载
  window.addEventListener('load', function () {
    try { window.fetchIpLocation && window.fetchIpLocation(); } catch (e) {}
  });

  // PJAX 回来时
  document.addEventListener('pjax:complete', pjaxRecalc);
  document.addEventListener('pjax:success',  pjaxRecalc);
  document.addEventListener('page:loaded',   pjaxRecalc);
})();