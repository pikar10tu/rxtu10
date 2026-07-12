// src/utils/expedition.js
// Expedition — pure logic: คุณภาพสาย + รางวัล (deterministic) + สถานะ
// party = [{id, rarity, element, grade}] (สแนปช็อตตอนส่ง — รูปเดียวกับ battle unit จาก resolveBattleTeam)
import {
  POWER_K, ELEMENT_K,
  TICKET_POWER_K, TICKET_EL_K, TICKET_CHANCE_MAX,
} from '../data/expeditions.js'
import { expWeight } from '../data/petPower.js'

/** น้ำหนักคุณภาพรวมของสาย (rarity × เกรด) */
export function partyPower(party) {
  return (party || []).reduce((sum, p) => sum + expWeight(p), 0)
}

/** จำนวนตัวที่ธาตุตรงมิชชัน (0..3) */
export function elementMatches(party, missionElement) {
  return (party || []).filter(p => p?.element === missionElement).length
}

/** seed คงที่ของรอบ (FNV-1a จาก petIds+startedAt+mission+duration) — กัน reroll */
export function expeditionSeed(exp) {
  const s = `${(exp?.petIds || []).join(',')}|${exp?.startedAt || 0}|${exp?.missionId || ''}|${exp?.durationId || ''}`
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}

// mulberry32 (แนวเดียว utils/pvpBot.js)
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** คำนวณรางวัล (คิดตอนกดเก็บ) → array ของ {type, amount} · extensible */
export function resolveRewards(party, mission, duration, seed) {
  const power = partyPower(party)
  const elBonus = elementMatches(party, mission?.element) * ELEMENT_K
  const rewards = []
  // เหรียญ — สเกลตามคุณภาพ×ธาตุ clamp ≤ cap
  const coins = Math.min(
    duration.coinCap,
    Math.round(duration.baseCoins * (1 + power * POWER_K) * (1 + elBonus)),
  )
  if (coins > 0) rewards.push({ type: 'coins', amount: coins })
  // ตั๋วกาชา — ลุ้น 1 ครั้งด้วย seed
  const chance = Math.min(
    TICKET_CHANCE_MAX,
    duration.ticketChance + power * TICKET_POWER_K + elBonus * TICKET_EL_K,
  )
  if (rng(seed)() < chance) rewards.push({ type: 'gachaTicket', amount: 1 })
  return rewards
}

/** สถานะ expedition: 'idle' (ไม่มี) | 'active' (กำลังไป) | 'ready' (กลับแล้วรอเก็บ) */
export function expeditionState(exp, now = Date.now()) {
  if (!exp) return 'idle'
  return now >= (exp.endsAt || 0) ? 'ready' : 'active'
}
