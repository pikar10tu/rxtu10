# BattleReplay v3 — Scene/FX Split (แก้กระตุก iOS Safari)

วันที่: 2026-07-17
สถานะ: design (อนุมัติทิศทางแล้ว — user เลือก "เก็บการ์ดพุ่งจริง ฟีล Hearthstone")
ที่ปรึกษาสถาปัตยกรรม: Fable
ไฟล์หลัก: `src/components/battle/BattleReplay.vue` (รื้อไส้) · `src/utils/battleFx.js` (ใหม่) · ไม่แตะ `data/battle.js` / `utils/battleEngine.js` / `components/shared/Emoji.vue`

## 1. ปัญหา & วินิจฉัย

หน้า battle กระตุกบน **iOS Safari (WebKit)** ตอนโจมตี (ลื่นบน Chrome) · ใช้ร่วม Tower + Arena/PvP · แก้มา 4 รอบไม่หาย (composite hp bar → cache centerOf + promote pop → promote box/glow → ถอด will-change ถาวร + ตัด hitstop)

**Diagnostic ชี้ขาด (เทสบน iPhone Safari จริง):**
- **โหมดลื่น (lite)** = ไม่มี `will-change` + ตัด motion/effect ทิ้งหมด (การ์ดอยู่กับที่ ไฮไลต์แค่ขอบ, เลข/หลอดเปลี่ยนทันที) → **ลื่น 60fps**
- **fix#4** = ไม่มี `will-change` ถาวร แต่คง motion เต็ม → **ยังกระตุก**

