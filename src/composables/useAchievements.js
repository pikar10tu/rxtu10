import { watch } from 'vue'
import { collection, getDocs, getDoc, doc, setDoc, serverTimestamp, increment } from 'firebase/firestore'
import { getCosmetic } from '../data/cosmetics.js'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useUsageStore } from '../stores/usage.js'
import { useAchievementBalloon } from './useAchievementBalloon.js'
import { useRosterSync } from './useRosterSync.js'
import { MILESTONES, getAchievement } from '../data/achievements.js'
import { obtainablePets } from '../utils/petCatalog.js'
import { useAppConfig } from './useAppConfig.js'
import { MAX_RESIDENCE_LEVEL } from '../data/residence.js'
import {
  computeProgress, checkMilestones, achievementDocId, achievementTitle,
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
// ข่าวไปเลน roster (`ev` k:'ac') ไม่ใช่ collection news แล้ว (25 ก.ย. 2026):
//   เดิม 1 ความสำเร็จ = 1 doc ใน news · กระดานดึงแค่ 5 doc ⇒ คนปลดรวด 5 อันดันข่าวตำนาน/หอคอย 100 ตกหมด
//   ตอนนี้ปลดรวดภายใน 30 นาที = รวมเป็นบรรทัดเดียว (pushAchievementEvent) · คนหนึ่งกินได้ไม่เกิน 3 ช่องอยู่แล้ว
export async function announceAchievement(achId, date = null) {
  return announceMany([{ achId, date }])
}

async function announceMany(list) {
  const items = list.filter(x => getAchievement(x.achId))
  if (!items.length) return
  const balloon = useAchievementBalloon()
  for (const { achId, date } of items) {
    const def = getAchievement(achId)
    balloon.celebrate({ title: achievementTitle(def, date), icon: def.icon })
  }
  // ใหม่สุดก่อน · write เดียวต่อชุด (roster doc รับได้ ~1 write/วินาที)
  const docIds = items.map(({ achId, date }) => achievementDocId(achId, date)).reverse()
  try { await useRosterSync().syncRosterRow({ achievements: docIds }) }
  catch (e) { console.error('[achievement news]', e) }
}

/** ปลด achievement ลับ (type 'secret') จากที่ไหนก็ได้ — ได้แล้วเงียบ · ประกาศเหมือนปลดปกติ */
export async function grantSecret(achId) {
  if (getAchievement(achId)?.type !== 'secret') return
  // ยังโหลดของที่ได้แล้วไม่เสร็จ = ไม่รู้ว่าเคยได้หรือยัง → ข้าม (กัน achievementCount นับซ้ำ)
  if (!announceOn) return
  if (await grantMilestone(achId)) await announceAchievement(achId, null)
}

// grant milestone (self): เขียน subcollection + นับ · คืน true ถ้าปลดสำเร็จ (คนเรียกตัดสินเองว่าจะประกาศไหม)
async function grantMilestone(achId) {
  const auth = useAuthStore()
  const uid = auth.currentUser?.uid
  if (!uid || earned.has(achId)) return false
  earned.add(achId)   // กัน loop/ซ้ำก่อน write
  try {
    await setDoc(doc(db, 'users', uid, 'achievements', achievementDocId(achId, null)),
      { achId, earnedAt: serverTimestamp() })
    await auth.patchUser({ achievementCount: (auth.userData?.achievementCount || 0) + 1 },
      { achievementCount: increment(1) })
    return true
  } catch (e) { console.error('[achievement grant]', e); earned.delete(achId); return false }
}

/** เช็คแล้วปลดทุกอันที่เข้าเกณฑ์ · announce=false = backfill เงียบ */
async function grantAll(u, announce) {
  const ids = checkMilestones(MILESTONES, progressOf(u), earned, ctx())
  const got = []
  for (const id of ids) if (await grantMilestone(id)) got.push({ achId: id, date: null })
  if (announce && got.length) await announceMany(got)
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

  // 🔑 backfill ต้องเงียบ "เสมอ" — คนเพิ่งย้ายระบบ/achievement ชุดใหม่ deploy จะเข้าเกณฑ์ทีเดียวหลายสิบอัน
  //    เดิม: backfill รันตอน uid มา แต่ userData อาจยังไม่มา (onSnapshot ตามหลัง ensureDoc)
  //    ⇒ backfill ได้ progress ว่าง → เปิด announceOn → snapshot แรกมาถึง → ปลดทั้งกองแบบประกาศ = กระดานถูกท่วม
  //    ตอนนี้: เช็คครั้งแรกที่มี "ทั้ง earned และ userData" = เงียบ · หลังจากนั้นเท่านั้นที่ประกาศ
  let loadedFor = null      // uid ที่โหลด earned เสร็จแล้ว (โหลดพัง = null ⇒ ไม่ปลดอะไรเลย ดีกว่าปลดซ้ำทั้งกอง)
  let busy = false          // กัน 2 watcher เช็คซ้อนกัน
  let again = false         // มีการเปลี่ยนระหว่างเช็ค → วนเช็คอีกรอบ (ไม่ทิ้งของที่ปลดระหว่างนั้น)

  async function check() {
    if (busy) { again = true; return }
    busy = true
    try {
      do {
        again = false
        const uid = auth.currentUser?.uid
        if (!uid || loadedFor !== uid || !auth.userData) return
        if (!announceOn) { await grantAll(auth.userData, false); announceOn = true }
        else await grantAll(auth.userData, true)
      } while (again)
    } catch (e) { console.error('[achievement check]', e) }
    finally { busy = false }
  }

  watch(() => auth.currentUser?.uid, async (uid) => {
    announceOn = false
    loadedFor = null
    earned.clear()
    if (!uid) return
    try {
      await loadEarned(uid)
      await loadReviewedCount(uid)
      if (auth.currentUser?.uid !== uid) return        // สลับบัญชีระหว่างโหลด
      loadedFor = uid
      await check()                                    // userData มาแล้ว = backfill เงียบเลย · ยังไม่มา = รอ watcher ข้างล่าง
    } catch (e) { console.error('[achievement init]', e) }
  }, { immediate: true })

  // userData เปลี่ยน → เช็ค (ครั้งแรกเงียบ · หลังจากนั้นประกาศ)
  watch(() => auth.userData, () => { check() }, { deep: true })
}
