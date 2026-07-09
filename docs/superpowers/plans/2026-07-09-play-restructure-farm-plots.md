# Play Restructure + Farm Plot-Unlock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** จัดหมวดหน้า Play เป็น hub 2 ชั้น (โหมดเพ็ท / โหมดฟาร์ม + มินิเกม) และเปลี่ยนฟาร์มให้เริ่ม 1 แปลง แล้วซื้อปลดแปลงเพิ่มด้วยเหรียญ (เพดานตามเลเวลบ้าน)

**Architecture:** เพิ่มหน้า hub 2 หน้า (`PetHubView` `/play/pets`, `FarmView` `/play/farm`) โดยไม่แตะ view เกมเดิม — แค่ย้าย "ทางเข้า" มารวมศูนย์ · ฟาร์มย้ายจาก modal เป็นหน้าเต็ม (ได้ padding จาก `#main-content` เลี่ยงกับดัก z-index/stacking-context ของ sheet เดิม) · ตรรกะราคาปลดแปลงเป็น pure function ใน `data/farmPlots.js` (เทสได้) แล้ว `useFarm` ผูกกับ auth store

**Tech Stack:** Vue 3 (SFC + `<script setup>`, scoped style) · Pinia (auth store) · Firebase Firestore (`patchUser` optimistic + increment) · vue-router (hash history) · node:test (เทส pure utils)

## Global Constraints

- **เขียน user doc ผ่าน `auth.patchUser(optimistic, server)` เท่านั้น** — `optimistic` = ค่า local ตรงๆ, `server` = Firestore patch (ใช้ `increment()` ได้) · คืน boolean, caller เป็นคน toast
- **ไม่แตะ view เกมเดิม** (`PetsView` `/pets`, `ShopView` `/shop`, `TowerView` `/tower`, `ArenaView` `/arena`, `ExpeditionView` `/expedition`), ไม่แตะ engine, ไม่แตะ firestore.rules (field `farm.plotsUnlocked` เป็น sub-field ของ `users/{uid}` ที่เจ้าของเขียนได้อยู่แล้ว)
- **สไตล์:** SFC + scoped style · คอมเมนต์/commit ไทยปนอังกฤษ · commit รูปแบบ `Area: อะไร (ทำไม)` · โทน copy ยึด docs/voice-guide.md
- **เทส:** เฉพาะ pure utils รันด้วย `node --test src/<path>.test.js` · ไม่มี test framework สำหรับ component → verify ด้วย `npm run build`
- **เพดานแปลง:** ใช้ `residencePlots(level)` เดิม (Lv1=4 … Lv12=12) เป็น "เพดานสูงสุดที่ปลดได้"
- **MAX_PLOTS = 12** (เท่าเพดานเลเวลบ้านสูงสุดที่ปล่อย)

---

## File Structure

**สร้างใหม่:**
- `src/data/farmPlots.js` — ตารางราคา `PLOT_UNLOCK_COST` + pure helpers `plotUnlockCost()` / `nextPlotInfo()` / `MAX_PLOTS`
- `src/data/farmPlots.test.js` — เทสตรรกะราคา/ปลดแปลง
- `src/components/farm/FarmShop.vue` — พาเนล "ร้านค้าฟาร์ม" (ปุ่มปลดแปลง + สถานะเพดาน)
- `src/views/FarmView.vue` — หน้าเต็มโหมดฟาร์ม (ห่อ `FarmGrid` + `FarmShop`)
- `src/views/PetHubView.vue` — หน้าเมนูรวมเกมที่ใช้เพ็ท

**แก้:**
- `src/data/userSchema.js` — เพิ่ม `farm.plotsUnlocked` default 1
- `src/data/userSchema.test.js` — เทส default/normalize ของ field ใหม่
- `src/composables/useFarm.js` — `ceiling`/`plotsUnlocked`/`plotCount`(=min)/`nextPlot`/`unlockPlot()`
- `src/router/index.js` — เพิ่ม 2 route
- `src/views/PlayView.vue` — รื้อเป็น landing (2 hero card + section มินิเกม), ถอด farm modal
- `src/data/guide.js` — อัปเดต help topic `play` + `farm`

---

### Task 1: ตารางราคาปลดแปลง + pure logic (`data/farmPlots.js`)

**Files:**
- Create: `src/data/farmPlots.js`
- Test: `src/data/farmPlots.test.js`

**Interfaces:**
- Consumes: (ไม่มี — pure data)
- Produces:
  - `MAX_PLOTS = 12` (number)
  - `PLOT_UNLOCK_COST` — array index ตามหมายเลขแปลง (index 0 ไม่ใช้, [1]=0 ฟรี, [2..12]=ราคา)
  - `plotUnlockCost(plotNumber: number): number | null` — ราคาซื้อ "แปลงลำดับที่ plotNumber"; คืน null ถ้า plotNumber < 1 หรือ > MAX_PLOTS
  - `nextPlotInfo({ plotsUnlocked, ceiling, coins }): { canUnlock: boolean, reason: 'ok'|'atCeiling'|'maxed'|'notEnoughCoins', nextPlot: number|null, cost: number|null }`

- [ ] **Step 1: เขียนเทสที่ล้มก่อน**

