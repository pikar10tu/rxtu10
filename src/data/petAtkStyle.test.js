import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PETS, atkStyleOf, projectileOf, passiveOf } from './index.js'

test('ranged pet ทุกตัวมี projectile emoji', () => {
  const ranged = PETS.filter(p => atkStyleOf(p) === 'ranged')
  assert.ok(ranged.length >= 8, `ranged count ${ranged.length}`)
  ranged.forEach(p => assert.ok(p.projectile && projectileOf(p) === p.projectile, `${p.id} projectile`))
})

test('melee เป็น default + passive default null', () => {
  const wolf = PETS.find(p => p.id === 'wolf')
  assert.equal(atkStyleOf(wolf), 'melee')
  assert.equal(passiveOf(wolf), null)
})
