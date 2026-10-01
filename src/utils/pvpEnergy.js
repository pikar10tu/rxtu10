// src/utils/pvpEnergy.js
// พลังงาน PvP — pure (user สั่ง 28 ก.ย. 2026 แทนโควตา 5 ครั้ง/วัน)
//  เก็บ 2 ฟิลด์บน user doc: pvpEnergy (0..MAX ณ เวลา pvpEnergyAt) · pvpEnergyAt (ms จุดเริ่มนับเติมครั้งถัดไป)
//  ไม่เคยมีฟิลด์ = เต็ม (ผู้เล่นเก่าเข้ามาครั้งแรกได้ 5 เต็ม)
//  ⚠️ นาฬิกาเครื่อง = trust-based เหมือนระบบรายวันอื่นในแอป
export const PVP_ENERGY_MAX = 5
export const PVP_ENERGY_REFILL_MS = 20 * 60 * 1000
// ⚡ ตั๋วพลังงาน (user เคาะ 2 ต.ค. 2026): +5 ล้นเพดานได้ ถึงสูงสุด 10 · ล้นอยู่ = ไม่เติมเอง
export const PVP_ENERGY_OVER = 10
export const ENERGY_TICKET = { emoji: '⚡', name: 'ตั๋วพลังงาน', field: 'pvpEnergyTicket', add: 5, price: 5000 }

/** สถานะ ณ now → { energy, at (จุดนับเติมถัดไป), nextMs (อีกกี่ ms ได้เพิ่ม 1 · 0 = เต็ม) } */
export function energyState(stored, at, now, max = PVP_ENERGY_MAX, refill = PVP_ENERGY_REFILL_MS) {
  if (stored == null || !Number.isFinite(Number(stored))) return { energy: max, at: now, nextMs: 0 }
  let e = Math.max(0, Math.min(PVP_ENERGY_OVER, Math.floor(Number(stored))))
  if (e >= max) return { energy: e, at: now, nextMs: 0 }   // ≥ เต็ม (ล้นจากตั๋วได้) ไม่นับเติม
  let t = Number(at) || now
  if (t > now) t = now                     // นาฬิกาถอยหลัง — อย่าล็อกยาว
  const gained = Math.floor((now - t) / refill)
  e = Math.min(max, e + gained)
  if (e >= max) return { energy: max, at: now, nextMs: 0 }
  const anchor = t + gained * refill
  return { energy: e, at: anchor, nextMs: anchor + refill - now }
}

/** ใช้ตั๋ว 1 ใบ → patch · ล้นจนเกิน OVER ไม่ได้ (คืน null ถ้าเต็มเพดานล้นแล้ว) */
export function addEnergy(stored, at, now, n = ENERGY_TICKET.add) {
  const s = energyState(stored, at, now)
  if (s.energy >= PVP_ENERGY_OVER) return null
  const e = Math.min(PVP_ENERGY_OVER, s.energy + n)
  // ไม่เต็ม: นับเติมต่อจากจุดเดิม · ถึงเต็มแล้ว: at ไม่มีผล ตั้งเป็นตอนนี้
  return { pvpEnergy: e, pvpEnergyAt: e >= PVP_ENERGY_MAX ? now : s.at }
}

/** ใช้ 1 พลัง → patch {pvpEnergy, pvpEnergyAt} · พลังหมด = null */
export function spendEnergy(stored, at, now) {
  const s = energyState(stored, at, now)
  if (s.energy < 1) return null
  // จากเต็ม: เริ่มนับเติมจากตอนนี้ · ไม่เต็ม: นับต่อจากจุดเดิม (ไม่เสียเศษเวลาที่สะสมไว้)
  return { pvpEnergy: s.energy - 1, pvpEnergyAt: s.energy >= PVP_ENERGY_MAX ? now : s.at }
}
