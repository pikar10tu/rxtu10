// ════════════════════════════════════════════════════════════
//  useFocusRoom — คนในห้องโฟกัส + แชท ผ่าน Realtime Database (22 พ.ย. 2026) · singleton ระดับแอป
//  (ตัวเราอยู่ในห้องต่อแม้ออกไปทำข้อสอบ — หน้าโฟกัส unmount แล้ว presence ยังอยู่)
//  focus/presence/{uid}  { name, zone, seat, x, y, st:'here'|'quiz'|'game'|'afk', house, doll, at, away, hf? = ยกมือไฮไฟว์ (เวลาเซิร์ฟเวอร์) }
//     · เขียนตอน เข้า/เปลี่ยนโซน/เดินถึงที่/เปลี่ยนสถานะ/ปัดจอ + ชีพจรทุก 60 วิ (ไม่ส่งทุกก้าว ไม่ส่งเหรียญ)
//     · onDisconnect → ลบตัวเองทิ้ง (ปิดแท็บ/ปิดแอป/เน็ตหลุด = หายจากห้องเอง) · รีเฟรช → FocusPill เข้าห้องให้ใหม่
//     · ปัดจอ (hidden) → away:true (ขึ้น 💤 จาง) · กลับมา → away:false
//     · ชีพจรเงียบเกิน 30 นาที = ไม่แสดง (กันตกค้างกรณี onDisconnect ไม่ทำงาน)
//  focus/chat/{YYYY-MM-DD}/{zone}/{push}  { uid, name, text, at }
//     · เก็บแยกรายวัน · จอรวมเมื่อวาน+วันนี้ 50 ข้อความล่าสุด (แชทไม่หายตอนเที่ยงคืน 29 พ.ย.) · ของเก่ายังเก็บไว้ตรวจย้อนหลัง (ไม่แจ้งผู้ใช้ — user สั่ง 22 พ.ย.)
//  เหรียญ/เวลาโฟกัสไม่ผ่าน RTDB (useFocusMode) — เหรียญเด้งของเพื่อนแต่ละเครื่องวาดเองจาก house
// ════════════════════════════════════════════════════════════
import { ref, computed, watch } from 'vue'
import {
  getDatabase, ref as dbRef, onValue, update, remove, push, onDisconnect, get,
  serverTimestamp, query, limitToLast,
} from 'firebase/database'
import { getAuth } from 'firebase/auth'
import { app } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { dayKey } from '../utils/dailyChallenge.js'
import { encodeDoll } from '../utils/dollCode.js'
import { dollOf } from '../utils/doll.js'
import { cleanText } from '../utils/text.js'

let _db = null
const rtdb = () => (_db ||= getDatabase(app))
const myUid = () => getAuth(app).currentUser?.uid || ''
const STALE_MS = 30 * 60 * 1000
// 📱 นับเครื่องเดียว (23 พ.ย. 2026): presence/{uid}.dev = รหัสเครื่องที่ถือห้องอยู่ · เครื่องที่เข้าทีหลังยึดแทน เครื่องเดิมโดนเชิญออก
const DEV = (() => {
  try { let d = localStorage.getItem('rxtu.focus.dev'); if (!d) { d = Math.random().toString(36).slice(2, 12); localStorage.setItem('rxtu.focus.dev', d) } return d }
  catch { return Math.random().toString(36).slice(2, 12) }
})()
const kicked = ref(0)   // นับครั้งที่โดนเครื่องอื่นยึด — FocusPill/FocusView watch แล้วออกจากห้องในเครื่องนี้

