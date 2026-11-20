// ════════════════════════════════════════════════════════════
//  ไอคอนสมุนไพรฟาร์ม — วาดเป็น SVG ด้วยโค้ด แล้วแปลงเป็น WebP 256px
//  ได้ 2 ไฟล์ต่อพืช: public/herbs/<id>.webp + <id>-gold.webp (ชุดสีทอง + ประกาย + รัศมี)
//  ใช้ WebP ไม่ใช่ SVG/CSS filter ด้วยเหตุผลเดียวกับ utils/emoji.js (iPhone raster SVG ใหม่ทุกเฟรม)
//  รัน: node scripts/herb-icons.mjs   (--svg เขียนไฟล์ .svg ต้นฉบับไว้ดูด้วย)
//  id ต้องตรงกับ data/crops.js — user เคาะหน้าตาจากเดโม 28 ก.ย. 2026
// ════════════════════════════════════════════════════════════
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'herbs')

const PAL = {
  n: { la: '#9be064', ld: '#3e8e2f', vein: '#2b6320', stem: '#4f8a2b', fw: '#ffffff', fa: '#8e5bc9',
       ra: '#eaa653', rd: '#9e5a25', cut: '#ff8f14', cutR: '#d8650a', red: '#ff6a45', redD: '#c2311c',
       yel: '#ffe04a', yelD: '#e0a010', ba: '#f1d7a8', bd: '#b8874e', cutY: '#fff1a8', cutYR: '#d6b04a',
       pink: '#ffb3c8', pinkD: '#e0588a', pod: '#b9c96a', podD: '#6f7d2e', fr: '#d9f29a', frD: '#8fb640',
       orn: '#ff9a1f', ornD: '#e0620a', spot: '#e8f7d8', wood: '#8a5c36' },
  g: { la: '#fff1a6', ld: '#c98c12', vein: '#8f5f07', stem: '#b8820f', fw: '#fffbe3', fa: '#e3a41c',
       ra: '#ffe07a', rd: '#a8700c', cut: '#fff0b0', cutR: '#d99a1a', red: '#ffd45a', redD: '#b87a0a',
       yel: '#fff6c0', yelD: '#d9a316', ba: '#ffeaa0', bd: '#b98314', cutY: '#fffbe0', cutYR: '#d9a316',
       pink: '#fff0b8', pinkD: '#d39a1a', pod: '#ffe68a', podD: '#a8700c', fr: '#fff6c8', frD: '#c98c12',
       orn: '#ffe07a', ornD: '#c98c12', spot: '#fffbe3', wood: '#a8700c' },
}

// ── ชิ้นส่วนวาด ──
const leaf = (x, y, len, w, rot, g, p, rib = true) =>
  `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0C${w} ${-len * .3} ${w * .8} ${-len * .75} 0 ${-len}C${-w * .8} ${-len * .75} ${-w} ${-len * .3} 0 0Z" fill="url(#${g})"/>${rib ? `<path d="M0 -1L0 ${-len * .88}" stroke="${p.vein}" stroke-width="1" opacity=".45" stroke-linecap="round"/>` : ''}</g>`
const flower5 = (x, y, r, fill, center) => {
  let s = ''
  for (let i = 0; i < 5; i++) s += `<ellipse cx="${x}" cy="${y - r * .6}" rx="${r * .45}" ry="${r * .62}" fill="${fill}" transform="rotate(${i * 72} ${x} ${y})"/>`
  return s + `<circle cx="${x}" cy="${y}" r="${r * .28}" fill="${center}"/>`
}
const stem = (d, p, w = 2.4) => `<path d="${d}" stroke="${p.stem}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`
const grad = (id, a, b, vertical = true) =>
  `<linearGradient id="${id}" x1="0" y1="${vertical ? 0 : 0}" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`

