<!-- BattleReplay v2 — event-driven (dispatch ตาม event.t) · controls: pause/speed/skip · ป้ายรอบ
     โครงนี้รองรับ event ใหม่ (passive/heal/…) แค่เพิ่ม handler — ดู docs/economy-battle-master-plan.md §5.5 -->
<template>
  <div v-if="data" class="br-ov">
    <div class="br-box">
      <div class="br-round" v-if="!done">รอบ {{ round }}</div>

      <div class="br-team">
        <div v-for="(p, i) in data.botTeam" :key="'B'+i" :ref="el => setEl('B'+i, el)"
             class="br-unit" :class="unitClass('B'+i)" @click="inspect('B'+i)">
          <Emoji :char="defOf(p.id).emoji" />
          <div class="br-hp"><div class="br-hp-fill" :style="{ width: hpPct('B'+i) + '%' }"></div></div>
          <span v-for="pop in popsFor('B'+i)" :key="pop.k" class="br-pop" :class="popClass(pop)">-{{ pop.dmg }}</span>
        </div>
      </div>

      <div class="br-vs">⚔️ ชั้น {{ data.cleared }}</div>

      <div class="br-team">
        <div v-for="(p, i) in data.playerTeam" :key="'A'+i" :ref="el => setEl('A'+i, el)"
             class="br-unit me" :class="unitClass('A'+i)" @click="inspect('A'+i)">
          <Emoji :char="defOf(p.id).emoji" />
          <div class="br-hp"><div class="br-hp-fill mine" :style="{ width: hpPct('A'+i) + '%' }"></div></div>
          <span v-for="pop in popsFor('A'+i)" :key="pop.k" class="br-pop" :class="popClass(pop)">-{{ pop.dmg }}</span>
        </div>
      </div>

      <div class="br-ctrl">
        <template v-if="!done">
          <button class="br-btn sm" @click="togglePause">{{ paused ? '▶' : '⏸' }}</button>
          <button class="br-btn sm" @click="cycleSpeed">×{{ speed }}</button>
          <button class="br-btn sm" @click="skipToEnd">ข้ามไปผล</button>
        </template>
        <template v-else>
          <div class="br-result" :class="{ win: data.won }">{{ data.won ? `ชนะ! ขึ้นชั้น ${data.cleared + 1}` : 'แพ้ ลองใหม่ได้เลย' }}</div>
          <button class="br-btn" @click="$emit('close')">ปิด</button>
        </template>
      </div>
    </div>

    <!-- inspect popover (Task 7 เติมเนื้อใน) -->
    <div v-if="inspectUid" class="br-inspect" @click.self="inspectUid = null"></div>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { ref, computed, watch, onUnmounted } from 'vue'
import { getPetDef } from '../../data/index.js'
import { buildCombatant } from '../../data/battle.js'

const props = defineProps({ data: { type: Object, default: null } })
defineEmits(['close'])

const REPLAY_CFG = { baseDelay: 180, speeds: [1, 2, 4] }  // จูนง่าย

const defOf = (id) => getPetDef(id) || { emoji: '❓' }

const idx = ref(0)
const round = ref(1)
const paused = ref(false)
const speed = ref(1)
const hp = ref({})
const pops = ref({})
const flashing = ref(null)
const acting = ref(null)
const inspectUid = ref(null)
let timer = null, popKey = 0
let maxHp = {}
const els = {}                 // uid → DOM el (สำหรับวัดตำแหน่ง Task 7)
function setEl(uid, el) { if (el) els[uid] = el }

const log = computed(() => props.data?.result?.log || [])
const done = computed(() => idx.value >= log.value.length)
const delay = computed(() => REPLAY_CFG.baseDelay / speed.value)

function buildMax(d) {
  maxHp = {}
  ;(d?.botTeam || []).forEach((p, i) => { maxHp['B' + i] = buildCombatant(p).maxHp || 1 })
  ;(d?.playerTeam || []).forEach((p, i) => { maxHp['A' + i] = buildCombatant(p).maxHp || 1 })
}
function reset() {
  clearTimeout(timer)
  idx.value = 0; round.value = 1; pops.value = {}; flashing.value = null; acting.value = null
  paused.value = false; inspectUid.value = null
  const h = {}; Object.keys(maxHp).forEach(uid => { h[uid] = 100 }); hp.value = h
  step()
}

// ── event dispatch — เพิ่ม handler ใหม่ที่นี่ (passive/heal/…) ──
const handlers = {
  round(e) { round.value = e.n },               // ไม่หน่วง — ป้ายรอบอัปเดต
  attack(e) { applyAttack(e) },
  end() { acting.value = null; flashing.value = null },
}
function applyAttack(e) {
  acting.value = e.attacker
  flashing.value = e.target
  hp.value = { ...hp.value, [e.target]: Math.max(0, Math.round((e.targetHpAfter / (maxHp[e.target] || 1)) * 100)) }
  const k = popKey++
  pops.value = { ...pops.value, [e.target]: [...(pops.value[e.target] || []), { k, dmg: e.dmg, crit: e.crit, eff: e.eff }] }
  setTimeout(() => { pops.value = { ...pops.value, [e.target]: (pops.value[e.target] || []).filter(p => p.k !== k) } }, 600)
}

