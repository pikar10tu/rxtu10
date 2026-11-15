// คอมเม้นรายฐานสอบจำลอง (CC2) — เพื่อนช่วยกันเติมทริก · รวมตามชื่อฐานทุกรอบ (user 15 พ.ย.: สอบอย่างเดียวกัน)
//   mockComments/{id}               { key, station, text, name, anon, likes:{uid:true}, createdAt }
//   mockComments/{id}/author/{uid}  {}   ← ใครเขียน (แอดมินอ่านได้คนเดียว) · ไม่ระบุชื่อ = name '' แต่แอดมินยังเห็น
// rules: คนในรุ่นอ่าน/เขียน · กดใจแตะได้แค่ likes.{ตัวเอง} · ลบได้เฉพาะเจ้าของ (มี author/{uid}) หรือแอดมิน
import { ref } from 'vue'
import { collection, getDocs, getDoc, doc, writeBatch, updateDoc, deleteField, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config.js'

export const COMMENT_MAX = 300
export const stationKey = name => String(name || '').toLowerCase().replace(/\s+/g, '')

const list = ref([])
const loaded = ref(false)
const mineIds = ref(new Set())   // คอมเม้นที่เราเขียน (จำในเครื่อง — ไว้โชว์ปุ่มลบ · rules เช็คจริงอีกชั้น)

const MINE_KEY = 'mockCommentsMine'
function readMine() { try { return new Set(JSON.parse(localStorage.getItem(MINE_KEY) || '[]')) } catch { return new Set() } }
function saveMine(s) { mineIds.value = new Set(s); try { localStorage.setItem(MINE_KEY, JSON.stringify([...s])) } catch { /* private mode */ } }

export async function loadMockComments() {
  mineIds.value = readMine()
  try {
    const snap = await getDocs(collection(db, 'mockComments'))
    list.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    loaded.value = true
  } catch (e) { console.error('[mock comments]', e) }
}

export function commentsFor(key) {
  return list.value.filter(c => c.key === key)
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
      || Object.keys(b.likes || {}).length - Object.keys(a.likes || {}).length
      || (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
}

export async function addMockComment({ uid, nickname, station, text, anon }) {
  const t = String(text || '').trim().slice(0, COMMENT_MAX)
  if (!uid || !t) return
  const ref1 = doc(collection(db, 'mockComments'))
  const data = { key: stationKey(station), station, text: t, name: anon ? '' : (nickname || ''), anon: !!anon, likes: {}, createdAt: serverTimestamp() }
  const b = writeBatch(db)
  b.set(ref1, data)
  b.set(doc(db, 'mockComments', ref1.id, 'author', uid), {})
  await b.commit()
  list.value = [...list.value, { id: ref1.id, ...data, createdAt: { seconds: Date.now() / 1000 } }]
  saveMine(new Set([...mineIds.value, ref1.id]))
}

export async function toggleMockLike(c, uid) {
  if (!uid) return
  const had = !!c.likes?.[uid]
  const likes = { ...(c.likes || {}) }
  if (had) delete likes[uid]; else likes[uid] = true
  c.likes = likes   // ขึ้นทันที
  try {
    await updateDoc(doc(db, 'mockComments', c.id), { [`likes.${uid}`]: had ? deleteField() : true })
  } catch (e) {
    console.error('[mock like]', e)
    const back = { ...likes }; if (had) back[uid] = true; else delete back[uid]; c.likes = back
  }
}

export async function deleteMockComment(c, uid) {
  const b = writeBatch(db)
  b.delete(doc(db, 'mockComments', c.id))
  if (uid) b.delete(doc(db, 'mockComments', c.id, 'author', uid))
  await b.commit()
  list.value = list.value.filter(x => x.id !== c.id)
  const s = new Set(mineIds.value); s.delete(c.id); saveMine(s)
}

// แอดมิน: ดูว่าใครเขียน (รวมคอมเม้นไม่ระบุชื่อ)
export async function whoWrote(id) {
  const snap = await getDocs(collection(db, 'mockComments', id, 'author'))
  const uid = snap.docs[0]?.id
  if (!uid) return '?'
  const u = await getDoc(doc(db, 'users', uid))
  return u.exists() ? (u.data().nickname || u.data().realName || uid) : uid
}

export function useMockComments() {
  return { list, loaded, mineIds }
}
