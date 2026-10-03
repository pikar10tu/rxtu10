<!-- src/views/CrClTrainerView.vue — เครื่องคำนวณ CrCl (Cockcroft-Gault)
     เดิมเป็นตัวฝึกทำโจทย์ (3 ต.ค. 2026 เปลี่ยนเป็นเครื่องคำนวณ — อยู่ในประตูเครื่องคำนวณแล้วคนงงว่าทำไมเป็นแบบฝึก)
     สูตรอยู่ใน utils/crcl.js · ใส่ส่วนสูงได้ (ไม่บังคับ) จะได้ CrCl จาก IBW/AdjBW เทียบด้วย -->
<template>
  <div class="tab-content cr-wrap">
    <div class="page-title cr-head">
      <button class="cr-back" @click="$router.push('/study?tab=tool')">‹ กลับ</button>
      <span><Emoji char="🧮" /> คำนวณ CrCl</span>
    </div>

    <div class="cr-card">
      <div class="cr-sex" role="group" aria-label="เพศ">
        <button :class="{ on: !female }" @click="female = false">ชาย</button>
        <button :class="{ on: female }" @click="female = true">หญิง</button>
      </div>
      <label class="cr-row" for="cr-age"><span>อายุ (ปี)</span>
        <input id="cr-age" v-model="ageText" class="cr-input" inputmode="numeric" placeholder="เช่น 65" /></label>
      <label class="cr-row" for="cr-wt"><span>น้ำหนัก (kg)</span>
        <input id="cr-wt" v-model="wtText" class="cr-input" inputmode="decimal" placeholder="เช่น 60" /></label>
      <label class="cr-row" for="cr-scr"><span>Scr (mg/dL)</span>
        <input id="cr-scr" v-model="scrText" class="cr-input" inputmode="decimal" placeholder="เช่น 1.2" /></label>
      <label class="cr-row" for="cr-ht"><span>ส่วนสูง (cm) <small>ไม่บังคับ</small></span>
        <input id="cr-ht" v-model="htText" class="cr-input" inputmode="decimal" placeholder="เช่น 165" /></label>
    </div>

    <div v-if="crcl != null" class="cr-result" aria-live="polite">
      <div class="cr-big">{{ crcl.toFixed(1) }} <small>mL/min</small></div>
      <div class="cr-work">
        ({{ 140 - age }} × {{ wt }}) ÷ (72 × {{ scr }}){{ female ? ' × 0.85' : '' }} · ใช้น้ำหนักจริง
      </div>
      <div v-if="ibw" class="cr-alt">
        <div class="cr-alt-row"><span>IBW {{ ibw.toFixed(1) }} kg</span><b>{{ cgWith(ibw).toFixed(1) }} mL/min</b></div>
        <div v-if="wt > ibw * 1.2" class="cr-alt-row">
          <span>AdjBW {{ adjbw.toFixed(1) }} kg</span><b>{{ cgWith(adjbw).toFixed(1) }} mL/min</b>
        </div>
        <div class="cr-note">
          {{ wt > ibw * 1.2 ? 'น้ำหนักจริงเกิน IBW 120% — มักใช้ AdjBW' : wt < ibw ? 'น้ำหนักจริงต่ำกว่า IBW — มักใช้น้ำหนักจริง' : 'น้ำหนักจริงใกล้ IBW — มักใช้ IBW' }}
        </div>
      </div>
    </div>
    <div v-else-if="anyBad" class="cr-hint">ใส่เป็นตัวเลขในช่วงที่เป็นไปได้ (อายุ 18–120 · Scr มากกว่า 0)</div>

    <p class="cr-foot">
      CrCl = (140 − อายุ) × น้ำหนัก ÷ (72 × Scr) · ผู้หญิงคูณ 0.85<br>
      IBW ชาย 50 / หญิง 45.5 + 0.91 × (ส่วนสูง − 152.4) · AdjBW = IBW + 0.4 × (น้ำหนักจริง − IBW)<br>
      ใช้ประกอบการเรียนเท่านั้น
    </p>
  </div>
