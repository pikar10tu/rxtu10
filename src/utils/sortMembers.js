// จัดเรียงสมาชิก: ตัวเองปักหมุดช่องแรกเสมอ → registered ก่อน → ตาม key ที่เลือก
// pure: คืน array ใหม่ ไม่ mutate ของเดิม
function byKey(key) {
  if (key === 'nickname') return (a, b) => String(a.nickname || '').localeCompare(String(b.nickname || ''), 'th')
  if (key === 'level')    return (a, b) => (b.residence?.level || 1) - (a.residence?.level || 1)
  // default studentId น้อย→มาก (numeric-aware)
  return (a, b) => String(a.studentId || '').localeCompare(String(b.studentId || ''), undefined, { numeric: true })
}

export function sortMembers(list, key = 'studentId', myUid = null) {
  const cmp = byKey(key)
  return (list || []).slice().sort((a, b) => {
    const aSelf = a.uid === myUid ? 0 : 1
    const bSelf = b.uid === myUid ? 0 : 1
    if (aSelf !== bSelf) return aSelf - bSelf
    const reg = (b.registered ? 1 : 0) - (a.registered ? 1 : 0)
    if (reg) return reg
    return cmp(a, b)
  })
}
