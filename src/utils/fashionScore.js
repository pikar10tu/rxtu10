// ✨ คะแนนเฉิดฉาย (คะแนนแฟชั่น · 19 พ.ย. 2026 · user) — ใช้เรียงรายชื่อเพื่อน
// 🤫 ลับ: ไม่โชว์ตัวเลขหรือวิธีคิดที่ไหนในเว็บ ให้เพื่อนสังเกตเอาเอง — อย่าเขียนสูตรลงข้อความที่ผู้ใช้เห็น
//
// นับ "ทุกชิ้นที่มี" ไม่ใช่แค่ที่ใส่อยู่ (user สั่ง): ชิ้นตุ๊กตาที่ซื้อ + ร้านตกแต่ง (สีชื่อ กรอบ ป้าย พื้นการ์ด) + เลเวลบ้าน
// แต่ละชิ้น = 1 + √(ราคา/1000) ปัดลง → ของเยอะได้คะแนนตามจำนวน ของแพงได้มากขึ้นแต่ไม่พุ่งจนคนมีของ 2–3 ชิ้นแพงๆ ชนะทุกคน
//   ตัวอย่าง: 3k → 2 · 15k → 4 · 60k → 8 · 400k → 21 · 2M → 45
// บ้าน = เลเวล × 8 (เลเวล 15 = 120 · 20 = 160) — 20 พ.ย. user ขอให้ที่อยู่มีน้ำหนักมากขึ้น (เดิม × 4)
//   คนขยันแต่งตัวจัดเต็มยังแซงคนบ้านสูงที่ไม่แต่งได้ (user ตั้งใจ)
// ของฟรี (ชุดเริ่มต้น หน้าตา) ไม่นับ — ทุกคนมีเท่ากัน
import { dollOf } from './doll.js'
import { cosOf } from './cosmetics.js'
import { PART } from '../data/dollParts.js'
import { getCosmetic } from '../data/cosmetics.js'

const itemPts = (price) => (price > 0 ? 1 + Math.floor(Math.sqrt(price / 1000)) : 0)

export function fashionScore(u) {
  if (!u) return 0
  let pts = 0
  for (const id of dollOf(u).owned) pts += itemPts(PART[id]?.price || 0)
  for (const id of cosOf(u).owned) pts += itemPts(getCosmetic(id)?.price || 0)
  const lv = Math.max(1, Number(u.residence?.level) || 1)
  return pts + lv * 8
}
