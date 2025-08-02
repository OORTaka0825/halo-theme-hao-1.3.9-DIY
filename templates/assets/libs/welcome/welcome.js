
let ipLocation;

// 获取 IP 位置
function fetchIpLocation() {
  const key = GLOBAL_CONFIG?.source?.welcome?.key;
  if (!key) return;

  fetch(`https://api.nsmao.net/api/ip/query?key=${key}`)
    .then(res => res.json())
    .then(res => {
      if (res.code !== 200) return;
      ipLocation = {
        status: 0,
        message: res.msg || "Success",
        result: {
          ip: res.data.ip,
          location: {
            lat: res.data.lat,
            lng: res.data.lng
          },
          ad_info: {
            nation: res.data.country,
            province: res.data.prov,
            city: res.data.city,
            district: res.data.district
          }
        }
      };
      showWelcome();
    });
}

// 展示欢迎信息
function showWelcome() {
  if (!ipLocation?.result) return;
  const info = ipLocation.result;
  const welcomeEle = document.getElementById('welcome-info');
  if (!welcomeEle) return;
  welcomeEle.innerHTML = `📢 欢迎来自 <b>${info.ad_info.nation} ${info.ad_info.province} ${info.ad_info.city}</b> 的朋友 👋`;
}

// 页面加载时执行
window.addEventListener('load', fetchIpLocation);
document.addEventListener('pjax:complete', fetchIpLocation);
