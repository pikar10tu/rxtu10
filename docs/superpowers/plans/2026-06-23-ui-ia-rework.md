# UI/IA Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** จัด IA ใหม่ — รวมแกนเกมไว้ใต้ Play, ดัน "ฉัน" ขึ้น bottom-nav แทน Shop, ย้ายนับถอยหลังสอบมา Home, และทำ section-title/soon-card ให้ใช้ component ร่วม

**Architecture:** เปลี่ยน "ทางเข้า" + การจัดวาง/จัดกลุ่มในเทมเพลต ไม่แตะ router path / logic / Firestore schema / rules. สร้าง shared component 2 ตัว (`SectionTitle`, `SoonCard`) แล้วนำไปใช้ใน Play/Study เพื่อ DRY + ความสม่ำเสมอ

**Tech Stack:** Vue 3 (script setup, SFC scoped style) + vue-router (hash) + Pinia. ไม่มี test runner กลาง — งานนี้เป็น structural template ล้วน ไม่มี pure function ใหม่ให้ unit test → **verification = `npm run build` เขียว + manual checklist** ต่อ task

## Global Constraints

- มือถือเป็นหลัก · UI ภาษาไทย · ธีมหลัก indigo `--primary: #4f46e5` · ภาษาดีไซน์ = สติกเกอร์ (`--ink` ขอบ + `--pop` เงาแข็ง + ฟอนต์หัว `Chonburi` via `--font-display`)
- **ห้ามแตะ:** router path (`src/router/index.js`), Firestore schema/rules/index, logic ภายใน ShopView/QuizView/QuestionsView/AdminView/MembersView, composables, stores
- **ห้าม revert** `<Teleport to="body">` รอบ farm modal ใน PlayView (กับดัก stacking context — `#main-content` เป็น position:fixed)
- bottom-nav คง **5 ช่อง** (มือถือ sweet spot) ไม่เพิ่มเป็น 6
- commit รูปแบบ `Area: อะไร (ทำไม)` ภาษาไทยปนอังกฤษ ลงท้าย `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- `<Emoji char="..." />` เสมอสำหรับ emoji ใน template (กัน tofu) — emoji ที่ใช้ในแผนนี้ (🏠👥🎮📚👤🌾🐾🛒⚔️🏯🗺️🍬) มีไฟล์ Fluent ครบแล้ว ไม่ต้องรัน fetch-fluent

---

### Task 1: Shared components — SectionTitle + SoonCard

ยกสไตล์ section-title (ตอนนี้ฝังใน StudyView `.sv-section-title`) และ soon-card (ฝังใน PlayView `.soon-card`) เป็น component ร่วมใน `components/shared/` เพื่อให้ Play/Study ใช้ตัวเดียวกัน

**Files:**
- Create: `src/components/shared/SectionTitle.vue`
- Create: `src/components/shared/SoonCard.vue`

**Interfaces:**
- Produces:
  - `SectionTitle` — slot-based หัวข้อกลุ่ม. ใช้: `<SectionTitle><Emoji char="🌾" /> สวน & สัตว์</SectionTitle>`
  - `SoonCard` — props `emoji: String`, `label: String`. ใช้: `<SoonCard emoji="⚔️" label="PvP สู้กัน" />`

- [ ] **Step 1: สร้าง `src/components/shared/SectionTitle.vue`**

```vue
<template>
  <div class="section-title"><slot /></div>
</template>

