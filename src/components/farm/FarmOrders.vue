<template>
  <div class="fo">
    <div class="fo-head">
      <span class="fo-title"><Emoji char="📋" /> ออเดอร์</span>
      <span class="fo-sub">{{ readyCount }} ใบที่ส่งได้</span>
    </div>

    <div class="fo-rail">
      <div v-for="(o, i) in orders" :key="o.id || ('w' + i)" class="fo-card" :class="{ waiting: !o.items }">
        <!-- ช่องกำลังรอใบใหม่ -->
        <div v-if="!o.items" class="fo-wait">
          <Emoji char="⏳" />
          <span>{{ fmt(o.at - now) }}</span>
        </div>

        <!-- ช่องที่มีออเดอร์ -->
        <template v-else>
          <!-- 🧑‍🌾 ผู้สั่ง + คำพูดสั้นๆ (21 พ.ย.) — สุ่มตายตัวจาก id ออเดอร์ ไม่ต้องเก็บใน doc -->
          <div class="fo-who">
            <span class="fo-av"><Emoji :char="clientOf(o).icon" /></span>
            <span class="fo-who-t"><b>{{ clientOf(o).name }}</b><small>“{{ clientOf(o).say }}”</small></span>
          </div>
          <!-- แถวละชนิด: ไอคอนใหญ่ + ชื่อ + มี/ต้องการ — สมุนไพรหลายตัวเขียวเรียวคล้ายกัน ไอคอนเล็กอย่างเดียวแยกไม่ออก (user 28 ก.ย.) -->
          <ul class="fo-items">
            <li v-for="(qty, id) in o.items" :key="id" class="fo-row" :class="{ lack: missing(o)[id] }">
              <span class="fo-ico"><Emoji :char="cropOf(id).emoji" /></span>
              <span class="fo-name">{{ cropOf(id).name }}</span>
              <span class="fo-have">{{ Math.min(have(id), qty) }}/{{ qty }}</span>
            </li>
          </ul>
          <div class="fo-pay">
            <span><Emoji char="🪙" /> {{ o.reward.coins.toLocaleString() }}<span class="sr-only">เหรียญ</span></span>
            <span class="fo-tag" :class="valueOf(o).better ? 'mkt' : 'good'">{{ valueOf(o).text }}</span>
          </div>
          <div class="fo-btns">
            <button
              v-if="ready(o)"
              class="fo-send"
              :disabled="!!busyId"
              @click="onDeliver(i, o)"
            >ส่งออเดอร์</button>
            <!-- ของไม่พอ → บอกว่าขาดอะไร กดแล้วเปิดแผ่นเมล็ดพร้อมเลือกตัวที่ขาดไว้ให้ -->
            <button v-else class="fo-send plant" :disabled="!!busyId" @click="$emit('plant', firstLack(o).id)">
              ขาด{{ lackText(o) }} · ปลูกเลย
            </button>
            <button class="fo-skip" :disabled="!!busyId" aria-label="ทิ้งออเดอร์ใบนี้" @click="onReroll(i, o)">✕</button>
          </div>
        </template>
      </div>
    </div>

    <div class="fo-dots"><span v-for="(o, i) in orders" :key="i" class="fo-dot" :class="{ on: !!o.items }"></span></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Emoji from '../shared/Emoji.vue'
import { useFarmOrders } from '../../composables/useFarmOrders.js'
import { useConfirm } from '../../composables/useConfirm.js'
import { missingItems, canDeliver, REROLL_MS } from '../../data/farmOrders.js'
import { getCrop } from '../../data/crops.js'
import { useFarmMarket } from '../../composables/useFarmMarket.js'

const board = useFarmOrders()
const { confirm } = useConfirm()

const orders    = computed(() => board.orders.value)
const busyId    = computed(() => board.busyId.value)
const now       = ref(Date.now())
let timer = null
let dead = false   // กัน interval ถูกสร้างหลัง unmount ไปแล้ว (await ค้างข้าม unmount)

onMounted(async () => {
  await board.refillDue()
  if (dead) return   // component หายไปแล้วระหว่างรอ await — อย่าสร้าง interval ที่ไม่มีใครเคลียร์
  timer = setInterval(async () => {
    now.value = Date.now()
    // ช่องไหนนับถอยหลังจบแล้วให้เติมใบใหม่ (refillDue ไม่เขียนถ้าไม่มีช่องถึงเวลา)
    await board.refillDue()
  }, 1000)
})
onUnmounted(() => { dead = true; clearInterval(timer) })

