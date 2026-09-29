import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { showtimePlan, hasShowtime, SHOWTIME_ART, SHOWTIME_MAX } from './battleShowtime.js'

const LEGENDS = ['bahamut', 'lion', 'whale', 'phoenix', 'kirin', 'trex', 'ouroboros', 'simurgh', 'qilin', 'virus', 'gorilla', 'mammoth', 'sol', 'earth', 'luna']
const pt = (x, y) => ({ x, y })
const ctx = () => {
  const team = [pt(60, 460), pt(180, 460), pt(300, 460)], foes = [pt(60, 100), pt(180, 100), pt(300, 100)]
  return { owner: team[1], team, foes, targets: [foes[0]], box: { w: 360, h: 560 } }
}

test('เลเจนด์ทุกตัวมีท่าโชว์ไทม์ · ภาพทุกชิ้นมีไฟล์ WebP · ไม่เกินพูล · offset ไม่ถอย', () => {
  for (const id of SHOWTIME_ART) assert.ok(existsSync(`public/fx/${id}.webp`), id)
  for (const id of LEGENDS) {
    assert.ok(hasShowtime(id), id)
    const plan = showtimePlan(id, ctx())
    assert.ok(plan.length > 0 && plan.length <= SHOWTIME_MAX, `${id}: ${plan.length}`)
    for (const sp of plan) {
      assert.ok(SHOWTIME_ART.includes(sp.img), `${id}: ${sp.img}`)
      assert.ok(sp.ms > 0 && sp.ms + (sp.delay || 0) <= 1400, `${id} ยาวเกิน`)
      const offs = sp.kf.map((k, i) => k.at ?? i / (sp.kf.length - 1))
      for (let i = 1; i < offs.length; i++) assert.ok(offs[i] >= offs[i - 1], `${id} offset ถอย`)
      for (const k of sp.kf) assert.ok(Number.isFinite(k.x) && Number.isFinite(k.y) && Number.isFinite(k.s), id)
    }
  }
  assert.deepEqual(showtimePlan('cat', ctx()), [])
})

test('สีแบนเนอร์ทุกสีเข้มพอให้ตัวอักษรขาวอ่านออก (contrast ≥ 4.5)', async () => {
  const { PET_TINT, KIND_TINT } = await import('./battleShowtime.js')
  const lum = (hex) => {
    const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
  }
  for (const [k, pair] of Object.entries({ ...PET_TINT, ...KIND_TINT })) for (const hex of pair) {
    const cr = 1.05 / (lum(hex) + 0.05)
    assert.ok(cr >= 4.5, `${k} ${hex} contrast ${cr.toFixed(2)}`)
  }
})
