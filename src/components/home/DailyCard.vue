<template>
  <!-- การ์ดหัวหน้า Home (แบบ A — user เลือก 25 ก.ย. 2026): เหรียญ + วงแหวนรายได้ + ปุ่มเก็บ อยู่จอแรกเลย -->
  <div class="daily-card">
    <div class="dc-hi">สวัสดี {{ nickname }} <Emoji char="👋" /></div>
    <div class="dc-top">
      <div class="dc-coins">
        <span class="dc-coins-label">เหรียญของคุณ</span>
        <span class="dc-coins-val">{{ coins.toLocaleString() }}<Emoji char="🪙" /></span>
        <span class="dc-rate">{{ ratePerHour.toLocaleString() }}<Emoji char="🪙" />/ชม. · เต็มวันละ {{ ratePerDay.toLocaleString() }}</span>
      </div>
      <!-- วงแหวน = หลอดรายได้สะสม 24 ชม. (เดิมเป็นแถบตรง) -->
      <div class="dc-ring" :class="{ full: isFull }" role="img" :aria-label="`รายได้สะสม ${Math.floor(fillPct)}%`">
        <svg viewBox="0 0 92 92" aria-hidden="true">
          <circle cx="46" cy="46" :r="R" class="dc-ring-bg" />
          <circle cx="46" cy="46" :r="R" class="dc-ring-fg" :stroke-dasharray="CIRC" :stroke-dashoffset="CIRC * (1 - fillPct / 100)" />
        </svg>
        <div class="dc-ring-c">
          <b>{{ Math.floor(fillPct) }}%</b>
          <small>{{ isFull ? 'เต็มแล้ว' : `เต็มใน ${fmtRemain}` }}</small>
        </div>
      </div>
    </div>

    <button class="dc-claim" :class="{ ready: accrued > 0 }" :disabled="accrued < 1" @click="claim">
      <template v-if="accrued > 0">เก็บ +{{ accrued.toLocaleString() }}<Emoji char="🪙" /></template>
      <template v-else>ยังไม่มีรายได้สะสม</template>
      <!-- จุดแดงคู่กับแท็บ Home (useNavDots) — เกินครึ่งหลอดแล้ว ชวนมาเก็บ -->
      <span v-if="fillPct >= DAILY_DOT_PCT && accrued >= 1" class="nav-dot dc-dot" aria-hidden="true"></span>
    </button>

    <!-- ป้ายชี้ทางหอคอย "ต้องโผล่เสมอ" สำหรับคนยังไม่เคยไต่ — ห้ามพับไว้ใน details
         (เดิม v-if="towerBonus" ซ่อนป้ายนี้จากคนที่ต้องการมันที่สุด · เพื่อนหลายคนไม่รู้ว่าหอคอยให้รายได้รายวัน) -->
    <RouterLink v-if="!towerBonus" to="/tower" class="dc-cta">
      <span><Emoji char="🏯" /> หอคอย · ยังไม่ได้ไต่</span>
      <b>ถึงชั้น {{ TOWER_HINT_FLOOR }} = +{{ towerHintBonus.toLocaleString() }}/วัน ›</b>
    </RouterLink>

    <!-- ที่มาของรายได้ — พับไว้ (ดูไม่บ่อย) -->
    <details class="dc-breakdown">
      <summary>รายได้มาจากไหน</summary>
      <div class="dc-row"><span><Emoji char="🏠" /> ที่อยู่อาศัย</span><b>{{ baseIncome.toLocaleString() }}/วัน</b></div>
      <div class="dc-row"><span><Emoji char="🐾" /> สัตว์เลี้ยงในคลัง</span><b>{{ petIncome.toLocaleString() }}/วัน</b></div>
      <div v-if="towerBonus" class="dc-row"><span><Emoji char="🏯" /> หอคอย</span><b>{{ towerBonus.toLocaleString() }}/วัน</b></div>
      <div v-if="bonusPct" class="dc-row dc-bonus"><span><Emoji char="💖" /> โบนัสซัพพอร์ตเตอร์</span><b>+{{ bonusPct }}%</b></div>
      <div v-if="buffActive" class="dc-row dc-bonus"><span><Emoji char="⚡" /> โบนัสเควสต์รายวัน</span><b>+50%</b></div>
      <div class="dc-row dc-total"><span>รวมเต็ม (24 ชม.)</span><b>{{ ratePerDay.toLocaleString() }}<Emoji char="🪙" /></b></div>
    </details>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { getTowerBonus } from '../../data/towerFloors.js'
