// ════════════════════════════════════════════════════════════
//  useFocusMode — สถานะโหมดโฟกัส (Co-working space) ระดับทั้งแอป · singleton
//  เข้าโหมด = เริ่มจับเวลา · สถานะ 3: ✍️ ทำข้อสอบ (อยู่หน้า quiz/daily/timeAttack · derive จาก route) / 🎮 เล่นเกม (หน้าเกม) / 🟢 อยู่จอ / 💤 ไม่อยู่ (ไม่แตะจอ 30 วิ)
//  เหรียญ: เด้งวิละครั้ง ครั้งละ = ระดับบ้าน · เพดาน 2 ชม./วัน ครบแล้วไม่เด้ง (user 22 พ.ย. 2026)
//  นับเฉพาะตอนจอเปิด (document.visible) · เปิดหลายแท็บ = นับแท็บเดียว (ล็อกผ่าน localStorage)
//  เขียน Firestore รวมทุก 60 วิ + ตอนออกห้อง/ปัดจอ/ปิดแท็บ (ไม่ยิงทุกวินาที):
//    coins += increment · focusSecs += increment (เวลาโฟกัสสะสมตลอดชีพ → การ์ดสมาชิก + ความสำเร็จ)
//    focusDay = { d, secs, coinSecs, coins } (ยอดวันนี้ — ใช้กันเพดานข้ามเครื่อง)
// ════════════════════════════════════════════════════════════
import { reactive, computed } from 'vue'
import { increment } from 'firebase/firestore'
import { dayKey } from '../utils/dailyChallenge.js'
import { useAuthStore } from '../stores/auth.js'

export const COIN_CAP_SECS = 2 * 60 * 60
const FLUSH_EVERY = 60
const SKEY = 'rxtu.focus.session'   // sessionStorage: รีเฟรชแล้วยังอยู่ในโหมด
const DKEY = 'rxtu.focus.day'       // localStorage: ยอดวันนี้ (สำรองระหว่างรอ flush)
const LKEY = 'rxtu.focus.leader'    // localStorage: แท็บไหนเป็นคนนับ
const TAB = Math.random().toString(36).slice(2)

function load(store, key, def) { try { return JSON.parse(globalThis[store]?.getItem(key)) || def } catch { return def } }
function save(store, key, v) { try { globalThis[store]?.setItem(key, JSON.stringify(v)) } catch { /* private mode */ } }
const freshDay = () => ({ day: dayKey(), coinSecs: 0, coins: 0, secs: 0 })

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
  pops: 0,                             // นับครั้งที่เหรียญเด้ง — หน้าห้อง watch ตัวนี้เพื่อวาดเลขลอย
  lastGain: 0,
})
const pending = { secs: 0, coins: 0 }
let timer = null, sinceFlush = 0, synced = false
let houseLevel = () => 1

function persist() {
  save('sessionStorage', SKEY, { active: state.active, zone: state.zone, secs: state.secs })
  save('localStorage', DKEY, state.day)
}
// ยอดวันนี้จากเครื่องอื่น (Firestore) — เอาค่ามากกว่า กันเพดานรีเซ็ตเมื่อสลับเครื่อง
function syncDay() {
  if (synced) return
  const u = useAuthStore().userData
  if (!u) return
  synced = true
  const fd = u.focusDay
  if (fd?.d === state.day.day) {
    state.day.coinSecs = Math.max(state.day.coinSecs, fd.coinSecs || 0)
    state.day.secs = Math.max(state.day.secs, fd.secs || 0)
    state.day.coins = Math.max(state.day.coins, fd.coins || 0)
  }
}
function isLeader() {
  const now = Date.now(), cur = load('localStorage', LKEY, null)
  if (cur && cur.tab !== TAB && now - cur.at < 3000) return false
  save('localStorage', LKEY, { tab: TAB, at: now })
  return true
}
function flush() {
  if (!pending.secs && !pending.coins) return
  const auth = useAuthStore(), u = auth.userData
  if (!u) return
  const ps = pending.secs, pc = pending.coins
  pending.secs = 0; pending.coins = 0; sinceFlush = 0
  const fd = { d: state.day.day, secs: state.day.secs, coinSecs: state.day.coinSecs, coins: state.day.coins }
  Promise.resolve(auth.patchUser(
    { coins: (u.coins || 0) + pc, focusSecs: (u.focusSecs || 0) + ps, focusDay: fd },
    { coins: increment(pc), focusSecs: increment(ps), focusDay: fd },
  )).then((ok) => { if (ok === false) { pending.secs += ps; pending.coins += pc } })   // ไม่ผ่าน → คืนยอดไว้ส่งรอบหน้า
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
  if (state.day.coinSecs < COIN_CAP_SECS) {
    const gain = Math.max(1, Math.round(houseLevel()))
    state.day.coinSecs += 1
    state.day.coins += gain
    pending.coins += gain
    state.lastGain = gain
    state.pops++
  }
  if (++sinceFlush >= FLUSH_EVERY) flush()
  else if (state.secs % 5 === 0) persist()
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
    capFull: computed(() => state.day.coinSecs >= COIN_CAP_SECS),
    capPct: computed(() => Math.min(1, state.day.coinSecs / COIN_CAP_SECS)),
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
