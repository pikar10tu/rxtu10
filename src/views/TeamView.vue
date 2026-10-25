<!-- src/views/TeamView.vue — จัดทีมแบบหน้าเต็ม (3 ต.ค. 2026 redesign) · ตรรกะทั้งหมดอยู่ใน TeamPicker (inline)
     หอคอย/สนามประลองยังเปิด TeamPicker แบบแผ่นเลื่อนเหมือนเดิม — ตัวเดียวกัน ของที่จัดตรงกันทุกที่ -->
<template>
  <div class="tab-content tv-wrap">
    <div class="page-title tv-head">
      <button class="tv-back" aria-label="กลับ" @click="back">‹</button>
      <span><Emoji char="⚔️" /> จัดทีม</span>
      <button class="tv-coll" @click="router.push('/pets')"><Emoji char="🐾" /> คลังเพ็ท</button>
    </div>
    <!-- ปุ่ม "บาลานซ์รอบ 2 — ดูว่าตัวไหนบัฟ/เนิฟ" ถอดออก 25 ต.ค. 2026 (user สั่ง) · PatchNotesSheet + data/patchNotes.js เก็บไว้ใช้รอบหน้า -->
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
.tv-coll { margin-left: auto; border: var(--bw) solid var(--line); background: #fff; border-radius: 999px; padding: 6px 12px; font-family: inherit; font-size: .78rem; font-weight: 700; color: var(--ink); cursor: pointer; box-shadow: var(--pop); }
.tv-patch { all: unset; box-sizing: border-box; cursor: pointer; display: flex; align-items: center; gap: 6px; width: 100%;
  margin: 0 0 10px; padding: 9px 12px; border-radius: 12px; background: #fff; border: var(--bw) solid var(--line); box-shadow: var(--pop);
  font-size: .82rem; font-weight: 700; color: var(--ink); }
.tv-patch:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.tv-new { font-size: .7rem; font-weight: 800; color: #fff; background: #d2564b; padding: 1px 7px; border-radius: 999px; }
.tv-go { margin-left: auto; color: var(--muted); font-size: 1.1rem; }
.tv-empty { text-align: center; color: var(--muted); padding: 30px 0; }
</style>
