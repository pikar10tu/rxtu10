# Phase 1 Launch-Critical Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เก็บงาน launch-critical 4 ก้อน (privacy/member-sort, contextual help, domain infra, exam history) ให้ครบก่อนเปิดตัวทั้งชั้นปี

**Architecture:** Vue 3 + Pinia + Firebase (client-only). Logic ใหม่ทั้งหมดอยู่ใน pure util (`src/utils/*.js`) มี `node --test` คู่กัน; UI เป็น single-file component ต่อหน้า; ค่าคงที่อยู่ใน `src/data/*.js`. 4 ก้อนอิสระต่อกัน build ตามลำดับ D → C → A → B (B ต้องรอ A).

**Tech Stack:** Vue 3 (`<script setup>`), Pinia, Firebase Firestore (modular SDK), Vite, `node:test` + `node:assert/strict` สำหรับ pure utils

## Global Constraints

- ทดสอบ pure util: `node --test src/utils/<file>.test.js` · ตรวจ build ทั้งโปรเจกต์: `npm run build`
- ไม่มี test runner กลาง/lint — UI ตรวจด้วย `npm run build` + ลองใน `npm run dev`
- เขียน user doc ผ่าน `auth.patchUser(optimistic, server)` เท่านั้น (ไม่เกี่ยวกับแผนนี้มากแต่ห้าม bypass)
- ข้อความผู้ใช้ทุกช่อง → `cleanText(str, LIMITS.xxx)` จาก `utils/text.js` ก่อนเขียน
- commit style: `Area: อะไร (ทำไม)` ภาษาไทยปนอังกฤษ · ลงท้าย `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- **git add เฉพาะไฟล์ที่ตั้งใจ** — ห้าม `git add -A` (เคยมีไฟล์หลุดปน)
- single-file component + scoped style · สีธีม indigo `#4f46e5` · emoji ในเทมเพลตใช้ `<Emoji char="…" />` เสมอ (ห้าม emoji ดิบใน JS string/template text → tofu)
- **rules ไม่ต้องแก้ทั้ง 4 ก้อน** · firestore index เพิ่มผ่าน `firestore.indexes.json` + `firebase deploy --only firestore:indexes`
- domain มี 3 ค่าคงที่: `care` / `sci` / `law` — logic ที่วน domain ต้องวนจาก `DOMAIN_KEYS` เสมอ (ห้าม hardcode)

---

# ก้อน D — Privacy: ลบ Rank + Member sort

## Task D1: `sortMembers` pure util

**Files:**
- Create: `src/utils/sortMembers.js`
- Test: `src/utils/sortMembers.test.js`

**Interfaces:**
- Produces: `sortMembers(list, key = 'studentId', myUid = null) → Member[]` (คืน array ใหม่ ไม่ mutate). `key ∈ {'studentId','nickname','level'}`. Member = `{ uid, studentId, nickname, registered, residence?: { level } }`

- [ ] **Step 1: เขียนเทสที่ยังไม่ผ่าน**

`src/utils/sortMembers.test.js`:
```js
// เทส sortMembers — จัดเรียงสมาชิก + ปักหมุดตัวเอง + registered ก่อน
// รัน: node --test src/utils/sortMembers.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sortMembers } from './sortMembers.js'

const M = (uid, studentId, nickname, level = 1, registered = true) =>
  ({ uid, studentId, nickname, registered, residence: { level } })

test('default = เรียงตามรหัสน้อย→มาก', () => {
  const out = sortMembers([M('a', '6502', 'บี'), M('b', '6501', 'เอ')])
  assert.deepEqual(out.map(m => m.studentId), ['6501', '6502'])
})

test('ปักหมุดตัวเองช่องแรกเสมอ แม้รหัสไม่ใช่ตัวน้อยสุด', () => {
  const out = sortMembers([M('a', '6501', 'เอ'), M('me', '6599', 'ฉัน'), M('b', '6502', 'บี')], 'studentId', 'me')
  assert.equal(out[0].uid, 'me')
  assert.deepEqual(out.slice(1).map(m => m.studentId), ['6501', '6502'])
})

test('เรียงตามชื่อเล่น (ก-ฮ)', () => {
  const out = sortMembers([M('a', '1', 'แมว'), M('b', '2', 'กบ')], 'nickname')
  assert.deepEqual(out.map(m => m.nickname), ['กบ', 'แมว'])
})

test('เรียงตามเลเวล มาก→น้อย', () => {
  const out = sortMembers([M('a', '1', 'x', 3), M('b', '2', 'y', 9)], 'level')
  assert.deepEqual(out.map(m => m.uid), ['b', 'a'])
})

test('ยังไม่เข้าระบบไปท้ายเสมอ', () => {
  const out = sortMembers([M('a', '6501', 'เอ', 1, false), M('b', '6502', 'บี', 1, true)])
  assert.deepEqual(out.map(m => m.uid), ['b', 'a'])
})

test('pure: ไม่ mutate input', () => {
  const input = [M('a', '6502', 'บี'), M('b', '6501', 'เอ')]
  const snapshot = input.map(m => m.uid)
  sortMembers(input)
  assert.deepEqual(input.map(m => m.uid), snapshot)
})
```

- [ ] **Step 2: รันเทสให้ FAIL**

Run: `node --test src/utils/sortMembers.test.js`
Expected: FAIL — `Cannot find module './sortMembers.js'`

- [ ] **Step 3: เขียน implementation**

`src/utils/sortMembers.js`:
```js
// จัดเรียงสมาชิก: ตัวเองปักหมุดช่องแรกเสมอ → registered ก่อน → ตาม key ที่เลือก
// pure: คืน array ใหม่ ไม่ mutate ของเดิม
function byKey(key) {
  if (key === 'nickname') return (a, b) => String(a.nickname || '').localeCompare(String(b.nickname || ''), 'th')
  if (key === 'level')    return (a, b) => (b.residence?.level || 1) - (a.residence?.level || 1)
  // default studentId น้อย→มาก (numeric-aware)
  return (a, b) => String(a.studentId || '').localeCompare(String(b.studentId || ''), undefined, { numeric: true })
}

export function sortMembers(list, key = 'studentId', myUid = null) {
  const cmp = byKey(key)
  return (list || []).slice().sort((a, b) => {
    const aSelf = a.uid === myUid ? 0 : 1
    const bSelf = b.uid === myUid ? 0 : 1
    if (aSelf !== bSelf) return aSelf - bSelf
    const reg = (b.registered ? 1 : 0) - (a.registered ? 1 : 0)
    if (reg) return reg
    return cmp(a, b)
  })
}
```

- [ ] **Step 4: รันเทสให้ PASS**

Run: `node --test src/utils/sortMembers.test.js`
Expected: PASS ทั้ง 6 เทส

- [ ] **Step 5: Commit**

```bash
git add src/utils/sortMembers.js src/utils/sortMembers.test.js
git commit -m "Members: sortMembers util (เรียง+ปักหมุดตัวเอง, pure+เทส)"
```

---

## Task D2: ต่อ MembersView เข้ากับ `sortMembers` + dropdown + ป้าย "คุณ"

**Files:**
- Modify: `src/views/MembersView.vue` (script `list` computed ~line 84-95, import, template หัวหน้า ~line 3-17, การ์ด ~line 22-37)

**Interfaces:**
- Consumes: `sortMembers(list, key, myUid)` จาก Task D1

- [ ] **Step 1: import + state การเรียง + ใช้ sortMembers**

