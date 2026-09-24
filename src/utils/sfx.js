// ════════════════════════════════════════════════════════════
//  sfx — เสียงเอฟเฟกต์ทั้งเว็บ สังเคราะห์สดด้วย Web Audio (ไม่มีไฟล์เสียง = ไม่เพิ่มขนาดเว็บ/ไม่มีโหลด)
//  เรียก: sfx('correct') · เปิด/ปิด: setSfxOn(bool) (จำในเครื่องนั้น localStorage)
//  ⚠️ iOS/Chrome ต้องสร้าง/resume AudioContext จาก gesture ของผู้ใช้ — ปุ่มทุกปุ่มเป็น gesture อยู่แล้ว
//     (installTapSound ผูก pointerdown ระดับ document) ⇒ เสียงแรกของเซสชันต้องมาจากการกดเสมอ
// ════════════════════════════════════════════════════════════

const KEY = 'rxtu.sfx'
const MASTER = 0.22            // ดังสุดทั้งระบบ — ตั้งเบาไว้ก่อน เสียงในเว็บเรียนต้องไม่รบกวน
let ctx = null
let out = null
let on = readOn()

function readOn() {
  try { return globalThis.localStorage?.getItem(KEY) !== 'off' } catch { return true }
}
export function sfxOn() { return on }
export function setSfxOn(v) {
  on = !!v
  try { globalThis.localStorage?.setItem(KEY, on ? 'on' : 'off') } catch { /* private mode */ }
}

function audio() {
  if (!on || typeof window === 'undefined') return null
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  if (!ctx) {
    ctx = new AC()
    out = ctx.createGain()
    out.gain.value = MASTER
    out.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

// โน้ตเดียว: ความถี่ f (Hz) เริ่มที่ t วินาทีจากนี้ ยาว d · type = รูปคลื่น · slide = เลื่อนความถี่ไปถึง
function tone(f, t = 0, d = 0.12, { type = 'sine', vol = 1, slide = null } = {}) {
  const a = ctx, t0 = a.currentTime + t
  const o = a.createOscillator(), g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(f, t0)
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + d)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008)        // attack สั้น กันเสียงคลิก
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + d)
  o.connect(g).connect(out)
  o.start(t0); o.stop(t0 + d + 0.02)
}

// เสียงซ่า (noise) สั้นๆ — ใช้กับดิน/ใบไม้/ลม
function noise(t = 0, d = 0.12, { vol = 0.5, hp = 800 } = {}) {
  const a = ctx, t0 = a.currentTime + t
  const buf = a.createBuffer(1, Math.max(1, Math.floor(a.sampleRate * d)), a.sampleRate)
  const ch = buf.getChannelData(0)
  for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length)
  const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain()
  src.buffer = buf; f.type = 'highpass'; f.frequency.value = hp; g.gain.value = vol
  src.connect(f).connect(g).connect(out)
  src.start(t0)
}

// โน้ตที่ความถี่ส่าย (LFO) — ได้เสียงยวบยาบ/คำราม · rate = ส่ายกี่ครั้งต่อวิ · depth = ส่ายกว้างกี่ Hz
function wobble(f, t = 0, d = 0.4, { type = 'sawtooth', vol = 0.5, slide = null, rate = 18, depth = 40, lp = null } = {}) {
  const a = ctx, t0 = a.currentTime + t
  const o = a.createOscillator(), g = a.createGain(), lfo = a.createOscillator(), lg = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(f, t0)
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + d)
  lfo.frequency.value = rate; lg.gain.value = depth
  lfo.connect(lg).connect(o.frequency)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.04)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + d)
  let node = o.connect(g)
  if (lp) { const f2 = a.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = lp; node = node.connect(f2) }
  node.connect(out)
  o.start(t0); lfo.start(t0); o.stop(t0 + d + 0.02); lfo.stop(t0 + d + 0.02)
}

