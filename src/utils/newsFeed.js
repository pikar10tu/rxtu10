/**
 * ฟีดกระดานข่าว — ตรรกะล้วน ไม่แตะ Firestore/Vue
 *
 * สองเลน: (1) `ev` ในแถว roster ของเจ้าตัว = ข่าวไหลเร็ว เกาะไปกับ write ที่เกิดอยู่แล้ว
 *          (2) collection `news` = ข่าว "ครั้งแรก/ที่หนึ่งของรุ่น" ที่ควรอยู่ยาว
 *
 * เก็บแค่รหัส+ตัวเลข ไม่เก็บข้อความไทย ⇒ แก้สำนวนทีหลังได้โดยไม่ต้องย้อนแก้ข้อมูล
 * ชื่อคนก็ไม่เก็บ — ดึงจาก rows[uid].n ตอนอ่าน ⇒ เปลี่ยนชื่อเล่นแล้วข่าวเก่าเปลี่ยนตาม
 *
 * spec: docs/superpowers/specs/2026-08-28-news-board-live-design.md
 * เทส: node --test src/utils/newsFeed.test.js
 */
import { MINIGAMES } from '../data/minigames.js'
import { TA_MODES } from './timeAttack.js'
import { RESIDENCE_TIERS } from '../data/residence.js'
import { getAchievement } from '../data/achievements.js'
import { achievementTitle } from './achievements.js'
import { PETS } from '../data/index.js'

/** เก็บกี่ข่าวต่อคน — ⚠️ เพิ่มแล้วต้องคำนวณขนาด doc ใหม่ (10×~35B×105คน ≈ 37KB จากลิมิต 1MB)
 *  roster โหลดทุกเซสชันอยู่แล้ว ⇒ อ่านเพิ่ม 0 · 3→10 (25 ก.ย. 2026 user ขอ ข่าวแสดงไม่ครบ)
 *  กระดานไม่ตัดจำนวนแล้ว — กันรกด้วยการรวมกลุ่มต่อคน (groupFeed) แทนเพดาน */
export const EVENT_MAX = 10
/** ข่าวเลน roster เก่ากว่านี้ = ไม่โชว์ (ev ไม่มีวันหมดอายุเอง คนเลิกเล่นจะค้างหัวกระดานถาวร) */
export const EVENT_TTL_MS = 7 * 24 * 60 * 60 * 1000

const gameName = (key) => MINIGAMES.find(g => g.key === key)?.name || 'มินิเกม'
const taLabel  = (key) => TA_MODES.find(m => m.key === key)?.label || 'Time Attack'
const GRADE_ROMAN = ['', 'I', 'II', 'III', 'IV', 'V']

/** ชื่อขั้นบ้านจากเลเวล — ห้ามใช้ getTier() ที่นี่เพราะมัน clamp (เลเวล 0 จะกลายเป็นขั้น 1) */
const tierName = (level) => RESIDENCE_TIERS[Number(level) - 1]?.tierName || ''
/** ข่าวย้ายบ้าน: บอกชื่อขั้นเก่า→ใหม่ · ขั้นเก่าไม่มี (เลเวล 1 = คนใหม่) ก็เป็นข่าวต้อนรับแทน */
function houseText(who, e) {
  const to = tierName(e.v)
  if (!to) return `${who} อัปเกรดบ้านเป็นเลเวล ${e.v}`   // เลเวลใหม่เกินทะเบียน — กันข่าวหาย
  const from = tierName(Number(e.v) - 1)
  return from
    ? `${who} ได้ย้ายจาก ${from} ไปอยู่ ${to} ยินดีด้วย`
    : `${who} ได้เข้าสู่ระบบ ยินดีต้อนรับ`
}

/** ปลดความสำเร็จซ้อนกันภายในช่วงนี้ = รวมเป็นบรรทัดเดียว (ไม่ยึดกระดาน · กิน ev แค่ช่องเดียว) */
export const ACH_MERGE_MS = 30 * 60 * 1000
/** เก็บชื่อความสำเร็จในข่าวรวมได้กี่อัน — เกินนี้นับจำนวนอย่างเดียว (`n`) คุมขนาดแถว roster */
export const ACH_KEEP = 4

