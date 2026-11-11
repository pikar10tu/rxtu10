// CC2 OSPE — รูปแบบเคส + ตัวช่วย pure (ใช้ทั้งสคริปต์ build และในแอป) · เทส: cc2Case.test.js
// แหล่งจริง: content/cc2/cases/<id>.json · คู่มือเพิ่ม/ลบเคส: content/cc2/README.md

export const CC2_CATS = ['Clinic', 'Product', 'SAP']
export const CC2_ID = /^OS-\d{4}$/

// ตรวจรูปแบบเคส — คืนรายการข้อผิดพลาด (ว่าง = ผ่าน)
export function validateCase(c, file = '') {
  const e = []
  const at = m => e.push(`${file || c?.id}: ${m}`)
  if (!c || typeof c !== 'object') { at('ไม่ใช่ object'); return e }
  if (!CC2_ID.test(c.id || '')) at(`id "${c.id}" ต้องเป็น OS-0000`)
  if (file && c.id && file !== c.id + '.json') at(`ชื่อไฟล์ต้องตรง id (${c.id}.json)`)
  if (!c.title) at('ไม่มี title')
  if (!CC2_CATS.includes(c.cat)) at(`cat "${c.cat}" ต้องเป็น ${CC2_CATS.join('/')}`)
  if (typeof c.active !== 'boolean') at('active ต้องเป็น true/false')
  if (!Array.isArray(c.checklist)) at('checklist ต้องเป็น array')
  else c.checklist.forEach((k, i) => {
    if (!k.t) at(`checklist[${i}] ไม่มีข้อความ t`)
    if (typeof k.s !== 'number' || k.s < 0) at(`checklist[${i}] คะแนน s ต้องเป็นตัวเลข ≥ 0`)
  })
  if (!c.rest && !c.noScore && !c.checklist?.length && !parseBlanks(c.scenario).length) at('ต้องมี checklist หรือช่องเติมคำ [BLANK: …] อย่างน้อยหนึ่งอย่าง (หรือ rest/noScore: true)')
  return e
}

// ช่องเติมคำ: [BLANK: คำตอบ1, คำตอบ2 | คะแนน | ป้าย | len: m]
const BLANK_RE = /\[BLANK:\s*([^|\]]+)\|\s*([\d.]+)\s*\|\s*([^|\]]*?)\s*(?:\|[^\]]*)?\]/g
export function parseBlanks(text) {
  return [...String(text ?? '').matchAll(BLANK_RE)].map((m, i) => ({
    i, answers: m[1].split(',').map(s => s.trim()).filter(Boolean), score: +m[2], label: m[3] || `ช่อง ${i + 1}`,
  }))
}
export const normAns = s => String(s ?? '').toLowerCase().replace(/[\s.\-_'’]/g, '')
export const checkBlank = (blank, input) => !!normAns(input) && blank.answers.some(a => normAns(a) === normAns(input))

const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]))
// แทนที่ [BLANK: …] ใน HTML/ข้อความโจทย์ด้วยป้ายช่องว่าง — ผู้สอบต้องไม่เห็นเฉลยที่ซ่อนในมาร์กเกอร์
export function blankPlaceholders(html) {
  let i = 0
  return String(html ?? '').replace(BLANK_RE, (m, _a, _s, label) => `<span class="cc2-blank">▢ ${esc(label || `ช่อง ${++i}`)}</span>`)
}

const r2 = n => Math.round(n * 100) / 100
// คะแนนเคส: เช็คลิสต์ที่ติ๊ก + ช่องเติมคำที่ตอบถูก · checks = {[index]: bool} · answers = {[blankIndex]: string}
// เคส rest/noScore → { got: 0, tot: 0 } (ผู้เรียกตัดสินเองว่าจะบันทึกไหม)
export function scoreCase(caseData, checks = {}, answers = {}) {
  const list = Array.isArray(caseData?.checklist) ? caseData.checklist : []
  const blanks = Array.isArray(caseData?.blanks) ? caseData.blanks : parseBlanks(caseData?.scenario)
  let got = 0, tot = 0
  list.forEach((k, i) => { const s = +k.s || 0; tot += s; if (checks?.[i]) got += s })
  for (const b of blanks) { tot += b.score; if (checkBlank(b, answers?.[b.i])) got += b.score }
  return { got: r2(got), tot: r2(tot) }
}

