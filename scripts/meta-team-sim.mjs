// meta-team-sim — หา "ทีมเมต้า" จากการจัดทีมจริง 3 ช่อง (ระดับจริง · เกรดเท่ากันหมด)
//
// 🔑 ต่างจาก passive-power-sim / passive-vs-passive-sim ที่วัดพาสสีฟทีละตัวกับเพื่อนเปล่า
//    อันนี้ใส่พาสสีฟครบทั้งทีม ⇒ เห็นคอมโบ (ออร่าซ้อน · สิงโตครบ 3 สาย · ซอลกับ common · แบดเจอร์เจอตัวใหญ่)
//
// ขั้น 1: ทุกทีมที่เป็นไปได้ (เพ็ทไม่ซ้ำ species) ปะทะ "สนามสุ่ม" ชุดเดียวกัน POOL ทีม × 2 ข้าง
//         ⇒ คะแนน = ชนะเฉลี่ยกับทีมทั่วไป (ไม่ใช่กับเมต้า)
// ขั้น 2: TOP ทีมแรกจากขั้น 1 ปะทะกันเองครบทุกคู่ ⇒ ใครรอดในหมู่ทีมเก่ง
// สรุป: เพ็ทที่โผล่ในทีมท็อปบ่อย = แรงเกิน · ไม่เคยโผล่เลย = อ่อนเกิน · ทีมท็อปหน้าตาต่างกันแค่ไหน = ความหลากหลาย
//
// รัน: node scripts/meta-team-sim.mjs [POOL=150] [TOP=120] [ไฟต์ต่อคู่ต่อข้างในขั้น2=10]
import { simulateBattle } from '../src/utils/battleEngine.js'
import { PETS } from '../src/data/index.js'
import { BATTLE_SLOTS } from '../src/data/residence.js'

const POOL = Number(process.argv[2]) || 150
const TOP = Number(process.argv[3]) || 120
const N2 = Number(process.argv[4]) || 10
const GRADE = 3

// PRNG คงที่ ⇒ รันซ้ำได้ผลเดิม
let s0 = 12345
const rnd = () => ((s0 = (s0 * 1103515245 + 12345) >>> 0) / 4294967296)

const unit = (p) => ({ id: p.id, rarity: p.rarity, element: p.element, grade: GRADE })
const combos = []
const n = PETS.length
if (BATTLE_SLOTS !== 3) throw new Error('สคริปต์นี้สมมุติทีม 3 ช่อง')
// 🌍 เอิร์ธได้ฤดูตามช่อง (ช่อง 1 ☀️ · 2 🌧️ · 3 ❄️) ⇒ ทีมที่มีเอิร์ธลองครบ 3 ช่อง แยกเป็นคนละทีม
//    ขั้น 1 เก็บช่องที่ดีสุดของแต่ละชุดไว้ตัวเดียว (ผู้เล่นเลือกช่องเองได้)
const EARTH = PETS.findIndex(p => p.id === 'earth')
for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) {
  const c = [i, j, k]
  const H = PETS.findIndex(p => p.id === 'hamster')
  if (c.includes(H) && !c.includes(EARTH)) { combos.push(c); combos.push([H, ...c.filter(x => x !== H)]); continue }
  if (!c.includes(EARTH)) { combos.push(c); continue }
  const rest = c.filter(x => x !== EARTH)
  for (let at = 0; at < 3; at++) { const v = rest.slice(); v.splice(at, 0, EARTH); combos.push(v) }
}
const teamOf = (c) => c.map(i => unit(PETS[i]))
const nameOf = (c) => c.map(i => PETS[i].id).join('+')

const pool = Array.from({ length: POOL }, () => combos[Math.floor(rnd() * combos.length)])
const fight = (A, B, seed) => {
  let w = 0
  if (simulateBattle(A, B, seed).winner === 'A') w++
  if (simulateBattle(B, A, seed).winner === 'B') w++   // สลับข้าง
  return w
}

