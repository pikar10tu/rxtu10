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

## 🔜 ทางเลือก asset อื่น (Twemoji แบนไป ไม่สวย) — เลือกใน session หน้า

> ปัญหา: Twemoji ดูแบน/เรียบไป user อยากได้ที่น่ารัก/มีมิติกว่า
> ข่าวดี: ตัวที่เป็น **codepoint-based** สลับได้แทบจะแค่แก้ `CDN` + รูปแบบชื่อไฟล์ใน `emoji.js` (`<Emoji>` เดิมใช้ต่อได้) — verify CDN แล้ว ✅

| ตัวเลือก | สไตล์ | License | งานที่ต้องทำ | CDN (verify 200 แล้ว) |
|---|---|---|---|---|
| **OpenMoji** ⭐ | เส้นวาด outline มีเอกลักษณ์ น่ารัก | CC-BY-SA 4.0 | **น้อย** — codepoint **UPPERCASE** (`.toUpperCase()`) | `cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@15.0.0/color/svg/1F431.svg` |
| **Noto Emoji** (Google) | แบนสะอาด สีสด กลมๆ | OFL/CC-BY 4.0 | **น้อย** — prefix `emoji_u` + lowercase + `_` join | `cdn.jsdelivr.net/gh/googlefonts/noto-emoji@main/svg/emoji_u1f431.svg` |
| **Fluent Emoji** (MS) ✅เลือกแล้ว | **3D/มีมิติ สวยสุด** (มี Flat/Color/3D) | **MIT (ดีสุด)** | **มาก** — ดูบล็อกด้านล่าง | ⚠️ jsDelivr เสิร์ฟไม่ได้ (repo >50MB) |
| **Twemoji** (ปัจจุบัน) | แบน เรียบ | CC-BY 4.0 | — | ใช้อยู่ |

**ข้อเสนอ session หน้า:**
1. ลองสลับ **OpenMoji** ก่อน (5 นาที: แก้ `emojiCodepoint` → `.toUpperCase()` + เปลี่ยน `CDN`) เทียบของจริงในแอป — น่าจะถูกใจกว่า ได้ลุคน่ารักทันที
2. ถ้าอยากสวยจริง (3D) → ลงทุนทำ **Fluent** (map ชื่อ) คุ้มถ้าอยากให้เกมดูพรีเมียม
3. **ทางที่ดีที่สุดสำหรับเพ็ท/พืชโดยเฉพาะ** = ใช้ **sprite วาดจริง** (ไม่ใช่ emoji) เช่น Kenney CC0 — แต่ต้อง map ทีละตัว (~40 เพ็ท + พืช) งานเยอะสุด ลุคดีสุด · อาจผสม: emoji set สำหรับ UI/แท็ก + sprite สำหรับเพ็ท
4. เก็บโครง `<Emoji>` + fallback ไว้ ไม่ว่าเลือกอันไหน (เปลี่ยนแค่แหล่งรูป)

> หมายเหตุ license: OpenMoji = **SA** (ถ้าดัดแปลงรูปต้องเปิดเผยแบบเดียวกัน — ใช้ตรงๆ ไม่แก้ ไม่มีปัญหา) · Fluent = MIT (ยืดหยุ่นสุด) · เครดิตใน README ปรับตามตัวที่เลือก

## ✅ เสร็จแล้ว (16 มิ.ย. 2026): เปลี่ยนเป็น **Fluent Emoji** (Color SVG) self-host

ลงมือเสร็จ + build ผ่าน: `scripts/fetch-fluent.mjs` ดึง **65/65** ตัว → `public/emoji/fluent/<codepoint>.svg` (รวม 1.7MB) · `emoji.js` เปลี่ยน `twemojiUrl`→`fluentFile` (path สัมพัทธ์ local) · `Emoji.vue` ใช้ `BASE_URL + fluentFile` · README เครดิต Fluent (MIT) · เทส 5 เคสผ่าน
- **กับดักที่เจอ**: ชื่อไฟล์ derive จาก**ชื่อโฟลเดอร์** (lowercase + space→`_`, hyphen คงไว้ เช่น `jack-o-lantern_color.svg`) ไม่ใช่ slug · emoji มี skin-tone (มือ ✊✌️✋) ซ้อนใน `Default/Color/<base>_color_default.svg`
- เพิ่ม emoji ใหม่ในเกมภายหลัง → รัน `node scripts/fetch-fluent.mjs` ซ้ำ (idempotent)
- ✅ **แปลง hardcoded emoji ทั้งแอปแล้ว (16 มิ.ย. commit 67a96f5)**: `scripts/emojify.mjs` codemod แทน emoji ใน text node ของ `<template>` → `<Emoji>` (137 จุด/25 ไฟล์) แก้ tofu ทุก icon ที่เป็นข้อความ (nav/title/ปุ่ม/ป้าย) + RankView medal podium 🥇🥈🥉
- **เหลือ (ปล่อยตั้งใจ)**: emoji ใน JS expression (`{{ ternary/template-literal }}` เช่นปุ่ม dynamic 💾📥, toast) — component แทนตรงๆ ไม่ได้ + เป็น emoji ทั่วไป tofu น้อยมาก · ถ้าจำเป็นค่อยแก้ทีละจุด

