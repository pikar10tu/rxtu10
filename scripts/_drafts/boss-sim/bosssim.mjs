// ซิมดันหินสกิล 3 บอส × 3 ระดับ กับทีมจริงของรุ่น (snapshot 25 ต.ค.)
// node bosssim.mjs [kind] [cfgJSON]
import fs from 'fs'
import { simulateBoss } from './bossEngine.mjs'
import { getPetDef } from 'file:///D:/RXTU/rxtu10-v2/src/data/index.js'
import { resolveBattleTeam } from 'file:///D:/RXTU/rxtu10-v2/src/utils/petTeam.js'

const users = JSON.parse(fs.readFileSync(new URL('./teams.json', import.meta.url), 'utf8'))
const KINDS = { hammer: 'fist', doom: 'paper', shield: 'scissors' }
const DEF = {
  // hpMul/atkMul คูณจากค่าฐานตำนานขั้น 3 (atk 25.5 · hp 90)
  hammer: { 1: { hpMul: 6, atkMul: 0.8 }, 2: { hpMul: 10, atkMul: 1.1 }, 3: { hpMul: 14, atkMul: 1.2 }, smashMult: 3 },
  doom:   { 1: { hpMul: 6, atkMul: 0.8 }, 2: { hpMul: 10, atkMul: 1.1 }, 3: { hpMul: 14, atkMul: 1.2 } },
  shield: { 1: { hpMul: 6, atkMul: 0.8 }, 2: { hpMul: 10, atkMul: 1.1 }, 3: { hpMul: 14, atkMul: 1.2 } },
}
const kinds = process.argv[2] ? [process.argv[2]] : Object.keys(KINDS)
const over = process.argv[3] ? JSON.parse(process.argv[3]) : {}
const R = 20
const RANK = { common: 0, rare: 1, epic: 2, legendary: 3 }

const bossTeam = (kind, T) => {
  const b = { id: 'boss', rarity: 'legendary', element: KINDS[kind], grade: 3 }
  const out = [b]
  if (kind === 'shield' && T === 3) out.push({ id: 'minion', rarity: 'common', element: 'scissors', grade: 0 }, { id: 'minion', rarity: 'common', element: 'scissors', grade: 0 })
  return out
}
const cfgOf = (kind, T) => ({ kind, tier: T, smashMult: 3, ...DEF[kind][T], ...(DEF[kind].smashMult ? { smashMult: DEF[kind].smashMult } : {}), ...(over[T] || {}) })
const run = (team, kind, T, seed) => simulateBoss(team, bossTeam(kind, T), seed, { boss: cfgOf(kind, T) })

function owned(u) {
  const seen = new Map()
  for (const p of u.pets || []) {
    const id = p.id || p.species; const d = getPetDef(id); if (!d) continue
    const x = { id, rarity: p.rarity || d.rarity, element: d.element, grade: p.grade || 0 }
    const prev = seen.get(id)
    if (!prev || x.grade > prev.grade) seen.set(id, x)
  }
  return [...seen.values()].sort((a, b) => (RANK[b.rarity] - RANK[a.rarity]) || (b.grade - a.grade)).slice(0, 12)
}
function combos(list) {
  const out = []
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) for (let k = j + 1; k < list.length; k++) {
    let t = [list[i], list[j], list[k]]
    const e = t.findIndex(x => x.id === 'earth'); if (e >= 0) { const [ea] = t.splice(e, 1); t.push(ea) }   // เอิร์ธช่อง 3 (แช่แข็ง)
    const h = t.findIndex(x => x.id === 'hamster'); if (h > 0) { const [ha] = t.splice(h, 1); t.unshift(ha) }
    out.push(t)
  }
  return out
}
const score = (team, kind, T, n) => { let w = 0, hp = 0; for (let s = 0; s < n; s++) { const r = run(team, kind, T, 1000 + s * 7919); if (r.win) w++; hp += r.bossHpPct } return w * 10 - hp / n }

for (const kind of kinds) {
  const rows = []
  for (const u of users) {
    const pool = owned(u); if (pool.length < 3) continue
    let best = null, bs = -1e9
    for (const t of combos(pool)) { const s = score(t, kind, 2, 2); if (s > bs) { bs = s; best = t } }
    const active = resolveBattleTeam(u.activePets, u.pets)
    const rate = (team) => [1, 2, 3].map(T => { let w = 0, rd = 0; for (let s = 0; s < R; s++) { const r = run(team, kind, T, s * 104729 + 7); if (r.win) { w++; rd += r.rounds } } return { w: w / R, rd: w ? rd / w : 0 } })
    rows.push({ tb: u.towerBest || 0, best: best.map(x => x.id), r: rate(best), a: active.length === 3 ? rate(active) : null })
  }
  const bands = [[0, 9], [10, 29], [30, 59], [60, 999]]
  console.log(`\n=== ${kind} === (${rows.length} คน · ทีมที่ดีที่สุดจากคลังตัวเอง)`)
  for (const [a, b] of bands) {
    const g = rows.filter(r => r.tb >= a && r.tb <= b); if (!g.length) continue
    const line = [0, 1, 2].map(i => `${Math.round(g.reduce((s, r) => s + r.r[i].w, 0) / g.length * 100)}%(${g.filter(r => r.r[i].w >= 0.5).length})`)
    console.log(`หอคอย ${a}-${b} (${g.length}): ` + line.join(' · '))
  }
  const all = [0, 1, 2].map(i => rows.filter(r => r.r[i].w >= 0.5).length)
  const rds = [0, 1, 2].map(i => { const g = rows.filter(r => r.r[i].w > 0); return g.length ? (g.reduce((s, r) => s + r.r[i].rd, 0) / g.length).toFixed(1) : '-' })
  console.log(`ผ่าน≥50%: ${all.join(' / ')} จาก ${rows.length} · รอบเฉลี่ยตอนชนะ ${rds.join(' / ')}`)
  const ar = rows.filter(r => r.a); console.log(`(ทีมที่ตั้งไว้ปัจจุบัน ผ่าน≥50%: ${[0, 1, 2].map(i => ar.filter(r => r.a[i].w >= 0.5).length).join(' / ')} จาก ${ar.length})`)
  const freq = {}; for (const r of rows) for (const id of r.best) freq[id] = (freq[id] || 0) + 1
  console.log('ตัวที่ถูกเลือกบ่อย:', Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${k}${v}`).join(' '))
}
