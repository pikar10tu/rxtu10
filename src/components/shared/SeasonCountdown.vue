<!-- src/components/shared/SeasonCountdown.vue
     นับถอยหลังจบซีซั่น (23:45 น. เวลาไทยวันสุดท้ายของเดือน — utils/seasonLock.js) + บอกรางวัลสั้นๆ ตามชั้นแจก — ใช้ทั้งหอคอยและอารีน่า
     ช่วงล็อก (23:45 → แอดมินแจกเสร็จ) เปลี่ยนเป็นป้าย "ซีซั่นจบแล้ว กำลังคำนวณผล" · ฟัง config/seasonPayouts (แชร์ listener)
     ticker 1 วิ หยุดตอนแท็บถูกซ่อน
     พื้นของตัวเอง (ดำโปร่ง) → วางได้ทั้งบนการ์ดพื้นเข้มและพื้นสี -->
<template>
  <!-- compact (หอคอย 27 ต.ค.): ชิปบนหัวหน้า · กดเปิด/ปิดรายละเอียดรางวัล -->
  <span v-if="compact" class="scc-wrap">
    <button type="button" class="scc" :class="{ hot: !lock.locked && left < DAY, lock: lock.locked }" :aria-expanded="tip" @click="tip = !tip">
      <template v-if="lock.locked">🏁 สรุปผลซีซั่น</template>
      <template v-else>⏳ {{ label }} เหลือ <template v-if="days > 0">{{ days }}ว </template>{{ hms.slice(0, 5) }}</template>
    </button>
    <span v-if="tip" class="scc-tip" @click="tip = false">
      <template v-if="lock.locked">ซีซั่น {{ lockLabel }} จบแล้ว กำลังคำนวณผลคะแนนและรางวัล · หอคอยเปิดอีกครั้งเมื่อแจกรางวัลเสร็จ</template>
      <template v-else>ซีซั่นปิด 23:45 น. วันสุดท้ายของเดือน · {{ reward }}</template>
    </span>
  </span>
  <div v-else-if="lock.locked" class="sc sc-lock">
    <div class="sc-top"><span class="sc-lock-t">🏁 ซีซั่น {{ lockLabel }} จบแล้ว</span></div>
    <div class="sc-reward">กำลังคำนวณผลคะแนนและรางวัลประจำเดือน · {{ kind === 'arena' ? 'อารีน่า' : 'หอคอย' }}จะเปิดอีกครั้งเมื่อแจกรางวัลเสร็จ</div>
  </div>
  <div v-else class="sc" :class="{ 'sc-hot': left < DAY }">
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
import { currentSeasonId, seasonMonthLabel } from '../../utils/pvpSeason.js'
import { seasonCloseMs } from '../../utils/seasonLock.js'
import { useSeasonLock } from '../../composables/useSeasonLock.js'
import { TOWER_TIERS, ARENA_TIERS } from '../../utils/seasonRewards.js'

const props = defineProps({ kind: { type: String, default: 'tower' }, compact: Boolean })   // 'tower' | 'arena' · compact = ชิปบนหัวหน้า
const tip = ref(false)
const DAY = 86400000

const now = ref(Date.now())
let timer = null
const tick = () => { now.value = Date.now() }
function start() { if (!timer) { tick(); timer = setInterval(tick, 1000) } }
function stop() { clearInterval(timer); timer = null }
const onVis = () => (document.hidden ? stop() : start())
onMounted(() => { start(); document.addEventListener('visibilitychange', onVis) })
const { state: lockState, release } = useSeasonLock()
onUnmounted(() => { stop(); release(); document.removeEventListener('visibilitychange', onVis) })
const lock = computed(() => lockState.value)
const lockLabel = computed(() => seasonMonthLabel(lock.value.season || ''))

// ข้ามเที่ยงคืนระหว่างเปิดค้าง → ซีซั่นใหม่เอง (end คำนวณจาก now ทุกวิ)
const label = computed(() => seasonMonthLabel(currentSeasonId(new Date(now.value))))
const left = computed(() => Math.max(0, seasonCloseMs(now.value) - now.value))   // ปิด 23:45 ไม่ใช่เที่ยงคืน
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
.scc-wrap { position: relative; display: inline-flex; }
.scc { font: inherit; font-size: .72rem; font-weight: 800; white-space: nowrap; color: #fff; background: rgba(43,35,64,.85); border: 0; border-radius: 999px; padding: 4px 10px; cursor: pointer; font-variant-numeric: tabular-nums; }
.scc.hot { background: #b45309; }
.scc.lock { background: #7c2d12; }
.scc-tip { position: absolute; right: 0; top: calc(100% + 6px); z-index: 30; width: min(280px, 80vw); background: #2b2340; color: #fff; font-size: .72rem; font-weight: 600; line-height: 1.5; border-radius: 12px; padding: 8px 10px; box-shadow: var(--pop); }
.sc-lock { border-color: rgba(251, 191, 36, .6); }
.sc-lock-t { font-size: .85rem; font-weight: 800; color: #fbbf24; }
</style>
