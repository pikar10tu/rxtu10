import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, getDocs, doc, updateDoc, query, orderBy, runTransaction, increment, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from './auth.js'
import { useUsageStore } from './usage.js'
import { attentionCount, canClaim, rewardCoins } from '../utils/mailbox.js'
import { announceAchievement, addEarned } from '../composables/useAchievements.js'
import { achievementDocId } from '../utils/achievements.js'

// จดหมายของผู้ใช้ = subcollection users/{uid}/mail (เบา, ของตัวเอง)
// load มี in-memory guard (โหลดครั้งเดียวต่อ session ต่อ uid) — refresh ได้ด้วย force
export const useMailbox = defineStore('mailbox', () => {
  const auth = useAuthStore()
  const usage = useUsageStore()

  const mails = ref([])
  const loading = ref(false)
  let loadedFor = null   // uid ที่โหลดไว้แล้ว (guard)

  const attention = computed(() => attentionCount(mails.value))

  async function load({ force = false } = {}) {
    const uid = auth.currentUser?.uid
    if (!uid) { mails.value = []; loadedFor = null; return }
    if (!force && loadedFor === uid) return
    loading.value = true
    try {
      const snap = await getDocs(query(collection(db, 'users', uid, 'mail'), orderBy('createdAt', 'desc')))
      usage.track(snap.size)
      mails.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      loadedFor = uid
    } catch (e) { console.error('[mailbox load]', e) }
    finally { loading.value = false }
  }

  async function markRead(id) {
    const uid = auth.currentUser?.uid
    const m = mails.value.find(x => x.id === id)
    if (!uid || !m || m.read) return
    m.read = true // optimistic
    try { await updateDoc(doc(db, 'users', uid, 'mail', id), { read: true }); usage.track(0, 1) }
    catch (e) { console.error('[mail read]', e); m.read = false }
  }

  // claim = transaction: ถ้ายังไม่ claim → flip claimed/read + increment เหรียญ user doc
  // + ถ้ามี achievement แนบ → เขียน subcollection achievements + นับ ในทรานแซคชันเดียวกัน
  // หลังทรานแซคชันสำเร็จ ค่อย addEarned + announceAchievement (กัน milestone watcher แจกซ้ำ)
  // คืนจำนวนเหรียญที่ได้ (0 ถ้ารับไปแล้ว/ไม่มีรางวัล, false ถ้า error)
  async function claim(id) {
    const uid = auth.currentUser?.uid
    const m = mails.value.find(x => x.id === id)
    if (!uid || !canClaim(m)) return 0
    try {
      const result = await runTransaction(db, async (tx) => {
        const ref = doc(db, 'users', uid, 'mail', id)
        const snap = await tx.get(ref)
        if (!snap.exists() || snap.data().claimed) return { coins: 0, ach: null }
        const data = snap.data()
        const c = rewardCoins(data)
        const ach = data.reward?.achievement || null
        tx.update(ref, { claimed: true, read: true })
        const userPatch = {}
        if (c > 0) userPatch.coins = increment(c)
        if (ach) {
          tx.set(doc(db, 'users', uid, 'achievements', achievementDocId(ach.id, ach.date || null)),
            { achId: ach.id, ...(ach.date ? { date: ach.date } : {}), earnedAt: serverTimestamp() })
          userPatch.achievementCount = increment(1)
        }
        if (Object.keys(userPatch).length) tx.update(doc(db, 'users', uid), userPatch)
        return { coins: c, ach }
      })
      usage.track(0, 1)
      if (result.coins > 0 || result.ach) { m.claimed = true; m.read = true } // optimistic local (coins อัปเดตผ่าน auth onSnapshot)
      if (result.ach) { addEarned(result.ach.id); await announceAchievement(result.ach.id, result.ach.date || null) }
      return result.coins
    } catch (e) { console.error('[mail claim]', e); return false }
  }

  return { mails, loading, attention, load, markRead, claim }
})
