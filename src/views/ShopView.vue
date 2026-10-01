<template>
  <div class="tab-content">
    <div class="shop-head">
      <div class="page-title" style="margin-bottom:0"><Emoji char="🛍️" /> ร้านค้า</div>
      <span class="shop-coins">{{ coins.toLocaleString() }} <Emoji char="🪙" /></span>
      <HelpButton topic="summon" />
    </div>

    <!-- ร้านค้าปิดปรับปรุง (ยังไม่เปิดให้นักศึกษา) — flip SHOP_OPEN=true เมื่อพร้อม; admin เห็นร้านปกติไว้ทดสอบ -->
    <template v-if="!shopOpen">
      <div class="shop-maint">
        <div class="shop-maint-emoji"><Emoji char="🚧" /></div>
        <div class="shop-maint-title">ร้านค้ากำลังปรับปรุง</div>
        <div class="shop-maint-msg">กำลังจัดของให้พร้อม เดี๋ยวเปิดให้ช้อปเร็วๆ นี้!</div>
      </div>
    </template>

    <template v-else-if="authStore.isLoggedIn">
      <!-- หน้าร้านค้ารวม 3 ร้าน (25 ก.ย. 2026) — ร้านเพ็ท = อัญเชิญ + ห้องทดลองในหน้าเดียว -->
      <div class="stores" role="tablist">
        <button v-for="s in STORES" :key="s.k" class="store" :class="['st-' + s.k, { on: tab === s.k }]" role="tab" :aria-selected="tab === s.k" @click="tab = s.k">
          <span v-if="s.k === 'pet' && dustDot" class="nav-dot store-dot" aria-label="มีตัวซ้ำรอแปลงเป็นประกายดาว"></span>
          <span class="store-emoji"><Emoji :char="s.icon" /></span>
          <span class="store-name">{{ s.name }}</span>
          <span class="store-sub">{{ s.sub }}</span>
        </button>
      </div>

      <template v-if="tab === 'style'">
        <div class="style-note">
          <b><Emoji char="🎀" /> ร้านตกแต่ง</b> แตะชิ้นไหนก็ลองใส่บนการ์ดด้านล่างได้เลย ยังไม่เสียเงิน · ซื้อครั้งเดียวเก็บถาวร ใส่ได้หมวดละ 1 ชิ้น
          <span class="style-where">โชว์ที่ไหน: <b>สีชื่อ · กรอบรูป · ป้ายหน้าชื่อ</b> ขึ้นในหน้าสมาชิก การ์ดโปรไฟล์ และหน้าฉัน · <b>พื้นการ์ด</b> ขึ้นเต็มในการ์ดโปรไฟล์และหน้าฉัน ส่วนหน้าสมาชิกขึ้นแบบจางๆ · ในหน้าสมาชิกทุกอย่างเป็นภาพนิ่ง</span>
        </div>
        <CosmeticShop />
      </template>
      <FarmStore v-else-if="tab === 'farm'" />
      <template v-else>
      <div class="shop-storage">
        <span><Emoji char="🐾" /> สะสมแล้ว {{ pets.length }}/{{ ownable.length }} ชนิด</span>
        <span v-if="tickets > 0" class="shop-ticket"><Emoji char="🎟️" /> ตั๋ว {{ tickets }} ใบ · ใช้ก่อนเหรียญ</span>
      </div>

      <!-- ตู้อีเวนต์อยู่บน ตู้ปกติอยู่ล่าง (แบบเกมกาชาทั่วไป — user เคาะ 11 ก.ย.)
           ตู้อีเวนต์โผล่/หายเองตามนาฬิกา ไม่ต้องรีโหลดหน้า -->
      <GachaBanner
        v-if="ev.active"
        :title="ev.name" event :time-left="evLeft" :featured="featuredPets"
        :pity="pity" :rates="rateList" :tickets="tickets" :coins="coins" :busy="buying"
        :pay1="pay1" :pay10="pay10" :pull-cost="PULL_COST" :ten-pull-cost="TEN_PULL_COST"
        show-target :target-pet="themeTargetPet"
        @pull="(n) => pull(n, true)" @open-target="openPicker('theme')" @info="(p) => { pickerMode = 'theme'; infoPet = p }"
      />
      <GachaBanner
        title="อัญเชิญประจำ"
        :pity="pity" :rates="rateList" :tickets="tickets" :coins="coins" :busy="buying"
        :pay1="pay1" :pay10="pay10" :pull-cost="PULL_COST" :ten-pull-cost="TEN_PULL_COST"
        show-target :target-pet="targetPet"
        @pull="(n) => pull(n)" @open-target="openPicker('normal')"
      />
      <div class="shop-note">ได้เพ็ทที่มีแล้ว = ได้ตัวซ้ำไว้อัพเกรด · ตัวซ้ำเกินที่ต้องใช้อัพจนเต็ม จะกลายเป็นประกายดาว เอาไปแลกของที่ตู้แลกด้านล่าง</div>
      <LabTab />
      </template>
    </template>
    <div v-else class="shop-login">เข้าสู่ระบบเพื่อช้อป</div>

    <!-- target picker -->
    <Teleport to="body">
      <div v-if="pickerOpen" class="ov" @click.self="pickerOpen = false">
        <div class="picker">
          <div class="picker-head">{{ pickerMode === 'theme' ? 'เลือกเป้าหมายตู้ ' + ev.name : 'เลือกเป้าหมาย legendary' }}</div>
          <div class="picker-hint">กดการ์ด = ตั้งเป้า · กด <Emoji char="ℹ️" /> = อ่านสกิลเต็ม</div>
          <div class="picker-grid">
            <div v-for="p in pickerList" :key="p.id" class="picker-cell" :class="{ on: p.id === pickerOn }" @click="chooseTarget(p.id)">
              <button class="picker-info" @click.stop="infoPet = p" aria-label="ดูรายละเอียด"><Emoji char="ℹ️" /></button>
              <span class="picker-emoji"><Emoji :char="p.emoji" /></span>
              <span class="picker-name">{{ p.name }}</span>
              <span v-if="passiveOf(p)" class="picker-skill"><Emoji :char="passiveOf(p).icon" /> {{ passiveOf(p).name }}</span>
              <span v-if="pets.find((x) => x.id === p.id)" class="picker-have">มีแล้ว</span>
            </div>
          </div>
          <button class="picker-clear" @click="chooseTarget(pickerOn)">{{ pickerOn ? 'ล้างเป้าหมาย' : 'ปิด' }}</button>
        </div>
      </div>
    </Teleport>

    <!-- legendary info (flavor) -->
    <Teleport to="body">
      <div v-if="infoPet" class="ov" @click.self="infoPet = null">
        <div class="info-box">
          <button class="info-x" aria-label="ปิด" @click="infoPet = null">✕</button>
          <div class="info-emoji"><Emoji :char="infoPet.emoji" /></div>
          <div class="info-name">{{ infoPet.name }}</div>
          <div class="info-rarity" :style="{ background: rarityColor(infoPet.rarity) }">{{ RARITY[infoPet.rarity]?.label }}</div>
          <div v-if="passiveOf(infoPet)" class="info-passive">
            <b><Emoji :char="passiveOf(infoPet).icon" /> {{ passiveOf(infoPet).name }}</b> — {{ passiveText(passiveOf(infoPet)) }}
          </div>
          <button v-if="!(pickerMode === 'theme' && !ev.featured.includes(infoPet.id))" class="info-target" @click="chooseTarget(infoPet.id); infoPet = null">ตั้งเป็นเป้าหมาย</button>
        </div>
      </div>
    </Teleport>

    <!-- ฉากเปิดแคปซูล (user เลือกจากเดโม 25 ก.ย. 2026) — ตู้หมุน · แสงใบ้หลังตู้ · แคปซูลแตก / ถาด 11 ลูก -->
    <CapsuleReveal v-if="reveal" :summary="reveal.summary" :multi="reveal.multi" @close="reveal = null" />
  </div>
