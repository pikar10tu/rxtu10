import { test } from 'node:test'
import assert from 'node:assert/strict'
import { needsConsent, matchRoster, validateGuest, onboardingGate } from './onboarding.js'

const V = '2026-06-20'
const students = [
  { id: '6512345678', nickname: 'อุ้ม', realName: 'ปรวิชญ์', track: 'care' },
  { id: '6587654321', nickname: 'มาย', realName: 'มาลี', track: 'sci' },
]

test('needsConsent: ยังไม่เคยยอมรับ → true', () => {
  assert.equal(needsConsent({}, V), true)
  assert.equal(needsConsent({ consent: { accepted: false, version: null } }, V), true)
})
test('needsConsent: ยอมรับ version เดิม → true (ต้อง re-consent)', () => {
  assert.equal(needsConsent({ consent: { accepted: true, version: '2025-01-01' } }, V), true)
})
test('needsConsent: ยอมรับ version ปัจจุบัน → false', () => {
  assert.equal(needsConsent({ consent: { accepted: true, version: V } }, V), false)
})

test('matchRoster: เจอรหัส (trim ช่องว่าง) → คืนข้อมูล', () => {
  assert.deepEqual(matchRoster(' 6512345678 ', students), students[0])
})
test('matchRoster: ไม่เจอ → null', () => {
  assert.equal(matchRoster('9999999999', students), null)
  assert.equal(matchRoster('', students), null)
})

test('validateGuest: ชื่อ+เหตุผลครบ → ok', () => {
  assert.deepEqual(validateGuest({ nickname: 'แขก', reason: 'มาดูเฉยๆ' }), { ok: true, error: null })
})
test('validateGuest: ชื่อว่าง → error', () => {
  assert.equal(validateGuest({ nickname: '  ', reason: 'x' }).ok, false)
})
test('validateGuest: เหตุผลว่าง → error', () => {
  assert.equal(validateGuest({ nickname: 'แขก', reason: '' }).ok, false)
})

test('onboardingGate: ยังไม่ consent → consent', () => {
  assert.equal(onboardingGate({}, V), 'consent')
})
test('onboardingGate: consent แล้วแต่ยังไม่ onboard → wizard', () => {
  assert.equal(onboardingGate({ consent: { accepted: true, version: V } }, V), 'wizard')
})
test('onboardingGate: คนเก่ามี studentId แม้ onboarded ไม่ตั้ง → ok (effective)', () => {
  assert.equal(onboardingGate({ consent: { accepted: true, version: V }, studentId: '6512345678' }, V), 'ok')
})
test('onboardingGate: guest pending → guest-pending', () => {
  assert.equal(onboardingGate({ consent: { accepted: true, version: V }, onboarded: true, accountType: 'guest', guestStatus: 'pending' }, V), 'guest-pending')
})
test('onboardingGate: guest approved → ok', () => {
  assert.equal(onboardingGate({ consent: { accepted: true, version: V }, onboarded: true, accountType: 'guest', guestStatus: 'approved' }, V), 'ok')
})
test('onboardingGate: guest เก่า track=guest (ไม่มี guestStatus) → ok', () => {
  assert.equal(onboardingGate({ consent: { accepted: true, version: V }, studentId: null, track: 'guest' }, V), 'ok')
})
