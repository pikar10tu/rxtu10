<!-- PetFilterBar — แถวสาย + แถว ทั้งหมด/♥ โปรด/ระดับ · ใช้ร่วมหน้าคลัง กับหน้าต่างเลือกตัวในหน้าจัดทีม (utils/petFilter.js)
     18 ต.ค. 2026 (user เคาะจากเดโม): ตัด "เฉพาะในทีม" + เมนูเรียงตาม ATK/HP ออก — คลังไม่มีเรื่องทีม/สเตตัสแล้ว
     ลำดับเรียงคงที่ (sortCollection) ไม่ต้องอธิบายให้ผู้เล่นเห็น -->
<template>
  <div class="pfb">
    <div class="pfb-seg" role="group" aria-label="กรองตามสาย">
      <button v-for="o in EL_OPTS" :key="o.k" type="button" :class="{ on: modelValue.el === o.k }" :aria-pressed="modelValue.el === o.k" @click="set('el', o.k)">
        <Emoji v-if="o.icon" :char="o.icon" /> {{ o.t }}
      </button>
    </div>
    <div class="pfb-chips" role="group" aria-label="กรองตามระดับ">
      <button v-for="o in RAR_OPTS" :key="o.k" type="button" :class="{ on: modelValue.rarity === o.k }" :aria-pressed="modelValue.rarity === o.k" @click="set('rarity', o.k)">{{ o.t }}</button>
    </div>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { EL_NAME, RARITY } from '../../data/index.js'
const props = defineProps({ modelValue: { type: Object, required: true } })
const emit = defineEmits(['update:modelValue'])
const EL_OPTS = [{ k: 'all', t: 'ทุกสาย' }, { k: 'fist', icon: '✊', t: EL_NAME.fist }, { k: 'scissors', icon: '✌️', t: EL_NAME.scissors }, { k: 'paper', icon: '✋', t: EL_NAME.paper }]
const RAR_OPTS = [{ k: 'all', t: 'ทั้งหมด' }, { k: 'fav', t: '♥ โปรด' }, ...['legendary', 'epic', 'rare', 'common'].map(k => ({ k, t: RARITY[k].label }))]
const set = (k, v) => emit('update:modelValue', { ...props.modelValue, [k]: v })
</script>

<style scoped>
.pfb { display: grid; gap: 6px; margin: 10px 0 8px; }
.pfb-seg { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3px; padding: 3px; background: #fff; border: var(--bw) solid var(--line); border-radius: 12px; }
.pfb-seg button { border: 0; background: none; border-radius: 9px; padding: 7px 2px; font: inherit; font-size: .74rem; font-weight: 600; color: var(--ink); cursor: pointer; white-space: nowrap; }
.pfb-seg button.on { background: var(--ink); color: #fff; }
.pfb-chips { display: flex; gap: 5px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
.pfb-chips button { flex: none; border: var(--bw) solid var(--line); background: #fff; border-radius: 999px; padding: 5px 11px; font: inherit; font-size: .76rem; color: var(--ink); cursor: pointer; white-space: nowrap; }
.pfb-chips button.on { background: var(--ink); border-color: var(--ink); color: #fff; }
.pfb-seg button:focus-visible, .pfb-chips button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
</style>
