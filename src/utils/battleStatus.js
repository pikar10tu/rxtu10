// 🧾 ตัวจัดการสถานะกลาง (ทะเบียน data/statuses.js · กติกากลาง user เคาะ 28 ต.ค. 2026 สเปก §8.17)
// เก็บที่ ps.status[id] = [{ n, from, val }, ...] — 1 รายการ = 1 "ก้อน" · n = เทิร์นที่เหลือของก้อนนั้น
// 🦠 infect / 🤍 spark (ป้ายนับ) ยังเก็บที่เดิม (ps.infect / ps.spark) — ที่นี่แตะแค่ตอนล้าง/นับ
// ไม่ดึง rand() เลย ⇒ ลำดับสุ่มของไฟต์ไม่เลื่อน ("สุ่มล้าง" ใช้ตัวเลือกแบบกำหนดได้จากสภาพไฟต์ ดู pickIndex)
import { STATUSES, statusDef } from '../data/statuses.js'

const psOf = (u) => (u.ps || (u.ps = {}))
const stOf = (u) => { const ps = psOf(u); return ps.status || (ps.status = {}) }
const listOf = (u, id) => { const l = u?.ps?.status?.[id]; return Array.isArray(l) ? l : [] }

/** เทิร์นที่เหลือของก้อนที่อยู่นานสุด (เลขบนป้าย) · 0 = ไม่ติด */
export const statusN = (u, id) => listOf(u, id).reduce((m, s) => Math.max(m, s.n), 0)
/** จำนวนก้อนที่ติดอยู่ */
export const statusCount = (u, id) => listOf(u, id).filter(s => s.n > 0).length
export const isImmune = (u, id) => !!u?.immune?.includes(id)

/** แปะสถานะ 1 ก้อน · คืน { ok, n, inst, immune } — n = เลขบนป้ายหลังแปะ · inst = จำนวนก้อน
 *  from = ตัวที่แปะ (นับเป็นคนฆ่าถ้าก้อนนี้ทำให้ตาย) · val = แรงที่ล็อกตอนแปะ */
export function applyStatus(u, id, { n, from = null, val } = {}) {
  const d = statusDef(id)
  if (!d || d.legacy || !u || u.hp <= 0) return { ok: false, n: 0 }
  if (isImmune(u, id)) return { ok: false, n: 0, immune: true }
  const turns = n ?? d.turns ?? 1
  const st = stOf(u)
  const list = (st[id] = listOf(u, id).filter(s => s.n > 0))
  if (d.single && list.length) {
    // ก้อนเดียว: เลือกก้อนที่ยาวกว่า (กันโดนแช่ยาว) · ยาวกว่า = เปลี่ยนเจ้าของ/แรงตามก้อนใหม่
    if (turns > list[0].n) list[0] = { n: turns, from, val }
  } else {
    list.push({ n: turns, from, val })
    // เกินเพดาน = ทิ้งก้อนที่เหลือเทิร์นน้อยสุด
    if (d.maxInst && list.length > d.maxInst) { list.sort((a, b) => b.n - a.n); list.length = d.maxInst }
  }
  return { ok: true, n: statusN(u, id), inst: list.length }
}

const prune = (st, id) => { if (st[id]) { st[id] = st[id].filter(s => s.n > 0); if (!st[id].length) delete st[id] } }

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
    for (const s of st[id]) {
      if (s.n <= 0) continue
      if (STATUSES[id].skipDmg && s.val > 0) { selfDmg += s.val; dmgFrom = dmgFrom || s.from }
      s.n -= 1
    }
    prune(st, id)
    left[id] = statusN(u, id)
  }
  return { id: ids[0], left, selfDmg, dmgFrom }
}

/** ท้ายตา: ทุกก้อนที่ไม่ใช่ข้ามตา ทำงาน (ดาเมจ/ฟื้น) แล้วเทิร์นลด 1
 *  ไม่หักเลือดเอง — คืนรายการให้เอนจินหักทีละก้อนตามลำดับก้อนเก่า→ใหม่ (ก้อนสุดท้ายที่ทำให้ตาย = คนฆ่า)
 *  คืน [{ id, dmg?, heal?, from, left }] · left = เลขบนป้ายหลังลด */
