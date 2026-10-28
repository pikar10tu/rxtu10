// ซิมดันหินสกิล v2 — แยก "ทีมมีเทค" vs "ทีมไม่มีเทค" · สกิล Lv.1 (ตอนนี้) vs MAX
// node bosssim2.mjs <hammer|doom|shield> [cfgJSON] [skillLv=1]
// เทค = ตัวแก้ทางของบอส · ทีมมีเทค: ใส่ตัวเทคที่ขาดให้ (ขั้น 3) แล้วบังคับมี ≥1 ตัว · ทีมไม่มีเทค: ตัดตัวเทคออกจากคลัง
import fs from 'fs'
import { simulateBoss } from './bossEngine.mjs'
import { getPetDef } from 'file:///D:/RXTU/rxtu10-v2/src/data/index.js'

const users = JSON.parse(fs.readFileSync(new URL('./teams.json', import.meta.url), 'utf8'))
// ✊ ค้อน · ✌️ โรคร้าย · ✋ โล่ (user 28 ต.ค.: โล่=กระดาษ โรค=กรรไกร)
const KINDS = { hammer: 'fist', doom: 'scissors', shield: 'paper' }
const TECH0 = { hammer: ['robot'], doom: ['comet', 'unicorn', 'butterfly'], shield: ['rabbit', 'cerberus', 'dragon'] }
const TECH = { ...TECH0, ...(process.env.TECH ? { [process.argv[2]]: process.env.TECH.split(',') } : {}) }
const DEF = {
  hammer: { 1: { hpMul: 4, atkMul: 0.6, every: 4 }, 2: { hpMul: 6, atkMul: 0.9, every: 3 }, 3: { hpMul: 6.5, atkMul: 1.0, every: 3 }, smashHits: 5, smashPer: 0.9, allow: [] },
  doom:   { 1: { hpMul: 4, atkMul: 0.6 }, 2: { hpMul: 7, atkMul: 0.85, doomEvery: 2 }, 3: { hpMul: 6, atkMul: 0.75 }, allow: [] },
  shield: { 1: { hpMul: 3, atkMul: 0.6, shield: 8 }, 2: { hpMul: 4, atkMul: 0.85, shield: 25 }, 3: { hpMul: 4.5, atkMul: 0.85, shield: 40, grow: 0.03 }, allow: ['spark'] },
}
const kind = process.argv[2]
const over = process.argv[3] ? JSON.parse(process.argv[3]) : {}
const SK = Number(process.argv[4]) || 1
const R = 16
const RANK = { common: 0, rare: 1, epic: 2, legendary: 3 }

const bossTeam = (T) => {
  const out = [{ id: 'boss', rarity: 'legendary', element: KINDS[kind], grade: 3 }]
  if (kind === 'shield' && T === 3) out.push({ id: 'minion', rarity: 'common', element: 'paper', grade: 0 }, { id: 'minion', rarity: 'common', element: 'paper', grade: 0 })
  return out
}
const cfgOf = (T) => ({ kind, tier: T, smashMult: 3, smashHits: DEF[kind].smashHits, splash: false, smashPer: DEF[kind].smashPer, allow: DEF[kind].allow, ...DEF[kind][T], ...(over.all || {}), ...(over[T] || {}) })
const run = (team, T, seed) => simulateBoss(team.map(x => ({ ...x, passiveLv: SK })), bossTeam(T), seed, { boss: cfgOf(T) })

function pool(u, withTech) {
  const seen = new Map()
  for (const p of u.pets || []) {
    const id = p.id || p.species; const d = getPetDef(id); if (!d) continue
    if (!withTech && TECH[kind].includes(id)) continue
    const x = { id, rarity: p.rarity || d.rarity, element: d.element, grade: p.grade || 0 }
    const prev = seen.get(id); if (!prev || x.grade > prev.grade) seen.set(id, x)
  }
  let list = [...seen.values()].sort((a, b) => (RANK[b.rarity] - RANK[a.rarity]) || (b.grade - a.grade)).slice(0, 11)
  if (withTech) for (const id of TECH[kind]) if (!list.some(x => x.id === id)) { const d = getPetDef(id); const own = seen.get(id); list.push(own || { id, rarity: d.rarity, element: d.element, grade: Math.max(3, ...list.map(x => x.grade)) }) }
  return list
}
function combos(list, needTech) {
  const out = []
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) for (let k = j + 1; k < list.length; k++) {
    const t = [list[i], list[j], list[k]]
    if (needTech && !t.some(x => TECH[kind].includes(x.id))) continue
    const e = t.findIndex(x => x.id === 'earth'); if (e >= 0) { const [ea] = t.splice(e, 1); t.push(ea) }
    const h = t.findIndex(x => x.id === 'hamster'); if (h > 0) { const [ha] = t.splice(h, 1); t.unshift(ha) }
    out.push(t)
  }
  return out
}
const score = (team, T) => { let w = 0, hp = 0; for (let s = 0; s < 2; s++) { const r = run(team, T, 1000 + s * 7919); if (r.win) w++; hp += r.bossHpPct } return w * 10 - hp / 2 }
const rate = (team, T) => { let w = 0, rd = 0; for (let s = 0; s < R; s++) { const r = run(team, T, s * 104729 + 7); if (r.win) { w++; rd += r.rounds } } return { w: w / R, rd: w ? rd / w : 0 } }

const out = { tech: [], none: [] }
const freq = {}
for (const u of users) {
  for (const mode of ['tech', 'none']) {
    const cs = combos(pool(u, mode === 'tech'), mode === 'tech'); if (!cs.length) continue
    const r = [1, 2, 3].map(T => {
      let b = null, bs = -1e9; for (const t of cs) { const s = score(t, T); if (s > bs) { bs = s; b = t } }
      if (mode === 'tech' && T === 3) for (const x of b) freq[x.id] = (freq[x.id] || 0) + 1
      const rr = rate(b, T)
      if (process.env.SHOW && mode === 'none' && T === 2 && rr.w >= 0.5) console.log('  ไม่มีเทคผ่านยาก:', b.map(x => x.id + x.grade).join(' '), rr.w)
      return rr
    })
    out[mode].push({ tb: u.towerBest || 0, r })
  }
}
const line = (rows) => [0, 1, 2].map(i => `${rows.filter(r => r.r[i].w >= 0.5).length}`).join(' / ')
const top = (rows) => rows.filter(r => r.tb >= 60)
const avg = (rows) => [0, 1, 2].map(i => Math.round(rows.reduce((s, r) => s + r.r[i].w, 0) / (rows.length || 1) * 100) + '%').join(' · ')
const rds = (rows) => [0, 1, 2].map(i => { const g = rows.filter(r => r.r[i].w > 0); return g.length ? (g.reduce((s, r) => s + r.r[i].rd, 0) / g.length).toFixed(1) : '-' }).join('/')
console.log(`${kind} skill${SK} | มีเทค ผ่าน ${line(out.tech)} (60+: ${avg(top(out.tech))}) รอบ ${rds(out.tech)} | ไม่มีเทค ผ่าน ${line(out.none)} (60+: ${avg(top(out.none))}) | ฝันร้ายเลือก: ${Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => k + v).join(' ')}`)
