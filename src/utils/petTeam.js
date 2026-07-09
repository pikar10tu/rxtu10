// src/utils/petTeam.js
// pure: activePets (species ids) + pets ที่ owns → battle units {id,rarity,element,grade}
// ใช้ร่วม useTower + useArena (กันโค้ดซ้ำ)
import { getPetDef } from '../data/index.js'
import { BATTLE_SLOTS } from '../data/residence.js'

export function resolveBattleTeam(ids, pets) {
  // cap ที่ BATTLE_SLOTS — กันทีมศัตรู/บอทที่ doc เก่ายังมี 4 id → รับประกัน 3v3
  return (ids || []).filter(Boolean).slice(0, BATTLE_SLOTS).map(id => {
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
