<!-- src/views/PedDoseView.vue — เครื่องคำนวณขนาดยาน้ำเด็ก (mg/kg → mL ต่อครั้ง)
     ข้อมูลยาอยู่ใน data/pedDose.js (ถอดจากเพจ Facebook Pharmtutors) ใช้ร่วมกับหน้าสรุป ped-dose -->
<template>
  <div class="tab-content pd-wrap">
    <div class="page-title pd-head">
      <button class="pd-back" @click="$router.push('/study')">‹ กลับ</button>
      <span><Emoji char="👶" /> ขนาดยาน้ำเด็ก</span>
    </div>

    <div class="pd-card">
      <label class="pd-label" for="pd-kg">น้ำหนักเด็ก (kg)</label>
      <input id="pd-kg" v-model="kgText" class="pd-input" inputmode="decimal" placeholder="เช่น 12" />
      <div v-if="kg && kg > 40" class="pd-warn">น้ำหนักเกิน 40 kg ขนาดที่คิดได้อาจเกินขนาดผู้ใหญ่ ให้เช็คขนาดสูงสุดเสมอ</div>
      <input v-model="q" class="pd-input pd-search" placeholder="ค้นหายา" aria-label="ค้นหายา" />
    </div>

    <div class="pd-list">
      <div v-for="d in shown" :key="d.id" class="pd-drug">
        <div class="pd-top">
          <b>{{ d.name }}</b>
          <span class="pd-conc">{{ concLabel(d) }}</span>
        </div>
        <div class="pd-sub">{{ basisLabel(d) }}{{ d.doseOf ? ` (คิดเป็น ${d.doseOf})` : '' }} · {{ freqLabel(d) }}</div>
        <div v-if="d.max" class="pd-sub">{{ maxLabel(d) }}</div>
        <div v-if="kg" class="pd-res">
          <span class="pd-ml">{{ range(calcDose(d, kg).ml, 1) }} <small>mL/ครั้ง</small></span>
          <span class="pd-amt">= {{ range(calcDose(d, kg).amt, 1) }} {{ d.unit }}</span>
        </div>
        <div v-if="kg && calcDose(d, kg).capped" class="pd-cap">ถึงเพดานแล้ว ตัดที่ {{ fmt(calcDose(d, kg).lim, 1) }} {{ d.unit }}/ครั้ง</div>
        <div v-if="d.note" class="pd-note">{{ d.note }}</div>
      </div>
      <div v-if="!shown.length" class="pd-empty">ไม่เจอยาชื่อนี้</div>
    </div>

    <h3 class="pd-h">ยาที่ให้ตามอายุ</h3>
    <div class="pd-list">
      <div v-for="d in AGE_DRUGS" :key="d.name" class="pd-drug">
        <div class="pd-top"><b>{{ d.name }}</b><span class="pd-conc">{{ d.conc }}</span></div>
        <div class="pd-sub">{{ d.freq }}</div>
        <div v-for="[a, b, v] in d.bands" :key="a" class="pd-band"><span>{{ a }}–{{ b }} ปี</span><b>{{ v }}</b></div>
        <div v-if="d.note" class="pd-note">{{ d.note }}</div>
      </div>
    </div>

    <p class="pd-foot">
      สูตร: mL ต่อครั้ง = ขนาดยา (mg) × 5 ÷ ความแรงต่อ 5 mL · ยาที่เป็น mg/kg/day หารด้วยจำนวนครั้งต่อวัน · 1 ช้อนชา = 5 mL<br>
      เพดานต่อครั้ง/ต่อวันเป็นค่าสูงสุดทั่วไป (ส่วนใหญ่คือขนาดผู้ใหญ่) บางข้อบ่งใช้ใช้สูงกว่านี้ได้<br>
      ขนาดยาอาจเปลี่ยนตามโรค ใช้ประกอบการเรียนเท่านั้น<br>
      ข้อมูลจาก{{ PED_DOSE_CREDIT }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Emoji from '../components/shared/Emoji.vue'
import { WEIGHT_DRUGS, AGE_DRUGS, PED_DOSE_CREDIT, calcDose, concLabel, basisLabel, freqLabel, maxLabel } from '../data/pedDose.js'

const kgText = ref('')
const q = ref('')
const kg = computed(() => { const n = parseFloat(kgText.value); return n > 0 && n < 200 ? n : 0 })
const shown = computed(() => {
  const s = q.value.trim().toLowerCase()
  return s ? WEIGHT_DRUGS.filter(d => d.name.toLowerCase().includes(s)) : WEIGHT_DRUGS
})
const fmt = (x, p) => String(+x.toFixed(p))
const range = ([lo, hi], p) => Math.abs(hi - lo) < 1e-9 ? fmt(lo, p) : `${fmt(lo, p)}–${fmt(hi, p)}`
</script>

<style scoped>
.pd-wrap { max-width: 480px; margin: 0 auto; }
.pd-head { display: flex; align-items: center; gap: 10px; }
.pd-back { all: unset; cursor: pointer; font-weight: 700; color: var(--primary); padding: 6px 4px; }
.pd-card { background: #fff; border: var(--bw) solid var(--line); border-radius: 14px; box-shadow: var(--pop);
  padding: 14px 16px; margin-bottom: 14px; }
.pd-label { display: block; font-weight: 800; font-size: .86rem; margin-bottom: 6px; }
.pd-input { width: 100%; border: var(--bw) solid var(--line); border-radius: 12px; padding: 12px;
  font-family: inherit; font-size: 1rem; box-sizing: border-box; }
.pd-search { margin-top: 10px; font-size: .9rem; padding: 9px 12px; }
.pd-warn { margin-top: 8px; font-size: .76rem; color: #b45309; }
.pd-list { display: flex; flex-direction: column; gap: 8px; }
.pd-drug { background: #fff; border: var(--bw) solid var(--line); border-radius: 12px; padding: 10px 12px; }
.pd-top { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
.pd-top b { font-size: .92rem; color: var(--ink); }
.pd-conc { font-size: .76rem; color: var(--muted); white-space: nowrap; }
.pd-sub { font-size: .76rem; color: var(--muted); margin-top: 2px; }
.pd-res { display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: baseline; margin-top: 6px; }
.pd-ml { font-size: 1.15rem; font-weight: 800; color: var(--primary); font-variant-numeric: tabular-nums; }
.pd-ml small { font-size: .74rem; font-weight: 700; }
.pd-amt { font-size: .8rem; color: var(--muted); }
.pd-cap { margin-top: 6px; font-size: .76rem; font-weight: 800; color: #b91c1c; }
.pd-note { margin-top: 6px; font-size: .74rem; color: #b45309; line-height: 1.45; }
.pd-band { display: flex; justify-content: space-between; font-size: .84rem; padding: 3px 0; border-top: 1px dashed var(--line); margin-top: 4px; }
.pd-band b { color: var(--ink); }
.pd-empty { text-align: center; font-size: .84rem; color: var(--muted); padding: 12px; }
.pd-h { font-size: .95rem; margin: 18px 0 8px; }
.pd-foot { font-size: .74rem; color: var(--muted); line-height: 1.6; margin-top: 16px; text-align: center; }
</style>
