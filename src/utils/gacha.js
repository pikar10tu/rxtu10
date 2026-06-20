// gacha (Phase B) — pure, ฉีด rng ได้ทุกฟังก์ชัน · ค่าทั้งหมด draft pin
export const GACHA_RATES = { common: 45, rare: 35, epic: 16, legendary: 4 } // % รวม 100 (ใจป้ำ 21 มิ.ย.)
export const SOFT_PITY = 40      // pull ที่เริ่มไต่ rate legendary
export const HARD_PITY = 50      // pull ที่การันตี legendary (ลดครึ่ง 21 มิ.ย.)
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

export const rarityPool = (catalog, rarity) => catalog.filter((p) => p.rarity === rarity).map((p) => p.id)

const RANK = { common: 0, rare: 1, epic: 2, legendary: 3 }

/** สุ่ม 1 ครั้งพร้อม carry state (pity/guaranteed/owned) */
export function rollOne(state, catalog, rng = Math.random) {
  const legendaryIds = rarityPool(catalog, 'legendary')
  const rarity = rollRarity(state.pity, rng)
  if (rarity === 'legendary') {
    const pick = pickLegendary({
      target: state.target, guaranteed: state.guaranteed,
      ownedLegendaryIds: state.ownedLegendaryIds, legendaryIds, rng,
    })
    const nextOwned = state.ownedLegendaryIds.includes(pick.id)
      ? state.ownedLegendaryIds : [...state.ownedLegendaryIds, pick.id]
    return { rarity, id: pick.id, won: pick.won, nextPity: 0, nextGuaranteed: pick.newGuaranteed, nextOwned }
  }
  const pool = rarityPool(catalog, rarity)
  const id = pool[Math.floor(rng() * pool.length)]
  return { rarity, id, won: null, nextPity: state.pity + 1, nextGuaranteed: state.guaranteed, nextOwned: state.ownedLegendaryIds }
}

/** สุ่ม n ครั้ง (carry state) + การันตี ≥1 epic ต่อ 10-pull */
export function rollMany(n, state, catalog, rng = Math.random) {
  let cur = { pity: state.pity, target: state.target, guaranteed: state.guaranteed, ownedLegendaryIds: [...(state.ownedLegendaryIds || [])] }
  const results = []
  for (let i = 0; i < n; i++) {
    const r = rollOne(cur, catalog, rng)
    results.push({ rarity: r.rarity, id: r.id, won: r.won })
    cur = { pity: r.nextPity, target: cur.target, guaranteed: r.nextGuaranteed, ownedLegendaryIds: r.nextOwned }
  }
  if (n >= 10 && !results.some((r) => RANK[r.rarity] >= RANK.epic)) {
    const pool = rarityPool(catalog, 'epic')
    results[results.length - 1] = { rarity: 'epic', id: pool[Math.floor(rng() * pool.length)], won: null }
  }
  return { results, nextState: { pity: cur.pity, target: cur.target, guaranteed: cur.guaranteed } }
}
