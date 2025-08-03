
let ipLocation = null;

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
    return Math.round(asin(c / 2) * 2 * R);
}

function fetchIpLocation() {
    $.ajax({
        type: 'get',
        url: `https://api.nsmao.net/api/ip/query?key=${GLOBAL_CONFIG.source?.welcome?.key}`,
        dataType: 'json',
        success: function (res) {
            if (res.code === 200) {
                ipLocation = res;
                showWelcome();  // 确保数据拿到后再执行欢迎语逻辑
            }
        }
    });
}

function showWelcome() {
    if (!ipLocation || ipLocation.code !== 200) return;

    let dist = getDistance(
        GLOBAL_CONFIG.source?.welcome?.locationLng,
        GLOBAL_CONFIG.source?.welcome?.locationLat,
        ipLocation.data.lng,
        ipLocation.data.lat
    );

    let pos = ipLocation.data.country;
    let posdesc = "";
    switch (pos) {
        case "日本":
            posdesc = "よろしく，一起去看樱花吗";
            break;
        case "美国":
            posdesc = "Let us make the web great again!";
            break;
        case "英国":
            posdesc = "Fancy a cup of tea?";
            break;
        case "俄罗斯":
            posdesc = "干了这瓶伏特加！";
            break;
        case "中国":
            posdesc = "欢迎来自天朝的朋友";
            break;
        default:
            posdesc = "欢迎来自" + pos + "的朋友";
    }

    const welcome_el = document.getElementById("welcome-info");
    if (!welcome_el) return;

    const hour = new Date().getHours();
    const timeGreeting =
        hour < 6 ? "凌晨好" :
        hour < 11 ? "早上好" :
        hour < 14 ? "中午好" :
        hour < 18 ? "下午好" : "晚上好";

    welcome_el.innerHTML = `
        <div style="line-height:1.5rem;">
            <span>Hi~ </span>
            <b>${ipLocation.data.ip}</b>
            <br />
            <span>欢迎来自 <b>${ipLocation.data.country}</b>
            <b>${ipLocation.data.province}</b>
            <b>${ipLocation.data.city}</b>
            <b>${ipLocation.data.district}</b> 的小伙伴</span><br />
            <span>你距离博主约 <b>${dist}</b> km</span><br />
            <span>${timeGreeting}，${posdesc}</span>
        </div>
    `;
}

window.onload = fetchIpLocation;
document.addEventListener('pjax:complete', fetchIpLocation);
