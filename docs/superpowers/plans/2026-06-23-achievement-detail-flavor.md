# Achievement Detail Popup + Flavor Text Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** แตะ achievement ที่ปลดล็อกแล้ว → popup โชว์ flavor text + เงื่อนไข + วันที่ปลดล็อก

**Architecture:** เพิ่ม field `flavor` คงที่ใน catalog. popup ใหม่ `AchievementDetailModal.vue` mirror `PetStatPopup.vue` (fixed overlay z-260, ไม่ต้อง Teleport). `AchievementGrid` ทำ badge เป็นปุ่มแตะได้ → เปิด popup. ไม่แตะ Firestore.

**Tech Stack:** Vue 3 (SFC, scoped style) · Firestore (อ่าน data ที่ grid โหลดอยู่แล้ว ไม่เพิ่ม read)

## Global Constraints

- ไม่แตะ rules/schema/grant logic/subcollection/migration · ไม่เพิ่ม Firestore read/write
- โชว์เฉพาะ achievement ที่ปลดแล้ว (ไม่โชว์ที่ยังไม่ปลด)
- emoji ในเทมเพลตใช้ `<Emoji :char="…" />` เท่านั้น (กัน tofu)
- popup ไม่ใช้ Teleport — mirror `PetStatPopup.vue` (fixed overlay, child ของ grid, z-index 260 > ProfileModal 220)
- คอมเมนต์/commit ไทยปนอังกฤษ · commit format `Area: อะไร (ทำไม)`
- ไม่มี test ใหม่ (UI ล้วน + ข้อมูลคงที่) — verify ด้วย `npm run build` exit 0

---

### Task 1: เพิ่ม flavor ทั้ง 17 ใน catalog

**Files:**
- Modify: `src/data/achievements.js` (เพิ่ม key `flavor` ในแต่ละ entry ของ `ACHIEVEMENTS`)

**Interfaces:**
- Consumes: (ไม่มี)
- Produces: `ACHIEVEMENTS[id].flavor` (string) สำหรับทั้ง 17 id — `AchievementGrid` (Task 2) อ่านผ่าน `getAchievement(id).flavor`

- [ ] **Step 1: เพิ่ม `flavor` ในแต่ละ entry**

