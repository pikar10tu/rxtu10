<!-- ร้านฟาร์มในหน้าร้านค้ารวม — ปลดแปลงเพิ่ม (useFarm.nextPlot) + บอกเพดานตามเลเวลบ้าน · ลิงก์ไปฟาร์ม -->
<template>
  <div class="fst">
    <div class="fst-hero">
      <span class="fst-emoji"><Emoji char="🌱" /></span>
      <div>
        <div class="fst-h">ร้านฟาร์ม</div>
        <div class="fst-sub">ปลดแปลงเพิ่ม = ปลูกได้มากขึ้นพร้อมกัน · เพดานแปลงขึ้นกับเลเวลบ้าน</div>
      </div>
    </div>

    <div class="fst-card">
      <div class="fst-row"><span>แปลงที่ปลดแล้ว</span><b>{{ farm.plotsUnlocked.value }} / {{ farm.ceiling.value }}</b></div>
      <div class="fst-plots" aria-hidden="true">
        <i v-for="n in MAX_PLOTS" :key="n" :class="{ own: n <= farm.plotsUnlocked.value, cap: n > farm.ceiling.value }"></i>
      </div>
      <div class="fst-legend"><i class="own"></i> ปลดแล้ว <i></i> ปลดได้ <i class="cap"></i> ต้องอัปบ้านก่อน</div>

      <div v-if="info.reason === 'maxed'" class="fst-msg done">ปลดครบทุกแปลงแล้ว <Emoji char="🎉" /></div>
      <div v-else-if="info.reason === 'atCeiling'" class="fst-msg">ปลดครบเพดานบ้านแล้ว · อัปเกรดบ้านเพื่อปลดแปลงที่ {{ info.nextPlot }}</div>
      <button v-else class="fst-buy" :disabled="info.reason === 'notEnoughCoins'" @click="farm.unlockPlot()">
        {{ info.reason === 'notEnoughCoins' ? `เหรียญไม่พอ · แปลงที่ ${info.nextPlot} ราคา ${info.cost.toLocaleString()}` : `ปลดแปลงที่ ${info.nextPlot} · 🪙 ${info.cost.toLocaleString()}` }}
      </button>
    </div>

    <RouterLink to="/play/farm" class="fst-go"><Emoji char="🧺" /> ไปที่ฟาร์ม ปลูก/เก็บเกี่ยว →</RouterLink>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import Emoji from '../shared/Emoji.vue'
import { useFarm } from '../../composables/useFarm.js'
import { MAX_PLOTS } from '../../data/farmPlots.js'

const farm = useFarm()
const info = computed(() => farm.nextPlot.value)
</script>

<style scoped>
.fst { display: flex; flex-direction: column; gap: 12px; }
.fst-hero { display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 20px; background: linear-gradient(135deg, #d6f5e3, #fff 70%); border: var(--bw) solid var(--line); box-shadow: var(--pop); }
.fst-emoji { font-size: 2rem; }
.fst-h { font-weight: 800; font-size: 1rem; }
.fst-sub { font-size: .74rem; color: var(--muted); line-height: 1.45; }
.fst-card { background: #fff; border: var(--bw) solid var(--line); border-radius: 18px; box-shadow: var(--pop); padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; }
.fst-row { display: flex; justify-content: space-between; font-size: .84rem; }
.fst-plots { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; }
.fst-plots i, .fst-legend i { display: block; aspect-ratio: 1; border-radius: 8px; background: #fff; border: 1.5px dashed #9fd9bd; }
.fst-plots i.own, .fst-legend i.own { background: #b6ebcf; border: 1.5px solid #4cc9a0; }
.fst-plots i.cap, .fst-legend i.cap { background: #f1f5f9; border: 1.5px solid #e2e8f0; }
.fst-legend { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; font-size: .7rem; color: var(--muted); }
.fst-legend i { width: 12px; display: inline-block; margin-left: 6px; }
.fst-msg { font-size: .78rem; color: var(--muted); text-align: center; padding: 6px; }
.fst-msg.done { color: #1f7a5c; font-weight: 700; }
.fst-buy { font: inherit; font-size: .9rem; font-weight: 800; color: #fff; border: 0; border-radius: 14px; padding: 12px; cursor: pointer; background: linear-gradient(135deg, #4cc9a0, #7fd9b8); box-shadow: var(--pop); }
.fst-buy:disabled { background: #cbd5e1; cursor: default; }
.fst-go { text-align: center; font-size: .82rem; font-weight: 700; color: #1f7a5c; text-decoration: none; padding: 10px; border-radius: 14px; background: #fff; border: var(--bw) solid var(--line); }
</style>
