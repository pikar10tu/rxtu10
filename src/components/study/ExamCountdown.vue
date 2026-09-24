<template>
  <div v-if="next" class="ec-wrap">
    <div class="ec-card">
      <span class="ec-emoji"><Emoji :char="next.emoji || '🎯'" /></span>
      <div class="ec-body">
        <div class="ec-label">{{ next.label }}</div>
        <div class="ec-date">{{ fmtRange(next) }}</div>
      </div>
      <div class="ec-count">
        <template v-if="leftMs > 0"><b>{{ days }}</b><small>วัน</small></template>
        <b v-else class="ec-today">วันนี้!</b>
      </div>
    </div>
    <!-- นับถึงระดับวินาที ถึง 00:00 น. เวลาไทยของวันสอบ (รอบเช้า/บ่ายแต่ละคนไม่เท่ากัน จึงนับถึงต้นวัน) -->
    <div v-if="leftMs > 0" class="ec-tick" aria-hidden="true">
      <span v-for="u in units" :key="u.k" class="ec-unit"><b>{{ u.v }}</b><small>{{ u.k }}</small></span>
    </div>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { EXAMS } from '../../data/exams.js'
import { upcomingExams } from '../../utils/countdown.js'

// ticker 1 วิ (นาฬิกาเครื่องผู้ใช้ล้วน ไม่แตะ Firestore) · หยุดตอนแท็บถูกซ่อน กันเปลืองแบต
const now = ref(Date.now())
let timer = null
const tick = () => { now.value = Date.now() }
function start() { if (!timer) { tick(); timer = setInterval(tick, 1000) } }
function stop() { clearInterval(timer); timer = null }
const onVis = () => (document.hidden ? stop() : start())
onMounted(() => { start(); document.addEventListener('visibilitychange', onVis) })
onUnmounted(() => { stop(); document.removeEventListener('visibilitychange', onVis) })

// โชว์ bubble เดียว = วันสอบที่ใกล้ที่สุด (CC1/CC2 ติดกัน → รวบเหลืออันใกล้สุด)
const next = computed(() => upcomingExams(EXAMS, now.value)[0])

// เวลาที่เหลือจริงถึง date (ISO +07 ⇒ เทียบเวลาไทยเสมอ ไม่ว่าเครื่องตั้งโซนไหน)
const leftMs = computed(() => next.value ? Math.max(0, new Date(next.value.date).getTime() - now.value) : 0)
const days = computed(() => Math.floor(leftMs.value / 86400000))
const units = computed(() => {
  const s = Math.floor((leftMs.value % 86400000) / 1000)
  const p = (n) => String(n).padStart(2, '0')
  return [{ k: 'ชม.', v: p(Math.floor(s / 3600)) }, { k: 'นาที', v: p(Math.floor(s / 60) % 60) }, { k: 'วิ', v: p(s % 60) }]
})

function fmtDate(iso) {
  // th-TH-u-ca-gregory = เดือนภาษาไทย แต่ปีเป็น ค.ศ. (ไม่ใช่ พ.ศ.)
  return new Date(iso).toLocaleDateString('th-TH-u-ca-gregory', { day: 'numeric', month: 'long', year: 'numeric' })
}

// สอบหลายวัน (มี dateEnd) → "12–13 ธันวาคม 2026" (ยุบเดือน/ปีถ้าเดือนเดียวกัน) · ไม่มี dateEnd → วันเดียว
function fmtRange(e) {
  if (!e.dateEnd) return fmtDate(e.date)
  const s = new Date(e.date), en = new Date(e.dateEnd)
  if (s.getMonth() === en.getMonth() && s.getFullYear() === en.getFullYear()) {
    return `${s.toLocaleDateString('th-TH-u-ca-gregory', { day: 'numeric' })}–${fmtDate(e.dateEnd)}`
  }
  return `${fmtDate(e.date)} – ${fmtDate(e.dateEnd)}`
}
</script>

<style scoped>
.ec-wrap { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.ec-card { display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, var(--primary), #6366f1); color: #fff; border: 2px solid var(--ink); border-radius: 16px; box-shadow: var(--pop); padding: 12px 14px; }
.ec-emoji { font-size: 1.6rem; flex-shrink: 0; }
.ec-body { flex: 1; min-width: 0; }
.ec-label { font-weight: 800; font-size: .9rem; }
.ec-date { font-size: .7rem; opacity: .85; margin-top: 2px; }
.ec-count { text-align: center; flex-shrink: 0; line-height: 1; min-width: 52px; }
.ec-count b { font-size: 1.8rem; font-weight: 800; font-family: var(--font-display); font-variant-numeric: tabular-nums; }
.ec-count small { display: block; font-size: .7rem; opacity: .85; margin-top: 3px; }
.ec-today { font-size: 1.15rem; }
/* แถบชม./นาที/วิ ใต้การ์ด — ตัวเลขเดินให้เห็นว่าเวลาไหลจริง */
.ec-tick { display: flex; justify-content: center; gap: 8px; margin-top: -2px; }
.ec-unit { display: flex; align-items: baseline; gap: 3px; background: #fff; border: 2px solid var(--ink); border-radius: 10px; padding: 3px 10px; box-shadow: var(--pop); }
.ec-unit b { font-size: 1.1rem; font-weight: 800; font-family: var(--font-display); font-variant-numeric: tabular-nums; color: var(--primary); }
.ec-unit small { font-size: .7rem; font-weight: 700; color: #475569; }
</style>
