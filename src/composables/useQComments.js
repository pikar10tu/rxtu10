// 💬 ความเห็นเพื่อนต่อข้อสอบ (18 พ.ย. 2026) — แพทเทิร์นเดียวกับ useMockComments (คอมเม้นฐาน CC2)
//   qComments/{id}               { qid, text, name, anon, likes:{uid:true}, createdAt, pinned? }
//   qComments/{id}/author/{uid}  {}   ← ใครเขียน (แอดมินอ่านคนเดียว) · ไม่ระบุชื่อ = name '' แต่แอดมินยังเห็น
// โหลดพร้อมชุดข้อสอบ: where qid in [≤30] ต่อ query — จ่าย read ตามจำนวนคอมเม้นที่มีจริง (ชุดที่ไม่มีเลย = 1 read)
//   ได้ตัวเลขบนปุ่ม 💬 ฟรี ไม่ต้องมี doc นับแยก · ข้อที่โหลดแล้วไม่โหลดซ้ำในเซสชัน
// rules: คนในรุ่นอ่าน/เขียน · กดใจแตะได้แค่ likes.{ตัวเอง} · ลบได้เจ้าของ (มี author/{uid}) หรือแอดมิน · ปักหมุด = แอดมิน
import { ref } from 'vue'
import { collection, getDocs, getDoc, doc, query, where, writeBatch, updateDoc, deleteField, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { cleanText } from '../utils/text.js'

export const QCOMMENT_MAX = 300
const IN_LIMIT = 30   // เพดาน operator `in` ของ Firestore

const byQ = ref({})          // { [qid]: comment[] }
const loadedQ = new Set()    // qid ที่โหลดแล้ว (รวมข้อที่ไม่มีคอมเม้น)
const mineIds = ref(new Set())

const MINE_KEY = 'qCommentsMine'
function readMine() { try { return new Set(JSON.parse(localStorage.getItem(MINE_KEY) || '[]')) } catch { return new Set() } }
function saveMine(s) { mineIds.value = new Set(s); try { localStorage.setItem(MINE_KEY, JSON.stringify([...s])) } catch { /* private mode */ } }
mineIds.value = readMine()

const likeN = c => Object.keys(c.likes || {}).length
function sortList(arr) {
  return [...arr].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
    || likeN(b) - likeN(a)
    || (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
}
function setQ(qid, arr) { byQ.value = { ...byQ.value, [qid]: sortList(arr) } }

// โหลดคอมเม้นของข้อชุดนี้ (ข้ามข้อที่โหลดแล้ว) · non-fatal — พลาดก็แค่ไม่มีตัวเลข
export async function loadQComments(qids) {
  const todo = [...new Set((qids || []).filter(id => id && !loadedQ.has(id)))]
  for (let i = 0; i < todo.length; i += IN_LIMIT) {
    const chunk = todo.slice(i, i + IN_LIMIT)
    try {
      const snap = await getDocs(query(collection(db, 'qComments'), where('qid', 'in', chunk)))
      const grouped = Object.fromEntries(chunk.map(id => [id, []]))
      for (const d of snap.docs) { const c = { id: d.id, ...d.data() }; (grouped[c.qid] ||= []).push(c) }
      const next = { ...byQ.value }
      for (const [id, arr] of Object.entries(grouped)) { next[id] = sortList(arr); loadedQ.add(id) }
      byQ.value = next
    } catch (e) { console.error('[qComments load]', e) }
  }
}

export function qCommentsFor(qid) { return byQ.value[qid] || [] }
export function qCommentCount(qid) { return (byQ.value[qid] || []).length }

export async function addQComment({ uid, nickname, qid, text, anon }) {
  const t = cleanText(text, QCOMMENT_MAX).trim()
  if (!uid || !qid || !t) return
  const r = doc(collection(db, 'qComments'))
  const data = { qid, text: t, name: anon ? '' : (nickname || ''), anon: !!anon, likes: {}, createdAt: serverTimestamp() }
  const b = writeBatch(db)
  b.set(r, data)
  b.set(doc(db, 'qComments', r.id, 'author', uid), {})
  await b.commit()
  setQ(qid, [...qCommentsFor(qid), { id: r.id, ...data, createdAt: { seconds: Date.now() / 1000 } }])
  saveMine(new Set([...mineIds.value, r.id]))
}

export async function toggleQLike(c, uid) {
  if (!uid) return
  const had = !!c.likes?.[uid]
  const apply = on => {
    const likes = { ...(c.likes || {}) }
    if (on) likes[uid] = true; else delete likes[uid]
    setQ(c.qid, qCommentsFor(c.qid).map(x => (x.id === c.id ? { ...x, likes } : x)))
  }
  apply(!had)   // ขึ้นทันที
  try {
    await updateDoc(doc(db, 'qComments', c.id), { [`likes.${uid}`]: had ? deleteField() : true })
  } catch (e) { console.error('[qComments like]', e); apply(had) }
}

export async function deleteQComment(c, uid) {
  const b = writeBatch(db)
  b.delete(doc(db, 'qComments', c.id))
  if (uid) b.delete(doc(db, 'qComments', c.id, 'author', uid))
  await b.commit()
  setQ(c.qid, qCommentsFor(c.qid).filter(x => x.id !== c.id))
  const s = new Set(mineIds.value); s.delete(c.id); saveMine(s)
}

// แอดมิน: ปักหมุด/เลิกปัก
export async function toggleQPin(c) {
  const on = !c.pinned
  await updateDoc(doc(db, 'qComments', c.id), { pinned: on ? true : deleteField() })
  setQ(c.qid, qCommentsFor(c.qid).map(x => (x.id === c.id ? { ...x, pinned: on } : x)))
}

// แอดมิน: ดูว่าใครเขียน (รวมไม่ระบุชื่อ)
export async function whoWroteQ(id) {
  const snap = await getDocs(collection(db, 'qComments', id, 'author'))
  const uid = snap.docs[0]?.id
  if (!uid) return '?'
  const u = await getDoc(doc(db, 'users', uid))
  return u.exists() ? (u.data().nickname || u.data().realName || uid) : uid
}

export function useQComments() { return { byQ, mineIds } }
