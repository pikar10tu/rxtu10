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

// รูปทรงมือ (กรอบ 48×48, แกนกลาง x=24) — วาดชุดเดียว ใช้สองรอบ: รอบแรก stroke หนาเป็นขอบ รอบสองเติมขาว ⇒ ขอบรวมเนียน
// 17 ต.ค. รอบ 2: user ติ "นิ้วเบี้ยว" → นิ้วกว้างเท่ากัน เรียงตรง สมมาตรรอบแกนกลาง (เลิกหมุนนิ้วทีละท่อน)
const rr = (x, y, w, h, r) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`
const PALM = rr(13, 21, 22, 17, 7) + rr(17.5, 34, 13, 9, 2.5)            // ฝ่ามือ + ข้อมือ
const fingersUp = (xs, tops, w = 5.6) => xs.map((x, i) => rr(x - w / 2, tops[i], w, 26 - tops[i], w / 2)).join('')
const HAND = {
  // ✊ ค้อน — 4 ข้อนิ้วงอ เท่ากัน + นิ้วโป้งพาดขวาง
  fist: {
    shapes: rr(13, 14, 22, 24, 6.5) + [13, 18.5, 24, 29.5].map(x => rr(x, 12.5, 5.5, 12, 2.75)).join('')
      + rr(17.5, 34, 13, 9, 2.5),
    lines: [18.5, 24, 29.5].map(x => `<path d="M${x} 13.5v9"/>`).join(''),
    over: rr(11.5, 24.5, 18.5, 6.6, 3.3),   // นิ้วโป้งพาดหน้า — วาดทับพร้อมขอบของตัวเอง ไม่งั้นกลืนกับกำปั้น
  },
  // ✌️ กรรไกร — นิ้วชี้+กลางแยกเป็นตัว V สมมาตร + นิ้วโป้งพับทับนิ้วที่เหลือ
  scissors: {
    shapes: `<g transform="rotate(-11 21 26)">${rr(18.2, 7, 5.6, 21, 2.8)}</g><g transform="rotate(11 27 26)">${rr(24.2, 7, 5.6, 21, 2.8)}</g>`
      + PALM,
    lines: `<path d="M24 23v4"/>`,
    over: rr(12.5, 28, 17.5, 6.4, 3.2),
  },
  // ✋ กระดาษ — แบมือ 4 นิ้วตั้งตรง ปลายไล่ระดับธรรมชาติ + นิ้วโป้งกางเฉียงซ้าย
  paper: {
    shapes: fingersUp([15.9, 21.3, 26.7, 32.1], [8.5, 5.5, 6.5, 10]) + PALM
      + `<g transform="rotate(-42 15 31)">${rr(12.2, 18, 5.6, 14, 2.8)}</g>`,
    lines: [18.6, 24, 29.4].map((x, i) => `<path d="M${x} ${[9.5, 9, 11][i]}v13"/>`).join(''),
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
<g transform="translate(24 24.5) scale(.82) translate(-24 -25)">
  <g fill="${e.d}" stroke="${e.d}" stroke-width="3.4" stroke-linejoin="round">${h.shapes}</g>
  <g fill="url(#h)">${h.shapes}</g>
  <g fill="none" stroke="${e.d}" stroke-width="1.1" stroke-linecap="round" opacity=".6">${h.lines}</g>
  ${h.over ? `<g fill="url(#h)" stroke="${e.d}" stroke-width="1.3">${h.over}</g>` : ''}
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
