// src/utils/battleShowtime.js — ท่าโชว์ไทม์เฉพาะตัวของเลเจนด์ (pure: รับพิกัด คืนสคริปต์สไปรต์)
// ภาพอยู่ public/fx/<img>.webp (วาดจาก scripts/fx-art.mjs) · เล่นด้วย battlefx.showtime()
// 🔒 สไปรต์อยู่ในชั้น fx แยกจากการ์ด ⇒ ไม่แตะ paint ของการ์ดเลย (ข้อบังคับ v3) · transform/opacity ล้วน
//
// สเปกหนึ่งชิ้น: { img, ms, delay, ease, kf: [{ x, y, s, r, o, at }] }
//   x/y = พิกัดในกล่องไฟต์ (เดียวกับ fx.centerOf) · s = สเกล (ภาพฐาน 96px) · r = องศา · o = ความทึบ · at = offset 0..1

export const SHOWTIME_ART = ['flame', 'roar', 'wave', 'wings', 'feather', 'smash', 'claw', 'ouro', 'talon',
  'dream', 'smoke', 'quake', 'stone', 'sun', 'leaf', 'moon', 'star']

/** เพดานสไปรต์ต่อโชว์ — ต้อง ≤ ขนาดพูลใน battlefx (กันยึดชิ้นที่ยังเล่นอยู่) */
export const SHOWTIME_MAX = 12

const deg = (a, b) => Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI
const P = (p, s = 1, o = 1, r = 0, dx = 0, dy = 0, at) => ({ x: p.x + dx, y: p.y + dy, s, r, o, ...(at != null ? { at } : {}) })

// ดาวประกายเล็กๆ บนตัวที่ได้ผล — ตัวปิดท้ายร่วมของหลายท่า
const sparkle = (list, delay = 0, stagger = 70) => list.map((p, i) => ({
  img: 'star', ms: 420, delay: delay + i * stagger, ease: 'ease-out',
  kf: [P(p, .15, 0, 0, 14, -18), P(p, .5, 1, 45, 14, -18, .4), P(p, .2, 0, 90, 14, -30)],
}))