แก้ `src/data/achievements.js` — เพิ่ม key `flavor` ต่อท้ายแต่ละ entry (ไม่แตะ field อื่น). ค่าตามนี้:
```js
export const ACHIEVEMENTS = {
  pet_5:   { title: 'นักเลี้ยงสัตว์',  icon: '🐣', type: 'milestone', trigger: { stat: 'petCount', gte: 5 },  desc: 'สะสมสัตว์ 5 ตัว', flavor: 'เริ่มจากตัวเล็กๆ สู่คอกในฝัน' },
  pet_10:  { title: 'คอกใหญ่',        icon: '🐾', type: 'milestone', trigger: { stat: 'petCount', gte: 10 }, desc: 'สะสมสัตว์ 10 ตัว', flavor: 'คอกเริ่มแน่น เสียงเริ่มดัง' },
  pet_25:  { title: 'สวนสัตว์ส่วนตัว', icon: '🦁', type: 'milestone', trigger: { stat: 'petCount', gte: 25 }, desc: 'สะสมสัตว์ 25 ตัว', flavor: 'นี่มันสวนสัตว์ชัดๆ' },
  pet_all: { title: 'นักสะสมตัวจริง',  icon: '🏆', type: 'milestone', trigger: { stat: 'petSpeciesCount', gte: 'ALL_SPECIES' }, desc: 'สะสมสัตว์ครบทุกชนิด', flavor: 'ครบทุกชนิด ไม่มีตัวไหนรอด!' },
  quiz_10:  { title: 'เริ่มติว',     icon: '📝', type: 'milestone', trigger: { stat: 'quizDoneTotal', gte: 10 },  desc: 'ทำข้อสอบครบ 10 ข้อ', flavor: 'ก้าวแรกของเส้นทางเซียน' },
  quiz_50:  { title: 'ขยันทำโจทย์', icon: '✍️', type: 'milestone', trigger: { stat: 'quizDoneTotal', gte: 50 },  desc: 'ทำข้อสอบครบ 50 ข้อ', flavor: 'ปากกาเริ่มหมึกหมด' },
  quiz_100: { title: 'เซียนข้อสอบ', icon: '🎓', type: 'milestone', trigger: { stat: 'quizDoneTotal', gte: 100 }, desc: 'ทำข้อสอบครบ 100 ข้อ', flavor: 'ข้อสอบเห็นแล้วต้องหลบ' },
  flash_10:  { title: 'หัดท่อง',      icon: '📚', type: 'milestone', trigger: { stat: 'studyReviewedTotal', gte: 10 },  desc: 'ทบทวนแฟลชการ์ด 10 ใบ', flavor: 'ยาตัวแรกที่จำได้ ภูมิใจ' },
  flash_50:  { title: 'ท่องสม่ำเสมอ', icon: '📖', type: 'milestone', trigger: { stat: 'studyReviewedTotal', gte: 50 },  desc: 'ทบทวนแฟลชการ์ด 50 ใบ', flavor: 'สม่ำเสมอคือกุญแจ' },
  flash_100: { title: 'จำแม่น',       icon: '🧠', type: 'milestone', trigger: { stat: 'studyReviewedTotal', gte: 100 }, desc: 'ทบทวนแฟลชการ์ด 100 ใบ', flavor: 'สมองนี้คือคลังยาเคลื่อนที่' },
  farm_100k: { title: 'พ่อค้าผัก',    icon: '🥬', type: 'milestone', trigger: { stat: 'farmSalesTotal', gte: 100000 },  desc: 'ขายผลผลิตรวม 100,000', flavor: 'ผักสวนครัว รั้วกินได้' },
  farm_500k: { title: 'นักธุรกิจ',    icon: '💼', type: 'milestone', trigger: { stat: 'farmSalesTotal', gte: 500000 },  desc: 'ขายผลผลิตรวม 500,000', flavor: 'จากแปลงผักสู่เครือธุรกิจ' },
  farm_2m:   { title: 'เจ้าสัวเกษตร', icon: '🏭', type: 'milestone', trigger: { stat: 'farmSalesTotal', gte: 2000000 }, desc: 'ขายผลผลิตรวม 2,000,000', flavor: 'เกษตรกรเกือบพันล้าน' },
  spent_100k: { title: 'นักช้อป',      icon: '🛍️', type: 'milestone', trigger: { stat: 'totalSpent', gte: 100000 }, desc: 'ใช้จ่ายรวม 100,000', flavor: 'เงินมีไว้ใช้ ไม่ได้มีไว้กอด' },
  spent_500k: { title: 'ขาช้อปตัวยง', icon: '💳', type: 'milestone', trigger: { stat: 'totalSpent', gte: 500000 }, desc: 'ใช้จ่ายรวม 500,000', flavor: 'บัตรเครดิตเริ่มร้อน' },
  home_max: { title: 'เจ้าของคฤหาสน์', icon: '🏰', type: 'milestone', trigger: { stat: 'residenceLevel', gte: 'MAX_RESIDENCE' }, desc: 'อัปบ้านถึงระดับสูงสุด', flavor: 'จากข้างถนนสู่ยอดพีระมิด' },
  daily_king: { title: 'ราชาควิซประจำวัน', icon: '👑', type: 'awarded', dated: true, desc: 'อันดับ 1 ข้อสอบประจำวัน', flavor: 'วันนี้ทั้งรุ่นต้องยอม' },
}
```
(บรรทัด `export const getAchievement` / `MILESTONES` ใต้ลงไปไม่ต้องแก้)

- [ ] **Step 2: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ (exit 0)

- [ ] **Step 3: commit**

```bash
git add src/data/achievements.js
git commit -m "Data: เพิ่ม flavor text achievement ทั้ง 17 อัน (โชว์ใน popup รายละเอียด)"
```

---

