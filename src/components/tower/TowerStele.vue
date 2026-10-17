<!-- TowerStele — ศิลาจารึกหอคอย (user เคาะดราฟ 17 ต.ค. 2026 · ศิลาเทา)
     1 คน × 1 ซีซั่น = 1 บรรทัด ยอดสูงสุดที่เกิน 100 · ซีซั่นปัจจุบันบนสุด · ✦ = สถิติสูงสุดของคนนั้น
     ข้อมูลจาก roster rows `th` (utils/towerStele.js) · ไม่มีใครเกิน 100 = ซ่อนทั้งใบ -->
<template>
  <section v-if="seasons.length" class="ts" aria-label="ศิลาจารึกหอคอย">
    <div class="ts-crest">ศิลาจารึกหอคอย</div>
    <div class="ts-sub">ผู้ก้าวข้ามยอดชั้น ๑๐๐ สู่ห้วงนิรันดร์</div>
    <template v-for="s in shown" :key="s.season">
      <div class="ts-sec">ซีซั่น {{ seasonMonthLabel(s.season, true) }}{{ s.season === cur ? ' · ตอนนี้' : '' }}</div>
      <ol class="ts-list">
        <li v-for="(e, i) in s.entries" :key="e.uid" :class="{ me: e.isMe, peak: e.isPeak }">
          <span class="ts-n">{{ thai(i + 1) }}</span>
          <span class="ts-who">{{ e.name }}<small v-if="e.isMe"> (คุณ)</small></span>
          <span class="ts-f">ชั้น {{ thai(e.floor) }}</span>
        </li>
      </ol>
    </template>
    <button v-if="seasons.length > LIMIT" class="ts-more" @click="all = !all">
      {{ all ? 'ย่อ' : `ดูซีซั่นเก่าอีก ${seasons.length - LIMIT} ซีซั่น` }}
    </button>
    <div class="ts-foot">✦ = สถิติสูงสุดของคนนั้น · จารึกไม่หายตอนรีเซตซีซั่น</div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { buildStele } from '../../utils/towerStele.js'
import { seasonMonthLabel, currentSeasonId } from '../../utils/pvpSeason.js'

const props = defineProps({ rows: { type: Object, default: null }, me: { type: String, default: '' } })
const LIMIT = 3
const all = ref(false)
const cur = currentSeasonId()
const seasons = computed(() => buildStele(props.rows, props.me))
const shown = computed(() => all.value ? seasons.value : seasons.value.slice(0, LIMIT))
const TH = '๐๑๒๓๔๕๖๗๘๙'
const thai = (n) => String(n).replace(/\d/g, d => TH[d])
</script>

<style scoped>
.ts {
  --st1: #a7a29b; --st2: #8d877f; --cut: #3c3832; --hi: rgba(255, 255, 255, .35);
  position: relative; margin: 14px 4px 22px; padding: 48px 18px 20px;
  border-radius: 46% 46% 10px 10px / 60px 60px 10px 10px;
  background: radial-gradient(120% 80% at 30% 0%, var(--hi), transparent 60%),
    repeating-radial-gradient(circle at 70% 40%, rgba(0, 0, 0, .035) 0 2px, transparent 2px 5px),
    linear-gradient(170deg, var(--st1), var(--st2));
  box-shadow: inset 0 2px 0 var(--hi), inset 0 -6px 14px rgba(0, 0, 0, .25), 0 14px 24px -12px rgba(0, 0, 0, .45);
  color: var(--cut); text-shadow: 0 1px 0 var(--hi), 0 -1px 0 rgba(0, 0, 0, .3);
}
.ts::after { content: ""; position: absolute; left: -12px; right: -12px; bottom: -14px; height: 16px; border-radius: 4px; background: linear-gradient(var(--st2), var(--cut)); opacity: .85; }
.ts-crest { text-align: center; font-family: var(--font-display); font-size: 1.2rem; font-weight: 800; }
.ts-sub { text-align: center; font-size: .72rem; opacity: .75; margin: 2px 0 10px; }
.ts-sec { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: .84rem; margin: 12px 0 4px; white-space: nowrap; }
.ts-sec::before, .ts-sec::after { content: ""; flex: 1; height: 2px; background: var(--cut); opacity: .25; box-shadow: 0 1px 0 var(--hi); }
.ts-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 1px; }
.ts-list li { display: grid; grid-template-columns: 2em 1fr auto; gap: 8px; align-items: baseline; padding: 4px 4px; font-size: .92rem; border-radius: 6px; }
.ts-list li.me { background: rgba(255, 255, 255, .18); }
.ts-n { font-weight: 800; opacity: .6; font-size: .8rem; font-variant-numeric: tabular-nums; }
.ts-who { font-weight: 800; min-width: 0; overflow-wrap: anywhere; }
.ts-who small { font-weight: 600; font-size: .72rem; opacity: .75; }
.ts-f { font-weight: 800; white-space: nowrap; font-variant-numeric: tabular-nums; }
.peak .ts-f::before { content: "✦ "; color: #c9a24a; text-shadow: none; }
.ts-more { display: block; margin: 10px auto 0; font: inherit; font-size: .76rem; font-weight: 800; color: var(--cut); background: rgba(255, 255, 255, .22); border: 1px solid rgba(0, 0, 0, .15); border-radius: 10px; padding: 5px 12px; cursor: pointer; text-shadow: none; }
.ts-foot { text-align: center; font-size: .68rem; opacity: .7; margin-top: 10px; }
</style>
