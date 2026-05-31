<template>
  <div class="daily-card">
    <div class="dc-coins">
      <span class="dc-coins-label">เหรียญของคุณ</span>
      <span class="dc-coins-val">{{ coins.toLocaleString() }} 🪙</span>
    </div>

    <!-- accruing pool -->
    <div class="dc-pool">
      <div class="dc-pool-top">
        <span>💰 รายได้สะสม</span>
        <b>{{ accrued.toLocaleString() }}🪙</b>
      </div>
      <div class="dc-bar"><div class="dc-fill" :class="{ full: isFull }" :style="{ width: fillPct + '%' }"></div></div>
      <div class="dc-pool-sub">
        <span>{{ ratePerHour.toLocaleString() }}🪙/ชม.</span>
        <span>{{ isFull ? '⚠️ เต็มแล้ว! รีบเก็บ' : 'เต็มใน ' + fmtRemain }}</span>
      </div>
    </div>

    <button class="dc-claim" :class="{ ready: accrued > 0 }" :disabled="accrued < 1" @click="claim">
      {{ accrued > 0 ? `เก็บ +${accrued.toLocaleString()}🪙` : 'ยังไม่มีรายได้สะสม' }}
    </button>

    <!-- breakdown -->
    <div class="dc-breakdown">
      <div class="dc-row"><span>🏠 ที่อยู่อาศัย</span><b>{{ baseIncome.toLocaleString() }}/วัน</b></div>
      <div class="dc-row"><span>🐾 สัตว์เลี้ยงในคลัง</span><b>{{ petIncome.toLocaleString() }}/วัน</b></div>
      <div v-if="bonusPct" class="dc-row dc-bonus"><span>💖 โบนัสซัพพอร์ตเตอร์</span><b>+{{ bonusPct }}%</b></div>
      <div class="dc-row dc-total"><span>รวมเต็ม (24 ชม.)</span><b>{{ ratePerDay.toLocaleString() }}🪙</b></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { useDaily } from '../../composables/useDaily.js'

const auth = useAuthStore()
const coins = computed(() => auth.userData?.coins || 0)
const { baseIncome, petIncome, bonusPct, ratePerDay, ratePerHour, accrued, fillPct, isFull, remainingMs, claim } = useDaily()

const fmtRemain = computed(() => {
  const s = Math.ceil(remainingMs.value / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}ชม ${m}น` : `${m}น`
})
</script>

<style scoped>
.daily-card {
  background: linear-gradient(135deg, #fff0f7, #f6f0ff);
  border: 1px solid #f3d9ec;
  border-radius: 18px;
  padding: 14px;
  margin-bottom: 14px;
  box-shadow: 0 2px 10px rgba(170,140,210,.12);
}
.dc-coins { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px; }
.dc-coins-label { font-size: .72rem; color: rgba(0,0,0,.5); }
.dc-coins-val { font-size: 1.4rem; font-weight: 800; color: #b45309; }
.dc-pool { margin-bottom: 10px; }
.dc-pool-top { display: flex; justify-content: space-between; align-items: baseline; font-size: .78rem; color: rgba(0,0,0,.6); margin-bottom: 5px; }
.dc-pool-top b { font-size: 1rem; color: #b45309; }
.dc-bar { height: 8px; background: rgba(0,0,0,.08); border-radius: 999px; overflow: hidden; }
.dc-fill { height: 100%; background: linear-gradient(90deg, #c4a5f5, #f7a8c4); transition: width .8s linear; }
.dc-fill.full { background: linear-gradient(90deg, #f59e0b, #ef4444); }
.dc-pool-sub { display: flex; justify-content: space-between; font-size: .62rem; color: rgba(0,0,0,.45); margin-top: 4px; }
.dc-claim {
  width: 100%; border: none; border-radius: 12px; padding: 11px;
  font-family: inherit; font-size: .86rem; font-weight: 800; color: #fff;
  background: rgba(0,0,0,.25); cursor: pointer; transition: transform .12s; margin-bottom: 12px;
}
.dc-claim.ready { background: linear-gradient(135deg, #c4a5f5, #f7a8c4); }
.dc-claim.ready:active { transform: scale(.98); }
.dc-claim:disabled { cursor: default; opacity: .55; }
.dc-breakdown { background: rgba(0,0,0,.03); border-radius: 10px; padding: 8px 12px; }
.dc-row { display: flex; justify-content: space-between; align-items: center; font-size: .74rem; color: rgba(0,0,0,.6); padding: 3px 0; }
.dc-row b { color: #059669; }
.dc-bonus b { color: #ec4899; }
.dc-total { border-top: 1px dashed rgba(0,0,0,.12); margin-top: 4px; padding-top: 6px; font-weight: 800; color: rgba(0,0,0,.8); }
.dc-total b { color: #b45309; }
</style>
