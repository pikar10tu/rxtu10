// ════════════════════════════════════════════════════════════
//  ไอคอนประกายดาว 4 ระดับ — กองผงดาวเรืองแสง วาด SVG ด้วยโค้ด แล้วแปลงเป็น WebP 160px (โปร่งใส)
//  ออก public/fx/dust-<rarity>.webp · ใช้ WebP ไม่ใช่ SVG เหตุผลเดียวกับ scripts/fx-art.mjs
//  (iPhone raster SVG ใหม่ทุกเฟรมที่มันขยับ) · ชื่อไฟล์ต้องตรงกับ DUST[].img ใน utils/stardust.js
//  รัน: node scripts/dust-art.mjs   (--svg เขียน .svg ต้นฉบับไว้ดูด้วย)
// ════════════════════════════════════════════════════════════
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'fx')
const SIZE = 160

// [สีกลาง, สีเข้ม, สีอ่อน] ตาม DUST ใน utils/stardust.js
const TONES = {
  common:    ['#4fc38a', '#1f8a57', '#c9f5df'],
  rare:      ['#4aa3f0', '#1c63b8', '#d3ebff'],
  epic:      ['#a66cf0', '#6a2fc0', '#ead9ff'],
  legendary: ['#f5b72e', '#c27c06', '#fff1c2'],
}

const star4 = (x, y, s, fill) => `<path d="M${x} ${y - s}Q${x + s * .16} ${y - s * .16} ${x + s} ${y}Q${x + s * .16} ${y + s * .16} ${x} ${y + s}Q${x - s * .16} ${y + s * .16} ${x - s} ${y}Q${x - s * .16} ${y - s * .16} ${x} ${y - s}Z" fill="${fill}"/>`

// สุ่มแบบกำหนดเมล็ด ⇒ รันซ้ำได้ภาพเดิม
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647 }

function art(k, seed) {
  const [mid, dark, light] = TONES[k]
  const r = rng(seed)
  // ผงเม็ดเล็กกองเป็นเนินรูปหยด (หนาแน่นตรงกลางล่าง)
  let grains = ''
  for (let i = 0; i < 70; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r())
    const x = 32 + Math.cos(a) * d * 20, y = 40 + Math.sin(a) * d * 11
    const c = r() < .3 ? light : r() < .6 ? mid : dark
    grains += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.8 + r() * 1.6).toFixed(2)}" fill="${c}"/>`
  }
  let floaters = ''
  for (let i = 0; i < 9; i++) floaters += `<circle cx="${(12 + r() * 40).toFixed(1)}" cy="${(8 + r() * 26).toFixed(1)}" r="${(0.6 + r()).toFixed(2)}" fill="#fff" opacity="${(.5 + r() * .5).toFixed(2)}"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${SIZE}" height="${SIZE}">
  <defs>
    <radialGradient id="h" cx=".5" cy=".62" r=".5"><stop offset="0" stop-color="${light}" stop-opacity=".95"/><stop offset=".45" stop-color="${mid}" stop-opacity=".55"/><stop offset="1" stop-color="${mid}" stop-opacity="0"/></radialGradient>
    <radialGradient id="p" cx=".45" cy=".35" r=".7"><stop offset="0" stop-color="${light}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></radialGradient>
    <filter id="g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <ellipse cx="32" cy="38" rx="30" ry="24" fill="url(#h)"/>
  <ellipse cx="32" cy="43" rx="19" ry="9" fill="url(#p)"/>
  <g>${grains}</g>
  <g filter="url(#g)">${star4(32, 22, 13, '#fff')}${star4(32, 22, 7, light)}${star4(47, 30, 5.5, '#fff')}${star4(17, 31, 4.5, '#fff')}</g>
  ${floaters}
</svg>`
}

mkdirSync(OUT, { recursive: true })
const keepSvg = process.argv.includes('--svg')
let seed = 7
for (const k of Object.keys(TONES)) {
  const svg = art(k, seed += 101)
  if (keepSvg) writeFileSync(join(OUT, `dust-${k}.svg`), svg)
  await sharp(Buffer.from(svg)).webp({ quality: 90, alphaQuality: 100 }).toFile(join(OUT, `dust-${k}.webp`))
  console.log('✓ dust-' + k)
}
