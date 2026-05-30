import { computed } from 'vue'
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from './useToast.js'
import { residenceDailyIncome } from '../data/residence.js'
import { totalPetDaily } from '../utils/petUtils.js'

/**
 * Daily income claim (once/day).
 *   total = residence dailyIncome (by level) + Σ petDailyCoins(stored pets)
 * Replaces the legacy flat base:1000. Vault pets earn nothing.
 */
export function useDaily() {
  const auth = useAuthStore()
  const { toast } = useToast()

  const level    = computed(() => auth.userData?.residence?.level || 1)
  const baseIncome = computed(() => residenceDailyIncome(level.value))
  const petIncome  = computed(() => totalPetDaily(auth.userData?.pets))
  const bonusPct   = computed(() => auth.incomeBonusPct)            // supporter etc.
  const subtotal   = computed(() => baseIncome.value + petIncome.value)
  const total      = computed(() => Math.round(subtotal.value * (1 + bonusPct.value / 100)))

  // claimable if never claimed, or last claim was on a different calendar day
  const claimable = computed(() => {
    const last = auth.userData?.lastDaily
    const d = last?.toDate ? last.toDate() : (last ? new Date(last) : null)
    if (!d) return true
    return d.toDateString() !== new Date().toDateString()
  })

  async function claim() {
    if (!auth.currentUser) return
    if (!claimable.value) { toast('รับวันนี้ไปแล้ว เดี๋ยวพรุ่งนี้มาใหม่!', 'info'); return }

    const amount = total.value
    auth.blockSnapshot()
    auth.setUserDataOptimistic({ coins: (auth.userData?.coins || 0) + amount, lastDaily: new Date() })
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        coins: increment(amount),
        lastDaily: serverTimestamp(),
      })
      toast(`รับรายได้ +${amount.toLocaleString()}🪙`, 'success')
    } catch (e) {
      console.error('[daily claim]', e)
      toast('รับรายได้ไม่สำเร็จ', 'error')
    }
  }

  return { baseIncome, petIncome, bonusPct, total, claimable, claim }
}
