// เทส readCache — pure function ตัดสินใจว่าจะใช้/ทิ้ง cache members จาก localStorage
// รัน: node --test src/utils/membersCache.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readCache, slimForCache, MEMBERS_CACHE_TTL } from './membersCache.js'

const fresh = (over = {}) => JSON.stringify({
  ts: 1000,
  fbUsers: { '6512345678': { uid: 'a', nickname: 'นัท', coins: 50 } },
  guestUsers: [{ uid: 'g1', nickname: 'แขก' }],
  ...over,
})

test('ไม่มี cache (raw = null) → null', () => {
  assert.equal(readCache(null, 5000, MEMBERS_CACHE_TTL), null)
})

test('JSON พัง → null', () => {
  assert.equal(readCache('{ไม่ใช่ json', 5000, MEMBERS_CACHE_TTL), null)
})

test('cache สด + shape ถูก → คืน { fbUsers, guestUsers }', () => {
  const r = readCache(fresh(), 1000 + 1000, 10_000)
  assert.deepEqual(r, {
    fbUsers: { '6512345678': { uid: 'a', nickname: 'นัท', coins: 50 } },
    guestUsers: [{ uid: 'g1', nickname: 'แขก' }],
  })
})

test('cache หมดอายุ (now - ts >= ttl) → null', () => {
  assert.equal(readCache(fresh({ ts: 1000 }), 1000 + 10_000, 10_000), null)
})

test('ขอบเขต: now - ts = ttl-1 → ยังสด, = ttl → หมดอายุ', () => {
  assert.notEqual(readCache(fresh({ ts: 0 }), 9_999, 10_000), null)
  assert.equal(readCache(fresh({ ts: 0 }), 10_000, 10_000), null)
})

test('shape ผิด: ไม่มี ts → null', () => {
  assert.equal(readCache(JSON.stringify({ fbUsers: {}, guestUsers: [] }), 5000, 10_000), null)
})

test('shape ผิด: fbUsers เป็น array → null', () => {
  assert.equal(readCache(JSON.stringify({ ts: 1, fbUsers: [], guestUsers: [] }), 5, 10_000), null)
})

test('shape ผิด: guestUsers ไม่ใช่ array → null', () => {
  assert.equal(readCache(JSON.stringify({ ts: 1, fbUsers: {}, guestUsers: {} }), 5, 10_000), null)
})

test('MEMBERS_CACHE_TTL = 8 ชม.', () => {
  assert.equal(MEMBERS_CACHE_TTL, 8 * 60 * 60 * 1000)
})

test('slimForCache: ตัด customPhoto (base64) ออก คงฟิลด์อื่นไว้', () => {
  const r = slimForCache(
    { '651': { uid: 'a', nickname: 'นัท', coins: 5, customPhoto: 'data:image/jpeg;base64,/9j/AAA', googlePhoto: 'http://x/p.jpg' } },
    [{ uid: 'g1', nickname: 'แขก', customPhoto: 'data:image/jpeg;base64,ZZZ' }],
  )
  assert.deepEqual(r.fbUsers['651'], { uid: 'a', nickname: 'นัท', coins: 5, googlePhoto: 'http://x/p.jpg' })
  assert.equal('customPhoto' in r.fbUsers['651'], false)
  assert.equal('customPhoto' in r.guestUsers[0], false)
  assert.equal(r.guestUsers[0].nickname, 'แขก')
})
