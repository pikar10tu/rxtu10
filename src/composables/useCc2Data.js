// ════════════════════════════════════════════════════════════
//  useCc2Data — โหลดข้อมูล CC2 OSPE จากไฟล์ static (0 Firestore read) + cache ทั้งแอป
//    public/cc2/index.json          รายการเคสเบา  { v, cases: [{ id, title, cat, group, topic, diff, source, tot, mode, next? }] }
//    public/cc2/cases/<id>.json     เคสเต็ม (HTML กรองแล้วตอน build → v-html ได้)
//    public/cc2/drug-links.json     { [caseId]: drugId[] } สำหรับชิปยาในเคส
//  สัญญา A ใน docs/superpowers/specs/2026-11-11-cc2-step3-contracts.md — ทุกเลนใช้ 3 ฟังก์ชันนี้
//  โหลดด้วย BASE_URL (base='./' + hash router) · พลาดแล้ว cache ไม่ค้าง (เรียกใหม่ = ลองใหม่)
// ════════════════════════════════════════════════════════════

const url = p => import.meta.env.BASE_URL + 'cc2/' + p

async function fetchJson(p) {
  const r = await fetch(url(p), { cache: 'no-cache' })
  if (!r.ok) throw new Error(`โหลด ${p} ไม่ได้ (${r.status})`)
  return r.json()
}

let indexP = null
const caseP = new Map()
let linksP = null

/** รายการเคสทั้งหมด (cache ครั้งเดียวต่อการเปิดแอป) → { v, cases[] } */
export function loadCc2Index() {
  indexP ||= fetchJson('index.json').catch(e => { indexP = null; throw e })
  return indexP
}

/** เคสเต็มรายตัว (cache รายเคส) — id ไม่ถูกรูปแบบ → reject ทันที ไม่ยิง fetch */
export function loadCc2Case(id) {
  if (!/^OS-\d{4}$/.test(String(id))) return Promise.reject(new Error('รหัสเคสไม่ถูกต้อง'))
  if (!caseP.has(id)) caseP.set(id, fetchJson(`cases/${id}.json`).catch(e => { caseP.delete(id); throw e }))
  return caseP.get(id)
}

/** ลิงก์ยาในเคส → { [caseId]: drugId[] } · ไฟล์ไม่มี/พัง → {} (ชิปยาเป็นของเสริม ไม่ควรล้มทั้งหน้า) */
export function loadDrugLinks() {
  linksP ||= fetchJson('drug-links.json').catch(() => { linksP = null; return {} })
  return linksP
}

/** ตัวช่วย: หาเคสถัดไปในชุดเดียวกัน (field next) จาก index */
export async function nextCaseOf(id) {
  const { cases } = await loadCc2Index()
  return cases.find(c => c.id === id)?.next || null
}
