<!-- BattleReplay v2 — event-driven (dispatch ตาม event.t) · melee/ranged · ป้ายธาตุ/crit/ตาย ·
     UI: ป้ายฝั่ง + badge ธาตุ + กรอบสีแยกข้าง = ดูรู้เรื่องว่าใครฝั่งไหน/ตีใคร/แพ้ทางมั้ย
     controls: pause/speed/skip · แตะตัว = pause + inspect (ช่อง passive รอ §5.5 master plan)
     ⚠️ ทุก emoji ผ่าน <Emoji> (Fluent self-host) — อย่าใส่ emoji ดิบในเทมเพลต (เป็น tofu บนบางเครื่อง) -->
<template>
  <!-- Teleport ไป body: #main-content (position:fixed) = stacking context → z420 สู้ #bottom-nav (z200) ไม่ได้ถ้า render ในนี้
       → nav โผล่ทะลุก้นจอสู้. ย้ายทั้งชุด (peek/result/inspect เป็นลูกข้างใน z คงเดิม) ไป root (ดู CLAUDE.md) -->
  <Teleport to="body">
  <div v-if="data" class="br-ov" :class="['br-theme-' + theme, { 'br-lite': lite }]">
    <div class="br-box">
      <div v-if="introPhase" class="br-intro" @click="skipIntro">
        <span class="br-intro-txt" :class="introPhase">{{ introPhase === 'ready' ? 'READY?' : 'GO!' }}</span>
      </div>
      <div class="br-round" v-if="!done">รอบ {{ round }}</div>
      <div v-if="showFps" class="br-fps" :class="{ bad: fpsWorst > 33, warn: fpsWorst > 16 && fpsWorst <= 33 }">{{ fpsWorst }}ms</div>

      <div class="br-side foe-label"><i class="dot foe"></i> ศัตรู</div>
      <div class="br-team">
        <div v-for="(p, i) in data.botTeam" :key="'B'+i" :ref="el => setEl('B'+i, el)"
             class="br-unit foe" :class="unitClass('B'+i)" @click="inspect('B'+i)">
          <span class="br-el"><Emoji :char="elEmoji(p)" /></span>
          <span class="br-face"><Emoji :char="defOf(p.id).emoji" /></span>
          <div class="br-hp">
            <div class="br-hp-fill" :style="{ transform: 'scaleX(' + hpPct('B'+i) / 100 + ')' }"></div>
            <span v-for="(t, ti) in ticksFor('B'+i)" :key="ti" class="br-tick" :style="{ left: t + '%' }"></span>
          </div>
          <div class="br-stats"><span class="br-atk">{{ atkOf('B'+i) }}</span><span class="br-hpn foe">{{ curHp('B'+i) }}</span></div>
          <span v-for="pop in popsFor('B'+i)" :key="pop.k" class="br-pop" :class="popClass(pop)" :style="{ marginLeft: pop.x + 'px' }">-{{ pop.dmg }}</span>
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
            <div class="br-hp-fill mine" :style="{ transform: 'scaleX(' + hpPct('A'+i) / 100 + ')' }"></div>
            <span v-for="(t, ti) in ticksFor('A'+i)" :key="ti" class="br-tick" :style="{ left: t + '%' }"></span>
          </div>
          <div class="br-stats"><span class="br-atk">{{ atkOf('A'+i) }}</span><span class="br-hpn me">{{ curHp('A'+i) }}</span></div>
          <span v-for="pop in popsFor('A'+i)" :key="pop.k" class="br-pop" :class="popClass(pop)" :style="{ marginLeft: pop.x + 'px' }">-{{ pop.dmg }}</span>
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

      <div class="br-ctrl" v-if="!done">
        <button class="br-btn sm" @click="togglePause"><Emoji :char="paused ? '▶️' : '⏸️'" /> {{ paused ? 'เล่น' : 'พัก' }}</button>
        <button class="br-btn sm" @click="cycleSpeed">เร็ว ×{{ speed }}</button>
        <button class="br-btn sm" @click="toggleLite"><Emoji :char="lite ? '✨' : '🚀'" /> {{ lite ? 'เอฟเฟกต์เต็ม' : 'โหมดลื่น' }}</button>
        <button class="br-btn sm" @click="skipToEnd">ข้ามไปผล</button>
      </div>
    </div>

    <!-- peek สนามหลังจบ: ปุ่มลอยกลับเข้าหน้าสรุป + ปิด (มีปุ่มปิดตรงนี้ด้วย ไม่ต้องกดดูสรุปกลับก่อน) -->
    <div v-if="resultReady && !resultOpen" class="br-peek-bar">
      <button class="br-btn sm br-peek-btn" @click="resultOpen = true"><Emoji char="📋" /> ดูสรุป</button>
      <button class="br-btn sm" @click="$emit('close')">ปิด</button>
    </div>

    <!-- modal สรุปผล — แตะนอกกล่อง = peek สนาม (ไม่ใช่ปิดทิ้ง กันกดพลาด) -->
    <div v-if="resultOpen && summary" class="br-result-ov" @click.self="resultOpen = false">
      <div class="br-modal">
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

        <div class="br-modal-btns">
          <button class="br-btn sm" @click="resultOpen = false"><Emoji char="👀" /> ดูสนาม</button>
          <button class="br-btn" @click="$emit('close')">ปิด</button>
        </div>
      </div>
    </div>

    <!-- inspect popover — pause + ดูสเตตัส combat จริง + ช่อง passive (รอบนี้ยังว่าง '—') -->
    <div v-if="inspectUid && insp" class="br-inspect" @click.self="inspectUid = null">
      <div class="br-card">
        <div class="br-card-emoji"><Emoji :char="insp.def.emoji" /></div>
        <div class="br-card-name">{{ insp.def.name }}</div>
        <div class="br-card-row"><span>ธาตุ</span><b><Emoji :char="insp.elEmoji" /> {{ insp.elName }}</b></div>
        <div class="br-card-row"><span>ระดับ</span><b>{{ rarityLabel(insp.def.rarity) }} · เกรด {{ GRADE_LABELS[Math.min(5, Math.max(0, insp.grade || 0))] }}</b></div>
        <div class="br-card-row"><span>พลังโจมตี</span><b>{{ insp.atk }}</b></div>
        <div class="br-card-row"><span>พลังชีวิต</span><b>{{ insp.hpNow }} / {{ insp.hpMax }}</b></div>
        <div class="br-card-pass"><span>Passive</span><b>{{ insp.passive ? insp.passive.name : 'เร็วๆ นี้' }}</b></div>
        <button class="br-btn sm" @click="inspectUid = null">ปิด</button>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { ref, computed, watch, onUnmounted } from 'vue'
