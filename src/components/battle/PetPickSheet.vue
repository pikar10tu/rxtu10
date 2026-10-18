<!-- PetPickSheet — หน้าต่างเลือกตัวลงช่อง (เปิดจากแตะช่องในหน้าจัดทีม · user เคาะจากเดโม 18 ต.ค. 2026)
     · ตัวเดิมของช่องอยู่ช่องแรกเสมอ ไม่ว่าฟิลเตอร์อะไร
     · แตะตัว = ขึ้นเทียบ ATK/HP + สกิลก่อน แล้วค่อยกด "ใส่ทีม" (กันเผลอสลับระหว่างอ่าน)
     · กดค้าง = การ์ดเต็มแบบดูอย่างเดียว (emit peek — TeamPicker เปิดโมดัลชั้นบน z410)
     ชั้น: แผ่นนี้ z405 อยู่เหนือหน้าจัดทีมแบบเต็มจอ (z400) และใต้การ์ด (z410) · Esc จัดการที่ TeamPicker ทีละชั้น -->
<template>
  <Teleport to="body">
    <Transition name="pps">
      <div v-if="open" class="pps-ov" @click.self="$emit('close')">
        <div class="pps-box" role="dialog" aria-modal="true" :aria-label="title">
          <div class="pps-grab" />
          <div class="pps-head">
            <div class="pps-tt">
              <div class="pps-title">{{ title }}</div>
              <div class="pps-sub">
                <template v-if="curId">ตอนนี้: {{ defOf(curId).name }}</template>
                <template v-else>ช่องนี้ยังว่าง</template>
                <button v-if="curId && teamCount > 1" type="button" class="pps-remove" @click="$emit('remove')">เอาออกจากช่องนี้</button>
              </div>
            </div>
            <span class="pps-hint"><Emoji char="✋" /> กดค้างเพื่อดูรายละเอียด</span>
          </div>
          <div class="pps-filter"><PetFilterBar v-model="flt" /></div>

          <div class="pps-scroll">
            <div class="pps-grid">
              <button
                v-for="p in list" :key="p.id" type="button"
                class="pps-pet" :class="{ sel: picked === p.id }" :style="{ '--rc': rarityColor(p) }"
                :aria-label="defOf(p.id).name"
                v-on="pressOf(p.id)"
              >
                <span class="pps-el"><Emoji :char="ELEMENTS[defOf(p.id).element]?.icon || 'el:fist'" /></span>
                <span v-if="favSet.has(p.id)" class="pps-fav">♥</span>
                <span class="pps-face"><Emoji :char="defOf(p.id).emoji" /></span>
                <span v-if="p.grade" class="pps-gr">{{ GRADE_LABELS[p.grade] }}</span>
                <span v-if="enemies.length && (mu(p.id).win || mu(p.id).lose)" class="pps-mu">
                  <i v-if="mu(p.id).win" class="w">ชนะทาง</i><i v-if="mu(p.id).lose" class="l">แพ้ทาง</i>
                </span>
                <span v-if="p.id === curId" class="pps-tag cur">ตัวเดิม</span>
                <span v-else-if="slots.indexOf(p.id) >= 0" class="pps-tag in">อยู่ช่อง {{ slots.indexOf(p.id) + 1 }}</span>
              </button>
              <div v-if="!list.length" class="pps-none">ไม่มีเพ็ทที่ตรงกับตัวกรอง</div>
            </div>
          </div>

          <!-- เทียบก่อนยืนยัน — ช่องว่างไม่มีตัวให้เทียบ ⇒ โชว์เลขเฉยๆ -->
          <div v-if="picked" class="pps-cmp">
            <div class="pps-cmp-top">
              <span class="pps-cmp-face"><Emoji :char="defOf(picked).emoji" /></span>
              <div class="pps-cmp-id">
                <b>{{ defOf(picked).name }}</b>
                <div class="pps-cmp-skill"><b>{{ skillOf(picked)?.name || 'ยังไม่มีทักษะเฉพาะ' }}</b> {{ skillOf(picked) ? passiveText(skillOf(picked)) : '' }}</div>
              </div>
            </div>
            <div class="pps-cmp-grid">
              <span class="h">ATK</span><b>{{ statOf(petOf(picked)).atk }}</b><span v-if="curId" :class="dcls(delta.atk)">{{ dtxt(delta.atk) }}</span><span v-else />
              <span class="h">HP</span><b>{{ statOf(petOf(picked)).hp }}</b><span v-if="curId" :class="dcls(delta.hp)">{{ dtxt(delta.hp) }}</span><span v-else />
            </div>
            <div class="pps-cmp-act">
              <button type="button" class="pps-cancel" @click="picked = null">ยกเลิก</button>
              <button type="button" class="pps-ok" @click="confirmPick">{{ slots.indexOf(picked) >= 0 ? 'สลับช่องกัน' : 'ใส่ทีม' }}</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import Emoji from '../shared/Emoji.vue'
