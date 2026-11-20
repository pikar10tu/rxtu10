<!-- 📰 ข่าวตลาดสมุนไพรวันนี้ — บนสุดของหน้าฟาร์ม (21 พ.ย. 2026 · เดโมที่ user เคาะ) -->
<template>
  <article class="fm" aria-label="ข่าวตลาดสมุนไพรวันนี้">
    <div class="fm-top">
      <span class="fm-mast">📰 ข่าวตลาดสมุนไพร</span>
      <span class="fm-part">{{ m.parts > 1 ? (m.part > 1 ? `ต่อจากเมื่อวาน · ตอน ${m.part}/${m.parts}` : `เรื่องใหม่ · ${m.parts} ตอน`) : 'ข่าววันนี้' }}</span>
    </div>
    <h2 class="fm-head"><Emoji :char="m.icon" /> {{ m.head }}</h2>
    <p class="fm-body">{{ m.body }}</p>
    <p v-if="m.short" class="fm-short">ข่าวสั้น: {{ m.short }}</p>
    <div class="fm-chips">
      <span v-for="b in chips" :key="b.id" class="fm-chip" :class="{ lock: b.locked }">
        <Emoji :char="b.emoji" /> {{ b.name }} <b>+{{ b.pct }}%</b><template v-if="b.locked"> · 🔒 Lv.{{ b.lv }}</template>
      </span>
    </div>
    <div class="fm-until">ราคานี้ถึงเที่ยงคืน · ขายจากผลผลิตได้เลย</div>
    <div class="fm-fc"><b>🔮 นักวิเคราะห์คาดการณ์</b><span>{{ m.tease }}</span></div>
  </article>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import Emoji from '../shared/Emoji.vue'
import { getCrop } from '../../data/crops.js'
import { useAuthStore } from '../../stores/auth.js'
import { useFarmMarket, postFarmNewsOnce } from '../../composables/useFarmMarket.js'

const auth = useAuthStore()
const { market } = useFarmMarket()
const m = computed(() => market.value)
const level = computed(() => auth.userData?.residence?.level || 1)
const chips = computed(() => m.value.boosts.map(b => {
  const c = getCrop(b.id)
  return { id: b.id, pct: b.pct, name: c?.name, emoji: c?.emoji, lv: c?.unlockLevel || 1, locked: (c?.unlockLevel || 1) > level.value }
}))
onMounted(postFarmNewsOnce)
</script>

<style scoped>
.fm { background: #fffaf0; color: #5a3d12; border: 1px solid rgba(180,83,9,.2); border-radius: 16px; padding: 12px 14px; margin-bottom: 12px; }
.fm-top { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; border-bottom: 1px dashed rgba(90,61,18,.35); padding-bottom: 6px; margin-bottom: 8px; }
.fm-mast { font-weight: 800; font-size: .8rem; letter-spacing: .02em; }
.fm-part { font-size: .7rem; font-weight: 700; opacity: .75; text-align: right; }
.fm-head { font-size: 1rem; font-weight: 800; line-height: 1.4; margin: 0 0 4px; text-wrap: balance; }
.fm-body { font-size: .82rem; margin: 0 0 8px; }
.fm-short { font-size: .78rem; margin: -2px 0 8px; padding-top: 6px; border-top: 1px dotted rgba(90,61,18,.35); }
.fm-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.fm-chip { display: inline-flex; align-items: center; gap: 4px; background: #ffe9e4; color: #c2410c; border-radius: 999px; padding: 3px 10px; font-size: .78rem; font-weight: 700; }
.fm-chip.lock { opacity: .7; }
.fm-chip b { font-variant-numeric: tabular-nums; }
.fm-until { font-size: .7rem; opacity: .7; margin-top: 6px; }
.fm-fc { margin-top: 8px; background: rgba(91,159,224,.12); color: var(--ink); border-radius: 10px; padding: 7px 10px; font-size: .8rem; display: flex; flex-direction: column; gap: 1px; }
.fm-fc b { font-size: .72rem; color: #2f6fb0; }
</style>
