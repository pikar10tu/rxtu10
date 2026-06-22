# Spec: ปรับ Navigation / IA — ย้ายตำแหน่งให้สมเหตุสมผล

วันที่: 2026-06-21 · สถานะ: **ดีไซน์อนุมัติแล้ว** (เคาะกับเจ้าของโปรเจกต์ผ่าน cowork)

## ที่มา & เป้าหมาย
หลายตำแหน่งใน nav ไม่สมเหตุสมผล: ช่อง "ข้อสอบ" ซ้ำกับปุ่มใน Study, Admin กินช่อง nav ถาวรเพื่อคนไม่กี่คน, Pets/Shop ลอย (เข้าได้จาก shortcut โฮมเท่านั้น) ทั้งที่ Play เป็น game hub อยู่แล้ว. จัดใหม่ให้แอปสะท้อน **2 เสาหลัก: Study (เตรียมสอบ) + Play (เกม)**.

> ขอบเขต = **ย้าย/จัดตำแหน่งเท่านั้น** ไม่แตะ logic ของแต่ละหน้า, ไม่แตะ router routes (ทุก route ยังอยู่ครบ เปลี่ยนแค่ "ทางเข้า"), ไม่แตะ firestore/schema/migration.

## Decisions (เคาะแล้ว)
1. **Bottom nav ใหม่ เหลือ 5 ช่อง:** 🏠 Home · 👥 Members · 🎮 Play · 📚 Study · 🛒 Shop
2. **ช่อง "📝 ข้อสอบ" → ยุบออกจาก nav**
   - นักศึกษา: ทำข้อสอบผ่านปุ่ม "ทำข้อสอบ (MCQ)" ใน Study เดิม (มีอยู่แล้ว → `/quiz`)
   - ทีมวิชาการ: เพิ่มทางเข้า "จัดการคลังข้อสอบ" **ใน Study** โชว์เฉพาะ `isAcademic` → `/questions`
3. **"⚙️ Admin" → ออกจาก nav เป็นปุ่มในหน้า Home** โชว์เฉพาะ `isAdmin` → `/admin`
4. **Shop → ขึ้นเป็นช่อง nav** (🛒 `/shop`) — เอา shortcut Shop ออกจากโฮม
5. **Pets → เป็นการ์ดใน Play** (`/pets`) — เอา shortcut Pets ออกจากโฮม
6. ผลรวม: **บล็อก `.home-shortcuts` ในโฮมถูกลบทั้งก้อน** (shop ไป nav, pets ไป Play)

> routes ทั้งหมดใน `src/router/index.js` **คงไว้เหมือนเดิม** (`/quiz`, `/questions`, `/admin`, `/pets`, `/shop` ยังเข้าผ่าน URL/ลิงก์ได้) — เปลี่ยนแค่จุดที่ลิงก์ไป

---

## งานที่ต้องทำ (ราย task)

### Task 1 — `src/App.vue`: nav 6→5 ช่อง
แก้บล็อก `<nav id="bottom-nav">` (ปัจจุบันบรรทัด ~23–31):
- **ลบ** บรรทัดช่อง "ข้อสอบ" (`<RouterLink :to="authStore.isAcademic ? '/questions' : '/quiz'">`)
- **ลบ** บรรทัดช่อง "Admin" (`<RouterLink v-if="authStore.isAdmin" to="/admin">`)
- **เพิ่ม** ช่อง Shop ต่อจาก Study:
  ```html
  <RouterLink to="/shop" class="bn-item"><span class="bn-icon"><Emoji char="🛒" /></span>Shop</RouterLink>
  ```
- ผลลัพธ์ลำดับ: Home · Members · Play · Study · Shop (5 ช่อง)
- คงเงื่อนไข maintenance gate เดิม (`v-else-if="authStore.isAcademic || !maintenance"`) ไว้ — วิชาการยังเห็นแอปตอน maintenance เพื่อจัดคลังข้อสอบ
- เช็ก CSS `#bottom-nav .bn-item` (น่าจะ flex เท่ากันอยู่แล้ว) — 5 ช่องกว้างขึ้นนิดหน่อย ปกติ ไม่ต้องแก้ถ้าใช้ `flex:1`

### Task 2 — `src/views/StudyView.vue`: เพิ่มทางเข้าคลังข้อสอบ (วิชาการเท่านั้น)
ใกล้ปุ่ม `RouterLink to="/quiz"` (sv-quizlink, บรรทัด ~39–46) ในโหมด `home`:
- **เพิ่มลิงก์ใหม่ โชว์เฉพาะ `authStore.isAcademic`** ไป `/questions`:
  ```html
  <RouterLink v-if="authStore.isAcademic" to="/questions" class="sv-quizlink sv-acadlink">
    <span class="sv-quizlink-emoji"><Emoji char="🛠️" /></span>
    <span class="sv-quizlink-text">
      <b>จัดการคลังข้อสอบ</b>
      <small>เพิ่ม/แก้/เผยแพร่ข้อสอบ · เฉพาะทีมวิชาการ</small>
    </span>
    <span class="sv-quizlink-go">›</span>
  </RouterLink>
  ```
