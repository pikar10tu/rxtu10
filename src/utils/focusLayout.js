// ผังห้องโฟกัส (พิกเซลฉาก 160×100) — ใช้ร่วม FocusView/FocusPill
// ที่นั่ง = กลางเคาน์เตอร์ x · ขอบบน y · เคาน์เตอร์ยาวซ้าย/ขวา 2 แถว กลางห้องโล่งไว้เดิน · ประตู = ล่างกลาง
export const SEATS = [[18, 66], [42, 66], [118, 66], [142, 66], [18, 90], [42, 90], [118, 90], [142, 90]]
export const COUNTERS = [[30, 66], [30, 90], [130, 66], [130, 90]]
export const DOOR = [80, 98]
export const seatFoot = (i) => [SEATS[i][0], SEATS[i][1] + 3]   // จุดเท้าตอนนั่ง (หลังเคาน์เตอร์)
export function freeSeat(taken) {
  const free = SEATS.map((_, i) => i).filter(i => !taken.has(i))
  return free.length ? free[Math.floor(Math.random() * free.length)] : -1   // -1 = เต็ม → ยืนกลางห้อง
}
