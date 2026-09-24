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