ทั้งขั้ว "มี layer ถาวร" (fix#3) และ "ไม่มี layer ถาวร" (fix#4) พังทั้งคู่ → **ปัญหาไม่ใช่ค่า knob (will-change) แต่คือ animate ผิดตัว** cost จริงต่อหมัด เรียงตามน้ำหนัก:

1. **(ตัวการหลัก) raster churn ของ DOM หนัก** — ทุกหมัดการ์ดจริง (`.br-unit` = `<img>` SVG ×2 + ข้อความ + border-radius ~90×90pt) โดน transform animate หลายรอบ (windup lift → acting lift → lunge → เป้า shake) พอไม่มี layer ถาวร WebKit ต้อง promote ชั่วคราว = rasterize การ์ดทั้งใบ @DPR3 → จบ animation demote = raster กลับ parent อีก + `::after` glow (box-shadow blur 18px = raster แพงมากใน WebKit) promote/demote อีกชุด → **~6–10 raster event/หมัด อัดใน ~600ms** (raster การ์ดใบเดียว @3x ก็เกิน 16ms budget ได้ → เหตุผลที่ 1v1 = 3v3)
2. **element churn ของ ephemeral** — `.br-pop`/`.br-proj`/`.br-call` เกิด-ตายผ่าน v-for ทุกหมัด แต่ละตัวมี will-change → สร้าง layer + raster stroked text + ทำลาย layer ต่อหมัด (ไม่เคย reuse)
3. **(รอง) Vue re-render churn** — spread `hp`/`pops`/`callouts` + toggle `acting`/`winding`/`flashing` = re-render component ทั้งใบ (30+ `<Emoji>` diff) ~6–8 ครั้ง/หมัด (2–5ms/ครั้ง) เบียด main thread ช่วงเดียวกับ raster → เฟรมตึงหลุด

**บทสรุป:** เราเอา motion ไปแขวนกับ DOM ที่แพงสุดในจอ (การ์ดเต็มใบ + เงา blur) แล้วสร้าง/ทำลายใหม่ทุกหมัด · lite mode = existence proof ว่า DOM + Vue รัน workload นี้ที่ 60fps ได้ ถ้าคุม paint เป็น → **ไม่ใช่ปัญหาที่ต้องหนีไป canvas**

## 2. หลักการออกแบบ (doctrine ของไฟล์นี้)

1. **ฉาก (Scene) นิ่ง** — การ์ด/หลอด/เลข/ป้าย = static layout ตลอดไฟต์ เปลี่ยนได้แค่ discrete state ที่ lite พิสูจน์แล้วว่าถูก: `border-color`, ตัวเลข, `scaleX` หลอดเลือด, `opacity` ตอนตาย · **ข้อยกเว้นเดียว = melee card lunge (ดู §2 ท้าย) — การ์ดขยับได้ 1 อนิเมชัน/หมัดเท่านั้น**
2. **Motion เกือบทั้งหมดอยู่ใน FX pool** — overlay ชั้นเดียว (`pointer-events:none`) element จิ๋วจำนวนคงที่ ~8–10 ชิ้น **สร้างครั้งเดียว/ไฟต์ promote ถาวร reuse ตลอด** (ชิ้นเล็ก texture memory จิ๊บจ๊อย ไม่ชน layer budget ที่ฆ่า fix#3 ซึ่งเป็น 25 layer *การ์ดเต็มใบ*) · promote ถาวร = raster จ่ายครั้งเดียวต่อ content change ไม่ใช่ต่ออนิเมชัน
3. **ของอายุ < 1 วิ ห้ามอยู่ใน Vue reactivity** — pops/callouts/projectiles/acting/winding/flashing ออกจาก refs ทั้งหมด → imperative (FX pool + `classList` ผ่าน `els` map เดิม) · Vue เหลือ: layout ฉาก, `hp`/dead, modal, inspect, controls

### ⚠️ ข้อยกเว้นที่ user เลือก: เก็บ "การ์ดพุ่งจริง" (Hearthstone) สำหรับ melee

user ต้องการคงฟีลการ์ดพุ่งชน → **melee = การ์ดจริงพุ่ง out-and-back เป็นอนิเมชัน WAAPI "ตัวเดียว/หมัด"** (promote การ์ด 1 ใบชั่วคราวตอน lunge, ที่เหลือ windup/glow/shake/เลข ย้ายไป FX pool หมด) → จาก ~6–10 raster/หมัด เหลือ **1 raster/หมัด (melee)** · ranged = ไม่มี card animation (projectile FX เท่านั้น)

**ความเสี่ยง (พูดตรง):** การ์ดพุ่ง = ตัวที่แพงสุดพอดี การเก็บไว้คือรับความเสี่ยงที่เหลือมากสุด แต่ควรไหวเพราะเหลือ raster เดียว/หมัด
**เกณฑ์ตัดสิน (falsifiable):** Phase 3 วัด `?fps=1` บน iPhone Safari จริง ตอน melee — ถ้ายัง >33ms (แดง) และ Layers inspector ยืนยันว่าการ์ด lunge คือตัวที่ raster หนัก → **สลับ melee เป็น "sprite-dash" (plan B)**: ตัวเพ็ท (sprite ใน FX pool) พุ่งเข้าฟาด + burst การ์ดอยู่กับที่ (fable's default — composite ล้วน, อ่านออกเท่าเดิม)

## 3. FX Pool — สเปก (`src/utils/battleFx.js`, plain JS ไม่พึ่ง Vue)

mount layer ลูกของ `.br-box` · ย้าย `centerOf`/`invalidateCenters` (centers cache) เข้ามาอยู่ด้วย (เป็นของ FX) · pool element = `<img>` ผ่าน `fluentFile()` ตรง (ไม่ผ่าน Emoji.vue) ตั้ง `loading="eager"` + `decoding="sync"`

```
createBattleFx(boxEl, { fluentFile, base }) → {
  attach(centersProvider), setRate(s), cancelAll(), destroy(),
  ring(uid, phase)                 → Promise   // ไฮไลต์ acting/windup (แทน glow ::after เดิม)
  projectile(fromUid, toUid, char) → Promise   // ranged
  burst(uid)                       → Promise   // 💥 impact (แทน shake การ์ด)
  pop(uid, {dmg, crit, eff})                   // เลขดาเมจ (pool 4 ชิ้น วนใช้)
  callout(uid, kind)                           // แพ้ทาง/ต้านทาน (pool 1)
  koPuff(uid)                                  // 💀
}
```

- ทุก motion ขับด้วย **WAAPI `element.animate()`** เฉพาะ `transform` + `opacity` (accelerated บน WebKit, off main thread) · คืน `animation.finished` ให้ sequencer await
- **ring** = radial-gradient วาดครั้งเดียวตอนสร้าง pool แล้ว animate `opacity`/`transform` เลื่อนไปเกาะการ์ด (raster ครั้งเดียว/ไฟต์ vs box-shadow blur เดิมที่ raster ต่อ toggle)
- **pop** = pool 4 ชิ้น reuse: set `textContent`/class → `animate()` rise/fade · **คง text-stroke ได้** (raster ตอนเปลี่ยน content ไม่ใช่ทุกเฟรม) · **ตัด `text-shadow` ทิ้ง** (stroke พอ)
- **melee lunge** = อยู่ในตัว BattleReplay (การ์ดจริง) ไม่ใช่ FX pool — ดู §2 ข้อยกเว้น

### mapping เอฟเฟกต์เก่า → ใหม่

| เดิม | ใหม่ | card raster/หมัด |
|---|---|---|
| windup: การ์ดเอน+ลอย | **ring FX** เกาะการ์ด + border เหลือง | 0 |
| glow `::after` blur | ring = radial-gradient animate opacity | 0 |
| melee lunge การ์ดพุ่งทั้งใบ | **คงไว้ (Hearthstone)** — WAAPI การ์ดจริง 1 อนิเมชัน/หมัด | 1 |
| projectile (สร้าง/ทำลาย) | pooled sprite swap src + animate | 0 |
| shake การ์ดเป้า | **border แดงวาบ** (lite-proven) + **burst 💥** | 0 |
| pop เลข (v-for เกิด-ตาย) | pooled ×4 set text → animate | 0 (raster ข้อความจิ๋วครั้งเดียว/ป็อป) |
| callout / 💀 | pooled | 0 |

## 4. Sequencer — ขับจังหวะ

**ไม่ทำ rAF timeline engine** (workload = 1 attack sequential/~380ms ไม่ใช่ particle system) — คงโครง `step()`/dispatch เดิม เปลี่ยนไส้เป็น promise chain:

```js
async function applyAttack(e) {
  const g = gen
  highlight(e.attacker, 'windup')                 // classList ตรง ไม่ผ่าน ref
  await fx.ring(e.attacker, 'windup')             // ~windupMs/speed
  if (g !== gen) return
  highlight(e.attacker, 'acting')
  await (isRanged(e) ? fx.projectile(...) : cardLunge(e.attacker, e.target))  // melee = การ์ดจริง
  if (g !== gen) return
  applyImpact(e)   // hp.value update (reactive เดียวที่เหลือ) + fx.pop + fx.burst + callout + koPuff + highlight target 'flash'
}
```

- **gen guard คงเดิม** + `fx.cancelAll()` ใน reset/skip (WAAPI `cancel()` สะอาดกว่า clearTimeout หลายตัว) · `cardLunge` ต้อง reset transform/z-index เสมอแม้โดน cancel
- **speed** = `fx.setRate(s)` set `playbackRate` ของ animation ที่วิ่งอยู่ + คูณตอนสร้างใหม่ · card lunge ก็ใช้ playbackRate
- **pause** = semantics เดิม (จบหมัดปัจจุบันแล้วหยุด step ถัดไป ไม่ pause กลาง animation)
- ช่องว่างระหว่างหมัด (`baseDelay`) = setTimeout ต่อได้ (setTimeout ไม่ใช่จำเลย)
- **Vue หลังรื้อ:** ต่อหมัดเหลือ reactive write เดียว (`hp`) → re-render 1 ครั้ง · `unitClass` เหลือแค่ `dead`

## 5. คง / ตัด / ถูกลง

- **คง:** intro READY/GO · modal สรุป+MVP · inspect popover (hit-test การ์ด DOM ยังอยู่) · controls · หลอดเลือด `scaleX` transition · ticks · dead state · **melee card lunge (Hearthstone)** · โครง log/engine (ไม่แตะ battle.js)
- **ตัด:** transform บนการ์ด *ยกเว้น lunge* (windup lean, acting lift, shake) · `::after` glow · `transition: transform` ที่ไม่ใช่ lunge · CSS lite override ส่วนใหญ่
- **ถูกลง:** lite mode = `fx.enabled = false` + timing สั้น (lite branch ใน playMotion/startWindup หายเกือบหมด) · **คง lite เป็น fallback** + ผูก `prefers-reduced-motion` → auto-lite (a11y ฟรี) · preload emoji combat ครบ (⚡🛡️💀💥 + projectiles + หน้าเพ็ท) ตอน intro → ตัด lazy-decode hitch

## 6. ทำไมไม่ canvas (ยืนยันอีกครั้ง)

diagnostic ชี้ศัตรู = raster churn ของ DOM หนัก + reactivity churn = **"จัด DOM ผิด" ไม่ใช่ขีดจำกัด DOM** · lite mode พิสูจน์ว่า DOM+Vue รัน 60fps ได้ · canvas บังคับ: pre-raster SVG→ImageBitmap เอง, เขียน layout/positioning เอง, เสีย hit-test แตะ inspect, เสีย text ไทย + a11y, และ modal/inspect ยังเป็น DOM → **คนเดียวแบก 2 rendering system ตลอดชีพ** แลกกับปัญหาที่ DOM แก้ได้ · **เกณฑ์ล้มสมมติฐาน:** ถ้า ship FX-pool แล้ว fps ยังแดงตอน melee ทั้งที่ Layers inspector ยืนยันว่าทุกอย่าง composite ล้วนแล้ว → ค่อยคุย canvas *เฉพาะชั้น FX* (ไม่มีวันทั้งจอ)

## 7. Migration (incremental — เทส iPhone จริงทุก phase)

- **Phase 0 (~0.5 วัน):** preload/eager emoji combat ทั้งชุด + ตัด `text-shadow` จาก pop — ship เดี่ยวได้เลย ไม่เสี่ยง (เก็บ perf ฟรี)
- **Phase 1 (~1 วัน):** เขียน `battleFx.js` + ย้าย centers cache เข้าไป · เทส pool แยกได้
- **Phase 2 (~1 วัน):** รื้อไส้ BattleReplay — ephemeral refs 6 ตัวออก, `applyAttack` → promise seq, melee = card lunge WAAPI, ลบ CSS card-motion/`::after`/lite-override, highlight เป็น classList
- **Phase 3 (~0.5 วัน):** จูน juicy ของ lunge+burst+ring กับ user บนจอจริง · **วัด `?fps=1` ตัดสิน card-lunge vs sprite-dash** · ผูก reduced-motion · ลบโค้ดตาย
- รวม **~3 วัน** · แต่ละ phase revert อิสระ · lite = safety net ตลอด

## 8. จุดเสี่ยงพลาด (เรียงตามโอกาส)

1. **card lunge ยังกระตุก** — เป็นตัวแพงสุดที่ user ขอเก็บ → Phase 3 วัด fps ก่อนถอน sprite-dash fallback ทิ้ง (อย่า commit ทิ้ง plan B จนกว่าจะวัดผ่าน)
2. **Visual acceptance** — โชว์ Phase 3 บนจอจริงก่อนถือว่าจบ
3. **skip/reset กลาง animation** — pool/การ์ดค้างกลางจอ → `cancelAll()` + card lunge cleanup ต้อง reset transform+opacity+zIndex ทุกชิ้นเสมอ (บทเรียนเดียวกับ `els` cleanup เดิม)
4. **resize/rotate** — centers + ตำแหน่ง pool เพี้ยน → invalidate hook เดิมครอบ pool ด้วย
5. **Safari promote pool ไม่ครบ** — จิ๋วเกินจน WebKit ไม่ยอม promote → ตรวจ Layers inspector ตอน Phase 1 (ไม่เดา)
6. **one-way เท่านั้น** — FX ห้ามเขียนกลับเข้า reactive state: Vue → fx call ไม่มีขากลับ

## 9. Non-goals
- ไม่แตะ combat engine / log schema (`data/battle.js`, `utils/battleEngine.js`)
- ไม่ไป canvas/WebGL
- ไม่ทำ rAF timeline engine
- ไม่แตะ modal สรุป / inspect / controls (นอกจากถอด ephemeral refs ที่เกี่ยว)
