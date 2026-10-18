// ════════════════════════════════════════════════════════════
//  PharmaTeam engine — ตรรกะเกมล้วน (พอร์ตจาก D:\pharmateam_local\server.js)
//  เครื่องหัวห้องรันตัวนี้แล้วเขียน state ลง RTDB · เครื่องอื่นแค่อ่าน state + ส่ง action
//  ไม่มี setTimeout: ทุกกำหนดเวลาเป็น timestamp ใน state แล้วหัวห้องเรียก tick() ถี่ๆ
//  → state serialize ได้ทั้งก้อน หัวห้องหลุดคนถัดไปรับช่วงต่อได้ทันที
//  ทุกฟังก์ชันแก้ state ตรงๆ และคืน true ถ้ามีอะไรเปลี่ยน (ให้หัวห้องรู้ว่าต้องเขียน)
// ════════════════════════════════════════════════════════════

// prompt(target, rnd) สุ่มประโยคจากหลายแบบ — เล่นซ้ำแล้วไม่จำเจ (user ติ 17 ต.ค. "คำสั่งไม่หลากหลาย")
const say = (...lines) => (v, rnd = Math.random) => { const l = lines[Math.floor(rnd() * lines.length)]; return typeof l === 'function' ? l(v) : l }
export const SPAM_MIN = 3, SPAM_MAX = 8   // บดพาราสุ่มจำนวนครั้งต่อคำสั่ง (เดิม 5 ตายตัว)
export const CONTROL_CATALOG = [
  { base: 'mortar', type: 'spam', label: 'โกร่งบดยาพารา', targetHits: 5,
    prompt: say(n => `บดพาราเซตามอล ${n} ครั้งรัวๆ!`, n => `ตำโกร่งพารา ${n} ที!`, n => `บดยาเม็ดพารา ${n} ครั้ง ให้ละเอียด!`, n => `คนไข้ปวดหัว! บดพารา ${n} ครั้ง!`) },
  { base: 'uv', type: 'toggle', label: 'แสง UV ฆ่าเชื้อ',
    prompt: say(s => `${s ? 'เปิด' : 'ดับ'}ไฟแสง UV ในคลีนรูม!`, s => s ? 'ฆ่าเชื้อด่วน! เปิด UV!' : 'คนจะเข้าคลีนรูม! ปิด UV!', s => `สวิตช์ UV: ${s ? 'ON' : 'OFF'}!`) },
  { base: 'ph', type: 'slider', label: 'ปรับ pH น้ำเกลือ', min: 4, max: 9,
    prompt: say(v => `ปรับค่า pH น้ำเกลือเป็น ${v}!`, v => `น้ำเกลือต้อง pH ${v} เท่านั้น!`, v => `pH เพี้ยน! ดันไปที่ ${v}!`) },
  { base: 'fridge', type: 'slider', label: 'ตู้แช่วัคซีน (°C)', min: 2, max: 8,
    prompt: say(v => `ตั้งอุณหภูมิตู้แช่วัคซีนที่ ${v}°C!`, v => `วัคซีนจะเสีย! ตู้เย็น ${v} องศา!`, v => `Cold chain! ปรับตู้เป็น ${v}°C!`) },
  { base: 'syrup', type: 'button', label: 'เติมน้ำเชื่อม Simple Syrup',
    prompt: say('เติม Simple Syrup ด่วน!', 'ยาขมไป! เติมน้ำเชื่อม!', 'เด็กไม่ยอมกินยา! ใส่ Simple Syrup!') },
  { base: 'wfi', type: 'button', label: 'ฉีดน้ำปราศจากเชื้อ WFI',
    prompt: say('ฉีดน้ำปราศจากเชื้อ WFI!', 'ละลายผงยาด้วย WFI ด่วน!', 'Water for Injection มาเลย!') },
  { base: 'laminar', type: 'toggle', label: 'ตู้ดูดควัน Laminar',
    prompt: say(s => `${s ? 'เปิด' : 'ปิด'}ตู้ดูดควัน Laminar!`, s => s ? 'จะผสมยาเคมี! เปิด Laminar!' : 'ผสมเสร็จแล้ว ปิด Laminar!', s => `Laminar flow: ${s ? 'ON' : 'OFF'}!`) },
  { base: 'capsule', type: 'dial', label: 'ขนาดแคปซูล', options: ['เบอร์ 0', 'เบอร์ 1', 'เบอร์ 2'],
    prompt: say(s => `หมุนเลือกแคปซูลเป็น ${s}!`, s => `บรรจุยาลงแคปซูล${s}!`, s => `เปลี่ยนแคปซูลเป็น${s} เร็ว!`) },
  { base: 'paraben', type: 'button', label: 'เติมสารกันเสีย Paraben',
    prompt: say('เติมสารกันเสีย Paraben ด่วน!', 'ยาน้ำขึ้นรา! ใส่ Paraben!', 'กันเชื้อขึ้น! เติม Paraben!') },
  { base: 'centrifuge', type: 'slider', label: 'ความเร็วเครื่องเหวี่ยง (RPMx100)', min: 1, max: 5,
    prompt: say(v => `เร่งเครื่องเหวี่ยงไปที่ระดับ ${v}!`, v => `ปั่นแยกเลือด! เครื่องเหวี่ยงระดับ ${v}!`, v => `Centrifuge ตั้งที่ ${v}!`) },
  { base: 'shake', type: 'button', label: 'เขย่ายาแขวนตะกอน (Suspension)',
    prompt: say('เขย่ายาแขวนตะกอน (Suspension)!', 'ตะกอนนอนก้น! เขย่าขวดเลย!', 'Shake well before use!') },
  { base: 'autoclave', type: 'hold', label: 'อบฆ่าเชื้อ Autoclave', holdDuration: 1000,
    prompt: say('กดอบฆ่าเชื้อ Autoclave ค้างไว้ 1 วิ!', 'เครื่องมือผ่าตัดเปื้อน! Autoclave ค้างไว้!', 'นึ่งฆ่าเชื้อ! กดค้าง Autoclave!') },
  // ── เพิ่ม 18 ต.ค. 2026 (user: อุปกรณ์ซ้ำ อยากได้ทั้งสาย Care และ Sci) · คำสั่งสั้น ชัด ชื่อยา/ชื่อเฉพาะใช้อังกฤษ ──
  // สาย Care
  { base: 'nac', type: 'button', label: 'ยาต้านพิษ NAC', cta: 'ให้ยา',
    prompt: say('Paracetamol overdose! ให้ NAC!', 'กินพาราเกินขนาด! NAC ด่วน!', 'ตับจะพัง! จ่าย NAC!') },
  { base: 'naloxone', type: 'button', label: 'Naloxone', cta: 'ให้ยา',
    prompt: say('Opioid overdose! Naloxone!', 'คนไข้หายใจช้า! ให้ Naloxone!', 'Morphine เกินขนาด! Naloxone ด่วน!') },
  { base: 'adrenaline', type: 'button', label: 'Adrenaline', cta: 'ฉีด',
    prompt: say('Anaphylaxis! ฉีด Adrenaline!', 'แพ้ยาช็อก! Adrenaline ด่วน!', 'ปากบวม หายใจไม่ออก! Adrenaline!') },
  { base: 'charcoal', type: 'button', label: 'Activated charcoal', cta: 'ให้ยา',
    prompt: say('กินสารพิษมา! ให้ Activated charcoal!', 'Poisoning! Charcoal ด่วน!', 'ดูดซับพิษ! ให้ Charcoal!') },
  { base: 'route', type: 'dial', label: 'ช่องทางให้ยา', options: ['PO', 'IV', 'IM', 'SC'],
    prompt: say(s => `เปลี่ยนเป็นให้ทาง ${s}!`, s => `ปรับ route เป็น ${s}!`, s => `ให้ยาแบบ ${s} เร็ว!`) },
  { base: 'label', type: 'dial', label: 'ฉลากยา', options: ['ก่อนอาหาร', 'หลังอาหาร', 'ก่อนนอน'],
    prompt: say(s => `ติดฉลาก “${s}”!`, s => `เปลี่ยนฉลากเป็น “${s}”!`, s => `ฉลากยา: ใส่ “${s}”!`) },
  { base: 'inhaler', type: 'dial', label: 'อุปกรณ์พ่นยา', options: ['MDI', 'Spacer', 'Nebulizer'],
    prompt: say(s => `เปลี่ยนเป็น ${s}!`, s => `พ่นยาด้วย ${s}!`, s => `หยิบ ${s} มาเลย!`) },
  { base: 'drip', type: 'slider', label: 'หยดน้ำเกลือ (หยด/นาที)', min: 1, max: 6, scale: 10,
    prompt: say(v => `ปรับเรทน้ำเกลือ ${v * 10} หยด/นาที!`, v => `ตั้งหยดน้ำเกลือ ${v * 10} หยด/นาที!`, v => `ปรับ IV drip เป็น ${v * 10} หยด/นาที!`) },
  { base: 'warfarin', type: 'slider', label: 'ขนาด Warfarin (mg)', min: 1, max: 5,
    prompt: say(v => `Titrate Warfarin เป็น ${v} mg!`, v => `INR เพี้ยน! Warfarin ${v} mg!`, v => `ปรับ Warfarin ${v} mg!`) },
  { base: 'highalert', type: 'toggle', label: 'ป้าย High Alert Drug',
    prompt: say(s => s ? 'ติดป้าย High Alert ที่ KCl!' : 'เก็บป้าย High Alert!', s => s ? 'แปะป้าย High Alert ด่วน!' : 'ถอดป้าย High Alert ออก!', s => s ? 'ยาอันตราย! ติดป้าย High Alert!' : 'ย้ายยาแล้ว! ถอดป้าย High Alert!') },
  { base: 'count', type: 'spam', label: 'ถาดนับเม็ดยา', targetHits: 5, cta: 'นับเม็ดยา',
    prompt: say(n => `นับยาใส่ซอง ${n} เม็ด!`, n => `นับเม็ดยาอีก ${n} เม็ด!`, n => `ใบสั่งยา ${n} เม็ด! นับเลย!`) },
  { base: 'counsel', type: 'hold', label: 'ให้คำปรึกษาคนไข้', holdDuration: 1000,
    prompt: say('คนไข้พ่นยาไม่เป็น! กดค้างอธิบาย!', 'Counseling! กดค้างไว้!', 'ลุงลืมกินยา! กดค้างอธิบาย!') },
  // สาย Sci
  { base: 'titrate', type: 'spam', label: 'บิวเรต Titrate', targetHits: 5, cta: 'หยด',
    prompt: say(n => `Titrate อีก ${n} หยด!`, n => `ใกล้ end point! Titrate ${n} หยด!`, n => `หยดบิวเรต ${n} หยด!`) },
  { base: 'mesh', type: 'dial', label: 'ตะแกรงร่อน (mesh)', options: ['20', '40', '60', '80'],
    prompt: say(s => `เปลี่ยนตะแกรง mesh ${s}!`, s => `ร่อนผ่าน mesh ${s}!`, s => `ใช้ตะแกรงเบอร์ ${s}!`) },
  { base: 'solvent', type: 'dial', label: 'ตัวทำละลาย', options: ['Water', 'Ethanol', 'Hexane'],
    prompt: say(s => `สกัดด้วย ${s}!`, s => `เปลี่ยนตัวทำละลายเป็น ${s}!`, s => `เปลี่ยน solvent เป็น ${s}!`) },
  { base: 'press', type: 'slider', label: 'แรงตอกเม็ดยา', min: 1, max: 9,
    prompt: say(v => `ปรับแรงตอกเป็นระดับ ${v}!`, v => `เม็ดยาร่วน! ตอกระดับ ${v}!`, v => `ปรับเครื่องตอกเป็น ${v}!`) },
  { base: 'waterbath', type: 'slider', label: 'Water bath (°C)', min: 30, max: 40,
    prompt: say(v => `ตั้ง Water bath ${v}°C!`, v => `ตั้งอ่างน้ำ ${v} องศา!`, v => `Dissolution test! ตั้งน้ำ ${v}°C!`) },
  { base: 'coating', type: 'toggle', label: 'หม้อเคลือบเม็ดยา',
    prompt: say(s => `${s ? 'เปิด' : 'ปิด'}หม้อเคลือบ!`, s => s ? 'ยาขม! เปิดหม้อเคลือบ!' : 'เคลือบเสร็จ! ปิดหม้อ!', s => `${s ? 'เปิด' : 'ปิด'} Coating pan!`) },
  { base: 'vortex', type: 'hold', label: 'Vortex', holdDuration: 1000,
    prompt: say('กดค้าง Vortex!', 'หลอดยังไม่เข้ากัน! กดค้าง Vortex!', 'ผสมตัวอย่าง! Vortex!') },
  { base: 'lyo', type: 'button', label: 'Freeze dryer', cta: 'เปิดเครื่อง',
    prompt: say('Freeze dry วัคซีน!', 'ทำผงแห้ง! กด Freeze dryer!', 'Lyophilize เลย!') },
  // ปุ่มอันตราย: กดตอนมีคำสั่ง = ปกติ · กดมั่ว = โดนผลข้างเคียงเอง · มั่วซ้ำ = ลามไปเพื่อน
  { base: 'diazepam', type: 'button', hazard: 'sleepy', label: 'จ่ายยานอนหลับ Diazepam',
    prompt: say('จ่าย Diazepam ให้คนไข้ชัก!', 'คนไข้ชักเกร็ง! Diazepam ด่วน!', 'Status epilepticus! ให้ Diazepam!') },
  { base: 'dimen', type: 'button', hazard: 'dizzy', label: 'จ่ายยาแก้เมารถ Dimenhydrinate',
    prompt: say('จ่าย Dimenhydrinate ให้คนไข้เมารถ!', 'คนไข้เมาเรือ! Dimenhydrinate!', 'คลื่นไส้จะอ้วก! จ่ายยาแก้เมา!') },
  { base: 'atropine', type: 'button', hazard: 'blurry', label: 'หยอดตา Atropine',
    prompt: say('หยอดตา Atropine ขยายม่านตา!', 'จักษุแพทย์รอตรวจ! หยอด Atropine!', 'ขยายม่านตาด่วน! Atropine!') },
]
const CATALOG_BY_BASE = Object.fromEntries(CONTROL_CATALOG.map(c => [c.base, c]))

