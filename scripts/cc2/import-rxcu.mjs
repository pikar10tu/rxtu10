// นำเข้าเคส CC2 OSPE จากไฟล์ offline ของเว็บเพื่อน (RxCU OSPE Hub — ได้รับอนุญาตแล้ว 11 พ.ย. 2026)
// → content/cc2/cases/<id>.json (1 ไฟล์/เคส = แหล่งจริง แก้/เพิ่ม/ลบได้ภายหลัง) + public/cc2/img/*.webp
// อ่านด้วย JSON.parse เท่านั้น ห้าม eval โค้ดเขา · ข้ามเคสเข้ารหัส · รันซ้ำได้: รหัสเดิมคงที่ผ่าน _rxcu-map.json
// ใช้: node scripts/cc2/import-rxcu.mjs [--src ../cc2-source] [--dry]
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const args = process.argv.slice(2)
const SRC = args.includes('--src') ? args[args.indexOf('--src') + 1] : '../cc2-source'
const DRY = args.includes('--dry')
const OUT = 'content/cc2/cases'
const IMG = 'public/cc2/img'
const MAP = 'content/cc2/_rxcu-map.json'

function readConst(file, name) {
  const s = fs.readFileSync(path.join(SRC, file), 'utf8')
  const i = s.indexOf('{', s.indexOf(name + ' ='))
  return JSON.parse(s.slice(i, s.lastIndexOf('}') + 1))
}

const CATS = { clinic: 'Clinic', product: 'Product', sap: 'SAP' }
// กลุ่มที่เขียนไม่ตรงกัน → ชื่อเดียว
const GROUP_FIX = {
  'ตรวจสอบและแก้ไขใบสั่งยา': 'การตรวจสอบใบสั่งยา',
  'ประสานงาน ISBAR': 'การค้นข้อมูลและประสานงาน',
  'Special precaution': 'คำแนะนำสำหรับยาที่ต้องระมัดระวังในการใช้เป็นพิเศษ (ภาคผนวก ข)',
  'การเขียนฉลากช่วย และการเก็บรักษายา': 'การนับเม็ดยาและเขียนฉลากยา',
  'เทคนิคพิเศษ': 'การใช้ยาเทคนิคพิเศษ',
  'เภสัชกรรมปฏิบัติการผลิต (Compounding / Product)': 'Compounding',
  'Product': 'Compounding',
  'Mock Exam 2569': '',
}
// SAP เดิมกองใน "การค้นข้อมูลและประสานงาน" 41/48 เคส → จัดใหม่ตามหัวเรื่อง (11 พ.ย. 2026) · ลำดับมีผล (ตัวแรกที่ตรงชนะ)
const SAP_GROUPS = [
  ['จรรยาบรรณวิชาชีพ', /จรรยาบรรณ|ethic/i],
  ['การโฆษณายาและผลิตภัณฑ์สุขภาพ', /โฆษณา|advertis/i],
  ['ยาเสพติด วัตถุออกฤทธิ์ และยาควบคุมพิเศษ', /tramadol|วัตถุออกฤทธิ์|psychotropic|phentermine|codeine|pseudoephedrine|actifed|alprazolam|diazepam|sibutramine|ยาเสพติด|ควบคุมพิเศษ|narcotic|controlled/i],
  ['ประเภทยาและสิทธิ์การจำหน่าย', /จำแนก|ร้านสะดวกซื้อ|ตู้ยา|ใบสั่ง|ใบอนุญาต|จัดวาง|classification|otc/i],
  ['หน้าที่เภสัชกรและการดำเนินการร้านยา', /.*/],
]
const sapGroup = (c) => SAP_GROUPS.find(([, re]) => re.test(`${c.title} ${c.disease}`))[0]

// ชื่อระบบเขา → กลาง
const renameText = s => String(s ?? '')
  .replace(/ร้านยาs*RxCUs?d*/gi, 'ร้านยา')
  .replace(/โรงพยาบาลจุฬาเภสัชs?d*/g, 'โรงพยาบาลแห่งหนึ่ง')
  .replace(/RxCUs?d*/gi, '')
