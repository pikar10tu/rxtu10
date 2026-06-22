# หน้าจัดการข้อสอบแบบกระชับ + ภาพรวมคลัง — Implementation Plan (SP2a)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เปลี่ยน list คลังข้อสอบจากการ์ดเต็มแนวตั้ง → แถวย่อ + กางดู (accordion ทีละข้อ) ย้ายตัวเลือก/เฉลย/คอมเมนต์/ปุ่มเข้าส่วนกาง + เพิ่ม header ภาพรวมคลัง

**Architecture:** frontend ล้วน — pure util `questionBankStats` (นับ total/published/draft/byDomain) + restructure template `qz-list` ใน QuestionsView เป็นแถวย่อ/กาง โดย reuse ค้นหา-กรอง-แบ่งหน้า-batch เดิม. ไม่แตะ rules/schema/QuizView/migration.

**Tech Stack:** Vue 3 `<script setup>` + Pinia · pure util + `node --test` · CSS scoped

## Global Constraints
- frontend ล้วน — **ไม่แตะ** firestore.rules / userSchema / QuizView / migration / index. deploy = push master (auto-deploy) พอ
- reuse logic เดิมทั้งหมด: `search`/`statusFilter`/`catFilter`/`domainFilter`/`filtered`/`visible`/`visibleCount`/`PAGE`/`selected`/`toggleSelect`/`edit`/`remove`/batch publish-delete — **ห้ามแตะ**
- คอมเมนต์ (SP1 `QuestionComments`) ต้องโหลด **lazy** — render เฉพาะตอนแถวถูกกาง (อยู่ใต้ `v-if="expandedId === q.id"`)
- `domains.js`: **`DOMAINS` เป็น array** `[{key,label}]` — ใช้ `domainLabel(k)` / `DOMAIN_KEYS` (อย่าทำ `DOMAINS[key]`)
- pure util เทสด้วย `node --test src/utils/<x>.test.js` · UI verify ด้วย `npm run build`
- commit style `Area: อะไร (ทำไม)` ไทยปนอังกฤษ
- access guard เดิม (`isQuestionEditor` เข้าหน้า, report panel `isAcademic`) **ห้ามแตะ**

---

### Task 1: `questionBankStats` util (pure, TDD)

**Files:**
- Create: `src/utils/questionBankStats.js`
- Test: `src/utils/questionBankStats.test.js`

**Interfaces:**
- Consumes: `DOMAIN_KEYS` จาก `../data/domains.js`
- Produces: `bankStats(list) → { total:int, published:int, draft:int, byDomain:{ [key]:int, none:int } }` — Task 3 ใช้

- [ ] **Step 1: เขียนเทสที่ยังไม่ผ่าน**

สร้าง `src/utils/questionBankStats.test.js`:
```js
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
```

- [ ] **Step 2: รันเทส ยืนยัน fail**

Run: `node --test src/utils/questionBankStats.test.js`
Expected: FAIL — `Cannot find module './questionBankStats.js'`

- [ ] **Step 3: เขียน implementation**

สร้าง `src/utils/questionBankStats.js`:
```js
// ภาพรวมคลังข้อสอบ — pure: นับจาก list ที่โหลดอยู่ (ไม่ยิง read เพิ่ม)
// byDomain วนจาก DOMAIN_KEYS เสมอ + bucket none (ทน domain เพิ่มใหม่/ข้อไม่ระบุ domain)
import { DOMAIN_KEYS } from '../data/domains.js'

export function bankStats(list) {
  const arr = Array.isArray(list) ? list : []
  const byDomain = Object.fromEntries(DOMAIN_KEYS.map(k => [k, 0]))
  byDomain.none = 0
  let published = 0
  for (const q of arr) {
    if (q && q.isPublished === true) published++
    const k = (q && DOMAIN_KEYS.includes(q.domain)) ? q.domain : 'none'
    byDomain[k]++
  }
  return { total: arr.length, published, draft: arr.length - published, byDomain }
}
```

- [ ] **Step 4: รันเทส ยืนยันผ่าน**

Run: `node --test src/utils/questionBankStats.test.js`
Expected: PASS ทั้ง 4 เทส, output pristine

- [ ] **Step 5: commit**

```bash
git add src/utils/questionBankStats.js src/utils/questionBankStats.test.js
git commit -m "Util: questionBankStats (นับ total/published/draft/byDomain pure + เทส)"
```

---

