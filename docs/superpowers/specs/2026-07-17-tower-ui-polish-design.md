# Tower UI Polish — Design Sub-spec (100 ชั้น + โซน 5 + แถบเทียบเพื่อน)

วันที่: 2026-07-17 · สถานะ: design direction พร้อม execute
คู่กับ: `2026-07-16-tower-100floor-rebalance-design.md` (ข้อ 4) · ไฟล์เป้าหมาย: `src/views/TowerView.vue` + `src/data/towerFloors.js` (เฉพาะสี/flag โซน 5)

> spec นี้บอก "หน้าตา + copy + โครง markup" — logic (ranking, merge towerBest สด, loadFbUsers) อยู่ใน spec แม่แล้ว ไม่ทวนซ้ำ

---

## 0) ลำดับ section บนหน้า (มือถือ)

```
page-title (เดิม)
├─ 1. tw-climb        แถบไต่ v2 (full-tower track + nearby window)
├─ 2. tw-card         การ์ดชั้นปัจจุบัน (action หลัก — อยู่เหนือ rival เสมอ)
└─ 3. tw-rival        การ์ดเทียบเพื่อน (social hook, ตามหลัง action ได้ ไม่ดันปุ่มสู้จม)
```

เหตุผลลำดับ: ปุ่ม "สู้ชั้น N" คือ action หลัก ต้องเห็นโดยไม่ scroll บนจอ ~640px · rival เป็น motivation รอง

---

## 1) แถบไต่ v2 — `tw-climb`

ปัญหา: window 6 ชั้นบนหอ 100 ชั้น มองไม่ออกว่าไต่มาไกลแค่ไหน
แก้: เพิ่ม **full-tower track** เหนือ window เดิม (เก็บ window 6 ชั้นไว้ — มันตอบ "ชั้นถัดไปคืออะไร" ได้ดีอยู่แล้ว)

### โครง markup

```
.tw-climb                       (การ์ดเดิม: #fff, border 2px var(--ink), radius 16, var(--pop))
├─ .tw-climb-head               แถวหัว: ซ้าย "ชั้น {floor} / 100" · ขวา "สูงสุด {best}"
├─ .tw-track-wrap               (position: relative; padding-top: 14px — เผื่อหมุดลอยด้านบน)
│   ├─ .tw-pin ×4               หมุด 🪙 ที่ 20/40/60/70 (% ของ track)
│   ├─ .tw-track                แทร็กเต็มหอ
│   │   ├─ (พื้น)               gradient hard-stop 5 โซน โทนจาง
│   │   ├─ .tw-track-fill       ส่วนที่ไต่ถึงแล้ว (กว้าง best%) — gradient เดียวกัน โทนเต็ม
│   │   └─ .tw-track-crown      👑 endcap ขวาสุด (landmark ชั้น 100)
│   └─ .tw-me                   ▲ marker ตำแหน่ง best (ใต้แทร็ก)
├─ .tw-track-scale              เลขกำกับใต้แทร็ก: 1 · 70 · 100
└─ .tw-climb-row                window 6 ชั้นเดิม (chips — คงพฤติกรรม/คลาสเดิมทั้งหมด)
```

### Visual spec

- **`.tw-climb-head`** — flex space-between · ซ้าย: `ชั้น {floor}` font-weight 800 `.9rem` color var(--ink) + ` / 100` color var(--muted) font-weight 700 `.78rem` · ขวา: `สูงสุด {best}` `.72rem` 700 var(--muted) · margin-bottom 4px
- **`.tw-track`** — height **14px** · border 2px solid var(--ink) · border-radius 999px · overflow hidden · position relative
  - พื้น: `linear-gradient(90deg, hard stops)` สีโซน **โทนจาง** — ใช้สีโซนจริง + alpha `40` (hex เช่น `#84cc1640`) ตาม stop: 0–20% / 20–40% / 40–55% / 55–69% / 69–100%
  - **`.tw-track-fill`** — absolute inset 0, `width: {best}%`, overflow hidden · ข้างในวาง gradient เดียวกันโทนเต็มที่กว้างเท่าแทร็กเต็ม (เช่น inner กว้าง `calc(100% * 100 / var(--pct))` — ตั้ง `--pct` inline) เพื่อให้สี fill ตรงตำแหน่งโซนจริง ไม่ยืดตาม fill
  - สีโซนบน track (จาก `ZONES`): `#84cc16` · `#60a5fa` · `#c084fc` · `#fbbf24` · **โซน 5 ใช้สีใหม่ `#5b21b6`** (ดู §3) — 4 โซนแรกสว่าง โซน 5 มืด = อ่านออกทันทีว่า "ช่วงท้ายคือของจริง"
