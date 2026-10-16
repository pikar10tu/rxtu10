<!--
  PtGame — จอเล่น PharmaTeam (พอร์ตจากโปรโตไทป์ D:\pharmateam_local\public\index.html)
  อ่าน state จาก props อย่างเดียว · การกดทุกอย่าง emit ออกไปให้ view ส่งเข้า RTDB
  Teleport ไป body (เต็มจอ ทับ bottom-nav — กัน z-index trap ตาม CLAUDE.md)
-->
<template>
  <Teleport to="body">
    <div class="pt" :class="fxClass">
      <div class="pt-screen">
        <!-- หัว: เลือด + ความคืบหน้า -->
        <div class="pt-stage">
          <button class="pt-quit" @click="$emit('quit')">✕ ออก</button>
          <button class="pt-mute" @click="toggleMute">{{ muted ? '🔇' : '🔊' }}</button>
          <div class="pt-gauges">
            <div class="pt-row"><span>💚 ความเสถียรของยา</span><span>{{ state.health }}%</span></div>
            <div class="pt-bar"><div class="pt-fill hp" :style="{ width: state.health + '%' }"></div></div>
            <div class="pt-row" style="margin-top:6px"><span>🧪 {{ levelName }}</span><span>{{ progPct }}%</span></div>
            <div class="pt-bar"><div class="pt-fill prog" :style="{ width: progPct + '%' }"></div></div>
          </div>
        </div>

        <!-- คำสั่งที่ต้องบอกเพื่อน -->
        <div class="pt-inst">
          <div class="pt-shout">📢 บอกเพื่อนด่วน!</div>
          <div class="pt-prompt">{{ me?.inst?.prompt || (spectator ? 'รอรอบหน้านะ (เข้ามาตอนเกมเริ่มแล้ว)' : 'รอสูตรยาถัดไป...') }}</div>
          <div class="pt-bar thin"><div class="pt-fill inst" :style="{ width: instPct + '%' }"></div></div>
        </div>

        <!-- อุปกรณ์ของเรา -->
        <div class="pt-grid">
          <div v-for="c in controls" :key="c.id" class="pt-card" :class="{ hazard: c.hazard }">
            <div class="pt-label">{{ c.hazard ? '⚠️ ' : '' }}{{ c.label }}</div>

            <button v-if="c.type === 'button'" class="pt-btn" @pointerdown.prevent="tap(c, true, $event)">กดจ่ายยา</button>
            <button v-else-if="c.type === 'spam'" class="pt-btn spam" @pointerdown.prevent="tap(c, true, $event)">บดรัวๆ!</button>

            <div v-else-if="c.type === 'toggle'" class="pt-toggle" :class="{ on: local[c.id] ?? c.state }"
              @pointerdown.prevent="toggle(c)"><div class="pt-thumb"></div></div>

            <template v-else-if="c.type === 'slider'">
              <input type="range" class="pt-slider" :min="c.min" :max="c.max" step="1"
                :value="local[c.id] ?? c.value"
                @input="e => { local[c.id] = +e.target.value; sfx.tick() }"
                @change="e => send(c, +e.target.value)">
              <div class="pt-sval">{{ local[c.id] ?? c.value }}</div>
            </template>

            <div v-else-if="c.type === 'dial'" class="pt-seg">
              <button v-for="o in c.options" :key="o" class="pt-segbtn" :class="{ on: (local[c.id] ?? c.value) === o }"
                @pointerdown.prevent="local[c.id] = o; sfx.click(); send(c, o)">{{ o.replace('เบอร์ ', '#') }}</button>
            </div>

            <button v-else-if="c.type === 'hold'" class="pt-btn hold"
              @pointerdown.prevent="holdStart(c, $event)" @pointerup="holdEnd(c)" @pointercancel="holdEnd(c)" @lostpointercapture="holdEnd(c)">
              <div class="pt-holdfill" :style="{ height: (holdPct[c.id] || 0) + '%' }"></div><span>กดค้าง</span>
            </button>
          </div>
        </div>

        <div class="pt-feed">{{ state.log?.msg || 'เชื่อมต่อห้องสำเร็จ!' }}</div>

        <!-- ผลข้างเคียง -->
        <div v-if="me?.effect" class="pt-fxbadge">{{ me.effect.label }} {{ fxLeft }} วิ</div>
        <div class="pt-spill">
          <div v-for="b in spill" :key="b.id" class="pt-blob" :style="{ left: b.x + 'px', top: b.y + 'px', opacity: b.o }"
            @pointerdown.prevent="rubStart(b, $event)" @pointermove="rubMove(b, $event)" @pointerup="b.lx = null"></div>
        </div>
      </div>

      <!-- เหตุการณ์ทั้งทีม -->
      <div v-if="state.event" class="pt-event">
        <div class="pt-evprompt">{{ state.event.prompt }}</div>
        <div class="pt-bar ev"><div class="pt-fill evfill" :style="{ width: evPct + '%' }"></div></div>
        <div class="pt-evact">
          <template v-if="state.event.kind === 'codered'">
            <div class="pt-evhint">แตะรวมทั้งทีม {{ redShown }}/{{ state.event.target }}</div>
            <div class="pt-meter"><div :style="{ width: Math.min(100, redShown / state.event.target * 100) + '%' }"></div></div>
            <button class="pt-red" @pointerdown.prevent="redTap($event)">🚨<br>กด!</button>
          </template>
          <div v-else-if="state.event.done[uid] || evSent === state.event.id" class="pt-evok">✅ เรียบร้อย! รอเพื่อน...</div>
          <template v-else-if="state.event.kind === 'shake'">
            <div class="pt-evemoji">🫨</div>
            <div class="pt-meter"><div :style="{ width: Math.min(100, shakeScore / SHAKE_NEED * 100) + '%' }"></div></div>
            <button class="pt-evfb" @pointerdown.prevent="addShake(1)">เขย่าไม่ได้? แตะรัวๆ ตรงนี้</button>
          </template>
          <template v-else-if="state.event.kind === 'flip'">
            <div class="pt-evemoji">🙈</div>
            <div class="pt-evhint">คว่ำหน้าจอลงค้างไว้ 1 วินาที</div>
            <button class="pt-evfb" @pointerdown.prevent="flipHoldStart($event)" @pointerup="flipHoldEnd" @pointercancel="flipHoldEnd" @lostpointercapture="flipHoldEnd">
              <div class="pt-holdfill" :style="{ height: flipPct + '%' }"></div><span>ไม่มีเซ็นเซอร์? กดค้าง 2 วิ</span>
            </button>
          </template>
        </div>
        <div class="pt-roster">
          <template v-if="state.event.kind === 'codered'">
            <span v-for="p in rosterNames" :key="p.uid" :class="{ done: (state.event.taps[p.uid] || 0) >= CODE_RED_TAPS_PER_PLAYER }">
              {{ p.name }} {{ state.event.taps[p.uid] || 0 }}</span>
          </template>
          <template v-else>
            <span v-for="p in rosterNames" :key="p.uid" :class="{ done: state.event.done[p.uid] }">
              {{ state.event.done[p.uid] ? '✅' : '⏳' }} {{ p.name }}</span>
          </template>
        </div>
      </div>

      <!-- จบด่าน / จบเกม -->
      <div v-if="endInfo" class="pt-modal">
        <div class="pt-mtitle" :style="{ color: endInfo.color }">{{ endInfo.title }}</div>
        <p class="pt-mdesc">{{ endInfo.desc }}</p>
        <template v-if="state.status !== 'levelClear'">
          <button v-if="isHost && canRestart" class="pt-mbtn" @click="$emit('restart')">เล่นอีกรอบ</button>
          <button v-if="isHost" class="pt-mbtn ghost" @click="$emit('lobby')">กลับล็อบบี้</button>
          <div v-else class="pt-mdesc small">รอหัวห้องกดเล่นอีกรอบ...</div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { levelConfig, CODE_RED_TAPS_PER_PLAYER } from '../../utils/pharmateamEngine.js'

