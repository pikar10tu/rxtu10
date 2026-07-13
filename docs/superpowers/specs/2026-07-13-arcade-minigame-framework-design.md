# Arcade Minigame Framework + Capsule Rush — Design Spec

วันที่: 2026-07-13
สถานะ: รอ user รีวิว → writing-plans
รอบรีวิว: fable architecture review (4 risk areas) ก่อนล็อก — findings รวมเข้าแล้ว

---

## 1. เป้าหมาย & สโคป

เพิ่ม **แพลตฟอร์มมินิเกม** ให้เว็บ RxTU10 v2 — โครงร่วมที่เสียบเกมใหม่ได้ถูก/เร็ว + **เกมแรก Capsule Rush** (แนว Flappy Bird tap-to-flap ธีมเภสัช/เพ็ท)

นี่คือ **Spec 1** ของแผนหลายเกม เกมถัดไป (Pill Crush = match-3 เต็มสูตร Candy Crush) เป็น **Spec 2** แยกภายหลัง

**ข้อกำหนดที่ user เคาะแล้ว:**
- ไม่มีหน้า leaderboard กลาง — แต่ละเกมมีปุ่ม 🏆 เปิดดูอันดับของเกมนั้นใน UI ของเกมเอง
- มินิเกมให้เหรียญ = **5 × คะแนน, ไม่มี cap รายวัน** (ตามปรัชญา "ทำมากได้มาก" เดียวกับที่ปลด cap ควิซ)
- ตัวบิน = เพ็ทที่ผู้เล่นเลือกจากคลังตัวเอง (fallback แคปซูล 💊 ถ้าไม่มีเพ็ท)

**อยู่นอกสโคป Spec นี้ (YAGNI):** หน้า leaderboard กลาง · รางวัลตั๋ว/achievement · เกมอื่นนอกจาก Capsule Rush · ปลดล็อก/ซื้อตัวบิน · game-loop abstraction ร่วม (extract หลังมีเกม 2 ตาม rule of three)

---

## 2. สถาปัตยกรรม (framework)

### 2.1 Registry — `data/minigames.js`
แหล่งข้อมูลเดียวที่นิยามทุกเกม (pure data ตาม convention โฟลเดอร์ `data/`):

```js
export const MINIGAMES = [
  {
    key: 'capsuleRush',            // = key ใน userData.minigames
    name: 'Capsule Rush',
    emoji: '💊',
    route: '/play/games/capsule-rush',
    coinPerPoint: 5,              // เหรียญ/คะแนน (ตั้งค่าต่อเกม)
    maxPlausibleScore: 500,       // เกินนี้ = clamp + log cheat (กันเงินเฟ้อ ไม่ใช่ cap รายวัน)
    scoreLabel: 'คะแนน',
    tagline: 'พาเพ็ทบินลอดชั้นวางยา',
    status: 'live',               // 'live' | 'soon'
  },
  { key: 'pillCrush', name: 'Pill Crush', emoji: '🍬', status: 'soon',
    tagline: 'เรียงเม็ดยา 3 สี ตะลุยด่าน' },
  // เกมอื่น status:'soon' …
]
```

### 2.2 Shell — `components/minigame/MinigameShell.vue`
เปลือก **chrome** ร่วมทุกเกม (ตัดสัญญาให้บางที่สุด):
- header: ชื่อเกม + อีโมจิ + ปุ่มกลับ `/play`
- แถบสถิติส่วนตัว: best ของฉัน (จาก `authStore.userData.minigames[key].best`)
- `<slot>` สำหรับพื้นที่เกม (canvas)
- **การ์ด game-over = `<slot name="gameover">` มี default** — default = คะแนน + เหรียญที่ได้ + ปุ่มเล่นใหม่/ออก (เกมหนักในอนาคตเช่น Pill Crush override เป็น combos/ดาว/ด่านได้)
- ปุ่ม 🏆 อันดับ → เปิด `MinigameLeaderboard` ใน `BottomSheet` (BottomSheet teleport to body อยู่แล้ว — ปลอดภัยตามกฎ CLAUDE.md ข้อ 6)

**สัญญาเดียวที่ทุกเกมต้องทำตาม:** เกมยุบตัวเองเหลือ **integer เดียว** ที่ `minigames[key].best` (Capsule Rush = ระยะ/คะแนน, Pill Crush = คะแนนรวม) → leaderboard เทียบได้ทุกเกมด้วย logic เดียว

