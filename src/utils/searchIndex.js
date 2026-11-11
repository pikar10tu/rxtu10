// ค้นหารวม (ยา · เคส CC2 · สรุป) — ดัชนีสร้างตอน build ใน scripts/build-search-index.mjs → public/search-index.json
// ค้นในเครื่องทั้งหมด = 0 Firestore read · ยาใหม่ใน drugDb.json เข้าดัชนีเองตอน build (เทสกันลืม: searchIndex.test.js)
// ชื่อเรียกอื่น (ชื่อการค้า/ไทย) เพิ่มได้ที่ data/drugAka.js

export const norm = s => String(s ?? '').toLowerCase().normalize('NFC').replace(/\s+/g, ' ').trim()

// คำที่ใช้จับยาในข้อความ: ชื่อหลัก (ตัดวงเล็บ) + ชื่อในวงเล็บที่เป็นอักษรละติน + aka
export function drugTerms(drug, aka = []) {
  const name = String(drug.name || '')
  const main = name.replace(/\(.*?\)/g, '').trim()
  const paren = [...name.matchAll(/\(([^)]+)\)/g)].map(m => m[1].trim()).filter(p => /^[A-Za-z][A-Za-z0-9 /\-]+$/.test(p) && !/^U-\d+$/.test(p))
  return [...new Set([main, ...paren, ...aka].map(norm).filter(t => t.length >= 4))]
}

// ตรงคำทั้งคำ (กัน "aspirin" ไปติดใน "aspirinx") — ไทยไม่มีเว้นวรรค ใช้แบบ substring
export function textHasTerm(text, term) {
  const t = norm(text), k = norm(term)
  if (!k) return false
  if (/[^\x00-\x7f]/.test(k)) return t.includes(k)
  const esc = k.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
  return new RegExp(`(^|[^a-z0-9])${esc}($|[^a-z0-9])`).test(t)
}

export const drugsInText = (text, drugs) => drugs.filter(d => d.terms.some(t => textHasTerm(text, t))).map(d => d.id)

// ค้นในดัชนี → กลุ่มผลลัพธ์ (เรียงตรงต้นชื่อก่อน)
export function searchAll(index, q, limit = 6) {
  const k = norm(q)
  if (!k || !index) return null
  const rank = (title, extra) => {
    const t = norm(title)
    if (t.startsWith(k)) return 0
    if (t.includes(k)) return 1
    return extra.some(x => norm(x).includes(k)) ? 2 : -1
  }
  const pick = (list, fn) => list.map(x => [x, fn(x)]).filter(([, r]) => r >= 0).sort((a, b) => a[1] - b[1]).slice(0, limit).map(([x]) => x)
  return {
    drugs: pick(index.drugs, d => rank(d.n, [d.cls, d.g, ...d.terms])),
    cases: pick(index.cases, c => rank(c.t, [c.topic, c.g])),
    sums: pick(index.sums, s => rank(s.t, [s.g])),
  }
}
