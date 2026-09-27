<!--
  <FarmBook> — สมุดพืช: สมุนไพร 16 ชนิด + ดาวความชำนาญ + ตราพืชทอง
  ข้อมูลสรรพคุณอยู่ใน data/crops.js (ฟิลด์ herb) · ดาว/ทองจาก data/farmMastery.js
  🔒 ห้ามโชว์เปอร์เซ็นต์โอกาสทอง (user สั่ง 28 ก.ย. 2026) — บอกได้แค่ว่า "ดาวยิ่งมาก ยิ่งมีลุ้น"
  ข้อมูลสรรพคุณเปิดให้อ่านทุกตัวแม้ยังไม่ปลด (เป้าคือให้เพื่อนได้เรียน)
-->
<template>
  <BottomSheet :open="open" icon="📖" title="สมุดพืช" @update:open="v => { if (!v) $emit('close') }">
    <div class="fb-sum">
      <span><Emoji char="⭐" /> ดาวรวม <b>{{ totalStars }}</b> / {{ CROPS.length * 3 }}</span>
      <span class="fb-sum-gold"><Emoji char="herb:lotus:gold" /> เคยได้ทอง <b>{{ goldCount }}</b> / {{ CROPS.length }}</span>
    </div>
    <p class="fb-hint">เก็บเกี่ยวพืชชนิดเดียวกันครบ 10 / 50 / 100 ครั้งได้ดาว ดาวยิ่งเยอะ ยิ่งมีลุ้นได้พืชทองที่ขายได้ราคา ×3</p>

    <div class="fb-list">
      <article v-for="r in rows" :key="r.c.id" class="fb-card" :class="{ open: openId === r.c.id, locked: r.locked }">
        <button class="fb-top" :aria-expanded="openId === r.c.id" @click="openId = openId === r.c.id ? null : r.c.id">
          <span class="fb-icon"><Emoji :char="r.c.emoji" /></span>
          <span class="fb-main">
            <span class="fb-name">{{ r.c.name }}</span>
            <span class="fb-sci">{{ r.c.herb.sci }}</span>
            <span class="fb-prog">
              <span class="fb-stars" :aria-label="`${r.stars} ดาว`"><i v-for="k in 3" :key="k" :class="{ on: k <= r.stars }">★</i></span>
              <template v-if="r.locked">ปลดที่บ้าน Lv.{{ r.c.unlockLevel }}</template>
              <template v-else-if="r.next">เก็บแล้ว {{ r.n }} / {{ r.next }} ครั้ง</template>
              <template v-else>เก็บแล้ว {{ r.n }} ครั้ง · ครบ 3 ดาว</template>
            </span>
          </span>
          <span v-if="r.gold" class="fb-gold" title="เคยได้พืชทองแล้ว"><Emoji :char="goldEmoji(r.c)" /></span>
          <span class="fb-chev" aria-hidden="true">›</span>
        </button>
        <dl v-if="openId === r.c.id" class="fb-info">
          <dt>ส่วนที่ใช้</dt><dd>{{ r.c.herb.part }}</dd>
          <dt>สรรพคุณ</dt><dd>{{ r.c.herb.uses }}</dd>
          <template v-if="r.c.herb.note"><dt>ข้อควรระวัง</dt><dd>{{ r.c.herb.note }}</dd></template>
        </dl>
      </article>
    </div>
    <p class="fb-foot">ข้อมูลสรุปไว้ทบทวนเบื้องต้น อ่านรายละเอียดขนาดยาและข้อห้ามจากบัญชียาหลักแห่งชาติ (ยาจากสมุนไพร)</p>
  </BottomSheet>
</template>

<script setup>
import { ref, computed } from 'vue'
import BottomSheet from '../shared/BottomSheet.vue'
import Emoji from '../shared/Emoji.vue'
import { CROPS } from '../../data/crops.js'
import { masteryStars, nextMasteryCut, goldEmoji } from '../../data/farmMastery.js'
import { useFarm } from '../../composables/useFarm.js'

defineProps({ open: Boolean })
defineEmits(['close'])

const farm = useFarm()
const openId = ref(null)

const rows = computed(() => CROPS.map((c) => {
  const n = farm.harvests.value[c.id] || 0
  return {
    c, n,
    stars: masteryStars(n),
    next: nextMasteryCut(n),
    gold: !!farm.goldFound.value[c.id],
    locked: c.unlockLevel > farm.level.value,
  }
}))
const totalStars = computed(() => rows.value.reduce((s, r) => s + r.stars, 0))
const goldCount  = computed(() => rows.value.filter((r) => r.gold).length)
</script>

<style scoped>
.fb-sum { display: flex; flex-wrap: wrap; gap: 8px 14px; font-size: .82rem; font-weight: 700; color: var(--ink); }
.fb-sum-gold { color: #a06c00; }
.fb-hint { margin: 6px 0 12px; font-size: .74rem; color: rgba(0,0,0,.55); line-height: 1.5; }
.fb-list { display: flex; flex-direction: column; gap: 8px; }
.fb-card { border: 1px solid rgba(62,122,42,.18); border-radius: 14px; background: linear-gradient(160deg,#fff,rgba(139,211,90,.08)); overflow: hidden; }
.fb-card.locked .fb-icon { filter: grayscale(.85) opacity(.6); }
.fb-top { width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: none; border: 0; cursor: pointer; font-family: inherit; text-align: left; color: var(--ink); }
.fb-icon { font-size: 2.2rem; line-height: 1; flex-shrink: 0; }
.fb-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.fb-name { font-weight: 800; font-size: .92rem; }
.fb-sci { font-style: italic; font-size: .72rem; color: rgba(0,0,0,.5); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fb-prog { display: flex; align-items: center; gap: 6px; font-size: .72rem; color: rgba(0,0,0,.6); font-variant-numeric: tabular-nums; }
.fb-stars i { font-style: normal; color: rgba(0,0,0,.15); font-size: .85rem; }
.fb-stars i.on { color: #f0b400; text-shadow: 0 0 4px rgba(240,180,0,.5); }
.fb-gold { font-size: 1.4rem; line-height: 1; flex-shrink: 0; }
.fb-chev { font-size: 1.3rem; color: rgba(0,0,0,.3); transition: transform .2s; }
.fb-card.open .fb-chev { transform: rotate(90deg); }
.fb-info { margin: 0; padding: 2px 14px 12px 58px; display: grid; grid-template-columns: auto 1fr; gap: 4px 10px; font-size: .78rem; line-height: 1.55; }
.fb-info dt { font-weight: 700; color: #3e7a2a; white-space: nowrap; }
.fb-info dd { margin: 0; color: rgba(0,0,0,.75); }
.fb-foot { margin: 14px 0 0; font-size: .7rem; color: rgba(0,0,0,.45); line-height: 1.5; }
@media (max-width: 380px) { .fb-info { padding-left: 14px; grid-template-columns: 1fr; } }
</style>
