<!-- BattleReplay v2 — event-driven (dispatch ตาม event.t) · melee/ranged · ป้ายธาตุ/crit/ตาย ·
     controls: pause/speed/skip · แตะตัว = pause + inspect (มีช่อง passive รอ §5.5 master plan) -->
<template>
  <div v-if="data" class="br-ov">
    <div class="br-box" :class="{ hitstop: hitStop }">
      <div class="br-round" v-if="!done">รอบ {{ round }}</div>

      <div class="br-team">
        <div v-for="(p, i) in data.botTeam" :key="'B'+i" :ref="el => setEl('B'+i, el)"
             class="br-unit" :class="unitClass('B'+i)" @click="inspect('B'+i)">
          <Emoji :char="defOf(p.id).emoji" />
          <div class="br-hp"><div class="br-hp-fill" :style="{ width: hpPct('B'+i) + '%' }"></div></div>
          <span v-for="pop in popsFor('B'+i)" :key="pop.k" class="br-pop" :class="popClass(pop)">-{{ pop.dmg }}</span>
          <span v-if="callouts['B'+i]" class="br-call" :class="callouts['B'+i].kind">{{ callouts['B'+i].text }}</span>
          <span v-if="(hp['B'+i] ?? 100) <= 0" class="br-puff">💀</span>
        </div>
      </div>

      <div class="br-vs">⚔️ ชั้น {{ data.cleared }}</div>

      <div class="br-team">
        <div v-for="(p, i) in data.playerTeam" :key="'A'+i" :ref="el => setEl('A'+i, el)"
             class="br-unit me" :class="unitClass('A'+i)" @click="inspect('A'+i)">
          <Emoji :char="defOf(p.id).emoji" />
          <div class="br-hp"><div class="br-hp-fill mine" :style="{ width: hpPct('A'+i) + '%' }"></div></div>
          <span v-for="pop in popsFor('A'+i)" :key="pop.k" class="br-pop" :class="popClass(pop)">-{{ pop.dmg }}</span>
          <span v-if="callouts['A'+i]" class="br-call" :class="callouts['A'+i].kind">{{ callouts['A'+i].text }}</span>
          <span v-if="(hp['A'+i] ?? 100) <= 0" class="br-puff">💀</span>
        </div>
      </div>

      <!-- projectile layer (ranged) — พิกัดสัมพัทธ์กับ .br-box -->
      <div class="br-proj-layer">
        <span v-for="pj in projectiles" :key="pj.k" class="br-proj" :style="projStyle(pj)">{{ pj.emoji }}</span>
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

    <!-- inspect popover — pause + ดูสเตตัส combat จริง + ช่อง passive (รอบนี้ยังว่าง '—') -->
    <div v-if="inspectUid && insp" class="br-inspect" @click.self="inspectUid = null">
      <div class="br-card">
        <div class="br-card-emoji"><Emoji :char="insp.def.emoji" /></div>
        <div class="br-card-name">{{ insp.def.name }}</div>
        <div class="br-card-row"><span>ธาตุ</span><b>{{ elName(insp.def.element) }}</b></div>
        <div class="br-card-row"><span>ระดับ</span><b>{{ rarityLabel(insp.def.rarity) }} · เกรด {{ insp.grade }}</b></div>
        <div class="br-card-row"><span>ATK</span><b>{{ insp.atk }}</b></div>
        <div class="br-card-row"><span>HP</span><b>{{ insp.hpNow }} / {{ insp.hpMax }}</b></div>
        <div class="br-card-pass"><span>Passive</span><b>{{ insp.passive ? insp.passive.name : '—' }}</b></div>
        <button class="br-btn sm" @click="inspectUid = null">ปิด</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { ref, computed, watch, onUnmounted } from 'vue'
import { getPetDef, atkStyleOf, projectileOf, passiveOf, ELEMENTS, RARITY } from '../../data/index.js'
import { buildCombatant } from '../../data/battle.js'

const props = defineProps({ data: { type: Object, default: null } })
defineEmits(['close'])

