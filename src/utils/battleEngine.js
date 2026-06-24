// ════════════════════════════════════════════════════════════
//  Battle engine — pure + deterministic (seeded) · พอร์ตจาก
//  scripts/battle-sim.mjs (resolve) + บันทึก log ทุก action ให้ UI replay
//  ไม่มี side effect — ไม่อ่าน store/Firestore/Date.now
// ════════════════════════════════════════════════════════════
import { BATTLE_CFG, buildCombatant, elementMult } from '../data/battle.js'

// mulberry32 — RNG เดียวกับ sim
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const alive = (t) => t.filter(f => f.hp > 0)

/** teamA/teamB = array ของ {id,rarity,element,grade} (≤4) · seed = int */
export function simulateBattle(teamA, teamB, seed) {
  const rand = rng(seed)
  const A = (teamA || []).map((p, i) => ({ ...buildCombatant(p), uid: `A${i}`, side: 'A' }))
  const B = (teamB || []).map((p, i) => ({ ...buildCombatant(p), uid: `B${i}`, side: 'B' }))
  const log = []

  const pick = (foes) => { const al = alive(foes); return al.length ? al[Math.floor(rand() * al.length)] : null }
  const hit = (att, foes) => {
    const tg = pick(foes)
    if (!tg) return
    let m = elementMult(att.element, tg.element)
    const eff = m > 1 ? 'super' : (m < 1 ? 'weak' : 'neutral')  // ธาตุล้วน ก่อนคูณ crit/variance
    const crit = rand() < BATTLE_CFG.critRate
    if (crit) m *= BATTLE_CFG.critMult
    m *= 1 + (rand() * 2 - 1) * BATTLE_CFG.variance
    const dmg = Math.max(0, att.atk * m)
    tg.hp -= dmg
    log.push({
      t: 'attack', side: att.side, attacker: att.uid, target: tg.uid,
      dmg: Math.round(dmg), crit, eff, targetHpAfter: Math.max(0, Math.round(tg.hp)), dead: tg.hp <= 0,
    })
  }

  let round = 0
  while (round < BATTLE_CFG.maxRounds && alive(A).length && alive(B).length) {
    round++
    log.push({ t: 'round', n: round })
    const act = []
    A.forEach(f => { if (f.hp > 0) act.push([f, B]) })
    B.forEach(f => { if (f.hp > 0) act.push([f, A]) })
    // สุ่มลำดับ (กัน first-mover)
    for (let i = act.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1));[act[i], act[j]] = [act[j], act[i]] }
    for (const [f, foes] of act) if (f.hp > 0) hit(f, foes)
  }

  const pct = (t) => { const max = t.reduce((s, f) => s + f.maxHp, 0); return max ? t.reduce((s, f) => s + Math.max(0, f.hp), 0) / max : 0 }
  const aAlive = alive(A).length > 0, bAlive = alive(B).length > 0
  const hpPctA = pct(A), hpPctB = pct(B)
  let winner
  if (aAlive && !bAlive) winner = 'A'
  else if (bAlive && !aAlive) winner = 'B'
  else winner = hpPctA >= hpPctB ? 'A' : 'B'

  log.push({ t: 'end', winner, rounds: round, hpPctA, hpPctB })
  return { winner, rounds: round, log }
}
