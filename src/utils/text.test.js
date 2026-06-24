import { test } from 'node:test'
import assert from 'node:assert/strict'
import { stripTrailingEmoji, cleanText } from './text.js'

test('stripTrailingEmoji: ตัด emoji ท้ายชื่อ (มีเว้นวรรค)', () => {
  assert.equal(stripTrailingEmoji('นัท 🎀'), 'นัท')
})

test('stripTrailingEmoji: ตัด emoji ท้ายชื่อ (ไม่มีเว้นวรรค)', () => {
  assert.equal(stripTrailingEmoji('อุ้ม🐱'), 'อุ้ม')
})

test('stripTrailingEmoji: ตัด emoji หลายตัวติดกันท้ายชื่อ', () => {
  assert.equal(stripTrailingEmoji('มาย 🐱🎀'), 'มาย')
})

test('stripTrailingEmoji: รองรับ ZWJ + skin-tone sequence', () => {
  assert.equal(stripTrailingEmoji('โอ๋ 👩🏻‍🔬'), 'โอ๋')
})

test('stripTrailingEmoji: ชื่อไม่มี emoji คงเดิม', () => {
  assert.equal(stripTrailingEmoji('มาลี'), 'มาลี')
})

test('stripTrailingEmoji: emoji กลางชื่อไม่ถูกตัด (ตัดเฉพาะท้าย)', () => {
  assert.equal(stripTrailingEmoji('เอ 🎀 บี'), 'เอ 🎀 บี')
})

test('stripTrailingEmoji: emoji ล้วน → ว่าง', () => {
  assert.equal(stripTrailingEmoji('🎀'), '')
})

test('stripTrailingEmoji: null/undefined/ว่าง → ว่าง', () => {
  assert.equal(stripTrailingEmoji(null), '')
  assert.equal(stripTrailingEmoji(undefined), '')
  assert.equal(stripTrailingEmoji(''), '')
})

test('cleanText: ยังทำงานเดิม (trim + cap)', () => {
  assert.equal(cleanText('  hi  ', 10), 'hi')
})
