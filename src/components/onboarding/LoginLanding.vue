<template>
  <div class="ll">
    <div class="ll-badge"><Emoji char="🧪" /></div>
    <div class="ll-title">RxTU10</div>
    <div class="ll-sub">เภสัช มธ. รุ่น 10</div>
    <p class="ll-msg">พื้นที่เล็กๆ ของพวกเรา — สะสม เล่น และเตรียมสอบใบประกอบฯ (CC) ไปด้วยกัน</p>
    <button class="ll-btn" @click="auth.login()"><Emoji char="🔑" /> เข้าสู่ระบบด้วย Google</button>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { useAuthStore } from '../../stores/auth.js'
const auth = useAuthStore()
</script>

<style scoped>
.ll { position:fixed; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:28px; gap:8px; background:linear-gradient(160deg,#eef2ff,#fff); }
.ll-badge { width:64px; height:64px; display:flex; align-items:center; justify-content:center; font-size:2rem; border-radius:18px; background:var(--gold); border:2px solid var(--ink); box-shadow:var(--pop); transform:rotate(-6deg); margin-bottom:8px; }
.ll-title { font-family:var(--font-display); font-weight:400; font-size:2.2rem; color:var(--ink); line-height:1; }
.ll-sub { font-size:.8rem; color:var(--muted); font-weight:700; }
.ll-msg { font-size:.84rem; color:rgba(0,0,0,.6); max-width:300px; line-height:1.6; margin:12px 0 18px; }
.ll-btn { border:2px solid var(--ink); border-radius:12px; padding:13px 24px; font-family:inherit; font-size:.92rem; font-weight:800; color:#fff; background:var(--accent,#4f46e5); box-shadow:var(--pop); cursor:pointer; transition:transform .12s,box-shadow .12s; }
.ll-btn:active { transform:translate(2px,2px); box-shadow:0 0 0 var(--ink); }
</style>
