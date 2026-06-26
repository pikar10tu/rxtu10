// PvP matchmaking — pure: เลือกคู่ต่อสู้คนจริงเรตใกล้สุด (บอทเติมใน useArena)
import { PVP_RATING_START } from './pvpRating.js'

const hasTeam = (c) => Array.isArray(c.activePets) && c.activePets.some(Boolean)

/** คนที่บุกได้: มีทีม + ไม่ใช่ตัวเอง + มี uid */
export function eligibleOpponents(meUid, candidates) {
  return (candidates || []).filter(c => c && c.uid && c.uid !== meUid && hasTeam(c))
}

/** เลือกคนจริง n คน เรตใกล้ myRating สุด (เติมฟิลด์ rating) */
export function pickHumanOpponents(meUid, myRating, candidates, n = 4) {
  return eligibleOpponents(meUid, candidates)
    .map(c => ({ ...c, rating: c.pvp?.rating ?? PVP_RATING_START }))
    .sort((a, b) => Math.abs(a.rating - myRating) - Math.abs(b.rating - myRating))
    .slice(0, n)
}