import PetFilterBar from '../pets/PetFilterBar.vue'
import { getPetDef, RARITY, ELEMENTS, GRADE_LABELS, passiveOf } from '../../data/index.js'
import { passiveText } from '../../data/petPassives.js'
import { filterPets, sortCollection, statOf, DEFAULT_FILTER } from '../../utils/petFilter.js'
import { matchupOf } from '../../utils/matchup.js'
import { pressHandlers } from '../../composables/usePress.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  slotIndex: { type: Number, default: 0 },
  slots: { type: Array, default: () => [] },     // ช่องทีมตอนนี้ (มี null ได้)
  owned: { type: Array, default: () => [] },     // pets[] ของผู้เล่น
  favs: { type: Array, default: () => [] },
  enemies: { type: Array, default: () => [] },
})
const emit = defineEmits(['close', 'choose', 'remove', 'peek'])

const defOf = (id) => getPetDef(id) || { emoji: '❓', name: '?', rarity: 'common', element: 'scissors' }
const petOf = (id) => props.owned.find(p => p.id === id) || { id }
const rarityColor = (p) => RARITY[p.rarity || defOf(p.id).rarity]?.color || '#94a3b8'
const skillOf = (id) => passiveOf({ id })
const mu = (id) => matchupOf(defOf(id).element, props.enemies)
const favSet = computed(() => new Set(props.favs))

const title = computed(() => `เลือกตัวลงช่อง ${props.slotIndex + 1}`)
const curId = computed(() => props.slots[props.slotIndex] || null)
const teamCount = computed(() => props.slots.filter(Boolean).length)

const flt = ref({ ...DEFAULT_FILTER })
const picked = ref(null)
watch(() => [props.open, props.slotIndex], ([o]) => { if (o) { flt.value = { ...DEFAULT_FILTER }; picked.value = null } })

const list = computed(() => {
  const rest = sortCollection(filterPets(props.owned.filter(p => p.id !== curId.value), flt.value, [], props.favs), props.favs)
  return curId.value ? [petOf(curId.value), ...rest] : rest
})

const delta = computed(() => {
  if (!picked.value || !curId.value) return { atk: 0, hp: 0 }
  const a = statOf(petOf(picked.value)), b = statOf(petOf(curId.value))
  return { atk: a.atk - b.atk, hp: a.hp - b.hp }
})
const dcls = (v) => (v > 0 ? 'up' : v < 0 ? 'down' : 'same')
const dtxt = (v) => (v > 0 ? `▲ ${v}` : v < 0 ? `▼ ${-v}` : 'เท่าเดิม')

// listener ต่อการ์ดต้องสร้างครั้งเดียว — สร้างใหม่ทุกเรนเดอร์ = สถานะกดค้างหายกลางคัน
const handlers = new Map()
function pressOf(id) {
  if (!handlers.has(id)) handlers.set(id, pressHandlers({ onTap: () => tap(id), onLong: () => emit('peek', id) }))
  return handlers.get(id)
}
function tap(id) {
  picked.value = (id === curId.value || picked.value === id) ? null : id
}
function confirmPick() {
  const id = picked.value
  picked.value = null
  if (id) emit('choose', id)
}
</script>

<style scoped>
.pps-ov { position: fixed; inset: 0; z-index: 405; background: rgba(15,23,42,.38); display: flex; align-items: flex-end; justify-content: center; }
.pps-box { width: 100%; max-width: 520px; height: 70dvh; max-height: calc(100dvh - 40px); background: #fff; border-radius: 22px 22px 0 0; box-shadow: 0 -10px 40px rgba(43,53,80,.18);
  display: flex; flex-direction: column; padding-bottom: env(safe-area-inset-bottom, 0px); }
