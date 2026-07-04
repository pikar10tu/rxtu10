# PvP Gating + Matchmaking — design spec

วันที่: 2026-07-04 · ขอบเขต: กลาง (ปรับ Arena "สนามประลอง" ที่มีอยู่แล้ว — ไม่สร้างใหม่)
คิว #3 ใน `rxtu10_backlog_2026-06-29` · ต่อยอดจาก subโปรเจกต์ PvP (build 27 มิ.ย., commits `e0cdcb5..cac9b8b`)

## เป้าหมาย

1. **ตอนสนามปิด ต้องไม่เห็นทีม/ชื่อคู่ต่อสู้เลย** — ขึ้น "เร็วๆ นี้" (ปัจจุบันยังโชว์พูลคู่ต่อสู้ แค่ปุ่มบุก disabled → รั่ว)
2. **Matchmaking ใหม่:** สุ่ม **5 คนจริง**ที่เรตใกล้เคียง + **บอท 2 ตัว** (อ่อน 1 / แกร่ง 1) · refresh **ต่อวัน**

## ข้อจำกัด (ยึดตาม subโปรเจกต์ PvP เดิม — ห้ามละเมิด)

- **ไม่สร้าง Firestore collection ใหม่ · ไม่เขียน doc ผู้ใช้คนอื่น · ไม่แก้ `firestore.rules` · ไม่แก้ `userSchema`**
- คู่ต่อสู้อ่านจาก `members` cache เท่านั้น (อ่าน Firestore เพิ่ม 0)
- matchmaking/บอท = **pure + deterministic** จาก seed (ไม่มี state ใหม่ใน user doc)
- ศัพท์: คงโทนเดิม ไม่ใช้คำรุนแรง ("บุก"/"หุ่นซ้อม"/"สนามประลอง" เดิม)
- verify: `npm run build` เขียว + เทส pure เดิมผ่าน + เทสใหม่ผ่าน (`node --test src/utils/*.test.js src/data/*.test.js`)

## สถานะปัจจุบัน (อ่านก่อนแก้)

- `utils/pvpMatch.js` — `pickHumanOpponents(meUid, myRating, candidates, n=4)` เรียงเรต**ใกล้สุด** เอา n คนแรก (ไม่สุ่ม) · `eligibleOpponents(meUid, candidates)` กรอง มีทีม+ไม่ใช่ตัวเอง+มี uid
- `utils/pvpBot.js` — `getPvpBot(rating, seed)` คืน **บอท 1 ตัว** ทีม 4 ตัว สเกลตามเรต (เรตบอท = เรตผู้เล่น) · มี `rng(seed)` (mulberry32) + `botPowerFor(rating)` (เรต 800→2000 map เป็น grade 0-5/tier) · uid `'bot'`
- `composables/useArena.js` — `opponents` computed = `pickHumanOpponents(uid, rating, flat, 4)` + `getPvpBot(rating, hourSeed)` · `fight(opp)` จำลอง→เขียนผลผ่าน `auth.patchUser` (ทำงานกับ opp ใดๆ ที่มี `isBot`/`team`/`rating`)
- `views/ArenaView.vue` — `canFight = pvpOpen || isAdmin` · **`ar-list` (พูลคู่) render เสมอ** แม้ `!canFight` (แค่ปุ่มบุก disabled + banner `ar-locked`) ← จุดรั่ว
- `pvpRating.js` — START 1000 · FLOOR 100 · K 32 · `BOT_RATING_MULT` 0.5 · `PVP_DAILY_ATTACKS` 5

---

## ส่วน A — Gating ตอนปิด (`ArenaView.vue`)

เมื่อ `!canFight` (pvpOpen=false และไม่ใช่ admin):
- **เก็บ:** การ์ด `ar-me` (แต้ม/ชนะ/แพ้/โควต้า) + ปุ่ม "จัดทีม" (`pickOpen`)
- **ซ่อน:** พูลคู่ต่อสู้ทั้งหมด → ห่อ `<div class="ar-list">` ด้วย `v-if="canFight"`
- **แสดงแทน:** การ์ด "เร็วๆ นี้" (ปรับข้อความ `ar-locked` เดิมให้เป็นบล็อกหลัก เช่น *"⚔️ สนามประลองใกล้เปิดแล้ว — จัดทีมรอไว้ก่อนได้เลย เปิดพร้อมกันทั้งรุ่นเร็วๆ นี้"*)
- **admin:** `canFight=true` → เห็นพูลเต็ม + บุกได้ (ทดสอบก่อนเปิด — พฤติกรรมเดิม)

