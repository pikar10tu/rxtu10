<!-- TeamPicker — จัดทีม (= activePets, 3 ช่องคงที่ = BATTLE_SLOTS) ใช้ร่วมหอคอย+สนามประลอง+หน้าเพ็ท
     โมเดล "ช่องคือเคอร์เซอร์" (ref: Epic Seven / Summoners War / Honkai Star Rail / FEH):
       · แตะช่อง = ย้ายเคอร์เซอร์ไปช่องนั้น (แค่นั้น ไม่เด้งโมดัล)
       · แตะการ์ดในคลัง = ลงช่องที่เคอร์เซอร์อยู่ — ทีมเต็มก็ยังกดได้ = สลับตัวทันที
       · ปุ่ม ⋯ มุมช่อง = เปิดหน้าข้อมูลเพ็ท (ดู/วิวัฒน์/ถอด)
     เดิมแตะช่อง = เปิดโมดัล แต่แตะคลัง = สลับเข้า/ออก ทั้งที่หน้าตาเป็นปุ่มเหมือนกัน → ผู้เล่นงง
     และทีมเต็มแล้วคลังจะจางกดไม่ได้ทั้งแถบ โดยไม่บอกว่าต้องไปถอดตัวเก่าก่อน
     ตรรกะช่องอยู่ที่ utils/teamSlots.js (pure + มีเทส) — ที่นี่เหลือแค่ผูกสาย -->
<template>
  <BottomSheet :open="open" icon="⚔️" title="จัดทีมต่อสู้" @update:open="$emit('update:open', $event)">
    <!-- วิธีเลือกแบบเดียวกับตู้โชว์ (utils/slotEdit.js): แตะช่อง = เลือก · แตะอีกช่อง = สลับ · ✕ = เอาออก
         ใส่เสร็จ = เลิกเลือก (ไม่กระโดดเอง) · เต็มแล้วต้องเลือกช่องก่อน ถึงจะแทน (ไม่แทนเงียบๆ) -->
    <div class="tp-slots" :style="{ gridTemplateColumns: `repeat(${battleSlots}, minmax(0, 96px))` }">
      <div v-for="(id, i) in edit.slots" :key="i" class="tp-slotwrap">
        <button
          type="button" class="tp-slot" :class="{ filled: id, sel: edit.sel === i }"
          :style="id ? { '--rc': rarityColor(id) } : null"
          :aria-pressed="edit.sel === i"
          :aria-label="id ? `ช่อง ${i + 1} ${defOf(id).name}` : `ช่อง ${i + 1} ว่าง`"
          @click="onSlot(i)"
        >
          <span class="tp-slotno">{{ i + 1 }}</span>
          <template v-if="id">
            <PetThumb :pet="slotPetOf(id)" />
            <span class="tp-slotname">{{ defOf(id).name }}</span>
          </template>
          <span v-else class="tp-empty">＋</span>
        </button>
        <button v-if="id" type="button" class="tp-x" :aria-label="`เอา ${defOf(id).name} ออกจากทีม`" @click.stop="onRemove(i)">✕</button>
        <button v-if="id" type="button" class="tp-more" :aria-label="`ดูข้อมูล ${defOf(id).name}`" @click.stop="detailId = id">ⓘ</button>
      </div>
    </div>

    <div class="tp-status" :class="{ warn: statusWarn }">{{ status }}</div>
    <div class="tp-status sub">ช่อง 1 ออกตีก่อน · แตะช่องหนึ่งแล้วแตะอีกช่อง = สลับลำดับ</div>

    <div class="tp-pool">
      <button
        v-for="p in sortedOwned" :key="p.id"
        class="tp-pet" :class="{ active: slotNoOf(p.id) > 0, away: expeditionIds.has(p.id) }"
        :style="{ '--rc': rarityColor(p.id) }"
        :aria-label="defOf(p.id).name"
        @click="pick(p.id)"
      >
        <span v-if="expeditionIds.has(p.id)" class="tp-away"><Emoji char="🗺️" /></span>
        <span v-else-if="slotNoOf(p.id) > 0" class="tp-inteam">ช่อง {{ slotNoOf(p.id) }}</span>
        <span class="tp-el"><Emoji :char="elEmoji(p.id)" /></span>
        <span class="tp-emoji"><Emoji :char="defOf(p.id).emoji" /></span>
        <span class="tp-name">{{ defOf(p.id).name }}</span>
        <PetStatLine :pet="p" />
      </button>
      <div v-if="!owned.length" class="tp-none">
        ยังไม่มีเพ็ท — ไปอัญเชิญตัวแรกก่อนนะ
        <RouterLink to="/shop" class="tp-none-cta">ไปอัญเชิญเลย →</RouterLink>
      </div>
    </div>

    <PetDetailModal :pet-id="detailId" @close="detailId = null" />
  </BottomSheet>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import BottomSheet from '../shared/BottomSheet.vue'
