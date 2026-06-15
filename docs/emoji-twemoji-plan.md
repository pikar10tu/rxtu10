# แผน: เปลี่ยน emoji เป็น Twemoji (รูปเดียวกันทุกเครื่อง) + ใช้ free resources

เป้าหมาย: ทุกเครื่อง (iOS/Android/Windows) เห็น emoji ภาพเดียวกัน แทนที่จะเป็น emoji ของแต่ละ OS
วิธี: ใช้ภาพ SVG จาก Twemoji ผ่าน CDN — ฟรี ไม่ต้องเจน ไม่ต้อง host เอง

---

## ✅ ไฟล์ที่สร้างไว้แล้ว (Cowork สร้างให้ ไม่ต้องทำซ้ำ)

- `src/utils/emoji.js` — `twemojiUrl(emoji)` แปลง emoji → URL รูป (อัลกอริทึมเดียวกับ twemoji.toCodePoint, ตัด VS16, รองรับ ZWJ)
- `src/components/shared/Emoji.vue` — `<Emoji :char="..." />` render เป็น `<img>` ขนาด 1em + **fallback กลับเป็น emoji เครื่องอัตโนมัติ**ถ้าโหลดรูปไม่ได้

> ⚠️ helper ยังไม่ได้รัน build ทดสอบ — งานแรกของ Claude Code คือ verify

---

## ▶ สถานะ (16 มิ.ย. 2026) — เสร็จรอบแรก + deploy แล้ว (commit 78ad3b2)

- ✅ **verify helper**: `emoji.test.js` (5 เคส: VS16 strip + ZWJ + surrogate) + curl CDN @15.1.0/@latest คืน 200 · pin เป็น `@15.1.0`
- ✅ **แทน dynamic `.emoji` ครบ**: PetStatPopup, PetDetailModal, ProfileModal, PetsView, ShopView (egg+reveal), SeedPicker, FarmGrid (plot+inv), TagChips, AdminView (tag)
- ✅ **เครดิต** Twemoji CC-BY 4.0 ใน `README.md`
- ⏳ **ยังไม่ตรวจด้วยตาในแอปจริง** (build ผ่าน + CDN 200 = มั่นใจระดับหนึ่ง) — ควร eyeball ขนาด/ภาพหน้า Pets/Shop
- ⬜ **กลุ่ม `.icon` (news/rank/admin/help) ยังไม่ทำ** — ออปชัน (ดูตารางด้านล่าง)
- ⬜ **emoji hardcode ใน template (nav 🏠, title ฯลฯ) อยู่นอก scope** — แปลงเฉพาะ emoji ข้อมูลที่ความเหมือนข้ามเครื่องสำคัญ

## งานที่ให้ Claude Code ทำ

### 1. Verify helper ก่อน
- `npm run build` ต้องผ่าน (ไฟล์ใหม่ไม่พังอะไร)
- เปิด dev ลองวาง `<Emoji char="🐱" />` ที่ไหนสักที่ → ต้องเห็นรูปแมว Twemoji (ไม่ใช่ emoji เครื่อง)
- ลอง `<Emoji char="✌️" />` กับ `<Emoji char="🛠️" />` (เคส VS16) → ต้องขึ้นรูปถูก ไม่แตก

### 2. แทน `{{ ...emoji }}` → `<Emoji>` (เริ่มจากกลุ่มเพ็ทก่อน)

import `<Emoji>` ในแต่ละไฟล์: `import Emoji from '@/components/shared/Emoji.vue'`
(หรือ path สัมพัทธ์ตามโครงเดิม เช่น `'../shared/Emoji.vue'` / `'../components/shared/Emoji.vue'`)

**กลุ่มเพ็ท (ทำก่อน — เห็นบ่อย/สำคัญ):**

| ไฟล์ | จุด |
|---|---|
| `components/pets/PetDetailModal.vue:6` | `{{ pet.emoji }}` |
| `components/pets/PetStatPopup.vue:6` | `{{ pet.emoji }}` |
| `views/PetsView.vue:27` | `{{ p.emoji }}` |
| `components/members/ProfileModal.vue:32` | `{{ p.emoji }}` |
| `views/ShopView.vue:16,38` | `{{ egg.emoji }}`, `{{ reveal.emoji }}` |

แทนแบบ: `{{ pet.emoji }}` → `<Emoji :char="pet.emoji" />`

**กลุ่ม badge/tag:**

| ไฟล์ | จุด |
|---|---|
| `components/shared/TagChips.vue:6` | `{{ getTag(id)?.emoji }}` |
| `views/AdminView.vue:116` | `{{ t.emoji }}` |

**กลุ่ม crop / news icon (จะทำหรือไม่ก็ได้ — ทำให้ครบทั้งเกมค่อยทำ):**

| ไฟล์ | จุด |
|---|---|
| `components/farm/FarmGrid.vue:19,42` · `SeedPicker.vue:16` | crop emoji |
| `components/home/NewsBoard.vue:8` · `views/RankView.vue:14` · `views/AdminView.vue:133` · `HelpModal.vue:12` | `.icon` |

> ข้าม `FarmGrid.vue:79,102` (เป็นการ `.join()` ใน computed ไม่ใช่ template — ใช้ component ไม่ได้)

### 3. ขนาดต้องไม่เพี้ยน
`<Emoji>` เป็น `width:1em` → CSS เดิมที่ตั้ง `font-size` บน container (เช่น `.pd-emoji{font-size:3rem}`, `.pt-cell-emoji`) จะคุมขนาดได้เหมือนเดิม เช็กว่าไม่มีจุดไหนรูปเล็ก/ใหญ่ผิด

### 4. เครดิต (บังคับตามไลเซนส์ CC-BY 4.0)
เพิ่มใน `README.md` หนึ่งบรรทัด:
`Emoji graphics by Twemoji (https://github.com/jdecked/twemoji), licensed under CC-BY 4.0.`

### 5. (ออปชัน) pin เวอร์ชัน
ใน `src/utils/emoji.js` เปลี่ยน `@latest` → เวอร์ชันคงที่ (เช่น `@15.1.0`) เพื่อกันภาพเปลี่ยนเองเวลา twemoji อัปเดต

---

## Free resources อื่น (ถ้าจะไปต่อ)

- **Badge/ไอคอนธาตุแบบวาดจริง:** [game-icons.net](https://game-icons.net/) — SVG 4,000+ CC-BY 3.0 ปรับสีได้ (เหมาะกับ medal/✊✌️✋)
- **สไปรต์สัตว์วาดเอง (ไม่ใช่ emoji):** [Kenney.nl](https://kenney.nl/) CC0 (ไม่ต้องเครดิต) · itch.io / OpenGameArt (เช็กไลเซนส์ทีละแพ็ค)
- เลี่ยงของที่เป็น "non-commercial only" หรือบังคับเครดิตในแอพ — เอา CC0 / CC-BY / Apache ไว้ก่อน (โปรเจค public บน GitHub Pages)

## หมายเหตุ performance
- ~40 เพ็ท = ~40 SVG เล็กๆ โหลดจาก CDN + cache + `loading="lazy"` → เบามาก
- ถ้าอยากตัด dependency CDN ภายหลัง: ดาวน์โหลด SVG เฉพาะที่ใช้มาไว้ `public/emoji/` แล้วชี้ `CDN` ใน emoji.js มาที่ path นั้น
