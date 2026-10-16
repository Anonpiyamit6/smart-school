// ==========================================
// 🌟 1. ระบบตัวแปลงคำสั่ง (Magic Proxy) 🌟
// แปลง google.script.run เป็น fetch() ให้อัตโนมัติ!
// ==========================================

// ลิงก์ API ของ Cloudflare (เดี๋ยวเราจะได้มาในขั้นตอน Deploy)
const API_URL = "https://smart-school-api.YOUR-CLOUDFLARE.workers.dev"; 

const googleScriptRunProxy = {
  get(target, prop) {
    // จัดการคำสั่ง .withSuccessHandler()
    if (prop === 'withSuccessHandler') {
      return function(callback) { 
        target._onSuccess = callback; 
        return new Proxy(target, googleScriptRunProxy); 
      };
    }
    // จัดการคำสั่ง .withFailureHandler()
    if (prop === 'withFailureHandler') {
      return function(callback) { 
        target._onFailure = callback; 
        return new Proxy(target, googleScriptRunProxy); 
      };
    }
    // ส่งคำสั่งไปยัง Cloudflare
    return async function(...args) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: prop, args: args })
        });
        const data = await response.json();
        if (target._onSuccess) target._onSuccess(data);
      } catch (error) {
        console.error("API Error:", error);
        if (target._onFailure) target._onFailure(error);
      }
    };
  }
};

// จำลองตัวแปร google.script.run ขึ้นมาหลอกโค้ดเดิม
window.google = { 
  script: { 
    run: new Proxy({ _onSuccess: null, _onFailure: null }, googleScriptRunProxy) 
  } 
};

// ==========================================
// 🌟 2. ระบบควบคุมหน้าจอและ UI 🌟
// ==========================================

function showPage(pageId) {
  // ซ่อนทุกหน้า
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // โชว์หน้าที่เลือก
  const target = document.getElementById(pageId);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function navigateTo(pageId) {
  // ทำไฮไลท์เมนูด้านซ้าย
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const activeNav = document.querySelector(`.nav-item[onclick="navigateTo('${pageId}')"]`);
  if (activeNav) activeNav.classList.add('active');

  showPage(pageId);
}

function showToast(msg, type = 'info', duration = 3000) {
  alert(`[${type.toUpperCase()}] ${msg}`); // ชั่วคราว: เดี๋ยวค่อยเปลี่ยนเป็นป๊อปอัพสวยๆ
}

function showLoading(text = 'กำลังโหลด...') {
  console.log("Loading: " + text);
}

function hideLoading() {
  console.log("Loading Complete");
}

function executeLogout() {
  if (confirm("ยืนยันการออกจากระบบ?")) {
    alert("ออกจากระบบเรียบร้อย (ตัวอย่าง)");
  }
}

// โหลดหน้าแรกเมื่อเปิดแอป
document.addEventListener("DOMContentLoaded", () => {
  navigateTo('page-landing');
});