Create `src/data/farmPlots.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MAX_PLOTS, PLOT_UNLOCK_COST, plotUnlockCost, nextPlotInfo } from './farmPlots.js'

test('MAX_PLOTS = 12 เท่าเพดานเลเวลบ้านสูงสุด', () => {
  assert.equal(MAX_PLOTS, 12)
})

test('แปลงที่ 1 ฟรี, ราคาแพงขึ้นเรื่อยๆ (strictly increasing)', () => {
  assert.equal(plotUnlockCost(1), 0)
  let prev = plotUnlockCost(2)
  for (let n = 3; n <= MAX_PLOTS; n++) {
    const c = plotUnlockCost(n)
    assert.ok(c > prev, `แปลง ${n} (${c}) ต้องแพงกว่าแปลง ${n - 1} (${prev})`)
    prev = c
  }
})

test('แปลงช่วงต้นราคาถูกตามดีไซน์ (2=100, 3=300)', () => {
  assert.equal(plotUnlockCost(2), 100)
  assert.equal(plotUnlockCost(3), 300)
  assert.equal(plotUnlockCost(12), 700000)
})

test('plotUnlockCost นอกช่วง → null', () => {
  assert.equal(plotUnlockCost(0), null)
  assert.equal(plotUnlockCost(13), null)
  assert.equal(plotUnlockCost(-1), null)
})

test('nextPlotInfo: ปลดได้เมื่อยังไม่ชนเพดาน & เงินพอ', () => {
  const info = nextPlotInfo({ plotsUnlocked: 1, ceiling: 4, coins: 500 })
  assert.equal(info.canUnlock, true)
  assert.equal(info.reason, 'ok')
  assert.equal(info.nextPlot, 2)
  assert.equal(info.cost, 100)
})

test('nextPlotInfo: เงินไม่พอ → notEnoughCoins (canUnlock=false แต่ยังบอก cost)', () => {
  const info = nextPlotInfo({ plotsUnlocked: 1, ceiling: 4, coins: 50 })
  assert.equal(info.canUnlock, false)
  assert.equal(info.reason, 'notEnoughCoins')
  assert.equal(info.nextPlot, 2)
  assert.equal(info.cost, 100)
})

test('nextPlotInfo: ชนเพดานเลเวลบ้าน → atCeiling', () => {
  const info = nextPlotInfo({ plotsUnlocked: 4, ceiling: 4, coins: 999999 })
  assert.equal(info.canUnlock, false)
  assert.equal(info.reason, 'atCeiling')
})

test('nextPlotInfo: ปลดครบ 12 → maxed (nextPlot/cost = null)', () => {
  const info = nextPlotInfo({ plotsUnlocked: 12, ceiling: 12, coins: 999999 })
  assert.equal(info.canUnlock, false)
  assert.equal(info.reason, 'maxed')
  assert.equal(info.nextPlot, null)
  assert.equal(info.cost, null)
})
```

- [ ] **Step 2: รันเทสให้เห็นว่าล้ม**

Run: `node --test src/data/farmPlots.test.js`
Expected: FAIL — `Cannot find module './farmPlots.js'`

- [ ] **Step 3: เขียน implementation ให้ผ่าน**

Create `src/data/farmPlots.js`:

```js
// ════════════════════════════════════════════════════════════
//  ฟาร์ม — ระบบปลดแปลงด้วยเหรียญ (coin sink)
//  เริ่ม 1 แปลง → ซื้อปลดทีละแปลง (ราคาแพงขึ้นเรื่อยๆ ช่วงต้นถูก)
//  แต่ปลดได้ไม่เกินเพดานตามเลเวลบ้าน residencePlots(level) (Lv1=4 … Lv12=12)
//  ราคาทั้งหมด tunable ที่ตารางเดียวด้านล่าง
// ════════════════════════════════════════════════════════════

export const MAX_PLOTS = 12

// index = หมายเลขแปลง (1-based). [1]=0 เริ่มต้นฟรี, [2..12]=ราคาซื้อปลด
export const PLOT_UNLOCK_COST = [
  null,     // 0 — ไม่ใช้
  0,        // แปลง 1 — เริ่มต้นฟรี
  100,      // 2
  300,      // 3
  900,      // 4
  2500,     // 5
  6000,     // 6
  14000,    // 7
  32000,    // 8
  70000,    // 9
  150000,   // 10
  320000,   // 11
  700000,   // 12
]

/** ราคาซื้อ "แปลงลำดับที่ plotNumber" — null ถ้านอกช่วง 1..MAX_PLOTS */
export function plotUnlockCost(plotNumber) {
  const n = Math.floor(Number(plotNumber))
  if (!Number.isFinite(n) || n < 1 || n > MAX_PLOTS) return null
  return PLOT_UNLOCK_COST[n]
}

/**
 * ตัดสินสถานะการปลดแปลงถัดไป (pure — ให้ useFarm/FarmShop ใช้ร่วมกัน).
 *   plotsUnlocked = จำนวนแปลงที่ปลดแล้ว (≥1)
 *   ceiling       = เพดานตามเลเวลบ้าน residencePlots(level)
 *   coins         = เหรียญปัจจุบัน
 * reason: 'ok' ปลดได้ · 'notEnoughCoins' เงินไม่พอ · 'atCeiling' ชนเพดานบ้าน · 'maxed' ครบ 12
 */
export function nextPlotInfo({ plotsUnlocked, ceiling, coins }) {
  const owned = Math.max(1, Math.floor(Number(plotsUnlocked) || 1))
  if (owned >= MAX_PLOTS) {
    return { canUnlock: false, reason: 'maxed', nextPlot: null, cost: null }
  }
  const nextPlot = owned + 1
  const cost = plotUnlockCost(nextPlot)
  if (owned >= ceiling) {
    return { canUnlock: false, reason: 'atCeiling', nextPlot, cost }
  }
  if ((Number(coins) || 0) < cost) {
    return { canUnlock: false, reason: 'notEnoughCoins', nextPlot, cost }
  }
  return { canUnlock: true, reason: 'ok', nextPlot, cost }
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/data/farmPlots.test.js`
Expected: PASS — ทุกเทสผ่าน