---

## (เดิม) DECISION 16 มิ.ย.: เลือก Fluent — เก็บไว้อ้างอิงข้อจำกัด

**ข้อจำกัดที่ verify แล้ว (ground truth จาก repo จริง):**
1. **jsDelivr/CDN gh เสิร์ฟไม่ได้** — `microsoft/fluentui-emoji` repo > 50MB (มี 3D PNG เป็นพัน) jsDelivr ปฏิเสธ → **สลับแบบแก้ `CDN` เฉยๆ ไม่ได้** (ต่างจาก OpenMoji/Noto)
2. **ต้อง self-host subset** — โหลดเฉพาะ emoji ที่แอปใช้จริง (~60–80: pet/crop/tag/egg ใน `data/*.js`) ลง `public/emoji/fluent/` เสิร์ฟผ่าน GitHub Pages
3. **ชื่อไฟล์อิงชื่อ ไม่ใช่ codepoint:**
   - โฟลเดอร์ = **Sentence case** ของชื่อ CLDR เช่น `Cat face` (ไม่ใช่ `Cat Face`)
   - path: `assets/<Sentence case>/<Style>/<snake_case>_<style>.<ext>` เช่น `Cat face/Color/cat_face_color.svg`
   - แต่ละตัวมี `metadata.json` → fields `glyph`(🐱) `unicode`(1f431) `cldr`(cat face) = **แหล่ง gen map codepoint→ชื่อไฟล์**

**สไตล์ (ขนาดจริงจาก cat face):** 3D = PNG **37KB** (สวยสุด raster) · **Color = SVG 27KB (vector คมทุกขนาด — แนะนำ)** · Flat = SVG 2.6KB (เรียบ)

**ขั้นลงมือ session หน้า (TDD):**
1. เขียน `scripts/fetch-fluent.mjs` (node): enumerate emoji ที่ใช้ (สแกน `data/pets|crops|tags|shop`.js + ตัว hardcode ถ้าจะเอา) → สำหรับแต่ละตัว map codepoint→ชื่อโฟลเดอร์ (ดึง list+metadata จาก GitHub API/raw ครั้งเดียว) → ดาวน์โหลด **Color SVG** ลง `public/emoji/fluent/<unicode>.svg` (rename เป็น codepoint จะได้ map ตรงกับ `<Emoji>` เดิม)
2. แก้ `Emoji.vue`/`emoji.js`: `url = /emoji/fluent/<codepoint>.svg` (base `import.meta.env.BASE_URL`) — codepoint logic เดิมใช้ต่อได้, ตัด CDN ภายนอกออก
3. fallback เดิมคงไว้ (โหลดไม่เจอ → emoji เครื่อง) เผื่อ Fluent ไม่มีบางตัว
4. เครดิต README: เปลี่ยนเป็น Fluent Emoji (MIT) · ลบบรรทัด Twemoji CC-BY
5. ขนาด subset ~80×27KB ≈ 2MB ใน `public/` (commit เข้า repo) — รับได้ · เช็ก build/deploy ไม่บวมเกิน
6. ตัว emoji ที่ Fluent ไม่มี → ปล่อย fallback (อย่าลืม log ว่าตัวไหนหายตอน fetch)

> ทำไม self-host (ไม่ใช้ raw.githubusercontent): raw ไม่ใช่ CDN จริง (rate-limit, GitHub ห้าม hotlink prod) · self-host = เร็ว/นิ่ง/ออฟไลน์ได้/ไม่พึ่งใคร

## Free resources อื่น (ถ้าจะไปต่อ)

- **Badge/ไอคอนธาตุแบบวาดจริง:** [game-icons.net](https://game-icons.net/) — SVG 4,000+ CC-BY 3.0 ปรับสีได้ (เหมาะกับ medal/✊✌️✋)
- **สไปรต์สัตว์วาดเอง (ไม่ใช่ emoji):** [Kenney.nl](https://kenney.nl/) CC0 (ไม่ต้องเครดิต) · itch.io / OpenGameArt (เช็กไลเซนส์ทีละแพ็ค)
- เลี่ยงของที่เป็น "non-commercial only" หรือบังคับเครดิตในแอพ — เอา CC0 / CC-BY / Apache ไว้ก่อน (โปรเจค public บน GitHub Pages)

## หมายเหตุ performance
- ~40 เพ็ท = ~40 SVG เล็กๆ โหลดจาก CDN + cache + `loading="lazy"` → เบามาก
- ถ้าอยากตัด dependency CDN ภายหลัง: ดาวน์โหลด SVG เฉพาะที่ใช้มาไว้ `public/emoji/` แล้วชี้ `CDN` ใน emoji.js มาที่ path นั้น
