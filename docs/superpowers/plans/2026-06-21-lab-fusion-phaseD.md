# ห้องทดลอง / Fusion — Phase D Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เพิ่ม "ห้องทดลอง" เป็นแท็บใน Shop — ทางระบาย `pets[].copies`: fusion ไต่ระดับ (จ่าย copies ระดับล่าง → สุ่ม uniform ระดับบน) + แลก copies เป็นเหรียญ (scale ตามระดับ) ผ่าน spend-picker กลาง

**Architecture:** logic เป็น pure util (`utils/lab.js`) reuse `rarityPool`(gacha) + `mergeRolls`(gachaMerge) จาก Phase B · UI แตกเป็น `SpendCopiesModal.vue` (picker) + `LabTab.vue` (แท็บ) · ShopView เพิ่ม tab switcher · เขียน user doc ผ่าน `patchUser` · ใช้ `pets[].copies` ที่มีอยู่ — **ไม่มี field/currency ใหม่**

**Tech Stack:** Vue 3 (`<script setup>`) · Pinia (`stores/auth.js`) · Firebase Firestore (`increment`) · เทส `node:test` + `node:assert/strict`

## Global Constraints

- **ไม่แตะ `firestore.rules` / `data/userSchema.js` / ไม่มี migration / ไม่มี index** — ใช้ `pets[].copies` เดิม
- เขียน user doc ผ่าน `authStore.patchUser(optimistic, server)` เท่านั้น (`server` ใช้ `increment()` ได้)
- ตัวเลขเศรษฐกิจ = draft pin ใน `utils/lab.js` ที่เดียว · ค่าเป๊ะ: `FUSION_COST = { common: 15, rare: 12, epic: 10 }` · `REDEEM_COIN = { common: 50, rare: 200, epic: 800, legendary: 3000 }`
- modal/overlay ใหม่ทุกตัว → `<Teleport to="body">` (กับดัก stacking context: `#main-content` เป็น position:fixed)
- emoji ใน template → `<Emoji :char="..." />` เสมอ
- reuse `rarityPool` จาก `utils/gacha.js` (มีอยู่: `rarityPool(catalog, rarity) → string[]`) + `mergeRolls` จาก `utils/gachaMerge.js` (`mergeRolls(pets, results, catalog) → { pets, summary:[{id,name,rarity,emoji,isNew}] }` · results แต่ละตัวใช้แค่ `.id`)
- fusion **ไม่** bump `dailyQuest.gacha`
- fusion output = **สุ่ม uniform ในระดับบน** (ไม่ใช่ new-first) · legendary หลอมต่อไม่ได้
- rarity order: `['common','rare','epic','legendary']`
- เทส pure รัน `node --test src/utils/lab.test.js` · commit `Area: อะไร (ทำไม)` + ปิดท้าย `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

---

### Task 1: `utils/lab.js` — pure helpers (fusion/redeem/spend)

**Files:**
- Create: `src/utils/lab.js`
- Test: `src/utils/lab.test.js`

**Interfaces:**
- Consumes: `rarityPool(catalog, rarity)` จาก `./gacha.js`
- Produces:
  - `FUSION_COST = { common:15, rare:12, epic:10 }`, `REDEEM_COIN = { common:50, rare:200, epic:800, legendary:3000 }`
  - `nextRarity(r) → string|null`
  - `rarityCopyTotal(pets, rarity) → number`
  - `allocationTotal(allocation) → number` (allocation = `[{id,n}]`)
  - `applyCopySpend(pets, allocation) → pets[]` (clone, หัก copies; invalid → throw `Error('invalid copy spend')`)
  - `fuseRoll(sourceRarity, catalog, rng) → id|null` (สุ่ม uniform จาก pool ของ `nextRarity(sourceRarity)`)
  - `redeemValue(allocation, rarity) → number`

- [ ] **Step 1: เขียนเทสที่ยังไม่ผ่าน**

สร้าง `src/utils/lab.test.js`:
```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  FUSION_COST, REDEEM_COIN, nextRarity, rarityCopyTotal,
  allocationTotal, applyCopySpend, fuseRoll, redeemValue,
} from './lab.js'

