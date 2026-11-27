// ════════════════════════════════════════════════════════════
//  useFocusMode — สถานะโหมดโฟกัส (Co-working space) ระดับทั้งแอป · singleton
//  เข้าโหมด = เริ่มจับเวลา · สถานะ 3: ✍️ ทำข้อสอบ (อยู่หน้า quiz/daily/timeAttack · derive จาก route) / 🎮 เล่นเกม (หน้าเกม) / 🟢 อยู่จอ / 💤 ไม่อยู่ (ไม่แตะจอ 30 วิ)
//  เหรียญ (23 พ.ย. 2026): ไม่มีเพดานรายวันแล้ว · นั่งในห้อง = สะสมวินาทีเข้า "กระปุก" เต็มที่ 2 ชม.
//    กดรับ → เหรียญ = วินาทีในกระปุก × ระดับบ้าน · กันโกง: ยอดรับ ≤ เวลาจริงที่ผ่านไปนับจากรับครั้งก่อน
//    (focusClaimAt = serverTimestamp) — เปิดหลายเครื่องพร้อมกันก็ได้ไม่เกินเวลาจริง
//  นับเฉพาะตอนจอเปิด (document.visible) · เปิดหลายแท็บ = นับแท็บเดียว (ล็อกผ่าน localStorage)
//  เขียน Firestore รวมทุก 60 วิ + ตอนออกห้อง/ปัดจอ/ปิดแท็บ (ไม่ยิงทุกวินาที):
//    focusSecs += increment (เวลาโฟกัสสะสมตลอดชีพ → การ์ดสมาชิก + ความสำเร็จ)
//    focusBank = { secs, c } (กระปุก · c = เวลารับครั้งล่าสุด ms ใช้รู้ว่าเครื่องอื่นกดรับไปแล้ว)
//    focusDay = { d, secs, coins } (ยอดวันนี้ โชว์อย่างเดียว)
// ════════════════════════════════════════════════════════════
import { reactive, computed } from 'vue'
import { increment, serverTimestamp } from 'firebase/firestore'
import { dayKey } from '../utils/dailyChallenge.js'
import { useAuthStore } from '../stores/auth.js'
import { examFestMulti } from '../utils/examFest.js'
import { focusBonus } from '../utils/supporter.js'

export const COIN_CAP_SECS = 2 * 60 * 60   // กระปุกเต็มที่ 2 ชม.
const FLUSH_EVERY = 60
const SKEY = 'rxtu.focus.session'   // sessionStorage: รีเฟรชแล้วยังอยู่ในโหมด
const DKEY = 'rxtu.focus.day'       // localStorage: ยอดวันนี้ (สำรองระหว่างรอ flush)
const BKEY = 'rxtu.focus.bank'      // localStorage: กระปุก { secs, c }
const LKEY = 'rxtu.focus.leader'    // localStorage: แท็บไหนเป็นคนนับ
const TAB = Math.random().toString(36).slice(2)

function load(store, key, def) { try { return JSON.parse(globalThis[store]?.getItem(key)) || def } catch { return def } }
function save(store, key, v) { try { globalThis[store]?.setItem(key, JSON.stringify(v)) } catch { /* private mode */ } }
const freshDay = () => ({ day: dayKey(), coins: 0, secs: 0 })