function defs(p, gold) {
  return `<defs>
  <linearGradient id="L" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${p.ld}"/><stop offset="1" stop-color="${p.la}"/></linearGradient>
  ${grad('R', p.ra, p.rd)}${grad('B', p.ba, p.bd)}${grad('P', p.pink, p.pinkD)}${grad('D', p.pod, p.podD)}
  ${grad('F', p.fr, p.frD)}${grad('O', p.orn, p.ornD)}${grad('Rd', p.red, p.redD)}
  <radialGradient id="H"><stop offset="0" stop-color="#ffe680" stop-opacity=".75"/><stop offset="1" stop-color="#ffe680" stop-opacity="0"/></radialGradient></defs>`
    + (gold ? `<circle cx="32" cy="34" r="31" fill="url(#H)"/>` : '')
}
function sparkles(gold) {
  if (!gold) return ''
  const st = (x, y, s) => `<path d="M${x} ${y - s}Q${x + s * .18} ${y - s * .18} ${x + s} ${y}Q${x + s * .18} ${y + s * .18} ${x} ${y + s}Q${x - s * .18} ${y + s * .18} ${x - s} ${y}Q${x - s * .18} ${y - s * .18} ${x} ${y - s}Z" fill="#fff" stroke="#f2b82a" stroke-width=".6"/>`
  return st(52, 10, 5) + st(10, 26, 3.5) + st(55, 44, 3)
}
// เหง้า (ขมิ้น/ขิง/ไพล) — fill = gradient id, cut = สีเนื้อตรงรอยตัด
function rhizome(p, fill, cut, cutR) {
  return `<ellipse cx="20" cy="51" rx="7" ry="4.4" transform="rotate(-28 20 51)" fill="url(#${fill})"/>
  <ellipse cx="39" cy="58" rx="6" ry="3.8" fill="url(#${fill})"/>
  <ellipse cx="32" cy="53" rx="15" ry="7.5" fill="url(#${fill})"/>
  <path d="M22 52Q32 50 42 53M24 56Q32 55 40 57" stroke="${p.rd}" stroke-width=".8" fill="none" opacity=".45"/>
  <ellipse cx="46" cy="49" rx="6.5" ry="4.4" transform="rotate(28 46 49)" fill="url(#${fill})"/>
  <circle cx="50" cy="47" r="4.2" fill="${cut}" stroke="${cutR}" stroke-width="1.2"/><circle cx="50" cy="47" r="2" fill="none" stroke="${cutR}" stroke-width=".6" opacity=".7"/>`
}

