import { ref } from 'vue'
import { doc, getDoc, setDoc, increment } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useUsageStore } from '../stores/usage.js'

/**
 * กดใจข่าวในกระดาน — กดได้ไม่จำกัด ไม่จำว่าใครกด (user ขอ 29 ก.ย. 2026)
 *
 * ทั้งกระดานอยู่ใน doc เดียว `likes/board`:
 *   items.<itemKey> = ยอดใจของข่าวนั้น
 *   recv.<uid>      = ใจสะสมที่คนนี้ "ได้รับ" รวมที่กดให้ตัวเองด้วย (achievement like_* · user สั่ง 29 ก.ย. นับได้)
 *   self.<uid>      = ใจที่คนนี้กดให้ข่าวตัวเอง (achievement ลับ selflove)
 *
 * 🔑 กดรัวแค่ไหนก็ 1 write: ยอดขึ้นจอทันที (pending) แล้วรวบส่งครั้งเดียวตอนหยุดกด FLUSH_MS / ซ่อนแท็บ
 *    อ่าน 1 read ต่อการเปิดกระดาน (getDoc ไม่ฟังสด — ฟังสดจะทำให้ทุกการกดของทุกคนเป็น read ของทุกจอ)
 * ⚠️ write หนึ่งครั้งแตะได้แค่ 1 ข่าว — rules เช็คได้ทีละคีย์ · กดข่าวอื่นระหว่างรอ = ส่งของเดิมก่อน
 * ⚠️ PER_FLUSH_MAX ต้องตรงกับ firestore.rules
 */
export const FLUSH_MS = 2500
export const PER_FLUSH_MAX = 500

const board = ref({ items: {}, recv: {}, self: {} })
const pending = ref(null)   // { key, owner, n }
let loaded = false
let timer = null
let listening = false

const ref_ = () => doc(db, 'likes', 'board')

/** คีย์ของข่าว — ห้ามใช้ id จาก buildFeed ตรงๆ (มี index ที่ขยับทุกครั้งที่มีข่าวใหม่) */
export function likeKeyOf(item) {
  const id = String(item?.id || '')
  if (id.startsWith('news:')) return `n_${id.slice(5)}`
  return item?.uid && item?.t ? `${item.uid}_${item.t}` : null
}

async function flush() {
  if (timer) { clearTimeout(timer); timer = null }
  const p = pending.value
  if (!p || !p.n) return
  pending.value = null
  const me = useAuthStore().currentUser?.uid
  const data = { items: { [p.key]: increment(p.n) } }
  if (p.owner) data.recv = { [p.owner]: increment(p.n) }
  if (p.owner && p.owner === me) data.self = { [me]: increment(p.n) }
  // ยอดบนจอบวกไว้ถาวรเลย (ไม่รอ server) — ส่งพังก็แค่ยอดจริงน้อยกว่าที่เห็นในเซสชันนี้
  const b = board.value
  b.items[p.key] = (b.items[p.key] || 0) + p.n
  if (data.self) b.self[me] = (b.self[me] || 0) + p.n
  if (data.recv) b.recv[p.owner] = (b.recv[p.owner] || 0) + p.n
  try {
    await setDoc(ref_(), data, { merge: true })
    useUsageStore().track(0, 1)
  } catch (e) { console.warn('[likes flush]', e?.code || e) }
}

function listen() {
  if (listening) return
  listening = true
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush() })
  window.addEventListener('pagehide', flush)
}

export function useNewsLikes() {
  async function load() {
    listen()
    if (loaded) return
    loaded = true
    try {
      const snap = await getDoc(ref_())
      useUsageStore().track(1)
      const d = snap.data() || {}
      board.value = { items: d.items || {}, recv: d.recv || {}, self: d.self || {} }
    } catch (e) { loaded = false; console.warn('[likes load]', e?.code || e) }
  }

  /** ยอดบนจอ = ของที่ส่งแล้ว + ที่ยังรอส่ง */
  function countOf(key) {
    const p = pending.value
    return (board.value.items[key] || 0) + (p && p.key === key ? p.n : 0)
  }

  function like(item) {
    const key = likeKeyOf(item)
    if (!key) return
    if (pending.value && pending.value.key !== key) flush()
    const p = pending.value || { key, owner: item.uid || null, n: 0 }
    p.n++
    pending.value = { ...p }
    if (p.n >= PER_FLUSH_MAX) { flush(); return }
    if (timer) clearTimeout(timer)
    timer = setTimeout(flush, FLUSH_MS)
  }

  /** ยอดของฉัน (รวมที่รอส่ง) — ให้ achievement เช็คได้ทันทีโดยไม่ต้อง read เพิ่ม */
  function myTotals(uid) {
    const p = pending.value
    const pn = p && p.owner === uid ? p.n : 0
    return {
      self: (board.value.self[uid] || 0) + pn,
      recv: (board.value.recv[uid] || 0) + pn,
    }
  }

  return { board, load, like, countOf, myTotals, flush }
}