const PLANS = {
  // 🐉 ลมหายใจราชัน — สายไฟพุ่งจากบาฮามุทไปศัตรูทุกตัว แล้วไฟลุกบนการ์ด
  bahamut: ({ owner, foes }) => foes.flatMap((f, i) => {
    const r = deg(owner, f) + 90   // ภาพเปลวชี้ขึ้น → หมุนให้ปลายชี้ทางที่พุ่ง
    const d = i * 90
    return [
      { img: 'flame', ms: 320, delay: d, ease: 'cubic-bezier(.4,0,.8,.6)',
        kf: [P(owner, .35, .9, r), P(f, .9, 1, r)] },
      { img: 'flame', ms: 620, delay: d + 300, ease: 'ease-out',
        kf: [P(f, .5, 1, 0, 0, 6), P(f, 1.25, 1, -6, 0, -6, .35), P(f, 1.05, 0, 4, 0, -18)] },
    ]
  }),
  // 🦁 อาณัติเจ้าป่า — คลื่นคำรามสองระลอก แล้วประกายบนทีม
  lion: ({ owner, team }) => [0, 170].map(d => ({
    img: 'roar', ms: 640, delay: d, ease: 'cubic-bezier(.2,.7,.3,1)', kf: [P(owner, .3, 1), P(owner, 3.2, 0)],
  })).concat(sparkle(team, 260)),
  // 🐳 อ้อมกอดเบลูก้า — คลื่นกวาดผ่านทีมจากซ้ายไปขวา
  whale: ({ team }) => {
    const xs = team.map(p => p.x), y = team.reduce((a, p) => a + p.y, 0) / (team.length || 1)
    const a = { x: Math.min(...xs) - 70, y }, b = { x: Math.max(...xs) + 70, y }
    return [{ img: 'wave', ms: 760, delay: 0, ease: 'cubic-bezier(.3,.1,.4,1)',
      kf: [P(a, .9, 0), P(a, 1.25, 1, 0, 30, 0, .18), P(b, 1.25, 1, 0, -30, 0, .8), P(b, 1, 0)] }]
      .concat(sparkle(team, 320))
  },
  // 🐦‍🔥 เกิดใหม่จากเถ้า — ปีกไฟกาง + ขนไฟลอยขึ้น
  phoenix: ({ owner }) => [
    { img: 'wings', ms: 820, delay: 0, ease: 'cubic-bezier(.2,.8,.3,1)',
      kf: [P(owner, .4, 0, 0, 0, 4), P(owner, 1.7, .95, 0, 0, -6, .4), P(owner, 1.9, 0, 0, 0, -12)] },
    ...[-26, -8, 10, 28].map((dx, i) => ({ img: 'feather', ms: 700, delay: 140 + i * 60, ease: 'ease-out',
      kf: [P(owner, .3, 0, dx, dx * .3, 10), P(owner, .45, 1, dx * .6, dx, -20, .3), P(owner, .35, 0, -dx, dx * 1.4, -62)] })),
  ],
  // 👹 ง้างตะบองฟาด — ฟ้าผ่าลงตรงตัว (ชาร์จพลัง)
  kirin: ({ owner }) => [
    { img: 'smash', ms: 360, delay: 0, ease: 'cubic-bezier(.6,0,.9,.5)', kf: [P(owner, .8, 0, 0, 6, -90), P(owner, 1.2, 1, 0, 0, -8)] },
    { img: 'roar', ms: 480, delay: 330, ease: 'ease-out', kf: [P(owner, .3, 1), P(owner, 1.8, 0)] },
    { img: 'smash', ms: 420, delay: 330, ease: 'ease-out', kf: [P(owner, 1.2, 1, 0, 0, -8), P(owner, 1.3, 0, 0, 0, -8)] },
  ],
  // 🦖 สัญชาตญาณนักล่า — รอยข่วนแดงฉีกบนเป้า (ไม่มีเป้า = หน้าตัวเอง)
  trex: ({ owner, targets }) => (targets.length ? targets : [owner]).slice(0, 3).map((t, i) => ({
    img: 'claw', ms: 520, delay: i * 80, ease: 'cubic-bezier(.2,.9,.3,1)',
    kf: [P(t, .6, 0, 0, -18, -18), P(t, 1.2, 1, 0, 0, 0, .3), P(t, 1.25, 0, 0, 4, 4)],
  })),
  // 🐍 วัฏจักรนิรันดร์ — วงงูหมุนรอบตัวครบรอบ
  ouroboros: ({ owner }) => [{ img: 'ouro', ms: 900, delay: 0, ease: 'cubic-bezier(.3,.6,.4,1)',
    kf: [P(owner, .5, 0, -90), P(owner, 1.25, 1, 90, 0, 0, .35), P(owner, 1.35, 1, 240, 0, 0, .75), P(owner, 1.5, 0, 300)] }],
  // 🦅 โฉบเด็ดชีพ — เคียวลมโฉบลงจากฟ้าเข้าเป้า
  simurgh: ({ owner, targets, box }) => {
    const t = targets[0] || owner
    const from = { x: t.x - box.w * .45, y: t.y - box.h * .4 }
    return [{ img: 'talon', ms: 460, delay: 0, ease: 'cubic-bezier(.5,0,.7,1)',
      kf: [P(from, .7, 0), P(from, .9, 1, 0, 20, 20, .2), P(t, 1.4, 1, 0, 0, 0, .8), P(t, 1.5, 0)] }]
      .concat(sparkle([t], 380))
  },
  // 🐘 กลืนกินฝันร้าย — ฟองฝันคลุมทีม
  qilin: ({ team }) => team.map((p, i) => ({ img: 'dream', ms: 760, delay: i * 90, ease: 'cubic-bezier(.2,.8,.3,1)',
    kf: [P(p, .3, 0), P(p, 1.15, .85, 0, 0, 0, .35), P(p, 1.2, .7, 0, 0, 0, .7), P(p, 1.35, 0)] })),
  // 👾 เชื้อลุกลาม — ควันพิษม่วงระเบิดที่จุดกระทบ แล้วฟุ้งไปติดศัตรูทุกตัว (29 ก.ย. user)
  //    owner = "จุดกระทบ" (ตัวที่โดนหมัดไวรัส) ไม่ใช่ตัวไวรัส — BattleReplay เลื่อนมาเล่นตอน impact
  virus: ({ owner, targets }) => [
    { img: 'smoke', ms: 620, delay: 0, ease: 'cubic-bezier(.2,.8,.3,1)',
      kf: [P(owner, .35, .95, 0), P(owner, 1.35, .85, 20, 0, 0, .4), P(owner, 1.7, 0, 40, 0, -10)] },
    ...targets.filter(t => t !== owner).slice(0, 4).flatMap((t, i) => [
      { img: 'smoke', ms: 420, delay: 90 + i * 60, ease: 'cubic-bezier(.3,.3,.4,1)',
        kf: [P(owner, .35, .9, 0), P(t, .7, .9, 60)] },
      { img: 'smoke', ms: 460, delay: 490 + i * 60, ease: 'ease-out',
        kf: [P(t, .7, .9, 60), P(t, 1.2, 0, 100, 0, -8)] },
    ]),
  ],
  // 🦍 ตีอกท้าชน — พื้นสะเทือน + คลื่นกระแทก
  gorilla: ({ owner }) => [
    { img: 'quake', ms: 620, delay: 0, ease: 'cubic-bezier(.2,.8,.3,1)', kf: [P(owner, .5, 1, 0, 0, 22), P(owner, 2, 0, 0, 0, 26)] },
    { img: 'roar', ms: 520, delay: 80, ease: 'ease-out', kf: [P(owner, .3, .9), P(owner, 2.2, 0)] },
    { img: 'roar', ms: 520, delay: 260, ease: 'ease-out', kf: [P(owner, .3, .9), P(owner, 2.2, 0)] },
  ],
  // 🦣 เกราะปฐพี — โล่หินกระแทกลงหน้าตัว
  mammoth: ({ owner }) => [
    { img: 'stone', ms: 700, delay: 0, ease: 'cubic-bezier(.6,0,.4,1.4)',
      kf: [P(owner, 1.6, 0, 0, 0, -70), P(owner, 1.05, 1, 0, 0, 0, .35), P(owner, 1.05, 1, 0, 0, 0, .75), P(owner, 1.1, 0)] },
    { img: 'quake', ms: 520, delay: 240, ease: 'ease-out', kf: [P(owner, .6, 1, 0, 0, 24), P(owner, 1.6, 0, 0, 0, 26)] },
  ],
  // ☀️ แสงนำทาง — ดวงอาทิตย์หมุนขึ้นหลังตัว แล้วแสงตกลงทีม
  sol: ({ owner, team }) => [{ img: 'sun', ms: 900, delay: 0, ease: 'cubic-bezier(.2,.7,.3,1)',
    kf: [P(owner, .4, 0, 0, 0, -10), P(owner, 1.8, 1, 60, 0, -14, .4), P(owner, 2.1, 0, 140, 0, -18)] }]
    .concat(sparkle(team, 300)),
  // 🌍 ฤดูกาลหมุนเวียน — ใบไม้หมุนวนรอบทีม
  earth: ({ team }) => team.flatMap((p, i) => [0, 1].map(k => ({
    img: 'leaf', ms: 780, delay: i * 70 + k * 160, ease: 'ease-in-out',
    kf: [P(p, .3, 0, 0, -30 + k * 60, -26), P(p, .45, 1, 160, 24 - k * 48, -6, .5), P(p, .3, 0, 320, -10 + k * 20, 26)],
  }))).slice(0, SHOWTIME_MAX),
  // 🌙 ข้างขึ้นข้างแรม — จันทร์ลอยขึ้นเหนือหัว
  luna: ({ owner }) => [
    { img: 'moon', ms: 900, delay: 0, ease: 'cubic-bezier(.2,.7,.3,1)',
      kf: [P(owner, .5, 0, -20, 0, 10), P(owner, 1.2, 1, 0, 0, -30, .45), P(owner, 1.25, 0, 10, 0, -48)] },
    ...sparkle([owner, owner], 300, 140),
  ],
}

