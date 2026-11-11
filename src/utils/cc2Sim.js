// สุ่มชุดสถานี CC2 OSPE (เดี่ยว/16 สถานี) — pure ใช้ร่วม Cc2SimView.vue
// สัญญา: docs/superpowers/specs/2026-11-11-cc2-step3-contracts.md
// กฎที่ต้องคุม: หมวดตามสัดส่วนที่ตั้ง (ค่าเริ่ม Clinic 8 / Product 6 / SAP 2) ·
//   กรุ๊ป (group) ซ้ำได้ไม่เกิน 2 สถานีต่อชุด (นับรวมทุกหมวด) · topic ไม่ซ้ำกันในชุด ·
//   ข้ามเคส mode rest/free จากพูลหลักเสมอ (free = เคสต่อเนื่องหลายสถานี ไม่เหมาะสุ่มเดี่ยว) ·
//   สถานีพัก (mode==='rest') แทรกเพิ่มได้ตามจำนวนที่ตั้ง กระจายเท่าๆ กันในชุด
// seed ใส่ได้เพื่อเทสซ้ำผลเดิม (ไม่ใส่ = สุ่มจริงทุกครั้งด้วย Math.random)

export const DEFAULT_RATIO = { Clinic: 8, Product: 6, SAP: 2 }

// mulberry32-style seeded PRNG เล็ก — พอสำหรับสุ่มชุดสถานี ไม่ใช่งานความปลอดภัย
function seededRng(seed) {
  const s = String(seed ?? '')
  let h = 1779033703 ^ s.length
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return function rng() {
    h = Math.imul(h ^ (h >>> 16), 2246822519)
    h = Math.imul(h ^ (h >>> 13), 3266489917)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

function shuffle(arr, rng) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const normTopic = (t) => String(t ?? '').trim().toLowerCase()

// พูลหลัก: ตัด rest/free ออกเสมอ + กรองกลุ่ม/แหล่งที่มาถ้าตั้งไว้
function basePool(cases, { groups, sources } = {}) {
  return (cases || []).filter((c) => {
    if (c.mode === 'rest' || c.mode === 'free') return false
    if (groups?.length && !groups.includes(c.group)) return false
    if (sources?.length && !sources.includes(c.source)) return false
    return true
  })
}

// เลือก n สถานีจาก candidates โดยคุมกฎ group<=2 / topic ไม่ซ้ำ (เทียบกับที่เลือกไปแล้วทุกหมวด)
// relax ผ่อนกฎทีละขั้นเมื่อพูลไม่พอ กันเลือกได้น้อยกว่าที่ขอโดยไม่จำเป็น (เช่นตัวกรองแคบมาก)
function pickN(candidates, n, { groupCount, usedTopics }, rng) {
  const picked = []
  for (const relax of [0, 1, 2]) {
    const pool = shuffle(candidates.filter((c) => !picked.includes(c)), rng)
    for (const c of pool) {
      if (picked.length >= n) break
      const g = c.group
      const t = normTopic(c.topic)
      const groupOk = relax >= 2 || (groupCount.get(g) || 0) < 2
      const topicOk = relax >= 1 || !t || !usedTopics.has(t)
      if (!groupOk || !topicOk) continue
      picked.push(c)
      groupCount.set(g, (groupCount.get(g) || 0) + 1)
      if (t) usedTopics.add(t)
    }
    if (picked.length >= n) break
  }
  return picked.slice(0, n)
}

/**
 * สุ่มชุดสถานี CC2 OSPE
 * @param {Array} cases - index.cases ทั้งหมด (จาก loadCc2Index())
 * @param {Object} [opts]
 * @param {Object} [opts.ratio] - {Clinic, Product, SAP} จำนวนสถานีจริงต่อหมวด (ค่าเริ่ม 8/6/2)
 * @param {number} [opts.restCount] - จำนวนสถานีพักแทรกเพิ่ม (ค่าเริ่ม 0)
 * @param {string[]} [opts.groups] - กรองเฉพาะ group เหล่านี้ (ไม่ใส่ = ไม่กรอง)
 * @param {string[]} [opts.sources] - กรองเฉพาะ source เหล่านี้ (ไม่ใส่ = ไม่กรอง)
 * @param {string|number} [opts.seed] - ทำผลซ้ำได้ (ไม่ใส่ = สุ่มจริง)
 * @returns {{ stations: Array, warnings: string[] }}
 */
export function pickCc2Set(cases, opts = {}) {
  const { ratio = DEFAULT_RATIO, restCount = 0, groups = null, sources = null, seed = null } = opts
  const rng = seed != null ? seededRng(seed) : Math.random
  const pool = basePool(cases, { groups, sources })
  const warnings = []
  const groupCount = new Map()
  const usedTopics = new Set()
  let stations = []

  for (const cat of Object.keys(ratio)) {
    const need = ratio[cat] || 0
    if (!need) continue
    const candidates = pool.filter((c) => c.cat === cat)
    const got = pickN(candidates, need, { groupCount, usedTopics }, rng)
    if (got.length < need) warnings.push(`${cat}: ได้ ${got.length}/${need} สถานี (คลังในหมวด/ตัวกรองนี้ไม่พอ)`)
    stations.push(...got)
  }
  stations = shuffle(stations, rng)

  // แทรกสถานีพัก (mode==='rest', ไม่ผ่านตัวกรองกลุ่ม/แหล่งที่มา เพราะเป็นสถานีว่างเสมอ) กระจายเท่าๆ กันในชุด
  if (restCount > 0) {
    const restPool = shuffle((cases || []).filter((c) => c.mode === 'rest'), rng)
    const rests = restPool.slice(0, restCount)
    if (rests.length < restCount) warnings.push(`พัก: ได้ ${rests.length}/${restCount} สถานี (คลังสถานีพักไม่พอ)`)
    const span = stations.length / (rests.length + 1)
    rests.forEach((r, i) => {
      const pos = Math.min(Math.round(span * (i + 1)) + i, stations.length)
      stations.splice(pos, 0, r)
    })
  }

  return { stations, warnings }
}

export const totalRealStations = (ratio = DEFAULT_RATIO) => Object.values(ratio).reduce((a, b) => a + (b || 0), 0)
