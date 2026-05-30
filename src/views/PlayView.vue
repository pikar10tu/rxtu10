<template>
  <div class="tab-content">
    <div style="font-size:1.1rem;font-weight:800;margin-bottom:12px">🎮 Play</div>

    <template v-if="authStore.isLoggedIn">
      <FarmGrid />

      <div class="soon-grid">
        <div class="soon-card"><span class="soon-emoji">⚔️</span><span>PvP สู้กัน</span><span class="soon-tag">เร็วๆ นี้</span></div>
        <div class="soon-card"><span class="soon-emoji">🏯</span><span>ปีนหอคอย</span><span class="soon-tag">เร็วๆ นี้</span></div>
        <div class="soon-card"><span class="soon-emoji">🗺️</span><span>ผจญภัย Co-op</span><span class="soon-tag">เร็วๆ นี้</span></div>
        <div class="soon-card"><span class="soon-emoji">🍬</span><span>เภสัช Crush</span><span class="soon-tag">เร็วๆ นี้</span></div>
      </div>
    </template>
    <div v-else class="play-login">เข้าสู่ระบบเพื่อเล่น</div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth.js'
import FarmGrid from '../components/farm/FarmGrid.vue'

const authStore = useAuthStore()
</script>

<style scoped>
.soon-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 14px; }
.soon-card { background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 12px; padding: 16px 10px; display: flex; flex-direction: column; align-items: center; gap: 4px; opacity: .75; }
.soon-emoji { font-size: 1.6rem; }
.soon-card span:nth-child(2) { font-size: .8rem; font-weight: 700; }
.soon-tag { font-size: .56rem; color: #b45309; background: rgba(251,191,36,.18); padding: 2px 7px; border-radius: 999px; }
.play-login { text-align: center; color: rgba(0,0,0,.4); padding: 30px 0; font-size: .85rem; }
</style>
