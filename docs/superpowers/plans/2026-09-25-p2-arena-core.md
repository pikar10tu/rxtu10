# P2 ระบบสนาม + พื้นครึ่งสนาม + สนามแชมป์ท็อป 10 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** มีทะเบียนสนาม + ข้อมูลความเป็นเจ้าของ + รีเพลย์แบ่งครึ่งสนาม + สนามแชมป์ King of the Jungle ที่แจกท็อป 10 อารีน่าผ่านจดหมาย — ทันกดแจกรางวัลซีซั่นหลังเที่ยงคืน 1 ต.ค. 2026

**Architecture:** ข้อมูลล้วน `data/arenas.js` + ตรรกะล้วน `utils/arenas.js` (ownership/ร้าน/roster string) + `utils/arenaLayout.js` (วางของตกแต่ง) · component `ArenaFloor.vue` วาดพื้น 1 ฝั่ง ใช้ทั้งในรีเพลย์และภาพย่อ · BattleReplay รับ `data.arenas = { top, bot }` (สตริงแบบแถว roster) · รางวัลซีซั่นแนบ `reward.arena` ในจดหมาย กดรับแล้วเข้า `users.arenas`

**Tech Stack:** Vue 3 · Firestore (transaction ใน mailbox) · node:test

สเปก: `docs/superpowers/specs/2026-09-25-arena-skins-replay-news-design.md` §1 §2 §3.1–3.2 §5

## Global Constraints
- id สนามห้ามเปลี่ยน/ห้ามลบเมื่อปล่อยแล้ว · prefix `ar-` (ทั่วไป) `ch-YYYY-MM` (แชมป์)
- ขยับได้แค่ transform/opacity · ห้าม blur/filter · ของขยับบนพื้น ≤ 2 ชิ้นต่อฝั่ง
- ฟอนต์ ≥ .7rem · โหมดลดการเคลื่อนไหวเช็คผ่าน `prefersReducedMotion()` เท่านั้น
- ห้ามให้สีธีมเว็บลามเข้า BattleReplay (สีสนามอยู่ใน `styles/arenas.css`)
- เขียน user doc ผ่าน `auth.patchUser` · ห้าม push

---

### Task 3: ทะเบียนสนาม + ตรรกะ ownership

**Files:**
- Create: `src/data/arenas.js`, `src/utils/arenas.js`, `src/utils/arenas.test.js`
- Modify: `src/data/userSchema.js` (default `arenas`), `src/utils/roster.js` (ฟิลด์ `ar`), `src/utils/roster.test.js`

**Interfaces (Produces):**
- `ARENAS: Arena[]`, `ARENA_TIERS = { rare:{price:10000,label:'RARE'}, epic:{…50000,'EPIC'}, legendary:{…100000,'LEGENDARY'}, free:{price:0,label:'FREE'}, champion:{price:0,label:'CHAMPION'} }`, `DEFAULT_ARENA = 'ar-sand'`, `getArena(id) → Arena|null`, `arenaPrice(a)`
- Arena = `{ id, name, tier, src:'free'|'shop'|'limited'|'champ', floor, deco:[[ch,x,d,size,opacity,anim?]], petals?, sale?:{from:'YYYY-MM-DD',to:'YYYY-MM-DD'}, season?:'YYYY-MM', power:null }`
- `arenaOf(u) → { owned:string[], on:string, champ:{[season]:rank} }` (on ไม่อยู่ใน owned หรือไม่รู้จัก → DEFAULT_ARENA · ar-sand ถือว่ามีเสมอ)
- `onSale(a, now) → bool` (เวลาไทย UTC+7 · shop = true · limited ตามช่วง · free/champ = false)
- `shopList(u, now) → Arena[]` (onSale && ยังไม่มี)
- `canBuyArena(u, id, now) → {ok, reason:'unknown'|'owned'|'closed'|'coins'|null, price}`
- `afterBuyArena(u, id) → arenas object ใหม่ (เพิ่ม owned + ใส่ทันที)`
- `afterWearArena(u, id) → arenas object ใหม่ (ใส่ได้เฉพาะของที่มี)`
- `rosterArena(u) → string|null` ('ar-lab' · 'ch-2026-09#3' · null ถ้าใส่ ar-sand)
- `parseArenaRef(str) → { id, rank }` (null/ไม่รู้จัก → `{ id: DEFAULT_ARENA, rank: null }` · 'tower' → `{ id:'tower', rank:null }`)

