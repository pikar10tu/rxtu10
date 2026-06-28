<!-- BattleReplay v2 — event-driven (dispatch ตาม event.t) · melee/ranged · ป้ายธาตุ/crit/ตาย ·
     UI: ป้ายฝั่ง + badge ธาตุ + กรอบสีแยกข้าง = ดูรู้เรื่องว่าใครฝั่งไหน/ตีใคร/แพ้ทางมั้ย
     controls: pause/speed/skip · แตะตัว = pause + inspect (ช่อง passive รอ §5.5 master plan)
     ⚠️ ทุก emoji ผ่าน <Emoji> (Fluent self-host) — อย่าใส่ emoji ดิบในเทมเพลต (เป็น tofu บนบางเครื่อง) -->
<template>
  <div v-if="data" class="br-ov" :class="{ result: done }">
    <div class="br-box" :class="{ hitstop: hitStop }">
      <div v-if="introPhase" class="br-intro" @click="skipIntro">
        <span class="br-intro-txt" :class="introPhase">{{ introPhase === 'ready' ? 'READY?' : 'GO!' }}</span>
      </div>
      <div class="br-round" v-if="!done">รอบ {{ round }}</div>

      <div class="br-side foe-label"><i class="dot foe"></i> ศัตรู</div>
      <div class="br-team">
        <div v-for="(p, i) in data.botTeam" :key="'B'+i" :ref="el => setEl('B'+i, el)"
             class="br-unit foe" :class="unitClass('B'+i)" @click="inspect('B'+i)">
          <span class="br-el"><Emoji :char="elEmoji(p)" /></span>
          <span class="br-face"><Emoji :char="defOf(p.id).emoji" /></span>
          <div class="br-hp">
            <div class="br-hp-fill" :style="{ width: hpPct('B'+i) + '%' }"></div>
            <span v-for="(t, ti) in ticksFor('B'+i)" :key="ti" class="br-tick" :style="{ left: t + '%' }"></span>
          </div>
          <div class="br-stats"><span class="br-atk">{{ atkOf('B'+i) }}</span><span class="br-hpn foe">{{ curHp('B'+i) }}</span></div>
          <span v-for="pop in popsFor('B'+i)" :key="pop.k" class="br-pop" :class="popClass(pop)">-{{ pop.dmg }}</span>
          <span v-if="callouts['B'+i]" class="br-call" :class="callouts['B'+i].kind">
            {{ callouts['B'+i].text }}<Emoji :char="callouts['B'+i].icon" />
          </span>
          <span v-if="(hp['B'+i] ?? 100) <= 0" class="br-puff"><Emoji char="💀" /></span>
        </div>
      </div>

      <div class="br-vs"><Emoji char="⚔️" /> {{ data.vsLabel ?? ('ชั้น ' + data.cleared) }}</div>

      <div class="br-team">
        <div v-for="(p, i) in data.playerTeam" :key="'A'+i" :ref="el => setEl('A'+i, el)"
             class="br-unit me" :class="unitClass('A'+i)" @click="inspect('A'+i)">
          <span class="br-el"><Emoji :char="elEmoji(p)" /></span>
          <span class="br-face"><Emoji :char="defOf(p.id).emoji" /></span>
          <div class="br-hp">
            <div class="br-hp-fill mine" :style="{ width: hpPct('A'+i) + '%' }"></div>
            <span v-for="(t, ti) in ticksFor('A'+i)" :key="ti" class="br-tick" :style="{ left: t + '%' }"></span>
          </div>
          <div class="br-stats"><span class="br-atk">{{ atkOf('A'+i) }}</span><span class="br-hpn me">{{ curHp('A'+i) }}</span></div>
          <span v-for="pop in popsFor('A'+i)" :key="pop.k" class="br-pop" :class="popClass(pop)">-{{ pop.dmg }}</span>
          <span v-if="callouts['A'+i]" class="br-call" :class="callouts['A'+i].kind">
            {{ callouts['A'+i].text }}<Emoji :char="callouts['A'+i].icon" />
          </span>
          <span v-if="(hp['A'+i] ?? 100) <= 0" class="br-puff"><Emoji char="💀" /></span>
        </div>
      </div>
      <div class="br-side me-label"><i class="dot me"></i> ทีมคุณ</div>

      <!-- projectile layer (ranged) — พิกัดสัมพัทธ์กับ .br-box -->
      <div class="br-proj-layer">
        <span v-for="pj in projectiles" :key="pj.k" class="br-proj" :style="projStyle(pj)"><Emoji :char="pj.emoji" /></span>
      </div>

      <div class="br-ctrl">
        <template v-if="!done">
          <button class="br-btn sm" @click="togglePause"><Emoji :char="paused ? '▶️' : '⏸️'" /> {{ paused ? 'เล่น' : 'พัก' }}</button>
          <button class="br-btn sm" @click="cycleSpeed">เร็ว ×{{ speed }}</button>
          <button class="br-btn sm" @click="skipToEnd">ข้ามไปผล</button>
        </template>
        <template v-else>
          <div class="br-sum">
            <div class="br-result" :class="{ win: data.won }">{{ data.won ? (data.winText ?? `ชนะ! ขึ้นชั้น ${data.cleared + 1}`) : (data.loseText ?? 'แพ้ ลองใหม่ได้เลย') }}</div>
            <div v-if="data.won && (data.rewardText ?? data.cleared != null)" class="br-reward"><Emoji char="🎁" /> {{ data.rewardText ?? ('ได้รับ: ขึ้นชั้น ' + (data.cleared + 1)) }}</div>

            <div class="br-sum-team">
              <div class="br-sum-head"><i class="dot me"></i> ทีมคุณ</div>
              <div v-for="u in summary.teamA" :key="u.uid" class="br-sum-row" :class="{ mvp: summary.mvp.A === u.uid, win: data.won, dead: u.dead }">
                <span v-if="summary.mvp.A === u.uid" class="br-mvp">MVP</span>
                <span class="br-sum-face"><Emoji :char="defOf(u.id).emoji" /></span>
                <span class="br-sum-dmg"><Emoji char="⚔️" />{{ u.dmgDealt }}</span>
                <span class="br-sum-dmg taken"><Emoji char="🛡️" />{{ u.dmgTaken }}</span>
              </div>
            </div>

            <div class="br-sum-team">
              <div class="br-sum-head"><i class="dot foe"></i> ศัตรู</div>
              <div v-for="u in summary.teamB" :key="u.uid" class="br-sum-row" :class="{ mvp: summary.mvp.B === u.uid, win: !data.won, dead: u.dead }">
                <span v-if="summary.mvp.B === u.uid" class="br-mvp">MVP</span>
                <span class="br-sum-face"><Emoji :char="defOf(u.id).emoji" /></span>
                <span class="br-sum-dmg"><Emoji char="⚔️" />{{ u.dmgDealt }}</span>
                <span class="br-sum-dmg taken"><Emoji char="🛡️" />{{ u.dmgTaken }}</span>
              </div>
            </div>
          </div>
          <button class="br-btn" @click="$emit('close')">ปิด</button>
        </template>
      </div>
    </div>

    <!-- inspect popover — pause + ดูสเตตัส combat จริง + ช่อง passive (รอบนี้ยังว่าง '—') -->
    <div v-if="inspectUid && insp" class="br-inspect" @click.self="inspectUid = null">
      <div class="br-card">
        <div class="br-card-emoji"><Emoji :char="insp.def.emoji" /></div>
        <div class="br-card-name">{{ insp.def.name }}</div>
        <div class="br-card-row"><span>ธาตุ</span><b><Emoji :char="insp.elEmoji" /> {{ insp.elName }}</b></div>
        <div class="br-card-row"><span>ระดับ</span><b>{{ rarityLabel(insp.def.rarity) }} · เกรด {{ insp.grade }}</b></div>
        <div class="br-card-row"><span>พลังโจมตี</span><b>{{ insp.atk }}</b></div>
        <div class="br-card-row"><span>พลังชีวิต</span><b>{{ insp.hpNow }} / {{ insp.hpMax }}</b></div>
        <div class="br-card-pass"><span>Passive</span><b>{{ insp.passive ? insp.passive.name : 'เร็วๆ นี้' }}</b></div>
        <button class="br-btn sm" @click="inspectUid = null">ปิด</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { ref, computed, watch, onUnmounted } from 'vue'