import PetDetailModal from '../pets/PetDetailModal.vue'
import PetStatLine from '../shared/PetStatLine.vue'
import PetThumb from '../shared/PetThumb.vue'
import { useRosterSync } from '../../composables/useRosterSync.js'
import { useToast } from '../../composables/useToast.js'
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { getPetDef, RARITY, ELEMENTS } from '../../data/index.js'
import { BATTLE_SLOTS } from '../../data/residence.js'
import { toSlots } from '../../utils/teamSlots.js'
import { tapSlot, tapItem, removeAt, compact } from '../../utils/slotEdit.js'

const props = defineProps({ open: { type: Boolean, default: false } })
defineEmits(['update:open'])


const auth = useAuthStore()
const { syncRosterRow } = useRosterSync()
const { toast } = useToast()
const detailId = ref(null)
const owned = computed(() => auth.userData?.pets || [])
// เพ็ทที่กำลังออกผจญภัย — เอาเข้าทีมไม่ได้จนกว่าจะกลับ (แต่ยังกดได้ เพื่อเด้งเหตุผลบอก)
// ส่งผจญภัยพับเก็บ 25 ก.ย. 2026 (user เห็นด้วย: ไม่มีคนใช้ ซ้อนกับรายได้รายวัน · ไอเดียไปต่อใน world boss #11) — โค้ด/route/ข้อมูลเก็บไว้ ไม่ลบ
// ⇒ ไม่ล็อกเพ็ทที่ค้างสถานะ 'กำลังผจญภัย' อีก (จัดลงทีมได้เลย)
const expeditionIds = computed(() => new Set())
const battleSlots = computed(() => BATTLE_SLOTS)
const ownedIds = computed(() => new Set(owned.value.map(p => p.id)))
// active เฉพาะตัวที่ยังครอบครอง ตัดให้ยาวไม่เกิน battleSlots
const activeIds = computed(() =>
  (auth.userData?.activePets || []).filter(id => id && ownedIds.value.has(id)).slice(0, battleSlots.value))
const slots = computed(() => toSlots(activeIds.value, battleSlots.value))
/** ตัวนี้อยู่ช่องที่เท่าไหร่ (1-based) · 0 = ไม่ได้อยู่ในทีม */
const slotNoOf = (id) => edit.value.slots.indexOf(id) + 1

// สถานะแก้ไขในแผ่นนี้ — ช่องว่างค้างไว้ระหว่างแก้ (ตัวอื่นไม่เลื่อน) · บันทึกแบบตัดช่องว่าง (เอนจินต้องการทีมติดกัน)
const edit = ref({ slots: [], sel: null })
watch(() => props.open, (o) => { if (o) edit.value = { slots: slots.value.slice(), sel: null } }, { immediate: true })
// ทีมเปลี่ยนจากที่อื่น (เช่นกด ถอด ในหน้าข้อมูลเพ็ท ⓘ) → ตามให้ทัน · ของที่เราแก้เองตรงกันอยู่แล้ว ไม่รีเซ็ตช่องว่าง
watch(activeIds, (ids) => {
  if (ids.join() !== compact(edit.value.slots).join()) edit.value = { slots: toSlots(ids, battleSlots.value), sel: null }
})

const selId = computed(() => (edit.value.sel == null ? null : edit.value.slots[edit.value.sel]))
const hasEmpty = computed(() => edit.value.slots.some(x => !x))
const statusWarn = ref(false)
const status = computed(() => {
  const i = edit.value.sel
  if (i != null && selId.value) return `เลือกช่อง ${i + 1} (${defOf(selId.value).name}) · แตะตัวข้างล่างเพื่อใส่แทน หรือแตะช่องอื่นเพื่อสลับ`
  if (i != null) return `เลือกช่อง ${i + 1} (ว่าง) · แตะตัวข้างล่างเพื่อใส่`
  if (hasEmpty.value) return 'แตะตัวข้างล่างเพื่อใส่ช่องว่าง · แตะช่องเพื่อเลือก'
  return 'ทีมเต็มแล้ว · แตะช่องที่อยากเปลี่ยนก่อน แล้วค่อยแตะตัวใหม่'
})

const defOf = (id) => getPetDef(id) || { emoji: '❓', name: '?', rarity: 'common', element: 'scissors' }
const slotPetOf = (id) => owned.value.find(p => p.id === id) || { id }
const rarityColor = (id) => RARITY[defOf(id).rarity]?.color || '#94a3b8'
const elEmoji = (id) => ELEMENTS[defOf(id).element]?.emoji || '✊'

// เรียง legendary→common → เกรดสูงก่อน → ชื่อ (เหมือนหน้าเพ็ท)
const RANK = { legendary: 0, epic: 1, rare: 2, common: 3 }
const sortedOwned = computed(() => owned.value.slice().sort((a, b) => {
  const da = defOf(a.id), db = defOf(b.id)
  return (RANK[da.rarity] - RANK[db.rarity]) || ((b.grade || 0) - (a.grade || 0)) || (da.name || '').localeCompare(db.name || '')
}))

