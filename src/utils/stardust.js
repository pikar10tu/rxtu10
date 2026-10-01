// ประกายดาว — pure: ตัวซ้ำที่เกินจำนวนที่ยังต้องใช้อัพ กลายเป็นผงประกายดาวตามระดับของตัวนั้น
// user เคาะ 1 ต.ค. 2026 (เดโม https://claude.ai/artifact/UFPSy7HsjmWuLtmX8d2jtb)
// เพดานตัวซ้ำต่อเพ็ท = MAX_GRADE − เกรดปัจจุบัน (อัพขั้นละ 1 ชิ้น) ⇒ "ซ้ำเกิน 5" กับ "อัพเต็มแล้ว" คือกฎเดียวกัน
// ตัวซ้ำที่อยู่ใต้เพดานใช้อัพได้อย่างเดียว · ร้านแลกใช้ประกายดาวอย่างเดียว ไม่แตะตัวซ้ำ
// เทส: node --test src/utils/stardust.test.js
import { MAX_GRADE } from '../data/petPower.js'

export const DUST_KEYS = ['common', 'rare', 'epic', 'legendary']
// สีไม่ใช่สี RARITY ตรงๆ — ธรรมดาในเกมเป็นเทา ผงสีเทาดูไม่เป็นของรางวัล (เดโมที่ user เคาะใช้เขียว)
export const DUST = {
  common:    { label: 'เขียว', color: '#4fc38a', img: 'dust-common' },
  rare:      { label: 'ฟ้า',   color: '#4aa3f0', img: 'dust-rare' },
  epic:      { label: 'ม่วง',  color: '#a66cf0', img: 'dust-epic' },
  legendary: { label: 'ทอง',  color: '#f5b72e', img: 'dust-legendary' },
}
export const dustName = (k) => 'ประกายดาว' + (DUST[k]?.label || '')

/** เก็บตัวซ้ำได้อีกกี่ชิ้นก่อนกลายเป็นประกายดาว */
export function copyCap(pet) {
  const g = Math.min(MAX_GRADE, Math.max(0, Number(pet?.grade) || 0))
  return MAX_GRADE - g
}
export function excessOf(pet) {
  return Math.max(0, (pet?.copies || 0) - copyCap(pet))
}

export function emptyDust() { return { common: 0, rare: 0, epic: 0, legendary: 0 } }
export function dustOf(userData) {
  const d = userData?.stardust || {}
  const out = emptyDust()
  for (const k of DUST_KEYS) out[k] = Math.max(0, Math.floor(Number(d[k]) || 0))
  return out
}

/** ตัวซ้ำเก่าที่เกินเพดาน (ก่อนมีระบบ) — แถวต่อเพ็ท + ยอดรวมต่อระดับ · ไม่มีอะไรเกิน ⇒ rows ว่าง */
export function migrationPreview(pets) {
  const gain = emptyDust()
  const rows = []
  for (const p of pets || []) {
    const ex = excessOf(p)
    if (!ex || !gain.hasOwnProperty(p.rarity)) continue
    gain[p.rarity] += ex
    rows.push({ id: p.id, name: p.name, emoji: p.emoji, rarity: p.rarity, grade: p.grade || 0, copies: p.copies, keep: p.copies - ex, excess: ex })
  }
  return { rows, gain }
}
/** แปลงครั้งเดียว: ตัดตัวซ้ำลงเหลือเพดาน · คืน pets ใหม่ + ประกายดาวที่ได้ */
export function applyMigration(pets) {
  const { gain } = migrationPreview(pets)
  const next = (pets || []).map((p) => {
    const ex = DUST[p.rarity] ? excessOf(p) : 0
    return ex ? { ...p, copies: p.copies - ex } : p
  })
  return { pets: next, gain }
}

// ── ร้านแลก ── (id ห้ามเปลี่ยน — ผูกกับ log/เทส)
export const DUST_COIN = { common: 50, rare: 200, epic: 800, legendary: 3000 } // อัตราขายตัวซ้ำเดิม
export const OFFERS = [
  { id: 'month',  sec: 'month', cost: ['legendary', 5], title: 'สุ่ม 1 ใน 3', kind: 'monthPet' },
  { id: 'pick',   sec: 'legend', cost: ['legendary', 7], title: 'เลือกตัวได้', kind: 'pickPet' },
  { id: 'legend', sec: 'legend', cost: ['legendary', 3], title: 'สุ่มตำนาน', kind: 'randPet', rarity: 'legendary' },
  { id: 'up-rare',  sec: 'up', cost: ['common', 15], title: 'สุ่มหายาก 1 ตัว', kind: 'randPet', rarity: 'rare' },
  { id: 'up-epic',  sec: 'up', cost: ['rare', 12],   title: 'สุ่มเอพิค 1 ตัว', kind: 'randPet', rarity: 'epic' },
  { id: 'up-leg',   sec: 'up', cost: ['epic', 10],   title: 'สุ่มตำนาน 1 ตัว', kind: 'randPet', rarity: 'legendary' },
  { id: 'antiloss', sec: 'item', cost: ['common', 10], title: 'ยาแก้แพ้', kind: 'antiLoss' },
]
export const canAfford = (dust, [k, n]) => (dust?.[k] || 0) >= n

/** สุ่ม uniform จาก ids · ว่าง ⇒ null */
export function pickRandom(ids, rng = Math.random) {
  return ids?.length ? ids[Math.floor(rng() * ids.length)] : null
}

/** บวก/ลบผง: คืน map ใหม่ (optimistic) + คู่ [key, delta] ที่ไม่เป็นศูนย์ (ให้ผู้เรียกแปลงเป็น increment ของ 'stardust.<k>') */
export function addDust(cur, delta) {
  const next = { ...emptyDust(), ...(cur || {}) }
  const changes = []
  for (const k of DUST_KEYS) {
    const d = Math.floor(delta?.[k] || 0)
    if (!d) continue
    next[k] = (next[k] || 0) + d
    changes.push([k, d])
  }
  return { next, changes }
}
