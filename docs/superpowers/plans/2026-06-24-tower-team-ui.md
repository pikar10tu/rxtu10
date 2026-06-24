# Tower UI แฟนซี + จัดทีม + ดูรายละเอียดเพ็ท + รายได้หอคอย + admin reset — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** รื้อหน้าหอคอยให้แฟนซี "เป็นชั้นๆ" + จัดทีมผูก activePets ใช้ร่วมหอคอย/หน้าเพ็ท + กดดูรายละเอียดเพ็ท + โชว์รายได้หอคอยใน Home + ปุ่ม admin รีเซตชั้นหอคอยทุกคน

**Architecture:** UI ล้วน — ไม่แตะ engine/สมดุล/rules. เพิ่ม pure helper `floorZone()` + reuse `PetDetailModal`/`useTower`/`buildCombatant`/`residenceBattleSlots`. เขียน activePets ผ่าน `auth.patchUser`; admin reset = `writeBatch` ทุก user doc (rules `isAdmin()` อนุญาตอยู่แล้ว)

**Tech Stack:** Vue 3 (script setup, scoped CSS), Pinia, Firebase Firestore, `node --test`

## Global Constraints

- **UI ล้วน** — ห้ามแตะ `battleEngine.js`/สูตรรายได้/`firestore.rules`/schema Firestore
- เขียน user doc ของตัวเองผ่าน `auth.patchUser(optimistic, server)` เท่านั้น · admin เขียนของคนอื่นผ่าน writeBatch ตรงได้ (rules อนุญาต isAdmin)
- ทุก emoji ผ่าน `<Emoji :char="..."/>` (กัน tofu) — ห้าม emoji ดิบในเทมเพลต
- คอมเมนต์/commit ไทยปนอังกฤษ · commit `Area: อะไร (ทำไม)`
- pure util ห้าม import store/Firestore/Vue · ตรวจ `npm run build` ผ่านทุก task
- ทีมต่อสู้ = `residenceBattleSlots(residence.level)` (1..4) — **อย่าฮาร์ดโค้ด 4**
- element ids = `fist|scissors|paper` · `ELEMENTS[el].emoji` = ✊/✌️/✋

---

### Task 1: floorZone helper (towerFloors.js)

**Files:**
- Modify: `src/data/towerFloors.js`
- Test: `src/data/towerFloors.test.js`

**Interfaces:**
- Produces: `floorZone(floor) → { name, art, color, from, to }` (tier เดียวกับ getFloorTeam)

- [ ] **Step 1: เพิ่ม test** — เติมใน `src/data/towerFloors.test.js`:

```js
import { floorZone } from './towerFloors.js'

test('floorZone: ขอบเขตชั้นแมปโซนถูก', () => {
  assert.equal(floorZone(1).name, 'ลานประลอง')
  assert.equal(floorZone(12).name, 'ลานประลอง')
  assert.equal(floorZone(13).name, 'หอเวทเก่า')
  assert.equal(floorZone(25).name, 'หอเวทเก่า')
  assert.equal(floorZone(26).name, 'ปราการอสูร')
  assert.equal(floorZone(38).name, 'ปราการอสูร')
  assert.equal(floorZone(39).name, 'ยอดหอคอยมังกร')
  assert.equal(floorZone(50).name, 'ยอดหอคอยมังกร')
})
test('floorZone: clamp นอกช่วง', () => {
  assert.equal(floorZone(0).name, 'ลานประลอง')
  assert.equal(floorZone(999).name, 'ยอดหอคอยมังกร')
  assert.ok(floorZone(7).from === 1 && floorZone(7).to === 12)
})
```

- [ ] **Step 2: รัน test ดู fail**

Run: `node --test src/data/towerFloors.test.js`
Expected: FAIL — `floorZone is not a function`

- [ ] **Step 3: เพิ่ม helper** — ใน `src/data/towerFloors.js` ใต้ `getTowerBonus`:

```js
// floor → โซนแฟนซีตาม tier (UI หอคอย) — ช่วงเดียวกับ getFloorTeam (tier 12.5)
const ZONES = [
  { name: 'ลานประลอง',     art: '🛡️', color: '#84cc16', from: 1,  to: 12 },
  { name: 'หอเวทเก่า',      art: '🔮', color: '#60a5fa', from: 13, to: 25 },
  { name: 'ปราการอสูร',     art: '👹', color: '#c084fc', from: 26, to: 38 },
  { name: 'ยอดหอคอยมังกร', art: '🐉', color: '#fbbf24', from: 39, to: 50 },
]
export function floorZone(floor) {
  const f = Math.max(1, Math.min(TOWER_MAX, Math.floor(floor) || 1))
  return ZONES.find(z => f >= z.from && f <= z.to) || ZONES[ZONES.length - 1]
}
export const TOWER_BONUS_FLOORS = [10, 20, 30, 40, 50]  // ชั้นที่ getTowerBonus กระโดด (หมุดบนแถบ)
```

- [ ] **Step 4: รัน test ผ่าน**

Run: `node --test src/data/towerFloors.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/towerFloors.js src/data/towerFloors.test.js
git commit -m "Tower: floorZone() แมปชั้น→โซนแฟนซี + หมุดโบนัส (pure+test)"
```

---

### Task 2: TeamPicker อัปเกรด (battleSlots + แตะช่อง→detail + embed modal)

**Files:**
- Modify (rewrite): `src/components/battle/TeamPicker.vue`

**Interfaces:**
- Consumes: `auth.userData.activePets`, `residenceBattleSlots`, `PetDetailModal`
- Produces: BottomSheet จัดทีม — slots = battleSlots · แตะช่องมีตัว → เปิด PetDetailModal · แตะ pool → toggle

- [ ] **Step 1: Rewrite component**