const s0 = load('sessionStorage', SKEY, null)
const d0 = load('localStorage', DKEY, null)
const state = reactive({
  active: !!s0?.active,
  zone: s0?.zone || 'lib',
  secs: s0?.secs || 0,                 // เวลาโฟกัสรอบนี้
  onQuiz: false,
  onGame: false,
  saver: false,   // 🌙 โหมดโฟกัส (จอดำ อ่านนอกจอ) → ไม่ตัดเป็นไม่อยู่   // อยู่หน้าเกม → 🎮 เล่นเกม (เหรียญยังนับ · user 22 พ.ย. เพื่อนโตแล้ว)
  idle: false,   // ไม่แตะจอเกิน 30 วิ → ไม่อยู่
  // ⚠️ ยอดในเครื่องช่วงทดลอง (ก่อน 22 พ.ย. เย็น) ไม่ได้เข้ากระเป๋าจริง — เริ่มนับใหม่จากค่าใน Firestore (syncDay)
  day: d0?.day === dayKey() && d0?.v === 2 ? d0 : { ...freshDay(), v: 2 },
  bank: load('localStorage', BKEY, null) || { secs: 0, c: 0 },
  claiming: false,
  pops: 0,                             // นับครั้งที่เหรียญเด้ง — หน้าห้อง watch ตัวนี้เพื่อวาดเลขลอย
  lastGain: 0,
})
const pending = { secs: 0, z: {} }
// 🏅 ชุดภารกิจ (27 พ.ย.): วินาทีที่นั่งแยกรายห้อง → users.quest.z<ห้อง> (ห้องสมุด/คาเฟ่/สวน)
const QUEST_ZONES = new Set(['lib', 'cafe', 'forest'])
function takeZonePatch(u) {
  const z = pending.z; pending.z = {}
  const local = { ...(u.quest || {}) }, server = {}
  for (const [k, n] of Object.entries(z)) { if (!n) continue; local['z' + k] = (local['z' + k] || 0) + n; server['quest.z' + k] = increment(n) }
  return Object.keys(server).length ? { local: { quest: local }, server, back: z } : { local: {}, server: {}, back: null }
}
const giveBackZones = (z) => { if (z) for (const [k, n] of Object.entries(z)) pending.z[k] = (pending.z[k] || 0) + n }
let timer = null, sinceFlush = 0, synced = false
let houseLevel = () => 1
// เหรียญต่อวินาที = เลเวลบ้าน + บัฟชุดเบค (+5) แล้วคูณเทศกาลสอบ
const perSec = () => (Math.max(1, Math.round(houseLevel())) + focusBonus(useAuthStore().userData)) * examFestMulti()

function persist() {
  save('sessionStorage', SKEY, { active: state.active, zone: state.zone, secs: state.secs })
  save('localStorage', DKEY, state.day)
  save('localStorage', BKEY, state.bank)
}
const tsMs = (t) => (t?.toMillis ? t.toMillis() : typeof t === 'number' ? t : t instanceof Date ? t.getTime() : 0)
// ยอดวันนี้จากเครื่องอื่น (Firestore) — เอาค่ามากกว่า กันเพดานรีเซ็ตเมื่อสลับเครื่อง
function syncDay() {
  if (synced) return
  const u = useAuthStore().userData
  if (!u) return
  synced = true
  const fd = u.focusDay
  if (fd?.d === state.day.day) {
    state.day.secs = Math.max(state.day.secs, fd.secs || 0)
    state.day.coins = Math.max(state.day.coins, fd.coins || 0)
  }
  const fb = u.focusBank
  if (fb) {
    if ((fb.c || 0) > (state.bank.c || 0)) state.bank = { secs: fb.secs || 0, c: fb.c }   // เครื่องอื่นกดรับไปแล้ว → เริ่มจากยอดนั้น
    else if (fb.c === state.bank.c) state.bank.secs = Math.max(state.bank.secs, fb.secs || 0)
  }
}
function isLeader() {
  const now = Date.now(), cur = load('localStorage', LKEY, null)
  if (cur && cur.tab !== TAB && now - cur.at < 3000) return false
  save('localStorage', LKEY, { tab: TAB, at: now })
  return true
}
function flush() {
  if (!pending.secs) return
  const auth = useAuthStore(), u = auth.userData
  if (!u) return
  const ps = pending.secs
  pending.secs = 0; sinceFlush = 0
  const fd = { d: state.day.day, secs: state.day.secs, coins: state.day.coins }
  const fb = { secs: state.bank.secs, c: state.bank.c || 0 }
  const zp = takeZonePatch(u)
  Promise.resolve(auth.patchUser(
    { focusSecs: (u.focusSecs || 0) + ps, focusDay: fd, focusBank: fb, ...zp.local },
    { focusSecs: increment(ps), focusDay: fd, focusBank: fb, ...zp.server },
  )).then((ok) => { if (ok === false) { pending.secs += ps; giveBackZones(zp.back) } })   // ไม่ผ่าน → คืนยอดไว้ส่งรอบหน้า
  persist()
}
function tick() {
  if (!state.active || globalThis.document?.hidden) return
  if (!isLeader()) return
  syncDay()
  if (state.day.day !== dayKey()) { flush(); state.day = { ...freshDay(), v: 2 } }   // ข้ามเที่ยงคืน
  state.secs += 1
  state.day.secs += 1
  pending.secs += 1
  if (QUEST_ZONES.has(state.zone)) pending.z[state.zone] = (pending.z[state.zone] || 0) + 1
  if (state.bank.secs < COIN_CAP_SECS) {
    state.bank.secs += 1
    state.lastGain = perSec()
    state.pops++
  }
  if (++sinceFlush >= FLUSH_EVERY) flush()
  else if (state.secs % 5 === 0) persist()
}
// 🪙 กดรับเหรียญจากกระปุก — ยอดที่รับได้ ≤ เวลาจริงนับจากรับครั้งก่อน (กันปั๊มวินาที/หลายเครื่อง)
async function claim() {
  const auth = useAuthStore(), u = auth.userData
  if (!u || state.claiming) return 0
  syncDay()
  const now = Date.now()
  const last = tsMs(u.focusClaimAt)
  const real = last ? Math.max(0, Math.floor((now - last) / 1000)) : COIN_CAP_SECS
  const secs = Math.min(Math.floor(state.bank.secs), real, COIN_CAP_SECS)
  if (secs <= 0) return 0
  const coins = secs * perSec()   // 📚 เทศกาลสอบ ×2 + ☕ บัฟชุดเบค
  state.claiming = true
  const ps = pending.secs; pending.secs = 0; sinceFlush = 0
  const fb = { secs: 0, c: now }
  const fd = { d: state.day.day, secs: state.day.secs, coins: state.day.coins + coins }
  const zp = takeZonePatch(u)
  const ok = await auth.patchUser(
    { coins: (u.coins || 0) + coins, focusSecs: (u.focusSecs || 0) + ps, focusDay: fd, focusBank: fb, focusClaimAt: new Date(now), ...zp.local },
    { coins: increment(coins), focusSecs: increment(ps), focusDay: fd, focusBank: fb, focusClaimAt: serverTimestamp(), ...zp.server },
  )
  state.claiming = false
  if (ok === false) { pending.secs += ps; giveBackZones(zp.back); return 0 }
  state.bank = { secs: 0, c: now }
  state.day.coins = fd.coins
  persist()
  return coins
}
function ensureTimer() {
  if (state.active && !timer) timer = setInterval(tick, 1000)
  if (!state.active && timer) { clearInterval(timer); timer = null }
}
ensureTimer()
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush() })
  window.addEventListener('pagehide', flush)
}

