# Tower Battle — Animation v2 + Passive Groundwork + Per-Pet Stats

วันที่: 2026-06-24 · สถานะ: design (อนุมัติ verbal แล้ว รอ user review spec)

## เป้าหมาย

ทำให้รอบสู้หอคอย (BattleReplay) "มันส์/อ่านออก" + ปูโครงให้ระบบ passive (ออกแบบไว้ใน
`docs/economy-battle-master-plan.md` §5.5) เสียบทีหลังได้โดยไม่ต้องรื้อ + เก็บสถิติการสู้ราย
species ไว้จูนตัวเลขจากการเล่นจริง

**กฎเหล็กรอบนี้: ไม่แตะสมดุลเกม** — RNG/ผลแพ้ชนะของ engine ต้องเหมือนเดิมเป๊ะ
(battleEngine.test.js `deepEqual` ต้องผ่าน) การเปลี่ยนแปลง engine มีแค่ "เพิ่ม field ข้อมูล"
ลง log ไม่เปลี่ยน logic การคำนวณดาเมจ/ลำดับ/เป้าหมาย

### Non-goals (รอบนี้ไม่ทำ)
- ไม่ทำกลไก passive จริง (6 hooks/team-aura) — แค่ปูโครง data + replay ให้พร้อม
- ไม่เปลี่ยนสูตรดาเมจ/เกรด/ธาตุ/ขนาดทีม/maxRounds
- ไม่ทำ PvP/tournament (คนละ spec)

---

## ส่วน 1 — BattleReplay v2 (animation juice)

คง layout เดิม: 2 แถว (ศัตรู/เรา) × 4 ช่อง emoji. เพิ่มชีวิตภายในกรอบเดิม (ไม่รื้อ layout —
ปลอดภัยบนจอเล็ก).

### 1.1 รูปแบบการตี (melee / ranged)
ขับด้วย pet data ใหม่ (ดู §4): `atkStyle: 'melee' | 'ranged'` (+ `projectile` emoji สำหรับ ranged).
- **melee** — ตัวผู้ตี translate เข้าหาตำแหน่งจริงของเป้า (วัดด้วย template ref +
  `getBoundingClientRect`, FLIP-style) → กระแทก → เด้งกลับช่องเดิม (~250ms)
- **ranged** — ตัวผู้ตีอยู่กับที่ (สั่น wind-up เล็ก) → spawn projectile emoji ที่ช่องผู้ตี →
  transform วิ่งไปช่องเป้า → ถึงเป้า = impact (~300ms รวมเวลาบิน)
- ทั้งคู่จบที่ "impact moment" จุดเดียวกัน (flash + เลขเด้ง + drain เลือด) เพื่อให้โค้ด impact
  ใช้ร่วมกัน

### 1.2 ป้ายผลธาตุ (element callout)
อ่านจาก field `eff` ใน attack log event (ดู §3):
- `eff: 'super'` (ได้เปรียบ) → ป้าย "แพ้ทาง! ⚡" เด้งใกล้เป้า + เลขดาเมจสีแดงเข้ม/ใหญ่ขึ้น
- `eff: 'weak'` (เสียเปรียบ) → ป้าย "ต้านทาน 🛡️" เล็ก/จาง + เลขสีหม่น
- `eff: 'neutral'` → ไม่มีป้าย (เลขปกติ)

### 1.3 Crit / ตาย / เลือด
- **crit** (มี `crit: true` ใน log อยู่แล้ว) → ซูมกระแทกตัวเป้า + spark/ดาวแตก + **hit-stop**
  สั้น (~120ms หยุดนิ่งก่อนไปต่อ) ให้รู้สึกหนัก + เลขใหญ่สีทอง (คงของเดิม ขยาย)
- **ตาย** (`dead: true`) → ยุบ scale→0 + fade + พั่ฟ 💀 ลอย แทนการจางเฉยๆ
- **เลือด** — drain นุ่ม (มีอยู่) + เพิ่ม "ghost bar" สีขาวตามหลัง ~400ms โชว์ก้อนดาเมจที่เพิ่งโดน

### 1.4 Controls + ตัวนับรอบ
แถบควบคุมใหม่ (ระหว่างเล่น): `⏸/▶ Pause` · `ความเร็ว ×1 / ×2 / ×4` · `ข้ามไปผล`
- **Pause/Resume** — หยุด/เล่นต่อ timeline ได้ทุกจังหวะ (clearTimeout + flag `paused`)
- **ความเร็ว** — คูณ delay ฐาน (×1=180ms, ×2=90ms, ×4=45ms ต่อ event) ปรับได้ระหว่างเล่น
- **ข้ามไปผล** — กระโดดไป end event ทันที (apply ผลสุดท้ายทุกตัว: hp ตาม end, ตายตามจริง)
- **ตัวนับรอบ** — ป้าย "รอบ N" เล็กๆ (อนุมานจากนับ event หรือใส่ marker round ใน log — ดู §3)

