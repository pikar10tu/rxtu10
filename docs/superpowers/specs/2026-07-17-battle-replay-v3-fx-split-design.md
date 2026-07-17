# BattleReplay v3 — Scene/FX Split (แก้กระตุก iOS Safari)

วันที่: 2026-07-17
สถานะ: design (อนุมัติทิศทาง + ผ่าน fable critical review รอบ 2 — แก้ครบ 8 จุด พร้อมแปลงเป็น implementation plan)
ที่ปรึกษาสถาปัตยกรรม: Fable
ไฟล์หลัก: `src/components/battle/BattleReplay.vue` (รื้อไส้) · `src/utils/battleFx.js` (ใหม่) · ไม่แตะ `data/battle.js` / `utils/battleEngine.js` / `components/shared/Emoji.vue`

## 1. ปัญหา & วินิจฉัย

หน้า battle กระตุกบน **iOS Safari (WebKit)** ตอนโจมตี (ลื่นบน Chrome) · ใช้ร่วม Tower + Arena/PvP · แก้มา 4 รอบไม่หาย (composite hp bar → cache centerOf + promote pop → promote box/glow → ถอด will-change ถาวร + ตัด hitstop)

**Diagnostic ชี้ขาด (เทสบน iPhone Safari จริง):**
- **โหมดลื่น (lite)** = ไม่มี `will-change` + ตัด motion/effect ทิ้งหมด (การ์ดอยู่กับที่ ไฮไลต์แค่ขอบ, เลข/หลอดเปลี่ยนทันที) → **ลื่น 60fps**
- **fix#4** = ไม่มี `will-change` ถาวร แต่คง motion เต็ม → **ยังกระตุก**

