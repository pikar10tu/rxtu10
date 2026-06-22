import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bankStats } from './questionBankStats.js'

test('bankStats นับ total/published/draft', () => {
  const s = bankStats([
    { isPublished: true,  domain: 'care' },
    { isPublished: true,  domain: 'sci'  },
    { isPublished: false, domain: 'law'  },
  ])
  assert.equal(s.total, 3)
  assert.equal(s.published, 2)
  assert.equal(s.draft, 1)
})

test('bankStats byDomain + none bucket (unknown/missing → none)', () => {
  const s = bankStats([
    { isPublished: true, domain: 'care' },
    { isPublished: true, domain: 'care' },
    { isPublished: true, domain: 'xyz' },   // unknown key → none
    { isPublished: true },                   // missing domain → none
  ])
  assert.equal(s.byDomain.care, 2)
  assert.equal(s.byDomain.sci, 0)
  assert.equal(s.byDomain.law, 0)
  assert.equal(s.byDomain.none, 2)
})

test('bankStats ทน non-array → 0 ทั้งหมด', () => {
  const s = bankStats(null)
  assert.equal(s.total, 0)
  assert.equal(s.published, 0)
  assert.equal(s.draft, 0)
  assert.equal(s.byDomain.care, 0)
  assert.equal(s.byDomain.none, 0)
})

test('bankStats isPublished ที่ไม่ใช่ true ถือเป็น draft', () => {
  const s = bankStats([{ domain: 'care' }, { isPublished: false, domain: 'sci' }])
  assert.equal(s.published, 0)
  assert.equal(s.draft, 2)
})
