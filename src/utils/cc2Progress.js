/**
 * บันทึกซ้อม CC2 OSPE — ตรรกะล้วน (ไม่แตะ Firestore/Vue) · เทส: cc2Progress.test.js
 * สัญญา C: docs/superpowers/specs/2026-11-11-cc2-step3-contracts.md
 *
 * CC2 = self-learning ล้วน (user เคาะ 11 พ.ย. 2026): คะแนนมาจากการประเมินตัวเอง/เพื่อนประเมิน
 *   → ไม่มีเหรียญ · ไม่ขึ้น radar · ไม่ผูกเควสต์ · เก็บไว้ให้เจ้าของดูเอง (ป้ายซ้อมแล้ว + เคสที่ยังไม่ครบ) · เพื่อนไม่เห็น
 *
 * โครงบน user doc: study.cc2.<caseId> = { g, t, d, n }  ผลครั้งล่าสุด got/tot · d = วัน int YYYYMMDD (UTC) · n = ทำไปกี่ครั้ง
 * เขียนด้วย dot-path เท่านั้น — ห้ามส่ง `study` ทั้งก้อน (ทับ study.cards/qcards)
 */

export const CC2_CATS = ['Clinic', 'Product', 'SAP']
export const CC2_MAX_SCORE = 999        // กันค่าเพี้ยน

const CASE_ID_RE = /^[A-Za-z0-9_-]{1,24}$/   // ใช้เป็น dot-path ได้ปลอดภัย
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v)
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, v) : 0)
const int = (v) => Math.floor(num(v))
const r2 = (v) => Math.round(v * 100) / 100   // คะแนนมีทศนิยม (เช่น 1.25)

export const dayStr = (now = Date.now()) => new Date(now).toISOString().slice(0, 10)
export const dayInt = (now = Date.now()) => Number(dayStr(now).replace(/-/g, ''))
const intToStr = (d) => {
  const s = String(int(d))
  return s.length === 8 ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6)}` : null
}

export const isCaseId = (id) => typeof id === 'string' && CASE_ID_RE.test(id)

/** got/tot → 0 ≤ got ≤ tot ≤ MAX (ทศนิยม 2 ตำแหน่ง) */
export function cleanScore(got, tot) {
  const t = r2(Math.min(num(tot), CC2_MAX_SCORE))
  return { got: r2(Math.min(num(got), t)), tot: t }
}

/** patch คู่สำหรับ auth.patchUser ตอนจบเคส → { ok, optimistic, server } */
export function buildFinishPatch({ userData, caseId, got, tot, now = Date.now() }) {
  if (!isCaseId(caseId)) return { ok: false, reason: 'bad-case' }
  const study = isObj(userData?.study) ? userData.study : {}
  const cc2 = isObj(study.cc2) ? study.cc2 : {}
  const prev = isObj(cc2[caseId]) ? cc2[caseId] : null
  const s = cleanScore(got, tot)
  const entry = { g: s.got, t: s.tot, d: dayInt(now), n: int(prev?.n) + 1 }
  return {
    ok: true,
    optimistic: { study: { ...study, cc2: { ...cc2, [caseId]: entry } } },   // local: setUserDataOptimistic เป็น shallow spread
    server: { [`study.cc2.${caseId}`]: entry },
  }
}

/** study.cc2 → {[id]: { got, tot, at:'YYYY-MM-DD'|null, n }} */
export function progressMap(cc2) {
  const out = {}
  if (!isObj(cc2)) return out
  for (const [id, e] of Object.entries(cc2)) {
    if (!isObj(e)) continue
    const s = cleanScore(e.g, e.t)
    out[id] = { got: s.got, tot: s.tot, at: intToStr(e.d), n: int(e.n) || 1 }
  }
  return out
}

/** เคสที่ครั้งล่าสุดยังไม่เต็ม — ใหม่สุดก่อน */
export function weakCaseIds(cc2) {
  return Object.entries(progressMap(cc2))
    .filter(([, r]) => r.tot > 0 && r.got < r.tot)
    .sort((a, b) => String(b[1].at).localeCompare(String(a[1].at)) || (a[1].got / a[1].tot) - (b[1].got / b[1].tot))
    .map(([id]) => id)
}
