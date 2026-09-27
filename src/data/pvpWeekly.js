// ════════════════════════════════════════════════════════════
//  เอฟเฟกต์ประจำสัปดาห์ของสนามประลอง (user เคาะ 28 ก.ย. 2026 — 15 อัน)
//  แอดมินกดเปิดทีละอันใน AdminView → config/app.pvpWeekly = { id, startsAt, endsAt } (7 วัน หมดแล้วปลดเอง)
//  มีผลเฉพาะ PvP (useArena) ทั้งฝั่งบุกและตั้งรับเท่ากัน · หอคอย/ท้าสู้ในโปรไฟล์ไม่โดน
//  pure ทั้งไฟล์ — battleEngine อ่าน `rules` ผ่าน weeklyRules()
//
//  rules:
//    stat: [{ el?, rarities?, lead?, atk, hp }]  ตัวคูณสเตตัสฐาน (ก่อน forms/aura) — ตรงเงื่อนไขทุกข้อที่ระบุ
//    critAdd · critMult · variance · elementAdv · invertElements
//    roundEnd: { burnPct } (% ของเลือดปัจจุบัน) | { healPct } (% ของเลือดสูงสุด)
// ════════════════════════════════════════════════════════════
export const WEEKLY_DAYS = 7

export const WEEKLY_EFFECTS = [
  { id: 'elFist',    icon: '✊', title: 'สัปดาห์แห่งการจู่โจม', desc: 'เพ็ทสายจู่โจม พลังโจมตีและ HP +20%', rules: { stat: [{ el: 'fist', atk: 1.2, hp: 1.2 }] } },
  { id: 'elScissors', icon: '✌️', title: 'สัปดาห์แห่งความสมดุล', desc: 'เพ็ทสายสมดุล พลังโจมตีและ HP +20%', rules: { stat: [{ el: 'scissors', atk: 1.2, hp: 1.2 }] } },
  { id: 'elPaper',   icon: '✋', title: 'สัปดาห์แห่งการพิทักษ์', desc: 'เพ็ทสายพิทักษ์ พลังโจมตีและ HP +20%', rules: { stat: [{ el: 'paper', atk: 1.2, hp: 1.2 }] } },
  { id: 'commoners', icon: '🌱', title: 'สามัญชนลุกฮือ', desc: 'เพ็ท common และ rare พลังโจมตีและ HP +25%', rules: { stat: [{ rarities: ['common', 'rare'], atk: 1.25, hp: 1.25 }] } },
  { id: 'legends',   icon: '👑', title: 'ยุคแห่งตำนาน', desc: 'เพ็ท legendary พลังโจมตี +15%', rules: { stat: [{ rarities: ['legendary'], atk: 1.15, hp: 1 }] } },
  { id: 'burn',      icon: '🔥', title: 'สมรภูมิมอดไหม้', desc: 'จบทุกรอบ ทุกตัวบนสนามเสียเลือด 20% ของเลือดที่เหลือ', rules: { roundEnd: { burnPct: 20 } } },
  { id: 'spring',    icon: '💚', title: 'น้ำพุชีวิต', desc: 'จบทุกรอบ ทุกตัวบนสนามฟื้นเลือด 8% ของเลือดสูงสุด', rules: { roundEnd: { healPct: 8 } } },
  { id: 'hawkeye',   icon: '🎯', title: 'ตาเหยี่ยว', desc: 'โอกาสติดคริติคอล +15%', rules: { critAdd: 0.15 } },
  { id: 'heavy',     icon: '💥', title: 'หมัดหนัก', desc: 'คริติคอลแรง ×2.2 (ปกติ ×1.6)', rules: { critMult: 2.2 } },
  { id: 'counter',   icon: '🔺', title: 'แพ้ทางแพ้ยับ', desc: 'ตีสายที่ชนะทาง แรง ×1.5 (ปกติ ×1.2)', rules: { elementAdv: 1.5 } },
  { id: 'upside',    icon: '🔄', title: 'โลกกลับหัว', desc: 'การชนะทางของสายกลับด้านทั้งหมด', rules: { invertElements: true } },
  { id: 'siege',     icon: '🛡️', title: 'ศึกยืดเยื้อ', desc: 'ทุกตัว HP +40% แต่พลังโจมตี −10%', rules: { stat: [{ atk: 0.9, hp: 1.4 }] } },
  { id: 'blitz',     icon: '⚡', title: 'ดวลสายฟ้า', desc: 'ทุกตัวพลังโจมตี +40% แต่ HP −20%', rules: { stat: [{ atk: 1.4, hp: 0.8 }] } },
  { id: 'lucky',     icon: '🎲', title: 'วันดวงดี', desc: 'ดาเมจแกว่งแรงขึ้น (±22% → ±50%)', rules: { variance: 0.5 } },
  { id: 'vanguard',  icon: '🥇', title: 'หัวแถวกล้าหาญ', desc: 'ตัวซ้ายสุดของทีม พลังโจมตีและ HP +30%', rules: { stat: [{ lead: true, atk: 1.3, hp: 1.3 }] } },
]

const BY_ID = Object.fromEntries(WEEKLY_EFFECTS.map(e => [e.id, e]))
export const weeklyById = (id) => BY_ID[id] || null

/** เอฟเฟกต์ที่กำลังมีผล ณ now จาก config (หมดเวลา/ไม่รู้จัก id = null) */
export function activeWeekly(cfg, now) {
  const def = weeklyById(cfg?.id)
  if (!def) return null
  const ends = Number(cfg?.endsAt) || 0
  if (!ends || now >= ends) return null
  return { ...def, endsAt: ends }
}

/** rules ของ id (ไม่มี = null) — battleEngine ใช้ */
export const weeklyRules = (id) => weeklyById(id)?.rules || null

/** ตัวคูณ atk/hp ของหน่วยหนึ่ง (slot = ลำดับในทีม) */
export function statMult(rules, unit, slot) {
  let atk = 1, hp = 1
  for (const s of rules?.stat || []) {
    if (s.el && unit?.element !== s.el) continue
    if (s.rarities && !s.rarities.includes(unit?.rarity)) continue
    if (s.lead && slot !== 0) continue
    atk *= s.atk ?? 1; hp *= s.hp ?? 1
  }
  return { atk, hp }
}