ใน `<script setup>` ของ `MembersView.vue`:
- เพิ่ม import: `import { sortMembers } from '../utils/sortMembers.js'`
- เพิ่ม import auth: `import { useAuthStore } from '../stores/auth.js'` + `const auth = useAuthStore()` + `const myUid = computed(() => auth.currentUser?.uid)`
- เพิ่ม state: `const sortKey = ref('studentId')`
- แทน `list` computed (เดิมที่ `.sort(...)` ~line 90-94) ด้วย:
```js
const list = computed(() => {
  const q = search.value.trim().toLowerCase()
  let r = roster.value
  if (track.value !== 'all') r = r.filter(m => m.track === track.value)
  if (q) r = r.filter(m => [m.nickname, m.realName, m.studentId].some(v => (v || '').toLowerCase().includes(q)))
  return sortMembers(r, sortKey.value, myUid.value)
})
```

- [ ] **Step 2: เพิ่ม dropdown เลือกการเรียงในเทมเพลต**

ใต้แถว `.mv-filters` (หลัง `</div>` ของ filters ~line 17) เพิ่ม:
```html
<div class="mv-sort">
  <label class="mv-sort-label" for="mv-sort-sel">เรียงตาม</label>
  <select id="mv-sort-sel" v-model="sortKey" class="mv-sort-sel">
    <option value="studentId">รหัสนักศึกษา</option>
    <option value="nickname">ชื่อเล่น</option>
    <option value="level">เลเวลบ้าน</option>
  </select>
</div>
```
เพิ่ม style ใน `<style scoped>`:
```css
.mv-sort { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.mv-sort-label { font-size: .7rem; font-weight: 700; color: rgba(0,0,0,.5); }
.mv-sort-sel { border: 2px solid var(--ink); border-radius: 10px; padding: 5px 10px; font-family: inherit; font-size: .74rem; font-weight: 700; background: #fff; color: var(--ink); }
```

- [ ] **Step 3: ป้าย "คุณ" บนการ์ดตัวเอง**

ในการ์ด `.mv-card` (หลัง `.mv-nick` ~line 32) เพิ่ม:
```html
<div v-if="m.uid === myUid" class="mv-you">คุณ</div>
```
style:
```css
.mv-you { font-size: .55rem; font-weight: 800; color: #fff; background: var(--primary); border-radius: 999px; padding: 1px 7px; }
```

- [ ] **Step 4: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ ไม่มี error

- [ ] **Step 5: ตรวจด้วยตา (dev)**

Run: `npm run dev` → เปิด Members: default เรียงตามรหัสน้อย→มาก, การ์ดตัวเองอยู่ช่องแรกมีป้าย "คุณ", เปลี่ยน dropdown แล้วลำดับเปลี่ยน, ยังไม่เข้าระบบอยู่ท้าย

- [ ] **Step 6: Commit**

```bash
git add src/views/MembersView.vue
git commit -m "Members: เพิ่มจัดเรียง (รหัส/ชื่อ/เลเวล) + ปักหมุดการ์ดตัวเอง (ป้าย 'คุณ')"
```

---

## Task D3: ลบ Rank ทั้งหน้า

**Files:**
- Delete: `src/views/RankView.vue`
- Modify: `src/router/index.js:13` (ลบ route `/rank`)
- Modify: `src/views/HomeView.vue` (ลบ shortcut `sc-rank` ~line 42-46 + CSS `.sc-rank` ~line 131)

- [ ] **Step 1: หา ref ทั้งหมดของ rank**

Run: `grep -rn "rank\|Rank" src/ --include=*.vue --include=*.js`
ตรวจผลลัพธ์: ที่ต้องลบ = `router/index.js` route, `HomeView.vue` shortcut. ที่ **ห้ามแตะ** = `ResidenceBadge`, `pvpVictories`/`towerBest` ใน user schema, `RankView.vue` (จะลบทั้งไฟล์)

- [ ] **Step 2: ลบ route**

`src/router/index.js`: ลบบรรทัด
```js
{ path: '/rank',      name: 'rank',      component: () => import('../views/RankView.vue')      },
```

- [ ] **Step 3: ลบ shortcut ใน Home**

`src/views/HomeView.vue`: ลบบล็อก (~line 42-46):
```html
<RouterLink to="/rank" class="home-shortcut sc-rank">
  <span class="hs-icon"><Emoji char="🏆" /></span>
  <span class="hs-label">Rank</span>
  <span class="hs-sub">อันดับ</span>
</RouterLink>
```
และลบ CSS `.sc-rank .hs-icon { background: #fff0cf; }` (~line 131)

- [ ] **Step 4: ลบไฟล์ RankView**

```bash
git rm src/views/RankView.vue
```

- [ ] **Step 5: ตรวจ build (สำคัญ — กัน import ค้าง)**

Run: `npm run build`
Expected: build สำเร็จ — ถ้า error `RankView` ที่ไหน แปลว่ายังมี ref ค้าง ให้กลับไป Step 1

- [ ] **Step 6: Commit**

```bash
git add src/router/index.js src/views/HomeView.vue
git commit -m "Privacy: ลบหน้า Rank ทั้งหมด (route+Home shortcut+RankView) — ไม่โชว์อันดับตอน launch"
```

---

# ก้อน C — Contextual help (ตัด guide รวม)

## Task C1: แปลง guide เป็น keyed map + useHelp(topic) + HelpModal section เดียว + HelpButton

**Files:**
- Modify: `src/data/guide.js` (เปลี่ยน export เป็น keyed map)
- Modify: `src/composables/useHelp.js` (bool → topic)
- Modify: `src/components/help/HelpModal.vue` (accordion รวม → section เดียว + ตาราง residence)
- Create: `src/components/help/HelpButton.vue`

**Interfaces:**
- Produces: `GUIDE` (object keyed by topic) จาก `data/guide.js` · `useHelp() → { helpTopic, openHelp(topic), closeHelp }` · `<HelpButton topic="..." />`

- [ ] **Step 1: เขียน `data/guide.js` ใหม่เป็น keyed map**