const seq = (vals) => { let i = 0; return () => vals[Math.min(i++, vals.length - 1)] }
const CAT = [
  { id: 'cat', rarity: 'common' }, { id: 'mouse', rarity: 'common' },
  { id: 'wolf', rarity: 'rare' }, { id: 'dragon', rarity: 'epic' },
  { id: 'bahamut', rarity: 'legendary' }, { id: 'whale', rarity: 'legendary' },
]

test('draft pins ตรงสเปก', () => {
  assert.deepEqual(FUSION_COST, { common: 15, rare: 12, epic: 10 })
  assert.deepEqual(REDEEM_COIN, { common: 50, rare: 200, epic: 800, legendary: 3000 })
})

test('nextRarity ไต่ระดับ, legendary → null', () => {
  assert.equal(nextRarity('common'), 'rare')
  assert.equal(nextRarity('rare'), 'epic')
  assert.equal(nextRarity('epic'), 'legendary')
  assert.equal(nextRarity('legendary'), null)
  assert.equal(nextRarity('???'), null)
})

test('rarityCopyTotal รวม copies เฉพาะ rarity นั้น', () => {
  const pets = [
    { id: 'cat', rarity: 'common', copies: 3 },
    { id: 'mouse', rarity: 'common', copies: 2 },
    { id: 'wolf', rarity: 'rare', copies: 5 },
  ]
  assert.equal(rarityCopyTotal(pets, 'common'), 5)
  assert.equal(rarityCopyTotal(pets, 'rare'), 5)
  assert.equal(rarityCopyTotal(pets, 'epic'), 0)
})

test('allocationTotal รวม n', () => {
  assert.equal(allocationTotal([{ id: 'cat', n: 3 }, { id: 'mouse', n: 2 }]), 5)
  assert.equal(allocationTotal([]), 0)
})

test('applyCopySpend หักถูก + ไม่ mutate ต้นฉบับ', () => {
  const pets = [{ id: 'cat', rarity: 'common', copies: 3 }, { id: 'mouse', rarity: 'common', copies: 2 }]
  const out = applyCopySpend(pets, [{ id: 'cat', n: 2 }, { id: 'mouse', n: 2 }])
  assert.equal(out.find(p => p.id === 'cat').copies, 1)
  assert.equal(out.find(p => p.id === 'mouse').copies, 0)
  assert.equal(pets[0].copies, 3) // ต้นฉบับไม่เปลี่ยน
})

test('applyCopySpend invalid → throw', () => {
  const pets = [{ id: 'cat', rarity: 'common', copies: 1 }]
  assert.throws(() => applyCopySpend(pets, [{ id: 'cat', n: 2 }]), /invalid copy spend/)   // n > copies
  assert.throws(() => applyCopySpend(pets, [{ id: 'ghost', n: 1 }]), /invalid copy spend/)  // ไม่มีตัว
  assert.throws(() => applyCopySpend(pets, [{ id: 'cat', n: 0 }]), /invalid copy spend/)     // n < 1
})

test('fuseRoll สุ่มในระดับถัดไป (uniform), legendary → null', () => {
  assert.equal(fuseRoll('epic', CAT, seq([0.0])), 'bahamut')  // epic→legendary, pool[0]
  assert.equal(fuseRoll('epic', CAT, seq([0.99])), 'whale')   // pool[last]
  assert.equal(fuseRoll('common', CAT, seq([0.0])), 'wolf')   // common→rare, pool[0]
  assert.equal(fuseRoll('legendary', CAT, seq([0.0])), null)  // หลอมต่อไม่ได้
})

