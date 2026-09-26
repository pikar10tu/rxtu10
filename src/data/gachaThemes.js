// src/data/gachaThemes.js
// ธีมของตู้รายเดือน — 1 wave = 1 ธีม = 1 ประตูมิติ (สเปก Pharmaverse §4)
// 🔑 ชื่อธีมใช้ซ้ำเป็นชื่อสนามแชมป์ของเดือนนั้น (`ch-YYYY-MM` ใน data/arenas.js) — ตั้งให้ตรงกัน
// เพิ่มเดือนใหม่: เติมแถว + ใส่ `wave` ให้เพ็ทใน data/index.js ให้ตรง
export const GACHA_THEMES = {
  2: { name: 'King of the Jungle', month: '2026-09', featured: ['lion', 'virus', 'gorilla'] },
  3: { name: 'My Earth tilted for you', month: '2026-10', featured: ['sol', 'earth', 'luna'] },
}
export const LATEST_THEME_WAVE = Math.max(...Object.keys(GACHA_THEMES).map(Number))
export const themeOf = (wave) => GACHA_THEMES[wave] || null
