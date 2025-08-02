
// 小板报 - 使用 NSMAO 接口并读取 themeConfig 配置
const welcomeContainer = document.getElementById('welcome-info');
if (!welcomeContainer) return;

const key = GLOBAL_CONFIG?.source?.welcome?.key;
if (!key) {
  welcomeContainer.innerHTML = '<b>⚠️ 欢迎配置未设置 API Key</b>';
  return;
}

fetch(`https://api.nsmao.net/api/ip/query?key=${key}`)
  .then(res => res.json())
  .then(data => {
    if (data.code !== 200 || !data.data) {
      welcomeContainer.innerHTML = '<b>⚠️ IP信息获取失败</b>';
      return;
    }

    const result = data.data;
    const ip = result.ip || '';
    const lat = result.lat || '';
    const lng = result.lng || '';
    const nation = result.country || '';
    const province = result.prov || result.province || '';
    const city = result.city || '';
    const district = result.district || '';

    welcomeContainer.innerHTML = `
      <b>📢 小板报</b><br>
      欢迎来自 <b>${nation} ${province} ${city} ${district}</b> 的朋友 👋<br>
      <small>IP: ${ip}</small><br>
      <small>经纬度: ${lat}, ${lng}</small>
    `;
  })
  .catch(err => {
    console.error('小板报错误:', err);
    welcomeContainer.innerHTML = '<b>⚠️ 欢迎信息加载失败</b>';
  });
