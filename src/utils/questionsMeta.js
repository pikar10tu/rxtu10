import { DOMAIN_KEYS } from '../data/domains.js'

// buildMeta — pure: สรุปข้อมูลคลังให้หน้า quiz home ใช้โดยไม่ต้องโหลดทั้งคลัง
//  publishedTotal = จำนวนข้อที่เผยแพร่ · categories = หมวดย่อยไม่ซ้ำ · domains = นับต่อ domain ใหญ่
export function buildMeta(questions) {
  const pub = questions.filter(q => q && q.isPublished === true)
  const cats = [...new Set(pub.map(q => (q.category || '').trim()).filter(Boolean))]
  cats.sort((a, b) => a.localeCompare(b, 'th'))
  const domains = Object.fromEntries(DOMAIN_KEYS.map(k => [k, 0]))
  for (const q of pub) {
    if (q.domain in domains) domains[q.domain]++
  }
  return { publishedTotal: pub.length, categories: cats, domains }
}