test('redeemValue = Σn × rate', () => {
  assert.equal(redeemValue([{ id: 'bahamut', n: 2 }], 'legendary'), 6000) // 2 × 3000
  assert.equal(redeemValue([{ id: 'cat', n: 3 }], 'common'), 150)         // 3 × 50
})
```

- [ ] **Step 2: รันเทสให้เห็นว่า fail**

Run: `node --test src/utils/lab.test.js`
Expected: FAIL (Cannot find module './lab.js')

- [ ] **Step 3: เขียน lab.js**

สร้าง `src/utils/lab.js`:
```js
// ห้องทดลอง (Phase D) — pure: fusion ไต่ระดับ + แลก copies เป็นเหรียญ · draft pins
import { rarityPool } from './gacha.js'

export const FUSION_COST = { common: 15, rare: 12, epic: 10 }              // copies ระดับล่างต่อ 1 หลอม
export const REDEEM_COIN = { common: 50, rare: 200, epic: 800, legendary: 3000 } // เหรียญต่อ 1 copy

const ORDER = ['common', 'rare', 'epic', 'legendary']

export function nextRarity(r) {
  const i = ORDER.indexOf(r)
  return (i >= 0 && i < ORDER.length - 1) ? ORDER[i + 1] : null
}

export function rarityCopyTotal(pets, rarity) {
  return (pets || []).filter((p) => p.rarity === rarity).reduce((s, p) => s + (p.copies || 0), 0)
}

export function allocationTotal(allocation) {
  return (allocation || []).reduce((s, a) => s + (a.n || 0), 0)
}

/** หัก copies ตาม allocation [{id,n}] — คืน pets clone · invalid → throw */
export function applyCopySpend(pets, allocation) {
  const byId = new Map((pets || []).map((p) => [p.id, p]))
  for (const { id, n } of allocation) {
    const pet = byId.get(id)
    if (!pet || !(n >= 1) || n > (pet.copies || 0)) throw new Error('invalid copy spend')
  }
  return (pets || []).map((p) => {
    const a = allocation.find((x) => x.id === p.id)
    return a ? { ...p, copies: (p.copies || 0) - a.n } : p
  })
}

/** สุ่ม uniform species id จากระดับถัดไป · legendary → null */
export function fuseRoll(sourceRarity, catalog, rng = Math.random) {
  const target = nextRarity(sourceRarity)
  if (!target) return null
  const pool = rarityPool(catalog, target)
  return pool[Math.floor(rng() * pool.length)]
}

