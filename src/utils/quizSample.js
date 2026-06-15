// quizSample — รวมผล windowed query รอบแรก (first) + รอบ wrap → ตัด id ซ้ำ → เหลือ ≤ n
//  first = ผล where(...).orderBy(rand).startAt(R).limit(n)
//  wrap  = ผล where(...).orderBy(rand).limit(n)  (วนต้นลิสต์ เผื่อ first ชนปลาย)
// pure: รับ array ของ doc ({ id, ... }) ไม่ผูก Firestore
export function quizSample(first, wrap, n) {
  const out = []
  const seen = new Set()
  for (const d of [...first, ...wrap]) {
    if (out.length >= n) break
    if (seen.has(d.id)) continue
    seen.add(d.id)
    out.push(d)
  }
  return out
}
