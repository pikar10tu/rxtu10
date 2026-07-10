// src/utils/examSets.js
// ════════════════════════════════════════════════════════════
//  ชุดข้อสอบย้อนหลัง — pure logic (ไม่แตะ Firestore/Vue)
//  - normalizeExamYear : coerce → พ.ศ. (ค.ศ.→+543) ในช่วงที่ยอมรับ ไม่งั้น null
//  - upsertExamSet      : dedup ตาม name (ชื่อซ้ำ = อัปเดตปี) — ห้าม arrayUnion object
//  - keepKnownSets      : คัดชื่อชุดให้เหลือเฉพาะที่อยู่ใน config (กัน fragmentation)
// ════════════════════════════════════════════════════════════
import { cleanText, LIMITS } from './text.js'

const YEAR_MIN = 2500
const YEAR_MAX = 2600

export function normalizeExamYear(y) {
  let n = Math.trunc(Number(y))
  if (!Number.isFinite(n)) return null
  if (n < 2400) n += 543               // ค.ศ. → พ.ศ.
  return (n >= YEAR_MIN && n <= YEAR_MAX) ? n : null
}

// คืน { list ใหม่, entry ที่ upsert } — name ว่างหลัง clean = null
export function upsertExamSet(list, name, year) {
  const clean = cleanText(name, LIMITS.category)
  if (!clean) return null
  const entry = { name: clean, year: normalizeExamYear(year) }
  const next = Array.isArray(list) ? [...list] : []
  const i = next.findIndex(s => s && s.name === clean)
  if (i >= 0) next[i] = entry
  else next.push(entry)
  return { list: next, entry }
}

export function keepKnownSets(sets, knownNames) {
  if (!Array.isArray(sets)) return []
  const known = new Set(knownNames || [])
  return [...new Set(sets.filter(s => s && known.has(s)))]
}

export function examSetLabel(entry) {
  if (!entry || !entry.name) return ''
  return entry.year ? `${entry.name} · ${entry.year}` : entry.name
}