```vue
<!-- TeamPicker — จัดทีม (= activePets, ช่อง = battleSlots ตามเลเวลบ้าน) ใช้ร่วมหอคอย+หน้าเพ็ท
     แตะช่องที่มีตัว = เปิด PetDetailModal (ดู/วิวัฒน์/ถอด) · แตะตัวในคลัง = สลับเข้า/ออกทีม -->
<template>
  <BottomSheet :open="open" icon="⚔️" title="จัดทีมต่อสู้" @update:open="$emit('update:open', $event)">
    <div class="tp-slots" :style="{ gridTemplateColumns: `repeat(${battleSlots}, 1fr)` }">
      <div v-for="(id, i) in slots" :key="i" class="tp-slot" :class="{ filled: id }" @click="id && (detailId = id)">
        <template v-if="id"><Emoji :char="defOf(id).emoji" /></template>
        <span v-else class="tp-empty">+</span>
      </div>
    </div>
    <div class="tp-hint">{{ filledCount }}/{{ battleSlots }} · แตะตัวในทีมเพื่อดู/ถอด · แตะคลังเพื่อสลับ</div>

    <div class="tp-pool">
      <button
        v-for="p in owned" :key="p.id"
        class="tp-pet" :class="{ active: activeIds.includes(p.id) }"
        :disabled="!activeIds.includes(p.id) && filledCount >= battleSlots"
        @click="toggle(p.id)"
      >
        <Emoji :char="defOf(p.id).emoji" />
        <span v-if="p.grade" class="tp-grade">{{ p.grade }}</span>
      </button>
      <div v-if="!owned.length" class="tp-none">ยังไม่มีเพ็ท — ไปเปิดกาชาที่ร้านค้าก่อนนะ</div>
    </div>

    <PetDetailModal :pet-id="detailId" @close="detailId = null" />
  </BottomSheet>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import BottomSheet from '../shared/BottomSheet.vue'
import PetDetailModal from '../pets/PetDetailModal.vue'
import { computed, ref } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { getPetDef } from '../../data/index.js'
import { residenceBattleSlots } from '../../data/residence.js'

defineProps({ open: { type: Boolean, default: false } })
defineEmits(['update:open'])

const auth = useAuthStore()
const detailId = ref(null)
const owned = computed(() => auth.userData?.pets || [])
const battleSlots = computed(() => residenceBattleSlots(auth.userData?.residence?.level || 1))
const ownedIds = computed(() => new Set(owned.value.map(p => p.id)))
// active เฉพาะตัวที่ยังครอบครอง ตัดให้ยาวไม่เกิน battleSlots
const activeIds = computed(() =>
  (auth.userData?.activePets || []).filter(id => id && ownedIds.value.has(id)).slice(0, battleSlots.value))
const slots = computed(() => {
  const a = activeIds.value.slice()
  while (a.length < battleSlots.value) a.push(null)
  return a
})
const filledCount = computed(() => slots.value.filter(Boolean).length)
const defOf = (id) => getPetDef(id) || { emoji: '❓' }

async function save(next) { await auth.patchUser({ activePets: next }, { activePets: next }) }
function toggle(id) {
  const cur = activeIds.value.slice()
  const at = cur.indexOf(id)
  if (at >= 0) cur.splice(at, 1)
  else { if (cur.length >= battleSlots.value) return; cur.push(id) }
  save(cur)
}
</script>

<style scoped>
.tp-slots { display: grid; gap: 8px; margin-bottom: 6px; }
.tp-slot { aspect-ratio: 1; border: 2px dashed rgba(0,0,0,.2); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; background: #f8fafc; }
.tp-slot.filled { border-style: solid; border-color: var(--ink); background: #eef2ff; cursor: pointer; }
.tp-empty { color: rgba(0,0,0,.25); font-size: 1.6rem; }
.tp-hint { font-size: .68rem; color: rgba(0,0,0,.45); text-align: center; margin-bottom: 12px; }
.tp-pool { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.tp-pet { position: relative; aspect-ratio: 1; border: 2px solid rgba(0,0,0,.12); border-radius: 12px; background: #fff; font-size: 1.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.tp-pet.active { border-color: var(--primary); background: #eef2ff; }
.tp-pet:disabled { opacity: .4; cursor: not-allowed; }
.tp-grade { position: absolute; bottom: 2px; right: 4px; font-size: .56rem; font-weight: 800; color: #b45309; }
.tp-none { grid-column: 1 / -1; text-align: center; font-size: .76rem; color: rgba(0,0,0,.4); padding: 16px 0; }
</style>
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: built สำเร็จ

- [ ] **Step 3: Manual (dev)** — เปิดจัดทีวที่หอคอย: ช่อง = battleSlots ตามเลเวลบ้าน · แตะตัวในคลัง = สลับ · แตะช่องมีตัว = เปิด PetDetailModal · เกิน slots กดไม่ได้

- [ ] **Step 4: Commit**

```bash
git add src/components/battle/TeamPicker.vue
git commit -m "TeamPicker: slots=battleSlots(แก้ฮาร์ดโค้ด4) + แตะช่อง→PetDetailModal(ฝังใน)"
```

---

### Task 3: TowerView redesign (climb strip + zone card + แตะทีม→detail + scout ศัตรู)

**Files:**
- Modify (rewrite): `src/views/TowerView.vue`

**Interfaces:**
- Consumes: `useTower` (floor,best,team,botTeam,bonus,fight,TOWER_MAX), `floorZone`, `TOWER_BONUS_FLOORS`, `ELEMENTS`, `buildCombatant`, `getPetDef`, `PetDetailModal`, `TeamPicker`, `BattleReplay`
- Produces: หน้าหอคอยใหม่ (แถบไต่ชั้น + การ์ดโซน + scout)

- [ ] **Step 1: Rewrite component**

```vue
<template>
  <div class="tab-content">
    <div class="page-title tw-head">
      <span><Emoji char="🏯" /> หอคอย</span>
      <RouterLink to="/play" class="tw-back">‹ กลับ</RouterLink>
    </div>

    <template v-if="authStore.isLoggedIn">
      <!-- แถบไต่ชั้น -->
      <div class="tw-climb">
        <div class="tw-climb-best">สูงสุด {{ best }} · ↑ {{ TOWER_MAX }}</div>
        <div class="tw-climb-row">
          <div v-for="n in climbFloors" :key="n" class="tw-chip"
               :class="{ cleared: n <= best, current: n === floor, locked: n > floor, milestone: isMilestone(n) }">
            <span v-if="isMilestone(n)" class="tw-chip-coin"><Emoji char="🪙" /></span>
            <span class="tw-chip-n">{{ n }}</span>
            <Emoji v-if="n < floor" char="✅" />
            <Emoji v-else-if="n === floor" char="⚔️" />
            <Emoji v-else char="🔒" />
          </div>
        </div>
      </div>

      <!-- การ์ดชั้นปัจจุบัน -->
      <div class="tw-card">
        <div class="tw-zone" :style="{ background: `linear-gradient(135deg, ${zone.color}, ${zone.color}bb)` }">
          <div class="tw-zone-art"><Emoji :char="zone.art" /></div>
          <div class="tw-zone-txt">
            <div class="tw-zone-name">{{ zone.name }}</div>
            <div class="tw-zone-floor">ชั้น {{ floor }} <span class="tw-zone-best">· สูงสุด {{ best }}</span></div>
          </div>
        </div>
        <div class="tw-bonus"><Emoji char="🪙" /> โบนัสรายได้ตอนนี้ +{{ bonus.toLocaleString() }}/วัน</div>

        <div class="tw-row">
          <span class="tw-label">ศัตรู</span>
          <span class="tw-team">
            <button v-for="(p, i) in botTeam" :key="i" class="tw-mon" @click="scout = p">
              <Emoji :char="defOf(p.id).emoji" />
            </button>
          </span>
        </div>
        <div class="tw-vs"><Emoji char="⚔️" /> VS</div>
        <div class="tw-row">
          <span class="tw-label">ทีมคุณ</span>
          <span class="tw-team">
            <template v-if="team.length">
              <button v-for="(p, i) in team" :key="i" class="tw-mon" @click="detailId = p.id">
                <Emoji :char="defOf(p.id).emoji" />
              </button>
            </template>
            <span v-else class="tw-empty">ยังไม่ได้จัดทีม</span>
          </span>
        </div>

        <div class="tw-actions">
          <button class="tw-edit" @click="pickOpen = true"><Emoji char="🛡️" /> จัดทีม</button>
          <button class="tw-fight" :disabled="busy || !team.length" @click="onFight">
            <Emoji char="⚔️" /> {{ busy ? 'กำลังสู้…' : `สู้ชั้น ${floor}` }}
          </button>
        </div>
        <div v-if="floor >= TOWER_MAX && best >= TOWER_MAX" class="tw-clear"><Emoji char="🏆" /> พิชิตหอคอยครบแล้ว!</div>
      </div>
    </template>
    <div v-else class="tw-login">เข้าสู่ระบบเพื่อเล่น</div>

    <TeamPicker v-model:open="pickOpen" />
    <BattleReplay :data="replay" @close="replay = null" />
    <PetDetailModal :pet-id="detailId" @close="detailId = null" />

    <!-- scout ศัตรู (read-only) -->
    <div v-if="scout" class="tw-scout" @click.self="scout = null">
      <div class="tw-scout-box">
        <div class="tw-scout-emoji"><Emoji :char="defOf(scout.id).emoji" /></div>
        <div class="tw-scout-name">{{ defOf(scout.id).name }}</div>
        <div class="tw-scout-row"><span>ธาตุ</span><b><Emoji :char="elEmoji(scout)" /> {{ elName(scout) }}</b></div>
        <div class="tw-scout-row"><span>ระดับ</span><b>{{ rarityLabel(scout) }} · เกรด {{ scout.grade || 0 }}</b></div>
        <div class="tw-scout-row"><span>พลังโจมตี</span><b>{{ scoutStat.atk }}</b></div>
        <div class="tw-scout-row"><span>พลังชีวิต</span><b>{{ scoutStat.hp }}</b></div>
        <button class="tw-scout-x" @click="scout = null">ปิด</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import Emoji from '../components/shared/Emoji.vue'
