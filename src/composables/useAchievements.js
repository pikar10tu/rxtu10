import { watch } from 'vue'
import { collection, getDocs, getDoc, doc, setDoc, addDoc, serverTimestamp, increment } from 'firebase/firestore'
import { getCosmetic } from '../data/cosmetics.js'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useUsageStore } from '../stores/usage.js'
import { useAchievementBalloon } from './useAchievementBalloon.js'
import { MILESTONES, getAchievement } from '../data/achievements.js'
import { obtainablePets } from '../utils/petCatalog.js'
import { useAppConfig } from './useAppConfig.js'
import { MAX_RESIDENCE_LEVEL } from '../data/residence.js'
import {
  computeProgress, checkMilestones, achievementDocId, achievementTitle, buildAchievementNews,
} from '../utils/achievements.js'

const earned = new Set()       // achId/docId-base ที่ได้แล้ว (in-memory)
let announceOn = false         // backfill รอบแรกเงียบ → true หลังจากนั้น
let _started = false

// allSpecies = จำนวนที่ "หมุนได้จริง" ไม่ใช่ทั้งคลัง — ไม่งั้นเควสเก็บครบทำไม่ได้ทั้งชั้นปีตอนมีเพ็ทที่ยังไม่เปิด
// ⚠️ ต้องเป็น obtainablePets (ของที่หาได้จริงตอนนี้ รวมตู้อีเวนต์) ไม่ใช่คลังของตู้ปกติ
//    ไม่งั้นพอเปิดอีเวนต์ ตัวหารค้างที่ 27 แล้วเควส "เก็บครบทุกชนิด" ติ๊กผ่านตั้งแต่ยังไม่ครบจริง
const ctx = () => ({
  allSpecies: obtainablePets(useAppConfig().rawConfig.value?.gachaEvent).length,
  maxResidence: MAX_RESIDENCE_LEVEL,
})

export function addEarned(achId) { earned.add(achId) }

// ค่าที่ computeProgress (pure) คิดเองไม่ได้ — ของตกแต่งระดับตำนาน (ต้องรู้แคตตาล็อก) · ข้อที่ตรวจ (อยู่ใน reviewMeta/main)
let reviewedCount = 0
async function loadReviewedCount(uid) {
  reviewedCount = 0
  if (!useAuthStore().isAcademic) return        // คนตรวจได้มีแค่ทีมวิชาการ ⇒ นักศึกษาทั่วไปไม่เสีย read
  try {
    const snap = await getDoc(doc(db, 'reviewMeta', 'main'))
    useUsageStore().track(1)
    reviewedCount = Number(snap.data()?.counts?.[uid]) || 0
  } catch (e) { console.error('[achievement review count]', e) }
}
const progressOf = (u) => ({
  ...computeProgress(u),
  cosmeticLegend: (u?.cosmetics?.owned || []).filter(id => getCosmetic(id)?.tier === 4).length,
  reviewedCount,
})

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
      await loadReviewedCount(uid)
      // backfill เงียบ: grant ที่เข้าเกณฑ์อยู่แล้ว โดยไม่ประกาศ
      const news = checkMilestones(MILESTONES, progressOf(auth.userData), earned, ctx())
      for (const id of news) await grantMilestone(id)
    } catch (e) { console.error('[achievement init]', e) }
    finally { announceOn = true }   // หลังจากนี้ปลดล็อกจริง → ประกาศ
  }, { immediate: true })

  // ปลดล็อกระหว่างเล่น: userData เปลี่ยน → เช็ค → grant (ประกาศ)
  watch(() => auth.userData, async (u) => {
    if (!u || !announceOn || !auth.currentUser?.uid) return
    const news = checkMilestones(MILESTONES, progressOf(u), earned, ctx())
    for (const id of news) await grantMilestone(id)
  }, { deep: true })
}