import { useAuthStore } from '../../stores/auth.js'
import { useDaily } from '../../composables/useDaily.js'
import { DAILY_DOT_PCT } from '../../composables/useNavDots.js'

const auth = useAuthStore()
const coins = computed(() => auth.userData?.coins || 0)
const nickname = computed(() => auth.userData?.nickname || auth.userData?.name?.split(' ')[0] || '')
const R = 40
const CIRC = 2 * Math.PI * R
const { baseIncome, petIncome, towerBonus, bonusPct, buffActive, ratePerDay, ratePerHour, accrued, fillPct, isFull, remainingMs, claim } = useDaily()

// เป้าหมายที่ยกมาล่อคนยังไม่เคยไต่ — ชั้น 10 ไปถึงได้ในวันเดียวและตัวเลขใหญ่พอให้สนใจ
const TOWER_HINT_FLOOR = 10
const towerHintBonus = getTowerBonus(TOWER_HINT_FLOOR)

const fmtRemain = computed(() => {
  const s = Math.ceil(remainingMs.value / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}ชม ${m}น` : `${m}น`
})
</script>

<style scoped>
.daily-card {
  background: linear-gradient(150deg, #fff 0%, #f3faff 60%, #fff4f9 100%);
  border: var(--bw) solid var(--line); border-radius: 20px;
  padding: 16px; margin-bottom: 14px; box-shadow: var(--pop);
}
.dc-hi { font-size: .8rem; color: var(--muted); font-weight: 600; }
.dc-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 4px 0 12px; }
.dc-coins { display: flex; flex-direction: column; min-width: 0; }
.dc-coins-label { font-size: .72rem; color: var(--muted); }
.dc-coins-val { font-size: 1.9rem; font-weight: 800; color: #b45309; line-height: 1.1; font-variant-numeric: tabular-nums; word-break: break-all; }
.dc-rate { font-size: .7rem; color: var(--muted); margin-top: 2px; }

.dc-ring { position: relative; width: 92px; height: 92px; flex-shrink: 0; }
.dc-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.dc-ring-bg { fill: none; stroke: rgba(43,53,80,.08); stroke-width: 9; }
.dc-ring-fg { fill: none; stroke: var(--primary); stroke-width: 9; stroke-linecap: round; transition: stroke-dashoffset .8s linear; }
.dc-ring.full .dc-ring-fg { stroke: var(--gold); }
.dc-ring-c { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.15; }
.dc-ring-c b { font-size: 1.05rem; color: #b45309; font-variant-numeric: tabular-nums; }
.dc-ring-c small { font-size: .7rem; color: var(--muted); }

.dc-claim {
  width: 100%; border: var(--bw) solid var(--line); border-radius: 13px; padding: 12px;
  font-family: inherit; font-size: .9rem; font-weight: 800; color: #fff;
  position: relative;
  background: #c9c2d4; cursor: pointer; transition: transform .12s, box-shadow .12s;
}
.dc-claim.ready { background: var(--mint); box-shadow: var(--pop); }
.dc-claim.ready:active { transform: translate(2px, 2px); box-shadow: 0 0 0 var(--ink); }
.dc-dot { top: -6px; right: -6px; }
.dc-claim:disabled { cursor: default; opacity: .6; box-shadow: none; }

.dc-cta { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 10px; padding: 8px 12px; border-radius: 10px; background: #fff8ec; font-size: .74rem; color: rgba(0,0,0,.6); text-decoration: none; }
.dc-cta b { color: #b45309; }
.dc-cta:active { opacity: .6; }

.dc-breakdown { background: rgba(0,0,0,.03); border-radius: 10px; padding: 8px 12px; margin-top: 10px; }
.dc-breakdown summary { font-size: .74rem; font-weight: 700; color: var(--primary-dark); cursor: pointer; }
.dc-breakdown[open] summary { margin-bottom: 4px; }
.dc-row { display: flex; justify-content: space-between; align-items: center; font-size: .74rem; color: rgba(0,0,0,.6); padding: 3px 0; }
.dc-row b { color: #059669; }
.dc-bonus b { color: #ec4899; }
.dc-total { border-top: 1px dashed rgba(0,0,0,.12); margin-top: 4px; padding-top: 6px; font-weight: 800; color: rgba(0,0,0,.8); }
.dc-total b { color: #b45309; }
</style>
