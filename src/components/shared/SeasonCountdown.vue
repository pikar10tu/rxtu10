<!-- src/components/shared/SeasonCountdown.vue
     นับถอยหลังจบซีซั่น (เที่ยงคืนเวลาไทยวันที่ 1 เดือนถัดไป) + บอกรางวัลสั้นๆ ตามชั้นแจก — ใช้ทั้งหอคอยและอารีน่า
     นาฬิกาเครื่องผู้ใช้ล้วน ไม่มี read/write · ticker 1 วิ หยุดตอนแท็บถูกซ่อน
     พื้นของตัวเอง (ดำโปร่ง) → วางได้ทั้งบนการ์ดพื้นเข้มและพื้นสี -->
<template>
  <div class="sc" :class="{ 'sc-hot': left < DAY }">
    <div class="sc-top">
      <span class="sc-label">ซีซั่น {{ label }} จบใน</span>
      <span class="sc-time">
        <template v-if="days > 0"><b>{{ days }}</b> วัน </template><b>{{ hms }}</b>
      </span>
    </div>
    <div class="sc-reward">{{ reward }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { currentSeasonId, seasonEndMs, seasonMonthLabel } from '../../utils/pvpSeason.js'
import { TOWER_TIERS, ARENA_TIERS } from '../../utils/seasonRewards.js'

const props = defineProps({ kind: { type: String, default: 'tower' } })   // 'tower' | 'arena'
const DAY = 86400000

const now = ref(Date.now())
let timer = null
const tick = () => { now.value = Date.now() }
function start() { if (!timer) { tick(); timer = setInterval(tick, 1000) } }
function stop() { clearInterval(timer); timer = null }
const onVis = () => (document.hidden ? stop() : start())
onMounted(() => { start(); document.addEventListener('visibilitychange', onVis) })
onUnmounted(() => { stop(); document.removeEventListener('visibilitychange', onVis) })

// ข้ามเที่ยงคืนระหว่างเปิดค้าง → ซีซั่นใหม่เอง (end คำนวณจาก now ทุกวิ)
const label = computed(() => seasonMonthLabel(currentSeasonId(new Date(now.value))))
const left = computed(() => Math.max(0, seasonEndMs(now.value) - now.value))
const days = computed(() => Math.floor(left.value / DAY))
const hms = computed(() => {
  const s = Math.floor((left.value % DAY) / 1000)
  const p = (n) => String(n).padStart(2, '0')
  return `${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}`
})
const k = (n) => n.toLocaleString()
const reward = computed(() => {
  if (props.kind === 'arena') {
    const last = ARENA_TIERS[ARENA_TIERS.length - 1]
    const lastChamp = ARENA_TIERS.filter(t => t.champ).pop()
    const lastAch = ARENA_TIERS.filter(t => t.ach).pop()
    return `ท็อป ${lastChamp.maxRank} ได้สนามแชมป์ · ท็อป ${lastAch.maxRank} ได้ achievement ผู้ครอบครองอารีน่าด้วย · ลงสนามแค่ 1 ไฟต์ก็รับ ${k(last.coins)} เหรียญ + ตั๋ว ${last.tickets} ใบ`
  } else {
    const first = TOWER_TIERS[0]
    const top = TOWER_TIERS[TOWER_TIERS.length - 1]
    return `ยิ่งไต่สูงยิ่งได้เยอะ · ไต่แค่ชั้นเดียวก็รับ ${k(first.coins)} เหรียญ + ตั๋ว ${first.tickets} ใบ · ถึงชั้น ${top.min} รับ ${k(top.coins)} + ตั๋ว ${top.tickets} ใบ + achievement`
  }
})
</script>

<style scoped>
.sc {
  background: rgba(15, 23, 42, .55); color: #fff;
  border: 1.5px solid rgba(255, 255, 255, .25); border-radius: 12px;
  padding: 6px 10px; margin: 8px 0;
}
.sc-top { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.sc-label { font-size: .75rem; font-weight: 700; color: rgba(255, 255, 255, .8); }
.sc-time { font-size: .8rem; font-variant-numeric: tabular-nums; }
.sc-time b { font-size: 1.05rem; font-weight: 800; }
.sc-reward { font-size: .7rem; color: rgba(255, 255, 255, .75); margin-top: 2px; line-height: 1.45; }
/* วันสุดท้าย: เลขเป็นสีทองให้รู้ว่าใกล้หมดเวลาแล้ว */
.sc-hot .sc-time b { color: #fbbf24; }
</style>