const rename = s => String(s ?? '')
  .replace(/Mock\s+RxCU\s?(\d+)/gi, 'สอบจำลองรุ่นพี่ $1')
  .replace(/Practice\s+RxCU\s?(\d+)/gi, 'ซ้อมรุ่นพี่ $1')
  .replace(/\(?RxCU\s?(\d+)\)?/gi, 'รุ่นพี่ $1')
  .replace(/RxCU/gi, '')
  .replace(/\s{2,}/g, ' ').trim()

const list = readConst('case-data-offline.js', 'OFFLINE_DATA').cases
const det = readConst('case-details-offline.js', 'OFFLINE_CASE_DETAILS')
const map = fs.existsSync(MAP) ? JSON.parse(fs.readFileSync(MAP, 'utf8')) : {}
let next = Math.max(0, ...Object.values(map).map(id => +id.slice(3))) + 1
const idOf = orig => (map[orig] ||= 'OS-' + String(next++).padStart(4, '0'))

if (!DRY) { fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(IMG, { recursive: true }) }
const stat = { ok: 0, skipEnc: 0, skipMissing: 0, inactive: 0, imgs: 0, flagged: [] }

for (const c of list) {
  const d = det[c.caseId]
  if (!d) { stat.skipMissing++; continue }
  if (d.isEncrypted) { stat.skipEnc++; continue }
  const id = idOf(c.caseId)
  let n = 0
  const imgs = []
  // แตกรูป base64 → ไฟล์ webp (ชื่อตามลำดับในเคส)
  const unpack = html => String(html ?? '').replace(/src="data:image\/[a-z+]+;base64,([^"]+)"/g, (_, b64) => {
    const file = `${id}-${++n}.webp`
    imgs.push([file, b64])
    return `src="/cc2/img/${file}"`
  })
  const clean = html => renameText(unpack(html)).replace(/\s*class="case-image(-wrapper)?"/g, '')
  const cat = CATS[String(c.category).toLowerCase()] || c.category
  const group = cat === 'SAP' ? sapGroup(c) : (GROUP_FIX[c.mainGroup] ?? c.mainGroup ?? '')
  const out = {
    id,
    title: rename(c.title),
    cat,
    group,
    topic: c.disease || '',
    diff: c.difficulty || 2,
    source: rename(d.source || c.source),
    active: c.isActive !== false && d.caseStatus !== 'Inactive',
    durationMin: d.durationMin || null,
    // ข้อมูลที่ผู้ประเมินต้อง "ส่ง" ให้ผู้สอบระหว่างสอบ (โหมดคู่) — โหมดเดี่ยวโชว์เลย
    gated: [d.patientInfoGated && 'patient', d.equipmentGated && 'equipment'].filter(Boolean),
    next: c.linkedNextCase ? idOf(c.linkedNextCase) : null,
    scenario: renameText(d.scenario),
    patientHtml: clean(d.patientInfoHtml),
    contentHtml: clean(d.contentHtml),
    equipmentHtml: clean(d.equipmentHtml),
    noteHtml: clean(d.noteHtml),
    checklist: (d.checklist || []).map(k => ({
      t: renameText(k.text), html: k.textHtml && k.textHtml !== k.text ? clean(k.textHtml) : undefined,
      s: k.score, g: k.group || '', sub: k.isSubset || undefined,
      img: k.imageHtml ? clean(k.imageHtml) : undefined,
    })),
  }
  // ไม่มีเกณฑ์ให้คะแนน: สถานีพัก (rest) หรือโจทย์ฝึกทำไม่มีเฉลย (noScore)
  if (!out.checklist.length && !/\[BLANK:/.test(out.scenario)) out[/^พัก/.test(out.title) ? 'rest' : 'noScore'] = true
  if (!out.active) stat.inactive++
  const blob = JSON.stringify(out)
  if (/จุฬา|RxCU/i.test(blob)) stat.flagged.push(id + ' ' + out.title)
  if (!DRY) {
    for (const [file, b64] of imgs) {
      const dst = path.join(IMG, file)
      if (!fs.existsSync(dst)) await sharp(Buffer.from(b64, 'base64')).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 78 }).toFile(dst)
    }
    fs.writeFileSync(path.join(OUT, id + '.json'), JSON.stringify(out, null, 1) + '\n')
  }
  stat.imgs += imgs.length
  stat.ok++
}
if (!DRY) fs.writeFileSync(MAP, JSON.stringify(map, null, 1) + '\n')
console.log(stat)
