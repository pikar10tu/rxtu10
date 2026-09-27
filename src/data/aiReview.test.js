// เทส aiReview — hash ต้องตรงกับสคริปต์ apply-ai-review.mjs ทุกไบต์ ไม่งั้นทุกข้อขึ้น "เวอร์ชันก่อน"
// รัน: node --test src/data/aiReview.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { aiContentHash, aiState, aiConflictsTeam } from './aiReview.js'

// ข้อจริงจาก DOC/ai-review/ai_apply_plan.json (kmnaBohqRs5v1B82atEW) · มีไทย + \n
const Q = {
  question: 'ผู้ป่วยชายอายุ 20 ปี น้ำหนัก 75 kg สูง 175 cm มาพบแพทย์ด้วยอาการไอ หอบเหนื่อย เจ็บแน่นหน้าอกเป็นครั้งคราว มีเสมหะ มีโรคประจำตัว Allergic rhinitis ผลตรวจสมรรถนะปอด FEV1/FVC = 0.8, %FEV1 = 60% และมี Eosinophil ในสารคัดหลั่งระบบทางเดินหายใจจำนวนมาก แพทย์วินิจฉัยว่าเป็นโรคหืด\n\nในทางปฏิบัติข้อใดเหมาะสมที่สุดในการพิสูจน์เอกลักษณ์ของ Formoterol',
  choices: ['Spectrofluorometer', 'HPLC', 'Fourier transform infrared spectroscopy', 'UV spectrophotometer', 'Potentiometer'],
  answer: 1,
}

test('aiContentHash ตรงกับ contentHash ที่สคริปต์เขียน', async () => {
  assert.equal(await aiContentHash(Q), '446eef25790d7bf0')
})

const ai = (x = {}) => ({ verdict: 'wrong', confidence: 'high', contentHash: 'H0', ...x })

test('aiState: ไม่มีผล / ยังคำนวณ hash', () => {
  assert.equal(aiState({}, 'H0'), 'none')
  assert.equal(aiState({ aiReview: ai() }, null), 'pending')
})

test('aiState: ok / flag / stale', () => {
  assert.equal(aiState({ aiReview: ai({ verdict: 'ok' }) }, 'H0'), 'ok')
  assert.equal(aiState({ aiReview: ai() }, 'H0'), 'flag')
  assert.equal(aiState({ aiReview: ai() }, 'H9'), 'stale')
})

test('aiState: AI แก้แล้ว → ok เมื่อ hash ตรงกับหลังแก้, stale เมื่อคนแก้ต่อ', () => {
  const q = { aiReview: ai({ applied: true }), aiPrev: { answer: 1, appliedHash: 'H1' } }
  assert.equal(aiState(q, 'H1'), 'ok')
  assert.equal(aiState(q, 'H2'), 'stale')
})

test('aiState: ทีมตัดสินแล้ว (forHash ตรง) → ok', () => {
  assert.equal(aiState({ aiReview: ai(), aiResolved: { action: 'rejected', forHash: 'H0' } }, 'H0'), 'ok')
  assert.equal(aiState({ aiReview: ai(), aiResolved: { action: 'rejected', forHash: 'OLD' } }, 'H0'), 'flag')
})

test('aiConflictsTeam: ทีมผ่าน + AI ว่าผิด + ยังไม่แก้', () => {
  assert.equal(aiConflictsTeam({ reviewStatus: 'passed', aiReview: ai() }), true)
  assert.equal(aiConflictsTeam({ reviewStatus: 'passed', aiReview: ai({ applied: true }) }), false)
  assert.equal(aiConflictsTeam({ reviewStatus: 'pending', aiReview: ai() }), false)
})
