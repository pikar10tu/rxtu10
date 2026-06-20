// ห้องทดลอง (Phase D) — pure: fusion ไต่ระดับ + แลก copies เป็นเหรียญ · draft pins
import { rarityPool } from './gacha.js'

export const FUSION_COST = { common: 15, rare: 12, epic: 10 }              // copies ระดับล่างต่อ 1 หลอม
export const REDEEM_COIN = { common: 50, rare: 200, epic: 800, legendary: 3000 } // เหรียญต่อ 1 copy

const ORDER = ['common', 'rare', 'epic', 'legendary']

export function nextRarity(r) {
  const i = ORDER.indexOf(r)
  return (i >= 0 && i < ORDER.length - 1) ? ORDER[i + 1] : null
}

export function rarityCopyTotal(pets, rarity) {
  return (pets || []).filter((p) => p.rarity === rarity).reduce((s, p) => s + (p.copies || 0), 0)
}

export function allocationTotal(allocation) {
  return (allocation || []).reduce((s, a) => s + (a.n || 0), 0)
}

/** หัก copies ตาม allocation [{id,n}] — คืน pets clone · invalid → throw */
export function applyCopySpend(pets, allocation) {
  const byId = new Map((pets || []).map((p) => [p.id, p]))
  for (const { id, n } of allocation) {
    const pet = byId.get(id)
    if (!pet || !(n >= 1) || n > (pet.copies || 0)) throw new Error('invalid copy spend')
  }
  return (pets || []).map((p) => {
    const a = allocation.find((x) => x.id === p.id)
    return a ? { ...p, copies: (p.copies || 0) - a.n } : p
  })
}

/** สุ่ม uniform species id จากระดับถัดไป · legendary → null */
export function fuseRoll(sourceRarity, catalog, rng = Math.random) {
  const target = nextRarity(sourceRarity)
  if (!target) return null
  const pool = rarityPool(catalog, target)
  if (!pool.length) return null
  return pool[Math.floor(rng() * pool.length)]
}

export function redeemValue(allocation, rarity) {
  return allocationTotal(allocation) * (REDEEM_COIN[rarity] || 0)
}
