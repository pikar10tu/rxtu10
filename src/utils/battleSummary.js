// สรุปผลต่อตัว ทั้งสองฝั่ง + MVP ต่อทีม — pure (เทส node --test)
// ใช้แสดงหน้าสรุปการต่อสู้ (คนละหน้าที่กับ battleStats.js ที่เขียน Firestore แบบ species-keyed)
const MVP_TAKEN_WEIGHT = 0.5   // tunable: เครดิตของตัวที่ดูดดาเมจ (อึด)

const idxOf = (uid) => parseInt(uid.slice(1), 10)

export function computeBattleSummary(log, playerTeam, botTeam) {
  const units = {}
  const mk = (side, team) => (team || []).forEach((p, i) => {
    units[side + i] = { uid: side + i, side, id: p?.id || null, dmgDealt: 0, dmgTaken: 0, kills: 0, dead: false }
  })
  mk('A', playerTeam); mk('B', botTeam)

  for (const e of log || []) {
    if (e.t !== 'attack') continue
    const a = units[e.attacker], t = units[e.target]
    if (a) { a.dmgDealt += e.dmg || 0; if (e.dead) a.kills += 1 }
    if (t) { t.dmgTaken += e.dmg || 0; if (e.dead) t.dead = true }
  }

  const score = (u) => u.dmgDealt + MVP_TAKEN_WEIGHT * u.dmgTaken
  const teamOf = (side) => Object.values(units).filter(u => u.side === side).sort((x, y) => idxOf(x.uid) - idxOf(y.uid))
  const mvpOf = (list) => {
    if (!list.length) return null
    let best = list[0]                          // list เรียง index แล้ว → เสมอเลือกซ้ายสุดอัตโนมัติ
    for (const u of list) if (score(u) > score(best)) best = u
    return best.uid
  }
  const teamA = teamOf('A'), teamB = teamOf('B')
  return { teamA, teamB, mvp: { A: mvpOf(teamA), B: mvpOf(teamB) } }
}
