// ════════════════════════════════════════════════════════════
//  พืชผล (Crops) — farming data
// ════════════════════════════════════════════════════════════
//  plant seed (costs seedCost) → grow (growMinutes, real-time) → harvest →
//  sell for sellPrice. No water/fertilizer — just plant & wait.
//
//  Two axes:
//   • unlockLevel → gates availability by residence.level (one step at a time —
//                   nearly every house upgrade unlocks a fresh crop).
//   • time        → spread per profit-grade: quick(min) / short(hr) /
//                   half-day / multi-day.
//  `tier` is kept as a profit-grade / colour flavour only (NOT the gate).
//  Design: short crops = higher profit/hr but small total (active replanting);
//          long crops  = lower profit/hr but big total (set-and-forget);
//          higher tier = better profit at every time bracket.
//  All numbers are tunable.
// ════════════════════════════════════════════════════════════

// 🌿 28 ก.ย. 2026 เปลี่ยนเป็นสมุนไพรที่ นศ.เภสัชฯ ควรรู้ (ส่วนใหญ่จากบัญชียาหลักแห่งชาติ ยาจากสมุนไพร)
//    เปลี่ยนแค่ชื่อ/รูป/ข้อมูลสมุดพืช — **id เดิมห้ามแตะ** (คลังผลผลิต แปลง ออเดอร์ ผูกกับ id)
//    emoji = คีย์ 'herb:<id>' → public/herbs/<id>.webp (scripts/herb-icons.mjs) · herb = ข้อมูลในสมุดพืช
export const CROPS = [
  // ── Lv1–2: ธรรมดา (common) ──
  { id: 'lettuce',  name: 'ฟ้าทะลายโจร',     emoji: 'herb:lettuce', tier: 'common',    unlockLevel: 1,  seedCost: 20,    growMinutes: 5,    sellPrice: 45,
    herb: { sci: 'Andrographis paniculata', part: 'ส่วนเหนือดิน (ใบ)', uses: 'บรรเทาอาการหวัด เจ็บคอ และท้องเสียที่ไม่ได้เกิดจากการติดเชื้อ สารสำคัญคือ andrographolide', note: 'ห้ามใช้ในหญิงตั้งครรภ์ · อาจทำให้ความดันต่ำ · ใช้ 3 วันแล้วไม่ดีขึ้นควรพบแพทย์' } },
  { id: 'tomato',   name: 'ขมิ้นชัน',   emoji: 'herb:tomato', tier: 'common',    unlockLevel: 1,  seedCost: 120,   growMinutes: 60,   sellPrice: 320,
    herb: { sci: 'Curcuma longa', part: 'เหง้า', uses: 'บรรเทาอาการท้องอืด ท้องเฟ้อ อาหารไม่ย่อย สารสำคัญคือกลุ่ม curcuminoids', note: 'ระวังในผู้ที่มีท่อน้ำดีอุดตันหรือนิ่วในถุงน้ำดี · อาจเสริมฤทธิ์ยาต้านการแข็งตัวของเลือด' } },
  { id: 'corn',     name: 'ขิง',    emoji: 'herb:corn', tier: 'common',    unlockLevel: 2,  seedCost: 400,   growMinutes: 360,  sellPrice: 1300,
    herb: { sci: 'Zingiber officinale', part: 'เหง้า', uses: 'บรรเทาอาการคลื่นไส้ อาเจียน เมารถเมาเรือ และท้องอืด สารสำคัญคือ gingerols', note: 'ระวังในผู้ที่มีนิ่วในถุงน้ำดี · อาจเพิ่มความเสี่ยงเลือดออกเมื่อใช้ร่วมกับยาต้านการแข็งตัวของเลือด' } },
  { id: 'potato',   name: 'ว่านหางจระเข้',    emoji: 'herb:potato', tier: 'common',    unlockLevel: 2,  seedCost: 1200,  growMinutes: 1440, sellPrice: 4200,
    herb: { sci: 'Aloe vera', part: 'วุ้นในใบ', uses: 'ทาแผลไฟไหม้ น้ำร้อนลวกที่ไม่รุนแรง และแผลถลอก', note: 'ล้างยางสีเหลือง (aloin) ออกก่อนใช้ เพราะระคายเคือง · ไม่ใช้กับแผลลึกหรือแผลติดเชื้อ' } },
  // ── Lv3–6: แรร์ (rare) ──
  { id: 'strawberry', name: 'บัวบก', emoji: 'herb:strawberry', tier: 'rare',  unlockLevel: 3,  seedCost: 80,    growMinutes: 10,   sellPrice: 160,
    herb: { sci: 'Centella asiatica', part: 'ใบ / ทั้งต้น', uses: 'ช่วยสมานแผล ลดรอยแผลเป็น สารสำคัญคือ asiaticoside และ madecassoside', note: 'อาจแพ้เป็นผื่นสัมผัสได้' } },
  { id: 'chili',    name: 'พญายอ',       emoji: 'herb:chili', tier: 'rare',      unlockLevel: 4,  seedCost: 300,   growMinutes: 120,  sellPrice: 800,
    herb: { sci: 'Clinacanthus nutans', part: 'ใบ', uses: 'ทาบรรเทาอาการของเริมและงูสวัด ผื่นคันจากแมลงกัดต่อย', note: 'ใช้ภายนอกเท่านั้น' } },
  { id: 'eggplant', name: 'ชุมเห็ดเทศ',     emoji: 'herb:eggplant', tier: 'rare',      unlockLevel: 5,  seedCost: 900,   growMinutes: 480,  sellPrice: 2900,
    herb: { sci: 'Senna alata', part: 'ใบ', uses: 'ยาระบายแก้ท้องผูก (สาร anthraquinones) · ใบสดตำทากลากเกลื้อน', note: 'ห้ามใช้ในผู้ที่ลำไส้อุดตัน ปวดท้องไม่ทราบสาเหตุ และหญิงตั้งครรภ์ · ไม่ควรใช้ต่อเนื่องนาน' } },
  { id: 'melon',    name: 'มะขามแขก',      emoji: 'herb:melon', tier: 'rare',      unlockLevel: 6,  seedCost: 2500,  growMinutes: 2160, sellPrice: 9000,
    herb: { sci: 'Senna alexandrina', part: 'ใบ และฝัก', uses: 'ยาระบายแก้ท้องผูก สารสำคัญคือ sennosides', note: 'อาจปวดบิด · ห้ามใช้ในผู้ที่ลำไส้อุดตันและหญิงตั้งครรภ์ · ไม่ควรใช้ต่อเนื่องนาน' } },
  // ── Lv7–10: อิพิค (epic) ──
  { id: 'mushroom', name: 'กระเจี๊ยบแดง',   emoji: 'herb:mushroom', tier: 'epic',      unlockLevel: 7,  seedCost: 200,   growMinutes: 15,   sellPrice: 380,
    herb: { sci: 'Hibiscus sabdariffa', part: 'กลีบเลี้ยง', uses: 'ขับปัสสาวะ ใช้เป็นเครื่องดื่ม สีแดงมาจาก anthocyanins', note: 'ระวังเมื่อใช้ร่วมกับยาขับปัสสาวะหรือยาลดความดัน' } },
  { id: 'herb',     name: 'ทองพันชั่ง',    emoji: 'herb:herb', tier: 'epic',      unlockLevel: 8,  seedCost: 700,   growMinutes: 180,  sellPrice: 1900,
    herb: { sci: 'Rhinacanthus nasutus', part: 'ใบ และราก', uses: 'ทารักษากลากเกลื้อน สารสำคัญคือ rhinacanthins', note: 'ใช้ภายนอกเท่านั้น' } },
  { id: 'ginseng',  name: 'ขี้เหล็ก',        emoji: 'herb:ginseng', tier: 'epic',      unlockLevel: 9,  seedCost: 2000,  growMinutes: 720,  sellPrice: 6800,
    herb: { sci: 'Senna siamea', part: 'ใบอ่อน และดอก', uses: 'ช่วยให้นอนหลับ และเป็นยาระบายอ่อนๆ สารสำคัญคือ barakol', note: 'มีรายงานพิษต่อตับ · ห้ามใช้ต่อเนื่องนานและห้ามใช้ในผู้ป่วยโรคตับ' } },
  { id: 'pumpkin',  name: 'เพชรสังฆาต', emoji: 'herb:pumpkin', tier: 'epic',     unlockLevel: 10, seedCost: 5000,  growMinutes: 2880, sellPrice: 20000,
    herb: { sci: 'Cissus quadrangularis', part: 'เถา', uses: 'บรรเทาอาการริดสีดวงทวาร', note: 'มีผลึก calcium oxalate ทำให้คันปากคอ จึงใช้แบบบรรจุแคปซูล ไม่กินสด' } },
  // ── Lv11–12: ตำนาน (legendary) ──
  { id: 'glowflower', name: 'ดอกคำฝอย', emoji: 'herb:glowflower', tier: 'legendary', unlockLevel: 11, seedCost: 600, growMinutes: 20, sellPrice: 1100,
    herb: { sci: 'Carthamus tinctorius', part: 'ดอก', uses: 'ชงเป็นชา ใช้ตามภูมิปัญญาเพื่อช่วยลดไขมันในเลือด (หลักฐานยังจำกัด)', note: 'ห้ามใช้ในหญิงตั้งครรภ์ · ระวังเมื่อใช้ร่วมกับยาต้านการแข็งตัวของเลือด' } },
  { id: 'lotus',    name: 'บัวหลวง',    emoji: 'herb:lotus', tier: 'legendary', unlockLevel: 11, seedCost: 2000,  growMinutes: 240,  sellPrice: 5600, stages: ['🌱','🍃'],
    herb: { sci: 'Nelumbo nucifera', part: 'เกสร', uses: 'เป็นส่วนผสมของยาหอม ใช้แก้ลมวิงเวียนตามตำรับแพทย์แผนไทย', note: '' } },
  { id: 'sunflower', name: 'ไพล', emoji: 'herb:sunflower', tier: 'legendary', unlockLevel: 12, seedCost: 6000, growMinutes: 1440, sellPrice: 22000,
    herb: { sci: 'Zingiber montanum (Z. cassumunar)', part: 'เหง้า', uses: 'ทาบรรเทาอาการปวดเมื่อย เคล็ดขัดยอก ฟกช้ำ (ครีมไพล)', note: 'ใช้ภายนอก · ห้ามทาบนแผลเปิดหรือรอบดวงตา' } },
  { id: 'moneytree', name: 'มะขามป้อม', emoji: 'herb:moneytree', tier: 'legendary', unlockLevel: 12, seedCost: 15000, growMinutes: 4320, sellPrice: 70000, stages: ['🌱','🌲'],
    herb: { sci: 'Phyllanthus emblica', part: 'ผล', uses: 'บรรเทาอาการไอ ขับเสมหะ ทำให้ชุ่มคอ มีวิตามินซีและแทนนินสูง', note: '' } },
]

