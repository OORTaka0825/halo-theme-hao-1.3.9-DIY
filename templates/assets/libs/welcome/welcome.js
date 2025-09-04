// 访客欢迎信息模块（NSMAO）
let ipLocation;
const HAO_WELCOME_LNG = Number(GLOBAL_CONFIG?.source?.welcome?.locationLng) || 116.703781;
const HAO_WELCOME_LAT = Number(GLOBAL_CONFIG?.source?.welcome?.locationLat) || 39.927334;

// 计算两点间距离
function getDistance(e1, n1, e2, n2) {
    const R = 6371;
    const { sin, cos, asin, PI, hypot } = Math;
    let getPoint = (e, n) => {
        e *= PI / 180;
        n *= PI / 180;
        return { x: cos(n) * cos(e), y: cos(n) * sin(e), z: sin(n) };
    };
    let a = getPoint(e1, n1);
    let b = getPoint(e2, n2);
    let c = hypot(a.x - b.x, a.y - b.y, a.z - b.z);
    let r = asin(c / 2) * 2 * R;
    return Math.round(r);
}

// 获取 IP 定位信息
function fetchIpLocation() {
    $.ajax({
        type: 'get',
        url: 'https://api.nsmao.net/api/ip/query',
        data: {
            // 修改①：安全读取 key，避免未定义时报错
            key: (GLOBAL_CONFIG?.source?.welcome?.key || "")
        },
        dataType: 'json',
        success: function (res) {
            if (res.code !== 200) return;
            ipLocation = {
                ip: res.data.ip,
                location: {
                    lat: res.data.lat,
                    lng: res.data.lng
                },
                ad_info: {
                    nation: res.data.country,
                    province: res.data.prov || "",
                    city: res.data.city || "",
                    district: res.data.district
                }
            };
            showWelcome();
        }
    });
}

// 展示欢迎语
function showWelcome() {
    if (!ipLocation) return;
    const myLng = HAO_WELCOME_LNG;
    const myLat = HAO_WELCOME_LAT;
    let dist = getDistance(myLng, myLat, ipLocation.location.lng, ipLocation.location.lat);
    let pos = ipLocation.ad_info.nation;
    let ip = ipLocation.ip;
    let desc = '带我去你的城市逛逛吧！';

    if (pos === "中国") {
  const province = ipLocation.ad_info.province || "";
  const city = ipLocation.ad_info.city || "";
  const district = ipLocation.ad_info.district || "";
  pos = `${province} ${city} ${district}`.trim();

  switch (province) {
    case "北京市":
      desc = "北——京——欢迎你~";
      break;
    case "天津市":
      desc = "讲段相声吧";
      break;
    case "河北省":
      desc = "山势巍巍成壁垒，天下雄关铁马金戈由此向，无限江山";
      break;
    case "江苏省":
      switch (city) {
        case "南京市": desc = "这是我挺想去的城市啦"; break;
        case "苏州市": desc = "上有天堂，下有苏杭"; break;
        default: desc = "散装是必须要散装的"; break;  /* 修改②：把“默认”改回 JS 的 default */
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
    // 继续写其它省...
    case "湖南省": desc = "74751，长沙斯塔克"; break;
    case "四川省": desc = "康康川妹子"; break;
    case "广西壮族自治区": desc = "桂林山水甲天下"; break;
    case "新疆维吾尔自治区": desc = "驼铃古道丝绸路，胡马犹闻唐汉风"; break;
    case "香港特别行政区": desc = "永定贼有残留地鬼嚎，迎击光非岁玉"; break;
    default:
      desc = `来自 ${city} 的小伙伴你好呀~`;
  }
} else {
  // 国外 IP 处理
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

    
    let date = new Date();
    let hour = date.getHours();
    let greet = "夜深了，早点休息~";

    if (hour >= 5 && hour < 11) greet = "🌤️ 早上好，一日之计在于晨";
    else if (hour >= 11 && hour < 13) greet = "☀️ 中午好，记得午休喔~";
    else if (hour >= 13 && hour < 17) greet = "🕞 下午好，饮茶先啦！";
    else if (hour >= 17 && hour < 19) greet = "🚶‍♂️ 即将下班，记得按时吃饭~";
    else if (hour >= 19 && hour < 24) greet = "🌙 晚上好，夜生活嗨起来！";
    else if (hour >= 0 && hour < 5) greet = "夜深了，早点休息~";


    if (ip.includes(":")) ip = "好复杂，咱看不懂~(ipv6)";

    const content = ` <b><span style="color: var(--kouseki-ip-color);font-size: var(--kouseki-gl-size)">${pos}</span></b> 的小友💖<br>${desc}🍂<br>当前位置距博主约 <b><span style="color: var(--kouseki-ip-color)">${dist}</span></b> 公里！<br>您的IP地址为：<b><span>${ip}</span></b><br>${greet} <br>`;

    try {
        document.getElementById("welcome-info").innerHTML = content;
    } catch (err) {
        console.log("欢迎模块插入失败:", err);
    }
}

// === 页面加载与 PJAX 兼容（最小改动强化版） ===
// 说明：用一个稳妥的初始化函数；首次加载跑一次；每次 PJAX/Swup/Barba 完成后再跑一次。
// 如果已经拿到 ipLocation，则直接渲染；否则再请求接口。
(function () {
    function initWelcome() {
        if (ipLocation) {
            showWelcome();
        } else {
            fetchIpLocation();
        }
    }

    // 首次加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWelcome, { once: true });
    } else {
        initWelcome();
    }

    // 兼容多种 PJAX/路由库的完成事件
    ['pjax:complete', 'pjax:end', 'pjax:success', 'swup:contentReplaced', 'barba:after']
        .forEach(evt => {
            document.addEventListener(evt, () => setTimeout(initWelcome, 0));
        });
})();

