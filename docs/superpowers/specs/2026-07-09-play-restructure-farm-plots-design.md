# Play Restructure + Farm Plot-Unlock — Design Spec

วันที่: 2026-07-09
สถานะ: ร่างรออนุมัติ (brainstorm เสร็จ)

## 1. ที่มา / เป้าหมาย

หน้า Play ปัจจุบันจัดหมวดตาม "ประเภทกิจกรรม" (เพ็ท&สะสม / ประลอง / ร้านค้า / มินิเกม) ทำให้
**เกมที่ใช้เพ็ทกระจายอยู่หลายหมวด** (หอคอย+สนามประลองอยู่ "ประลอง", ส่งผจญภัยอยู่ "เพ็ท&สะสม")
และฟาร์มปนอยู่กับเพ็ททั้งที่เป็นระบบ standalone ไม่ใช้เพ็ทเลย

**เป้าหมาย:** จัด IA หน้า Play ใหม่แบบ hub 2 ชั้น — ชู 2 ระบบใหญ่ (เพ็ท + ฟาร์ม) ไว้ด้านบน
กดเข้าไปเจอเกม/ฟีเจอร์ของระบบนั้นรวมกันในหน้าเดียว แล้วมินิเกมเดี่ยวๆ อยู่ด้านล่าง

ผูกกับงานนี้: ยกเครื่อง "ร้านค้าฟาร์ม" ให้เป็นระบบ **ปลดแปลงด้วยเหรียญ** (coin sink ใหม่ ช่วยดูดเหรียญ
ตามที่ ROADMAP โน้ตว่าฟาร์มรายได้เยอะเกิน)

## 2. ขอบเขต

**ทำ:**
- รื้อ `PlayView.vue` เป็น landing: 2 การ์ดใหญ่ (โหมดเพ็ท / โหมดฟาร์ม) + section มินิเกม
- หน้า hub ใหม่ 2 หน้า: PetHubView (เมนูเกมที่ใช้เพ็ท) + FarmView (ฟาร์ม + ร้านค้าฟาร์ม)
- ย้ายฟาร์มจาก modal → หน้าเต็ม
- ระบบปลดแปลงฟาร์ม: เริ่ม 1 แปลง, ซื้อปลดทีละแปลงราคาแพงขึ้นเรื่อยๆ, เพดานตามเลเวลบ้าน

**ไม่ทำ (out of scope — แยก brainstorm รอบอื่น):**
- ไม่สร้างมินิเกมใหม่ (เภสัช Crush / บอสรวมรุ่น คงเป็น SoonCard)
- ไม่ทำ "ร้านค้าระบบ" (global shop ขายบัฟ/ตั๋ว/ของแต่งข้ามระบบ)
- ไม่แตะ view เกมเดิม (`/pets` `/shop` `/tower` `/arena` `/expedition`), engine, กลไกปลูก/เก็บ/ขาย

## 3. IA ใหม่

```
📍 /play  (landing)
│  NewsBoard (คงเดิม บนสุด)
│
├── 🐾 การ์ดใหญ่ "โหมดเพ็ท"  → /play/pets
│      PetHubView: เมนูการ์ด → route เดิมทั้งหมด
│        [สัตว์เลี้ยง /pets] [ร้านค้าเพ็ท /shop] [ปีนหอคอย /tower]
│        [สนามประลอง /arena*] [ส่งผจญภัย /expedition] [บอสรวมรุ่น 🔜 SoonCard]
│        (* สนามประลอง: RouterLink เมื่อ pvpOpen||isAdmin, ไม่งั้น SoonCard — ยกตรรกะเดิมมา)
│
├── 🌱 การ์ดใหญ่ "โหมดฟาร์ม" → /play/farm
│      FarmView: <FarmGrid> (ย้ายจาก modal) + พาเนล "ร้านค้าฟาร์ม" (ปลดแปลง)
│
└── 🎮 section "มินิเกม" (ด้านล่าง landing)
       [เภสัช Crush 🔜 SoonCard]
```

**การ์ดใหญ่ (hero):** ใหญ่กว่า game-card ปกติ (เต็มแถวหรือสูงกว่า) มี badge สด —
โหมดเพ็ทโชว์สถานะเด่น (เช่น ส่งผจญภัยกลับมาแล้ว), โหมดฟาร์มโชว์ "เก็บได้ N / ว่าง N แปลง" (ยก logic
badge เดิมจาก PlayView มา)

