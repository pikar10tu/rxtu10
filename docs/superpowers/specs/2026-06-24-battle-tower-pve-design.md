# Battle Engine + Tower (PvE) v1 — Design

วันที่: 2026-06-24
ที่มา: [[economy-battle-master-plan]] (`docs/economy-battle-master-plan.md`) §3.5/§4/§5 — chunk "battle step 3"
สถานะ design: อนุมัติแล้ว 2026-06-24

## เป้าหมาย / Why

ตอนนี้เพ็ทมี rarity + เกรด + ธาตุ + stat (atk/hp) แต่ **ไม่มีที่ใช้จริง** — เก็บมาแล้วได้แค่เหรียญ idle
ฟีเจอร์นี้ทำให้ความลึกของเพ็ทมี payoff: จัดทีม 4 ตัวไต่ **หอคอย PvE** → ชั้นที่ไปถึงปลด **โบนัสรายได้ idle รายวัน**
= เหตุผลให้อยากได้เพ็ทหลากหลาย/เกรดสูง และให้ธาตุ (RPS) มีความหมายเชิงกลยุทธ์

**ขอบเขต v1 (ตัดสินใจแล้ว):**
- ✅ Engine ดิบ: stat (rarity+เกรด+ธาตุ bias) + ธาตุ RPS + crit/variance — **ไม่มี passive**
- ✅ ทีม 4 ตัว = `activePets` (ขยายจาก 3→4) — ทีมเดียวใช้ทั้งสู้และโชว์โปรไฟล์
- ✅ หอคอย PvE 50 ชั้น (บอทสร้างจากสูตร) + โบนัสรายได้ idle
- ✅ Battle replay UI raw (เลขเด้ง/แฟลช/หลอดเลือด + ปุ่ม ×2)

**นอก scope v1 (รอบถัดไป):** passive · PvP/ทัวร์/บอส · expedition · animation juice · potential affix

## หลักการ
- Engine เป็น **pure + deterministic (seeded)** แยกจาก UI สิ้นเชิง → ทดสอบด้วย `node --test`, replay ได้, ตรวจสอบได้
- ตัวเลข combat = ชุดที่จูนผ่าน `scripts/battle-sim.mjs` แล้ว (ไม่คิดใหม่)
- โบนัสหอคอย = รายได้ idle ที่มี cap (flat, ไม่ทวีคูณ) — อยู่ในกรอบเศรษฐกิจสกุลเดียว

---

## สถาปัตยกรรม — หน่วยย่อย

### 1. `data/battle.js` — ค่าคงที่ combat + ตัวสร้างหน่วยรบ
พอร์ตค่าจาก `scripts/battle-sim.mjs` (CFG/BASE/GRADE/BIAS/BEATS):
```js
export const BATTLE_CFG = { teamSize: 4, maxRounds: 30, elementAdv: 1.20, elementDis: 0.83,
                            critRate: 0.12, critMult: 1.6, variance: 0.22 }
export const COMBAT_BASE = { common:{atk:10,hp:50}, rare:{atk:11,hp:56}, epic:{atk:13,hp:63}, legendary:{atk:14,hp:70} }
export const COMBAT_GRADE = [1.0, 1.06, 1.12, 1.19, 1.26, 1.34]   // index = grade 0..5 (in-game cap = 5)
export const ELEMENT_BIAS = { fist:{atk:1.2,hp:0.85}, scissors:{atk:1,hp:1}, paper:{atk:0.85,hp:1.2} }
```
- `buildCombatant(pet)` → `{ id, element, atk, maxHp, hp }` โดย `atk = COMBAT_BASE[rarity].atk × COMBAT_GRADE[clampGrade] × ELEMENT_BIAS[element].atk` (hp คล้ายกัน) · clamp grade เป็น 0–5
- ⚠️ **ชุดเลขนี้ต่างจาก `BASE_STATS`/`STAT_MULTI` ใน `data/index.js`** (เดิม steeper, ใช้แค่ `petStats()` แสดงผล ไม่ได้ขับ income) → battle ใช้ชุดใน `data/battle.js`; ปล่อย `petStats` เดิมไว้ (ปรับให้ตรงทีหลังถ้าจำเป็น — ไม่อยู่ใน scope v1)

