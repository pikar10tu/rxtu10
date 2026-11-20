<template>
  <div class="tab-content">
    <div class="page-title fv-head">
      <BackButton to="/play" />
      <span><Emoji char="🌱" /> โหมดฟาร์ม</span>
      <span class="fv-spacer"></span>
    </div>

    <FarmMarketCard />
    <!-- 📋 แถบสรุปออเดอร์ (21 พ.ย.) — ออเดอร์อยู่ล่างสุดในรางเลื่อน คนไม่เห็นว่ามีใบที่ส่งได้ -->
    <button v-if="readyOrders" type="button" class="fv-ord" @click="toOrders">
      <span><Emoji char="📋" /> ส่งออเดอร์ได้ {{ readyOrders }} ใบ</span><span class="fv-ord-go">ดูออเดอร์ ↓</span>
    </button>
    <FarmGrid ref="grid" />
    <div ref="ordersEl"><FarmOrders @plant="plantFor" /></div>
    <!-- ปลดแปลงย้ายไปร้านค้า (ร้านฟาร์ม) ที่เดียว — user สั่ง 25 ก.ย. 2026 · ช่อง ＋ ขยายแปลงในกริดพาไปที่นั่น -->
  </div>
</template>

<script setup>
import BackButton from '../components/shared/BackButton.vue'
import Emoji from '../components/shared/Emoji.vue'
import FarmGrid from '../components/farm/FarmGrid.vue'
import FarmOrders from '../components/farm/FarmOrders.vue'
import FarmMarketCard from '../components/farm/FarmMarketCard.vue'
import { ref, computed } from 'vue'
import { useFarmOrders } from '../composables/useFarmOrders.js'
import { canDeliver } from '../data/farmOrders.js'

const grid = ref(null)
const ordersEl = ref(null)
const board = useFarmOrders()
const readyOrders = computed(() => (board.orders.value || []).filter(o => o.items && canDeliver(o, board.inventory.value)).length)
const toOrders = () => ordersEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
// ออเดอร์ "ปลูกเลย" → เลื่อนขึ้นไปที่แปลง แล้วเปิดแผ่นเมล็ดพร้อมเลือกตัวที่ขาด
function plantFor(cropId) { grid.value?.plantFor(cropId) }
</script>

<style scoped>
.fv-head { display: flex; align-items: center; gap: 8px; }
.fv-back { text-decoration: none; color: var(--ink); font-size: 1.6rem; font-weight: 800; line-height: 1; width: 24px; }
.fv-spacer { width: 24px; }
.fv-ord { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 8px; font: inherit; font-size: .84rem; font-weight: 800; color: var(--ink); background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 12px; padding: 9px 12px; margin-bottom: 12px; cursor: pointer; }
.fv-ord-go { color: var(--primary); font-size: .78rem; }
</style>
