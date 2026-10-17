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
      <div class="sp-list">
        <button
          v-for="c in choices"
          :key="c.id"
          class="sp-item"
          :disabled="coins < c.seedCost"
          @click="$emit('pick', c.id, allOn)"
        >
          <span class="sp-emoji"><Emoji :char="c.emoji" /></span>
          <div class="sp-info">
            <div class="sp-name">{{ c.name }} <span v-if="starsOf(c)" class="sp-stars">{{ "★".repeat(starsOf(c)) }}</span></div>
            <div class="sp-meta"><Emoji char="⏱" /> {{ growLabel(c) }} (เสร็จ {{ doneAt(c) }}) · ขายได้ {{ c.sellPrice.toLocaleString() }}<Emoji char="🪙" /></div>
          </div>
          <span class="sp-cost" :class="{ no: coins < c.seedCost }">{{ (c.seedCost * (allOn ? Math.min(emptyCount, Math.max(1, Math.floor(coins / c.seedCost))) : 1)).toLocaleString() }}<Emoji char="🪙" /><small v-if="allOn"> ×{{ Math.min(emptyCount, Math.max(1, Math.floor(coins / c.seedCost))) }}</small></span>
        </button>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { growLabel, growMs } from '../../data/crops.js'
import { ref, computed, watch } from 'vue'
import { masteryStars } from '../../data/farmMastery.js'
import { useFarm } from '../../composables/useFarm.js'
import { useEscapeKey } from '../../composables/useEscapeKey.js'
const props = defineProps({
  open: Boolean,
  choices: { type: Array, default: () => [] },
  coins: { type: Number, default: 0 },
  emptyCount: { type: Number, default: 0 },
})
const ALL_KEY = 'rxtu-farm-plant-all'
const all = ref((() => { try { return localStorage.getItem(ALL_KEY) === '1' } catch { return false } })())
watch(all, (v) => { try { localStorage.setItem(ALL_KEY, v ? '1' : '0') } catch { /* ignore */ } })
const allOn = computed(() => all.value && props.emptyCount >= 2)
// เวลาเสร็จจริง (นาฬิกา) — ตอบคำถาม "ต้องกลับมาตอนไหน" ตรงกว่าระยะเวลา
const doneAt = (c) => {
  const d = new Date(Date.now() + growMs(c.id))
  const t = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  return d.toDateString() === new Date().toDateString() ? t : 'พรุ่งนี้ ' + t
}
const emit = defineEmits(['pick', 'close'])
useEscapeKey(() => props.open, () => emit('close'))
const farm = useFarm()
const starsOf = (c) => masteryStars(farm.harvests.value[c.id])
</script>

<style scoped>
/* z-index > #bottom-nav (200) — มีผลจริงเพราะ Teleport ไป body แล้ว (ไม่งั้นโดน stacking context ขัง) */
.sp-ov { position: fixed; inset: 0; z-index: 410; background: rgba(0,0,0,.45); display: flex; align-items: flex-end; justify-content: center; }
.sp-box { background: #fff; width: 100%; max-width: 480px; max-height: 80vh; border-radius: 18px 18px 0 0; display: flex; flex-direction: column; }
.sp-head { display: flex; justify-content: space-between; align-items: center; padding: 16px; font-weight: 800; border-bottom: 1px solid rgba(0,0,0,.07); }
.sp-x { border: none; background: rgba(0,0,0,.06); border-radius: 8px; width: 30px; height: 30px; cursor: pointer; }
.sp-list { overflow-y: auto; overscroll-behavior: contain; padding: 10px 10px calc(10px + env(safe-area-inset-bottom, 0px)); display: flex; flex-direction: column; gap: 6px; }
.sp-item { display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid rgba(0,0,0,.08); border-radius: 12px; background: #fff; cursor: pointer; font-family: inherit; text-align: left; }
.sp-item:disabled { opacity: .45; cursor: not-allowed; }
.sp-item:active:not(:disabled) { transform: scale(.99); }
.sp-emoji { font-size: 1.6rem; }
.sp-info { flex: 1; min-width: 0; }
.sp-name { font-weight: 700; font-size: .86rem; }
.sp-stars { color: #f0b400; font-size: .78rem; letter-spacing: 1px; }
.sp-meta { font-size: .7rem; color: rgba(0,0,0,.5); }
.sp-cost { font-weight: 800; font-size: .8rem; color: #b45309; white-space: nowrap; }
.sp-all { display: flex; align-items: center; gap: 8px; margin: 10px 12px 0; padding: 9px 12px; border-radius: 12px; background: var(--mint-light, #e9f8f1); font-size: .82rem; font-weight: 700; cursor: pointer; }
.sp-all input { width: 18px; height: 18px; accent-color: var(--primary); }
.sp-cost small { font-size: .7rem; font-weight: 700; }
.sp-cost.no { color: #ef4444; }
</style>
