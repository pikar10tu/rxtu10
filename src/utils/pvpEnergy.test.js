import { test } from 'node:test'
import assert from 'node:assert/strict'
import { energyState, spendEnergy, PVP_ENERGY_MAX, PVP_ENERGY_REFILL_MS as R } from './pvpEnergy.js'

const NOW = 1_800_000_000_000

test('ไม่มีฟิลด์ = เต็ม', () => assert.equal(energyState(undefined, null, NOW).energy, PVP_ENERGY_MAX))
test('เติม 1 ทุก 20 นาที · เศษเวลาไม่หาย', () => {
  const s = energyState(0, NOW - 2 * R - 5000, NOW)
  assert.equal(s.energy, 2)
  assert.equal(s.nextMs, R - 5000)
})
test('เติมไม่เกิน MAX', () => assert.equal(energyState(1, NOW - 100 * R, NOW).energy, PVP_ENERGY_MAX))
test('นาฬิกาถอยหลัง ไม่ติดลบ ไม่ล็อกเกิน 1 รอบ', () => {
  const s = energyState(2, NOW + 10 * R, NOW)
  assert.equal(s.energy, 2); assert.equal(s.nextMs, R)
})
test('ใช้จากเต็ม เริ่มนับตอนนี้', () => assert.deepEqual(spendEnergy(undefined, null, NOW), { pvpEnergy: 4, pvpEnergyAt: NOW }))
test('ใช้ตอนไม่เต็ม นับต่อจุดเดิม', () => {
  assert.deepEqual(spendEnergy(1, NOW - R - 1000, NOW), { pvpEnergy: 1, pvpEnergyAt: NOW - 1000 })
})
test('หมด = null', () => assert.equal(spendEnergy(0, NOW - 1000, NOW), null))

import { addEnergy, PVP_ENERGY_OVER } from './pvpEnergy.js'
test('ตั๋วพลังงาน +5 ล้นได้ถึง 10 และล้นแล้วไม่เติมเอง', () => {
  const now = 1_000_000_000
  assert.deepEqual(addEnergy(2, now - 60_000, now), { pvpEnergy: 7, pvpEnergyAt: now })
  assert.equal(addEnergy(8, now, now).pvpEnergy, PVP_ENERGY_OVER)
  assert.equal(addEnergy(10, now, now), null)
  assert.equal(energyState(7, now - 10 * 3600_000, now).energy, 7)
  assert.deepEqual(spendEnergy(7, now - 5, now), { pvpEnergy: 6, pvpEnergyAt: now })
  assert.equal(addEnergy(null, null, now).pvpEnergy, 10)   // ไม่เคยมีฟิลด์ = เต็ม 5 → 10
})
