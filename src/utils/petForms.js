// src/utils/petForms.js
// จุดเดียวที่ตอบว่า "ในทีมนี้ เพ็ทตัวนี้อยู่ในร่างไหน / นับเป็น rarity อะไร / ชื่อบนจออะไร / ฤดูอะไร"
// pure — เอนจิน (battlePassives) · ป้าย (battleBuffs) · รีเพลย์ · หน้าจัดทีม อ่านจากที่นี่ที่เดียว
// สเปก: docs/superpowers/specs/2026-09-26-pharmaverse-roadmap-design.md §3.1–3.2
//
// 🔑 ร่าง "องศา": ทีมมี ☀️ Sol และ 🌍 Earth แต่ไม่มี common เลย ⇒ Earth นับเป็น common (ได้บัฟ Sol)
//    แลกกับเสียสกิลฤดูกาลทั้งหมด · บนจอ Sol ชื่อ "ซัน" · Earth ชื่อ "องศา" (log/เอนจินแบกชื่อจริงเสมอ)

const ids = (team) => new Set((team || []).filter(Boolean).map(p => p.id))

export function degreeFormActive(team) {
  const list = (team || []).filter(Boolean)
  const has = ids(list)
  return has.has('sol') && has.has('earth') && !list.some(p => p.rarity === 'common')
}

export function effectiveRarity(pet, team) {
  if (pet?.id === 'earth' && degreeFormActive(team)) return 'common'
  return pet?.rarity || 'common'
}

const FORM_NAMES = { sol: 'ซัน', earth: 'องศา' }

export function displayName(petId, baseName, team) {
  if (FORM_NAMES[petId] && degreeFormActive(team)) return FORM_NAMES[petId]
  return baseName
}

/** ฤดูของ 🌍 ตามช่องในทีม (index = ลำดับออกตี) — ฤดูของไทย 3 ฤดูพอดีกับ 3 ช่อง */
export const SEASONS = [
  { key: 'hot', icon: '☀️', label: 'ฤดูร้อน' },
  { key: 'rain', icon: '🌧️', label: 'ฤดูฝน' },
  { key: 'cold', icon: '❄️', label: 'ฤดูหนาว' },
]
export const seasonOfSlot = (slot) => SEASONS[Math.max(0, Math.min(SEASONS.length - 1, slot | 0))]

/** ข้อความผลของฤดู (เลขมาจากค่าพาสสีฟตามขั้น — ห้ามพิมพ์เลขตรง) · ใช้ในแบนเนอร์ + หน้าดูบัฟ */
export function seasonText(key, v) {
  if (key === 'hot') return `จบรอบ: รอบหน้าทั้งทีมแรง +${v.hot}%`
  if (key === 'rain') return `จบรอบ: ทั้งทีมฟื้น ${v.rain}% ของเลือดที่หาย`
  return `จบรอบ: ศัตรูแต่ละตัว ${v.cold}% โดนแช่แข็ง 1 ตา`
}
/** effect ของ event ฤดู → key ใน SEASONS */
export const SEASON_OF_EFFECT = { seasonHot: 'hot', seasonRain: 'rain', seasonCold: 'cold' }

/** คู่ที่แบนเนอร์ขึ้นหน้าเพ็ทสองตัวชิดกัน — `when` คืน true เมื่อคู่ทำงานในทีมนั้น */
const DUO_FACES = [
  { ids: ['sol', 'earth'], when: degreeFormActive },
  { ids: ['whale', 'seal'], when: (team) => ['whale', 'seal'].every(id => ids(team).has(id)) },
]

export function duoPartnerOf(petId, team) {
  for (const d of DUO_FACES) {
    if (!d.ids.includes(petId) || !d.when(team)) continue
    return d.ids.find(id => id !== petId) || null
  }
  return null
}