- **`.tw-pin`** — 🪙 font-size `.66rem` · absolute `left: {n}%` `transform: translateX(-50%)` ลอยเหนือแทร็ก (top 0 ของ wrap) · ที่ชั้น 20/40/60/70 เท่านั้น (`TOWER_BONUS_FLOORS`) — **ห้ามใส่เหรียญที่ 80/100** (โบนัส flat แล้ว = เหรียญปลอม)
- **`.tw-track-crown`** — 👑 `.7rem` absolute ขวาสุดเหนือแทร็ก (landmark ชั้น 100 = ยอดหอ) · ชั้น 80 ไม่ต้องมี marker บนแทร็ก (กันรก — landmark อันดับไปโชว์ในการ์ดโซน/leaderboard แทน)
- **`.tw-me`** — สามเหลี่ยม ▲ ขนาด ~8px สี var(--ink) ใต้แทร็กที่ `left: {best}%` translateX(-50%) · ถ้า best ต่างจาก floor ปัจจุบัน ใช้ตำแหน่ง **best** (แทร็กสื่อ "ไต่ถึงไหนแล้ว" — ชั้นปัจจุบันมีใน head + chips อยู่แล้ว)
- **`.tw-track-scale`** — แถวเลขจิ๋วใต้แทร็ก `.62rem` 700 var(--muted): `1` ชิดซ้าย · `70` ที่ 70% (สี `#b45309` โทนเดียวกับ bonus — สื่อ "จุดโบนัสตัน") · `100` ชิดขวา
- **a11y:** `.tw-track-wrap` ใส่ `role="img"` + `aria-label="ความคืบหน้าหอคอย ชั้นสูงสุด {best} จาก 100"`
- **chips เดิม (`.tw-climb-row`)** คงทั้งหมด — ลบแค่ `.tw-climb-best` บรรทัดเดิม (ย้ายไป head แล้ว) · milestone outline เดิมใช้ `#f59e0b` เปลี่ยนเป็น var(--gold) ให้เข้าธีม

ความสูงรวมส่วนที่เพิ่ม ~46px — การ์ดยังเตี้ยพอไม่ดันปุ่มสู้หลุดจอ

---

## 2) การ์ดชั้นปัจจุบัน — โซน 5 + cue "พลังตัน"

### 2.1 สี/อาร์ตโซน 5 "บัลลังก์ราชันย์" (แก้ใน `towerFloors.js` ZONES[4])

4 โซนแรก = สีสว่าง flat + gradient อ่อน (สูตรเดิม `color → colorbb`) · โซน 5 ต้องหักโทน: **มืด + ทอง = ห้องบัลลังก์**

- `color: '#5b21b6'` (แทน `#f43f5e` เดิม — rose ชนกับ --accent และดูเป็น "โซนอันตราย" ไม่ใช่ "สนามวัดฝีมือ") · art คง 👑
- เพิ่ม flag `royal: true` ใน ZONES[4] — TowerView ใช้ตัดสิน treatment พิเศษ (อย่า hardcode `floor >= 70` ใน template)

### 2.2 Header โซน (`.tw-zone`) เมื่อ `zone.royal`