/** docId ของ achievement ('id' หรือ 'id__date') → ชื่อบนจอ · ไม่รู้จัก (เวอร์ชันใหม่กว่า) = null */
function achLabel(docId) {
  const [id, date] = String(docId).split('__')
  const def = getAchievement(id)
  return def ? achievementTitle(def, date || null) : null
}
function achText(who, e) {
  const ids = Array.isArray(e.v) ? e.v : [e.v]
  const names = ids.map(achLabel).filter(Boolean)
  const n = Math.max(Number(e.n) || 0, ids.length)
  if (!names.length) return `${who} ปลดล็อกความสำเร็จใหม่`
  if (n === 1) return `${who} ปลดล็อก "${names[0]}"`
  const shown = names.slice(0, 2).map(x => `"${x}"`).join(' ')
  return n > 2 ? `${who} ปลดล็อก ${n} ความสำเร็จ ${shown} และอีก ${n - 2}` : `${who} ปลดล็อก ${shown}`
}
/** ข่าวได้เพ็ทตำนานจากกาชา — v = [petId ล่าสุดก่อน] · n = จำนวนรวมในกลุ่ม (รวมแบบเดียวกับความสำเร็จ) */
const petName = (id) => PETS.find(p => p.id === id)?.name || null
function legText(who, e) {
  const names = [].concat(e.v || []).map(petName).filter(Boolean)
  const n = Math.max(Number(e.n) || 0, [].concat(e.v || []).length)
  if (!names.length) return `${who} เปิดแคปซูลได้เพ็ทระดับตำนาน`
  if (n === 1) return `${who} เปิดแคปซูลได้ ${names[0]}`
  const shown = names.slice(0, 2).join(' ')
  return n > 2 ? `${who} เปิดแคปซูลได้ตำนาน ${n} ตัว ${shown} และอีก ${n - 2}` : `${who} เปิดแคปซูลได้ ${shown}`
}
const achIcon = (e) => getAchievement(String([].concat(e.v)[0]).split('__')[0])?.icon || '🏅'

/**
 * ทะเบียนชนิดข่าว — เพิ่มชนิดใหม่ที่นี่ที่เดียว
 * text(who, e) : who = ชื่อที่ขึ้นต้นประโยค ('คุณ' ถ้าเป็นตัวเอง) · e = { k, v, g?, t }
 * สำนวนตาม docs/voice-guide.md — เรียบๆ ไม่หวือหวา
 */
const KINDS = {
  tw: { icon: '🏰', text: (who, e) => `${who} ไต่หอคอยถึงชั้น ${e.v}` },
  pg: { icon: '🐾', text: (who, e) => `${who} อัปเกรดเพ็ทถึงเกรด ${GRADE_ROMAN[e.v] || e.v}` },
  qz: { icon: '📚', text: (who, e) => `${who} ตอบควิซถูกรวด ${e.v} ข้อ` },
  mg: { icon: '🎮', text: (who, e) => `${who} ทำคะแนน ${gameName(e.g)} ขึ้นอันดับ ${e.v} ของรุ่น` },
  ta: { icon: '⏱️', text: (who, e) => `${who} ทำสถิติ Time Attack ${taLabel(e.g)} ขึ้นอันดับ ${e.v} ของรุ่น` },
  hs: { icon: '🏠', text: houseText },
  fo: { icon: '🌾', text: (who, e) => `${who} ส่งออเดอร์ฟาร์มชิ้นใหญ่ ได้ ${(Number(e.v) || 0).toLocaleString()} เหรียญ` },
  pv: { icon: '⚔️', text: (who, e) => `${who} ขึ้นอันดับ ${e.v} ของสนามประลอง` },
  // ความสำเร็จ (ย้ายจากเลน news 25 ก.ย. 2026) — v = [docId ล่าสุดก่อน] · n = จำนวนรวมในกลุ่ม
  ac: { icon: achIcon, text: achText },
  // กาชาได้ตำนาน (ย้ายจากเลน news 1 ต.ค. 2026 — เลนนั้นโหลดแค่ 5 doc เปิดรัวคืนเดียวดันข่าวคนอื่นตกหมด)
  lg: { icon: '✨', text: legText },
}

