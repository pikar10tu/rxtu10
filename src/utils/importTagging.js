// src/utils/importTagging.js
// ════════════════════════════════════════════════════════════
//  วางแผนการเขียนตอน import ข้อสอบย้อนหลัง (pure) —
//  ข้อซ้ำคลังเดิม (qhash ชน) เปลี่ยนจาก "ข้าม" เป็น "merge tag": arrayUnion ชุดใหม่เข้า doc เดิม
//  ข้อซ้ำกันเองในไฟล์ → รวม examSets เข้าตัวแรก (ไม่เขียน 2 docs)
// ════════════════════════════════════════════════════════════
import { qhash } from './qhash.js'

function unionInto(target, add) {
  for (const s of add || []) if (!target.includes(s)) target.push(s)
}

export function planImportWrites(rows, existing = []) {
  const byHash = new Map((existing || []).map(e => [e.qhash, e.id]))
  const freshByHash = new Map()   // hash → index ใน fresh (รวมซ้ำในไฟล์)
  const fresh = []
  const tagUpdates = []
  for (const r of rows || []) {
    const h = qhash(r.question)
    const sets = Array.isArray(r.examSets) ? r.examSets : []
    if (byHash.has(h)) {
      if (sets.length) tagUpdates.push({ id: byHash.get(h), addSets: [...sets] })
    } else if (freshByHash.has(h)) {
      unionInto(fresh[freshByHash.get(h)].examSets, sets)
    } else {
      const copy = { ...r, examSets: [...sets] }
      freshByHash.set(h, fresh.length)
      fresh.push(copy)
    }
  }
  return { fresh, tagUpdates }
}

export function stampFileSets(rows, fileSets = []) {
  if (!fileSets.length) return rows || []
  return (rows || []).map(r => {
    const sets = Array.isArray(r.examSets) ? r.examSets : []
    return sets.length ? r : { ...r, examSets: [...fileSets] }
  })
}
