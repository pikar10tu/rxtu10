// ════════════════════════════════════════════════════════════
//  จำลองสอบจริง (PLE-CC1) — pure helpers · เทส: node --test src/utils/examSim.test.js
//  อิงประกาศศูนย์สอบฯ ที่ ๕/๒๕๖๖:
//   - 120 ข้อ / 3 ชั่วโมง ⇒ 1.5 นาทีต่อข้อ
//   - ผู้ป่วย 50 : ผลิตภัณฑ์ 40 : สังคมและบริหาร (รวมกฎหมาย) 10 · กฎหมาย ≥ 12/240 (5%)
//  ในคลังเรา: care = domain care · sci = domain sci ยกเว้นกลุ่ม sci_social · sap = pleGroup sci_social · law = domain law
// ════════════════════════════════════════════════════════════

export const EXAM_SIM_LENS = [20, 40, 60, 120]
export const SEC_PER_Q = 90   // 3 ชม. / 120 ข้อ
export const SAP_GROUP = 'sci_social'

export const examMinutes = (n) => Math.round(n * SEC_PER_Q / 60)

/**
 * จำนวนข้อแต่ละส่วน (รวม = n) · rng ใส่ได้เพื่อเทส
 * ส่วนสังคม+กฎหมาย 10% (กฎหมายอย่างน้อย 5% ปัดขึ้น) · ผู้ป่วย/ผลิตภัณฑ์ ขยับ ±1 ได้ (สุ่ม)
 */
export function examQuotas(n, rng = Math.random) {
  const sapLaw = Math.max(2, Math.round(n * 0.1))
  const lawMin = Math.max(1, Math.ceil(n * 0.05))
  const law = lawMin + Math.floor(rng() * (sapLaw - lawMin + 1))   // lawMin..sapLaw
  const sap = sapLaw - law
  let care = Math.round(n * 0.5)
  const wiggle = Math.floor(rng() * 3) - 1   // -1, 0, +1
  care += wiggle
  const sci = n - sapLaw - care
  return { care, sci, sap, law }
}

// ── บันทึกในเครื่อง (ออก/ส่ง = ล้าง · รีเฟรช/ปิดแท็บ = กลับมาทำต่อได้ถ้ายังไม่หมดเวลา) ──
export const examStoreKey = (uid) => `rx-exam-sim:${uid || 'anon'}`

export function loadExamState(storage, uid) {
  try {
    const raw = storage?.getItem(examStoreKey(uid))
    if (!raw) return null
    const s = JSON.parse(raw)
    if (!s || !Array.isArray(s.qs) || !s.qs.length || typeof s.deadline !== 'number') return null
    const n = s.qs.length
    const fix = (a, d) => (Array.isArray(a) && a.length === n ? a : Array(n).fill(d))
    return { ...s, ans: fix(s.ans, null), star: fix(s.star, false), i: Math.min(Math.max(0, s.i | 0), n - 1) }
  } catch { return null }
}
export function saveExamState(storage, uid, s) {
  try { storage?.setItem(examStoreKey(uid), JSON.stringify(s)); return true } catch { return false }
}
export function clearExamState(storage, uid) {
  try { storage?.removeItem(examStoreKey(uid)) } catch { /* ignore */ }
}

/** เก็บเฉพาะฟิลด์ที่หน้าสอบ/หน้าเฉลยใช้ — กัน localStorage บวม */
export function slimQuestion(q) {
  const keep = ['id', 'question', 'choices', 'answer', 'explanation', 'images', 'domain', 'pleGroup', 'pleSub',
    'examSets', 'reviewStatus', 'reviewNote', 'source', 'summaryId', 'keyBy', 'aiReview', 'categories']
  const o = {}
  for (const k of keep) if (q[k] !== undefined) o[k] = q[k]
  return o
}

/** แปลงคำตอบ → answers[] แบบที่ finish() ของ QuizView ใช้ (เฉพาะข้อที่ตอบ) + สรุป */
export function gradeExam(qs, ans) {
  const answers = []
  let correct = 0
  qs.forEach((q, i) => {
    if (ans[i] === null || ans[i] === undefined) return
    const ok = ans[i] === q.answer
    if (ok) correct++
    answers.push({ id: q.id, domain: q.domain || null, pleGroup: q.pleGroup || null, correct: ok })
  })
  return { answers, correct, answered: answers.length, total: qs.length }
}
