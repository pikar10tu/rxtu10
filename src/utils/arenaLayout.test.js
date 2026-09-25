import test from 'node:test'
import assert from 'node:assert/strict'
import { layoutDeco } from './arenaLayout.js'

const rect = (p, it) => ({ l: p.x - it.w / 2, r: p.x + it.w / 2, t: p.y - it.h / 2, b: p.y + it.h / 2 })
const overlap = (a, b) => !(a.r <= b.l || a.l >= b.r || a.b <= b.t || a.t >= b.b)

test('ทุกชิ้นอยู่ในเขต ไม่เลยขอบ (ครึ่งบนและครึ่งล่าง)', () => {
  for (const side of ['top', 'bot']) {
    const zone = side === 'top' ? { y0: 0, y1: 120 } : { y0: 30, y1: 150 }
    const items = [{ key: 'a', w: 40, h: 32, x: 10, d: 0 }, { key: 'b', w: 40, h: 32, x: 90, d: 1 }]
    for (const p of layoutDeco({ W: 375, zone, side, items })) {
      assert.ok(!p.skip, p.key)
      const r = rect(p, items.find(i => i.key === p.key))
      assert.ok(r.t >= zone.y0 && r.b <= zone.y1, `${side} ${p.key} ${r.t}-${r.b}`)
      assert.ok(r.l >= 0 && r.r <= 375)
    }
  }
})

test('d = 0 ชิดกล่องต่อสู้ · top/bot กลับทิศถูก', () => {
  const it = [{ key: 'a', w: 20, h: 20, x: 50, d: 0 }]
  const top = layoutDeco({ W: 300, zone: { y0: 0, y1: 100 }, side: 'top', items: it })[0]
  const bot = layoutDeco({ W: 300, zone: { y0: 0, y1: 100 }, side: 'bot', items: it })[0]
  assert.ok(top.y > 50, 'ครึ่งบน กล่องอยู่ด้านล่างของเขต')
  assert.ok(bot.y < 50, 'ครึ่งล่าง กล่องอยู่ด้านบนของเขต')
})

test('ชิ้นแรกได้ที่ก่อน · ชิ้นที่ชนถูกเลื่อน ไม่ทับกัน', () => {
  const items = [
    { key: 'plaque', w: 240, h: 60, x: 50, d: .5 },
    { key: 'lion', w: 44, h: 32, x: 10, d: .5 },
    { key: 'gorilla', w: 44, h: 32, x: 90, d: .5 },
  ]
  const out = layoutDeco({ W: 375, zone: { y0: 0, y1: 99 }, side: 'top', items })
  assert.equal(out[0].x, 187.5)
  const placed = out.filter(p => !p.skip)
  assert.equal(placed.length, 3)
  for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) {
    const a = rect(placed[i], items.find(x => x.key === placed[i].key))
    const b = rect(placed[j], items.find(x => x.key === placed[j].key))
    assert.ok(!overlap(a, b), `${placed[i].key} ทับ ${placed[j].key}`)
  }
})

test('ไม่มีที่ = skip · สูงเกินเขต = skip', () => {
  const items = [{ key: 'big', w: 360, h: 40, x: 50, d: .5 }, { key: 'x', w: 40, h: 40, x: 50, d: .5 }]
  const out = layoutDeco({ W: 375, zone: { y0: 0, y1: 50 }, side: 'top', items })
  assert.equal(out[0].skip, undefined)
  assert.equal(out[1].skip, true)
  const tall = layoutDeco({ W: 375, zone: { y0: 0, y1: 30 }, side: 'bot', items: [{ key: 't', w: 20, h: 30, x: 50, d: 0 }] })
  assert.equal(tall[0].skip, true)
})

test('ข้อมูลว่าง = []', () => {
  assert.deepEqual(layoutDeco({ W: 300, zone: { y0: 0, y1: 100 }, side: 'top', items: [] }), [])
})
