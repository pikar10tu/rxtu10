// วางของตกแต่งสนามใน "เขตขอบนอก" (ระหว่างขอบจอกับกล่องต่อสู้) — pure · เทส: node --test src/utils/arenaLayout.test.js
// 🔑 ของตกแต่งห้ามแตะกล่องต่อสู้เด็ดขาด: เขตถูกคำนวณจาก rect จริงของ .br-box ทุกครั้งที่วาง
//    จอเล็กที่ไม่พอ = ชิ้นนั้นไม่ถูกวาด (ห้ามเบียดเข้าไปทับเพ็ท) — user ถาม "จะโดดไปชนกันมั้ย" 25 ก.ย. 2026
// กติกา: ชิ้นแรกได้ที่ก่อน (ผู้เรียกใส่ป้ายสลักแชมป์เป็นชิ้นแรก) · ชิ้นหลังชนของที่วางแล้ว →
//        ลองชิดขอบจอฝั่งเดิม → ลอง d = 1 แล้ว d = 0 → ยังไม่ได้ = skip
const PAD = 4

/**
 * @param W     ความกว้างพื้นที่ (px)
 * @param zone  { y0, y1 } เขตขอบนอก ในพิกัดของชั้นพื้นฝั่งนั้น
 * @param side  'top' = กล่องต่อสู้อยู่ใต้เขต · 'bot' = กล่องต่อสู้อยู่เหนือเขต
 * @param items [{ key, w, h, x (0–100 %), d (0 ชิดกล่อง – 1 ชิดขอบจอ) }]
 * @returns [{ key, x, y }] (จุดกึ่งกลาง) หรือ { key, skip: true }
 */
export function layoutDeco({ W, zone, side, items }) {
  const zh = zone.y1 - zone.y0
  const placed = []
  const out = []
  for (const it of items || []) {
    const { w, h } = it
    if (h + PAD * 2 > zh) { out.push({ key: it.key, skip: true }); continue }
    const span = zh - h - PAD * 2
    const xAt = (px) => Math.min(W - w / 2 - 6, Math.max(w / 2 + 6, px))
    const yAt = (d) => {
      const f = PAD + h / 2 + d * span
      return side === 'top' ? zone.y1 - f : zone.y0 + f
    }
    const box = (x, y) => ({ l: x - w / 2 - PAD, r: x + w / 2 + PAD, t: y - h / 2 - PAD, b: y + h / 2 + PAD })
    const hits = (q) => placed.some(p => !(q.r <= p.l || q.l >= p.r || q.b <= p.t || q.t >= p.b))
    const want = (it.x / 100) * W
    const edge = want < W / 2 ? 0 : W
    let spot = null
    for (const px of [want, edge]) {
      for (const d of [it.d, 1, 0]) {
        const x = xAt(px), y = yAt(d), q = box(x, y)
        if (!hits(q)) { spot = { x, y, q }; break }
      }
      if (spot) break
    }
    if (!spot) { out.push({ key: it.key, skip: true }); continue }
    placed.push(spot.q)
    out.push({ key: it.key, x: spot.x, y: spot.y })
  }
  return out
}
