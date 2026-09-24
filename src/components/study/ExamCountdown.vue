<template>
  <div v-if="next" class="ec-wrap">
    <div class="ec-card">
      <div class="ec-head">
        <span class="ec-emoji"><Emoji :char="next.emoji || '🎯'" /></span>
        <div class="ec-body">
          <div class="ec-label">{{ next.label }}</div>
          <div class="ec-date">{{ fmtRange(next) }}</div>
        </div>
      </div>
      <!-- นาฬิกาพลิก วัน/ชม./นาที/วิ — นับถึง 00:00 น. เวลาไทยของวันสอบ (รอบเช้า/บ่ายแต่ละคนไม่เท่ากัน จึงนับถึงต้นวัน) -->
      <div v-if="leftMs > 0" class="ec-flip" role="timer"
           :aria-label="`เหลือ ${days} วัน ${units[1].v} ชั่วโมง ${units[2].v} นาที`">
        <div v-for="u in units" :key="u.k" class="ec-group">
          <div class="ec-digits">
            <!-- :key ผูกกับค่าตัวเลข ⇒ เปลี่ยนเลขเมื่อไหร่ element ใหม่ mount = เล่นอนิเมชันพลิกเฉพาะหลักที่เปลี่ยน -->
            <span v-for="(d, i) in u.v" :key="i + '-' + d" class="ec-tile">{{ d }}</span>
          </div>
          <span class="ec-cap">{{ u.k }}</span>
        </div>
      </div>
      <div v-else class="ec-today">วันนี้แล้ว สู้ๆ!</div>
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
  return [
    { k: 'วัน', v: p(days.value) },   // เกิน 99 วัน = 3 หลักเอง
    { k: 'ชม.', v: p(Math.floor(s / 3600)) },
    { k: 'นาที', v: p(Math.floor(s / 60) % 60) },
    { k: 'วิ', v: p(s % 60) },
  ]
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
.ec-card { background: linear-gradient(135deg, var(--primary), #6366f1); color: #fff; border: 2px solid var(--ink); border-radius: 16px; box-shadow: var(--pop); padding: 12px 14px 14px; }
.ec-head { display: flex; align-items: center; gap: 10px; }
.ec-emoji { font-size: 1.5rem; flex-shrink: 0; }
.ec-body { flex: 1; min-width: 0; }
.ec-label { font-weight: 800; font-size: .9rem; }
.ec-date { font-size: .7rem; opacity: .85; margin-top: 2px; }
.ec-today { margin-top: 10px; text-align: center; font-size: 1.15rem; font-weight: 800; }

/* ── นาฬิกาพลิก (ป้ายแบบสนามบิน) ── */
.ec-flip { display: flex; justify-content: center; gap: 10px; margin-top: 12px; }
.ec-group { display: flex; flex-direction: column; align-items: center; gap: 5px; }
.ec-digits { display: flex; gap: 3px; perspective: 300px; }
.ec-tile {
  position: relative; display: grid; place-items: center;
  width: 30px; height: 44px; border-radius: 6px;
  background: linear-gradient(#fff 0 49%, #eef0f4 51% 100%);
  border: 2px solid var(--ink); box-shadow: 0 2px 0 var(--ink);
  color: #1e293b; font-family: var(--font-display); font-weight: 800; font-size: 1.7rem;
  font-variant-numeric: tabular-nums; line-height: 1;
  transform-origin: 50% 50%; animation: ec-flip .35s ease-out;
}
/* เส้นแบ่งกลางแผ่น + หมุดสองข้าง */
.ec-tile::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 2px; margin-top: -1px; background: rgba(15, 23, 42, .35); }
.ec-tile::after { content: ''; position: absolute; left: -4px; right: -4px; top: 50%; height: 6px; margin-top: -3px;
  background: linear-gradient(90deg, var(--ink) 0 4px, transparent 4px calc(100% - 4px), var(--ink) calc(100% - 4px)); border-radius: 2px; }
.ec-cap { font-size: .7rem; font-weight: 700; letter-spacing: .02em; opacity: .9; }
@keyframes ec-flip { from { transform: rotateX(-90deg); } to { transform: rotateX(0); } }
@media (max-width: 340px) { .ec-tile { width: 26px; height: 38px; font-size: 1.45rem; } .ec-flip { gap: 7px; } }
</style>