.pps-enter-active, .pps-leave-active { transition: opacity .2s; }
.pps-enter-active .pps-box, .pps-leave-active .pps-box { transition: transform .25s cubic-bezier(.2,.8,.2,1); }
.pps-enter-from, .pps-leave-to { opacity: 0; }
.pps-enter-from .pps-box, .pps-leave-to .pps-box { transform: translateY(100%); }
.pps-grab { width: 40px; height: 4px; border-radius: 4px; background: rgba(43,53,80,.15); margin: 8px auto 0; flex: none; }
.pps-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; padding: 10px 16px 0; flex: none; }
.pps-tt { min-width: 0; }
.pps-title { font-family: var(--font-display); font-size: 1.15rem; color: var(--ink); }
.pps-sub { font-size: .74rem; color: var(--muted); display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; }
.pps-remove { border: 0; background: none; padding: 0; font: inherit; font-size: .74rem; font-weight: 700; color: #b0386a; text-decoration: underline; cursor: pointer; }
.pps-hint { flex: none; display: inline-flex; align-items: center; gap: 4px; font-size: .7rem; font-weight: 600; color: var(--muted); background: #f3f6fb; border-radius: 999px; padding: 4px 10px; white-space: nowrap; }
.pps-filter { padding: 0 16px; flex: none; }
.pps-scroll { flex: 1; overflow-y: auto; overscroll-behavior: contain; padding: 2px 16px 16px; touch-action: pan-y; }
.pps-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
.pps-pet { position: relative; aspect-ratio: 1; border: 1.5px solid color-mix(in srgb, var(--rc) 55%, #fff); border-radius: 14px;
  background: linear-gradient(170deg, color-mix(in srgb, var(--rc) 12%, #fff), #fff 70%); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  padding: 12px 2px 6px; font-family: inherit; cursor: pointer; transition: transform .12s;
  user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
.pps-pet.pressing { transform: scale(.95); }
.pps-pet.sel { box-shadow: 0 0 0 3px var(--primary); transform: translateY(-2px); }
.pps-el { position: absolute; top: 3px; left: 4px; font-size: .72rem; line-height: 1; }
.pps-fav { position: absolute; top: 2px; right: 5px; font-size: .74rem; color: #e0719a; line-height: 1.2; }
.pps-face { font-size: 2rem; line-height: 1; pointer-events: none; }
.pps-name { font-size: .7rem; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.pps-gr { font-size: .7rem; font-weight: 800; color: #fff; background: var(--rc); border-radius: 999px; padding: 0 6px; line-height: 1.35; }
.pps-mu { display: flex; gap: 2px; }
.pps-mu i { font-style: normal; font-size: .7rem; font-weight: 800; line-height: 1.3; padding: 0 4px; border-radius: 999px; }
.pps-mu .w { color: #17805c; background: #dff5ea; } .pps-mu .l { color: #c2415c; background: #fde7ef; }
.pps-tag { position: absolute; left: -1.5px; right: -1.5px; bottom: -1.5px; font-size: .7rem; font-weight: 700; color: #fff; text-align: center; border-radius: 0 0 14px 14px; line-height: 1.5; }
.pps-tag.cur { background: var(--ink); } .pps-tag.in { background: var(--primary); }
.pps-none { grid-column: 1 / -1; text-align: center; font-size: .76rem; color: var(--muted); padding: 16px 0; }

.pps-cmp { flex: none; border-top: 1px solid rgba(43,53,80,.08); background: #f7f9fc; padding: 12px 16px; display: grid; gap: 10px; }
.pps-cmp-top { display: flex; gap: 10px; align-items: center; }
.pps-cmp-face { font-size: 2.2rem; line-height: 1; flex: none; }
.pps-cmp-id { min-width: 0; font-size: .85rem; }
.pps-cmp-skill { font-size: .74rem; color: #434a63; line-height: 1.45; margin-top: 2px; }
.pps-cmp-skill b { color: #6a52b8; }
.pps-cmp-grid { display: grid; grid-template-columns: auto auto 1fr; gap: 3px 14px; align-items: baseline; font-size: .82rem; font-variant-numeric: tabular-nums; }
.pps-cmp-grid .h { font-size: .7rem; font-weight: 700; color: var(--muted); }
.pps-cmp-grid .up { color: #17805c; font-weight: 800; } .pps-cmp-grid .down { color: #c2415c; font-weight: 800; } .pps-cmp-grid .same { color: var(--muted); }
.pps-cmp-act { display: flex; gap: 8px; }
.pps-cancel { flex: none; border: var(--bw) solid var(--line); background: #fff; border-radius: 12px; padding: 10px 16px; font: inherit; font-size: .85rem; font-weight: 700; color: var(--ink); cursor: pointer; }
.pps-ok { flex: 1; border: 0; border-radius: 12px; padding: 10px; font: inherit; font-size: .9rem; font-weight: 800; color: #fff; background: linear-gradient(135deg, var(--primary), var(--primary-2)); box-shadow: var(--pop); cursor: pointer; }
.pps-pet:focus-visible, .pps-ok:focus-visible, .pps-cancel:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
</style>