/** เพ็ทตัวนี้มีท่าโชว์ไทม์ของตัวเองไหม */
export const hasShowtime = (petId) => !!PLANS[petId]

/**
 * สคริปต์สไปรต์ของโชว์ไทม์ — คืน [] เมื่อไม่มีท่า/ไม่มีพิกัด
 * @param {string} petId
 * @param {{owner:{x,y}, team:{x,y}[], foes:{x,y}[], targets:{x,y}[], box:{w,h}}} ctx
 */
export function showtimePlan(petId, ctx) {
  const plan = PLANS[petId]
  if (!plan || !ctx?.owner) return []
  const c = { team: [], foes: [], targets: [], box: { w: 360, h: 560 }, ...ctx }
  if (!c.team.length) c.team = [c.owner]
  return plan(c).slice(0, SHOWTIME_MAX)
}

// ── สีแบนเนอร์ตามท่า (29 ก.ย. user: "เอาสีที่เหมาะกับท่านั้นๆ") ──
// [a, b] = ไล่สีจากฝั่งหน้าเพ็ทไปปลายแถบ · ตัวอักษรขาวเสมอ ⇒ ทุกสีต้องเข้มพอให้ขาวอ่านออก (contrast ≥ 4.5 — เทสคุม)
// ฝั่งทีมบอกด้วยทิศที่แถบพุ่งเข้า (ซ้าย=เรา ขวา=ศัตรู) ไม่ใช่สีแล้ว
export const PET_TINT = {
  bahamut: ['#c2410c', '#7f1d1d'], lion: ['#a16207', '#78350f'], whale: ['#0369a1', '#1e3a8a'],
  phoenix: ['#c2410c', '#9f1239'], kirin: ['#b91c1c', '#450a0a'], trex: ['#9a3412', '#3f1d0b'],
  ouroboros: ['#15803d', '#14532d'], simurgh: ['#0e7490', '#164e63'], qilin: ['#7e22ce', '#3b0764'],
  virus: ['#86198f', '#3b0764'], gorilla: ['#92400e', '#451a03'], mammoth: ['#78716c', '#292524'],
  sol: ['#b45309', '#7c2d12'], earth: ['#15803d', '#1e3a8a'], luna: ['#4338ca', '#1e1b4b'],
}
export const KIND_TINT = {
  heal: ['#15803d', '#14532d'], revive: ['#b45309', '#7c2d12'], guard: ['#6d28d9', '#2e1065'],
  damage: ['#b91c1c', '#450a0a'], thorns: ['#9f1239', '#4c0519'], debuff: ['#4d7c0f', '#1a2e05'],
  buff: ['#b45309', '#78350f'], dodge: ['#0369a1', '#0c4a6e'], windup: ['#b91c1c', '#450a0a'],
  chain: ['#b91c1c', '#1c1917'], moon: ['#4338ca', '#1e1b4b'], fullMoon: ['#4338ca', '#1e1b4b'],
  aura: ['#0f766e', '#134e4a'],
}
const DEFAULT_TINT = ['#334155', '#0f172a']
/** สีแถบของสกิลนี้ — เลเจนด์ใช้สีประจำตัว · ตัวอื่นตามชนิดผล */
export function tintOf(petId, fxKind) {
  return PET_TINT[petId] || KIND_TINT[fxKind] || DEFAULT_TINT
}
