# Handoff / สถานะ & แผนต่อไป — Pet & Economy arc (21 มิ.ย. 2026)

> เอกสารส่งต่อสำหรับคุยแผนกับ **Claude Cowork** (cowork ไม่เห็น memory ของอีกเอเจนต์ — อ่านจากไฟล์นี้). สรุปสิ่งที่ขึ้น prod แล้ว + ปุ่มเศรษฐกิจ (draft pins) + งานที่ยังเหลือ.

## TL;DR
รื้อระบบเพ็ท+กาชา+เศรษฐกิจเสร็จและ **เปิดร้านให้นักศึกษาจริงแล้ว** (`SHOP_OPEN=true`). gacha (banner เดียว + pity + เลือกเป้า 50/50) + ห้องทดลอง (fusion ไต่ระดับ + แลก copies เป็นเหรียญ) + reveal animation. **ยังไม่ทำ: ระบบต่อสู้ (battle/tower/PvP) + potential combat** — เป็นก้อนใหญ่ก้อนต่อไปที่ทำให้ stat/ธาตุ/potential ของเพ็ทมีความหมาย.

## สิ่งที่ live บน prod (master, auto-deploy GitHub Pages)
- **กาชา (Phase B):** banner เดียว · สุ่ม 1 (1,000) / สุ่ม 10 (10,000 = 11 ตัว) · pity ตัวนับเดียว · เลือกเป้า legendary → 50/50 + การันตีหน้าตู้ตอนหลุดเรท (ไม่เลือก = new-first ตัวที่ยังไม่มีก่อน) · 10-pull การันตี ≥1 epic
- **ตัวซ้ำ → `pets[].copies` ต่อตัว** · อัพเกรด I–V ใช้ **1 copy/ขั้น** (รวม 5) + เหรียญ
- **ห้องทดลอง (Phase D, แท็บใน Shop):** **fusion** จ่าย copies ระดับล่าง → สุ่ม uniform ระดับบน (ซ้ำ=+copy) · **แลก** copies → เหรียญ scale ตามระดับ · spend-picker เลือกเพ็ท+จำนวน copies ตอนจ่าย
- **reveal animation:** กาชา = "พิธีอัญเชิญ" (ลูกแก้วเรืองแสงสี=rarity สูงสุด → เผย cascade + legendary รังสีทอง, แตะข้าม, reduced-motion) · ห้องทดลอง = fusion aura + redeem coin-burst
- **เก็บกวาดแล้ว:** ลบ field `refine` ตาย, ตัดโบนัสรายได้เพ็ท %บ้าน, ตัดส่วนลดร้าน, ลบ `data/shop.js` (egg เก่า)

## ปุ่มเศรษฐกิจปัจจุบัน (draft pins — ปรับได้จุดเดียว)
| ระบบ | ไฟล์ | ค่า |
|---|---|---|
| Gacha rate | `src/utils/gacha.js` | legendary **4%** · epic **16%** · rare **35%** · common **45%** |
| Gacha pity | `src/utils/gacha.js` | soft **40** · hard **50** · step +6%/pull |
| ราคา pull | `src/utils/gacha.js` | 1,000 / 10,000 (11 ตัว) |
| รายได้เพ็ท base | `src/utils/petUtils.js` | common 15 · rare 38 · epic 85 · legendary 175 (× `GRADE_MULTI_V2 [1,2,3.5,5.5,8,12]`) |
| อัพเกรด | `src/utils/petGrade.js` | 1 copy/ขั้น + เหรียญ `RARITY_GRADE_COIN {200/600/1500/4000}` × เกรดเป้า |
| Fusion cost | `src/utils/lab.js` | common→rare 15 · rare→epic 12 · epic→legendary 10 (copies) |
| Redeem เหรียญ | `src/utils/lab.js` | common 50 · rare 200 · epic 800 · legendary 3000 (ต่อ copy) |
| บ้าน (รายได้/ชั้น) | `src/data/residence.js` | Lv1–12: 300 → 55,000/วัน |