defineEmits(['plant'])
const mkt = useFarmMarket()

// ผู้สั่ง — คนทั่วไปในเมือง (ไม่เกี่ยวกับคณะ · user 21 พ.ย.) · เลือกจาก id ออเดอร์ ⇒ ใบเดิมได้คนเดิมเสมอ
const CLIENTS = [
  { icon: '🏥', name: 'ร้านยาป้าแดง', say: 'ลูกค้าถามหาทั้งวันเลย' },
  { icon: '🍵', name: 'ร้านชาสมุนไพรริมทาง', say: 'เมนูใหม่ขายดีเกินคาด' },
  { icon: '🧓', name: 'คุณตาหมอยาพื้นบ้าน', say: 'เตรียมของไว้ให้ชาวบ้าน' },
  { icon: '🧴', name: 'แบรนด์สกินแคร์มือใหม่', say: 'ทำล็อตทดลองชุดแรก' },
  { icon: '🍛', name: 'ร้านข้าวแกงเจ๊หมวย', say: 'ของหมดครัวตั้งแต่เช้า' },
  { icon: '💆', name: 'ร้านนวดแผนไทยหัวมุม', say: 'ลูกค้าเยอะช่วงนี้' },
  { icon: '🏨', name: 'โรงแรมริมแม่น้ำ', say: 'จัดของต้อนรับแขก' },
  { icon: '🛒', name: 'ร้านค้าส่งตลาดเช้า', say: 'เหมาไปขายต่อ' },
  { icon: '🎁', name: 'ร้านของฝากหน้าวัด', say: 'จัดกระเช้าให้ลูกค้า' },
  { icon: '👩‍🍳', name: 'เชฟร้านอาหารไทยร่วมสมัย', say: 'คิดเมนูใหม่อยู่' },
]
const clientOf = (o) => { let h = 0; for (const ch of String(o.id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return CLIENTS[h % CLIENTS.length] }

// เทียบกับขายตลาด "วันนี้" (รวมราคาข่าวตลาด) — วันที่ราคาพุ่งแรง ขายเองอาจคุ้มกว่า บอกตรงๆ
function valueOf(o) {
  let base = 0, today = 0
  for (const [id, q] of Object.entries(o.items)) { const p = getCrop(id)?.sellPrice || 0; base += p * q; today += mkt.priceOf(id, p) * q }
  if (!base) return { better: false, text: '' }
  if (today >= o.reward.coins) return { better: true, text: `🔥 วันนี้ขายตลาดได้ ${today.toLocaleString()}` }
  return { better: false, text: `คุ้มกว่าขาย +${Math.round((o.reward.coins / today - 1) * 100)}%` }
}
const firstLack = (o) => { const m = missing(o); const id = Object.keys(m)[0]; return { id, n: m[id] } }
const lackText = (o) => Object.entries(missing(o)).map(([id, n]) => `${cropOf(id).name} ${n}`).join(' · ')

const cropOf = (id) => getCrop(id) || { name: id, emoji: '❓' }
const missing = (o) => missingItems(o, board.inventory.value)
const ready   = (o) => canDeliver(o, board.inventory.value)
const have    = (id) => Number(board.inventory.value[id]) || 0
const readyCount = computed(() => orders.value.filter(o => o.items && ready(o)).length)

function fmt(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}ชม ${m}น`
  if (m > 0) return `${m}น ${s % 60}ว`
  return `${s}ว`
}

function listText(o) {
  return Object.entries(o.items).map(([id, q]) => `${cropOf(id).name} ×${q}`).join(' · ')
}

async function onDeliver(i, o) {
  if (await confirm(`ส่ง ${listText(o)} แลก ${o.reward.coins.toLocaleString()} เหรียญ?`)) board.deliver(i)
}
async function onReroll(i, o) {
  const hrs = Math.round(REROLL_MS / 3600000)
  if (await confirm(`ทิ้งออเดอร์ ${listText(o)}? ช่องนี้จะรอ ${hrs} ชั่วโมงก่อนได้ใบใหม่`)) board.reroll(i)
}
</script>

<style scoped>
.fo { background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 16px; padding: 14px; margin-top: 12px; }
.fo-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 10px; }
.fo-title { font-weight: 800; font-size: 1rem; }
.fo-sub { font-size: .7rem; color: rgba(0,0,0,.45); }
/* overflow-x อยู่ที่รางเท่านั้น — ห้ามให้ทั้งหน้าเลื่อนแนวนอนได้ */
/* ⚠️ min-width:0 จำเป็น — flex item ค่าเริ่มต้นเป็น min-width:auto จึงกางออกเท่าเนื้อหา
   แทนที่จะยอมหด ทำให้ overflow-x:auto ไม่มีผลและรางไปดัน <main> จนทั้งหน้าเลื่อนออกข้าง
   (วัดจากจอจริง 27 ส.ค.: ราง 892px ในกล่อง 487px → main ล้น 816/545) */
.fo-rail { display: flex; gap: 8px; overflow-x: auto; min-width: 0; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; padding-bottom: 6px; }
.fo { min-width: 0; }
.fo-card { position: relative; /* กัน .sr-only (absolute) หลุดกรอบราง → ทั้งหน้าเลื่อนซ้ายขวาได้ 15 พ.ย. */ flex: 0 0 212px; scroll-snap-align: start; display: flex; flex-direction: column; justify-content: space-between; gap: 6px; min-height: 118px; border: 1px solid rgba(180,83,9,.2); border-radius: 12px; background: linear-gradient(160deg,#fff,rgba(245,158,11,.06)); padding: 10px; }
.fo-card.waiting { background: rgba(0,0,0,.03); border-style: dashed; }
.fo-wait { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; height: 100%; color: rgba(0,0,0,.45); font-size: .75rem; font-weight: 700; }
.fo-items { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.fo-row { display: flex; align-items: center; gap: 7px; background: rgba(34,197,94,.09); border-radius: 9px; padding: 3px 8px 3px 4px; }
.fo-row.lack { background: rgba(0,0,0,.045); }
.fo-ico { font-size: 1.7rem; line-height: 1; flex-shrink: 0; }
.fo-name { flex: 1; min-width: 0; font-size: .76rem; font-weight: 700; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fo-have { font-size: .76rem; font-weight: 800; color: #15803d; font-variant-numeric: tabular-nums; }
.fo-row.lack .fo-have { color: #b91c1c; }
.fo-pay { font-size: .82rem; font-weight: 800; color: #b45309; display: flex; align-items: center; justify-content: space-between; gap: 6px; flex-wrap: wrap; }
.fo-tag { font-size: .7rem; font-weight: 800; border-radius: 999px; padding: 1px 8px; }
.fo-tag.good { background: rgba(34,197,94,.13); color: #15803d; }
.fo-tag.mkt { background: #ffe9e4; color: #c2410c; }
.fo-who { display: flex; align-items: center; gap: 7px; min-width: 0; }
.fo-av { font-size: 1.3rem; line-height: 1; flex-shrink: 0; }
.fo-who-t { display: flex; flex-direction: column; min-width: 0; line-height: 1.25; }
.fo-who-t b { font-size: .76rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fo-who-t small { font-size: .7rem; color: rgba(0,0,0,.5); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fo-send.plant { background: linear-gradient(135deg,#5b9fe0,#3b82c4); font-size: .72rem; }
.fo-btns { display: flex; gap: 6px; }
.fo-send { flex: 1; border: none; background: linear-gradient(135deg,#22c55e,#16a34a); color: #fff; font-weight: 800; font-size: .76rem; padding: 7px; border-radius: 9px; cursor: pointer; font-family: inherit; }
.fo-send:disabled { background: rgba(0,0,0,.12); color: rgba(0,0,0,.38); cursor: not-allowed; }
.fo-skip { border: 1px solid rgba(0,0,0,.14); background: #fff; color: rgba(0,0,0,.5); font-size: .74rem; padding: 7px 9px; border-radius: 9px; cursor: pointer; font-family: inherit; }
.fo-skip:disabled { opacity: .4; cursor: not-allowed; }
.fo-dots { display: flex; justify-content: center; gap: 4px; margin-top: 4px; }
.fo-dot { width: 5px; height: 5px; border-radius: 999px; background: rgba(0,0,0,.14); }
.fo-dot.on { background: #b45309; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
</style>
