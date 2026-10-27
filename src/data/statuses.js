// 🧾 ทะเบียนสถานะกลาง (สเปก unknown-visitors §8.11–8.12 · user เคาะ 27 ต.ค. 2026)
// ทุกอย่างที่ "ติดตัว" ระหว่างไฟต์อ่านจากที่นี่ — ล้าง (☄️ 🦄) / ต้านทานของบอส / ป้ายบนการ์ด
// เลขเป็นชุดคร่าวๆ ที่ user ให้ใช้ไปก่อน (ยังไม่ซิม)
//
// kind   'debuff' = สถานะร้าย ล้างได้ · 'buff' = สถานะดี ล้างไม่ได้
// stack  'add' = บวกชั้น (ติดเพดาน max) · 'refresh' = เอาตัวที่ยาวกว่า · 'none' = ติดอยู่แล้วแปะซ้ำไม่ได้
// skip   true = ถึงตาแล้วไม่ได้ตี · ตาที่ถูกข้าม 1 ตา ลดสถานะ skip "ทุกตัว" ตัวละ 1 (user เคาะ ❄️+😱)
// tick   'turnEnd' = ทำงานท้ายตาของตัวที่ติด (ตีก่อนแล้วค่อยเสียเลือด · ตาที่ถูกข้ามก็ทำงาน)
// decay  ลดกี่ชั้นต่อตาของตัวที่ติด (0 = ไม่ลดเอง ต้องล้าง) · skip ลดตอนข้าม ไม่ใช้ช่องนี้
// color  สีแบนเนอร์ประจำสถานะ (มาตรฐาน §8.10: ติด = ไอคอน+ชื่อ · ทำงาน = ไอคอนอย่างเดียว · ป้ายเขย่าทุกครั้ง)
// legacy เก็บนอก ps.status (ของเดิมที่ยังไม่ย้าย) — ทะเบียนรู้จักเพื่อล้าง/ต้านทาน/ป้ายเท่านั้น

export const STATUSES = {
  // ── ข้ามตา ──
  freeze:  { kind: 'debuff', color: '#0ea5e9', icon: '❄️', name: 'แช่แข็ง',  stack: 'add', skip: true },
  stun:    { kind: 'debuff', color: '#ca8a04', icon: '💫', name: 'มึน',      stack: 'none', skip: true },
  // 👻 ผีน้อย: ข้ามตา + เสียเลือด val (= 50% ATK ผีตอนแบร่ ล็อกค่า) ทุกตาที่ถูกข้าม
  fear:    { kind: 'debuff', color: '#7c3aed', icon: '😱', name: 'หวาดกลัว', stack: 'add', skip: true, skipDmg: true },

  // ── ดาเมจต่อเนื่อง (ท้ายตา) ──
  burn:    { kind: 'debuff', color: '#ea580c', icon: '🔥', name: 'ลุกไหม้', stack: 'add', max: 3, tick: 'turnEnd', decay: 1, pctMaxHp: 5 },  // 5% เลือดสูงสุด × ชั้น
  poison:  { kind: 'debuff', color: '#65a30d', icon: '☠️', name: 'พิษ',     stack: 'refresh', tick: 'turnEnd', decay: 1, turns: 3, atkPct: 30 }, // 30% ATK คนแปะ (ล็อกค่าตอนแปะ)

  // ── ปรับค่า ──
  armorBreak: { kind: 'debuff', color: '#be123c', icon: '💔', name: 'เกราะแตก', stack: 'add', max: 3, decay: 0, dmgTakenPct: 15 },  // รับดาเมจ +15% × ชั้น
  weaken:     { kind: 'debuff', color: '#9d174d', icon: '🥀', name: 'อ่อนแรง',  stack: 'refresh', decay: 1, turns: 2, atkPct: -20 },
  healBlock:  { kind: 'debuff', color: '#475569', icon: '🚫', name: 'ห้ามฟื้น', stack: 'refresh', decay: 1, turns: 2 },

  // ── ของเดิม (เก็บนอกทะเบียน) ──
  infect:  { kind: 'debuff', color: '#16a34a', icon: '🦠', name: 'ติดเชื้อ',     legacy: true },
  spark:   { kind: 'debuff', color: '#64748b', icon: '🤍', name: 'มาสก์ประกาย', legacy: true },

  // ── สถานะดี ──
  rally:   { kind: 'buff', color: '#dc2626', icon: '💪', name: 'ฮึด',          stack: 'refresh', decay: 1, turns: 2, atkPct: 20 },
  // ☄️ ดาวหาง: หมัดแรกที่โดนจริงเบาลง val% (หลบ/เกราะกันทั้งหมัด = ยังอยู่) · ได้ซ้ำ = คงเป็น 1
  blessShield: { kind: 'buff', color: '#0891b2', icon: '🌠', name: 'พรจากฟ้า', stack: 'refresh', decay: 0, turns: 1 },
  regen:   { kind: 'buff', color: '#059669', icon: '💚', name: 'ฟื้นต่อเนื่อง', stack: 'refresh', tick: 'turnEnd', decay: 1, turns: 3, healPctMaxHp: 5 },
}

export const statusDef = (id) => STATUSES[id] || null

// 🐲 บอสแบบ 7DS: ค่าเริ่มต้น = กันสถานะร้ายทุกตัว + ถูกดูด 🛸 · บอสแต่ละตัวเปิดเฉพาะตัวที่เป็นวิธีปราบ
//    ใช้: immune: bossImmune(['burn']) = กันทุกอย่าง ยกเว้นลุกไหม้ · หน้ารายละเอียดบอสโชว์รายการนี้ "ต้านทาน: …"
export const BOSS_EXTRA_IMMUNE = ['away']
export function bossImmune(allow = []) {
  const all = Object.keys(STATUSES).filter(id => STATUSES[id].kind === 'debuff')
  return [...all, ...BOSS_EXTRA_IMMUNE].filter(id => !allow.includes(id))
}
