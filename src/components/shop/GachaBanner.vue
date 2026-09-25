<template>
  <!-- แบนเนอร์ตู้อัญเชิญ 1 ใบ — ใช้ทั้งตู้ปกติและตู้อีเวนต์ ต่างกันแค่ props
       หน้าตาใหม่ 25 ก.ย. 2026 (user เลือกจากเดโม): หัวเป็นภาพตู้แคปซูล · การันตีเป็นแถบ · อัตราพับไว้ · ปุ่มสุ่ม 10 เด่นกว่า
       🔑 ตู้อีเวนต์ = `event` true ⇒ สีทอง + ตัวเด่น + นับถอยหลัง และ **ไม่มีแถวเป้าหมาย**
          (เป้าที่ตั้งค้างไว้จะชนะตัวเด่น ถ้าเปิดไว้ — สเปกแม่ §6 กติกาข้อ 4) -->
  <div class="bn" :class="{ ev: event }">
    <div class="bn-hero">
      <div class="bn-kicker">{{ event ? 'ตู้อีเวนต์' : 'ตู้ประจำ' }}</div>
      <div class="bn-name">{{ title }}</div>
      <template v-if="event">
        <!-- ตัวเด่นของอีเวนต์ — บอกตรงๆ ว่าดันตัวไหนก่อน ไม่ต้องให้เดาจากเรต -->
        <div v-if="featured.length" class="bn-feat">
          <span v-for="p in featured" :key="p.id" :title="p.name"><Emoji :char="p.emoji" /></span>
        </div>
        <span class="bn-time">⏳ เหลือ {{ timeLeft }}</span>
      </template>
      <div v-else class="bn-desc">เพ็ททุกตัวในคลังปกติ ออกตำนานแล้วลุ้นตัวที่ตั้งเป้าไว้</div>

      <!-- ตู้แคปซูลจิ๋ว (CSS ล้วน ไม่มีรูป) -->
      <div class="mm" aria-hidden="true">
        <div class="mm-dome">
          <span v-for="(c, i) in caps" :key="i" class="mm-cap" :style="{ '--c': c, left: POS[i][0] + '%', top: POS[i][1] + '%' }"></span>
        </div>
        <div class="mm-body"><div class="mm-knob"></div><div class="mm-chute"></div></div>
      </div>
    </div>

    <div class="bn-body">
      <div class="pity">
        <div class="pity-row"><span>การันตีตำนาน</span><span class="pity-left">อีก {{ pityLeft }} ครั้ง</span></div>
        <div class="pity-bar" role="progressbar" :aria-valuenow="HARD_PITY - pityLeft" aria-valuemin="0" :aria-valuemax="HARD_PITY">
          <i :style="{ width: ((HARD_PITY - pityLeft) / HARD_PITY * 100) + '%' }"></i>
        </div>
      </div>

      <div v-if="event" class="bn-note">ออกตำนานเมื่อไหร่ ดันตัวเด่นที่ยังไม่มีก่อน · คลังเต็ม 33 ตัว · ใช้การันตีร่วมกับตู้ประจำ</div>

      <template v-if="showTarget">
        <button class="target" @click="$emit('open-target')">
          <span class="target-ic"><Emoji :char="targetPet ? targetPet.emoji : '🎯'" /></span>
          <span class="target-txt">
            <small>เป้าหมาย</small>
            <b>{{ targetPet ? targetPet.name : 'ยังไม่เลือก (ออกตัวที่ยังไม่มีก่อน)' }}</b>
          </span>
          <span class="target-ch">{{ targetPet ? 'เปลี่ยน' : 'เลือก' }} ›</span>
        </button>
        <div v-if="guaranteed && targetPet" class="guar"><Emoji char="✅" /> ตำนานรอบหน้าได้ {{ targetPet.name }} แน่นอน</div>
      </template>

      <details class="rates">
        <summary>อัตราออก</summary>
        <div class="rate-row">
          <span v-for="r in rates" :key="r.key" :style="{ background: r.color }">{{ r.label }} {{ r.pct }}%</span>
        </div>
      </details>

      <div class="pulls">
        <button class="pb one" :class="{ dim: !can1 }" :disabled="busy" @click="$emit('pull', 1)">
          สุ่ม 1
          <small v-if="pay1.pay === 'ticket'">{{ pay1.amount }}<Emoji char="🎟️" /></small>
          <small v-else>{{ pullCost.toLocaleString() }}<Emoji char="🪙" /></small>
        </button>
        <button class="pb ten" :class="{ dim: !can10 }" :disabled="busy" @click="$emit('pull', 10)">
          <span class="pb-bonus">ได้ 11</span>
          สุ่ม 10
          <small v-if="pay10.pay === 'ticket'">{{ pay10.amount }}<Emoji char="🎟️" /></small>
          <small v-else>{{ tenPullCost.toLocaleString() }}<Emoji char="🪙" /></small>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Emoji from '../shared/Emoji.vue'