- [ ] เขียนเทส (ownership กรองของไม่รู้จัก, on ไม่อยู่ใน owned, onSale ของลิมิเต็ดก่อน/ในช่วง/หลังช่วง ตามเวลาไทย, shopList ไม่มีแชมป์/ของที่มีแล้ว, canBuy ทุก reason, rosterArena ใส่อันดับ, parseArenaRef ทุกกรณี, ทะเบียน id ไม่ซ้ำ + tier รู้จักทุกตัว + แชมป์มี season + ลิมิเต็ดมี sale)
- [ ] รัน `node --test src/utils/arenas.test.js` → FAIL
- [ ] เขียน data/arenas.js (13 สนามตามเดโม: `ar-sand ar-grass ar-lab ar-sakura ar-beach ar-apoth ar-volcano ar-space ar-gold ar-exam ar-loy ch-2026-09`) + utils/arenas.js
- [ ] userSchema: `arenas: { owned: [], on: null, champ: {} }` · roster: `...(ar ? { ar } : {})` โดย `const ar = rosterArena(d)` + เทส roster ว่าใส่/ไม่ใส่คีย์
- [ ] รันเทสทั้งสองไฟล์ → PASS · commit `Arena: ทะเบียนสนาม + ownership + ฟิลด์ ar ใน roster (สเปกสนามครึ่งสนาม)`

### Task 4: วางของตกแต่ง (pure)

**Files:** Create `src/utils/arenaLayout.js`, `src/utils/arenaLayout.test.js`

**Interfaces (Produces):**
`layoutDeco({ W, zone:{y0,y1}, side:'top'|'bot', items:[{ w, h, x, d, key }] }) → [{ key, x, y } | { key, skip:true }]`
- items[0] ได้ที่ก่อน (ผู้เรียกใส่ป้ายสลักเป็นชิ้นแรก)
- ระยะจากกล่องต่อสู้ `4 + h/2 + d*(zh-h-8)` · top: y = y1 - ระยะ · bot: y = y0 + ระยะ
- ชน → ลอง [x เดิม, ขอบจอฝั่งเดียวกัน] × [d เดิม, 1, 0] → ไม่ได้ = skip · สูงเกินเขต (`h+8 > zh`) = skip
- x ถูก clamp ใน `[w/2+6, W-w/2-6]` · กรอบชนเผื่อ 4px รอบชิ้น

- [ ] เทส: ไม่มีชิ้นไหนเลยเขต · ชิ้นแรกได้ตำแหน่งที่ขอเสมอถ้าพอ · ชิ้นชนถูกเลื่อนไปขอบ · ไม่มีที่ = skip · top/bot กลับทิศถูก · เขตเล็กกว่าชิ้น = skip
- [ ] FAIL → เขียน → PASS → commit `Arena: วางของตกแต่งในเขตขอบนอก ไม่ทับกล่องต่อสู้`

### Task 5: ArenaFloor + CSS พื้นสนาม

**Files:** Create `src/components/battle/ArenaFloor.vue`, `src/styles/arenas.css` (import ใน `src/main.js`)

**Interfaces:**
- Consumes: `getArena`, `parseArenaRef` (Task 3) · `layoutDeco` (Task 4)
- Produces: `<ArenaFloor :arena-ref="'ch-2026-09#1'" side="top|bot" :zone="{y0,y1}" :ambient="true" />` วาดเต็ม parent (position:absolute inset:0) · `mode="thumb"` = ภาพย่อ วางของ ≤ 3 ชิ้นแบบเปอร์เซ็นต์ ไม่วัด ไม่มีอนิเมชัน
- `arenaRef === 'tower'` = พื้นหอคอยเดิม (ย้าย gradient `.br-theme-tower`)

- วัดขนาดของแต่ละชิ้นหลัง mount ด้วย `offsetWidth/offsetHeight` (ครั้งเดียว + เมื่อ zone เปลี่ยน) แล้วเรียก `layoutDeco`
- ป้ายสลักแชมป์: `TOP n · ARENA CHAMPION` (1–3) / `TOP 10 · ARENA ELITE` (4–10) + บรรทัดเดือนปี ค.ศ. ภาษาอังกฤษตัวใหญ่ · คลาส r1/r2/r3/r10 · ฟอนต์ Cinzel (เพิ่ม `family=Cinzel:wght@700` ในลิงก์ Google Fonts ของ `index.html`)
- ขนาดตัวอักษรในป้าย ≥ .7rem (บรรทัดเดือน .7rem)
- `build` ผ่าน · commit `Arena: ArenaFloor วาดพื้น+ของตกแต่ง+ป้ายแชมป์`