</template>

<script setup>
import { useEscapeKey } from '../composables/useEscapeKey.js'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import Emoji from '../components/shared/Emoji.vue'
import { useNavDots } from '../composables/useNavDots.js'
import HelpButton from '../components/help/HelpButton.vue'
import LabTab from '../components/shop/LabTab.vue'
import { increment } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from '../composables/useToast.js'
import { PETS, RARITY, passiveOf } from '../data/index.js'
import { passiveText } from '../data/petPassives.js'
import { bumpDailyQuest } from '../utils/dailyQuest.js'
import { rollMany, resolvePullPayment, GACHA_RATES, PULL_COST, TEN_PULL_COST, TEN_PULL_N, HARD_PITY, HALF_PITY } from '../utils/gacha.js'
import { mergeRolls } from '../utils/gachaMerge.js'
import { addDust, dustOf } from '../utils/stardust.js'
import { useRosterSync } from '../composables/useRosterSync.js'
import { grantSecret } from '../composables/useAchievements.js'
import { releasedPets, obtainablePets } from '../utils/petCatalog.js'
import { eventState, timeLeftText } from '../utils/gachaEvent.js'
import { useConfirm } from '../composables/useConfirm.js'
import GachaBanner from '../components/shop/GachaBanner.vue'
import CapsuleReveal from '../components/shop/CapsuleReveal.vue'
import { useAppConfig } from '../composables/useAppConfig.js'
import CosmeticShop from '../components/shop/CosmeticShop.vue'
import FarmStore from '../components/shop/FarmStore.vue'
import { useRoute } from 'vue-router'

