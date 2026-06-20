import { ref, computed, onScopeDispose } from 'vue'
import { increment, serverTimestamp } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from './useToast.js'
import { residenceDailyIncome } from '../data/residence.js'
import { totalPetDaily } from '../utils/petUtils.js'
import { questIncomeMult } from '../utils/dailyQuest.js'

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Idle income: residence + stored-pet income accrues hourly, capped at 24h.
 *   ratePerDay = (residence dailyIncome + Σ petDaily × residence pet-bonus%) × supporter bonus × buff
 *   accrued    = ratePerDay × min(elapsed, 24h) / 24h   (collect anytime)
 * Beyond 24h it stops accruing (the overflow is lost → come back daily!).
 * `lastDaily` on the user doc = last collection time.
 */
export function useDaily() {
  const auth = useAuthStore()
  const { toast } = useToast()

  const level      = computed(() => auth.userData?.residence?.level || 1)
  const baseIncome = computed(() => residenceDailyIncome(level.value))
  const petIncome  = computed(() => totalPetDaily(auth.userData?.pets))
  const bonusPct   = computed(() => auth.incomeBonusPct)

  // live clock (ticks for the accrual bar/amount)
  const now = ref(Date.now())
  const timer = setInterval(() => { now.value = Date.now() }, 1000)
  onScopeDispose(() => clearInterval(timer))

  const buffMult   = computed(() => questIncomeMult(auth.userData, now.value))
  const buffActive = computed(() => buffMult.value > 1)
  const ratePerDay = computed(() => Math.round((baseIncome.value + petIncome.value) * (1 + bonusPct.value / 100) * buffMult.value))
  const ratePerHour = computed(() => Math.round(ratePerDay.value / 24))

  function lastMs() {
    const l = auth.userData?.lastDaily
    if (!l) return now.value - DAY_MS // never collected → start full
    if (typeof l.toMillis === 'function') return l.toMillis()
    if (typeof l.toDate === 'function') return l.toDate().getTime()
    return new Date(l).getTime()
  }

  const elapsedMs   = computed(() => Math.max(0, Math.min(DAY_MS, now.value - lastMs())))
  const fillPct     = computed(() => Math.min(100, (elapsedMs.value / DAY_MS) * 100))
  const accrued     = computed(() => Math.floor(ratePerDay.value * elapsedMs.value / DAY_MS))
  const isFull      = computed(() => elapsedMs.value >= DAY_MS)
  const remainingMs = computed(() => Math.max(0, DAY_MS - elapsedMs.value))

  async function claim() {
    if (!auth.currentUser) return
    const amount = accrued.value
    if (amount < 1) { toast('ยังไม่มีรายได้สะสม รออีกหน่อยนะ', 'info'); return }
    const ok = await auth.patchUser(
      { coins: (auth.userData?.coins || 0) + amount, lastDaily: new Date() },
      { coins: increment(amount), lastDaily: serverTimestamp() },
    )
    toast(ok ? `เก็บรายได้ +${amount.toLocaleString()} เหรียญ` : 'เก็บรายได้ไม่สำเร็จ', ok ? 'success' : 'error')
  }

  return {
    baseIncome, petIncome, bonusPct, buffActive, buffMult, ratePerDay, ratePerHour,
    accrued, fillPct, isFull, remainingMs, claim,
  }
}