// baseDelay = ระยะห่างต่อจังหวะที่ ×1 (มากกว่าเวลาเคลื่อนไหวเสมอ กันทับกัน) — กดเร่ง ×2/×4 ได้
const REPLAY_CFG = { baseDelay: 380, speeds: [1, 2, 4], lungeMs: 150, projMs: 280, hitStopMs: 130 }

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
const projectiles = ref([])      // [{k, emoji, x0,y0,x1,y1}]
const callouts = ref({})         // uid → {k, text, kind}
const hitStop = ref(false)
let timer = null, popKey = 0, projKey = 0, calloutKey = 0
let maxHp = {}
const els = {}                   // uid → DOM el (วัดตำแหน่ง melee/ranged)
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
  paused.value = false; inspectUid.value = null; projectiles.value = []; callouts.value = {}; hitStop.value = false
  const h = {}; Object.keys(maxHp).forEach(uid => { h[uid] = 100 }); hp.value = h
  step()
}

// ── ตำแหน่ง/การเคลื่อนไหว ──
function centerOf(uid) {
  const el = els[uid]; const box = el?.closest('.br-box')
  if (!box || !el) return null
  const b = box.getBoundingClientRect(), r = el.getBoundingClientRect()
  return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 }
}
function defForUid(uid) {
  const i = parseInt(uid.slice(1), 10)
  const arr = uid[0] === 'A' ? props.data?.playerTeam : props.data?.botTeam
  return getPetDef(arr?.[i]?.id) || { emoji: '❓' }
}
function playMotion(e, onImpact) {
  const def = defForUid(e.attacker)
  if (atkStyleOf(def) === 'ranged') {
    const a = centerOf(e.attacker), t = centerOf(e.target)
    if (a && t) {
      const k = projKey++
      projectiles.value = [...projectiles.value, { k, emoji: projectileOf(def), x0: a.x, y0: a.y, x1: t.x, y1: t.y }]
      setTimeout(() => { projectiles.value = projectiles.value.filter(p => p.k !== k); onImpact() }, REPLAY_CFG.projMs / speed.value)
      return
    }
  }
  // melee: lunge เข้าหาเป้า แล้วเด้งกลับ (transform ชั่วคราว)
  const a = centerOf(e.attacker), t = centerOf(e.target), el = els[e.attacker]
  if (a && t && el) {
    el.style.transition = `transform ${REPLAY_CFG.lungeMs / speed.value}ms ease-out`
    el.style.transform = `translate(${(t.x - a.x) * 0.6}px, ${(t.y - a.y) * 0.6}px) scale(1.15)`
    setTimeout(() => {
      onImpact()
      el.style.transform = ''
      setTimeout(() => { el.style.transition = '' }, REPLAY_CFG.lungeMs / speed.value)
    }, REPLAY_CFG.lungeMs / speed.value)
    return
  }
  onImpact()
}

