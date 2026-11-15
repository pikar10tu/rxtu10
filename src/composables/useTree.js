// 🌳 ต้นไม้รุ่น 10 — ข้อความให้กำลังใจไม่ระบุชื่อของทั้งรุ่น (15 พ.ย. 2026)
//   tree/pool            { items:{ [id]:{ t, k:'w'|'a', e:อีโมจิ, at } }, thanks:{ [uid]:{ [id]:true } }, flags:{ [uid]:{ [id]:true } } }
//                        ก้อนเดียวทั้งรุ่น → เปิดหน้า = 1 read · สุ่ม/เขย่าฝั่ง client ไม่อ่านเพิ่ม
//   treeAuthors/{uid}    { last:id, ids:{ [id]:true } }   ← ใครเขียนอะไร (เจ้าของ+แอดมินอ่าน) → ใน pool ไม่มีชื่อ/uid คนเขียน
// rules: เพิ่มข้อความได้ทีละ 1 คีย์ และคีย์ต้องตรง treeAuthors/{uid}.last ที่เขียนคู่กันใน batch เดียว
//        ขอบคุณ/แจ้งลบ แตะได้แค่ thanks.{uid ตัวเอง} / flags.{uid ตัวเอง} · ลบข้อความ = แอดมิน
import { ref, computed } from 'vue'
import { doc, getDoc, getDocs, setDoc, updateDoc, writeBatch, deleteField, serverTimestamp, collection, query, where } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { cleanText } from '../utils/text.js'
import { TREE_MAX, randomTreeIcon } from '../data/tree.js'

const POOL = () => doc(db, 'tree', 'pool')

const items = ref({})      // id → { t, k, e }
const thanks = ref({})     // uid → { id:true }
const flags = ref({})
const mine = ref({})       // id:true ที่เราเขียน
const state = ref('idle')  // idle | loading | ready | missing | error

const newId = () => Array.from(crypto.getRandomValues(new Uint8Array(9)), b => b.toString(36).padStart(2, '0')).join('').slice(0, 14)

export async function loadTree(uid, { isAdmin = false } = {}) {
  if (state.value === 'loading') return
  state.value = 'loading'
  try {
    const [snap, me] = await Promise.all([getDoc(POOL()), uid ? getDoc(doc(db, 'treeAuthors', uid)) : null])
    mine.value = me?.exists() ? (me.data().ids || {}) : {}
    if (!snap.exists()) {
      // ยังไม่มีกองกลาง — แอดมินเปิดหน้าครั้งแรก = สร้างให้ (คนอื่นสร้างไม่ได้ตาม rules)
      if (!isAdmin) { state.value = 'missing'; return }
      await setDoc(POOL(), { items: {}, thanks: {}, flags: {} })
      items.value = {}; thanks.value = {}; flags.value = {}
    } else {
      const d = snap.data()
      items.value = d.items || {}; thanks.value = d.thanks || {}; flags.value = d.flags || {}
    }
    state.value = 'ready'
  } catch (e) { console.error('[tree load]', e); state.value = 'error' }
}

/** เขียนข้อความลงดิน → คืน note ที่เพิ่ม (หรือ null ถ้าไม่ผ่าน) */
export async function plantNote(uid, kind, text) {
  const t = cleanText(text, TREE_MAX).replace(/\s+/g, ' ')
  if (!uid || !t) return null
  const id = newId()
  const k = kind === 'a' ? 'a' : 'w'
  const e = randomTreeIcon(k)
  const b = writeBatch(db)
  b.set(doc(db, 'treeAuthors', uid), { last: id, ids: { [id]: true } }, { merge: true })
  b.update(POOL(), { [`items.${id}`]: { t, k, e, at: serverTimestamp() } })
  await b.commit()
  items.value = { ...items.value, [id]: { t, k, e } }
  mine.value = { ...mine.value, [id]: true }
  return { id, t, k, e }
}

async function toggleIn(field, store, uid, id) {
  if (!uid || !id) return
  const had = !!store.value[uid]?.[id]
  const next = { ...(store.value[uid] || {}) }
  if (had) delete next[id]; else next[id] = true
  const prev = store.value
  store.value = { ...prev, [uid]: next }   // ขึ้นทันที
  try { await updateDoc(POOL(), { [`${field}.${uid}.${id}`]: had ? deleteField() : true }) }
  catch (e) { console.error(`[tree ${field}]`, e); store.value = prev; throw e }
}
export const toggleThanks = (uid, id) => toggleIn('thanks', thanks, uid, id)
export const toggleFlag = (uid, id) => toggleIn('flags', flags, uid, id)

// ── แอดมิน ──
export async function removeNote(id) {
  await updateDoc(POOL(), { [`items.${id}`]: deleteField() })
  const next = { ...items.value }; delete next[id]; items.value = next
}
export async function whoPlanted(id) {
  const snap = await getDocs(query(collection(db, 'treeAuthors'), where(`ids.${id}`, '==', true)))
  const uid = snap.docs[0]?.id
  if (!uid) return '?'
  const u = await getDoc(doc(db, 'users', uid))
  return u.exists() ? (u.data().nickname || u.data().realName || uid) : uid
}

export function useTree() {
  const notes = computed(() => Object.entries(items.value).map(([id, n]) => ({ id, ...n })))
  const countOf = (store, id) => Object.values(store.value).reduce((n, m) => n + (m?.[id] ? 1 : 0), 0)
  const thanksCount = id => countOf(thanks, id)
  const flagCount = id => countOf(flags, id)
  // ข้อความที่มีคนแจ้งลบ (แอดมินใช้) เรียงคนแจ้งมากก่อน
  const flagged = computed(() => notes.value.map(n => ({ ...n, flags: flagCount(n.id) })).filter(n => n.flags).sort((a, b) => b.flags - a.flags))
  // 🤍 ที่คำของเราได้รับรวมกัน
  const myThanks = computed(() => Object.keys(mine.value).reduce((n, id) => n + (items.value[id] ? thanksCount(id) : 0), 0))
  return { notes, thanks, flags, mine, state, thanksCount, flagCount, flagged, myThanks }
}
