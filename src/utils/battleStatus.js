// 🧾 ตัวจัดการสถานะกลาง (ทะเบียน data/statuses.js · สเปก unknown-visitors §8.11–8.12)
// เก็บที่ ps.status[id] = { n, from, val } · ไม่ดึง rand() เลย ⇒ ลำดับสุ่มของไฟต์ไม่เลื่อน
// 🦠 infect / 🤍 spark ยังเก็บที่เดิม (ps.infect / ps.spark) — ที่นี่แตะแค่ตอนล้าง
import { STATUSES, statusDef } from '../data/statuses.js'

const psOf = (u) => (u.ps || (u.ps = {}))
const stOf = (u) => { const ps = psOf(u); return ps.status || (ps.status = {}) }

export const statusN = (u, id) => u?.ps?.status?.[id]?.n || 0
export const isImmune = (u, id) => !!u?.immune?.includes(id)

/** แปะสถานะ · คืน { ok, n, immune } — n = ชั้น/ตาที่เหลือหลังแปะ
 *  from = ตัวที่แปะ (นับเป็นคนฆ่าถ้าตายจากสถานะนี้) · val = ค่าที่ล็อกตอนแปะ (พิษ/หวาดกลัว) */
export function applyStatus(u, id, { n, from = null, val } = {}) {
  const d = statusDef(id)
  if (!d || d.legacy || !u || u.hp <= 0) return { ok: false, n: 0 }
  if (isImmune(u, id)) return { ok: false, n: 0, immune: true }
  const add = n ?? d.turns ?? 1
  const st = stOf(u)
  const cur = st[id]
  let next
  if (!cur || cur.n <= 0) next = add
  else if (d.stack === 'none') return { ok: false, n: cur.n }
  else if (d.stack === 'refresh') next = Math.max(cur.n, add)
  else next = cur.n + add
  if (d.max) next = Math.min(d.max, next)
  st[id] = { n: next, from: from ?? cur?.from ?? null, val: val ?? cur?.val }
  return { ok: true, n: next }
}

const dropIfEmpty = (st, id) => { if (st[id] && st[id].n <= 0) delete st[id] }

/** สถานะข้ามตาที่ติดอยู่ (ลำดับตามทะเบียน — ตัวแรก = ป้ายหลักบนจอ) */
export const skipIds = (u) => Object.keys(STATUSES).filter(id => STATUSES[id].skip && statusN(u, id) > 0)

/** ตาที่ถูกข้าม: ลดสถานะข้ามตาทุกตัวตัวละ 1 (user เคาะ 27 ต.ค.) · 😱 หักเลือดตัวเองตาม val
 *  คืน null ถ้าไม่ได้ถูกข้าม · { id, left: {id: เหลือ}, selfDmg, dmgFrom } */
export function consumeSkip(u) {
  const ids = skipIds(u)
  if (!ids.length) return null
  const st = stOf(u), left = {}
  let selfDmg = 0, dmgFrom = null
  for (const id of ids) {
    if (STATUSES[id].skipDmg && st[id].val > 0) { selfDmg += st[id].val; dmgFrom = dmgFrom || st[id].from }
    st[id].n -= 1
    left[id] = st[id].n
    dropIfEmpty(st, id)
  }
  return { id: ids[0], left, selfDmg, dmgFrom }
}

/** ท้ายตา: ดาเมจต่อเนื่อง/ฟื้นต่อเนื่อง แล้วลดอายุสถานะที่ decay (ไม่รวมข้ามตา)
 *  ไม่หักเลือดเอง — คืนรายการให้เอนจินหัก (เอนจินต้องตัดสินตาย/คนฆ่าเอง)
 *  คืน [{ id, dmg?, heal?, from, left }] */