const props = defineProps({
  state: { type: Object, required: true },
  uid: { type: String, required: true },
  isHost: Boolean,
  canRestart: Boolean,   // เหลือคนเดียว (ไม่ใช่แอดมิน) = เล่นอีกรอบไม่ได้ ต้องกลับล็อบบี้รอเพื่อน
  now: { type: Function, required: true },
})
const emit = defineEmits(['action', 'eventDone', 'taps', 'quit', 'restart', 'lobby'])

const me = computed(() => props.state.players[props.uid] || null)
const spectator = computed(() => !me.value)
const controls = computed(() => me.value?.controls || [])
const levelName = computed(() => levelConfig(props.state.level || 1).name)
const progPct = computed(() => Math.min(100, Math.floor(props.state.progress / (props.state.maxProgress || 1) * 100)))
const rosterNames = computed(() => Object.entries(props.state.players).map(([uid, p]) => ({ uid, name: p.name })))

// นาฬิกาเดินเพื่ออัปเดตแถบเวลา (ไม่ต้องรอ state ใหม่)
const clock = ref(props.now())
let clockTimer = null
onMounted(() => { clockTimer = setInterval(() => { clock.value = props.now() }, 100) })

const instPct = computed(() => {
  const i = me.value?.inst
  if (!i) return 0
  if (props.state.event && i.remaining != null) return i.remaining / i.duration * 100 // หยุดเวลาระหว่างเหตุการณ์
  return Math.max(0, (i.deadline - clock.value) / i.duration * 100)
})
const evPct = computed(() => {
  const e = props.state.event
  return e ? Math.max(0, (e.deadline - clock.value) / e.duration * 100) : 0
})
const fxLeft = computed(() => me.value?.effect ? Math.max(0, Math.ceil((me.value.effect.until - clock.value) / 1000)) : 0)
const fxClass = computed(() => {
  const t = me.value?.effect?.type
  return t && t !== 'spill' ? 'fx-' + t : ''
})

