// ════════════════════════════════════════════════════════════
//  ไอคอนสายเพ็ท ✊✌️✋ — เหรียญสีนูน + มือเป่ายิ้งฉุบสีขาว (user เคาะ 17 ต.ค. 2026)
//  วาด SVG ด้วยโค้ด → WebP 96px ที่ public/elements/<fist|scissors|paper>.webp
//  ใช้ผ่าน <Emoji char="el:fist" /> (utils/emoji.js) · WebP ไม่ใช่ SVG เหตุผลเดียวกับ herb-icons.mjs
//  รัน: node scripts/element-icons.mjs   (--svg เขียน .svg ไว้ดูด้วย)
// ════════════════════════════════════════════════════════════
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'elements')
const SIZE = 96

// สีเหรียญ: จู่โจม แดง · สมดุล เหลืองส้ม · พิทักษ์ ฟ้า
export const EL_ART = {
  fist:     { c: '#f05252', l: '#ff9a8a', d: '#9b1c1c' },
  scissors: { c: '#f2a516', l: '#ffd56b', d: '#92560b' },
  paper:    { c: '#3b82f6', l: '#93c5fd', d: '#1e3a8a' },
}

const finger = (x, y, w, len, rot = 0) =>
  `<rect x="${x - w / 2}" y="${y - len}" width="${w}" height="${len + w / 2}" rx="${w / 2}" transform="rotate(${rot} ${x} ${y})"/>`

// รูปทรงมือ (กรอบ 48×48) — วาดชุดเดียว ใช้สองรอบ: รอบแรก stroke หนาเป็นขอบ รอบสองเติมขาว ⇒ ขอบรวมเนียน
const HAND = {
  // ✊ ค้อน — กำปั้น 4 ข้อนิ้ว + นิ้วโป้งพาดหน้า
  fist: {
    shapes: `<rect x="11" y="15" width="27" height="22" rx="8"/>`
      + [14.6, 21.2, 27.8, 34.4].map(x => `<circle cx="${x}" cy="17" r="4.1"/>`).join('')
      + `<rect x="17" y="33" width="15" height="9" rx="2"/>`
      + `<path d="M10 27q1-5 7-5h12a3.6 3.6 0 0 1 0 7.2H17q-6 0-7-2.2Z"/>`,
    lines: `<path d="M17.9 14.5v6M24.5 14.5v6M31.1 14.5v6" /><path d="M17 25.6h11"/>`,
  },
  // ✌️ กรรไกร — สองนิ้วชูเป็นตัว V + กำนิ้วที่เหลือ
  scissors: {
    shapes: finger(20, 25, 6.4, 18, -16) + finger(28, 25, 6.4, 18, 16)
      + `<rect x="13" y="22" width="23" height="17" rx="7.5"/>`
      + `<rect x="18" y="35" width="14" height="8" rx="2"/>`
      + `<path d="M12 31q1-5 7-5h9a3.4 3.4 0 0 1 0 6.8H19q-6 0-7-1.8Z"/>`,
    lines: `<path d="M24 23.5v4"/><path d="M19 29.4h8"/>`,
  },
  // ✋ กระดาษ — แบมือ 4 นิ้ว + นิ้วโป้งกาง
  paper: {
    shapes: finger(16.4, 24, 5.4, 11, -8) + finger(21.6, 23, 5.6, 15, -3) + finger(27, 23, 5.6, 14.5, 3) + finger(32.2, 24, 5.2, 11, 9)
      + finger(13, 31, 5.6, 11, -50)
      + `<rect x="13" y="21" width="22" height="19" rx="8"/>`
      + `<rect x="17" y="36" width="14" height="8" rx="2"/>`,
    lines: ``,
  },
}

export function elementSVG(k) {
  const e = EL_ART[k], h = HAND[k]
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${SIZE}" height="${SIZE}">
<defs>
  <radialGradient id="c" cx=".34" cy=".28" r=".85"><stop offset="0" stop-color="${e.l}"/><stop offset=".58" stop-color="${e.c}"/><stop offset="1" stop-color="${e.d}"/></radialGradient>
  <linearGradient id="h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#eef1f7"/></linearGradient>
</defs>
<circle cx="24" cy="25" r="22" fill="${e.d}" opacity=".45"/>
<circle cx="24" cy="24" r="22" fill="url(#c)" stroke="${e.d}" stroke-width="1.6"/>
<circle cx="24" cy="24" r="18.6" fill="none" stroke="#fff" stroke-width=".8" opacity=".28"/>
<path d="M9 16a17 13 0 0 1 30 0" stroke="#fff" stroke-width="2.2" fill="none" opacity=".32" stroke-linecap="round"/>
<g transform="translate(24 24.5) scale(.8) translate(-24.5 -28)">
  <g fill="${e.d}" stroke="${e.d}" stroke-width="3.4" stroke-linejoin="round">${h.shapes}</g>
  <g fill="url(#h)">${h.shapes}</g>
  <g fill="none" stroke="${e.d}" stroke-width="1" stroke-linecap="round" opacity=".55">${h.lines}</g>
</g>
</svg>`
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  mkdirSync(OUT, { recursive: true })
  const keepSvg = process.argv.includes('--svg')
  for (const k of Object.keys(EL_ART)) {
    const svg = elementSVG(k)
    if (keepSvg) writeFileSync(join(OUT, `${k}.svg`), svg)
    await sharp(Buffer.from(svg)).webp({ quality: 92 }).toFile(join(OUT, `${k}.webp`))
    console.log('✓', k)
  }
}
