// 访客欢迎信息模块（NSMAO）
let ipLocation;

// 计算两点间距离
function getDistance(e1, n1, e2, n2) {
    const R = 6371;
    const { sin， cos, asin, PI， hypot } = Math;
    let getPoint = (e, n) => {
        e *= PI / 180;
        n *= PI / 180;
        return { x: cos(n) * cos(e), y: cos(n) * sin(e), z: sin(n) };
    };
    let a = getPoint(e1, n1);
    let b = getPoint(e2, n2);
    let c = hypot(a。x - b。x， a。y - b。y， a。z - b。z);
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
            console。log("API请求成功:"， res);  // 确保API请求成功
            if (res.code !== 200) {
                console。error("IP定位失败:"， res);
                return;
            }
            ipLocation = {
                ip: res.data.ip,
                location: {
                    lat: res.data.lat,
                    lng: res.data.lng
                }，
                ad_info: {
                    nation: res.data.country,
                    province: res.data.province,
                    city: res.data。city，
                    district: res.data.district
                }
            };
            showWelcome();
        },
        error: function (err) {
            console。error("API请求失败:"， err);  // 如果请求失败
        }
    });
}

// 展示欢迎语
function showWelcome() {
    if (!ipLocation) {
        console。error("ipLocation为空");
        return;
    }

    const myLng = GLOBAL_CONFIG.source.welcome.lng * 1;
    const myLat = GLOBAL_CONFIG。source。welcome。lat * 1;
    let dist = getDistance(myLng, myLat, ipLocation.location.lng, ipLocation.location.lat);
    let city = ipLocation。ad_info。city;
    let province = ipLocation.ad_info.province;
    let district = ipLocation。ad_info.district;
    let ip = ipLocation.ip;
    let desc = '带我去你的城市逛逛吧！';

    // 更正位置展示
    let pos = `${province} ${city} ${district}`;

    if (city === "北京市") {
        desc = "北——京——欢迎你~";
    } else if (city === "广州市") {
        desc = "看小蛮腰，喝早茶了嘛~";
    } else if (city === "深圳市") {
        desc = "今天你逛商场了嘛~";
    } else {
        desc = "来自 " + city + " 的小伙伴你好呀~";
    }

    let date = new Date();
    let hour = date.getHours();
    let greet = "夜深了，早点休息~";
    if (hour >= 5 && hour < 11) greet = "🌤️ 早上好，一日之计在于晨";
    else if (hour < 13) greet = "☀️ 中午好，记得午休喔~";
    else if (hour < 17) greet = "🕞 下午好，饮茶先啦！";
    else if (hour < 19) greet = "🚶‍♂️ 即将下班，记得按时吃饭~";
    else if (hour < 24) greet = "🌙 晚上好，夜生活嗨起来！";

    if (ip.includes(":")) ip = "好复杂，咱看不懂~(ipv6)";

    const content = `
        <b><span style="color: var(--kouseki-ip-color);font-size: var(--kouseki-gl-size)">${pos}</span></b><br>
        ${desc}🍂<br>
        当前位置距博主约 <b><span style="color: var(--kouseki-ip-color)">${dist}</span></b> 公里！<br>
        您的IP地址为：<b><span>${ip}</span></b><br>
        ${greet} <br>
    `;

    try {
        const welcomeElement = document.getElementById("welcome-info");
        if (welcomeElement) {
            welcomeElement.innerHTML = content;
        } else {
            console.error("未找到元素#welcome-info");
        }
    } catch (err) {
        console.log("欢迎模块插入失败:", err);
    }
}

// 页面加载与 PJAX 兼容
window.onload = fetchIpLocation;
document.addEventListener("pjax:complete", fetchIpLocation);
