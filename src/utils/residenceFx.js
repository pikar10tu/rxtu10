// ✨ เอฟเฟคฉากบ้าน (ResidenceScene) — จุดพิกเซลขยับบน canvas 180×100 (20 พ.ย. 2026)
// แต่ละฉากมีชนิดของตัวเอง + ความอลังการไล่ตามขั้น (user: "แสงอลังการตามระดับบ้าน")
//   ขั้น 1–5  เบาๆ ไม่กี่จุด
//   ขั้น 6–10 จุดเยอะขึ้น + ประกายใหญ่
//   ขั้น 11–15 + แสงเรืองทั้งฉาก
//   ขั้น 16–20 + ลำแสงส่องลงมา + ประกายดาวสี่แฉก
// sceneFx(n) → step(g, t) วาด 1 เฟรม (ล้างเองทุกเฟรม)

// [ชนิด, สี, จำนวนตั้งต้น, y0, y1]
const KIND = {
  1: ['leaf', '#9cc58a', 4, 20, 90], 2: ['flick', '#ffd98a', 4, 40, 85], 3: ['mote', '#fff6d8', 8, 10, 90],
  4: ['leaf', '#c9a46a', 5, 20, 90], 5: ['mote', '#fff3dc', 8, 10, 90], 6: ['leaf', '#a6d6c4', 5, 20, 90],
  7: ['twinkle', '#ffe9a8', 10, 30, 60], 8: ['cloud', '#ffffff', 3, 4, 26], 9: ['sparkle', '#ffffff', 10, 48, 66],
  10: ['sparkle', '#ffffff', 8, 82, 96], 11: ['twinkle', '#ffe9a8', 12, 50, 66], 12: ['sparkle', '#ffffff', 12, 58, 92],
  13: ['sparkle', '#ffffff', 14, 56, 98], 14: ['bubble', '#e6fbff', 12, 0, 100], 15: ['petal', '#ffd1e6', 10, 0, 100],
  16: ['twinkle', '#ffffff', 16, 0, 40], 17: ['shoot', '#ffffff', 16, 0, 60], 18: ['twinkle', '#ffe4ff', 16, 0, 70],
  19: ['rainbow', '', 14, 0, 90], 20: ['twinkle', '#fff2b0', 16, 0, 100],
}
// สีแสงเรือง/ลำแสง ของฉากขั้นสูง
const GLOW = { 11: '#ffd9a0', 12: '#fff4c0', 13: '#d8f6ff', 14: '#c8fff4', 15: '#ffe6f6', 16: '#e8dcff', 17: '#cfe6ff', 18: '#ffd6fb', 19: '#ffe0f0', 20: '#fff1a8' }

const rnd = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v) }

