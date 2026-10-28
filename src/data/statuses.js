// 🧾 ทะเบียนสถานะกลาง (สเปก unknown-visitors §8.11–8.12 · user เคาะ 27 ต.ค. 2026)
// ทุกอย่างที่ "ติดตัว" ระหว่างไฟต์อ่านจากที่นี่ — ล้าง (☄️ 🦄) / ต้านทานของบอส / ป้ายบนการ์ด
// เลขเป็นชุดคร่าวๆ ที่ user ให้ใช้ไปก่อน (ยังไม่ซิม)
//
// ── กติกากลาง (user เคาะ 28 ต.ค. 2026 · สเปก §8.17) ──
// mode   'turns' (ค่าเริ่มต้น) = เลขบนป้าย = เทิร์นที่เหลือ · ลดท้ายตาของตัวที่ติด (ตาที่ถูกข้ามก็นับ)
//        'count' = ป้ายนับ (🦠 ชั้นเชื้อ · 🤍 มาสก์) เลข = จำนวน ไม่หมดเอง · ล้างได้ = หายทั้งก้อน
// สะสม   แปะซ้ำ = เพิ่มอีก "ก้อน" แต่ละก้อนนับเทิร์นของตัวเอง · ล็อกแรงตอนแปะ (val) · maxInst = เพดานก้อน
// single true = ติดได้ก้อนเดียว แปะซ้ำเลือกก้อนที่ยาวกว่า (ข้ามตา ❄️ 💫 😱 — กันโดนแช่ยาว)
// kind   'debuff' = สถานะร้าย · 'buff' = สถานะดี (ยังไม่มีสกิลลบ) · cleansable:false = สถานะร้ายที่ล้างไม่ได้
// skip   true = ถึงตาแล้วไม่ได้ตี · ตาที่ถูกข้าม 1 ตา ลดสถานะข้ามตาทุกตัว
// tick   'turnEnd' = ทำงานท้ายตาของตัวที่ติด (ตีก่อนแล้วค่อยเสียเลือด) · ทุกก้อนทำงานแยกกัน
// consume true = ใช้แล้วหมด (🌠 โดนตีจริงครั้งแรก) แต่ยังหมดอายุตามเทิร์นด้วย
// color  สีแบนเนอร์ประจำสถานะ (มาตรฐาน §8.10: ติด = ไอคอน+ชื่อ · ทำงาน = ไอคอนอย่างเดียว · ป้ายเขย่าทุกครั้ง)
// legacy เก็บนอก ps.status (ของเดิม) — ทะเบียนรู้จักเพื่อล้าง/ต้านทาน/ป้ายเท่านั้น

export const STATUSES = {
  // ── ข้ามตา ──
  freeze:  { kind: 'debuff', color: '#0ea5e9', icon: '❄️', name: 'แช่แข็ง',  single: true, skip: true },
  stun:    { kind: 'debuff', color: '#ca8a04', icon: '💫', name: 'มึน',      single: true, skip: true },
  // 👻 ผีน้อย: ข้ามตา + เสียเลือด val (= 50% ATK ผีตอนแบร่ ล็อกค่า) ทุกตาที่ถูกข้าม
  fear:    { kind: 'debuff', color: '#7c3aed', icon: '😱', name: 'หวาดกลัว', single: true, skip: true, skipDmg: true },

  // ── ดาเมจต่อเนื่อง (ท้ายตา) ──
  burn:    { kind: 'debuff', color: '#ea580c', icon: '🔥', name: 'ลุกไหม้', maxInst: 3, tick: 'turnEnd', turns: 2, pctMaxHp: 5 },  // ก้อนละ 5% เลือดสูงสุด/เทิร์น
  poison:  { kind: 'debuff', color: '#65a30d', icon: '☠️', name: 'พิษ',     maxInst: 3, tick: 'turnEnd', turns: 3, atkPct: 30 }, // 30% ATK คนแปะ (ล็อกค่าตอนแปะ)

  // ── ปรับค่า ──
  armorBreak: { kind: 'debuff', color: '#be123c', icon: '💔', name: 'เกราะแตก', maxInst: 3, turns: 3, dmgTakenPct: 15 },  // รับดาเมจ +15% ต่อก้อน
  weaken:     { kind: 'debuff', color: '#9d174d', icon: '🥀', name: 'อ่อนแรง',  maxInst: 2, turns: 2, atkPct: -20 },
  healBlock:  { kind: 'debuff', color: '#475569', icon: '🚫', name: 'ห้ามฟื้น', single: true, turns: 2 },

  // ── ของเดิม (เก็บนอกทะเบียน) ──
  infect:  { kind: 'debuff', color: '#16a34a', icon: '🦠', name: 'ติดเชื้อ',     legacy: true, mode: 'count' },   // ล้าง = หายทั้งก้อน
  spark:   { kind: 'debuff', color: '#64748b', icon: '🤍', name: 'มาสก์ประกาย', legacy: true, mode: 'count', cleansable: false },   // หายเมื่อกระต่ายตายจริง

  // 🛸 ยูเอฟโอดูด (เก็บที่ ps.away) — สถานะร้าย "ล้างไม่ได้" (user 28 ต.ค.) · ถึงตา = ข้าม (เอนจินคุมเอง)
  away:    { kind: 'debuff', color: '#6d28d9', icon: '🛸', name: 'ถูกลักพาตัว', legacy: true, cleansable: false },

  // ── สถานะดี ──
  rally:   { kind: 'buff', color: '#dc2626', icon: '💪', name: 'ฮึด',          maxInst: 2, turns: 2, atkPct: 20 },
  // ☄️ ดาวหาง: หมัดแรกที่โดนจริงเบาลง val% · อยู่ได้ 2 เทิร์น (user 28 ต.ค.) · ได้ซ้ำ = ก้อนเดียว เลือกที่ยาวกว่า
  blessShield: { kind: 'buff', color: '#0891b2', icon: '🌠', name: 'พรจากฟ้า', single: true, consume: true, turns: 2 },
  regen:   { kind: 'buff', color: '#059669', icon: '💚', name: 'ฟื้นต่อเนื่อง', single: true, tick: 'turnEnd', turns: 3, healPctMaxHp: 5 },
}

export const statusDef = (id) => STATUSES[id] || null

// 🐲 บอสแบบ 7DS: ค่าเริ่มต้น = กันสถานะร้ายทุกตัว + ถูกดูด 🛸 · บอสแต่ละตัวเปิดเฉพาะตัวที่เป็นวิธีปราบ
//    ใช้: immune: bossImmune(['burn']) = กันทุกอย่าง ยกเว้นลุกไหม้ · หน้ารายละเอียดบอสโชว์รายการนี้ "ต้านทาน: …"
export const BOSS_EXTRA_IMMUNE = ['away']
export function bossImmune(allow = []) {
  const all = Object.keys(STATUSES).filter(id => STATUSES[id].kind === 'debuff')
  return [...new Set([...all, ...BOSS_EXTRA_IMMUNE])].filter(id => !allow.includes(id))
}