// ด่าน 1–5 ตั้งมือ · ด่าน 6+ ไม่มีที่สิ้นสุด (แบบ Spaceteam: เล่นจนเลือดหมด สถิติ = ด่านไกลสุด)
// perPlayer = คำสั่งที่ต้องทำต่อคน (ถูกคูณ 2 จากโปรโตไทป์ — user สั่ง 16 ต.ค. ให้ด่านยาวขึ้น)
export const LEVELS = [
  // เวลาต่อคำสั่งไล่ลงทีละน้อย (18 ต.ค. 2026 user: เดิม 12→10→9→8→7 วิ ก้าวกระโดดเกิน + อุปกรณ์เยอะอยู่แล้ว)
  { name: 'ห้องจ่ายยา OPD',        perPlayer: 16, controls: 4, duration: 12000, damage: 10 },
  { name: 'ห้องผสมยา Compounding',  perPlayer: 18, controls: 4, duration: 11000, damage: 12 },
  { name: 'คลีนรูม IV Admixture',   perPlayer: 20, controls: 5, duration: 10000, damage: 15 },
  { name: 'โรงงานยา GMP',           perPlayer: 22, controls: 5, duration: 9500,  damage: 18 },
  { name: 'ER วิกฤตพิษ!',           perPlayer: 24, controls: 6, duration: 9000,  damage: 20 },
]
const ENDLESS_ROOMS = ['ICU ยามดึก', 'ห้องยาเคมีบำบัด', 'คลังวัคซีนไฟดับ', 'รถพยาบาลฉุกเฉิน', 'ห้องผ่าตัดด่วน', 'แผนกพิษวิทยา',
  'ร้านยาตอนตีสอง', 'แล็บเคมีวิเคราะห์', 'ออกหน่วยเยี่ยมบ้าน', 'ห้องยาเด็ก']