export function turnEndTicks(u) {
  const st = u?.ps?.status
  if (!st) return []
  const out = []
  for (const id of Object.keys(STATUSES)) {
    const d = STATUSES[id], s = st[id]
    if (!s || s.n <= 0 || d.skip) continue
    const row = { id, from: s.from }
    if (d.tick === 'turnEnd') {
      if (d.pctMaxHp) row.dmg = u.maxHp * d.pctMaxHp / 100 * s.n
      else if (d.atkPct && d.kind === 'debuff') row.dmg = s.val || 0
      if (d.healPctMaxHp) row.heal = u.maxHp * d.healPctMaxHp / 100
    }
    if (d.decay) { s.n -= d.decay; row.left = Math.max(0, s.n); dropIfEmpty(st, id) }
    if (row.dmg || row.heal || d.tick === 'turnEnd') out.push(row)
  }
  return out
}

/** ตัวคูณพลังโจมตีจากสถานะ (🥀 อ่อนแรง · 💪 ฮึด) — poison ใช้ atkPct เป็นสูตรดาเมจ ไม่ใช่ตัวคูณ */
export function statusAtkMult(u) {
  let m = 1
  for (const id of ['weaken', 'rally']) if (statusN(u, id) > 0) m *= 1 + STATUSES[id].atkPct / 100
  return m
}

/** ตัวคูณดาเมจที่รับ (💔 เกราะแตก × ชั้น) */
export const statusDmgTakenMult = (u) => 1 + (STATUSES.armorBreak.dmgTakenPct / 100) * statusN(u, 'armorBreak')

export const canHeal = (u) => statusN(u, 'healBlock') <= 0

const debuffIds = () => Object.keys(STATUSES).filter(id => STATUSES[id].kind === 'debuff')

/** 🦄 ลดสถานะร้ายตัวละ 1 · คืน { id: เหลือ } ของที่ลดจริง */
export function cleanseOne(u) {
  const ps = psOf(u), left = {}
  for (const id of debuffIds()) {
    if (id === 'infect') { if (ps.infect?.n > 0) { ps.infect.n -= 1; left.infect = ps.infect.n; if (!ps.infect.n) delete ps.infect } continue }
    if (id === 'spark') { if (ps.spark > 0) { ps.spark -= 1; left.spark = ps.spark } continue }
    const s = ps.status?.[id]
    if (s?.n > 0) { s.n -= 1; left[id] = s.n; dropIfEmpty(ps.status, id) }
  }
  return left
}

/** ☄️ ล้างสถานะร้ายทั้งหมด · คืนรายการ id ที่ถูกล้าง */
export function cleanseAll(u) {
  const ps = psOf(u), gone = []
  for (const id of debuffIds()) {
    if (id === 'infect') { if (ps.infect?.n > 0) { delete ps.infect; gone.push(id) } continue }
    if (id === 'spark') { if (ps.spark > 0) { ps.spark = 0; gone.push(id) } continue }
    if (ps.status?.[id]?.n > 0) { delete ps.status[id]; gone.push(id) }
  }
  return gone
}

/** ตาย = ล้างทุกสถานะในทะเบียน (🦠 ย้ายตามกติกาเดิมของ onAnyDeath ไม่แตะที่นี่) */
export function clearOnDeath(u) { if (u?.ps?.status) u.ps.status = {} }

/** จำนวน "ชนิด" สถานะร้ายที่ติดอยู่ (☄️ เลือกเป้า) — รวม 🦠 🤍 ของเดิม */
export function debuffCount(u) {
  let n = 0
  for (const id of debuffIds()) {
    if (id === 'infect') { if (u?.ps?.infect?.n > 0) n++; continue }
    if (id === 'spark') { if (u?.ps?.spark > 0) n++; continue }
    if (statusN(u, id) > 0) n++
  }
  return n
}

/** ☄️ โล่พร: ลดดาเมจหมัดนี้ แล้วใช้หมด · คืน { dmg, used } */
export function consumeBlessShield(u, dmg) {
  const s = u?.ps?.status?.blessShield
  if (!s || s.n <= 0 || !(dmg > 0)) return { dmg, used: false }
  delete u.ps.status.blessShield
  return { dmg: dmg * (1 - (s.val || 0) / 100), used: true }
}
