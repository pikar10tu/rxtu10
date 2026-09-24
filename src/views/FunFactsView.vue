<template>
  <div class="tab-content">
    <div class="page-title"><Emoji char="📊" /> สถิติรวมทั้งเว็บ</div>
    <div class="ff-sub">ตัวเลขนี้เป็นของทุกคนในรุ่นรวมกัน ไม่ใช่ของคุณคนเดียว</div>

    <div v-if="loading" class="ff-empty">กำลังโหลด…</div>
    <div v-else class="ff-list">
      <div class="ff-row"><Emoji char="📝" /><span class="ff-label">ข้อสอบที่ตอบรวมกัน</span><b class="ff-num">{{ stats.quizTotal.toLocaleString() }}</b><span class="ff-unit">ข้อ</span></div>
      <div class="ff-row"><Emoji char="⚔️" /><span class="ff-label">ไฟต์ PvP ที่สู้กันไปแล้ว</span><b class="ff-num">{{ stats.pvpTotal.toLocaleString() }}</b><span class="ff-unit">ครั้ง</span></div>
      <div class="ff-row"><Emoji char="🃏" /><span class="ff-label">พลิกการ์ดไปแล้ว</span><b class="ff-num">{{ stats.flashcardFlips.toLocaleString() }}</b><span class="ff-unit">ครั้ง</span></div>
      <div class="ff-row"><Emoji char="🌾" /><span class="ff-label">ยอดขายฟาร์มสะสม</span><b class="ff-num">{{ stats.farmSalesTotal.toLocaleString() }}</b><span class="ff-unit">เหรียญ</span></div>
      <div class="ff-row"><Emoji char="💰" /><span class="ff-label">เหรียญที่ใช้ไปสะสม</span><b class="ff-num">{{ stats.totalSpent.toLocaleString() }}</b><span class="ff-unit">เหรียญ</span></div>
      <div class="ff-row"><Emoji char="🏆" /><span class="ff-label">ความสำเร็จที่ปลดรวมกัน</span><b class="ff-num">{{ stats.achievementsUnlockedTotal.toLocaleString() }}</b><span class="ff-unit">รายการ</span></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Emoji from '../components/shared/Emoji.vue'
import { fetchGlobalStats } from '../composables/useGlobalStats.js'
import { DEFAULT_GLOBAL_STATS } from '../utils/globalStats.js'

const stats = ref({ ...DEFAULT_GLOBAL_STATS })
const loading = ref(true)

onMounted(async () => {
  stats.value = await fetchGlobalStats()
  loading.value = false
})
</script>

<style scoped>
.ff-sub { font-size:.78rem; color:var(--muted); margin:-4px 0 14px; }
.ff-empty { font-size:.82rem; color:var(--muted); padding:20px 0; text-align:center; }
.ff-list { display:flex; flex-direction:column; gap:10px; }
.ff-row { display:flex; align-items:center; gap:8px; background:#fff; border:var(--bw) solid var(--line); border-radius:12px; padding:10px 12px; box-shadow:var(--pop); }
.ff-label { flex:1; font-size:.8rem; color:var(--ink); }
.ff-num { font-size:1rem; color:var(--accent,var(--primary)); }
.ff-unit { font-size:.74rem; color:var(--muted); }
</style>
