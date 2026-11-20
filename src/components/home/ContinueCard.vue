<!--
  src/components/home/ContinueCard.vue — "วันนี้ของคุณ" บนหน้าแรก
  20 พ.ย. 2026 (user): ดีไซน์ใหม่ให้อ่านง่าย · เน้นข้อสอบ MCQ ไม่ชวนแฟลชการ์ด · รายได้เป็นแถบ progress (รู้ว่าใกล้เต็ม 24 ชม. หรือยัง)
  แต่ละแถว = ไอคอนวงกลม + ชื่อ + บรรทัดบอกสถานะ + ป้ายขวา · ทำแล้วเป็นติ๊กเขียว · หัวการ์ดนับ "ทำแล้ว x/y"
  ประวัติ: รวม DailyCard + NextActionCard เดิม (11 พ.ย.) → วันนี้ของคุณเปิดค้าง (13 พ.ย.) → แบบนี้
-->
<template>
  <section class="td">
    <!-- 🪙 รายได้สะสม: แถบเติมจนเต็ม 24 ชม. · ใกล้เต็ม = ส้ม · เต็ม = ชมพูกะพริบเตือน -->
    <div class="td-inc" :class="incState">
      <div class="td-inc-top">
        <span class="td-inc-l"><Emoji char="🪙" /> รายได้สะสม</span>
        <span class="td-inc-t">{{ isFull ? 'เต็มแล้ว เก็บก่อนนะ!' : `เต็มใน ${fmtRemain}` }}</span>
      </div>
      <div class="td-bar" role="progressbar" :aria-valuenow="Math.floor(fillPct)" aria-valuemin="0" aria-valuemax="100" :aria-label="`รายได้สะสม ${Math.floor(fillPct)}% ของ 24 ชั่วโมง`">
        <i :style="{ width: fillPct + '%' }"></i>
        <span v-for="h in [6, 12, 18]" :key="h" class="td-tick" :style="{ left: (h / 24 * 100) + '%' }"></span>
      </div>
      <div class="td-inc-bot">
        <span class="td-inc-amt"><b>{{ accrued.toLocaleString() }}</b> / {{ ratePerDay.toLocaleString() }}</span>
        <button type="button" class="td-claim" :disabled="accrued < 1" @click="claim">{{ accrued >= 1 ? 'เก็บเหรียญ' : 'เพิ่งเก็บไป' }}</button>
      </div>
      <details class="td-why">
        <summary>รายได้มาจากไหน</summary>
        <div class="td-row"><span><Emoji char="🏠" /> ที่อยู่อาศัย</span><b>{{ baseIncome.toLocaleString() }}/วัน</b></div>
        <div class="td-row"><span><Emoji char="🐾" /> สัตว์เลี้ยงในคลัง</span><b>{{ petIncome.toLocaleString() }}/วัน</b></div>
        <div v-if="towerBonus" class="td-row"><span><Emoji char="🏯" /> หอคอย</span><b>{{ towerBonus.toLocaleString() }}/วัน</b></div>
        <RouterLink v-else to="/tower" class="td-row td-tip"><span><Emoji char="🏯" /> หอคอยถึงชั้น {{ TOWER_HINT_FLOOR }}</span><b>+{{ towerHintBonus.toLocaleString() }}/วัน ›</b></RouterLink>
        <div v-if="bonusPct" class="td-row"><span><Emoji char="💖" /> โบนัสซัพพอร์ตเตอร์</span><b>+{{ bonusPct }}%</b></div>
        <div v-if="buffActive" class="td-row"><span><Emoji char="⚡" /> โบนัสเควสต์รายวัน</span><b>+50%</b></div>
      </details>
    </div>

    <!-- ☀️ วันนี้ของคุณ -->
    <div class="td-h">
      <span><Emoji char="☀️" /> วันนี้ของคุณ</span>
      <span class="td-count" :class="{ all: doneN === goalN }">{{ doneN === goalN ? 'ครบแล้ว เก่งมาก!' : `ทำแล้ว ${doneN}/${goalN}` }}</span>
    </div>
    <div class="td-list">
      <RouterLink v-for="t in tasks" :key="t.k" :to="t.to" class="td-task" :class="{ done: t.done }">
        <span class="td-ico" :style="{ background: t.bg }"><Emoji :char="t.done ? '✅' : t.icon" /></span>
        <span class="td-txt"><b>{{ t.title }}</b><small>{{ t.sub }}</small></span>
        <span class="td-go">{{ t.done ? 'ดูอีกครั้ง' : t.cta }} ›</span>
      </RouterLink>
    </div>
    <RouterLink to="/quiz" class="td-main"><Emoji char="📝" /> ทำข้อสอบต่อ</RouterLink>
  </section>