/** ต่อข่าวใหม่ไว้หน้าสุด แล้วตัดท้ายให้เหลือ EVENT_MAX — คู่แฝดของ pushHistory */
export function pushEvent(list, ev) {
  const prev = Array.isArray(list) ? list : []
  if (!ev || !ev.k || !KINDS[ev.k]) return prev      // ข่าวเสีย = ไม่แตะของเดิม
  return [ev, ...prev].slice(0, EVENT_MAX)
}

/**
 * ข่าวปลดความสำเร็จ — ถ้าข่าวบนสุดเป็นความสำเร็จที่เพิ่งเกิดภายใน ACH_MERGE_MS ให้รวมเข้ากลุ่มเดิม
 * ⇒ ปลด 5 อันรวดขึ้นกระดานบรรทัดเดียว "ปลดล็อก 5 ความสำเร็จ …" และไม่ดันข่าวหอคอย/สนามของคนนั้นตกช่อง
 * @param docIds docId ที่เพิ่งปลด (ใหม่สุดก่อน) — string เดียวก็ได้
 */
export function pushAchievementEvent(list, docIds, now = Date.now()) {
  return pushMergedEvent(list, 'ac', docIds, now)
}

/** ข่าวได้เพ็ทตำนาน — รวมกลุ่มแบบเดียวกับความสำเร็จ (เปิดรัวได้ 9 ตัว = บรรทัดเดียว ไม่ดันข่าวอื่นของคนนั้นตก) */
export function pushLegendaryEvent(list, petIds, now = Date.now()) {
  return pushMergedEvent(list, 'lg', petIds, now)
}

function pushMergedEvent(list, k, rawIds, now) {
  const prev = Array.isArray(list) ? list : []
  const ids = [].concat(rawIds || []).filter(Boolean).map(String)
  if (!ids.length) return prev
  const head = prev[0]
  if (head?.k === k && now - (Number(head.t) || 0) < ACH_MERGE_MS) {
    const old = [].concat(head.v || [])
    const merged = { k, v: [...ids, ...old].slice(0, ACH_KEEP),
      n: Math.max(Number(head.n) || 0, old.length) + ids.length, t: now }
    return [merged, ...prev.slice(1)]
  }
  return pushEvent(prev, { k, v: ids.slice(0, ACH_KEEP), n: ids.length, t: now })
}

/**
 * อันดับของ "คะแนนนี้" ในรุ่น (1-based) — นับเฉพาะคนอื่นที่ทำได้สูงกว่า
 * ใช้คะแนนที่เพิ่งทำได้เป็นตัวตั้ง ไม่ใช่ค่าในแถวตัวเอง เพราะแถวตัวเองยังไม่ถูกเขียน ณ จุดที่เรียก
 */
export function rankOfScore(rows, myUid, pick, score) {
  const mine = Number(score) || 0
  let better = 0
  for (const [uid, row] of Object.entries(rows || {})) {
    if (uid === myUid) continue
    if ((Number(pick(row)) || 0) > mine) better++
  }
  return better + 1
}

const tsToMs = (ts) => {
  if (!ts) return 0
  if (typeof ts?.toDate === 'function') return ts.toDate().getTime()
  if (ts instanceof Date) return ts.getTime()
  return Number(ts) || 0
}

/**
 * รวมสองเลนเป็นฟีดเดียว
 * @param rows      members.rosterRows ({ [uid]: row })
 *                  ⚠️ ต้องเป็น rosterRows ไม่ใช่ rosterUsers — rosterUsers คีย์ด้วย studentId จึงตก guest ทั้งหมด
 * @param newsDocs  doc จาก collection news ([{ id, msg, icon, uid, ts }])
 */