// ค่าของด่านไหนก็ได้ · หลังด่าน 5 เวลาต่อคำสั่งหดทีละ 0.25 วิ (ต่ำสุด 4 วิ) ดาเมจขึ้นทีละ 1 (สูงสุด 30)
export function levelConfig(level) {
  if (level <= LEVELS.length) return { ...LEVELS[level - 1], name: `Lv.${level} ${LEVELS[level - 1].name}` }
  const k = level - LEVELS.length
  return {
    name: `Lv.${level} ${ENDLESS_ROOMS[(k - 1) % ENDLESS_ROOMS.length]}`,
    perPlayer: 24,
    controls: 6,
    duration: Math.max(5500, 9000 - 150 * k),   // หลังด่าน 5 ลดทีละ 0.15 วิ ต่ำสุด 5.5 วิ
    damage: Math.min(30, 20 + k),
  }
}

export const EFFECTS = {
  sleepy: { ms: 7000,  label: '😴 ง่วงซึม' },
  dizzy:  { ms: 6000,  label: '😵‍💫 วิงเวียน' },
  blurry: { ms: 6000,  label: '👁️ ตาพร่า' },
  spill:  { ms: 10000, label: '🧪 ยาหกเลอะจอ' }, // โทษตอนคำสั่งหมดเวลา / เหตุการณ์ทีมไม่ทัน
}
export const MISFIRE_WINDOW = 15000   // กดมั่วซ้ำภายในช่วงนี้ = ลามไปเพื่อน

