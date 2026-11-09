// รูปประกอบโจทย์ — ฟิลด์ `images` ของข้อสอบ = array ของ path ใต้ /qimg/ (ไฟล์ WebP ใน public/qimg)
// รับเฉพาะ path ภายในเว็บเรา กันลิงก์นอก/ค่าเพี้ยน
const RE = /^\/qimg\/[\w.-]+\.(webp|png|jpe?g)$/i

export function questionImages(q) {
  const arr = Array.isArray(q?.images) ? q.images : []
  return [...new Set(arr.filter(s => typeof s === 'string' && RE.test(s)))].slice(0, 4)
}