`src/data/guide.js` (ย้ายเนื้อหาเดิมทั้งหมด คงข้อความ body เดิม แก้เฉพาะ residence ให้เลิกพูด "ปราสาท 12 ขั้น"):
```js
// ════════════════════════════════════════════════════════════
//  Contextual help — เนื้อหาช่วยเหลือราย feature (keyed by topic)
//  ใช้กับ <HelpButton topic="..."> → เปิด HelpModal แสดง section เดียว
//  { icon, title, body[], soon?, table? }  · table:'residence' = แสดงตารางรายได้
// ════════════════════════════════════════════════════════════
export const GUIDE = {
  residence: {
    icon: '🏠', title: 'ที่อยู่อาศัย', table: 'residence',
    body: [
      'หัวใจของเกม! ใช้เหรียญอัปเกรดที่อยู่อาศัยจากจุดเริ่มต้นไต่ไปเรื่อยๆ',
      'ยิ่งเลเวลสูง → รายได้/วันเยอะขึ้น, ปลดล็อกช่องเก็บเพ็ท, ช่องสู้, ตลาด และของอื่นๆ',
      'เลเวลบ้านจะโชว์บนโปรไฟล์ให้เพื่อนเห็น เป็นเครื่องวัดความเก๋า!',
    ],
  },
  income: {
    icon: '💰', title: 'รายได้ (สะสมรายชั่วโมง)',
    body: [
      'รายได้สะสมเข้าทุกชั่วโมงเองที่หน้า Home — กดเก็บเมื่อไหร่ก็ได้',
      'อัตรา = รายได้จากที่อยู่อาศัย + รวมจากสัตว์เลี้ยงในคลัง',
      'สะสมได้สูงสุด 24 ชม. — ถ้าทิ้งไว้นานกว่านั้นส่วนเกินจะหาย เลยควรเข้ามาเก็บทุกวัน!',
      'เหรียญเป็นข้อมูลส่วนตัว — คนอื่นมองไม่เห็นว่าคุณมีกี่เหรียญ',
    ],
  },
  pets: {
    icon: '🐾', title: 'สัตว์เลี้ยง · คลังเก็บ · คลังพัก',
    body: [
      'สัตว์เลี้ยงทุกตัวใน "คลังเก็บ" สร้างรายได้ให้ทุกวัน',
      'คลังเก็บมีจำกัด (เริ่ม 20 ช่อง) ขยายได้ด้วยการอัปบ้าน',
      'เพ็ทที่เกินช่อง → ไปอยู่ "คลังพัก" (เก็บไว้ ไม่หาย แต่ไม่ได้รายได้และเอาไปสู้ไม่ได้) ย้ายกลับเข้าได้เมื่อมีช่องว่าง',
      'วิวัฒน์ (เกรด) และตีบวก (refine) ทำให้เพ็ทแข็งแกร่งและมีค่ามากขึ้น',
    ],
  },
  farm: {
    icon: '🌾', title: 'ฟาร์ม',
    body: [
      'ซื้อเมล็ด → ปลูกในแปลง → รอจนโตเต็มที่ → เก็บเกี่ยว → ขายได้เหรียญ',
      'พืชแต่ละระดับใช้เวลาต่างกัน: ธรรมดา (นาที) · แรร์ (ชั่วโมง) · อิพิค (เกือบวัน) · ตำนาน (หลายวัน) — รอนานยิ่งได้เยอะ',
      'อัปที่อยู่อาศัยเพื่อปลดล็อกแปลงเพิ่ม + เมล็ดพันธุ์ระดับสูง',
    ],
  },
  study: {
    icon: '📚', title: 'ทบทวนกลุ่มยา (Flashcard)',
    body: [
      'แท็บ Study — ฝึกจำกลุ่ม/กลไกของยาด้วย flashcard แบบ spaced repetition (SM-2)',
      'เปิดการ์ดดูเฉลย แล้วให้คะแนนตัวเอง: ลืม / ยาก / จำได้ / ง่าย — ระบบจะคำนวณว่าควรเอากลับมาทบทวนอีกเมื่อไหร่ (ยิ่งจำแม่นยิ่งทิ้งช่วงนาน)',
      'ทบทวนการ์ดที่ "ครบกำหนด" ในแต่ละวันเพื่อจำได้ระยะยาว และได้เหรียญ +5/ใบ',
    ],
  },
  quiz: {
    icon: '📝', title: 'ทำข้อสอบ',
    body: [
      'เลือกหมวด (Care / Sci / Law) แล้วกดเริ่ม — ระบบสุ่มข้อให้',
      'ทำข้อสอบได้เหรียญ +10/ข้อที่ถูก (มีเพดานต่อวัน)',
      'เจอข้อผิด/เฉลยพลาด กดปุ่ม 🚩 แจ้งทีมวิชาการได้ ถ้าผิดจริงได้เหรียญรางวัล',
      'ดู "ประวัติของฉัน" เพื่อติดตามพัฒนาการแยกตามหมวด',
    ],
  },
  shop: {
    icon: '🏪', title: 'ร้านค้า · กาชา',
    body: [
      'ใช้เหรียญเปิดไข่/กาชาเพื่อสุ่มสัตว์เลี้ยง',
      'ยิ่ง tier สูง โอกาสได้เพ็ทหายากยิ่งมาก',
    ],
  },
  potential: {
    icon: '⚗️', title: 'ศักยภาพ (Potential)', soon: true,
    body: [
      'ปลดศักยภาพเพ็ทด้วยการสังเวยเพ็ท rarity เดียวกัน เพื่อสุ่มพลังพิเศษ (เช่น +ATK%, +Crit, +รายได้%)',
      'rarity สูง = ใส่ศักยภาพได้หลายช่อง',
      'รีโรลได้ แล้วเลือกว่าจะเก็บของเดิมหรือเอาอันใหม่ทับ',
    ],
  },
}
```

- [ ] **Step 2: เขียน `useHelp.js` ใหม่ (bool → topic)**

`src/composables/useHelp.js`:
```js
import { ref } from 'vue'

// shared singleton: topic ที่กำลังเปิดอยู่ (null = ปิด)
const helpTopic = ref(null)

export function useHelp() {
  function openHelp(topic) { helpTopic.value = topic }
  function closeHelp() { helpTopic.value = null }
  return { helpTopic, openHelp, closeHelp }
}
```

- [ ] **Step 3: เขียน `HelpModal.vue` ใหม่ (section เดียว + ตาราง residence)**

`src/components/help/HelpModal.vue`:
```html
<template>
  <div v-if="section" class="help-ov" @click.self="closeHelp">
    <div class="help-box">
      <div class="help-head">
        <span><Emoji :char="section.icon" /> {{ section.title }}</span>
        <button class="help-x" aria-label="ปิด" @click="closeHelp">✕</button>
      </div>
      <div class="help-scroll">
        <span v-if="section.soon" class="help-soon">เร็วๆ นี้</span>
        <ul class="help-body">
          <li v-for="(line, j) in section.body" :key="j">{{ line }}</li>
        </ul>
        <table v-if="section.table === 'residence'" class="help-tbl">
          <thead><tr><th>Lv</th><th>ที่อยู่อาศัย</th><th>รายได้/วัน</th></tr></thead>
          <tbody>
            <tr v-for="t in residenceRows" :key="t.level">
              <td>{{ t.level }}</td>
              <td><Emoji :char="t.art" /> {{ t.tierName }}</td>
              <td>{{ t.dailyIncome.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { computed } from 'vue'
import { GUIDE } from '../../data/guide.js'
import { useHelp } from '../../composables/useHelp.js'
import { RESIDENCE_TIERS, MAX_RESIDENCE_LEVEL } from '../../data/residence.js'

const { helpTopic, closeHelp } = useHelp()
const section = computed(() => helpTopic.value ? GUIDE[helpTopic.value] : null)
const residenceRows = computed(() => RESIDENCE_TIERS.filter(t => t.level <= MAX_RESIDENCE_LEVEL))
</script>

<style scoped>
.help-ov { position: fixed; inset: 0; z-index: 400; background: rgba(0,0,0,.45); display: flex; align-items: flex-end; justify-content: center; }
.help-box { background: #fff; width: 100%; max-width: 480px; max-height: 85dvh; border: 2px solid var(--ink); border-bottom: none; border-radius: 18px 18px 0 0; display: flex; flex-direction: column; animation: help-up .2s ease; }
@keyframes help-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
.help-head { display: flex; align-items: center; justify-content: space-between; padding: 16px; border-bottom: 1px solid rgba(0,0,0,.07); }
.help-head span:first-child { font-family: var(--font-display); font-weight: 400; font-size: 1.25rem; color: var(--ink); }
.help-x { border: none; background: rgba(0,0,0,.06); border-radius: 8px; width: 30px; height: 30px; font-size: .9rem; cursor: pointer; }
.help-scroll { overflow-y: auto; overscroll-behavior: contain; padding: 14px 16px 22px; }
.help-soon { display: inline-block; font-size: .58rem; font-weight: 700; color: #b45309; background: rgba(251,191,36,.18); padding: 2px 7px; border-radius: 999px; margin-bottom: 8px; }
.help-body { margin: 0 0 12px; padding-left: 20px; display: flex; flex-direction: column; gap: 7px; }
.help-body li { font-size: .82rem; color: rgba(0,0,0,.65); line-height: 1.55; }
.help-tbl { width: 100%; border-collapse: collapse; font-size: .72rem; }
.help-tbl th, .help-tbl td { border: 1px solid rgba(0,0,0,.1); padding: 5px 8px; text-align: left; }
.help-tbl th { background: rgba(0,0,0,.04); font-weight: 700; }
.help-tbl td:last-child, .help-tbl th:last-child { text-align: right; font-variant-numeric: tabular-nums; }
</style>
```

