// petGrade — pure: ค่าอัพเกรดเพ็ท (เกรด 0-5, อัพไป N ใช้ N copies + เหรียญ)
export const MAX_GRADE = 5
// เหรียญต่อการอัพ 1 ขั้น = base[rarity] × เกรดเป้า (draft pin, tunable)
const RARITY_GRADE_COIN = { common: 200, rare: 600, epic: 1500, legendary: 4000 }

export function gradeUpCost(pet) {
  const g = pet?.grade || 0
  if (g >= MAX_GRADE) return null
  const target = g + 1
  const base = RARITY_GRADE_COIN[pet?.rarity] ?? RARITY_GRADE_COIN.common
  return { copies: target, coins: base * target }
}

export function canUpgrade(pet, ownedCoins) {
  const cost = gradeUpCost(pet)
  if (!cost) return false
  return (pet.copies || 0) >= cost.copies && (ownedCoins || 0) >= cost.coins
}
