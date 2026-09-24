// ════════════════════════════════════════════════════════════
//  รูปโปรไฟล์ที่ผู้ใช้อัปเอง — ย่อ 2 ขนาด
// ════════════════════════════════════════════════════════════
//  `customPhoto` (256px) = ตัวเต็ม เก็บใน user doc อ่านตอนเปิดโปรไฟล์รายคน
//  `photoMini`   (48px)  = ตัวจิ๋ว เก็บ "ซ้ำ" ลงแถว roster (ฟิลด์ pm) ด้วย
//
//  ⚠️ ทำไมต้องมีตัวจิ๋ว: `roster/current` เป็น doc เดียวที่ทั้งรุ่นโหลด 1 read
//     ทุกเซสชัน · ตัวเต็ม 256px ≈ 10–25 KB/คน × 83 คน = ชนเพดาน 1 MiB ของ
//     Firestore · ตัวจิ๋วคุมไว้ ≤ MINI_MAX_CHARS ⇒ เต็มรุ่นก็ ~100 KB
//     (ดูคอมเมนต์ที่ utils/roster.js ฟิลด์ p/pm)
// ════════════════════════════════════════════════════════════

// 48 → 72 (25 ก.ย. 2026 รูปในหน้าสมาชิกแตก — โชว์ 56px บนจอ 2–3x) · เพดานความยาวเท่าเดิม = roster ไม่ใหญ่ขึ้น
//   ได้ความคมจาก WebP (คมกว่า JPEG ที่ขนาดเท่ากัน) + ครอปจัตุรัส (รูปโชว์เป็นวงกลม พิกเซลขอบๆ ที่ถูกตัดทิ้ง = เปลือง)
//   → 96 (รอบสอง: 72 ยังแตก · การ์ดโชว์ 56px × จอ 2x = ต้องการ ~112px)
export const MINI_SIZE = 96
/** เพดานความยาว data URL ของตัวจิ๋ว — 83 คน × 3000 ≈ 250 KB ยังห่างเพดาน doc มาก */
// 3000 → 4500 คู่กับ 96px · เฉพาะคนที่อัปรูปเอง · 105 คน × 4.5KB ≈ 470KB ยังห่างเพดาน doc 1MB
export const MINI_MAX_CHARS = 4500
/** ไล่ลดคุณภาพจนกว่าจะลอดเพดาน — รูปที่มี noise สูงจะกินที่มากกว่าปกติ */
export const MINI_QUALITIES = [0.6, 0.45, 0.3]

/**
 * data URL → data URL ตัวจิ๋วที่ยาวไม่เกิน MINI_MAX_CHARS · null ถ้าย่อยังไงก็ไม่ลอด
 *
 * `encode(src, size, quality) → Promise<string|null>` แยกออกมาเป็นพารามิเตอร์
 * เพื่อให้ตรรกะไล่คุณภาพเทสได้โดยไม่ต้องมี canvas (ดู photo.test.js)
 */
export async function makePhotoMini(src, encode = encodeViaCanvas) {
  if (!src) return null
  // WebP ก่อน (เบราว์เซอร์ที่เข้ารหัส WebP ไม่ได้จะคืน PNG ยาวเกินเพดานเอง → ตกไป JPEG)
  for (const type of ['image/webp', 'image/jpeg']) {
    for (const q of MINI_QUALITIES) {
      const out = await encode(src, MINI_SIZE, q, type)
      if (out && out.length <= MINI_MAX_CHARS && out.startsWith(`data:${type}`)) return out
    }
  }
  return null
}

/** ย่อรูปด้วย canvas (เบราว์เซอร์เท่านั้น) — ครอปจัตุรัสกลางรูป · null ถ้าโหลดรูปไม่ได้ */
export function encodeViaCanvas(src, max, quality, type = 'image/jpeg') {
  return new Promise((resolve) => {
    const img = new Image()
    img.onerror = () => resolve(null)
    img.onload = () => {
      const side = Math.min(img.width, img.height)
      const out = Math.max(1, Math.min(max, side))
      const c = document.createElement('canvas')
      c.width = out; c.height = out
      const ctx = c.getContext('2d')
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, out, out)
      resolve(c.toDataURL(type, quality))
    }
    img.src = src
  })
}
