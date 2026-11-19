<!-- 🧍 ห้องแต่งตัว (A2 18 พ.ย. → รวมร้านตกแต่ง 19 พ.ย. 2026 · เดโมที่ user เคาะ https://claude.ai/artifact/Azb2LtVreDKbV3tAvxe9YT)
     3 หมวด: 🧑 ตัวละคร (ฟรีเกือบหมด ยกเว้นทรงผม) · 👕 แต่งตัว · 🪪 การ์ดโปรไฟล์ (= ร้านตกแต่งเดิม CosmeticShop ทั้งก้อน)
     แตะชิ้น = ลองใส่ทันที (ยังไม่ซื้อ) · ปุ่มล่าง: ซื้อรวดเดียวทั้งชุดที่ลอง / ใส่ชุดนี้ / ย้อนกลับ
     ช่องของ = รูปย่อแค่ตัวของ (DollThumb) · เรียง มีแล้ว→ยังไม่มี ถูก→แพง (กดใส่แล้วไม่ย้ายที่ — user งงถ้าสลับ)
     ตรรกะอยู่ใน utils/doll.js (มีเทสต์) · เขียน user doc ผ่าน patchUser เท่านั้น · ใส่/ซื้อแล้ว sync แถว roster (รหัสตุ๊กตา dl) -->
<template>
  <div class="dv">
    <header class="dv-top">
      <BackButton />
      <h1 class="dv-title">ห้องแต่งตัว</h1>
      <span class="dv-coins"><Emoji char="🪙" /> {{ coins.toLocaleString() }}</span>
    </header>

    <!-- ตัวละคร + ปุ่มลัด (หมวดการ์ดโปรไฟล์ใช้การ์ดพรีวิวของร้านตกแต่งเอง) -->
    <div v-if="group !== 'card'" class="dv-stage">
      <div class="dv-fig">
        <DollFigure :eq="trying" :scale="5" label="ตัวละครที่กำลังลอง" />
        <span v-for="s in sets" :key="s.id" class="dv-set"><Emoji char="🎁" /> {{ s.label }}</span>
        <div class="dv-note">{{ changed ? (cart.items.length ? `กำลังลอง · ต้องซื้อ ${cart.items.length} ชิ้น` : 'กำลังลอง · มีครบแล้ว') : 'ที่ใส่อยู่ตอนนี้' }}</div>
      </div>
      <div class="dv-side">
        <button class="dv-mini" @click="randomize"><Emoji char="🎲" /> สุ่มชุด</button>
        <button class="dv-mini" @click="stripAll">↺ ถอดทั้งหมด</button>
        <div class="dv-lab">ชุดโปรด</div>
        <div class="dv-slots">
          <button
            v-for="(sv, i) in saved" :key="i" class="dv-slot" :class="{ on: sv }"
            :aria-label="sv ? `ใส่ชุดโปรด ${i + 1}` : `บันทึกชุดที่ลองไว้ในช่อง ${i + 1}`"
            @click="sv ? useSaved(i) : saveSlot(i)"
          >{{ sv ? i + 1 : '+' }}</button>
        </div>
        <button v-if="saved.some(Boolean)" class="dv-link" @click="editSaved = !editSaved">{{ editSaved ? 'เสร็จ' : 'บันทึกทับ' }}</button>
        <div v-if="editSaved" class="dv-slots">
          <button v-for="(sv, i) in saved" :key="i" class="dv-slot over" :aria-label="`บันทึกทับช่อง ${i + 1}`" @click="saveSlot(i)">{{ i + 1 }}</button>
        </div>
      </div>
    </div>

    <div class="dv-groups" role="tablist">
      <button v-for="g in GROUPS" :key="g.k" class="dv-group" :class="{ on: group === g.k }" role="tab" :aria-selected="group === g.k" @click="setGroup(g.k)">
        <Emoji :char="g.icon" /> {{ g.label }}
      </button>
    </div>

    <!-- 🪪 การ์ดโปรไฟล์ = ร้านตกแต่งเดิม (ซื้อ/ใส่แยกของมันเอง) -->
    <CosmeticShop v-if="group === 'card'" />

    <template v-else>
      <div class="dv-tabs" role="tablist">
        <button v-for="t in groupTabs" :key="t.k" class="dv-tab" :class="{ on: tab === t.k, covered: coveredTab(t.k) }" role="tab" :aria-selected="tab === t.k" @click="tab = t.k">
          {{ t.label }}
        </button>
      </div>
      <p v-if="coveredTab(tab)" class="dv-hint">ชุดเต็มตัวที่ลองอยู่บังช่องนี้ · เลือกชิ้นในนี้ = ถอดชุดเต็มตัวออก</p>

      <!-- สีผิว / สีผม -->
      <div v-if="tab === 's' || tab === 'c'" class="dv-colors">
        <button v-for="o in (tab === 's' ? SKINS : HAIRC)" :key="o.id" class="dv-color" :class="{ sel: trying[tab] === o.id }"
                :style="{ background: tab === 's' ? o.S : o.H }" :aria-label="o.label" :title="o.label" @click="pick(tab, o.id)">
          <span class="dv-color-l">{{ o.label }}</span>
        </button>
      </div>

      <template v-else>
        <div class="dv-filter">
          <button v-for="f in FILTERS" :key="f.k" class="dv-chip" :class="{ on: filter === f.k }" @click="filter = f.k">{{ f.label }}</button>
        </div>
        <template v-for="(sec, si) in sections" :key="sec.title || si">
          <div v-if="sec.title" class="dv-sec">{{ sec.title }} · {{ sec.list.length }}</div>
          <div class="dv-grid">
            <button v-if="si === 0 && !REQUIRED.includes(tab)" class="dv-item" :class="{ sel: !trying[tab] }" @click="pick(tab, null)">
              <span class="dv-none">ไม่ใส่</span>
            </button>
            <button v-for="p in sec.list" :key="p.id" class="dv-item" :class="{ sel: trying[p.slot] === p.id }" @click="pick(p.slot, p.id)">
              <span v-if="p.full" class="dv-bd full" title="ชุดเต็มตัว: ใส่แล้วแทนทั้งเสื้อและท่อนล่าง">👗</span>
              <span v-if="NEW_PARTS.has(p.id)" class="dv-bd new" :class="{ low: p.full }">ใหม่</span>
              <span v-if="p.aura" class="dv-bd au" title="มีออร่า">✨</span>
              <DollThumb :id="p.id" :eq="trying" />
              <span class="dv-nm">{{ p.label }}</span>
              <span v-if="mine.eq[p.slot] === p.id" class="dv-st on">ใส่อยู่</span>
              <span v-else-if="has(p.id)" class="dv-st">มีแล้ว</span>
              <span v-else class="dv-price"><Emoji char="🪙" /> {{ fmt(p.price) }}</span>
            </button>
          </div>
        </template>
        <p v-if="!sections.some(s => s.list.length)" class="dv-hint">ไม่มีของในตัวกรองนี้</p>
      </template>
    </template>

    <!-- ปุ่มติดขอบล่าง -->
    <div v-if="changed && group !== 'card'" class="dv-dock">
      <button class="dv-btn ghost" :disabled="busy" @click="reset">ย้อนกลับ</button>
      <button v-if="cart.items.length" class="dv-btn" :disabled="busy || !buy.ok" @click="doBuy">
        <template v-if="buy.reason === 'coins'">เหรียญไม่พอ (ขาด {{ (cart.total - coins).toLocaleString() }})</template>
        <template v-else>ซื้อ {{ cart.items.length }} ชิ้นแล้วใส่ · <Emoji char="🪙" /> {{ cart.total.toLocaleString() }}</template>
      </button>
      <button v-else class="dv-btn" :disabled="busy" @click="doEquip">ใส่ชุดนี้</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { increment } from 'firebase/firestore'
import BackButton from '../components/shared/BackButton.vue'
import Emoji from '../components/shared/Emoji.vue'
import DollFigure from '../components/doll/DollFigure.vue'
import DollThumb from '../components/doll/DollThumb.vue'
import CosmeticShop from '../components/shop/CosmeticShop.vue'
import { PARTS, PART, SKINS, HAIRC, SLOTS, REQUIRED, LOOK_SLOTS, WEAR_TABS, DEFAULT_EQ, NEW_PARTS } from '../data/dollParts.js'
import { dollOf, tryOn, cartFor, canBuyCart, afterBuyCart, afterEquip, sameEq, isFree, setsWorn } from '../utils/doll.js'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from '../composables/useToast.js'
import { useConfirm } from '../composables/useConfirm.js'
import { useRosterSync } from '../composables/useRosterSync.js'
import { sfx } from '../utils/sfx.js'

const auth = useAuthStore()
const route = useRoute()
const { toast } = useToast()
const { confirm } = useConfirm()
const { syncRosterRow } = useRosterSync()

const TABS = [{ k: 's', label: 'สีผิว' }, { k: 'c', label: 'สีผม' }, ...SLOTS]
const GROUPS = [
  { k: 'look', icon: '🧑', label: 'ตัวละคร', slots: LOOK_SLOTS, first: 'h' },
  { k: 'wear', icon: '👕', label: 'แต่งตัว', slots: WEAR_TABS, first: 't' },
  { k: 'card', icon: '🪪', label: 'การ์ดโปรไฟล์', slots: [], first: null },
]
const FILTERS = [{ k: 'all', label: 'ทั้งหมด' }, { k: 'own', label: 'มีแล้ว' }, { k: 'not', label: 'ยังไม่มี' }, { k: 'new', label: 'ใหม่' }]
// ?g=card = ลิงก์จากร้านค้าเดิม (แท็บร้านตกแต่ง) พามาหมวดการ์ดโปรไฟล์
const group = ref(GROUPS.some(g => g.k === route.query.g) ? route.query.g : 'wear')
const tab = ref(GROUPS.find(g => g.k === group.value).first || 't')
const filter = ref('all')
const groupTabs = computed(() => GROUPS.find(x => x.k === group.value).slots.map(k => TABS.find(t => t.k === k)))
function setGroup(k) { group.value = k; const f = GROUPS.find(x => x.k === k).first; if (f) tab.value = f }
const busy = ref(false)

const coins = computed(() => auth.userData?.coins || 0)
const mine = computed(() => dollOf(auth.userData))
const trying = ref({ ...mine.value.eq })
// ชุดที่ใส่อยู่เปลี่ยน (ซื้อ/ใส่สำเร็จ หรือ snapshot มาทีหลัง) และยังไม่ได้ลองอะไร → ตามของจริง
watch(() => mine.value.eq, (eq, old) => { if (!old || sameEq(trying.value, old)) trying.value = { ...eq } })

const has = (id) => isFree(id) || mine.value.owned.includes(id)
const changed = computed(() => !sameEq(trying.value, mine.value.eq))
const cart = computed(() => cartFor(auth.userData, trying.value))
const buy = computed(() => canBuyCart(auth.userData, trying.value))
const sets = computed(() => setsWorn(trying.value))
const coveredTab = (k) => k === 'b' && !!PART[trying.value.t]?.full
const fmt = (n) => n >= 1e6 ? `${(n / 1e6).toLocaleString(undefined, { maximumFractionDigits: 1 })}M` : `${n / 1000}k`

// hidden = ซ่อนจากตู้ (เช่น ครุย 19 พ.ย.) · ใครใส่อยู่แล้วยังเห็นชิ้นนั้น
const visible = (slot) => PARTS.filter(p => p.slot === slot && (!p.hidden || mine.value.eq[slot] === p.id))
// เรียง: มีแล้ว → ยังไม่มี · ถูก→แพง · ราคาเท่ากันตามชื่อ (สีของชิ้นเดียวกันชื่อขึ้นต้นเหมือนกันเลยอยู่ติดกัน)
const sortParts = (list) => list.slice().sort((a, b) => (has(a.id) ? 0 : 1) - (has(b.id) ? 0 : 1) || a.price - b.price || a.label.localeCompare(b.label, 'th'))
const sections = computed(() => {
  let list = visible(tab.value)
  if (filter.value === 'own') list = list.filter(p => has(p.id))
  if (filter.value === 'not') list = list.filter(p => !has(p.id))
  if (filter.value === 'new') list = list.filter(p => NEW_PARTS.has(p.id))
  // แท็บเสื้อแบ่งตามประเภท: เสื้อ (รวมกาวน์/แจ็กเก็ต) · ชุดเต็มตัว
  if (tab.value === 't') return [{ title: 'เสื้อ', list: sortParts(list.filter(p => !p.full)) }, { title: '👗 ชุดเต็มตัว', list: sortParts(list.filter(p => p.full)) }]
  return [{ title: null, list: sortParts(list) }]
})

function pick(slot, id) { trying.value = tryOn(trying.value, slot, id) }
function reset() { trying.value = { ...mine.value.eq } }
function stripAll() { trying.value = { ...DEFAULT_EQ, s: trying.value.s, c: trying.value.c } }   // คงสีผิว/สีผมไว้
function randomize() {
  const pickOne = (a) => a[Math.floor(Math.random() * a.length)]
  const eq = { s: trying.value.s, c: trying.value.c }
  for (const k of [...LOOK_SLOTS, ...WEAR_TABS]) {
    if (k === 's' || k === 'c') continue
    const list = PARTS.filter(p => p.slot === k && !p.hidden)
    if (list.length && (REQUIRED.includes(k) || Math.random() < 0.45)) eq[k] = pickOne(list).id
  }
  if (PART[eq.t]?.full) delete eq.b
  else if (!eq.b) eq.b = DEFAULT_EQ.b
  trying.value = eq
}

// 💾 ชุดโปรด 3 ช่อง — users/{uid}.dollSaved = [eq|null ×3] (เก็บชุดที่ลอง รวมของที่ยังไม่ซื้อได้ ใส่แล้วค่อยขึ้นตะกร้า)
const saved = computed(() => {
  const a = Array.isArray(auth.userData?.dollSaved) ? auth.userData.dollSaved : []
  return [0, 1, 2].map(i => (a[i] && typeof a[i] === 'object' ? a[i] : null))
})
const editSaved = ref(false)
function useSaved(i) { const sv = saved.value[i]; if (sv) trying.value = { ...DEFAULT_EQ, ...sv } }
async function saveSlot(i) {
  const next = saved.value.slice()
  next[i] = { ...trying.value }
  const ok = await auth.patchUser({ dollSaved: next }, { dollSaved: next })
  editSaved.value = false
  toast(ok ? `บันทึกชุดโปรด ${i + 1} แล้ว` : 'บันทึกไม่สำเร็จ', ok ? 'success' : 'error')
}

async function doBuy() {
  // ⚠️ หยิบค่าก่อน patchUser (CLAUDE.md ข้อ 9)
  const eq = { ...trying.value }
  const check = canBuyCart(auth.userData, eq)
  if (!check.ok) return
  const { items, total } = cartFor(auth.userData, eq)
  const names = items.map(p => p.label).join(', ')
  const ok = await confirm(`ซื้อ ${items.length} ชิ้น (${names}) ราคารวม ${total.toLocaleString()} เหรียญ?\nซื้อแล้วเก็บถาวร ใส่/ถอดได้ตลอด`)
  if (!ok) return
  busy.value = true
  const next = afterBuyCart(auth.userData, eq)
  const done = await auth.patchUser(
    { coins: coins.value - total, totalSpent: (auth.userData?.totalSpent || 0) + total, doll: next },
    { coins: increment(-total), totalSpent: increment(total), doll: next },
  )
  busy.value = false
  if (!done) { toast('ซื้อไม่สำเร็จ', 'error'); return }
  trying.value = { ...next.eq }
  sfx('coin')
  toast(`ได้ ${items.length} ชิ้นแล้ว ใส่ให้เลย`, 'success')
  syncRosterRow()
}

async function doEquip() {
  const next = afterEquip(auth.userData, { ...trying.value })
  busy.value = true
  const done = await auth.patchUser({ doll: next }, { doll: next })
  busy.value = false
  if (!done) { toast('บันทึกไม่สำเร็จ', 'error'); return }
  trying.value = { ...next.eq }
  toast('ใส่ชุดนี้แล้ว', 'success')
  syncRosterRow()
}
</script>

<style scoped>
.dv { display: flex; flex-direction: column; gap: 12px; padding: 12px 14px 0; min-height: 100%; }
.dv-top { display: flex; align-items: center; gap: 10px; }
.dv-title { flex: 1; margin: 0; font-size: 1.15rem; font-weight: 800; color: var(--ink); }
.dv-coins { font-size: .85rem; font-weight: 800; color: #b7791f; font-variant-numeric: tabular-nums; }
.dv-stage { display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: end; padding: 12px 10px 10px; border-radius: 22px; background: linear-gradient(160deg, #e3effb, #fff 60%, #fde2ee); border: var(--bw) solid var(--line); box-shadow: var(--pop); }
.dv-fig { display: grid; justify-items: center; gap: 4px; }
.dv-set { font-size: .72rem; font-weight: 800; background: #fff4d6; color: #a06b00; border-radius: 999px; padding: 1px 10px; }
.dv-note { font-size: .72rem; color: var(--muted); font-weight: 700; }
.dv-side { display: flex; flex-direction: column; gap: 6px; align-items: stretch; }
.dv-mini { font: inherit; font-size: .74rem; font-weight: 700; border: var(--bw) solid var(--line); background: var(--surface); color: var(--ink); border-radius: 10px; padding: 6px 9px; cursor: pointer; white-space: nowrap; }
.dv-lab { font-size: .72rem; font-weight: 800; color: var(--muted); margin-top: 2px; }
.dv-slots { display: flex; gap: 4px; }
.dv-slot { width: 34px; height: 34px; font: inherit; font-size: .78rem; font-weight: 800; border: 1.5px dashed var(--line); background: var(--surface); color: var(--muted); border-radius: 10px; cursor: pointer; padding: 0; }
.dv-slot.on { border-style: solid; border-color: var(--primary); color: var(--primary-dark); }
.dv-slot.over { border-style: solid; border-color: #e0a93a; color: #a06b00; }
.dv-link { font: inherit; font-size: .7rem; font-weight: 700; color: var(--muted); background: none; border: 0; padding: 0; cursor: pointer; text-decoration: underline; text-align: left; }
.dv-groups { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; background: var(--surface); border: var(--bw) solid var(--line); border-radius: 14px; padding: 4px; }
.dv-group { font: inherit; font-size: .8rem; font-weight: 800; border: 0; border-radius: 10px; padding: 8px 2px; background: none; color: var(--muted); cursor: pointer; }
.dv-group.on { background: var(--primary); color: #fff; }
.dv-tabs { display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
.dv-tab { flex: none; font: inherit; font-size: .78rem; font-weight: 700; border: var(--bw) solid var(--line); background: var(--surface); color: var(--muted); border-radius: 999px; padding: 6px 12px; cursor: pointer; }
.dv-tab.on { background: var(--primary); border-color: var(--primary); color: #fff; }
.dv-tab.covered:not(.on) { opacity: .55; }
.dv-filter { display: flex; gap: 4px; flex-wrap: wrap; }
.dv-chip { font: inherit; font-size: .74rem; font-weight: 700; border: var(--bw) solid var(--line); background: var(--surface); color: var(--muted); border-radius: 999px; padding: 4px 11px; cursor: pointer; }
.dv-chip.on { background: var(--primary-light); border-color: var(--primary); color: var(--primary-dark); }
.dv-hint { margin: 0; font-size: .75rem; color: var(--muted); }
.dv-colors { display: grid; grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)); gap: 8px; }
.dv-color { font: inherit; height: 56px; border-radius: 14px; border: 2px solid var(--line); cursor: pointer; display: flex; align-items: flex-end; justify-content: center; padding: 4px; }
.dv-color.sel { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(53,147,207,.22); }
.dv-color-l { font-size: .7rem; font-weight: 700; background: rgba(255,255,255,.85); color: var(--ink); border-radius: 999px; padding: 0 6px; }
.dv-sec { font-size: .78rem; font-weight: 800; color: var(--muted); margin: 2px 2px -4px; }
.dv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(78px, 1fr)); gap: 6px; padding-bottom: 6px; }
.dv-item { position: relative; font: inherit; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 5px 4px 7px; background: var(--surface); border: 1.5px solid var(--line); border-radius: 14px; cursor: pointer; color: var(--ink); min-width: 0; }
.dv-item.sel { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(53,147,207,.18); background: var(--primary-light); }
.dv-bd { position: absolute; top: 3px; z-index: 1; font-size: .7rem; font-weight: 800; border-radius: 999px; padding: 0 5px; line-height: 1.5; }
.dv-bd.full { left: 3px; background: #e3f1fb; padding: 0 3px; }
.dv-bd.new { left: 3px; background: var(--accent); color: #fff; }
.dv-bd.new.low { left: 26px; }
.dv-bd.au { right: 3px; background: #fff4d6; }
.dv-none { height: 96px; display: grid; place-items: center; font-size: .78rem; font-weight: 700; color: var(--muted); }
.dv-nm { font-size: .7rem; font-weight: 700; color: var(--muted); text-align: center; line-height: 1.2; }
.dv-price { font-size: .72rem; font-weight: 800; color: #b7791f; font-variant-numeric: tabular-nums; }
.dv-st { font-size: .7rem; font-weight: 800; color: var(--muted); }
.dv-st.on { color: var(--primary-dark); }
.dv-dock { position: sticky; bottom: 0; z-index: 3; display: flex; gap: 8px; padding: 10px 0 12px; background: linear-gradient(0deg, rgba(247,249,253,.97) 72%, rgba(247,249,253,0)); }
.dv-btn { flex: 1; font: inherit; font-size: .9rem; font-weight: 800; color: #fff; background: linear-gradient(135deg, var(--primary), var(--primary-2)); border: 0; border-radius: 14px; padding: 13px 10px; cursor: pointer; box-shadow: var(--pop); }
.dv-btn.ghost { flex: 0 0 auto; color: var(--primary-dark); background: var(--surface); border: var(--bw) solid var(--line); }
.dv-btn:disabled { background: #cbd5e1; color: #fff; cursor: default; }
</style>
