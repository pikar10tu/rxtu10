<template>
  <!-- Teleport ไป body: #main-content เป็น position:fixed = สร้าง stacking context
       → overlay ที่ render ใต้ RouterView ถูกขังในนั้น z-index สู้ #bottom-nav (z200) ที่ root ไม่ได้
       → nav เพนต์ทับก้น sheet. ย้ายไประดับ root ให้ z-index มีผลจริง (ดู BottomSheet.vue / CLAUDE.md) -->
  <Teleport to="body">
  <div v-if="open" class="sp-ov" @click.self="$emit('close')">
    <div class="sp-box">
      <div class="sp-head">
        <span><Emoji char="🌱" /> เลือกเมล็ดพันธุ์</span>
        <button class="sp-x" aria-label="ปิด" @click="$emit('close')">✕</button>
      </div>
      <!-- ปลูกทุกแปลงว่างทีเดียว (มีแปลงว่าง ≥ 2) — จำค่าที่เลือกล่าสุดไว้ในเครื่อง -->
      <label v-if="emptyCount >= 2" class="sp-all">
        <input v-model="all" type="checkbox"> ปลูกทุกแปลงว่าง ({{ emptyCount }} แปลง)
      </label>
      <!-- 24 พ.ย. พืช 28 ชนิด เลื่อนยาว → แท็บตามเวลาปลูก + การ์ด 3 คอลัมน์ (ตัดเวลาเสร็จ/ราคาขายออก — user ว่ารก) -->
      <div class="sp-tabs" role="tablist">
        <button v-for="t in tabs" :key="t.key" role="tab" :aria-selected="tab === t.key" :class="{ on: tab === t.key }" @click="tab = t.key">
          {{ t.label }} <small>{{ t.n }}</small>
        </button>
      </div>
      <div class="sp-grid">
        <button
          v-for="c in list"
          :key="c.id"
          class="sp-tile"
          :class="{ focus: c.id === focus }"
          :disabled="coins < c.seedCost"
          @click="$emit('pick', c.id, allOn)"
        >
          <span v-if="mkt.pctOf(c.id)" class="sp-hot">🔥+{{ mkt.pctOf(c.id) }}%</span>
          <span v-if="starsOf(c)" class="sp-stars">{{ "★".repeat(starsOf(c)) }}</span>
          <span class="sp-emoji"><Emoji :char="c.emoji" /></span>
          <span class="sp-name">{{ c.name }}</span>
          <span class="sp-meta"><Emoji char="⏱" /> {{ growLabel(c) }}</span>
          <span class="sp-cost" :class="{ no: coins < c.seedCost }">{{ costOf(c).toLocaleString() }}<Emoji char="🪙" /><small v-if="allOn"> ×{{ nOf(c) }}</small></span>
        </button>
      </div>
      <div v-if="!list.length" class="sp-none">ยังไม่มีพืชกลุ่มนี้ที่ปลดล็อก</div>
    </div>
  </div>
  </Teleport>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { growLabel, growMs } from '../../data/crops.js'
import { useFarmMarket } from '../../composables/useFarmMarket.js'
const mkt = useFarmMarket()
import { ref, computed, watch } from 'vue'
import { masteryStars } from '../../data/farmMastery.js'
import { useFarm } from '../../composables/useFarm.js'
import { useEscapeKey } from '../../composables/useEscapeKey.js'
const props = defineProps({
  open: Boolean,
  choices: { type: Array, default: () => [] },
  coins: { type: Number, default: 0 },
  emptyCount: { type: Number, default: 0 },
  focus: { type: String, default: null },   // มาจากออเดอร์ "ปลูกเลย" → ยกเมล็ดนี้ขึ้นบนสุด + ไฮไลต์
})
const mins = (c) => growMs(c.id) / 60000
const TABS = [
  { key: 'all', label: 'ทั้งหมด', test: () => true },
  { key: 'fast', label: '⚡ ≤1 ชม.', test: c => mins(c) <= 60 },
  { key: 'mid', label: '🌤️ 2–8 ชม.', test: c => mins(c) > 60 && mins(c) <= 480 },
  { key: 'long', label: '🌙 ข้ามคืน', test: c => mins(c) > 480 },
]
const TAB_KEY = 'rxtu-farm-seed-tab'
const tab = ref((() => { try { return localStorage.getItem(TAB_KEY) || 'all' } catch { return 'all' } })())
watch(tab, (v) => { try { localStorage.setItem(TAB_KEY, v) } catch { /* ignore */ } })
// มาจากออเดอร์ → สลับไปแท็บที่มีเมล็ดนั้น
watch(() => [props.open, props.focus], () => {
  const f = props.choices.find(c => c.id === props.focus)
  if (props.open && f && !TABS.find(t => t.key === tab.value).test(f)) tab.value = 'all'
})
const tabs = computed(() => TABS.map(t => ({ ...t, n: props.choices.filter(t.test).length })).filter(t => t.key === 'all' || t.n))
const list = computed(() => {
  const t = TABS.find(x => x.key === tab.value) || TABS[0]
  const rows = props.choices.filter(t.test)   // คงลำดับเดิม (เรียงความคุ้มอยู่แล้ว)
  const f = rows.find(c => c.id === props.focus)
  return f ? [f, ...rows.filter(c => c !== f)] : rows
})
const ALL_KEY = 'rxtu-farm-plant-all'
const all = ref((() => { try { return localStorage.getItem(ALL_KEY) === '1' } catch { return false } })())
watch(all, (v) => { try { localStorage.setItem(ALL_KEY, v ? '1' : '0') } catch { /* ignore */ } })
const allOn = computed(() => all.value && props.emptyCount >= 2)
const nOf = (c) => allOn.value ? Math.min(props.emptyCount, Math.max(1, Math.floor(props.coins / c.seedCost))) : 1
const costOf = (c) => c.seedCost * nOf(c)
const emit = defineEmits(['pick', 'close'])
useEscapeKey(() => props.open, () => emit('close'))
const farm = useFarm()
const starsOf = (c) => masteryStars(farm.harvests.value[c.id])
</script>

