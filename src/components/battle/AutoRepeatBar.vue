<!-- แถบตีซ้ำ/ลุยต่อเนื่อง — ลอยเหนือรีเพลย์ (หอคอย + ดันเจี้ยน · user 25 ต.ค. 2026)
     จบไฟต์ (ชนะหรือแพ้) แล้วนับถอยหลัง 5 วิ ก่อนเริ่มไฟต์ถัดไป · ปิดสวิตช์ระหว่างนับ = ยกเลิก
     z 435 > BattleReplay 420–430 (CLAUDE.md ข้อ 12) · Teleport เพราะรีเพลย์อยู่ที่ body -->
<template>
  <Teleport to="body">
    <div v-if="show" class="arb">
      <button class="arb-pill" :class="{ on: modelValue }" @click="$emit('update:modelValue', !modelValue)">
        <Emoji char="🔁" /> {{ label }}: {{ modelValue ? 'เปิด' : 'ปิด' }}<slot />
      </button>
      <div v-if="modelValue && left != null" class="arb-count" aria-live="polite">
        <span>{{ countText }} <b>{{ left }}</b></span>
        <button class="arb-now" @click="$emit('now')">เริ่มเลย</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
defineProps({
  show: { type: Boolean, default: false },
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: 'ตีซ้ำ' },
  left: { type: Number, default: null },            // วินาทีที่เหลือ (null = ไม่ได้นับอยู่)
  countText: { type: String, default: 'เริ่มตาต่อไปใน' },
})
defineEmits(['update:modelValue', 'now'])
</script>

<style>
/* ไม่ scoped — Teleport ไป body */
.arb { position: fixed; top: 12px; left: 12px; z-index: 435; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
.arb-pill { font: inherit; font-size: .8rem; font-weight: 800; border: 0; border-radius: 999px; padding: 8px 14px; background: rgba(255,255,255,.92); color: #2b1f3d; box-shadow: 0 4px 14px rgba(0,0,0,.25); cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
.arb-pill.on { background: #ea580c; color: #fff; }
.arb-count { display: flex; align-items: center; gap: 8px; background: rgba(20,12,40,.82); color: #fff; border-radius: 14px; padding: 6px 8px 6px 12px; font-size: .82rem; font-weight: 700; box-shadow: 0 4px 14px rgba(0,0,0,.3); }
.arb-count b { font-size: 1.1rem; color: #fdba74; }
.arb-now { font: inherit; font-size: .76rem; font-weight: 800; border: 0; border-radius: 999px; padding: 5px 10px; background: #fff; color: #9a3412; cursor: pointer; }
</style>
