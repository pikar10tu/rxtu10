import test from 'node:test'
import assert from 'node:assert/strict'
import { auraLayers } from './dollAura.js'

test('สาดสีรุ้งหลายชิ้น = วงรุ้งอันเดียว หยดสีชุดเดียว', () => {
  const L = auraLayers([{ type: 'rainbow', color: '#FFD93D' }, { type: 'rainbow', color: '#FFD93D' }, { type: 'rainbow', color: '#000000' }])
  assert.equal(L.rainbow, true)
  const splash = L.particles.filter(p => p.type === 'splash')
  assert.equal(splash.length, auraLayers([{ type: 'rainbow', color: '#FFD93D' }]).particles.length)
})

test('ออร่าชนิด+สีซ้ำ = อันเดียว (ไม่สนตัวพิมพ์เล็กใหญ่)', () => {
  const one = auraLayers([{ type: 'hearts', color: '#ff8fb8' }]).particles.length
  assert.equal(auraLayers([{ type: 'hearts', color: '#FF8FB8' }, { type: 'hearts', color: '#ff8fb8' }]).particles.length, one)
  assert.deepEqual(auraLayers([{ type: 'glow', color: '#FFF' }, { type: 'glow', color: '#fff' }]).glows.length, 1)
})

test('ออร่าต่างชนิดโชว์ร่วมกันได้ · อนุภาคไม่เกิน 3 แหล่ง', () => {
  const L = auraLayers([
    { type: 'rainbow', color: '#FFD93D' }, { type: 'glow', color: '#B49BE0' }, { type: 'hearts', color: '#F29BB5' },
    { type: 'bubbles', color: '#7FD8E8' }, { type: 'petals', color: '#F7B6C8' },
  ])
  assert.equal(L.rainbow, true)
  assert.deepEqual(L.glows, ['#B49BE0'])
  const kinds = new Set(L.particles.map(p => p.type))
  assert.ok(kinds.has('splash') && kinds.has('hearts'))
  assert.ok(!kinds.has('bubbles') && !kinds.has('petals'))   // เกิน 3 แหล่ง (รุ้ง เรือง หัวใจ) ตัดทิ้ง
})
