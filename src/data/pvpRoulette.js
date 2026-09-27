// รายชื่อตลกบนรูเล็ตหาคู่ (user สั่ง 28 ก.ย. 2026) — ของตกแต่งล้วน รูเล็ตล็อกไปจบที่ ROULETTE_WINNER เสมอ
// แอดมินแก้รายชื่อได้ที่ AdminView → config/app.pvpRoulette (ว่าง/ไม่มี = ใช้ชุดนี้)
export const ROULETTE_WINNER = 'คู่ต่อสู้ที่คู่ควร'
export const ROULETTE_DEFAULT = [
  'ลุงยามหน้าคณะ', 'ป้าแม่บ้านชั้น 3', 'คณบดี', 'อาจารย์ที่ปรึกษา', 'แมวส้มหน้าตึก',
  'ป้าร้านข้าวมันไก่', 'พี่ปีหกขึ้นวอร์ด', 'คนที่ยืมชีทไม่คืน', 'เครื่อง HPLC', 'หนูทดลองตัวที่ 7',
  'ข้อสอบ PLE', 'พาราเซตามอล 500', 'วินมอไซค์หน้ามอ', 'Wi-Fi ห้องสมุด', 'ตัวเองเมื่อวาน',
]
export const ROULETTE_MAX = 60      // เพดานจำนวนชื่อที่แอดมินใส่ได้
export const ROULETTE_NAME_MAX = 30 // ยาวสุดต่อชื่อ

/** รายชื่อที่ใช้จริงจาก config (กรองค่าเสีย) · ว่าง = ชุดดีฟอลต์ */
export function rouletteNames(cfg) {
  const list = Array.isArray(cfg) ? cfg.map(x => String(x ?? '').trim().slice(0, ROULETTE_NAME_MAX)).filter(Boolean) : []
  return list.length ? list.slice(0, ROULETTE_MAX) : ROULETTE_DEFAULT
}
