# RxTU10 v2 — แผนพัฒนา (รีวิว 13 มิ.ย. 2026)

สถานะ: โค้ดเบสแข็งแรง สถาปัตยกรรมดี (Vue 3 + Pinia + Firestore, optimistic update + rules)
ตอนนี้ล็อกให้เห็นเฉพาะ admin/academic — เป้าหมายของแผนนี้คือเปิดตัวให้ทั้งชั้นปีใช้

---

## 🔴 Phase 0 — ก่อนเปิดตัว (บล็อกการ launch ทั้งหมด)

> ✅ **โค้ดเสร็จครบทั้ง 5 ข้อแล้ว (15 มิ.ย. 2026)** — build ผ่าน
> ⚠️ **เหลือ deploy เท่านั้น:** `npm run build && firebase deploy --only hosting,firestore:rules`
> (rules เปลี่ยน: เพิ่ม `config/{doc}`, examSessions create-only, ลบ srsCards — **ต้อง deploy ไม่งั้น launch toggle ใช้ไม่ได้**)
> หลัง deploy → เปิดเว็บจริงด้วยปุ่ม 🚀 ในแท็บ Admin (ไม่ต้อง deploy ซ้ำ)

### 1. Nav ของนักศึกษาผิด — ✅ เสร็จ (`App.vue`: `:to` แยกตาม `isAcademic`)
Bottom nav มีปุ่ม "📝 ข้อสอบ" ชี้ไป `/questions` ซึ่งเป็นหน้าจัดการคลังข้อสอบ
(นักศึกษาเข้าแล้วเจอ "เฉพาะแอดมินหรือทีมวิชาการเท่านั้น")
→ แยกเงื่อนไข: นักศึกษาเห็นปุ่มไป `/quiz`, ทีมวิชาการเห็น `/questions`

### 2. บั๊ก UI: ปุ่มลัดหน้า Home มองไม่เห็น — ✅ เสร็จ (`HomeView`: `.hs-label/.hs-sub` → var สีธีม, การ์ดพื้น #fff)
`.hs-label` ใช้ `color:#fff` บนพื้นหลัง `rgba(255,255,255,.06)` — ธีมแอพเป็นพื้นสว่าง
ตัวหนังสือขาวบนพื้นขาว มาจากธีมมืดเวอร์ชันเก่า → เปลี่ยนเป็น `var(--text)` + พื้น `#fff`

### 3. ย้าย launch gate จาก hardcode ไป Firestore — ✅ เสร็จ (`composables/useAppConfig.js` + toggle ใน Admin)
ตอนนี้ gate อยู่ใน `App.vue` (`v-else-if="authStore.isAcademic"`) เปิดตัวต้อง deploy ใหม่
→ สร้าง doc `config/app { maintenance: true/false }` + onSnapshot → เปิด/ปิดได้ทันทีจาก Admin

### 4. ปิดช่องโหว่เหรียญ: ฝึกอิสระ (Study) ฟาร์มเหรียญได้ไม่จำกัด — ✅ เสร็จ (cap 150/วัน + ฟิลด์ studyCoinDate/studyCoinsToday)
`grade()` ให้ 5🪙/ใบ ทุก session ใหม่ → กด "ฝึกอิสระ" วนได้เรื่อยๆ (100🪙/รอบ ไม่มีเพดาน)
→ ใส่ daily cap แบบเดียวกับ Quiz (เช่น studyCoinsToday ≤ 150/วัน)

### 5. Quiz: สลับตำแหน่งตัวเลือก — ✅ เสร็จ (`shuffleChoices()` remap index เฉลย ตอน start())
เฉลยอยู่ตัวอักษรเดิมเสมอ ทำซ้ำ = จำตัวอักษรไม่ใช่เนื้อหา → shuffle choices ตอน start()

### 6. งานที่ค้างจากรอบก่อน (ทำแล้ว รอ deploy)
- [x] login มือถือ redirect / long-polling / hosting config / rules news — push แล้ว
- [ ] `firebase deploy --only firestore:rules` (⚠️ ยังไม่ได้รัน — บล็อก launch toggle)
- [x] rules `examSessions` → create-only (ตัด update/delete) — แก้แล้ว รอ deploy
- [x] ลบ rules `srsCards` subcollection ที่ไม่ได้ใช้ — แก้แล้ว รอ deploy

---

