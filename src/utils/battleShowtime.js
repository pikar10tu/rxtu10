// src/utils/battleShowtime.js — ท่าโชว์ไทม์เฉพาะตัวของเลเจนด์ (pure: รับพิกัด คืนสคริปต์สไปรต์)
// ภาพอยู่ public/fx/<img>.webp (วาดจาก scripts/fx-art.mjs) · เล่นด้วย battlefx.showtime()
// 🔒 สไปรต์อยู่ในชั้น fx แยกจากการ์ด ⇒ ไม่แตะ paint ของการ์ดเลย (ข้อบังคับ v3) · transform/opacity ล้วน
//
// สเปกหนึ่งชิ้น: { img, ms, delay, ease, kf: [{ x, y, s, r, o, at }] }
//   x/y = พิกัดในกล่องไฟต์ (เดียวกับ fx.centerOf) · s = สเกล (ภาพฐาน 96px) · r = องศา · o = ความทึบ · at = offset 0..1

export const SHOWTIME_ART = ['flame', 'roar', 'wave', 'wings', 'feather', 'smash', 'claw', 'ouro', 'talon',
  'dream', 'smoke', 'quake', 'stone', 'sun', 'leaf', 'moon', 'star', 'aura', 'aura-pink', 'heart', 'ice', 'snow', 'drop', 'crescent', 'moonring']

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
  // 👾 เชื้อลุกลาม — ควันพิษม่วง "แตก" บนตัวที่ติดเชื้อตอนโดนใครก็ได้ในทีมไวรัสตี (infectBurst)
  //    owner = ตัวที่โดนตี · ไม่ได้พ่นจากไวรัส (29 ก.ย. user) · ชั้นเยอะ = ควันใหญ่ขึ้นนิดหน่อย
  virus: ({ owner, stacks = 1 }) => {
    const k = Math.min(1.5, 0.9 + stacks * 0.08)
    return [
      { img: 'smoke', ms: 560, delay: 0, ease: 'cubic-bezier(.2,.8,.3,1)',
        kf: [P(owner, .3 * k, 1, 0), P(owner, 1.1 * k, .85, 25, 0, -4, .4), P(owner, 1.45 * k, 0, 45, 0, -14)] },
      ...[[-26, -10], [24, -14], [-18, 18], [22, 16]].map(([dx, dy], i) => ({
        img: 'smoke', ms: 480, delay: 60 + i * 30, ease: 'ease-out',
        kf: [P(owner, .25, .9, 0), P(owner, .5 * k, 0, 70, dx * k, dy * k)] })),
    ]
  },
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

// 💗 คู่หู (รางวัลคนเก่ง 🐳🦭 · โลกเอียง ☀️🌍) — หัวใจลอยจากทั้งคู่มาเจอกันกลางทาง แล้วหัวใจเล็กลอยบนทีม
PLANS.duo = ({ owner, partner, team }) => {
  const p2 = partner || owner
  const mid = { x: (owner.x + p2.x) / 2, y: Math.min(owner.y, p2.y) - 30 }
  return [owner, p2].map((p, i) => ({ img: 'heart', ms: 560, delay: i * 80, ease: 'cubic-bezier(.3,.6,.4,1)',
    kf: [P(p, .3, 0), P(p, .6, 1, i ? 12 : -12, 0, -12, .3), P(mid, .75, 1, 0)] }))
    .concat({ img: 'heart', ms: 520, delay: 600, ease: 'cubic-bezier(.2,.8,.3,1)', kf: [P(mid, .8, 1), P(mid, 1.6, 0)] })
    .concat(team.slice(0, 4).map((p, i) => ({ img: 'heart', ms: 620, delay: 700 + i * 70, ease: 'ease-out',
      kf: [P(p, .2, 0, 0, 10, -6), P(p, .38, 1, -8, 12, -24, .4), P(p, .3, 0, 8, 16, -44)] })))
}

