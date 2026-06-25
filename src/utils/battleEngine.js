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

  const countAlive = (t) => t.reduce((n, f) => n + (f.hp > 0 ? 1 : 0), 0)
  // หาตัวออกตี: ไล่จาก cursor ไปขวา วนกลับมาซ้าย เจอตัวแรกที่ยังไม่ตาย (-1 = ไม่มี)
  const nextAttacker = (team, cursor) => {
    const n = team.length
    for (let k = 0; k < n; k++) { const i = (cursor + k) % n; if (team[i].hp > 0) return i }
    return -1
  }

  // ใครก่อน: ฝั่งตัวเยอะกว่าตีก่อน · เท่ากัน → สุ่ม (ดึงจาก rand เดิม คง deterministic)
  const ca = countAlive(A), cb = countAlive(B)
  const first = ca > cb ? 'A' : cb > ca ? 'B' : (rand() < 0.5 ? 'A' : 'B')
  const cursor = { A: 0, B: 0 }
  let cur = first, round = 0, turns = 0

  while (alive(A).length && alive(B).length && turns < BATTLE_CFG.maxTurns) {
    if (cur === first) { round++; log.push({ t: 'round', n: round }) }   // ต้น cycle ใหม่
    const team = cur === 'A' ? A : B
    const foes = cur === 'A' ? B : A
    const ai = nextAttacker(team, cursor[cur])
    if (ai !== -1) { hit(team[ai], foes); cursor[cur] = (ai + 1) % team.length }
    turns++
    cur = cur === 'A' ? 'B' : 'A'   // สลับฝั่งเสมอ
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
