# พรอมพ์เจนสไปรต์ RxTU10 (Pet / Badge / Element)

ใช้กับ ChatGPT (GPT-4o image) หรือ DALL·E 3 — พรอมพ์ภาพเขียนเป็นภาษาอังกฤษ (โมเดลทำงานดีกว่า) คำอธิบายเป็นไทย

---

## สรุปคอสต์ & วิธีที่คุ้มสุด

- **อย่าพึ่ง sprite sheet** กับ GPT-4o/DALL·E — ช่องไม่เท่ากัน สไตล์เพี้ยนข้ามช่อง ไม่มี alpha จริง เสียคอสต์ retry
- ตัวประหยัดจริง = **ความนิ่งของสไตล์** → เจนทีละตัวแต่ใช้ STYLE BLOCK เดียวกันนำหน้าทุกพรอมพ์
- พื้นหลัง: สั่งให้เป็น **สีพื้นเรียบสีเดียว** (เช่น pure magenta #FF00FF) แล้วค่อยคีย์ออกทีหลัง — ง่ายกว่าขอ "transparent" ตรงๆ
- ถ้าจะลอง sheet จริง ทำทีละ **4-6 ตัว** กลุ่ม rarity เดียวกัน ไม่เกินนั้น

---

## 1) STYLE BLOCK (ก็อปไปแปะหัว *ทุก* พรอมพ์)

```
Art style: cute kawaii chibi mascot, rounded shapes, thick clean dark outline,
soft cel shading, vibrant but cohesive palette, friendly big eyes.
Single character centered, full body, facing slightly 3/4 front, ~60% of frame.
Flat solid background color #FF00FF (pure magenta), no scene, no text, no shadow on ground.
Square 1:1, high detail, game asset, consistent style across a set.
```

> เก็บ style block นี้ไว้คงที่ ห้ามแก้ระหว่างเจนทั้งชุด — ความนิ่งมาจากตรงนี้

**โทนสีตามระดับ (rarity) — ใส่ต่อท้ายเพื่อให้ aura ต่างกัน:**

| Rarity | สี (จาก data) | คำต่อท้ายพรอมพ์ |
|---|---|---|
| common | #94a3b8 เทา | `subtle soft grey rim light` |
| rare | #60a5fa ฟ้า | `gentle blue glow aura` |
| epic | #c084fc ม่วง | `purple magical glow, small floating sparkles` |
| legendary | #fbbf24 ทอง | `radiant golden aura, glowing particles, premium legendary look` |

---

## 2) เทมเพลตเพ็ท (Pet)

```
[STYLE BLOCK]
Subject: a {ANIMAL}, themed as a cute pharmacy-student companion.
Character vibe: {FLAVOR/PERSONALITY}.
Rarity aura: {RARITY SUFFIX}.
```

### ตัวอย่างกรอกจริง (จาก data เกม)

**cat / แมวเหมียว (common, paper)**
```
[STYLE BLOCK]
Subject: a small round kitten, themed as a sleepy pharmacy-student companion.
Character vibe: dozing on a lab sheet, lazy and adorable.
Rarity aura: subtle soft grey rim light.
```

**fox / จิ้งจอก (rare, scissors)**
```
[STYLE BLOCK]
Subject: a clever fox, themed as a sharp pharmacy-student companion.
Character vibe: alert, smart, sniffing out drug interactions.
Rarity aura: gentle blue glow aura.
```

**dragon / มังกรน้อย (epic, fist)**
```
[STYLE BLOCK]
Subject: a small chubby baby dragon, themed as a pharmacy-lab companion.
Character vibe: breathes a tiny purifying flame, mischievous.
Rarity aura: purple magical glow, small floating sparkles.
```

**bahamut / บาฮามุท (legendary, scissors)**
```
[STYLE BLOCK]
Subject: a majestic ancient dragon king with wide wings, chibi but regal.
Character vibe: powerful, protective, noble.
Rarity aura: radiant golden aura, glowing particles, premium legendary look.
```

**celestial / ดาวเหนือ (legendary, paper)**
```
[STYLE BLOCK]
Subject: a glowing celestial star-spirit, soft and ethereal, chibi mascot.
Character vibe: a guiding light in the dark before exams.
Rarity aura: radiant golden aura, glowing particles, premium legendary look.
```

> เพ็ทที่เหลือใช้คอลัมน์ `name` + `flavor` ใน `src/data/index.js` มาเติมช่อง Subject/vibe ได้เลย

---

## 3) เทมเพลต Badge / Tag

ปัจจุบันมี 4 อัน (`src/data/tags.js`): founder 🏅, supporter 💖, helper 🛠️, og ⭐

```
Art style: flat vector emblem badge, circular medal shape, thick clean outline,
glossy enamel-pin look, bold simple icon in the center, soft inner shadow.
Single badge centered, ~70% of frame, flat solid background #FF00FF (pure magenta),
no text, square 1:1, game UI asset, consistent style across a set.
Badge color theme: {COLOR}. Center icon: {ICON CONCEPT}.
```

**ตัวอย่าง:**

| Tag | สี | กรอก ICON CONCEPT |
|---|---|---|
| founder (ผู้บุกเบิก) | gold #f59e0b | `a pioneer flag / first-place medal star` |
| supporter (ซัพพอร์ตเตอร์) | pink #ec4899 | `a glowing heart` |
| helper (ทีมงาน) | blue #3b82f6 | `crossed wrench and screwdriver tools` |
| og (รุ่นแรก) | purple #8b5cf6 | `a bold shining star` |

```
Art style: flat vector emblem badge, circular medal shape, thick clean outline,
glossy enamel-pin look, bold simple icon in the center, soft inner shadow.
Single badge centered, ~70% of frame, flat solid background #FF00FF, no text,
square 1:1, game UI asset, consistent style across a set.
Badge color theme: gold #f59e0b. Center icon: a pioneer flag with a first-place star.
```

---

## 4) เทมเพลตไอคอนธาตุ (Element) — ออปชัน

3 ธาตุ: ✊ fist (ค้อน), ✌️ scissors (กรรไกร), ✋ paper (กระดาษ) — แบบเป่ายิ้งฉุบ

```
Art style: flat vector game icon, rounded chunky shape, thick outline, glossy,
single object centered ~65% of frame, flat solid background #FF00FF, no text, square 1:1.
Object: a stylized {fist / pair of scissors / sheet of paper} with a soft {COLOR} glow.
```

---

## 5) เทคนิคให้ใช้งานได้จริง

1. **เจนทีละตัว ใช้ style block เดิม** — ห้ามแก้ถ้อยคำ style ระหว่างชุด
2. **พื้น magenta #FF00FF** แล้วลบพื้นทีหลัง (remove.bg / Photopea / Python rembg) → ได้ PNG โปร่ง
3. **ขนาดเจน 1024×1024** แล้วย่อเก็บเป็น 256×256 หรือ 512×512 (มือถือไม่ต้องใหญ่)
4. **คุมความนิ่ง**: เจนตัวแรกที่ชอบ → บอก ChatGPT "keep this exact style for the next one" + แนบรูปอ้างอิง
5. **เริ่มจากกลุ่มเด่นก่อน** — legendary 6 ตัว + epic + badge 4 อัน (จุดที่คนเห็นบ่อย) ค่อยไล่ common ทีหลัง คุม cost ได้
6. ในแอพ: เก็บไฟล์ที่ `public/pets/{id}.png` แล้ว fallback เป็น emoji เดิมถ้าโหลดรูปไม่ได้ (กันภาพแตก)

---

## รายชื่อเพ็ททั้งหมด (อ้างอิงเร็ว)

ดึงจาก `src/data/index.js` — id · name · rarity · element · flavor (เอา flavor ไปเป็น "vibe")

- **common (15):** cat, rabbit, hamster, frog, penguin, hedgehog, mouse, chick, axolotl, seal, snail, ladybug, duck, koala, capybara
- **rare (12):** fox, owl, panda, butterfly, wolf, peacock, octopus, flamingo, deer, shark, parrot, turtle
- **epic (9):** dragon, unicorn, phoenix, spirit, kitsune, thunderbird, leviathan, cerberus, tanuki
- **legendary (6):** celestial, bahamut, kirin, ouroboros, simurgh, qilin(บากุ)
