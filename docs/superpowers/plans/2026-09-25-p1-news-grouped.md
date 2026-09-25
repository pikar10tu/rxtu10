# P1 กระดานข่าวคนละ 10 + รวมกลุ่ม — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ข่าวในกระดานขึ้นครบทุกข่าวภายใน 7 วัน เก็บคนละ 10 ข่าว และรวมข่าวของคนเดียวกันไว้ใต้ปุ่ม "▾ อีก N ข่าวจาก X"

**Architecture:** ข่าวเก็บในแถว roster ของเจ้าตัว (`rows.<uid>.ev`) อยู่แล้ว — ขยาย `EVENT_MAX` เป็น 10 · `buildFeed` เลิกตัด (ไม่มีเพดานต่อคน/ทั้งกระดาน) · เพิ่ม `groupFeed()` pure สำหรับจัดกลุ่ม · `NewsBoard.vue` แสดงแบบกลุ่ม แถบวิ่งบรรทัดเดียววนเฉพาะหัวกลุ่ม

**Tech Stack:** Vue 3 SFC · node:test

สเปก: `docs/superpowers/specs/2026-09-25-arena-skins-replay-news-design.md` §6

## Global Constraints
- ใช้ `{{ }}` เท่านั้น ห้าม `v-html` (ข้อความเลน news มาจากผู้เล่น)
- ฟอนต์ ≥ .7rem · ธีมใช้ตัวแปร style.css (`--primary`, `var(--line)`)
- ไม่มี Firestore read เพิ่ม · rules ไม่ต้องแก้
- commit รูปแบบ `Area: อะไร (ทำไม)` ห้าม push

---

### Task 1: newsFeed — เก็บ 10 ไม่ตัด + groupFeed

**Files:**
- Modify: `src/utils/newsFeed.js`
- Test: `src/utils/newsFeed.test.js`

**Interfaces:**
- Produces: `EVENT_MAX = 10` · `buildFeed(rows, newsDocs, {now, myUid})` → รายการแบนเรียงใหม่→เก่า ไม่ตัดจำนวน (รูปเดิม `{id, uid, icon, text, t}`) · `groupFeed(items)` → `[{ key, head, rest }]` เรียงตาม `head.t` ใหม่→เก่า · ข่าวที่ `uid` เป็น null (เลน news ไม่มีเจ้าของ) = กลุ่มละ 1 ข่าว key = `item.id`

- [ ] **Step 1: แก้เทสเดิม 2 ตัวที่ล็อกเพดานไว้ + เพิ่มเทส groupFeed**

แทนที่เทส `'buildFeed จำกัด 2 บรรทัดต่อคน'` และ `'buildFeed ตัดเหลือ 10 บรรทัด'` ด้วย:

```js
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
```

และแก้บรรทัด import บนสุดเป็น:
```js
import { pushEvent, rankOfScore, buildFeed, groupFeed, timeAgo, EVENT_MAX } from './newsFeed.js'
```
เทส `'pushEvent ต่อหน้าสุด ตัดเหลือ EVENT_MAX'` ต้องยังผ่าน — ตรวจว่ามันสร้างรายการยาวกว่า EVENT_MAX; ถ้าสร้างแค่ 4–5 ชิ้น ให้แก้ให้สร้าง `EVENT_MAX + 2` ชิ้นด้วย loop

- [ ] **Step 2: รันให้เห็นว่าพัง**

Run: `node --test src/utils/newsFeed.test.js`
Expected: FAIL (`groupFeed` ไม่มี / ความยาว 2 ≠ 3 / EVENT_MAX 3)

- [ ] **Step 3: แก้ newsFeed.js**

- `EVENT_MAX = 10` พร้อมคอมเมนต์ขนาด: `10×~35B×105คน ≈ 37KB จากลิมิต 1MB (roster โหลดทุกเซสชันอยู่แล้ว อ่านเพิ่ม 0)`
- ลบ `FEED_MAX` และ `PER_USER_MAX` + ลูปตัดท้าย `buildFeed` → `return items` หลัง sort
- เพิ่ม:

```js
/**
 * รวมข่าวของคนเดียวกันเป็นกลุ่ม — หัวกลุ่ม = ข่าวล่าสุดของคนนั้น · กลุ่มเรียงตามเวลาหัวกลุ่ม ใหม่→เก่า
 * ข่าวเลน news ที่ไม่มีเจ้าของ (uid null) เป็นกลุ่มเดี่ยว
 * @param items ผลของ buildFeed (เรียงใหม่→เก่าแล้ว)
 */
export function groupFeed(items) {
  const out = []
  const byKey = new Map()
  for (const it of items || []) {
    const key = it.uid || it.id
    const g = byKey.get(key)
    if (g) { g.rest.push(it); continue }
    const ng = { key, head: it, rest: [] }
    byKey.set(key, ng)
    out.push(ng)
  }
  return out
}
```
หมายเหตุ: ข่าวเลน news ที่มี `uid` (ข่าว "ครั้งแรกของรุ่น" ของผู้เล่น) จะรวมเข้ากลุ่มคนนั้น — ตั้งใจ