const authStore = useAuthStore()
const { toast } = useToast()
const { confirm } = useConfirm()

// ร้านค้าเปิดให้นักศึกษาแล้ว (21 มิ.ย. 2026) — flip false เพื่อปิดปรับปรุง (admin เห็นร้านปกติเสมอ)
const SHOP_OPEN = true
const shopOpen = computed(() => SHOP_OPEN || authStore.isAdmin)
const { syncRosterRow } = useRosterSync()
// ?tab=style = ลิงก์ "ตกแต่ง" จากหน้าฉัน
const STORES = [
  { k: 'pet', icon: '🐾', name: 'ร้านเพ็ท', sub: 'อัญเชิญ · ประกายดาว' },
  { k: 'farm', icon: '🌱', name: 'ร้านฟาร์ม', sub: 'ปลดแปลงเพิ่ม' },
  { k: 'style', icon: '🎀', name: 'ร้านตกแต่ง', sub: 'สีชื่อ · กรอบ · ป้าย' },
]
// ?tab=style|farm|pet (เดิม gacha/lab = ร้านเพ็ท) — ลิงก์จากหน้าฉัน/หน้าเกมชี้ร้านตรงได้
const qTab = String(useRoute().query.tab || '')
const tab = ref(STORES.some(s => s.k === qTab) ? qTab : 'pet')

const { dustDot } = useNavDots()
const coins   = computed(() => authStore.userData?.coins || 0)
const pets    = computed(() => authStore.userData?.pets || [])
const tickets = computed(() => authStore.userData?.freeGachaTickets || 0)
const pity    = computed(() => authStore.userData?.gachaPity || 0)
const target  = computed(() => authStore.userData?.gachaTarget || null)
const guaranteed = computed(() => !!authStore.userData?.gachaGuaranteed)

