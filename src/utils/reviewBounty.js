// รางวัลตรวจข้อนี้ = ฐาน + โบนัสต่อคนในทีมที่กดข้ามไปแล้ว (ไม่นับตัวเอง) — user สั่ง 27 ก.ย. 2026
// pure (ไม่ import firebase) ใช้ทั้งตอนโชว์บนการ์ดและตอนจ่ายจริง ให้ตัวเลขตรงกันเสมอ
import { REVIEW_SKIP_BONUS } from '../data/index.js'

export const othersSkipped = (q, uid) => (q?.reviewSkips || []).filter(u => u !== uid).length
export const reviewBounty = (q, uid, base) => base + REVIEW_SKIP_BONUS * othersSkipped(q, uid)
