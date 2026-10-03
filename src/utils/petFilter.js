// ตัวกรอง/เรียงเพ็ท ใช้ร่วมหน้าคลัง (PetsView) + จัดทีม (TeamPicker) — pure + มีเทส
// user เคาะ 3 ต.ค. 2026: ฟิลเตอร์สายแยกแถวของตัวเอง ใช้คู่กับระดับได้ · ไม่มีเลข "พลังทีม" (เรียงตาม ATK/HP แทน)
import { getPetDef } from '../data/index.js'
import { buildCombatant } from '../data/battle.js'

export const DEFAULT_FILTER = { el: 'all', rarity: 'all', onlyTeam: false, sort: 'rarity' }
export const RARITY_RANK = { legendary: 0, epic: 1, rare: 2, common: 3 }

const defOf = (id) => getPetDef(id) || { rarity: 'common', element: 'scissors', name: '' }
const rarityOf = (p) => p.rarity || defOf(p.id).rarity || 'common'

/** ATK/HP ที่ใช้สู้จริง (สูตรเดียวกับ PetStatLine) */
export function statOf(p) {
  const def = defOf(p?.id)
  const c = buildCombatant({ rarity: p?.rarity || def.rarity, element: def.element, grade: p?.grade })
  return { atk: Math.round(c.atk), hp: Math.round(c.maxHp) }
}

/** @param teamIds ไอดีที่อยู่ในทีม (ใช้กับ onlyTeam) */
export function filterPets(pets, f = DEFAULT_FILTER, teamIds = []) {
  const team = new Set((teamIds || []).filter(Boolean))
  return (pets || []).filter(p => {
    if (!p) return false
    if (f.el && f.el !== 'all' && defOf(p.id).element !== f.el) return false
    if (f.rarity && f.rarity !== 'all' && rarityOf(p) !== f.rarity) return false
    if (f.onlyTeam && !team.has(p.id)) return false
    return true
  })
}

export function sortPets(pets, key = 'rarity') {
  const name = (p) => defOf(p.id).name || ''
  const byRarity = (a, b) => (RARITY_RANK[rarityOf(a)] - RARITY_RANK[rarityOf(b)]) || ((b.grade || 0) - (a.grade || 0)) || name(a).localeCompare(name(b))
  const arr = [...(pets || [])]
  if (key === 'atk') return arr.sort((a, b) => (statOf(b).atk - statOf(a).atk) || byRarity(a, b))
  if (key === 'hp') return arr.sort((a, b) => (statOf(b).hp - statOf(a).hp) || byRarity(a, b))
  if (key === 'grade') return arr.sort((a, b) => ((b.grade || 0) - (a.grade || 0)) || byRarity(a, b))
  return arr.sort(byRarity)
}