**หลักการ:** ทุก route/view เดิมไม่แตะ แค่ย้าย "ทางเข้า" มารวมใน hub → เพิ่ม 2 route ใหม่เท่านั้น

## 4. กลไกฟาร์มปลดแปลง

### 4.1 โมเดล
- ทุกคนเริ่มต้น **1 แปลง**
- ปลดแปลงถัดไปด้วยเหรียญที่ **ร้านค้าฟาร์ม** (พาเนลใน FarmView) — ราคาแพงขึ้นเรื่อยๆ
- ซื้อได้ไม่เกิน **เพดานตามเลเวลบ้าน** = `residencePlots(level)` (Lv1=4 … Lv12=12)
  เดิม mapping นี้ = จำนวนแปลงจริง, เปลี่ยนความหมายเป็น "เพดานสูงสุดที่ปลดได้"

### 4.2 ราคาปลดแปลง (tunable — ตาราง `PLOT_UNLOCK_COST` ใน data)
ราคาซื้อ "แปลงลำดับที่ n" (เป็นเจ้าของแปลงที่ n). ช่วงต้นถูก แล้วชันขึ้น:

| แปลงที่ | ราคา (เหรียญ) |
|--------|------|
| 1 | 0 (เริ่มต้นฟรี) |
| 2 | 100 |
| 3 | 300 |
| 4 | 900 |
| 5 | 2,500 |
| 6 | 6,000 |
| 7 | 14,000 |
| 8 | 32,000 |
| 9 | 70,000 |
| 10 | 150,000 |
| 11 | 320,000 |
| 12 | 700,000 |

(เทียบเศรษฐกิจ: เมล็ดผักกาด 20 / มะเขือเทศ 120 → แปลง 2-3 ราคา 100-300 ถูกพอให้ผู้เล่นใหม่ปลดได้เร็ว;
แปลงท้ายๆ แพงระดับอัปบ้าน → เป็น sink จริงจัง)

### 4.3 Data / schema
- เพิ่ม field `farm.plotsUnlocked` (number, default **1**) ใน `data/userSchema.js` (USER_DEFAULTS + normalizeUserData)
- คนเก่าไม่มี field นี้ → อ่าน default = 1 อัตโนมัติ → **ไม่ต้องเขียน migration** (= รีเซ็ตทุกคนเหลือ 1 แปลงตามที่ตกลง)
- พืชที่ปลูกค้างในแปลง index ≥ 1 (แปลง 2+) จะเข้าไม่ถึงชั่วคราวจนกว่าจะปลดแปลงคืน — รับได้ (Phase 0 คนน้อย)

### 4.4 useFarm — การเปลี่ยนแปลง
- `ceiling` = computed `residencePlots(level)` (เพดาน)
- `plotsUnlocked` = computed `auth.userData?.farm?.plotsUnlocked ?? 1`
- `plotCount` = computed `Math.min(plotsUnlocked, ceiling)` — **แปลงที่เห็น/ปลูกได้จริง**
  (กัน edge case: admin econ editor ลดเลเวลบ้าน → เพดานต่ำกว่า plotsUnlocked → ซ่อนแปลงเกินเพดานไว้
  ไม่ลบข้อมูล ปรับบ้านคืนแล้วกลับมา)
- `nextPlotCost` = computed ราคาแปลงถัดไป (`PLOT_UNLOCK_COST[plotsUnlocked + 1]`) หรือ null ถ้าชนเพดาน/สุดตาราง
- action ใหม่ `unlockPlot()`:
  - guard: `plotsUnlocked >= ceiling` → toast "อัปเลเวลบ้านเพื่อปลดแปลงเพิ่ม"
  - guard: `coins < nextPlotCost` → toast "เหรียญไม่พอ"
  - สำเร็จ: `patchUser({ farm.plotsUnlocked +1, coins -cost })` ผ่าน commit/patchUser เดิม
    (ใช้ `increment(-cost)` ฝั่ง server; optimistic ฝั่ง local)

