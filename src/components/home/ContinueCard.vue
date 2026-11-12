<!--
  src/components/home/ContinueCard.vue — การ์ด "ฝึกต่อ" บน Home: dropdown เดียวรวมหน้าที่ของ
  DailyCard.vue (รายได้ประจำวัน) + NextActionCard.vue (งานถัดไป) เดิม — 2 ไฟล์นั้นลบแล้ว 11 พ.ย. 2026 (ดูใน git ได้)
  13 พ.ย. 2026: เปลี่ยนเป็น "วันนี้ของคุณ" เปิดค้าง (รายการวันนี้ + ปุ่มฝึกต่อ) · ของเดิมพับไว้ใต้ "รายละเอียด"
  พับเป็นค่าเริ่ม (บรรทัดสรุป 1 บรรทัด) กดกางเห็นเนื้อหาเต็ม + เพิ่มเคส CC2 แนะนำ (weakCases จาก useCc2Progress
  หรือเคสเริ่มต้นถ้ายังไม่มีผลฝึก) — CC2 เป็น self-learning ล้วน ไม่มีเหรียญ/รางวัลผูกอยู่ตรงนี้ (user เคาะ 11 พ.ย. 2026)
-->
<template>
  <div class="cc-wrap">
    <!-- "วันนี้ของคุณ" เปิดค้าง (user เคาะ 11 พ.ย. 2026) — รายการสิ่งที่ควรทำวันนี้ + ปุ่มฝึกต่อ · รายละเอียดเดิมพับไว้ข้างล่าง -->
    <div class="cc-hero">
      <div class="cc-hero-h"><Emoji char="☀️" /> วันนี้ของคุณ</div>
      <div class="cc-tasks">
        <RouterLink to="/daily" class="cc-task">
          <span><Emoji char="🌅" /> ข้อสอบประจำวัน</span>
          <em :class="{ done: playedToday }">{{ playedToday ? 'ทำแล้ว ✓' : 'ยังไม่ทำ ›' }}</em>
        </RouterLink>
        <RouterLink v-if="redoDue" to="/quiz?mode=redo" class="cc-task">
          <span><Emoji char="🔁" /> ข้อที่เคยผิด</span>
          <em>{{ redoDue }} ข้อ ›</em>
        </RouterLink>
        <button type="button" class="cc-task" :disabled="accrued < 1" @click="claim">
          <span><Emoji char="🪙" /> รายได้ประจำวัน</span>
          <em v-if="accrued >= 1">เก็บ +{{ accrued.toLocaleString() }}</em>
          <em v-else class="done">{{ isFull ? 'เต็มแล้ว' : `เต็มใน ${fmtRemain}` }}</em>
        </button>
      </div>
      <div class="cc-hero-foot">
        <RouterLink to="/study" class="cc-go">ฝึกต่อ ›</RouterLink>
        <button class="cc-more" type="button" :aria-expanded="expanded" @click="expanded = !expanded">
          {{ expanded ? 'ซ่อนรายละเอียด' : 'รายละเอียด' }} <span class="cc-chevron" :class="{ open: expanded }">⌄</span>
        </button>
      </div>
    </div>

    <div v-if="expanded" class="cc-body">
      <!-- รายได้ประจำวัน (เดิม DailyCard) -->
      <div class="cc-sec cc-daily">
        <div class="cc-daily-top">
          <div class="cc-coins">
            <span class="cc-coins-label">เหรียญของคุณ</span>
            <span class="cc-coins-val">{{ coins.toLocaleString() }}<Emoji char="🪙" /></span>
            <span class="cc-rate">{{ ratePerHour.toLocaleString() }}<Emoji char="🪙" />/ชม. · เต็มวันละ {{ ratePerDay.toLocaleString() }}</span>
          </div>
          <div class="cc-ring" :class="{ full: isFull }" role="img" :aria-label="`รายได้สะสม ${Math.floor(fillPct)}%`">
            <svg viewBox="0 0 92 92" aria-hidden="true">
              <circle cx="46" cy="46" :r="R" class="cc-ring-bg" />
              <circle cx="46" cy="46" :r="R" class="cc-ring-fg" :stroke-dasharray="CIRC" :stroke-dashoffset="CIRC * (1 - fillPct / 100)" />
            </svg>
            <div class="cc-ring-c"><b>{{ Math.floor(fillPct) }}%</b><small>{{ isFull ? 'เต็มแล้ว' : `เต็มใน ${fmtRemain}` }}</small></div>
          </div>
        </div>
        <button class="cc-claim" :class="{ ready: accrued > 0 }" :disabled="accrued < 1" @click="claim">
          <template v-if="accrued > 0">เก็บ +{{ accrued.toLocaleString() }}<Emoji char="🪙" /></template>
          <template v-else>ยังไม่มีรายได้สะสม</template>
        </button>
        <RouterLink v-if="!towerBonus" to="/tower" class="cc-cta">
          <span><Emoji char="🏯" /> หอคอย · ยังไม่ได้ไต่</span>
          <b>ถึงชั้น {{ TOWER_HINT_FLOOR }} = +{{ towerHintBonus.toLocaleString() }}/วัน ›</b>
        </RouterLink>
        <details class="cc-breakdown">
          <summary>รายได้มาจากไหน</summary>
          <div class="cc-row"><span><Emoji char="🏠" /> ที่อยู่อาศัย</span><b>{{ baseIncome.toLocaleString() }}/วัน</b></div>
          <div class="cc-row"><span><Emoji char="🐾" /> สัตว์เลี้ยงในคลัง</span><b>{{ petIncome.toLocaleString() }}/วัน</b></div>
          <div v-if="towerBonus" class="cc-row"><span><Emoji char="🏯" /> หอคอย</span><b>{{ towerBonus.toLocaleString() }}/วัน</b></div>
          <div v-if="bonusPct" class="cc-row cc-bonus"><span><Emoji char="💖" /> โบนัสซัพพอร์ตเตอร์</span><b>+{{ bonusPct }}%</b></div>
          <div v-if="buffActive" class="cc-row cc-bonus"><span><Emoji char="⚡" /> โบนัสเควสต์รายวัน</span><b>+50%</b></div>
          <div class="cc-row cc-total"><span>รวมเต็ม (24 ชม.)</span><b>{{ ratePerDay.toLocaleString() }}<Emoji char="🪙" /></b></div>
        </details>
      </div>

      <!-- งานถัดไป (เดิม NextActionCard) -->
      <component
        :is="action.to ? RouterLink : 'button'" v-if="action" :to="action.to"
        :type="action.to ? undefined : 'button'" class="cc-action" @click="onActionClick"
      >
        <span class="cc-action-ico"><Emoji :char="action.icon" /></span>
        <span class="cc-action-txt"><b>{{ action.title }}</b><small>{{ action.sub }}</small></span>
        <span class="cc-action-cta">{{ action.cta }} ›</span>
      </component>

      <!-- เคส CC2 แนะนำ (self-learning — ไม่มีเหรียญ/รางวัลตรงนี้) -->
      <div v-if="cc2Items.length" class="cc-sec cc-cc2">
        <div class="cc-cc2-label"><Emoji char="🩺" /> {{ cc2Label }}</div>
        <RouterLink v-for="c in cc2Items" :key="c.id" :to="`/study/cc2/${c.id}`" class="cc-cc2-item">
          <span class="cc-cc2-cat" :class="'cat-' + c.cat">{{ c.cat }}</span>
          <span class="cc-cc2-title">{{ c.title }}</span>
          <span class="cc-cc2-go">›</span>
        </RouterLink>
        <RouterLink to="/study/cc2" class="cc-cc2-more">ไปคลังเคส CC2 ทั้งหมด ›</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { computed, ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { getTowerBonus } from '../../data/towerFloors.js'
import { useAuthStore } from '../../stores/auth.js'
import { useDaily } from '../../composables/useDaily.js'
import { nextAction } from '../../utils/nextAction.js'
import { useAppConfig } from '../../composables/useAppConfig.js'
import { useCc2Progress } from '../../composables/useCc2Progress.js'
import { loadCc2Index } from '../../composables/useCc2Data.js'
import { dayKey } from '../../utils/dailyChallenge.js'
import { dueCount as qcardsDueCount } from '../../utils/srsQuestions.js'

const emit = defineEmits(['sheet'])
const auth = useAuthStore()
const coins = computed(() => auth.userData?.coins || 0)
const R = 40
const CIRC = 2 * Math.PI * R
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

// ── งานถัดไป ──
const { pvpOpen } = useAppConfig()
const action = computed(() => nextAction(
  auth.userData,
  {
    today: new Date().toISOString().slice(0, 10),
    now: Date.now(),
    expeditionOpen: false, // ส่งผจญภัยพับเก็บ ไม่เปิดใช้
    pvpOpen: pvpOpen.value,
  },
))
function onActionClick() { if (action.value?.sheet) emit('sheet', action.value.sheet) }

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
const CC2_SUGGEST_N = 3
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

// ── พับ/กาง รายละเอียด ──
const expanded = ref(false)
</script>
<style scoped>
.cc-wrap { background: linear-gradient(135deg, var(--primary-light), var(--accent-light)); border: var(--bw) solid var(--line); border-radius: 20px; margin-bottom: 14px; box-shadow: var(--pop); overflow: hidden; }
.cc-hero { padding: 14px 16px; }
.cc-hero-h { font-size: 1rem; font-weight: 800; color: var(--ink); margin-bottom: 8px; }
.cc-tasks { display: flex; flex-direction: column; gap: 6px; }
.cc-task { all: unset; box-sizing: border-box; display: flex; justify-content: space-between; align-items: center; gap: 8px; width: 100%; padding: 9px 12px; background: #fff; border: var(--bw) solid var(--line); border-radius: 12px; font-family: inherit; font-size: .85rem; color: var(--ink); cursor: pointer; }
.cc-task:disabled { cursor: default; }
.cc-task:focus-visible, .cc-go:focus-visible, .cc-more:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.cc-task em { font-style: normal; font-weight: 800; color: var(--primary); white-space: nowrap; font-size: .8rem; }
.cc-task em.done { color: var(--muted); font-weight: 600; }
.cc-hero-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 10px; }
.cc-go { background: var(--primary); color: #fff; border-radius: 11px; padding: 8px 16px; font-size: .86rem; font-weight: 800; text-decoration: none; box-shadow: var(--pop); }
.cc-more { all: unset; cursor: pointer; font-family: inherit; font-size: .76rem; color: var(--muted); padding: 6px 4px; }
.cc-chevron { display: inline-block; font-size: .9rem; color: var(--muted); transition: transform .2s; }
.cc-chevron.open { transform: rotate(180deg); }
.cc-body { padding: 0 16px 16px; display: flex; flex-direction: column; gap: 12px; }

/* รายได้ */
.cc-sec { }
.cc-daily-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
.cc-coins { display: flex; flex-direction: column; min-width: 0; }
.cc-coins-label { font-size: .72rem; color: var(--muted); }
.cc-coins-val { font-size: 1.7rem; font-weight: 800; color: #b45309; line-height: 1.1; font-variant-numeric: tabular-nums; word-break: break-all; }
.cc-rate { font-size: .7rem; color: var(--muted); margin-top: 2px; }
.cc-ring { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
.cc-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.cc-ring-bg { fill: none; stroke: rgba(43,53,80,.08); stroke-width: 9; }
.cc-ring-fg { fill: none; stroke: var(--primary); stroke-width: 9; stroke-linecap: round; transition: stroke-dashoffset .8s linear; }
.cc-ring.full .cc-ring-fg { stroke: var(--gold); }
.cc-ring-c { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.15; }
.cc-ring-c b { font-size: .95rem; color: #b45309; font-variant-numeric: tabular-nums; }
.cc-ring-c small { font-size: .7rem; color: var(--muted); }
.cc-claim { width: 100%; border: var(--bw) solid var(--line); border-radius: 13px; padding: 12px; font-family: inherit; font-size: .88rem; font-weight: 800; color: #fff; background: #c9c2d4; cursor: pointer; transition: transform .12s, box-shadow .12s; }
.cc-claim.ready { background: var(--mint); box-shadow: var(--pop); }
.cc-claim.ready:active { transform: translate(2px, 2px); box-shadow: 0 0 0 var(--ink); }
.cc-claim:disabled { cursor: default; opacity: .6; box-shadow: none; }
.cc-cta { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 10px; padding: 8px 12px; border-radius: 10px; background: #fff8ec; font-size: .74rem; color: rgba(0,0,0,.6); text-decoration: none; }
.cc-cta b { color: #b45309; }
.cc-breakdown { background: rgba(0,0,0,.03); border-radius: 10px; padding: 8px 12px; margin-top: 10px; }
.cc-breakdown summary { font-size: .74rem; font-weight: 700; color: var(--primary-dark); cursor: pointer; }
.cc-breakdown[open] summary { margin-bottom: 4px; }
.cc-row { display: flex; justify-content: space-between; align-items: center; font-size: .74rem; color: rgba(0,0,0,.6); padding: 3px 0; }
.cc-row b { color: #059669; }
.cc-bonus b { color: #ec4899; }
.cc-total { border-top: 1px dashed rgba(0,0,0,.12); margin-top: 4px; padding-top: 6px; font-weight: 800; color: rgba(0,0,0,.8); }
.cc-total b { color: #b45309; }

/* งานถัดไป */
.cc-action { display: flex; align-items: center; gap: 12px; width: 100%; box-sizing: border-box; text-align: left; text-decoration: none; background: var(--primary-light); border: var(--bw) solid var(--line); border-radius: 16px; padding: 14px; box-shadow: var(--pop); cursor: pointer; font-family: inherit; transition: transform .12s, box-shadow .12s; }
.cc-action:active { transform: translate(2px, 2px); box-shadow: 0 0 0 var(--ink); }
.cc-action-ico { font-size: 1.6rem; flex-shrink: 0; }
.cc-action-txt { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.cc-action-txt b { font-size: .88rem; color: var(--ink); line-height: 1.3; }
.cc-action-txt small { font-size: .72rem; color: rgba(0,0,0,.55); line-height: 1.4; }
.cc-action-cta { flex-shrink: 0; font-size: .72rem; font-weight: 800; color: var(--primary); }

/* CC2 แนะนำ */
.cc-cc2-label { font-size: .76rem; font-weight: 800; color: var(--muted); margin-bottom: 6px; }
.cc-cc2-item { display: flex; align-items: center; gap: 8px; padding: 9px 10px; margin-bottom: 6px; border: var(--bw) solid var(--line); border-radius: 12px; background: #fff; text-decoration: none; color: var(--ink); }
.cc-cc2-cat { flex-shrink: 0; font-size: .7rem; font-weight: 800; padding: 2px 7px; border-radius: 7px; color: #fff; }
.cc-cc2-cat.cat-Clinic { background: var(--primary); }
.cc-cc2-cat.cat-Product { background: var(--mint); }
.cc-cc2-cat.cat-SAP { background: var(--accent); }
.cc-cc2-title { flex: 1; min-width: 0; font-size: .78rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cc-cc2-go { flex-shrink: 0; color: var(--muted); }
.cc-cc2-more { display: block; text-align: right; font-size: .72rem; color: var(--primary); margin-top: 2px; }
</style>
