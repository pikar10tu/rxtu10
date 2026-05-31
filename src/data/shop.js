// ════════════════════════════════════════════════════════════
//  ร้านค้า (Shop) — gacha eggs
// ════════════════════════════════════════════════════════════
//  Buy an egg → instantly roll a pet (added to storage). Main coin sink.
//  Prices tuned against v2 income (residence 300–55k/day + farm).
//  rates = % chance per rarity (sum 100). Higher-tier eggs cost more but
//  skew toward better pets.
// ════════════════════════════════════════════════════════════

import { PETS } from './index.js'

export const EGG_TYPES = [
  { id: 'common', name: 'ไข่ธรรมดา', emoji: '🥚', cost: 150,
    rates: { common: 70, rare: 25, epic: 5,  legendary: 0  },
    desc: 'ลุ้นเพ็ททั่วไป โอกาสได้ของดีบ้างเล็กน้อย' },
  { id: 'silver', name: 'ไข่เงิน',   emoji: '🩵', cost: 1800,
    rates: { common: 30, rare: 45, epic: 20, legendary: 5  },
    desc: 'เน้นแรร์ขึ้นไป มีลุ้นตำนาน 5%' },
  { id: 'gold',   name: 'ไข่ทอง',    emoji: '🌟', cost: 7000,
    rates: { common: 0,  rare: 30, epic: 50, legendary: 20 },
    desc: 'การันตีแรร์ขึ้นไป ลุ้นตำนาน 20%' },
  { id: 'legend', name: 'ไข่ตำนาน',  emoji: '👑', cost: 35000,
    rates: { common: 0,  rare: 0,  epic: 0,  legendary: 100 },
    desc: 'การันตีเพ็ทตำนาน 100%' },
]

export const getEgg = (id) => EGG_TYPES.find(e => e.id === id) || null

const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary']

export function rollRarity(rates) {
  const r = Math.random() * 100
  let acc = 0
  for (const k of RARITY_ORDER) {
    acc += rates[k] || 0
    if (r < acc) return k
  }
  return 'common'
}

/** Roll a fresh pet instance from an egg. */
export function rollPetFromEgg(eggId) {
  const egg = getEgg(eggId)
  if (!egg) return null
  const rarity = rollRarity(egg.rates)
  const pool = PETS.filter(p => p.rarity === rarity)
  const base = pool[Math.floor(Math.random() * pool.length)] || PETS[0]
  return {
    id: base.id,
    name: base.name,
    emoji: base.emoji,
    rarity: base.rarity,
    element: base.element,
    grade: 0,
    refine: 0,
    potential: [],
    instId: `${base.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    bornAt: Date.now(),
  }
}