console.error(`ขั้น 1: ${combos.length} ทีม × ${POOL} คู่ × 2 = ${(combos.length * POOL * 2 / 1e6).toFixed(1)}M ไฟต์`)
const t0 = Date.now()
const s1 = combos.map((c, ci) => {
  if (ci % 1000 === 0) console.error(`  ${ci}/${combos.length} · ${((Date.now() - t0) / 1000).toFixed(0)}s`)
  const A = teamOf(c)
  let w = 0
  pool.forEach((o, oi) => { w += fight(A, teamOf(o), (oi + 1) * 2654435761) })
  return { c, wr: w / (POOL * 2) * 100 }
})
// ชุดเดียวกันที่ต่างแค่ช่องเอิร์ธ — เก็บตัวที่ดีสุด
{
  const best = new Map()
  for (const t of s1) { const key = t.c.slice().sort((a, b) => a - b).join(','); if (!best.has(key) || best.get(key).wr < t.wr) best.set(key, t) }
  s1.length = 0; s1.push(...best.values())
}
s1.sort((a, b) => b.wr - a.wr)

const top = s1.slice(0, TOP)
console.error(`ขั้น 2: ${TOP} ทีมปะทะกันเอง`)
const W = top.map(() => 0)
for (let i = 0; i < TOP; i++) for (let j = i + 1; j < TOP; j++) {
  const A = teamOf(top[i].c), B = teamOf(top[j].c)
  for (let s = 1; s <= N2; s++) { const w = fight(A, B, s * 2654435761); W[i] += w; W[j] += 2 - w }
}
top.forEach((t, i) => { t.rr = W[i] / ((TOP - 1) * N2 * 2) * 100 })
const final = top.slice().sort((a, b) => b.rr - a.rr)

const pad = (s, w) => String(s) + ' '.repeat(Math.max(0, w - [...String(s)].length))
console.log(`\n═══ ทีมเมต้า · ${BATTLE_SLOTS}v${BATTLE_SLOTS} · เกรด ${GRADE} · ระดับจริง ═══`)
console.log('\n── 25 ทีมแรก (เรียงตามขั้น 2 = ชนะกันเองในหมู่ทีมเก่ง) ──')
console.log(pad('ทีม', 34) + pad('vsทั่วไป%', 11) + 'vsเมต้า%')
for (const t of final.slice(0, 25)) console.log(pad(nameOf(t.c), 34) + pad(t.wr.toFixed(1), 11) + t.rr.toFixed(1))

// เพ็ทแต่ละตัว: โผล่ในทีมท็อปกี่ทีม + คะแนนเฉลี่ยของ "ทุกทีมที่มีมัน" (ตัดผลเพื่อนร่วมทีมด้วยการเฉลี่ย)
const inTop = (k) => PETS.map((_, pi) => final.slice(0, k).filter(t => t.c.includes(pi)).length)
const top30 = inTop(30), topAll = inTop(TOP)
const avg = PETS.map((_, pi) => { const r = s1.filter(t => t.c.includes(pi)); return r.reduce((a, t) => a + t.wr, 0) / r.length })
console.log(`\n── เพ็ทแต่ละตัว ──`)
console.log(pad('เพ็ท', 12) + pad('ระดับ', 11) + pad('สาย', 10) + pad('ทีมที่มี%', 11) + pad(`ท็อป30`, 8) + `ท็อป${TOP}`)
const order = PETS.map((p, i) => i).sort((a, b) => avg[b] - avg[a])
for (const i of order) {
  const p = PETS[i]
  console.log(pad(p.id, 12) + pad(p.rarity, 11) + pad(p.element, 10) + pad(avg[i].toFixed(1), 11) + pad(top30[i], 8) + topAll[i])
}
// ความหลากหลาย: ใน 30 ทีมแรกมีเพ็ทกี่ species · ตัวที่โผล่บ่อยสุดครองกี่ %
const used = top30.filter(x => x > 0).length
console.log(`\nความหลากหลาย: 30 ทีมแรกใช้ ${used}/${PETS.length} species · ตัวที่บ่อยสุดอยู่ใน ${Math.max(...top30)}/30 ทีม`)
console.log('\nJSON:')
console.log(JSON.stringify({ top: final.slice(0, 30).map(t => ({ t: nameOf(t.c), wr: +t.wr.toFixed(1), rr: +t.rr.toFixed(1) })),
  pets: order.map(i => ({ id: PETS[i].id, avg: +avg[i].toFixed(1), top30: top30[i], top: topAll[i] })) }))