<style scoped>
/* z-index > #bottom-nav (200) — มีผลจริงเพราะ Teleport ไป body แล้ว (ไม่งั้นโดน stacking context ขัง) */
.sp-ov { position: fixed; inset: 0; z-index: 410; background: rgba(0,0,0,.45); display: flex; align-items: flex-end; justify-content: center; }
.sp-box { background: #fff; width: 100%; max-width: 480px; height: 82vh; border-radius: 18px 18px 0 0; display: flex; flex-direction: column; }
.sp-head { display: flex; justify-content: space-between; align-items: center; padding: 16px; font-weight: 800; border-bottom: 1px solid rgba(0,0,0,.07); }
.sp-x { border: none; background: rgba(0,0,0,.06); border-radius: 8px; width: 30px; height: 30px; cursor: pointer; }
.sp-tabs { flex-shrink: 0; display: flex; gap: 6px; overflow-x: auto; padding: 10px 12px 0; scrollbar-width: none; }
.sp-tabs::-webkit-scrollbar { display: none; }
.sp-tabs button { flex-shrink: 0; font: inherit; font-size: .76rem; font-weight: 700; border: 1px solid rgba(0,0,0,.1); background: #fff; color: rgba(0,0,0,.6); border-radius: 999px; padding: 6px 12px; cursor: pointer; white-space: nowrap; }
.sp-tabs button small { font-size: .7rem; opacity: .65; }
.sp-tabs button.on { background: #3e7a2a; border-color: #3e7a2a; color: #fff; }
.sp-grid { overflow-y: auto; overscroll-behavior: contain; padding: 10px 10px calc(12px + env(safe-area-inset-bottom, 0px)); display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; align-content: start; }
.sp-tile { position: relative; display: flex; flex-direction: column; align-items: center; gap: 1px; min-width: 0; padding: 12px 4px 8px; border: 1px solid rgba(0,0,0,.08); border-radius: 12px; background: linear-gradient(180deg, #fff, rgba(76,175,80,.06)); cursor: pointer; font-family: inherit; text-align: center; }
.sp-tile:disabled { opacity: .45; cursor: not-allowed; }
.sp-tile:active:not(:disabled) { transform: scale(.97); }
.sp-tile.focus { border: 2px solid #5b9fe0; background: rgba(91,159,224,.08); }
.sp-emoji { font-size: 1.7rem; line-height: 1.1; margin-bottom: 2px; }
.sp-name { font-weight: 800; font-size: .76rem; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--ink, #2b3550); }
.sp-meta { font-size: .7rem; color: rgba(0,0,0,.5); white-space: nowrap; }
.sp-stars { position: absolute; top: 3px; left: 5px; color: #f0b400; font-size: .7rem; letter-spacing: -1px; }
.sp-hot { position: absolute; top: 3px; right: 3px; font-size: .7rem; font-weight: 800; color: #c2410c; background: #ffedd5; border-radius: 999px; padding: 0 5px; }
.sp-cost { margin-top: 3px; font-weight: 800; font-size: .76rem; color: #b45309; white-space: nowrap; }
.sp-cost small { font-size: .7rem; font-weight: 700; }
.sp-cost.no { color: #ef4444; }
.sp-none { padding: 24px; text-align: center; font-size: .78rem; color: rgba(0,0,0,.45); }
.sp-all { display: flex; align-items: center; gap: 8px; margin: 10px 12px 0; padding: 9px 12px; border-radius: 12px; background: var(--mint-light, #e9f8f1); font-size: .82rem; font-weight: 700; cursor: pointer; }
.sp-all input { width: 18px; height: 18px; accent-color: var(--primary); }
</style>