หมายเหตุ: เมื่อ `!canFight` ไม่ต้อง `members.loadFbUsers()` ก็ได้ (พูลถูกซ่อน) แต่คงการเรียกไว้ก็ไม่เสียหาย (มี cache/guard อยู่แล้ว) — **คงไว้** เพื่อลดการแก้ (admin ยังต้องใช้)

## ส่วน B — Matchmaking

### B1. Seeded RNG ที่ใช้ร่วม (`utils/seededRng.js` — ไฟล์ใหม่)

ดึง `rng` (mulberry32) เดิมออกจาก `pvpBot.js` มาไว้ที่นี่ ให้ทั้ง `pvpBot` และ `pvpMatch` ใช้ร่วม (DRY):
```js
// mulberry32 — deterministic PRNG จาก seed uint32 (ย้ายมาจาก pvpBot เดิม ไม่เปลี่ยนพฤติกรรม)
export function mulberry32(seed) { /* โค้ดเดิมจาก pvpBot.rng */ }
// hash string → uint32 (สำหรับ seed รายวัน จาก 'YYYY-MM-DD'+uid)
export function hashStr(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}
```
- `pvpBot.js` เปลี่ยนมา `import { mulberry32 } from './seededRng.js'` แทน `rng` ภายใน (พฤติกรรม getPvpBot เดิมไม่เปลี่ยน — เทสเดิมต้องยังผ่าน)

### B2. สุ่มคนจริง (`utils/pvpMatch.js`)

เพิ่มค่าคงที่ + เปลี่ยน `pickHumanOpponents` เป็นสุ่มในย่านเรตใกล้ (seeded):
```js
export const HUMAN_POOL  = 5    // จำนวนคนจริงในพูล
export const NEAR_WINDOW = 12   // เอาคนที่เรตใกล้สุด N คนมาเป็น "ย่านใกล้" ก่อนสุ่ม
```
`pickHumanOpponents(meUid, myRating, candidates, seed, n = HUMAN_POOL, window = NEAR_WINDOW)`:
1. `eligibleOpponents` (เดิม) → map เติม `rating` (`c.pvp?.rating ?? PVP_RATING_START`)
2. เรียงตาม `|rating - myRating|` (ใกล้สุดก่อน)
3. ตัดเป็น "ย่านใกล้" = `slice(0, max(window, n))` — ถ้าคน eligible < window ก็เอาทั้งหมด
4. **seeded shuffle** (Fisher–Yates ด้วย `mulberry32(seed)`) ย่านใกล้ แล้ว `slice(0, n)`
5. คน eligible < n → คืนเท่าที่มี (บอทเติมให้เสมอ)

ผล: นิ่งทั้งวัน (seed เดียว), สุ่มจริงในกลุ่มเรตใกล้, ไม่ใช่เรียงตายตัว

> หมายเหตุ: ถ้าสมาชิก cache เปลี่ยนระหว่างวัน (มีคนโหลดเพิ่ม/เปลี่ยนทีม) ผลอาจขยับได้ — ยอมรับได้ (ไม่ใช่ correctness) เพราะ seed คุมแค่การสุ่มบนชุด candidate ปัจจุบัน

### B3. บอท 2 ตัว อ่อน/แกร่ง (`utils/pvpBot.js`)

เพิ่มค่าคงที่ + ฟังก์ชันใหม่ (คง `getPvpBot`/`botPowerFor` เดิมไว้ ใช้ภายใน):
```js
export const BOT_RATING_SPREAD = 300   // ระยะเรตบอทอ่อน/แกร่งจากผู้เล่น (tunable)

// คืนบอท 2 ตัว: อ่อน (เรต − spread, floor) + แกร่ง (เรต + spread) · seed รายวัน
export function getPvpBots(rating, seed) {
  const easy = { ...getPvpBot(Math.max(PVP_RATING_FLOOR, rating - BOT_RATING_SPREAD), seed),
                 uid: 'bot-easy', label: 'อ่อน' }
  const hard = { ...getPvpBot(rating + BOT_RATING_SPREAD, seed ^ 0x9e3779b9),
                 uid: 'bot-hard', label: 'แกร่ง' }
  return [easy, hard]
}
```
- แต่ละบอทได้ทีม/เรตจาก `getPvpBot` (พลังสเกลตามเรตของบอทเอง → อ่อนอ่อนจริง แกร่งแกร่งจริง) · seed ต่างกัน (xor const) กันทีมซ้ำ
- `uid` ต่างกัน (`bot-easy`/`bot-hard`) = key `v-for` ไม่ชน · `isBot:true` มาจาก `getPvpBot` เดิม
- **พลังบอท = คงสูตรเดิม (จูนทีหลัง)** ตามที่ user สั่ง — spec นี้แค่แยกอ่อน/แกร่งด้วยเรต ไม่แตะ `botPowerFor`