// เสียงซ่าผ่าน lowpass (ทุ้ม) — ลมหายใจ/คำราม
function rumble(t = 0, d = 0.5, { vol = 0.5, lp = 600 } = {}) {
  const a = ctx, t0 = a.currentTime + t
  const buf = a.createBuffer(1, Math.max(1, Math.floor(a.sampleRate * d)), a.sampleRate)
  const ch = buf.getChannelData(0)
  for (let i = 0; i < ch.length; i++) { const k = i / ch.length; ch[i] = (Math.random() * 2 - 1) * Math.min(1, k * 8) * (1 - k) }
  const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain()
  src.buffer = buf; f.type = 'lowpass'; f.frequency.value = lp; g.gain.value = vol
  src.connect(f).connect(g).connect(out)
  src.start(t0)
}

// ── เสียงสัตว์ใหญ่ (คำราม/พ่นไฟ/ตีอก) ──────────────────────────
// ความขลังมาจาก 3 อย่าง: (1) ช่วงเสียงต่ำมาก + sub-bass (2) ความแตกพร่า (WaveShaper) (3) ยาวและมีขึ้น-ลงของ pitch
let driveCurve = null
function drive() {
  if (!driveCurve) {
    driveCurve = new Float32Array(1024)
    for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; driveCurve[i] = Math.tanh(x * 3.2) }
  }
  const ws = ctx.createWaveShaper(); ws.curve = driveCurve; ws.oversample = '2x'
  return ws
}

// เสียงคำรามแตกพร่า: pitch ไต่ขึ้น → ค้าง → ลงยาว (pts = [[วินาที, Hz], …]) · ส่ายด้วย LFO ให้เป็นเสียงคอ
function growl(pts, { t = 0, vol = 0.6, rate = 30, depth = 22, lp = 1200, type = 'sawtooth' } = {}) {
  const a = ctx, t0 = a.currentTime + t, d = pts[pts.length - 1][0]
  const o = a.createOscillator(), lfo = a.createOscillator(), lg = a.createGain()
  const f = a.createBiquadFilter(), g = a.createGain(), ws = drive()
  o.type = type
  o.frequency.setValueAtTime(pts[0][1], t0)
  for (const [s, hz] of pts.slice(1)) o.frequency.exponentialRampToValueAtTime(hz, t0 + s)
  lfo.frequency.value = rate; lg.gain.value = depth; lfo.connect(lg).connect(o.frequency)
  f.type = 'lowpass'; f.frequency.value = lp; f.Q.value = 2.5
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(0.18, d * 0.2))   // พองขึ้น ไม่กระแทก
  g.gain.setValueAtTime(vol, t0 + d * 0.55)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + d)
  o.connect(ws).connect(f).connect(g).connect(out)
  o.start(t0); lfo.start(t0); o.stop(t0 + d + 0.05); lfo.stop(t0 + d + 0.05)
}

// sub-bass ยาว — ตัวที่ทำให้ "สั่นไปถึงพื้น" (ลำโพงมือถือเล็กเล่นไม่ค่อยออก แต่หูฟังได้ยินชัด)
const sub = (f, t, d, vol = 0.8, slide = null) => tone(f, t, d, { type: 'sine', vol, slide })

// ลมไฟ: noise ผ่าน bandpass ที่กวาดความถี่ ต่ำ→สูง→ต่ำ + เสียงแตกเปาะแปะ
function flame(t = 0, d = 1.3, vol = 0.6) {
  const a = ctx, t0 = a.currentTime + t
  const n = Math.floor(a.sampleRate * d)
  const buf = a.createBuffer(1, n, a.sampleRate), ch = buf.getChannelData(0)
  for (let i = 0; i < n; i++) {
    const k = i / n
    const env = Math.min(1, k * 6) * Math.pow(1 - k, 0.7)
    const crack = Math.random() < 0.0015 ? (Math.random() * 2 - 1) * 3 : 0   // เปาะแปะ
    ch[i] = ((Math.random() * 2 - 1) + crack) * env
  }
  const src = a.createBufferSource(), bp = a.createBiquadFilter(), g = a.createGain()
  src.buffer = buf; bp.type = 'bandpass'; bp.Q.value = 0.9
  bp.frequency.setValueAtTime(300, t0)
  bp.frequency.exponentialRampToValueAtTime(2600, t0 + d * 0.35)
  bp.frequency.exponentialRampToValueAtTime(700, t0 + d)
  g.gain.value = vol
  src.connect(bp).connect(g).connect(out)
  src.start(t0)
}

