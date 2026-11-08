<!-- แถว "ดวงของฉัน" หน้า Me (ข้าง MBTI) — แผ่นดวงโหลด lazy -->
<template>
  <div>
    <button class="hrow" @click="open = true">
      <span class="hrow-ic" aria-hidden="true">☾</span>
      <span class="hrow-t">
        <b>ดวงของฉัน</b>
        <small v-if="h">ราศี{{ SIGNS[h.sign] }}<template v-if="h.dow != null"> · เกิดวัน{{ DAY_NAMES[h.dow] }}</template><template v-if="h.asc != null"> · ลัคนา{{ SIGNS[h.asc] }}</template></small>
        <small v-else>ยังไม่ได้กรอกวันเกิด</small>
      </span>
      <span class="hrow-go">{{ h ? 'ดูดวง' : 'กรอกเลย' }} ›</span>
    </button>
    <HoroSheet v-if="loaded" v-model:open="open" :start="h ? 'read' : 'setup'" />
  </div>
</template>

<script setup>
import { ref, computed, watch, defineAsyncComponent } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { SIGNS, DAY_NAMES } from '../../data/horoHouses.js'

const HoroSheet = defineAsyncComponent(() => import('./HoroSheet.vue'))
const auth = useAuthStore()
const h = computed(() => auth.userData?.horo || null)
const open = ref(false)
const loaded = ref(false)
watch(open, (o) => { if (o) loaded.value = true })
</script>

<style scoped>
.hrow { font: inherit; width: 100%; display: flex; align-items: center; gap: 10px; text-align: left; margin-top: 8px; border: var(--bw) solid var(--line); border-radius: 14px; box-shadow: var(--pop); background: #fff; padding: 10px 12px; cursor: pointer; color: var(--ink); }
.hrow-ic { width: 30px; height: 30px; flex-shrink: 0; border-radius: 50%; display: grid; place-items: center; font-size: 1.05rem; color: #e9c46a; background: #23264f; }
.hrow-t { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.hrow-t b { font-size: .88rem; }
.hrow-t small { font-size: .76rem; color: var(--muted); }
.hrow-go { font-size: .8rem; font-weight: 800; color: var(--primary); white-space: nowrap; }
</style>