export function sceneFx(n) {
  const [kind, col, base, y0, y1] = KIND[n] || KIND[1]
  const boost = n <= 5 ? 1 : n <= 10 ? 1.4 : n <= 15 ? 1.8 : 2.3
  const N = Math.round(base * boost)
  const big = n > 5                       // ประกายโตเป็น 2 พิกเซลตอนสว่างสุด
  const glow = n > 10 ? GLOW[n] : null    // แสงเรืองทั้งฉาก
  const rays = n > 15                     // ลำแสง + ดาวสี่แฉก
  const P = [...Array(N)].map((_, i) => [rnd(i, 1), rnd(i, 2)])

  return function step(g, t) {
    g.clearRect(0, 0, 180, 100)
    if (glow) {   // เรืองหายใจช้าๆ จากมุมขวาบน (ฝั่งตัวบ้าน)
      const a = 0.10 + 0.05 * Math.sin(t / 90)
      const gr = g.createRadialGradient(125, 30, 4, 125, 30, 110)
      gr.addColorStop(0, glow); gr.addColorStop(1, 'transparent')
      g.globalAlpha = a; g.fillStyle = gr; g.fillRect(0, 0, 180, 100)
    }
    if (rays) {   // ลำแสง 3 เส้นแกว่งช้าๆ
      g.fillStyle = glow
      for (let r = 0; r < 3; r++) {
        g.globalAlpha = 0.07 + 0.04 * Math.sin(t / 70 + r * 2)
        const x = 95 + r * 28 + Math.sin(t / 120 + r) * 6
        g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 8, 0); g.lineTo(x - 14, 100); g.lineTo(x - 26, 100); g.fill()
      }
    }
    for (let i = 0; i < N; i++) {
      const [a, b] = P[i]
      let x = a * 180, y = y0 + b * (y1 - y0), s = 1, al = 1, c = col
      if (kind === 'leaf' || kind === 'petal') {
        x = ((a * 180 + t * (0.25 + b * 0.2)) % 190) - 5 + Math.sin(t / 20 + i) * 3
        y = y0 + ((t * (0.15 + a * 0.1) + b * 80) % (y1 - y0)); s = kind === 'petal' ? 2 : 1
      } else if (kind === 'mote' || kind === 'flick') {
        if (kind === 'flick') { x = 110 + a * 60 }
        x += Math.sin(t / 60 + i) * 4; y += Math.cos(t / 70 + i) * 3; al = 0.4 + 0.4 * Math.sin(t / 30 + i)
      } else if (kind === 'twinkle' || kind === 'sparkle') {
        al = Math.max(0, Math.sin(t / (kind === 'sparkle' ? 14 : 25) + i * 1.7))
        if (kind === 'sparkle') x = (x + t * 0.1) % 180
        s = big && al > 0.85 ? 2 : 1
      } else if (kind === 'bubble') {
        y = 100 - ((t * (0.3 + a * 0.3) + b * 100) % 100); x += Math.sin(t / 15 + i) * 2; s = a > 0.6 ? 2 : 1; al = 0.7
      } else if (kind === 'cloud') {
        x = ((a * 180 + t * 0.06 * (1 + i)) % 220) - 30
        g.globalAlpha = 0.55; g.fillStyle = col; g.fillRect(x | 0, y | 0, 18, 3); g.fillRect((x + 4) | 0, (y - 2) | 0, 9, 2); continue
      } else if (kind === 'rainbow') {
        c = `hsl(${(i * 40 + t) % 360} 90% 82%)`; x += Math.sin(t / 40 + i) * 6; y = (y + t * 0.1) % y1; al = 0.5 + 0.5 * Math.sin(t / 20 + i)
      } else if (kind === 'shoot') {
        if (i === 0) {
          const p = (t % 240) / 40
          if (p < 1) { g.globalAlpha = 1 - p; g.fillStyle = col; for (let j = 0; j < 8; j++) g.fillRect((150 - p * 90 + j) | 0, (8 + p * 30 + j * 0.4) | 0, 1, 1) }
          continue
        }
        al = Math.max(0, Math.sin(t / 25 + i * 1.7))
      }
      g.globalAlpha = al; g.fillStyle = c; g.fillRect(x | 0, y | 0, s, s)
      if (rays && al > 0.9 && s === 2) {   // ดาวสี่แฉกตอนสว่างสุด
        g.fillRect((x - 1) | 0, (y + 0.5) | 0, 4, 1); g.fillRect((x + 0.5) | 0, (y - 1) | 0, 1, 4)
      }
    }
    if (kind === 'flick') {   // ไฟเพิง: เรืองอุ่นหายใจช้าๆ (เดิมกะพริบถี่ แย่งความสนใจ · user 20 พ.ย.) + หิ่งห้อยลอยรอบเพิง
      const gr = g.createRadialGradient(140, 55, 2, 140, 55, 45)
      gr.addColorStop(0, col); gr.addColorStop(1, 'transparent')
      g.globalAlpha = 0.10 + 0.04 * Math.sin(t / 80); g.fillStyle = gr; g.fillRect(90, 10, 90, 90)
    }
    g.globalAlpha = 1
  }
}
