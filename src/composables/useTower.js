import { computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from './useToast.js'
import { simulateBattle } from '../utils/battleEngine.js'
import { getFloorTeam, getTowerBonus, TOWER_MAX } from '../data/towerFloors.js'
import { getPetDef } from '../data/index.js'

/** activePets (species id) → battle units {id,rarity,element,grade} จาก pets ที่ owns */
function resolveTeam(ids, pets) {
  return (ids || []).filter(Boolean).map(id => {
    const inst = (pets || []).find(p => (p.id || p.species) === id) || {}
    const def = getPetDef(id) || {}
    return { id, rarity: inst.rarity || def.rarity || 'common', element: def.element || 'scissors', grade: inst.grade || 0 }
  })
}

export function useTower() {
  const auth = useAuthStore()
  const { toast } = useToast()

  const floor = computed(() => auth.userData?.towerFloor || 1)
  const best  = computed(() => auth.userData?.towerBest || 0)
  const team  = computed(() => resolveTeam(auth.userData?.activePets, auth.userData?.pets))
  const botTeam = computed(() => getFloorTeam(floor.value))
  const bonus = computed(() => getTowerBonus(best.value))

  async function fight() {
    if (!team.value.length) { toast('จัดทีมก่อนนะ (อย่างน้อย 1 ตัว)', 'info'); return null }
    const cleared = floor.value
    const seed = Date.now()
    const result = simulateBattle(team.value, botTeam.value, seed)
    const won = result.winner === 'A'
    if (won) {
      const nextFloor = Math.min(TOWER_MAX, cleared + 1)
      const nextBest = Math.max(best.value, cleared)
      await auth.patchUser(
        { towerFloor: nextFloor, towerBest: nextBest },
        { towerFloor: nextFloor, towerBest: nextBest },
      )
    }
    return { result, botTeam: botTeam.value, playerTeam: team.value, won, cleared }
  }

  return { floor, best, team, botTeam, bonus, fight, TOWER_MAX }
}
