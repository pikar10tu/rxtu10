// ☕ ผู้สนับสนุน (เลี้ยงกาแฟผู้พัฒนา · 27 พ.ย. 2026)
// ชุดเบค = ของขอบคุณ (limited ใน data/dollParts.js) แนบไปกับจดหมายขอบคุณหลังแอดมินอนุมัติ · หน้าเลี้ยงกาแฟ (หน้าโอน) บอกแค่ "มีของตอบแทนเล็กๆ" ไม่บอกว่าเป็นอะไร · ตู้เสื้อผ้า: คนมีแล้วกดชิ้นบัฟ → toast บอก +5/วิ
// บัฟ: ใส่เสื้อเบค/ชุดเบค/หมวกเบค ชิ้นใดก็ได้ → โฟกัส +5 เหรียญ/วิ (ก่อนคูณเทศกาลสอบ) · หลายชิ้นไม่ซ้อน · ปีกสายรุ้งไม่มีบัฟ
import { dollOf } from './doll.js'

export const BEK_BUFF_PARTS = ['t20', 'f64', 'x58']
export const BEK_GIFT_PARTS = ['t20', 'f64', 'x58', 'w28']
export const BEK_FOCUS_BONUS = 5

/** โบนัสเหรียญโฟกัสต่อวินาทีจากชุดที่ใส่อยู่จริง (ต้องมีของ — dollOf กรองของที่ไม่มีออกแล้ว) */
export function focusBonus(u) {
  const { eq } = dollOf(u)
  return Object.values(eq).some(id => BEK_BUFF_PARTS.includes(id)) ? BEK_FOCUS_BONUS : 0
}

// พร้อมเพย์ · ยอดให้เพื่อนกรอกเอง (แนะนำใส่เศษสตางค์ที่ไม่ซ้ำ ไว้เทียบในแอปธนาคาร) · ไม่มีขั้นต่ำ · เลี้ยงซ้ำได้ แจ้งทีละครั้ง
export const PROMPTPAY_ID = '0877322930'
export const PROMPTPAY_NAME = 'ประวิชญ์ อำนวยพันธ์วิไล'

/** ยอดที่เพื่อนพิมพ์ → "50.67" (ทศนิยม 2 ตำแหน่ง) · ไม่ใช่ตัวเลข/≤0/เกินเหตุ → null */
export function parseBaht(raw) {
  const t = String(raw ?? '').replace(/[,\s฿บาท]/g, '')
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return null
  const n = Number(t)
  if (!(n > 0) || n > 1e6) return null
  return n.toFixed(2)
}
