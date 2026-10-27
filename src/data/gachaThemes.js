// src/data/gachaThemes.js
// ธีมของตู้รายเดือน — 1 wave = 1 ธีม = 1 ประตูมิติ (สเปก Pharmaverse §4)
// 🔑 ชื่อธีมใช้ซ้ำเป็นชื่อสนามแชมป์ของเดือนนั้น (`ch-YYYY-MM` ใน data/arenas.js) — ตั้งให้ตรงกัน
// เพิ่มเดือนใหม่: เติมแถว + ใส่ `wave` ให้เพ็ทใน data/index.js ให้ตรง
// ⏰ auto: true (user 27 ต.ค. 2026 — เดือนก่อนแอดมินกดช้า 10 นาทีแล้วเว็บรวน) = เปิด/ปิดตามนาฬิกาเอง ไม่ต้องกด
//    เปิด 00:00 น. วันที่ 1 ของ `month` (เวลาไทย) → ปิด 00:00 น. วันที่ 1 เดือนถัดไป · ก่อนเวลาเปิด ตัวเด่นซ่อนสนิท
//    (utils/petCatalog.js effectiveEvent) ⇒ ลงแถวล่วงหน้าได้เลย · แถวเก่าที่ไม่มี auto ใช้ config/app.gachaEvent แบบเดิม
export const GACHA_THEMES = {
  2: { name: 'King of the Jungle', month: '2026-09', featured: ['lion', 'virus', 'gorilla'] },
  3: { name: 'My Earth tilted for you', month: '2026-10', featured: ['sol', 'earth', 'luna'] },
  4: { name: 'Unknown Visitors', month: '2026-11', auto: true, featured: ['ufo', 'nemesis', 'alien', 'ghost', 'robot', 'comet'] },
}
export const LATEST_THEME_WAVE = Math.max(...Object.keys(GACHA_THEMES).map(Number))
export const themeOf = (wave) => GACHA_THEMES[wave] || null

const TZ = 7 * 3600000
/** ช่วงเวลาของแถว auto → { startsAt, endsAt } (ms) ตามเดือนเวลาไทย · ไม่ใช่ auto = null */
export function themeWindow(wave) {
  const t = GACHA_THEMES[wave]
  if (!t?.auto) return null
  const [y, m] = t.month.split('-').map(Number)
  return { startsAt: Date.UTC(y, m - 1, 1) - TZ, endsAt: Date.UTC(y, m, 1) - TZ }
}