const _byId = Object.fromEntries(CROPS.map(c => [c.id, c]))
export const getCrop = (id) => _byId[id] || null

/** Crops a player can plant at a given residence level (unlocked = unlockLevel ≤ level). */
export function cropsForLevel(level) {
  const lv = Number(level) || 1
  return CROPS.filter(c => c.unlockLevel <= lv)
}

/**
 * The next crop(s) waiting to unlock above `level`, or null if all unlocked.
 * Returns `{ level, crops }` for the soonest unlock tier (may be >1 crop).
 */
export function nextUnlock(level) {
  const lv = Number(level) || 1
  const upcoming = CROPS.filter(c => c.unlockLevel > lv)
  if (!upcoming.length) return null
  const at = Math.min(...upcoming.map(c => c.unlockLevel))
  return { level: at, crops: upcoming.filter(c => c.unlockLevel === at) }
}

/** Grow time (ms) for a seed — plain, no speed-ups. */
export const growMs = (seedId) => (getCrop(seedId)?.growMinutes || 0) * 60 * 1000

/** Human-readable grow time: "5 นาที" / "2 ชม." / "1.5 วัน". */
export function growLabel(crop) {
  const m = crop?.growMinutes || 0
  if (m < 60) return `${m} นาที`
  if (m < 1440) { const h = m / 60; return `${Number.isInteger(h) ? h : h.toFixed(1)} ชม.` }
  const d = m / 1440; return `${Number.isInteger(d) ? d : d.toFixed(1)} วัน`
}