</template>
<script setup>
import Emoji from '../shared/Emoji.vue'
import { computed, ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { getTowerBonus } from '../../data/towerFloors.js'
import { useAuthStore } from '../../stores/auth.js'
import { useDaily } from '../../composables/useDaily.js'
import { useCc2Progress } from '../../composables/useCc2Progress.js'
import { loadCc2Index } from '../../composables/useCc2Data.js'
import { dayKey } from '../../utils/dailyChallenge.js'
import { dueCount as qcardsDueCount } from '../../utils/srsQuestions.js'

const auth = useAuthStore()
const coins = computed(() => auth.userData?.coins || 0)
const {
  baseIncome, petIncome, towerBonus, bonusPct, buffActive,
  ratePerDay, ratePerHour, accrued, fillPct, isFull, remainingMs, claim,
} = useDaily()

const TOWER_HINT_FLOOR = 10
const towerHintBonus = getTowerBonus(TOWER_HINT_FLOOR)

const fmtRemain = computed(() => {
  const s = Math.ceil(remainingMs.value / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}ชม ${m}น` : `${m}น`
})

// ── CC2 แนะนำ — self-learning ล้วน ไม่มีเหรียญ/radar (user เคาะ 11 พ.ย. 2026) ──
const { weakCases } = useCc2Progress()
const cc2Index = ref([])
onMounted(async () => {
  try {
    const idx = await loadCc2Index()
    cc2Index.value = idx?.cases || []
  } catch (e) {
    console.error('[ContinueCard] โหลดดัชนี CC2 ไม่สำเร็จ', e)
  }
})
const CC2_SUGGEST_N = 1
const cc2Items = computed(() => {
  const byId = new Map(cc2Index.value.map((c) => [c.id, c]))
  const weak = weakCases.value.map((id) => byId.get(id)).filter(Boolean).slice(0, CC2_SUGGEST_N)
  if (weak.length) return weak
  // ยังไม่มีผลฝึก/ไม่มีจุดอ่อน → แนะนำเคสเริ่มต้นอย่างง่าย (เคสแรกที่เล่นได้จริงของแต่ละหมวด)
  const playable = cc2Index.value.filter((c) => c.mode !== 'rest' && c.mode !== 'free')
  return ['Clinic', 'Product', 'SAP']
    .map((cat) => playable.find((c) => c.cat === cat))
    .filter(Boolean)
    .slice(0, CC2_SUGGEST_N)
})
const cc2Label = computed(() => (weakCases.value.length ? 'เคส CC2 ที่ควรฝึกเพิ่ม' : 'ลองเริ่มฝึก CC2 จากเคสเหล่านี้'))

// ── รายการวันนี้ (0 reads — user doc) ──
const playedToday = computed(() => auth.userData?.dc?.last === dayKey())
const redoDue = computed(() => qcardsDueCount(auth.userData?.study?.qcards, Date.now()))

// ── แถวงานวันนี้ (ไม่มีแฟลชการ์ด — user 20 พ.ย.: ข้อสอบ MCQ คือหลัก) ──
// นับ "ทำแล้ว x/y" เฉพาะงานที่มีวันละครั้ง (ประจำวัน + ข้อค้าง) · เคส CC2 เป็นคำแนะนำ ไม่นับ
const tasks = computed(() => {
  const list = [
    { k: 'daily', to: '/daily', icon: '🌅', bg: '#fff1d6', title: 'ข้อสอบประจำวัน', sub: playedToday.value ? 'วันนี้ทำแล้ว' : 'ชุดสั้นของวันนี้ ทำเสร็จได้รางวัล', cta: 'ทำเลย', done: playedToday.value },
    { k: 'redo', to: '/quiz?mode=redo', icon: '🔁', bg: '#ffe3ea', title: 'ข้อที่เคยผิด', sub: redoDue.value ? `ถึงรอบทบทวน ${redoDue.value} ข้อ` : 'ไม่มีข้อค้าง', cta: 'ทบทวน', done: !redoDue.value },
  ]
  const c = cc2Items.value[0]
  if (c) list.push({ k: 'cc2', to: `/study/cc2/${c.id}`, icon: '🩺', bg: '#dcf5ec', title: weakCases.value.length ? 'เคส CC2 ที่ควรฝึกเพิ่ม' : 'ลองเคส CC2', sub: c.title, cta: 'เปิดเคส', done: false })
  return list
})
const goalN = 2
const doneN = computed(() => tasks.value.filter(t => t.k !== 'cc2' && t.done).length)
const incState = computed(() => (isFull.value ? 'full' : fillPct.value >= 75 ? 'near' : ''))
</script>

<style scoped>
.td { background: #fff; border: var(--bw) solid var(--line); border-radius: 20px; padding: 14px; margin-bottom: 14px; box-shadow: var(--pop); display: flex; flex-direction: column; gap: 10px; }
/* รายได้ */
.td-inc { --bar: #2fbf8f; background: var(--primary-light); border-radius: 14px; padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; }
.td-inc.near { --bar: #f59e0b; background: #fff6e5; }
.td-inc.full { --bar: #ec6a9c; background: var(--accent-light); }
.td-inc-top, .td-inc-bot { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.td-inc-l { font-size: .86rem; font-weight: 800; }
.td-inc-t { font-size: .74rem; font-weight: 700; color: var(--muted); }
.td-inc.near .td-inc-t { color: #b45309; }
.td-inc.full .td-inc-t { color: #c2457a; }
.td-bar { position: relative; height: 12px; border-radius: 999px; background: rgba(255,255,255,.9); border: var(--bw) solid var(--line); overflow: hidden; }
.td-bar i { position: absolute; inset: 0 auto 0 0; background: var(--bar); border-radius: 999px; transition: width .6s ease; }
.td-inc.full .td-bar i { animation: td-pulse 1.4s ease-in-out infinite; }
@keyframes td-pulse { 50% { opacity: .65; } }
.td-tick { position: absolute; top: 2px; bottom: 2px; width: 1px; background: rgba(0,0,0,.12); }
.td-inc-amt { font-size: .76rem; color: var(--muted); font-variant-numeric: tabular-nums; }
.td-inc-amt b { color: var(--ink); font-size: .9rem; }
.td-claim { border: none; border-radius: 10px; padding: 7px 14px; font: inherit; font-size: .8rem; font-weight: 800; color: #fff; background: var(--bar); cursor: pointer; box-shadow: 0 2px 0 rgba(0,0,0,.12); }
.td-claim:disabled { background: #d7d2e0; box-shadow: none; cursor: default; }
.td-why summary { font-size: .72rem; color: var(--muted); cursor: pointer; }
.td-row { display: flex; justify-content: space-between; font-size: .74rem; padding: 3px 0; color: var(--ink); text-decoration: none; }
.td-tip b { color: var(--primary-dark); }
/* วันนี้ของคุณ */
.td-h { display: flex; justify-content: space-between; align-items: center; font-size: .98rem; font-weight: 800; margin-top: 2px; }
.td-count { font-size: .72rem; font-weight: 800; color: var(--muted); background: var(--primary-light); border-radius: 999px; padding: 2px 9px; }
.td-count.all { color: #fff; background: #2fbf8f; }
.td-list { display: flex; flex-direction: column; gap: 8px; }
.td-task { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border: var(--bw) solid var(--line); border-radius: 14px; text-decoration: none; color: var(--ink); background: #fff; transition: transform .12s; }
.td-task:active { transform: scale(.98); }
.td-task.done { background: #f6fbf8; }
.td-task.done .td-txt b { color: var(--muted); }
.td-ico { width: 38px; height: 38px; flex: none; border-radius: 50%; display: grid; place-items: center; font-size: 1.15rem; }
.td-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.td-txt b { font-size: .86rem; line-height: 1.3; }
.td-txt small { font-size: .72rem; color: var(--muted); line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.td-go { flex: none; font-size: .74rem; font-weight: 800; color: var(--primary-dark); }
.td-task.done .td-go { color: var(--muted); font-weight: 700; }
.td-main { display: block; text-align: center; padding: 12px; border-radius: 14px; background: var(--primary); color: #fff; font-weight: 800; font-size: .92rem; text-decoration: none; box-shadow: var(--pop); }
.td-main:active { transform: translateY(1px); }
.td-task:focus-visible, .td-main:focus-visible, .td-claim:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
</style>
