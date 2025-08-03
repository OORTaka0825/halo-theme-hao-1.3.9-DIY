
// 访客欢迎信息模块（NSMAO）
let ipLocation;

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
            key: GLOBAL_CONFIG.source.welcome.key
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
    const myLng = (GLOBAL_CONFIG?.source?.welcome?.locationLng || 116.703781) * 1;
    const myLat = (GLOBAL_CONFIG?.source?.welcome?.locationLat || 39.927334) * 1;
    let dist = getDistance(myLng, myLat, ipLocation.location.lng, ipLocation.location.lat);
    let pos = ipLocation.ad_info.nation;
    let ip = ipLocation.ip;
    let desc = '带我去你的城市逛逛吧！';

    if (pos === "中国") {
        pos = ((ipLocation.ad_info.province || "") + " " + (ipLocation.ad_info.city || "") + " " + (ipLocation.ad_info.district || "")).trim();
        let city = ipLocation.ad_info.city;
        switch (city) {
            case "北京市":
                desc = "北——京——欢迎你~";
                break;
            case "广州市":
                desc = "看小蛮腰，喝早茶了嘛~";
                break;
            case "深圳市":
                desc = "今天你逛商场了嘛~";
                break;
            default:
                desc = "来自 " + city + " 的小伙伴你好呀~";
        }
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

// 页面加载与 PJAX 兼容
window.onload = fetchIpLocation;
document.addEventListener("pjax:complete", fetchIpLocation);