- [ ] **Step 4: รันให้ผ่าน**

Run: `node --test src/utils/newsFeed.test.js`
Expected: PASS ทั้งหมด

- [ ] **Step 5: Commit**

```bash
git add src/utils/newsFeed.js src/utils/newsFeed.test.js
git commit -m "News: เก็บข่าวคนละ 10 + เลิกตัดกระดาน + groupFeed (user ขอ ข่าวแสดงไม่ครบ)"
```

### Task 2: NewsBoard แสดงแบบกลุ่ม

**Files:**
- Modify: `src/components/home/NewsBoard.vue`
- Modify: คอมเมนต์ใน `src/composables/useAchievements.js:51` ที่เขียนว่า "คนหนึ่งกินได้ไม่เกิน 3 ช่อง" → 10 ช่อง

**Interfaces:**
- Consumes: `buildFeed`, `groupFeed`, `timeAgo` จาก Task 1

- [ ] **Step 1: script**

```js
import { buildFeed, groupFeed, timeAgo } from '../../utils/newsFeed.js'
// ...
const groups = computed(() => groupFeed(buildFeed(members.rosterRows || {}, newsDocs.value,
  { now: now.value, myUid: auth.currentUser?.uid || null })))
const heads = computed(() => groups.value.map(g => g.head))   // แถบวิ่งบรรทัดเดียว = หัวกลุ่ม
const expanded = ref(new Set())
function toggle(key) {
  const s = new Set(expanded.value)
  s.has(key) ? s.delete(key) : s.add(key)
  expanded.value = s
}
```
เปลี่ยนทุกที่ที่ใช้ `items` → `heads` (current, ตัวนับใน start(), `v-if`) · ชื่อผู้ส่งในปุ่มกลุ่มใช้ `whoOf(g)`:
```js
// ชื่อสำหรับปุ่ม "อีก N ข่าวจาก X" — ตัวเอง = "คุณ" · ข่าวไม่มีเจ้าของไม่มีปุ่มอยู่แล้ว
const whoOf = (g) => g.head.uid === auth.currentUser?.uid ? 'คุณ' : (members.rosterRows?.[g.head.uid]?.n || '?')
```

- [ ] **Step 2: template ในส่วนรายการ**

```html
<ul v-if="open && groups.length" class="news-list">
  <li v-for="g in groups" :key="g.key" class="news-group">
    <div class="news-item">
      <span class="news-icon"><Emoji :char="g.head.icon" /></span>
      <div class="news-body">
        <div class="news-msg">{{ g.head.text }}</div>
        <div class="news-time">{{ timeAgo(g.head.t, now) }}</div>
        <button v-if="g.rest.length" type="button" class="news-more"
                :aria-expanded="expanded.has(g.key)" @click="toggle(g.key)">
          {{ expanded.has(g.key) ? '▴ ย่อ' : `▾ อีก ${g.rest.length} ข่าวจาก ${whoOf(g)}` }}
        </button>
      </div>
    </div>
    <ul v-if="expanded.has(g.key)" class="news-sub">
      <li v-for="n in g.rest" :key="n.id" class="news-item">
        <span class="news-icon"><Emoji :char="n.icon" /></span>
        <div class="news-body">
          <div class="news-msg">{{ n.text }}</div>
          <div class="news-time">{{ timeAgo(n.t, now) }}</div>
        </div>
      </li>
    </ul>
  </li>
</ul>
```
แก้ `v-if="loading || items.length"` บนสุด → `heads.length`

- [ ] **Step 3: style**

```css
.news-list { max-height: 360px; }   /* เพิ่มจาก 280 — ข่าวเยอะขึ้น (แก้ในกฎเดิม) */
.news-group { border-bottom: 1px solid rgba(0,0,0,.05); padding-bottom: 8px; }
.news-group:last-child { border-bottom: none; padding-bottom: 0; }
.news-group > .news-item { border-bottom: none; padding-bottom: 0; }
.news-more { all: unset; cursor: pointer; margin-top: 4px; font-size: .72rem; font-weight: 700; color: var(--primary); }
.news-more:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: 4px; }
.news-sub { list-style: none; margin: 6px 0 0 12px; padding: 0 0 0 10px; border-left: 2px solid var(--line); display: flex; flex-direction: column; gap: 6px; }
.news-sub .news-item { border-bottom: none; padding-bottom: 0; }
```
เปลี่ยนคอมเมนต์หัวสคริปต์ที่เขียน "เหลือ 5 doc" ไม่ต้องแตะ (ยังถูก)

- [ ] **Step 4: ตรวจ**

Run: `node --test src/utils/newsFeed.test.js` → PASS · `npm run build` → สำเร็จ ·
`grep -nE "font-size:\s*\.[0-6][0-9]?rem" src/components/home/NewsBoard.vue` → ไม่เจอ

- [ ] **Step 5: Commit**

```bash
git add src/components/home/NewsBoard.vue src/composables/useAchievements.js
git commit -m "News: กระดานรวมข่าวต่อคน + ปุ่มกางอีก N ข่าว (user ขอ กลัวรกแต่อยากเห็นครบ)"
```