export const TEAM_EVENTS = [
  { kind: 'shake',    prompt: 'ยาแยกชั้น! ทุกคนช่วยกันเขย่า!', duration: 7000 },
  { kind: 'flip',     prompt: 'ยาไวแสง! ทุกคนคว่ำจอ!',        duration: 7000 },
  { kind: 'codered',  prompt: 'Code Red! ช่วยกันกดปุ่มแดงรัวๆ!', duration: 7000 },
]

// Code Red: ทั้งทีมกดรวมกันให้ถึง TAPS_PER_PLAYER × จำนวนคน (คนละ ~2 ครั้ง/วิ ใน 7 วิ — ทันถ้าทุกคนช่วย)
export const CODE_RED_TAPS_PER_PLAYER = 12

export const LEVEL_CLEAR_DELAY = 4000
const HOLD_TOLERANCE = 300

const pick = (arr, rnd) => arr[Math.floor(rnd() * arr.length)]
const lv = (s) => levelConfig(s.level || 1)
const uids = (s) => Object.keys(s.players || {})
// ดาเมจต่อคำสั่งที่หมดเวลา: คนเยอะ = มีคำสั่งค้างพร้อมกันเยอะ → หารให้เลือดลดต่อวินาทีพอๆ กันทุกขนาดทีม
// (1–2 คน เต็ม · 4 คน ครึ่ง · 6 คน หนึ่งในสาม)
export const timeoutDamage = (s) => Math.max(1, Math.round(lv(s).damage * Math.min(1, 2 / Math.max(1, uids(s).length))))