> ⚠️ **อย่าเพิ่งสร้าง game-loop/lifecycle abstraction ร่วม** จนกว่าจะมีเกม 2 — shell คุมแค่ chrome, ตัวเกมคุม loop เอง (fable A)

### 2.3 Route ต่อเกม (หน้าเต็ม)
`/play/games/capsule-rush` — lazy route หน้าเต็มแบบ `FarmView` (เลี่ยงกับดัก stacking-context ที่ overlay สู้ bottom-nav ไม่ได้ — CLAUDE.md ข้อ 6) การ์ดใน Play landing ลิงก์มาที่นี่

### 2.4 Play landing — `views/PlayView.vue`
แทน `<SoonCard emoji="🍬" label="เภสัช Crush" />` (PlayView.vue:30) ด้วยการเรนเดอร์จาก registry:
- `status:'live'` → การ์ดเล่นได้ (ลิงก์ route + โชว์ best ตัวเอง)
- `status:'soon'` → `SoonCard` (Pill Crush ฯลฯ — **แทนที่** SoonCard เดิม ไม่ซ้ำ)

---

## 3. Data model & การเขียนคะแนน

### 3.1 Schema — `data/userSchema.js`
เพิ่มใน `USER_DEFAULTS`:
```js
minigames: {},   // { [key]: { best: 0, plays: 0 } }
```
`normalizeUserData` ensure ให้เป็น object เสมอ แบบเดียวกับ `likedBy` (userSchema.js:150):
```js
d.minigames = isObj(data.minigames) ? { ...data.minigames } : {}
```
**ไม่ต้อง** deep-default ราย key — ทุกจุดที่อ่านคะแนนใช้ optional chaining + fallback (`userData.minigames?.[key]?.best || 0`) จึงไม่ crash บน doc เก่าที่ยังไม่มี entry เกม เก็บใน user doc เดียวตาม pattern เดิม — โน้ต "user doc บวม" รับได้ (field เล็ก, ไม่ใช่ array โต) fable ยืนยัน location ถูก

### 3.2 การเขียนตอนจบเกม — ผ่าน `auth.patchUser(optimistic, server)`
**🔴 ต้องใช้ dot-notation ที่ฝั่ง server ไม่ใช่ nested map** — ไม่งั้น `{ minigames: {...} }` จะเขียนทับทั้ง map → วันที่ Pill Crush มา จบ Capsule จาก state เก่าจะลบ best เกมอื่นทิ้ง (fable B):

```js
const cur    = authStore.userData.minigames?.[key] || { best: 0, plays: 0 }
const reward = grantCoins(score, game)            // = pure util (§5) clamp maxPlausibleScore
const newBest = Math.max(cur.best, score)
const newPlays = cur.plays + 1

await authStore.patchUser(
  // optimistic — deep-merge เอง (setUserDataOptimistic เป็น shallow spread, auth.js:103)
  {
    coins: authStore.userData.coins + reward,
    minigames: { ...authStore.userData.minigames, [key]: { best: newBest, plays: newPlays } },
  },
  // server — dot-notation + increment (patchUser รองรับ payload ไม่มี pets key, auth.js:120-124)
  {
    coins: increment(reward),
    [`minigames.${key}.best`]: newBest,
    [`minigames.${key}.plays`]: increment(1),
  },
)
```
- `best` เป็น plain set (Firestore ไม่มี max-transform) → คำนวณ max จาก `userData.value` สดใน tick เดียวกัน (single-device ปลอดภัยพอ)
- `coins` guard ใน rules = `0..50M` ไม่มี cap ต่อครั้ง → payout ผ่าน (firestore.rules:60-61)

### 3.3 เขียนพลาด = เหรียญหาย (fable, ต้องจัดการ)
`patchUser` คืน `false` + rollback ตอนเน็ตพัง (auth.js:127-133) → การ์ด game-over ต้อง **ถือผลค้างไว้ + มีปุ่ม "ลองบันทึกอีกครั้ง"** ไม่ใช่จ่าย 0 เงียบๆ

---

## 4. Leaderboard (จาก members store)

