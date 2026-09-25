import test from 'node:test'
import assert from 'node:assert/strict'
import { pushEvent, rankOfScore, buildFeed, groupFeed, timeAgo, EVENT_MAX } from './newsFeed.js'

const DAY = 24 * 60 * 60 * 1000
const NOW = 1_800_000_000_000

test('pushEvent ต่อหน้าสุด ตัดเหลือ EVENT_MAX', () => {
  let list = []
  const N = EVENT_MAX + 2
  for (let i = 1; i <= N; i++) list = pushEvent(list, { k: 'tw', v: i * 10, t: NOW + i })
  assert.equal(list.length, EVENT_MAX)
  assert.equal(list[0].v, N * 10)
  assert.equal(list[2].v, (N - 2) * 10)
})

test('pushEvent entry เสีย = ไม่แตะของเดิม', () => {
  const prev = [{ k: 'tw', v: 10, t: NOW }]
  assert.deepEqual(pushEvent(prev, null), prev)
  assert.deepEqual(pushEvent(prev, { v: 1 }), prev)        // ไม่มี k
  assert.deepEqual(pushEvent(prev, { k: 'zz', v: 1 }), prev) // k ไม่รู้จัก
})

test('rankOfScore นับเฉพาะคนอื่นที่คะแนนสูงกว่า', () => {
  const rows = { a: { m: { g2048: 900 } }, b: { m: { g2048: 500 } }, me: { m: { g2048: 100 } } }
  const pick = (r) => r?.m?.g2048 || 0
  assert.equal(rankOfScore(rows, 'me', pick, 1000), 1)
  assert.equal(rankOfScore(rows, 'me', pick, 600), 2)
  assert.equal(rankOfScore(rows, 'me', pick, 10), 3)
})

test('buildFeed เรียงใหม่→เก่า และประกอบชื่อจากแถว', () => {
  const rows = {
    a: { n: 'มายด์', ev: [{ k: 'tw', v: 40, t: NOW - 1000 }] },
    b: { n: 'บีม', ev: [{ k: 'qz', v: 10, t: NOW - 10 }] },
  }
  const feed = buildFeed(rows, [], { now: NOW, myUid: null })
  assert.equal(feed.length, 2)
  assert.match(feed[0].text, /บีม/)
  assert.match(feed[1].text, /มายด์ ไต่หอคอยถึงชั้น 40/)
})

test('buildFeed ตัดข่าวเลน roster ที่เกิน 7 วัน แต่ไม่ตัด doc เลน news', () => {
  const rows = { a: { n: 'มายด์', ev: [{ k: 'tw', v: 40, t: NOW - 8 * DAY }] } }
  const docs = [{ id: 'n1', msg: 'ประกาศเก่า', icon: '📢', ts: { toDate: () => new Date(NOW - 30 * DAY) } }]
  const feed = buildFeed(rows, docs, { now: NOW, myUid: null })
  assert.equal(feed.length, 1)
  assert.equal(feed[0].text, 'ประกาศเก่า')
})

test('buildFeed ไม่จำกัดข่าวต่อคน', () => {
  const rows = {
    a: { n: 'มายด์', ev: [
      { k: 'tw', v: 30, t: NOW - 1 }, { k: 'tw', v: 20, t: NOW - 2 }, { k: 'tw', v: 10, t: NOW - 3 },
    ] },
  }
  assert.equal(buildFeed(rows, [], { now: NOW, myUid: null }).length, 3)
})

test('buildFeed ไม่ตัดจำนวนทั้งกระดาน', () => {
  const rows = {}
  for (let i = 0; i < 20; i++) rows[`u${i}`] = { n: `คน${i}`, ev: [{ k: 'tw', v: 10, t: NOW - i }] }
  assert.equal(buildFeed(rows, [], { now: NOW, myUid: null }).length, 20)
})

test('EVENT_MAX = 10', () => assert.equal(EVENT_MAX, 10))

test('groupFeed รวมข่าวคนเดียวกัน หัวกลุ่ม = ข่าวล่าสุด เรียงกลุ่มตามหัว', () => {
  const rows = {
    a: { n: 'มายด์', ev: [{ k: 'tw', v: 30, t: NOW - 1 }, { k: 'tw', v: 20, t: NOW - 50 }] },
    b: { n: 'บีม', ev: [{ k: 'qz', v: 10, t: NOW - 10 }] },
  }
  const docs = [{ id: 'n1', msg: 'ประกาศ', ts: NOW - 5 }, { id: 'n2', msg: 'ประกาศ 2', ts: NOW - 6 }]
  const g = groupFeed(buildFeed(rows, docs, { now: NOW, myUid: null }))
  assert.deepEqual(g.map(x => x.key), ['a', 'news:n1', 'news:n2', 'b'])
  assert.match(g[0].head.text, /ชั้น 30/)
  assert.equal(g[0].rest.length, 1)
  assert.match(g[0].rest[0].text, /ชั้น 20/)
  assert.equal(g[1].rest.length, 0)
})

test('groupFeed ข้อมูลว่าง = []', () => assert.deepEqual(groupFeed(null), []))

test('buildFeed ใช้คำว่า "คุณ" กับข่าวของตัวเอง', () => {
  const rows = { me: { n: 'ปาล์ม', ev: [{ k: 'hs', v: 5, t: NOW }] } }
  assert.match(buildFeed(rows, [], { now: NOW, myUid: 'me' })[0].text, /^คุณ /)
})