### Task 2: AchievementDetailModal + ทำ grid แตะได้

**Files:**
- Create: `src/components/shared/AchievementDetailModal.vue`
- Modify: `src/components/shared/AchievementGrid.vue` (import + state + template button + modal + map flavor/earnedAt + CSS)

**Interfaces:**
- Consumes: `flavor` จาก Task 1 (ผ่าน `getAchievement().flavor`) · `Emoji` component
- Produces: popup ที่รับ prop `item: { icon, label, flavor, desc, earnedAt }` emit `close`

- [ ] **Step 1: สร้าง AchievementDetailModal.vue**

`src/components/shared/AchievementDetailModal.vue`:
```vue
<!-- popup รายละเอียด achievement — mirror PetStatPopup (fixed overlay, ไม่ต้อง Teleport) -->
<template>
  <div v-if="item" class="ad-ov" @click.self="$emit('close')">
    <div class="ad-box">
      <button class="ad-x" aria-label="ปิด" @click="$emit('close')">✕</button>
      <div class="ad-icon"><Emoji :char="item.icon" /></div>
      <div class="ad-title">{{ item.label }}</div>
      <div v-if="item.flavor" class="ad-flavor">“{{ item.flavor }}”</div>
      <div class="ad-rows">
        <div class="ad-row">
          <span class="ad-row-k">เงื่อนไข</span>
          <span class="ad-row-v">{{ item.desc || '—' }}</span>
        </div>
        <div v-if="fmtDate(item.earnedAt)" class="ad-row">
          <span class="ad-row-k">ปลดล็อกเมื่อ</span>
          <span class="ad-row-v">{{ fmtDate(item.earnedAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Emoji from './Emoji.vue'
defineProps({ item: { type: Object, default: null } })
defineEmits(['close'])

// รองรับ Firestore Timestamp / Date / ms · คืน '' ถ้าพัง (ซ่อนแถววันที่)
function fmtDate(ts) {
  if (!ts) return ''
  const ms = ts?.toMillis ? ts.toMillis() : (ts?.toDate ? ts.toDate().getTime() : new Date(ts).getTime())
  if (!ms || Number.isNaN(ms)) return ''
  return new Date(ms).toLocaleDateString('th-TH-u-ca-gregory', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<style scoped>
.ad-ov { position: fixed; inset: 0; z-index: 260; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; padding: 20px; }
.ad-box { position: relative; background: #fff; width: 100%; max-width: 320px; border: 2px solid var(--ink); border-radius: 20px; box-shadow: var(--pop-lg); padding: 24px 18px 18px; text-align: center; }
.ad-x { position: absolute; left: 10px; top: 10px; border: none; background: rgba(0,0,0,.06); border-radius: 8px; width: 28px; height: 28px; cursor: pointer; }
.ad-icon { font-size: 3.2rem; line-height: 1; }
.ad-title { font-family: var(--font-display); font-weight: 400; font-size: 1.4rem; color: var(--ink); margin-top: 8px; }
.ad-flavor { font-size: .8rem; color: #6366f1; font-style: italic; margin-top: 6px; line-height: 1.4; }
.ad-rows { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; text-align: left; }
.ad-row { background: #f8fafc; border: 1px solid rgba(0,0,0,.05); border-radius: 10px; padding: 8px 11px; }
.ad-row-k { display: block; font-size: .58rem; font-weight: 700; color: #64748b; }
.ad-row-v { font-size: .82rem; color: #1e293b; line-height: 1.35; }
</style>
```

- [ ] **Step 2: wire AchievementGrid — import + state + template**

ใน `src/components/shared/AchievementGrid.vue`:

(a) เพิ่ม import (ใต้ `import Emoji from './Emoji.vue'`):
```js
import AchievementDetailModal from './AchievementDetailModal.vue'
```

(b) เพิ่ม state (ใต้ `const loading = ref(false)`):
```js
const selected = ref(null)
```

