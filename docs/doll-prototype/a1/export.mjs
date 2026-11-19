// เรนเดอร์ชุดตัวอย่างด้วย src/utils/dollRender.js ตัวจริง → JSON ให้ python แปลงเป็น PNG (ใช้ตรวจบน artifact)
import { render } from '../../../src/utils/dollRender.js'
import { OUTFITS } from '../../../src/data/dollParts.js'
import { writeFileSync } from 'node:fs'
const base = { name: 'ตัวฐาน', eq: { s: 's2', c: 'c1', h: 'h1', e: 'e1', m: 'm1', t: 't1', b: 'b1', k: 'k1' } }
const looks = [base, ...OUTFITS]
writeFileSync(new URL('./a1.json', import.meta.url), JSON.stringify(looks.map(o => ({ name: o.name, px: render(o.eq).px }))))
console.log('ok', looks.length)