export function useFocusMode(getHouseLevel) {
  if (getHouseLevel) houseLevel = getHouseLevel
  return {
    state,
    capFull: computed(() => state.bank.secs >= COIN_CAP_SECS),
    capPct: computed(() => Math.min(1, state.bank.secs / COIN_CAP_SECS)),
    bankCoins: computed(() => Math.floor(state.bank.secs) * perSec()),
    claim,
    status: computed(() => (state.onQuiz ? 'quiz' : state.saver ? 'deep' : state.idle ? 'afk' : state.onGame ? 'game' : 'here')),
    enter(zone) { if (zone) state.zone = zone; if (!state.active) { state.active = true; state.secs = 0 } persist(); ensureTimer() },
    leave() { flush(); state.active = false; persist(); ensureTimer() },
    setZone(z) { state.zone = z; persist() },
    setOnQuiz(v) { state.onQuiz = !!v },
    setOnGame(v) { state.onGame = !!v },
    setSaver(v) { state.saver = !!v },
  }
}

export const STATUS_LABEL = { here: '🟢 อยู่จอ', quiz: '✍️ ทำข้อสอบ', game: '🎮 เล่นเกม', deep: '🌙 โหมดโฟกัส', afk: '💤 ไม่อยู่' }

// ── ตรวจว่าอยู่หน้าจอไหม (22 พ.ย.) — ไม่แตะ/ไม่เลื่อน/ไม่พิมพ์เกิน 30 วิ = ไม่อยู่ · ขยับเมื่อไหร่กลับเป็นอยู่จอ ──
const IDLE_MS = 30000
if (typeof window !== 'undefined') {
  let lastAct = Date.now()
  const poke = () => { lastAct = Date.now(); if (state.idle) state.idle = false }
  for (const ev of ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart', 'scroll']) window.addEventListener(ev, poke, { passive: true, capture: true })
  document.addEventListener('visibilitychange', () => { if (!document.hidden) poke() })
  setInterval(() => { const idle = Date.now() - lastAct > IDLE_MS; if (idle !== state.idle) state.idle = idle }, 5000)
}
export function fmtClock(secs) {
  const s = Math.floor(secs), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60
  return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0')
}
// เวลาโฟกัสสะสมแบบอ่านง่าย (การ์ดสมาชิก)
export function fmtHours(secs) {
  const m = Math.floor((secs || 0) / 60)
  return m >= 60 ? `${Math.floor(m / 60)} ชม.` : `${m} น.`
}
