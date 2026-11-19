// ตรวจตำแหน่งของในมือ + ปีก: เรนเดอร์ทุกชิ้นช่อง i และ w บนตัวฐาน
import { render } from '../../../src/utils/dollRender.js'
import { PARTS } from '../../../src/data/dollParts.js'
import { writeFileSync } from 'node:fs'
const base = { s: 's2', c: 'c1', h: 'h1', e: 'e1', m: 'm1', t: 't1', b: 'b1', k: 'k1' }
const ps = PARTS.filter(p => p.slot === 'i' || p.slot === 'w')
writeFileSync(new URL('./items.json', import.meta.url), JSON.stringify(ps.map(p => ({ id: p.id, label: p.label, px: render({ ...base, [p.slot]: p.id }).px }))))
console.log(ps.map(p => p.id).join(' '))
