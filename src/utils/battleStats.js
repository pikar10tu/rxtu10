// สรุปสถิติการสู้ต่อ species จาก battle log — pure (เทส node --test)
// อ่านเฉพาะฝั่งผู้เล่น (uid 'A{i}', map ไป playerTeam[i].id) → increment delta ไปเขียน Firestore
const EMPTY = () => ({ battles: 0, wins: 0, kills: 0, deaths: 0, dmgDealt: 0, dmgTaken: 0 })

export function computeBattleStats(log, playerTeam, won) {
  const out = {}
  const idOf = (uid) => {                 // 'A2' → playerTeam[2].id
    if (!uid || uid[0] !== 'A') return null
    const i = parseInt(uid.slice(1), 10)
    return playerTeam?.[i]?.id || null
  }
  const bump = (id, patch) => {
    if (!id) return
    const cur = out[id] || (out[id] = EMPTY())
    for (const k in patch) cur[k] += patch[k]
  }
  // battles/wins: ทุกช่องที่ลงสนาม (นับตาม index ทีม)
  ;(playerTeam || []).forEach((p) => bump(p?.id, { battles: 1, wins: won ? 1 : 0 }))
  for (const e of log || []) {
    if (e.t !== 'attack') continue
    if (e.side === 'A') {                  // ผู้เล่นเป็นผู้ตี
      bump(idOf(e.attacker), { dmgDealt: e.dmg || 0, kills: e.dead ? 1 : 0 })
    }
    const tId = idOf(e.target)             // ผู้เล่นเป็นเป้า (ไม่ว่าใครตี)
    if (tId) bump(tId, { dmgTaken: e.dmg || 0, deaths: e.dead ? 1 : 0 })
  }
  return out
}