(c) แก้ template — เปลี่ยน `.ach-item` จาก `<div>` เป็น `<button>` แตะได้ + เพิ่ม modal. แทนบล็อก:
```html
    <div v-else class="ach-grid">
      <div v-for="a in items" :key="a.docId" class="ach-item" :title="a.desc">
        <span class="ach-item-icon"><Emoji :char="a.icon" /></span>
        <span class="ach-item-title">{{ a.label }}</span>
      </div>
    </div>
```
ด้วย:
```html
    <div v-else class="ach-grid">
      <button v-for="a in items" :key="a.docId" type="button" class="ach-item" :title="a.desc" @click="selected = a">
        <span class="ach-item-icon"><Emoji :char="a.icon" /></span>
        <span class="ach-item-title">{{ a.label }}</span>
      </button>
    </div>
    <AchievementDetailModal :item="selected" @close="selected = null" />
```

- [ ] **Step 3: map flavor + earnedAt เข้า item**

ในฟังก์ชัน `load`, แก้การ map (เพิ่ม `flavor` + `earnedAt`; เพิ่ม `flavor:''` ใน fallback). แทน:
```js
    items.value = snap.docs.map(d => {
      const data = d.data()
      const def = getAchievement(data.achId) || { title: data.achId, icon: '🏅', desc: '' }
      return { docId: d.id, icon: def.icon, desc: def.desc, label: titleOf(def, data.date || null) }
    })
```
ด้วย:
```js
    items.value = snap.docs.map(d => {
      const data = d.data()
      const def = getAchievement(data.achId) || { title: data.achId, icon: '🏅', desc: '', flavor: '' }
      return {
        docId: d.id, icon: def.icon, desc: def.desc, flavor: def.flavor || '',
        earnedAt: data.earnedAt || null, label: titleOf(def, data.date || null),
      }
    })
```

- [ ] **Step 4: ปรับ CSS `.ach-item` ให้เป็นปุ่ม**

แทน rule `.ach-item { … }` เดิม:
```css
.ach-item { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 8px 4px; border: 2px solid var(--ink); border-radius: 12px; background: #fff; box-shadow: var(--pop); text-align: center; }
```
ด้วย:
```css
.ach-item { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 8px 4px; border: 2px solid var(--ink); border-radius: 12px; background: #fff; box-shadow: var(--pop); text-align: center; font-family: inherit; cursor: pointer; transition: transform .1s, box-shadow .1s; }
.ach-item:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
```

- [ ] **Step 5: ตรวจ build**

Run: `npm run build`
Expected: build สำเร็จ (exit 0)

- [ ] **Step 6: commit**

```bash
git add src/components/shared/AchievementDetailModal.vue src/components/shared/AchievementGrid.vue
git commit -m "Achievement: แตะ badge เปิด popup รายละเอียด (flavor + เงื่อนไข + วันที่ปลดล็อก)"
```

---

## Self-Review

**Spec coverage:**
- เพิ่ม `flavor` 17 อันใน catalog → Task 1 ✅
- popup `AchievementDetailModal.vue` (mirror PetStatPopup, fixed z-260, ไม่ teleport, โชว์ icon/label/flavor/desc/earnedAt) → Task 2 Step 1 ✅
- grid `.ach-item` เป็นปุ่มแตะได้ → เปิด modal → Task 2 Step 2,4 ✅
- map flavor+earnedAt เข้า item (fallback มี flavor:'') → Task 2 Step 3 ✅
- ไม่แตะ rules/schema/grant/read เพิ่ม → ไม่มี task แตะ (ตรงสเปก) ✅
- edge: earnedAt พัง→ซ่อนแถว (fmtDate คืน '') · flavor ว่าง→ซ่อนบรรทัด (v-if) · def ไม่พบ→fallback → ครอบใน Task 2 ✅

**Placeholder scan:** ไม่มี TBD/TODO ✅

**Type consistency:** popup prop `item` = `{ icon, label, flavor, desc, earnedAt }` ตรงกับ field ที่ grid map (Task 2 Step 3) · `flavor` key ตรง Task 1↔2 · `selected` ref ใช้สอดคล้อง template+state ✅