### Task 6: รีเพลย์ครึ่งสนาม

**Files:** Modify `src/components/battle/BattleReplay.vue`, `src/views/ArenaView.vue`, `src/components/members/ProfileModal.vue`, `src/views/TowerView.vue`

- BattleReplay: ใต้ `.br-box` ใส่ `.br-bg.top` / `.br-bg.bot` (ArenaFloor) + `.br-seam` · วัด `seamY` = กึ่งกลาง `.br-vs` เทียบ `.br-ov` · `zoneTop = {0, boxTop}` · `zoneBot = {boxBottom - seamY, H - seamY}` · วัดตอน data เปลี่ยน (nextTick) + `resize` (ถอดตอน unmount)
- `arenas` = `data.arenas ?? { top: theme === 'tower' ? 'tower' : null, bot: null }`
- ลบพื้น `.br-theme-*` ที่ `.br-ov` (ย้ายไปอยู่ใน ArenaFloor แล้ว) — `.br-ov` คงพื้น `#0f172a` ไว้เป็นฉากสำรอง
- ArenaView: `replay.value = { ...r, arenas: { top: members.rosterRows?.[opp.uid]?.ar ?? null, bot: rosterArena(authStore.userData) } }` (บอท = null)
- ProfileModal duel: `arenas: { top: members.rosterRows?.[target]?.ar ?? null, bot: rosterArena(auth.userData) }`
- TowerView: `arenas: { top: 'tower', bot: rosterArena(authStore.userData) }`
- ข้อความ/สีบนพื้นเข้มตรวจตาม CLAUDE.md ข้อ 13
- build · commit `Replay: พื้นครึ่งสนาม บน=ศัตรู ล่าง=เรา (user เลือกรอยต่อแบบตรง)`

### Task 7: สนามแชมป์ในรางวัลซีซั่น

**Files:** Modify `src/utils/seasonRewards.js` (+test), `src/utils/mailbox.js` (+test), `src/stores/mailbox.js`, `src/views/AdminView.vue`

- `SEASON_REWARDS.arena = { topN: 10, achTopN: 3, joinCoins: 20000, ach: 'arena_champ' }`
- `computeSeasonRewards`: `arena.rank` = 1 + จำนวนคนที่แต้มมากกว่า · `top` = rank ≤ 10 (เส้นตัดเดิม เท่ากันได้หมด) · `ach` = rank ≤ 3
- `seasonRewardMails`: ท็อป 10 แนบ `arena: { id: 'ch-'+season, rank }` เฉพาะถ้า `getArena('ch-'+season)` มี · achievement เฉพาะ rank ≤ 3 · ข้อความ: ท็อป 3 = เดิม + "และสนามแชมป์" · 4–10 = "ติดท็อป 10 ได้สนามแชมป์ประจำซีซั่น"
- `buildBroadcastMail({ ..., arena })` → `reward.arena = { id, rank }` · `canClaim` นับ `reward.arena` เป็นรางวัล
- mailbox store claim (ในทรานแซคชัน): `userPatch['arenas.owned'] = arrayUnion(id)` + `userPatch['arenas.champ.' + season] = rank` · คืน `arena` ใน result · toast ในจุดเรียกไม่ต้องแก้
- AdminView แจกซีซั่น: preview บอก "สนามแชมป์: มี/❌ ยังไม่มี ch-YYYY-MM (จะแจกแค่เหรียญ/achievement)"
- เทส seasonRewards: 12 คน ท็อป 10 ได้สนาม อันดับถูก ท็อป 3 ได้ ach · อันดับ 10 เสมอกัน 2 คนได้ทั้งคู่ · ไม่มีสนามในทะเบียน = ไม่แนบ
- commit `Season: สนามแชมป์ท็อป 10 อารีน่า แนบในจดหมายรางวัล (user ขอ ท็อป 10 ได้พื้นเดียวกัน ป้ายต่างกัน)`

### Task 8: ตรวจรวม
- `node --test src/utils/*.test.js src/data/*.test.js` ผ่านทั้งหมด · `npm run build` ผ่าน
- เปิด dev ดูรีเพลย์หอคอย/อารีน่า (ถ้าเข้าระบบได้) · บันทึกสิ่งที่ยังไม่ได้เห็นบนจอจริง
