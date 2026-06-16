<template>
  <div v-if="items.length" class="ec-wrap">
    <div v-for="e in items" :key="e.id" class="ec-card">
      <span class="ec-emoji"><Emoji :char="e.emoji || '🎯'" /></span>
      <div class="ec-body">
        <div class="ec-label">{{ e.label }}</div>
        <div class="ec-date">{{ fmtDate(e.date) }}</div>
      </div>
      <div class="ec-count">
        <template v-if="e.days > 0"><b>{{ e.days }}</b><small>เหลือ (วัน)</small></template>
        <b v-else class="ec-today">วันนี้!</b>
      </div>
    </div>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { EXAMS } from '../../data/exams.js'
import { upcomingExams } from '../../utils/countdown.js'

// อัปเดตทุก 1 นาที เผื่อเปิดค้างข้ามเที่ยงคืน (ตัวเลขวันจะ refresh)
const now = ref(Date.now())
let timer = null
onMounted(() => { timer = setInterval(() => { now.value = Date.now() }, 60000) })
onUnmounted(() => clearInterval(timer))

const items = computed(() => upcomingExams(EXAMS, now.value))

function fmtDate(iso) {
  // th-TH-u-ca-gregory = เดือนภาษาไทย แต่ปีเป็น ค.ศ. (ไม่ใช่ พ.ศ.)
  return new Date(iso).toLocaleDateString('th-TH-u-ca-gregory', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<style scoped>
.ec-wrap { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.ec-card { display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, var(--primary), #6366f1); color: #fff; border: 2px solid var(--ink); border-radius: 16px; box-shadow: var(--pop); padding: 12px 14px; }
.ec-emoji { font-size: 1.6rem; flex-shrink: 0; }
.ec-body { flex: 1; min-width: 0; }
.ec-label { font-weight: 800; font-size: .9rem; }
.ec-date { font-size: .66rem; opacity: .85; margin-top: 2px; }
.ec-count { text-align: center; flex-shrink: 0; line-height: 1; min-width: 52px; }
.ec-count b { font-size: 1.8rem; font-weight: 800; font-family: var(--font-display); }
.ec-count small { display: block; font-size: .58rem; opacity: .85; margin-top: 3px; }
.ec-today { font-size: 1.15rem; }
</style>
