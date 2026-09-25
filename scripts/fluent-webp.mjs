// แปลง Fluent Emoji SVG → WebP ข้างกัน (แอปเสิร์ฟ WebP · SVG เก็บไว้เป็นต้นฉบับ)
// รัน: node scripts/fluent-webp.mjs          (ข้ามตัวที่มี WebP ใหม่กว่า SVG แล้ว)
//      node scripts/fluent-webp.mjs --all    (แปลงใหม่ทั้งหมด)
// ต้องรันทุกครั้งหลัง fetch-fluent.mjs — emoji.test.js จะแดงถ้ามี SVG ที่ไม่มี WebP คู่
//
// 🔑 ทำไม: iPhone Safari raster SVG ใหม่ทุกครั้งที่ layer ที่มีมันถูกวาดใหม่ (การ์ดรีเพลย์ repaint ทุกหมัด)
//    ห้องเทียบ v5 (26 ก.ย. 2026, iPhone ของ user): <30fps 119+ → 7 เฟรม/ไฟต์ · แย่สุด 131–227ms → 45ms
// 256px = อีโมจิใหญ่สุดในแอป (~5.5rem ≈ 88px ฉากแคปซูล) × จอ 3x
import { readdirSync, statSync, existsSync } from 'node:fs'
import sharp from 'sharp'

const DIR = 'public/emoji/fluent'
const SIZE = 256
const all = process.argv.includes('--all')

let made = 0, skipped = 0, svgBytes = 0, webpBytes = 0
for (const f of readdirSync(DIR)) {
  if (!f.endsWith('.svg')) continue
  const src = `${DIR}/${f}`, out = src.replace(/\.svg$/, '.webp')
  if (!all && existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs) { skipped++; continue }
  await sharp(src, { density: 400 })
    .resize(SIZE, SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 88, alphaQuality: 100, effort: 6 })
    .toFile(out)
  svgBytes += statSync(src).size; webpBytes += statSync(out).size; made++
}
console.log(`แปลง ${made} · ข้าม ${skipped}` + (made ? ` · svg ${(svgBytes / 1024).toFixed(0)}KB → webp ${(webpBytes / 1024).toFixed(0)}KB` : ''))