</template>

<script setup>
import Emoji from '../components/shared/Emoji.vue'
import { ref, computed } from 'vue'
import { cockcroftGault } from '../utils/crcl.js'

const female = ref(false)
const ageText = ref('')
const wtText = ref('')
const scrText = ref('')
const htText = ref('')

const num = (s) => parseFloat(String(s).replace(',', '.'))
const age = computed(() => { const n = num(ageText.value); return n >= 18 && n <= 120 ? n : null })
const wt = computed(() => { const n = num(wtText.value); return n > 0 && n < 400 ? n : null })
const scr = computed(() => { const n = num(scrText.value); return n > 0 && n < 30 ? n : null })
const ht = computed(() => { const n = num(htText.value); return n >= 100 && n < 250 ? n : null })

const cgWith = (weightKg) => cockcroftGault({ age: age.value, weightKg, scr: scr.value, female: female.value })
const crcl = computed(() => (age.value && wt.value && scr.value ? cgWith(wt.value) : null))

// IBW (Devine) — ส่วนสูงต่ำกว่า 152.4 cm สูตรติดลบ ปัดพื้นไว้ที่ค่าฐาน
const ibw = computed(() => {
  if (!ht.value || crcl.value == null) return null
  return Math.max(female.value ? 45.5 : 50, (female.value ? 45.5 : 50) + 0.91 * (ht.value - 152.4))
})
const adjbw = computed(() => (ibw.value ? ibw.value + 0.4 * (wt.value - ibw.value) : null))

const anyBad = computed(() =>
  (ageText.value && age.value == null) || (wtText.value && wt.value == null) || (scrText.value && scr.value == null))
</script>

<style scoped>
.cr-wrap { max-width: 480px; margin: 0 auto; }
.cr-head { display: flex; align-items: center; gap: 10px; }
.cr-back { all: unset; cursor: pointer; font-weight: 700; color: var(--primary); padding: 6px 4px; }
.cr-card { background: #fff; border: var(--bw) solid var(--line); border-radius: 14px; box-shadow: var(--pop);
  padding: 14px 16px; margin-bottom: 14px; }
.cr-sex { display: flex; gap: 8px; margin-bottom: 8px; }
.cr-sex button { all: unset; cursor: pointer; flex: 1; text-align: center; padding: 9px; border-radius: 10px;
  border: var(--bw) solid var(--line); font-weight: 700; color: rgba(0,0,0,.55); }
.cr-sex button.on { background: var(--primary); color: #fff; }
.cr-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 5px 0;
  font-size: .86rem; color: rgba(0,0,0,.6); }
.cr-row small { font-size: .68rem; color: rgba(0,0,0,.4); }
.cr-input { width: 120px; border: var(--bw) solid var(--line); border-radius: 10px; padding: 9px 10px;
  font-family: inherit; font-size: 1rem; text-align: right; box-sizing: border-box; }
.cr-result { border: 2px dashed rgba(0,0,0,.2); border-radius: 12px; padding: 14px; background: var(--primary-light);
  text-align: center; }
.cr-big { font-size: 1.8rem; font-weight: 800; color: var(--ink); }
.cr-big small { font-size: .8rem; font-weight: 700; color: rgba(0,0,0,.5); }
.cr-work { font-size: .76rem; color: rgba(0,0,0,.55); margin-top: 4px; overflow-wrap: anywhere; }
.cr-alt { margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(0,0,0,.1); }
.cr-alt-row { display: flex; justify-content: space-between; font-size: .84rem; padding: 3px 0; }
.cr-note { font-size: .72rem; color: rgba(0,0,0,.5); margin-top: 6px; }
.cr-hint { font-size: .76rem; color: #b45309; text-align: center; }
.cr-foot { font-size: .7rem; color: rgba(0,0,0,.45); margin-top: 16px; line-height: 1.6; text-align: center; }
</style>
