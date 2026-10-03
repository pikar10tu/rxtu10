// คลังสรุป RxTU10 — ดัชนีเบา ๆ จาก content/summaries/manifest.json (เนื้อหาแต่ละเรื่อง lazy-load จาก data/summaries/<id>.js)
import manifest from '../../content/summaries/manifest.json'

// ไฟล์ที่แปลงแล้วเท่านั้นจะอยู่ใน glob — ที่เหลือขึ้น "อยู่ระหว่างดำเนินการ"
const loaders = import.meta.glob('./summaries/*.js')
const ready = new Set(Object.keys(loaders).map(p => p.match(/\/([^/]+)\.js$/)[1]))

export const SYSTEMS = [
  ['msk', 1, 'กระดูกและข้อ'], ['cvs', 2, 'หัวใจและหลอดเลือด'], ['derm', 3, 'ผิวหนัง'], ['endo', 4, 'ต่อมไร้ท่อ'],
  ['gi', 5, 'ทางเดินอาหาร'], ['heme', 6, 'โลหิตวิทยา'], ['immu', 7, 'ภูมิคุ้มกัน'], ['id', 8, 'โรคติดเชื้อ'],
  ['neuro', 9, 'ระบบประสาท'], ['psych', 10, 'จิตเวช'], ['pulm', 11, 'ปอด'], ['gu', 12, 'สูติ-ปัสสาวะ'],
  ['eye', 13, 'ตา'], ['onco', 14, 'มะเร็ง'], ['renal', 15, 'ไต'], ['ped', 16, 'ยาเด็ก'],
].map(([key, n, th]) => ({ key, n, th }))

// a = ชื่อจากหัวกระดาษ (เครดิตหลัก ตามที่ user เคาะ 3 ต.ค. 2026) · an = ชื่อจริงจากรายชื่อ ไม่แสดง
export const SUMMARIES = manifest.map(x => ({
  id: x.id, sys: x.g, title: x.t, final: x.s === 'final',
  authors: x.a, reviewers: x.r, ready: ready.has(x.id),
}))

// ป้ายสถานะตรวจ (user 3 ต.ค. 2026): ไม่มีคนตรวจ = ขึ้น "ไม่มีคนตรวจ" ไม่ใช่ "รอตรวจ"
// คนตรวจมาจากชีท "ตรวจเนื้อหา Care (Clinic)" ใน RxTU10 road to CC.xlsx (คนตรวจ 1 + 2) → manifest r (ชื่อเล่น) / rn (ชื่อจริง)
export function reviewPill(s) {
  if (s.final) return { cls: 'ok', text: 'ตรวจแล้ว' }
  if (s.reviewers?.length) return { cls: 'wait', text: 'รอตรวจ' }
  return { cls: 'none', text: 'ไม่มีคนตรวจ' }
}

export function summaryMeta(id) { return SUMMARIES.find(s => s.id === id) }

export async function loadSummary(id) {
  const load = loaders[`./summaries/${id}.js`]
  return load ? (await load()).default : null
}
