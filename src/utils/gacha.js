// gacha (Phase B) — pure, ฉีด rng ได้ทุกฟังก์ชัน · ค่าทั้งหมด draft pin
export const GACHA_RATES = { common: 48, rare: 35, epic: 16, legendary: 1 } // % รวม 100 · ตำนานคงที่ 1% ทั้งสองตู้ (user เคาะ 1 ต.ค. 2026)
// การันตีแบบ 7k (user เคาะ 1 ต.ค. 2026) — แถบ 0/100 แบ่งครึ่งที่ 50
//   ครั้งที่ 50 = ได้ตำนานแน่ ลุ้น 50% เป็นตัวที่เลือก · ชนะ ⇒ แถบรีเซ็ต · แพ้ ⇒ นับต่อ ครั้งที่ 100 ได้ตัวที่เลือกแน่นอน
//   ตำนานออกจากเรต 1% ก่อนครั้งที่ 50 ⇒ ถือเป็นครึ่งทาง (ลุ้น 50/50 เหมือนครั้งที่ 50) แพ้ ⇒ ตัวนับกระโดดไป 50 (user เคาะ 2 ต.ค.)
//   ตำนานออกในครึ่งหลัง (51–99) ⇒ ได้ตัวที่เลือกแน่นอน รีเซ็ต
//   ไม่ได้เลือกเป้า ⇒ ครั้งที่ 50 ได้ตำนานสุ่ม แล้วรีเซ็ต · ได้ตำนานสุ่มระหว่างทางก็รีเซ็ต
export const HALF_PITY = 50
export const HARD_PITY = 100
export const PULL_COST = 1000
export const TEN_PULL_COST = 10000
export const TEN_PULL_N = 11     // สุ่ม 10 ได้ 11 ตัว