// RTDB ไม่เก็บ array ว่าง/ค่า null — เติมกลับหลังอ่าน
export function normalizeState(s) {
  if (!s) return s
  s.players = s.players || {}
  for (const p of Object.values(s.players)) {
    p.controls = p.controls || []
    p.misfires = p.misfires || []
    p.inst = p.inst || null
    p.effect = p.effect || null
  }
  s.eventTimes = s.eventTimes || []
  s.event = s.event || null
  if (s.event) { s.event.done = s.event.done || {}; if (s.event.kind === 'codered') s.event.taps = s.event.taps || {} }
  return s
}

function log(s, msg, now) {
  s.log = { id: (s.log?.id || 0) + 1, msg, t: now }
}

// ── เริ่มเกม ──
export function newGame(roster, now, rnd = Math.random) {
  const s = { gameId: `g${now}`, status: 'playing', level: 1, health: 100, progress: 0, maxProgress: 1, players: {}, event: null, eventTimes: [], log: null }
  for (const { uid, name } of roster) s.players[uid] = { name, controls: [], misfires: [], inst: null, effect: null }
  startLevel(s, 1, now, rnd)
  return s
}

export function startLevel(s, level, now, rnd = Math.random) {
  const L = levelConfig(level)
  s.status = 'playing'
  s.level = level
  s.progress = 0
  s.clearAt = null
  s.event = null
  const ids = uids(s)
  s.maxProgress = ids.length * L.perPlayer

  // ห้ามอุปกรณ์ซ้ำข้ามคน (ตะโกนแล้วกำกวม) — คนเยอะเกินคลัง ลดจำนวนต่อคน ขั้นต่ำ 2
  const shuffled = [...CONTROL_CATALOG].sort(() => 0.5 - rnd())
  const per = Math.max(2, Math.min(L.controls, Math.floor(shuffled.length / ids.length)))
  ids.forEach((uid, idx) => {
    const p = s.players[uid]
    p.controls = []
    for (let i = 0; i < per; i++) {
      const cat = shuffled[(idx * per + i) % shuffled.length]
      const c = { id: `${cat.base}_${idx}`, base: cat.base, type: cat.type, label: cat.label }
      for (const k of ['min', 'max', 'options', 'holdDuration', 'targetHits', 'hazard', 'cta', 'scale']) if (cat[k] != null) c[k] = cat[k]
      if (c.type === 'toggle') c.state = false
      if (c.type === 'slider') c.value = c.min
      if (c.type === 'dial') c.value = c.options[0]
      if (c.type === 'spam') c.hits = 0
      p.controls.push(c)
    }
    p.inst = null
    p.effect = null
    p.misfires = []
  })
  ids.forEach(uid => assignInstruction(s, uid, now, rnd))

  // เหตุการณ์ทั้งทีม (18 ต.ค. 2026 user: ขึ้นบ่อยเกิน): ด่าน 1–2 ไม่มี · 3–5 มี 1 ครั้ง · 6+ มี 2 ครั้ง
  const count = level <= 2 ? 0 : level <= 5 ? 1 : 2
  s.eventTimes = []
  for (let i = 0; i < count; i++) s.eventTimes.push(now + 8000 + rnd() * 12000 + i * 18000)
  log(s, `🚀 เริ่ม ${L.name}! สื่อสารคำสั่งให้เพื่อนด่วน!`, now)
}

