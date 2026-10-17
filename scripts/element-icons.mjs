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

// รูปทรงมือ (กรอบ 48×48, แกนกลาง x=24) — วาดชุดเดียวสองรอบ: รอบแรก stroke เข้มเป็นขอบ รอบสองเติมขาว
// 17 ต.ค. รอบ 3: user ติ "ตัวเล็กไม่สวย นิ้วแปลก" → ออกแบบให้อ่านที่ 18–24px ก่อน:
//   มือใหญ่เต็มเหรียญ · ไม่มีเส้นบาง · ร่องระหว่างนิ้วมาจากช่องว่างจริง (ขอบเข้มไหลเข้าไปเติม) ไม่ใช่เส้นวาดทับ
const rr = (x, y, w, h, r) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`
const W = 5.4, GAP = 6.5          // ความกว้างนิ้ว / ระยะห่างศูนย์กลาง ⇒ ร่อง ~1.1 ให้ขอบเข้มเป็นเส้นแบ่งนิ้ว
const row4 = (top, h, tops) => [0, 1, 2, 3].map(i => rr(24 - 1.5 * GAP + i * GAP - W / 2, tops ? tops[i] : top, W, h - (tops ? tops[i] - top : 0), W / 2)).join('')
const WRIST = rr(17, 35, 14, 9, 2.5)
const HAND = {
  // ✊ ค้อน — ข้อนิ้ว 4 ข้อ + นิ้วโป้งพาดหน้า
  fist: {
    shapes: rr(13, 18, 22, 19, 6) + row4(11.5, 13) + WRIST,
    over: rr(11, 24.5, 19, 7, 3.5),
  },
  // ✌️ กรรไกร — สองนิ้ว V + นิ้วโป้งพับ
  scissors: {
    shapes: `<g transform="rotate(-13 20.5 27)">${rr(17.8, 6, W, 22, W / 2)}</g><g transform="rotate(13 27.5 27)">${rr(24.8, 6, W, 22, W / 2)}</g>`
      + rr(13, 22, 22, 16, 7) + WRIST,
    over: rr(11.5, 27.5, 18.5, 7, 3.5),
  },
  // ✋ กระดาษ — 4 นิ้วตั้งตรง + นิ้วโป้งกาง
  paper: {
    shapes: row4(5, 22, [10, 6, 7, 11]) + rr(13, 21, 22, 17, 7) + WRIST
      + `<g transform="rotate(-40 14.5 31)">${rr(11.8, 18, W, 15, W / 2)}</g>`,
    over: '',
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
<g transform="translate(24 24.5) scale(.9) translate(-24 -25)">
  <g fill="${e.d}" stroke="${e.d}" stroke-width="3.2" stroke-linejoin="round">${h.shapes}</g>
  <g fill="url(#h)">${h.shapes}</g>
  ${h.over ? `<g fill="url(#h)" stroke="${e.d}" stroke-width="1.6">${h.over}</g>` : ''}
</g>
</svg>`
}

// 17 ต.ค. รอบ 4: user ให้ใช้ "ไอคอนปกติที่เคยใช้" (Fluent ✊✌️✋) เป็นมือ แล้ววางบนเหรียญสี
//   = เหรียญเปล่า (วาดเอง) + มือ Fluent ย้อมขาว จาก public/emoji/fluent/<cp>.svg + เงาใต้มือ
const FLUENT = { fist: '270a', scissors: '270c', paper: '270b' }
const FLUENT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'emoji', 'fluent')
export function coinSVG(k) {
  return elementSVG(k).split('<g transform="translate(24')[0] + '</svg>'
}
async function fluentCoin(k) {
  const HAND = Math.round(SIZE * 0.66)   // มือ ~2/3 ของเหรียญ
  const raw = await sharp(join(FLUENT_DIR, `${FLUENT[k]}.svg`), { density: 400 }).resize(HAND, HAND).png().toBuffer()
  // ย้อมขาว (user เลือกแบบ B): เทา→สว่าง คงแสงเงา 3D · แล้วตัดด้วยอัลฟาของมือเดิม (dest-in)
  // ⚠️ ห้าม greyscale แล้ว joinChannel อัลฟา — ได้ภาพ 2 ช่อง sharp ตีความเพี้ยน เป็นกรอบสี่เหลี่ยมเทา (บั๊กรอบเดโม)
  const grey = await sharp(raw).flatten({ background: '#ffffff' }).greyscale().linear(0.45, 150).toColourspace('srgb').png().toBuffer()
  const hand = await sharp(grey).ensureAlpha().composite([{ input: raw, blend: 'dest-in' }]).png().toBuffer()
  const shadow = await sharp(raw).ensureAlpha().linear([0, 0, 0, 0.6], [0, 0, 0, 0]).blur(1.6).png().toBuffer()
  const off = Math.round((SIZE - HAND) / 2)
  return sharp(Buffer.from(coinSVG(k))).composite([
    { input: shadow, left: off + 1, top: off + 3 },
    { input: hand, left: off, top: off + 1 },
  ])
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  mkdirSync(OUT, { recursive: true })
  const keepSvg = process.argv.includes('--svg')
  for (const k of Object.keys(EL_ART)) {
    const svg = elementSVG(k)
    if (keepSvg) writeFileSync(join(OUT, `${k}.svg`), svg)
    await (await fluentCoin(k)).webp({ quality: 92 }).toFile(join(OUT, `${k}.webp`))
    console.log('✓', k)
  }
}
