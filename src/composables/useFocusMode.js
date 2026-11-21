// ════════════════════════════════════════════════════════════
//  useFocusMode — สถานะโหมดโฟกัส (Co-working space) ระดับทั้งแอป · singleton
//  เข้าโหมด = เริ่มจับเวลาทันที · สถานะมีแค่ 2: ✍️ ทำข้อสอบ (อยู่หน้า /quiz) / 💤 AFK (ที่เหลือ) — derive จาก route
//  เหรียญ: เด้งวิละครั้ง ครั้งละ = ระดับบ้าน (user 22 พ.ย. ลองทุก 0.5 วิแล้วกลับมาแบบนี้) · เพดาน 2 ชม./วัน ครบแล้วไม่เด้ง (user 22 พ.ย. 2026)
//  นับเฉพาะตอนจอเปิด (document.visible) — เว็บทำงานเบื้องหลังไม่ได้อยู่แล้ว
//  ⚠️ ช่วงทดลอง (TRIAL): ยังไม่เขียน Firestore — เหรียญ/เวลาเก็บในเครื่อง (localStorage) ไว้ดูหน้าตาเท่านั้น
// ════════════════════════════════════════════════════════════
import { reactive, computed } from 'vue'
import { dayKey } from '../utils/dailyChallenge.js'

export const FOCUS_TRIAL = true
export const COIN_CAP_SECS = 2 * 60 * 60
const TICK = 1
const SKEY = 'rxtu.focus.session'   // sessionStorage: รีเฟรชแล้วยังอยู่ในโหมด
const DKEY = 'rxtu.focus.day'       // localStorage: ยอดวันนี้ (ทดลอง)

function load(store, key, def) { try { return JSON.parse(globalThis[store]?.getItem(key)) || def } catch { return def } }
function save(store, key, v) { try { globalThis[store]?.setItem(key, JSON.stringify(v)) } catch { /* private mode */ } }

const s0 = load('sessionStorage', SKEY, null)
const d0 = load('localStorage', DKEY, null)
const state = reactive({
  active: !!s0?.active,
  zone: s0?.zone || 'lib',
  secs: s0?.secs || 0,                 // เวลาโฟกัสรอบนี้
  onQuiz: false,
  day: d0?.day === dayKey() ? d0 : { day: dayKey(), coinSecs: 0, coins: 0, secs: 0 },
  pops: 0,                             // นับครั้งที่เหรียญเด้ง — หน้าห้อง watch ตัวนี้เพื่อวาดเลขลอย
  lastGain: 0,
})
let timer = null
let houseLevel = () => 1

function persist() {
  save('sessionStorage', SKEY, { active: state.active, zone: state.zone, secs: state.secs })
  save('localStorage', DKEY, state.day)
}
function tick() {
  if (!state.active || globalThis.document?.hidden) return
  if (state.day.day !== dayKey()) state.day = { day: dayKey(), coinSecs: 0, coins: 0, secs: 0 }   // ข้ามเที่ยงคืน
  state.secs += TICK
  state.day.secs += TICK
  if (state.day.coinSecs < COIN_CAP_SECS) {
    const gain = houseLevel()
    state.day.coinSecs += TICK
    state.day.coins += gain
    state.lastGain = gain
    state.pops++
  }
  if (state.secs % 5 === 0) persist()
}
function ensureTimer() {
  if (state.active && !timer) timer = setInterval(tick, TICK * 1000)
  if (!state.active && timer) { clearInterval(timer); timer = null }
}
ensureTimer()

export function useFocusMode(getHouseLevel) {
  if (getHouseLevel) houseLevel = getHouseLevel
  return {
    state,
    capFull: computed(() => state.day.coinSecs >= COIN_CAP_SECS),
    capPct: computed(() => Math.min(1, state.day.coinSecs / COIN_CAP_SECS)),
    status: computed(() => (state.onQuiz ? 'quiz' : 'afk')),
    enter(zone) { if (zone) state.zone = zone; if (!state.active) { state.active = true; state.secs = 0 } persist(); ensureTimer() },
    leave() { state.active = false; persist(); ensureTimer() },
    setZone(z) { state.zone = z; persist() },
    setOnQuiz(v) { state.onQuiz = !!v },
  }
}

export const STATUS_LABEL = { quiz: '✍️ ทำข้อสอบ', afk: '💤 AFK' }
export function fmtClock(secs) {
  const s = Math.floor(secs), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60
  return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0')
}
