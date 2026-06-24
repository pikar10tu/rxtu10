<template>
  <div class="tab-content">
    <header class="home-head">
      <div class="home-head-badge"><Emoji char="🧪" /></div>
      <div class="home-head-txt">
        <h1 class="home-head-title">RxTU10</h1>
        <p class="home-head-sub">เภสัช มธ. รุ่น 10 · หน้าหลัก</p>
      </div>
    </header>

    <template v-if="authStore.isLoggedIn">
      <!-- นับถอยหลังสู่วันสอบ (ย้ายมาจาก Study — ข้อมูลสรุปรายวัน เห็นทันทีเปิดแอป) -->
      <ExamCountdown />
      <!-- ที่อยู่อาศัย (residence) — แกน prestige/coin-sink (ขยับขึ้นใต้ countdown) -->
      <ResidenceCard />

      <!-- เหรียญ + รับรายได้รายวัน (ส่วนตัว เห็นเฉพาะเจ้าของ) -->
      <DailyCard />
      <!-- เควสต์ประจำวัน (progress 3 แถบ + รับรางวัล buff/ตั๋ว) -->
      <DailyQuestCard />
      <!-- กล่องจดหมาย (รางวัล/ประกาศ) -->
      <MailboxCard />

      <!-- เครื่องมือผู้ดูแล — เฉพาะแอดมิน (Shop ไป nav, Pets ไป Play แล้ว) -->
      <RouterLink v-if="authStore.isAdmin" to="/admin" class="home-admin-btn">
        <Emoji char="⚙️" /> แผงผู้ดูแลระบบ
      </RouterLink>
    </template>
  </div>
</template>

<script setup>
import Emoji from '../components/shared/Emoji.vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import ResidenceCard from '../components/residence/ResidenceCard.vue'
import DailyCard from '../components/home/DailyCard.vue'
import DailyQuestCard from '../components/home/DailyQuestCard.vue'
import MailboxCard from '../components/home/MailboxCard.vue'
import ExamCountdown from '../components/study/ExamCountdown.vue'

const authStore = useAuthStore()
</script>

<style scoped>
/* ── header: display font + sticker badge ── */
.home-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.home-head-badge {
  width: 50px; height: 50px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.7rem; border-radius: 16px;
  background: var(--gold); border: 2px solid var(--ink); box-shadow: var(--pop);
  transform: rotate(-6deg);
}
.home-head-txt { min-width: 0; }
.home-head-title {
  font-family: var(--font-display); font-weight: 400;
  font-size: 1.85rem; line-height: 1; color: var(--ink); margin: 0;
  letter-spacing: .5px;
}
.home-head-sub { font-size: .68rem; color: var(--muted); margin: 4px 0 0; font-weight: 600; }

/* ── ปุ่มเครื่องมือผู้ดูแล (แอดมินเท่านั้น) — โทนเทา ไม่แย่งความสนใจ ── */
.home-admin-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 4px;
  padding: 11px;
  border-radius: 14px;
  background: #f3f4f6;
  border: 1.5px solid #d1d5db;
  color: var(--muted);
  font-weight: 700;
  font-size: 0.82rem;
  text-decoration: none;
  transition: background .12s;
}
.home-admin-btn:active { background: #e5e7eb; }
</style>
