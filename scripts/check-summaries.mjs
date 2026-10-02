// ตรวจไฟล์สรุป src/data/summaries/*.js เทียบกับ manifest + รูปใน public/summaries
// node scripts/check-summaries.mjs          → รายงาน
// node scripts/check-summaries.mjs --prune  → ลบรูปที่ไม่มีสรุปไหนอ้างถึง
import { readdirSync, readFileSync, existsSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const manifest = JSON.parse(readFileSync(join(root, 'content/summaries/manifest.json'), 'utf8'))
const dir = join(root, 'src/data/summaries')
const figDir = join(root, 'public/summaries')
const prune = process.argv.includes('--prune')
let bad = 0
const used = new Set()

for (const f of readdirSync(dir).filter(f => f.endsWith('.js'))) {
  const id = f.slice(0, -3)
  const m = manifest.find(x => x.id === id)
  const d = (await import(pathToFileURL(join(dir, f)).href)).default
  const err = msg => { bad++; console.log(`✗ ${id}: ${msg}`) }
  if (!m) err('ไม่มีใน manifest')
  if (d.id !== id) err(`id ไม่ตรงชื่อไฟล์ (${d.id})`)
  const secIds = new Set()
  for (const s of d.sections) {
    if (secIds.has(s.id)) err(`section id ซ้ำ ${s.id}`)
    secIds.add(s.id)
    for (const [, fig] of s.html.matchAll(/data-fig="([^"]+)"/g)) {
      used.add(fig)
      if (!existsSync(join(figDir, fig))) err(`ไม่มีรูป ${fig}`)
    }
    const open = (s.html.match(/<(table|ul|ol|div|figure)\b/g) || []).length
    const close = (s.html.match(/<\/(table|ul|ol|div|figure)>/g) || []).length
    if (open !== close) err(`แท็กเปิด/ปิดไม่เท่ากันใน ${s.id} (${open}/${close})`)
  }
  ;(d.questions || []).forEach((q, i) => {
    if (!(q.a >= 0 && q.a < q.o.length)) err(`ข้อ ${i + 1} เฉลยเกินตัวเลือก`)
  })
  console.log(`✓ ${id.padEnd(20)} ${d.sections.length} ส่วน · ${(d.questions || []).length} ข้อ`)
}

if (existsSync(figDir)) {
  for (const id of readdirSync(figDir)) {
    for (const f of readdirSync(join(figDir, id))) {
      const key = `${id}/${f}`
      if (used.has(key)) continue
      if (prune) { unlinkSync(join(figDir, id, f)); console.log(`ลบรูปที่ไม่ใช้ ${key}`) }
      else console.log(`· รูปไม่ได้ใช้ ${key}`)
    }
  }
}
const done = readdirSync(dir).filter(f => f.endsWith('.js')).length
console.log(`\nแปลงแล้ว ${done}/${manifest.length} เรื่อง${bad ? ` · ปัญหา ${bad} จุด` : ''}`)
process.exit(bad ? 1 : 0)
