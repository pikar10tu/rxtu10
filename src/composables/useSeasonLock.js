// src/composables/useSeasonLock.js — สถานะล็อกซีซั่นแบบสด (utils/seasonLock.js)
// ฟัง config/seasonPayouts ตัวเดียวทั้งแอป (แชร์ listener) · แอดมินกดแจกเสร็จ = ทุกเครื่องปลดล็อกเอง ไม่ต้องรีเฟรช
import { ref, computed } from 'vue'
import { doc, onSnapshot, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { seasonLockState } from '../utils/seasonLock.js'

const payouts = ref(undefined)
const now = ref(Date.now())
let users = 0, unsub = null, timer = null

function attach() {
  if (users++ > 0) return
  unsub = onSnapshot(doc(db, 'config', 'seasonPayouts'),
    (s) => { payouts.value = s.exists() ? s.data() : null },
    (e) => { console.error('[seasonLock]', e) })
  timer = setInterval(() => { now.value = Date.now() }, 1000)   // ตรงกับนาฬิกาของ SeasonCountdown (เดิม 5 วิ = ล็อกช้ากว่าเลขถึง 0)
}
function detach() {
  if (--users > 0) return
  unsub?.(); unsub = null; clearInterval(timer); timer = null
}

/** ใช้ใน setup() — ต้องเรียก release() ตอน onUnmounted */
export function useSeasonLock() {
  attach()
  const state = computed(() => seasonLockState(now.value, payouts.value))
  return { state, release: detach }
}

/** เช็คสดตอนกดสู้ (อ่าน config ตรง 1 ครั้ง) — คืน state */
export async function checkSeasonLockNow() {
  let p = null
  try { const s = await getDoc(doc(db, 'config', 'seasonPayouts')); p = s.exists() ? s.data() : null }
  // อ่านไม่ได้ (เน็ตช้า) = ใช้ค่าจาก listener · ยังไม่มีค่าเลย (undefined) = ไม่ล็อกช่วงรอแจก (ช่วง 23:45 ยังล็อกตามนาฬิกา)
  // เดิม fallback เป็น null = ทุกไฟต์หลังขึ้นเดือนถูกบล็อกผิดๆ ตอนเน็ตแย่ (รีวิว 28 ต.ค.)
  catch (e) { console.error('[seasonLock check]', e); p = payouts.value }
  return seasonLockState(Date.now(), p)
}
