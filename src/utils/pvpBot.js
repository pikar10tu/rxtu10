// src/utils/pvpBot.js
// PvP bot — pure: หุ่นซ้อมในพูลคู่ต่อสู้ · สเกลตามเรต · deterministic จาก seed (แนวเดียว getFloorTeam)
import { PETS } from '../data/index.js'
import { BATTLE_SLOTS } from '../data/residence.js'

const RARITY_BY_TIER = ['common', 'rare', 'epic', 'legendary']
const ELS = ['fist', 'scissors', 'paper']

function rng(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** เรต → เกรด/ความหายากคร่าวๆ (เรต ~800 = อ่อน, ~2000 = แกร่งสุด) */
export function botPowerFor(rating) {
  const t = Math.max(0, Math.min(1, (rating - 800) / 1200))
  const grade = Math.round(t * 5)
  const tier = Math.min(3, Math.floor(t * 4))
  return { grade, rarity: RARITY_BY_TIER[tier] }
}

/** หุ่นซ้อม 3 ตัว สเกลตามเรต + ธาตุผสม · เรตบอท = เรตผู้เล่น (จับคู่สูสี) */
export function getPvpBot(rating, seed) {
  const rand = rng((seed >>> 0) || 1)
  const { grade, rarity } = botPowerFor(rating)
  const team = []
  for (let i = 0; i < BATTLE_SLOTS; i++) {
    const element = ELS[((seed >>> 0) + i) % 3]
    const pool = PETS.filter(p => p.rarity === rarity && p.element === element)
    const fallback = PETS.filter(p => p.element === element)
    const src = pool.length ? pool : fallback
    const def = src[Math.floor(rand() * src.length)]
    team.push({ id: def.id, rarity: def.rarity, element: def.element, grade })
  }
  return { uid: 'bot', name: 'หุ่นซ้อม', isBot: true, rating, team }
}
