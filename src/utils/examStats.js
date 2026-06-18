// aggregateExamStats — pure: สรุปประวัติข้อสอบของผู้ใช้
//  sessions เรียงใหม่→เก่า (อย่างที่ query orderBy ts desc มา)
//  byDomain วนจาก DOMAIN_KEYS เสมอ (เพิ่ม domain ใหม่ไม่ต้องแก้ logic) + ทน session เก่า
import { DOMAIN_KEYS } from '../data/domains.js'

const pctOf = (c, t) => (t > 0 ? Math.round((c / t) * 100) : 0)
const sessionPct = (s) => (typeof s.pct === 'number' ? s.pct : pctOf(s.correct || 0, s.total || 0))

export function aggregateExamStats(sessions) {
  const list = Array.isArray(sessions) ? sessions : []

  const byDomain = Object.fromEntries(DOMAIN_KEYS.map(k => [k, { c: 0, t: 0, pct: 0 }]))
  for (const s of list) {
    const ds = s && s.domainStats
    if (!ds) continue
    for (const k of DOMAIN_KEYS) {
      const d = ds[k]
      if (d && typeof d === 'object') {
        byDomain[k].c += Number(d.c) || 0
        byDomain[k].t += Number(d.t) || 0
      }
    }
  }
  for (const k of DOMAIN_KEYS) byDomain[k].pct = pctOf(byDomain[k].c, byDomain[k].t)

  const latest = list.length
    ? { correct: list[0].correct || 0, total: list[0].total || 0, pct: sessionPct(list[0]) }
    : null

  const trend = list.slice().reverse().map(sessionPct)

  return { count: list.length, latest, trend, byDomain }
}
