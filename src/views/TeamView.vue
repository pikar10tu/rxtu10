<!-- src/views/TeamView.vue — จัดทีมแบบหน้าเต็ม (3 ต.ค. 2026 redesign) · ตรรกะทั้งหมดอยู่ใน TeamPicker (inline)
     หอคอย/สนามประลองยังเปิด TeamPicker แบบแผ่นเลื่อนเหมือนเดิม — ตัวเดียวกัน ของที่จัดตรงกันทุกที่ -->
<template>
  <div class="tab-content tv-wrap">
    <div class="page-title tv-head">
      <button class="tv-back" aria-label="กลับ" @click="back">‹</button>
      <span><Emoji char="⚔️" /> จัดทีม</span>
      <small class="tv-note">ช่อง 1 ออกตีก่อน</small>
    </div>
    <TeamPicker v-if="authStore.isLoggedIn" inline :open="true" />
    <div v-else class="tv-empty">เข้าสู่ระบบก่อนนะ</div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Emoji from '../components/shared/Emoji.vue'
import TeamPicker from '../components/battle/TeamPicker.vue'
import { useAuthStore } from '../stores/auth.js'
const authStore = useAuthStore()
const router = useRouter()
// มาจากหน้าไหนกลับหน้านั้น · เปิดตรงจากลิงก์ (ไม่มีประวัติ) = กลับโหมดเพ็ท
const back = () => (window.history.state?.back ? router.back() : router.push('/play/pets'))
</script>

<style scoped>
.tv-wrap { max-width: 520px; margin: 0 auto; }
.tv-head { display: flex; align-items: center; gap: 8px; }
.tv-back { all: unset; cursor: pointer; font-size: 1.6rem; font-weight: 800; line-height: 1; padding: 0 6px 2px 0; color: var(--ink); }
.tv-back:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.tv-note { margin-left: auto; font-size: .74rem; font-weight: 600; color: var(--muted); }
.tv-empty { text-align: center; color: var(--muted); padding: 30px 0; }
</style>
