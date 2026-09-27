import { test } from 'node:test'
import assert from 'node:assert/strict'
import { masteryStars, nextMasteryCut, rollGold, goldEmoji, goldPrice, GOLD_CHANCE } from './farmMastery.js'
import { CROPS, getCrop } from './crops.js'
import { fluentFile } from '../utils/emoji.js'
import { existsSync } from 'node:fs'

test('ดาวตามเกณฑ์ 10/50/100 และทนอินพุตพัง', () => {
  assert.deepEqual([0, 9, 10, 49, 50, 99, 100, 5000].map(masteryStars), [0, 0, 1, 1, 2, 2, 3, 3])
  for (const bad of [undefined, null, -3, NaN, 'x']) assert.equal(masteryStars(bad), 0)
})

test('เป้าถัดไป', () => {
  assert.equal(nextMasteryCut(0), 10)
  assert.equal(nextMasteryCut(10), 50)
  assert.equal(nextMasteryCut(99), 100)
  assert.equal(nextMasteryCut(100), null)
})

test('โอกาสทอง 1/3/5/7% ใช้ดาวก่อนเก็บ', () => {
  assert.deepEqual(GOLD_CHANCE, [0.01, 0.03, 0.05, 0.07])
  assert.equal(rollGold(0, () => 0.0099), true)
  assert.equal(rollGold(0, () => 0.01), false)
  assert.equal(rollGold(9, () => 0.02), false)    // ยัง 0 ดาว
  assert.equal(rollGold(10, () => 0.02), true)    // 1 ดาว = 3%
  assert.equal(rollGold(100, () => 0.069), true)
  assert.equal(rollGold(100, () => 0.07), false)
})

test('ราคาทอง ×3 และคีย์รูปทอง', () => {
  const c = getCrop('tomato')
  assert.equal(goldPrice(c), c.sellPrice * 3)
  assert.equal(goldEmoji(c), 'herb:tomato:gold')
  assert.equal(fluentFile(goldEmoji(c)), 'herbs/tomato-gold.webp')
})

test('พืชทุกตัวมีไฟล์รูปปกติ+ทอง และข้อมูลสมุดพืช', () => {
  for (const c of CROPS) {
    for (const key of [c.emoji, goldEmoji(c)]) {
      assert.ok(existsSync(new URL('../../public/' + fluentFile(key), import.meta.url)), `${c.id} ${key}`)
    }
    assert.ok(c.herb?.sci && c.herb?.part && c.herb?.uses, c.id)
  }
})