export function buildFeed(rows, newsDocs, { now = Date.now(), myUid = null } = {}) {
  const items = []

  for (const [uid, row] of Object.entries(rows || {})) {
    const evs = Array.isArray(row?.ev) ? row.ev : []
    for (let i = 0; i < evs.length; i++) {
      const e = evs[i]
      const def = KINDS[e?.k]
      if (!def) continue                                   // ชนิดจากเวอร์ชันใหม่กว่า = ข้ามเงียบ ห้าม throw
      const t = Number(e.t) || 0
      if (!t || now - t > EVENT_TTL_MS) continue
      const who = uid === myUid ? 'คุณ' : (row?.n || '?')
      const icon = typeof def.icon === 'function' ? def.icon(e) : def.icon
      items.push({ id: `${uid}:${i}:${t}`, uid, icon, text: def.text(who, e), t })
    }
  }

  // เลน news ไม่ตัดอายุ — ตั้งใจให้อยู่ยาว และทำให้กระดานไม่มีทางว่างแม้ไม่มีใครเล่นมาหลายวัน
  for (const d of newsDocs || []) {
    if (!d?.msg) continue
    items.push({ id: `news:${d.id}`, uid: d.uid || null, icon: d.icon || '📢', text: d.msg, t: tsToMs(d.ts) })
  }

  items.sort((a, b) => b.t - a.t)
  return items
}

/**
 * รวมข่าวของคนเดียวกันที่ "ติดกันถี่ๆ" เป็นกลุ่ม — หัวกลุ่ม = ข่าวล่าสุดของช่วงนั้น · กลุ่มเรียงตามเวลาหัวกลุ่ม ใหม่→เก่า
 * user สั่ง 28 ก.ย. 2026: เดิมรวมทุกข่าวของคนเดียวเป็นก้อนเดียว → กระดานดูไม่เป็นปัจจุบัน
 *   ตอนนี้ข่าวถัดไปจะต่อเข้ากลุ่มเดิมได้ก็ต่อเมื่อห่างจากข่าวที่เก่าสุดในกลุ่มไม่เกิน GROUP_GAP_MS (ต่อเป็นโซ่)
 *   ห่างเกินนั้น = ขึ้นบรรทัดใหม่ของคนเดิม
 * ข่าวเลน news ที่ไม่มีเจ้าของ (uid null) เป็นกลุ่มเดี่ยว · ข่าวเลน news ที่มี uid รวมเข้ากลุ่มคนนั้น (ตั้งใจ)
 * @param items ผลของ buildFeed (เรียงใหม่→เก่าแล้ว)
 * @returns [{ key, head, rest: [] }]
 */
export const GROUP_GAP_MS = 60 * 60 * 1000
export function groupFeed(items) {
  const out = []
  const open = new Map()   // uid → กลุ่มล่าสุดของคนนั้น (ที่ยังต่อได้)
  for (const it of items || []) {
    const g = it.uid ? open.get(it.uid) : null
    const tail = g ? (g.rest.length ? g.rest[g.rest.length - 1] : g.head) : null
    if (g && tail.t - it.t <= GROUP_GAP_MS) { g.rest.push(it); continue }
    const ng = { key: it.id, head: it, rest: [] }
    if (it.uid) open.set(it.uid, ng)
    out.push(ng)
  }
  return out
}

/** "12 นาทีที่แล้ว" — ข่าวไหลเร็ว คนอ่านต้องรู้ว่าสดแค่ไหน ไม่ใช่วันที่เต็ม */
export function timeAgo(t, now = Date.now()) {
  const s = Math.max(0, Math.floor((now - (Number(t) || 0)) / 1000))
  if (s < 60) return 'เมื่อกี้'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} นาทีที่แล้ว`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`
  return `${Math.floor(h / 24)} วันที่แล้ว`
}