// ── 16 ชนิด (id ตรงกับ data/crops.js) ──
const DRAW = {
  // ฟ้าทะลายโจร — ต้นตั้ง ใบเรียวคู่ ดอกขาวจุดม่วง
  lettuce(p) {
    let s = stem('M32 60L32 11', p, 2.6)
    ;[[50, 20], [39, 17], [28, 13]].forEach(([y, l]) => { s += leaf(32, y, l, 5, -58, 'L', p) + leaf(32, y, l, 5, 58, 'L', p) })
    s += leaf(32, 20, 10, 3.6, 0, 'L', p, false)
    ;[[32, 9], [26.5, 12.5], [37.5, 12]].forEach(([x, y]) => { s += `<path d="M${x} ${y + 3}L${x} ${y}" stroke="${p.stem}" stroke-width=".8"/><ellipse cx="${x - 1.4}" cy="${y - 1}" rx="1.8" ry="2.8" transform="rotate(-25 ${x - 1.4} ${y - 1})" fill="${p.fw}" stroke="#c9b8e0" stroke-width=".5"/><ellipse cx="${x + 1.4}" cy="${y - 1}" rx="1.8" ry="2.8" transform="rotate(25 ${x + 1.4} ${y - 1})" fill="${p.fw}" stroke="#c9b8e0" stroke-width=".5"/><path d="M${x - 1.4} ${y - 2.2}L${x - 1.2} ${y}M${x + 1.4} ${y - 2.2}L${x + 1.2} ${y}" stroke="${p.fa}" stroke-width=".7" stroke-linecap="round"/>` })
    return s
  },
  // ขมิ้นชัน — ใบกว้าง 2 ใบ + เหง้าส้ม รอยตัดส้มสด
  tomato(p) {
    return leaf(30, 46, 36, 12, -22, 'L', p) + leaf(34, 46, 31, 10.5, 20, 'L', p) + rhizome(p, 'R', p.cut, p.cutR)
  },
  // ขิง — ลำต้นเทียมใบเรียงสลับ + เหง้าสีครีม รอยตัดเหลืองอ่อน
  corn(p) {
    let s = stem('M30 50L26 8', p, 2.2)
    ;[[29, 42, -62, 15], [28.3, 34, 60, 14], [27.6, 26, -58, 13], [26.9, 18, 56, 11]].forEach(([x, y, r, l]) => { s += leaf(x, y, l, 3.8, r, 'L', p) })
    s += leaf(26.4, 12, 8, 2.8, -8, 'L', p, false)
    return s + rhizome(p, 'B', p.cutY, p.cutYR)
  },
  // ว่านหางจระเข้ — กอใบอวบปลายแหลม มีจุดขาว
  potato(p) {
    let s = ''
    ;[[-50, 30], [50, 30], [-28, 40], [28, 40], [-8, 46], [10, 44]].forEach(([r, l]) => {
      s += `<g transform="translate(32 58) rotate(${r})"><path d="M-5 0C-5 -${l * .5} -2 -${l * .8} 0 -${l}C2 -${l * .8} 5 -${l * .5} 5 0Z" fill="url(#L)"/>`
        + `<path d="M-5 -4L-6.5 -6M5 -10L6.5 -12M-4.4 -16L-6 -18M4 -22L5.5 -24" stroke="${p.ld}" stroke-width="1" stroke-linecap="round"/>`
        + `<circle cx="-1.5" cy="-${l * .35}" r=".9" fill="${p.spot}"/><circle cx="1.5" cy="-${l * .55}" r=".8" fill="${p.spot}"/></g>`
    })
    return s + `<ellipse cx="32" cy="58.5" rx="11" ry="2.6" fill="${p.ld}" opacity=".5"/>`
  },
  // บัวบก — ใบกลมรูปไตบนก้านยาว
  strawberry(p) {
    const kid = (x, y, r) => `<path d="M${x} ${y}C${x - r * .25} ${y - r * .25} ${x - r * 1.05} ${y - r * .1} ${x - r} ${y - r * .95}C${x - r * .9} ${y - r * 1.9} ${x + r * .9} ${y - r * 1.9} ${x + r} ${y - r * .95}C${x + r * 1.05} ${y - r * .1} ${x + r * .25} ${y - r * .25} ${x} ${y}Z" fill="url(#L)"/>`
      + `<path d="M${x} ${y - r * .1}L${x} ${y - r * 1.4}M${x} ${y - r * .2}L${x - r * .7} ${y - r * 1.2}M${x} ${y - r * .2}L${x + r * .7} ${y - r * 1.2}" stroke="${p.vein}" stroke-width=".8" opacity=".45"/>`
    let s = stem('M32 60Q22 46 18 34', p, 1.8) + stem('M32 60Q44 44 46 30', p, 1.8) + stem('M32 60Q31 40 32 20', p, 1.8)
    s += kid(18, 34, 10) + kid(46, 30, 10) + kid(32, 22, 11)
    return s + `<path d="M20 60L44 60" stroke="${p.stem}" stroke-width="2" stroke-linecap="round"/>`
  },
  // พญายอ — กิ่งโค้ง ใบเรียวยาวคู่ ดอกหลอดสีแดงส้ม
  chili(p) {
    let s = stem('M30 60Q25 36 13 21', p) + stem('M34 60Q41 33 52 18', p)
    s += leaf(28, 46, 17, 3.6, -78, 'L', p) + leaf(28.5, 44, 15, 3.4, 15, 'L', p) + leaf(22, 33, 15, 3.4, -70, 'L', p) + leaf(22.5, 32, 13, 3.2, 10, 'L', p)
    s += leaf(36, 46, 17, 3.6, 78, 'L', p) + leaf(36, 44, 15, 3.4, -12, 'L', p) + leaf(43, 31, 15, 3.4, 72, 'L', p) + leaf(43, 30, 13, 3.2, -8, 'L', p)
    ;[[13, 19, -40], [16, 16, -15], [52, 16, 40], [49, 13, 15]].forEach(([x, y, r]) => { s += `<ellipse cx="${x}" cy="${y}" rx="2" ry="5.5" fill="${p.red}" stroke="${p.redD}" stroke-width=".6" transform="rotate(${r} ${x} ${y})"/>` })
    return s
  },
  // ชุมเห็ดเทศ — ช่อดอกเหลืองตั้งเป็นแท่งเทียน + ใบประกอบด้านล่าง
  eggplant(p) {
    let s = stem('M32 60L32 12', p, 2.4)
    ;[[54, 22, -70], [54, 22, 70], [46, 20, -62], [46, 20, 62]].forEach(([y, l, r]) => { s += leaf(32, y, l * .55, 5.5, r, 'L', p) })
    ;[[40, 16, -40], [40, 16, 40]].forEach(([y, l, r]) => { s += leaf(32, y, l * .55, 4.8, r, 'L', p) })
    ;[[32, 34, 4.2], [28.5, 29, 4], [35.5, 27, 4], [30, 22, 3.8], [34.5, 18, 3.6], [31, 14, 3.2], [33, 9.5, 2.6]].forEach(([x, y, r]) => { s += flower5(x, y, r, p.yel, p.yelD) })
    return s
  },
  // มะขามแขก — ฝักแบนโค้ง + ใบย่อยเรียว
  melon(p) {
    let s = stem('M14 58Q26 40 44 22', p, 2)
    ;[[18, 52, -72, 105], [23, 45, -62, 115], [29, 38, -52, 125], [35, 31, -42, 135]].forEach(([x, y, a, b]) => { s += leaf(x, y, 10, 3.2, a, 'L', p) + leaf(x, y, 10, 3.2, b, 'L', p) })
    const pod = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 0C5 -4 16 -4 22 1C16 6 5 5 0 0Z" fill="url(#D)" stroke="${p.podD}" stroke-width=".7"/><path d="M5 0.5L6.5 0.8M10 0.8L11.5 1M15 1L16.5 1.2" stroke="${p.podD}" stroke-width="1.8" stroke-linecap="round" opacity=".55"/></g>`
    return s + pod(38, 38, 20) + pod(36, 44, 42) + pod(42, 28, 4)
  },
  // กระเจี๊ยบแดง — กลีบเลี้ยงสีแดงอวบ + ใบแฉก
  mushroom(p) {
    let s = stem('M32 60L32 30', p, 2.4) + stem('M32 44Q22 40 18 30', p, 1.8) + stem('M32 40Q42 36 46 26', p, 1.8)
    s += leaf(32, 32, 20, 8, -40, 'L', p) + leaf(32, 32, 18, 7, 40, 'L', p) + leaf(32, 30, 16, 6, 0, 'L', p)
    const cal = (x, y, r) => `<g transform="translate(${x} ${y})"><path d="M0 ${r}C${-r * 1.1} ${r * .6} ${-r} ${-r * .6} 0 ${-r * 1.15}C${r} ${-r * .6} ${r * 1.1} ${r * .6} 0 ${r}Z" fill="url(#Rd)"/><path d="M0 ${r}L0 ${-r}M0 ${r}Q${-r * .6} 0 ${-r * .3} ${-r * .9}M0 ${r}Q${r * .6} 0 ${r * .3} ${-r * .9}" stroke="${p.redD}" stroke-width=".8" fill="none" opacity=".6"/><ellipse cx="${-r * .35}" cy="${-r * .2}" rx="${r * .18}" ry="${r * .4}" fill="#fff" opacity=".35"/></g>`
    return s + cal(18, 34, 7) + cal(46, 30, 7.5) + cal(32, 50, 6.5)
  },
  // ทองพันชั่ง — ใบรูปไข่ + ดอกขาวสองปาก
  herb(p) {
    let s = stem('M32 60L32 18', p, 2.4)
    ;[[50, 17, -55], [50, 17, 55], [38, 15, -60], [38, 15, 60], [27, 12, -50], [27, 12, 50]].forEach(([y, l, r]) => { s += leaf(32, y, l, 6.5, r, 'L', p) })
    const fl = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 4L0 -2" stroke="${p.stem}" stroke-width="1"/><ellipse cx="0" cy="-4.5" rx="4.5" ry="3" fill="${p.fw}" stroke="#d9d9d9" stroke-width=".5"/><ellipse cx="-2.8" cy="-1" rx="2" ry="1.4" fill="${p.fw}" stroke="#d9d9d9" stroke-width=".4"/><ellipse cx="2.8" cy="-1" rx="2" ry="1.4" fill="${p.fw}" stroke="#d9d9d9" stroke-width=".4"/></g>`
    return s + fl(32, 14, 0) + fl(24, 20, -25) + fl(40, 20, 25)
  },
  // ขี้เหล็ก — ใบประกอบขนนก + ช่อดอกเหลือง
  ginseng(p) {
    let s = stem('M16 60Q21 38 36 24', p, 2.2)
    ;[[17.5, 54, -80, 80], [19.5, 46, -72, 88], [23, 38.5, -62, 98], [28, 32, -52, 108], [33, 27, -42, 118]].forEach(([x, y, a, b]) => { s += leaf(x, y, 8.5, 4.6, a, 'L', p) + leaf(x, y, 8.5, 4.6, b, 'L', p) })
    ;[[44, 14, 5], [52, 21, 5.2], [45.5, 26, 4.6], [37, 17, 4.2], [53, 11, 3.8]].forEach(([x, y, r]) => { s += flower5(x, y, r, p.yel, p.yelD) })
    return s
  },
  // เพชรสังฆาต — เถาเป็นปล้องสี่เหลี่ยมหักมุม + มือเกาะ
  pumpkin(p) {
    const seg = [[14, 58, 22, 46], [22, 46, 20, 34], [20, 34, 30, 24], [30, 24, 42, 22], [42, 22, 48, 10]]
    let s = ''
    seg.forEach(([x1, y1, x2, y2]) => {
      s += `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${p.ld}" stroke-width="6.5" stroke-linecap="round"/><path d="M${x1} ${y1}L${x2} ${y2}" stroke="${p.la}" stroke-width="3.2" stroke-linecap="round"/>`
    })
    seg.slice(1).forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="3.8" fill="${p.ld}"/><circle cx="${x}" cy="${y}" r="1.8" fill="${p.vein}"/>` })
    s += `<path d="M30 24Q34 30 40 30Q44 30 44 34Q44 38 40 37" stroke="${p.stem}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`
    s += leaf(22, 46, 11, 5.5, 55, 'L', p) + leaf(42, 22, 10, 5, -35, 'L', p)
    return s
  },
  // ดอกคำฝอย — กระเปาะเขียว + พู่ดอกสีส้มเหลือง
  glowflower(p) {
    let s = stem('M32 60L32 34', p, 2.4) + leaf(32, 52, 16, 5, -55, 'L', p) + leaf(32, 46, 14, 4.5, 55, 'L', p)
    let tuft = ''
    for (let i = -5; i <= 5; i++) { const a = i * 13; tuft += `<path d="M32 26L${32 + Math.sin(a * Math.PI / 180) * 18} ${26 - Math.cos(a * Math.PI / 180) * 18}" stroke="${i % 2 ? p.orn : p.yel}" stroke-width="2.6" stroke-linecap="round"/>` }
    s += `<g>${tuft}</g>`
    s += `<path d="M22 28C22 40 42 40 42 28Z" fill="url(#L)"/><path d="M24 30L27 26M29 32L31 26M35 32L33 26M40 30L37 26" stroke="${p.ld}" stroke-width="1.4" stroke-linecap="round"/>`
    return s
  },
  // บัวหลวง — ดอกชมพูบนใบบัว
  lotus(p) {
    let s = `<ellipse cx="32" cy="54" rx="24" ry="7" fill="url(#L)"/><path d="M32 54L50 51" stroke="${p.vein}" stroke-width="1" opacity=".4"/>`
    s += stem('M32 54L32 40', p, 2.4)
    const pet = (r, l, w, f) => `<path d="M0 0C${w} ${-l * .35} ${w * .6} ${-l * .8} 0 ${-l}C${-w * .6} ${-l * .8} ${-w} ${-l * .35} 0 0Z" fill="url(#${f})" transform="translate(32 42) rotate(${r})"/>`
    s += pet(-62, 18, 7, 'P') + pet(62, 18, 7, 'P') + pet(-32, 22, 8, 'P') + pet(32, 22, 8, 'P') + pet(0, 26, 8.5, 'P')
    return s + `<ellipse cx="32" cy="41" rx="6" ry="2.4" fill="${p.yel}"/>`
  },
  // ไพล — ลำต้นเทียมใบเรียงสองแถวยาว + เหง้า รอยตัดเหลืองอมเขียว
  sunflower(p) {
    let s = stem('M34 50L36 6', p, 2.2)
    ;[[34.4, 44, -70], [34.8, 38, 70], [35.1, 32, -68], [35.4, 26, 68], [35.7, 20, -64], [36, 14, 62]].forEach(([x, y, r], i) => { s += leaf(x, y, 17 - i, 3.6, r, 'L', p) })
    return s + rhizome(p, 'B', p.fr, p.frD)
  },
  // มะขามป้อม — ผลกลมใสมีพูเส้น บนกิ่งใบฝอย
  moneytree(p) {
    let s = `<path d="M8 22Q30 16 56 26" stroke="${p.wood}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
    for (let i = 0; i < 9; i++) { const x = 12 + i * 5; s += leaf(x, 20 + Math.abs(i - 4) * .5, 7, 2, -18, 'L', p, false) + leaf(x + 2, 21, 6, 1.8, 200, 'L', p, false) }
    const fr = (x, y, r) => `<path d="M${x} ${y - r - 4}L${x} ${y - r}" stroke="${p.stem}" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="${r}" fill="url(#F)"/><path d="M${x} ${y - r}Q${x - r * .6} ${y} ${x} ${y + r}M${x} ${y - r}Q${x + r * .6} ${y} ${x} ${y + r}" stroke="${p.frD}" stroke-width=".8" fill="none" opacity=".6"/><ellipse cx="${x - r * .4}" cy="${y - r * .4}" rx="${r * .25}" ry="${r * .35}" fill="#fff" opacity=".55"/>`
    return s + fr(20, 38, 8) + fr(36, 42, 9.5) + fr(50, 36, 7.5)
  },

  // ── ขั้นบ้าน 13–20 (21 พ.ย. 2026) ──
  // หญ้าหนวดแมว — ใบหยักคู่ + ช่อดอกขาวม่วงอ่อนที่มีเกสรยาวยื่นเหมือนหนวดแมว
  catswhisker(p) {
    let s = stem('M32 60L32 22', p, 2.4)
    ;[[54, 15, -58], [54, 15, 58], [44, 14, -62], [44, 14, 62], [34, 12, -58], [34, 12, 58]].forEach(([y, l, r]) => { s += leaf(32, y, l, 5.6, r, 'L', p) })
    ;[[24, 32], [21, 26], [18, 20], [15, 14]].forEach(([y, w], i) => {
      ;[-1, 1].forEach(side => {
        const x = 32 + side * (3 + i * .4)
        s += `<ellipse cx="${x}" cy="${y}" rx="2.4" ry="1.6" fill="${p.fw}" stroke="#d2c6e6" stroke-width=".5"/>`
        s += `<path d="M${x} ${y}Q${x + side * w * .3} ${y - 6} ${x + side * w * .42} ${y - 9}M${x} ${y}Q${x + side * w * .22} ${y - 7} ${x + side * w * .28} ${y - 11}" stroke="${p.fa}" stroke-width=".6" fill="none" stroke-linecap="round"/>`
        s += `<circle cx="${x + side * w * .42}" cy="${y - 9}" r=".8" fill="${p.yel}"/><circle cx="${x + side * w * .28}" cy="${y - 11}" r=".8" fill="${p.yel}"/>`
      })
    })
    return s
  },
  // พริก — ต้นใบรี + ผลพริกแดงเรียวห้อย/ชี้ขึ้น
  capsicum(p) {
    let s = stem('M32 60L32 30', p, 2.4) + stem('M32 46Q22 40 16 30', p, 1.8) + stem('M32 42Q42 36 48 28', p, 1.8)
    s += leaf(18, 32, 13, 5, -40, 'L', p) + leaf(46, 30, 13, 5, 40, 'L', p) + leaf(32, 32, 14, 5.5, 0, 'L', p) + leaf(32, 52, 12, 5, -60, 'L', p) + leaf(32, 50, 12, 5, 60, 'L', p)
    const pod = (x, y, r, l) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 -2.2L0 0" stroke="${p.stem}" stroke-width="1.6" stroke-linecap="round"/><path d="M-2.4 0C-2.6 ${l * .5} -1 ${l * .9} 0.6 ${l}C1.6 ${l * .8} 2.6 ${l * .45} 2.4 0Z" fill="url(#Rd)"/><ellipse cx="-.8" cy="${l * .3}" rx=".6" ry="${l * .18}" fill="#fff" opacity=".4"/></g>`
    return s + pod(22, 40, 18, 14) + pod(40, 36, -14, 15) + pod(31, 26, 172, 12) + pod(46, 42, -28, 12)
  },
  // หญ้าดอกขาว — ต้นเล็ก ใบรี + ดอกเป็นพู่ฝอยสีม่วงอ่อนหลายดอก
  flowergrass(p) {
    let s = stem('M32 60L32 30', p, 2) + stem('M32 40Q24 30 20 20', p, 1.4) + stem('M32 38Q40 28 44 18', p, 1.4) + stem('M32 32L32 14', p, 1.4)
    s += leaf(32, 56, 14, 5, -62, 'L', p) + leaf(32, 54, 14, 5, 62, 'L', p) + leaf(32, 46, 11, 4.4, -55, 'L', p) + leaf(32, 45, 11, 4.4, 55, 'L', p)
    const puff = (x, y) => { let b = `<ellipse cx="${x}" cy="${y + 2}" rx="2.6" ry="2" fill="url(#L)"/>`; for (let a = -60; a <= 60; a += 20) b += `<path d="M${x} ${y + 1}L${x + Math.sin(a * Math.PI / 180) * 4.5} ${y + 1 - Math.cos(a * Math.PI / 180) * 4.5}" stroke="${p.fa}" stroke-width="1.3" stroke-linecap="round" opacity=".85"/>`; return b + `<circle cx="${x}" cy="${y - 2.8}" r="1.4" fill="${p.pink}"/>` }
    return s + puff(20, 18) + puff(44, 16) + puff(32, 12) + puff(26, 24) + puff(39, 23)
  },
  // กานพลู — กิ่งใบมัน + ช่อดอกตูมก้านแดงหัวกลม (แบบกานพลูแห้งที่เห็นในครัว)
  clove(p) {
    let s = `<path d="M8 50Q24 40 34 30" stroke="${p.wood}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
    s += leaf(14, 46, 16, 5.5, -70, 'L', p) + leaf(22, 41, 15, 5.2, 115, 'L', p) + leaf(28, 35, 13, 4.6, -55, 'L', p)
    const bud = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M-1.3 0L-1.6 12L1.6 12L1.3 0Z" fill="url(#Rd)"/><path d="M-1.6 12L-3.4 14.2M1.6 12L3.4 14.2" stroke="${p.redD}" stroke-width="1.3" stroke-linecap="round"/><circle cx="0" cy="15" r="2.6" fill="url(#O)"/></g>`
    ;[[36, 28, 205], [40, 26, 225], [42, 30, 250], [38, 32, 185], [44, 24, 240]].forEach(([x, y, r]) => { s += `<path d="M34 30L${x} ${y}" stroke="${p.redD}" stroke-width="1"/>` + bud(x, y, r) })
    return s
  },
  // เสลดพังพอน — ไม้พุ่ม ใบเรียวยาวคู่ + ดอกหลอดสีแดงส้มที่ปลายกิ่ง
  clinacanthus(p) {
    let s = stem('M32 60L32 16', p, 2.4) + stem('M32 44Q22 38 16 28', p, 1.6) + stem('M32 40Q42 34 48 24', p, 1.6)
    ;[[54, 18, -62], [54, 18, 62], [44, 16, -66], [44, 16, 66], [32, 14, -56], [32, 14, 56]].forEach(([y, l, r]) => { s += leaf(32, y, l, 3.6, r, 'L', p) })
    s += leaf(16, 30, 11, 3, -30, 'L', p) + leaf(48, 26, 11, 3, 30, 'L', p)
    const tube = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M-1.5 0L-1.8 -9C-1.8 -11 1.8 -11 1.8 -9L1.5 0Z" fill="url(#Rd)"/><path d="M0 -10.5L-2.6 -12.6M0 -10.5L2.6 -12.6" stroke="${p.redD}" stroke-width="1" stroke-linecap="round"/></g>`
    return s + tube(32, 16, 0) + tube(28, 18, -25) + tube(36, 18, 25) + tube(16, 28, -35) + tube(48, 24, 35)
  },
  // กระเทียม — หัวกลมเป็นกลีบ สีขาวอมม่วง + ใบแบนเรียวด้านบน
  garlic(p) {
    let s = leaf(30, 30, 24, 2.6, -14, 'L', p, false) + leaf(34, 30, 26, 2.6, 10, 'L', p, false) + leaf(32, 30, 22, 2.4, -2, 'L', p, false)
    const clove = (x, w, r) => `<path d="M${x} 58C${x - w} 54 ${x - w} 42 ${x} 34C${x + w} 42 ${x + w} 54 ${x} 58Z" fill="${p.fw}" stroke="#d6cbe4" stroke-width=".8" transform="rotate(${r} ${x} 56)"/>`
    s += `<path d="M18 50C16 40 24 33 32 32C40 33 48 40 46 50C44 58 20 58 18 50Z" fill="${p.fw}" stroke="#d6cbe4" stroke-width="1"/>`
    s += clove(24, 6, -14) + clove(40, 6, 14) + clove(32, 7, 0)
    s += `<path d="M24 40L25 54M32 36L32 56M40 40L39 54" stroke="${p.fa}" stroke-width=".8" opacity=".35"/><path d="M28 58L27 61M32 58L32 62M36 58L37 61" stroke="${p.bd}" stroke-width="1" stroke-linecap="round"/>`
    return s
  },
  // รางจืด — เถาใบรูปหัวใจ + ดอกปากแตรสีม่วงฟ้า
  thunbergia(p) {
    let s = `<path d="M10 58Q20 44 30 34Q40 24 54 14" stroke="${p.stem}" stroke-width="2" fill="none" stroke-linecap="round"/>`
    const heart = (x, y, r, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0C-${r} -${r * .2} -${r * 1.1} -${r * 1.3} 0 -${r * 1.9}C${r * 1.1} -${r * 1.3} ${r} -${r * .2} 0 0Z" fill="url(#L)"/><path d="M0 -.5L0 -${r * 1.7}" stroke="${p.vein}" stroke-width=".7" opacity=".45"/></g>`
    s += heart(16, 50, 7.5, -60) + heart(26, 38, 7.5, 60) + heart(40, 26, 7, -55) + heart(50, 18, 6, 55)
    const gold = p === PAL.g
    const fl = (x, y, r) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="${-r * .55}" rx="${r * .5}" ry="${r * .55}" fill="${gold ? p.yel : '#9db4f2'}" transform="rotate(${a})"/>`).join('')}<circle r="${r * .38}" fill="${gold ? p.fw : '#fff7c2'}"/><circle r="${r * .18}" fill="${gold ? p.yelD : '#5b6fc4'}"/></g>`
    return s + fl(34, 40, 7) + fl(46, 34, 6) + fl(20, 30, 5.5)
  },
  // มะแว้ง — กิ่งใบหยัก + ผลกลมเล็กเป็นพวง เขียว/ส้ม + ดอกม่วงรูปดาว
  solanum(p) {
    let s = stem('M32 60L32 22', p, 2.4) + stem('M32 40Q22 34 16 24', p, 1.6) + stem('M32 36Q42 30 48 20', p, 1.6)
    s += leaf(32, 52, 14, 6, -60, 'L', p) + leaf(32, 50, 14, 6, 60, 'L', p) + leaf(16, 26, 10, 4.6, -40, 'L', p) + leaf(48, 22, 10, 4.6, 40, 'L', p)
    const berry = (x, y, r, f) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${f})"/><ellipse cx="${x - r * .35}" cy="${y - r * .35}" rx="${r * .25}" ry="${r * .3}" fill="#fff" opacity=".5"/>`
    s += berry(26, 34, 3.6, 'O') + berry(31, 38, 3.8, 'O') + berry(38, 33, 3.6, 'D') + berry(34, 28, 3.2, 'O') + berry(42, 38, 3.2, 'D')
    const star = (x, y, r) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map(a => `<path d="M0 0L${-r * .35} ${-r * .6}L0 ${-r}L${r * .35} ${-r * .6}Z" fill="${p.fa}" transform="rotate(${a})"/>`).join('')}<circle r="${r * .25}" fill="${p.yel}"/></g>`
    return s + star(32, 18, 5) + star(22, 22, 4)
  },
  // บอระเพ็ด — เถาอวบเป็นตุ่มปุ่ม + ใบรูปหัวใจ
  tinospora(p) {
    const vine = 'M8 56Q20 50 26 40Q32 30 44 26Q52 23 56 14'
    let s = `<path d="${vine}" stroke="${p.ld}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="${vine}" stroke="${p.la}" stroke-width="3" fill="none" stroke-linecap="round"/>`
    ;[[14, 53], [20, 48], [25, 42], [29, 35], [36, 29], [44, 26], [51, 22]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="1.5" fill="${p.ld}"/><circle cx="${x - .4}" cy="${y - .4}" r=".6" fill="${p.spot}"/>` })
    const heart = (x, y, r, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0C-${r} -${r * .2} -${r * 1.1} -${r * 1.3} 0 -${r * 1.9}C${r * 1.1} -${r * 1.3} ${r} -${r * .2} 0 0Z" fill="url(#L)"/><path d="M0 -.5L0 -${r * 1.7}" stroke="${p.vein}" stroke-width=".7" opacity=".45"/></g>`
    return s + heart(22, 46, 8, -40) + heart(32, 32, 8.5, 30) + heart(46, 25, 7.5, -20) + heart(14, 54, 6, 50)
  },
  // น้อยหน่า — ผลกลมเป็นตุ่มเกล็ด สีเขียวนวล + ใบรี
  annona(p) {
    let s = stem('M32 16L32 6', p, 2) + leaf(32, 12, 15, 5.5, -60, 'L', p) + leaf(32, 12, 14, 5, 62, 'L', p)
    s += `<circle cx="32" cy="38" r="20" fill="url(#F)"/>`
    for (const [cx, cy] of [[24, 26], [32, 23], [40, 26], [19, 34], [27, 32], [37, 32], [45, 34], [19, 43], [27, 41], [37, 41], [45, 43], [24, 50], [32, 51], [40, 50], [32, 31.5], [32, 42]]) {
      s += `<path d="M${cx - 4} ${cy}Q${cx} ${cy - 5} ${cx + 4} ${cy}Q${cx} ${cy + 5} ${cx - 4} ${cy}Z" fill="none" stroke="${p.frD}" stroke-width=".9" opacity=".7"/>`
    }
    return s + `<ellipse cx="25" cy="30" rx="4" ry="6" fill="#fff" opacity=".3"/>`
  },
  // มะระขี้นก — ผลเล็กผิวขรุขระเป็นปุ่ม เขียว (มีลูกสุกสีส้ม) + ดอกเหลือง + มือเกาะ
  bittergourd(p) {
    let s = `<path d="M8 20Q24 12 40 16Q50 18 56 12" stroke="${p.stem}" stroke-width="1.6" fill="none"/>`
    s += leaf(18, 16, 11, 6, -150, 'L', p) + leaf(44, 17, 10, 5.6, 160, 'L', p) + flower5(52, 14, 4.6, p.yel, p.yelD)
    s += `<path d="M30 15Q27 9 31 7Q35 6 34 10" stroke="${p.stem}" stroke-width="1" fill="none"/>`
    const gourd = (x, y, rot, f, d) => { let b = `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0C5 4 6 16 0 26C-6 16 -5 4 0 0Z" fill="url(#${f})"/>`; for (let k = 5; k < 23; k += 3.4) b += `<circle cx="-2" cy="${k}" r="1" fill="${d}" opacity=".5"/><circle cx="2" cy="${k + 1.7}" r="1" fill="${d}" opacity=".5"/>`; return b + `<path d="M0 0L0 -4" stroke="${p.stem}" stroke-width="1.2"/></g>` }
    return s + gourd(24, 22, 14, 'F', p.frD) + gourd(36, 24, -10, 'F', p.frD) + gourd(46, 22, -24, 'O', p.ornD)
  },
  // เถาวัลย์เปรียง — เถาไม้เลื้อยสีน้ำตาลบิดเกลียว + ใบประกอบรี + ฝักแบนเล็ก
  derris(p) {
    let s = `<path d="M10 60C18 50 14 42 24 34C34 26 30 18 44 12" stroke="${p.wood}" stroke-width="4" fill="none" stroke-linecap="round"/>`
    s += `<path d="M10 60C18 50 14 42 24 34C34 26 30 18 44 12" stroke="${p.bd}" stroke-width="1.2" fill="none" stroke-dasharray="3 3" opacity=".6"/>`
    ;[[18, 46, 'L'], [28, 30, 'R'], [38, 18, 'L']].forEach(([x, y, side]) => {
      const dir = side === 'L' ? -1 : 1
      s += `<path d="M${x} ${y}L${x + dir * 14} ${y - 4}" stroke="${p.stem}" stroke-width="1.2"/>`
      ;[3, 7, 11].forEach(k => { s += leaf(x + dir * k, y - k * .28, 6.5, 3, dir * 60, 'L', p) + leaf(x + dir * k, y - k * .28, 6.5, 3, dir * 140, 'L', p) })
      s += leaf(x + dir * 14, y - 4, 7, 3.2, dir * 100, 'L', p)
    })
    s += `<g transform="translate(40 40) rotate(20)"><path d="M0 0C4 -3 13 -3 18 1C13 5 4 4 0 0Z" fill="url(#D)" stroke="${p.podD}" stroke-width=".7"/></g>`
    return s
  },
}

export const HERB_IDS = Object.keys(DRAW)

export function herbSvg(id, gold) {
  const p = gold ? PAL.g : PAL.n
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="256" height="256">${defs(p, gold)}${DRAW[id](p)}${sparkles(gold)}</svg>`
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  mkdirSync(OUT, { recursive: true })
  const keepSvg = process.argv.includes('--svg')
  for (const id of HERB_IDS) {
    for (const gold of [false, true]) {
      const svg = herbSvg(id, gold)
      const name = gold ? `${id}-gold` : id
      if (keepSvg) writeFileSync(join(OUT, `${name}.svg`), svg)
      await sharp(Buffer.from(svg)).resize(256, 256).webp({ quality: 88, alphaQuality: 100 }).toFile(join(OUT, `${name}.webp`))
    }
  }
  console.log(`เขียน ${HERB_IDS.length * 2} ไฟล์ → ${OUT}`)
}
