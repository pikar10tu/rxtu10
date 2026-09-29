// ════════════════════════════════════════════════════════════
//  ภาพเอฟเฟกต์โชว์ไทม์เลเจนด์ — วาด SVG ด้วยโค้ด แล้วแปลงเป็น WebP 192px (โปร่งใส)
//  ออก public/fx/<name>.webp · ใช้ WebP ไม่ใช่ SVG เหตุผลเดียวกับ utils/emoji.js
//  (iPhone raster SVG ใหม่ทุกเฟรมที่มันขยับ = กระตุก) · แนวภาพเดียวกับ scripts/herb-icons.mjs
//  รัน: node scripts/fx-art.mjs   (--svg เขียน .svg ต้นฉบับไว้ดูด้วย)
//  ชื่อไฟล์ต้องตรงกับ utils/battleShowtime.js
// ════════════════════════════════════════════════════════════
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'fx')
const SIZE = 192

const lg = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`
const rg = (id, stops, cx = .5, cy = .5, r = .5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</radialGradient>`
const glow = (id, sd = 1.6) => `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`
const star4 = (x, y, s, fill = '#fff', stroke = 'none') => `<path d="M${x} ${y - s}Q${x + s * .18} ${y - s * .18} ${x + s} ${y}Q${x + s * .18} ${y + s * .18} ${x} ${y + s}Q${x - s * .18} ${y + s * .18} ${x - s} ${y}Q${x - s * .18} ${y - s * .18} ${x} ${y - s}Z" fill="${fill}" stroke="${stroke}" stroke-width=".6"/>`
const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${SIZE}" height="${SIZE}">${body}</svg>`

// เปลวไฟหยดน้ำ 3 ชั้น (แดง→ส้ม→เหลือง→แกนขาว)
const flameShape = (cx, by, h, w) => `M${cx} ${by - h}C${cx + w * .25} ${by - h * .7} ${cx + w} ${by - h * .5} ${cx + w * .8} ${by - h * .2}C${cx + w * .7} ${by} ${cx + w * .2} ${by + 1} ${cx} ${by + 1}C${cx - w * .2} ${by + 1} ${cx - w * .7} ${by} ${cx - w * .8} ${by - h * .2}C${cx - w} ${by - h * .45} ${cx - w * .3} ${by - h * .55} ${cx} ${by - h}Z`

