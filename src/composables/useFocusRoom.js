// ════════════════════════════════════════════════════════════
//  useFocusRoom — คนในห้องโฟกัส + แชท ผ่าน Realtime Database (22 พ.ย. 2026) · singleton ระดับแอป
//  (ตัวเราอยู่ในห้องต่อแม้ออกไปทำข้อสอบ — หน้าโฟกัส unmount แล้ว presence ยังอยู่)
//  focus/presence/{uid}  { name, zone, seat, x, y, st:'quiz'|'afk', house, doll, at, away }
//     · เขียนตอน เข้า/เปลี่ยนโซน/เดินถึงที่/เปลี่ยนสถานะ/ปัดจอ + ชีพจรทุก 60 วิ (ไม่ส่งทุกก้าว ไม่ส่งเหรียญ)
//     · onDisconnect → ลบตัวเองทิ้ง (ปิดแท็บ/ปิดแอป/เน็ตหลุด = หายจากห้องเอง) · รีเฟรช → FocusPill เข้าห้องให้ใหม่
//     · ปัดจอ (hidden) → away:true (ขึ้น 💤 จาง) · กลับมา → away:false
//     · ชีพจรเงียบเกิน 30 นาที = ไม่แสดง (กันตกค้างกรณี onDisconnect ไม่ทำงาน)
//  focus/chat/{YYYY-MM-DD}/{zone}/{push}  { uid, name, text, at }
//     · แยกห้องรายวัน จอดึงเฉพาะวันนี้ 50 ข้อความล่าสุด · ของเก่ายังเก็บไว้ตรวจย้อนหลัง (ไม่แจ้งผู้ใช้ — user สั่ง 22 พ.ย.)
//  เหรียญ/เวลาโฟกัสไม่ผ่าน RTDB (useFocusMode) — เหรียญเด้งของเพื่อนแต่ละเครื่องวาดเองจาก house
// ════════════════════════════════════════════════════════════
import { ref, computed } from 'vue'
import {
  getDatabase, ref as dbRef, onValue, update, remove, push, onDisconnect,
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

// ── รายชื่อคนในห้อง (ทุกโซน) — ใช้ร่วมกับการ์ดทางเข้า/แถบหน้าแรก ──
const all = ref({})
let presSubs = 0, presOff = null
// ⚠️ ฟังก่อนล็อกอินเสร็จ (ป้ายลอยโหลดตั้งแต่เปิดแอป) = โดนปฏิเสธแล้วตัวฟังตายถาวร → ลองต่อใหม่ทุก 3 วิจนกว่าจะติด
function attachPresence() {
  if (presOff || presSubs <= 0) return
  if (!myUid()) { setTimeout(attachPresence, 1500); return }
  presOff = onValue(dbRef(rtdb(), 'focus/presence'), (s) => { all.value = s.val() || {} }, () => {
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
  update(meRef(), v).catch(() => {})
}
async function join(p) {   // p = { zone, seat, x, y, st }
  if (!myUid()) return
  subPresence()   // ค้างไว้ตลอดที่อยู่ในห้อง (ป้ายลอยใช้)
  joined.value = true
  onDisconnect(meRef()).remove().catch(() => {})
  // เขียนไม่ผ่าน (rules/เน็ต) → ถือว่ายังไม่ได้เข้าห้อง ให้ป้ายลอย/หน้าโฟกัสลองเข้าใหม่ได้ (เดิมค้าง joined=true แต่ไม่มีตัวในห้อง)
  await update(meRef(), { ...base(), ...p, x: Math.round(p.x), y: Math.round(p.y), away: !!document.hidden }).catch(() => { joined.value = false })
  clearInterval(beat)
  beat = setInterval(() => { if (joined.value && !document.hidden) update(meRef(), { at: serverTimestamp() }).catch(() => {}) }, 60000)
  if (!visBound) { visBound = true; document.addEventListener('visibilitychange', () => patch({ away: document.hidden })) }
}
function leave() {
  if (!joined.value) return
  joined.value = false; clearInterval(beat)
  if (myUid()) { onDisconnect(meRef()).cancel().catch(() => {}); remove(meRef()).catch(() => {}) }
  unsubPresence()
}

// ── แชทของโซน (วันนี้) ──
const chat = ref([])
let chatOff = null, chatZone = ''
function watchChat(zone) {
  if (zone === chatZone && chatOff) return
  chatOff?.(); chat.value = []; chatZone = zone
  chatOff = onValue(query(dbRef(rtdb(), `focus/chat/${dayKey()}/${zone}`), limitToLast(50)), (s) => {
    const out = []
    s.forEach((c) => { const v = c.val(); if (v) out.push({ id: c.key, ...v }) })
    chat.value = out
  }, () => { chat.value = [] })
}
function unwatchChat() { chatOff?.(); chatOff = null; chatZone = '' }
function say(zone, text) {
  const t = cleanText(text, 80)
  if (!t || !myUid()) return false
  push(dbRef(rtdb(), `focus/chat/${dayKey()}/${zone}`), { uid: myUid(), name: base().name, text: t, at: serverTimestamp() }).catch(() => {})
  return true
}

export function useFocusRoom() {
  subPresence()
  return { people: live, joined, myUid, join, patch, leave, watchChat, unwatchChat, chat, say, release: unsubPresence }
}