const endInfo = computed(() => {
  const s = props.state.status
  if (s === 'levelClear') return { title: '🏁 ผ่านด่าน!', desc: `${levelName.value} สำเร็จ (+20 HP) ด่านต่อไปเริ่มใน 4 วินาที...`, color: '#f59e0b' }
  if (s === 'gameover') return { title: '💥 แลปแตก!', desc: `ทีมไปได้ถึง ${levelName.value}`, color: '#ef4444' }
  return null
})

// ── เสียง (Web Audio ไม่ต้องใช้ไฟล์) ──
let actx = null
const muted = ref(false)
function audio() {
  if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)() } catch (e) { /* ไม่มีเสียงก็เล่นได้ */ } }
  if (actx && actx.state === 'suspended') actx.resume()
  return actx
}
function tone(freq, dur = 0.08, type = 'square', vol = 0.08, delay = 0, slideTo = null) {
  if (muted.value) return
  const c = audio(); if (!c) return
  const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain()
  o.type = type; o.frequency.setValueAtTime(freq, t)
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.02)
}
const sfx = {
  click: () => tone(520, 0.05, 'square', 0.05),
  toggle: (on) => tone(on ? 700 : 400, 0.07, 'triangle', 0.08),
  tick: () => tone(900, 0.03, 'sine', 0.04),
  ok: () => { tone(660, 0.08, 'triangle', 0.09); tone(990, 0.12, 'triangle', 0.09, 0.08) },
  bad: () => tone(220, 0.3, 'sawtooth', 0.08, 0, 90),
  newCmd: () => tone(1200, 0.05, 'sine', 0.05),
  level: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.15, 'triangle', 0.09, i * 0.12)),
  lose: () => [400, 300, 200, 120].forEach((f, i) => tone(f, 0.25, 'sawtooth', 0.08, i * 0.18)),
}
function toggleMute() { muted.value = !muted.value }
const buzz = (p) => { try { navigator.vibrate && navigator.vibrate(p) } catch (e) { /* บางเครื่องไม่มี */ } }