import { getPetDef, atkStyleOf, projectileOf, passiveOf, ELEMENTS, EL_NAME, GRADE_LABELS } from '../../data/index.js'
import { RARITY } from '../../data/index.js'
import { buildCombatant } from '../../data/battle.js'
import { computeBattleSummary } from '../../utils/battleSummary.js'
import { fluentFile } from '../../utils/emoji.js'

const props = defineProps({
  data: { type: Object, default: null },
  theme: { type: String, default: 'tower' },   // 'arena' | 'tower' — พื้นหลังสนาม
})
defineEmits(['close'])

const BASE_URL = import.meta.env.BASE_URL

// baseDelay = ระยะห่างต่อจังหวะที่ ×1 (มากกว่าเวลาเคลื่อนไหวเสมอ กันทับกัน) — กดเร่ง ×2/×4 ได้
// windupMs = เงื้อก่อนตี (telegraph) · lungeMs = พุ่งขาไป (เด้งกลับอีกเท่าตัว) · popMs = เลขดาเมจค้างบนจอ
// resultDelayMs = เว้นจังหวะให้เห็นสนามจบก่อนเปิด modal สรุป (คงที่ ไม่หารด้วย speed)
// popMs คงที่เหมือนกัน (ตรงกับ CSS br-pop-rise .9s) — อ่านเลขทันแม้เร่ง ×4 อย่าหารด้วย speed
const REPLAY_CFG = { baseDelay: 380, speeds: [1, 2, 4], windupMs: 250, lungeMs: 250, projMs: 280, hitStopMs: 130, popMs: 900, resultDelayMs: 500,
  liteWindupMs: 90, liteMotionMs: 90 }   // โหมดลื่น: จังหวะสั้นลง ไม่มีการเคลื่อนไหว (แค่ไฮไลต์ + อัปเดตเลข)

// โหมดลดเอฟเฟกต์ (lite) — ตัด GPU layer + อนิเมชันที่ repaint หนัก ให้ลื่นบนเครื่องเบา/iOS Safari
// ดีฟอลต์: เปิดบน touch/มือถือ (coarse pointer) · จำค่าที่ผู้ใช้เลือกไว้ใน localStorage
const LITE_KEY = 'br-lite'
function initLite() {
  try { const s = localStorage.getItem(LITE_KEY); if (s !== null) return s === '1' } catch {}
  try { return window.matchMedia('(pointer: coarse)').matches } catch {}
  return false
}

const defOf = (id) => getPetDef(id) || { emoji: '❓' }
const elEmoji = (p) => ELEMENTS[p?.element]?.emoji || '✊'

