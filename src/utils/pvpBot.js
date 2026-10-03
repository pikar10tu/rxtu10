// src/utils/pvpBot.js
// PvP bot — pure: หุ่นซ้อมที่ "เติมช่องว่าง" บนกระดานเมื่อคนจริงไม่ครบ
// deterministic จาก seed (แนวเดียว getFloorTeam)
//
// ⚠️ ของเดิมสเกลบอทตาม "เรต" ทั้งที่ความแกร่งจริงมาจาก "เพ็ท" — วัดจริง 200 ไฟต์/ช่องแล้ว
//    ได้ 0% หรือ 100% แทบทุกช่อง คือปุ่มเหรียญฟรีกับกำแพง ไม่ใช่ตัวเลือกความยาก
//    ของใหม่เล็งที่ teamPower ของผู้เล่นโดยตรง
import { BATTLE_SLOTS } from '../data/residence.js'
import { RARITY_ORDER, MAX_GRADE } from '../data/petPower.js'
import { mulberry32 } from './seededRng.js'
import { teamPower } from './pvpCoins.js'
import { PVP_RATING_FLOOR } from './pvpRating.js'
import { releasedPets } from './petCatalog.js'

const ELS = ['fist', 'scissors', 'paper']

// อัตราส่วนพลังของบอทเทียบกับทีมผู้เล่น เรียงตามลำดับที่อยากให้โผล่ก่อน
export const BOT_POWER_RATIOS = [0.75, 1.15, 0.9, 1.3, 1.0]

// ป้ายผูกกับอัตราส่วนแบบหนึ่งต่อหนึ่ง — ห้ามคำนวณจากช่วงค่า เพราะ 0.75 กับ 0.9
// จะตกช่วงเดียวกันแล้วได้ป้าย "อ่อน" ซ้ำ ⇒ บนกระดานจะมี "หุ่นซ้อม · อ่อน" สองใบที่แยกไม่ออก
const BOT_LABELS = ['อ่อน', 'แกร่ง', 'อ่อนนิดหน่อย', 'แกร่งมาก', 'พอกัน']

/** ทีมหุ่นซ้อมที่ความหายาก/เกรดกำหนด · ธาตุผสมจาก seed
 *  🔴 สุ่มจาก `releasedPets(gachaEvent)` เท่านั้น — ห้ามสุ่มจาก PETS เต็มคลังตรงๆ
 *     ไม่งั้นบอทสนามประลองพาเพ็ทรุ่นที่ยังไม่เปิดตัว (เช่น wave 3 ฟากฟ้า) โผล่ให้เห็นก่อนเวลา
 *     `gachaEvent` = null (ไม่ส่งมา) ⇒ ปลอดภัยสุด (wave 1 เท่านั้น) — ผู้เรียกที่มี config จริงต้องส่งมา */
export function botTeamOf(rarity, grade, seed, gachaEvent = null) {
  const rand = mulberry32((seed >>> 0) || 1)
  const team = []
  const pets = releasedPets(gachaEvent)
  for (let i = 0; i < BATTLE_SLOTS; i++) {
    const element = ELS[((seed >>> 0) + i) % 3]
    const pool = pets.filter(p => p.rarity === rarity && p.element === element)
    const fallback = pets.filter(p => p.element === element)
    const src = pool.length ? pool : fallback
    const def = src[Math.floor(rand() * src.length)]
    team.push({ id: def.id, rarity: def.rarity, element: def.element, grade })
  }
  return team
}

/** ทีมที่พลังใกล้ targetPower ที่สุด — ไล่กริด (ความหายาก × เกรด) = 24 แบบ */
export function botTeamForPower(targetPower, seed, gachaEvent = null) {
  let bestTeam = null
  let bestDiff = Infinity
  for (const rarity of RARITY_ORDER) {
    for (let grade = 0; grade <= MAX_GRADE; grade++) {
      const team = botTeamOf(rarity, grade, seed, gachaEvent)
      const diff = Math.abs(teamPower(team) - targetPower)
      if (diff < bestDiff) { bestDiff = diff; bestTeam = team }
    }
  }
  return bestTeam
}

/**
 * บอทเติมช่องว่างบนกระดาน — เล็งพลังจากทีมผู้เล่น ไม่ใช่จากเรต
 * count = จำนวนช่องที่คนจริงเติมไม่ครบ (ปกติชั้นปีมีคนเกิน 5 คน ⇒ 0 = ไม่เห็นบอทเลย)
 * gachaEvent = config/app.gachaEvent สด (ผ่าน useAppConfig().rawConfig) — ส่งต่อให้ botTeamForPower
 * กันเพ็ทรุ่นที่ยังไม่เปิดตัวโผล่ในทีมบอท (ดู docblock ของ botTeamOf)
 */