async function save(next) {
  await auth.patchUser({ activePets: next }, { activePets: next })
  syncRosterRow()   // ทีมเปลี่ยน → คู่ต่อสู้ใน Arena ต้องเห็นทีมใหม่
}

function apply(res) {
  const before = compact(edit.value.slots).join()
  edit.value = { slots: res.slots, sel: res.sel }
  if (compact(res.slots).join() !== before) save(compact(res.slots))
}
function onSlot(i) { statusWarn.value = false; apply(tapSlot(edit.value, i)) }
function onRemove(i) { statusWarn.value = false; apply(removeAt(edit.value, i)) }
function pick(id) {
  if (expeditionIds.value.has(id)) {
    toast(`${defOf(id).name} กำลังออกผจญภัย — รอกลับมาก่อนถึงจะจัดลงทีมได้`, 'info')
    return
  }
  const res = tapItem(edit.value, id)
  statusWarn.value = res.event === 'full'   // ทีมเต็ม + ยังไม่เลือกช่อง → ข้อความสถานะเป็นสีเตือน
  if (res.event !== 'full') apply(res)
}
</script>

<style scoped>
.tp-slots { display: grid; gap: 10px; margin: 4px 0; justify-content: center; }
.tp-slotwrap { position: relative; }
.tp-slot { position: relative; width: 100%; aspect-ratio: .82; padding: 14px 4px 6px; font-family: inherit; border-radius: 16px; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  border: 2px dashed #b9d7ea; background: rgba(255,255,255,.7); transition: transform .12s, box-shadow .15s; }
.tp-slot.filled { border: 2px solid var(--rc); background: linear-gradient(170deg, color-mix(in srgb, var(--rc) 16%, #fff), #fff 70%); box-shadow: var(--pop); }
.tp-slot.sel { box-shadow: 0 0 0 3px var(--accent), var(--pop); transform: translateY(-3px); }
.tp-slot.sel::after { content: 'เลือกอยู่'; position: absolute; bottom: -9px; left: 50%; transform: translateX(-50%); font-size: .7rem; font-weight: 800; color: #fff; background: var(--accent); border-radius: 999px; padding: 0 7px; white-space: nowrap; }
.tp-slotno { position: absolute; top: 5px; left: 7px; font-size: .7rem; font-weight: 800; color: var(--muted); }
.tp-slotname { font-size: .7rem; font-weight: 700; color: var(--ink); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tp-empty { color: #8ec6e8; font-size: 1.5rem; }
.tp-x, .tp-more { position: absolute; width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid #fff; font-family: inherit; font-size: .7rem; font-weight: 800; cursor: pointer; display: grid; place-items: center; box-shadow: 0 1px 4px rgba(43,53,80,.25); z-index: 2; }
.tp-x { top: -7px; right: -7px; background: #e0719a; color: #fff; }
.tp-more { bottom: -7px; right: -7px; background: #fff; color: var(--primary-dark); }
.tp-status { font-size: .76rem; font-weight: 600; color: var(--ink); text-align: center; margin-top: 16px; padding: 7px 10px; background: var(--primary-light); border-radius: 12px; transition: background .2s; }
.tp-status.warn { background: #fde7ef; color: #b0386a; }
.tp-status.sub { font-size: .7rem; font-weight: 500; color: var(--muted); background: none; margin: 4px 0 12px; padding: 0; }

.tp-pool { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.tp-pet { position: relative; border: 1.5px solid color-mix(in srgb, var(--rc) 55%, #fff); border-radius: 14px; background: linear-gradient(170deg, color-mix(in srgb, var(--rc) 10%, #fff), #fff 70%); cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 1px; padding: 14px 2px 6px; font-family: inherit; transition: transform .1s; }
.tp-pet:active { transform: scale(.95); }
.tp-pet.active { border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary-2); }
.tp-emoji { font-size: 1.7rem; line-height: 1; }
.tp-name { font-size: .7rem; font-weight: 700; color: rgba(0,0,0,.6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
/* ออกผจญภัย = จางบอกว่าใช้ไม่ได้ตอนนี้ แต่ยังกดได้ (กดแล้วเด้งเหตุผล ไม่ใช่เงียบเหมือน :disabled เดิม) */
.tp-pet.away { opacity: .45; }
.tp-away { position: absolute; top: 2px; right: 3px; font-size: .7rem; line-height: 1; }
.tp-inteam { position: absolute; top: 2px; right: 3px; font-size: .7rem; font-weight: 800; line-height: 1.3; color: #fff; background: var(--primary); border-radius: 999px; padding: 0 5px; }
.tp-el { position: absolute; top: 2px; left: 3px; font-size: .72rem; line-height: 1; }
.tp-none { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; font-size: .76rem; color: rgba(0,0,0,.4); padding: 16px 0; }
.tp-none-cta { border: var(--bw) solid var(--line); background: var(--primary); color: #fff; border-radius: 11px; padding: 9px 18px; font-weight: 800; font-size: .8rem; text-decoration: none; box-shadow: var(--pop); }
</style>
