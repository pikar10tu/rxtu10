// 🧍 รหัสชุดตุ๊กตาแบบสั้น ขี่แถว roster (19 พ.ย. 2026) — ทุกหน้าวาดตุ๊กตาเพื่อนได้โดยไม่เสีย read เพิ่ม
// รูปแบบ: id ต่อกันด้วยจุด เช่น "s2.c1.h1.e1.m1.j1.t1.b2.k1" (~30–60 ตัวอักษร/คน)
// id ทุกตัวไม่ซ้ำกันทั้งระบบ (สีผิว s1–s5 · สีผม c1–c8 · ชิ้นส่วน) → ถอดกลับได้ว่าเป็นช่องไหนโดยไม่ต้องเก็บชื่อช่อง
// ⚠️ ห้ามเปลี่ยน/ลบ id ชิ้นที่ปล่อยแล้ว (แถว roster เก่าจะถอดไม่ออก) — ชิ้นที่หาไม่เจอจะถูกข้ามเงียบๆ
import { PART, SKINS, HAIRC, DEFAULT_EQ, REQUIRED } from '../data/dollParts.js'

const SKIN_IDS = new Set(SKINS.map(s => s.id))
const HAIR_IDS = new Set(HAIRC.map(c => c.id))

/** eq → รหัส (เฉพาะช่องที่มีค่า) */
export function encodeDoll(eq) {
  if (!eq || typeof eq !== 'object') return ''
  return Object.entries(eq)
    .filter(([k, id]) => id && (k === 's' ? SKIN_IDS.has(id) : k === 'c' ? HAIR_IDS.has(id) : PART[id]?.slot === k))
    .map(([, id]) => id)
    .join('.')
}

/** รหัส → eq · ว่าง = ชุดเริ่มต้น (ทุกคนมีตุ๊กตาเสมอ) · ช่องบังคับที่หายเติมค่าเริ่มต้น */
export function decodeDoll(code) {
  if (!code || typeof code !== 'string') return { ...DEFAULT_EQ }
  const eq = {}
  for (const id of code.split('.')) {
    if (SKIN_IDS.has(id)) eq.s = id
    else if (HAIR_IDS.has(id)) eq.c = id
    else if (PART[id]) eq[PART[id].slot] = id
  }
  // เติมเฉพาะช่องที่ห้ามว่าง (ช่องเสริมอย่างแก้ม/หมวก ถ้าเจ้าตัวถอดไว้ต้องว่างตามจริง)
  for (const k of REQUIRED) if (!eq[k]) eq[k] = DEFAULT_EQ[k]
  return eq
}
