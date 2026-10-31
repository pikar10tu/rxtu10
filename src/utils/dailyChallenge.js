/**
 * ข้อสอบประจำวัน — ตรรกะล้วน (ไม่แตะ Firestore/Vue)
 * spec: docs/superpowers/specs/2026-10-31-daily-challenge-v2-design.md
 * เทส: node --test src/utils/dailyChallenge.test.js
 */
export const DC_COUNT = 5
export const DC_TIME_MS = 30_000
export const DC_COIN_PER_CORRECT = 300
export const DC_CLAIM_DAYS = 7
// รางวัลตามอันดับ (index = อันดับ-1) · อันดับเกินตาราง = ไม่มีรางวัล
export const DC_PRIZES = [10000, 7000, 5000, 2000, 2000, 2000, 2000, 2000, 2000, 2000]

const DAY_MS = 86_400_000
const BKK_MS = 7 * 3_600_000

/** วันที่ตามเวลาไทย 'YYYY-MM-DD' */
export function dayKey(ms = Date.now()) {
  return new Date(ms + BKK_MS).toISOString().slice(0, 10)
}
/** บวก/ลบวันจาก key */
export function addDays(key, n) {
  return new Date(Date.parse(key + 'T00:00:00Z') + n * DAY_MS).toISOString().slice(0, 10)
}

/** คะแนนต่อข้อ: ถูก 500–1000 ตามความเร็ว · ผิด/หมดเวลา 0 */
export function questionScore(correct, ms) {
  if (!correct) return 0
  const t = Math.min(Math.max(Number(ms) || 0, 0), DC_TIME_MS)
  return Math.round(1000 - 500 * (t / DC_TIME_MS))
}

/** เรียงผล + อันดับแบบ competition (เสมอ = อันดับเดียวกัน, ถัดไปข้าม) · เสมอ = score และ ms เท่ากัน */
export function rankRows(rows) {
  const list = (Array.isArray(rows) ? rows : [])
    .filter(r => r && r.uid)
    .map(r => ({ ...r, score: Number(r.score) || 0, ms: Number(r.ms) || 0 }))
    .sort((a, b) => b.score - a.score || a.ms - b.ms || String(a.name || '').localeCompare(String(b.name || ''), 'th'))
  let rank = 0
  return list.map((r, i) => {
    const prev = list[i - 1]
    if (!prev || prev.score !== r.score || prev.ms !== r.ms) rank = i + 1
    return { ...r, rank }
  })
}

/** เหรียญของอันดับ (0 = ไม่มี) */
export function prizeFor(rank) {
  return rank >= 1 ? (DC_PRIZES[rank - 1] || 0) : 0
}

/** วันที่มีรางวัลรอรับ (หรือ null) จาก dc ใน user doc */
export function pendingClaimDay(dc, today) {
  const last = dc?.last
  if (!last || last >= today) return null
  if (dc?.claimed && dc.claimed >= last) return null
  if (last < addDays(today, -DC_CLAIM_DAYS)) return null
  return last
}

/** เลือก n ข้อจากผลสุ่ม (first/wrap จากหน้าต่าง rand) — ไม่ซ้ำ ข้อต้องมีตัวเลือก ≥2 */
export function pickDaily(first, wrap, n = DC_COUNT) {
  const seen = new Set()
  const out = []
  for (const q of [...(first || []), ...(wrap || [])]) {
    if (out.length >= n) break
    if (!q?.id || seen.has(q.id) || !Array.isArray(q.choices) || q.choices.length < 2) continue
    seen.add(q.id)
    out.push({
      id: q.id, question: q.question || '', choices: q.choices, answer: q.answer,
      explanation: q.explanation || '', pleGroup: q.pleGroup || null, domain: q.domain || null,
    })
  }
  return out
}