## 🟠 Phase 1 — สัปดาห์เปิดตัว

1. **ทีมวิชาการกรอกคลังข้อสอบ** — ระบบพร้อมแล้ว เริ่มได้ทันที (เป้า ≥50 ข้อ ก่อนเปิด)
2. **หน้าประวัติการทำข้อสอบ** — `examSessions` ถูกบันทึกอยู่แล้วแต่ไม่มีใครอ่าน
   แสดง: คะแนนล่าสุด, กราฟพัฒนาการ, สถิติรายหมวด → ผู้ใช้เห็นความก้าวหน้า = กลับมาซ้อมซ้ำ
3. **Rank board "📝 ข้อสอบ"** (จาก `quizHigh` ที่เก็บอยู่แล้ว) + **ซ่อน board PvP/หอคอย**
   (ตอนนี้โชว์ 0 ทั้งกระดาน ดูเหมือนเว็บพัง เพราะฟีเจอร์ยังไม่มา)
4. **นับถอยหลังสอบบน Home** — มี `PLE_CC_DATE` (11 ธ.ค. 2026) ใน config อยู่แล้วแต่ไม่ได้ใช้
   → ดูรายละเอียด UI ใน **🏠 หน้าหลัก: ภาพรวมวันนี้** ด้านล่าง
5. อัปเดต `guide.js` ให้มีหมวด Study/Quiz (ตอนนี้ copy บางจุดเก่า เช่น "ปราสาท 12 ขั้น"
   แต่ Lv12 จริงคือเกาะส่วนตัว)

---

## 🟡 Phase 2 — ระบบเตรียมสอบเชิงลึก (จุดขายหลักของแอพ)

1. **ข้อที่ตอบผิด → เข้า SRS อัตโนมัติ** — เชื่อม Quiz กับ Study เป็น loop เดียว:
   ทำข้อสอบ → ผิดข้อไหน ระบบจำ → โผล่ในรอบทบทวนจน "แม่น"
2. **โหมดทบทวนเฉพาะหมวด** ใน Study (ตอนนี้ deck รวม 78 ตัวยาก้อนเดียว เลือกหมวดไม่ได้)
3. **Daily quest ผูกเหรียญกับการเรียน** (ดู Economy ด้านล่าง) — เช่น
   "ทบทวนครบโควต้าวันนี้ → รายได้บ้าน +25% เป็นเวลา 24 ชม."
   ให้การเรียนเป็น "ตัวคูณ" ของเกม แทนที่จะแข่งแจกเหรียญตรงๆ (คุมเงินเฟ้อได้)
   → UI แสดงผลอยู่ใน **🏠 หน้าหลัก: ภาพรวมวันนี้** ด้านล่าง
4. **Streak การทบทวน** — แสดงไฟ 🔥 ติดต่อกันกี่วัน (กลไกเดียวที่พิสูจน์แล้วว่าคนกลับมาทุกวัน)
   → UI แสดงผลอยู่ใน **🏠 หน้าหลัก: ภาพรวมวันนี้** ด้านล่าง

---

## 🟢 Phase 3 — เกมและสังคม

1. Battle engine: PvP / หอคอย → ดูรายละเอียดใน **⚔️ Battle System Rework** และ **🏯 Tower Rework** ด้านล่าง
2. ตลาด (market) — `marketUnlocked` ปลดที่ Lv4 แต่ยังไม่มีระบบ → ซื้อขายเพ็ท/ผลผลิตระหว่างผู้เล่น
3. เภสัช Crush / Co-op ตามการ์ด "เร็วๆ นี้" ใน Play
4. Gacha ใหม่ Genshin-style → ดูรายละเอียดใน **🎰 Gacha ใหม่** ด้านล่าง

---

## 🏠 หน้าหลัก: ภาพรวมวันนี้

> ปรับ mindset Home จาก "รวมทางลัด" → "ตอบคำถาม วันนี้ฉันควรทำอะไร?" ใน 5 วินาที

**เลย์เอาต์ใหม่ (บนลงล่าง):**

### ① นับถอยหลัง PLE CC — ✅ ทำได้ทันที
- ใช้ `PLE_CC_DATE = '2026-12-11T00:00:00+07:00'` ใน `src/firebase/config.js` render "เหลืออีก X วัน" ตัวเลขใหญ่บนสุด
- เป้าหมายร่วมของทั้งชั้นปี ทำให้ทุกคนรู้สึกว่าเวลาเหลือน้อย
- *(รวม Phase 1 ข้อ 4 มาอยู่ที่นี่)*