import { RouterLink } from 'vue-router'
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useTower } from '../composables/useTower.js'
import { getPetDef, ELEMENTS, RARITY } from '../data/index.js'
import { floorZone, TOWER_BONUS_FLOORS } from '../data/towerFloors.js'
import { buildCombatant } from '../data/battle.js'
import TeamPicker from '../components/battle/TeamPicker.vue'
import BattleReplay from '../components/battle/BattleReplay.vue'
import PetDetailModal from '../components/pets/PetDetailModal.vue'

const authStore = useAuthStore()
const { floor, best, team, botTeam, bonus, fight, TOWER_MAX } = useTower()
const defOf = (id) => getPetDef(id) || { emoji: '❓', name: '?' }

const pickOpen = ref(false)
const replay = ref(null)
const busy = ref(false)
const detailId = ref(null)
const scout = ref(null)

const EL_NAME = { fist: 'หมัด', scissors: 'กรรไกร', paper: 'กระดาษ' }
const zone = computed(() => floorZone(floor.value))
const isMilestone = (n) => TOWER_BONUS_FLOORS.includes(n)
const climbFloors = computed(() => {
  const start = Math.max(1, Math.min(TOWER_MAX - 5, floor.value - 1))
  const out = []
  for (let n = start; n < start + 6 && n <= TOWER_MAX; n++) out.push(n)
  return out
})
const elEmoji = (p) => ELEMENTS[p?.element]?.emoji || '✊'
const elName = (p) => EL_NAME[p?.element] || p?.element
const rarityLabel = (p) => RARITY[p?.rarity]?.label || p?.rarity
const scoutStat = computed(() => {
  if (!scout.value) return { atk: 0, hp: 0 }
  const c = buildCombatant(scout.value)
  return { atk: Math.round(c.atk), hp: Math.round(c.maxHp) }
})