import { getPetDef, atkStyleOf, projectileOf, passiveOf, ELEMENTS, EL_NAME } from '../../data/index.js'
import { RARITY } from '../../data/index.js'
import { buildCombatant } from '../../data/battle.js'
import { computeBattleSummary } from '../../utils/battleSummary.js'

const props = defineProps({ data: { type: Object, default: null } })
defineEmits(['close'])

// baseDelay = ระยะห่างต่อจังหวะที่ ×1 (มากกว่าเวลาเคลื่อนไหวเสมอ กันทับกัน) — กดเร่ง ×2/×4 ได้
const REPLAY_CFG = { baseDelay: 380, speeds: [1, 2, 4], lungeMs: 150, projMs: 280, hitStopMs: 130 }

const defOf = (id) => getPetDef(id) || { emoji: '❓' }
const elEmoji = (p) => ELEMENTS[p?.element]?.emoji || '✊'

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
const callouts = ref({})         // uid → {k, text, icon, kind}
const hitStop = ref(false)
const introPhase = ref(null)   // 'ready' | 'go' | null (null = เริ่มเล่น log แล้ว)
let introTimer = null
let timer = null, popKey = 0, projKey = 0, calloutKey = 0
let maxHp = {}, unitAtk = {}     // uid → maxHp / atk (static ต่อ unit จาก buildCombatant)
const els = {}                   // uid → DOM el (วัดตำแหน่ง melee/ranged)
function setEl(uid, el) { if (el) els[uid] = el }