### ② งานวันนี้ของฉัน

| Widget | พร้อม? | รายละเอียด |
|---|---|---|
| 📚 การ์ด SRS ครบกำหนด X ใบ | ✅ ทันที | ดึงจาก `userData.study.cards` — `nextReviewDate <= Date.now()` (pattern จาก `StudyView.vue:129`) |
| 🔥 Streak กี่วันติด | ⏳ schema | เพิ่ม `study.lastStudied` ใน `src/data/userSchema.js` + update ใน StudyView ทุก grade |
| ⚡ Daily quest buff | ⏳ Phase 2.3 | รอระบบ daily quest (Phase 2 ข้อ 3) |
| 🎓 ปุ่มจัดการยา/ข้อสอบ | ✅ ทันที | เห็นเฉพาะ `auth.isAcademic` — link ไป `/questions` (ข้อสอบ) + deck management (ยา) |

*(รวม Phase 2 ข้อ 3 และ 4 มาอ้างอิงที่นี่)*

### ③ อีเวนต์/ความเคลื่อนไหวกลุ่ม (ยกระดับ NewsBoard)

ปัจจุบัน `news` collection มี `{ id, msg, icon?, ts }` — เพียงพอสำหรับประกาศธรรมดา

| การเปลี่ยนแปลง | พร้อม? | หมายเหตุ |
|---|---|---|
| เพิ่ม `type` field (`announce` / `event` / `achievement`) | ✅ ทันที | backward-compatible, `NewsBoard.vue:28` |
| Admin โพสต์ event (เปิดชุดข้อสอบใหม่, เหรียญ x2 สุดสัปดาห์) | ✅ ทันที | เพิ่ม dropdown type ใน AdminView |
| auto-post เมื่อคนขึ้นอันดับ | ⏳ รอหลังเปิด | ต้องการ client trigger |

### ④ ทางลัด
ของเดิม — จัดลำดับใหม่ให้ Study/Quiz ขึ้นก่อน (core loop ของแอพ)

**ลำดับการพัฒนา:**
```
ทำได้เลย    : ① countdown + ② SRS due count + ② academic button + ③ event type + admin post
รอ Phase 2  : ② streak (schema เล็กน้อย) + daily quest buff
รอหลังเปิด  : ③ auto-post achievement
```

---

## 🎰 Gacha ใหม่ (Genshin-style) — แทนระบบไข่

**ทำไมเปลี่ยน:** ระบบไข่ปัจจุบัน = "เลือก tier จ่ายเงิน" ขาดความตื่นเต้นและการวางแผน
Gacha + pity → ผู้เล่นรู้สึกว่าพยายามแล้วต้องได้ มีเป้าหมายที่ชัดเจน

### สิ่งที่ต้องทำ

1. **ลบระบบไข่เดิม** — `userSchema.js` ลบ `eggs: []`, ลบ egg UI ใน `ShopView.vue`
   (ปัจจุบัน eggs array ไม่ได้ใช้งานจริง — `rollPetFromEgg` สร้าง pet โดยตรง)
2. **Banner system** — featured pet หมุนเวียน ตั้งจาก admin หรือ config
   - เพิ่ม `gachaFeaturedId` ใน `src/firebase/config.js`
   - เพิ่ม `gachaPity: { standard: 0, featured: 0 }` ใน `src/data/userSchema.js`
3. **Pity mechanic**
   - Soft pity ~75 pulls: rate legendary เริ่มเพิ่มขึ้นแบบ step
   - Hard pity 100 pulls: การันตี legendary (featured มี 50/50 → guaranteed ครั้งถัดไป)
4. **Pull modes**
   - Single pull ~8,000 🪙 (เทียบ gold egg เดิม)
   - 10-pull ~72,000 🪙 (discount 10%) + การันตี rare ขึ้นไปอย่างน้อย 1 ใบ
5. **Rate pools**
   - Standard banner: rate เดิมจาก gold egg (common 0%, rare 28%, epic 52%, legendary 20%)
   - Featured banner: legendary up-rate ตัวที่เลือก, pity counter แยกจาก standard