- [ ] **Step 5: Commit**

```bash
git add src/data/farmPlots.js src/data/farmPlots.test.js
git commit -m "Farm: ตารางราคา+ตรรกะปลดแปลง (pure, เทสได้ — coin sink ใหม่)"
```

---

### Task 2: เพิ่ม `farm.plotsUnlocked` ใน userSchema

**Files:**
- Modify: `src/data/userSchema.js:50`
- Test: `src/data/userSchema.test.js`

**Interfaces:**
- Consumes: (ไม่มี)
- Produces: `USER_DEFAULTS.farm.plotsUnlocked === 1` · `normalizeUserData(doc).farm.plotsUnlocked` (เติม default 1 ให้ doc ที่ไม่มี field นี้ = คนเก่ารีเซ็ตเหลือ 1 อัตโนมัติ; คงค่าเดิมถ้ามี)

- [ ] **Step 1: เขียนเทสที่ล้มก่อน**

เพิ่มท้าย `src/data/userSchema.test.js`:

```js
// ── Farm plot-unlock (ระบบปลดแปลง) ──
test('USER_DEFAULTS.farm.plotsUnlocked = 1 (เริ่ม 1 แปลง)', () => {
  assert.equal(USER_DEFAULTS.farm.plotsUnlocked, 1)
})
test('normalizeUserData: doc ไม่มี plotsUnlocked → เติม 1 (คนเก่ารีเซ็ตเหลือ 1)', () => {
  const d = normalizeUserData({ farm: { plots: [], inventory: {} } })
  assert.equal(d.farm.plotsUnlocked, 1)
})
test('normalizeUserData: คงค่า plotsUnlocked เดิมถ้ามี', () => {
  const d = normalizeUserData({ farm: { plotsUnlocked: 5 } })
  assert.equal(d.farm.plotsUnlocked, 5)
})
```

- [ ] **Step 2: รันเทสให้เห็นว่าล้ม**

Run: `node --test src/data/userSchema.test.js`
Expected: FAIL — `plotsUnlocked` เป็น undefined (default ยังไม่มี)

- [ ] **Step 3: เพิ่ม field ใน default**

แก้ `src/data/userSchema.js` บรรทัด 50:

```js
  farm: { plots: [], plotCount: 4, inventory: {}, lastTick: null, plotsUnlocked: 1 },
```

(normalizeUserData ทำ deep-merge `d.farm = { ...USER_DEFAULTS.farm, ...data.farm }` อยู่แล้ว บรรทัด 122 → field ใหม่ได้ default อัตโนมัติ ไม่ต้องแก้ logic เพิ่ม)

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/data/userSchema.test.js`
Expected: PASS — รวมเทสเดิมทั้งหมดด้วย

- [ ] **Step 5: Commit**

```bash
git add src/data/userSchema.js src/data/userSchema.test.js
git commit -m "Schema: farm.plotsUnlocked default 1 (คนเก่ารีเซ็ตเหลือ 1 แปลง ไม่ต้อง migration)"
```

---

### Task 3: `useFarm` — ผูกตรรกะปลดแปลง + action `unlockPlot()`

**Files:**
- Modify: `src/composables/useFarm.js`

**Interfaces:**
- Consumes: `plotUnlockCost`/`nextPlotInfo`/`MAX_PLOTS` จาก `data/farmPlots.js` (Task 1) · `residencePlots` จาก `data/residence.js` · `auth.patchUser` · `USER_DEFAULTS.farm.plotsUnlocked` (Task 2)
- Produces (เพิ่มใน return object ของ `useFarm()`):
  - `ceiling` — `ComputedRef<number>` เพดานตามเลเวลบ้าน
  - `plotsUnlocked` — `ComputedRef<number>` จำนวนแปลงที่ปลด (clamp 1..MAX_PLOTS)
  - `plotCount` — `ComputedRef<number>` **เปลี่ยนนิยาม** = `min(plotsUnlocked, ceiling)` (แปลงที่เห็น/ปลูกได้จริง)
  - `nextPlot` — `ComputedRef<{canUnlock,reason,nextPlot,cost}>`
  - `unlockPlot(): Promise<void>` — ซื้อปลดแปลงถัดไป (guard + patchUser + toast)

- [ ] **Step 1: แก้ import + computed**

แก้ส่วนหัว `src/composables/useFarm.js` — เพิ่ม import farmPlots และเปลี่ยน `plotCount`:

จากบรรทัด 4-8 เดิม:
```js
import { residencePlots } from '../data/residence.js'
import {
  getCrop, cropsForLevel, nextUnlock, growMs,
} from '../data/crops.js'
import { bumpDailyQuest } from '../utils/dailyQuest.js'
```
เป็น:
```js
import { residencePlots } from '../data/residence.js'
import {
  getCrop, cropsForLevel, nextUnlock, growMs,
} from '../data/crops.js'
import { nextPlotInfo, MAX_PLOTS } from '../data/farmPlots.js'
import { bumpDailyQuest } from '../utils/dailyQuest.js'
```

แก้บรรทัด 21-22 เดิม:
```js
  const level     = computed(() => auth.userData?.residence?.level || 1)
  const plotCount = computed(() => residencePlots(level.value))
