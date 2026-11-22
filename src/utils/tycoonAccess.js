// 🎲 สิทธิ์เข้าเกมเศรษฐีรอบโลก (เดโม) — แอดมิน หรือ uid อยู่ใน config/app.tycoonTesters
// ช่วงเดโมกั้นที่ฝั่งแอปเท่านั้น (RTDB เปิดให้คนล็อกอิน) — ไม่มีเหรียญ/ข้อมูลส่วนตัวในเกม รับได้
export function canPlayTycoon(config, uid, isAdmin = false) {
  if (isAdmin === true) return true
  const list = config?.tycoonTesters
  return !!uid && Array.isArray(list) && list.includes(uid)
}

/** รหัสห้อง 4 ตัว ไม่มีตัวที่สับสน (0/O, 1/I) */
export function roomCode(r = Math.random) {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 4 }, () => A[Math.floor(r() * A.length)]).join('')
}