// ════════════════════════════════════════════════════════════
//  ระยะการโต — แสดงผลล้วนๆ ไม่กระทบเวลาโต/ผลผลิต/ราคา
//  พืชเปลี่ยนภาพระหว่างรอ: ต้นอ่อน → ต้นโต → ผลจริง
//  พืชที่ระยะกลางแบบร่วมดูแปลก ใส่ `stages: ['a','b']` ทับรายตัวได้ในข้อมูลด้านบน
//  ⚠️ อีโมจิที่ใช้ต้องมีไฟล์ใน public/emoji/fluent/ ไม่งั้น <Emoji> จะ fallback
//     ไปใช้ฟอนต์เครื่อง (หน้าตาไม่ตรงกันแต่ละเครื่อง) — เพิ่มตัวใหม่ต้องรัน
//     `node scripts/fetch-fluent.mjs` (ต้องต่อเน็ต)
// ════════════════════════════════════════════════════════════

/** ระยะกลางที่ใช้ร่วมกันทุกพืช (ต้นอ่อน → ต้นโต) */
export const DEFAULT_STAGES = ['🌱', '🌿']

/** จุดตัดความคืบหน้าที่เปลี่ยนระยะ — ขอบเขตนับเข้าระยะถัดไป */
export const STAGE_CUTS = [0.33, 0.70]

/** อีโมจิที่ควรแสดงตามความคืบหน้า (0..1) · อินพุตพังแค่ไหนก็ไม่ throw */
export function stageEmoji(crop, progress) {
  if (!crop) return ''
  const n = Number(progress)
  const p = Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0
  if (p >= STAGE_CUTS[1]) return crop.emoji
  const own = Array.isArray(crop.stages) && crop.stages.length >= 2 ? crop.stages : DEFAULT_STAGES
  return p >= STAGE_CUTS[0] ? own[1] : own[0]
}