// 💗 คู่หูครั้งซ้ำ — หัวใจเล็กลอยเหนือหัวสองตัว ไม่รก
PLANS.duoSmall = ({ owner, partner }) => [owner, partner || owner].map((p, i) => ({
  img: 'heart', ms: 620, delay: i * 90, ease: 'ease-out',
  kf: [P(p, .15, 0, 0, 0, -30), P(p, .3, 1, i ? 8 : -8, 0, -42, .35), P(p, .25, 0, 0, 0, -58)] }))

// 🌍 สภาพอากาศเต็มจอตอนฤดูทำงาน (29 ก.ย. user: "จบรอบให้ดูรู้เรื่องว่าสกิลเอิร์ธทำงาน")
//    พิกัดอิงกล่องไฟต์ทั้งกล่อง ไม่ใช่การ์ด · สุ่มแบบกำหนดได้ (ไม่ใช้ Math.random ในแผน = เทสได้)
const spread = (n, w) => Array.from({ length: n }, (_, i) => ((i * 0.618 + 0.13) % 1) * w)
PLANS.weatherCold = ({ box }) => spread(12, box.w).map((x, i) => ({
  img: 'snow', ms: 1500, delay: (i % 6) * 110, ease: 'linear',
  kf: [{ x, y: -30, s: .22 + (i % 3) * .06, r: 0, o: 0 }, { x: x + 12, y: box.h * .3, s: .26 + (i % 3) * .06, r: 90, o: .95, at: .2 },
       { x: x - 10, y: box.h * .75, s: .26 + (i % 3) * .06, r: 200, o: .9, at: .75 }, { x: x + 6, y: box.h + 20, s: .22, r: 280, o: 0 }],
}))
PLANS.weatherRain = ({ box }) => spread(12, box.w).map((x, i) => ({
  img: 'drop', ms: 700, delay: (i % 6) * 90 + Math.floor(i / 6) * 260, ease: 'cubic-bezier(.5,0,.9,.6)',
  kf: [{ x, y: -30, s: .2, r: 0, o: 0 }, { x: x - 6, y: box.h * .25, s: .22, r: 0, o: .9, at: .2 }, { x: x - 22, y: box.h + 10, s: .24, r: 0, o: .7 }],
}))
PLANS.weatherHot = ({ box }) => {
  const top = { x: box.w / 2, y: -6 }
  return [{ img: 'sun', ms: 1300, delay: 0, ease: 'cubic-bezier(.2,.7,.3,1)', kf: [P(top, .8, 0, 0), P(top, 2.4, .85, 40, 0, 20, .35), P(top, 2.8, 0, 90, 0, 26)] }]
    .concat(spread(8, box.w).map((x, i) => ({ img: 'star', ms: 900, delay: 200 + i * 70, ease: 'ease-out',
      kf: [{ x, y: box.h * .9, s: .12, r: 0, o: 0 }, { x, y: box.h * .55, s: .22, r: 45, o: .9, at: .4 }, { x, y: box.h * .2, s: .1, r: 90, o: 0 }] })))
}

// 🌙 FULL MOON SHOT กระทบเป้า — เคียวจันทร์ฟาดเฉียง 2 เส้น + คลื่นแสงเงิน 2 ระลอก + จันทร์เต็มดวงแวบ + ดาวกระจาย
PLANS.moonHit = ({ owner }) => [
  { img: 'moon', ms: 520, delay: 0, ease: 'cubic-bezier(.2,.8,.3,1)', kf: [P(owner, .5, 0, -20), P(owner, 1.5, .9, 0, 0, 0, .3), P(owner, 1.8, 0, 10)] },
  { img: 'crescent', ms: 360, delay: 40, ease: 'cubic-bezier(.3,.8,.3,1)', kf: [P(owner, .9, 0, -60, -34, -30), P(owner, 1.5, 1, -35, 0, 0, .45), P(owner, 1.6, 0, -20, 26, 24)] },
  { img: 'crescent', ms: 360, delay: 140, ease: 'cubic-bezier(.3,.8,.3,1)', kf: [P(owner, .9, 0, 150, 34, -30), P(owner, 1.5, 1, 125, 0, 0, .45), P(owner, 1.6, 0, 110, -26, 24)] },
  { img: 'moonring', ms: 560, delay: 120, ease: 'cubic-bezier(.2,.7,.3,1)', kf: [P(owner, .3, 1), P(owner, 2.6, 0)] },
  { img: 'moonring', ms: 560, delay: 260, ease: 'cubic-bezier(.2,.7,.3,1)', kf: [P(owner, .3, .8), P(owner, 2, 0)] },
  ...[[-40, -30], [42, -26], [-36, 32], [38, 34], [0, -46]].map(([dx, dy], i) => ({
    img: 'star', ms: 520, delay: 160 + i * 30, ease: 'cubic-bezier(.2,.7,.4,1)', kf: [P(owner, .1, 1, 0), P(owner, .32, 0, 90, dx, dy)] })),
]