// ── การ์ดสไตล์ Hearthstone: ATK/HP เป็นเลข + หลอดเลือดขีดทุก 50 HP ──
function atkOf(uid) { return unitAtk[uid] ?? 0 }
function curHp(uid) { return Math.round((maxHp[uid] || 0) * (hp.value[uid] ?? 100) / 100) }
function ticksFor(uid) {
  const max = maxHp[uid] || 1, out = []
  for (let h = 50; h < max; h += 50) out.push((h / max) * 100)  // % ตำแหน่งขีดทุก 50 HP
  return out
}

const log = computed(() => props.data?.result?.log || [])
const done = computed(() => idx.value >= log.value.length)
const summary = computed(() => done.value
  ? computeBattleSummary(log.value, props.data?.playerTeam || [], props.data?.botTeam || [])
  : null)
function uname(uid) { return defForUid(uid)?.name || '?' }
const delay = computed(() => REPLAY_CFG.baseDelay / speed.value)

function buildMax(d) {
  maxHp = {}; unitAtk = {}
  const add = (p, uid) => { const c = buildCombatant(p); maxHp[uid] = Math.round(c.maxHp) || 1; unitAtk[uid] = Math.round(c.atk) }
  ;(d?.botTeam || []).forEach((p, i) => add(p, 'B' + i))
  ;(d?.playerTeam || []).forEach((p, i) => add(p, 'A' + i))
}
function reset() {
  clearTimeout(timer); clearTimeout(introTimer); introPhase.value = null   // กันค้างตอน replay ใหม่
  idx.value = 0; round.value = 1; pops.value = {}; flashing.value = null; acting.value = null
  paused.value = false; inspectUid.value = null; projectiles.value = []; callouts.value = {}; hitStop.value = false
  const h = {}; Object.keys(maxHp).forEach(uid => { h[uid] = 100 }); hp.value = h
  runIntro()
}