const ART = {
  // 🐉 บาฮามุท — เปลวไฟ (ใช้ทั้งสายไฟที่พ่นและไฟลุกบนการ์ด)
  flame: () => svg(`<defs>${lg('a', [[0, '#ff3d1f'], [1, '#b3130a']])}${lg('b', [[0, '#ffb01f'], [1, '#ff5a14']])}${lg('c', [[0, '#fff6b0'], [1, '#ffc93a']])}${glow('g', 2)}</defs>
    <g filter="url(#g)"><path d="${flameShape(32, 58, 54, 22)}" fill="url(#a)"/><path d="${flameShape(33, 57, 40, 16)}" fill="url(#b)"/>
    <path d="${flameShape(32, 56, 26, 10)}" fill="url(#c)"/><ellipse cx="32" cy="50" rx="4" ry="6" fill="#fff" opacity=".85"/></g>
    <circle cx="14" cy="22" r="2" fill="#ffb01f"/><circle cx="50" cy="16" r="1.6" fill="#ffd34a"/><circle cx="48" cy="30" r="1.2" fill="#ff7a1a"/>`),
  // 🦁 สิงโต/🦍 กอริลลา — คลื่นกระแทกวงแหวนทอง
  roar: () => svg(`<defs>${rg('r', [[.55, '#ffd54a', 0], [.72, '#ffe98a', .95], [.8, '#fff7cf', 1], [.9, '#ffb62e', .7], [1, '#ff8a00', 0]])}</defs>
    <circle cx="32" cy="32" r="31" fill="url(#r)"/>
    ${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path d="M32 3L33.6 9L30.4 9Z" fill="#fff4b8" transform="rotate(${a + 22} 32 32)"/>`).join('')}`),
  // 🐳 วาฬ — คลื่นม้วน + ฟองคลื่น
  wave: () => svg(`<defs>${lg('w', [[0, '#7fe3ff'], [.5, '#2aa7ea'], [1, '#0b5fae']])}${lg('f', [[0, '#ffffff'], [1, '#c8f3ff']])}${glow('g', 1.2)}</defs>
    <g filter="url(#g)"><path d="M2 58C4 40 14 24 30 18C44 13 56 20 58 32C59 40 52 44 46 40C42 37 44 31 48 32C44 26 34 26 28 34C22 42 22 52 26 58Z" fill="url(#w)"/>
    <path d="M30 18C44 13 56 20 58 32C59 40 52 44 46 40C42 37 44 31 48 32C50 28 44 22 36 22C33 22 31 21 30 18Z" fill="url(#f)" opacity=".9"/>
    <path d="M8 50C12 38 20 30 30 27" stroke="#dff8ff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/></g>
    <circle cx="54" cy="12" r="3" fill="#dff8ff" opacity=".9"/><circle cx="60" cy="20" r="1.8" fill="#dff8ff"/><circle cx="48" cy="8" r="1.5" fill="#fff"/>`),
  // 🐦‍🔥 ฟีนิกซ์ — ปีกไฟกางสองข้าง (วางหลังการ์ด)
  wings: () => {
    const wing = (flip) => `<g transform="${flip ? 'translate(64 0) scale(-1 1)' : ''}">
      <path d="M30 40C22 38 10 34 3 22C9 24 13 24 15 22C9 18 6 12 6 6C12 12 18 14 22 14C19 10 19 6 21 2C24 10 28 18 31 30Z" fill="url(#w)"/>
      <path d="M30 38C24 34 16 28 12 20M30 34C25 26 22 18 21 8M30 36C20 32 12 28 8 22" stroke="#fff3a0" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".8"/></g>`
    return svg(`<defs>${lg('w', [[0, '#fff08a'], [.45, '#ff9d1f'], [1, '#e8290f']], 1, 1)}${glow('g', 1.8)}</defs><g filter="url(#g)">${wing(false)}${wing(true)}</g>`)
  },
  // 🐦‍🔥 ขนไฟลอยขึ้น
  feather: () => svg(`<defs>${lg('f', [[0, '#fff3a0'], [.5, '#ff9a1f'], [1, '#e0300f']])}${glow('g', 1.4)}</defs>
    <g filter="url(#g)" transform="rotate(-20 32 32)"><path d="M32 4C44 16 44 36 34 54L30 54C20 36 20 16 32 4Z" fill="url(#f)"/>
    <path d="M32 8L32 60" stroke="#fff6c8" stroke-width="1.4" stroke-linecap="round"/>
    ${[16, 24, 32, 40].map(y => `<path d="M32 ${y}L${40 - (y - 16) / 6} ${y - 5}M32 ${y}L${24 + (y - 16) / 6} ${y - 5}" stroke="#ffe27a" stroke-width=".8" opacity=".8"/>`).join('')}</g>`),
  // 👹 คิริน — ฟ้าผ่ากระบองลง + รอยแตก
  smash: () => svg(`<defs>${lg('b', [[0, '#ffffff'], [.5, '#fff27a'], [1, '#ffb400']])}${glow('g', 2)}</defs>
    <g filter="url(#g)"><path d="M36 1L20 30L30 30L22 58L46 22L35 22L44 1Z" fill="url(#b)" stroke="#fff" stroke-width="1"/></g>
    <path d="M22 58L10 56M22 58L12 63M22 58L34 63M22 58L36 55" stroke="#ffd34a" stroke-width="1.8" stroke-linecap="round"/>`),
  // 🦖 ทีเร็กซ์ — รอยข่วน 3 เส้น
  claw: () => svg(`<defs>${lg('c', [[0, '#ffffff', 0], [.3, '#ffe0e0'], [.6, '#ff3b3b'], [1, '#8a0000', 0]], 1, 1)}${glow('g', 1.3)}</defs>
    <g filter="url(#g)">${[-12, 0, 12].map(dx => `<path d="M${16 + dx} 6C${24 + dx} 22 ${34 + dx} 38 ${50 + dx} 58L${46 + dx} 58C${32 + dx} 42 ${22 + dx} 26 ${14 + dx} 8Z" fill="url(#c)"/>`).join('')}</g>`),
  // 🐍 อูโรโบรอส — งูกินหางเป็นวง
  ouro: () => svg(`<defs>${lg('s', [[0, '#b8f06a'], [.5, '#3aa655'], [1, '#e0b43a']], 1, 1)}${glow('g', 1.2)}</defs>
    <g filter="url(#g)"><circle cx="32" cy="32" r="22" fill="none" stroke="url(#s)" stroke-width="7"/>
    <circle cx="32" cy="32" r="22" fill="none" stroke="#1f6b35" stroke-width="7" stroke-dasharray="2 5" opacity=".35"/>
    <path d="M47 13C53 10 58 13 57 19C56 23 51 23 49 20Z" fill="#3aa655"/><circle cx="53" cy="15" r="1.3" fill="#ffe14a"/>
    <path d="M45 16L48 19" stroke="#e0b43a" stroke-width="3" stroke-linecap="round"/></g>
    ${star4(32, 32, 5, '#fff7c2', '#e0b43a')}`),
  // 🦅 ซีมุร์ก — กรงเล็บลมโฉบ (เคียวลม)
  talon: () => svg(`<defs>${lg('t', [[0, '#e6fbff', 0], [.4, '#9ff0ff'], [.8, '#2fb6d6'], [1, '#0a6e8a', 0]], 1, 0)}${glow('g', 1.6)}</defs>
    <g filter="url(#g)"><path d="M4 12C22 18 40 32 58 58C44 40 26 28 6 22Z" fill="url(#t)"/>
    <path d="M10 4C28 12 44 28 60 48C46 34 30 22 12 14Z" fill="url(#t)" opacity=".7"/></g>
    ${star4(56, 54, 4)}`),
  // 🐘 กิเลน (qilin) — ฟองฝันคุ้มกัน
  dream: () => svg(`<defs>${rg('d', [[0, '#f3e8ff', .1], [.7, '#c79bff', .35], [.92, '#a26bff', .9], [1, '#7b3fe0', 0]])}</defs>
    <circle cx="32" cy="32" r="30" fill="url(#d)"/><ellipse cx="22" cy="18" rx="8" ry="4" fill="#fff" opacity=".55" transform="rotate(-30 22 18)"/>
    ${star4(44, 22, 3.5)}${star4(20, 42, 2.5)}${star4(40, 46, 2)}`),
  // 👾 ไวรัส — สปอร์หนาม
  spore: () => svg(`<defs>${rg('v', [[0, '#e6ff9a'], [.6, '#7ad83a'], [1, '#2f8a1a']], .4, .4)}${glow('g', 1.2)}</defs>
    <g filter="url(#g)">${Array.from({ length: 10 }, (_, i) => `<g transform="rotate(${i * 36} 32 32)"><path d="M32 12L32 4" stroke="#5fbf2a" stroke-width="2.4" stroke-linecap="round"/><circle cx="32" cy="4" r="2.6" fill="#b4f25a"/></g>`).join('')}
    <circle cx="32" cy="32" r="18" fill="url(#v)"/></g>
    <circle cx="26" cy="28" r="3" fill="#2f8a1a" opacity=".5"/><circle cx="38" cy="36" r="2.4" fill="#2f8a1a" opacity=".5"/><circle cx="36" cy="24" r="1.6" fill="#fff" opacity=".7"/>`),
  // 🦍 กอริลลา — แรงสั่นพื้น (รอยแตก + ฝุ่น)
  quake: () => svg(`<defs>${rg('q', [[0, '#fff1c2', .9], [.5, '#ffb24a', .55], [1, '#c26a1a', 0]])}</defs>
    <ellipse cx="32" cy="40" rx="30" ry="14" fill="url(#q)"/>
    <path d="M32 40L20 34L10 36M32 40L44 33L55 35M32 40L26 50L18 54M32 40L40 50L48 53" stroke="#7a3e10" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    ${[[10, 26, 3], [54, 24, 2.6], [20, 18, 2], [44, 16, 2.2]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#b98a5a"/>`).join('')}`),
  // 🦣 แมมมอธ — โล่หินหกเหลี่ยม
  stone: () => svg(`<defs>${lg('s', [[0, '#e8d3b0'], [.5, '#a88457'], [1, '#6a4a2a']])}${glow('g', 1)}</defs>
    <g filter="url(#g)"><path d="M32 3L56 16L56 44L32 61L8 44L8 16Z" fill="url(#s)" stroke="#fff3d6" stroke-width="1.6"/>
    <path d="M32 11L49 20L49 40L32 52L15 40L15 20Z" fill="none" stroke="#4a3018" stroke-width="1" opacity=".5"/>
    <path d="M32 20L32 42M24 27L40 35M40 27L24 35" stroke="#7cf0ff" stroke-width="2" stroke-linecap="round" opacity=".9"/></g>`),
  // ☀️ ซอล — ดวงอาทิตย์รัศมี
  sun: () => svg(`<defs>${rg('s', [[0, '#ffffff'], [.35, '#fff3a0'], [.7, '#ffc21a'], [1, '#ff9a00', 0]])}${lg('r', [[0, '#fff6b8'], [1, '#ffb800', 0]])}</defs>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M30 4L34 4L32 20Z" fill="url(#r)" transform="rotate(${i * 30} 32 32)"/>`).join('')}
    <circle cx="32" cy="32" r="16" fill="url(#s)"/>`),
  // 🌍 เอิร์ธ — ใบไม้ฤดูกาล
  leaf: () => svg(`<defs>${lg('l', [[0, '#ffd24a'], [.5, '#ff8a2a'], [1, '#c8341a']], 1, 1)}${glow('g', 1)}</defs>
    <g filter="url(#g)" transform="rotate(25 32 32)"><path d="M32 4L37 16L48 12L44 24L58 26L46 34L52 44L38 40L34 56L30 40L16 44L22 34L8 26L22 24L18 12L28 16Z" fill="url(#l)"/>
    <path d="M32 58L32 16M32 34L20 26M32 34L44 26M32 44L24 40M32 44L40 40" stroke="#8a2410" stroke-width="1" opacity=".55" stroke-linecap="round"/></g>`),
  // 🌙 ลูน่า — จันทร์เสี้ยวเงินฟ้า
  moon: () => svg(`<defs>${lg('m', [[0, '#ffffff'], [.5, '#dce8ff'], [1, '#8fa8ff']], 1, 1)}${rg('h', [[0, '#b8c8ff', .6], [1, '#6a7fff', 0]])}${glow('g', 1.4)}</defs>
    <circle cx="32" cy="32" r="31" fill="url(#h)"/>
    <mask id="k"><rect width="64" height="64" fill="#fff"/><circle cx="42" cy="26" r="19" fill="#000"/></mask>
    <g filter="url(#g)"><circle cx="30" cy="34" r="22" fill="url(#m)" mask="url(#k)"/></g>
    ${star4(48, 20, 3.5)}${star4(52, 40, 2.4)}${star4(44, 50, 1.8)}`),
  // ✨ ประกายทั่วไป
  star: () => svg(`<defs>${glow('g', 1.5)}</defs><g filter="url(#g)">${star4(32, 32, 26, '#fffbe0', '#ffd34a')}</g>`),
}

mkdirSync(OUT, { recursive: true })
const writeSvg = process.argv.includes('--svg')
let total = 0
for (const [name, draw] of Object.entries(ART)) {
  const s = draw()
  if (writeSvg) writeFileSync(join(OUT, name + '.svg'), s)
  const buf = await sharp(Buffer.from(s)).resize(SIZE, SIZE).webp({ quality: 88, alphaQuality: 90 }).toBuffer()
  writeFileSync(join(OUT, name + '.webp'), buf)
  total += buf.length
  console.log(name.padEnd(8), (buf.length / 1024).toFixed(1) + 'KB')
}
console.log('รวม', (total / 1024).toFixed(1) + 'KB', '→', OUT)
