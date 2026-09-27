// src/data/aiReview.js
// ผลตรวจข้อสอบโดย AI (🤖 aiReview) — สเปก: ../DOC/specs/ai-review-spec.md + ai-review-handoff.md
// ฟิลด์ `aiReview` เขียนโดยสคริปต์ Admin SDK (DOC/tools/apply-ai-review.mjs) เท่านั้น — ฝั่งเว็บอ่านอย่างเดียว
// หลัก: AI = ความเห็นประกอบ ไม่ใช่เสียงตรวจ · ห้ามเอาไปนับใน reviewedBy/สถิติคนตรวจ

export const AI_CONF = {
  high: { dot: '🟢', label: 'มั่นใจสูง', range: '>90%', desc: 'เทียบแหล่งชี้ขาดได้ตรงๆ (guideline ปัจจุบัน เอกสารกำกับยา ตัวบทกฎหมาย ค่าคำนวณ)' },
  med:  { dot: '🟡', label: 'มั่นใจปานกลาง', range: '70–90%', desc: 'ถูกตามตำรามาตรฐาน แต่ขึ้นกับเวอร์ชัน guideline หรือแนวปฏิบัติที่ต่างกันได้' },
  low:  { dot: '🔴', label: 'ควรให้คนตรวจ', range: '<70%', desc: 'ขึ้นกับบริบทไทย/สถาบัน โจทย์ขาดข้อมูล หรือยืนยันข้อเท็จจริงไม่ได้' },
}
// ช่วง % ยังไม่ผ่านการวัดจริง (สเปก §ความมั่นใจ) → popover ต้องเขียนว่า "ประมาณ"
export const AI_CONF_MEASURED = false

export const AI_VERDICT = {
  ok:      { label: 'เฉลยถูก', tone: 'ok' },
  minor:   { label: 'มีจุดควรแก้', tone: 'minor' },
  wrong:   { label: 'เฉลยน่าจะผิด', tone: 'wrong' },
  unclear: { label: 'ตัดสินไม่ได้', tone: 'unclear' },
}

export const AI_ISSUE_TYPE = {
  answer: 'เฉลย', stem: 'โจทย์', choice: 'ตัวเลือก', explanation: 'คำอธิบาย', outdated: 'ล้าสมัย', typo: 'พิมพ์ผิด',
}

export const AI_DISCLAIMER = 'AI เป็นความเห็นประกอบ ผลตัดสินสุดท้ายคือทีมวิชาการ'

// ── hash สูตรเดียวกับสคริปต์ (sha1 ของ JSON แบบ Python [question, choices, answer], 16 ตัวแรก) ──
const pyJson = v => Array.isArray(v) ? '[' + v.map(pyJson).join(', ') + ']'
  : v === undefined ? 'null' : JSON.stringify(v)
export const aiHashInput = q => pyJson([q?.question ?? '', q?.choices ?? [], q?.answer ?? null])

export async function aiContentHash(q) {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(aiHashInput(q)))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)
}

/**
 * สถานะผลตรวจ AI ของข้อนี้ เทียบกับเนื้อหาปัจจุบัน
 * @param q        doc ข้อสอบ
 * @param liveHash aiContentHash(q) — null = ยังคำนวณไม่เสร็จ
 * @returns 'none' | 'pending' | 'stale' | 'ok' | 'flag'
 *   ok   = เฉลยถูก / AI แก้แล้ว / ทีมตัดสินข้อเสนอแล้ว → ชิปปกติ
 *   flag = minor/wrong/unclear ที่ยังไม่มีใครตัดสิน → กล่องเตือน
 *   stale = โจทย์ถูกแก้หลัง AI ตรวจ (AI ตรวจเวอร์ชันก่อน)
 */
export function aiState(q, liveHash) {
  const ai = q?.aiReview
  if (!ai?.verdict) return 'none'
  if (!liveHash) return 'pending'
  const fresh = liveHash === ai.contentHash
    || (ai.applied && (liveHash === q.aiPrev?.appliedHash || !q.aiPrev))
  if (!fresh) return 'stale'
  if (ai.verdict === 'ok' || ai.applied) return 'ok'
  if (q.aiResolved && q.aiResolved.forHash === ai.contentHash) return 'ok'
  return 'flag'
}

// ทีมตรวจผ่านแล้วแต่ AI ว่าเฉลยผิด (และยังไม่ได้แก้) → ป้ายแดง "ขัดแย้งกับผลตรวจทีม"
export const aiConflictsTeam = q =>
  q?.reviewStatus === 'passed' && q?.aiReview?.verdict === 'wrong' && !q.aiReview.applied