// intro READY?→GO! ก่อนเริ่มเล่น log (แตะข้ามได้)
function runIntro() {
  introPhase.value = 'ready'
  introTimer = setTimeout(() => {
    introPhase.value = 'go'
    introTimer = setTimeout(() => { introPhase.value = null; step() }, 400)
  }, 700)
}
function skipIntro() {
  if (introPhase.value === null) return
  clearTimeout(introTimer)
  introPhase.value = null
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
    el.style.transform = `translate(${(t.x - a.x) * 0.55}px, ${(t.y - a.y) * 0.55}px) scale(1.12)`
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
      const cal = e.eff === 'super' ? { text: 'แพ้ทาง! ', icon: '⚡' } : { text: 'ต้านทาน ', icon: '🛡️' }
      callouts.value = { ...callouts.value, [e.target]: { k: ck, ...cal, kind: e.eff } }
      setTimeout(() => { if (callouts.value[e.target]?.k === ck) { const c = { ...callouts.value }; delete c[e.target]; callouts.value = c } }, 750)
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
function rarityLabel(r) { return RARITY[r]?.label || r }
const insp = computed(() => {
  const uid = inspectUid.value; if (!uid) return null
  const i = parseInt(uid.slice(1), 10)
  const arr = uid[0] === 'A' ? props.data?.playerTeam : props.data?.botTeam
  const p = arr?.[i] || {}
  const c = buildCombatant(p)
  const def = getPetDef(p.id) || { emoji: '❓', name: '?', element: 'scissors', rarity: 'common' }
  return {
    def, grade: p.grade || 0, atk: Math.round(c.atk), hpMax: Math.round(c.maxHp),
    hpNow: Math.round(c.maxHp * (hp.value[uid] ?? 100) / 100), passive: passiveOf(def),
    elEmoji: ELEMENTS[def.element]?.emoji || '✊', elName: EL_NAME[def.element] || def.element,
  }
})

watch(() => props.data, (d) => { if (d) { buildMax(d); reset() } }, { immediate: true })
onUnmounted(() => { clearTimeout(timer); clearTimeout(introTimer) })
</script>

<style scoped>
.br-ov { position: fixed; inset: 0; z-index: 420; background: rgba(15,23,42,.88); display: flex; align-items: center; justify-content: center; padding: 16px; }
/* result state อาจสูงเกินจอ (สรุป + MVP 2 ทีม + ปุ่มปิด) → ให้ overlay เลื่อนได้
   ไม่งั้นปุ่ม "ปิด" หลุดใต้จอ ดูเหมือนโดน bottom-nav บัง. replay phase ยังล็อกกลางจอเหมือนเดิม */
.br-ov.result { align-items: flex-start; overflow-y: auto; -webkit-overflow-scrolling: touch;
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px)); }
.br-box { width: 100%; max-width: 440px; display: flex; flex-direction: column; gap: 8px; position: relative; }
/* margin:auto = จัดกลางแนวตั้งเมื่อเนื้อหาเตี้ย, เลื่อนได้เมื่อสูงเกินจอ */
.br-ov.result .br-box { margin: auto 0; }
.br-box.hitstop { animation: br-hitstop .12s; }
@keyframes br-hitstop { 0%,100% { transform: scale(1) } 50% { transform: scale(1.012) } }
.br-round { text-align: center; color: #fff; font-weight: 800; font-size: .82rem; letter-spacing: .06em; margin-bottom: 2px; }

.br-side { display: flex; align-items: center; gap: 6px; font-size: .72rem; font-weight: 800; color: rgba(255,255,255,.8); padding: 0 2px; }
.br-side .dot { width: 8px; height: 8px; border-radius: 999px; display: inline-block; }
.dot.foe { background: #f87171; }
.dot.me { background: #34d399; }
.me-label { margin-top: 2px; }

.br-team { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.br-unit { position: relative; aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; background: rgba(255,255,255,.06); border: 2px solid transparent; border-radius: 16px; transition: transform .1s, box-shadow .15s, border-color .15s; cursor: pointer; }
.br-unit.foe { border-color: rgba(248,113,113,.35); }
.br-unit.me  { border-color: rgba(52,211,153,.4); }
.br-face { font-size: 2rem; line-height: 1; }
.br-el { position: absolute; top: 3px; left: 3px; font-size: .8rem; background: rgba(0,0,0,.45); border-radius: 8px; padding: 1px 3px; line-height: 1; }
.br-unit.acting { transform: translateY(-4px) scale(1.14); z-index: 3; box-shadow: 0 0 0 3px #fde68a, 0 6px 16px rgba(0,0,0,.4); }
.br-unit.flash { animation: br-shake .2s; box-shadow: 0 0 0 3px #f87171; }
.br-unit.dead { opacity: .25; filter: grayscale(1); }
@keyframes br-shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-5px) } 75% { transform: translateX(5px) } }

.br-hp { position: relative; width: 84%; height: 7px; background: rgba(0,0,0,.35); border-radius: 999px; overflow: hidden; }
.br-hp-fill { height: 100%; background: #ef4444; border-radius: 999px; transition: width .2s ease-out; }
.br-hp-fill.mine { background: #34d399; }
.br-tick { position: absolute; top: 0; width: 1px; height: 100%; background: rgba(255,255,255,.55); }
.br-stats { display: flex; justify-content: space-between; width: 84%; margin-top: 3px; }
.br-atk, .br-hpn { font-size: .58rem; font-weight: 800; color: #fff; line-height: 1; padding: 2px 5px; border-radius: 999px; min-width: 14px; text-align: center; }
.br-atk { background: #f59e0b; }       /* ATK = amber (Hearthstone-ish) */
.br-hpn.foe { background: #ef4444; }    /* HP ศัตรู = แดง */
.br-hpn.me { background: #16a34a; }     /* HP ทีมคุณ = เขียว */

.br-pop { position: absolute; top: 0; font-weight: 800; font-size: .9rem; color: #fecaca; text-shadow: 0 1px 2px rgba(0,0,0,.6); animation: br-rise .6s ease-out forwards; pointer-events: none; }
.br-pop.crit { color: #fbbf24; font-size: 1.2rem; }
.br-pop.super { color: #fca5a5; }
.br-pop.weak { color: #cbd5e1; font-size: .78rem; }
@keyframes br-rise { from { transform: translateY(0); opacity: 1 } to { transform: translateY(-24px); opacity: 0 } }

.br-call { position: absolute; top: -16px; display: inline-flex; align-items: center; gap: 2px; font-weight: 800; font-size: .6rem; white-space: nowrap; padding: 2px 6px; border-radius: 7px; animation: br-rise .75s ease-out forwards; pointer-events: none; z-index: 4; }
.br-call.super { background: #ef4444; color: #fff; }
.br-call.weak { background: rgba(203,213,225,.95); color: #334155; }

.br-puff { position: absolute; font-size: 1.2rem; animation: br-puff .5s ease-out forwards; pointer-events: none; }
@keyframes br-puff { from { transform: translateY(0) scale(.6); opacity: 1 } to { transform: translateY(-16px) scale(1.25); opacity: 0 } }

.br-proj-layer { position: absolute; inset: 0; pointer-events: none; z-index: 5; }
.br-proj { position: absolute; left: 0; top: 0; font-size: 1.4rem; transform: translate(var(--x0), var(--y0)); animation: br-fly linear forwards; }
@keyframes br-fly { from { transform: translate(var(--x0), var(--y0)) } to { transform: translate(var(--x1), var(--y1)) } }

.br-vs { text-align: center; color: rgba(255,255,255,.85); font-weight: 800; font-size: .82rem; letter-spacing: .04em; display: flex; align-items: center; justify-content: center; gap: 5px; padding: 3px 0; }

.br-ctrl { display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
.br-btn { border: 2px solid #fff; background: rgba(255,255,255,.14); color: #fff; border-radius: 12px; padding: 10px 22px; font-family: inherit; font-weight: 800; cursor: pointer; transition: background .12s; }
.br-btn:active { background: rgba(255,255,255,.28); }
.br-btn.sm { padding: 9px 14px; font-size: .82rem; }
.br-result { font-size: 1.2rem; font-weight: 800; color: #fff; }
.br-result.win { color: #34d399; }

.br-inspect { position: fixed; inset: 0; z-index: 430; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.5); }
.br-card { background: #1e293b; color: #fff; border: 2px solid #fff; border-radius: 18px; padding: 16px 18px; width: 250px; display: flex; flex-direction: column; gap: 7px; }
.br-card-emoji { font-size: 2.8rem; text-align: center; }
.br-card-name { text-align: center; font-weight: 800; font-size: 1.1rem; margin-bottom: 4px; }
.br-card-row, .br-card-pass { display: flex; justify-content: space-between; align-items: center; font-size: .82rem; }
.br-card-row span, .br-card-pass span { color: rgba(255,255,255,.6); }
.br-card-pass { border-top: 1px solid rgba(255,255,255,.15); margin-top: 4px; padding-top: 7px; }
.br-card .br-btn { margin-top: 10px; }

.br-intro { position: absolute; inset: 0; z-index: 10; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.br-intro-txt { font-weight: 900; color: #fff; text-shadow: 0 2px 12px rgba(0,0,0,.6); letter-spacing: .05em; }
.br-intro-txt.ready { font-size: 2.2rem; animation: br-ready .7s ease; }
.br-intro-txt.go { font-size: 3.4rem; color: #fde68a; animation: br-go .4s ease; }
@keyframes br-ready { from { opacity: 0; transform: scale(.7) } to { opacity: 1; transform: scale(1) } }
@keyframes br-go { from { opacity: 0; transform: scale(1.6) } to { opacity: 1; transform: scale(1) } }

.br-sum { width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
.br-reward { text-align: center; color: #fde68a; font-weight: 800; font-size: .8rem; }
.br-sum-team { background: rgba(255,255,255,.06); border-radius: 12px; padding: 8px; }
.br-sum-head { display: flex; align-items: center; gap: 6px; color: rgba(255,255,255,.8); font-weight: 800; font-size: .72rem; margin-bottom: 6px; }
.br-sum-head .dot { width: 8px; height: 8px; border-radius: 999px; }
.br-sum-row { position: relative; display: flex; align-items: center; gap: 8px; padding: 5px 8px; border-radius: 9px; border: 2px solid transparent; }
.br-sum-row.dead { opacity: .45; }
.br-sum-row.mvp.win { border-color: #fbbf24; background: rgba(251,191,36,.12); }
.br-sum-row.mvp:not(.win) { border-color: #c084fc; background: rgba(192,132,252,.12); }
.br-mvp { position: absolute; top: -8px; left: 8px; font-size: .54rem; font-weight: 900; color: #1e293b; background: #fbbf24; padding: 1px 5px; border-radius: 999px; }
.br-sum-row.mvp:not(.win) .br-mvp { background: #c084fc; color: #fff; }
.br-sum-face { font-size: 1.3rem; }
.br-sum-dmg { font-size: .68rem; font-weight: 800; color: #fde68a; display: inline-flex; align-items: center; gap: 2px; }
.br-sum-dmg.taken { color: #fca5a5; margin-left: auto; }
</style>
