// 🥊 สนามมวย (Co-working ห้องที่ 4) — สถานะเวทีบน Realtime Database · ใช้คู่กับ utils/ringMatch.js
//  focus/ring/m      { id, r:{uid,name}, b?:{uid,name}, at, st?, done?, h:{ r:{i:hand}, b:{i:hand} } }   ← เวทีมีได้ทีละคู่
//     · มุมแดง = คนแรกกดจอง · มุมน้ำเงิน = คนแรกที่กดตาม · ไม่มีกรรมการ ทุกเครื่องคำนวณผลจาก h เอง
//     · หลุด/ปิดแอป → onDisconnect ลบมุมตัวเอง → อีกฝ่ายชนะ (ผลแบบ "คู่ชกออกจากเวที")
//     · รอคู่ชกเกิน WAIT_MS / ค้างเกิน STALE_MS = ห้องว่าง ใครจองใหม่ก็ทับได้
//  focus/ring/board/{push}  { w, l, s, f?, at }   ← กระดานผล (อ่าน 60 รายการล่าสุด)
//  ผลแพ้ชนะประกาศในแชตห้อง ring (useFocusRoom.say · sys:'ring') — เขียนครั้งเดียวด้วย transaction done
import { ref, computed, reactive } from 'vue'
import { getDatabase, ref as dbRef, onValue, set, remove, push, runTransaction, onDisconnect, serverTimestamp, query, limitToLast } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import { app } from '../firebase/config.js'
import { cleanText } from '../utils/text.js'
import { deriveMatch } from '../utils/ringMatch.js'

let _db = null
const rtdb = () => (_db ||= getDatabase(app))
const uid = () => getAuth(app).currentUser?.uid || ''
const M = 'focus/ring/m'
export const WAIT_MS = 3 * 60 * 1000    // จองมุมแดงแล้วไม่มีใครมาชก 3 นาที = ปล่อยเวที
export const STALE_MS = 15 * 60 * 1000  // ไฟต์ค้างนานผิดปกติ = ถือว่าว่าง

// เอฟเฟกต์บนตัวคู่ชก (FocusView วาดบนอวาตาร์เอง): hands[uid] = { c: อีโมจิเหนือหัว, k: 'think'|'slam'|'on' } · cls[uid] = 'white'|'hit'|'ko'|'win'
export const ringFx = reactive({ hands: {}, cls: {} })
const match = ref(null)
const board = ref([])
let subs = 0, offM = null, offB = null
function attach() {
  offM = onValue(dbRef(rtdb(), M), (s) => { match.value = s.val() }, () => { match.value = null })
  offB = onValue(query(dbRef(rtdb(), 'focus/ring/board'), limitToLast(60)), (s) => {
    const out = []; s.forEach(c => { const v = c.val(); if (v) out.push({ id: c.key, ...v }) }); board.value = out.reverse()
  }, () => { board.value = [] })
}
function detach() { offM?.(); offB?.(); offM = offB = null }

// ตัวเราอยู่บนเวทีไหม (FocusView ห้ามเดินระหว่างชก)
// ล็อกตั้งแต่ขึ้นเวทีจนเวทีถูกล้าง (รวมช่วงฉลองหลังจบ) · เวทีหมดอายุ (รอคู่ชกเกิน 3 นาที/ค้าง) = ปลดล็อก
export const ringMine = computed(() => { const m = match.value, u = uid(); return !!(u && m && !isStale(m) && (m.r?.uid === u || m.b?.uid === u)) })
/** ล้างเอฟเฟกต์บนตัวทุกคน (จบไฟต์/ออกห้อง) — ไม่อิง uid จาก match เพราะ match อาจถูกล้างไปก่อนแล้ว */
export function clearRingFx() { for (const k of Object.keys(ringFx.hands)) delete ringFx.hands[k]; for (const k of Object.keys(ringFx.cls)) delete ringFx.cls[k] }
const isStale = (m, now = Date.now()) => !m || !m.r || (typeof m.at === 'number' && (now - m.at > STALE_MS || (!m.b && now - m.at > WAIT_MS)))

export function useRing() {
  if (subs++ === 0) attach()
  const mySide = computed(() => (match.value?.r?.uid === uid() ? 'r' : match.value?.b?.uid === uid() ? 'b' : null))
  const state = computed(() => deriveMatch(match.value?.h))

  /** จองมุม: เวทีว่าง → มุมแดง · มีมุมแดงรออยู่ → มุมน้ำเงิน · คืน 'r' | 'b' | null */
  async function claim(name) {
    const me = uid(); if (!me) return null
    const nm = cleanText(name || 'เพื่อน', 24)
    let side = null
    const id = push(dbRef(rtdb(), 'focus/ring/board')).key   // ใช้แค่เป็นรหัสไม่ซ้ำ (ไม่เขียน)
    try {
      await runTransaction(dbRef(rtdb(), M), (cur) => {
        side = null
        if (isStale(cur)) { side = 'r'; return { id, r: { uid: me, name: nm }, at: Date.now() } }
        if (cur.r.uid === me || cur.b?.uid === me) { side = cur.r.uid === me ? 'r' : 'b'; return cur }
        if (!cur.b) { side = 'b'; return { ...cur, b: { uid: me, name: nm }, st: Date.now() } }
        return undefined   // มีคู่ชกอยู่แล้ว
      })
    } catch (e) { console.error('[ring claim]', e); return null }
    if (side) onDisconnect(dbRef(rtdb(), `${M}/${side}`)).remove().catch(() => {})
    return side
  }
  /** ออกมือยกที่ i (เขียนได้ครั้งเดียว — ทับไม่ได้) */
  function throwHand(i, hand) {
    const s = mySide.value; if (!s || !match.value?.id) return
    runTransaction(dbRef(rtdb(), `${M}/h/${s}/${i}`), (cur) => (cur == null ? hand : undefined)).catch(() => {})
  }
  /** ลงจากเวที (ยกเลิกตอนรอ / ยอมแพ้) */
  async function leaveRing() {
    const s = mySide.value; if (!s) return
    onDisconnect(dbRef(rtdb(), `${M}/${s}`)).cancel().catch(() => {})
    if (s === 'r' && !match.value?.b) await remove(dbRef(rtdb(), M)).catch(() => {})
    else await remove(dbRef(rtdb(), `${M}/${s}`)).catch(() => {})
  }
  /** ปิดไฟต์ครั้งเดียว (ใครกดได้ก่อน) → คืน true ถ้าเราเป็นคนปิด = ต้องเขียนกระดาน+แชต */
  async function finish(id) {
    let mine = false
    try {
      await runTransaction(dbRef(rtdb(), M), (cur) => {
        mine = false
        if (!cur || cur.id !== id || cur.done) return undefined
        mine = true; return { ...cur, done: true }
      })
    } catch { return false }
    return mine
  }
  function record(row) {
    return set(push(dbRef(rtdb(), 'focus/ring/board')), { ...row, at: serverTimestamp() }).catch(() => {})
  }
  /** ล้างเวที (หลังโชว์ผลจบ) — ล้างเฉพาะไฟต์เดิม */
  function clear(id) {
    for (const s of ['r', 'b']) if (mySide.value === s) onDisconnect(dbRef(rtdb(), `${M}/${s}`)).cancel().catch(() => {})
    runTransaction(dbRef(rtdb(), M), (cur) => (cur && cur.id === id ? null : undefined)).catch(() => {})
  }
  function release() { if (--subs === 0) detach() }
  return { match, board, mySide, state, claim, throwHand, leaveRing, finish, record, clear, release, isStale }
}
