<!-- 🧍 หน้าเดโมตุ๊กตาชั่วคราว (A1 · 18 พ.ย. 2026) — ไม่มีลิงก์ในเมนู เข้าทาง #/doll-demo · ลบทิ้งเมื่อมีตู้เสื้อผ้า (A2) -->
<template>
  <div class="dd">
    <h1 class="dd-title">ตุ๊กตา · เดโม</h1>
    <p class="dd-sub">6 ชุดตัวอย่าง ขยาย 4 เท่า และขนาดจริง (ขนาดหมากบนกระดาน)</p>
    <div class="dd-grid">
      <figure v-for="o in looks" :key="o.name" class="dd-card">
        <DollFigure :eq="o.eq" :scale="3" :label="o.name" />
        <div class="dd-small"><DollFigure :eq="o.eq" :scale="1" :label="o.name + ' ขนาดจริง'" /></div>
        <figcaption>{{ o.name }}</figcaption>
      </figure>
    </div>
  </div>
</template>

<script setup>
import DollFigure from '../components/doll/DollFigure.vue'
import { OUTFITS } from '../data/dollParts.js'

// 6 ชุดตาม handover: นักศึกษา+แว่น · เภสัชกร · นางฟ้า · ปีศาจน้อย · สตรีท · รับปริญญา
const pick = ['นักศึกษา', 'เภสัชกร', 'นางฟ้า', 'ปีศาจน้อย', 'สตรีท', 'รับปริญญา']
const looks = pick.map(n => OUTFITS.find(o => o.name === n)).filter(Boolean)
</script>

<style scoped>
.dd { padding: 16px; display: grid; gap: 12px; }
.dd-title { font-size: 1.2rem; margin: 0; }
.dd-sub { margin: 0; color: var(--muted, #6c6883); font-size: .85rem; }
.dd-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.dd-card { margin: 0; background: #cfe2f2; border-radius: 14px; padding: 12px; display: grid; justify-items: center; gap: 6px; }
.dd-small { background: #fff; border-radius: 8px; padding: 4px; }
.dd-card figcaption { font-size: .8rem; }
</style>
