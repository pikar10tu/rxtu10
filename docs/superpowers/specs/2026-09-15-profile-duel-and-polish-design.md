# ProfileModal: ปุ่มท้าสู้กระชับมิตร + ปรับสถิติ/ติดต่อให้เข้าชุดกับการ์ด

**วันที่:** 2026-09-15
**ไฟล์ที่แตะ:** `src/components/members/ProfileModal.vue` (ไฟล์เดียว — ไม่มี composable/component ใหม่, ไม่มี schema/rules change)

## บริบท

ผู้ใช้รายงาน 2 เรื่องพร้อมกันจากการ์ดโปรไฟล์เพื่อน (`ProfileModal.vue`) ที่เปิดจาก `MembersView.vue`:

1. **สถิติไม่อัพเดต** — แก้ไปแล้วแยกต่างหาก (ไม่อยู่ในสโคปเอกสารนี้): `pf-stat` ตัว "PvP ชนะ" เคยอ่าน `view.pvpVictories` ซึ่งเป็นฟิลด์ตายที่ไม่มีใครเขียนอีกแล้วหลังรื้อระบบ PvP (ดู [[rxtu10-pvp-matchmaking]]) เปลี่ยนไปอ่าน `view.pvp?.wins` (ค่าของซีซั่นปัจจุบัน) พร้อมเปลี่ยน label เป็น "ชนะ (ซีซั่นนี้)" ให้ตรงความจริงว่าเป็นสถิติรายซีซั่น ไม่ใช่ตลอดชีพ
2. **อยากได้ปุ่ม "ท้าสู้" กระชับมิตร** ที่ไม่กระทบแต้ม PvP จริง + **อยากให้การ์ดทั้งใบสวยขึ้น** ไม่ใช่แค่ตัวปุ่ม — นี่คือสโคปของเอกสารนี้

ทั้งสองเรื่องถูกจดไว้ล่วงหน้าใน memory `rxtu10_profile_stale_and_unranked_duel` ตั้งแต่ 13 ก.ย. 2026 ระหว่างคุยเรื่องอื่น — คราวนี้ user สั่งให้ทำจริง

## ตัดสินใจแล้ว (คุยกับ user ผ่าน AskUserQuestion + mockup artifact)

- **รางวัล:** ไม่มีเลย — สนุกล้วนๆ ไม่แตะเหรียญ/แต้มทั้งสิ้น
- **โควตา:** ไม่จำกัดจำนวนครั้ง/วัน
- **ร่องรอย:** ดูจบแล้วหาย ไม่เก็บประวัติ/ข่าวกระดานที่ไหนเลย
- **ผลรวม 3 ข้อบน:** ฟีเจอร์นี้ทำงาน 100% ฝั่ง client, **ไม่มี Firestore write เกิดขึ้นเลย** ไม่ต้องมี quota/cooldown เพราะไม่มีต้นทุนจริงให้ป้องกัน
- **ตำแหน่ง/สไตล์ปุ่ม:** ตัวเลือก B จาก 3 แบบที่เทียบใน mockup — ชิปม่วงจิ๋ว (`--primary`) ชิดขวาของหัวข้อ "⭐ ทีมต่อสู้" ไม่ดันความสูงการ์ด (ตัวเลือก A เต็มแถบสีทอง / C แถบแดงไล่สี ถูกปัดตก — ดูเหตุผลใน mockup)
- **ปรับความสม่ำเสมอภาพรวม:** ครึ่งบนของการ์ด (hero / การ์ดความสำเร็จ / ทีมต่อสู้) ใช้ภาษาสติกเกอร์ (กรอบหมึก 2px + เงาแข็ง `--pop`) อยู่แล้ว ไม่แตะ — ที่แก้คือแถวสถิติกับส่วนติดต่อซึ่งเดิมเป็นคอลัมน์/แถวเรียบคั่นเส้นบาง หลุดโทนจากส่วนอื่น

Mockup ที่ใช้ตัดสินใจ (โค้ด/สี/ฟอนต์จริงจากแอป ที่ขนาด 400px เท่าของจริง): artifact `26b41a88-007a-4870-8b17-02837f8e4572`