test('ข่าวย้ายบ้านบอกชื่อขั้นเก่า→ใหม่ (ไม่ใช่เลขเลเวล)', () => {
  const line = (v) => buildFeed({ a: { n: 'ปิ๊ก', ev: [{ k: 'hs', v, t: NOW }] } }, [], { now: NOW, myUid: null })[0].text
  assert.equal(line(5), 'ปิ๊ก ได้ย้ายจาก ห้องแถวไม้เก่าท้ายซอย ไปอยู่ ห้องแบ่งเช่าใต้หลังคา ยินดีด้วย')
  assert.equal(line(1), 'ปิ๊ก ได้เข้าสู่ระบบ ยินดีต้อนรับ')                 // ไม่มีขั้นก่อนหน้า = คนใหม่
  assert.match(line(99), /เลเวล 99/)                                        // เลเวลเกินทะเบียน = ข่าวยังขึ้น
})

test('buildFeed ทนข้อมูลพัง: ev ไม่ใช่ array / k ไม่รู้จัก / ไม่มีชื่อ', () => {
  const rows = {
    a: { n: 'มายด์', ev: 'พัง' },
    b: { ev: [{ k: 'zz', v: 1, t: NOW }] },
    c: { ev: [{ k: 'tw', v: 12, t: NOW }] },
    d: { n: 'นิว' },
  }
  const feed = buildFeed(rows, [], { now: NOW, myUid: null })
  assert.equal(feed.length, 1)
  assert.match(feed[0].text, /^\? /)
})

test('buildFeed ประกอบข้อความได้ครบทุกชนิด', () => {
  const kinds = [
    { k: 'tw', v: 40 }, { k: 'pg', v: 5 }, { k: 'qz', v: 20 },
    { k: 'mg', g: 'g2048', v: 2 }, { k: 'ta', g: 'ta4', v: 3 },
    { k: 'hs', v: 7 }, { k: 'fo', v: 3200 }, { k: 'pv', v: 4 },
  ]
  for (const e of kinds) {
    const rows = { a: { n: 'มายด์', ev: [{ ...e, t: NOW }] } }
    const feed = buildFeed(rows, [], { now: NOW, myUid: null })
    assert.equal(feed.length, 1, `ชนิด ${e.k} ประกอบข้อความไม่ได้`)
    assert.ok(feed[0].text.length > 5 && feed[0].icon, `ชนิด ${e.k} ข้อความ/ไอคอนว่าง`)
  }
})

test('buildFeed ไม่พังเมื่อไม่มีข้อมูลเลย', () => {
  assert.deepEqual(buildFeed(null, null, {}), [])
})

test('timeAgo อ่านออกทุกช่วง', () => {
  assert.equal(timeAgo(NOW - 5_000, NOW), 'เมื่อกี้')
  assert.equal(timeAgo(NOW - 12 * 60_000, NOW), '12 นาทีที่แล้ว')
  assert.equal(timeAgo(NOW - 3 * 3_600_000, NOW), '3 ชั่วโมงที่แล้ว')
  assert.equal(timeAgo(NOW - 2 * DAY, NOW), '2 วันที่แล้ว')
})

// ── ความสำเร็จ (เลน roster · รวมกลุ่ม) ──
import { pushAchievementEvent, ACH_MERGE_MS, ACH_KEEP } from './newsFeed.js'
import { MILESTONES } from '../data/achievements.js'
const [A1, A2, A3, A4, A5, A6] = MILESTONES.slice(0, 6).map(m => m.id)

test('pushAchievementEvent ปลดรวดในช่วงรวม = บรรทัดเดียว นับครบ', () => {
  let ev = [{ k: 'tw', v: 40, t: NOW - 5000 }]
  ev = pushAchievementEvent(ev, A1, NOW)
  ev = pushAchievementEvent(ev, A2, NOW + 1000)
  ev = pushAchievementEvent(ev, [A3, A4, A5, A6], NOW + 2000)
  assert.equal(ev.length, 2)                    // ข่าวหอคอยไม่ถูกดันตก
  assert.equal(ev[0].k, 'ac')
  assert.equal(ev[0].n, 6)
  assert.equal(ev[0].v.length, ACH_KEEP)
  assert.equal(ev[0].v[0], A3)                  // ใหม่สุดก่อน
  const feed = buildFeed({ u: { n: 'บีม', ev } }, [], { now: NOW + 3000 })
  assert.match(feed[0].text, /บีม ปลดล็อก 6 ความสำเร็จ .* และอีก 4/)
})

test('pushAchievementEvent เกินช่วงรวม = ข่าวใหม่แยก', () => {
  let ev = pushAchievementEvent([], A1, NOW)
  ev = pushAchievementEvent(ev, A2, NOW + ACH_MERGE_MS + 1)
  assert.equal(ev.length, 2)
  assert.equal(ev[0].n, 1)
  const feed = buildFeed({ u: { n: 'บีม', ev } }, [], { now: NOW + ACH_MERGE_MS + 2 })
  assert.match(feed[0].text, /^บีม ปลดล็อก "/)
})

test('ข่าวความสำเร็จ id ไม่รู้จัก = ไม่ throw', () => {
  const ev = [{ k: 'ac', v: ['zz_unknown__2026-09'], n: 1, t: NOW }]
  const feed = buildFeed({ u: { n: 'บีม', ev } }, [], { now: NOW })
  assert.match(feed[0].text, /ปลดล็อกความสำเร็จใหม่/)
  assert.equal(feed[0].icon, '🏅')
})
