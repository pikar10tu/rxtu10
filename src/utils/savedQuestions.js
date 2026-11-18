// 🔖 ข้อสอบที่บันทึกไว้ (18 พ.ย. 2026) — user doc `study.saved = { [qid]: savedAtMs }`
// ⚠️ เขียนด้วย dot-path `study.saved.<qid>` เท่านั้น (ห้ามเขียน study ทั้งก้อน — ทับ qcards/cards/cc2)
// เพดาน SAVED_MAX ต้องตรงกับ firestore.rules (กัน doc บวม)
export const SAVED_MAX = 500
export const SAVED_BATCH = 30   // ทำชุดที่บันทึกไว้ได้ทีละกี่ข้อ (ใหม่สุดก่อน)

const asMap = s => (s && typeof s === 'object' && !Array.isArray(s) ? s : {})

export function isSaved(saved, qid) { return !!qid && asMap(saved)[qid] != null }
export function savedCount(saved) { return Object.keys(asMap(saved)).length }

// ใหม่สุดก่อน
export function savedIds(saved, limit = Infinity) {
  return Object.entries(asMap(saved))
    .sort((a, b) => (Number(b[1]) || 0) - (Number(a[1]) || 0))
    .slice(0, limit)
    .map(([id]) => id)
}

// สลับบันทึก/เอาออก → { ok, saved: bool, optimisticStudy, server } · ok=false เมื่อเต็มเพดาน
export function buildSavedToggle({ study = {}, qid, now = Date.now(), deleteSentinel } = {}) {
  const src = asMap(study)
  const map = { ...asMap(src.saved) }
  if (!qid) return { ok: false, saved: false }
  const had = map[qid] != null
  if (!had && Object.keys(map).length >= SAVED_MAX) return { ok: false, saved: false, full: true }
  if (had) delete map[qid]; else map[qid] = now
  return {
    ok: true,
    saved: !had,
    optimisticStudy: { ...src, saved: map },
    server: { [`study.saved.${qid}`]: had ? deleteSentinel : now },
  }
}

// ข้อที่หาย/ถูกถอนเผยแพร่ → ลบออกจากที่บันทึก
export function buildSavedRemove({ study = {}, ids = [], deleteSentinel } = {}) {
  const src = asMap(study)
  const map = { ...asMap(src.saved) }
  const server = {}
  for (const id of ids) {
    if (map[id] == null) continue
    delete map[id]
    server[`study.saved.${id}`] = deleteSentinel
  }
  return { optimisticStudy: { ...src, saved: map }, server }
}