const idx = ref(0)
const round = ref(1)
const paused = ref(false)
const speed = ref(1)
const lite = ref(initLite())
function toggleLite() {
  lite.value = !lite.value
  try { localStorage.setItem(LITE_KEY, lite.value ? '1' : '0') } catch {}
  // เคลียร์ transform ค้างตอนสลับกลางไฟต์ (กันการ์ดค้างผิดที่)
  Object.values(els).forEach(el => { if (el) { el.style.transform = ''; el.style.transition = ''; el.style.zIndex = '' } })
}
const hp = ref({})
const pops = ref({})
const flashing = ref(null)
const acting = ref(null)
const inspectUid = ref(null)
const projectiles = ref([])      // [{k, emoji, x0,y0,x1,y1}]
const callouts = ref({})         // uid → {k, text, icon, kind}
const introPhase = ref(null)   // 'ready' | 'go' | null (null = เริ่มเล่น log แล้ว)
const resultOpen = ref(false)    // modal สรุปโชว์อยู่
const resultReady = ref(false)   // จบไฟต์+ผ่านจังหวะรอแล้ว — ใช้โชว์ปุ่มลอย "ดูสรุป" ตอน peek
let resultTimer = null
let introTimer = null
const winding = ref(null)        // uid ที่กำลังเงื้อ (telegraph) — โชว์คลาส .windup
let gen = 0                      // generation guard — reset/skip เพิ่มค่า เพื่อให้ promise chain ค้างจาก wait() รู้ตัวว่าโดนยกเลิก
let timer = null, popKey = 0, projKey = 0, calloutKey = 0
const pendingTimers = new Set()  // เก็บ timer id จาก wait() ทั้งหมด — clear ตอน reset/skip/unmount กัน promise chain ค้างมาเขียน state เก่าทับ
function wait(ms) { return new Promise(r => { const t = setTimeout(r, ms); pendingTimers.add(t) }) }
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

