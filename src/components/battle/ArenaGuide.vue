<!-- ArenaGuide — ไกด์สนาม: อันดับเพ็ทจากสถิติจริงใน roster (ไม่ใช่ผลซิม) + ท็อป 3 ซีซั่นที่แล้ว
     user เคาะ 30 ก.ย. 2026: ห้ามโชว์ทีมปัจจุบันของใคร / คู่หู / ปุ่มจัดตาม (กันก๊อปทีมง่ายเกิน)
     0 read เพิ่ม — rosterRows + rosterHof มาจาก roster/current ที่โหลดอยู่แล้ว -->
<template>
  <div v-if="guide.teams" class="agd">
    <div class="agd-head">
      <span class="agd-title"><Emoji char="🧭" /> ไกด์สนาม</span>
      <span class="agd-sub">จากทีมที่จัดไว้ {{ guide.teams }} คน</span>
    </div>
    <div class="agd-seg" role="tablist">
      <button v-for="m in MODES" :key="m.k" role="tab" :aria-selected="mode === m.k" :class="{ on: mode === m.k }" @click="mode = m.k">
        <Emoji :char="m.icon" /> {{ m.label }}
      </button>
    </div>
    <div v-if="list.length" class="agd-list">
      <div v-for="(p, i) in list" :key="p.id" class="agd-row">
        <span class="agd-n">{{ i + 1 }}</span>
        <span class="agd-face"><Emoji :char="getPetDef(p.id)?.emoji || '❔'" /></span>
        <span class="agd-mid">
          <span class="agd-name">{{ getPetDef(p.id)?.name || p.id }}</span>
          <span class="agd-bar"><i :style="{ width: (p.v / max * 100) + '%' }" /></span>
        </span>
        <b class="agd-v">{{ cur.fmt(p) }}</b>
      </div>
    </div>
    <div v-else class="agd-none">{{ cur.empty }}</div>
    <div class="agd-cap">{{ cur.cap }}</div>

    <template v-if="hof?.top?.length">
      <div class="agd-head agd-hof-h">
        <span class="agd-title"><Emoji char="🏆" /> ท็อป 3 ซีซั่นที่แล้ว</span>
        <span class="agd-sub">{{ seasonMonthLabel(hof.season, true) }}</span>
      </div>
      <div v-for="t in hof.top" :key="t.rank" class="agd-hof" :class="'r' + t.rank">
        <span class="agd-medal"><Emoji :char="['🥇', '🥈', '🥉'][t.rank - 1]" /></span>
        <span class="agd-hn">{{ t.n }}<small>{{ t.r.toLocaleString() }} แต้ม</small></span>
        <span class="agd-team"><Emoji v-for="(s, j) in t.tm" :key="j" :char="getPetDef(s.i)?.emoji || '❔'" /></span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Emoji from '../shared/Emoji.vue'
import { getPetDef } from '../../data/index.js'
import { buildPvpGuide, WIN_MIN_USERS } from '../../utils/pvpGuide.js'
import { seasonMonthLabel } from '../../utils/pvpSeason.js'

const props = defineProps({ rows: { type: Object, default: () => ({}) }, hof: { type: Object, default: null } })

const MODES = [
  { k: 'use', icon: '🔥', label: 'ใช้เยอะสุด', fmt: p => p.v + '%', cap: 'สัดส่วนของทีมทั้งรุ่นที่ใส่ตัวนี้', empty: 'ยังไม่มีใครจัดทีม' },
  { k: 'top', icon: '👑', label: 'ในมือท็อป 10', fmt: p => p.v + '/10', cap: 'จำนวนคนในท็อป 10 แต้มประลองที่ใส่ตัวนี้', empty: 'ซีซั่นนี้ยังไม่มีใครลงสนาม' },
  { k: 'win', icon: '📈', label: 'ชนะบ่อย', fmt: p => p.v + '%', cap: `อัตราชนะรวมของคนที่ใส่ · นับเฉพาะตัวที่มีคนใช้ ${WIN_MIN_USERS} คนขึ้นไป`, empty: 'ข้อมูลยังน้อยไป รอให้ลงสนามกันอีกหน่อย' },
]
const mode = ref('use')
const guide = computed(() => buildPvpGuide(props.rows))
const cur = computed(() => MODES.find(m => m.k === mode.value))
const list = computed(() => guide.value[mode.value])
const max = computed(() => Math.max(1, ...list.value.map(p => p.v)))
</script>

<style scoped>
.agd { background: #fff; border: var(--bw) solid var(--line); border-radius: 16px; box-shadow: var(--pop); padding: 12px 14px; margin-top: 16px; }
.agd-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.agd-title { font-size: .88rem; font-weight: 800; }
.agd-sub { font-size: .72rem; font-weight: 700; color: var(--muted); white-space: nowrap; }
.agd-seg { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
.agd-seg button { font-family: inherit; font-size: .74rem; font-weight: 700; border: var(--bw) solid var(--line); background: #fff; color: var(--muted); border-radius: 99px; padding: 4px 10px; cursor: pointer; }
.agd-seg button.on { background: var(--primary-light); border-color: var(--primary); color: var(--ink); }
.agd-list { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
.agd-row { display: flex; align-items: center; gap: 8px; padding: 4px 6px; }
.agd-n { width: 16px; text-align: center; font-size: .74rem; font-weight: 800; color: var(--muted); }
.agd-face { font-size: 1.4rem; line-height: 1; width: 28px; text-align: center; }
.agd-mid { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.agd-name { font-size: .8rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.agd-bar { height: 5px; border-radius: 9px; background: rgba(0,0,0,.06); overflow: hidden; }
.agd-bar i { display: block; height: 100%; border-radius: 9px; background: linear-gradient(90deg, var(--accent), var(--primary)); }
.agd-v { font-size: .84rem; font-variant-numeric: tabular-nums; min-width: 40px; text-align: right; }
.agd-cap, .agd-none { font-size: .72rem; color: var(--muted); margin-top: 6px; line-height: 1.5; }
.agd-none { text-align: center; padding: 6px 0; }
.agd-hof-h { margin-top: 14px; }
.agd-hof { display: flex; align-items: center; gap: 8px; padding: 6px; border-radius: 10px; margin-top: 4px; }
.agd-hof.r1 { background: #fff7db; }
.agd-medal { font-size: 1.1rem; }
.agd-hn { flex: 1; min-width: 0; font-size: .8rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.agd-hn small { display: block; font-size: .7rem; color: var(--muted); font-weight: 600; }
.agd-team { display: flex; gap: 2px; font-size: 1.25rem; line-height: 1; }
</style>
