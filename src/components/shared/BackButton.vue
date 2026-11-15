<!--
  <BackButton> — ปุ่มกลับแบบเดียวทั้งเว็บ (15 พ.ย. 2026 · เดิมมี ~6 แบบ บางหน้าตัวใหญ่เท่าหัวข้อ)
  วางไว้ซ้ายสุดของหัวหน้าเสมอ · กล่องขาวมุมมน 34px มีแค่ ‹
  ใช้:  <BackButton to="/play" />                 ไปหน้าที่กำหนด
        <BackButton @click="goBack" />            ให้หน้าจัดการเอง (ออกจากห้อง/ยืนยันก่อนออก)
        <BackButton to="/study/cc2" label="คลังเคส" />   มีป้ายเมื่อชื่อปลายทางช่วยให้ไม่หลง
  ขนาดตัวอักษรตั้งเองในตัว → วางใน .page-title ได้โดยไม่บวม
-->
<template>
  <RouterLink v-if="to" :to="to" class="back-btn" :class="{ wide: label }" :aria-label="label ? undefined : ariaLabel">
    <span aria-hidden="true">‹</span><span v-if="label" class="back-lbl">{{ label }}</span>
  </RouterLink>
  <button v-else type="button" class="back-btn" :class="{ wide: label }" :aria-label="label ? undefined : ariaLabel">
    <span aria-hidden="true">‹</span><span v-if="label" class="back-lbl">{{ label }}</span>
  </button>
</template>

<script setup>
import { RouterLink } from 'vue-router'
defineProps({
  to: { type: [String, Object], default: null },
  label: { type: String, default: '' },
  ariaLabel: { type: String, default: 'กลับ' },
})
</script>

<style scoped>
.back-btn {
  all: unset; box-sizing: border-box; flex-shrink: 0; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 4px;
  min-width: 34px; height: 34px; padding: 0 0 2px;
  font-family: 'Kanit', sans-serif; font-weight: 600; font-size: 1.25rem; line-height: 1;
  color: var(--ink); background: #fff;
  border: var(--bw) solid var(--line); border-radius: 11px; box-shadow: var(--pop);
  transition: transform .12s;
}
.back-btn.wide { padding: 0 12px 2px 9px; }
.back-lbl { font-size: .8rem; font-weight: 600; padding-top: 2px; }
.back-btn:active { transform: scale(.94); }
.back-btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
</style>