// อุ่น cache+decode asset combat ทั้งหมดก่อนเริ่มเล่น (intro หน่วง ~1.1s) — dash/pop/projectile swap src กลางไฟต์
// ไม่งั้น decoding="sync" ครั้งแรกของแต่ละรูป = บล็อกเฟรม
const preloadedImgs = []
function preloadCombat(d) {
  const chars = new Set(['⚡', '🛡️', '💀', '💥'])
  for (const p of [...(d?.playerTeam || []), ...(d?.botTeam || [])]) {
    const def = getPetDef(p?.id); if (!def) continue
    if (def.emoji) chars.add(def.emoji)                                  // หน้าเพ็ท (dash sprite)
    if (atkStyleOf(def) === 'ranged') chars.add(projectileOf(def))       // projectile
  }
  for (const c of chars) {
    const f = fluentFile(c); if (!f) continue
    const img = new Image(); img.decoding = 'sync'; img.src = BASE_URL + f
    if (img.decode) img.decode().catch(() => {})                         // force decode ล่วงหน้า
    preloadedImgs.push(img)
  }
}
function reset() {
  gen++                                                                     // ยกเลิก promise chain ค้างทุกตัว (applyAttack/step เช็ค gen ทุกจุด)
  invalidateCenters()                                                       // ไฟต์ใหม่/ทีมใหม่ = วัดตำแหน่งใหม่
  clearTimeout(timer); clearTimeout(introTimer)
  clearTimeout(resultTimer); resultOpen.value = false; resultReady.value = false
  pendingTimers.forEach(clearTimeout); pendingTimers.clear()                // ตัด wait() ที่ค้างอยู่ทั้งหมด (windup/motion/hitstop)
  introPhase.value = null; winding.value = null                             // กันค้างตอน replay ใหม่
  Object.values(els).forEach(el => { if (el) { el.style.transform = ''; el.style.transition = ''; el.style.zIndex = '' } })  // ล้าง lunge/windup ค้างจากไฟต์ก่อน (component ถูก mount ค้างไว้ ใช้ซ้ำ)
  idx.value = 0; round.value = 1; pops.value = {}; flashing.value = null; acting.value = null
  paused.value = false; inspectUid.value = null; projectiles.value = []; callouts.value = {}
  const h = {}; Object.keys(maxHp).forEach(uid => { h[uid] = 100 }); hp.value = h
  runIntro()
  // log ว่าง = done ค้าง true ตั้งแต่แรก → watch(done) ไม่ยิงซ้ำ ต้องเปิดสรุปเองไม่งั้น overlay ไม่มีทางออก
  if (done.value) { resultReady.value = true; resultOpen.value = true }
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
// cache ตำแหน่งศูนย์กลาง unit (สัมพัทธ์กับ .br-box) — grid นิ่งทั้งไฟต์ ไม่ต้องวัดซ้ำ
// เดิม centerOf เรียก getBoundingClientRect ~8 ครั้ง/หมัด (windup 2 + motion 2 × 2 rect) สลับอ่าน/เขียน style
// = forced sync reflow ทุกหมัด → hitch ต่อหมัด (หนักบน Safari/WebKit). cache = วัดครั้งเดียวต่อ unit ต่อไฟต์
let centers = {}        // uid → {x,y}
let boxRect = null      // rect ของ .br-box (จุดอ้างอิงร่วม)
function invalidateCenters() { centers = {}; boxRect = null }
function centerOf(uid) {
  const cached = centers[uid]
  if (cached) return cached
  const el = els[uid]; const box = el?.closest('.br-box')
  if (!box || !el) return null
  if (!boxRect) boxRect = box.getBoundingClientRect()
  const r = el.getBoundingClientRect()
  const c = { x: r.left - boxRect.left + r.width / 2, y: r.top - boxRect.top + r.height / 2 }
  centers[uid] = c
  return c
}
function defForUid(uid) {
  const i = parseInt(uid.slice(1), 10)
  const arr = uid[0] === 'A' ? props.data?.playerTeam : props.data?.botTeam
  return getPetDef(arr?.[i]?.id) || { emoji: '❓' }
}
function playMotion(e) {
  if (lite.value) {   // โหมดลื่น: ไม่พุ่ง/ไม่ยิง — หน่วงสั้นๆ ให้จังหวะอ่านออก แล้วเข้า impact เลย (ไม่มี transform = ไม่สร้าง layer)
    return wait(REPLAY_CFG.liteMotionMs / speed.value)
  }
  const def = defForUid(e.attacker)
  if (atkStyleOf(def) === 'ranged') {
    const a = centerOf(e.attacker), t = centerOf(e.target)
    if (a && t) {
      const k = projKey++
      projectiles.value = [...projectiles.value, { k, emoji: projectileOf(def), x0: a.x, y0: a.y, x1: t.x, y1: t.y }]
      return wait(REPLAY_CFG.projMs / speed.value).then(() => {
        projectiles.value = projectiles.value.filter(p => p.k !== k)
      })
    }
  }
  // melee: พุ่งสุดตัวถึงศูนย์กลางเป้า (Hearthstone-style ชนทับ) แล้วเด้งกลับ — z-index สูงกันโดนการ์ดอื่นบัง
  const a = centerOf(e.attacker), t = centerOf(e.target), el = els[e.attacker]
  if (a && t && el) {
    el.style.zIndex = '7'                        // เหนือ proj-layer (5) และ acting (3)
    el.style.transition = `transform ${REPLAY_CFG.lungeMs / speed.value}ms cubic-bezier(.2, .7, .3, 1.1)`
    el.style.transform = `translate(${t.x - a.x}px, ${t.y - a.y}px) scale(1.18)`
    return wait(REPLAY_CFG.lungeMs / speed.value).then(() => {
      el.style.transform = ''                    // เด้งกลับที่เดิม (คืน style เสมอ — reset()/skipToEnd() เคลียร์ el ทุกตัวซ้ำอีกชั้นอยู่แล้ว กันการ์ดค้างผิดที่แม้โดน skip)
      wait(REPLAY_CFG.lungeMs / speed.value).then(() => { el.style.transition = ''; el.style.zIndex = '' })
    })
  }
  return Promise.resolve()
}

// ── event dispatch — เพิ่ม handler ใหม่ที่นี่ (passive/heal/…) ──
const handlers = {
  round(e) { round.value = e.n },
  attack(e) { return applyAttack(e) },
  end() { acting.value = null; flashing.value = null },
}

// windup ms ของ event attack (ตาม lite/speed) — ใช้ทั้งใน applyAttack (wait จริง) และเดิม step() เคยใช้คิวจังหวะ
const windMs = () => (lite.value ? REPLAY_CFG.liteWindupMs : REPLAY_CFG.windupMs) / speed.value

// telegraph: ลอยขึ้น + เรืองแสง + เอนถอยหลัง (ทิศตรงข้ามเป้า) — ตั้ง --wx/--wy ให้ CSS .windup ใช้ (lite ข้าม ไม่ set transform)
function setWindupVars(e) {
  if (lite.value) return   // lite: ข้ามการเอน/ลอย เหลือแค่ไฮไลต์ขอบ + จังหวะสั้น
  const el = els[e.attacker], a = centerOf(e.attacker), t = centerOf(e.target)
  if (el && a && t) {
    const dx = t.x - a.x, dy = t.y - a.y, len = Math.hypot(dx, dy) || 1
    el.style.setProperty('--wx', (-dx / len * 7).toFixed(1) + 'px')   // เอนถอย ~7px หนีเป้า
    el.style.setProperty('--wy', (-dy / len * 7 - 4).toFixed(1) + 'px') // + ลอยขึ้นอีก 4px
  }
}

// impact: hp/pop/callout ตอนโดนตี (เกิดตอนจบ motion) — รับ g เช็ค gen กัน reset/skip ระหว่างพุ่ง/ยิงมาเขียน state เก่าทับ
function applyImpact(e, g) {
  if (g !== gen) return
  flashing.value = e.target
  hp.value = { ...hp.value, [e.target]: Math.max(0, Math.round((e.targetHpAfter / (maxHp[e.target] || 1)) * 100)) }
  const k = popKey++
  const x = Math.round(Math.random() * 28 - 14)   // offset แนวนอนสุ่ม ±14px กันเลขหลายป็อปซ้อนทับ
  pops.value = { ...pops.value, [e.target]: [...(pops.value[e.target] || []), { k, dmg: e.dmg, crit: e.crit, eff: e.eff, x }] }
  setTimeout(() => { if (g !== gen) return; pops.value = { ...pops.value, [e.target]: (pops.value[e.target] || []).filter(p => p.k !== k) } }, REPLAY_CFG.popMs)
  if (e.eff === 'super' || e.eff === 'weak') {
    const ck = calloutKey++
    const cal = e.eff === 'super' ? { text: 'แพ้ทาง! ', icon: '⚡' } : { text: 'ต้านทาน ', icon: '🛡️' }
    callouts.value = { ...callouts.value, [e.target]: { k: ck, ...cal, kind: e.eff } }
    setTimeout(() => { if (g !== gen) return; if (callouts.value[e.target]?.k === ck) { const c = { ...callouts.value }; delete c[e.target]; callouts.value = c } }, 750)
  }
  // crit ไม่มี visual scale แล้ว (ตัด full-screen re-raster) — จังหวะ freeze คง extra wait ท้าย applyAttack ไว้ (hitStopMs)
}

// windup → motion → impact ทีละสเต็ป (await จริง แทนคิว callback ซ้อน 3 ชั้น) — gen guard คั่นทุกจุดกัน reset/skip ระหว่างทาง
async function applyAttack(e) {
  const g = gen
  winding.value = e.attacker
  setWindupVars(e)
  await wait(windMs()); if (g !== gen) return          // โดน reset/skip ระหว่างเงื้อ
  winding.value = null; acting.value = e.attacker
  await playMotion(e); if (g !== gen) return            // โดน reset/skip ระหว่างพุ่ง/ยิง
  applyImpact(e, g)
  if (e.crit && !lite.value) await wait(REPLAY_CFG.hitStopMs / speed.value)
}

async function step() {
  clearTimeout(timer)
  if (paused.value) return
  if (idx.value >= log.value.length) { acting.value = null; flashing.value = null; return }
  const g = gen
  const e = log.value[idx.value]
  const h = handlers[e.t]
  if (h) await h(e)                             // attack = รอจบทั้ง windup+motion+impact(+hitstop) จริง · round = sync · type ที่ไม่รู้จัก = ข้ามเงียบ
  if (g !== gen) return                         // โดน reset/skip ระหว่างรอ handler
  idx.value++
  if (idx.value < log.value.length) timer = setTimeout(step, e.t === 'round' ? 0 : delay.value)   // round marker ไม่หน่วงเวลา
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
  gen++                                                    // ตัด promise chain windup/lunge/impact ที่ค้างอยู่ (gen guard ใน applyAttack/step)
  clearTimeout(timer); winding.value = null
  pendingTimers.forEach(clearTimeout); pendingTimers.clear()   // ตัด wait() ที่ค้างอยู่ทั้งหมด กันโดนโผล่มาแตะ state หลัง log จบไปแล้ว
  Object.values(els).forEach(el => { if (el) { el.style.transform = ''; el.style.transition = ''; el.style.zIndex = '' } })  // ล้าง lunge ค้างกลางทาง
  const end = log.value[log.value.length - 1]
  const finalHp = {}; Object.keys(maxHp).forEach(uid => finalHp[uid] = 100)
  for (const ev of log.value) if (ev.t === 'attack') finalHp[ev.target] = Math.max(0, Math.round((ev.targetHpAfter / (maxHp[ev.target] || 1)) * 100))
  hp.value = finalHp; pops.value = {}; callouts.value = {}; projectiles.value = []; acting.value = null; flashing.value = null
  round.value = end?.rounds || round.value
  idx.value = log.value.length
  clearTimeout(resultTimer); resultReady.value = true; resultOpen.value = true   // ข้าม = เปิดสรุปทันที
}
function inspect(uid) { paused.value = true; clearTimeout(timer); inspectUid.value = uid }

function hpPct(uid) { return hp.value[uid] ?? 100 }
function popsFor(uid) { return pops.value[uid] || [] }
function popClass(pop) { return { crit: pop.crit, super: pop.eff === 'super', weak: pop.eff === 'weak' } }
function unitClass(uid) {
  return { acting: acting.value === uid, windup: winding.value === uid, flash: flashing.value === uid, dead: (hp.value[uid] ?? 100) <= 0 }
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

watch(() => props.data, (d) => { if (d) { buildMax(d); preloadCombat(d); reset() } }, { immediate: true })
// ตีจบ → เว้น ~0.5 วิ ให้เห็นสนามจบ แล้วเปิด modal สรุป (skipToEnd เปิดทันทีเอง — เช็ก resultReady กันตั้งซ้ำ)
watch(done, (v) => {
  if (!v || resultReady.value) return
  resultTimer = setTimeout(() => { resultReady.value = true; resultOpen.value = true }, REPLAY_CFG.resultDelayMs)
}, { immediate: true })
// layout เปลี่ยน (หมุนจอ/ปรับขนาด) = center ที่ cache ไว้ใช้ไม่ได้ ต้องวัดใหม่
function onResize() { invalidateCenters() }
window.addEventListener('resize', onResize)
window.addEventListener('orientationchange', onResize)

// ── FPS/frame-time meter (เก็บหลักฐานจริงจาก Safari) — เปิดด้วย ?fps=1 ท้าย URL ก่อน # ──
// โชว์ frame time แย่สุดใน ~1 วิ (ms) มุมจอ: >16ms = หลุด 60fps, >33ms = ต่ำกว่า 30fps (กระตุกชัด)
const showFps = ref(new URLSearchParams(location.search).has('fps'))
const fpsWorst = ref(0)
let fpsRaf = 0, fpsLast = 0, fpsMax = 0, fpsWindowStart = 0
function fpsLoop(now) {
  if (fpsLast) {
    const dt = now - fpsLast
    if (dt > fpsMax) fpsMax = dt
    if (now - fpsWindowStart > 1000) { fpsWorst.value = Math.round(fpsMax); fpsMax = 0; fpsWindowStart = now }
  } else { fpsWindowStart = now }
  fpsLast = now
  fpsRaf = requestAnimationFrame(fpsLoop)
}
if (showFps.value) fpsRaf = requestAnimationFrame(fpsLoop)

onUnmounted(() => {
  clearTimeout(timer); clearTimeout(introTimer); clearTimeout(resultTimer)
  pendingTimers.forEach(clearTimeout); pendingTimers.clear()
  window.removeEventListener('resize', onResize); window.removeEventListener('orientationchange', onResize)
  if (fpsRaf) cancelAnimationFrame(fpsRaf)
})
</script>

<style scoped>
.br-ov { position: fixed; inset: 0; z-index: 420; background: #0f172a; display: flex; align-items: center; justify-content: center; padding: 16px; }
/* Tower = ดันเจี้ยน/หอคอย: หินม่วง-น้ำเงินเข้ม + เรืองคบเพลิงอุ่นมุมล่าง (คงโทนเดิมแต่มีมิติ) */
.br-theme-tower {
  background:
    radial-gradient(120% 80% at 50% 0%, rgba(76,29,149,.55), transparent 60%),
    radial-gradient(80% 55% at 50% 100%, rgba(217,119,6,.22), transparent 70%),
    linear-gradient(180deg, #1e1b4b, #0f172a 70%);
}
/* Arena = โคลอสเซียม: ฟ้าเย็นด้านบน → หินทรายอุ่นเข้มด้านล่าง + ลายเสาแนวตั้งจางๆ (คุมเข้มพอให้ตัวขาวอ่านออก) */
.br-theme-arena {
  background:
    radial-gradient(100% 70% at 50% 10%, rgba(59,130,246,.28), transparent 55%),
    linear-gradient(180deg, #3b2f1a 0%, #2a1f12 60%, #17100a 100%),
    repeating-linear-gradient(90deg, rgba(255,220,150,.05) 0 2px, transparent 2px 46px);
}
.br-box { width: 100%; max-width: 440px; display: flex; flex-direction: column; gap: 8px; position: relative; }
/* hitstop เดิม scale ทั้ง box = re-raster เต็มจอ @DPR3 ทุก crit (แพงสุด คุ้มน้อยสุด แค่เด้ง 1.2%) → ตัดทิ้ง
   crit ยังสื่อผ่านเลขใหญ่/ทอง + จังหวะ freeze (extra delay ใน step) ที่ยังอยู่ */
.br-round { text-align: center; color: #fff; font-weight: 800; font-size: .82rem; letter-spacing: .06em; margin-bottom: 2px; }

/* FPS meter (?fps=1) — เขียว=ลื่น เหลือง=หลุด 60fps แดง=ต่ำกว่า 30fps (กระตุกชัด) */
.br-fps { position: absolute; top: 2px; right: 4px; z-index: 11; font-size: .7rem; font-weight: 800; font-variant-numeric: tabular-nums;
  color: #34d399; background: rgba(0,0,0,.55); border-radius: 7px; padding: 2px 6px; pointer-events: none; }
.br-fps.warn { color: #fbbf24; }
.br-fps.bad { color: #f87171; }

.br-side { display: flex; align-items: center; gap: 6px; font-size: .72rem; font-weight: 800; color: rgba(255,255,255,.8); padding: 0 2px; }
.br-side .dot { width: 8px; height: 8px; border-radius: 999px; display: inline-block; }
.dot.foe { background: #f87171; }
.dot.me { background: #34d399; }
.me-label { margin-top: 2px; }

.br-team { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
/* ไม่ตั้ง will-change ถาวร — browser promote เฉพาะตอน lunge (transition transform กำลังรัน) แล้ว release เอง
   เดิม promote ถาวรทั้ง 8 การ์ด = layer เปล่าค้างตลอด → WebKit thrash */
.br-unit { position: relative; aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; background: rgba(255,255,255,.06); border: 2px solid transparent; border-radius: 16px; transition: transform .1s, border-color .15s; cursor: pointer; }
.br-unit.foe { border-color: rgba(248,113,113,.35); }
.br-unit.me  { border-color: rgba(52,211,153,.4); }
.br-face { font-size: 2rem; line-height: 1; }
.br-el { position: absolute; top: 3px; left: 3px; font-size: .8rem; background: rgba(0,0,0,.45); border-radius: 8px; padding: 1px 3px; line-height: 1; }
/* glow/ring ย้ายไป ::after (layer แยก) → toggle state ไม่ re-raster เนื้อการ์ด (emoji+text @3x) ที่เป็น layer
   เดิม box-shadow บน .br-unit เปลี่ยนทุก state = re-raster ทั้งใบ ~4-6 ครั้ง/หมัด (WebKit แพงเรื่อง raster เงาเบลอ) */
.br-unit.acting { transform: translateY(-4px) scale(1.14); z-index: 3; }
/* telegraph: เงื้อก่อนตี — ลอย+เอนถอยหลัง (--wx/--wy ตั้ง inline จาก setWindupVars) + เรืองแสงเหลือง */
.br-unit.windup { transform: translate(var(--wx, 0px), var(--wy, -6px)) scale(1.08); z-index: 3; }
.br-unit.flash { animation: br-shake .25s; }
.br-unit.dead { opacity: .25; filter: grayscale(1); }
/* ชั้นเงา/เรืองแสง — เงาอยู่ข้างนอก element โปร่งใส ไม่บังหน้าเพ็ท · promote เฉพาะตอน opacity transition รัน (ไม่ตั้ง will-change ถาวร) */
.br-unit::after { content: ''; position: absolute; inset: -2px; border-radius: 16px; pointer-events: none;
  opacity: 0; transition: opacity .12s; }
.br-unit.acting::after { opacity: 1; box-shadow: 0 0 0 3px #fde68a, 0 6px 16px rgba(0,0,0,.4); }
.br-unit.windup::after { opacity: 1; box-shadow: 0 0 0 3px #fde68a, 0 0 18px 4px rgba(253, 230, 138, .55); }
.br-unit.flash::after  { opacity: 1; box-shadow: 0 0 0 3px #f87171; }
/* shake = transform ล้วน (composite) — ตัด filter brightness/saturate ที่ repaint ทุกเฟรม · ป้ายโดนตียังสื่อผ่านเขย่า+วงแดง */
@keyframes br-shake {
  0%, 100% { transform: translateX(0) }
  25% { transform: translateX(-7px) }
  50% { transform: translateX(6px) }
  75% { transform: translateX(-5px) }
}

.br-hp { position: relative; width: 84%; height: 7px; background: rgba(0,0,0,.35); border-radius: 999px; overflow: hidden; }
/* เลือด: scaleX (composite) แทน transition width (layout ทุกเฟรม) — origin ซ้าย · promote เฉพาะตอน transition รัน (ไม่ตั้ง will-change ถาวร) */
.br-hp-fill { width: 100%; height: 100%; background: #ef4444; border-radius: 999px; transform-origin: left center; transition: transform .2s ease-out; }
.br-hp-fill.mine { background: #34d399; }
.br-tick { position: absolute; top: 0; width: 1px; height: 100%; background: rgba(255,255,255,.55); }
.br-stats { display: flex; justify-content: space-between; align-items: center; gap: 3px; width: 88%; margin-top: 3px; }
.br-atk, .br-hpn { font-size: .72rem; font-weight: 800; color: #fff; line-height: 1; padding: 2px 6px; border-radius: 999px; min-width: 18px; text-align: center; }
.br-atk { background: #f59e0b; }       /* ATK = amber (Hearthstone-ish) */
.br-hpn.foe { background: #ef4444; }    /* HP ศัตรู = แดง */
.br-hpn.me { background: #16a34a; }     /* HP ทีมคุณ = เขียว */

/* เลขดาเมจ: ใหญ่ + stroke เข้ม อ่านออกทุกพื้นหลัง + เด้งแล้วลอย 40px ค้าง .9 วิ
   will-change: transform → promote เป็น layer: Safari rasterize ตัวอักษร (มี text-stroke) ครั้งเดียวแล้ว composite
   ไม่งั้น transform animate บน stroked text = repaint ทุกเฟรมตลอด .9s (jank หลักบน WebKit) · ลด stroke 4→3px ลด raster cost */
.br-pop { position: absolute; top: 0; font-weight: 900; font-size: 1.5rem; color: #fecaca; z-index: 6;
  -webkit-text-stroke: 3px rgba(15, 23, 42, .85); paint-order: stroke fill;
  animation: br-pop-rise .9s ease-out forwards; pointer-events: none;
  will-change: transform; }
.br-pop.crit { color: #fbbf24; font-size: 2rem; }
.br-pop.super { color: #fca5a5; }
.br-pop.weak { color: #cbd5e1; font-size: 1.1rem; }
@keyframes br-pop-rise {
  0% { transform: translateY(0) scale(.6); opacity: 0 }
  18% { transform: translateY(-6px) scale(1.15); opacity: 1 }
  35% { transform: translateY(-12px) scale(1); opacity: 1 }
  100% { transform: translateY(-40px) scale(1); opacity: 0 }
}
@keyframes br-rise { from { transform: translateY(0); opacity: 1 } to { transform: translateY(-24px); opacity: 0 } }

.br-call { position: absolute; top: -16px; display: inline-flex; align-items: center; gap: 2px; font-weight: 800; font-size: .6rem; white-space: nowrap; padding: 2px 6px; border-radius: 7px; animation: br-rise .75s ease-out forwards; pointer-events: none; z-index: 4; will-change: transform; }
.br-call.super { background: #ef4444; color: #fff; }
.br-call.weak { background: rgba(203,213,225,.95); color: #334155; }

.br-puff { position: absolute; font-size: 1.2rem; animation: br-puff .5s ease-out forwards; pointer-events: none; }
@keyframes br-puff { from { transform: translateY(0) scale(.6); opacity: 1 } to { transform: translateY(-16px) scale(1.25); opacity: 0 } }

.br-proj-layer { position: absolute; inset: 0; pointer-events: none; z-index: 5; }
.br-proj { position: absolute; left: 0; top: 0; font-size: 1.4rem; transform: translate(var(--x0), var(--y0)); animation: br-fly linear forwards; will-change: transform; }
@keyframes br-fly { from { transform: translate(var(--x0), var(--y0)) } to { transform: translate(var(--x1), var(--y1)) } }

/* ══ โหมดลื่น (lite) — ตัด GPU layer ถาวรทั้งหมด + อนิเมชันที่ repaint หนัก ══
   พิสูจน์/แก้สมมติฐาน over-promotion: เหลือ layer เท่าที่จำเป็น, อัปเดตเลข/สถานะทันที ยังอ่านออกครบ */
.br-lite .br-pop, .br-lite .br-proj, .br-lite .br-call { will-change: auto; }   /* ตัด layer ของ ephemeral ที่เหลือ (unit/hp-fill/box ไม่ตั้ง will-change แล้ว) */
.br-lite .br-hp-fill { transition: none; }                  /* เลือดเปลี่ยนทันที */
.br-lite .br-unit { transition: border-color .1s; }
.br-lite .br-unit.acting, .br-lite .br-unit.windup { transform: none; }   /* ไม่ลอย/ไม่ขยาย */
.br-lite .br-unit.acting { border-color: #fde68a; }         /* ไฮไลต์ผู้โจมตี = แค่ขอบเหลือง (ถูก) */
.br-lite .br-unit.flash { animation: none; border-color: #f87171; }       /* โดนตี = ขอบแดง ไม่เขย่า */
.br-lite .br-unit::after { display: none; }                 /* ตัด glow layer ทิ้ง */
.br-lite .br-pop { animation: none; -webkit-text-stroke-width: 2px; }      /* เลขโผล่นิ่ง (JS ลบเองตาม popMs) */
.br-lite .br-call { animation: none; }
.br-lite .br-proj { display: none; }

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

/* modal สรุปผล — ทับสนามที่มืดลง เลื่อนในตัวเองได้ ไม่โดน bottom-nav/safe-area บัง */
.br-result-ov { position: fixed; inset: 0; z-index: 425; background: rgba(15, 23, 42, .72);
  display: flex; align-items: center; justify-content: center;
  padding: 16px; padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px)); }
.br-modal { width: 100%; max-width: 380px; background: #1e293b; border: 2px solid rgba(255,255,255,.25);
  border-radius: 18px; padding: 16px; display: flex; flex-direction: column; gap: 8px;
  max-height: calc(100dvh - 72px); overflow-y: auto; -webkit-overflow-scrolling: touch;
  animation: br-modal-in .25s ease; }
.br-modal .br-result { text-align: center; }
@keyframes br-modal-in { from { opacity: 0; transform: scale(.92) translateY(10px) } to { opacity: 1; transform: none } }
.br-modal-btns { display: flex; gap: 8px; justify-content: center; margin-top: 4px; }
/* แถบปุ่มลอยตอน peek สนาม (ดูสรุป + ปิด) — เกาะล่างกลาง เหนือ safe-area */
.br-peek-bar { position: fixed; left: 50%; transform: translateX(-50%);
  bottom: calc(20px + env(safe-area-inset-bottom, 0px)); z-index: 424; display: flex; gap: 8px; }
.br-peek-btn { background: #4f46e5; border-color: #fff; box-shadow: 0 6px 20px rgba(0, 0, 0, .45); }
</style>

<style>
/* FX pool styles — ไม่ scoped (element สร้าง imperative ไม่มี data-v-*) · namespace .brfx-* กันชน global */
.br-fx-layer { position: absolute; inset: 0; pointer-events: none; z-index: 6; }
.brfx { position: absolute; left: 0; top: 0; will-change: transform; }
.brfx-pop { font-weight: 900; font-size: 1.5rem; color: #fecaca; -webkit-text-stroke: 3px rgba(15,23,42,.85); paint-order: stroke fill; white-space: nowrap; }
.brfx-pop.crit { color: #fbbf24; font-size: 2rem; }
.brfx-pop.super { color: #fca5a5; }
.brfx-pop.weak { color: #cbd5e1; font-size: 1.1rem; }
.brfx-call { font-weight: 800; font-size: .6rem; white-space: nowrap; padding: 2px 6px; border-radius: 7px; }
.brfx-call.super { background: #ef4444; color: #fff; }
.brfx-call.weak { background: rgba(203,213,225,.95); color: #334155; }
.brfx-puff { width: 1.2rem; height: 1.2rem; }
.brfx-burst { width: 2rem; height: 2rem; }
.brfx-proj { width: 1.4rem; height: 1.4rem; }
.brfx-dash { width: 2rem; height: 2rem; }
.brfx-ring { width: 84px; height: 84px; margin: -42px 0 0 -42px; border-radius: 18px; }
.brfx-ring.windup { box-shadow: 0 0 0 3px #fde68a, 0 0 18px 4px rgba(253,230,138,.55); }
.brfx-ring.acting { box-shadow: 0 0 0 3px #fde68a, 0 6px 16px rgba(0,0,0,.4); }
</style>