function step() {
  clearTimeout(timer)
  if (paused.value) return
  if (idx.value >= log.value.length) { acting.value = null; flashing.value = null; return }
  const e = log.value[idx.value]
  const h = handlers[e.t]
  if (h) h(e)                                   // type ที่ไม่รู้จัก = ข้ามเงียบ
  idx.value++
  const noDelay = e.t === 'round'               // round marker ไม่หน่วงเวลา
  if (idx.value < log.value.length) timer = setTimeout(step, noDelay ? 0 : delay.value)
  else { acting.value = null; flashing.value = null }
}

function togglePause() {
  paused.value = !paused.value
  if (!paused.value) { clearTimeout(timer); step() }   // เคลียร์ timer ค้างก่อนเล่นต่อ (กันรันซ้อน)
}
function cycleSpeed() {
  const s = REPLAY_CFG.speeds
  speed.value = s[(s.indexOf(speed.value) + 1) % s.length]
}
function skipToEnd() {
  clearTimeout(timer)
  const end = log.value[log.value.length - 1]
  // apply ผลสุดท้าย: ตัวที่ targetHpAfter ล่าสุด/ตาย
  const finalHp = {}; Object.keys(maxHp).forEach(uid => finalHp[uid] = 100)
  for (const ev of log.value) if (ev.t === 'attack') finalHp[ev.target] = Math.max(0, Math.round((ev.targetHpAfter / (maxHp[ev.target] || 1)) * 100))
  hp.value = finalHp; pops.value = {}; acting.value = null; flashing.value = null
  round.value = end?.rounds || round.value
  idx.value = log.value.length
}
function inspect(uid) { paused.value = true; clearTimeout(timer); inspectUid.value = uid }

function hpPct(uid) { return hp.value[uid] ?? 100 }
function popsFor(uid) { return pops.value[uid] || [] }
function popClass(pop) { return { crit: pop.crit, super: pop.eff === 'super', weak: pop.eff === 'weak' } }
function unitClass(uid) {
  return { acting: acting.value === uid, flash: flashing.value === uid, dead: (hp.value[uid] ?? 100) <= 0 }
}

watch(() => props.data, (d) => { if (d) { buildMax(d); reset() } }, { immediate: true })
onUnmounted(() => clearTimeout(timer))
</script>

<style scoped>
.br-ov { position: fixed; inset: 0; z-index: 420; background: rgba(15,23,42,.82); display: flex; align-items: center; justify-content: center; padding: 16px; }
.br-box { width: 100%; max-width: 440px; display: flex; flex-direction: column; gap: 14px; position: relative; }
.br-round { text-align: center; color: rgba(255,255,255,.7); font-weight: 800; font-size: .72rem; letter-spacing: .05em; }
.br-team { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.br-unit { position: relative; aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 2rem; background: rgba(255,255,255,.08); border-radius: 14px; transition: transform .1s; cursor: pointer; }
.br-unit.acting { transform: scale(1.18); z-index: 2; }
.br-unit.flash { animation: br-shake .18s; }
.br-unit.dead { opacity: .25; filter: grayscale(1); }
@keyframes br-shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-4px) } 75% { transform: translateX(4px) } }
.br-hp { width: 80%; height: 5px; background: rgba(255,255,255,.2); border-radius: 999px; margin-top: 4px; overflow: hidden; }
.br-hp-fill { height: 100%; background: #ef4444; transition: width .15s; }
.br-hp-fill.mine { background: #34d399; }
.br-pop { position: absolute; top: -2px; font-weight: 800; font-size: .8rem; color: #fca5a5; animation: br-rise .6s ease-out forwards; pointer-events: none; }
.br-pop.crit { color: #fbbf24; font-size: 1.05rem; }
.br-pop.super { color: #f87171; }
.br-pop.weak { color: #cbd5e1; font-size: .7rem; }
@keyframes br-rise { from { transform: translateY(0); opacity: 1 } to { transform: translateY(-22px); opacity: 0 } }
.br-vs { text-align: center; color: #fff; font-weight: 800; font-size: .9rem; letter-spacing: .04em; }
.br-ctrl { display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 10px; margin-top: 4px; flex-wrap: wrap; }
.br-btn { border: 2px solid #fff; background: rgba(255,255,255,.12); color: #fff; border-radius: 12px; padding: 10px 24px; font-family: inherit; font-weight: 800; cursor: pointer; }
.br-btn.sm { padding: 8px 14px; font-size: .82rem; }
.br-result { font-size: 1.15rem; font-weight: 800; color: #fff; }
.br-result.win { color: #34d399; }
.br-inspect { position: absolute; inset: 0; }
</style>
