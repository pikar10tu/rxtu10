// src/utils/petTeam.js
// pure: activePets (species ids) + pets ที่ owns → battle units {id,rarity,element,grade}
// ใช้ร่วม useTower + useArena (กันโค้ดซ้ำ)
import { getPetDef } from '../data/index.js'

export function resolveBattleTeam(ids, pets) {
  return (ids || []).filter(Boolean).map(id => {
    const inst = (pets || []).find(p => (p.id || p.species) === id) || {}
    const def = getPetDef(id) || {}
    return {
      id,
      rarity: inst.rarity || def.rarity || 'common',
      element: def.element || 'scissors',
      grade: inst.grade || 0,
    }
  })
}