- background override: `linear-gradient(135deg, var(--ink) 0%, #5b21b6 100%)` (แทนสูตร `color→colorbb`)
- `.tw-zone-name` สี **var(--gold)** (โซนอื่นคง #fff) · `.tw-zone-floor` คง #fff
- `.tw-zone-art` (👑) เพิ่ม `filter: drop-shadow(0 0 6px rgba(255,176,32,.7))` — มงกุฎเรืองทอง
- เส้นคั่นใต้ header: `border-bottom: 2px solid var(--gold)` (โซนอื่นไม่มี) — จบลุค "ถึงห้องบัลลังก์"
- ห้ามเพิ่ม animation วนลูป (เคารพ prefers-reduced-motion + หน้านี้มี replay หนักอยู่แล้ว)

### 2.3 Cue "พลังบอทตัน" — `.tw-max-cue`

แสดงเมื่อ `zone.royal` เท่านั้น · วางระหว่าง `.tw-zone` กับ `.tw-bonus`:

```
.tw-max-cue   margin: 10px 16px 0 · padding: 8px 10px · border-radius: 10px
              background: var(--primary-light) · border: 1.5px dashed var(--primary)
              font-size: .74rem · font-weight: 700 · color: var(--ink) · line-height: 1.45
```

copy (2 บรรทัด — บอกก่อนว่าคืออะไร แล้วค่อยบอกวิธี ตาม voice-guide):

> **พลังบอทช่วงนี้ตันแล้ว (เกรด V ทุกตัว)**
> แพ้ชนะวัดที่ธาตุกับการจัดทีม — ✊ ข่ม ✌️ · ✌️ ข่ม ✋ · ✋ ข่ม ✊

(บรรทัดแรก weight 800 · บรรทัดสอง weight 600 — ทิศ RPS ตาม `index.js`: fist > scissors > paper > fist)

### 2.4 บรรทัดโบนัส (`.tw-bonus`)

- ปกติ: คงเดิม `🪙 โบนัสรายได้ตอนนี้ +{bonus}/วัน`
- เมื่อ `best >= BONUS_CAP_FLOOR` (70): ต่อท้าย ` (เต็มเพดานแล้ว)` weight 600 color var(--muted) — กันเข้าใจผิดว่าไต่ต่อแล้วโบนัสขึ้นอีก

---

## 3) การ์ดเทียบเพื่อน — `tw-rival`

Data: `{ top: [{nickname, floor, isMe}], myRank, total, chaseName, chaseGap }`

### โครง markup

```
.tw-rival                     (การ์ด: #fff, border 2px var(--ink), radius 16, var(--pop),
                               margin-top 12px, padding 12px 14px)
├─ .tw-rival-head             flex space-between
│   ├─ span                   "🏁 เพื่อนร่วมไต่"  (font-family: var(--font-display), 1.05rem, var(--ink))
│   └─ .tw-rival-rank         "คุณอยู่อันดับ {myRank} จาก {total}"  (.72rem, 700, var(--muted))
├─ ol.tw-rival-list           top 3 (semantic ol — screen reader อ่านเป็นอันดับ)
│   └─ li.tw-rival-row ×≤3    (flex, gap 8px, padding 7px 8px, border-radius 10px)
│       ├─ .tw-rival-medal    🥇/🥈/🥉  (1rem, flex-shrink 0)
│       ├─ .tw-rival-name     nickname  (.84rem, 700, flex 1, ellipsis 1 บรรทัด)
│       └─ .tw-rival-floor    "ชั้น {floor}"  (.8rem, 800, var(--ink), tabular-nums)
└─ .tw-rival-chase            hook ไล่ตาม (มีเงื่อนไข — ดู states)
```

### Visual spec

- **แถว isMe** — `background: var(--primary-light)` + `outline: 1.5px solid var(--primary)` + ต่อท้ายชื่อด้วย badge `คุณ` (font `.6rem` 800, สี #fff, bg var(--primary), padding 1px 6px, radius 999px) — หาตัวเองเจอใน 1 วิ
- แถวอื่น: พื้นโปร่ง ไม่มีกรอบ — ลดเสียงรบกวน ให้ isMe เด่นคนเดียว
- **`.tw-rival-chase`** — margin-top 8px · padding 8px 10px · border-radius 10px · `background: #fff1f2`-ish → ใช้ `color-mix` ไม่ได้ก็ fix `#ffeef1` (โทน --accent จาง) · border 1.5px solid var(--accent) · font `.76rem` 700 color var(--ink)
  - copy: `🔥 ตามหลัง {chaseName} อยู่ {chaseGap} ชั้น!` — จบแค่นี้ ไม่เติมคำเชียร์เกินจริง (voice-guide ข้อ 6: อิงสิ่งที่เกิดจริง)
- การ์ดนี้ **display-only ทั้งใบ** — ไม่มีปุ่ม จึงไม่ติดเกณฑ์ tap target · อย่าทำแถวเพื่อนกดได้ (กันหลุดไปหน้าโปรไฟล์คนอื่นโดยไม่ตั้งใจ + ไม่มี flow รองรับ)

### States

| เงื่อนไข | การแสดงผล |
|---|---|
| ไม่มีข้อมูล (`fbUsers` ยังไม่โหลด / โหลด fail / total 0) | **ซ่อนการ์ดทั้งใบ** (`v-if`) — best-effort ไม่มี skeleton ไม่มี spinner |
| user อยู่ใน top 3 | แถวตัวเอง highlight ใน list · ไม่มี `.tw-rival-chase` |
| `chaseName` มี (เพื่อนอันดับติดกันนำอยู่) | แสดง `.tw-rival-chase` |
| user อันดับ 1 | ไม่มี chase line · `.tw-rival-rank` เปลี่ยนเป็น `คุณอยู่อันดับ 1 จาก {total} 🎉` |
| ยังไม่ล็อกอิน | อยู่ใน `v-if="authStore.isLoggedIn"` block เดิมอยู่แล้ว |

---

## 4) Copy ทั้งหมด (สรุปรวม — ยึด voice-guide)

| จุด | ข้อความ |
|---|---|
| head แถบไต่ | `ชั้น {floor} / 100` · `สูงสุด {best}` |
| cue โซน 5 | `พลังบอทช่วงนี้ตันแล้ว (เกรด V ทุกตัว)` + `แพ้ชนะวัดที่ธาตุกับการจัดทีม — ✊ ข่ม ✌️ · ✌️ ข่ม ✋ · ✋ ข่ม ✊` |
| โบนัส (best≥70) | `🪙 โบนัสรายได้ตอนนี้ +20,000/วัน (เต็มเพดานแล้ว)` |
| หัวการ์ดเพื่อน | `🏁 เพื่อนร่วมไต่` |
| อันดับตัวเอง | `คุณอยู่อันดับ {myRank} จาก {total}` |
| chase hook | `🔥 ตามหลัง {chaseName} อยู่ {chaseGap} ชั้น!` |
| พิชิตครบ (เดิม :65) | คง `🏆 พิชิตหอคอยครบแล้ว!` (เงื่อนไขอิง TOWER_MAX ใหม่ = 100 อัตโนมัติ) |

ห้าม: "เทพ/เซียน/ปัง/สุดยอด/ไม่มีใครรอด" — ทุกบรรทัดข้างบนผ่าน glossary แล้ว

---

## 5) Polish & standards (ทำพร้อมกันในไฟล์เดียว)

1. **Typography scale** — ล็อก 4 ระดับ ใช้ให้สม่ำเสมอทั้งหน้า:
   - display: var(--font-display) — page title 1.5rem / zone name 1.3rem / หัวการ์ด rival 1.05rem
   - body: `.82–.9rem` weight 700–800 (ชื่อ/ตัวเลขสำคัญ)
   - secondary: `.72–.78rem` weight 700
   - micro: `.62–.68rem` weight 700–800 (label, scale) — **เลิกจุดเล็กกว่า .6rem**
2. **สี muted ให้เป็น token** — ในไฟล์มี `rgba(0,0,0,.45)/.5/.55` ปนกับ var(--muted) หลายจุด (`.tw-label`, `.tw-chip-n`, `.tw-climb-best`, `.tw-vs`, `.tw-empty`, `.tw-login`) → แทนด้วย `var(--muted)` ทั้งหมด (ยกเว้นข้อความบนพื้นสีเข้ม)
3. **Tap targets ≥44px** — `.tw-edit`/`.tw-fight` เติม `min-height: 44px` (ตอนนี้ ~45px จาก padding แต่กันฟอนต์เปลี่ยน) · `.tw-mon` 54px ผ่าน · chips ไม่ interactive ไม่ติดเกณฑ์ (อย่าทำให้กดได้)
4. **Teleport rule (CLAUDE.md ข้อ 6)** — งานนี้**ไม่เพิ่ม overlay ใหม่** · `.tw-scout` มี `<Teleport to="body">` อยู่แล้ว **ห้ามลบ wrapper ตอน refactor** (บั๊กนี้วนมา ≥5 รอบ) · ถ้าอนาคตเพิ่ม sheet โซน/แผนที่ ให้ใช้ `components/shared/BottomSheet.vue`
5. **ไม่แตะ:** `.tw-actions`/ปุ่มสู้ (ดีอยู่แล้ว) · scout modal · TeamPicker/BattleReplay/PetDetailModal · โครง `.tw-card` แถวศัตรู/ทีม

## 6) เช็กก่อนปิดงาน

- [ ] จอ 360px: track + pins ไม่ล้น, ชื่อเพื่อนยาว ellipsis ไม่ดัน "ชั้น N" ตก
- [ ] best=1 (ผู้เล่นใหม่หลัง reset): fill แทบมองไม่เห็นแต่ ▲ marker อยู่ซ้ายสุดถูกต้อง · rival card โชว์ปกติ
- [ ] best=100: fill เต็ม, 👑 endcap ไม่ซ้อนหมุด 70
- [ ] floor 69→70: header โซนสลับเป็น royal + cue โผล่ · floor 69 ไม่มี cue
- [ ] ไม่มีข้อมูลเพื่อน (ปิด network): การ์ด rival หายเงียบ หน้าเล่นต่อได้
- [ ] `npm run build` ผ่าน