const { rawConfig } = useAppConfig()
// คลังที่ "แจกได้" ตอนนี้ — เพ็ทที่ยังไม่เปิดตัวต้องไม่โผล่ในกาชา/เป้าการันตี/ตัวหาร
// ⚠️ ที่อ่าน identity ของ id ที่สุ่มมาแล้ว (mergeRolls · ชื่อในข่าว) ยังใช้ PETS เต็ม — ไม่ใช่การเลือกว่าจะแจกอะไร
// คลังของ "ตู้ปกติ" (ใช้ตอนสุ่มจากแบนเนอร์ล่าง)
const catalog = computed(() => releasedPets(rawConfig.value?.gachaEvent, nowTick.value))
// ตัวหาร "x/y ชนิด" = ของที่หาได้จริงตอนนี้ (รวมตู้อีเวนต์) ไม่ใช่คลังของตู้ปกติ
const ownable = computed(() => obtainablePets(rawConfig.value?.gachaEvent, nowTick.value))
// นาฬิกาเดินจริงทุกวินาที — ตู้อีเวนต์ต้องโผล่/หายเองตอนหมดเวลาโดยไม่ต้องรีโหลด
// และ `catalog` ต้องอ่านเวลาเดียวกัน ไม่งั้นตู้หายแล้วแต่เพ็ทใหม่ยังไม่ไหลเข้าคลังปกติจนกว่าจะรีเฟรช
const nowTick = ref(Date.now())
let clockTimer = null
onMounted(() => { clockTimer = setInterval(() => { nowTick.value = Date.now() }, 1000) })
onUnmounted(() => clearInterval(clockTimer))
const ev = computed(() => eventState(rawConfig.value?.gachaEvent, nowTick.value))
const evLeft = computed(() => timeLeftText(ev.value.msLeft))
const featuredPets = computed(() => ev.value.featured.map(id => PETS.find(p => p.id === id)).filter(Boolean))
const legendaries = computed(() => catalog.value.filter((p) => p.rarity === 'legendary'))
const targetPet = computed(() => legendaries.value.find((p) => p.id === target.value) || null)
const pay1  = computed(() => resolvePullPayment(1, tickets.value))
const pay10 = computed(() => resolvePullPayment(10, tickets.value))

// ตู้ธีม: เป้าของตัวเองแยกจากตู้ปกติ (gachaThemeTarget) — เป้าของเดือนก่อนที่ยังค้างไว้ = ถือว่าไม่มี
const themeTarget = computed(() => {
  const t = authStore.userData?.gachaThemeTarget || null
  return ev.value.featured.includes(t) ? t : null
})
const themeTargetPet = computed(() => featuredPets.value.find(p => p.id === themeTarget.value) || null)
const pickerMode = ref('normal')          // 'normal' | 'theme' — ตัวเลือกเป้าชุดเดียวกัน แต่รายการคนละชุด
const pickerList = computed(() => (pickerMode.value === 'theme' ? featuredPets.value : legendaries.value))
const pickerOn = computed(() => (pickerMode.value === 'theme' ? themeTarget.value : target.value))
function openPicker(mode) { pickerMode.value = mode; pickerOpen.value = true }

const reveal = ref(null)       // { summary, multi }
const pickerOpen = ref(false)
useEscapeKey(pickerOpen, () => { pickerOpen.value = false })
const infoPet = ref(null)
useEscapeKey(infoPet, () => { infoPet.value = null })      // legendary ที่กดดู flavor ใน picker
const buying = ref(false)

const rarityColor = (r) => RARITY[r]?.color || '#94a3b8'
const ownedLegendaryIds = () => pets.value.filter((p) => p.rarity === 'legendary').map((p) => p.id)

const rateList = ['legendary', 'epic', 'rare', 'common'].map((k) => ({ key: k, pct: GACHA_RATES[k], color: RARITY[k]?.color, label: RARITY[k]?.label }))

