// ════════════════════════════════════════════════════════════
//  Pure helpers สำหรับ first-run onboarding (ไม่แตะ Firebase/DOM)
// ════════════════════════════════════════════════════════════

// ยังต้องขอ consent ไหม — ยังไม่ยอมรับ หรือ version ไม่ตรงกับปัจจุบัน
export function needsConsent(userData, version) {
  const c = userData?.consent
  return !(c && c.accepted === true && c.version === version)
}

// หา record นักศึกษาจาก roster ด้วยรหัส (trim ก่อนเทียบ)
export function matchRoster(studentId, students) {
  const id = String(studentId ?? '').trim()
  if (!id) return null
  return (students || []).find(s => s.id === id) || null
}

// ตรวจ input ฟอร์ม guest
export function validateGuest({ nickname, reason } = {}) {
  if (!String(nickname ?? '').trim()) return { ok: false, error: 'กรุณากรอกชื่อเล่น' }
  if (!String(reason ?? '').trim()) return { ok: false, error: 'กรุณากรอกเหตุผลที่เข้าชม' }
  return { ok: true, error: null }
}

// gate ลำดับชั้น (สมมติผู้ใช้ login แล้ว) — คืนชื่อหน้าจอที่ควรแสดง
//  ใช้ค่า "effective": คนเก่าที่มี studentId อยู่แล้ว ถือว่า onboarded
//  และ track เดิม 'guest' ถือว่า accountType guest + approved
export function onboardingGate(userData, version) {
  if (needsConsent(userData, version)) return 'consent'

  const onboarded = userData?.onboarded === true || !!userData?.studentId || userData?.track === 'guest'
  if (!onboarded) return 'wizard'

  const type = userData?.accountType
    || (userData?.studentId ? 'student' : (userData?.track === 'guest' ? 'guest' : null))
  if (type === 'guest') {
    const status = userData?.guestStatus || (userData?.track === 'guest' ? 'approved' : null)
    if (status !== 'approved') return 'guest-pending'
  }
  return 'ok'
}