// ตีอก: ตุ้บทุ้ม (sine ตกเร็ว + noise lowpass) · gap สั้นลงเรื่อยๆ = เร่งจังหวะ
function thump(t, vol = 0.9) {
  tone(120, t, 0.16, { type: 'sine', vol, slide: 45 })
  rumble(t, 0.1, { vol: vol * 0.6, lp: 400 })
}

const arp = (notes, step, opt) => notes.forEach((f, i) => tone(f, i * step, opt?.d ?? 0.14, opt))

// ── คลังเสียง ── (ความถี่อิงโน้ต C major: C5=523 E5=659 G5=784 C6=1047)
const SOUNDS = {
  tap:     () => tone(1400, 0, 0.035, { type: 'triangle', vol: 0.35 }),
  correct: () => arp([659, 988], 0.08, { type: 'triangle', vol: 0.8, d: 0.16 }),
  wrong:   () => { tone(220, 0, 0.18, { type: 'square', vol: 0.25, slide: 150 }); tone(180, 0.1, 0.2, { type: 'square', vol: 0.2, slide: 120 }) },
  coin:    () => { tone(988, 0, 0.07, { type: 'square', vol: 0.3 }); tone(1319, 0.06, 0.18, { type: 'square', vol: 0.3 }) },
  plant:   () => { noise(0, 0.08, { vol: 0.35, hp: 400 }); tone(330, 0.04, 0.1, { type: 'sine', vol: 0.5, slide: 440 }) },
  harvest: () => { noise(0, 0.06, { vol: 0.3, hp: 1500 }); arp([523, 659, 784], 0.06, { type: 'triangle', vol: 0.6 }) },
  levelup: () => arp([523, 659, 784, 1047], 0.09, { type: 'triangle', vol: 0.7, d: 0.2 }),
  finish:  () => arp([784, 659, 784, 1047], 0.11, { type: 'triangle', vol: 0.6, d: 0.22 }),
  climb:   () => tone(880, 0, 0.09, { type: 'triangle', vol: 0.45, slide: 1320 }),
  roll:    () => { for (let i = 0; i < 8; i++) tone(500 + i * 90, i * 0.06, 0.05, { type: 'square', vol: 0.15 }) },
  // เปิดกาชา: ดังและยาวขึ้นตามความหายาก
  reveal_common:    () => tone(784, 0, 0.18, { type: 'triangle', vol: 0.6 }),
  reveal_rare:      () => arp([659, 988], 0.09, { type: 'triangle', vol: 0.7, d: 0.2 }),
  reveal_epic:      () => arp([523, 784, 1047], 0.09, { type: 'triangle', vol: 0.75, d: 0.24 }),
  reveal_legendary: () => { arp([523, 659, 784, 1047, 1319], 0.08, { type: 'triangle', vol: 0.8, d: 0.3 }); noise(0.4, 0.5, { vol: 0.15, hp: 4000 }) },

  // ── สนามรบ (BattleReplay) ──
  // หมัดตามสาย: w = weight 0–1 (ความแรงจริงของหมัด) · crit = ติ๊งแหลมซ้อน
  hit_fist:     ({ w = 0.5, crit } = {}) => { tone(140 - w * 40, 0, 0.12 + w * 0.08, { type: 'sine', vol: 0.6 + w * 0.4, slide: 60 }); noise(0, 0.06, { vol: 0.25 + w * 0.2, hp: 300 }); if (crit) tone(1760, 0.02, 0.1, { type: 'square', vol: 0.2 }) },
  hit_scissors: ({ w = 0.5, crit } = {}) => { noise(0, 0.09 + w * 0.05, { vol: 0.35 + w * 0.25, hp: 3500 }); tone(1200, 0, 0.07, { type: 'sawtooth', vol: 0.12, slide: 500 }); if (crit) tone(1760, 0.02, 0.1, { type: 'square', vol: 0.2 }) },
  hit_paper:    ({ w = 0.5, crit } = {}) => { noise(0, 0.14 + w * 0.06, { vol: 0.3 + w * 0.2, hp: 1200 }); tone(420, 0, 0.12, { type: 'triangle', vol: 0.35, slide: 260 }); if (crit) tone(1760, 0.02, 0.1, { type: 'square', vol: 0.2 }) },
  hit_sub:      () => noise(0, 0.04, { vol: 0.2, hp: 2000 }),
  ko:           () => { tone(330, 0, 0.35, { type: 'square', vol: 0.25, slide: 90 }); noise(0.05, 0.25, { vol: 0.25, hp: 200 }) },
  boom:         () => { tone(90, 0, 0.5, { type: 'sine', vol: 1, slide: 40 }); noise(0, 0.4, { vol: 0.45, hp: 150 }) },
  super:        () => arp([880, 1175], 0.05, { type: 'square', vol: 0.18, d: 0.08 }),
  // สกิลเปิดไฟต์ (ยกแรก)
  // 🦁 คำราม: พองขึ้น ค้าง แล้วคลายลงยาว 1.5 วิ · 2 ชั้นเสียงคอ + sub + ลมหายใจ
  roar: () => {
    growl([[0, 120], [0.25, 190], [0.7, 165], [1.5, 70]], { vol: 0.75, rate: 34, depth: 26, lp: 1400 })
    growl([[0, 80], [0.25, 125], [0.7, 110], [1.5, 48]], { t: 0.02, vol: 0.55, rate: 27, depth: 14, lp: 900 })
    sub(55, 0.05, 1.3, 0.8, 38)
    rumble(0, 1.5, { vol: 0.75, lp: 1100 })
  },
  // 🐉 บาฮามุท — ตอนแบนเนอร์ขึ้น: คำรามต่ำกว่าสิงโต ยาวกว่า มีเสียงสูดลมก่อน
  dragon_roar: () => {
    rumble(0, 0.5, { vol: 0.35, lp: 2500 })   // สูดลมเข้า
    growl([[0, 70], [0.55, 150], [1.1, 125], [1.9, 45]], { t: 0.35, vol: 0.8, rate: 22, depth: 30, lp: 1100 })
    growl([[0, 105], [0.55, 225], [1.1, 190], [1.9, 70]], { t: 0.37, vol: 0.35, rate: 41, depth: 20, lp: 1800, type: 'square' })
    sub(42, 0.4, 1.6, 0.9, 30)
  },
  // 🐉 ตอนไฟลงจริง: พ่นไฟยาว + ตูมที่ปลาย
  dragon_breath: () => {
    flame(0, 1.4, 0.7)
    growl([[0, 90], [1.2, 55]], { vol: 0.35, rate: 18, depth: 12, lp: 600 })
    sub(60, 0.9, 0.6, 1, 30)
    rumble(0.9, 0.6, { vol: 0.6, lp: 300 })
  },
  // 🐦‍🔥 ฟีนิกซ์เกิดใหม่: ไฟลุกพรึ่บ → ประกายไต่ขึ้น 2 อ็อกเทฟ → เสียงร้องนกสูง → ระฆังปิด
  phoenix: () => {
    flame(0, 0.9, 0.55)
    sub(70, 0, 0.6, 0.7, 140)
    arp([523, 659, 784, 1047, 1319, 1568, 2093], 0.06, { type: 'triangle', vol: 0.4, d: 0.35 })
    wobble(1500, 0.45, 0.7, { type: 'sine', vol: 0.35, slide: 2300, rate: 11, depth: 90 })
    tone(2093, 0.9, 1.1, { type: 'sine', vol: 0.3 }); tone(2637, 0.9, 1.1, { type: 'sine', vol: 0.2 })
    noise(0.5, 0.8, { vol: 0.12, hp: 6000 })
  },
  // 👹 กิเลน อสูรกระหายเลือด: หัวใจเต้นตุ้บ 2 ที → คำรามต่ำ + เสียงเบี้ยว (ทริโทน)
  kirin: () => {
    thump(0, 0.9); thump(0.22, 0.8)
    growl([[0, 90], [0.3, 160], [1.2, 55]], { t: 0.45, vol: 0.7, rate: 19, depth: 28, lp: 1000 })
    tone(233, 0.5, 0.8, { type: 'square', vol: 0.12, slide: 165 }); tone(330, 0.5, 0.8, { type: 'square', vol: 0.1, slide: 233 })
  },
  // 🦖 ทีเร็กซ์: ย่ำพื้น 2 ที → คำรามยักษ์ต่ำสุดในเกม
  trex: () => {
    thump(0, 1); thump(0.3, 1)
    growl([[0, 55], [0.35, 135], [0.9, 110], [1.8, 36]], { t: 0.55, vol: 0.8, rate: 17, depth: 24, lp: 850 })
    growl([[0, 80], [0.35, 200], [0.9, 160], [1.8, 50]], { t: 0.57, vol: 0.35, rate: 29, depth: 18, lp: 1500, type: 'square' })
    sub(38, 0.55, 1.6, 0.9, 28)
    rumble(0.55, 1.6, { vol: 0.6, lp: 700 })
  },
  // 🐍 อูโรโบรอส: เสียงขู่ฟ่อสั่นๆ + โน้ตลึกลับวนเป็นวง
  ouroboros: () => {
    for (let i = 0; i < 5; i++) noise(i * 0.12, 0.14, { vol: 0.3, hp: 5000 })
    arp([440, 523, 622, 740, 622, 523, 440], 0.09, { type: 'sine', vol: 0.3, d: 0.25 })
    sub(55, 0, 0.9, 0.5)
  },
  // 🦅 ซีมูร์ก: เสียงร้องอินทรีแหลม → โฉบลงวูบ
  simurgh: () => {
    wobble(2400, 0, 0.45, { type: 'sawtooth', vol: 0.18, slide: 1700, rate: 42, depth: 160, lp: 4000 })
    wobble(2600, 0.25, 0.35, { type: 'sawtooth', vol: 0.14, slide: 1900, rate: 42, depth: 140, lp: 4000 })
    tone(900, 0.55, 0.5, { type: 'triangle', vol: 0.3, slide: 180 })
    noise(0.55, 0.5, { vol: 0.35, hp: 1200 })
  },
  // 🛡️ กิเลนกลืนฝัน: ระฆังศักดิ์สิทธิ์ 3 ใบ (ฮาร์มอนิกไม่ลงตัวแบบระฆังจริง) + ประกาย
  qilin: () => {
    const bell = (f, t) => { tone(f, t, 1.4, { type: 'sine', vol: 0.4 }); tone(f * 2.76, t, 0.8, { type: 'sine', vol: 0.12 }); tone(f * 5.4, t, 0.4, { type: 'sine', vol: 0.05 }) }
    bell(523, 0); bell(659, 0.18); bell(784, 0.36)
    noise(0.4, 0.7, { vol: 0.1, hp: 7000 })
  },
  // 🦠 ราชาเชื้อ: ยวบยาบหลายชั้นซ้อน + ฟองปุดรัว
  virus_big: () => {
    wobble(180, 0, 0.7, { type: 'square', vol: 0.22, slide: 90, rate: 21, depth: 60, lp: 1200 })
    wobble(270, 0.1, 0.6, { type: 'square', vol: 0.18, slide: 130, rate: 27, depth: 80, lp: 1400 })
    wobble(400, 0.2, 0.5, { type: 'square', vol: 0.12, slide: 200, rate: 33, depth: 90, lp: 1600 })
    for (let i = 0; i < 7; i++) tone(300 + ((i * 137) % 400), 0.3 + i * 0.07, 0.07, { type: 'sine', vol: 0.25, slide: 150 })
  },
  // 🦣 แมมมอธ: แตรช้างแตกพร่า → หินกระแทก 2 ที
  mammoth: () => {
    growl([[0, 330], [0.2, 520], [0.7, 470], [1.1, 300]], { vol: 0.5, rate: 7, depth: 18, lp: 2200 })
    thump(1.0, 1); rumble(1.0, 0.3, { vol: 0.5, lp: 250 }); thump(1.25, 0.9)
  },
  // 🐳 วาฬ: เพลงวาฬไหลช้า + ฟองน้ำ
  whale: () => {
    wobble(260, 0, 1.6, { type: 'sine', vol: 0.45, slide: 420, rate: 4, depth: 25 })
    wobble(390, 0.3, 1.3, { type: 'sine', vol: 0.2, slide: 300, rate: 5, depth: 20 })
    for (let i = 0; i < 6; i++) tone(500 + i * 120, 0.8 + i * 0.1, 0.06, { type: 'sine', vol: 0.18, slide: 900 })
  },
  // 🦍 ตีอกท้าชน: ตุ้บ 7 ที เร่งจังหวะ แล้วคำรามสั้นๆ ปิด
  gorilla: () => {
    let t = 0
    for (const gap of [0.2, 0.17, 0.14, 0.11, 0.09, 0.08, 0]) { thump(t, 0.95); t += gap }
    growl([[0, 150], [0.15, 220], [0.6, 110]], { t: t + 0.08, vol: 0.6, rate: 24, depth: 30, lp: 1000 })
    sub(50, t + 0.08, 0.5, 0.7, 35)
  },
  aura:     () => { tone(392, 0, 0.35, { type: 'sawtooth', vol: 0.18 }); tone(523, 0.12, 0.4, { type: 'sawtooth', vol: 0.18 }); tone(784, 0.24, 0.45, { type: 'triangle', vol: 0.3 }) },
  open_crit:  () => { noise(0, 0.12, { vol: 0.3, hp: 5000 }); tone(1568, 0.05, 0.3, { type: 'triangle', vol: 0.3 }) },
  open_hp:    () => arp([392, 523, 659, 784], 0.07, { type: 'sine', vol: 0.4, d: 0.3 }),
  open_drain: () => wobble(220, 0, 0.5, { type: 'triangle', vol: 0.35, slide: 440, rate: 9, depth: 20 }),
  open_wall:  () => { tone(110, 0, 0.4, { type: 'sine', vol: 0.7 }); tone(1500, 0.05, 0.25, { type: 'square', vol: 0.12 }) },
  curse:    () => { wobble(300, 0, 0.5, { type: 'triangle', vol: 0.35, slide: 150, rate: 7, depth: 25 }) },
  // เชื้อ 🦠 — ยวบยาบเหนียวๆ (ติดเชื้อ) · ฟองปุด (ดาเมจเชื้อแต่ละชั้น)
  virus:    () => { wobble(240, 0, 0.32, { type: 'square', vol: 0.22, slide: 110, rate: 26, depth: 70, lp: 1400 }); wobble(360, 0.08, 0.25, { type: 'square', vol: 0.15, slide: 170, rate: 31, depth: 60, lp: 1400 }) },
  virus_tick: () => tone(520, 0, 0.07, { type: 'sine', vol: 0.3, slide: 220 }),
  // ชิปสกิลโผล่ครั้งแรกของไฟต์
  skill:        () => { tone(660, 0, 0.1, { type: 'triangle', vol: 0.5 }); tone(990, 0.07, 0.18, { type: 'triangle', vol: 0.5 }) },
  // ผลพาสสีฟตาม fxKind
  p_heal:   () => arp([784, 988, 1175], 0.06, { type: 'sine', vol: 0.45, d: 0.2 }),
  p_revive: () => { arp([523, 659, 784, 1047, 1319], 0.07, { type: 'sine', vol: 0.5, d: 0.25 }); noise(0.3, 0.4, { vol: 0.12, hp: 5000 }) },
  p_guard:  () => { tone(1500, 0, 0.18, { type: 'square', vol: 0.18, slide: 1400 }); tone(2250, 0, 0.12, { type: 'sine', vol: 0.2 }) },
  p_save:   () => { tone(1500, 0, 0.2, { type: 'square', vol: 0.2 }); arp([784, 1175], 0.08, { type: 'sine', vol: 0.35, d: 0.2 }) },
  p_dodge:  () => noise(0, 0.16, { vol: 0.3, hp: 2500 }),
  p_thorns: () => { tone(1800, 0, 0.05, { type: 'sawtooth', vol: 0.15 }); tone(1500, 0.05, 0.05, { type: 'sawtooth', vol: 0.15 }) },
  p_fire:   () => { noise(0, 0.45, { vol: 0.4, hp: 500 }); tone(200, 0, 0.4, { type: 'sawtooth', vol: 0.15, slide: 90 }) },
  p_cleave: () => { noise(0, 0.08, { vol: 0.35, hp: 3000 }); noise(0.1, 0.08, { vol: 0.35, hp: 3000 }) },
  p_buff:   () => { tone(523, 0, 0.2, { type: 'triangle', vol: 0.35, slide: 1047 }) },
  p_aim:    () => { tone(2000, 0, 0.03, { type: 'square', vol: 0.2 }); tone(2000, 0.08, 0.03, { type: 'square', vol: 0.2 }) },
  p_chain:  () => { for (let i = 0; i < 4; i++) tone(900 + (i % 2) * 500, i * 0.035, 0.04, { type: 'sawtooth', vol: 0.15 }) },
}

