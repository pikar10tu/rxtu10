// 💊 ยาแก้แพ้ (user ตั้งชื่อ 30 ก.ย. 2026) — แพ้ในสนามประลองแล้วกดใช้บนจอผล = แต้มไม่ลด
// ใช้ได้เฉพาะบนจอผลของตาที่เพิ่งแพ้ ปิดจอแล้วหมดสิทธิ์ (ไม่เก็บสถานะค้างใน doc)
// ได้จาก: รางวัลลงสนามครบ 5 ครั้ง/วัน · รางวัลขั้นหอคอย · จดหมาย (reward.antiLoss)
export const ANTI_LOSS = { emoji: '💊', name: 'ยาแก้แพ้', field: 'antiLoss' }
export const ANTI_LOSS_DAILY = 1

/**
 * กดใช้ได้ไหม — ต้องยังไม่มีตาใหม่มาทับ (เรตตอนนี้ = เรตหลังแพ้ตานั้นพอดี และซีซั่นเดิม)
 * @param {{from:number,to:number,season:string}|null} loss  จากผล fight() ตาที่แพ้
 * @param {{rating:number,seasonId:string}} pvp  ของซีซั่นปัจจุบัน
 */
export function canUseAntiLoss(loss, pvp, stock) {
  if (!loss || (stock || 0) <= 0) return false
  if (!(loss.to < loss.from)) return false
  return pvp?.seasonId === loss.season && pvp?.rating === loss.to
}