### Task 2: QuestionsView — แถวย่อ + กาง (accordion) + ย้ายคอมเมนต์เข้าส่วนกาง

**Files:**
- Modify: `src/views/QuestionsView.vue` — list markup (`~206-228`), ref `commentOpenId`→`expandedId`, import `domainLabel`, `<style>`

**Interfaces:**
- Consumes: `QuestionComments` (SP1, imported อยู่แล้ว), `domainLabel` จาก `../data/domains.js`, ของเดิม `selected/toggleSelect/edit/remove/LETTERS`
- Produces: `expandedId` ref + `toggleExpand(id)` — แทน `commentOpenId`

- [ ] **Step 1: เพิ่ม `domainLabel` ใน import domains**

ใน `<script setup>` หาบรรทัด `import { DOMAINS } from '../data/domains.js'` แล้วแก้เป็น:
```js
import { DOMAINS, DOMAIN_KEYS, domainLabel } from '../data/domains.js'
```
(DOMAIN_KEYS ใช้ใน Task 3 — เพิ่มตอนนี้เลยทีเดียว)

- [ ] **Step 2: เปลี่ยน `commentOpenId` → `expandedId` + helper**

หาบรรทัด `const commentOpenId = ref(null)` แทนด้วย:
```js
const expandedId = ref(null)
function toggleExpand(id) { expandedId.value = expandedId.value === id ? null : id }
```

- [ ] **Step 3: แทน markup ของ list (แถวย่อ + กาง)**

แทน block `<li v-for="q in visible" ...>...</li>` ทั้งก้อน (ปัจจุบันบรรทัด ~207-227) ด้วย:
```html
        <li v-for="q in visible" :key="q.id" class="qz-item" :class="{ sel: selected.has(q.id), open: expandedId === q.id }">
          <div class="qz-row" @click="toggleExpand(q.id)">
            <input class="qz-check-item" type="checkbox" :checked="selected.has(q.id)" @click.stop @change="toggleSelect(q.id)" />
            <span class="qz-badge" :class="q.isPublished ? 'pub' : 'draft'">{{ q.isPublished ? 'เผยแพร่' : 'ร่าง' }}</span>
            <span v-if="q.domain" class="qz-cat">{{ domainLabel(q.domain) || q.domain }}</span>
            <span class="qz-row-q">{{ q.question }}</span>
            <span class="qz-chev" :class="{ open: expandedId === q.id }">▸</span>
          </div>
          <div v-if="expandedId === q.id" class="qz-detail">
            <span v-if="q.category" class="qz-cat qz-cat-sm">{{ q.category }}</span>
            <ul class="qz-choices">
              <li v-for="(c, i) in q.choices" :key="i" :class="{ correct: i === q.answer }">
                <span class="qz-c-letter">{{ LETTERS[i] }}</span>{{ c }}
              </li>
            </ul>
            <div v-if="q.explanation" class="qz-exp"><Emoji char="💡" /> {{ q.explanation }}</div>
            <QuestionComments :questionId="q.id" />
            <div class="qz-detail-actions">
              <button class="qz-mini" @click="edit(q)">แก้ไข</button>
              <button class="qz-mini qz-danger" @click="remove(q)">ลบ</button>
            </div>
          </div>
        </li>
```
> หมายเหตุ: `@click.stop` บน checkbox = คลิกเลือกข้อแล้วแถวไม่กาง · ปุ่ม แก้ไข/ลบ อยู่ใน `.qz-detail` (ไม่บนแถว → ไม่ต้อง stop) · `QuestionComments` อยู่ใต้ `v-if` แถวกาง = lazy เดิม · เลิกปุ่ม 💬 เดี่ยวแล้ว

- [ ] **Step 4: แก้/เพิ่ม CSS (scoped)**

หา rule `.qz-item-top { ... }` (เดิมราว ~718) และ `.qz-item-actions { ... }` (~736) — **ลบทั้งสอง** (ไม่ใช้แล้ว) แล้วเพิ่มชุดใหม่ (วางใกล้ `.qz-item`):
```css
.qz-row { display: flex; align-items: center; gap: 7px; cursor: pointer; }
.qz-row-q { flex: 1; min-width: 0; font-size: .82rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.qz-chev { flex-shrink: 0; color: var(--muted); font-size: 1rem; transition: transform .15s; }
.qz-chev.open { transform: rotate(90deg); }
.qz-detail { margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--border); }
.qz-cat-sm { display: inline-block; margin-bottom: 6px; }
.qz-detail-actions { display: flex; gap: 6px; margin-top: 8px; }
```
> ถ้าเดิมมี `.qz-q { ... }` (โจทย์เต็ม) ที่ไม่ถูกอ้างแล้ว — ลบได้ (markup ใหม่ใช้ `.qz-row-q` แทน). ตรวจว่าไม่มี selector อื่นใช้ `.qz-q` ก่อนลบ (เช่น report panel ใช้ `.qz-report-q` คนละตัว — ปลอดภัย)

