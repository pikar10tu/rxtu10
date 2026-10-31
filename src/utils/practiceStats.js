/**
 * สถิติฝึกรายกลุ่มโรค — `study.gs.{pleGroup} = { c, t }` บน user doc (ถูก/ทำ)
 * spec: docs/superpowers/specs/2026-10-31-practice-stats-radar-design.md
 * ตรรกะล้วน ไม่แตะ Firestore/Vue — เทส `node --test src/utils/practiceStats.test.js`
 */
import { groupByKey, isPleGroupKey } from '../data/plecc.js'

// radar 21 ด้าน = 22 pleGroup โดยรวมกฎหมาย (other) + สังคม/ระบาด (sci_social) เป็นด้านเดียว (ทีมเคาะ 24 ก.ย.)
// ป้ายบนกราฟ = ตัวย่ออังกฤษสั้น (จอมือถือ) · ชื่อเต็มโชว์ตอนแตะ
export const RADAR_AXES = [
  { key: 'cvs', label: 'CVS', groups: ['cvs'] },
  { key: 'endo', label: 'Endo', groups: ['endo'] },
  { key: 'renal', label: 'Renal', groups: ['renal'] },
  { key: 'gu', label: 'GU', groups: ['gu'] },
  { key: 'id', label: 'ID', groups: ['id'] },
  { key: 'neuro', label: 'Neuro', groups: ['neuro'] },
  { key: 'psych', label: 'Psych', groups: ['psych'] },
  { key: 'pulm', label: 'Pulm', groups: ['pulm'] },
  { key: 'immu', label: 'Immuno', groups: ['immu'] },
  { key: 'gi', label: 'GI', groups: ['gi'] },
  { key: 'heme', label: 'Heme', groups: ['heme'] },
  { key: 'onco', label: 'Onco', groups: ['onco'] },
  { key: 'msk', label: 'MSK', groups: ['msk'] },
  { key: 'derm', label: 'Derm', groups: ['derm'] },
  { key: 'eye', label: 'Eye', groups: ['eye'] },
  { key: 'sci_pharm', label: 'Pharmacol', groups: ['sci_pharm'] },
  { key: 'sci_chem', label: 'MedChem', groups: ['sci_chem'] },
  { key: 'sci_analysis', label: 'QC', groups: ['sci_analysis'] },
  { key: 'sci_tech', label: 'Pharm Tech', groups: ['sci_tech'] },
  { key: 'sci_herb', label: 'Herbal', groups: ['sci_herb'] },
  { key: 'social', label: 'Social · Law', groups: ['sci_social', 'other'] },
]

// ทำครบเท่านี้ถึงนับเป็น "หมวดที่ควรฝึก" จาก % (กันทำ 1 ข้อผิดแล้วขึ้นอันดับ 1)
export const MIN_ANSWERED = 5

const n = (v) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0)

/** answers [{ pleGroup, correct }] → { group: { c, t } } · ข้อไม่มีกลุ่ม/กลุ่มแปลกไม่นับ */
export function tallyGroups(answers) {
  const out = {}
  for (const a of Array.isArray(answers) ? answers : []) {
    const g = a?.pleGroup
    if (!g || !isPleGroupKey(g)) continue
    const row = out[g] || (out[g] = { c: 0, t: 0 })
    row.t++
    if (a.correct) row.c++
  }
  return out
}

/**
 * patch ของ study.gs สำหรับ patchUser
 *  server     = dot-notation + increment (ห้ามส่ง study ทั้งก้อน)
 *  optimistic = study.gs ที่รวมแล้ว (ใส่ใน study ฝั่ง local)
 */
export function buildGsPatch({ gs, tally, increment }) {
  const server = {}
  const merged = { ...(gs && typeof gs === 'object' ? gs : {}) }
  for (const [g, { c, t }] of Object.entries(tally || {})) {
    if (!t) continue
    server[`study.gs.${g}.t`] = increment(t)
    if (c) server[`study.gs.${g}.c`] = increment(c)
    const prev = merged[g] || {}
    merged[g] = { c: n(prev.c) + c, t: n(prev.t) + t }
  }
  return { server, optimisticGs: merged }
}

/** gs → แถวต่อด้าน radar { key, label, groups, c, t, pct } (ไม่มีข้อมูล = pct 0 · user เคาะ) */
export function axisStats(gs) {
  const src = gs && typeof gs === 'object' ? gs : {}
  return RADAR_AXES.map(ax => {
    let c = 0, t = 0
    for (const g of ax.groups) { c += n(src[g]?.c); t += n(src[g]?.t) }
    c = Math.min(c, t)
    return { ...ax, c, t, pct: t ? Math.round((c / t) * 100) : 0 }
  })
}

/** เรียงอ่อน → เก่ง · ด้านที่ยังไม่ได้ฝึกอยู่ท้าย */
export function sortWeakFirst(rows) {
  return rows.slice().sort((a, b) => {
    if (!a.t !== !b.t) return a.t ? -1 : 1
    return a.pct - b.pct || b.t - a.t
  })
}

/** หมวดที่ควรฝึก: % ต่ำสุดในด้านที่ทำ ≥ MIN_ANSWERED · ไม่พอ → เติมด้านที่ยังไม่ได้ฝึก */
export function suggestAxes(rows, count = 3) {
  const enough = rows.filter(r => r.t >= MIN_ANSWERED).sort((a, b) => a.pct - b.pct || b.t - a.t)
  const untouched = rows.filter(r => !r.t)
  return [...enough, ...untouched].slice(0, count)
}

/** ข้อที่ผิดบ่อย จาก study.qcards (l = จำนวนครั้งที่ผิด) — มากก่อน */
export function topWrongIds(qcards, count = 5) {
  if (!qcards || typeof qcards !== 'object') return []
  return Object.entries(qcards)
    .map(([id, p]) => ({ id, lapses: n(p?.l) }))
    .filter(r => r.lapses > 0)
    .sort((a, b) => b.lapses - a.lapses)
    .slice(0, count)
}

/** กลุ่มแรกของด้าน → ใช้ทำลิงก์ฝึก (/quiz?group=) */
export const axisPrimaryGroup = (ax) => ax.groups[0]
/** ชื่อเต็มของด้าน (ไทย + อังกฤษถ้ามี) */
export function axisFullName(ax) {
  return ax.groups.map(k => {
    const g = groupByKey(k)
    return g ? (g.en ? `${g.th} (${g.en})` : g.th) : k
  }).join(' + ')
}