// เสียงตามการเปลี่ยนแปลงของ state
watch(() => [props.state.status, props.state.health, props.state.progress, me.value?.inst?.id], (n, o) => {
  if (!o) return
  const [st, hp, pr, inst] = n, [pst, php, ppr, pinst] = o
  if (st !== pst) { if (st === 'levelClear') sfx.level(); else if (st === 'gameover') sfx.lose(); return }
  if (hp < php) { sfx.bad(); buzz(200) }
  else if (pr > ppr) sfx.ok()
  else if (inst && inst !== pinst) sfx.newCmd()
})

// ── ปุ่มต่างๆ ──
const local = reactive({}) // ค่าฝั่งเรา (กันเด้งกลับระหว่างรอหัวห้อง)
watch(() => controls.value.map(c => c.id).join(), () => { for (const k of Object.keys(local)) delete local[k] })
const send = (c, v) => emit('action', c.id, v)
function press(el) { el.classList.add('pressed'); setTimeout(() => el.classList.remove('pressed'), 90) }
function tap(c, v, e) { press(e.currentTarget); sfx.click(); send(c, v) }
function toggle(c) { const next = !(local[c.id] ?? c.state); local[c.id] = next; sfx.toggle(next); send(c, next) }

const holdPct = reactive({})
const holds = {}
function holdStart(c, e) {
  try { e.currentTarget.setPointerCapture(e.pointerId) } catch (_) { /* ไม่รองรับก็ไม่เป็นไร */ }
  const need = c.holdDuration || 2000, t0 = Date.now()
  sfx.click(); send(c, 'start') // หัวห้องจับเวลาเองจากจุดนี้
  const beep = setInterval(sfx.tick, 250)
  const loop = () => {
    const p = Math.min(1, (Date.now() - t0) / need)
    holdPct[c.id] = p * 100
    if (p >= 1) { stopHold(c); sfx.ok(); send(c, true); return }
    holds[c.id].raf = requestAnimationFrame(loop)
  }
  holds[c.id] = { beep, raf: requestAnimationFrame(loop) }
}
function stopHold(c) {
  const h = holds[c.id]; if (!h) return
  cancelAnimationFrame(h.raf); clearInterval(h.beep); delete holds[c.id]; holdPct[c.id] = 0
}
function holdEnd(c) { if (holds[c.id]) { stopHold(c); send(c, 'cancel') } }

// ── ผลข้างเคียง ──
const spill = ref([])
watch(() => me.value?.effect && me.value.effect.type + me.value.effect.until, (key, old) => {
  if (!key || key === old) { if (!key) spill.value = []; return }
  sfx.bad(); buzz([80, 60, 80])
  if (me.value.effect.type === 'spill') {
    const W = window.innerWidth, H = window.innerHeight
    spill.value = Array.from({ length: 3 }, (_, i) => ({
      id: key + i, x: Math.random() * Math.max(0, Math.min(W, 500) - 150), y: H * 0.35 + Math.random() * Math.max(0, H * 0.55 - 130),
      o: 1, rubbed: 0, lx: null, ly: null,
    }))
  } else spill.value = []
})
function rubStart(b, e) { b.lx = e.clientX; b.ly = e.clientY; try { e.currentTarget.setPointerCapture(e.pointerId) } catch (_) { /* */ } }
function rubMove(b, e) {
  if (b.lx == null) return
  b.rubbed += Math.hypot(e.clientX - b.lx, e.clientY - b.ly); b.lx = e.clientX; b.ly = e.clientY
  b.o = Math.max(0, 1 - b.rubbed / 500)
  if (b.rubbed >= 500) { spill.value = spill.value.filter(x => x !== b); sfx.ok() }
}

// ── เหตุการณ์ทั้งทีม ──
const SHAKE_NEED = 12
const shakeScore = ref(0)
const flipPct = ref(0)
const evSent = ref(null)
let lastSpike = 0, downSince = 0, flipRaf = null, flipT0 = 0