- [ ] **Step 4: เขียน `HelpButton.vue`**

`src/components/help/HelpButton.vue`:
```html
<template>
  <button class="help-btn" type="button" aria-label="ดูวิธีใช้" @click.stop="openHelp(topic)">?</button>
</template>

<script setup>
import { useHelp } from '../../composables/useHelp.js'
defineProps({ topic: { type: String, required: true } })
const { openHelp } = useHelp()
</script>

<style scoped>
.help-btn {
  flex-shrink: 0; width: 22px; height: 22px; border-radius: 999px;
  border: 2px solid var(--ink); background: #fff; color: var(--ink);
  font-weight: 800; font-size: .8rem; line-height: 1; cursor: pointer; padding: 0;
}
.help-btn:active { transform: translate(1px,1px); }
</style>
```

- [ ] **Step 5: ตรวจ build**

Run: `npm run build`
Expected: **จะ FAIL** เพราะ `HelpModal.vue` เดิม import `GUIDE_SECTIONS` (ชื่อเก่า) ที่ App.vue/MigrationWelcome ยังอ้าง `openHelp()` แบบไม่มี arg — แก้ใน Task C2/C3. ถ้าอยากให้ build ผ่านก่อน commit ให้ทำ C2+C3 ต่อเลยแล้ว build รวด (ดู Step 6)

- [ ] **Step 6: Commit (รวมกับ C2, C3 ถ้า build ยังไม่ผ่าน)**

> หมายเหตุ: C1–C3 แตะกลไก help เดียวกัน — ทำต่อเนื่องแล้ว `npm run build` ให้ผ่านครั้งเดียวก่อน commit รวม หรือ commit C1 ตอนนี้แล้ว build ผ่านหลัง C3 ก็ได้ แนะนำ commit หลัง C3
```bash
git add src/data/guide.js src/composables/useHelp.js src/components/help/HelpModal.vue src/components/help/HelpButton.vue
# commit หลัง C3 (ดู Task C3 Step 4)
```

---

## Task C2: วางปุ่ม `?` ตาม 6 surface

**Files:**
- Modify: `src/components/residence/ResidenceCard.vue` (topic `residence`)
- Modify: `src/views/PlayView.vue` (topic `farm` — ที่หัวการ์ดฟาร์ม หรือหัวหน้า Play)
- Modify: `src/views/StudyView.vue` (topic `study`)
- Modify: `src/views/QuizView.vue` (topic `quiz` — ที่ quiz home header)
- Modify: `src/views/ShopView.vue` (topic `shop`)
- Modify: `src/views/PetsView.vue` (topic `pets`)

**Interfaces:**
- Consumes: `<HelpButton topic="..." />` จาก Task C1

- [ ] **Step 1: ใส่ HelpButton ในแต่ละหน้า**

ในแต่ละไฟล์: import `import HelpButton from '<rel>/components/help/HelpButton.vue'` (path สัมพัทธ์: views ใช้ `../components/help/HelpButton.vue`, ResidenceCard ใช้ `../help/HelpButton.vue`) แล้ววาง `<HelpButton topic="…" />` ที่มุมขวาบนของหัวการ์ด/หัวหน้า โดยให้ container ของหัวเป็น flex มี `justify-content: space-between` (ถ้าหัวเดิมไม่ใช่ flex ให้ครอบ title + ปุ่มใน `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px">`)

ตัวอย่าง (QuizView home header ~line 5):
```html
<div class="qv-head">
  <button class="qv-back" aria-label="ย้อนกลับ" @click="$router.back()">‹</button>
  <span class="qv-head-title"><Emoji char="📝" /> ทำข้อสอบ</span>
  <HelpButton topic="quiz" style="margin-left:auto" />
</div>
```
topic ต่อไฟล์: ResidenceCard=`residence`, PlayView=`farm`, StudyView=`study`, QuizView=`quiz`, ShopView=`shop`, PetsView=`pets`

- [ ] **Step 2: ทำต่อ C3 ก่อน build** (build รวมที่ C3)

---

## Task C3: ตัด FAB เดิม + แก้ MigrationWelcome + build ผ่าน

**Files:**
- Modify: `src/App.vue:25` (ลบ `help-fab`) — เก็บ `<HelpModal />` (line 26) ไว้
- Modify: `src/components/onboarding/MigrationWelcome.vue:79` (เลิกเรียก `openHelp()`)

- [ ] **Step 1: ลบ FAB ใน App.vue**

`src/App.vue`: ลบบรรทัด (~line 25)
```html
<button class="help-fab" title="วิธีเล่น" @click="openHelp"><Emoji char="❓" /></button>
```
และลบ `const { openHelp } = useHelp()` (~line 56) + CSS `.help-fab {…}` ถ้ามี · **คง** `import HelpModal` และ `<HelpModal />` ไว้

- [ ] **Step 2: แก้ MigrationWelcome**

`src/components/onboarding/MigrationWelcome.vue`: ลบ import/ใช้งาน `useHelp` + บรรทัด `if (!startPlaying) openHelp()` (~line 79) ออก (ผู้ใช้ใหม่กด `?` ราย feature เอง) — ตรวจว่าไม่มี ref `openHelp` ค้างในไฟล์

- [ ] **Step 3: ตรวจ build (รวม C1+C2+C3)**

Run: `npm run build`
Expected: build สำเร็จ — ถ้า error `GUIDE_SECTIONS` / `helpOpen` / `openHelp` ที่ไหน แปลว่ายังมี ref กลไกเก่าค้าง ให้ตามแก้

- [ ] **Step 4: ตรวจด้วยตา + Commit รวม C1–C3**

Run: `npm run dev` → กด `?` แต่ละหน้าเปิด modal ตรง topic, residence แสดงตารางรายได้, ไม่มีปุ่ม ❓ ลอยแล้ว, ผู้ใช้ใหม่ไม่เด้ง guide รวม
```bash
git add src/data/guide.js src/composables/useHelp.js src/components/help/HelpModal.vue src/components/help/HelpButton.vue \
        src/components/residence/ResidenceCard.vue src/views/PlayView.vue src/views/StudyView.vue \
        src/views/QuizView.vue src/views/ShopView.vue src/views/PetsView.vue \
        src/App.vue src/components/onboarding/MigrationWelcome.vue
git commit -m "Help: เปลี่ยนเป็น contextual help ราย feature (HelpButton ? + guide keyed map) ตัด FAB/modal รวม"
```

---

# ก้อน A — Domain infrastructure (Care/Sci/Law)

## Task A1: `data/domains.js` + รองรับ domain ใน import

**Files:**
- Create: `src/data/domains.js`
- Modify: `src/utils/importQuestions.js:31-38` (เพิ่ม domain ใน rowFromItem)
- Modify: `src/utils/importQuestions.test.js` (เพิ่มเคส domain)

**Interfaces:**
- Produces: `DOMAINS` (`[{key,label}]`), `DOMAIN_KEYS` (`['care','sci','law']`), `domainLabel(key)→string|null`, `isDomainKey(key)→bool` จาก `data/domains.js`

- [ ] **Step 1: เขียน `data/domains.js`**

`src/data/domains.js`:
```js
// ════════════════════════════════════════════════════════════
//  Domain (หมวดใหญ่ของข้อสอบ) — 3 ค่าคงที่ แหล่งความจริงเดียว
//  ใช้ใน: questions.domain, quiz filter, examSessions.domainStats, exam history
// ════════════════════════════════════════════════════════════
export const DOMAINS = [
  { key: 'care', label: 'Care' },
  { key: 'sci',  label: 'Sci'  },
  { key: 'law',  label: 'Law'  },
]
export const DOMAIN_KEYS = DOMAINS.map(d => d.key)
export const isDomainKey = (k) => DOMAIN_KEYS.includes(k)
export const domainLabel = (k) => DOMAINS.find(d => d.key === k)?.label || null
```