// กันเสียงเดียวกันยิงซ้อนถี่เกิน (โหมดเร่ง/หมัดลูกหลายหมัดในจังหวะเดียว) — ต่อชื่อ
const GAP_MS = 45
const lastAt = new Map()

/** เล่นเสียงตามชื่อ (opts ส่งต่อให้เสียงที่ปรับได้ เช่น hit_*) · ปิดเสียงอยู่/เบราว์เซอร์ไม่รองรับ = เงียบเฉยๆ ไม่ throw */
export function sfx(name, opts) {
  const play = SOUNDS[name]
  if (!play || !audio()) return
  const now = performance.now()
  if (now - (lastAt.get(name) || -1e9) < GAP_MS) return
  lastAt.set(name, now)
  try { play(opts) } catch { /* เสียงห้ามทำให้ฟีเจอร์พัง */ }
}

// เสียงกดปุ่มทั้งเว็บ — ผูกที่ document ทีเดียว (ไม่ต้องไล่ใส่ทุกปุ่ม)
// ข้ามปุ่มที่มีเสียงเฉพาะของตัวเองอยู่แล้ว (ใส่ data-sfx="none" หรือ data-sfx="<ชื่อ>")
export function installTapSound(root = document) {
  root.addEventListener('pointerdown', (e) => {
    const el = e.target?.closest?.('button, a[href], [role="button"], .btn')
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return
    const mode = el.dataset?.sfx
    if (mode === 'none') return
    sfx(mode && SOUNDS[mode] ? mode : 'tap')
  }, { passive: true, capture: true })
}
