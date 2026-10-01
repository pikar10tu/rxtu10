<!-- ตู้แลกประกายดาว (แทนโรงหลอมเดิม 1 ต.ค. 2026 — user เคาะจากเดโม https://claude.ai/artifact/UFPSy7HsjmWuLtmX8d2jtb)
     หน้าตาแบบชั้นวางของร้านอีเวนต์ (ref ที่ user ส่ง): แถบสกุลเงินบน · การ์ดของ + แถบราคาล่าง · ราคาแดงเมื่อไม่พอ
     ตัวซ้ำใช้อัพเกรดอย่างเดียว · ตู้นี้ใช้ประกายดาวอย่างเดียว (utils/stardust.js) · ทุกการแลกต้องยืนยันก่อน -->
<template>
  <div class="dx">
    <div class="dx-cur" role="group" aria-label="ประกายดาวที่มี">
      <span v-for="k in DUST_KEYS" :key="k" :title="dustName(k)"><DustIcon :k="k" size="1.5em" /><b>{{ dust[k].toLocaleString() }}</b></span>
    </div>

    <!-- ตัวซ้ำเก่าที่เกินเพดาน: แปลงครั้งเดียว · ไม่มีของเกิน = ไม่เห็นการ์ดนี้ -->
    <div v-if="mig.rows.length" class="dx-mig">
      <span class="nav-dot dx-dot" aria-hidden="true"></span>
      <div class="dx-mig-h"><Emoji char="✨" /> ประกายดาวมาแล้ว!</div>
      <p>ตัวซ้ำที่เกินจำนวนที่ต้องใช้อัพจนเต็ม (เกรด V) แปลงเป็นประกายดาวได้ แล้วเอาไปแลกของในตู้นี้</p>
      <div class="dx-mig-list">
        <div v-for="r in mig.rows" :key="r.id">
          <Emoji :char="r.emoji" /> <span class="dx-mig-n">{{ r.name }}</span>
          <small>ซ้ำ {{ r.copies }} · เก็บไว้อัพ {{ r.keep }}</small>
          <b><DustIcon :k="r.rarity" /> +{{ r.excess }}</b>
        </div>
      </div>
      <button class="dx-go" :disabled="busy" @click="migrate">แปลงเป็นประกายดาว</button>
    </div>

    <section v-if="ev.active && trio.length" class="dx-shelf">
      <div class="dx-sh"><span><Emoji char="🌟" /> ตู้เดือนนี้</span><span class="dx-tm">⏱ เหลือ {{ evLeft }}</span></div>
      <div class="dx-grid">
        <button class="dx-tile wide" :disabled="busy" @click="buy(OF.month)">
          <span class="dx-trio"><Emoji v-for="p in trio" :key="p.id" :char="p.emoji" /></span>
          <span class="dx-tt">สุ่ม 1 ใน 3</span>
          <span class="dx-ts">{{ trio.map(p => p.name).join(' · ') }}</span>
          <Price :cost="OF.month.cost" />
        </button>
      </div>
    </section>

    <section v-for="sec in SECS" :key="sec.k" class="dx-shelf">
      <div class="dx-sh"><span><Emoji :char="sec.icon" /> {{ sec.label }}</span></div>
      <div class="dx-grid">
        <button v-for="o in OFFERS.filter(x => x.sec === sec.k)" :key="o.id" class="dx-tile" :disabled="busy" @click="buy(o)">
          <span class="dx-ti"><Emoji :char="ICON[o.id]" /></span>
          <span class="dx-tt">{{ o.title }}</span>
          <Price :cost="o.cost" />
        </button>
      </div>
    </section>

    <section class="dx-shelf">
      <div class="dx-sh"><span><Emoji char="🪙" /> แลกเป็นเหรียญ</span></div>
      <div class="dx-grid four">
        <button v-for="k in DUST_KEYS" :key="k" class="dx-tile" :disabled="busy" @click="openSell(k)">
          <span class="dx-ti"><DustIcon :k="k" size="2.2rem" /></span>
          <span class="dx-tt">{{ DUST[k].label }}</span>
          <span class="dx-pr"><Emoji char="🪙" /> {{ DUST_COIN[k].toLocaleString() }}</span>
        </button>
      </div>
    </section>

    <!-- เลือกตำนาน -->
    <BottomSheet :open="pickOpen" icon="🎯" title="เลือกตำนาน 1 ตัว" @update:open="pickOpen = $event">
      <div class="dx-pick">
        <button v-for="p in legendPool" :key="p.id" class="dx-pk" :class="{ on: pickId === p.id }" @click="pickId = p.id">
          <Emoji :char="p.emoji" /><span>{{ p.name }}</span><small v-if="ownedIds.has(p.id)">มีแล้ว</small>
        </button>
      </div>
      <button class="dx-go" :disabled="!pickId || busy" @click="confirmPick">
        <template v-if="pickId">แลก {{ petName(pickId) }} · <DustIcon k="legendary" /> {{ OF.pick.cost[1] }}</template>
        <template v-else>แตะเลือก 1 ตัว</template>
      </button>
    </BottomSheet>

    <!-- แลกเหรียญ: เลื่อนเลือกจำนวน -->
    <BottomSheet :open="!!sellK" icon="🪙" :title="sellK ? 'แลก' + dustName(sellK) + 'เป็นเหรียญ' : ''" @update:open="(v) => { if (!v) sellK = null }">
      <div v-if="sellK" class="dx-sell">
        <div class="dx-sell-n"><DustIcon :k="sellK" /> {{ sellN }} → <Emoji char="🪙" /> <b>{{ (sellN * DUST_COIN[sellK]).toLocaleString() }}</b></div>
        <input v-model.number="sellN" type="range" min="1" :max="dust[sellK]" step="1" aria-label="จำนวน" :style="{ accentColor: DUST[sellK].color }">
        <small>เม็ดละ {{ DUST_COIN[sellK].toLocaleString() }} เหรียญ · มี {{ dust[sellK] }}</small>
        <button class="dx-go" :disabled="busy" @click="sell">แลก</button>
      </div>
    </BottomSheet>

    <CapsuleReveal v-if="reveal" :summary="[reveal]" label="แลกสำเร็จ!" @close="reveal = null" />
  </div>
</template>

<script setup>
import { ref, computed, h, onMounted, onUnmounted } from 'vue'
import { increment } from 'firebase/firestore'
import Emoji from '../shared/Emoji.vue'
import BottomSheet from '../shared/BottomSheet.vue'
import CapsuleReveal from './CapsuleReveal.vue'
import DustIcon from './DustIcon.vue'
import { useAuthStore } from '../../stores/auth.js'
import { useToast } from '../../composables/useToast.js'
import { useConfirm } from '../../composables/useConfirm.js'
import { useAppConfig } from '../../composables/useAppConfig.js'
import { PETS } from '../../data/index.js'
import { releasedPets, obtainablePets } from '../../utils/petCatalog.js'
import { eventState, timeLeftText } from '../../utils/gachaEvent.js'
import { rarityPool } from '../../utils/gacha.js'
import { mergeRolls } from '../../utils/gachaMerge.js'
import { ANTI_LOSS } from '../../utils/antiLoss.js'
import { DUST, DUST_KEYS, DUST_COIN, OFFERS, dustName, dustOf, addDust, canAfford, migrationPreview, applyMigration, pickRandom } from '../../utils/stardust.js'

const auth = useAuthStore()
const { toast } = useToast()
const { confirm } = useConfirm()
const { rawConfig } = useAppConfig()

const OF = Object.fromEntries(OFFERS.map(o => [o.id, o]))
const SECS = [
  { k: 'legend', icon: '👑', label: 'ตำนาน' },
  { k: 'up', icon: '⬆️', label: 'แลกขึ้นระดับ' },
  { k: 'item', icon: '🎒', label: 'ไอเท็ม' },
]
const ICON = { pick: '🎯', legend: '🎲', 'up-rare': '🔷', 'up-epic': '🔮', 'up-leg': '👑', antiloss: ANTI_LOSS.emoji }

// แถบราคาใต้การ์ด — แดงเมื่อไม่พอ
const Price = (p) => h('span', { class: ['dx-pr', { no: !canAfford(dust.value, p.cost) }] }, [h(DustIcon, { k: p.cost[0] }), ' ' + p.cost[1]])
Price.props = ['cost']

const pets = computed(() => auth.userData?.pets || [])
const dust = computed(() => dustOf(auth.userData))
const mig = computed(() => migrationPreview(pets.value))
const ownedIds = computed(() => new Set(pets.value.map(p => p.id)))
const petName = (id) => PETS.find(p => p.id === id)?.name || id

const now = ref(Date.now())
let clock = null
onMounted(() => { clock = setInterval(() => { now.value = Date.now() }, 30000) })
onUnmounted(() => clearInterval(clock))
const ev = computed(() => eventState(rawConfig.value?.gachaEvent, now.value))
const evLeft = computed(() => timeLeftText(ev.value.msLeft))
const trio = computed(() => ev.value.featured.map(id => PETS.find(p => p.id === id)).filter(Boolean))
const legendPool = computed(() => obtainablePets(rawConfig.value?.gachaEvent, now.value).filter(p => p.rarity === 'legendary'))

const busy = ref(false)
const reveal = ref(null)
const pickOpen = ref(false)
const pickId = ref(null)
const sellK = ref(null)
const sellN = ref(1)

/** เขียนผลแลก: pets (ถ้ามี) + ผลต่างประกายดาว + ฟิลด์อื่น · server ใช้ increment รายช่อง */
async function commit({ pets: nextPets, dustDelta, extraOpt = {}, extraSrv = {} }) {
  const { next, changes } = addDust(dust.value, dustDelta)
  const opt = { ...extraOpt, ...(changes.length ? { stardust: next } : {}), ...(nextPets ? { pets: nextPets } : {}) }
  const srv = { ...extraSrv, ...Object.fromEntries(changes.map(([k, d]) => ['stardust.' + k, increment(d)])), ...(nextPets ? { pets: nextPets } : {}) }
  return auth.patchUser(opt, srv)
}

async function migrate() {
  const { rows, gain } = mig.value
  const lines = DUST_KEYS.filter(k => gain[k]).map(k => `${dustName(k)} +${gain[k]}`).join('\n')
  if (!await confirm(`แปลงตัวซ้ำที่เกิน ${rows.length} ตัวเป็นประกายดาว?\n${lines}\n(ตัวซ้ำที่ยังต้องใช้อัพ เก็บไว้ให้ครบ)`)) return
  busy.value = true
  const { pets: nextPets, gain: g } = applyMigration(pets.value)
  const ok = await commit({ pets: nextPets, dustDelta: g })
  busy.value = false
  toast(ok ? 'ได้ประกายดาวแล้ว!' : 'แปลงไม่สำเร็จ ลองใหม่อีกครั้ง', ok ? 'success' : 'error')
}

function short(cost) { return `${dustName(cost[0])}ไม่พอ (มี ${dust.value[cost[0]]}/${cost[1]})` }

async function buy(o) {
  if (busy.value) return
  if (!canAfford(dust.value, o.cost)) { toast(short(o.cost), 'info'); return }
  if (o.kind === 'pickPet') { pickId.value = null; pickOpen.value = true; return }
  const [k, n] = o.cost
  const what = o.kind === 'monthPet' ? `สุ่มตำนาน 1 ใน 3 ของตู้เดือนนี้\n(${trio.value.map(p => p.name).join(' · ')})`
    : o.kind === 'antiLoss' ? `${ANTI_LOSS.name} ×1` : o.title
  if (!await confirm(`${what}\nใช้${dustName(k)} ${n} (เหลือ ${dust.value[k] - n})`)) return
  if (o.kind === 'antiLoss') {
    busy.value = true
    const ok = await commit({ dustDelta: { [k]: -n }, extraOpt: { antiLoss: (auth.userData?.antiLoss || 0) + 1 }, extraSrv: { antiLoss: increment(1) } })
    busy.value = false
    toast(ok ? `ได้${ANTI_LOSS.name} 1 ชิ้น` : 'แลกไม่สำเร็จ', ok ? 'success' : 'error')
    return
  }
  const pool = o.kind === 'monthPet' ? trio.value.map(p => p.id) : rarityPool(releasedPets(rawConfig.value?.gachaEvent, now.value), o.rarity)
  await grantPet(pickRandom(pool), o.cost)
}

async function confirmPick() {
  const id = pickId.value, [k, n] = OF.pick.cost
  if (!id || !await confirm(`แลก ${petName(id)}\nใช้${dustName(k)} ${n} (เหลือ ${dust.value[k] - n})`)) return
  pickOpen.value = false
  await grantPet(id, OF.pick.cost)
}

async function grantPet(id, [k, n]) {
  if (!id) { toast('แลกไม่สำเร็จ', 'error'); return }
  if (!canAfford(dust.value, [k, n])) { toast(short([k, n]), 'info'); return }
  busy.value = true
  // ได้ตัวที่มีอยู่แล้วและเต็มเพดาน = กลายเป็นประกายดาวเหมือนกาชา (mergeRolls จัดการให้)
  const { pets: nextPets, summary, dust: got } = mergeRolls(pets.value, [{ id }], PETS)
  const delta = { ...got }; delta[k] = (delta[k] || 0) - n
  const ok = await commit({ pets: nextPets, dustDelta: delta,
    extraOpt: { labFuseTotal: (auth.userData?.labFuseTotal || 0) + 1 }, extraSrv: { labFuseTotal: increment(1) } })   // achievement นักเล่นแร่แปรธาตุ
  busy.value = false
  if (ok) reveal.value = summary[0]
  else toast('แลกไม่สำเร็จ', 'error')
}

function openSell(k) {
  if (!dust.value[k]) { toast(`ยังไม่มี${dustName(k)}`, 'info'); return }
  sellN.value = dust.value[k]
  sellK.value = k
}
async function sell() {
  const k = sellK.value
  const n = Math.min(Math.max(1, Math.floor(sellN.value || 1)), dust.value[k])
  const gain = n * DUST_COIN[k]
  if (!await confirm(`แลก${dustName(k)} ${n} เม็ด\nได้ ${gain.toLocaleString()} เหรียญ`)) return
  sellK.value = null
  busy.value = true
  const ok = await commit({ dustDelta: { [k]: -n }, extraOpt: { coins: (auth.userData?.coins || 0) + gain }, extraSrv: { coins: increment(gain) } })
  busy.value = false
  toast(ok ? `+${gain.toLocaleString()} เหรียญ` : 'แลกไม่สำเร็จ', ok ? 'success' : 'error')
}
</script>

<style scoped>
.dx { display: flex; flex-direction: column; gap: 12px; }
.dx-cur { position: sticky; top: 0; z-index: 3; display: flex; justify-content: space-around; align-items: center; background: #2b1f4f; color: #fff; border-radius: 16px; padding: 6px 4px; box-shadow: var(--pop); font-variant-numeric: tabular-nums; }
.dx-cur span { display: flex; align-items: center; gap: 2px; font-size: .9rem; }
.dx-mig { position: relative; display: flex; flex-direction: column; gap: 8px; padding: 14px; border-radius: 18px; background: linear-gradient(160deg, #fff4d6, #fff); border: 2px solid #f5b72e; box-shadow: var(--pop); }
.dx-dot { position: absolute; top: -4px; right: -4px; }
.dx-mig-h { font-weight: 800; font-size: 1rem; }
.dx-mig p { margin: 0; font-size: .78rem; line-height: 1.5; color: var(--ink); }
.dx-mig-list { display: flex; flex-direction: column; gap: 4px; }
.dx-mig-list > div { display: flex; align-items: center; gap: 6px; background: #fff; border-radius: 10px; padding: 5px 9px; font-size: .8rem; }
.dx-mig-n { font-weight: 700; }
.dx-mig-list small { flex: 1; color: var(--muted); font-size: .7rem; }
.dx-mig-list b { white-space: nowrap; }
.dx-go { border: 0; border-radius: 14px; padding: 11px; font-family: inherit; font-weight: 800; font-size: .9rem; color: #fff; background: linear-gradient(135deg, #6d4fd0, #a36bd8); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; width: 100%; }
.dx-go:disabled { opacity: .5; cursor: default; }
.dx-shelf { display: flex; flex-direction: column; gap: 10px; padding: 12px; border-radius: 18px; background: #fff; border: var(--bw) solid var(--line); box-shadow: var(--pop); }
.dx-sh { display: flex; justify-content: space-between; align-items: center; font-weight: 800; font-size: .92rem; }
.dx-tm { font-size: .72rem; font-weight: 700; color: #b45309; background: #fff4dd; border-radius: 8px; padding: 2px 8px; }
.dx-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.dx-grid.four { grid-template-columns: repeat(4, 1fr); }
.dx-tile { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 10px 4px 0; overflow: hidden; border-radius: 14px; border: var(--bw) solid var(--line); background: linear-gradient(180deg, #faf8ff, #fff); font-family: inherit; color: var(--ink); cursor: pointer; }
.dx-tile.wide { grid-column: 1 / -1; }
.dx-tile:disabled { cursor: default; }
.dx-ti { font-size: 2rem; line-height: 1.2; min-height: 2.6rem; display: flex; align-items: center; }
.dx-trio { display: flex; gap: 10px; font-size: 2.2rem; }
.dx-tt { font-size: .76rem; font-weight: 800; text-align: center; line-height: 1.25; }
.dx-ts { font-size: .7rem; color: var(--muted); }
.dx-tile :deep(.dx-pr), .dx-pr { align-self: stretch; margin-top: 6px; display: flex; align-items: center; justify-content: center; gap: 3px; padding: 5px 0; background: #2b1f4f; color: #fff; font-weight: 800; font-size: .85rem; font-variant-numeric: tabular-nums; }
.dx-tile :deep(.dx-pr.no) { color: #ff8f8f; }
.dx-pick { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding-bottom: 12px; }
.dx-pk { display: flex; flex-direction: column; align-items: center; gap: 1px; padding: 8px 2px; border-radius: 12px; border: 1.5px solid #f2d39a; background: #fffaf0; font-family: inherit; font-size: 1.7rem; cursor: pointer; color: var(--ink); }
.dx-pk span { font-size: .7rem; font-weight: 700; }
.dx-pk small { font-size: .7rem; color: var(--muted); }
.dx-pk.on { border-color: #f5b72e; background: #ffe9bf; box-shadow: 0 0 0 2px #f5b72e; }
.dx-sell { display: flex; flex-direction: column; gap: 10px; padding-bottom: 12px; }
.dx-sell-n { text-align: center; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; gap: 4px; }
.dx-sell input { width: 100%; height: 28px; }
.dx-sell small { text-align: center; color: var(--muted); font-size: .72rem; }
</style>