- [ ] **Step 5: verify build**

Run: `npm run build`
Expected: `✓ built` ไม่มี error

- [ ] **Step 6: commit**

```bash
git add src/views/QuestionsView.vue
git commit -m "Questions: list แถวย่อ+กาง accordion ทีละข้อ (ย้ายตัวเลือก/เฉลย/คอมเมนต์/ปุ่มเข้าส่วนกาง)"
```

---

### Task 3: QuestionsView — header ภาพรวมคลัง

**Files:**
- Modify: `src/views/QuestionsView.vue` — import `bankStats`, computed `bank`, header markup เหนือ `.qz-filters` (~161), `<style>`

**Interfaces:**
- Consumes: `bankStats` (Task 1), `DOMAIN_KEYS`/`domainLabel` (import แล้วใน Task 2 Step 1), `list` ref เดิม

- [ ] **Step 1: import + computed**

เพิ่ม import:
```js
import { bankStats } from '../utils/questionBankStats.js'
```
เพิ่ม computed (ใกล้ computed อื่น เช่นหลัง `filtered`/`visible`):
```js
const bank = computed(() => bankStats(list.value))
```

- [ ] **Step 2: เพิ่ม header markup**

วาง **เหนือ** `<div v-if="list.length" class="qz-filters">` (บรรทัด ~161), ภายใน `<template v-else>`:
```html
      <div v-if="list.length" class="qz-overview">
        <Emoji char="📊" /> ทั้งหมด <b>{{ bank.total }}</b> ข้อ · เผยแพร่ <b>{{ bank.published }}</b> · ร่าง <b>{{ bank.draft }}</b>
        <span class="qz-ov-dom">
          <template v-for="k in DOMAIN_KEYS" :key="k">
            <span v-if="bank.byDomain[k]"> · {{ domainLabel(k) || k }} {{ bank.byDomain[k] }}</span>
          </template>
          <span v-if="bank.byDomain.none"> · ไม่ระบุ {{ bank.byDomain.none }}</span>
        </span>
      </div>
```
> ใช้ `list` (ทั้งคลัง) ไม่ใช่ `filtered`/`visible` — header = ภาพรวมทั้งคลัง

- [ ] **Step 3: เพิ่ม CSS (scoped)**

เพิ่ม:
```css
.qz-overview { font-size: .72rem; color: var(--ink); background: var(--primary-light, #eef2ff); border-radius: 10px; padding: 8px 10px; margin-bottom: 10px; line-height: 1.5; }
.qz-overview b { font-weight: 800; }
.qz-ov-dom { color: var(--muted); }
```

- [ ] **Step 4: verify build**

Run: `npm run build`
Expected: `✓ built` ไม่มี error

- [ ] **Step 5: commit**

```bash
git add src/views/QuestionsView.vue
git commit -m "Questions: header ภาพรวมคลัง (ทั้งหมด/เผยแพร่/ร่าง/แยก domain)"
```

---

## Final verification (หลังครบทุก task)
- [ ] `node --test src/utils/questionBankStats.test.js` → เขียวทั้ง 4 เทส
- [ ] `npm run build` → `✓ built` ไม่มี error
- [ ] (manual หลัง deploy) list เป็นแถวย่อ · กางทีละข้อเห็นตัวเลือก/เฉลย/คอมเมนต์/ปุ่ม · checkbox เลือกได้ไม่กางแถว · batch publish/ลบ ปกติ · ค้นหา/กรอง/แบ่งหน้า ปกติ · header ภาพรวมถูก · report panel ยังซ่อนจาก instructor

## หมายเหตุ deploy
- push master = auto-deploy frontend (GitHub Actions) · **ไม่ต้อง deploy rules** (ไม่แตะ rules)
- ไม่มี interactive test ที่ต้องบัญชีพิเศษ — แต่ verify หน้าตา/accordion บนมือถือจริงหลัง deploy