<style scoped>
/* ยกจาก StudyView .sv-section-title — margin-top เผื่อระยะระหว่างกลุ่ม */
.section-title {
  font-weight: 800;
  font-size: .82rem;
  color: var(--ink);
  margin: 18px 0 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
```

- [ ] **Step 2: สร้าง `src/components/shared/SoonCard.vue`**

```vue
<template>
  <div class="soon-card">
    <span class="soon-emoji"><Emoji :char="emoji" /></span>
    <span class="soon-name">{{ label }}</span>
    <span class="soon-tag">เร็วๆ นี้</span>
  </div>
</template>

<script setup>
import Emoji from './Emoji.vue'
defineProps({ emoji: String, label: String })
</script>

<style scoped>
/* ยกจาก PlayView .soon-card — แพทเทิร์น "เร็วๆ นี้" กลางของทั้งแอป */
.soon-card {
  background: #fff;
  border: 2px dashed var(--ink);
  border-radius: 16px;
  padding: 16px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  opacity: .6;
}
.soon-emoji { font-size: 1.6rem; }
.soon-name { font-size: .8rem; font-weight: 700; }
.soon-tag {
  font-size: .56rem;
  color: #b45309;
  background: rgba(251,191,36,.18);
  padding: 2px 7px;
  border-radius: 999px;
}
</style>
```

- [ ] **Step 3: Build เพื่อยืนยันไม่พัง**

Run: `npm run build`
Expected: build เขียว (component ใหม่ยังไม่ถูก import — แค่ต้อง compile ผ่าน)

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/SectionTitle.vue src/components/shared/SoonCard.vue
git commit -m "UI: เพิ่ม shared SectionTitle + SoonCard (component ร่วมสำหรับ Play/Study)"
```

---

### Task 2: Navigation swap — Shop → ฉัน + active state

สลับช่องที่ 5 ของ bottom-nav จาก Shop เป็น "ฉัน" (route `/me`) และเพิ่มไฮไลต์ช่องที่เลือกอยู่

**Files:**
- Modify: `src/App.vue:28` (บรรทัด RouterLink Shop)
- Modify: `src/style.css` (เพิ่ม `.bn-item.router-link-exact-active`)

**Interfaces:**
- Consumes: route `/me` (มีอยู่แล้วใน router/index.js), route `/shop` (ยังอยู่ เข้าผ่าน Play ใน Task 3)
- Produces: nav 5 ช่อง `🏠 👥 🎮 📚 👤`

- [ ] **Step 1: แก้ RouterLink ช่อง Shop เป็น ฉัน**

ใน `src/App.vue` เปลี่ยนบรรทัด:
```vue
        <RouterLink to="/shop"    class="bn-item"><span class="bn-icon"><Emoji char="🛒" /></span>Shop</RouterLink>
```
เป็น:
```vue
        <RouterLink to="/me"      class="bn-item"><span class="bn-icon"><Emoji char="👤" /></span>ฉัน</RouterLink>
```

- [ ] **Step 2: เพิ่ม active-state ใน `src/style.css`**

หาบล็อก `.bn-item` (ใกล้บรรทัด 79) แล้วเพิ่มกฎถัดจากมันทันที. ใช้ `router-link-exact-active` (ไม่ใช่ `-active`) เพราะ `to="/"` ของ Home จะ match แบบ prefix ทุก route ถ้าใช้ `-active`:
```css
.bn-item.router-link-exact-active { color: var(--primary); }
.bn-item.router-link-exact-active .bn-icon { transform: translateY(-1px) scale(1.08); }
```

- [ ] **Step 3: Build + ตรวจ dev**

Run: `npm run build`
Expected: build เขียว

Manual (ถ้าเปิด `npm run dev`): bottom-nav แสดง `🏠 Home · 👥 Members · 🎮 Play · 📚 Study · 👤 ฉัน` · กด 👤 ไป `/me` · ช่องที่อยู่ไฮไลต์สี indigo · กด 🏠 แล้วช่อง Home ไฮไลต์ (ไม่ใช่ทุกช่อง)

- [ ] **Step 4: Commit**

```bash
git add src/App.vue src/style.css
git commit -m "Nav: สลับช่อง Shop → ฉัน (/me) + ไฮไลต์ช่องที่เลือก (Shop เข้าผ่าน Play แทน)"
```

---

### Task 3: Play hub — จัด 3 กลุ่มมีหัวข้อ + การ์ดร้านค้า

แปลง `.play-grid` การ์ดลอยปนกัน เป็น 3 กลุ่มมีหัวข้อ (สวน&สัตว์ / ร้านค้า / สนามประลอง) ใช้ `SectionTitle` + `SoonCard` จาก Task 1 และเพิ่มการ์ด "ร้านค้า" → `/shop`

**Files:**
- Modify: `src/views/PlayView.vue` (template ส่วน `v-if="authStore.isLoggedIn"` + script imports + ลบ `.soon-*` ใน style)

**Interfaces:**
- Consumes: `SectionTitle`, `SoonCard` (Task 1); route `/shop`, `/pets`; `farmOpen` ref + `readyCount`/`emptyCount` computed (มีอยู่แล้วใน PlayView)

- [ ] **Step 1: เพิ่ม import ใน `<script setup>` ของ PlayView**

ถัดจาก `import NewsBoard from '../components/home/NewsBoard.vue'` เพิ่ม:
```js
import SectionTitle from '../components/shared/SectionTitle.vue'
import SoonCard from '../components/shared/SoonCard.vue'
```

- [ ] **Step 2: แทนที่บล็อก `<div class="play-grid"> ... </div>` (การ์ดทั้งหมดก่อน Teleport)**

แทนที่ตั้งแต่ `<div class="play-grid">` จนถึง `</div>` ที่ปิด grid (บรรทัด ~9-30 เดิม รวม soon-card 4 ใบ) ด้วย:
```vue
        <!-- ── สวน & สัตว์ ── -->
        <SectionTitle><Emoji char="🌾" /> สวน &amp; สัตว์</SectionTitle>
        <div class="play-grid">
          <!-- Farm: live entry card → opens modal -->
          <button class="game-card" @click="farmOpen = true">
            <span class="gc-emoji"><Emoji char="🌾" /></span>
            <span class="gc-name">ฟาร์ม</span>
            <span v-if="readyCount" class="gc-badge ready"><Emoji char="🧺" /> เก็บได้ {{ readyCount }}</span>
            <span v-else-if="emptyCount" class="gc-badge plant">＋ ว่าง {{ emptyCount }} แปลง</span>
            <span v-else class="gc-badge grow"><Emoji char="🌱" /> กำลังโต</span>
          </button>

          <RouterLink to="/pets" class="game-card">
            <span class="gc-emoji"><Emoji char="🐾" /></span>
            <span class="gc-name">สัตว์เลี้ยง</span>
            <span class="gc-badge grow">คลัง · ห้องทดลอง</span>
          </RouterLink>
        </div>

        <!-- ── ร้านค้า ── (การ์ดเดียวเต็มแถว → /shop เจอ 2 แท็บเดิม) -->
        <SectionTitle><Emoji char="🛒" /> ร้านค้า</SectionTitle>
        <RouterLink to="/shop" class="game-card">
          <span class="gc-emoji"><Emoji char="🛒" /></span>
          <span class="gc-name">ร้านค้า</span>
          <span class="gc-badge grow">อัญเชิญ · ห้องทดลอง</span>
        </RouterLink>

        <!-- ── สนามประลอง (เร็วๆ นี้) ── -->
        <SectionTitle><Emoji char="⚔️" /> สนามประลอง</SectionTitle>
        <div class="play-grid">
          <SoonCard emoji="⚔️" label="PvP สู้กัน" />
          <SoonCard emoji="🏯" label="ปีนหอคอย" />
          <SoonCard emoji="🗺️" label="ผจญภัย Co-op" />
          <SoonCard emoji="🍬" label="เภสัช Crush" />
        </div>
```
หมายเหตุ: การ์ด "ร้านค้า" วางนอก `.play-grid` → `.game-card` (display flex = block-level) จะกว้างเต็มแถวเอง

- [ ] **Step 3: ลบสไตล์ soon-card ที่ย้ายไป component แล้ว**

ใน `<style scoped>` ของ PlayView ลบ 4 กฎนี้ (ย้ายไป SoonCard.vue แล้ว): `.soon-card`, `.soon-emoji`, `.soon-card span:nth-child(2)`, `.soon-tag`. **คงไว้:** `.play-grid`, `.game-card`, `.gc-*`, `.pv-head`, `.play-login`, สไตล์ farm modal ทั้งหมด

- [ ] **Step 4: Build + ตรวจ**

Run: `npm run build`
Expected: build เขียว

Manual (dev): หน้า Play แสดง 3 หัวข้อกลุ่ม · การ์ดฟาร์มกดเปิด modal ได้ (เลื่อนสุด เห็น "ผลผลิต") · การ์ดสัตว์ไป /pets · การ์ดร้านค้าเต็มแถวไป /shop เจอแท็บ อัญเชิญ/ห้องทดลอง · 4 soon-card จาง

- [ ] **Step 5: Commit**

```bash
git add src/views/PlayView.vue
git commit -m "Play: จัดฮับเกม 3 กลุ่มหัวข้อ (สวน&สัตว์ / ร้านค้า / สนามประลอง) + การ์ดร้านค้า"
```

---

### Task 4: หน้า "ฉัน" — ดัน identity ขึ้น + พับฟอร์มติดต่อ

ทำ `/me` ให้เป็นหน้า top-level: เอาปุ่ม back ออก, ใช้ hero header, ดัน avatar/stat/achievement ขึ้นบน, พับฟอร์มข้อมูลติดต่อลงล่างใน `<details>`

**Files:**
- Modify: `src/views/MeView.vue` (template ส่วน header + ลำดับบล็อก + style header)

**Interfaces:**
- Consumes: state เดิมทั้งหมดใน MeView (previewPhoto, phone/ig/line, save, stats, TagChips, AchievementGrid, fbOpen ฯลฯ) — ไม่แตะ script logic

- [ ] **Step 1: แทน header (เอาปุ่ม back ออก → hero)**

แทนบล็อก:
```vue
    <div class="me-head">
      <button class="me-back" @click="$router.back()">‹</button>
      <span>โปรไฟล์ของฉัน</span>
    </div>
```
ด้วย:
```vue
    <div class="page-title me-pagetitle"><Emoji char="👤" /> ฉัน</div>
```

- [ ] **Step 2: จัดลำดับบล็อกใหม่ใน `<template v-else>`**

จัดลำดับเนื้อหา (logged-in) เป็น: avatar-row → stats → AchievementGrid → TagChips → ประวัติข้อสอบ → **ฟอร์มติดต่อใน `<details>`** → feedback → logout. แทนเนื้อใน `<template v-else>` ตั้งแต่ avatar-row จนถึงปุ่ม logout ด้วย:
```vue
      <!-- identity (ดันขึ้นบนสุด) -->
      <div class="me-avatar-row">
        <img class="me-avatar" :src="previewPhoto" alt="me" @error="(e) => fallbackAvatar(e, auth.userData?.nickname)" />
        <div class="me-av-actions">
          <div class="me-nick">{{ auth.userData?.nickname || 'ฉัน' }}</div>
          <button class="me-btn-sm" @click="fileEl?.click()"><Emoji char="📷" /> เปลี่ยนรูป</button>
          <input ref="fileEl" type="file" accept="image/*" hidden @change="onFile" />
        </div>
      </div>

      <div class="me-stats">
        <div class="me-stat"><span><Emoji char="🪙" /></span><b>{{ (auth.userData?.coins || 0).toLocaleString() }}</b><small>เหรียญ</small></div>
        <div class="me-stat"><span><Emoji char="🏠" /></span><b>Lv.{{ auth.userData?.residence?.level || 1 }}</b><small>ที่อยู่อาศัย</small></div>
        <div class="me-stat"><span><Emoji char="🐾" /></span><b>{{ (auth.userData?.pets || []).length }}</b><small>สัตว์เลี้ยง</small></div>
      </div>

      <AchievementGrid :uid="auth.currentUser?.uid" />
      <TagChips :member="auth.userData" class="me-tags" />

      <RouterLink to="/quiz?view=history" class="me-link"><Emoji char="📊" /> ประวัติการทำข้อสอบ</RouterLink>

      <!-- ข้อมูลติดต่อ (งานธุรการ → พับเก็บล่าง) -->
      <details class="me-contact-fold">
        <summary><Emoji char="📞" /> ข้อมูลติดต่อ</summary>
        <div class="me-contact">
          <div class="me-crow"><span><Emoji char="📞" /></span><input v-model="phone" :maxlength="LIMITS.contact" class="me-input" placeholder="เบอร์โทร" /></div>
          <div class="me-crow"><span><Emoji char="📷" /></span><input v-model="ig" :maxlength="LIMITS.contact" class="me-input" placeholder="Instagram" /></div>
          <div class="me-crow"><span><Emoji char="💬" /></span><input v-model="line" :maxlength="LIMITS.contact" class="me-input" placeholder="LINE ID" /></div>
        </div>
        <button class="me-save" :disabled="saving" @click="save">{{ saving ? 'กำลังบันทึก…' : '💾 บันทึก' }}</button>
      </details>

      <button class="me-feedback" @click="fbOpen = true"><Emoji char="💡" /> ส่งข้อเสนอแนะ / รายงานปัญหา</button>
      <button class="me-logout" @click="auth.logout()">ออกจากระบบ</button>
```

- [ ] **Step 3: ปรับ style header + เพิ่มสไตล์ details**

ใน `<style scoped>` ของ MeView: ลบกฎ `.me-head` และ `.me-back` (ไม่ใช้แล้ว). เพิ่ม:
```css
.me-pagetitle { margin-bottom: 16px; }
.me-contact-fold { margin: 14px 0; border: 2px solid var(--ink); border-radius: 14px; box-shadow: var(--pop); background: #fff; padding: 10px 12px; }
.me-contact-fold summary { font-weight: 800; font-size: .85rem; color: var(--ink); cursor: pointer; list-style: none; }
.me-contact-fold summary::-webkit-details-marker { display: none; }
.me-contact-fold[open] summary { margin-bottom: 10px; }
```
หมายเหตุ: `.me-label` เดิม (label "ข้อมูลติดต่อ") ไม่ถูกใช้แล้ว — ลบกฎ `.me-label` ถ้ามี

- [ ] **Step 4: Build + ตรวจ**

Run: `npm run build`
Expected: build เขียว

Manual (dev): เข้า /me จาก nav → ไม่มีปุ่ม ‹back · header "👤 ฉัน" ฟอนต์ display · avatar+stat+achievement+แท็ก+ประวัติ อยู่บน · "📞 ข้อมูลติดต่อ" พับอยู่ กดกางเจอ phone/IG/LINE+ปุ่มบันทึก · บันทึกได้ · feedback/logout ล่างสุด

- [ ] **Step 5: Commit**

```bash
git add src/views/MeView.vue
git commit -m "Me: เลื่อน /me เป็นหน้า top-level — ดัน identity ขึ้น, พับฟอร์มติดต่อลงล่าง, ตัดปุ่ม back"
```

---

### Task 5: Home dashboard — ตัดการ์ดโปรไฟล์ + ย้ายนับถอยหลังสอบมาบนสุด

เอาการ์ดโปรไฟล์ `home-me` ออก (มี nav "ฉัน" แล้ว), ใส่ `ExamCountdown` บนสุดของ Home, และเอา `ExamCountdown` ออกจาก Study

**Files:**
- Modify: `src/views/HomeView.vue` (ลบ home-me + import, เพิ่ม ExamCountdown)
- Modify: `src/views/StudyView.vue` (ลบ `<ExamCountdown />` + import)

**Interfaces:**
- Consumes: `ExamCountdown` component (`src/components/study/ExamCountdown.vue` — data-driven, ไม่มี state เฉพาะ Study)

- [ ] **Step 1: HomeView — เพิ่ม import ExamCountdown**

ใน `<script setup>` ของ HomeView ถัดจาก `import MailboxCard from '../components/home/MailboxCard.vue'` เพิ่ม:
```js
import ExamCountdown from '../components/study/ExamCountdown.vue'
```

- [ ] **Step 2: HomeView — ลบการ์ดโปรไฟล์ + ใส่ ExamCountdown บนสุด**

ลบบล็อก `<RouterLink to="/me" class="home-me"> ... </RouterLink>` (การ์ดโปรไฟล์ ~บรรทัด 12-20). ที่ตำแหน่งบนสุดของ `<template v-if="authStore.isLoggedIn">` (แทนที่การ์ดโปรไฟล์ที่ลบ) ใส่:
```vue
      <!-- นับถอยหลังสู่วันสอบ (ย้ายมาจาก Study — ข้อมูลสรุปรายวัน เห็นทันทีเปิดแอป) -->
      <ExamCountdown />
```
ผลลัพธ์: ลำดับ Home = ExamCountdown → DailyCard → DailyQuestCard → MailboxCard → ResidenceCard → ปุ่ม admin

- [ ] **Step 3: HomeView — เก็บกวาด style/import ที่ไม่ใช้**

ใน HomeView: ลบกฎ CSS `.home-me`, `.home-me:active`, `.home-me-av`, `.home-me-info`, `.home-me-nick`, `.home-me-sub`, `.home-me-arrow` (การ์ดโปรไฟล์ถูกลบแล้ว). ตรวจ `<script setup>`: `myAvatar` computed + `letterAvatar`/`fallbackAvatar` import ใช้เฉพาะการ์ดโปรไฟล์ → ลบทั้ง computed และ import ที่ค้าง (`letterAvatar, fallbackAvatar` จาก avatar.js). คง `RouterLink` import (ยังใช้ปุ่ม admin)

- [ ] **Step 4: StudyView — เอา ExamCountdown ออก**

ใน StudyView ลบบรรทัด `<ExamCountdown />` (อยู่ใต้ comment "นับถอยหลังสู่วันสอบ" ในโหมด home). ใน `<script setup>` ลบ import `ExamCountdown from '../components/study/ExamCountdown.vue'`. โครง Study เหลือ: หัว "เตรียมสอบ" → ส่วนทำข้อสอบ (ฮับโหมด) → ทบทวน flashcard → ลิงก์จัดการคลัง

- [ ] **Step 5: Build + ตรวจ**

Run: `npm run build`
Expected: build เขียว (ไม่มี warning unused import/variable ที่ค้าง)

Manual (dev): Home บนสุดเป็นนับถอยหลังสอบ ไม่มีการ์ดโปรไฟล์ · เก็บเหรียญ/เควสต์/จดหมาย/บ้านทำงาน · Study ไม่มีนับถอยหลังแล้ว เริ่มที่หัว "เตรียมสอบ"

- [ ] **Step 6: Commit**

```bash
git add src/views/HomeView.vue src/views/StudyView.vue
git commit -m "Home: ตัดการ์ดโปรไฟล์ (มี nav ฉัน แล้ว) + ย้ายนับถอยหลังสอบจาก Study มาบนสุด"
```

---

### Task 6: Study/QuizModeCard ใช้ section-title ร่วม + verify ทั้งแอป

ทำ Study ให้ใช้ `SectionTitle` ตัวเดียวกับ Play (DRY) และตรวจความสม่ำเสมอรอบสุดท้าย

**Files:**
- Modify: `src/views/StudyView.vue` (2 จุด `.sv-section-title` → `<SectionTitle>`)

**Interfaces:**
- Consumes: `SectionTitle` (Task 1)

- [ ] **Step 1: StudyView — เพิ่ม import + แทน section-title**

ใน `<script setup>` เพิ่ม `import SectionTitle from '../components/shared/SectionTitle.vue'`.

แทน:
```vue
      <div class="sv-section-title"><Emoji char="📝" /> ทำข้อสอบ</div>
```
ด้วย:
```vue
      <SectionTitle><Emoji char="📝" /> ทำข้อสอบ</SectionTitle>
```

แทน:
```vue
      <div class="sv-section-title sv-section-flash"><Emoji char="📚" /> ทบทวน flashcard</div>
```
ด้วย (คง `.sv-section-flash` เป็น wrapper เพราะมีเส้นคั่นบน):
```vue
      <div class="sv-section-flash"><SectionTitle><Emoji char="📚" /> ทบทวน flashcard</SectionTitle></div>
```

- [ ] **Step 2: StudyView — ปรับ style ที่เหลือ**

ใน `<style scoped>` ของ StudyView: ลบกฎ `.sv-section-title` (ย้ายไป component แล้ว). แก้ `.sv-section-flash` ให้เหลือเฉพาะเส้นคั่น/ระยะ (เอา margin ของ title ออกเพราะ SectionTitle จัดการเอง):
```css
.sv-section-flash { margin-top: 22px; padding-top: 18px; border-top: 1px dashed var(--border); }
```

- [ ] **Step 3: Build + verify ทั้งแอปรอบสุดท้าย**

Run: `npm run build`
Expected: build เขียว

Manual checklist ครบทั้ง flow (dev):
- bottom-nav: `🏠 👥 🎮 📚 👤` ครบ 5 · ช่องที่อยู่ไฮไลต์
- Home: นับถอยหลังสอบบนสุด · เก็บเหรียญ/เควสต์/จดหมาย/บ้าน OK · ไม่มีการ์ดโปรไฟล์
- Members: เข้าได้ปกติ (ไม่แตะ)
- Play: 3 กลุ่มหัวข้อ · ฟาร์ม modal เลื่อนสุด · เพ็ท · ร้านค้า→2 แท็บ · soon จาง
- Study: หัว "เตรียมสอบ" → ส่วน "ทำข้อสอบ" (section-title เหมือน Play) → flashcard → ลิงก์คลัง · ไม่มีนับถอยหลัง
- ฉัน: header display · identity บน · ฟอร์มติดต่อพับ · บันทึก/feedback/logout OK
- ทุกหน้าใช้ section-title สไตล์เดียวกัน (Play = Study) · ไม่มี console error

- [ ] **Step 4: Commit**

```bash
git add src/views/StudyView.vue
git commit -m "Study: ใช้ shared SectionTitle (DRY ให้ตรงกับ Play) + verify IA rework ครบ flow"
```

---

## หมายเหตุการ deploy (หลังทำครบ + review)

- งานนี้ **frontend ล้วน** — ไม่แตะ rules/schema/index → deploy = push master (auto build+publish ไป GitHub Pages)
- ไม่ต้อง `firebase deploy` (ไม่แตะ rules)
- ไม่ต้องรัน `fetch-fluent.mjs` (emoji ที่ใช้มีไฟล์ครบแล้ว)
- backup ก่อนเริ่ม: `backup/pre-ui-rework-2026-06-23` (มีแล้ว)

## ขอบเขตที่ตัดสินใจไม่ทำ (scope decision)

- **`QuizModeCard coming-soon`** (Study: ข้อสอบประจำวัน / Time Attack) — คงไว้เหมือนเดิม **ไม่ยุบรวมกับ `SoonCard`** เพราะเป็นคนละ layout/บริบท (การ์ดโหมดเรียนเต็มแถวมี subtitle vs การ์ด teaser เกมในกริด). spec §5 ข้อ 4 เอ่ยถึง แต่การบังคับให้เหมือนกันจะเปลี่ยนดีไซน์ QuizModeCard โดยไม่จำเป็น — `SoonCard` ครอบเฉพาะ soon-card เกมใน Play