import { HARD_PITY } from '../../utils/gacha.js'

const props = defineProps({
  title: { type: String, required: true },
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

const POS = [[8, 40], [34, 46], [58, 38], [20, 20], [48, 16], [70, 50]]
const caps = computed(() => props.event
  ? ['#fbbf24', '#f28bb0', '#fbbf24', '#fff', '#c084fc', '#fbbf24']
  : ['#60a5fa', '#c084fc', '#94a3b8', '#fbbf24', '#f28bb0', '#60a5fa'])
// จ่ายไหวไหม — ไม่ไหวก็กดได้ (ShopView toast บอกว่าขาดเท่าไร) แค่จางลงให้รู้ก่อนกด
const can1 = computed(() => props.pay1.pay === 'ticket' || props.coins >= props.pullCost)
const can10 = computed(() => props.pay10.pay === 'ticket' || props.coins >= props.tenPullCost)
</script>

<style scoped>
.bn { border-radius: 22px; overflow: hidden; background: #fff; border: var(--bw) solid var(--line); box-shadow: var(--pop-lg); }
.bn + .bn { margin-top: 14px; }
.bn-hero { position: relative; min-height: 150px; padding: 16px 16px 14px; color: #fff;
  background: radial-gradient(circle at 85% 30%, rgba(255,255,255,.35), transparent 40%), linear-gradient(145deg, #6d4fd0, #a78bfa 60%, #f0a6d0); }
.bn.ev .bn-hero { color: #4a2c00; background: radial-gradient(circle at 80% 20%, rgba(255,255,255,.6), transparent 45%), linear-gradient(145deg, #ffcf4d, #ffe79a 55%, #ffd1e6); }
.bn-kicker { font-size: .7rem; font-weight: 800; letter-spacing: .08em; opacity: .85; }
.bn-name { font-family: var(--font-display); font-size: 1.45rem; line-height: 1.15; margin-top: 2px; max-width: 60%; }
.bn-desc { font-size: .74rem; opacity: .92; margin-top: 4px; max-width: 58%; line-height: 1.4; }
.bn-time { display: inline-block; margin-top: 8px; font-size: .72rem; font-weight: 800; background: rgba(255,255,255,.75); color: #7a4a00; border-radius: 999px; padding: 2px 10px; }
.bn-feat { display: flex; gap: 6px; margin-top: 10px; max-width: 62%; flex-wrap: wrap; }
.bn-feat span { width: 46px; height: 46px; border-radius: 14px; background: rgba(255,255,255,.75); display: grid; place-items: center; font-size: 1.6rem; box-shadow: 0 4px 10px -4px rgba(120,70,0,.4); }

.mm { position: absolute; right: 12px; bottom: 10px; width: 108px; height: 128px; pointer-events: none; }
.mm-dome { position: absolute; left: 10px; right: 10px; top: 0; height: 72px; border-radius: 44px 44px 12px 12px; background: rgba(255,255,255,.35); border: 2px solid rgba(255,255,255,.8); overflow: hidden; }
.mm-cap { position: absolute; width: 22px; height: 22px; border-radius: 50%; background: linear-gradient(#fff 0 50%, var(--c) 50%); border: 1.5px solid rgba(43,53,80,.2); }
.mm-body { position: absolute; left: 4px; right: 4px; top: 66px; bottom: 0; border-radius: 14px; background: #fff; border: 2px solid rgba(255,255,255,.9); box-shadow: inset 0 -6px 0 rgba(43,53,80,.08); }
.mm-knob { position: absolute; left: 50%; top: 16px; width: 26px; height: 26px; margin-left: -13px; border-radius: 50%; background: #7c5cd6; box-shadow: inset 0 -3px 0 rgba(0,0,0,.15); }
.mm-knob::after { content: ''; position: absolute; left: 4px; right: 4px; top: 11px; height: 4px; background: #fff; border-radius: 2px; }
.mm-chute { position: absolute; left: 50%; bottom: 8px; width: 30px; height: 14px; margin-left: -15px; border-radius: 6px; background: var(--ink); opacity: .8; }
.bn.ev .mm-knob { background: #f59e0b; }

.bn-body { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 10px; }
.pity-row { display: flex; justify-content: space-between; font-size: .74rem; font-weight: 700; }
.pity-left { color: #b45309; }
.pity-bar { height: 8px; margin-top: 4px; border-radius: 999px; overflow: hidden; background: rgba(43,53,80,.08); }
.pity-bar i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #fbbf24, #ff9d2e); transition: width .3s; }
.bn-note { font-size: .72rem; color: var(--muted); line-height: 1.45; }

.target { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 10px; border-radius: 14px; background: #efe9fd; border: 1px dashed #b9a6ef; font-family: inherit; text-align: left; cursor: pointer; color: var(--ink); }
.target-ic { width: 40px; height: 40px; flex-shrink: 0; border-radius: 12px; background: #fff; display: grid; place-items: center; font-size: 1.5rem; box-shadow: 0 0 0 2px #fbbf24; }
.target-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.target-txt small { font-size: .7rem; color: var(--muted); }
.target-txt b { font-size: .84rem; }
.target-ch { font-weight: 800; font-size: .74rem; color: #7c5cd6; flex-shrink: 0; }
.guar { font-size: .72rem; font-weight: 800; color: #1f7a5c; }

.rates summary { font-size: .72rem; font-weight: 700; color: var(--muted); cursor: pointer; }
.rate-row { display: flex; gap: 6px; margin-top: 6px; }
.rate-row span { flex: 1; text-align: center; font-size: .7rem; font-weight: 800; border-radius: 8px; padding: 3px 0; color: #fff; }

.pulls { display: grid; grid-template-columns: 1fr 1.35fr; gap: 8px; }
.pb { position: relative; border: 0; border-radius: 14px; padding: 10px 8px; font-family: inherit; font-weight: 800; font-size: .9rem; line-height: 1.2; cursor: pointer; transition: transform .12s, opacity .12s; }
.pb small { display: block; font-size: .72rem; font-weight: 700; opacity: .92; margin-top: 2px; }
.pb:active:not(:disabled) { transform: scale(.97); }
.pb:disabled { opacity: .6; cursor: default; }
.pb.dim { opacity: .5; }
.pb.one { background: #fff; color: #7c5cd6; border: 1.5px solid #b9a6ef; }
.pb.ten { background: linear-gradient(135deg, #7c5cd6, #b07ce8); color: #fff; box-shadow: 0 8px 18px -8px rgba(124,92,214,.8); }
.pb-bonus { position: absolute; top: -8px; right: 8px; background: var(--accent); color: #fff; font-size: .7rem; padding: 1px 8px; border-radius: 999px; }
.bn.ev .pb.one { color: #9a5b00; border-color: #f5c451; }
.bn.ev .pb.ten { background: linear-gradient(135deg, #f59e0b, #f7b93e); box-shadow: 0 8px 18px -8px rgba(200,120,0,.8); }
</style>