// ── รายชื่อคนในห้อง (ทุกโซน) — ใช้ร่วมกับการ์ดทางเข้า/แถบหน้าแรก ──
const all = ref({})
let presSubs = 0, presOff = null
// ⚠️ ฟังก่อนล็อกอินเสร็จ (ป้ายลอยโหลดตั้งแต่เปิดแอป) = โดนปฏิเสธแล้วตัวฟังตายถาวร → ลองต่อใหม่ทุก 3 วิจนกว่าจะติด
function attachPresence() {
  if (presOff || presSubs <= 0) return
  if (!myUid()) { setTimeout(attachPresence, 1500); return }
  presOff = onValue(dbRef(rtdb(), 'focus/presence'), (s) => { all.value = s.val() || {}; checkMine() }, () => {
    all.value = {}; presOff = null; setTimeout(attachPresence, 3000)
  })
}
function subPresence() { if (presSubs++ === 0) attachPresence() }
function unsubPresence() { if (presSubs > 0 && --presSubs === 0 && presOff) { presOff(); presOff = null } }
const live = computed(() => {
  const now = Date.now()
  return Object.entries(all.value)
    .filter(([, p]) => p && (typeof p.at !== 'number' || now - p.at < STALE_MS))
    .map(([uid, p]) => ({ uid, ...p }))
})
export function useFocusPeople() { subPresence(); return { people: live, stop: unsubPresence } }

// ── ตัวเรา ──
const joined = ref(false)
let beat = 0, visBound = false
const meRef = () => dbRef(rtdb(), `focus/presence/${myUid()}`)
function base() {
  const u = useAuthStore().userData
  return {
    name: cleanText(u?.nickname || 'เพื่อน', 24),
    house: u?.residence?.level || 1,
    doll: encodeDoll(dollOf(u).eq) || '',
    at: serverTimestamp(),
  }
}
function patch(p) {
  if (!joined.value || !myUid()) return
  const v = { ...p, at: serverTimestamp() }
  if ('x' in v) v.x = Math.round(v.x)
  if ('y' in v) v.y = Math.round(v.y)
  if (lastP) for (const k of ['zone', 'seat', 'x', 'y']) if (k in v) lastP[k] = v[k]
  update(meRef(), v).catch(() => {})
}
// เครื่องอื่นของบัญชีเดียวกันกำลังอยู่ในห้องไหม (อ่านสด ไม่พึ่ง cache)
async function otherDevice() {
  if (!myUid()) return false
  const v = await get(meRef()).then(s => s.val()).catch(() => null)
  return !!(v && v.dev && v.dev !== DEV && (typeof v.at !== 'number' || Date.now() - v.at < STALE_MS))
}
let lastP = null
function checkMine() {
  if (!joined.value || !myUid()) return
  const v = all.value[myUid()]
  if (v?.dev && v.dev !== DEV) {   // เครื่องอื่นยึดห้องไปแล้ว → ออกเงียบๆ ห้ามลบ presence (เป็นของเครื่องใหม่)
    joined.value = false; clearInterval(beat)
    onDisconnect(meRef()).cancel().catch(() => {})
    unsubPresence()
    kicked.value++
  } else if (!v && lastP) {        // ตัวหาย (onDisconnect ของเครื่องเก่าลบทับ) → เขียนตัวเองกลับ
    update(meRef(), { ...base(), ...lastP, dev: DEV }).catch(() => {})
  }
}
// opts.auto = เข้าห้องอัตโนมัติ (รีเฟรช/เปิดแอปใหม่) → ถ้าเครื่องอื่นถืออยู่ ไม่ยึด คืน 'taken'
async function join(p, opts = {}) {   // p = { zone, seat, x, y, st }
  if (!myUid()) return
  if (opts.auto && await otherDevice()) { kicked.value++; return 'taken' }
  subPresence()   // ค้างไว้ตลอดที่อยู่ในห้อง (ป้ายลอยใช้)
  joined.value = true
  lastP = { zone: p.zone, seat: p.seat, x: Math.round(p.x), y: Math.round(p.y) }
  onDisconnect(meRef()).remove().catch(() => {})
  // เขียนไม่ผ่าน (rules/เน็ต) → ถือว่ายังไม่ได้เข้าห้อง ให้ป้ายลอย/หน้าโฟกัสลองเข้าใหม่ได้ (เดิมค้าง joined=true แต่ไม่มีตัวในห้อง)
  await update(meRef(), { ...base(), ...p, x: Math.round(p.x), y: Math.round(p.y), away: !!document.hidden, dev: DEV }).catch(() => { joined.value = false })
  clearInterval(beat)
  beat = setInterval(() => { if (joined.value && !document.hidden) update(meRef(), { at: serverTimestamp() }).catch(() => {}) }, 60000)
  if (!visBound) {
    visBound = true; document.addEventListener('visibilitychange', () => patch({ away: document.hidden }))
    // 👗 เปลี่ยนชุดตอนอยู่ในห้อง → เพื่อนเห็นทันที (เขียนเฉพาะตอนรหัสชุดเปลี่ยนจริง · 27 พ.ย. user ขอ)
    watch(() => encodeDoll(dollOf(useAuthStore().userData).eq) || '', (d, old) => { if (d !== old) patch({ doll: d }) })
  }
}
function leave() {
  if (!joined.value) return
  joined.value = false; clearInterval(beat); lastP = null
  if (myUid()) { onDisconnect(meRef()).cancel().catch(() => {}); remove(meRef()).catch(() => {}) }
  unsubPresence()
}