> หมายเหตุ: pity 50 + 50/50 → ซวยสุดได้ตัวเป้า legendary ภายใน 100 สุ่ม · legendary ตัวแรก ~30 สุ่ม. ตัวเลขทั้งหมดจูนได้หลัง playtest.

## สถาปัตยกรรม/แพทเทิร์นที่ยึด (ดู CLAUDE.md)
- เขียน user doc ผ่าน `auth.patchUser(optimistic, server)` เท่านั้น · ฟิลด์ใหม่ → `data/userSchema.js` ที่เดียว
- logic เป็น **pure util ฉีด rng** + เทส `node --test src/utils/<x>.test.js` (37 เทสผ่าน: gacha/gachaMerge/lab/petGrade/petUtils/userSchema)
- modal/overlay → `<Teleport to="body">` (กับดัก `#main-content` position:fixed) · emoji → `<Emoji :char>`
- **ไม่แตะ firestore.rules / migration / index** ตลอด arc นี้ (copies/dupeCoins ไม่มี — ใช้ field เดิม)

## Spec/Plan ในรีโป (arc นี้)
- `docs/superpowers/specs/2026-06-20-gacha-rework-phaseB-design.md` (+ plan) — กาชา **§8 มี seed ของ Phase C/D**
- `docs/superpowers/specs/2026-06-21-lab-fusion-phaseD-design.md` (+ plan) — ห้องทดลอง
- `docs/economy-battle-master-plan.md` — **แผนแม่บท battle/tower/PvP/passive** (ยังเป็นร่าง มี TODO ค้าง: พารามิเตอร์หอคอย, ลำดับตี/crit/ขนาดทีม, เกรดคง 12 หรือตัด)

## งานที่ยังเหลือ (candidate — คุยกับ cowork ว่าจะลุยอันไหน)
1. **🔭 ระบบต่อสู้ (ก้อนใหญ่สุด, ปลดล็อกคุณค่าเพ็ทจริง)** — async auto-battle + หอคอย PvE + PvP จาก `economy-battle-master-plan.md`. ตอนนี้ stat/ธาตุ/`activePets`/battleSlots/potential มีโครงใน data แต่ "ยังไม่มีที่ใช้". **ต้องเคาะพารามิเตอร์ก่อนลงมือ** (ดู TODO ในแผนแม่บท)
2. **Phase C — Potential rework (combat-only)** — affix 6 ตัวต่อสู้ (atk/hp/crit/critDmg/lifesteal/dodge, ตัด dailyCoins) · roll ด้วย copies/เหรียญ · มี data พร้อม (`data/potential.js`) + UI โชว์ slot read-only แล้ว. **ผูกกับ battle** (โชว์เลขได้ก่อน แต่มีผลจริงตอน battle เปิด). picker ในร้านมี passive placeholder "🔒 รอ Phase C" รออยู่
3. **จูนเศรษฐกิจหลัง playtest** — gacha generosity / fusion-redeem rate / รายได้เพ็ท (ทั้งหมด draft pin ปรับเร็ว)
4. **Daily Challenge** (roadmap เก่า) — 5 ข้อ/วัน async, Kahoot scoring, leaderboard, top-5 รางวัลผ่าน Mailbox · **ของรางวัลยังไม่ฟิกซ์ (coins vs badge)**
5. **Home getting-started guide** (first-run audit item 3) — ยังไม่ทำ

## ข้อควรรู้/กับดัก
- Shop เปิดแล้ว → ทุกการแก้ economy = กระทบนักศึกษาจริงทันทีหลัง push. ปิดร้านด่วน = flip `SHOP_OPEN=false` (admin เห็นร้านปกติเสมอ)
- pets เป็น species-based (1 entry/ชนิด + copies) · legendary 9 ตัว, epic/rare/common 6 ตัว/ระดับ · roster ใน `data/index.js PETS`
- ทดสอบ migration/feature ที่ interactive ต้อง login Google จริง (admin = `prawich.aum@dome.tu.ac.th`)
