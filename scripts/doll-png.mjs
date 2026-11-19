// 🖼️ เรนเดอร์ตุ๊กตาเป็น PNG (19 พ.ย. 2026) — ไว้ให้ Claude/agent เปิดดูภาพจริงโดยไม่ต้องเปิดเว็บ
// node scripts/doll-png.mjs <out.png> <scale> '<json: [[label, eq], ...]>'
//   ไม่ใส่ json = ชุดตัวอย่างทั้งหมด (OUTFITS) · พื้นหลังลายตาราง · เรียงแถวละ 6 ตัว
import fs from 'node:fs'
import zlib from 'node:zlib'
import { OUTFITS } from '../src/data/dollParts.js'
import { render } from '../src/utils/dollRender.js'

const [out = 'doll.png', scaleArg = '4', listArg] = process.argv.slice(2)
const S = Math.max(1, parseInt(scaleArg, 10) || 4)
const list = listArg ? JSON.parse(listArg) : OUTFITS.map(o => [o.name, o.eq])
const COLS = Math.min(6, list.length)
const cells = list.map(([, eq]) => render(eq))
const cw = cells[0].w * S, ch = cells[0].h * S, GAP = 2 * S
const W = COLS * (cw + GAP) + GAP, H = Math.ceil(list.length / COLS) * (ch + GAP) + GAP
const buf = Buffer.alloc(W * H * 3)
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16))
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const v = ((x >> 3) + (y >> 3)) % 2 ? 0xDD : 0xE8
  buf.set([v, v + 4, v + 10], (y * W + x) * 3)
}
cells.forEach((c, n) => {
  const ox = GAP + (n % COLS) * (cw + GAP), oy = GAP + Math.floor(n / COLS) * (ch + GAP)
  for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) {
    const v = c.px[y][x]; if (!v) continue
    const rgb = hex(v)
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) buf.set(rgb, ((oy + y * S + j) * W + ox + x * S + i) * 3)
  }
})
// PNG (RGB 8-bit, filter 0)
const raw = Buffer.alloc((W * 3 + 1) * H)
for (let y = 0; y < H; y++) buf.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3)
const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 })
const crc = b => { let c = 0xFFFFFFFF; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0 }
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td))
  return Buffer.concat([len, td, c])
}
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2
fs.writeFileSync(out, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]))
console.log(out, W + 'x' + H, list.map(l => l[0]).join(' · '))