// ── แชทของโซน ──
// 29 พ.ย. user: แชทไม่หายตอนเที่ยงคืน → ฟังห้องเมื่อวาน+วันนี้ รวมกันโชว์ 50 ข้อความล่าสุด (ที่เก็บยังแยกรายวันเหมือนเดิม)
//   + เช็คทุกนาทีว่าข้ามวันหรือยัง ข้ามแล้วเลื่อนไปฟังคู่วันใหม่ (เดิมเปิดค้างข้ามคืน = เห็นแชทเก่า ส่งไปห้องใหม่ที่มองไม่เห็น)
const CHAT_N = 50
const chat = ref([])
let chatOffs = [], chatZone = '', chatDay = '', chatRoll = 0
const prevDayKey = (k) => dayKey(Date.parse(k + 'T12:00:00Z') - 86400000)
function subChat(zone) {
  chatOffs.forEach(f => f()); chatOffs = []
  chatDay = dayKey()
  const parts = { a: [], b: [] }
  const merge = () => {
    chat.value = [...parts.a, ...parts.b]
      .sort((x, y) => (typeof x.at === 'number' ? x.at : Infinity) - (typeof y.at === 'number' ? y.at : Infinity))   // เพิ่งส่ง (ยังไม่ประทับเวลา) = ท้ายสุด
      .slice(-CHAT_N)
  }
  ;[['a', prevDayKey(chatDay)], ['b', chatDay]].forEach(([k, d]) => {
    chatOffs.push(onValue(query(dbRef(rtdb(), `focus/chat/${d}/${zone}`), limitToLast(CHAT_N)), (s) => {
      const out = []
      s.forEach((c) => { const v = c.val(); if (v) out.push({ id: d + '/' + c.key, ...v }) })
      parts[k] = out; merge()
    }, () => { parts[k] = []; merge() }))
  })
}
function watchChat(zone) {
  if (zone === chatZone && chatOffs.length) return
  chat.value = []; chatZone = zone
  subChat(zone)
  clearInterval(chatRoll)
  chatRoll = setInterval(() => { if (chatZone && dayKey() !== chatDay) subChat(chatZone) }, 60000)
}
function unwatchChat() { chatOffs.forEach(f => f()); chatOffs = []; chatZone = ''; clearInterval(chatRoll) }
function say(zone, text, extra = {}) {   // extra.sys = ข้อความระบบ เช่น 'hf' ไฮไฟว์
  const t = cleanText(text, 80)
  if (!t || !myUid()) return false
  const r = push(dbRef(rtdb(), `focus/chat/${dayKey()}/${zone}`), { uid: myUid(), name: base().name, text: t, at: serverTimestamp(), ...extra })
  r.catch(() => {})
  return r   // ThenableReference (truthy) · ใช้ลบข้อความตัวเองทีหลังได้ (unsay)
}
// ลบข้อความของตัวเอง (rules: เจ้าของลบได้) — ใช้กับ "ขึ้นสังเวียน รอคู่ชก" ที่ไม่มีใครมาชก
function unsay(ref) { if (!ref) return; onDisconnect(ref).cancel().catch(() => {}); remove(ref).catch(() => {}) }

export function useFocusRoom() {
  subPresence()
  return { people: live, joined, myUid, join, otherDevice, kicked, patch, leave, watchChat, unwatchChat, chat, say, unsay, release: unsubPresence }
}
