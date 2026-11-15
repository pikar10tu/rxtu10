// ต้นไม้รุ่น 10 (หน้า /tree) — ภาพต้นไม้ใหญ่ 1024px จาก Fluent 🌳
// อีโมจิปกติเสิร์ฟ 256px ซึ่งแตกเมื่อขยายเต็มฉาก → ทำไฟล์แยก public/tree/tree.webp
// รัน: node scripts/tree-art.mjs
import sharp from 'sharp'
await sharp('public/emoji/fluent/1f333.svg', { density: 2400 })
  .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .webp({ quality: 90, alphaQuality: 100, effort: 6 })
  .toFile('public/tree/tree.webp')
console.log('✓ public/tree/tree.webp')
