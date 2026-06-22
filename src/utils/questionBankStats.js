// ภาพรวมคลังข้อสอบ — pure: นับจาก list ที่โหลดอยู่ (ไม่ยิง read เพิ่ม)
// byDomain วนจาก DOMAIN_KEYS เสมอ + bucket none (ทน domain เพิ่มใหม่/ข้อไม่ระบุ domain)
import { DOMAIN_KEYS } from '../data/domains.js'

export function bankStats(list) {
  const arr = Array.isArray(list) ? list : []
  const byDomain = Object.fromEntries(DOMAIN_KEYS.map(k => [k, 0]))
  byDomain.none = 0
  let published = 0
  for (const q of arr) {
    if (q && q.isPublished === true) published++
    const k = (q && DOMAIN_KEYS.includes(q.domain)) ? q.domain : 'none'
    byDomain[k]++
  }
  return { total: arr.length, published, draft: arr.length - published, byDomain }
}