async function pull(n, isEvent = false) {
  if (buying.value) return
  // กันเคสกดปุ่มตู้อีเวนต์พอดีวินาทีที่มันหมดเวลา — ถือว่าปิดแล้ว ไม่หมุนให้
  if (isEvent && !ev.value.active) { toast('ตู้พิเศษปิดแล้ว', 'error'); return }

  if (isEvent && !themeTarget.value) {
    const go = await confirm(`ยังไม่ได้เลือกตัวหน้าตู้
ถ้าเลือกไว้: ครั้งที่ ${HALF_PITY} ลุ้นตัวนั้น 50% · ครั้งที่ ${HARD_PITY} ได้ตัวนั้นแน่นอน
ถ้าไม่เลือก: ครั้งที่ ${HALF_PITY} ได้ตำนานแบบสุ่ม

สุ่มต่อโดยไม่เลือกเลยไหม?`)
    if (!go) { openPicker('theme'); return }
    // ⏳ ค้างหน้า confirm ได้นาน (คนคิด) — เช็คซ้ำว่าตู้ยังเปิดอยู่ไหม เผื่อดีลหมดเวลาไปแล้วระหว่างรอ
    if (!ev.value.active) { toast('ตู้พิเศษปิดแล้ว', 'error'); return }
  }

  const { rolls, pay, amount } = resolvePullPayment(n, tickets.value)
  if (pay === 'coin' && coins.value < amount) { toast(`เหรียญไม่พอ! ต้องการ ${amount.toLocaleString()}`, 'error'); return }

  // 🔴 ตู้ธีมห้ามแตะการันตี 50/50 ของตู้ปกติ ⇒ ใช้เป้าของตัวเอง ไม่มีธง · pity แชร์กระเป๋าเดียว (สเปก §6 ข้อ 5 เดิม)
  const state = isEvent
    ? { pity: pity.value, target: themeTarget.value, guaranteed: false, ownedLegendaryIds: ownedLegendaryIds() }
    : { pity: pity.value, target: target.value, guaranteed: guaranteed.value, ownedLegendaryIds: ownedLegendaryIds() }
  // ตู้ธีม = ของที่หาได้ตอนนี้ (ปล่อยแล้ว + รุ่นของเดือน) — ห้ามใช้ PETS เต็ม ไม่งั้นรุ่นที่ยังไม่เปิดหลุด
  const rollCatalog = isEvent ? ownable.value : catalog.value
  const opts = isEvent ? { theme: { featured: ev.value.featured } } : {}
  const { results, nextState } = rollMany(rolls, state, rollCatalog, undefined, opts)
  const { pets: newPets, summary, dust } = mergeRolls(pets.value, results, PETS)
  // ซ้ำเกินเพดาน → ประกายดาว · server ใช้ increment รายช่อง กันทับกับแท็บอื่น
  const dustW = addDust(dustOf(authStore.userData), dust)
  const dustOpt = dustW.changes.length ? { stardust: dustW.next } : {}
  const dustSrv = Object.fromEntries(dustW.changes.map(([k, d]) => ['stardust.' + k, increment(d)]))
  const today = new Date().toISOString().slice(0, 10)
  const dq = bumpDailyQuest(authStore.userData?.dailyQuest, 'gacha', today, 1)

  buying.value = true
  // NOTE: gachaTarget ไม่เขียนที่นี่ — เป็นของ chooseTarget() (กัน stale-target write)
  const base = isEvent
    ? { pets: newPets, dailyQuest: dq, gachaPity: nextState.pity }
    : { pets: newPets, dailyQuest: dq, gachaPity: nextState.pity, gachaGuaranteed: nextState.guaranteed }
  const optimistic = {
    ...base,
    ...dustOpt,
    gachaPullsTotal: (authStore.userData?.gachaPullsTotal || 0) + rolls,   // achievement มือเติมไม่ยั้ง
    ...(pay === 'ticket'
      ? { freeGachaTickets: tickets.value - amount }
      : { coins: coins.value - amount, totalSpent: (authStore.userData?.totalSpent || 0) + amount }),
  }
  const server = {
    ...base,
    ...dustSrv,
    gachaPullsTotal: increment(rolls),
    ...(pay === 'ticket'
      ? { freeGachaTickets: increment(-amount) }
      : { coins: increment(-amount), totalSpent: increment(amount) }),
  }
  const ok = await authStore.patchUser(optimistic, server)
  buying.value = false
  if (ok) {
    reveal.value = { summary, multi: rolls > 1 }
    // achievement ลับของตู้ — สุ่ม 10 (ได้ 11) เท่านั้น
    if (rolls >= 10) {
      const legN = results.filter((r) => r.rarity === 'legendary').length
      if (legN >= 2) grantSecret('gag_leg2')
      if (legN >= 3) grantSecret('gag_leg3')
      // สุ่ม 10 การันตี epic อยู่แล้ว ⇒ "ไม่ได้อะไรเกินธรรมดาเลย" เป็นไปไม่ได้ · ธรรมดา ≥8 จาก 11 ≈ 4.7% (~1 ใน 21 รอบ) · ≥9 ≈ 1%
      if (results.filter((r) => r.rarity === 'common').length >= 8) grantSecret('gag_badday')
    }
    // ตำนานทุกตัวในรอบนี้ลงแถว roster ของตัวเอง (1 ต.ค. 2026 ย้ายจากเลน news ที่โหลดแค่ 5 doc
    //   เปิดรัวคืนเดียวดันข่าวคนอื่นตกหมด) · roster โหลดทุกเซสชันอยู่แล้ว ⇒ อ่านเพิ่ม 0
    const legIds = results.filter((r) => r.rarity === 'legendary').map((r) => r.id)
    if (legIds.length) syncRosterRow({ legendary: legIds })
  }
  else toast('สุ่มไม่สำเร็จ', 'error')
}

