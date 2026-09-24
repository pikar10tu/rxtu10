// ════════════════════════════════════════════════════════════
//  slotEdit — วิธีเลือกของลงช่องแบบเดียวทั้งเว็บ (จัดทีม · ตู้โชว์) · pure + เทส
//  user บอก 25 ก.ย. 2026 ว่างง 4 จุด: ไม่รู้จะแทนตัวไหน · เอาออกยาก · ช่องที่เลือกขยับเอง · สลับลำดับยาก
//  กติกา:
//   · แตะช่อง = เลือก (แตะซ้ำ = ยกเลิก) · มีช่องเลือกอยู่แล้วแตะอีกช่อง = สลับสองช่อง
//   · แตะของในคลัง: มีช่องเลือก → ใส่ลงช่องนั้น (แทนของเดิม) · ไม่มี → ลงช่องว่างแรก · เต็ม = ไม่ทำอะไร (บอกให้เลือกช่องก่อน)
//   · ของที่อยู่ในช่องแล้ว: มีช่องเลือก → สลับ · ไม่มี → เลือกช่องของมัน
//   · ใส่/สลับเสร็จ = เลิกเลือก (ไม่กระโดดไปช่องอื่นเอง) · ✕ = เอาออก ช่องว่างค้างตรงนั้น ตัวอื่นไม่เลื่อน
// ════════════════════════════════════════════════════════════

/** @returns {{ slots, sel, event }} event: 'select'|'deselect'|'swap'|'place'|'replace'|'full'|'remove' */
export function tapSlot({ slots, sel }, i) {
  if (sel === i) return { slots, sel: null, event: 'deselect' }
  if (sel == null) return { slots, sel: i, event: 'select' }
  const next = slots.slice();
  [next[sel], next[i]] = [next[i], next[sel]]
  return { slots: next, sel: null, event: 'swap' }
}

export function tapItem({ slots, sel }, id) {
  const at = slots.indexOf(id)
  if (at >= 0) return sel == null ? { slots, sel: at, event: 'select' } : tapSlot({ slots, sel }, at)
  const next = slots.slice()
  if (sel != null) {
    const had = next[sel]
    next[sel] = id
    return { slots: next, sel: null, event: had ? 'replace' : 'place' }
  }
  const empty = next.findIndex(s => !s)
  if (empty < 0) return { slots, sel: null, event: 'full' }
  next[empty] = id
  return { slots: next, sel: null, event: 'place' }
}

export function removeAt({ slots, sel }, i) {
  const next = slots.slice()
  next[i] = null
  return { slots: next, sel: sel === i ? null : sel, event: 'remove' }
}

/** ตัดช่องว่างทิ้ง (เอนจินต่อสู้ต้องการทีมเรียงติดกัน) */
export const compact = (slots) => slots.filter(Boolean)