export function redeemValue(allocation, rarity) {
  return allocationTotal(allocation) * (REDEEM_COIN[rarity] || 0)
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `node --test src/utils/lab.test.js`
Expected: PASS (8 tests)

- [ ] **Step 5: commit**

```bash
git add src/utils/lab.js src/utils/lab.test.js
git commit -m "Lab: pure helpers fusion/redeem/spend (nextRarity, applyCopySpend, fuseRoll, redeemValue)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: `SpendCopiesModal.vue` — picker เลือก copies จ่าย

**Files:**
- Create: `src/components/shop/SpendCopiesModal.vue`
- Test: manual (`npm run build` + ลองมือ — เป็น UI component)

**Interfaces:**
- Consumes: `auth.userData.pets`, `REDEEM_COIN` จาก `utils/lab.js`
- Props: `rarity:String`, `mode:'fusion'|'redeem'`, `required:Number(default 0)`
- Emits: `confirm(allocation: [{id,n}])` (เฉพาะ n>0), `cancel`
- Produces (ใช้โดย Task 3): `<SpendCopiesModal :rarity :mode :required @confirm @cancel />`

- [ ] **Step 1: เขียน component**

สร้าง `src/components/shop/SpendCopiesModal.vue`:
```vue
<template>
  <Teleport to="body">
    <div class="ov" @click.self="$emit('cancel')">
      <div class="sc-box">
        <div class="sc-head">
          เลือก {{ rarityLabel }} จ่าย copies
        </div>
        <div class="sc-sub">
          <template v-if="mode === 'fusion'">เลือกแล้ว {{ total }}/{{ required }}</template>
          <template v-else>เลือก {{ total }} copies · ได้ <b>{{ coinValue.toLocaleString() }}</b> <Emoji char="🪙" /></template>
        </div>

        <div v-if="!candidates.length" class="sc-empty">ไม่มี copies ระดับนี้</div>
        <div v-else class="sc-list">
          <div v-for="p in candidates" :key="p.id" class="sc-row">
            <span class="sc-emoji"><Emoji :char="p.emoji" /></span>
            <span class="sc-name">{{ p.name }} <small>({{ p.copies }})</small></span>
            <div class="sc-step">
              <button class="sc-pm" :disabled="(alloc[p.id] || 0) <= 0" @click="setN(p, (alloc[p.id] || 0) - 1)">−</button>
              <span class="sc-n">{{ alloc[p.id] || 0 }}</span>
              <button class="sc-pm" :disabled="(alloc[p.id] || 0) >= p.copies" @click="setN(p, (alloc[p.id] || 0) + 1)">+</button>
            </div>
          </div>
        </div>

        <div v-if="mode === 'fusion' && available < required" class="sc-warn">copies ไม่พอ ({{ available }}/{{ required }})</div>

        <div class="sc-actions">
          <button v-if="mode === 'fusion'" class="sc-auto" @click="auto">auto เติม</button>
          <button class="sc-cancel" @click="$emit('cancel')">ยกเลิก</button>
          <button class="sc-ok" :class="{ ready: canConfirm }" :disabled="!canConfirm" @click="confirm">ยืนยัน</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import Emoji from '../shared/Emoji.vue'
import { useAuthStore } from '../../stores/auth.js'
import { RARITY } from '../../data/index.js'
import { REDEEM_COIN } from '../../utils/lab.js'

const props = defineProps({
  rarity: { type: String, required: true },
  mode: { type: String, required: true },
  required: { type: Number, default: 0 },
})
const emit = defineEmits(['confirm', 'cancel'])
const auth = useAuthStore()

const candidates = computed(() => (auth.userData?.pets || []).filter((p) => p.rarity === props.rarity && (p.copies || 0) > 0))
const available = computed(() => candidates.value.reduce((s, p) => s + (p.copies || 0), 0))
const rarityLabel = computed(() => RARITY[props.rarity]?.label || props.rarity)

const alloc = ref({}) // id -> n
const total = computed(() => Object.values(alloc.value).reduce((s, n) => s + n, 0))
const coinValue = computed(() => total.value * (REDEEM_COIN[props.rarity] || 0))

function setN(p, n) {
  const clamped = Math.max(0, Math.min(n, p.copies || 0))
  alloc.value = { ...alloc.value, [p.id]: clamped }
}
function auto() {
  let need = props.required
  const next = {}
  for (const p of [...candidates.value].sort((a, b) => (b.copies || 0) - (a.copies || 0))) {
    if (need <= 0) break
    const take = Math.min(p.copies || 0, need)
    next[p.id] = take
    need -= take
  }
  alloc.value = next
}
const canConfirm = computed(() => props.mode === 'fusion' ? total.value === props.required : total.value >= 1)
function confirm() {
  const allocation = Object.entries(alloc.value).filter(([, n]) => n > 0).map(([id, n]) => ({ id, n }))
  emit('confirm', allocation)
}
</script>

<style scoped>
.ov { position: fixed; inset: 0; z-index: 410; background: rgba(0,0,0,.55); display: flex; align-items: center; justify-content: center; padding: 20px; }
.sc-box { background: #fff; border: 2px solid var(--ink); border-radius: 18px; box-shadow: var(--pop-lg); padding: 18px; width: 100%; max-width: 360px; max-height: 82vh; display: flex; flex-direction: column; }
.sc-head { font-weight: 800; text-align: center; }
.sc-sub { font-size: .72rem; color: rgba(0,0,0,.6); text-align: center; margin: 4px 0 12px; }
.sc-empty { text-align: center; color: rgba(0,0,0,.4); padding: 20px 0; }
.sc-list { overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }
.sc-row { display: flex; align-items: center; gap: 8px; border: 2px solid var(--ink); border-radius: 11px; padding: 7px 10px; }
.sc-emoji { font-size: 1.4rem; }
.sc-name { flex: 1; min-width: 0; font-size: .8rem; font-weight: 700; }
.sc-name small { color: rgba(0,0,0,.45); font-weight: 600; }
.sc-step { display: flex; align-items: center; gap: 8px; }
.sc-pm { width: 26px; height: 26px; border: 2px solid var(--ink); border-radius: 8px; background: #fff; font-weight: 800; cursor: pointer; }
.sc-pm:disabled { opacity: .35; cursor: default; }
.sc-n { min-width: 18px; text-align: center; font-weight: 800; }
.sc-warn { font-size: .66rem; color: #dc2626; text-align: center; margin-top: 8px; }
.sc-actions { display: flex; gap: 8px; margin-top: 14px; }
.sc-auto { border: 2px solid var(--ink); border-radius: 10px; padding: 9px 10px; font-family: inherit; font-weight: 800; font-size: .72rem; background: #fff; cursor: pointer; }
.sc-cancel { flex: 1; border: 2px solid var(--ink); border-radius: 10px; padding: 9px; font-family: inherit; font-weight: 800; background: #fff; cursor: pointer; }
.sc-ok { flex: 1; border: 2px solid var(--ink); border-radius: 10px; padding: 9px; font-family: inherit; font-weight: 800; color: #fff; background: #c9c2d4; cursor: pointer; }
.sc-ok.ready { background: var(--primary); box-shadow: var(--pop); }
.sc-ok:disabled { cursor: default; }
</style>
```

- [ ] **Step 2: build ยืนยัน**

Run: `npm run build`
Expected: build ผ่าน ไม่มี error

- [ ] **Step 3: commit**

```bash
git add src/components/shop/SpendCopiesModal.vue
git commit -m "Lab: SpendCopiesModal — picker เลือก copies จ่าย (fusion ครบ X / redeem โชว์ค่าเหรียญ)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: `LabTab.vue` — แท็บห้องทดลอง (ยอด copies + fusion + redeem + reveal)

**Files:**
- Create: `src/components/shop/LabTab.vue`
- Test: manual (`npm run build` + ลองมือ)

**Interfaces:**
- Consumes: `lab.js` (`FUSION_COST`, `REDEEM_COIN`, `nextRarity`, `rarityCopyTotal`, `applyCopySpend`, `fuseRoll`, `redeemValue`) · `mergeRolls` (gachaMerge) · `PETS`, `RARITY` (data/index) · `SpendCopiesModal` (Task 2) · `auth.patchUser`
- Produces: `<LabTab />` (ใช้ใน ShopView Task 4)

- [ ] **Step 1: เขียน component**

สร้าง `src/components/shop/LabTab.vue`:
```vue
<template>
  <div class="lab">
    <!-- ยอด copies -->
    <div class="lab-bal">
      <div v-for="r in RARITIES" :key="r" class="lab-bal-cell" :style="{ borderColor: rarityColor(r) }">
        <span class="lab-bal-n" :style="{ color: rarityColor(r) }">{{ copyTotal(r) }}</span>
        <span class="lab-bal-l">{{ RARITY[r]?.label }}</span>
      </div>
    </div>

    <!-- fusion -->
    <div class="lab-card">
      <div class="lab-card-h"><Emoji char="🧪" /> หลอมไต่ระดับ</div>
      <div v-for="src in FUSE_SRC" :key="src" class="lab-fuse">
        <span class="lab-fuse-txt">{{ RARITY[src]?.label }} → {{ RARITY[nextRarity(src)]?.label }}</span>
        <span class="lab-fuse-cost">{{ FUSION_COST[src] }} copies</span>
        <button class="lab-btn" :class="{ ok: copyTotal(src) >= FUSION_COST[src] }"
          :disabled="busy || copyTotal(src) < FUSION_COST[src]"
          @click="openFusion(src)">หลอม</button>
      </div>
    </div>

    <!-- redeem -->
    <div class="lab-card">
      <div class="lab-card-h"><Emoji char="🪙" /> แลกเป็นเหรียญ</div>
      <div v-for="r in RARITIES" :key="r" class="lab-fuse">
        <span class="lab-fuse-txt">{{ RARITY[r]?.label }}</span>
        <span class="lab-fuse-cost">{{ REDEEM_COIN[r].toLocaleString() }}/copy</span>
        <button class="lab-btn" :class="{ ok: copyTotal(r) > 0 }"
          :disabled="busy || copyTotal(r) === 0"
          @click="openRedeem(r)">แลก</button>
      </div>
    </div>

    <!-- spend picker -->
    <SpendCopiesModal v-if="pending" :rarity="pending.rarity" :mode="pending.mode" :required="pending.required"
      @confirm="onConfirm" @cancel="pending = null" />

    <!-- fusion reveal -->
    <Teleport to="body">
      <div v-if="reveal" class="ov" @click.self="reveal = null">
        <div class="rv-box">
          <div class="rv-label">หลอมได้!</div>
          <div class="rv-emoji" :style="{ filter: `drop-shadow(0 0 14px ${rarityColor(reveal.rarity)})` }"><Emoji :char="reveal.emoji" /></div>
          <div class="rv-nm">{{ reveal.name }}</div>
          <div class="rv-badge" :style="{ background: rarityColor(reveal.rarity) }">{{ reveal.isNew ? 'ใหม่!' : '+1 copy' }}</div>
          <button class="rv-ok" @click="reveal = null">เยี่ยม!</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Emoji from '../shared/Emoji.vue'
import { increment } from 'firebase/firestore'
import { useAuthStore } from '../../stores/auth.js'
import { useToast } from '../../composables/useToast.js'
import { PETS, RARITY } from '../../data/index.js'
import { mergeRolls } from '../../utils/gachaMerge.js'
import { FUSION_COST, REDEEM_COIN, nextRarity, rarityCopyTotal, applyCopySpend, fuseRoll, redeemValue } from '../../utils/lab.js'
import SpendCopiesModal from './SpendCopiesModal.vue'

const auth = useAuthStore()
const { toast } = useToast()

const RARITIES = ['common', 'rare', 'epic', 'legendary']
const FUSE_SRC = ['common', 'rare', 'epic']
const pets = computed(() => auth.userData?.pets || [])
const copyTotal = (r) => rarityCopyTotal(pets.value, r)
const rarityColor = (r) => RARITY[r]?.color || '#94a3b8'

const pending = ref(null) // { mode, rarity, required }
const reveal = ref(null)  // summary entry
const busy = ref(false)

function openFusion(src) { pending.value = { mode: 'fusion', rarity: src, required: FUSION_COST[src] } }
function openRedeem(r) { pending.value = { mode: 'redeem', rarity: r, required: 0 } }

async function onConfirm(allocation) {
  if (busy.value || !pending.value) return
  const { mode, rarity } = pending.value
  pending.value = null
  busy.value = true
  try {
    const petsAfter = applyCopySpend(pets.value, allocation)
    if (mode === 'fusion') {
      const id = fuseRoll(rarity, PETS)
      const { pets: finalPets, summary } = mergeRolls(petsAfter, [{ id }], PETS)
      const ok = await auth.patchUser({ pets: finalPets }, { pets: finalPets })
      if (ok) reveal.value = summary[0]
      else toast('หลอมไม่สำเร็จ', 'error')
    } else {
      const gain = redeemValue(allocation, rarity)
      const ok = await auth.patchUser(
        { pets: petsAfter, coins: (auth.userData?.coins || 0) + gain },
        { pets: petsAfter, coins: increment(gain) },
      )
      toast(ok ? `ได้ ${gain.toLocaleString()} เหรียญ` : 'แลกไม่สำเร็จ', ok ? 'success' : 'error')
    }
  } catch (e) {
    console.error('[lab]', e); toast('ทำรายการไม่สำเร็จ', 'error')
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.lab { display: flex; flex-direction: column; gap: 12px; }
.lab-bal { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.lab-bal-cell { display: flex; flex-direction: column; align-items: center; border: 2px solid; border-radius: 11px; padding: 8px 2px; background: #fff; }
.lab-bal-n { font-size: 1.2rem; font-weight: 800; }
.lab-bal-l { font-size: .52rem; font-weight: 700; color: rgba(0,0,0,.5); }
.lab-card { background: #fff; border: 2px solid var(--ink); border-radius: 16px; padding: 12px; box-shadow: var(--pop); }
.lab-card-h { font-weight: 800; font-size: .9rem; margin-bottom: 10px; }
.lab-fuse { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-top: 1px solid rgba(0,0,0,.06); }
.lab-fuse:first-of-type { border-top: none; }
.lab-fuse-txt { flex: 1; font-size: .78rem; font-weight: 700; }
.lab-fuse-cost { font-size: .64rem; color: rgba(0,0,0,.5); font-weight: 700; }
.lab-btn { border: 2px solid var(--ink); border-radius: 10px; padding: 7px 14px; font-family: inherit; font-weight: 800; font-size: .76rem; color: #fff; background: #c9c2d4; cursor: pointer; }
.lab-btn.ok { background: var(--primary); box-shadow: var(--pop); }
.lab-btn:disabled { opacity: .55; cursor: default; box-shadow: none; }
.ov { position: fixed; inset: 0; z-index: 410; background: rgba(0,0,0,.55); display: flex; align-items: center; justify-content: center; padding: 24px; }
.rv-box { background: #fff; border: 2px solid var(--ink); border-radius: 22px; box-shadow: var(--pop-lg); padding: 26px 22px; text-align: center; max-width: 300px; width: 100%; }
.rv-label { font-size: .8rem; color: rgba(0,0,0,.5); }
.rv-emoji { font-size: 4rem; margin: 8px 0; }
.rv-nm { font-family: var(--font-display); font-weight: 400; font-size: 1.3rem; }
.rv-badge { display: inline-block; color: #fff; font-size: .6rem; font-weight: 800; padding: 3px 12px; border-radius: 999px; margin-top: 8px; }
.rv-ok { display: block; width: 100%; margin-top: 16px; border: 2px solid var(--ink); border-radius: 12px; padding: 11px; font-family: inherit; font-weight: 800; color: #fff; background: var(--primary); box-shadow: var(--pop); cursor: pointer; }
</style>
```

- [ ] **Step 2: build ยืนยัน**

Run: `npm run build`
Expected: build ผ่าน ไม่มี error import

- [ ] **Step 3: commit**

```bash
git add src/components/shop/LabTab.vue
git commit -m "Lab: LabTab — ยอด copies + fusion 3 ชั้น + แลกเหรียญ + reveal (เขียนผ่าน patchUser)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: ShopView — เพิ่ม tab switcher `[อัญเชิญ | ห้องทดลอง]`

**Files:**
- Modify: `src/views/ShopView.vue`
- Test: manual (`npm run build` + ลองมือ)

**Interfaces:**
- Consumes: `LabTab` (Task 3)

- [ ] **Step 1: เพิ่ม import + state**

ใน `src/views/ShopView.vue` `<script setup>` เพิ่ม import (ใกล้ import component อื่น) และ state `tab` (วางใกล้ `const SHOP_OPEN`):
```js
import LabTab from '../components/shop/LabTab.vue'
```
```js
const tab = ref('gacha') // 'gacha' | 'lab'
```
(ตรวจว่ามี `ref` ใน import จาก vue แล้ว — ไฟล์นี้ใช้ `ref` อยู่แล้ว)

- [ ] **Step 2: เพิ่ม tab switcher + ครอบเนื้อหา**

ในบล็อก `<template v-else-if="authStore.isLoggedIn">` แทนที่:
```html
      <div class="shop-storage">
        <Emoji char="🐾" /> สัตว์เลี้ยง {{ pets.length }}/{{ PETS.length }} ชนิด
      </div>
```
ด้วย:
```html
      <div class="shop-tabs">
        <button class="shop-tab" :class="{ on: tab === 'gacha' }" @click="tab = 'gacha'"><Emoji char="🎰" /> อัญเชิญ</button>
        <button class="shop-tab" :class="{ on: tab === 'lab' }" @click="tab = 'lab'"><Emoji char="🧪" /> ห้องทดลอง</button>
      </div>

      <LabTab v-if="tab === 'lab'" />
      <template v-else>
      <div class="shop-storage">
        <Emoji char="🐾" /> สัตว์เลี้ยง {{ pets.length }}/{{ PETS.length }} ชนิด
      </div>
```
จากนั้นหา `</template>` ปิดของ `v-else-if="authStore.isLoggedIn"` (บรรทัดก่อน `<div v-else class="shop-login">`) แล้วเพิ่ม `</template>` อีกอันก่อนหน้ามัน เพื่อปิด `<template v-else>` ที่เพิ่งเปิด — โครงเป็น:
```html
        ...
        <div class="shop-note">สุ่ม 10 ได้ 11 ตัว · ตัวซ้ำ → +1 copy (ใช้อัพเกรด)</div>
      </template>
    </template>
    <div v-else class="shop-login">เข้าสู่ระบบเพื่อช้อป</div>
```
(ผล: เมื่อ `tab==='gacha'` แสดง banner เดิมทั้งหมด · `tab==='lab'` แสดง `<LabTab/>` — gate `shopOpen` เดิมยังครอบทั้งสอง)

- [ ] **Step 3: เพิ่ม CSS tab**

ต่อท้าย `<style scoped>` ของ ShopView:
```css
.shop-tabs { display: flex; gap: 8px; margin-bottom: 12px; }
.shop-tab { flex: 1; border: 2px solid var(--ink); border-radius: 11px; padding: 9px; font-family: inherit; font-weight: 800; font-size: .82rem; background: #fff; color: var(--ink); cursor: pointer; }
.shop-tab.on { background: var(--gold); }
```

- [ ] **Step 4: build + ลองมือ**

Run: `npm run build`
Expected: build ผ่าน

ลองมือ (login admin → Shop): สลับแท็บ อัญเชิญ↔ห้องทดลอง · ห้องทดลองโชว์ยอด copies 4 ระดับ · กดหลอม (เปิด picker, auto, ยืนยัน → reveal) · กดแลก (เลือก copies → ได้เหรียญ) · ปุ่ม disable เมื่อ copies ไม่พอ

- [ ] **Step 5: commit**

```bash
git add src/views/ShopView.vue
git commit -m "Shop: เพิ่มแท็บ ห้องทดลอง คู่กับ อัญเชิญ (tab switcher + LabTab)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## หมายเหตุปิดงาน (หลังครบทุก task)
- build รอบสุดท้าย + ลองมือครบ flow (fusion 3 ชั้น / แลกเหรียญ / auto / disable / reveal)
- ไม่แตะ rules/index/userSchema/migration · push เมื่อ user สั่ง (Shop ยัง `SHOP_OPEN=false`)
- ตัวเลข fusion/redeem = draft pin จูนทีหลังได้ใน `utils/lab.js`
