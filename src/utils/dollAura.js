// ✨ ออร่าตุ๊กตา (19 พ.ย. 2026) — ตรรกะล้วน ไม่แตะ DOM · DollFigure.vue (และเดโม) เอาไปวาดเป็น CSS
// แบ่ง 2 กลุ่ม (ใส่คู่กันแล้วไม่ซ้อน — หลักที่ user ตั้ง): ชุด = ออร่ารอบตัว (glow/ring) · ของประดับ/ปีก/เซ็ต = อนุภาค
// ทุกแบบเป็น CSS ล้วน ไม่วาด canvas ซ้ำทุกเฟรม (รายชื่อเพื่อนมีตุ๊กตาหลายสิบตัว มือถือต้องไม่หน่วง)

export const AURA_TYPES = {
  glow: 'เรืองแสงรอบตัว',
  ring: 'วงแสงใต้เท้า',
  sparkle: 'ประกายระยิบ',
  hearts: 'หัวใจลอย',
  bubbles: 'ฟองลอย',
  petals: 'กลีบปลิว',
  stardust: 'ละอองดาว',
  flame: 'เปลวไฟ',
}
export const BODY_AURAS = ['glow', 'ring']

// ตำแหน่ง (% ของกรอบ) + ดีเลย์ (วินาที) ของอนุภาคแต่ละแบบ — กระจายรอบตัว ไม่ทับหน้า
const LAYOUT = {
  sparkle: [[10, 22, 0], [84, 14, 0.7], [4, 52, 1.5], [90, 46, 0.3], [16, 80, 1.1], [80, 76, 1.9]],
  hearts: [[14, 70, 0], [82, 62, 0.9], [8, 40, 1.8], [88, 30, 2.6]],
  bubbles: [[18, 84, 0], [78, 80, 0.8], [10, 60, 1.6], [86, 70, 2.3], [24, 50, 3.0]],
  petals: [[12, 4, 0], [70, 0, 1.0], [40, 2, 2.0], [88, 8, 2.8], [22, 0, 3.6]],
  stardust: [[20, 76, 0], [74, 82, 0.6], [12, 56, 1.2], [84, 60, 1.8], [30, 90, 2.4], [66, 70, 3.0]],
  flame: [[34, 92, 0], [46, 94, 0.25], [58, 92, 0.5], [40, 90, 0.75], [52, 91, 1.0], [64, 93, 1.25]],
}

/** แยกออร่าเป็น 3 ชนิดให้ตัววาด: glows (สีเรือง) · rings (สีวงใต้เท้า) · particles (อนุภาคพร้อมตำแหน่ง) */
export function auraLayers(auras = []) {
  const glows = auras.filter(a => a.type === 'glow').map(a => a.color)
  const rings = auras.filter(a => a.type === 'ring').map(a => a.color)
  const particles = []
  const seen = {}
  for (const a of auras) {
    const pts = LAYOUT[a.type]
    if (!pts) continue
    const n = seen[a.type] = (seen[a.type] ?? -1) + 1   // แบบเดียวกันอันที่ 2+ → เลื่อนตำแหน่ง/จังหวะไม่ให้ทับ
    pts.forEach(([x, y, d], i) => {
      const [x2, y2] = pts[(i + n * 2) % pts.length]
      particles.push({
        type: a.type, color: a.color,
        left: n ? (x + x2) / 2 + 3 * n : x,
        top: n ? (y + y2) / 2 : y,
        delay: d + n * 0.6,
      })
    })
  }
  return { glows, rings, particles }
}