async function chooseTarget(id) {
  const theme = pickerMode.value === 'theme'
  const cur = theme ? themeTarget.value : target.value
  const next = cur === id ? null : id
  const field = theme ? 'gachaThemeTarget' : 'gachaTarget'
  await authStore.patchUser({ [field]: next }, { [field]: next })
  pickerOpen.value = false
}
</script>

<style scoped>
.shop-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.shop-coins { font-size: .92rem; font-weight: 800; color: #b45309; background: #fff; border: var(--bw) solid var(--line); border-radius: 999px; padding: 3px 12px; margin-left: auto; }
.stores { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 8px 0 14px; }
.store-dot { top: 6px; right: 6px; width: 12px; height: 12px; }
.store { position: relative; font: inherit; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 10px 4px; border-radius: 16px; border: var(--bw) solid var(--line); background: #fff; box-shadow: var(--pop); cursor: pointer; color: var(--ink); transition: transform .12s; }
.store-emoji { font-size: 1.6rem; line-height: 1.1; }
.store-name { font-size: .82rem; font-weight: 800; }
.store-sub { font-size: .7rem; color: var(--muted); text-align: center; line-height: 1.2; }
.store.on { transform: translateY(-2px); }
.store.st-pet.on { background: linear-gradient(160deg, #e6dcfd, #fff); border-color: #b9a6ef; }
.store.st-farm.on { background: linear-gradient(160deg, #d6f5e3, #fff); border-color: #7fd9b8; }
.store.st-style.on { background: linear-gradient(160deg, #fde2ee, #fff); border-color: #f4a6c8; }
.style-note { font-size: .76rem; line-height: 1.55; color: var(--muted); background: #fff; border: var(--bw) solid var(--line); border-radius: 16px; padding: 10px 12px; margin-bottom: 12px; }
.style-note > b { color: var(--ink); }
.style-where { display: block; margin-top: 4px; }
.shop-storage { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 6px; font-size: .72rem; color: var(--muted); margin-bottom: 12px; }
.shop-ticket { font-weight: 800; color: #b45309; background: #fff8ec; border-radius: 999px; padding: 1px 10px; }
.shop-note { font-size: .72rem; color: var(--muted); text-align: center; margin: 14px 0 18px; }
.shop-login { text-align: center; color: rgba(0,0,0,.4); padding: 30px 0; }
.shop-maint { text-align: center; padding: 48px 20px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.shop-maint-emoji { font-size: 3rem; }
.shop-maint-title { font-size: 1.2rem; font-weight: 800; color: var(--ink); }
.shop-maint-msg { font-size: .82rem; color: rgba(0,0,0,.55); max-width: 280px; line-height: 1.6; }

.ov { position: fixed; inset: 0; z-index: 400; background: rgba(0,0,0,.55); display: flex; align-items: center; justify-content: center; padding: 20px; overscroll-behavior: contain; }
.picker { background: #fff; border: var(--bw) solid var(--line); border-radius: 18px; box-shadow: var(--pop-lg); padding: 18px; width: 100%; max-width: 360px; max-height: 80vh; overflow-y: auto; }
.picker-head { font-weight: 800; margin-bottom: 12px; text-align: center; }
.picker-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 8px; }
.picker-cell { position: relative; display: flex; flex-direction: column; align-items: center; gap: 2px; border: var(--bw) solid var(--line); border-radius: 11px; padding: 8px 4px; background: #fff; cursor: pointer; font-family: inherit; }
.picker-cell.on { background: var(--gold); }
.picker-skill { font-size: .7rem; font-weight: 600; color: var(--muted); text-align: center; line-height: 1.25; }
.picker-info { position: absolute; top: 2px; right: 2px; border: none; background: transparent; padding: 2px; font-size: .7rem; line-height: 1; cursor: pointer; opacity: 1; font-size: .85rem; }
.picker-info:active { opacity: 1; }
.picker-hint { font-size: .7rem; color: rgba(0,0,0,.45); text-align: center; margin-bottom: 8px; }
.picker-emoji { font-size: 1.6rem; }
.picker-name { font-size: .7rem; font-weight: 700; }
.picker-have { font-size: .7rem; color: #059669; font-weight: 800; }
.picker-clear { width: 100%; margin-top: 12px; border: var(--bw) solid var(--line); border-radius: 11px; padding: 9px; font-family: inherit; font-weight: 800; background: #fff; cursor: pointer; }
.info-box { position: relative; background: #fff; border: var(--bw) solid var(--line); border-radius: 20px; box-shadow: var(--pop-lg); padding: 24px 20px 20px; text-align: center; max-width: 320px; width: 100%; }
.info-x { position: absolute; right: 12px; top: 12px; border: none; background: rgba(0,0,0,.08); border-radius: 8px; width: 40px; height: 40px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.info-emoji { font-size: 3.4rem; }
.info-name { font-family: var(--font-display); font-weight: 400; font-size: 1.4rem; margin-top: 2px; }
.info-rarity { display: inline-block; color: #fff; font-size: .7rem; font-weight: 800; padding: 2px 10px; border-radius: 999px; margin-top: 6px; }
/* flavor ของเพ็ทถูกซ่อนไว้ (user สั่ง 3 ก.ย.) — data ยังอยู่ครบใน data/index.js
   คืนได้ด้วยการเอาบรรทัด .info-flavor ในเทมเพลตกลับมา + สไตล์ด้านล่าง
.info-flavor { font-size: .8rem; color: rgba(0,0,0,.65); line-height: 1.6; margin: 12px 4px; font-style: italic; } */
.info-passive { margin-top: 12px; font-size: .7rem; color: rgba(0,0,0,.45); background: rgba(0,0,0,.04); border-radius: 9px; padding: 7px; }
.info-target { width: 100%; margin-top: 14px; border: var(--bw) solid var(--line); border-radius: 11px; padding: 10px; font-family: inherit; font-weight: 800; color: #fff; background: var(--primary); box-shadow: var(--pop); cursor: pointer; }
.shop-tabs { display: flex; gap: 8px; margin-bottom: 12px; }
.shop-tab { flex: 1; border: var(--bw) solid var(--line); border-radius: 11px; padding: 9px; font-family: inherit; font-weight: 800; font-size: .82rem; background: #fff; color: var(--ink); cursor: pointer; }
.shop-tab.on { background: var(--gold); }
</style>