### 4.1 ความจริงเรื่อง reads (แก้คำ claim)
- **ไม่ใช่ "0 read"** — หน้า Play ไม่โหลด members อยู่แล้ว (มีแค่ MembersView/ArenaView/AdminView เรียก `loadFbUsers`) → กด 🏆 ครั้งแรกยิง `getDocs(users)` **≈150 reads, ≤1 ครั้ง/เครื่อง/8 ชม.** (cache TTL, members.js:50-58) — รับได้ตาม pattern เดิม
- sort ~150 แถวฝั่ง client ทุกครั้งที่เปิด = ไม่มีปัญหาที่สเกลนี้

### 4.2 🔴 ต้องแก้ 2 ไฟล์ ไม่งั้นบอร์ดว่าง (fable C)
1. **members light subset** (members.js:68-95) ไม่มี `minigames` → เพิ่ม `minigames: n.minigames,` ในอ็อบเจกต์ `light` ไม่งั้น `useMinigameBoard` sort field ที่ไม่มี = บอร์ดว่าง
2. **bump `MEMBERS_CACHE_KEY`** `v4`→`v5` (membersCache.js:5) — คอมเมนต์บอกให้ bump เมื่อ shape เปลี่ยน ไม่งั้นเครื่องเก่าเสิร์ฟ cache รูปเก่า (ไม่มี minigames) นานถึง 8 ชม.

### 4.3 Composable — `composables/useMinigameBoard.js`
- เรียก `members.loadFbUsers()` (lazy, ใช้ cache)
- รวม `fbUsers` (+ ตัดสินใจ: **guestUsers ไม่รวม** ในอันดับ Phase นี้ — เป็น array แยก ไม่ใช่ผู้เล่นประจำ)
- map → `best = u.minigames?.[key]?.best || 0`, filter `best > 0`, sort desc, slice 50
- **🔴 overlay "ฉัน" จาก `authStore.userData` ก่อน sort** — cache เก่าหลายนาที/ชม. → best ที่เพิ่งทำได้จะไม่ขึ้นถ้าไม่ overlay (นักศึกษาจะแจ้งบั๊กภายในชั่วโมงแรก, fable C)
- ไฮไลต์แถว "คุณ" · โชว์ รูป/ชื่อเล่น/สาย/best (reuse หน้าตา leaderboard v1: `RxTU10-Selection-Tracking-main/js/tabs/leaderboard.js`)

### 4.4 UI — `components/minigame/MinigameLeaderboard.vue`
คอมโพเนนต์รับ prop `gameKey` เรนเดอร์บอร์ด top 50 ใน BottomSheet — reuse โดย MinigameShell ทุกเกม

---

## 5. Capsule Rush (เกมแรก)

### 5.1 กติกา
- แตะจอ = เพ็ทกระพือขึ้น (impulse), แรงโน้มถ่วงดึงลงต่อเนื่อง
- "ชั้นวางยา" คู่บน-ล่าง (มีช่องว่าง) เลื่อนเข้าจากขวา — ผ่านช่อง = **+1 คะแนน**
- ชนชั้นวาง / ตกพื้น / ทะลุเพดาน = จบเกม
- เกมเร่งขึ้นเรื่อยๆ (ความเร็วเลื่อน + ความถี่ช่อง) ตามคะแนน

### 5.2 ตัวบิน = เพ็ทที่เลือก
- ก่อนเริ่ม: grid อีโมจิเพ็ทจากคลังตัวเอง (`authStore.userData.pets` hydrated) → เลือก 1 ตัว
- จำตัวเลือกล่าสุดใน `localStorage` (default = `activePets[0]` หรือเพ็ทตัวแรก)
- ไม่มีเพ็ทเลย → แคปซูล 💊

### 5.3 เรนเดอร์ (fable D → ใช้ Fluent image ไม่ใช่ fillText)
- Canvas 2D + `requestAnimationFrame`
- **วาดเพ็ทด้วยรูป Fluent**: `fluentFile(emoji)` → โหลดเป็น `Image` → `drawImage` (ให้เพ็ทหน้าตาเหมือนทั้งเว็บ + hitbox คงที่ทุกเครื่อง) · **fallback `ctx.fillText(emoji)`** ถ้าโหลดรูปพัง (เลียนแบบ fallback ของ Emoji.vue)
- ⚠️ implementation note: `fluentFile()` คืน `.svg` — drawImage SVG อาจต้องเซ็ต `img.width/height` ก่อน (บาง browser ต้องมี intrinsic size) ตรวจตอน build
- ใช้ **game-engine skill** ตอน implement (loop, collision, sprite)

