// src/utils/pvpEnergy.js
// พลังบุก PvP — pure (user สั่ง 28 ก.ย. 2026 แทนโควตา 5 ครั้ง/วัน)
//  เก็บ 2 ฟิลด์บน user doc: pvpEnergy (0..MAX ณ เวลา pvpEnergyAt) · pvpEnergyAt (ms จุดเริ่มนับเติมครั้งถัดไป)
//  ไม่เคยมีฟิลด์ = เต็ม (ผู้เล่นเก่าเข้ามาครั้งแรกได้ 5 เต็ม)
//  ⚠️ นาฬิกาเครื่อง = trust-based เหมือนระบบรายวันอื่นในแอป
export const PVP_ENERGY_MAX = 5
export const PVP_ENERGY_REFILL_MS = 20 * 60 * 1000

/** สถานะ ณ now → { energy, at (จุดนับเติมถัดไป), nextMs (อีกกี่ ms ได้เพิ่ม 1 · 0 = เต็ม) } */
export function energyState(stored, at, now, max = PVP_ENERGY_MAX, refill = PVP_ENERGY_REFILL_MS) {
  if (stored == null || !Number.isFinite(Number(stored))) return { energy: max, at: now, nextMs: 0 }
  let e = Math.max(0, Math.min(max, Math.floor(Number(stored))))
  if (e >= max) return { energy: max, at: now, nextMs: 0 }
  let t = Number(at) || now
  if (t > now) t = now                     // นาฬิกาถอยหลัง — อย่าล็อกยาว
  const gained = Math.floor((now - t) / refill)
  e = Math.min(max, e + gained)
  if (e >= max) return { energy: max, at: now, nextMs: 0 }
  const anchor = t + gained * refill
  return { energy: e, at: anchor, nextMs: anchor + refill - now }
}

/** ใช้ 1 พลัง → patch {pvpEnergy, pvpEnergyAt} · พลังหมด = null */
export function spendEnergy(stored, at, now) {
  const s = energyState(stored, at, now)
  if (s.energy < 1) return null
  // จากเต็ม: เริ่มนับเติมจากตอนนี้ · ไม่เต็ม: นับต่อจากจุดเดิม (ไม่เสียเศษเวลาที่สะสมไว้)
  return { pvpEnergy: s.energy - 1, pvpEnergyAt: s.energy >= PVP_ENERGY_MAX ? now : s.at }
}
