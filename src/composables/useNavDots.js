import { ref, computed, onScopeDispose } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useDaily } from './useDaily.js'
import { useFarm } from './useFarm.js'
import { useMailbox } from '../stores/mailbox.js'
import { useAppConfig } from './useAppConfig.js'
import { canClaimDaily } from '../utils/pvpDaily.js'

/** รายได้สะสมเกินกี่ % ของหลอด ถึงขึ้นจุดแดง (user สั่ง 25 ก.ย. 2026: เกินครึ่ง) */
export const DAILY_DOT_PCT = 50

/**
 * จุดแดงนำทาง — บอกว่ามีของรอเก็บ โดยไม่ต้องเข้าไปเช็คเอง
 *   homeDot : รายได้ประจำวันเกิน 50% → แท็บ Home + ปุ่มเก็บใน DailyCard
 *   playDot : มีพืชพร้อมเก็บ          → แท็บ Play + การ์ดโหมดฟาร์ม
 * อ่านจาก user doc ที่อยู่ในมือแล้วล้วนๆ ⇒ ไม่มี read เพิ่ม
 */
export function useNavDots() {
  const auth = useAuthStore()
  const { fillPct, accrued } = useDaily()
  const farm = useFarm()

  // พืชสุกทีละนาทีก็พอ ไม่ต้องละเอียดระดับวินาที
  const now = ref(Date.now())
  const timer = setInterval(() => { now.value = Date.now() }, 15000)
  onScopeDispose(() => clearInterval(timer))

  // ยังไม่มี userData = useDaily มองว่า "ไม่เคยเก็บ" แล้วหลอดเต็ม — ห้ามขึ้นจุดตอนนั้น
  const ready = computed(() => auth.isLoggedIn && !!auth.userData)

  const homeDot = computed(() => ready.value && fillPct.value >= DAILY_DOT_PCT && accrued.value >= 1)
  const farmDot = computed(() => ready.value &&
    farm.plots.value.some(p => p && farm.status(p, now.value).ready))

  // รางวัลเกมเพ็ทรอกดรับ (user สั่ง 1 ต.ค. 2026): ซีซั่นหอคอย/อารีน่า (จดหมาย kind season ที่ยังไม่รับ) + ลงสนามครบ 5 ครั้ง
  // จดหมายโหลดตอนเปิด Home (HomeView onMounted) — ยังไม่โหลด = ไม่ขึ้นจุด ไม่มี read เพิ่ม
  const mailbox = useMailbox()
  const { pvpOpen } = useAppConfig()
  const towerDot = computed(() => ready.value && !!mailbox.seasonPending('tower'))
  const arenaDot = computed(() => ready.value && (!!mailbox.seasonPending('arena') ||
    ((pvpOpen.value || auth.isAdmin) && canClaimDaily(auth.userData?.pvpDaily, new Date().toISOString().slice(0, 10)))))
  const petModeDot = computed(() => towerDot.value || arenaDot.value)
  const playDot = computed(() => farmDot.value || petModeDot.value)

  return { homeDot, playDot, farmDot, towerDot, arenaDot, petModeDot }
}
