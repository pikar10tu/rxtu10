// ════════════════════════════════════════════════════════════
//  qhash — กันข้อสอบซ้ำ (Phase 6)
//  - normForHash : normalize โจทย์ (lowercase + ยุบช่องว่าง) ก่อน hash
//  - qhash       : hash โจทย์ → string สั้น เก็บใน questions/{id}.qhash
//                  ใช้ cyrb53 (pure, deterministic, ไม่พึ่ง crypto — รันได้ทั้ง browser/node)
//                  เป็น dedup เชิงแนะนำ ไม่ใช่ security → โอกาสชนต่ำพอสำหรับคลังระดับพันข้อ
//  - splitDuplicateRows : แยก import rows เป็น fresh/duplicates (ชนคลัง + ชนกันเองในก้อน)
//  - groupDuplicates    : จัดกลุ่มข้อในคลังตาม qhash โชว์เฉพาะกลุ่มที่ซ้ำ (>1) ให้ลบ
// ════════════════════════════════════════════════════════════

export function normForHash(text) {
  return String(text ?? '').toLowerCase().replace(/\s+/g, ' ').trim()
}

// cyrb53 — string hash 53-bit, การกระจายดี (https://stackoverflow.com/a/52171480)
export function qhash(question) {
  const s = normForHash(question)
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  const n = 4294967296 * (2097151 & h2) + (h1 >>> 0)
  return n.toString(36)
}

// แยก import rows: ตัวที่ qhash ชนคลัง (existingHashes) หรือชนกันเองในก้อน → duplicates
// เก็บตัวแรกที่เจอแต่ละ hash ไว้ใน fresh (ที่เหลือเป็น duplicates) — ไม่กลายพันธุ์ rows เดิม
export function splitDuplicateRows(rows, existingHashes = []) {
  const seen = new Set(existingHashes)
  const fresh = [], duplicates = []
  for (const row of rows || []) {
    const h = row && typeof row.qhash === 'string' ? row.qhash : qhash(row?.question)
    if (seen.has(h)) duplicates.push(row)
    else { seen.add(h); fresh.push(row) }
  }
  return { fresh, duplicates }
}

// จัดกลุ่มข้อในคลังตาม qhash (ใช้ของเดิมถ้ามี ไม่งั้นคำนวณจากโจทย์) — คืนเฉพาะกลุ่มซ้ำ (>1)
export function groupDuplicates(questions) {
  const map = new Map()
  for (const q of questions || []) {
    if (!q || !q.question || !String(q.question).trim()) continue
    const h = typeof q.qhash === 'string' ? q.qhash : qhash(q.question)
    if (!map.has(h)) map.set(h, [])
    map.get(h).push(q)
  }
  return [...map.values()].filter(g => g.length > 1)
}