```
เป็น:
```js
  const level     = computed(() => auth.userData?.residence?.level || 1)
  // เพดานตามเลเวลบ้าน (เดิม = จำนวนแปลงจริง → เปลี่ยนเป็น "เพดานสูงสุดที่ปลดได้")
  const ceiling   = computed(() => residencePlots(level.value))
  // แปลงที่ปลดแล้ว (เริ่ม 1) clamp 1..MAX_PLOTS
  const plotsUnlocked = computed(() => {
    const raw = Math.floor(Number(auth.userData?.farm?.plotsUnlocked))
    return Math.max(1, Math.min(Number.isFinite(raw) ? raw : 1, MAX_PLOTS))
  })
  // แปลงที่เห็น/ปลูกได้จริง = min(ปลดแล้ว, เพดานบ้าน)
  // กัน edge case: admin ลดเลเวลบ้าน → เพดานต่ำกว่าที่ปลด → ซ่อนแปลงเกิน ไม่ลบข้อมูล
  const plotCount = computed(() => Math.min(plotsUnlocked.value, ceiling.value))
  // สถานะปลดแปลงถัดไป (pure logic จาก farmPlots)
  const nextPlot  = computed(() => nextPlotInfo({
    plotsUnlocked: plotsUnlocked.value,
    ceiling: ceiling.value,
    coins: auth.userData?.coins || 0,
  }))