6. **Animation**
   - Reveal ทีละใบ (10-pull) พร้อม delay แบบ Genshin
   - Star burst effect + shake เมื่อออก epic/legendary
   - ใช้ CSS `@keyframes` + JS delay — ไม่จำเป็นต้องมี 3D library

---

## ⚔️ Battle System Rework (ทีมเพ็ทสู้พร้อมกัน — Auto-resolve)

*(รวม/แทนที่ Phase 3 ข้อ 1)*

**แนวทาง: async team-auto-battle** (client-only ทำได้ ไม่ใช่ real-time)
- ผู้เล่นตั้งทีม 3–4 เพ็ท (ตามเลเวลบ้าน — `activePets` มีใน user doc แล้ว)
- กด "สู้" → engine resolve battle ฝั่ง client → animate ผลการสู้ (fast-forward ได้)
- เพ็ทในทีมโจมตีพร้อมกันตาม speed/cooldown (ไม่ใช่ turn-by-turn แบบเก่า)

### Engine ที่ต้องสร้าง

1. **`utils/battleEngine.js`**
   - Damage calc: ATK × element multiplier × crit roll (crit rate/dmg มีใน potential แล้ว)
   - Element: ✊✌️✋ มีใน `data/index.js` พร้อม advantage table
   - Lifesteal, Dodge — ใช้ค่าจาก potential affixes
2. **`data/towerFloors.js`** — bot team config ต่อชั้น (หรือ procedural gen จาก floor number)
3. **PvP async** — snapshot ทีม user เก็บใน Firestore → ดึง opponent snapshot มา resolve client-side

### Field ที่ต้องเพิ่มใน userSchema

- `pvpRecord: { wins, losses }` (`pvpVictories` มีอยู่แล้ว แต่ขาด losses)
- `lastPvpAt: null` (cooldown กัน spam)

---

## 🏯 Tower Rework (AFK Arena — ชั้นหอคอย = รายได้ประจำวัน)

*(รวม/แทนที่ส่วน tower ใน Phase 3)*

**แนวคิด:** `towerBest` → บวก flat coins ต่อวันแทนรางวัลครั้งเดียวต่อด่าน
ยิ่งดันสูง ยิ่งรวยเร็วตลอดไป — tower เป็น "passive investment" ระยะยาว

### Bonus ladder (tunable ใน `data/towerBonus.js`)

| Tower Floor | Bonus รายวัน |
|---|---|
| 1–9 | +0 🪙 |
| 10–19 | +500 🪙 |
| 20–29 | +1,500 🪙 |
| 30–49 | +4,000 🪙 |
| 50–74 | +10,000 🪙 |
| 75+ | +20,000 🪙 |

*(floor 30 ≈ รายได้บ้าน Lv6 ตั้งใจให้สมดุล — ปรับตัวเลขที่ `data/towerBonus.js`)*

### สิ่งที่ต้องสร้าง

1. **`data/towerBonus.js`** — `export function getTowerBonus(floor)` คืน flat coins/วัน
2. แก้ **`src/composables/useDaily.js`** — `baseIncome += getTowerBonus(userData.towerBest)`
3. ลบ fixed coin reward ต่อ floor ออก (ถ้ามี) → ใช้ bonus ladder แทน
4. **`data/towerFloors.js`** — bot team config ต่อชั้น (ใช้ร่วมกับ Battle Engine)

---

## 💰 Coin Economy — วิเคราะห์และข้อเสนอ

### ตัวเลขปัจจุบัน (ต่อวัน)

| แหล่งรายได้ | Lv2 | Lv6 | Lv12 |
|---|---|---|---|
| บ้าน (idle) | 600 | 5,000 | 55,000 |
| ฟาร์มพืชยาว เต็มแปลง¹ | **15,000** | **34,600** | **220,000** |
| เพ็ทเต็มคลัง (ประมาณ) | ~500 | ~3,000 | ~40,000 |
| Quiz (cap) | 300 | 300 | 300 |
| Study | ไม่จำกัด⚠️ | ไม่จำกัด⚠️ | ไม่จำกัด⚠️ |

¹ มันฝรั่ง 3,000/แปลง/วัน ×5 แปลง · แตงโม 4,333 ×8 · ทานตะวัน 16,000 ×12

### ปัญหา