ทั้งขั้ว "มี layer ถาวร" (fix#3) และ "ไม่มี layer ถาวร" (fix#4) พังทั้งคู่ → **ปัญหาไม่ใช่ค่า knob (will-change) แต่คือ animate ผิดตัว** cost จริงต่อหมัด เรียงตามน้ำหนัก:

1. **(ตัวการหลัก) raster churn ของ DOM หนัก** — ทุกหมัดการ์ดจริง (`.br-unit` = `<img>` SVG ×2 + ข้อความ + border-radius ~90×90pt) โดน transform animate หลายรอบ (windup lift → acting lift → lunge → เป้า shake) พอไม่มี layer ถาวร WebKit ต้อง promote ชั่วคราว = rasterize การ์ดทั้งใบ @DPR3 → จบ animation demote = raster กลับ parent อีก + `::after` glow (box-shadow blur 18px = raster แพงมากใน WebKit) promote/demote อีกชุด → **~6–10 raster event/หมัด อัดใน ~600ms** (นี่คือเหตุผลที่ 1v1 = 3v3)
2. **element churn ของ ephemeral** — `.br-pop`/`.br-proj`/`.br-call` เกิด-ตายผ่าน v-for ทุกหมัด แต่ละตัวมี will-change → สร้าง layer + raster stroked text + ทำลาย layer ต่อหมัด (ไม่เคย reuse)
3. **(รอง) Vue re-render churn** — spread `hp`/`pops`/`callouts` + toggle `acting`/`winding`/`flashing` = re-render component ทั้งใบ (30+ `<Emoji>` diff) ~6–8 ครั้ง/หมัด (2–5ms/ครั้ง) เบียด main thread ช่วงเดียวกับ raster → เฟรมตึงหลุด

**บทสรุป:** เราเอา motion ไปแขวนกับ DOM ที่แพงสุดในจอ (การ์ดเต็มใบ + เงา blur) แล้วสร้าง/ทำลายใหม่ทุกหมัด · lite mode = existence proof ว่า DOM + Vue รัน workload นี้ที่ 60fps ได้ ถ้าคุม paint เป็น → **ไม่ใช่ปัญหาที่ต้องหนีไป canvas**

## 2. หลักการออกแบบ (doctrine ของไฟล์นี้)

1. **ฉาก (Scene) นิ่ง** — การ์ด/หลอด/เลข/ป้าย = static layout ตลอดไฟต์ เปลี่ยนได้แค่ discrete state ที่ lite พิสูจน์แล้วว่าถูก: `border-color`, ตัวเลข, `scaleX` หลอดเลือด, `opacity` ตอนตาย · **ข้อยกเว้นเดียว = melee card lunge (§2 ท้าย) — การ์ดขยับได้ 1 promotion window/หมัดเท่านั้น**
2. **Motion เกือบทั้งหมดอยู่ใน FX pool** — overlay ชั้นเดียว (`pointer-events:none`) element จิ๋วจำนวนคงที่ ~8–10 ชิ้น **สร้างครั้งเดียว/ไฟต์ promote ถาวร reuse ตลอด** (ชิ้นเล็ก texture memory จิ๊บจ๊อย ไม่ชน layer budget ที่ฆ่า fix#3 ซึ่งเป็น 25 layer *การ์ดเต็มใบ*) · promote ถาวร = raster จ่ายครั้งเดียวต่อ content change ไม่ใช่ต่ออนิเมชัน
3. **ของอายุ < 1 วิ ห้ามอยู่ใน Vue reactivity** — pops/callouts/projectiles/acting/winding/flashing ออกจาก refs ทั้งหมด → imperative (FX pool + `classList` ผ่าน `els` map เดิม) · Vue เหลือ: layout ฉาก, `hp`/dead, modal, inspect, controls

### ⚠️ ข้อยกเว้นที่ user เลือก: เก็บ "การ์ดพุ่งจริง" (Hearthstone) สำหรับ melee

user ต้องการคงฟีลการ์ดพุ่งชน → **melee = การ์ดจริงพุ่ง out-and-back** (windup/glow/shake/เลข ย้ายไป FX pool หมด, การ์ดเหลือ motion เดียวคือ lunge)

**ข้อบังคับ implementation (ไม่งั้นวนกลับ fix#4):**
- lunge = **`el.animate()` อันเดียว keyframes out-and-back (`fill:'none'`)** — ห้ามแยกขาไป/ขากลับเป็น 2 animation (จะได้ promote/demote ×2) · ได้ **1 promotion window ≈ 2 raster event/หมัด** (raster ตอน promote + reintegrate ตอน demote) — ไม่ใช่ "1 raster" อย่าขายเกินจริง
- keyframes = **`transform` เท่านั้น** · `z-index` (ยกการ์ดขึ้นบนสุด) set แบบ static ก่อนเริ่ม / เคลียร์หลังจบ **ไม่อยู่ใน keyframes** (ไม่งั้นหลุด accelerated path) · z-order ถาวร: **FX layer > lunging card > การ์ดปกติ**
- **ห้ามแตะ paint property ของการ์ดระหว่าง lunge** — เปลี่ยน border/class ของ attacker ให้เสร็จ **ก่อน** สั่ง animate (เฟรมเดียวกันได้ ห้ามกลางทาง) ไม่งั้น re-raster กลาง animation
- **`cardLunge` เป็นของ `battleFx` ไม่ใช่ component** (`fx.cardLunge(el, fromUid, toUid)`) — ใช้ centers/rate ร่วม + โดน `cancelAll()` เก็บกวาด registry เดียว (WAAPI `cancel()` คืน transform อัตโนมัติ เหลือแค่เคลียร์ zIndex)

**ความเสี่ยง (พูดตรง):** การ์ดพุ่ง = ตัวที่แพงสุดที่ user ขอเก็บ ควรไหวเพราะเหลือ 1 window/หมัด แต่รับความเสี่ยงที่เหลือมากสุด
**Plan B = flag ไม่ใช่ rebuild:** `fx.dash(fromUid,toUid,char)` (sprite เพ็ทพุ่งเข้าฟาด composite ล้วน) อยู่ใน API ตั้งแต่แรก · melee mode = runtime flag (`?melee=card|dash` หรือ const เดียว) → Phase 3 = A/B บนเครื่องจริงโดยไม่ต้อง rebuild/redeploy

**เกณฑ์ fps ตัดสิน (scenario: 4v4 melee-หนัก, วัดทั้ง ×1 และ ×4 — ×4 = promote/demote ถี่สุด, วัดเฉพาะช่วง combat ตัด intro/modal-in ที่ spike ปกติ):**
- **ผ่าน (คง card lunge):** badge เขียวตลอด หรือเหลือง (17–33ms) นานๆ ครั้งไม่รู้สึกสะดุด
- **สอบสวนก่อนโทษ:** เหลืองเป็น cluster ทุกหมัด melee → เปิด Safari Layers inspector ดูว่า raster correlate กับ lunge ไหม · bisect ด้วยปิด ring/pop ชั่วคราว (มีชิ้นใหม่หลายตัว อย่าเหมาว่า lunge ผิดทันที)
- **ถอยไป dash:** แดง (>33ms) ซ้ำๆ ตรงจังหวะ melee **และ** Layers ยืนยันการ์ดคือตัว raster หนัก → พลิก flag เป็น `dash`

## 3. FX Pool — สเปก (`src/utils/battleFx.js`, plain JS ไม่พึ่ง Vue)

ย้าย `centerOf`/`invalidateCenters` (centers cache) เข้ามาอยู่ด้วย (เป็นของ FX) · pool element = `<img>` ผ่าน `fluentFile()` ตรง (ไม่ผ่าน Emoji.vue) ตั้ง `loading="eager"` + `decoding="sync"`

```
createBattleFx() → fx {
  attach({ boxEl, getEl })      // getEl: uid → cardEl (จาก els map); fx เป็นเจ้าของ resize/orientation listener เอง
  reset()                       // invalidateCenters + cancelAll + ซ่อน pool ทุกชิ้น (เรียกตอนไฟต์ใหม่)
  setRate(s)                    // ตัวคูณ speed ของ motion animation ที่ "สร้างใหม่" เท่านั้น (ไม่ยุ่ง pop/callout)
  cancelAll()                   // cancel ทุก anim + คืน transform + opacity 0 ทุก pool el + เคลียร์ lunge zIndex
  destroy()                     // ถอน listener + ลบ DOM (ตอน component unmount)
  ring(uid, phase)              → Promise   // ไฮไลต์ acting/windup (แทน glow ::after เดิม)
  cardLunge(el, fromUid, toUid) → Promise   // melee: การ์ดจริงพุ่ง out-and-back (ดู §2)
  dash(fromUid, toUid, char)    → Promise   // plan B melee: sprite เพ็ทพุ่ง (composite ล้วน)
  projectile(fromUid, toUid, char) → Promise
  burst(uid)                    → Promise   // 💥 impact (แทน shake การ์ด)
  pop(uid, {dmg, crit, eff})                // เลขดาเมจ (pool วนใช้)
  callout(uid, kind)                        // แพ้ทาง/ต้านทาน (pool)
  koPuff(uid)                               // 💀
}
```

### สัญญา/ข้อบังคับ (contract)

- **mount contract กับ Vue:** template จอง `<div class="br-fx-layer" ref="fxLayerEl"></div>` **เปล่า (ไม่มี vnode ลูก)** ใน `.br-box` · battleFx เติม/จัดการ children ข้างในเท่านั้น → Vue ไม่มีวันแตะ (กัน patch ชน) · `v-if="data"` ที่ root = overlay unmount ได้ → lifecycle: `watch(data)` → `fx.reset()`/re-attach, `onUnmounted` → `fx.destroy()`
- **🔴 CSS ของ FX ต้อง "ไม่ scoped":** element ที่สร้าง imperative ไม่มี `data-v-*` → `<style scoped>` ไม่ apply · FX styles อยู่ใน `<style>` block แยก (ไม่ scoped) ใน BattleReplay.vue namespace **`.brfx-*`** (กันชน global) — ไม่งั้น pop โผล่เป็น text เปล่าไร้ stroke/สี
- **🔴 fx promise resolve เสมอ ไม่มีวัน reject** — WAAPI `finished` reject ตอน `cancel()` → ต้องห่อ `finished.catch(()=>{})` ทุกตัว · gen guard ใน sequencer เป็นคนตัดสินไปต่อ ไม่ใช่ rejection
- **pool ขยับด้วย transform เท่านั้น** — ทุกชิ้น position `0,0`, offset สุ่มของ pop (เดิมใช้ `marginLeft`) ไป bake ใน `translate` · ห้ามแตะ layout property ใดๆ (กัน layout invalidation บน layer)
- **resolve เฉพาะ uid ของไฟต์ปัจจุบัน** — `els` map เดิมไม่ prune uid เก่า (4v4→1v1 มี stale) → fx เช็ค getEl คืน el ที่มีจริงเท่านั้น
- pool ทุกชิ้น font-size/class คงที่ต่อชนิด (กัน layout ตอนเปลี่ยน text)

### mapping เอฟเฟกต์เก่า → ใหม่

| เดิม | ใหม่ | card raster/หมัด |
|---|---|---|
| windup: การ์ดเอน+ลอย | **ring FX** เกาะการ์ด + border เหลือง (classList) | 0 |
| glow `::after` blur | ring = radial-gradient วาดครั้งเดียว animate opacity | 0 |
| melee lunge การ์ดพุ่งทั้งใบ | **คงไว้ (Hearthstone)** — `fx.cardLunge` WAAPI 1 window/หมัด | ~2 raster (promote+demote) |
| projectile (สร้าง/ทำลาย) | pooled sprite swap src + animate | 0 |
| shake การ์ดเป้า | **border แดงวาบ** (classList) + **burst 💥** | 0 |
| pop เลข (v-for เกิด-ตาย) | pooled set text → animate | 0 (raster ข้อความจิ๋วครั้งเดียว/ป็อป) |
| callout / 💀 | pooled | 0 |

pop: **คง text-stroke** (raster ตอนเปลี่ยน content ไม่ใช่ทุกเฟรม) · **ตัด `text-shadow` ทิ้ง** (stroke พอ) · pool ×4 — policy ตอน ×4 speed หมัดถี่: **วนทับตัวเก่าสุด** (อ่านทัน) ถ้าเทสแล้วชนบ่อยเพิ่มเป็น 6

## 4. Sequencer — ขับจังหวะ

**ไม่ทำ rAF timeline engine** (workload = 1 attack sequential/~380ms) — คงโครง `step()`/dispatch เดิม เปลี่ยนไส้เป็น promise chain:

```js
async function applyAttack(e) {
  const g = gen
  highlight(e.attacker, 'windup')                 // classList ตรง (ไม่ผ่าน ref)
  await fx.ring(e.attacker, 'windup')             // resolve → ถอด class windup
  if (g !== gen) return
  highlight(e.attacker, 'acting')
  const el = getEl(e.attacker)
  await (isRanged(e) ? fx.projectile(...) : (meleeMode === 'dash' ? fx.dash(...) : fx.cardLunge(el, e.attacker, e.target)))
  if (g !== gen) return
  applyImpact(e)   // hp.value (reactive เดียว) + fx.pop + fx.burst + fx.callout + fx.koPuff + highlight(target,'flash')
  if (e.crit) await wait(REPLAY_CFG.hitStopMs / speed.value)   // crit freeze (เหลือหลังตัด box scale) — ถอด class acting หลัง impact
}
```

- **timing reconcile:** โครงเดิมคำนวณ `delay+windup+motion+hitStop` ล่วงหน้าเป็นเลขแล้ว setTimeout → world ใหม่เปลี่ยนเป็น **`await` handler จบ → เว้น `baseDelay/speed` → step ถัดไป** · `idx.value++` เกิด **หลัง** handler resolve · `round`/`end` ยัง no-delay เหมือนเดิม
- **hitStopMs (freeze ตอน crit):** คง — เป็น crit feedback ที่เหลือหลังตัด box scale · อยู่ในรูป `await wait()` ท้าย chain (ดู pseudocode)
- **speed:** `fx.setRate(s)` คูณตอน**สร้าง** motion animation ใหม่เท่านั้น (ring/lunge/dash/projectile/burst) — **ไม่แตะ pop/callout** (คง behavior เดิม บรรทัด 144: `popMs` คงที่ อ่านเลขทันแม้ ×4) · **ไม่ทำ "เปลี่ยน rate กลางคัน"** (YAGNI + Safari edge)
- **highlight class removal (ต้องระบุใครถอดเมื่อไหร่ กัน class ค้าง):** `windup` ออกเมื่อ ring resolve · `acting` ออกหลัง impact · `flash` ออกด้วย timer ~250ms (gen-guarded)
- **gen guard คงเดิม** + `fx.cancelAll()` ใน reset/skip · **pause** = semantics เดิม (จบหมัดปัจจุบันแล้วหยุด step ถัดไป ไม่ pause กลาง animation) · `baseDelay` ระหว่างหมัด = setTimeout ต่อได้
- **Vue หลังรื้อ:** ต่อหมัดเหลือ reactive write เดียว (`hp`) → re-render 1 ครั้ง · `unitClass` เหลือแค่ `dead`

## 5. คง / ตัด / ถูกลง

- **คง:** intro READY/GO · modal สรุป+MVP · inspect popover (hit-test การ์ด DOM ยังอยู่) · controls · หลอดเลือด `scaleX` transition · ticks · dead state · **melee card lunge (Hearthstone)** · โครง log/engine (ไม่แตะ battle.js)
- **ตัด:** transform บนการ์ด *ยกเว้น lunge* (windup lean, acting lift, shake) · `::after` glow · `transition: transform` บน `.br-unit` (เหลือ `border-color` เท่านั้น) · CSS lite override ส่วนใหญ่
- **lite mode ใหม่ = ปิดเฉพาะ *motion* (ring/lunge/dash/projectile/burst) เท่านั้น** — 🔴 **pop/callout ยังโชว์** (static: opacity toggle + timer ลบ, ไม่มี animate) เพราะ **เลขดาเมจ = information ไม่ใช่ decoration** (lite เดิมก็โชว์เลขนิ่งๆ) · คง lite เป็น fallback + ผูก `prefers-reduced-motion` → auto-lite
- **preload:** ตอน intro โหลด+decode **หน้าเพ็ททุกตัวในไฟต์** (dash ใช้) + ⚡🛡️💀💥 + projectiles — ไม่ใช่แค่ projectile เหมือน `preloadProjectiles` เดิม (กัน `decoding="sync"` บล็อกเฟรมตอน swap src ครั้งแรก)

## 6. ทำไมไม่ canvas (ยืนยันอีกครั้ง)

diagnostic ชี้ศัตรู = raster churn ของ DOM หนัก + reactivity churn = **"จัด DOM ผิด" ไม่ใช่ขีดจำกัด DOM** · lite mode พิสูจน์ว่า DOM+Vue รัน 60fps ได้ · canvas บังคับ: pre-raster SVG→ImageBitmap เอง, เขียน layout เอง, เสีย hit-test แตะ inspect, เสีย text ไทย + a11y, และ modal/inspect ยังเป็น DOM → **คนเดียวแบก 2 rendering system** · **เกณฑ์ล้มสมมติฐาน:** ถ้า ship FX-pool แล้ว fps ยังแดงตอน melee ทั้งที่ Layers inspector ยืนยันทุกอย่าง composite ล้วน → ค่อยคุย canvas *เฉพาะชั้น FX* (ไม่มีวันทั้งจอ)

## 7. Migration (incremental — เทส iPhone จริงทุก phase)

- **Phase 0 (~0.5 วัน):** preload/eager+decode หน้าเพ็ท+ไอคอน combat ทั้งชุด + ตัด `text-shadow` จาก pop — ship เดี่ยวได้เลย ไม่เสี่ยง (เก็บ perf ฟรี)
- **Phase 1 (~1 วัน):** เขียน `battleFx.js` + ย้าย centers cache เข้าไป + FX styles (ไม่ scoped `.brfx-*`) · **dev harness ชั่วคราว** (route ซ่อน หรือปุ่ม dev ใน Arena ยิง fx ทุกชนิดวนๆ) เพื่อเปิด Safari Layers inspector ดูบน iPhone จริงว่า pool promote ครบ ก่อนเข้า Phase 2
- **Phase 2a (~0.5 วัน):** ย้าย ephemeral (pops/callouts/projectiles) → fx pool + highlight (acting/windup/flash) → classList · **ยังไม่แตะ card motion เดิม** · build+เทส (ถ้า perf ถดถอยรู้ว่าครึ่งนี้ผิด)
- **Phase 2b (~0.5 วัน):** ถอด card transforms (windup lean/acting lift/shake + `::after`) + melee = `fx.cardLunge` WAAPI + ring · **acceptance: Safari Layers inspector ระหว่าง melee ต้องเห็น layer เพิ่มแค่ 1 ใบ (การ์ด lunge) และหายทันทีที่จบ** นอกนั้น pool คงที่ (พิสูจน์ว่าไม่หลุดกลับ fix#4 — ไม่รอ Phase 3)
- **Phase 3 (~0.5 วัน):** จูน juicy (lunge+burst+ring) กับ user บนจอจริง · **วัด `?fps=1` ตัดสิน card-lunge vs dash (flag)** · **flip default มือถือกลับเป็น full** (precedence: user localStorage choice > `prefers-reduced-motion` > default) · ลบโค้ดตายชี้ชื่อ selector: `.br-pop/.br-proj/.br-call` will-change + v-for markup + lite override block เดิม
- รวม **~3 วัน** · แต่ละ phase revert อิสระ · lite = safety net ตลอด

## 8. จุดเสี่ยง & cleanup checklist

**skip/reset cleanup (ลำดับ):** `gen++` → `clearTimeout(timer)` → `fx.cancelAll()` (ทุก pool: cancel anim + opacity 0 + คืน transform; cancel lunge + เคลียร์ zIndex การ์ด) → ถอด class `windup/acting/flash` ออกจาก els ทุกตัว (highlight = classList ไม่มี reactive เก็บกวาดให้) → set hp/round final · **toggleLite กลางไฟต์** (ปุ่มใน `.br-ctrl` กดได้ตลอด) = `fx.cancelAll()` + เคลียร์ lunge **ก่อน** สลับ flag (เดิม cleanup อยู่บรรทัด 169 — อย่าทำหล่น)

**จุดเสี่ยงพลาด (เรียงตามโอกาส):**
1. **หลุดกลับ fix#4 ระหว่าง Phase 2** — DoD Phase 2: `getComputedStyle(.br-unit).transform === 'none'` ทุก state (ยกเว้นระหว่าง lunge) + `.br-unit` ไม่มี `transition: transform` + Layers inspector เห็น +1 layer/melee แล้วหาย
2. **card lunge ยังกระตุก** — Phase 3 วัด fps ก่อนถอน dash fallback ทิ้ง (อย่า commit ลบ plan B จนวัดผ่าน)
3. **Visual acceptance** — โชว์ Phase 3 บนจอจริงก่อนถือว่าจบ
4. **resize/rotate** — fx เป็นเจ้าของ invalidate (centers + ตำแหน่ง pool) เอง
5. **Safari promote pool ไม่ครบ** (จิ๋วเกิน) — ตรวจ Layers inspector ตอน Phase 1 (ไม่เดา)
6. **one-way เท่านั้น** — FX ห้ามเขียนกลับเข้า reactive state: Vue → fx call ไม่มีขากลับ

## 9. Non-goals
- ไม่แตะ combat engine / log schema (`data/battle.js`, `utils/battleEngine.js`)
- ไม่ไป canvas/WebGL · ไม่ทำ rAF timeline engine
- ไม่แตะ modal สรุป / inspect / controls (นอกจากถอด ephemeral refs ที่เกี่ยว)
- ไม่ทำ WAAPI "เปลี่ยน playbackRate กลางคัน" (YAGNI)
