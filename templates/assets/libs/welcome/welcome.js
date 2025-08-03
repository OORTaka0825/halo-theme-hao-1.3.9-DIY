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
    console.log("开始获取 IP 定位信息");  // 调试输出
    $.ajax({
        type: 'get',
        url: 'https://api.nsmao.net/api/ip/query',
        data: {
            key: GLOBAL_CONFIG.source.welcome.key // 保留您的配置项
        },
        dataType: 'json',
        success: function (res) {
            if (res.code !== 200) {
                console.error("IP 定位失败：", res);  // 调试输出
                return;
            }
            ipLocation = {
                ip: res.data.ip || "未知",
                location: {
                    lat: res.data.lat || 0,
                    lng: res.data.lng || 0
                },
                ad_info: {
                    nation: res.data.country || "未知",
                    province: res.data.province || "未知",
                    city: res.data.city || "未知",
                    district: res.data.district || "未知"
                }
            };
            console.log("IP 定位成功：", ipLocation);  // 调试输出
            showWelcome();
        },
        error: function (err) {
            console.error("API 请求失败：", err);  // 调试输出
        }
    });
}

// 根据国家、省份、城市信息自定义欢迎语
function showWelcome() {
    console.log("开始显示欢迎语");  // 调试输出
    if (!ipLocation) {
        console.error("IP 定位信息为空！");  // 调试输出
        return;
    }

    const myLng = GLOBAL_CONFIG.source.welcome.lng * 1; 
    const myLat = GLOBAL_CONFIG.source.welcome.lat * 1; 
    let dist = getDistance(myLng, myLat, ipLocation.location.lng, ipLocation.location.lat);
    let pos = ipLocation.ad_info.nation;
    let ip = ipLocation.ip;
    let posdesc = '带我去你的城市逛逛吧！';

    // 根据国家和城市自定义欢迎语
    switch (ipLocation.result.ad_info.nation) {
        case "日本":
            posdesc = "よろしく，一起去看樱花吗";
            break;
        case "美国":
            posdesc = "Let us live in peace!";
            break;
        case "英国":
            posdesc = "想同你一起夜乘伦敦眼";
            break;
        case "俄罗斯":
            posdesc = "干了这瓶伏特加！";
            break;
        case "法国":
            posdesc = "C'est La Vie";
            break;
        case "德国":
            posdesc = "Die Zeit verging im Fluge.";
            break;
        case "澳大利亚":
            posdesc = "一起去大堡礁吧！";
            break;
        case "加拿大":
            posdesc = "拾起一片枫叶赠予你";
            break;
        case "中国":
            pos = ipLocation.result.ad_info.province + " " + ipLocation.result.ad_info.city + " " + ipLocation.result.ad_info.district;
            ip = ipLocation.result.ip;
            switch (ipLocation.result.ad_info.province) {
                case "北京市":
                    posdesc = "北——京——欢迎你~~~";
                    break;
                case "广东省":
                    switch (ipLocation.result.ad_info.city) {
                        case "广州市":
                            posdesc = "看小蛮腰，喝早茶了嘛~";
                            break;
                        default:
                            posdesc = "欢迎来到 " + ipLocation.result.ad_info.city;
                            break;
                    }
                    break;
                default:
                    posdesc = "带我去你的城市逛逛吧！";
                    break;
            }
            break;
        default:
            posdesc = "带我去你的国家逛逛吧";
            break;
    }

    // 根据本地时间切换欢迎语
    let timeChange;
    let date = new Date();
    if (date.getHours() >= 5 && date.getHours() < 11) timeChange = "<span>🌤️ 早上好，一日之计在于晨</span>";
    else if (date.getHours() >= 11 && date.getHours() < 13) timeChange = "<span>☀️ 中午好，记得午休喔~</span>";
    else if (date.getHours() >= 13 && date.getHours() < 17) timeChange = "<span>🕞 下午好，饮茶先啦！</span>";
    else if (date.getHours() >= 17 && date.getHours() < 19) timeChange = "<span>🚶‍♂️ 即将下班，记得按时吃饭~</span>";
    else if (date.getHours() >= 19 && date.getHours() < 24) timeChange = "<span>🌙 晚上好，夜生活嗨起来！</span>";
    else timeChange = "夜深了，早点休息，少熬夜";

    // 新增ipv6显示为指定内容
    if (ip.includes(":")) {
        ip = "<br>好复杂，咱看不懂~(ipv6)";
    }

    try {
        console.log("欢迎语内容：", posdesc);  // 调试输出
        document.getElementById("welcome-info").innerHTML =
            `欢迎来自 <b><span style="color: var(--kouseki-ip-color);font-size: var(--kouseki-gl-size)">${pos}</span></b> 的小友💖<br>${posdesc}🍂<br>当前位置距博主约 <b><span style="color: var(--kouseki-ip-color)">${dist}</span></b> 公里！<br>您的IP地址为：<b><span>${ip}</span></b><br>${timeChange} <br>`;
    } catch (err) {
        console.log("Pjax无法获取元素", err);
    }
}

window.onload = fetchIpLocation;
document.addEventListener('pjax:complete', fetchIpLocation);