// ── event dispatch — เพิ่ม handler ใหม่ที่นี่ (passive/heal/…) ──
const handlers = {
  round(e) { round.value = e.n },
  attack(e) { applyAttack(e) },
  end() { acting.value = null; flashing.value = null },
}
function applyAttack(e) {
  acting.value = e.attacker
  playMotion(e, () => {
    flashing.value = e.target
    hp.value = { ...hp.value, [e.target]: Math.max(0, Math.round((e.targetHpAfter / (maxHp[e.target] || 1)) * 100)) }
    const k = popKey++
    pops.value = { ...pops.value, [e.target]: [...(pops.value[e.target] || []), { k, dmg: e.dmg, crit: e.crit, eff: e.eff }] }
    setTimeout(() => { pops.value = { ...pops.value, [e.target]: (pops.value[e.target] || []).filter(p => p.k !== k) } }, 600)
    if (e.eff === 'super' || e.eff === 'weak') {
      const ck = calloutKey++
      callouts.value = { ...callouts.value, [e.target]: { k: ck, text: e.eff === 'super' ? 'แพ้ทาง! ⚡' : 'ต้านทาน 🛡️', kind: e.eff } }
      setTimeout(() => { if (callouts.value[e.target]?.k === ck) { const c = { ...callouts.value }; delete c[e.target]; callouts.value = c } }, 700)
    }
    if (e.crit) { hitStop.value = true; setTimeout(() => hitStop.value = false, REPLAY_CFG.hitStopMs / speed.value) }
  })
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
  const extra = (e.t === 'attack' && e.crit) ? REPLAY_CFG.hitStopMs / speed.value : 0  // hit-stop ตอน crit
  if (idx.value < log.value.length) timer = setTimeout(step, noDelay ? 0 : delay.value + extra)
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
  const finalHp = {}; Object.keys(maxHp).forEach(uid => finalHp[uid] = 100)
  for (const ev of log.value) if (ev.t === 'attack') finalHp[ev.target] = Math.max(0, Math.round((ev.targetHpAfter / (maxHp[ev.target] || 1)) * 100))
  hp.value = finalHp; pops.value = {}; callouts.value = {}; projectiles.value = []; acting.value = null; flashing.value = null
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

// ── inspect helpers ──
function projStyle(pj) {
  return { '--x0': pj.x0 + 'px', '--y0': pj.y0 + 'px', '--x1': pj.x1 + 'px', '--y1': pj.y1 + 'px',
           animationDuration: (REPLAY_CFG.projMs / speed.value) + 'ms' }
}
function elName(el) { return ELEMENTS[el]?.emoji || '?' }
function rarityLabel(r) { return RARITY[r]?.label || r }
const insp = computed(() => {
  const uid = inspectUid.value; if (!uid) return null
  const i = parseInt(uid.slice(1), 10)
  const arr = uid[0] === 'A' ? props.data?.playerTeam : props.data?.botTeam
  const p = arr?.[i] || {}
  const c = buildCombatant(p)
  return {
    def: getPetDef(p.id) || { emoji: '❓', name: '?', element: 'scissors', rarity: 'common' },
    grade: p.grade || 0, atk: Math.round(c.atk), hpMax: Math.round(c.maxHp),
    hpNow: Math.round(c.maxHp * (hp.value[uid] ?? 100) / 100), passive: passiveOf(getPetDef(p.id)),
  }
})

watch(() => props.data, (d) => { if (d) { buildMax(d); reset() } }, { immediate: true })
onUnmounted(() => clearTimeout(timer))
</script>

<style scoped>
.br-ov { position: fixed; inset: 0; z-index: 420; background: rgba(15,23,42,.82); display: flex; align-items: center; justify-content: center; padding: 16px; }
.br-box { width: 100%; max-width: 440px; display: flex; flex-direction: column; gap: 14px; position: relative; }
.br-box.hitstop { animation: br-hitstop .12s; }
@keyframes br-hitstop { 0%,100% { transform: scale(1) } 50% { transform: scale(1.012) } }
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
.br-call { position: absolute; top: -18px; font-weight: 800; font-size: .62rem; white-space: nowrap; padding: 1px 5px; border-radius: 6px; animation: br-rise .7s ease-out forwards; pointer-events: none; }
.br-call.super { background: #f87171; color: #fff; }
.br-call.weak { background: rgba(203,213,225,.9); color: #334155; }
.br-puff { position: absolute; font-size: 1.1rem; animation: br-puff .5s ease-out forwards; pointer-events: none; }
@keyframes br-puff { from { transform: translateY(0) scale(.6); opacity: 1 } to { transform: translateY(-14px) scale(1.2); opacity: 0 } }
.br-proj-layer { position: absolute; inset: 0; pointer-events: none; z-index: 5; }
.br-proj { position: absolute; left: 0; top: 0; font-size: 1.3rem; transform: translate(var(--x0), var(--y0)); animation: br-fly linear forwards; }
@keyframes br-fly { from { transform: translate(var(--x0), var(--y0)) } to { transform: translate(var(--x1), var(--y1)) } }
.br-vs { text-align: center; color: #fff; font-weight: 800; font-size: .9rem; letter-spacing: .04em; }
.br-ctrl { display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 10px; margin-top: 4px; flex-wrap: wrap; }
.br-btn { border: 2px solid #fff; background: rgba(255,255,255,.12); color: #fff; border-radius: 12px; padding: 10px 24px; font-family: inherit; font-weight: 800; cursor: pointer; }
.br-btn.sm { padding: 8px 14px; font-size: .82rem; }
.br-result { font-size: 1.15rem; font-weight: 800; color: #fff; }
.br-result.win { color: #34d399; }
.br-inspect { position: fixed; inset: 0; z-index: 430; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.4); }
.br-card { background: #1e293b; color: #fff; border: 2px solid #fff; border-radius: 16px; padding: 16px 18px; width: 240px; display: flex; flex-direction: column; gap: 6px; }
.br-card-emoji { font-size: 2.6rem; text-align: center; }
.br-card-name { text-align: center; font-weight: 800; font-size: 1.05rem; margin-bottom: 4px; }
.br-card-row, .br-card-pass { display: flex; justify-content: space-between; font-size: .8rem; }
.br-card-row span, .br-card-pass span { color: rgba(255,255,255,.6); }
.br-card-pass { border-top: 1px solid rgba(255,255,255,.15); margin-top: 4px; padding-top: 6px; }
.br-card .br-btn { margin-top: 8px; }
</style>