1. **ฟาร์มกินทุกอย่าง** — พืชยาว (ปลูกแล้วลืม) ให้รายได้ 7–25 เท่าของบ้านที่เลเวลเดียวกัน
   ทำให้ "อัปบ้านเพื่อรายได้" ที่เป็น pitch หลักแทบไม่มีความหมาย คนอัปบ้านเพราะอยากได้แปลงเพิ่ม
2. **รายได้จากการเรียน ≈ 1% ของรายได้เกม** — Quiz cap 300 เทียบฟาร์มหลักหมื่น
   ไม่มีแรงจูงใจทางเศรษฐกิจให้เข้าหน้า Study/Quiz เลย ทั้งที่เป็นเป้าหมายหลักของแอพ
3. **ช่องโหว่ฝึกอิสระ** (Phase 0 ข้อ 4)

### ข้อเสนอปรับ (เลือกใช้ได้)

- **ลด sellPrice พืชยาว ~50–60%** ให้พืชยาวเต็มแปลง ≈ 1–1.5 เท่าของรายได้บ้าน
  (มันฝรั่ง 4200→2400, แตงโม 9000→5500, ฟักทอง 20000→12000, ทานตะวัน 22000→11000,
  ต้นไม้เงินตรา 70000→40000) — พืชสั้นคงเดิม (เป็นรางวัล active play อยู่แล้ว)
- **การเรียนให้ "buff" ไม่ใช่เหรียญดิบ** — ทบทวน SRS ครบ + quiz ≥10 ข้อ → daily income ×1.25 (24 ชม.)
  สเกลตามเลเวลอัตโนมัติ ไม่ inflate เศรษฐกิจ และทำให้คนเก่งเกม = คนที่เรียนสม่ำเสมอ
- เพดาน Study 150/วัน + เพดาน Quiz คงไว้ 300 (เหรียญจากการเรียนเป็น bonus ไม่ใช่รายได้หลัก)
- ราคาบ้าน/ไข่/ศักยภาพ **เหมาะสมแล้ว** ไม่ต้องแตะ (ladder ถึง Lv12 = 1.42M,
  legendary เกรดสูงสุด ≈ 1M — เป็น sink ระยะยาวที่ดี)

### Pacing โดยประมาณหลังปรับ
เปิดเทอม → Lv6 ใน ~2 สัปดาห์ → Lv12 ใน ~2–2.5 เดือน (เล่นสม่ำเสมอ) — พอดีกับหนึ่งเทอม

---

## 🎨 UX/UI Polish (ทำแทรกได้เรื่อยๆ)

1. **ธีมไม่เป็นเอกภาพ** — `style.css` เป็น indigo material (#4f46e5) แต่ Home/Shop ใช้
   ลาเวนเดอร์-ชมพู (#b58df1, #c4a5f5→#f7a8c4), Rank ใช้ slate (#1e293b), Quiz ใช้ indigo
   → เลือกหนึ่งโทน ประกาศเป็น CSS vars แล้วไล่แทนที่ gradient/สีที่ hardcode ทีละหน้า
2. **ฟอนต์เล็กเกินบนมือถือ** — มี .56–.64rem หลายจุด (≈9–10px) → ขั้นต่ำ .7rem
   และปุ่มเล็กสุด 28px → ขั้นต่ำ ~40px (touch target)
3. **PWA** — เพิ่ม manifest + ไอคอน + theme-color ให้ "Add to Home Screen" ได้สวยๆ
   (นักศึกษาใช้มือถือเป็นหลัก ตอนนี้ index.html ไม่มี manifest เลย)
4. PetDetailModal โชว์ ATK/HP/Crit แต่ระบบสู้ยังไม่มา → ติดป้าย "ใช้ในโหมดสู้ เร็วๆ นี้"
5. MaintenanceScreen → ใส่ตัวนับถอยหลังวันเปิดตัว สร้างกระแสก่อน launch

---

## ลำดับแนะนำ (สรุปสั้น)

```
สัปดาห์นี้   : Phase 0 ทั้งหมด (≈ 1-2 วันโค้ด) + ทีมวิชาการเริ่มกรอกข้อสอบ
สัปดาห์หน้า : Phase 1 (ประวัติคะแนน, rank ข้อสอบ, countdown) → เปิดตัว 🚀
หลังเปิดตัว : Phase 2 (SRS↔Quiz loop, daily quest buff) + ปรับ economy ตามตาราง
ระยะยาว    : Phase 3 (battle, market) + polish ธีม/PWA
```