### 1.5 แตะตัว → inspect card (pause อัตโนมัติ)
แตะ unit ใดก็ได้ระหว่างสู้ → **pause timeline อัตโนมัติ** + เปิด popover เล็กใน BattleReplay:
- ชื่อ + emoji + ธาตุ (fist/scissors/paper + ป้ายธาตุ) + rarity + เกรด
- **atk / hp** — ใช้เลขชุด combat จริง (`buildCombatant` จาก data/battle.js) ปัจจุบัน+เต็ม
  (ไม่ใช่เลขโชว์ petStats ที่เป็นคนละชุด)
- **ช่อง passive** — ชื่อ+คำอธิบาย; รอบนี้ยังว่าง แสดง `—` (ปูทาง: พอ pet.passive มีจริงจะโผล่)
- ปิด popover → resume (หรือคง pause ให้ user กด ▶ เอง — เลือก: **คง pause** ให้ user คุมเอง)

> หมายเหตุ: ทำ popover ใน BattleReplay เอง ไม่ reuse PetDetailModal (อันนั้นผูก context เพ็ท
> ที่ครอบครอง + ใช้เลข petStats คนละชุด)

### 1.6 Config knobs (จูนง่าย ไม่ฝังตาย)
รวมค่า animation ไว้ที่เดียว (เช่น `const REPLAY_CFG = { baseDelay, speeds:[1,2,4], lungeMs, projectileMs, hitStopMs, popMs, ghostBarMs }`) ใน BattleReplay เพื่อจูนหลังเทส

---

## ส่วน 2 — ปูทาง passive (ไม่ทำกลไก)

### 2.1 Replay เป็น event-driven (หัวใจของการปู)
refactor `step()` จาก if-attack เดี่ยว → **dispatch ตาม `event.t`**:
```
handlers = { attack: playAttack, end: playEnd }   // + อนาคต: passive, heal, revive, dodge, aoe...
const h = handlers[event.t]
if (h) h(event); else advance()   // type ที่ยังไม่รู้จัก = ข้ามเงียบ ไม่พัง
```
ผลลัพธ์: เพิ่ม passive จริงรอบหน้า = เพิ่ม handler ตัวเดียว ไม่ต้องรื้อ loop

### 2.2 Pet data: เพิ่ม shape (optional, default ปลอดภัย)
ใน `data/index.js` PETS เพิ่ม 3 field optional:
- `atkStyle` (default `'melee'`) — ใช้ทันทีโดย §1.1
- `projectile` (emoji, ใช้เมื่อ ranged) — เช่น dragon 🔥, fairy ✨, whale 💧
- `passive` (default `null`) — shape ตาม master plan §5.5; **มีไว้เฉยๆ ยังไม่ wire engine**
  ```js
  passive: { name, icon, hook, effect, value, target, filter, duo } // หรือ null
  ```
ค่าเริ่ม atkStyle (data ล้วน ปรับได้): **ranged** = dragon/bahamut/fairy/genie/unicorn/phoenix/owl/whale ·
ที่เหลือ **melee**. (รอบนี้ตั้ง passive=null ทุกตัว — การ wire ชื่อ↔id จริงทำตอน spec passive
เพราะ id จริงต่างจากตารางใน master plan เช่น โอนิ=`kirin`, กริฟฟิน=`simurgh`, บากุ=`qilin`)

### 2.3 Engine: แตะแค่เพิ่มข้อมูลลง log (ไม่แตะ logic)
ดู §3 — เพิ่ม field `eff` ลง attack event เท่านั้น

---

## ส่วน 3 — Battle log format (เพิ่ม field, backward-safe)

`battleEngine.js` `hit()` คำนวณ `m = elementMult(...)` อยู่แล้ว — เพิ่มการบันทึกผลลง log:
- attack event เพิ่ม `eff: 'super' | 'weak' | 'neutral'` (อนุมานจาก elementMult: >1 super, <1 weak,
  =1 neutral — คำนวณ "ก่อน" คูณ crit/variance เพื่อสะท้อนธาตุล้วน)
- ใส่ round marker: push `{ t:'round', n }` ต้นแต่ละรอบ → replay โชว์ตัวนับแม่นยำโดยไม่ต้องเดา
  (handler `round` = อัปเดตป้าย, ไม่หน่วงเวลา) — ทำเลยรอบนี้ (ถูก + เป็น event-type ตัวอย่างที่ดี
  ของโครง dispatch §2.1)

