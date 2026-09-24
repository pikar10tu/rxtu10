// achievements — pure helpers (ไม่ import data/firestore; ctx/catalog ส่งเข้ามา)
import { seasonMonthLabel } from './pvpSeason.js'

const SENTINEL = { ALL_SPECIES: 'allSpecies', MAX_RESIDENCE: 'maxResidence' }

export function computeProgress(userData) {
  const u = userData || {}
  const pets = Array.isArray(u.pets) ? u.pets : []
  return {
    petCount: pets.length,
    petSpeciesCount: new Set(pets.map(p => p && p.id).filter(Boolean)).size,
    quizDoneTotal: u.quizDoneTotal || 0,
    studyReviewedTotal: u.studyReviewedTotal || 0,
    farmSalesTotal: u.farmSalesTotal || 0,
    totalSpent: u.totalSpent || 0,
    residenceLevel: u.residence?.level || 1,
    // ── ชุด 25 ก.ย. 2026 ──
    towerBest: u.towerBest || 0,
    ta15Best: u.timeAttack?.best15 || 0,
    legendarySpecies: new Set(pets.filter(p => p?.rarity === 'legendary').map(p => p.id)).size,
    pvpWinsTotal: u.pvpWinsTotal || 0,
    gachaPullsTotal: u.gachaPullsTotal || 0,
    labFuseTotal: u.labFuseTotal || 0,
    quizPerfectTotal: u.quizPerfectTotal || 0,
    reportsConfirmed: u.reportsConfirmed || 0,
    towerChampTotal: u.towerChampTotal || 0,
    arenaChampTotal: u.arenaChampTotal || 0,
    cosmeticsOwned: Array.isArray(u.cosmetics?.owned) ? u.cosmetics.owned.length : 0,
  }
}

export function resolveGte(gte, ctx = {}) {
  const key = SENTINEL[gte]
  if (key) return Number(ctx[key]) || 0
  return Number(gte) || 0
}

export function checkMilestones(milestones, progress, earnedIds, ctx = {}) {
  const earned = earnedIds instanceof Set ? earnedIds : new Set(earnedIds || [])
  const out = []
  for (const m of milestones || []) {
    if (earned.has(m.id)) continue
    const have = progress[m.trigger.stat] || 0
    if (have >= resolveGte(m.trigger.gte, ctx)) out.push(m.id)
  }
  return out
}

// def.season: date = 'YYYY-MM' ของซีซั่น → "… ซีซั่น ก.ย. 69" (ไม่ใช่วันที่ดิบ)
export const achievementTitle = (def, date) =>
  (!date ? def.title : def.season ? `${def.title} ซีซั่น ${seasonMonthLabel(date, true)}` : `${def.title} ${date}`)
export const achievementDocId = (achId, date) => (date ? `${achId}__${date}` : achId)

export function buildAchievementNews(nickname, def, date) {
  return {
    msg: `${nickname || 'มีคน'} ปลดล็อก "${achievementTitle(def, date)}"`,
    icon: def.icon,
    type: 'achievement',
  }
}

// ── ตู้โชว์ + ฉายา (roadmap #8 ส่วนแรก) ──
// user doc: equipTitle = docId ของ achievement ที่สวมเป็นฉายา · pinnedAch = docId ที่ปักขึ้นตู้ (≤ SHOWCASE_MAX)
// ⚠️ ค่าบน user doc เจ้าของเขียนเองได้ ⇒ ต้องเช็คกับรายการที่ "มีจริง" (subcollection) ทุกครั้งก่อนโชว์
export const SHOWCASE_MAX = 3

/** ตู้โชว์: ของที่ปักไว้ (เรียงตามที่ปัก · ตัดของที่ไม่มีจริง) · ไม่ได้ปักเลย = ล่าสุด n อัน */
export function resolveShowcase(items, pinned, n = SHOWCASE_MAX) {
  const list = Array.isArray(items) ? items : []
  const byId = new Map(list.map(a => [a.docId, a]))
  const picked = (Array.isArray(pinned) ? pinned : []).map(id => byId.get(id)).filter(Boolean).slice(0, n)
  return picked.length ? picked : list.slice(0, n)
}

/** ฉายาที่สวม — คืน item หรือ null (ไม่ได้สวม/ไม่มีจริง) */
export function resolveTitle(items, equip) {
  if (!equip) return null
  return (Array.isArray(items) ? items : []).find(a => a.docId === equip) || null
}

/** ปัก/ถอด 1 อัน · เต็มแล้วปักใหม่ = ดันอันเก่าสุดออก */
export function togglePin(pinned, docId, n = SHOWCASE_MAX) {
  const cur = Array.isArray(pinned) ? pinned.filter(Boolean) : []
  if (cur.includes(docId)) return cur.filter(x => x !== docId)
  return [...cur, docId].slice(-n)
}