async function onFight() {
  if (busy.value) return
  busy.value = true
  try { const r = await fight(); if (r) replay.value = r }
  finally { busy.value = false }
}
</script>

<style scoped>
.tw-head { display: flex; align-items: center; justify-content: space-between; }
.tw-back { font-size: .8rem; color: var(--muted); text-decoration: none; }

.tw-climb { background: #fff; border: 2px solid var(--ink); border-radius: 16px; padding: 10px 12px; box-shadow: var(--pop); margin-bottom: 12px; }
.tw-climb-best { font-size: .68rem; font-weight: 800; color: rgba(0,0,0,.5); margin-bottom: 6px; }
.tw-climb-row { display: flex; gap: 6px; }
.tw-chip { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 1px; padding: 6px 2px; border-radius: 10px; background: #f1f5f9; font-size: .9rem; position: relative; }
.tw-chip-n { font-size: .64rem; font-weight: 800; color: rgba(0,0,0,.55); }
.tw-chip.cleared { background: #dcfce7; }
.tw-chip.current { background: var(--gold); box-shadow: 0 0 0 2px var(--ink); }
.tw-chip.locked { opacity: .55; }
.tw-chip.milestone { outline: 2px dashed #f59e0b; outline-offset: -2px; }
.tw-chip-coin { position: absolute; top: -7px; right: -3px; font-size: .6rem; }

.tw-card { background: #fff; border: 2px solid var(--ink); border-radius: 18px; box-shadow: var(--pop); overflow: hidden; }
.tw-zone { display: flex; align-items: center; gap: 12px; padding: 14px 16px; color: #fff; }
.tw-zone-art { font-size: 2rem; }
.tw-zone-name { font-family: var(--font-display); font-size: 1.3rem; line-height: 1; }
.tw-zone-floor { font-size: .78rem; font-weight: 700; margin-top: 3px; }
.tw-zone-best { opacity: .8; font-weight: 600; }
.tw-bonus { font-size: .76rem; color: #b45309; font-weight: 700; padding: 10px 16px 0; }
.tw-row { display: flex; align-items: center; gap: 10px; padding: 8px 16px; }
.tw-label { font-size: .68rem; color: rgba(0,0,0,.45); width: 48px; flex-shrink: 0; }
.tw-team { display: flex; gap: 6px; flex: 1; flex-wrap: wrap; }
.tw-mon { border: none; background: rgba(0,0,0,.04); border-radius: 10px; font-size: 1.6rem; padding: 3px 5px; cursor: pointer; line-height: 1; }
.tw-mon:active { transform: scale(.92); }
.tw-empty { font-size: .76rem; color: rgba(0,0,0,.35); }
.tw-vs { text-align: center; font-weight: 800; font-size: .72rem; color: rgba(0,0,0,.3); display: flex; align-items: center; justify-content: center; gap: 4px; }
.tw-actions { display: flex; gap: 8px; padding: 6px 16px 16px; }
.tw-edit { border: 2px solid var(--ink); background: #fff; border-radius: 12px; padding: 12px; font-family: inherit; font-size: .82rem; font-weight: 800; cursor: pointer; box-shadow: var(--pop); display: flex; align-items: center; gap: 4px; }
.tw-edit:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.tw-fight { flex: 1; border: 2px solid var(--ink); border-radius: 12px; padding: 12px; font-family: inherit; font-size: .92rem; font-weight: 800; color: #fff; background: var(--primary); box-shadow: var(--pop); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; }
.tw-fight:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.tw-fight:disabled { background: #cbd5e1; cursor: default; box-shadow: none; }
.tw-clear { text-align: center; padding: 0 0 14px; font-weight: 800; color: #f59e0b; }
.tw-login { text-align: center; color: rgba(0,0,0,.4); padding: 30px 0; font-size: .85rem; }

.tw-scout { position: fixed; inset: 0; z-index: 240; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; padding: 18px; }
.tw-scout-box { background: #1e293b; color: #fff; border: 2px solid #fff; border-radius: 18px; padding: 16px 18px; width: 240px; display: flex; flex-direction: column; gap: 7px; }
.tw-scout-emoji { font-size: 2.8rem; text-align: center; }
.tw-scout-name { text-align: center; font-weight: 800; font-size: 1.1rem; margin-bottom: 4px; }
.tw-scout-row { display: flex; justify-content: space-between; align-items: center; font-size: .82rem; }
.tw-scout-row span { color: rgba(255,255,255,.6); }
.tw-scout-x { margin-top: 10px; border: 2px solid #fff; background: rgba(255,255,255,.14); color: #fff; border-radius: 12px; padding: 9px; font-family: inherit; font-weight: 800; cursor: pointer; }
</style>
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: built สำเร็จ

- [ ] **Step 3: Manual (dev)** — แถบไต่ชั้นถูก (current=gold ⚔️, ผ่าน=เขียว✅, ล็อก🔒, หมุด🪙 ชั้น10/20/…) · โซน/สีตามชั้น · แตะศัตรู→scout (ธาตุ/atk/hp) · แตะทีมคุณ→PetDetailModal · จัดทีม/สู้ ทำงาน

- [ ] **Step 4: Commit**

```bash
git add src/views/TowerView.vue
git commit -m "Tower: redesign Hybrid — แถบไต่ชั้น + การ์ดโซนแฟนซี + แตะทีม→detail/ศัตรู→scout"
```

---

### Task 4: PetsView — แถบ "ทีมต่อสู้"

**Files:**
- Modify: `src/views/PetsView.vue`

**Interfaces:**
- Consumes: `residenceBattleSlots`, `TeamPicker`, `activeSet`(มีอยู่), `sel`(มีอยู่ → PetDetailModal)
- Produces: แถบทีมเหนือ `pt-summary` + ปุ่มจัดทีม

- [ ] **Step 1: เพิ่ม import + state** — ใน `<script setup>` ของ `PetsView.vue`:

```js
import { residenceBattleSlots } from '../data/residence.js'
import TeamPicker from '../components/battle/TeamPicker.vue'
```
เพิ่มใต้ `const sel = ref(null)`:
```js
const pickOpen = ref(false)
const battleSlots = computed(() => residenceBattleSlots(authStore.userData?.residence?.level || 1))
const teamSlots = computed(() => {
  const owned = new Set(pets.value.map(p => p.id))
  const a = (authStore.userData?.activePets || []).filter(id => id && owned.has(id)).slice(0, battleSlots.value)
  while (a.length < battleSlots.value) a.push(null)
  return a
})
const defOf = (id) => PETS.find(p => p.id === id) || { emoji: '❓' }
```

- [ ] **Step 2: เพิ่มแถบทีมในเทมเพลต** — เหนือ `<div class="pt-summary">`:

```html
      <div class="pt-team">
        <div class="pt-team-head">
          <span><Emoji char="⚔️" /> ทีมต่อสู้ ({{ teamSlots.filter(Boolean).length }}/{{ battleSlots }})</span>
          <button class="pt-team-edit" @click="pickOpen = true">จัดทีม</button>
        </div>
        <div class="pt-team-slots" :style="{ gridTemplateColumns: `repeat(${battleSlots}, 1fr)` }">
          <div v-for="(id, i) in teamSlots" :key="i" class="pt-team-slot" :class="{ filled: id }" @click="id && (sel = id)">
            <template v-if="id"><Emoji :char="defOf(id).emoji" /></template>
            <span v-else class="pt-team-empty">+</span>
          </div>
        </div>
      </div>
```

- [ ] **Step 3: เพิ่ม TeamPicker ก่อนปิด template** — ข้างๆ `<PetDetailModal ...>`:

```html
    <TeamPicker v-model:open="pickOpen" />
```

- [ ] **Step 4: เพิ่ม CSS** — ใน `<style scoped>`:

```css
.pt-team { background: #fff; border: 2px solid var(--ink); border-radius: 16px; box-shadow: var(--pop); padding: 12px; margin-bottom: 10px; }
.pt-team-head { display: flex; align-items: center; justify-content: space-between; font-size: .8rem; font-weight: 800; margin-bottom: 8px; }
.pt-team-edit { border: 2px solid var(--ink); background: #fff; border-radius: 10px; padding: 5px 12px; font-family: inherit; font-size: .72rem; font-weight: 800; cursor: pointer; box-shadow: var(--pop); }
.pt-team-edit:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.pt-team-slots { display: grid; gap: 8px; }
.pt-team-slot { aspect-ratio: 1; border: 2px dashed rgba(0,0,0,.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; background: #f8fafc; }
.pt-team-slot.filled { border-style: solid; border-color: var(--ink); background: #eef2ff; cursor: pointer; }
.pt-team-empty { color: rgba(0,0,0,.25); font-size: 1.4rem; }
```

- [ ] **Step 5: Build + Manual**

Run: `npm run build` → สำเร็จ
Manual: หน้าเพ็ทมีแถบทีมบนสุด · จำนวนช่อง = battleSlots · แตะช่องมีตัว → PetDetailModal · ปุ่มจัดทีม → TeamPicker

- [ ] **Step 6: Commit**

```bash
git add src/views/PetsView.vue
git commit -m "Pets: แถบ 'ทีมต่อสู้' + ปุ่มจัดทีม (เปิด TeamPicker ร่วม)"
```

---

### Task 5: DailyCard — บรรทัดรายได้หอคอย

**Files:**
- Modify: `src/components/home/DailyCard.vue`

**Interfaces:**
- Consumes: `useDaily().towerBonus` (ส่งออกอยู่แล้ว)

- [ ] **Step 1: ดึง towerBonus** — แก้บรรทัด destructure ใน `<script setup>`:

```js
const { baseIncome, petIncome, towerBonus, bonusPct, buffActive, ratePerDay, ratePerHour, accrued, fillPct, isFull, remainingMs, claim } = useDaily()
```

- [ ] **Step 2: เพิ่มบรรทัดในเทมเพลต** — ใน `.dc-breakdown` หลังบรรทัด "สัตว์เลี้ยงในคลัง":

```html
      <div v-if="towerBonus" class="dc-row"><span><Emoji char="🏯" /> หอคอย</span><b>+{{ towerBonus.toLocaleString() }}/วัน</b></div>
```

- [ ] **Step 3: Build + Manual**

Run: `npm run build` → สำเร็จ
Manual: ผู้ที่ towerBest ≥ 10 เห็นบรรทัด 🏯 หอคอย ในรายได้ Home · ตัวเลขตรงกับ getTowerBonus

- [ ] **Step 4: Commit**

```bash
git add src/components/home/DailyCard.vue
git commit -m "Home: โชว์รายได้โบนัสหอคอยใน DailyCard breakdown"
```

---

### Task 6: Admin — ปุ่มรีเซตชั้นหอคอยทุกคน

**Files:**
- Modify: `src/views/AdminView.vue`

**Interfaces:**
- Consumes: `getDocs`,`collection`,`db`,`writeBatch`,`confirm`,`usage`,`toast` (import แล้วทั้งหมด)
- Produces: section + `resetTower()` (confirm + batch ทุก user, towerFloor→1 towerBest→0)

- [ ] **Step 1: เพิ่ม state + ฟังก์ชัน** — ใน `<script setup>` (ใกล้ฟังก์ชัน admin อื่น):

```js
const resettingTower = ref(false)
async function resetTower() {
  if (resettingTower.value) return
  const ok = await confirm('รีเซตชั้นหอคอยของผู้เล่นทุกคน?\n• towerFloor→1, towerBest→0\n• โบนัสรายได้หอคอยจะหายจนกว่าจะไต่ใหม่\n• เพ็ท/ทีม/เหรียญไม่ถูกแตะ')
  if (!ok) return
  resettingTower.value = true
  try {
    const snap = await getDocs(collection(db, 'users'))
    let batch = writeBatch(db), n = 0, total = 0
    for (const d of snap.docs) {
      batch.set(d.ref, { towerFloor: 1, towerBest: 0 }, { merge: true })
      n++; total++
      if (n >= 450) { await batch.commit(); batch = writeBatch(db); n = 0 }  // chunk กันเกิน 500
    }
    if (n > 0) await batch.commit()
    usage.track(snap.size, total)
    toast(`รีเซตหอคอย ${total} คนแล้ว`, 'success')
  } catch (e) { console.error('[resetTower]', e); toast('รีเซตไม่สำเร็จ', 'error') }
  finally { resettingTower.value = false }
}
```

- [ ] **Step 2: เพิ่ม section ในเทมเพลต** — วางใกล้ section admin อื่น (เช่นหลัง section สถิติการสู้):

```html
      <section class="admin-card">
        <div class="admin-card-head"><span><Emoji char="🏯" /> รีเซตหอคอย</span></div>
        <div class="admin-hint">ลาดเดอร์รายเดือน — ตั้งชั้นหอคอยทุกคนกลับชั้น 1 (โบนัสหายจนไต่ใหม่ · ไม่แตะเพ็ท/เหรียญ)</div>
        <button class="btn-mini" :disabled="resettingTower" @click="resetTower">
          {{ resettingTower ? 'กำลังรีเซต…' : 'รีเซตชั้นหอคอยทุกคน' }}
        </button>
      </section>
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: built สำเร็จ

- [ ] **Step 4: Manual (dev, ระวัง)** — เข้า Admin → กดรีเซต → ยืนยัน → เช็ค Firestore: towerFloor=1, towerBest=0 ของ users · (ทดสอบควรมี user ทดลอง ไม่ใช่ prod จริงตอนชั้นปีกำลังเล่น)

- [ ] **Step 5: Commit**

```bash
git add src/views/AdminView.vue
git commit -m "Admin: ปุ่มรีเซตชั้นหอคอยทุกคน (confirm + batch, ลาดเดอร์รายเดือน)"
```

---

## Deploy (หลังครบ — อนุมัติ)
0. **ก่อน push:** `node scripts/fetch-fluent.mjs` — โหลด Fluent emoji ที่เพิ่งเพิ่ม (โดยเฉพาะ 🔮 โซนหอเวท;
   ตัวอื่น 🐉👹🛡️🪙✅🔒✊✌️✋ มีแล้ว) แล้ว `git add public/emoji/fluent` commit รวม — กัน tofu
1. `git push origin master` — เว็บหลัก auto build+publish · **ไม่มี rules deploy** (ไม่แตะ rules)

## Self-review notes
- spec ส่วน 1→Task 1+3 · ส่วน 2→Task 2 · ส่วน 3→Task 3(scout/tower)+Task 4(pets) · ส่วน 4→Task 5 · ส่วน 5→Task 6
- battleSlots ใช้สม่ำเสมอ (TeamPicker/PetsView/PetDetailModal เดิม) — ไม่ฮาร์ดโค้ด 4
- ไม่แตะ engine/rules/สมดุล · ทุก emoji ผ่าน `<Emoji>`
- reset เฉพาะ 2 field (towerFloor/towerBest) — ยืนยันก่อน + chunk 450 กันเกิน batch limit
```
