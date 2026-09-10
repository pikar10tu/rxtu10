// วัด "ป้ายสถานะต่อการ์ด" ด้วยทีมสุ่มจากคลังเต็ม — ใช้ตัดสินเพดาน STATUS_MAX และลำดับความสำคัญ
// รัน: node scripts/badge-load-sim.mjs [จำนวนคู่]   (ดีฟอลต์ 5000)
// สเปก: docs/superpowers/specs/2026-09-10-passive-v2-p3-design.md §7.2
import { PETS } from '../src/data/index.js'
import { buffSources } from '../src/utils/battleBuffs.js'
import { BATTLE_SLOTS } from '../src/data/residence.js'

const N = Number(process.argv[2] || 5000)
let seed = 20260911
const rand = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff
const pick = () => PETS[Math.floor(rand() * PETS.length)]
const team = () => Array.from({ length: BATTLE_SLOTS }, () => {
  const d = pick()
  return { id: d.id, rarity: d.rarity, element: d.element, grade: Math.floor(rand() * 6) }
})

const hist = new Map()
const effHist = new Map()
let total = 0, sum = 0, max = 0
for (let i = 0; i < N; i++) {
  const src = buffSources(team(), team())
  for (const list of Object.values(src)) {
    // ป้ายบนการ์ดตัดที่มาทิ้งและห้าม effect ซ้ำ (badgesOf) ⇒ นับ effect ที่ "ไม่ซ้ำและมีไอคอน"
    const uniq = new Set(list.filter(b => b.icon).map(b => b.effect))
    const n = uniq.size
    hist.set(n, (hist.get(n) || 0) + 1)
    for (const e of uniq) effHist.set(e, (effHist.get(e) || 0) + 1)
    total++; sum += n; max = Math.max(max, n)
  }
}
console.log(`ทีมสุ่ม ${N} คู่ · การ์ด ${total} ใบ · เฉลี่ย ${(sum / total).toFixed(2)} ป้าย/ใบ · สูงสุด ${max}`)
for (const n of [...hist.keys()].sort((a, b) => a - b)) {
  const c = hist.get(n)
  console.log(`  ${n} ป้าย: ${(c / total * 100).toFixed(1)}%`)
}
for (const cap of [3, 4, 5, 6]) {
  let over = 0
  for (const [n, c] of hist) if (n > cap) over += c
  console.log(`เพดาน ${cap} → การ์ดที่ถูกตัดป้ายทิ้ง ${(over / total * 100).toFixed(1)}%`)
}
console.log('ความถี่ของแต่ละป้าย (% ของการ์ด):')
for (const [e, c] of [...effHist.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${e.padEnd(22)} ${(c / total * 100).toFixed(1)}%`)
}
