// 🎨 รวมงานใน art-dept/inbox/parts → src/data/dollInbox.local.js ให้ห้องแต่งตัวตอน npm run dev แสดงของใหม่ (20 พ.ย. 2026)
// node scripts/art-inbox.mjs [ไฟล์...]   ไม่ใส่ = ทุกไฟล์ใน inbox/parts (ไฟล์ -v2 ทับของรุ่นก่อนตามลำดับชื่อ)
// node scripts/art-inbox.mjs --off       ลบไฟล์พรีวิว กลับเป็นของจริง
import fs from 'node:fs'
import path from 'node:path'
const OUT = 'src/data/dollInbox.local.js'
const DIR = 'D:/RXTU/art-dept/inbox/parts'
const args = process.argv.slice(2)
if (args[0] === '--off') { fs.rmSync(OUT, { force: true }); console.log('ปิดพรีวิวแล้ว'); process.exit(0) }
const files = args.length ? args : fs.readdirSync(DIR).filter(f => f.endsWith('.js')).sort().map(f => path.join(DIR, f))
const I = (id, slot, theme, label, d) => ({ id, slot, theme, label, ...d })
const R = (x, y, w, h, c) => ['r', x, y, w, h, c], P = (x, y, s) => ['p', x, y, s]
const parts = {}; let base = null
for (const f of files) {
  let src = fs.readFileSync(f, 'utf8')
  if (/export const BASE/.test(src)) { base = new Function('I', 'R', 'P', src.replace('export const BASE =', 'return'))(I, R, P).m; continue }
  for (const p of new Function('I', 'R', 'P', src.replace('export default', 'return'))(I, R, P)) {
    const { id, slot, theme, label, ...draw } = p   // ชื่อ/ราคาคงของเดิม เอาแค่ส่วนวาด
    parts[id] = draw
  }
}
fs.writeFileSync(OUT, '// สร้างโดย scripts/art-inbox.mjs — ห้ามแก้มือ ห้าม commit\nexport default ' + JSON.stringify({ parts, base }) + '\n')
console.log('พรีวิว', Object.keys(parts).join(' '), base ? '+ ตัวฐาน' : '')