### 4.5 UI ร้านค้าฟาร์ม (พาเนลใน FarmView)
- แสดง: แปลงที่ปลด `plotsUnlocked / ceiling`
- ปุ่ม **"ปลดแปลงที่ N (💰 ราคา)"** — enabled เมื่อ `plotsUnlocked < ceiling && coins ≥ cost`
- ชนเพดานบ้าน (`plotsUnlocked >= ceiling`, ยังไม่ถึง 12) → โชว์ "อัปเลเวลบ้านเพื่อปลดเพิ่ม (ตอนนี้เพดาน N แปลง)"
- ปลดครบเพดานสูงสุด (12) → โชว์ "ปลดครบทุกแปลงแล้ว 🎉"

## 5. ไฟล์ที่เกี่ยวข้อง

**สร้างใหม่:**
- `src/views/PetHubView.vue` — เมนูการ์ด (ยก markup game-card + logic pvpOpen/expState badge มาจาก PlayView)
- `src/views/FarmView.vue` — ห่อ `<FarmGrid>` + พาเนลร้านค้าฟาร์ม
- `src/data/farmPlots.js` (หรือเพิ่มใน crops.js) — `PLOT_UNLOCK_COST[]` + helper `plotUnlockCost(nextPlotNumber)`
- test: `src/data/farmPlots.test.js` (หรือ util test) — ราคาถูกต้อง, clamp, ชนเพดาน

**แก้:**
- `src/views/PlayView.vue` — รื้อเป็น landing (2 hero + section มินิเกม), ถอด farm modal + FarmGrid import ออก
- `src/router/index.js` — เพิ่ม route `/play/pets` (PetHubView), `/play/farm` (FarmView) แบบ lazy เหมือน route อื่น
- `src/composables/useFarm.js` — `ceiling`/`plotsUnlocked`/`plotCount`/`nextPlotCost` + `unlockPlot()`
- `src/data/userSchema.js` — เพิ่ม `farm.plotsUnlocked` default 1 ใน USER_DEFAULTS + normalizeUserData

**เช็ก (อาจไม่ต้องแก้):**
- `firestore.rules` — `farm.plotsUnlocked` เป็น field ใน `users/{uid}` ที่เจ้าของเขียนได้อยู่แล้ว;
  ตรวจว่า rules ฟาร์ม/coin range ไม่บล็อก (ถ้ามี guard เฉพาะ farm.* ต้องเผื่อ field ใหม่ + deploy)
- Help topics `play` / `farm` — อัปเดตเนื้อหาให้ตรงโครง hub ใหม่ + อธิบายการปลดแปลง

## 6. เทส

**Unit (node --test):**
- `plotUnlockCost(n)` คืนราคาถูกตามตาราง; n เกินตาราง → null
- ตรรกะ `unlockPlot` (แยก pure ถ้าทำได้): ปลดได้เมื่อ < ceiling & เงินพอ; บล็อกเมื่อชนเพดาน/เงินไม่พอ
- `plotCount = min(plotsUnlocked, ceiling)` clamp ถูกทั้งกรณีบ้านสูง/บ้านต่ำกว่า plotsUnlocked

**Manual (จอจริง มือถือ):**
- หน้า Play เห็น 2 hero + section มินิเกม; กด hero → เข้า hub 2 หน้าถูกต้อง; ปุ่ม back/nav ทำงาน
- PetHub: การ์ดทุกใบลิงก์ถูก route; สนามประลองเป็น SoonCard เมื่อ pvpOpen ปิด (ไม่ใช่ admin)
- FarmView: ปลูก/เก็บ/ขาย ยังทำงาน (ยกจาก modal มาครบ); ร้านค้าฟาร์มปลดแปลงหักเหรียญถูก;
  ชนเพดานโชว์ prompt อัปบ้าน; ปุ่ม/ก้นหน้าไม่โดน bottom-nav บัง (ปัญหาเดิมของ farm sheet)
- ผู้เล่นเดิมที่เคยมีหลายแปลง → เข้ามาเหลือ 1 แปลง

## 7. ความเสี่ยง / โน้ต
- ความเสี่ยงต่ำ: ส่วน IA แค่ย้ายทางเข้า; ส่วนที่แตะ logic จริงคือ farm plot เท่านั้น
- farm modal เดิมมี workaround z-index/dvh เยอะ (nav ทับก้น sheet) — ย้ายเป็นหน้าเต็มช่วยลดปัญหานี้
  แต่ต้องเช็ก padding ก้นหน้า (safe-area + bottom-nav) ใน FarmView
- ราคาปลดแปลงทั้งหมด tunable — ปรับได้ที่ตารางเดียว
```

