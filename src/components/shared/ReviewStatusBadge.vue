<!--
  ป้ายสถานะตรวจข้อสอบ ฝั่งนักศึกษา (Quiz/TimeAttack) — ก่อนหน้านี้ reviewStatus โผล่แค่
  ฝั่งวิชาการ (QuestionsView/ReviewView/AdminView) นักศึกษาไม่เคยเห็นเลย
  ใช้สีเดียวกับ .qz-badge.rv.* ใน QuestionsView.vue เพื่อความสม่ำเสมอ
-->
<template>
  <span class="rsb" :class="statusKey">{{ label }}</span>
</template>

<script setup>
import { computed } from 'vue'
import { reviewStatusKey, REVIEW_STATUS_LABEL } from '../../utils/questionReview.js'

const props = defineProps({ question: { type: Object, required: true } })
const statusKey = computed(() => reviewStatusKey(props.question))
const label = computed(() => REVIEW_STATUS_LABEL[statusKey.value])
</script>

<style scoped>
.rsb { font-size: .7rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; white-space: nowrap; }
.rsb.pending  { background: #eef2ff; color: #4f46e5; }
.rsb.passed   { background: rgba(34,197,94,.15); color: #15803d; }
.rsb.conflict { background: #fff7ed; color: #c2410c; }
.rsb.failed   { background: #fef2f2; color: #b91c1c; }
.rsb.retired  { background: rgba(0,0,0,.12); color: rgba(0,0,0,.55); }
</style>
