<template>
  <!-- แบนเนอร์ตู้อัญเชิญ 1 ใบ — ใช้ทั้งตู้ปกติและตู้อีเวนต์ (P5) ต่างกันแค่ props
       🔑 ตู้อีเวนต์ = `event` true ⇒ มีป้าย EVENT + นับถอยหลัง + แถวตัวเด่น และ **ไม่มีแถวเป้าหมาย**
          (เป้าที่ตั้งค้างไว้จะชนะตัวเด่น ถ้าเปิดไว้ — สเปกแม่ §6 กติกาข้อ 4) -->
  <div class="banner" :class="{ ev: event }">
    <div v-if="event" class="ev-tag">EVENT</div>

    <div class="banner-top">
      <div class="banner-title"><Emoji :char="icon" /> {{ title }}</div>
      <div class="banner-pity">การันตี legendary อีก {{ pityLeft }} ครั้ง</div>
    </div>

    <div v-if="event" class="ev-left">เหลืออีก {{ timeLeft }}</div>

    <!-- ตัวเด่นของอีเวนต์ — บอกตรงๆ ว่าดันตัวไหนก่อน ไม่ต้องให้เดาจากเรต -->
    <div v-if="event && featured.length" class="ev-feat">
      <div v-for="p in featured" :key="p.id" class="ev-feat-cell">
        <span class="ev-feat-emoji"><Emoji :char="p.emoji" /></span>
        <span class="ev-feat-name">{{ p.name }}</span>
      </div>
    </div>
    <div v-if="event" class="ev-note">คลังเต็ม 33 ตัว · ออก legendary จะดันตัวเด่นที่ยังไม่มีก่อน</div>

    <template v-if="showTarget">
      <button class="target-row" @click="$emit('open-target')">
        <template v-if="targetPet">
          <span class="target-emoji"><Emoji :char="targetPet.emoji" /></span>
          <span class="target-text">เป้าหมาย: <b>{{ targetPet.name }}</b></span>
        </template>
        <span v-else class="target-text">เลือกเป้าหมาย legendary (ยังไม่เลือก = ตัวที่ยังไม่มีก่อน)</span>
        <span class="target-edit">เปลี่ยน</span>
      </button>
      <div v-if="guaranteed && targetPet" class="banner-guar"><Emoji char="✅" /> รอบหน้าได้ {{ targetPet.name }} แน่นอน</div>
    </template>

    <div class="banner-rates">
      <span v-for="r in rates" :key="r.key" :style="{ color: r.color }">{{ r.label }} {{ r.pct }}%</span>
    </div>

    <div v-if="tickets > 0" class="ticket-note"><Emoji char="🎟️" /> ตั๋วอัญเชิญ: {{ tickets }} ใบ (ใช้ตั๋วก่อนอัตโนมัติ)</div>
    <div class="pull-row">
      <button class="pull-btn" :class="{ ok: pay1.pay === 'ticket' || coins >= pullCost }" :disabled="busy" @click="$emit('pull', 1)">
        สุ่ม 1<br>
        <small v-if="pay1.pay === 'ticket'">{{ pay1.amount }}<Emoji char="🎟️" /></small>
        <small v-else>{{ pullCost.toLocaleString() }}<Emoji char="🪙" /></small>
      </button>
      <button class="pull-btn" :class="{ ok: pay10.pay === 'ticket' || coins >= tenPullCost }" :disabled="busy" @click="$emit('pull', 10)">
        สุ่ม 10<br>
        <small v-if="pay10.pay === 'ticket'">{{ pay10.amount }}<Emoji char="🎟️" /></small>
        <small v-else>{{ tenPullCost.toLocaleString() }}<Emoji char="🪙" /></small>
      </button>
    </div>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'

defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: '🎰' },
  event: { type: Boolean, default: false },
  timeLeft: { type: String, default: '' },
  featured: { type: Array, default: () => [] },
  pityLeft: { type: Number, required: true },
  rates: { type: Array, required: true },
  tickets: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  busy: { type: Boolean, default: false },
  pay1: { type: Object, required: true },
  pay10: { type: Object, required: true },
  pullCost: { type: Number, required: true },
  tenPullCost: { type: Number, required: true },
  showTarget: { type: Boolean, default: false },
  targetPet: { type: Object, default: null },
  guaranteed: { type: Boolean, default: false },
})
defineEmits(['pull', 'open-target'])
</script>

<style scoped>
.banner { position: relative; background: #fff; border: 2px solid var(--ink); border-radius: 16px; padding: 14px; box-shadow: var(--pop); }
.banner + .banner { margin-top: 12px; }
.banner-top { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.banner-title { font-weight: 800; font-size: .95rem; }
.banner-pity { font-size: .7rem; color: #b45309; font-weight: 700; }
.target-row { display: flex; align-items: center; gap: 8px; width: 100%; margin-top: 10px; border: 2px dashed var(--ink); border-radius: 11px; padding: 8px 10px; background: var(--primary-light); font-family: inherit; font-size: .72rem; cursor: pointer; text-align: left; }
.target-emoji { font-size: 1.4rem; }
.target-text { flex: 1; min-width: 0; }
.target-edit { font-weight: 800; color: var(--primary); font-size: .7rem; }
.banner-guar { margin-top: 6px; font-size: .7rem; font-weight: 700; color: #059669; }
.banner-rates { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; font-size: .7rem; font-weight: 700; }
.ticket-note { font-size: .7rem; font-weight: 800; color: #b45309; margin-bottom: 8px; }
.pull-row { display: flex; gap: 8px; }
.pull-btn { flex: 1; border: 2px solid var(--ink); border-radius: 11px; padding: 10px; font-family: inherit; font-weight: 800; font-size: .85rem; color: #fff; background: #c9c2d4; cursor: pointer; transition: transform .12s, box-shadow .12s; }
.pull-btn small { font-size: .7rem; font-weight: 700; }
.pull-btn.ok { background: var(--primary); box-shadow: var(--pop); }
.pull-btn.ok:active:not(:disabled) { transform: translate(2px,2px); box-shadow: 0 0 0 var(--ink); }
.pull-btn:disabled { opacity: .6; }

/* ── ตู้อีเวนต์ ── สีทองแยกจากตู้ปกติชัดเจน ตัวอักษรบนพื้นเข้มต้องสว่าง (CLAUDE.md ข้อ 13) */
.banner.ev { background: linear-gradient(160deg, #fffbeb, #fef3c7); border-color: #b45309; }
.ev-tag { position: absolute; top: -10px; left: 12px; background: #b45309; color: #fff; font-size: .62rem; font-weight: 900; letter-spacing: .08em; padding: 2px 8px; border-radius: 999px; border: 2px solid #fff; }
.ev-left { margin-top: 4px; font-size: .72rem; font-weight: 800; color: #b45309; }
.ev-feat { display: flex; gap: 8px; margin-top: 10px; }
.ev-feat-cell { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; background: #fff; border: 2px solid #b45309; border-radius: 11px; padding: 6px 2px; }
.ev-feat-emoji { font-size: 1.5rem; line-height: 1; }
.ev-feat-name { font-size: .65rem; font-weight: 800; color: rgba(0,0,0,.65); }
.ev-note { margin-top: 8px; font-size: .66rem; color: rgba(0,0,0,.5); line-height: 1.35; }
</style>