**ผลกระทบ test:** `deepEqual(r1,r2)` ยังผ่าน (field ใหม่เท่ากันทั้ง 2 รัน). อัปเดต
`battleEngine.test.js` ถ้ามี assert เจาะ shape (ปัจจุบันไม่มี — เช็คแล้ว) · เพิ่ม test ใหม่:
"attack event มี eff ตรงกับ matchup ธาตุ"

---

## ส่วน 4 — Per-pet battle stats (`battleStats/{petId}`)

### 4.1 Pure util `utils/battleStats.js` (+ .test.js)
`computeBattleStats(log, playerTeam, won) → { [petId]: {battles, wins, kills, deaths, dmgDealt, dmgTaken} }`
- อ่าน log: รวม dmg ที่ `A{i}` ทำ (attacker) → dmgDealt · dmg ที่ `A{i}` รับ (target) → dmgTaken ·
  attack ของ A{i} ที่ `dead:true` → kills · A{i} เป็น target ที่ `dead:true` → deaths
- map `A{i}` → petId จาก playerTeam[i].id · battles +1 ทุกตัวที่ลงสนาม · wins +1 ถ้า won
- **เฉพาะทีมผู้เล่น** (≤4 species) — ไม่เก็บบอท (cost) · pure ไม่อ่าน store/Firestore

### 4.2 Write path (ใน useTower.fight หลัง resolve)
หลังได้ result → `computeBattleStats` → `writeBatch`: ต่อ petId เขียน increment ลง
`battleStats/{petId}` (create ถ้ายังไม่มีด้วย setDoc merge + increment) · `usage.track(0, n)` นับ
write · ~≤4 writes/ไฟต์ (batch 1 รอบ) · ทำ best-effort (fail = console.error เงียบ ไม่ขวางการเล่น)

### 4.3 Firestore rules (⚠️ ต้อง deploy)
เพิ่ม match `battleStats/{petId}` แบบเดียวกับ `questionStats` เป๊ะ:
- read: `canEditQuestions()` (academic+instructor — คนน้อย ไม่กระทบเพดาน reads)
- create: ผู้ล็อกอิน, keys hasOnly([battles,wins,kills,deaths,dmgDealt,dmgTaken]), ทุก field int ≥0
- update: ผู้ล็อกอิน, affectedKeys hasOnly(ชุดเดิม), ทุก field ≥ ค่าเดิม (increment-only)
- delete: isAdmin()

### 4.4 Admin readout (AdminView)
ตารางเล็ก: ต่อ species → emoji/ชื่อ · battles · **win%** (wins/battles) · ดาเมจเฉลี่ย/ไฟต์
(dmgDealt/battles) · เรียง win% — ไว้ดูว่าตัวไหน OP/อ่อน. อ่าน `getDocs(battleStats)` ครั้งเดียว
ตอนเปิด section (admin คนเดียว — cost ไม่สำคัญ)

---

## ไฟล์ที่แตะ

| ไฟล์ | งาน |
|---|---|
| `src/components/battle/BattleReplay.vue` | rewrite v2: event-dispatch, melee/ranged, callout, crit/death, controls(pause/×4/skip), inspect popover, config |
| `src/utils/battleEngine.js` | เพิ่ม `eff` (+round marker) ลง log — ไม่แตะ logic |
| `src/utils/battleEngine.test.js` | เพิ่ม test eff · ยืนยัน deepEqual ยังผ่าน |
| `src/data/index.js` | PETS += atkStyle/projectile/passive(null) |
| `src/utils/battleStats.js` (+test) | pure computeBattleStats |
| `src/composables/useTower.js` | เรียก computeBattleStats + writeBatch หลัง fight |
| `firestore.rules` | + match battleStats (⚠️ deploy) |
| `src/views/AdminView.vue` | ตารางสถิติ battle |

## Testing
- `node --test src/utils/battleEngine.test.js` (deepEqual + eff) · `node --test src/utils/battleStats.test.js`
- `npm run build` ผ่าน
- manual ใน dev: สู้จริง ดู melee/ranged/callout/crit/death/pause/×4/skip/inspect ครบ ·
  เช็ค battleStats เขียนเข้า Firestore + ตาราง admin ขึ้นเลข

## Deploy / สิ่งที่ต้องอนุมัติ
1. `git push origin master` (เว็บหลัก — auto build+publish)
2. **`firebase deploy --only firestore:rules`** (เพราะ battleStats — ลืม = เขียนสถิติไม่ผ่าน)

## Out of scope (spec ถัดไป)
- กลไก passive จริง (6 hooks + team-aura + effect primitives) — spec แยก ต่อยอดจากโครงนี้
- reset ชั้นหอคอยทุกคน (queue ข้อ 2 อีกครึ่ง) · Expedition · PvP/tournament