### B4. ประกอบพูล (`composables/useArena.js`)

```js
import { hashStr } from '../utils/seededRng.js'
import { getPvpBots } from '../utils/pvpBot.js'         // แทน getPvpBot
import { pickHumanOpponents } from '../utils/pvpMatch.js'

const opponents = computed(() => {
  const flat = [...Object.values(members.fbUsers || {}), ...(members.guestUsers || [])]
  const seed = hashStr(todayStr() + (auth.currentUser?.uid || ''))   // นิ่งต่อวัน+ต่อคน
  const humans = pickHumanOpponents(auth.currentUser?.uid, rating.value, flat, seed)
  const bots = getPvpBots(rating.value, seed)
  return [...humans, ...bots]   // คนจริงก่อน แล้วบอทอ่อน/แกร่งท้ายสุด
})
```
- `fight()` เดิมใช้ได้เลย (opp ใดๆ ที่มี `isBot`/`team`/`rating`) — ไม่แก้
- โควต้า 5 ครั้ง/วัน เดิม (บุกได้ 5 จาก 7 เป้า) — ไม่แก้

### B5. UI ป้ายบอท (`ArenaView.vue`)
- แถวบอทโชว์ป้ายอ่อน/แกร่ง: ใช้ `opp.label` เช่น `หุ่นซ้อม · {{ opp.label }}` (เดิมโชว์ "หุ่นซ้อม · ฝึกซ้อม")
- ที่เหลือ (team preview / ปุ่มบุก / เรต) เดิมใช้ได้ — `oppPreview(opp)` คง `opp.isBot ? opp.team : resolveBattleTeam(...)`

---

## เทส (pure — ไฟล์ใน `src/utils/`)

- `seededRng.test.js` (ใหม่): `mulberry32` deterministic ต่อ seed · `hashStr` เท่ากันต่อ input เดียวกัน + ต่างกันเมื่อ input ต่าง
- `pvpMatch.test.js` (อัปเดต): seed เดียว = ผลเดิม (นิ่ง) · seed ต่าง = ลำดับ/ชุดต่างได้ · เลือกในย่านใกล้ (ไม่ดึงคนเรตไกลมากเกิน window) · กันตัวเอง/คนไม่มีทีม · candidate < n → คืนเท่าที่มี · candidate < window → ใช้ทั้งหมด
- `pvpBot.test.js` (อัปเดต): `getPvpBots` คืน 2 ตัว · easy.rating < rating < hard.rating (โดย easy ≥ FLOOR) · deterministic ต่อ seed · uid `bot-easy`/`bot-hard` · `getPvpBot` เดิมยังผ่าน (พฤติกรรมไม่เปลี่ยนหลังย้าย rng)

## ไฟล์ที่แตะ (สรุป)

| ไฟล์ | เปลี่ยน |
|---|---|
| `utils/seededRng.js` | **ใหม่** — `mulberry32` (ย้ายจาก pvpBot) + `hashStr` |
| `utils/pvpMatch.js` | สุ่มในย่านใกล้ (seed) + const `HUMAN_POOL`/`NEAR_WINDOW` |
| `utils/pvpBot.js` | `getPvpBots` (2 ตัว อ่อน/แกร่ง) + const `BOT_RATING_SPREAD` + import rng ร่วม |
| `composables/useArena.js` | ประกอบพูล 5 คน + 2 บอท ด้วย daySeed |
| `views/ArenaView.vue` | ซ่อนพูลตอนปิด (`v-if="canFight"`) + "เร็วๆ นี้" + ป้ายบอท |
| เทส 3 ไฟล์ | ตามข้างบน |

## จุดที่ **ไม่** ทำ (YAGNI)

- ไม่ทำลีดเดอร์บอร์ด (subโปรเจกต์แยก) · ไม่ปรับสูตรพลังบอท (จูนทีหลัง) · ไม่แตะ Elo/โควต้า/เหรียญ · ไม่ทำ matchmaking แบบเก็บ state/ประวัติคู่ที่เคยเจอ · ไม่ทำ band กว้างแบบ configurable ผ่าน Firestore
