// ดัชนีค้นหารวม → public/search-index.json (generated, ไม่ commit) · รันใน predev/prebuild หลัง build-cc2
// แหล่ง: src/data/drugDb.json + data/drugAka.js · content/cc2/cases · content/summaries/manifest.json
// ลิงก์ยา↔เคส CC2 คำนวณที่นี่: drug.cases[] (ใช้ในการ์ดยา) + public/cc2/drug-links.json (caseId → drugIds สำหรับชิปในเคส)
import fs from 'node:fs'
import { drugTerms, drugsInText } from '../src/utils/searchIndex.js'
import { DRUG_AKA } from '../src/data/drugAka.js'

const read = f => JSON.parse(fs.readFileSync(f, 'utf8'))
const strip = h => String(h ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ')

const db = read('src/data/drugDb.json')
const drugs = db.map(d => ({ id: d.id, n: d.name, cls: d.cls || '', g: d.group || '', terms: drugTerms(d, DRUG_AKA[d.id]), cases: [] }))

const dir = 'content/cc2/cases'
const cases = []
const links = {}
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
  const c = read(`${dir}/${f}`)
  if (!c.active) continue
  const text = [c.title, c.topic, c.scenario, strip(c.patientHtml), strip(c.contentHtml), strip(c.equipmentHtml), ...c.checklist.map(k => k.t)].join(' \n ')
  const ids = drugsInText(text, drugs)
  if (ids.length) links[c.id] = ids
  for (const id of ids) drugs.find(d => d.id === id).cases.push(c.id)
  cases.push({ id: c.id, t: c.title, cat: c.cat, g: c.group, topic: c.topic })
}

const sums = read('content/summaries/manifest.json').map(s => ({ id: s.id, t: s.t, g: s.g }))

fs.mkdirSync('public/cc2', { recursive: true })
fs.writeFileSync('public/search-index.json', JSON.stringify({ v: Date.now(), drugs, cases, sums }))
fs.writeFileSync('public/cc2/drug-links.json', JSON.stringify(links))
const linked = drugs.filter(d => d.cases.length).length
console.log(`✅ ค้นหารวม: ยา ${drugs.length} (มีเคส CC2 ${linked}) · เคส ${cases.length} (มียา ${Object.keys(links).length}) · สรุป ${sums.length}`)