- reuse style `.sv-quizlink` เดิม + เพิ่ม `.sv-acadlink` ทำสีต่าง (เช่นพื้น/ขอบโทนวิชาการ) ให้แยกจากปุ่มทำข้อสอบของนักศึกษา
- ตรวจว่า `authStore` ถูก import แล้วใน StudyView (มี `authStore.isLoggedIn` ใช้อยู่ → มีแล้ว)

### Task 3 — `src/views/PlayView.vue`: เพิ่มการ์ด "สัตว์เลี้ยง" ในกริดเกม
ใน `.play-grid` (บรรทัด ~9–23) ต่อจากการ์ดฟาร์ม **ก่อน** soon-card ทั้งหลาย:
- เพิ่มการ์ดจริง (ไม่ใช่ soon) ลิงก์ไป `/pets`:
  ```html
  <RouterLink to="/pets" class="game-card">
    <span class="gc-emoji"><Emoji char="🐾" /></span>
    <span class="gc-name">สัตว์เลี้ยง</span>
    <span class="gc-badge grow">คลัง · ห้องทดลอง</span>
  </RouterLink>
  ```
- `.game-card` เดิมเป็น `<button>` (all:unset) → ใช้กับ `RouterLink` ได้ แต่ตรวจให้ style เสมอกัน (อาจต้องเพิ่ม selector `.play-grid > a.game-card` หรือใช้ `<RouterLink custom>` ครอบ button — เลือกวิธีที่ style ตรงกับการ์ดฟาร์มที่สุด ไม่ให้เพี้ยน)
- badge ใช้ข้อความสั้น ("คลัง · ห้องทดลอง") ถ้าจะโชว์จำนวนเพ็ทที่มี = optional (computed จาก store) — ทำได้แต่ไม่บังคับ

### Task 4 — `src/views/HomeView.vue`: ลบ shortcuts + เพิ่มปุ่ม Admin
- **ลบบล็อก `.home-shortcuts` ทั้งก้อน** (บรรทัด ~32–44 รวม shop + pets) และ CSS ที่ไม่ใช้แล้ว (`.home-shortcuts`, `.home-shortcut`, `.hs-*`, `.sc-shop`, `.sc-pets`)
- **เพิ่มปุ่ม Admin โชว์เฉพาะ `authStore.isAdmin`** (วางท้าย `tab-content` หรือใต้ ResidenceCard):
  ```html
  <RouterLink v-if="authStore.isAdmin" to="/admin" class="home-admin-btn">
    <Emoji char="⚙️" /> แผงผู้ดูแลระบบ
  </RouterLink>
  ```
- style ปุ่มแอดมินให้ดู "เครื่องมือ" ไม่เด่นแย่งความสนใจ (โทนเทา/ขอบบาง) — ของแอดมินไม่กี่คน
- ถ้าจะคงทางเข้าด่วน Shop/Pets ในโฮมไว้บ้าง = **ไม่ต้อง** (Shop อยู่ nav, Pets อยู่ Play แล้ว) ตามดีไซน์ที่เคาะ

---

## Acceptance criteria
- [ ] nav มี 5 ช่องพอดี: Home · Members · Play · Study · Shop (ไม่มี ข้อสอบ/Admin)
- [ ] นักศึกษาทั่วไป: เข้าทำข้อสอบได้จาก Study → "ทำข้อสอบ (MCQ)"; **ไม่เห็น** "จัดการคลังข้อสอบ"
- [ ] บัญชีวิชาการ (`role:'academic'` หรือ admin): เห็น "จัดการคลังข้อสอบ" ใน Study → เข้า `/questions` ได้
- [ ] แอดมิน: เห็นปุ่ม "แผงผู้ดูแลระบบ" ในหน้า Home → `/admin`; คนอื่นไม่เห็น
- [ ] Play มีการ์ด "สัตว์เลี้ยง" → `/pets` (สไตล์เสมอการ์ดฟาร์ม ไม่เพี้ยน)
- [ ] Shop เข้าได้จาก nav; โฮมไม่มีบล็อก shortcuts อีกต่อไป
- [ ] `npm run build` ผ่าน + ไม่มี CSS/import ตายค้าง (เช็ก unused style ที่ลบครบ)
- [ ] eyeball มือถือ: nav 5 ช่องไม่ล้น, การ์ด Play เรียงสวย, ปุ่มแอดมินไม่เด่นเกิน

## หมายเหตุ / กับดัก
- **อย่าลบ routes** ใน `router/index.js` — แค่เปลี่ยนทางเข้า (ป้องกัน deep-link/ประวัติพัง เช่น `/quiz?view=history` จาก MeView, `/me`)
- `.game-card` เดิมเป็น `<button>` — ระวัง style เพี้ยนตอนเปลี่ยนเป็น `RouterLink`
- `isAcademic` = `isAdmin || role==='academic'` (`src/stores/auth.js:36`) → admin เห็นทั้งคลังข้อสอบและปุ่มแอดมิน ถูกต้องตามตั้งใจ
- งานนี้เป็น "จัดวาง" รอบแรก — รอบลึก (visual hierarchy/spacing/motion ราย screen) ไว้ทำหลัง launch ตามแผน