### 2. `utils/battleEngine.js` — pure engine (หัวใจ + ทดสอบได้)
```js
simulateBattle(teamA, teamB, seed) → { winner: 'A'|'B', rounds, log }
```
- input: `teamA/teamB` = array ของ pet instance `{ id|species, rarity, element, grade }` (สูงสุด 4) · `seed` = int
- RNG = mulberry32 (พอร์ตจาก sim `rng()`) — seeded เดียว = ผลเดิมเป๊ะทุกครั้ง
- กลไก (จาก sim `resolve()`):
  - แปลงทุกตัวด้วย `buildCombatant`
  - แต่ละรอบ: ทุกตัวที่ยังไม่ตายได้ตี 1 ที **ลำดับสุ่ม**, **เป้าสุ่ม** (ในฝั่งศัตรูที่ยังไม่ตาย)
  - damage = `atk × elementMult × critRoll × (1 ± variance)` · elementMult: ชนะธาตุ ×1.20 / แพ้ธาตุ ×0.83 / เสมอ 1
  - จบเมื่อฝั่งใดตายเกลี้ยง หรือครบ 30 รอบ → เทียบ %เลือดรวม (`Σmax(0,hp)/ΣmaxHp`) ฝั่งมากกว่าชนะ (เสมอ→A)
- **`log`** = array ของ event ตามลำดับจริง ให้ UI replay:
  - `{ t:'attack', side, attacker, target, dmg, crit, elementMult, targetHpAfter, dead }`
  - `{ t:'end', winner, rounds, hpPctA, hpPctB }`
  - (เผื่ออนาคต passive: เพิ่ม event type ใหม่ ไม่ต้องแก้ผู้บริโภค log)
- **ไม่มี side effect** — ไม่อ่าน store/Firestore/Date.now

### 3. `data/towerFloors.js` — นิยามหอคอย (pure)
- `TOWER_MAX = 50`
- `getFloorTeam(floor) → [4 × {species?, rarity, element, grade}]` — **สร้างจากสูตร** ไม่เขียนมือ:
  - ชั้นต่ำ = common เกรดต่ำ · ชั้นสูงขึ้น → ไต่ rarity (common→rare→epic→legendary) + เกรดเฉลี่ยขึ้น + ธาตุผสม (กันสเปกตายตัว ธาตุเดียว)
  - deterministic จาก floor (เช่น seed = floor) เพื่อให้ทีมบอทคงที่/ทดสอบได้ · ดึง species จาก roster ตาม rarity+element ที่สูตรกำหนด
- `getTowerBonus(bestFloor) → coins/วัน` — step ladder (หมุดเริ่มต้น, tunable):
  | ถึงชั้น | โบนัส/วัน |
  |---|---|
  | 1–9 | 0 |
  | 10–19 | +500 |
  | 20–29 | +1,500 |
  | 30–39 | +4,000 |
  | 40–49 | +8,000 |
  | 50 | +12,000 |
  - ตั้งให้ท็อป (~12k) ใกล้บ้านระดับสูง (Lv10 26k, Lv12 55k) — เป็น "ส่วนเสริม" ไม่ใช่ทวีคูณ (อยู่ในเพดาน faucet §1 master plan)