function evComplete() {
  const e = props.state.event
  if (!e || evSent.value === e.id) return
  evSent.value = e.id
  sfx.ok(); buzz(60)
  emit('eventDone', e.id)
}
function addShake(n) {
  shakeScore.value += n; sfx.tick()
  if (shakeScore.value >= SHAKE_NEED) evComplete()
}
function onMotion(e) {
  if (props.state.event?.kind !== 'shake') return
  const a = e.accelerationIncludingGravity; if (!a || a.x == null) return
  const mag = Math.hypot(a.x, a.y, a.z), t = Date.now()
  if (Math.abs(mag - 9.8) > 8 && t - lastSpike > 120) { lastSpike = t; addShake(1.5) }
}
function onOrient(e) {
  if (props.state.event?.kind !== 'flip' || e.beta == null) return
  if (Math.abs(e.beta) > 140) { if (!downSince) downSince = Date.now(); else if (Date.now() - downSince > 1000) evComplete() }
  else downSince = 0
}
function flipHoldStart(e) {
  try { e.currentTarget.setPointerCapture(e.pointerId) } catch (_) { /* */ }
  flipT0 = Date.now()
  const loop = () => {
    const p = Math.min(1, (Date.now() - flipT0) / 2000); flipPct.value = p * 100
    if (p >= 1) { flipHoldEnd(); evComplete(); return }
    flipRaf = requestAnimationFrame(loop)
  }
  loop()
}
function flipHoldEnd() { cancelAnimationFrame(flipRaf); flipRaf = null; flipPct.value = 0 }

// Code Red: เก็บแตะไว้ในเครื่องแล้วส่งเป็นก้อนทุก 250ms (ไม่ยิง RTDB ทุกครั้งที่แตะ)
const redPending = ref(0)   // ยังไม่ได้ส่ง
const redSent = ref(0)      // ส่งแล้ว แต่หัวห้องอาจยังไม่นับ
let redTimer = null
const redShown = computed(() => {
  const e = props.state.event
  if (!e || e.kind !== 'codered') return 0
  // ยอดรวมจากหัวห้อง + ส่วนของเราที่ยังไม่ถูกนับ (แถบขยับทันทีที่แตะ)
  const mineCounted = e.taps?.[props.uid] || 0
  return Math.min(e.target, e.total + Math.max(0, redSent.value - mineCounted) + redPending.value)
})
function flushRed() {
  const e = props.state.event
  if (!e || e.kind !== 'codered' || !redPending.value) return
  const n = Math.min(20, redPending.value)
  redPending.value -= n; redSent.value += n
  emit('taps', e.id, n)
}
function redTap(e) {
  e.currentTarget.classList.add('pressed'); setTimeout(() => e.currentTarget?.classList.remove('pressed'), 70)
  redPending.value++; sfx.tick(); buzz(15)
}

watch(() => props.state.event?.id, id => {
  shakeScore.value = 0; downSince = 0; flipHoldEnd()
  redPending.value = 0; redSent.value = 0
  if (id) { sfx.lose(); buzz([300, 100, 300]) }
})

onMounted(() => {
  redTimer = setInterval(flushRed, 250)
  window.addEventListener('devicemotion', onMotion)
  window.addEventListener('deviceorientation', onOrient)
})
onBeforeUnmount(() => {
  clearInterval(clockTimer)
  clearInterval(redTimer)
  window.removeEventListener('devicemotion', onMotion)
  window.removeEventListener('deviceorientation', onOrient)
  Object.keys(holds).forEach(id => stopHold({ id }))
  flipHoldEnd()
})
</script>

