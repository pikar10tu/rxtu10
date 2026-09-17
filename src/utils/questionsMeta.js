import { DOMAIN_KEYS } from '../data/domains.js'
import { getCategories } from './questionCategories.js'

// buildMeta — pure: สรุปข้อมูลคลังให้หน้า quiz home ใช้โดยไม่ต้องโหลดทั้งคลัง
//  publishedTotal = จำนวนข้อที่เผยแพร่ · categories = หมวดย่อยไม่ซ้ำ · domains = นับต่อ domain ใหญ่
//  approvedTotal/approvedDomains/examSets[].approvedCount = เหมือนกันแต่นับเฉพาะ reviewStatus==='passed'
export function buildMeta(questions) {
  const pub = questions.filter(q => q && q.isPublished === true)
  const approved = pub.filter(q => q.reviewStatus === 'passed')
  const cats = [...new Set(pub.flatMap(q => getCategories(q)))]
  cats.sort((a, b) => a.localeCompare(b, 'th'))
  const domains = Object.fromEntries(DOMAIN_KEYS.map(k => [k, 0]))
  const approvedDomains = Object.fromEntries(DOMAIN_KEYS.map(k => [k, 0]))
  for (const q of pub) {
    if (q.domain in domains) domains[q.domain]++
  }
  for (const q of approved) {
    if (q.domain in approvedDomains) approvedDomains[q.domain]++
  }
  // นับชุดข้อสอบย้อนหลัง (published เท่านั้น) — 1 ข้ออยู่หลายชุดนับทุกชุด
  const examCounts = {}
  const approvedExamCounts = {}
  for (const q of pub) {
    for (const name of (Array.isArray(q.examSets) ? q.examSets : [])) {
      if (!name) continue
      examCounts[name] = (examCounts[name] || 0) + 1
      if (q.reviewStatus === 'passed') approvedExamCounts[name] = (approvedExamCounts[name] || 0) + 1
    }
  }
  const examSets = Object.entries(examCounts)
    .map(([name, count]) => ({ name, count, approvedCount: approvedExamCounts[name] || 0 }))
    .sort((a, b) => a.name.localeCompare(b.name, 'th'))
  return {
    publishedTotal: pub.length,
    approvedTotal: approved.length,
    categories: cats,
    domains,
    approvedDomains,
    examSets,
  }
}