### 4. `composables/useTower.js` — ผูก engine เข้าผู้เล่น
- อ่าน: `auth.userData.activePets` (ทีม), `towerFloor` (ชั้นถัดไปที่จะตี, default 1), `towerBest`
- `playerTeam` = resolve activePets → pet instance จาก `auth.userData.pets` (species + เกรดจริงของผู้เล่น)
- `fight()`:
  1. ตรวจทีมไม่ว่าง (≥1 ตัว) ไม่งั้น toast เตือน
  2. seed = `Date.now()` · `result = simulateBattle(playerTeam, getFloorTeam(towerFloor), seed)`
  3. **เขียน state ทันทีหลังคำนวณ (ก่อน replay)** แล้วคืน `{ result, botTeam }` ให้ UI เล่น replay จากผลที่ล็อกแล้ว — กัน refresh กลางทางแล้วความคืบหน้าหาย/ผลเพี้ยน (ผลถูกล็อกด้วย seed แล้ว replay เป็นแค่การแสดง)
  4. ชนะ: `patchUser` → `towerFloor = min(towerFloor+1, TOWER_MAX)`, `towerBest = max(towerBest, clearedFloor)`
  5. แพ้: ไม่เปลี่ยน state (รีทรายฟรี) — แค่โชว์ผล replay
- หมายเหตุ: client-only + PvE → trust-based ปกติ (rules ไม่ต้องแก้ — towerFloor/best เป็น field ใน user doc เจ้าของเขียนได้อยู่แล้ว · ตรวจ light guard ถ้ามีในอนาคต)

### 5. `composables/useDaily.js` — เสียบโบนัสหอคอย
- เพิ่ม `towerBonus = computed(() => getTowerBonus(auth.userData?.towerBest || 0))`
- `ratePerDay = Math.round((baseIncome + petIncome + towerBonus) × (1 + bonusPct/100) × buffMult)`
  - (โบนัสหอคอยเป็น idle → ให้ supporter/quest-buff คูณด้วย, สอดคล้อง "idle = บ้าน+เพ็ท+หอคอย")
- DailyCard แสดงรายการโบนัสหอคอยถ้ามี (>0) เพื่อความโปร่งใส

---

## UI

### เข้าหอคอย
PlayView → section "สนามประลอง" มี `<SoonCard emoji="🏯" label="ปีนหอคอย" />` อยู่ → เปลี่ยนเป็นการ์ดจริง (RouterLink/ปุ่มเปิด) ไป `TowerView` (route ใหม่ `/tower`, lazy)

### `TowerView.vue` — หน้าหอคอย
```
┌─ 🏯 หอคอย · ชั้น 12 ──────────────┐
│ โบนัสรายได้ตอนนี้: +4,000/วัน (best 12)│
│                                      │
│ ทีมศัตรู (ชั้น 12):  🐺 🦊 🦉 🐱      │
│        ── VS ──                      │
│ ทีมคุณ:  🐉 👹 🦄 🐢   [ จัดทีม ]    │
│                                      │
│        [ ⚔️ สู้ชั้น 12 ]              │
└──────────────────────────────────────┘
```
- โชว์ชั้นปัจจุบัน (towerFloor), towerBest, โบนัส
- ทีมศัตรูจาก `getFloorTeam` (emoji + rarity hint) · ทีมเราจาก activePets
- ปุ่ม "จัดทีม" → TeamPicker · ปุ่มสู้ → เปิด BattleReplay

### `components/battle/TeamPicker.vue` — เลือก 4 ตัว
- grid เพ็ทที่ owns → แตะเพื่อใส่/ถอด 4 ช่อง (= activePets) · เขียนผ่าน `patchUser({ activePets })`
- ขยายจากแนว toggle เดิมใน PetDetailModal (เดิม cap 3 → 4)

