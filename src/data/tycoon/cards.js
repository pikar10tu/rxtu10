// 🃏 การ์ดดวง — hold = เก็บไว้ (ถือได้ ≤ GAME.maxHeldCards) · instant = ทำงานทันทีตอนเปิด
// angel/coupon/jailKey ใช้อัตโนมัติตอนถึงจังหวะ (ลดการกดในมือถือ) · travel/magnet/blueprint กดใช้ตอนถึงตาตัวเอง
export const CARDS = {
  angel:    { name: 'นางฟ้าคุ้มครอง', emoji: '😇', hold: true,  w: 6, desc: 'ไม่ต้องจ่ายค่าผ่านทาง 1 ครั้ง (ใช้ให้อัตโนมัติ)' },
  coupon:   { name: 'คูปองครึ่งราคา', emoji: '🎟️', hold: true,  w: 8, desc: 'ค่าผ่านทางลดครึ่ง 1 ครั้ง (ใช้ให้อัตโนมัติ)' },
  jailKey:  { name: 'กุญแจห้องขัง',   emoji: '🗝️', hold: true,  w: 6, desc: 'โดนขังเมื่อไหร่ ออกได้ทันที' },
  travel:   { name: 'ตั๋วเที่ยวรอบโลก', emoji: '🎫', hold: true, w: 6, desc: 'กดใช้ตอนถึงตา บินไปช่องไหนก็ได้' },
  magnet:   { name: 'แม่เหล็ก',       emoji: '🧲', hold: true,  w: 5, desc: 'ยืนบนเมืองตัวเอง ดึงคู่แข่งข้างหน้าไม่เกิน 6 ช่องมาจ่ายค่าผ่านทาง' },
  blueprint:{ name: 'แปลนก่อสร้าง',   emoji: '📐', hold: true,  w: 6, desc: 'สร้างบ้านเพิ่ม 1 หลังในเมืองตัวเองที่ไหนก็ได้' },
  blackout: { name: 'ไฟดับ',          emoji: '🔌', hold: false, w: 5, desc: 'เลือกเมืองคู่แข่ง ค่าผ่านทางเป็น 0 นาน 3 ตา (ยกเว้นแลนด์มาร์ค)' },
  storm:    { name: 'พายุ',           emoji: '🌪️', hold: false, w: 4, desc: 'เลือกเมืองคู่แข่ง รื้อชั้นบนสุด 1 ชั้น (ยกเว้นแลนด์มาร์ค)' },
  festival: { name: 'จัดเทศกาล',      emoji: '🎉', hold: false, w: 6, desc: 'เลือกเมืองตัวเอง ค่าผ่านทาง ×2' },
  goHome:   { name: 'กลับบ้าน',       emoji: '🏠', hold: false, w: 5, desc: 'ไปจุดเริ่มต้น รับเงินเดือน' },
  share:    { name: 'แบ่งปัน',        emoji: '🤝', hold: false, w: 4, desc: 'ทุกคนให้เงินคนที่จนที่สุดคนละ 50' },
  goJail:   { name: 'โดนเรียกตัว',    emoji: '🚓', hold: false, w: 4, desc: 'เข้าห้องขังทันที' },
  tax:      { name: 'ภาษีฉุกเฉิน',    emoji: '💸', hold: false, w: 4, desc: 'จ่าย 5% ของทรัพย์สิน' },
}
export const CARD_IDS = Object.keys(CARDS)
export const SHARE_AMOUNT = 50
export const BLACKOUT_TURNS = 3
export const EMERGENCY_TAX = 0.05
export const MAGNET_RANGE = 6