function findControl(s, controlId) {
  for (const [uid, p] of Object.entries(s.players)) {
    const c = p.controls.find(c => c.id === controlId)
    if (c) return { uid, c }
  }
  return null
}

export function assignInstruction(s, speakerUid, now, rnd = Math.random) {
  const speaker = s.players[speakerUid]
  if (!speaker) return
  // อุปกรณ์ที่คำสั่งคนอื่นจองอยู่ ห้ามซ้อน
  const taken = new Set()
  for (const [uid, p] of Object.entries(s.players)) if (uid !== speakerUid && p.inst) taken.add(p.inst.controlId)
  const avail = []
  for (const [uid, p] of Object.entries(s.players)) for (const c of p.controls) if (!taken.has(c.id)) avail.push({ uid, c })
  if (!avail.length) { speaker.inst = null; return }

  const { uid: targetUid, c } = pick(avail, rnd)
  const cat = CATALOG_BY_BASE[c.base]
  let target = true
  if (c.type === 'spam') { target = SPAM_MIN + Math.floor(rnd() * (SPAM_MAX - SPAM_MIN + 1)); c.hits = 0 } // สุ่มจำนวน · นับใหม่ทุกคำสั่ง
  else if (c.type === 'toggle') target = !c.state
  else if (c.type === 'slider') {
    let v = c.min + Math.floor(rnd() * (c.max - c.min + 1))
    if (v === c.value) v = v === c.max ? c.min : v + 1
    target = v
  } else if (c.type === 'dial') target = pick(c.options, rnd)

  const duration = lv(s).duration
  speaker.inst = {
    id: `i${now}_${Math.floor(rnd() * 1e6)}`,
    prompt: cat.prompt(target, rnd),
    targetUid, controlId: c.id, target,
    duration, deadline: now + duration,
  }
}

function applyEffect(s, uid, type, now) {
  const p = s.players[uid]
  if (!p) return
  const E = EFFECTS[type]
  p.effect = { type, label: E.label, until: now + E.ms, duration: E.ms }
}

// ── ผู้เล่นกด/เลื่อน/สับ ──
export function applyAction(s, uid, controlId, value, now, rnd = Math.random) {
  if (s.status !== 'playing' || s.event) return false // ระหว่างเหตุการณ์ทีม ปุ่มส่วนตัวไม่นับ
  const me = s.players[uid]
  const c = me?.controls.find(c => c.id === controlId)
  if (!c) return false

  if (c.type === 'toggle') c.state = value
  else if (c.type === 'slider') c.value = value
  else if (c.type === 'dial') c.value = value
  else if (c.type === 'spam') c.hits = (c.hits || 0) + 1
  else if (c.type === 'hold') {
    // จับเวลาฝั่งหัวห้อง ไม่เชื่อเครื่องที่กด
    if (value === 'start') { c.holdStart = now; return false }
    if (value === 'cancel') { c.holdStart = null; return false }
  }

  let matched = null
  for (const [spUid, sp] of Object.entries(s.players)) {
    const inst = sp.inst
    if (!inst || inst.targetUid !== uid || inst.controlId !== controlId) continue
    let ok = false
    if (c.type === 'button') ok = true
    else if (c.type === 'hold') ok = !!c.holdStart && now - c.holdStart >= (c.holdDuration || 1000) - HOLD_TOLERANCE
    else if (c.type === 'spam') ok = c.hits >= inst.target
    else ok = value === inst.target
    if (ok) { matched = spUid; break }
  }
  if (c.type === 'hold') c.holdStart = null

  if (matched) {
    const inst = s.players[matched].inst
    if (c.type === 'spam') c.hits = 0
    s.progress += 1
    log(s, `✅ ${me.name} ทำ "${inst.prompt}" สำเร็จ!`, now)
    if (s.progress >= s.maxProgress) levelCleared(s, now)
    else assignInstruction(s, matched, now, rnd)
    return true
  }
  if (c.hazard) misfire(s, uid, c, now, rnd)
  return true
}

