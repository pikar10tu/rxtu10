import { watch } from 'vue'
import { collection, getDocs, doc, setDoc, addDoc, serverTimestamp, increment } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useUsageStore } from '../stores/usage.js'
import { useAchievementBalloon } from './useAchievementBalloon.js'
import { MILESTONES, getAchievement } from '../data/achievements.js'
import { PETS } from '../data/pets.js'
import { MAX_RESIDENCE_LEVEL } from '../data/residence.js'
import {
  computeProgress, checkMilestones, achievementDocId, achievementTitle, buildAchievementNews,
} from '../utils/achievements.js'

const earned = new Set()       // achId/docId-base ที่ได้แล้ว (in-memory)
let announceOn = false         // backfill รอบแรกเงียบ → true หลังจากนั้น
let _started = false

const ctx = () => ({ allSpecies: PETS.length, maxResidence: MAX_RESIDENCE_LEVEL })

export function addEarned(achId) { earned.add(achId) }

// balloon + กระดานข่าว (ใช้ร่วม self-grant + claim) — best effort
export async function announceAchievement(achId, date = null) {
  const def = getAchievement(achId)
  if (!def) return
  const auth = useAuthStore()
  const usage = useUsageStore()
  useAchievementBalloon().celebrate({ title: achievementTitle(def, date), icon: def.icon })
  try {
    const news = buildAchievementNews(auth.userData?.nickname || auth.userData?.name, def, date)
    await addDoc(collection(db, 'news'), { ...news, uid: auth.currentUser?.uid || null, ts: serverTimestamp() })
    usage.track(0, 1)
  } catch (e) { console.error('[achievement news]', e) }
}

// grant milestone (self): เขียน subcollection + นับ + (ถ้า announceOn) ประกาศ
async function grantMilestone(achId) {
  const auth = useAuthStore()
  const uid = auth.currentUser?.uid
  if (!uid || earned.has(achId)) return
  earned.add(achId)   // กัน loop/ซ้ำก่อน write
  try {
    await setDoc(doc(db, 'users', uid, 'achievements', achievementDocId(achId, null)),
      { achId, earnedAt: serverTimestamp() })
    await auth.patchUser({ achievementCount: (auth.userData?.achievementCount || 0) + 1 },
      { achievementCount: increment(1) })
    if (announceOn) await announceAchievement(achId, null)
  } catch (e) { console.error('[achievement grant]', e); earned.delete(achId) }
}

async function loadEarned(uid) {
  earned.clear()
  const usage = useUsageStore()
  const snap = await getDocs(collection(db, 'users', uid, 'achievements'))
  usage.track(snap.size)
  snap.forEach(d => earned.add(d.data().achId || d.id))
}

export function initAchievements() {
  if (_started) return
  _started = true
  const auth = useAuthStore()

  watch(() => auth.currentUser?.uid, async (uid) => {
    announceOn = false
    earned.clear()
    if (!uid) return
    try {
      await loadEarned(uid)
      // backfill เงียบ: grant ที่เข้าเกณฑ์อยู่แล้ว โดยไม่ประกาศ
      const news = checkMilestones(MILESTONES, computeProgress(auth.userData), earned, ctx())
      for (const id of news) await grantMilestone(id)
    } catch (e) { console.error('[achievement init]', e) }
    finally { announceOn = true }   // หลังจากนี้ปลดล็อกจริง → ประกาศ
  }, { immediate: true })

  // ปลดล็อกระหว่างเล่น: userData เปลี่ยน → เช็ค → grant (ประกาศ)
  watch(() => auth.userData, async (u) => {
    if (!u || !announceOn || !auth.currentUser?.uid) return
    const news = checkMilestones(MILESTONES, computeProgress(u), earned, ctx())
    for (const id of news) await grantMilestone(id)
  }, { deep: true })
}
