// ทีม 1/2/3 — pure (user เคาะ 1 ต.ค. 2026 จากเดโม A)
// ยังมี "ทีมเดียวที่ใช้" = activePets เหมือนเดิม (หอคอย/สนามประลอง/ตั้งรับ อ่านตัวนี้ตัวเดียว ไม่แตะเอนจิน)
// teamPresets = ทีมที่จัดเก็บไว้ 3 ชุด · teamPresetIdx = ชุดไหนกำลังใช้ (ชุดนั้นคือ activePets เสมอ)
// เทส: node --test src/utils/teamPresets.test.js
export const PRESET_COUNT = 3

const clean = (ids, owned, n) => (Array.isArray(ids) ? ids : []).filter(id => id && (!owned || owned.has(id))).slice(0, n)

/** อ่านสถานะ: ชุดที่ใช้อยู่ = activePets เสมอ (เผื่อทีมถูกแก้จากที่อื่น เช่นหน้าข้อมูลเพ็ท) */
export function readPresets(userData, owned = null, slots = 3) {
  const tp = userData?.teamPresets
  const raw = Array.isArray(tp) ? tp : (tp && typeof tp === 'object' ? Array.from({ length: PRESET_COUNT }, (_, i) => tp[i] ?? tp[String(i)]) : [])
  const idx = Number.isInteger(userData?.teamPresetIdx) && userData.teamPresetIdx >= 0 && userData.teamPresetIdx < PRESET_COUNT ? userData.teamPresetIdx : 0
  const presets = Array.from({ length: PRESET_COUNT }, (_, i) => clean(i === idx ? userData?.activePets : raw[i], owned, slots))
  return { presets, idx }
}

// Firestore เก็บ array ซ้อน array ไม่ได้ ⇒ เก็บเป็น map {"0":[..],"1":[..],"2":[..]}
const toDoc = (presets) => Object.fromEntries(presets.map((p, i) => [String(i), p]))

/** แก้ทีมชุด i → patch · ถ้าเป็นชุดที่ใช้อยู่ activePets เปลี่ยนตาม */
export function editPresetPatch(state, i, ids) {
  const presets = state.presets.map((p, j) => (j === i ? ids.slice() : p))
  return i === state.idx ? { activePets: ids.slice(), teamPresets: toDoc(presets) } : { teamPresets: toDoc(presets) }
}

/** สลับไปใช้ชุด i */
export function usePresetPatch(state, i) {
  return { activePets: state.presets[i].slice(), teamPresetIdx: i, teamPresets: toDoc(state.presets) }
}