// ── แยกส่วนที่ "ผู้สอบห้ามเห็น" ออกจาก HTML ของเคส ──
// เนื้อหานำเข้ามาจากระบบเดิมเขียนรวมกันใน patientHtml: บทผู้ป่วยจำลอง + ข้อมูลที่ผู้ประเมิน "ส่ง" เป็นชิ้นๆ
// มาร์กเกอร์ชิ้น: <p>(ส่งโดยผู้ประเมิน: ข้อมูล 1 - ประวัติผู้ป่วย)</p> · บทผู้ป่วย: <p>บทบาทผู้ป่วยจำลอง: …</p> / <li>ข้อมูลสำหรับผู้ประเมิน: …</li>
// มาร์กเกอร์อาจไม่ปิด </p> ทันที (บางเคสต่อด้วย <br /> + รูปในย่อหน้าเดียวกัน) → กิน </p> เฉพาะถ้าตามมาติดๆ · </p> ที่เหลือลอยเบราว์เซอร์ข้ามให้
const SEND_RE = /<p(?:\s[^>]*)?>\s*\(ส่งโดยผู้ประเมิน\s*:?\s*([\s\S]*?)\)(?:&nbsp;|\s|<br\s*\/?>)*(?:<\/p>)?/g
const EXAMINER_RE = /<(p|li)(?:\s[^>]*)?>(?:\s|&nbsp;|<[^>]+>)*(?:บทบาทผู้ป่วยจำลอง|บทผู้ป่วยจำลอง|ข้อมูลสำหรับผู้ประเมิน|ข้อมูลสำหรับผู้ตรวจ|ข้อมูลลับ)[\s\S]*?<\/\1>/g
const plain = s => String(s ?? '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
const hasContent = s => !!plain(s) || /<img/i.test(s)

/** ดึงท่อนสำหรับผู้ประเมินออกจาก HTML → { html (ให้ผู้สอบดูได้), examinerHtml (เฉพาะผู้ประเมิน) } */
export function splitExaminerOnly(html) {
  const parts = []
  let rest = String(html ?? '').replace(EXAMINER_RE, m => { parts.push(m); return '' })
  rest = rest.replace(/<ul(?:\s[^>]*)?>(?:\s|&nbsp;)*<\/ul>/g, '').replace(/<p(?:\s[^>]*)?>(?:\s|&nbsp;)*<\/p>/g, '')
  const examinerHtml = parts.map(p => (p.startsWith('<li') ? `<ul>${p}</ul>` : p)).join('')
  return { html: rest.trim(), examinerHtml }
}

/**
 * โครงการแสดงผลตาม role → ใช้ใน Cc2CaseBody
 *  patient:   [{ key, label, html, examinerHtml, gated }]   key = 'patient' | 'patient:1', 'patient:2' … (ส่งทีละชิ้นได้)
 *  equipment: { key: 'equipment', label, html, gated } | null
 *  gateKeys:  key ทั้งหมดที่ผู้ประเมินต้อง "ส่ง" ก่อนผู้สอบจะเห็น
 */
export function caseSections(c) {
  const gated = new Set(Array.isArray(c?.gated) ? c.gated : [])
  const pHtml = String(c?.patientHtml ?? '')
  const patient = []
  if (pHtml.trim()) {
    const pieces = []
    let last = 0, label = ''
    for (const m of pHtml.matchAll(SEND_RE)) {
      const before = pHtml.slice(last, m.index)
      if (hasContent(before)) pieces.push({ label, html: before })
      else if (pieces.length) pieces[pieces.length - 1].html += before
      label = plain(m[1]).replace(/\s*-\s*/, ' · ')
      last = m.index + m[0].length
    }
    const tail = pHtml.slice(last)
    if (hasContent(tail) || !pieces.length) pieces.push({ label, html: tail })
    const multi = pieces.length > 1
    pieces.forEach((p, i) => {
      const { html, examinerHtml } = splitExaminerOnly(p.html)
      patient.push({ key: multi ? `patient:${i + 1}` : 'patient', label: p.label || (multi ? `ข้อมูล ${i + 1}` : 'ข้อมูลผู้ป่วย'), html, examinerHtml, gated: gated.has('patient') })
    })
  }
  const eHtml = String(c?.equipmentHtml ?? '')
  const equipment = eHtml.trim() ? { key: 'equipment', label: 'ของในสถานี', html: eHtml, gated: gated.has('equipment') } : null
  const gateKeys = [...patient.filter(p => p.gated).map(p => p.key), ...(equipment?.gated ? ['equipment'] : [])]
  return { patient, equipment, gateKeys }
}

// allowlist sanitizer — เนื้อหาเคสมาจากไฟล์ภายนอก ไปลง v-html
const TAGS = new Set(['p', 'span', 'div', 'img', 'ul', 'ol', 'li', 'br', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a', 'hr', 'sup', 'sub', 'b', 'strong', 'i', 'em', 'u'])
const ATTRS = { '*': ['style', 'colspan', 'rowspan'], img: ['src', 'alt'], a: ['href'] }
export function sanitizeHtml(html) {
  return String(html ?? '')
    .replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (m, tag, attrs) => {
      const t = tag.toLowerCase()
      if (!TAGS.has(t)) return ''
      if (m.startsWith('</')) return `</${t}>`
      const ok = [...ATTRS['*'], ...(ATTRS[t] || [])]
      const kept = [...attrs.matchAll(/([a-z-]+)\s*=\s*"([^"]*)"/gi)]
        .filter(([, k, v]) => {
          k = k.toLowerCase()
          if (!ok.includes(k)) return false
          if (k === 'src') return /^\/cc2\/img\/[\w-]+\.webp$/.test(v)
          if (k === 'href') return /^https?:\/\//.test(v)
          if (k === 'style') return !/url\(|expression|javascript:/i.test(v)
          return true
        })
        .map(([, k, v]) => ` ${k.toLowerCase()}="${v}"`).join('')
      const self = /\/\s*$/.test(attrs) || t === 'img' || t === 'br' || t === 'hr'
      return `<${t}${kept}${self && (t === 'img' || t === 'br' || t === 'hr') ? ' /' : ''}>`
    })
}