export function turnEndTicks(u) {
  const st = u?.ps?.status
  if (!st) return []
  const out = []
  for (const id of Object.keys(STATUSES)) {
    const d = STATUSES[id]
    if (d.skip || d.legacy || !Array.isArray(st[id])) continue
    const rows = []
    for (const s of st[id]) {
      if (s.n <= 0) continue
      const row = { id, from: s.from }
      if (d.tick === 'turnEnd') {
        if (d.pctMaxHp) row.dmg = u.maxHp * d.pctMaxHp / 100
        else if (d.atkPct && d.kind === 'debuff') row.dmg = s.val || 0
        if (d.healPctMaxHp) row.heal = u.maxHp * d.healPctMaxHp / 100
      }
      s.n -= 1
      rows.push(row)
    }
    prune(st, id)
    const left = statusN(u, id), inst = statusCount(u, id)
    for (const r of rows) { r.left = left; r.inst = inst }
    if (d.tick === 'turnEnd') out.push(...rows)
  }
  return out
}

/** ตัวคูณพลังโจมตีจากสถานะ (🥀 อ่อนแรง · 💪 ฮึด) ต่อก้อน — poison ใช้ atkPct เป็นสูตรดาเมจ ไม่ใช่ตัวคูณ */
export function statusAtkMult(u) {
  let m = 1
  for (const id of ['weaken', 'rally']) m *= Math.pow(1 + STATUSES[id].atkPct / 100, statusCount(u, id))
  return m
}

/** ตัวคูณดาเมจที่รับ (💔 เกราะแตก ต่อก้อน) */
export const statusDmgTakenMult = (u) => 1 + (STATUSES.armorBreak.dmgTakenPct / 100) * statusCount(u, 'armorBreak')

export const canHeal = (u) => statusN(u, 'healBlock') <= 0

const debuffIds = () => Object.keys(STATUSES).filter(id => STATUSES[id].kind === 'debuff' && STATUSES[id].cleansable !== false)  // ล้าง/นับเป้าล้าง เฉพาะที่ล้างได้

/** "สุ่ม" แบบไม่ดึง rand — เลือกจากสภาพไฟต์ (เลือดปัจจุบัน) ⇒ ผลเปลี่ยนตามไฟต์ แต่ลำดับสุ่มของไฟต์ไม่เลื่อน */
const pickIndex = (u, len) => (Math.floor(u?.hp || 0) % len + len) % len

/** 🦄 🦋 ล้าง 1: สถานะร้ายแต่ละชนิด ล้างออก 1 ก้อน (สุ่ม ไม่ว่าเหลือกี่เทิร์น) · ป้ายนับ = หายทั้งก้อน
 *  คืน { id: เลขบนป้ายที่เหลือ } ของที่ล้างจริง */
export function cleanseOne(u) {
  const ps = psOf(u), left = {}
  for (const id of debuffIds()) {
    if (id === 'infect') { if (ps.infect?.n > 0) { delete ps.infect; left.infect = 0 } continue }
    if (id === 'spark') { if (ps.spark > 0) { ps.spark = 0; left.spark = 0 } continue }
    const list = ps.status?.[id]
    if (!Array.isArray(list) || !list.length) continue
    list.splice(pickIndex(u, list.length), 1)
    prune(ps.status, id)
    left[id] = statusN(u, id)
  }
  return left
}

/** ☄️ ล้างสถานะร้ายทั้งหมด (ทุกก้อน) · คืนรายการ id ที่ถูกล้าง */
export function cleanseAll(u) {
  const ps = psOf(u), gone = []
  for (const id of debuffIds()) {
    if (id === 'infect') { if (ps.infect?.n > 0) { delete ps.infect; gone.push(id) } continue }
    if (id === 'spark') { if (ps.spark > 0) { ps.spark = 0; gone.push(id) } continue }
    if (statusN(u, id) > 0) { delete ps.status[id]; gone.push(id) }
  }
  return gone
}

/** ตาย = ล้างทุกสถานะในทะเบียน (🦠 ย้ายตามกติกาเดิมของ onAnyDeath ไม่แตะที่นี่) */
export function clearOnDeath(u) { if (u?.ps?.status) u.ps.status = {} }

/** จำนวน "ชนิด" สถานะร้ายที่ล้างได้ที่ติดอยู่ (☄️ 🦄 🦋 เลือกเป้า) — รวม 🦠 ของเดิม */
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
  const s = listOf(u, 'blessShield').find(x => x.n > 0)
  if (!s || !(dmg > 0)) return { dmg, used: false }
  delete u.ps.status.blessShield
  return { dmg: dmg * (1 - (s.val || 0) / 100), used: true }
}