## Design

### 1. แถวสถิติ — `pf-stats` → `pf-stats-v2`

จาก `display:flex` 3 คอลัมน์คั่นด้วย `border-right` บางๆ เปลี่ยนเป็น `display:grid` 3 ช่อง แต่ละช่องเป็นการ์ดจิ๋ว (เหมือน `.ach-item` ที่มีอยู่แล้วใน `AchievementGrid.vue`):
กรอบ `2px solid var(--ink)` + เงา `var(--pop)` + พื้นหลังสีอ่อนแยกหมวด (ทอง `rgba(255,176,32,.12)` = การต่อสู้ · ฟ้า `rgba(45,168,255,.12)` = หอคอย · มิ้นต์ `rgba(23,195,154,.12)` = สัตว์เลี้ยง) ตัวเลข/label เหมือนเดิมทุกประการ (ไม่เปลี่ยน data source)

### 2. ส่วนติดต่อ — `pf-contact` → `pf-contact-v2`

จากแถวข้อความเรียงตามแนวตั้ง (icon+text) เปลี่ยนเป็นชิปแคปซูล (`border-radius:999px`, กรอบ `1.5px solid var(--ink)`) จัดกึ่งกลางแบบ `flex-wrap` — ภาษาเดียวกับ `pf-chip`/`pf-tag`/`TagChips.vue` ที่ใช้อยู่แล้วบนหัวการ์ด แสดงเฉพาะช่องที่มีข้อมูล (เงื่อนไข `hasContact`/per-field เดิม ไม่เปลี่ยน)

### 3. ปุ่มท้าสู้ — ในหัวข้อ `pf-team-label`

เพิ่ม guard computed `canDuel`:
```
canDuel = view.uid !== myUid && showcase.length > 0
```
(`myUid` มาจาก `useAuthStore()` ที่ยังไม่ได้ import ใน component นี้ — ต้องเพิ่ม)
เมื่อ `canDuel` เป็นจริง แสดงปุ่มชิป `⚔️ ท้าสู้` มุมขวาบนของหัวข้อ "ทีมต่อสู้" (`position:absolute` ในบรรทัดเดียวกับ label เหมือนที่ mockup ทำ)

**Handler `startDuel()`:**
1. Guard: ถ้า `myTeam.length === 0` → `toast('จัดทีมก่อนนะ (อย่างน้อย 1 ตัว)', 'info')` แล้ว return (ทีมของ opponent การันตีว่าไม่ว่างอยู่แล้วจาก `canDuel`)
2. `myTeam = resolveBattleTeam(auth.userData?.activePets, auth.userData?.pets)` — ใช้ฟังก์ชันเดิมจาก `utils/petTeam.js` แบบเดียวกับ `useArena`/`useTower` (ความเสี่ยงเรื่อง legacy instId ถ้ามีเป็นความเสี่ยงที่มีอยู่แล้วทั่วแอปกับทีมตัวเอง ไม่ใช่สิ่งที่ฟีเจอร์นี้เพิ่มใหม่ — ไม่แก้ในสโคปนี้)
3. **ทีมฝั่งตรงข้าม — จุดที่ต้องระวังเป็นพิเศษ:** ต้องไม่ใช้ `resolveBattleTeam(view.activePets, view.pets)` ตรงๆ เพราะฟังก์ชันนั้น match เฉพาะ `inst.id`/`inst.species` ไม่ครอบคลุม `inst.instId` — ถ้า `activePets` ของอีกฝ่ายยังเป็น legacy instId (กรณีที่เคยเกิดจริงกับกระดาน PvP, memory `rxtu10-pvp-matchmaking`: "activePets เก็บ instId ไม่ใช่ species → ทีมผี") จะได้ทีมผี/common ทั้งทีม แทนที่ ให้แปลงจาก `showcase.value` ที่ component นี้ resolve ถูกต้องอยู่แล้ว (บรรทัด `showcase` ที่มีอยู่ match ทั้ง `p.id === id || p.instId === id`) มาเป็น battle unit เอง โดยเรียก `petSpeciesOf()` (จาก `utils/roster.js`) อีกชั้นกับ `p.id || p.species` เพื่อความปลอดภัยกรณี `.id` ที่เก็บไว้ยังเป็น instId-format (ตามที่ `buildRosterRow` ทำ):
   ```
   opponentTeam = showcase.value.map(p => {
     const species = petSpeciesOf(p.id || p.species)
     if (!species) return null
     const def = getPetDef(species) || {}
     return { id: species, rarity: p.rarity || def.rarity || 'common', element: def.element || 'scissors', grade: p.grade || 0 }
   }).filter(Boolean)
   ```