### 5.4 rAF บนมือถือ (fable, ต้องจัดการ)
- pause ตอน `document.hidden` / `visibilitychange` — สลับแอปกลับมา ไม่ให้ dt พุ่ง
- ใช้ **fixed / clamped timestep** — กัน dt spike ทำให้ตายฟรี หรือพุ่งทะลุท่อ (ได้คะแนนฟรี = exploit)

---

## 6. โมดูล logic ล้วน (เทสได้) — `utils/minigameCore.js` (+ `.test.js`)
ดึงส่วนคำนวณล้วนออกมาเทสด้วย `node --test` (ตาม precedent `importQuestions.test.js`) — canvas บางๆ ไม่เทส:
- `stepPhysics(state, dt)` — gravity / jump impulse / ตำแหน่ง
- `checkCollision(bird, pipes)` — ชน/ตก/ทะลุ
- `advanceScore(state)` — +1 เมื่อผ่านช่อง
- `grantCoins(score, game)` — `min(score, maxPlausibleScore) * coinPerPoint` + คืน flag ว่าเกิน (ให้ caller log `cheatLogs`)
- `buildMinigameBoard(fbUsers, me, key)` — merge/overlay me/filter/sort/slice 50

---

## 7. Anti-cheat & economy (fable D)
- **abuse ไม่ใช่ประเด็นใหม่** — rules ให้ user เขียน `coins` ตัวเองถึง 50M ผ่าน console อยู่แล้ว มินิเกมเป็น vector ที่งุ่มง่ามกว่า
- **ความเสี่ยงจริง = เงินเฟ้อ legit ตอน Pill Crush** (score หลักพัน × 5 = หมื่นเหรียญ/เกม เข้าเศรษฐกิจที่ CLAUDE.md บอกว่าเพี้ยนอยู่แล้ว) → `coinPerPoint` **ตั้งต่อเกม** (Pill Crush จะ ~0.5–1 เคาะทีหลังด้วย math แบบ battle-sim)
- `maxPlausibleScore` ต่อเกม: เกินเพดาน → clamp เหรียญ + เขียน `cheatLogs` (collection + rules มีอยู่แล้ว firestore.rules:145-148) — **ไม่มี cap รายวัน** เจตนา "ทำมากได้มาก" คงไว้

## 8. เฝ้าระวังหลัง launch (fable)
- **write ถี่ขึ้น**: 1 write/เกม (~30 วิ/เกม) = hot path ใหม่ ถี่กว่าควิซ — track อยู่แล้วผ่าน usage store (auth.js:125) → เฝ้าเกจ ถ้าพุ่งค่อย batch best+plays flush ตอนออกจาก shell แทนต่อเกม

---

## 9. ไฟล์ที่แตะ (สรุป)
**สร้างใหม่:** `data/minigames.js` · `components/minigame/MinigameShell.vue` · `components/minigame/MinigameLeaderboard.vue` · `composables/useMinigameBoard.js` · `views/CapsuleRushView.vue` · `utils/minigameCore.js` + `.test.js`
**แก้:** `data/userSchema.js` (field `minigames` + normalize) · `stores/members.js` (light subset +minigames) · `utils/membersCache.js` (bump v4→v5) · `router/index.js` (route) · `views/PlayView.vue` (registry cards แทน SoonCard เดิม)

**ไม่แตะ:** firestore.rules (ไม่ต้อง deploy — `minigames` อยู่ใต้ user doc guard เดิม, coins guard รองรับแล้ว, cheatLogs มีอยู่) · battle/gacha/farm/pet engine

## 10. เทส/ยืนยัน
- `node --test src/utils/minigameCore.test.js` ผ่าน
- `npm run build` ผ่าน
- เทสจอจริง (มือถือ): เล่นจบ → เหรียญเข้า + best อัปเดต + ขึ้น leaderboard (ตัวเอง overlay ทันที) · เน็ตพังตอนจบ → ปุ่มลองบันทึกใหม่ · สลับแอปกลับมาไม่ตายฟรี · doc เก่า (ไม่มี minigames) เล่นได้ไม่ crash · เครื่องเก่า cache v4 → กด 🏆 เห็นบอร์ด (หลัง bump v5)
