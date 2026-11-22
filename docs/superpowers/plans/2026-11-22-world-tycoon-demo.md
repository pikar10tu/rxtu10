# เศรษฐีรอบโลก เดโม v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** เกมกระดานแผนที่โลก 32 ช่อง เล่นได้ 2–4 คน (คนจริงผ่าน RTDB + บอทธรรมดา) เข้าได้เฉพาะแอดมิน/ผู้ทดสอบ
**Architecture:** กติกาทั้งหมดเป็น pure reducer `step(state, action) → {state, events}` (rng แบบ seed อยู่ใน state) · ห้องออนไลน์แบบ host-authoritative: host รัน engine + บอท, คนอื่นส่ง action เข้า inbox · UI อ่าน state + เล่น events เป็นแอนิเมชัน (game juice)
**Tech Stack:** Vue 3 · Firebase RTDB · node:test · pxl (พิกเซลอาร์ต) · WebAudio (เสียงสั้น)
**Spec:** `docs/superpowers/specs/2026-11-22-world-tycoon-design.md`

## Global Constraints
- ไม่มีสมบัติ · ไม่แตะเหรียญ/user doc/Firestore rules
- ฟอนต์ ≥ .7rem · overlay ใต้ RouterView ต้อง `<Teleport to="body">` · ธีมพาสเทล (ตัวแปร style.css)
- ข้อความผู้ใช้ (ชื่อห้อง) ผ่าน cleanText · ชื่อ/อาร์ตเป็นของเราเอง
- เข้าได้: แอดมิน หรือ uid อยู่ใน `config/app.tycoonTesters`

## File Structure
| ไฟล์ | หน้าที่ |
|---|---|
| `src/data/tycoon/board.js` | 32 ช่อง ชื่อ ประเภท ราคา กลุ่มสี ค่าคงที่เกม |
| `src/data/tycoon/cards.js` | การ์ดดวง 13 แบบ + น้ำหนักสุ่ม |
| `src/utils/tycoon/rng.js` | rng seed (mulberry32) pure |
| `src/utils/tycoon/rules.js` | ค่าผ่านทาง มูลค่า ซื้อต่อ เพดานสร้าง ชนะพิเศษ ทรัพย์สิน |
| `src/utils/tycoon/engine.js` | `newGame` `step` `legalActions` — state machine ของตา |
| `src/utils/tycoon/bot.js` | `botAction(state, seat)` |
| `src/utils/tycoon/*.test.js` | เทสต์ rules/engine/bot (+ ซิมบอทล้วนจบเกม 200 เกม) |
| `src/composables/useTycoonRoom.js` | ห้องในเครื่อง + ห้อง RTDB (host loop, inbox, presence, timeout) |
| `src/composables/useTycoonFx.js` | คิว events → แอนิเมชัน + เสียง (juice) |
| `src/views/TycoonView.vue` | ล็อบบี้/ห้อง/เกม |
| `src/components/tycoon/{TycoonBoard,TycoonDice,TycoonPrompt,TycoonHud,TycoonCard}.vue` | ชิ้น UI |
| `src/assets/tycoon/*.png` + `art/tycoon/*.px.js` | พิกเซลอาร์ต (pxl) |
| `database.rules.json` | `tycoon/rooms` |
| `src/router/index.js` · `src/views/PlayView.vue` · `src/utils/featureFlags.js` · AdminView | route + ทางเข้า + รายชื่อผู้ทดสอบ |

## Tasks
### Task 1: ข้อมูลกระดาน + rng + rules (TDD)
- [ ] เทสต์: กระดาน 32 ช่อง มุม 0/8/16/24 · เมือง 18 = 9 กลุ่ม×2 · ท่องเที่ยว 5 · การ์ด 4 · มินิเกม 1 · ภาษี 1
- [ ] เทสต์ rules: `toll(tile, level, festival)` · `propertyValue` · `takeoverPrice = 2×value` · `maxBuild(lapsDone)` = 2/3 · `checkSpecialWin` แถว/สามสี/ท่องเที่ยว · `netWorth`
- [ ] implement → เทสต์ผ่าน → commit

### Task 2: engine state machine (TDD)
state: `{ seed, rngState, round, maxRounds, turn(seat), phase, players[{uid,name,bot,cash,pos,laps,jail,doublesInRow,cards[],out}], tiles{idx:{owner,level}}, festival, pending, winner, log }`
phases: `roll` → (ย้าย/ผ่านเริ่ม) → `land` → `decide`(buy/build/takeover/landmark/startBuild/festival/travel/card/sell) → `end`
actions: `roll{aim}` · `buy{houses}` · `build{houses}` · `takeover` · `landmark` · `skip` · `useCard{card,target}` · `pickTile{idx}` · `sell{idx}` · `payBail` · `minigame{score}`
- [ ] เทสต์ทีละกติกาในสเปค (เงินเดือน คู่ทอยต่อ คู่3=คุก คุก2ตา เทศกาล×2 ซื้อต่อหลังจ่าย แลนด์มาร์คห้ามซื้อ ท่องเที่ยวห้ามสร้าง ขายครึ่งราคา ล้มละลาย ครบรอบนับทรัพย์สิน ชนะพิเศษ การ์ดทุกใบ)
- [ ] implement → ผ่าน → commit

### Task 3: บอท + ซิม
- [ ] `botAction` คืน action ที่อยู่ใน `legalActions` เสมอ · ซิม 200 เกมบอทล้วน seed ต่างกัน: จบทุกเกม ไม่ throw เงินไม่ติดลบ · commit

### Task 4: พิกเซลอาร์ต (pxl)
- [ ] โหลดสกิล pxl · วาด: ตัวเดิน 4 สี · บ้าน 1/2/3 · แลนด์มาร์ค · ช่องมุม 4 · ลูกเต๋า · การ์ด → PNG ใน `src/assets/tycoon/` · `pxl lint` · commit

### Task 5: UI เล่นกับบอทในเครื่อง + juice
- [ ] กระดานวงรอบ (ช่องรอบขอบ กลางเป็น HUD) · ตัวเดินกระโดดทีละช่อง · เต๋ากลิ้ง/เด้ง · แถบพลังกดค้าง · เงินลอย +/− · จอสั่นตอนจ่ายแพง · ป๊อปตอนสร้าง · ประกายแลนด์มาร์ค · การ์ดพลิก · เสียงสั้น · ชนะ = คอนเฟตตี
- [ ] route `/tycoon` + การ์ดทางเข้าใน Play (เฉพาะแอดมิน/ผู้ทดสอบ) · build ผ่าน · commit

### Task 6: ห้องออนไลน์ RTDB
- [ ] ล็อบบี้: สร้างห้อง/เข้าห้องด้วยรหัส · ที่นั่ง 2–4 · host เติม/ถอดบอท · เริ่มเกม
- [ ] host loop: อ่าน inbox → `step` → เขียน state · บอท/คนหมดเวลา 20 วิ → bot แทน · host หลุด → ที่นั่งถัดไปรับ
- [ ] `database.rules.json` tycoon/rooms · ผู้ทดสอบใน AdminView · commit

### Task 7: audit + push
- [ ] `npm test` · build · grep ฟอนต์ · ตรวจจอ Chrome 360px (เล่นกับบอทจบเกม) · deploy RTDB rules → push · อัปเดต memory
