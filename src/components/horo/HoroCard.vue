<!-- การ์ดดวงวันนี้ หน้า Home — โหลด lazy (astronomy-engine) · แตะเปิดแผ่นดวงเต็ม -->
<template>
  <button v-if="tile" class="ft hc-tile" @click="open = true">
    <span class="ft-em hc-moon-s" aria-hidden="true">☾</span>
    <b>ดวงวันนี้</b>
    <small>{{ profile ? reading.house.head : 'เปิดไพ่ประจำวัน' }}</small>
  </button>
  <button v-else class="hc" @click="open = true">
    <span class="hc-moon" aria-hidden="true">☾</span>
    <span class="hc-t">
      <small>ดวงวันนี้{{ profile ? ` · ราศี${SIGNS[profile.sign]}` : '' }}</small>
      <b v-if="profile">{{ reading.house.head }}</b>
      <b v-else>เปิดไพ่ประจำวัน</b>
      <span v-if="profile" class="hc-sub">
        งาน {{ reading.house.stars[0] }}★ · เงิน {{ reading.house.stars[1] }}★ · รัก {{ reading.house.stars[2] }}★
        <template v-if="colors"> · <i class="hc-dot" :style="{ background: colors.work[1] }"></i>สี{{ colors.work[0] }}</template>
      </span>
      <span v-else class="hc-sub">แตะเพื่อเปิดไพ่ · กรอกวันเกิดเพื่อดูดวงตามราศี</span>
    </span>
    <span class="hc-go">›</span>
  </button>
  <HoroSheet v-model:open="open" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { SIGNS, dailyReading, colorsFor } from '../../utils/horo.js'
import { dayKey } from '../../utils/dailyChallenge.js'
import HoroSheet from './HoroSheet.vue'

defineProps({ tile: { type: Boolean, default: false } })
const auth = useAuthStore()
const open = ref(false)
const day = dayKey()
const profile = computed(() => auth.userData?.horo || null)
const reading = computed(() => dailyReading(profile.value?.sign ?? 0, day, auth.currentUser?.uid || ''))
const colors = computed(() => colorsFor(profile.value?.dow))
</script>

<style scoped>
.hc { font: inherit; width: 100%; display: flex; align-items: center; gap: 12px; text-align: left; cursor: pointer; margin-bottom: 12px;
  border: 0; border-radius: 18px; padding: 12px 14px; color: #eef0ff; box-shadow: var(--pop);
  background: radial-gradient(120% 160% at 0% 0%, #3a3f86, #23264f); }
.hc-moon { flex-shrink: 0; width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; font-size: 1.4rem; color: #23264f; background: #fdf6dc; box-shadow: 0 0 0 4px rgba(233, 196, 106, .25); }
.hc-t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.hc-t small { font-size: .72rem; color: rgba(238, 240, 255, .72); }
.hc-t b { font-size: .95rem; color: #e9c46a; }
.hc-sub { font-size: .74rem; color: rgba(238, 240, 255, .85); display: flex; align-items: center; flex-wrap: wrap; gap: 3px; }
.hc-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; border: 1.5px solid #fff; margin-right: 2px; }
.hc-go { font-size: 1.3rem; color: rgba(238, 240, 255, .7); }

/* ช่องเล็กในแถว "ประจำวันสนุกๆ" หน้า Home (13 พ.ย. 2026) */
.ft { font: inherit; display: flex; flex-direction: column; align-items: flex-start; gap: 3px; min-width: 0; height: 100%; box-sizing: border-box; padding: 10px; border-radius: 14px; border: var(--bw) solid var(--line); box-shadow: var(--pop); text-align: left; text-decoration: none; cursor: pointer; color: var(--ink); background: #fff; }
.ft-em { font-size: 1.35rem; line-height: 1; }
.ft b { font-size: .84rem; }
.ft small { font-size: .7rem; color: var(--muted); line-height: 1.3; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.hc-tile { background: radial-gradient(120% 160% at 0% 0%, #3a3f86, #23264f); border: 0; color: #eef0ff; }
.hc-tile b { color: #e9c46a; }
.hc-tile small { color: rgba(238, 240, 255, .8); }
.hc-moon-s { color: #fdf6dc; }
</style>
