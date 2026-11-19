// ✅ เอางานแผนกอาร์ตที่ user ผ่านแล้ว (art-dept/inbox/APPROVED.md) เข้าเว็บ (20 พ.ย. 2026)
// node scripts/art-approve.mjs [--dry]
//  · ชิ้นเดิมที่วาดใหม่ → src/data/dollEdits.js (รูปแบบเดียวกับ editor · ทับของเดิม)
//  · ชิ้นใหม่ (id ยังไม่มี) → src/data/dollPartsArt.js (แคตตาล็อกเพิ่ม · ไฟล์สร้างอัตโนมัติ ห้ามแก้มือ)
import fs from 'node:fs'
import path from 'node:path'
const ART = 'D:/RXTU/art-dept/inbox'
const dry = process.argv.includes('--dry')
const I = (id, slot, theme, label, d) => ({ id, slot, theme, label, ...d })
const R = (x, y, w, h, c) => ['r', x, y, w, h, c], P = (x, y, s) => ['p', x, y, s]
const load = (f) => new Function('I', 'R', 'P', fs.readFileSync(path.join(ART, 'parts', f), 'utf8').replace('export default', 'return'))(I, R, P)

const { PART } = await import('../src/data/dollParts.js')
const edits = (await import('../src/data/dollEdits.js')).default
const artFile = 'src/data/dollPartsArt.js'
const art = fs.existsSync(artFile) ? (await import('../' + artFile)).default : []
const artById = Object.fromEntries(art.map(p => [p.id, p]))

const problems = [], redo = [], added = []
for (const line of fs.readFileSync(path.join(ART, 'APPROVED.md'), 'utf8').split('\n')) {
  const m = line.match(/inbox\/parts\/([\w.-]+\.js)`?\s*:\s*(.+)$/)
  if (!m) continue
  const parts = Object.fromEntries(load(m[1]).map(p => [p.id, p]))
  for (const id of [...m[2].matchAll(/`([a-z]+\d+)`/g)].map(x => x[1])) {
    const p = parts[id]
    if (!p) { problems.push(`${id}: ไม่พบใน ${m[1]}`); continue }
    const { id: _, slot, theme, label, ...draw } = p
    if (PART[id] && !artById[id]) {
      if (PART[id].slot !== slot) { problems.push(`${id}: ช่อง ${slot} ไม่ตรงของเดิม ${PART[id].slot}`); continue }
      edits[id] = { m: null, o: null, back: null, ob: null, st: null, ...draw }
      redo.push(id)
    } else {
      artById[id] = { id, slot, theme, label, ...draw }
      added.push(id)
    }
  }
}
console.log('วาดใหม่', redo.length, redo.join(' '))
console.log('ของใหม่', added.length, added.join(' '))
if (problems.length) console.log(problems.map(p => '⚠️ ' + p).join(String.fromCharCode(10)))
if (dry) process.exit(0)
const head = fs.readFileSync('src/data/dollEdits.js', 'utf8').split('export default')[0]
fs.writeFileSync('src/data/dollEdits.js', head + 'export default {\n' + Object.keys(edits).sort().map(id => `  ${JSON.stringify(id)}: ${JSON.stringify(edits[id])},`).join('\n') + '\n}\n')
fs.writeFileSync(artFile, '// 🎨 ชิ้นใหม่จากแผนกอาร์ต — สร้างโดย scripts/art-approve.mjs ห้ามแก้มือ (ชื่อ/ราคาปรับที่ dollParts.js)\nexport default [\n' + Object.values(artById).map(p => '  ' + JSON.stringify(p) + ',').join('\n') + '\n]\n')