/** % โอกาสออก legendary ของ pull ถัดไป — คงที่ (เลิกไต่ soft pity) · ครั้งที่ 50/100 จัดการใน rollOne */
export function legendaryChance() {
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

/** ตู้ธีม: ตัวเด่นของเดือนมีน้ำหนักเท่านี้เทียบกับ L ตัวอื่น (user เคาะ 26 ก.ย. 2026) */
export const THEME_FEATURED_WEIGHT = 3
/** ตู้ธีม: ตัวที่เลือกไว้หน้าตู้ ได้น้ำหนักเพิ่มจากตัวเด่นอีกขั้น (แบบ 7k — user เคาะ 1 ต.ค.) */
export const THEME_TARGET_WEIGHT = 6

/** legendary ของตู้ธีม — อัตรา L รวมไม่เปลี่ยน (ตัดสินแล้วใน rollRarity) เปลี่ยนแค่ "ได้ตัวไหน"
 *  ทุกครั้ง: ตัวเด่น ×THEME_FEATURED_WEIGHT · L ที่มาจาก hard pity + เลือกเป้าไว้ = ได้เป้าแน่นอน (user เคาะ 26 ก.ย.)
 *  ไม่มี 50/50 และไม่มีธงการันตีข้ามครั้ง — newGuaranteed คืน false เสมอเพื่อให้รูปเดียวกับ pickLegendary */
export function pickThemeLegendary({ target, atHardPity, legendaryIds, featured, rng = Math.random }) {
  if (target && atHardPity) return { id: target, won: true, newGuaranteed: false }
  const feat = new Set(featured || [])
  const w = (id) => (id === target ? THEME_TARGET_WEIGHT : feat.has(id) ? THEME_FEATURED_WEIGHT : 1)
  const total = legendaryIds.reduce((s, id) => s + w(id), 0)
  let r = rng() * total
  let id = legendaryIds[legendaryIds.length - 1]
  for (const x of legendaryIds) { r -= w(x); if (r < 0) { id = x; break } }
  return { id, won: target ? id === target : null, newGuaranteed: false }
}

export const rarityPool = (catalog, rarity) => catalog.filter((p) => p.rarity === rarity).map((p) => p.id)

const RANK = { common: 0, rare: 1, epic: 2, legendary: 3 }

/** สุ่มตำนาน 1 ตัว (ไม่ใช่การันตี) — ตู้ธีมถ่วงน้ำหนัก ×3/×6 · ตู้ปกติออกตัวที่ยังไม่มีก่อน */
function randomLegendary(state, legendaryIds, opts, rng, exclude = null) {
  const ids = exclude && legendaryIds.length > 1 ? legendaryIds.filter((id) => id !== exclude) : legendaryIds
  if (opts.theme) return pickThemeLegendary({ target: exclude ? null : state.target, atHardPity: false, legendaryIds: ids, featured: opts.theme.featured, rng }).id
  return pickLegendary({ target: null, guaranteed: false, ownedLegendaryIds: state.ownedLegendaryIds, legendaryIds: ids, rng }).id
}

/** สุ่ม 1 ครั้งพร้อม carry state (pity/owned) — กติกาการันตีดูหัวไฟล์
 *  `opts.legendaryIds` = คลัง legendary ของ "ตู้นี้" · `opts.theme` = ตู้ธีม (ถ่วงน้ำหนักตัวเด่น) */
export function rollOne(state, catalog, rng = Math.random, opts = {}) {
  const legendaryIds = opts.legendaryIds?.length ? opts.legendaryIds : rarityPool(catalog, 'legendary')
  const target = state.target && legendaryIds.includes(state.target) ? state.target : null
  // ย้ายระบบ: ธงแพ้ 50/50 ของระบบเก่า = อยู่ครึ่งหลังของแถบแล้ว
  const pity = state.guaranteed && target ? Math.max(state.pity, HALF_PITY) : state.pity
  const pull = pity + 1
  const done = (rarity, id, won, nextPity) => {
    const nextOwned = rarity !== 'legendary' || state.ownedLegendaryIds.includes(id) ? state.ownedLegendaryIds : [...state.ownedLegendaryIds, id]
    return { rarity, id, won, nextPity, nextGuaranteed: false, nextOwned }
  }
  // ลุ้นครึ่งทาง 50/50 — ชนะ = ได้เป้า รีเซ็ต · แพ้ = ตำนานตัวอื่น ตัวนับไปอยู่ที่ครึ่ง
  const halfRoll = () => rng() < 0.5
    ? done('legendary', target, true, 0)
    : done('legendary', randomLegendary(state, legendaryIds, opts, rng, target), false, HALF_PITY)
  if (target) {
    if (pull >= HARD_PITY) return done('legendary', target, true, 0)
    if (pull === HALF_PITY) return halfRoll()
  } else if (pull >= HALF_PITY) {
    return done('legendary', randomLegendary(state, legendaryIds, opts, rng), null, 0)
  }
  const rarity = rollRarity(pity, rng)
  if (rarity === 'legendary') {
    if (!target) return done(rarity, randomLegendary(state, legendaryIds, opts, rng), null, 0)
    // ครึ่งหลัง: ตำนานตัวถัดไป = การันตีได้เป้า · ครึ่งแรก: ออกก่อน = ปัดเป็นครึ่งทาง (user เคาะ 2 ต.ค.)
    if (pull > HALF_PITY) return done(rarity, target, true, 0)
    return halfRoll()
  }
  const pool = rarityPool(catalog, rarity)
  return done(rarity, pool[Math.floor(rng() * pool.length)], null, pull)
}

/** สุ่ม n ครั้ง (carry state) + การันตี ≥1 epic ต่อ 10-pull */
export function rollMany(n, state, catalog, rng = Math.random, opts = {}) {
  let cur = { pity: state.pity, target: state.target, guaranteed: state.guaranteed, ownedLegendaryIds: [...(state.ownedLegendaryIds || [])] }
  const results = []
  for (let i = 0; i < n; i++) {
    const r = rollOne(cur, catalog, rng, opts)
    results.push({ rarity: r.rarity, id: r.id, won: r.won })
    cur = { pity: r.nextPity, target: cur.target, guaranteed: r.nextGuaranteed, ownedLegendaryIds: r.nextOwned }
  }
  if (n >= 10 && !results.some((r) => RANK[r.rarity] >= RANK.epic)) {
    const pool = rarityPool(catalog, 'epic')
    results[results.length - 1] = { rarity: 'epic', id: pool[Math.floor(rng() * pool.length)], won: null }
  }
  return { results, nextState: { pity: cur.pity, target: cur.target, guaranteed: cur.guaranteed } }
}

/** ตั๋ว payment-first: คืนวิธีจ่ายของปุ่มสุ่ม (n=1 หรือ 10) ตามจำนวนตั๋วที่มี
 *  ×1 ใช้ 1 ตั๋ว / ×10 ใช้ 10 ตั๋ว (ได้ 11 ตัว) — มีตั๋วพอใช้ตั๋วก่อน ไม่พอจ่ายเหรียญ */
export function resolvePullPayment(n, tickets) {
  const single = n === 1
  const rolls = single ? 1 : TEN_PULL_N
  const ticketsNeeded = single ? 1 : 10
  if ((tickets || 0) >= ticketsNeeded) return { rolls, pay: 'ticket', amount: ticketsNeeded }
  return { rolls, pay: 'coin', amount: single ? PULL_COST : TEN_PULL_COST }
}
