// 🎁 ของขวัญตำนานตัวแรก (user เคาะ 28 ต.ค. 2026) — pure
// ใครได้: ยังไม่มีเพ็ท หรือยังไม่มีตำนานสักตัว · ครั้งเดียวต่อบัญชี (flag starterLegendV1)
// เลือกได้: ตำนานถึงรุ่นซอล (wave ≤ 3) — ไม่ทับตู้ของเดือนที่เพิ่งเปิด
import { PETS } from '../data/index.js'
import { mergeRolls } from './gachaMerge.js'

export const STARTER_MAX_WAVE = 3
export const STARTER_LEGENDS = PETS.filter(p => p.rarity === 'legendary' && (p.wave || 1) <= STARTER_MAX_WAVE)

export function starterEligible(user) {
  if (!user || user.starterLegendV1) return false
  return !(user.pets || []).some(p => (p.rarity || PETS.find(d => d.id === p.id)?.rarity) === 'legendary')
}

/** คืน patch { pets, starterLegendV1 } หรือ null ถ้าเลือกไม่ได้ */
export function starterPatch(user, id) {
  if (!starterEligible(user) || !STARTER_LEGENDS.some(p => p.id === id)) return null
  const { pets } = mergeRolls(user.pets || [], [{ id }], PETS)
  return { pets, starterLegendV1: true }
}