export function getFallbackBots(myPower, myRating, seed, count, gachaEvent = null) {
  const n = Math.max(0, Math.min(count, BOT_POWER_RATIOS.length))
  const out = []
  for (let i = 0; i < n; i++) {
    const ratio = BOT_POWER_RATIOS[i]
    // seed ต่างกันต่อตัว กันบอทสองตัวได้ทีมซ้ำกัน
    const s = ((seed >>> 0) ^ Math.imul(0x9e3779b9, i + 1)) >>> 0
    out.push({
      uid: `bot-${i}`,
      name: 'หุ่นซ้อม',
      label: BOT_LABELS[i],
      isBot: true,
      rating: Math.max(PVP_RATING_FLOOR, Math.round(myRating * ratio)),
      team: botTeamForPower(myPower * ratio, s, gachaEvent),
    })
  }
  return out
}

// ── 🐣 หุ่นซ้อมมือใหม่ (user สั่ง 2 ต.ค. 2026 — คนใหม่เข้ามาแพ้ยับแล้วเลิกเล่น) ──
//  ทีมบอท = เลียนทีมเราทีละช่อง สุ่มพันธุ์ใหม่ (ดู rookieBot ด้านล่างสำหรับการลดระดับ)
//  วัดจริง 300 ไฟต์/แบบ (ทุกระดับทีม c0..l2+ทีมผสม): เต็มทีม ≈ ชนะ 50% · ขาด 1 ตัว ≈ 99%
//  ⇒ สุ่มขาดตัวครึ่งหนึ่ง = ชนะเฉลี่ย ~75% ไม่ว่าเพ็ทระดับไหน (เล็งตาม teamPower ไม่ได้ — กริดหยาบ วัดแล้ว 2%–100% กระโดด)
export const ROOKIE_DROP_CHANCE = 0.5
//  โอกาสเจอหุ่นแทนคนจริง
//   · สู้ยังไม่ถึง 3 ตา → หุ่นเสมอ (คนใหม่เริ่ม 1000 = ไม่เข้าเกณฑ์แต้ม ต้องมีด่านนี้)
//   · แต้ม < 1000 → 70% · แพ้ติด 2 ตาขึ้นไป → 100%
//   · แต้ม 1000–1099 แพ้ติด 2 ตาขึ้นไป → 50% · นอกนั้น 0
export const ROOKIE_FIGHTS = 3
// ช่วงชั้น (user เคาะ 3 ต.ค. 2026 พร้อมเคิร์ฟแต้มใหม่): แต้มสูงก็ยังมีหุ่นซ้อมรับตอนแพ้ติด กันหมดกำลังใจ
//   < 1000 → 70% (แพ้ติด 2 = 100%) · 1000–1199 → แพ้ติด 2 = 50% · 1200–1499 → แพ้ติด 3 = 40% · 1500+ → แพ้ติด 3 = 30%
export function rookieBotChance({ rating = 1000, loseStreak = 0, fights = 0 } = {}) {
  if ((fights || 0) < ROOKIE_FIGHTS) return 1
  const s = loseStreak || 0
  if (rating < 1000) return s >= 2 ? 1 : 0.7
  if (rating < 1200) return s >= 2 ? 0.5 : 0
  if (rating < 1500) return s >= 3 ? 0.4 : 0
  return s >= 3 ? 0.3 : 0
}

/** หุ่นซ้อมมือใหม่ · myTeam = battle units ของเรา ({rarity, grade})
 *  แบบผสม (user เคาะ 2 ต.ค.): อีปิค/ตำนาน → บอทลด 1 ระดับ เกรดเท่าเดิม (ตำนานมีโอกาส 20% คงไว้ 1 ตัว)
 *  แรร์/ธรรมดา → ระดับเท่าเดิม · ถ้าทั้งทีมไม่มีช่องที่ถูกลด ⇒ สุ่มขาด 1 ตัว 50%
 *  ⚠️ ห้ามลดแรร์→ธรรมดา: sim ทีมแรร์ ×3 เจอธรรมดา ×3 ชนะแค่ 4% (ธรรมดาบางตัวชนะทางแรร์) */
export const ROOKIE_KEEP_LEGEND = 0.2
const ROOKIE_DOWN = { epic: 'rare', legendary: 'epic' }
export function rookieBot(myTeam, myRating, seed, gachaEvent = null) {
  const rand = mulberry32((seed >>> 0) || 1)
  const pets = releasedPets(gachaEvent)
  let keptLegend = false, downed = 0
  let team = (myTeam || []).filter(Boolean).map(p => {
    let rarity = p.rarity
    if (ROOKIE_DOWN[rarity]) {
      if (rarity === 'legendary' && !keptLegend && rand() < ROOKIE_KEEP_LEGEND) keptLegend = true
      else { rarity = ROOKIE_DOWN[rarity]; downed++ }
    }
    const pool = pets.filter(d => d.rarity === rarity)
    const src = pool.length ? pool : pets
    const def = src[Math.floor(rand() * src.length)]
    return { id: def.id, rarity: def.rarity, element: def.element, grade: p.grade || 0 }
  })
  if (!downed && team.length > 1 && rand() < ROOKIE_DROP_CHANCE) team.splice(Math.floor(rand() * team.length), 1)
  return {
    uid: 'bot-rookie', name: 'หุ่นซ้อม', label: 'มือใหม่', isBot: true,
    rating: Math.max(PVP_RATING_FLOOR, myRating), team,
  }
}
