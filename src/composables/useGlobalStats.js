import { doc, getDoc, setDoc, increment } from 'firebase/firestore'
import { db, auth } from '../firebase/config.js'
import { useUsageStore } from '../stores/usage.js'
import { DEFAULT_GLOBAL_STATS } from '../utils/globalStats.js'

// เพิ่มตัวนับ fun-fact รวมทั้งเว็บ — fire-and-forget เสมอ ห้าม await จากฝั่งเรียก
// ผิดพลาดได้ (offline/permission) ไม่กระทบเกม เลขคลาดเคลื่อนไป 1 ยอมรับได้
// ดีกว่าทำ action จริง (ส่งข้อสอบ/จบไฟต์ PvP/พลิกการ์ด) พังเพื่อฟีเจอร์นี้
// setDoc(merge:true) แทน updateDoc — doc ยังไม่มีจนกว่าแอดมินจะกดปุ่ม backfill ครั้งแรก
// updateDoc จะ fail แบบเงียบๆ (not-found) และข้อมูลหายถาวรถ้าใช้ updateDoc ตรงนี้
export function bumpGlobalStat(field, amount = 1) {
  setDoc(doc(db, 'stats', 'global'), { [field]: increment(amount) }, { merge: true })
    .then(() => useUsageStore().track(0, 1))
    .catch(err => console.warn('[globalStats] bump failed', field, err))
}

// อ่านค่าปัจจุบันครั้งเดียว (ไม่ onSnapshot) — ใช้ทั้ง widget/หน้าเต็ม/หน้า login
// ไม่ throw ออกไปข้างนอกเลย — ผู้เรียกไม่ต้อง try/catch
export async function fetchGlobalStats() {
  try {
    const snap = await getDoc(doc(db, 'stats', 'global'))
    // ข้ามนับ usage ตอนยังไม่ล็อกอิน (หน้า login) — ตัวนับนี้เขียนกลับ Firestore เองด้วย
    // rule ที่ต้อง auth ⇒ ไม่ล็อกอินแล้วนับจะจบด้วย permission error ตอน flush (ดูจุดพัง 4)
    if (auth.currentUser) useUsageStore().track(1)
    return snap.exists() ? { ...DEFAULT_GLOBAL_STATS, ...snap.data() } : { ...DEFAULT_GLOBAL_STATS }
  } catch (e) {
    console.warn('[globalStats] fetch failed', e)
    return { ...DEFAULT_GLOBAL_STATS }
  }
}

// 📚 ข้อสอบที่ทั้งรุ่นทำ "วันนี้" (เวลาไทย) — stats/global.quizByDay[YYYY-MM-DD] (user ขอ 17 ต.ค. 2026)
// เพิ่มแล้วอ่านกลับ 1 read เพื่อรู้ว่าเราเป็นคนข้ามหลักร้อยไหม · ชนกันพร้อมกันอาจคลาด/ซ้ำได้นิดหน่อย ยอมรับได้
export const bkkDay = (t = Date.now()) => new Date(t + 7 * 3600e3).toISOString().slice(0, 10)
export async function bumpQuizToday(n) {
  if (!(n > 0)) return null
  try {
    const day = bkkDay()
    const ref = doc(db, 'stats', 'global')
    await setDoc(ref, { quizByDay: { [day]: increment(n) } }, { merge: true })
    const snap = await getDoc(ref)
    useUsageStore().track(1, 1)
    const after = Number(snap.data()?.quizByDay?.[day]) || 0
    return { before: Math.max(0, after - n), after }
  } catch (e) { console.warn('[globalStats] quizByDay failed', e); return null }
}
