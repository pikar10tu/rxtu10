// สถิติรายข้อ (SP2b) — pure logic นับ %ถูก + flag ข้อมีปัญหา
// ไม่พึ่ง Firestore/Vue เพื่อให้เทสด้วย node --test ได้

// รวม answers ({id, correct}) ต่อ qid → { [qid]: { a, c } } (ข้าม record ไม่มี id)
export function tallyAnswers(answers) {
  const out = {}
  for (const a of answers || []) {
    if (!a || !a.id) continue
    const cur = out[a.id] || (out[a.id] = { a: 0, c: 0 })
    cur.a++
    if (a.correct) cur.c++
  }
  return out
}

// %ถูก ปัดจำนวนเต็ม หรือ null ถ้ายังไม่มีการตอบ
export function pctCorrect(a, c) {
  if (!a || a <= 0) return null
  return Math.round((c / a) * 100)
}

// ข้อมีปัญหา = ถูกตอบพอ (>=minAttempts) และ %ถูกต่ำกว่า threshold
export function isProblem(stat, minAttempts, pctThreshold) {
  if (!stat || stat.a < minAttempts) return false
  const pct = pctCorrect(stat.a, stat.c)
  return pct !== null && pct < pctThreshold
}
