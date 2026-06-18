// achievements — pure helpers (ไม่ import data/firestore; ctx/catalog ส่งเข้ามา)
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

export const achievementTitle = (def, date) => (date ? `${def.title} ${date}` : def.title)
export const achievementDocId = (achId, date) => (date ? `${achId}__${date}` : achId)

export function buildAchievementNews(nickname, def, date) {
  return {
    msg: `${nickname || 'มีคน'} ปลดล็อก "${achievementTitle(def, date)}"`,
    icon: def.icon,
    type: 'achievement',
  }
}