- [ ] **Step 2: เพิ่มเทส domain ใน importQuestions.test.js**

เพิ่มท้าย `src/utils/importQuestions.test.js`:
```js
test('domain ที่ถูกต้อง → เก็บค่า', () => {
  const r = parseImport(one({ question: 'Q', choices: ['a', 'b'], answer: 0, domain: 'care' }))
  assert.equal(r.rows[0].domain, 'care')
})

test('domain มั่ว (ไม่อยู่ใน Care/Sci/Law) → null', () => {
  const r = parseImport(one({ question: 'Q', choices: ['a', 'b'], answer: 0, domain: 'xyz' }))
  assert.equal(r.rows[0].domain, null)
})

test('domain ไม่ส่งมา → null', () => {
  const r = parseImport(one({ question: 'Q', choices: ['a', 'b'], answer: 0 }))
  assert.equal(r.rows[0].domain, null)
})
```

- [ ] **Step 3: รันเทสให้ FAIL**

Run: `node --test src/utils/importQuestions.test.js`
Expected: FAIL — 3 เทสใหม่ fail (`r.rows[0].domain` เป็น undefined)

> หมายเหตุ: เทสเดิม `'นำเข้าข้อที่ถูกต้อง 1 ข้อ'` ใช้ `assert.deepEqual` กับ object ที่ไม่มี `domain` → จะ fail ด้วยหลังเพิ่ม field ใน Step 4 · แก้ใน Step 4 ให้เพิ่ม `domain: null` ใน expected ของเทสนั้น

- [ ] **Step 4: เพิ่ม domain ใน rowFromItem + แก้เทส deepEqual เดิม**

`src/utils/importQuestions.js` — เพิ่ม import บนสุด:
```js
import { isDomainKey } from '../data/domains.js'
```
ใน `return { ... }` ของ `rowFromItem` (หลัง `category:` line 35) เพิ่ม:
```js
    domain: isDomainKey(item.domain) ? item.domain : null,
```
แล้วในเทส `'นำเข้าข้อที่ถูกต้อง 1 ข้อ'` (importQuestions.test.js) เพิ่ม `domain: null,` ใน object ที่ `assert.deepEqual` เทียบ (เพราะตอนนี้ทุก row มี field domain)

- [ ] **Step 5: รันเทสให้ PASS**

Run: `node --test src/utils/importQuestions.test.js`
Expected: PASS ทุกเทส (รวม 3 เคสใหม่)

- [ ] **Step 6: Commit**

```bash
git add src/data/domains.js src/utils/importQuestions.js src/utils/importQuestions.test.js
git commit -m "Domain: data/domains.js (Care/Sci/Law) + รองรับ domain ตอน import (pure+เทส)"
```

---

## Task A2: ต่อ `buildMeta` ให้นับ domain

**Files:**
- Modify: `src/utils/questionsMeta.js`
- Modify: `src/utils/questionsMeta.test.js`

**Interfaces:**
- Produces: `buildMeta(questions) → { publishedTotal, categories, domains }` โดย `domains` = `{ care:n, sci:n, law:n }` (เฉพาะ published, นับเป็น 0 ถ้าไม่มี)

- [ ] **Step 1: เพิ่มเทส domains ใน questionsMeta.test.js**

เพิ่มท้าย `src/utils/questionsMeta.test.js`:
```js
import { DOMAIN_KEYS } from '../data/domains.js'

test('domains = นับข้อ published ต่อ domain (มีครบทุก key เป็น 0 ถ้าไม่มี)', () => {
  const m = buildMeta([
    { isPublished: true,  domain: 'care' },
    { isPublished: true,  domain: 'care' },
    { isPublished: true,  domain: 'sci'  },
    { isPublished: false, domain: 'law'  },   // ไม่นับ (ร่าง)
    { isPublished: true,  domain: 'xyz'  },   // ไม่นับ (ไม่ใช่ domain ที่รู้จัก)
    { isPublished: true },                      // ไม่มี domain → ไม่นับเข้า key ใด
  ])
  assert.deepEqual(m.domains, { care: 2, sci: 1, law: 0 })
})

test('domains มี key ครบตาม DOMAIN_KEYS เสมอ', () => {
  const m = buildMeta([])
  assert.deepEqual(Object.keys(m.domains).sort(), [...DOMAIN_KEYS].sort())
})
```

- [ ] **Step 2: รันเทสให้ FAIL**

Run: `node --test src/utils/questionsMeta.test.js`
Expected: FAIL — `m.domains` undefined

- [ ] **Step 3: เพิ่ม domains ใน buildMeta**

`src/utils/questionsMeta.js`:
```js
import { DOMAIN_KEYS } from '../data/domains.js'

// buildMeta — pure: สรุปข้อมูลคลังให้หน้า quiz home ใช้โดยไม่ต้องโหลดทั้งคลัง
//  publishedTotal = จำนวนข้อที่เผยแพร่ · categories = หมวดย่อยไม่ซ้ำ · domains = นับต่อ domain ใหญ่
export function buildMeta(questions) {
  const pub = questions.filter(q => q && q.isPublished === true)
  const cats = [...new Set(pub.map(q => (q.category || '').trim()).filter(Boolean))]
  cats.sort((a, b) => a.localeCompare(b, 'th'))
  const domains = Object.fromEntries(DOMAIN_KEYS.map(k => [k, 0]))
  for (const q of pub) {
    if (q.domain in domains) domains[q.domain]++
  }
  return { publishedTotal: pub.length, categories: cats, domains }
}
```

- [ ] **Step 4: รันเทสให้ PASS**

Run: `node --test src/utils/questionsMeta.test.js`
Expected: PASS ทุกเทส

- [ ] **Step 5: Commit**

```bash
git add src/utils/questionsMeta.js src/utils/questionsMeta.test.js
git commit -m "Domain: buildMeta นับข้อ published ต่อ domain (Care/Sci/Law)"
```

---

## Task A3: QuestionsView — editor domain select + list filter

**Files:**
- Modify: `src/views/QuestionsView.vue` (blank() ~line 337, ฟอร์ม editor ~line 130, list filter ~line 163, import draft state)

**Interfaces:**
- Consumes: `DOMAINS`, `DOMAIN_KEYS` จาก `data/domains.js`

- [ ] **Step 1: import + domain ใน blank()**

`QuestionsView.vue` `<script setup>`: เพิ่ม `import { DOMAINS } from '../data/domains.js'`
ใน `blank()` (~line 337) เพิ่ม `domain: null`:
```js
function blank() {
  return { id: null, question: '', choices: ['', '', '', ''], answer: 0, category: '', explanation: '', isPublished: false, domain: null }
}
```
> ตรวจ `save()` ว่าเขียน draft ลง doc แบบ spread/รายฟิลด์ — ถ้ารายฟิลด์ ต้องเพิ่ม `domain: draft.value.domain` ในpayload ที่ setDoc/addDoc ด้วย

- [ ] **Step 2: `<select>` domain ในฟอร์ม editor**

ในฟอร์ม editor ใกล้ช่อง category (~line 130) เพิ่มก่อน/หลังช่องหมวด:
```html
<label class="qz-field-label">หมวดใหญ่ (domain)</label>
<select v-model="draft.domain" class="qz-input">
  <option :value="null">— ไม่ระบุ —</option>
  <option v-for="d in DOMAINS" :key="d.key" :value="d.key">{{ d.label }}</option>
</select>
```

- [ ] **Step 3: domain filter ในลิสต์**

