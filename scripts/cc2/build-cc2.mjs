// สร้างไฟล์ CC2 ที่เว็บใช้ จากแหล่งจริง content/cc2/cases/*.json (1 ไฟล์/เคส)
// เพิ่มเคส = วางไฟล์ใหม่ · ปิดชั่วคราว = "active": false · ลบ = ลบไฟล์ — แล้ว build ใหม่ (รันเองใน prebuild/predev)
// เอาต์พุต (generated, ไม่ commit): public/cc2/index.json (รายการเบา) + public/cc2/cases/<id>.json (โหลดตอนเปิดเคส)
// HTML ไป v-html → กรองแท็ก/แอตทริบิวต์แบบ allowlist ที่นี่ (CLAUDE.md กับดักข้อ 8)
import fs from 'node:fs'
import path from 'node:path'
import { validateCase, parseBlanks, sanitizeHtml } from '../../src/utils/cc2Case.js'

const SRC = 'content/cc2/cases'
const OUT = 'public/cc2'

const files = fs.readdirSync(SRC).filter(f => f.endsWith('.json')).sort()
const index = []
const errors = []
fs.rmSync(path.join(OUT, 'cases'), { recursive: true, force: true })
fs.mkdirSync(path.join(OUT, 'cases'), { recursive: true })

for (const f of files) {
  const c = JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'))
  const errs = validateCase(c, f)
  if (errs.length) { errors.push(...errs); continue }
  if (!c.active) continue
  for (const k of ['patientHtml', 'contentHtml', 'equipmentHtml', 'noteHtml']) c[k] = sanitizeHtml(c[k])
  c.checklist = c.checklist.map(k => ({ ...k, html: k.html && sanitizeHtml(k.html), img: k.img && sanitizeHtml(k.img) }))
  // base='./' + hash router → พาธรูปต้อง relative (เว็บหลักอยู่ใต้ /rxtu10/)
  for (const k of ['patientHtml', 'contentHtml', 'equipmentHtml', 'noteHtml']) c[k] = c[k].replaceAll('src="/cc2/', 'src="cc2/')
  c.checklist = c.checklist.map(k => ({ ...k, html: k.html?.replaceAll('src="/cc2/', 'src="cc2/'), img: k.img?.replaceAll('src="/cc2/', 'src="cc2/') }))
  c.blanks = parseBlanks(c.scenario)
  const tot = c.checklist.reduce((a, k) => a + (+k.s || 0), 0) + c.blanks.reduce((a, b) => a + b.score, 0)
  fs.writeFileSync(path.join(OUT, 'cases', c.id + '.json'), JSON.stringify(c))
  index.push({ id: c.id, title: c.title, cat: c.cat, group: c.group, topic: c.topic, diff: c.diff, source: c.source, tot, mode: c.rest ? 'rest' : c.noScore ? 'free' : c.blanks.length ? 'blank' : 'check', next: c.next || undefined })
}
if (errors.length) { console.error('❌ CC2 content ผิดรูปแบบ:\n' + errors.join('\n')); process.exit(1) }
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify({ v: Date.now(), cases: index }))
console.log(`✅ CC2: ${index.length} เคสเปิดใช้ (จาก ${files.length} ไฟล์)`)