### `components/battle/BattleReplay.vue` — เล่นผลสู้ (raw)
- รับ `{ playerTeam, botTeam, result }` → animate `result.log` ทีละ event (~180ms/action, ปุ่ม ×2 = ~90ms)
- เลย์เอาต์: 2 แถวเผชิญหน้า (บอทบน/เราล่าง) emoji ~44px + หลอดเลือดรายตัว + หลอดรวมต่อทีม
- effect raw (CSS): ตัวที่ตี = เด้ง/สปอตไลต์ · ตัวโดน = สั่น+แฟลชแดง + เลข dmg ลอย (crit = ใหญ่/เหลือง) · ตาย = จางหาย
- จบ log → overlay ผล "ชนะ! ขึ้นชั้น 13" / "แพ้ ลองใหม่" + ปุ่มปิด
- engine แยกจาก replay → ถ้า v2 เติม juice ก็ไม่แตะ engine

---

## Data model / schema
- `data/userSchema.js`: `activePets: [null, null, null]` → `[null, null, null, null]` (USER_DEFAULTS) + normalize pad/truncate เป็นยาว 4
- migration: เพ็ทที่มี activePets 3 ช่องเดิม → pad null ช่องที่ 4 (normalizeUserData จัดให้, ไม่ต้อง migrate แยก)
- `towerFloor` (default 1 = ชั้นถัดไปที่จะตี), `towerBest` (default 0), `towerLastReset` — **มีใน schema แล้ว** ใช้ได้เลย
- ProfileModal/members ที่อ่าน activePets: รองรับยาว 4 อัตโนมัติ (โชว์เท่าที่มี) — ตรวจไม่ให้ assume length 3

## Firestore rules
ไม่แตะ — towerFloor/towerBest/activePets เป็น field ใน `users/{uid}` ที่เจ้าของเขียนได้อยู่แล้ว · PvE trust-based (สอดคล้องแนวทางทั้งแอป)

---

## ทดสอบ
Pure logic → `node --test`:
- `utils/battleEngine.test.js`:
  - determinism: seed เดียวกัน → ผล (winner/rounds/log) เหมือนเป๊ะ
  - ธาตุได้เปรียบชนะ >50% (mono fist vs scissors เกรดเท่ากัน, รันหลาย seed)
  - เกรดสูงกว่าชนะ >50% · ทีมว่างฝั่งหนึ่ง → อีกฝั่งชนะ
  - log สอดคล้องผล (event สุดท้าย winner ตรง, hp ไม่ติดลบในสรุป)
- `data/towerFloors.test.js`:
  - `getFloorTeam` คืน 4 ตัวเสมอ, deterministic (floor เดิม = ทีมเดิม), ชั้นสูง rarity/เกรดเฉลี่ย ≥ ชั้นต่ำ
  - `getTowerBonus` monotonic non-decreasing, ขอบ ladder ถูก (ชั้น 9→0, 10→500, 50→12000)
- manual: ไต่จริงในแอป (ชนะขึ้นชั้น/แพ้รีทราย), โบนัสเข้า DailyCard, จัดทีม 4, replay เล่นลื่น + ปุ่ม ×2
- เครื่องมือจูนเดิม `scripts/battle-sim.mjs` ใช้ต่อได้ (ถ้าจะปรับ ladder/เลข)

## ลำดับ build (ส่งต่อ writing-plans)
1. `data/battle.js` + `utils/battleEngine.js` (+test) — **TDD แกน pure ก่อน**
2. `data/towerFloors.js` (+test)
3. schema activePets 3→4 + normalize
4. `useTower.js` + เสียบ `useDaily` โบนัส
5. UI: TeamPicker → TowerView → BattleReplay
6. PlayView เปลี่ยน SoonCard หอคอย → entry จริง + route `/tower`
7. build + manual verify ในแอป

## เปิดไว้ (เคาะตอนจูน ไม่บล็อก v1)
- ตัวเลข ladder โบนัส / breakpoints (ตั้งหมุดไว้แล้ว ปรับได้)
- สูตรสร้างทีมบอทรายชั้น (เริ่มเรียบง่าย ปรับความชันทีหลังด้วย sim)
- จะ refactor `petStats()` ให้ตรงชุด battle ไหม (v1 ไม่แตะ)