// กดปุ่มอันตรายโดยไม่มีคำสั่ง
function misfire(s, uid, c, now, rnd) {
  const me = s.players[uid]
  me.misfires = me.misfires.filter(t => now - t < MISFIRE_WINDOW)
  me.misfires.push(now)
  applyEffect(s, uid, c.hazard, now)
  const label = EFFECTS[c.hazard].label
  if (me.misfires.length >= 2) {
    // มั่วซ้ำ → สุ่มเพื่อนโดนลูกหลง (เลือกคนที่ยังไม่โดนอะไรก่อน)
    const others = uids(s).filter(id => id !== uid)
    const clean = others.filter(id => !s.players[id].effect)
    const pool = clean.length ? clean : others
    if (pool.length) {
      const victim = pick(pool, rnd)
      applyEffect(s, victim, c.hazard, now)
      log(s, `🤦 ${me.name} กด${c.label} มั่วอีกแล้ว! ${s.players[victim].name} โดนลูกหลง ${label}!`, now)
      return
    }
  }
  log(s, `${label}! ${me.name} กด${c.label} มั่ว โดนเองเลย`, now)
}

function levelCleared(s, now) {
  for (const p of Object.values(s.players)) { p.inst = null; p.effect = null }
  s.event = null
  s.eventTimes = []
  s.status = 'levelClear'
  s.health = Math.min(100, s.health + 20)
  s.clearAt = now + LEVEL_CLEAR_DELAY
  log(s, `🏁 ผ่าน ${lv(s).name}! (+20 HP) เตรียมตัวด่านต่อไป...`, now)
}

function gameOver(s, now) {
  s.status = 'gameover'
  s.bestLevel = s.level
  for (const p of Object.values(s.players)) { p.inst = null }
  s.event = null
  log(s, `💥 แลปแตก! ทีมไปได้ถึง ${lv(s).name}`, now)
}

// ── เหตุการณ์ทั้งทีม ──
function triggerEvent(s, now, rnd) {
  const E = pick(TEAM_EVENTS, rnd)
  s.event = { id: `e${now}`, kind: E.kind, prompt: E.prompt, duration: E.duration, startedAt: now, deadline: now + E.duration, done: {} }
  if (E.kind === 'codered') { s.event.target = CODE_RED_TAPS_PER_PLAYER * uids(s).length; s.event.total = 0; s.event.taps = {} }
  // หยุดเวลาคำสั่งส่วนตัว: จำเวลาที่เหลือไว้
  for (const p of Object.values(s.players)) if (p.inst) p.inst.remaining = Math.max(1500, p.inst.deadline - now)
  log(s, `🚨 ${E.prompt}`, now)
}

// Code Red: นับแตะรวมทั้งทีม (เครื่องส่งมาเป็นก้อนทุก ~250ms)
export function eventTaps(s, uid, eventId, n, now, rnd = Math.random) {
  const ev = s.event
  if (s.status !== 'playing' || !ev || ev.kind !== 'codered' || ev.id !== eventId || !s.players[uid]) return false
  n = Math.max(0, Math.min(20, Math.floor(+n || 0))) // กันเครื่องส่งเลขมั่ว
  if (!n) return false
  ev.taps[uid] = (ev.taps[uid] || 0) + n
  ev.total += n
  if (ev.total >= ev.target) finishEvent(s, true, now, rnd)
  return true
}

