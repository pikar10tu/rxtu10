// towerStele — ศิลาจารึกหอคอย (user เคาะ 17 ต.ค. 2026): 1 คน × 1 ซีซั่น = 1 บรรทัด (ยอดสูงสุดที่เกิน 100 ของซีซั่นนั้น)
// อ่านจาก roster rows `th` = { 'YYYY-MM': floor } (users.towerRecords) · ซีซั่นใหม่อยู่บนสุด · 0 read เพิ่ม
// เทส: node --test src/utils/towerStele.test.js

/**
 * @param {Object} rows  roster/current.rows = { [uid]: row }
 * @param {string} meUid
 * @returns {Array<{season, entries: Array<{uid,name,floor,isMe,isPeak}>}>}
 */
export function buildStele(rows, meUid) {
  const by = {}, peak = {}
  for (const [uid, r] of Object.entries(rows || {})) {
    for (const [season, f] of Object.entries(r?.th || {})) {
      const floor = Math.floor(Number(f) || 0)
      if (floor <= 100 || !/^\d{4}-\d{2}$/.test(season)) continue
      ;(by[season] ||= []).push({ uid, name: r.n || '?', floor, isMe: uid === meUid })
      peak[uid] = Math.max(peak[uid] || 0, floor)
    }
  }
  return Object.keys(by).sort().reverse().map(season => ({
    season,
    entries: by[season]
      .map(e => ({ ...e, isPeak: e.floor === peak[e.uid] }))
      .sort((a, b) => (b.floor - a.floor) || a.name.localeCompare(b.name)),
  }))
}
