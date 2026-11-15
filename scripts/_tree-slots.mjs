// คำนวณจุดวางชิ้นบนพุ่ม 🌳 จาก mask จริงของภาพ (ไม่ใช่วงรี) → พิมพ์ SLOTS + ภาพพรีวิว
// ฉาก viewBox 400x420 · ต้นไม้วางที่ x=-14 y=-22 w=428 h=432 (เท่าเดโม v5)
import sharp from 'sharp'
const W = 400, H = 420, TX = -14, TY = -22, TW = 428, TH = 432
const out = process.argv[2] || 'tree-slots.png'
const tree = await sharp('public/emoji/fluent/1f333.svg', { density: 1000 }).resize(TW, TH, { fit: 'fill' }).png().toBuffer()
const P = 30
const mk = bg => sharp({ create: { width: W + P * 2, height: H + P * 2, channels: 4, background: bg } }).composite([{ input: tree, left: TX + P, top: TY + P }]).png().toBuffer()
  .then(b => sharp(b).extract({ left: P, top: P, width: W, height: H }))
const base = await (await mk({ r: 232, g: 243, b: 248, alpha: 1 })).png().toBuffer()
const { data } = await (await mk({ r: 0, g: 0, b: 0, alpha: 0 })).raw().toBuffer({ resolveWithObject: true })
const canopy = new Uint8Array(W * H)
for (let i = 0; i < W * H; i++) { const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2], a = data[i * 4 + 3]; canopy[i] = a > 200 && g > r + 12 && g > b ? 1 : 0 }
// ระยะถึงขอบพุ่ม (brute-force chamfer 2 pass)
const dist = new Float32Array(W * H).fill(1e9)
for (let i = 0; i < W * H; i++) if (!canopy[i]) dist[i] = 0
const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? 0 : dist[y * W + x]
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; dist[i] = Math.min(dist[i], at(x - 1, y) + 1, at(x, y - 1) + 1, at(x - 1, y - 1) + 1.414, at(x + 1, y - 1) + 1.414) }
for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) { const i = y * W + x; dist[i] = Math.min(dist[i], at(x + 1, y) + 1, at(x, y + 1) + 1, at(x + 1, y + 1) + 1.414, at(x - 1, y + 1) + 1.414) }
const MARGIN = +process.argv[3] || 17, N = +process.argv[4] || 26
const cand = []
for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (dist[y * W + x] >= MARGIN) cand.push([x, y])
let ys = cand.map(c => c[1]), xs = cand.map(c => c[0])
console.error('canopy bbox', Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys), 'cands', cand.length)
// farthest-point เริ่มจากกลางพุ่ม แล้ว Lloyd 12 รอบให้ระยะห่างสม่ำเสมอ
let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
let pts = [cand[Math.floor(cand.length / 2)]]
while (pts.length < N) { let best = null, bd = -1; for (const c of cand) { let d = 1e9; for (const p of pts) d = Math.min(d, Math.hypot(p[0] - c[0], p[1] - c[1])); if (d > bd) { bd = d; best = c } } pts.push(best) }
for (let it = 0; it < 12; it++) { const acc = pts.map(() => [0, 0, 0]); for (const c of cand) { let bi = 0, bd = 1e9; pts.forEach((p, i) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2; if (d < bd) { bd = d; bi = i } }); acc[bi][0] += c[0]; acc[bi][1] += c[1]; acc[bi][2]++ }
  pts = pts.map((p, i) => acc[i][2] ? [acc[i][0] / acc[i][2], acc[i][1] / acc[i][2]] : p) }
// ขยับสุ่มเล็กน้อยให้ดูเป็นธรรมชาติ + มุมเอียง
pts = pts.map(([x, y]) => [Math.round(x + (rnd() - .5) * 7), Math.round(y + (rnd() - .5) * 7), Math.round((rnd() - .5) * 50)])
pts.sort((a, b) => a[1] - b[1] || a[0] - b[0])
let minD = 1e9; pts.forEach((p, i) => pts.forEach((q, j) => { if (i < j) minD = Math.min(minD, Math.hypot(p[0] - q[0], p[1] - q[1])) }))
console.error('minDist', minD.toFixed(1))
console.log(JSON.stringify(pts))
const dots = pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 2 ? 16 : 13}" fill="${i % 2 ? '#e3a72f' : '#fff'}" fill-opacity=".85" stroke="#333"/>`).join('')
await sharp(base).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${dots}</svg>`) }]).png().toFile(out)
