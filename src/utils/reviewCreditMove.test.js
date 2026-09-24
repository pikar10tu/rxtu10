// เทส reviewCreditMove — ย้ายเครดิตตรวจข้อสอบจากบัญชีซ้ำ → บัญชีหลัก (pure)
import test from 'node:test'
import assert from 'node:assert/strict'
import { planReviewCreditMove, reviewerAccounts } from './reviewCreditMove.js'

const BANK = [
  { id: 'a', reviewedBy: ['old'] },                       // ย้ายปกติ
  { id: 'b', reviewedBy: ['x', 'old'] },                  // conflict เก่า — ตำแหน่งต้องคงเดิม
  { id: 'c', reviewedBy: ['old', 'new'] },                // ตรวจทั้งสองบัญชี = ซ้ำ
  { id: 'd', reviewedBy: ['old'], lastFixBy: 'old' },     // แก้แล้วผ่าน
  { id: 'e', reviewedBy: ['y'], lastFixBy: 'old' },       // เคยแก้ แต่ภายหลังคนอื่นตรวจทับ
  { id: 'f', reviewedBy: ['z'] },                          // ไม่เกี่ยว
  { id: 'g' },                                             // ไม่มี reviewedBy
]

test('planReviewCreditMove — แทน uid เก่าด้วย uid ใหม่ในตำแหน่งเดิม', () => {
  const { updates } = planReviewCreditMove(BANK, 'old', 'new')
  const byId = Object.fromEntries(updates.map(u => [u.id, u]))
  assert.deepEqual(byId.a.patch, { reviewedBy: ['new'] })
  assert.deepEqual(byId.b.patch, { reviewedBy: ['x', 'new'] })
  assert.equal(byId.a.moveReviewDoc, true)
})

test('planReviewCreditMove — ข้อที่ตรวจทั้งสองบัญชี: ตัดตัวเก่าทิ้ง ไม่ย้ายผลตรวจทับของบัญชีใหม่', () => {
  const { updates, dup } = planReviewCreditMove(BANK, 'old', 'new')
  const c = updates.find(u => u.id === 'c')
  assert.deepEqual(c.patch, { reviewedBy: ['new'] })
  assert.equal(c.moveReviewDoc, false)
  assert.equal(dup, 1)
})

test('planReviewCreditMove — lastFixBy ย้ายตาม (ไม่งั้นบัญชีใหม่โดนกันตรวจข้อที่ตัวเองไม่ได้แก้ / เก่ายังถูกกัน)', () => {
  const { updates } = planReviewCreditMove(BANK, 'old', 'new')
  const d = updates.find(u => u.id === 'd')
  assert.deepEqual(d.patch, { reviewedBy: ['new'], lastFixBy: 'new' })
  const e = updates.find(u => u.id === 'e')
  assert.deepEqual(e.patch, { lastFixBy: 'new' })
  assert.equal(e.moveReviewDoc, false)   // ไม่ได้อยู่ใน reviewedBy แล้ว — ไม่ใช่เสียงรอบปัจจุบัน
})

test('planReviewCreditMove — นับเฉพาะข้อที่เครดิตย้ายจริง ข้อไม่เกี่ยวไม่ถูกแตะ', () => {
  const { updates, moved } = planReviewCreditMove(BANK, 'old', 'new')
  assert.deepEqual(updates.map(u => u.id).sort(), ['a', 'b', 'c', 'd', 'e'])
  assert.equal(moved, 3)   // a b d (c ซ้ำ ไม่ได้เพิ่มเครดิตให้บัญชีใหม่ · e ไม่มีเสียง)
})

test('planReviewCreditMove — uid เดียวกัน/ว่าง = ไม่ทำอะไร', () => {
  assert.deepEqual(planReviewCreditMove(BANK, 'old', 'old').updates, [])
  assert.deepEqual(planReviewCreditMove(BANK, '', 'new').updates, [])
  assert.deepEqual(planReviewCreditMove(null, 'old', 'new').updates, [])
})

test('reviewerAccounts — รวมบัญชีจาก users + uid ที่มีแค่ในตัวนับ (บัญชีที่ไม่มี doc/ชื่อก็ต้องเห็น)', () => {
  const users = [
    { uid: 'u1', nickname: 'แพม', realName: 'แพมมี่', email: 'pam@a.com', role: 'academic' },
    { uid: 'u2', email: 'pam@b.com' },   // ล็อกอินแล้วแต่ยังไม่กรอกข้อมูล — AdminView ปกติซ่อนแถวนี้
  ]
  const meta = { counts: { u1: 2, u3: 5 }, names: { u3: 'แพม (ชื่อตอนส่งผล)' } }
  const rows = reviewerAccounts(users, meta)
  const by = Object.fromEntries(rows.map(r => [r.uid, r]))
  assert.equal(by.u1.name, 'แพมมี่ (แพม)')
  assert.equal(by.u1.count, 2)
  assert.equal(by.u2.count, 0)
  assert.equal(by.u2.name, '(ยังไม่ตั้งชื่อ)')
  assert.equal(by.u3.name, 'แพม (ชื่อตอนส่งผล)')
  assert.equal(by.u3.email, null)
  assert.equal(by.u3.count, 5)
  assert.equal(rows[0].uid, 'u3')   // เรียงตามจำนวนข้อที่ตรวจ มาก→น้อย
})

test('reviewerAccounts — ค้นเจอจากชื่อ snapshot ในตัวนับ แม้ชื่อบน users ต่างไป', () => {
  const users = [{ uid: 'u1', nickname: 'P', email: 'p@x.com' }]
  const meta = { counts: { u1: 1 }, names: { u1: 'แพม' } }
  const [row] = reviewerAccounts(users, meta)
  assert.ok(row.search.includes('แพม'))
  assert.ok(row.search.includes('p@x.com'))
})