เพิ่ม state: `const domainFilter = ref('__all')`
ข้าง catFilter (~line 163) เพิ่ม select:
```html
<select v-model="domainFilter" class="qz-select" aria-label="กรองตาม domain">
  <option value="__all">ทุก domain</option>
  <option v-for="d in DOMAINS" :key="d.key" :value="d.key">{{ d.label }}</option>
  <option value="__none">ไม่ระบุหมวด</option>
</select>
```
แก้ `filtered` computed (~line 261) ให้กรอง domain เพิ่มหลัง filterQuestions เดิม:
```js
const filtered = computed(() => {
  let r = filterQuestions(list.value, { search: search.value, status: statusFilter.value, category: catFilter.value })
  if (domainFilter.value === '__none') r = r.filter(q => !q.domain)
  else if (domainFilter.value !== '__all') r = r.filter(q => q.domain === domainFilter.value)
  return r
})
```

- [ ] **Step 4: แสดง domain ในการ์ดข้อ (optional แต่ช่วย academic)**

ใกล้ `.qz-cat` (~line 200) เพิ่ม badge domain:
```html
<span v-if="q.domain" class="qz-cat">{{ q.domain }}</span>
```

- [ ] **Step 5: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ

- [ ] **Step 6: ตรวจด้วยตา + Commit**

Run: `npm run dev` (login academic) → editor มี dropdown domain, บันทึกแล้ว domain ติด, filter "ไม่ระบุหมวด" โชว์ข้อเก่าที่ยังไม่มี domain, กด 🔄 คำนวณ meta ใหม่ไม่ error
```bash
git add src/views/QuestionsView.vue
git commit -m "Domain: QuestionsView เพิ่ม dropdown domain ใน editor + filter domain (มี 'ไม่ระบุหมวด' หาข้อเก่า)"
```

---

## Task A4: QuizView — filter หมวดใหญ่ (domain) แทน category + index

**Files:**
- Modify: `src/views/QuizView.vue` (load ~line 132-150, home chips ~line 17-24, start ~line 226-252, finish write ~line 295-303)
- Modify: `firestore.indexes.json`

**Interfaces:**
- Consumes: `DOMAINS` จาก `data/domains.js`, `config/questionsMeta.domains`
- Produces: `dom` ref (`'__all' | 'care' | 'sci' | 'law'`) ที่ Task B2 ใช้เขียน `domain` ลง examSessions

- [ ] **Step 1: load() อ่าน domains + state dom**

`QuizView.vue`: เพิ่ม `import { DOMAINS, DOMAIN_KEYS } from '../data/domains.js'`
ใน `load()` (~line 137-139) เพิ่มอ่าน domains:
```js
const m = snap.exists() ? snap.data() : { publishedTotal: 0, categories: [], domains: {} }
publishedTotal.value = m.publishedTotal || 0
metaDomains.value = m.domains || {}
```
เพิ่ม refs (แทน metaCategories/categories/cat เดิมที่ใช้ใน home — เลิกใช้ category ใน quiz UI):
```js
const metaDomains = ref({})
const dom = ref('__all')
// chips เฉพาะ domain ที่มีข้ออย่างน้อย 1 ข้อ
const domainChips = computed(() => DOMAINS.filter(d => (metaDomains.value[d.key] || 0) > 0))
```

- [ ] **Step 2: แทน chips category ด้วย chips domain ใน home**

แทนบล็อก category chips (~line 17-24) ด้วย:
```html
<template v-if="domainChips.length">
  <div class="qv-label">หมวด</div>
  <div class="qv-chips">
    <button class="qv-chip" :class="{ on: dom === '__all' }" @click="dom = '__all'">ทั้งหมด</button>
    <button v-for="d in domainChips" :key="d.key" class="qv-chip" :class="{ on: dom === d.key }" @click="dom = d.key">{{ d.label }}</button>
  </div>
</template>
```

- [ ] **Step 3: start() ใช้ where domain**

ใน `start()` แก้ `base` (~line 231-232):
```js
const base = [where('isPublished', '==', true)]
if (dom.value !== '__all') base.push(where('domain', '==', dom.value))
```
(ลบบรรทัด `if (cat.value !== '__all') base.push(where('category', ...))` เดิม) · ข้อความ toast "ยังไม่มีข้อสอบในหมวดนี้" (~line 248) คงไว้

- [ ] **Step 4: finish() เลิกเขียน category ใช้ domain แทน (กัน ref cat ค้าง)**

ใน examSessions write (~line 301) เปลี่ยนบรรทัด `category: cat.value === '__all' ? null : cat.value,` เป็น:
```js
      domain: dom.value === '__all' ? null : dom.value,
      category: null,
```
> ลบ ref `cat`, `categories`, `metaCategories` ที่ไม่ใช้แล้วออกจากไฟล์ให้หมด (กัน lint/อ่านสับสน) — ตรวจด้วย grep ภายในไฟล์

- [ ] **Step 5: เพิ่ม composite index**

`firestore.indexes.json` — เพิ่ม object ใน array `indexes`:
```json
{
  "collectionGroup": "questions",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "isPublished", "order": "ASCENDING" },
    { "fieldPath": "domain", "order": "ASCENDING" },
    { "fieldPath": "rand", "order": "ASCENDING" }
  ]
}
```

- [ ] **Step 6: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ — ถ้า error `cat is not defined` แปลว่ายังลบ ref ไม่หมด (Step 4)

- [ ] **Step 7: Commit**

```bash
git add src/views/QuizView.vue firestore.indexes.json
git commit -m "Domain: quiz เลือกฝึกตามหมวดใหญ่ (Care/Sci/Law) แทน category + composite index"
```

- [ ] **Step 8: Deploy index + recompute (manual — แจ้ง user)**

> หลัง merge: รัน `firebase deploy --only firestore:indexes` แล้วให้ academic กดปุ่ม 🔄 "คำนวณ meta ใหม่" หนึ่งครั้งเพื่อ populate `domains` (ไม่งั้น chips หมวดใหญ่จะไม่ขึ้น) — บันทึกไว้ใน checklist deploy

---

# ก้อน B — หน้าประวัติการทำข้อสอบ (ขึ้นกับ A)

## Task B1: `examStats` pure util

**Files:**
- Create: `src/utils/examStats.js`
- Test: `src/utils/examStats.test.js`

**Interfaces:**
- Consumes: `DOMAIN_KEYS` จาก `data/domains.js`
- Produces: `aggregateExamStats(sessions) → { count, latest, trend, byDomain }`
  - `sessions` = array เรียง ts ใหม่→เก่า (อย่างที่โหลดมา) · element = `{ correct, total, pct?, domainStats? }`
  - `latest` = `{ correct, total, pct } | null` (จาก session ใหม่สุด)
  - `trend` = `number[]` pct เรียงเก่า→ใหม่
  - `byDomain` = `{ [key]: { c, t, pct } }` key = DOMAIN_KEYS เสมอ (รวมทุก session)

- [ ] **Step 1: เขียนเทส**