export function eventDone(s, uid, eventId, now, rnd = Math.random) {
  const ev = s.event
  if (s.status !== 'playing' || !ev || ev.kind === 'codered' || ev.id !== eventId || !s.players[uid] || ev.done[uid]) return false
  ev.done[uid] = true
  if (uids(s).every(id => ev.done[id])) finishEvent(s, true, now, rnd)
  return true
}

function finishEvent(s, success, now) {
  const ev = s.event
  s.event = null
  if (success) {
    // โบนัส = คนละ 1 คำสั่ง (maxProgress ก็คูณจำนวนคน สัดส่วนจึงเท่ากันทุกขนาดทีม)
    const bonus = Math.max(1, uids(s).length)
    s.progress += bonus
    log(s, `🙌 ทีมเวิร์คสุดยอด! ผ่าน "${ev.prompt}" (+${bonus} ความคืบหน้า)`, now)
    if (s.progress >= s.maxProgress) return levelCleared(s, now)
  } else {
    const dmg = Math.round(lv(s).damage * 1.5)
    s.health = Math.max(0, s.health - dmg)
    // Code Red: คนที่แตะไม่ถึงครึ่งของส่วนตัวเองนับว่าช้า
    const slow = ev.kind === 'codered'
      ? uids(s).filter(id => (ev.taps[id] || 0) < CODE_RED_TAPS_PER_PLAYER / 2)
      : uids(s).filter(id => !ev.done[id])
    slow.forEach(id => applyEffect(s, id, 'spill', now))
    const who = ev.kind === 'codered' ? `กดรวม ${ev.total}/${ev.target}` : `${slow.map(id => s.players[id].name).join(', ')} ช้าไป`
    log(s, `💥 ไม่ทัน! ${who} (-${dmg} HP)`, now)
    if (s.health <= 0) return gameOver(s, now)
  }
  // เล่นต่อจากเวลาที่เหลือ
  for (const p of Object.values(s.players)) {
    if (p.inst && p.inst.remaining != null) {
      p.inst.deadline = now + p.inst.remaining
      delete p.inst.remaining
    }
  }
}

// ── หัวห้องเรียกถี่ๆ: จัดการทุกอย่างที่ขึ้นกับเวลา ──
export function tick(s, now, rnd = Math.random) {
  let changed = false

  // ผลข้างเคียงหมดเวลา
  for (const p of Object.values(s.players)) {
    if (p.effect && now >= p.effect.until) { p.effect = null; changed = true }
  }

  if (s.status === 'levelClear') {
    if (now >= s.clearAt) { startLevel(s, s.level + 1, now, rnd); return true }
    return changed
  }
  if (s.status !== 'playing') return changed

  if (s.event) {
    if (now >= s.event.deadline) { finishEvent(s, false, now); return true }
    return changed
  }

  // ถึงเวลาเหตุการณ์ทีม
  if (s.eventTimes.length && now >= s.eventTimes[0]) {
    s.eventTimes.shift()
    triggerEvent(s, now, rnd)
    return true
  }

  // คำสั่งหมดเวลา
  for (const [uid, p] of Object.entries(s.players)) {
    const inst = p.inst
    if (!inst || now < inst.deadline) continue
    const dmg = timeoutDamage(s)
    s.health = Math.max(0, s.health - dmg)
    log(s, `⚠️ คำสั่ง "${inst.prompt}" หมดเวลา! สารละลายระเหย (-${dmg} HP)`, now)
    if (s.health <= 0) { gameOver(s, now); return true }
    // คนที่ต้องกดแต่ไม่กด โดนยาหกเลอะจอ
    if (s.players[inst.targetUid]) applyEffect(s, inst.targetUid, 'spill', now)
    assignInstruction(s, uid, now, rnd)
    changed = true
  }
  return changed
}

// ผู้เล่นออกกลางเกม: ลบอุปกรณ์ของเขา + ล้างคำสั่งที่ชี้ไปหาเขา
export function removePlayer(s, uid, now, rnd = Math.random) {
  if (!s.players[uid]) return false
  delete s.players[uid]
  if (!uids(s).length) return true
  for (const [id, p] of Object.entries(s.players)) {
    if (p.inst && p.inst.targetUid === uid) assignInstruction(s, id, now, rnd)
  }
  if (s.event && uids(s).every(id => s.event.done[id])) finishEvent(s, true, now, rnd)
  return true
}
