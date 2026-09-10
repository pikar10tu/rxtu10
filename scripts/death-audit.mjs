// death-audit — ด่านทดแทน battle-differential สำหรับงาน "การตายเงียบ" (สเปก §7.6 ข้อ 1)
//
// battle-differential ใช้ไม่ได้กับเฟสนี้ เพราะการนับการตายให้ครบ "ตั้งใจ" เปลี่ยนผลไฟต์เกือบทุกใบ
// ด่านของเฟสนี้จึงเป็น invariant แทน: **ฝั่งที่แพ้ต้องตายครบทุกตัว และ log ต้องบันทึกการตายทุกใบ**
//
// วิธีตรวจ: ไฟต์ที่จบก่อนหมดเวลา (rounds < maxTurns) ฝั่งแพ้ตายยกทีมเสมอโดยนิยามของ while loop
// ⇒ จำนวนตัวที่ log ทำเครื่องหมาย dead ต้องเท่ากับจำนวนตัวในทีมที่แพ้ ถ้าน้อยกว่า = มีการตายที่ไม่มีใบบันทึก
// (ผู้อ่าน log ทุกตัวจึงมองไม่เห็น — battleSummary.js ให้ตัวนั้น dead:false ค้างอยู่บนหน้าสรุป
//  และ battleBeats.js ไม่เล่นอนิเมชันน็อกให้)
//
// รัน: node scripts/death-audit.mjs [จำนวนไฟต์สุ่ม]
// Exit code: 0 = ไม่มีการตายที่หายไปเลย · 1 = มี
import { simulateBattle } from '../src/utils/battleEngine.js'
import { BATTLE_CFG } from '../src/data/battle.js'
import { PETS } from '../src/data/index.js'
import { BATTLE_SLOTS } from '../src/data/residence.js'
import { PET_PASSIVES } from '../src/data/petPassives.js'

const N = parseInt(process.argv[2] || '400', 10)
const ids = PETS.filter(p => PET_PASSIVES[p.id])
const mk = (p, grade) => ({ id: p.id, rarity: p.rarity, element: p.element, grade })

// สุ่มแบบล็อกซีดเอง เพื่อให้ผลซ้ำได้ทุกครั้ง
let s = 12345
const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff
const team = (grade) => Array.from({ length: BATTLE_SLOTS }, () => mk(ids[Math.floor(rnd() * ids.length)], grade))

/** นับตัวที่ log ทำเครื่องหมายว่าตาย (ตรรกะเดียวกับ battleSummary.js เป๊ะ) */
const deadInLog = (log, side) => {
  const set = new Set()
  for (const e of log) if (e.t === 'attack' && e.dead && String(e.target).startsWith(side)) set.add(e.target)
  return set
}

let checked = 0, bad = 0, missing = 0
const byCause = new Map()

const run = (A, B, seed) => {
  const r = simulateBattle(A, B, seed)
  if (r.rounds >= BATTLE_CFG.maxTurns) return          // หมดเวลา — ฝั่งแพ้ไม่จำเป็นต้องตายครบ
  const loser = r.winner === 'A' ? 'B' : 'A'
  const size = loser === 'A' ? A.length : B.length
  const marked = deadInLog(r.log, loser)
  checked++
  if (marked.size < size) {
    bad++; missing += size - marked.size
    // เดาสาเหตุจากของที่อยู่ใน log ของไฟต์นั้น
    const causes = []
    if (r.log.some(e => e.t === 'passive' && e.effect === 'aoeOpener')) causes.push('aoeOpener')
    if (r.log.some(e => e.t === 'passive' && e.effect === 'thorns')) causes.push('thorns')
    if (r.log.some(e => e.t === 'passive' && e.effect === 'guardian')) causes.push('guardian')
    const k = causes.join('+') || '(ไม่มีพาสสีฟที่ฆ่าเงียบใน log)'
    byCause.set(k, (byCause.get(k) || 0) + 1)
  }
}

for (let i = 0; i < N; i++) run(team(3 + Math.floor(rnd() * 3)), team(3 + Math.floor(rnd() * 3)), 1000 + i)
// คู่ที่พลังต่างกันมาก = เคสที่สเปกบอกว่าชนบ่อยสุด
for (let i = 0; i < N; i++) run(team(5), team(0), 5000 + i)

console.log(`ไฟต์ที่ตรวจได้ (จบก่อนหมดเวลา): ${checked}`)
console.log(`ไฟต์ที่มีการตายหายไปจาก log: ${bad} (${(bad / checked * 100).toFixed(1)}%) · รวม ${missing} ตัว`)
for (const [k, v] of [...byCause].sort((a, b) => b[1] - a[1])) console.log(`   ${k}: ${v} ไฟต์`)
process.exit(bad ? 1 : 0)