// ❄️ โดนแช่แข็ง — ผลึกน้ำแข็งงอกขึ้นคลุมการ์ด แล้วจางค้างนิดหนึ่ง
PLANS.freeze = ({ owner }) => [
  { img: 'ice', ms: 900, delay: 0, ease: 'cubic-bezier(.2,.9,.3,1)',
    kf: [P(owner, .3, 0, 0, 0, 16), P(owner, 1.05, .95, 0, 0, 4, .25), P(owner, 1.05, .8, 0, 0, 4, .75), P(owner, 1.1, 0, 0, 0, 4)] },
]
// ❄️ ตาที่ถูกข้าม — น้ำแข็งแตกกระจาย (ละลายหลุด)
PLANS.thaw = ({ owner }) => [
  { img: 'ice', ms: 380, delay: 0, ease: 'ease-out', kf: [P(owner, 1.05, .9, 0, 0, 4), P(owner, 1.2, 0, 0, 0, 4)] },
  ...[[-30, -20, -120], [30, -24, 130], [-24, 22, -200], [26, 24, 210]].map(([dx, dy, r], i) => ({
    img: 'ice', ms: 440, delay: 30 + i * 20, ease: 'cubic-bezier(.2,.7,.4,1)', kf: [P(owner, .3, 1), P(owner, .2, 0, r, dx, dy)] })),
]

// 🦣 เกราะหินแตกทีละชั้น — โล่หินแวบขึ้นแล้วแตกเป็นเศษกระเด็น 4 ทิศ
PLANS.shatter = ({ owner }) => [
  { img: 'stone', ms: 380, delay: 0, ease: 'ease-out', kf: [P(owner, .9, .95), P(owner, 1.15, 0, 8)] },
  ...[[-34, -26, -140], [32, -30, 150], [-28, 22, -200], [30, 26, 220]].map(([dx, dy, r], i) => ({
    img: 'stone', ms: 460, delay: 40 + i * 20, ease: 'cubic-bezier(.2,.7,.4,1)',
    kf: [P(owner, .3, 1, 0), P(owner, .22, 0, r, dx, dy)] })),
]
// 🦖 ครบทุก 5 ชั้น — รอยข่วนใหญ่บนตัว + วงคำรามแดง ("มันกำลังโหด")
PLANS.rage = ({ owner }) => [
  { img: 'roar', ms: 520, delay: 0, ease: 'ease-out', kf: [P(owner, .4, .9), P(owner, 2.2, 0)] },
  { img: 'claw', ms: 480, delay: 60, ease: 'cubic-bezier(.2,.9,.3,1)', kf: [P(owner, .6, 0, 0, -14, -14), P(owner, 1.1, 1, 0, 0, 0, .35), P(owner, 1.15, 0)] },
]

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
  virus: ['#86198f', '#3b0764'], duo: ['#be185d', '#831843'], gorilla: ['#92400e', '#451a03'], mammoth: ['#78716c', '#292524'],
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
// 🌍 ฤดูของเอิร์ธ — สีตามฤดู (29 ก.ย. user) มาก่อนสีประจำตัว
export const SEASON_TINT = { seasonHot: ['#c2410c', '#7c2d12'], seasonRain: ['#0369a1', '#1e3a8a'], seasonCold: ['#0e7490', '#164e63'] }
export function tintOf(petId, fxKind, effect) {
  return SEASON_TINT[effect] || PET_TINT[petId] || KIND_TINT[fxKind] || DEFAULT_TINT
}