4. `simulateBattle(myTeam, opponentTeam, Date.now())` (จาก `utils/battleEngine.js` — ฟังก์ชันเดิมที่ Arena/Tower ใช้)
5. ประกอบ replay data (รูปแบบเดียวกับที่ `useArena.fight()` คืน แต่ไม่มีฟิลด์ที่อ้างถึงแต้ม/เหรียญ):
   ```
   {
     result, playerTeam: myTeam, botTeam: opponentTeam, won: result.winner === 'A',
     vsLabel: `กระชับมิตร VS ${view.value.nickname}`,
     winText: 'ชนะ! (ท้าสู้กันเอง ไม่กระทบแต้มประลอง)',
     loseText: 'แพ้ไปหน่อย (ท้าสู้กันเอง ไม่กระทบแต้มประลอง)',
   }
   ```
   ไม่ส่ง `rewardText`/`loseTip` (undefined) → `BattleReplay` ซ่อนบรรทัดรางวัลให้เองตามเงื่อนไขเดิมของมัน
6. เก็บผลลัพธ์ใน `ref` local เช่น `duelReplay` แล้วเปิด `<BattleReplay :data="duelReplay" theme="arena" @close="duelReplay = null" />` — เพิ่ม element ใหม่ใน template ของ `ProfileModal.vue` (import `BattleReplay` + `simulateBattle` + `resolveBattleTeam` + `petSpeciesOf`/`getPetDef`)

**ไม่มี Firestore write ใดๆ ในทั้ง flow นี้** — ปิด modal แล้วผลหายไปเลยตามที่ตกลงกัน

### Error handling

- ไม่มีทีม (ของเราเอง) → toast แจ้งแล้วไม่เปิด replay (ตาม pattern เดิมของ `useArena.fight`)
- อีกฝ่ายไม่มีทีม → ปุ่มไม่โผล่เลยตั้งแต่แรก (`canDuel` เป็นเงื่อนไข ไม่ใช่ error หลังกด)
- ดูตัวเอง (`view.uid === myUid`) → ปุ่มไม่โผล่

### Testing

ไม่มี test runner กลางในโปรเจกต์นี้ (ตรวจด้วย `npm run build` + ทดลองใน dev ตามที่ CLAUDE.md ระบุ) — ฟังก์ชัน pure ใหม่ (`opponentTeam` resolution) เล็กพอที่จะตรวจด้วยตาผ่าน dev server ได้ตรงๆ ไม่จำเป็นต้องแยกเป็น util+test ใหม่ เพราะ logic ทั้งหมดอยู่ใน component เดียวและ reuse ฟังก์ชัน pure ที่มี test คลุมอยู่แล้ว (`petSpeciesOf`, `resolveBattleTeam`, `simulateBattle`)

## Scope ที่ไม่แตะ

- `MembersView.vue` grid tile (`.mv-card`) — ไม่ใช่สิ่งที่ user หมายถึงตอนพูดว่า "member card" (ยืนยันจาก context บทสนทนา คือ `ProfileModal.vue`)
- ไม่แก้ ghost-team bug ที่มีอยู่แล้วกับทีมตัวเองใน `useArena`/`useTower` — อยู่นอกสโคป
- ไม่เพิ่ม quota/cooldown/reward pool ใดๆ ให้ดวลกันเอง (ตัดสินใจแล้วว่าไม่ต้องการ)
