import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useUsageStore } from '../stores/usage.js'
import { DEFAULT_GLOBAL_STATS } from '../utils/globalStats.js'

// เพิ่มตัวนับ fun-fact รวมทั้งเว็บ — fire-and-forget เสมอ ห้าม await จากฝั่งเรียก
// ผิดพลาดได้ (offline/permission) ไม่กระทบเกม เลขคลาดเคลื่อนไป 1 ยอมรับได้
// ดีกว่าทำ action จริง (ส่งข้อสอบ/จบไฟต์ PvP/พลิกการ์ด) พังเพื่อฟีเจอร์นี้
export function bumpGlobalStat(field, amount = 1) {
  updateDoc(doc(db, 'stats', 'global'), { [field]: increment(amount) })
    .then(() => useUsageStore().track(0, 1))
    .catch(err => console.warn('[globalStats] bump failed', field, err))
}

// อ่านค่าปัจจุบันครั้งเดียว (ไม่ onSnapshot) — ใช้ทั้ง widget/หน้าเต็ม/หน้า login
// ไม่ throw ออกไปข้างนอกเลย — ผู้เรียกไม่ต้อง try/catch
export async function fetchGlobalStats() {
  try {
    const snap = await getDoc(doc(db, 'stats', 'global'))
    useUsageStore().track(1)
    return snap.exists() ? { ...DEFAULT_GLOBAL_STATS, ...snap.data() } : { ...DEFAULT_GLOBAL_STATS }
  } catch (e) {
    console.warn('[globalStats] fetch failed', e)
    return { ...DEFAULT_GLOBAL_STATS }
  }
}
