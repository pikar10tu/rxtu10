import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as Astro from 'astronomy-engine'
import {
  SIGNS, bkkDate, thaiLagnaLon, ANTONATI, sunSign, ascendantLon, birthDow, birthProfile, dailyCard, dailyReading, siderealLon, signOf,
} from './horo.js'
import { TAROT } from '../data/tarot.js'

test('มีไพ่ครบ 78 ใบ ไม่มีช่องว่าง', () => {
  assert.equal(TAROT.length, 78)
  for (const c of TAROT) for (const k of ['img', 'en', 'th', 'up', 'upTip', 'rv', 'rvTip']) assert.ok(c[k], `${c.img}.${k}`)
  assert.equal(new Set(TAROT.map(c => c.img)).size, 78)
})

test('ราศีไทย (นิรายนะ): อาทิตย์ย้ายเข้าเมษกลาง เม.ย.', () => {
  assert.equal(SIGNS[sunSign(bkkDate(2004, 4, 10))], 'มีน')
  assert.equal(SIGNS[sunSign(bkkDate(2004, 4, 20))], 'เมษ')
  assert.equal(SIGNS[sunSign(bkkDate(2004, 5, 1))], 'เมษ')
  assert.equal(SIGNS[sunSign(bkkDate(2004, 5, 20))], 'พฤษภ')
  assert.equal(SIGNS[sunSign(bkkDate(2004, 1, 1))], 'ธนู')
})

test('ลัคนา: สูตรตรงกับจุดบนสุริยวิถีที่อยู่ขอบฟ้าตะวันออก', () => {
  const date = bkkDate(2004, 7, 15, '09:30')
  const lon = ascendantLon(date)
  const obs = new Astro.Observer(13.7563, 100.5018, 0)
  // แปลงจุดสุริยวิถีที่ได้เป็นพิกัดขอบฟ้า → altitude ≈ 0 และอยู่ฝั่งตะวันออก
  const time = Astro.MakeTime(date)
  const vec = Astro.VectorFromSphere(new Astro.Spherical(0, lon, 1), time)
  const eqd = Astro.RotateVector(Astro.Rotation_ECT_EQD(time), vec)
  const sph = Astro.EquatorFromVector(eqd)
  const hor = Astro.Horizon(time, obs, sph.ra, sph.dec, null)
  assert.ok(Math.abs(hor.altitude) < 0.5, `alt ${hor.altitude}`)
  assert.ok(hor.azimuth > 0 && hor.azimuth < 180, `az ${hor.azimuth}`)
})

test('วันเกิด + พุธกลางคืน', () => {
  assert.equal(birthDow(2004, 11, 3), 3)              // 3 พ.ย. 2004 = พุธ
  assert.equal(birthDow(2004, 11, 3, '19:10'), 7)
  assert.equal(birthDow(2004, 11, 3, '17:59'), 3)
})

test('ข้อมูลเกิด: ไม่รู้ปี = ไม่มีวันเกิด/ลัคนา · ไม่รู้เวลา = ลัคนาโดยประมาณ', () => {
  const a = birthProfile({ d: 1, m: 5 })
  assert.equal(SIGNS[a.sign], 'เมษ'); assert.equal(a.dow, null); assert.equal(a.asc, null)
  const b = birthProfile({ d: 1, m: 5, y: 2004 })
  assert.equal(b.ascApprox, true); assert.ok(b.asc >= 0 && b.asc < 12)
  // เกิด 06:00 ≈ พระอาทิตย์ขึ้น → ลัคนาใกล้ราศีอาทิตย์ (ห่างไม่เกิน 1 ราศี)
  const diff = Math.abs(((b.asc - b.sign) + 12) % 12)
  assert.ok(diff <= 1 || diff === 11, `asc ${b.asc} sign ${b.sign}`)
  const c = birthProfile({ d: 1, m: 5, y: 2004, time: '14:00' })
  assert.equal(c.ascApprox, false)
})

test('ไพ่/ดวงรายวันคงที่ทั้งวัน และเปลี่ยนเมื่อเปลี่ยนวันหรือคน', () => {
  assert.deepEqual(dailyCard('u1', '2026-11-09'), dailyCard('u1', '2026-11-09'))
  const days = ['2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13']
  assert.ok(new Set(days.map(d => dailyCard('u1', d).card.img)).size > 1)
  assert.notDeepEqual(dailyCard('u1', '2026-11-09'), dailyCard('u2', '2026-11-09'))
  const r = dailyReading(0, '2026-11-09', 'u1')
  assert.deepEqual(r, dailyReading(0, '2026-11-09', 'u1'))
  assert.ok(r.house.n >= 1 && r.house.n <= 12)
})

test('เรือนจันทร์ = ระยะจากราศีเกิดถึงราศีจันทร์ + 1', () => {
  const r = dailyReading(3, '2026-11-09')
  assert.equal(r.house.n, ((r.moon - 3 + 12) % 12) + 1)
})

test('signOf/sidereal wrap', () => {
  assert.equal(signOf(359.9), 11); assert.equal(signOf(-0.1), 11)
  assert.ok(siderealLon(10, new Date()) > 300)
})

test('ลัคนาแบบไทย (อันโตนาที) ตรงกับ myhora 3 วันเกิด', () => {
  assert.equal(ANTONATI.reduce((a, b) => a + b), 1440)
  const cases = [[15, 1, 2004, '09:00', 'มีน'], [3, 11, 2004, '21:15', 'กรกฎ'], [20, 8, 2001, '14:30', 'พิจิก']]
  for (const [d, m, y, t, want] of cases) assert.equal(SIGNS[birthProfile({ d, m, y, time: t }).asc], want, `${d}/${m}/${y} ${t}`)
})

test('ลัคนาไทย: 06:00 = ตำแหน่งอาทิตย์ · ครบ 24 ชม. วนกลับที่เดิม', () => {
  assert.equal(thaiLagnaLon(100, '06:00'), 100)
  assert.ok(Math.abs(thaiLagnaLon(100, '05:59') - 100) > 330 || thaiLagnaLon(100, '05:59') < 100)
  assert.equal(signOf(thaiLagnaLon(0, '08:00')), 1)       // เมษ 0° + 120 นาที = เข้าพฤษภพอดี
})