`src/utils/examStats.test.js`:
```js
// เทส aggregateExamStats — สรุปประวัติข้อสอบ (latest/trend/byDomain), data-driven DOMAIN_KEYS
// รัน: node --test src/utils/examStats.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { aggregateExamStats } from './examStats.js'
import { DOMAIN_KEYS } from '../data/domains.js'

test('ว่าง → count 0, latest null, trend [], byDomain ครบ key เป็น 0', () => {
  const r = aggregateExamStats([])
  assert.equal(r.count, 0)
  assert.equal(r.latest, null)
  assert.deepEqual(r.trend, [])
  assert.deepEqual(Object.keys(r.byDomain).sort(), [...DOMAIN_KEYS].sort())
  assert.deepEqual(r.byDomain.care, { c: 0, t: 0, pct: 0 })
})

test('latest = session ใหม่สุด (index 0)', () => {
  const r = aggregateExamStats([
    { correct: 9, total: 10, pct: 90 },
    { correct: 5, total: 10, pct: 50 },
  ])
  assert.deepEqual(r.latest, { correct: 9, total: 10, pct: 90 })
  assert.equal(r.count, 2)
})

test('trend เรียงเก่า→ใหม่ (กลับลำดับ input)', () => {
  const r = aggregateExamStats([
    { correct: 9, total: 10, pct: 90 },  // ใหม่สุด
    { correct: 5, total: 10, pct: 50 },  // เก่ากว่า
  ])
  assert.deepEqual(r.trend, [50, 90])
})

test('pct หาย → คำนวณจาก correct/total', () => {
  const r = aggregateExamStats([{ correct: 1, total: 4 }])
  assert.deepEqual(r.trend, [25])
  assert.equal(r.latest.pct, 25)
})

test('byDomain รวมทุก session + pct ต่อ domain', () => {
  const r = aggregateExamStats([
    { correct: 2, total: 4, domainStats: { care: { c: 2, t: 2 }, sci: { c: 0, t: 2 } } },
    { correct: 1, total: 2, domainStats: { care: { c: 1, t: 2 } } },
  ])
  assert.deepEqual(r.byDomain.care, { c: 3, t: 4, pct: 75 })
  assert.deepEqual(r.byDomain.sci,  { c: 0, t: 2, pct: 0 })
  assert.deepEqual(r.byDomain.law,  { c: 0, t: 0, pct: 0 })
})

test('ทน session เก่าที่ไม่มี domainStats / มี key แปลกปลอม (ไม่ throw, ไม่นับ key แปลก)', () => {
  const r = aggregateExamStats([
    { correct: 1, total: 2 },                                  // ไม่มี domainStats
    { correct: 0, total: 1, domainStats: { zzz: { c: 0, t: 1 }, none: { c: 0, t: 1 } } },
  ])
  assert.deepEqual(Object.keys(r.byDomain).sort(), [...DOMAIN_KEYS].sort())  // ไม่มี zzz/none
  assert.deepEqual(r.byDomain.care, { c: 0, t: 0, pct: 0 })
})
```

- [ ] **Step 2: รันเทสให้ FAIL**

Run: `node --test src/utils/examStats.test.js`
Expected: FAIL — `Cannot find module './examStats.js'`

- [ ] **Step 3: เขียน implementation**

`src/utils/examStats.js`:
```js
// aggregateExamStats — pure: สรุปประวัติข้อสอบของผู้ใช้
//  sessions เรียงใหม่→เก่า (อย่างที่ query orderBy ts desc มา)
//  byDomain วนจาก DOMAIN_KEYS เสมอ (เพิ่ม domain ใหม่ไม่ต้องแก้ logic) + ทน session เก่า
import { DOMAIN_KEYS } from '../data/domains.js'

const pctOf = (c, t) => (t > 0 ? Math.round((c / t) * 100) : 0)
const sessionPct = (s) => (typeof s.pct === 'number' ? s.pct : pctOf(s.correct || 0, s.total || 0))

export function aggregateExamStats(sessions) {
  const list = Array.isArray(sessions) ? sessions : []

  const byDomain = Object.fromEntries(DOMAIN_KEYS.map(k => [k, { c: 0, t: 0, pct: 0 }]))
  for (const s of list) {
    const ds = s && s.domainStats
    if (!ds) continue
    for (const k of DOMAIN_KEYS) {
      const d = ds[k]
      if (d && typeof d === 'object') {
        byDomain[k].c += Number(d.c) || 0
        byDomain[k].t += Number(d.t) || 0
      }
    }
  }
  for (const k of DOMAIN_KEYS) byDomain[k].pct = pctOf(byDomain[k].c, byDomain[k].t)

  const latest = list.length
    ? { correct: list[0].correct || 0, total: list[0].total || 0, pct: sessionPct(list[0]) }
    : null

  const trend = list.slice().reverse().map(sessionPct)

  return { count: list.length, latest, trend, byDomain }
}
```

- [ ] **Step 4: รันเทสให้ PASS**

Run: `node --test src/utils/examStats.test.js`
Expected: PASS ทั้ง 6 เทส

- [ ] **Step 5: Commit**

```bash
git add src/utils/examStats.js src/utils/examStats.test.js
git commit -m "ExamHistory: aggregateExamStats util (latest/trend/byDomain, data-driven+เทส)"
```

---

## Task B2: QuizView — เก็บ answers + เขียน domainStats ลง examSessions

**Files:**
- Modify: `src/views/QuizView.vue` (resetRound ~line 254, pick ~line 258-263, finish write ~line 295-303)

**Interfaces:**
- Consumes: `DOMAIN_KEYS` (import แล้วใน A4), `dom` ref (จาก A4)
- Produces: examSessions doc มี field `domainStats: { <key>: {c,t}, none:{c,t} }`, `answers` (ไม่เขียนลง doc, ใช้คำนวณ)

- [ ] **Step 1: เก็บ answers ต่อข้อ**

เพิ่ม ref: `const answers = ref([])` (ใกล้ state quiz ~line 158)
ใน `resetRound()` (~line 254) เพิ่ม `answers.value = []`
ใน `pick(i)` (~line 258) หลังนับ correct เพิ่ม:
```js
function pick(i) {
  if (picked.value !== null) return
  picked.value = i
  answered.value++
  const isCorrect = i === current.value.answer
  if (isCorrect) correct.value++
  answers.value.push({ domain: current.value.domain || null, correct: isCorrect })
}
```

- [ ] **Step 2: คำนวณ domainStats + เขียนลง examSessions**

ใน `finish()` ก่อน addDoc (~line 295) เพิ่มคำนวณ:
```js
  // สรุปถูก/ทั้งหมดต่อ domain จาก answers (วนจาก DOMAIN_KEYS + bucket none สำหรับข้อไม่มี domain)
  const domainStats = Object.fromEntries(DOMAIN_KEYS.map(k => [k, { c: 0, t: 0 }]))
  domainStats.none = { c: 0, t: 0 }
  for (const a of answers.value) {
    const bucket = (a.domain && domainStats[a.domain]) ? a.domain : 'none'
    domainStats[bucket].t++
    if (a.correct) domainStats[bucket].c++
  }
```
แล้วใน object ที่ addDoc (~line 295-303) เพิ่ม `domainStats` (และ `domain` ถ้ายังไม่เพิ่มใน A4):
```js
    await addDoc(collection(db, 'examSessions'), {
      userId: authStore.currentUser.uid,
      nickname: authStore.userData?.nickname || null,
      total: quiz.value.length,
      correct: correct.value,
      pct: pct.value,
      domain: dom.value === '__all' ? null : dom.value,
      category: null,
      domainStats,
      ts: serverTimestamp(),
    })
```

- [ ] **Step 3: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ

- [ ] **Step 4: ตรวจด้วยตา (dev)**

Run: `npm run dev` → ทำข้อสอบหนึ่งชุด → เปิด Firestore console ดู doc ใหม่ใน `examSessions` มี `domainStats` + `domain` ถูกต้อง

- [ ] **Step 5: Commit**

```bash
git add src/views/QuizView.vue
git commit -m "ExamHistory: เก็บ domainStats (ถูก/ทั้งหมดต่อ domain) ลง examSessions ตอนจบชุด"
```

---

## Task B3: QuizView — mode 'history' + ปุ่มเข้า + query param

**Files:**
- Modify: `src/views/QuizView.vue` (template เพิ่ม mode history + ปุ่ม, script loadHistory + onMounted query param)

**Interfaces:**
- Consumes: `aggregateExamStats` (B1), `DOMAINS`/`domainLabel` (A1)

- [ ] **Step 1: import + state ประวัติ**