```

- [ ] **Step 2: เพิ่ม action `unlockPlot()`**

เพิ่มฟังก์ชันก่อนบรรทัด `return {` (หลัง `sellAll`):

```js
  async function unlockPlot() {
    const info = nextPlot.value
    if (info.reason === 'maxed')    { toast('ปลดครบทุกแปลงแล้ว', 'info'); return }
    if (info.reason === 'atCeiling'){ toast('อัปเลเวลบ้านเพื่อปลดแปลงเพิ่ม', 'info'); return }
    if (info.reason === 'notEnoughCoins') {
      toast(`เหรียญไม่พอ! ปลดแปลงราคา ${info.cost.toLocaleString()} เหรียญ`, 'error'); return
    }
    const newUnlocked = plotsUnlocked.value + 1
    const optimistic = {
      farm: { ...(auth.userData?.farm || {}), plotsUnlocked: newUnlocked },
      coins: (auth.userData?.coins || 0) - info.cost,
    }
    const patch = { 'farm.plotsUnlocked': newUnlocked, coins: increment(-info.cost) }
    const ok = await auth.patchUser(optimistic, patch)
    if (ok) toast(`ปลดแปลงที่ ${newUnlocked} แล้ว!`, 'success')
    else toast('ปลดแปลงไม่สำเร็จ', 'error')
  }
```

(`increment` import อยู่แล้วบรรทัด 2 · `toast` มาจาก useToast บรรทัด 19)

- [ ] **Step 3: เพิ่มของใหม่ใน return**

แก้ return (เดิมบรรทัด 118-122):
```js
  return {
    level, plotCount, plots, inventory, seedChoices, upcomingSeed,
    status,
    plant, harvest, sell, sellAll,
  }
```
เป็น:
```js
  return {
    level, ceiling, plotsUnlocked, plotCount, nextPlot,
    plots, inventory, seedChoices, upcomingSeed,
    status,
    plant, harvest, sell, sellAll, unlockPlot,
  }
```

- [ ] **Step 4: Build ให้ผ่าน (ไม่มี component test สำหรับ composable)**

Run: `npm run build`
Expected: build สำเร็จ ไม่มี error (ตรรกะราคาถูกครอบด้วยเทส Task 1 แล้ว)

- [ ] **Step 5: Commit**

```bash
git add src/composables/useFarm.js
git commit -m "useFarm: plotsUnlocked/ceiling/nextPlot + unlockPlot() (plotCount=min ปลด×เพดาน)"
```

---

### Task 4: `FarmShop` + `FarmView` + route `/play/farm`

**Files:**
- Create: `src/components/farm/FarmShop.vue`
- Create: `src/views/FarmView.vue`
- Modify: `src/router/index.js:19-20`

**Interfaces:**
- Consumes: `useFarm()` → `plotsUnlocked`/`ceiling`/`nextPlot`/`unlockPlot` (Task 3) · `FarmGrid.vue` (มีอยู่) · `auth.userData.coins`
- Produces: route `/play/farm` (name `play-farm`) render `FarmView`

- [ ] **Step 1: สร้าง `FarmShop.vue` (พาเนลปลดแปลง)**

Create `src/components/farm/FarmShop.vue`:

```vue
<template>
  <div class="farm-shop">
    <div class="fs-head"><Emoji char="🛒" /> ร้านค้าฟาร์ม</div>
    <div class="fs-status">
      แปลงที่ปลด <b>{{ farm.plotsUnlocked.value }}</b> / {{ farm.ceiling.value }}
      <span class="fs-cap">· เพดานตามเลเวลบ้าน</span>
    </div>

    <div v-if="info.reason === 'maxed'" class="fs-msg done">ปลดครบทุกแปลงแล้ว 🎉</div>
    <div v-else-if="info.reason === 'atCeiling'" class="fs-msg">
      ปลดครบเพดานบ้านแล้ว — อัปเกรดบ้านเพื่อปลดแปลงเพิ่ม (ตอนนี้เพดาน {{ farm.ceiling.value }} แปลง)
    </div>
    <template v-else>
      <button class="fs-buy" :disabled="info.reason === 'notEnoughCoins'" @click="farm.unlockPlot()">
        ปลดแปลงที่ {{ info.nextPlot }} · <Emoji char="🪙" /> {{ info.cost.toLocaleString() }}
      </button>
      <div v-if="info.reason === 'notEnoughCoins'" class="fs-warn">
        เหรียญไม่พอ (มี {{ coins.toLocaleString() }} เหรียญ)
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Emoji from '../shared/Emoji.vue'
import { useAuthStore } from '../../stores/auth.js'
import { useFarm } from '../../composables/useFarm.js'

const auth = useAuthStore()
const farm = useFarm()
const info = computed(() => farm.nextPlot.value)
const coins = computed(() => auth.userData?.coins || 0)
</script>

<style scoped>
.farm-shop { background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 16px; padding: 14px; margin-top: 12px; }
.fs-head { font-weight: 800; font-size: 1rem; margin-bottom: 6px; }
.fs-status { font-size: .72rem; color: rgba(0,0,0,.6); margin-bottom: 10px; }
.fs-status b { color: var(--ink); }
.fs-cap { color: rgba(0,0,0,.4); }
.fs-buy { border: none; background: linear-gradient(135deg,#84cc16,#16a34a); color: #fff; font-weight: 800; font-size: .84rem; padding: 10px 14px; border-radius: 10px; cursor: pointer; font-family: inherit; width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 4px; }
.fs-buy:disabled { opacity: .45; cursor: not-allowed; }
.fs-buy:not(:disabled):active { transform: translateY(1px); }
.fs-warn { font-size: .66rem; color: #dc2626; margin-top: 6px; text-align: center; }
.fs-msg { font-size: .74rem; color: rgba(0,0,0,.55); background: rgba(0,0,0,.04); border-radius: 10px; padding: 10px 12px; text-align: center; }
.fs-msg.done { color: #15803d; background: rgba(34,197,94,.12); font-weight: 700; }
</style>
```

- [ ] **Step 2: สร้าง `FarmView.vue` (หน้าเต็ม)**

Create `src/views/FarmView.vue`:

```vue
<template>
  <div class="tab-content">
    <div class="page-title fv-head">
      <RouterLink to="/play" class="fv-back" aria-label="กลับ">‹</RouterLink>
      <span><Emoji char="🌱" /> โหมดฟาร์ม</span>
      <span class="fv-spacer"></span>
    </div>

    <FarmGrid />
    <FarmShop />
  </div>
</template>

<script setup>
import Emoji from '../components/shared/Emoji.vue'
import FarmGrid from '../components/farm/FarmGrid.vue'
import FarmShop from '../components/farm/FarmShop.vue'
</script>

<style scoped>
.fv-head { display: flex; align-items: center; gap: 8px; }
.fv-back { text-decoration: none; color: var(--ink); font-size: 1.6rem; font-weight: 800; line-height: 1; width: 24px; }
.fv-spacer { width: 24px; }
</style>
```

- [ ] **Step 3: เพิ่ม route**

แก้ `src/router/index.js` — เพิ่มบรรทัดหลัง `/expedition` (บรรทัด 19):

```js
    { path: '/expedition', name: 'expedition', component: () => import('../views/ExpeditionView.vue') },
    { path: '/play/farm',  name: 'play-farm',  component: () => import('../views/FarmView.vue')    },
```

- [ ] **Step 4: Build ให้ผ่าน**

Run: `npm run build`
Expected: build สำเร็จ · ทดสอบ manual ใน `npm run dev`: เข้า `#/play/farm` → เห็นแปลง (เริ่ม 1 แปลง) + พาเนลร้านค้าฟาร์ม, กดปลดแปลงหักเหรียญถูก, ปลูก/เก็บ/ขายยังทำงาน, ปุ่มไม่โดน bottom-nav บัง

- [ ] **Step 5: Commit**

```bash
git add src/components/farm/FarmShop.vue src/views/FarmView.vue src/router/index.js
git commit -m "Farm: หน้าเต็มโหมดฟาร์ม /play/farm + ร้านค้าฟาร์ม (ปลดแปลง) — ย้ายจาก modal"
```

---

### Task 5: `PetHubView` + route `/play/pets`

**Files:**
- Create: `src/views/PetHubView.vue`
- Modify: `src/router/index.js` (หลัง route `/play/farm` จาก Task 4)

**Interfaces:**
- Consumes: `useAppConfig()` → `pvpOpen` · `auth.isAdmin` · `useExpedition()` → `exp` · `expeditionState` จาก `utils/expedition.js` · `SoonCard`/`SectionTitle`/`Emoji`
- Produces: route `/play/pets` (name `play-pets`) render `PetHubView`

- [ ] **Step 1: สร้าง `PetHubView.vue`**

(ยก markup การ์ด + logic pvpOpen/expState badge มาจาก PlayView เดิม — .play-grid/.game-card/.gc-* styles ย้ายมาที่นี่ทั้งชุด เพราะ PlayView landing จะเลิกใช้)

Create `src/views/PetHubView.vue`:

```vue
<template>
  <div class="tab-content">
    <div class="page-title ph-head">
      <RouterLink to="/play" class="ph-back" aria-label="กลับ">‹</RouterLink>
      <span><Emoji char="🐾" /> โหมดเพ็ท</span>
      <span class="ph-spacer"></span>
    </div>

    <div class="play-grid">
      <RouterLink to="/pets" class="game-card">
        <span class="gc-emoji"><Emoji char="🐾" /></span>
        <span class="gc-name">สัตว์เลี้ยง</span>
        <span class="gc-badge grow">คลัง · ห้องทดลอง</span>
      </RouterLink>

      <RouterLink to="/shop" class="game-card">
        <span class="gc-emoji"><Emoji char="🛒" /></span>
        <span class="gc-name">ร้านค้าเพ็ท</span>
        <span class="gc-badge grow">อัญเชิญ · ห้องทดลอง</span>
      </RouterLink>

      <RouterLink to="/tower" class="game-card">
        <span class="gc-emoji"><Emoji char="🏯" /></span>
        <span class="gc-name">ปีนหอคอย</span>
        <span class="gc-badge grow">ไต่ชั้น · ปลดโบนัส</span>
      </RouterLink>

      <RouterLink v-if="pvpOpen || authStore.isAdmin" to="/arena" class="game-card">
        <span class="gc-emoji"><Emoji char="⚔️" /></span>
        <span class="gc-name">สนามประลอง</span>
        <span class="gc-badge grow">PvP · แต้มประลอง</span>
      </RouterLink>
      <SoonCard v-else emoji="⚔️" label="สนามประลอง" />

      <RouterLink to="/expedition" class="game-card">
        <span class="gc-emoji"><Emoji char="🗺️" /></span>
        <span class="gc-name">ส่งผจญภัย</span>
        <span v-if="expState === 'ready'" class="gc-badge ready"><Emoji char="🎉" /> กลับมาแล้ว!</span>
        <span v-else-if="expState === 'active'" class="gc-badge plant"><Emoji char="⏳" /> กำลังไป</span>
        <span v-else class="gc-badge grow">ส่งเพ็ทหารางวัล</span>
      </RouterLink>

      <SoonCard emoji="🐲" label="บอสรวมรุ่น" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Emoji from '../components/shared/Emoji.vue'
import SoonCard from '../components/shared/SoonCard.vue'
import { useAuthStore } from '../stores/auth.js'
import { useAppConfig } from '../composables/useAppConfig.js'
import { useExpedition } from '../composables/useExpedition.js'
import { expeditionState } from '../utils/expedition.js'

const authStore = useAuthStore()
const { pvpOpen } = useAppConfig()
const { exp } = useExpedition()

// coarse tick (5s) ให้ badge ส่งผจญภัยสด
const now = ref(Date.now())
let timer = null
onMounted(() => { timer = setInterval(() => { now.value = Date.now() }, 5000) })
onUnmounted(() => clearInterval(timer))

const expState = computed(() => expeditionState(exp.value, now.value))
</script>

<style scoped>
.ph-head { display: flex; align-items: center; gap: 8px; }
.ph-back { text-decoration: none; color: var(--ink); font-size: 1.6rem; font-weight: 800; line-height: 1; width: 24px; }
.ph-spacer { width: 24px; }

/* การ์ดเกม (ยกจาก PlayView เดิม) */
.play-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.game-card { all: unset; cursor: pointer; box-sizing: border-box; background: #e2f7f0; border: 2px solid var(--ink); border-radius: 16px; box-shadow: var(--pop); padding: 16px 10px; display: flex; flex-direction: column; align-items: center; gap: 5px; transition: transform .12s, box-shadow .12s; }
.game-card:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.gc-emoji { font-size: 1.6rem; }
.gc-name { font-size: .8rem; font-weight: 800; }
.gc-badge { font-size: .58rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
.gc-badge.ready { color: #15803d; background: rgba(34,197,94,.16); }
.gc-badge.plant { color: #b45309; background: rgba(251,191,36,.18); }
.gc-badge.grow  { color: rgba(0,0,0,.45); background: rgba(0,0,0,.05); }
</style>
```

- [ ] **Step 2: เพิ่ม route**

แก้ `src/router/index.js` — เพิ่มบรรทัดหลัง `/play/farm`:

```js
    { path: '/play/farm',  name: 'play-farm',  component: () => import('../views/FarmView.vue')    },
    { path: '/play/pets',  name: 'play-pets',  component: () => import('../views/PetHubView.vue')  },
```

- [ ] **Step 3: Build + manual**

Run: `npm run build`
Expected: build สำเร็จ · manual (`npm run dev`): เข้า `#/play/pets` → เห็นการ์ด 6 ใบ, ทุกใบลิงก์ถูก route, สนามประลองเป็น SoonCard เมื่อ pvpOpen ปิด (ไม่ใช่ admin), badge ส่งผจญภัยอัปเดต

- [ ] **Step 4: Commit**

```bash
git add src/views/PetHubView.vue src/router/index.js
git commit -m "Play: หน้า hub โหมดเพ็ท /play/pets (รวมเกมที่ใช้เพ็ททั้งหมด — เลิกกระจายหลายหมวด)"
```

---

### Task 6: รื้อ `PlayView` เป็น landing (2 hero card + section มินิเกม)

**Files:**
- Modify: `src/views/PlayView.vue` (ทั้งไฟล์)

**Interfaces:**
- Consumes: `useFarm()` → `plots`/`status`/`plotCount` (สำหรับ badge การ์ดโหมดฟาร์ม) · `useExpedition()`/`expeditionState` (badge โหมดเพ็ท) · `NewsBoard`/`SectionTitle`/`SoonCard`/`Emoji`/`HelpButton` · route `/play/pets` + `/play/farm` (Task 4-5)
- Produces: หน้า `/play` = landing (ไม่มี farm modal, ไม่มี .game-card แล้ว)

- [ ] **Step 1: แทนที่ทั้งไฟล์ `src/views/PlayView.vue`**

```vue
<template>
  <div class="tab-content">
    <div class="page-title pv-head"><span><Emoji char="🎮" /> Play</span><HelpButton topic="play" /></div>

    <!-- กระดานข่าว (เห็นได้ทุกคน) -->
    <NewsBoard />

    <template v-if="authStore.isLoggedIn">
      <!-- ── 2 ระบบใหญ่: โหมดเพ็ท / โหมดฟาร์ม ── -->
      <div class="hero-grid">
        <RouterLink to="/play/pets" class="hero-card pets">
          <span class="hero-emoji"><Emoji char="🐾" /></span>
          <span class="hero-name">โหมดเพ็ท</span>
          <span class="hero-sub">คลัง · ร้านค้า · หอคอย · ประลอง · ผจญภัย</span>
          <span v-if="expState === 'ready'" class="hero-badge ready"><Emoji char="🎉" /> ผจญภัยกลับมาแล้ว!</span>
        </RouterLink>

        <RouterLink to="/play/farm" class="hero-card farm">
          <span class="hero-emoji"><Emoji char="🌱" /></span>
          <span class="hero-name">โหมดฟาร์ม</span>
          <span v-if="readyCount" class="hero-badge ready"><Emoji char="🧺" /> เก็บได้ {{ readyCount }}</span>
          <span v-else-if="emptyCount" class="hero-badge plant">＋ ว่าง {{ emptyCount }} แปลง</span>
          <span v-else class="hero-sub">ปลูก · เก็บเกี่ยว · ปลดแปลง</span>
        </RouterLink>
      </div>

      <!-- ── มินิเกม (เร็วๆ นี้) ── -->
      <SectionTitle><Emoji char="🎮" /> มินิเกม</SectionTitle>
      <div class="soon-grid">
        <SoonCard emoji="🍬" label="เภสัช Crush" />
      </div>
    </template>
    <div v-else class="play-login">เข้าสู่ระบบเพื่อเล่น</div>
  </div>
</template>

<script setup>
import Emoji from '../components/shared/Emoji.vue'
import HelpButton from '../components/help/HelpButton.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useFarm } from '../composables/useFarm.js'
import { useExpedition } from '../composables/useExpedition.js'
import { expeditionState } from '../utils/expedition.js'
import NewsBoard from '../components/home/NewsBoard.vue'
import SectionTitle from '../components/shared/SectionTitle.vue'
import SoonCard from '../components/shared/SoonCard.vue'

const authStore = useAuthStore()
const farm = useFarm()
const { exp } = useExpedition()

// coarse tick (5s) ให้ badge การ์ดสด
const now = ref(Date.now())
let timer = null
onMounted(() => { timer = setInterval(() => { now.value = Date.now() }, 5000) })
onUnmounted(() => clearInterval(timer))

const expState   = computed(() => expeditionState(exp.value, now.value))
const readyCount = computed(() => farm.plots.value.filter(p => p && farm.status(p, now.value).ready).length)
const emptyCount = computed(() => farm.plots.value.filter(p => !p).length)
</script>

<style scoped>
.pv-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }

.hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 4px; }
.hero-card { all: unset; cursor: pointer; box-sizing: border-box; border: 2px solid var(--ink); border-radius: 18px; box-shadow: var(--pop); padding: 22px 14px; min-height: 148px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; text-align: center; transition: transform .12s, box-shadow .12s; }
.hero-card:active { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.hero-card.pets { background: linear-gradient(160deg,#e0e7ff,#c7d2fe); }
.hero-card.farm { background: linear-gradient(160deg,#dcfce7,#bbf7d0); }
.hero-emoji { font-size: 2.4rem; }
.hero-name { font-size: 1rem; font-weight: 800; }
.hero-sub { font-size: .6rem; color: rgba(0,0,0,.5); font-weight: 600; line-height: 1.3; }
.hero-badge { font-size: .62rem; font-weight: 700; padding: 3px 9px; border-radius: 999px; }
.hero-badge.ready { color: #15803d; background: rgba(34,197,94,.2); }
.hero-badge.plant { color: #b45309; background: rgba(251,191,36,.22); }

.soon-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

.play-login { text-align: center; color: rgba(0,0,0,.4); padding: 30px 0; font-size: .85rem; }
</style>
```

- [ ] **Step 2: Build + manual**

Run: `npm run build`
Expected: build สำเร็จ · manual: `#/play` เห็น 2 การ์ดใหญ่ (โหมดเพ็ท/โหมดฟาร์ม) + section มินิเกม; badge โหมดฟาร์มโชว์ "เก็บได้ N / ว่าง N"; กดการ์ด → เข้า hub ถูกหน้า; ไม่มี farm modal เด้งอีก

- [ ] **Step 3: Commit**

```bash
git add src/views/PlayView.vue
git commit -m "Play: รื้อเป็น landing 2 ระบบใหญ่ (โหมดเพ็ท/ฟาร์ม) + มินิเกม (ถอด farm modal)"
```

---

### Task 7: อัปเดต help content + regression รวม

**Files:**
- Modify: `src/data/guide.js` (topic `play` บรรทัด 7-15, topic `farm` บรรทัด 41-48)

**Interfaces:**
- Consumes: (ไม่มี)
- Produces: help topic `play`/`farm` สะท้อนโครง hub ใหม่ + ระบบปลดแปลง

- [ ] **Step 1: แก้ help topic `play`**

แทน body ของ `play` (บรรทัด 9-14) เป็น:

```js
  play: {
    icon: '🎮', title: 'หน้าเกม (Play)',
    body: [
      'หน้านี้คือประตูสู่เกมทั้งหมด — เอาเหรียญที่ได้จากการเรียนและรายได้รายวันมาต่อยอดที่นี่',
      '🐾 โหมดเพ็ท: รวมทุกอย่างเกี่ยวกับสัตว์เลี้ยง — คลังเพ็ท ร้านค้าเพ็ท (กาชา/ห้องทดลอง) ปีนหอคอย สนามประลอง และส่งผจญภัย',
      '🌱 โหมดฟาร์ม: ปลูกพืชรอเก็บเกี่ยวขายเป็นเหรียญ และปลดล็อกแปลงเพิ่มที่ร้านค้าฟาร์ม',
      'กดปุ่ม ? ในแต่ละหน้าเพื่อดูวิธีเล่นแบบละเอียดได้เลย',
    ],
  },
```

- [ ] **Step 2: แก้ help topic `farm`**

แทน body ของ `farm` (บรรทัด 43-47) เป็น:

```js
  farm: {
    icon: '🌾', title: 'ฟาร์ม',
    body: [
      'ปลูกพืชในแปลงของคุณ: ซื้อเมล็ด แล้วปลูกลงแปลง รอจนโตเต็มที่ ค่อยเก็บเกี่ยวไปขายเป็นเหรียญ',
      'พืชแต่ละระดับใช้เวลาโตต่างกัน ตั้งแต่ไม่กี่นาทีไปจนถึงหลายวัน — ยิ่งรอนาน ยิ่งขายได้แพง',
      'เริ่มต้นมี 1 แปลง · ปลดแปลงเพิ่มได้ที่ "ร้านค้าฟาร์ม" (ราคาแพงขึ้นเรื่อยๆ) แต่ปลดได้ไม่เกินเพดานที่เลเวลบ้านกำหนด',
      'อยากปลดแปลงได้มากขึ้น ให้อัปเกรดบ้านเพื่อขยายเพดาน แล้วค่อยซื้อปลดแต่ละแปลงที่ร้านค้าฟาร์ม',
    ],
  },
```

- [ ] **Step 3: รันเทสทั้งหมด + build**

Run: `node --test src/data/farmPlots.test.js src/data/userSchema.test.js`
Expected: PASS ทั้งหมด

Run: `npm run build`
Expected: build สำเร็จ

- [ ] **Step 4: Manual regression checklist (จอจริง มือถือ)**

ทดสอบใน `npm run dev`:
- `#/play`: 2 การ์ดใหญ่ + section มินิเกม; badge โหมดฟาร์มถูก (เก็บได้/ว่าง)
- `#/play/pets`: การ์ด 6 ใบลิงก์ถูก; สนามประลอง = SoonCard เมื่อ pvpOpen ปิด (ไม่ใช่ admin); back ‹ กลับ /play
- `#/play/farm`: เริ่ม 1 แปลง; ร้านค้าฟาร์มปลดแปลงหักเหรียญถูก; ชนเพดานบ้าน (เช่น Lv1 ปลดครบ 4) โชว์ prompt อัปบ้าน; ปลูก/เก็บ/ขาย ยังทำงาน; ปุ่ม/ก้นหน้าไม่โดน bottom-nav บัง; back ‹ กลับ /play
- ผู้เล่นเดิมที่เคยมีหลายแปลง → เข้ามาเหลือ 1 แปลง (plotsUnlocked default 1)
- กด ? ที่ /play และ /play/farm → เนื้อหา help ตรงโครงใหม่

- [ ] **Step 5: Commit**

```bash
git add src/data/guide.js
git commit -m "Help: อัปเดต guide play/farm ให้ตรงโครง hub + ระบบปลดแปลง"
```

---

## Self-Review Notes

- **Spec coverage:** IA landing (Task 6) · PetHub รวมเกมใช้เพ็ท (Task 5) · FarmView หน้าเต็ม + ร้านค้าฟาร์ม (Task 4) · ปลดแปลง escalating + เพดานบ้าน (Task 1) · plotsUnlocked default 1 รีเซ็ต (Task 2) · unlockPlot + plotCount=min (Task 3) · help (Task 7) — ครบทุก section ของ spec
- **ไม่แตะ:** view เกมเดิม / engine / rules — ยึด Global Constraints
- **Type consistency:** `nextPlotInfo` return `{canUnlock,reason,nextPlot,cost}` ใช้เหมือนกันทั้ง Task 1/3/4 · `plotsUnlocked`/`ceiling`/`plotCount`/`nextPlot` เป็น ComputedRef เข้าถึงผ่าน `.value` ใน component (FarmShop ใช้ `farm.plotsUnlocked.value`) ตรงกับแพทเทิร์นเดิม (FarmGrid ใช้ `farm.plots.value`)
- **Edge case:** admin ลดเลเวลบ้าน → `plotCount = min(plotsUnlocked, ceiling)` ซ่อนแปลงเกินไม่ลบข้อมูล (Task 3)
