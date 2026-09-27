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
