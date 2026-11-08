// utils/drugCard.js — schema การ์ดยา v2 (8 พ.ย. 2026)
// ทุกบรรทัดผูกแหล่งอ้างอิงได้: บรรทัด = string (ไม่มีอ้างอิง) หรือ { t, r: ['fda:5.2', 'nlem'] }
// โทเค็นอ้างอิง = '<id ใน refs>' หรือ '<id>:<หัวข้อ>' → แสดงเป็น [เลขลำดับ §หัวข้อ] กดเปิดลิงก์ของ ref นั้น
// การ์ด v1 (string ล้วน + src.set) ยังอ่านได้ — สร้าง ref 'fda' จาก src ให้อัตโนมัติ

export const LIST_SECTIONS = [
  { k: 'mon', t: 'Monitoring' }, { k: 'ci', t: 'ข้อห้ามใช้' }, { k: 'warn', t: 'คำเตือน' },
  { k: 'ae', t: 'อาการไม่พึงประสงค์' }, { k: 'ddi', t: 'ปฏิกิริยาระหว่างยา' }, { k: 'pop', t: 'กลุ่มประชากรพิเศษ' },
  { k: 'od', t: 'ยาเกินขนาด / แก้ฤทธิ์ยา' }, { k: 'cou', t: 'คำแนะนำผู้ป่วย' },
]

export function dailyMedUrl(setid) {
  return `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${setid}`
}

/** refs ของการ์ด — v1 ไม่มี refs ให้สร้าง fda จาก src */
export function cardRefs(drug) {
  const refs = Array.isArray(drug?.refs) ? [...drug.refs] : []
  if (!refs.some(r => r.id === 'fda') && drug?.src?.set) {
    refs.unshift({ id: 'fda', title: `${drug.name} — เอกสารกำกับยา US FDA`, url: dailyMedUrl(drug.src.set), src: `DailyMed · ${drug.src.lab || ''} · ฉบับ ${drug.src.date || ''}`.trim() })
  }
  return refs
}

/** แปลงบรรทัดเป็น { t, refs: [{ n, label, url, title }] } — โทเค็นที่ไม่รู้จักถูกทิ้ง (กันลิงก์ตาย) */
export function resolveLine(line, refs) {
  if (line == null) return null
  const t = typeof line === 'string' ? line : (line.t ?? '')
  const toks = typeof line === 'string' ? [] : (line.r || [])
  const out = []
  for (const tok of toks) {
    const [id, sec] = String(tok).split(':')
    const i = refs.findIndex(r => r.id === id)
    if (i < 0) continue
    out.push({ n: i + 1, label: sec ? `${i + 1} §${sec}` : `${i + 1}`, url: refs[i].url, title: refs[i].title })
  }
  return { t, refs: out }
}

/** ตารางข้อบ่งใช้: v1 = [ind, dose] · v2 = { i, d, r } */
export function resolveIndRow(row, refs) {
  if (Array.isArray(row)) return { i: row[0], d: row[1], refs: [] }
  return { i: row.i, d: row.d, refs: resolveLine({ t: '', r: row.r }, refs).refs }
}

/** ตาราง PK: v1 = [k, v] · v2 = [k, v, ['fda:12.3']] */
export function resolvePkRow(row, refs) {
  return { k: row[0], v: row[1], refs: resolveLine({ t: '', r: row[2] || [] }, refs).refs }
}
