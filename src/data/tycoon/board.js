// 🎲 เศรษฐีรอบโลก — กระดาน 32 ช่อง + ค่าคงที่เกม (ตัวเลขทั้งหมดเป็นค่าตั้งต้น จูนได้)
// spec: docs/superpowers/specs/2026-11-22-world-tycoon-design.md
// มุม 0 เริ่ม · 8 คุก · 16 เทศกาล · 24 เที่ยวรอบโลก · ด้านละ 7 ช่อง
// เมือง 18 (9 กลุ่มสี × 2) · ท่องเที่ยว 4 (ด้านละ 1) · การ์ด 4 · มินิเกม 1 · ภาษี 1

export const GAME = {
  startCash: 1500,
  salary: 200,
  maxRounds: 20,
  jailTurns: 2,
  bail: 100,
  travelFee: 50,
  taxPct: 0.10,
  controlChance: 0.40,   // แถบพลัง: โอกาสคุมเต๋าติด → ผลรวมอยู่ใน ±3 ของที่เล็ง
  controlSpread: 3,
  turnSeconds: 20,
  maxHeldCards: 2,
  minigameMax: 200,
  tourToll: 60,          // ต่อเมืองท่องเที่ยวที่เจ้าของมี
  tourPrice: 150,
}

// สีกลุ่ม (พาสเทล) — ไล่ราคาขึ้นตามเลขกลุ่ม
export const GROUPS = [
  { color: '#a7d8a3', land: 50 },
  { color: '#9fd3e8', land: 70 },
  { color: '#b7b4f0', land: 90 },
  { color: '#f2b8d8', land: 110 },
  { color: '#f7c99b', land: 130 },
  { color: '#f2a5a5', land: 150 },
  { color: '#f0d77a', land: 170 },
  { color: '#8fd1c0', land: 200 },
  { color: '#c9a3e6', land: 240 },
]

const C = (name, emoji, group) => ({ type: 'city', name, emoji, group })
const T = (name, emoji) => ({ type: 'tour', name, emoji })

export const TILES = [
  { type: 'start', name: 'จุดเริ่มต้น', emoji: '🏁' },
  C('ฮานอย', '🍜', 0), { type: 'minigame', name: 'เข็มนำโชค', emoji: '🎯' }, C('กรุงเทพฯ', '🛕', 0),
  { type: 'chance', name: 'การ์ดดวง', emoji: '🃏' }, T('เกาะสมุย', '🏝️'), C('สิงคโปร์', '🦁', 1), C('ไทเป', '🏙️', 1),
  { type: 'jail', name: 'ห้องขัง', emoji: '🔒' },
  T('บาหลี', '🌺'), C('โซล', '🏯', 2), C('โตเกียว', '🗼', 2),
  { type: 'chance', name: 'การ์ดดวง', emoji: '🃏' }, C('ดูไบ', '🕌', 3), C('ไคโร', '🐫', 3), C('อิสตันบูล', '🧿', 4),
  { type: 'festival', name: 'เทศกาล', emoji: '🎉' },
  C('เอเธนส์', '🏛️', 4), T('ซานโตรินี', '⛵'), C('โรม', '🍕', 5),
  { type: 'chance', name: 'การ์ดดวง', emoji: '🃏' }, C('ปราก', '🏰', 5), C('เบอร์ลิน', '🥨', 6), C('เจนีวา', '⌚', 6),
  { type: 'travel', name: 'เที่ยวรอบโลก', emoji: '✈️' },
  T('ฮาวาย', '🌋'), C('ลอนดอน', '💂', 7), C('ปารีส', '🗼', 7),
  { type: 'chance', name: 'การ์ดดวง', emoji: '🃏' }, C('ซิดนีย์', '🦘', 8), { type: 'tax', name: 'สรรพากร', emoji: '🧾' }, C('นิวยอร์ก', '🗽', 8),
].map((t, idx) => ({ ...t, idx }))

export const SIDES = [0, 1, 2, 3].map(s => TILES.slice(s * 8 + 1, s * 8 + 8).map(t => t.idx))
export const TOURS = TILES.filter(t => t.type === 'tour').map(t => t.idx)
export const GROUP_TILES = GROUPS.map((_, g) => TILES.filter(t => t.group === g).map(t => t.idx))
export const isOwnable = (idx) => TILES[idx].type === 'city' || TILES[idx].type === 'tour'

/** ตำแหน่งบนตาราง 9×9 (เริ่มมุมขวาล่าง เดินทวนเข็มไปทางซ้าย) → { row, col } 1-based สำหรับ CSS grid */
export function tileGrid(idx) {
  if (idx <= 8) return { row: 9, col: 9 - idx }
  if (idx <= 16) return { row: 9 - (idx - 8), col: 1 }
  if (idx <= 24) return { row: 1, col: 1 + (idx - 16) }
  return { row: 1 + (idx - 24), col: 9 }
}
