// towerRivals — pure: จัดอันดับ towerBest ของเพื่อน + ระยะไล่ตาม (สำหรับแถบเทียบหน้าหอคอย)
/**
 * @param {Array<{uid,nickname,towerBest}>} others  รายชื่อจาก members store
 * @param {{uid,nickname,towerBest}} me              ค่าสดของผู้เล่นปัจจุบัน (auth)
 */
export function towerRanking(others, me) {
  const map = new Map()
  for (const u of (others || [])) if (u && u.uid) map.set(u.uid, u)
  map.set(me.uid, me)  // ค่าสดทับของซ้ำ
  const ranked = [...map.values()]
    .filter(u => (u.towerBest || 0) >= 1)
    .sort((a, b) => (b.towerBest - a.towerBest) || String(a.nickname).localeCompare(String(b.nickname)))
  const myIdx = ranked.findIndex(u => u.uid === me.uid)
  const chase = myIdx > 0 ? ranked[myIdx - 1] : null
  return {
    top: ranked.slice(0, 3).map(u => ({ nickname: u.nickname, floor: u.towerBest, isMe: u.uid === me.uid })),
    myRank: myIdx >= 0 ? myIdx + 1 : null,
    total: ranked.length,
    chaseName: chase ? chase.nickname : null,
    chaseGap: chase ? chase.towerBest - (me.towerBest || 0) : 0,
  }
}