<style scoped>
.pt { position: fixed; inset: 0; z-index: 1000; background: #0d151c; color: #f1f5f9; display: flex; justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; user-select: none; -webkit-user-select: none; overscroll-behavior: none; }
.pt * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
.pt-screen { position: relative; width: 100%; max-width: 500px; height: 100%; display: flex; flex-direction: column; overflow: hidden; }

.pt-stage { position: relative; height: 120px; background: linear-gradient(160deg, #1b2e4b, #0d151c); border-bottom: 2px solid #243b53;
  display: flex; flex-direction: column; justify-content: flex-end; flex-shrink: 0; }
.pt-quit, .pt-mute { position: absolute; top: 8px; z-index: 3; background: rgba(0,0,0,.5); color: #fff; border: none; border-radius: 14px; padding: 4px 10px; font-size: .85rem; }
.pt-quit { left: 8px; } .pt-mute { right: 8px; }
.pt-gauges { padding: 8px 12px; }
.pt-row { display: flex; justify-content: space-between; font-size: .8rem; margin-bottom: 3px; }
.pt-bar { height: 10px; background: #26384a; border-radius: 5px; overflow: hidden; }
.pt-bar.thin { height: 6px; background: #451a03; }
.pt-fill { height: 100%; transition: width .3s; }
.pt-fill.hp { background: #ef4444; } .pt-fill.prog { background: #10b981; }
.pt-fill.inst { background: #f59e0b; transition: width .1s linear; }

.pt-inst { padding: 10px 14px; background: #1f1505; border-bottom: 2px solid #f59e0b; text-align: center; flex-shrink: 0; }
.pt-shout { font-size: .75rem; color: #fbbf24; letter-spacing: 1px; }
.pt-prompt { font-size: 1.25rem; font-weight: 800; color: #fef08a; margin: 4px 0; min-height: 32px; }

.pt-grid { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 12px; background: #091118; overflow-y: auto; align-content: start; }
.pt-card { background: #162433; border: 2px solid #243b53; border-radius: 14px; padding: 12px 8px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center; min-height: 140px; }
.pt-card.hazard { border-color: #b45309; }
.pt-label { font-size: .85rem; font-weight: 600; color: #94a3b8; margin-bottom: 10px; }
.pt-btn { width: 80px; height: 80px; border-radius: 50%; border: none; background: #e11d48; color: #fff; font-weight: bold; font-size: .8rem;
  box-shadow: 0 5px #9f1239; touch-action: none; position: relative; overflow: hidden; }
.pt-btn.pressed, .pt-btn:active { transform: translateY(4px); box-shadow: 0 1px #333; }
.pt-btn.spam { background: #f59e0b; box-shadow: 0 5px #b45309; }
.pt-btn.hold { background: #7c3aed; box-shadow: 0 5px #5b21b6; }
.pt-btn span, .pt-evfb span { position: relative; z-index: 1; pointer-events: none; }
.pt-holdfill { position: absolute; left: 0; bottom: 0; width: 100%; background: rgba(255,255,255,.35); pointer-events: none; }
.pt-toggle { width: 80px; height: 42px; background: #334155; border-radius: 21px; position: relative; border: 2px solid #475569; transition: .2s; touch-action: none; }
.pt-toggle.on { background: #10b981; border-color: #34d399; }
.pt-thumb { width: 34px; height: 34px; background: #fff; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: .2s; }
.pt-toggle.on .pt-thumb { left: 40px; }
.pt-slider { width: 85%; accent-color: #38bdf8; touch-action: pan-x; }
.pt-sval { margin-top: 6px; font-weight: bold; color: #38bdf8; font-size: 1.1rem; }
.pt-seg { display: flex; gap: 4px; width: 100%; }
.pt-segbtn { flex: 1; padding: 10px 2px; border-radius: 8px; border: 1px solid #38bdf8; background: #0f172a; color: #cbd5e1; font-size: .75rem; font-weight: 700; touch-action: none; }
.pt-segbtn.on { background: #38bdf8; color: #0f172a; }
.pt-feed { height: 32px; flex-shrink: 0; background: #000; color: #a7f3d0; font-size: .75rem; display: flex; align-items: center; padding: 0 12px;
  white-space: nowrap; overflow: hidden; border-top: 1px solid #243b53; padding-bottom: env(safe-area-inset-bottom); }

/* ผลข้างเคียง */
.pt-fxbadge { position: absolute; top: 40px; left: 50%; transform: translateX(-50%); z-index: 40; background: rgba(124,58,237,.92); color: #fff;
  font-weight: 800; padding: 4px 12px; border-radius: 14px; font-size: .85rem; white-space: nowrap; }
.fx-sleepy .pt-screen > :not(.pt-fxbadge):not(.pt-spill) { filter: blur(2.5px) brightness(.6); }
.fx-sleepy .pt-screen { animation: ptSway 3s ease-in-out infinite; }
.fx-dizzy .pt-screen { animation: ptSpin 2.4s ease-in-out infinite; }
.fx-dizzy .pt-screen > :not(.pt-fxbadge) { filter: hue-rotate(90deg) saturate(1.6); }
.fx-blurry .pt-screen > :not(.pt-fxbadge):not(.pt-spill) { filter: blur(5px) brightness(1.7) contrast(.8); }
@keyframes ptSway { 0%, 100% { transform: translateX(-6px) } 50% { transform: translateX(6px) } }
@keyframes ptSpin { 0%, 100% { transform: rotate(-7deg) scale(.95) } 50% { transform: rotate(7deg) scale(.95) } }
.pt-spill { position: absolute; inset: 0; z-index: 30; pointer-events: none; }
.pt-blob { position: absolute; width: 150px; height: 130px; pointer-events: auto; touch-action: none;
  background: radial-gradient(circle at 40% 40%, #a3e635 0%, #65a30d 55%, rgba(101,163,13,0) 72%);
  border-radius: 45% 55% 60% 40% / 50% 40% 60% 50%; }
.pt-blob::after { content: 'ถู!'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #1a2e05; font-weight: 900; font-size: .8rem; opacity: .7; }

/* เหตุการณ์ทั้งทีม */
.pt-event { position: absolute; inset: 0; z-index: 90; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
  padding: 24px; text-align: center; animation: ptFlash .5s ease-in-out infinite alternate; }
@keyframes ptFlash { from { background: rgba(127,29,29,.95) } to { background: rgba(185,28,28,.95) } }
.pt-evprompt { font-size: 1.9rem; font-weight: 900; line-height: 1.25; }
.pt-bar.ev { width: 100%; max-width: 360px; background: #450a0a; }
.pt-fill.evfill { background: #fbbf24; transition: width .1s linear; }
.pt-evact { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.pt-evemoji { font-size: 4rem; }
.pt-evhint { color: #fecaca; font-size: .95rem; }
.pt-evok { font-size: 1.4rem; font-weight: 900; color: #4ade80; }
.pt-meter { width: 220px; height: 12px; background: #450a0a; border-radius: 6px; overflow: hidden; }
.pt-meter > div { height: 100%; background: #4ade80; transition: width .1s; }
.pt-evfb { background: transparent; color: #fecaca; border: 1px dashed #fecaca; border-radius: 10px; padding: 8px 14px; font-size: .85rem;
  touch-action: none; position: relative; overflow: hidden; }
.pt-red { width: 150px; height: 150px; border-radius: 50%; border: none; background: #e11d48; color: #fff; font-size: 1.2rem; font-weight: 900;
  box-shadow: 0 8px #881337; touch-action: none; }
.pt-red.pressed, .pt-red:active { transform: translateY(6px); box-shadow: 0 2px #881337; }
.pt-roster { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; max-width: 360px; }
.pt-roster span { background: rgba(0,0,0,.35); border-radius: 12px; padding: 3px 10px; font-size: .85rem; }
.pt-roster span.done { background: #16a34a; }

/* จบด่าน/จบเกม */
.pt-modal { position: absolute; inset: 0; z-index: 100; background: rgba(0,0,0,.85); display: flex; flex-direction: column;
  justify-content: center; align-items: center; padding: 24px; text-align: center; gap: 8px; }
.pt-mtitle { font-size: 2.2rem; font-weight: 900; }
.pt-mdesc { color: #cbd5e1; font-size: 1.05rem; margin: 0 0 12px; }
.pt-mdesc.small { font-size: .9rem; color: #f59e0b; }
.pt-mbtn { width: 100%; max-width: 220px; padding: 14px; border-radius: 10px; border: none; background: #059669; color: #fff; font-size: 1.05rem;
  font-weight: bold; box-shadow: 0 4px #047857; }
.pt-mbtn.ghost { background: transparent; border: 1px solid #94a3b8; box-shadow: none; color: #cbd5e1; }
</style>
