// gacha (Phase B) — pure, ฉีด rng ได้ทุกฟังก์ชัน · ค่าทั้งหมด draft pin
export const GACHA_RATES = { common: 60.5, rare: 30, epic: 8, legendary: 1.5 } // % รวม 100
export const SOFT_PITY = 76      // pull ที่เริ่มไต่ rate legendary
export const HARD_PITY = 100     // pull ที่การันตี legendary
export const SOFT_PITY_STEP = 6  // +%/pull หลัง soft pity
export const PULL_COST = 1000
export const TEN_PULL_COST = 10000
export const TEN_PULL_N = 11     // สุ่ม 10 ได้ 11 ตัว

/** % โอกาสออก legendary ของ pull ถัดไป เมื่อ pity = pull ที่สะสมตั้งแต่ legendary ล่าสุด */
export function legendaryChance(pity) {
  const pull = pity + 1
  if (pull >= HARD_PITY) return 100
  if (pull >= SOFT_PITY) return Math.min(100, GACHA_RATES.legendary + (pull - SOFT_PITY + 1) * SOFT_PITY_STEP)
  return GACHA_RATES.legendary
}

/** สุ่ม rarity 1 ครั้ง (อาจเรียก rng ได้ถึง 2 ครั้ง: เช็ค legendary → เลือก tier ล่าง) */
export function rollRarity(pity, rng = Math.random) {
  if (rng() * 100 < legendaryChance(pity)) return 'legendary'
  const rest = GACHA_RATES.common + GACHA_RATES.rare + GACHA_RATES.epic // 98.5
  const r = rng() * rest
  if (r < GACHA_RATES.epic) return 'epic'
  if (r < GACHA_RATES.epic + GACHA_RATES.rare) return 'rare'
  return 'common'
}

/** เลือกตัว legendary ที่จะออก ตามระบบเป้า 50/50 หรือ new-first */
export function pickLegendary({ target, guaranteed, ownedLegendaryIds, legendaryIds, rng = Math.random }) {
  if (target) {
    if (guaranteed) return { id: target, won: true, newGuaranteed: false }
    if (rng() < 0.5) return { id: target, won: true, newGuaranteed: false }
    const others = legendaryIds.filter((id) => id !== target)
    const id = others.length ? others[Math.floor(rng() * others.length)] : target
    return { id, won: false, newGuaranteed: true }
  }
  // new-first: สุ่มตัวที่ยังไม่มีก่อน, ครบแล้วสุ่มทั้งหมด
  const owned = new Set(ownedLegendaryIds || [])
  const unowned = legendaryIds.filter((id) => !owned.has(id))
  const pool = unowned.length ? unowned : legendaryIds
  return { id: pool[Math.floor(rng() * pool.length)], won: null, newGuaranteed: false }
}
