import { test } from 'node:test'
import assert from 'node:assert/strict'
import { searchText, searchTerms, matchCase } from './cc2Search.js'

const c = { id: 'OS-0048', title: 'เขียนฉลากยา Warfarin', topic: 'Warfarin', group: 'การนับเม็ดยาและเขียนฉลากยา' }

test('รหัสเคสหลายแบบ', () => {
  for (const q of ['OS-0048', 'os0048', '0048', '48']) assert.ok(matchCase(c, searchTerms(q)), q)
  assert.ok(!matchCase(c, searchTerms('49')))
})
test('หลายคำต้องตรงครบ', () => {
  assert.ok(matchCase(c, searchTerms('warfarin ฉลาก')))
  assert.ok(!matchCase(c, searchTerms('warfarin insulin')))
})
test('ค้นในเนื้อเคส', () => {
  const body = searchText(['<p>ผู้ป่วยใช้ <b>Amiodarone</b> ร่วมด้วย</p>'])
  assert.ok(matchCase(c, searchTerms('amiodarone'), body))
  assert.ok(!matchCase(c, searchTerms('amiodarone'), ''))
})
test('searchText ตัดแท็กและคำซ้ำ', () => {
  assert.equal(searchText(['<p>Aa aa</p>', 'bb ผู้ป่วย']), 'aa bb')
})