`QuizView.vue`: เพิ่ม
```js
import { aggregateExamStats } from '../utils/examStats.js'
import { domainLabel } from '../data/domains.js'
import { useRoute } from 'vue-router'
const route = useRoute()
const history = ref([])
const historyLoading = ref(false)
const stats = computed(() => aggregateExamStats(history.value))

async function loadHistory() {
  if (!authStore.currentUser) return
  historyLoading.value = true
  try {
    const snap = await getDocs(query(
      collection(db, 'examSessions'),
      where('userId', '==', authStore.currentUser.uid),
      orderBy('ts', 'desc'), limit(30),
    ))
    usage.track(snap.size)
    history.value = snap.docs.map(d => d.data())
  } catch (e) {
    console.error('[exam history]', e); toast('โหลดประวัติไม่สำเร็จ', 'error')
  } finally { historyLoading.value = false }
}
function openHistory() { mode.value = 'history'; loadHistory() }
```
แก้ `onMounted` (~line 147) ให้รองรับ query param:
```js
onMounted(() => {
  if (!authStore.isLoggedIn) return
  load()
  if (route.query.view === 'history') openHistory()
})
```

- [ ] **Step 2: ปุ่ม "ประวัติของฉัน" ที่ quiz home**

ใน mode home หลังปุ่ม `.qv-start` (~line 35) เพิ่ม:
```html
<button class="qv-history-btn" @click="openHistory"><Emoji char="📊" /> ประวัติของฉัน</button>
```

- [ ] **Step 3: เทมเพลต mode history**

เพิ่มหลัง block `mode === 'result'` (~line 101):
```html
<!-- ── HISTORY ── -->
<template v-else-if="mode === 'history'">
  <div class="qv-head">
    <button class="qv-back" aria-label="ย้อนกลับ" @click="mode = 'home'">‹</button>
    <span class="qv-head-title"><Emoji char="📊" /> ประวัติของฉัน</span>
  </div>

  <div v-if="historyLoading" class="qv-empty">กำลังโหลด…</div>
  <div v-else-if="!stats.count" class="qv-empty">ยังไม่เคยทำข้อสอบ — ลองทำชุดแรกดูสิ! <Emoji char="📚" /></div>
  <template v-else>
    <div class="qv-hist-latest">
      ล่าสุด <b>{{ stats.latest.correct }}/{{ stats.latest.total }}</b> ({{ stats.latest.pct }}%)
    </div>

    <div class="qv-label">พัฒนาการ ({{ stats.count }} ครั้งล่าสุด)</div>
    <div class="qv-trend">
      <div v-for="(p, i) in stats.trend" :key="i" class="qv-trend-bar" :style="{ height: Math.max(4, p) + '%' }" :title="p + '%'"></div>
    </div>

    <div class="qv-label">สถิติรายหมวด</div>
    <div class="qv-dom-stats">
      <div v-for="d in DOMAINS" :key="d.key" class="qv-dom-row">
        <span class="qv-dom-name">{{ d.label }}</span>
        <span class="qv-dom-bar"><span class="qv-dom-fill" :style="{ width: stats.byDomain[d.key].pct + '%' }"></span></span>
        <span class="qv-dom-val">{{ stats.byDomain[d.key].c }}/{{ stats.byDomain[d.key].t }}</span>
      </div>
    </div>
  </template>
</template>
```

- [ ] **Step 4: style**

ใน `<style scoped>` เพิ่ม:
```css
.qv-history-btn { width: 100%; margin-top: 10px; border: 2px solid var(--ink); background: #fff; border-radius: 12px; padding: 11px; font-family: inherit; font-weight: 700; font-size: .85rem; color: var(--ink); cursor: pointer; box-shadow: var(--pop); }
.qv-history-btn:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.qv-hist-latest { font-size: .95rem; margin-bottom: 14px; }
.qv-trend { display: flex; align-items: flex-end; gap: 4px; height: 80px; padding: 8px; border: 2px solid var(--ink); border-radius: 12px; background: #fff; margin-bottom: 8px; }
.qv-trend-bar { flex: 1; min-width: 3px; background: var(--primary); border-radius: 3px 3px 0 0; }
.qv-dom-stats { display: flex; flex-direction: column; gap: 8px; }
.qv-dom-row { display: flex; align-items: center; gap: 8px; }
.qv-dom-name { width: 44px; font-size: .78rem; font-weight: 700; }
.qv-dom-bar { flex: 1; height: 14px; background: rgba(0,0,0,.07); border-radius: 999px; overflow: hidden; }
.qv-dom-fill { display: block; height: 100%; background: var(--primary); }
.qv-dom-val { font-size: .72rem; font-variant-numeric: tabular-nums; color: rgba(0,0,0,.6); }
```

- [ ] **Step 5: ตรวจ build + ตา**

Run: `npm run build` → สำเร็จ
Run: `npm run dev` → ทำข้อสอบ 2-3 ชุด → กด "ประวัติของฉัน" เห็นคะแนนล่าสุด/กราฟ/สถิติรายหมวด · empty state ขึ้นเมื่อยังไม่เคยทำ

- [ ] **Step 6: Commit**

```bash
git add src/views/QuizView.vue
git commit -m "ExamHistory: หน้าประวัติ (mode ใน Quiz) — คะแนนล่าสุด+กราฟ+สถิติราย domain"
```

---

## Task B4: ลิงก์เข้าจาก MeView + examSessions index

**Files:**
- Modify: `src/views/MeView.vue` (เพิ่มการ์ด/ปุ่มลิงก์)
- Modify: `firestore.indexes.json` (index examSessions)

- [ ] **Step 1: ปุ่มลิงก์ใน MeView**

`src/views/MeView.vue`: เพิ่ม `RouterLink` (import จาก 'vue-router' ถ้ายังไม่มี) ที่จุดเหมาะสม:
```html
<RouterLink to="/quiz?view=history" class="me-link"><Emoji char="📊" /> ประวัติการทำข้อสอบ</RouterLink>
```
style (ปรับตามดีไซน์ MeView เดิม):
```css
.me-link { display: flex; align-items: center; gap: 8px; padding: 12px 14px; border: 2px solid var(--ink); border-radius: 14px; background: #fff; box-shadow: var(--pop); font-weight: 700; font-size: .85rem; color: var(--ink); text-decoration: none; margin-top: 12px; }
.me-link:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
```

- [ ] **Step 2: composite index examSessions**

`firestore.indexes.json` — เพิ่มใน array `indexes`:
```json
{
  "collectionGroup": "examSessions",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "ts", "order": "DESCENDING" }
  ]
}
```

- [ ] **Step 3: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ

- [ ] **Step 4: ตรวจด้วยตา**

Run: `npm run dev` → หน้า Me กดลิงก์ → ไป /quiz เปิด mode history อัตโนมัติ

- [ ] **Step 5: Commit**

```bash
git add src/views/MeView.vue firestore.indexes.json
git commit -m "ExamHistory: ลิงก์เข้าจาก Me (/quiz?view=history) + composite index examSessions"
```

- [ ] **Step 6: Deploy index (manual — แจ้ง user)**

> หลัง merge: `firebase deploy --only firestore:indexes` (รวม index ของ A4 ด้วย) — ถ้ายังไม่ deploy หน้าประวัติจะ error query ตอนมีหลาย session

---

## สรุป Deploy หลังทุกก้อน merge
- `firebase deploy --only firestore:indexes` — index `questions (isPublished,domain,rand)` + `examSessions (userId,ts desc)`
- academic กดปุ่ม 🔄 "คำนวณ meta ใหม่" หนึ่งครั้ง (populate `domains` → chips หมวดใหญ่ใน quiz ขึ้น)
- **rules ไม่ต้องแก้**
- push master = GitHub Actions auto-deploy frontend
