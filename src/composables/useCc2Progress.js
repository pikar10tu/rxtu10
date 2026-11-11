/**
 * useCc2Progress — บันทึกซ้อม CC2 OSPE (สัญญา C · docs/superpowers/specs/2026-11-11-cc2-step3-contracts.md)
 *
 *   const { finishCase, finishSim, progress, weakCases } = useCc2Progress()
 *   finishCase({ caseId, cat, got, tot }) → Promise<{ ok, coins: 0 }>   เขียน 1 ครั้งผ่าน auth.patchUser
 *   finishSim()                         → Promise<{ ok: true, coins: 0 }> คงไว้ให้ตัวเรียกเดิม (ไม่มีโบนัสแล้ว)
 *
 * CC2 = self-learning ล้วน: ไม่มีเหรียญ/radar/เควสต์ (user 11 พ.ย. 2026) — `coins` คืน 0 เสมอเพื่อให้สัญญาเดิมไม่พัง
 * ผู้ประเมินในห้องคู่ไม่เรียก finishCase
 */
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { buildFinishPatch, progressMap, weakCaseIds } from '../utils/cc2Progress.js'

// กันกดจบรัว (ระดับแอป) — ระหว่างรอ Firestore ไม่ยิงเคสเดิมซ้ำ
const inflight = new Set()

export function useCc2Progress() {
  const auth = useAuthStore()

  const progress = computed(() => progressMap(auth.userData?.study?.cc2))
  const weakCases = computed(() => weakCaseIds(auth.userData?.study?.cc2))

  async function finishCase({ caseId, got, tot } = {}) {
    if (!auth.userData || inflight.has(caseId)) return { ok: false, coins: 0 }
    // CLAUDE.md ข้อ 9: คำนวณ patch จาก state ก่อน patchUser ให้เสร็จ
    const p = buildFinishPatch({ userData: auth.userData, caseId, got, tot, now: Date.now() })
    if (!p.ok) { console.warn('[cc2 finish]', p.reason, caseId); return { ok: false, coins: 0 } }
    inflight.add(caseId)
    try {
      return { ok: await auth.patchUser(p.optimistic, p.server), coins: 0 }
    } finally {
      inflight.delete(caseId)
    }
  }

  const finishSim = async () => ({ ok: true, coins: 0 })

  return { finishCase, finishSim, progress, weakCases }
}
