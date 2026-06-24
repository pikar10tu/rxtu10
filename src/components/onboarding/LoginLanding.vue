<template>
  <div class="ll">
    <div class="ll-badge"><Emoji char="🧪" /></div>
    <div class="ll-title">RxTU10</div>
    <div class="ll-sub">เภสัช มธ. รุ่น 10</div>
    <p class="ll-msg">พื้นที่เล็กๆ ของพวกเรา — สะสม เล่น และเตรียมสอบใบประกอบฯ (CC) ไปด้วยกัน</p>

    <!-- in-app browser (LINE/FB/IG) บล็อก Google login ทั้ง popup และ redirect →
         เตือนให้เปิดในเบราว์เซอร์จริง ก่อนจะกดแล้วเด้งกลับงงๆ -->
    <div v-if="inApp" class="ll-warn">
      <Emoji char="⚠️" /> ดูเหมือนเปิดในแอป {{ inApp }} อยู่ — Google มักบล็อกการล็อกอินในนี้<br>
      แตะ <b>⋯</b> มุมขวาบน แล้วเลือก <b>“เปิดในเบราว์เซอร์”</b> (Chrome / Safari) ก่อนเข้าสู่ระบบ
    </div>

    <button class="ll-btn" @click="auth.login()"><Emoji char="🔑" /> เข้าสู่ระบบด้วย Google</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Emoji from '../shared/Emoji.vue'
import { useAuthStore } from '../../stores/auth.js'
const auth = useAuthStore()

// ตรวจ in-app webview ยอดฮิตของนักศึกษา (เปิดลิงก์จาก LINE/เฟส/IG) — ไม่บล็อกการกด
// แค่เตือน เพราะ Google ปฏิเสธ OAuth ใน embedded webview เหล่านี้
const inApp = computed(() => {
  const ua = navigator.userAgent || ''
  if (/\bLine\//i.test(ua)) return 'LINE'
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return 'Facebook'
  if (/Instagram/i.test(ua)) return 'Instagram'
  return null
})
</script>

<style scoped>
.ll { position:fixed; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:28px; gap:8px; background:linear-gradient(160deg,#eef2ff,#fff); }
.ll-badge { width:64px; height:64px; display:flex; align-items:center; justify-content:center; font-size:2rem; border-radius:18px; background:var(--gold); border:2px solid var(--ink); box-shadow:var(--pop); transform:rotate(-6deg); margin-bottom:8px; }
.ll-title { font-family:var(--font-display); font-weight:400; font-size:2.2rem; color:var(--ink); line-height:1; }
.ll-sub { font-size:.8rem; color:var(--muted); font-weight:700; }
.ll-msg { font-size:.84rem; color:rgba(0,0,0,.6); max-width:300px; line-height:1.6; margin:12px 0 18px; }
.ll-warn { max-width:320px; font-size:.8rem; line-height:1.55; color:#7c2d12; background:#fff7ed; border:2px solid #fdba74; border-radius:12px; padding:10px 14px; margin-bottom:16px; }
.ll-btn { border:2px solid var(--ink); border-radius:12px; padding:13px 24px; font-family:inherit; font-size:.92rem; font-weight:800; color:#fff; background:var(--accent,#4f46e5); box-shadow:var(--pop); cursor:pointer; transition:transform .12s,box-shadow .12s; }
.ll-btn:active { transform:translate(2px,2px); box-shadow:0 0 0 var(--ink); }
</style>
