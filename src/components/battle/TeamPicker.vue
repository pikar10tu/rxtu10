<!-- TeamPicker — จัดทีม (= activePets, 3 ช่องคงที่ = BATTLE_SLOTS) ใช้ร่วม /team + หอคอย + สนามประลอง + หน้าฉัน
     รีเวิร์ค 18 ต.ค. 2026 (user เคาะจากเดโม · อ้าง 7DS Grand Cross): หน้าทีม = ทีมล้วน ไม่มีคลังกางให้เผลอกด
       · แตะช่อง  = หน้าต่างเลือกตัว (PetPickSheet) ตัวเดิมอยู่ช่องแรกเสมอ · เทียบก่อนกดยืนยัน
       · กดค้าง  = การ์ดเต็มแบบดูอย่างเดียว (PetDetailModal peek)
       · ลาก     = สลับตำแหน่งในทีม (ขยับก่อนครบเวลากดค้าง = ลาก — composables/usePress.js)
       · ใต้ช่อง (เว้นห่าง) = ATK / HP / ชื่อสกิล + Lv.1 — Lv.1 โชว์ที่นี่ที่เดียว (ใบ้ระบบเลเวลสกิลที่จะมา · ห้ามใส่ในการ์ด)
     ไม่ใช่ inline (เปิดจากหอคอย/สนาม/หน้าฉัน) = หน้าเต็มจอ ไม่ใช่แผ่นเลื่อน — กันแผ่นซ้อนแผ่นซ้อนการ์ด 3 ชั้น
     ชั้น: หน้าเต็มจอ z400 · หน้าต่างเลือกตัว z405 · การ์ด z410 · ตัวลาก z420 · Esc ปิดทีละชั้นจากบนสุด -->
<template>
  <Teleport to="body" :disabled="inline">
    <div v-if="inline || open" :class="inline ? 'tp-inline' : 'tp-full'">
      <div v-if="!inline" class="tp-bar">
        <button type="button" class="tp-back" aria-label="กลับ" @click="close">‹</button>
        <div class="tp-bar-t">
          <b><Emoji char="⚔️" /> จัดทีม</b>
          <small v-if="context">{{ context }}</small>
        </div>
      </div>

      <div :class="inline ? '' : 'tp-scroll'">
        <!-- ทีม 1/2/3 (utils/teamPresets.js) — 27 ต.ค. 2026 user: ทีมที่เปิดดูอยู่ล่าสุด = ทีมที่ใช้ (ไม่มีปุ่ม "ใช้ทีมนี้" แล้ว)
             เดิมกดแท็บดูทีมแต่ลืมกดใช้ → กดสู้ได้ทีมเก่า (พลาดกันบ่อย) · แท็บว่างไม่เปลี่ยนทีมที่ใช้จนกว่าจะใส่เพ็ท -->
        <div class="tp-presets" role="tablist" aria-label="ทีมที่จัดไว้">
          <button v-for="(p, i) in presets.presets" :key="i" type="button" role="tab" class="tp-preset"
            :class="{ on: viewIdx === i }" :aria-selected="viewIdx === i" @click="pickTab(i)">
            <span class="tp-preset-n">ทีม {{ i + 1 }}</span>
          </button>
        </div>
        <div v-if="!presets.presets[viewIdx].length" class="tp-use">ทีมนี้ยังว่าง ใส่เพ็ทก่อนนะ</div>

        <!-- ศัตรูที่จะเจอ (เปิดจากหอคอย) · ป้ายชนะทาง/แพ้ทางอยู่ในหน้าต่างเลือกตัว -->
        <div v-if="enemies.length" class="tp-foes">
          <span class="tp-foes-l">{{ enemyLabel }}</span>
          <span v-for="(e, i) in enemies" :key="i" class="tp-foe">
            <Emoji :char="defOf(e.id).emoji" /><span class="tp-foe-el"><Emoji :char="ELEMENTS[e.element]?.icon || 'el:fist'" /></span>
          </span>
        </div>

        <template v-if="owned.length">
          <div class="tp-slots">
            <div
              v-for="(id, i) in edit.slots" :key="i"
              class="tp-slot" :class="{ filled: id, drop: dropAt === i, dragging: dragFrom === i }"
              :data-slot="i" tabindex="0" role="button"
              :style="id ? { '--rc': rarityColor(id) } : null"
              :aria-label="id ? `ช่อง ${i + 1} ${defOf(id).name} — แตะเพื่อเปลี่ยนตัว` : `ช่อง ${i + 1} ว่าง — แตะเพื่อใส่`"
              v-on="slotPress[i]"
            >
              <span class="tp-slotno">{{ i + 1 }}</span>
              <template v-if="id">
                <!-- รูปใหญ่เต็มการ์ด (WebP 256px ละเอียดพอ) แทน PetThumb ย่อ — user บอก 18 ต.ค. ตัวเล็กไป -->
                <span class="tp-el"><Emoji :char="ELEMENTS[defOf(id).element]?.icon || 'el:fist'" /></span>
                <span class="tp-face"><Emoji :char="defOf(id).emoji" /></span>
                <!-- ป้ายความหายากตัวใหญ่แบบ 7DS + ดาว = ขั้น (user เคาะจากเดโม 25 ต.ค.: Lilita One · 100% · ยิ่งหายากยิ่งใหญ่) -->
                <span class="tp-rk" :data-r="rarityOf(id)" aria-hidden="true"><span>{{ RANK_LETTER[rarityOf(id)] }}</span></span>
                <span class="tp-stars" :aria-label="`ขั้น ${slotPetOf(id).grade || 0} จาก 5`">
                  <i v-for="n in 5" :key="n" :class="{ on: n <= (slotPetOf(id).grade || 0) }">★</i>
                </span>
                <span v-if="earthTag(i)" class="tp-season"><Emoji :char="earthTag(i).icon" /> {{ earthTag(i).text }}</span>
              </template>
              <span v-else class="tp-empty">＋</span>
            </div>
          </div>
          <p class="tp-howto">แตะ = เปลี่ยนตัว · กดค้าง = ดูการ์ด · ลาก = สลับตำแหน่ง · ช่อง 1 ออกตีก่อน</p>

          <div v-if="synergy.length" class="tp-syn">
            <span v-for="s in synergy" :key="s.key" class="tp-syn-chip" :class="{ off: !s.ok }">
              <Emoji :char="s.icon" /> {{ s.text }}
            </span>
          </div>

          <!-- สเตตัสใต้ทีม (แบบ 7DS) — ตั้งใจเว้นห่างจากการ์ด · เปิดหน้าต่างเลือกตัวแล้วโดนบังได้ ไม่เป็นไร -->
          <div class="tp-stats">
            <div v-for="(id, i) in edit.slots" :key="i" class="tp-stat">
              <template v-if="id">
                <div class="tp-stat-name">{{ displayName(id, defOf(id).name, teamNow) }}</div>
                <div class="tp-stat-row"><span>ATK</span><b>{{ statOf(slotPetOf(id)).atk }}</b></div>
                <div class="tp-stat-row"><span>HP</span><b>{{ statOf(slotPetOf(id)).hp }}</b></div>
                <div class="tp-stat-sk">{{ passiveOf({ id })?.name || 'ไม่มีทักษะ' }} </div>
                <!-- ขั้นสกิล: Lv.+ขีด 3 ช่อง (สกิลมี 3 ขั้น อัพด้วยหินในดันเจี้ยน) โชว์ที่นี่ที่เดียว · ระบบอัพยังไม่มา = Lv.1 เสมอ · ขั้น 3 = Lv.MAX ขีดเป็นชมพู -->
                <div v-if="passiveOf({ id })" class="tp-sklv"><b class="tp-lv">{{ SKILL_LV >= SKILL_MAX ? 'Lv.MAX' : 'Lv.' + SKILL_LV }}</b>
                  <span class="tp-pips"><i v-for="n in SKILL_MAX" :key="n" :class="{ on: n <= SKILL_LV, max: SKILL_LV >= SKILL_MAX }" /></span></div>
              </template>
              <div v-else class="tp-stat-empty">—</div>
            </div>
          </div>
        </template>
        <div v-else class="tp-none">
          ยังไม่มีเพ็ท — ไปอัญเชิญตัวแรกก่อนนะ
          <RouterLink to="/shop" class="tp-none-cta">ไปอัญเชิญเลย →</RouterLink>
        </div>
      </div>

      <div v-if="!inline && doneLabel" class="tp-cta">
        <!-- ของเฉพาะโหมดเหนือปุ่มเริ่ม (เช่น ดันเจี้ยน: สวิตช์ตีซ้ำ + โบนัสที่เหลือ) -->
        <slot name="cta-extra" />
        <button type="button" class="tp-cta-btn" :disabled="!viewIds.length" @click="emit('done')">{{ doneLabel }}</button>
      </div>
    </div>
  </Teleport>

  <PetPickSheet
    :open="sheetSlot !== null" :slot-index="sheetSlot ?? 0" :slots="edit.slots" :owned="owned" :favs="favs" :enemies="enemies"
    @close="sheetSlot = null" @choose="onChoose" @remove="onRemove" @peek="peekId = $event"
  />
  <PetDetailModal :pet-id="peekId" peek @close="peekId = null" />
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import PetDetailModal from '../pets/PetDetailModal.vue'
import PetPickSheet from './PetPickSheet.vue'
import { useRosterSync } from '../../composables/useRosterSync.js'
import { useToast } from '../../composables/useToast.js'
import { pressHandlers } from '../../composables/usePress.js'
import { fluentFile } from '../../utils/emoji.js'
import { computed, ref, watch, onUnmounted } from 'vue'
import { statOf } from '../../utils/petFilter.js'
import { useAuthStore } from '../../stores/auth.js'
import { getPetDef, RARITY, ELEMENTS, passiveOf } from '../../data/index.js'
import { BATTLE_SLOTS } from '../../data/residence.js'
import { toSlots } from '../../utils/teamSlots.js'
import { removeAt, compact } from '../../utils/slotEdit.js'
import { seasonOfSlot, degreeFormActive, displayName } from '../../utils/petForms.js'
import { teamSynergy } from '../../utils/teamSynergy.js'
import { readPresets, editPresetPatch, usePresetPatch } from '../../utils/teamPresets.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  inline: { type: Boolean, default: false },
  // ศัตรูที่รู้ตัวแล้ว [{id, element}] — ว่าง = ไม่โชว์แถวศัตรู/ป้ายชนะทาง (สนามสุ่มคู่ ยังไม่รู้คู่ตอนจัดทีม)
  enemies: { type: Array, default: () => [] },
  enemyLabel: { type: String, default: 'ศัตรู' },
  context: { type: String, default: '' },     // บรรทัดใต้หัว บอกว่ามาจากไหน เช่น "หอคอยชั้น 34"
  doneLabel: { type: String, default: '' },   // ปุ่มล่างสุด เช่น "เริ่มสู้" — ว่าง = ไม่มีปุ่ม (กลับด้วย ‹)
})
const emit = defineEmits(['update:open', 'done'])
const close = () => emit('update:open', false)

const auth = useAuthStore()
const { syncRosterRow } = useRosterSync()
const { toast } = useToast()
const owned = computed(() => auth.userData?.pets || [])
const favs = computed(() => auth.userData?.petFavs || [])
const ownedIds = computed(() => new Set(owned.value.map(p => p.id)))
const presets = computed(() => readPresets(auth.userData, ownedIds.value, BATTLE_SLOTS))
const viewIdx = ref(0)   // ทีมที่กำลังดู/แก้ (ไม่จำเป็นต้องเป็นทีมที่ใช้อยู่)
const shown = computed(() => props.inline || props.open)
const viewIds = computed(() => presets.value.presets[viewIdx.value] || [])

// สถานะแก้ไข — ช่องว่างค้างไว้ระหว่างแก้ (ตัวอื่นไม่เลื่อน) · บันทึกแบบตัดช่องว่าง (เอนจินต้องการทีมติดกัน)
const edit = ref({ slots: [] })
const sheetSlot = ref(null)
const peekId = ref(null)
watch(shown, (o) => {
  if (!o) { sheetSlot.value = null; peekId.value = null; return }
  viewIdx.value = presets.value.idx
  edit.value = { slots: toSlots(viewIds.value, BATTLE_SLOTS) }
}, { immediate: true })
watch(viewIdx, () => { edit.value = { slots: toSlots(viewIds.value, BATTLE_SLOTS) }; sheetSlot.value = null })
// ทีมเปลี่ยนจากที่อื่น → ตามให้ทัน · ของที่เราแก้เองตรงกันอยู่แล้ว ไม่รีเซ็ตช่องว่าง
watch(viewIds, (ids) => {
  if (ids.join() !== compact(edit.value.slots).join()) edit.value = { slots: toSlots(ids, BATTLE_SLOTS) }
})

const defOf = (id) => getPetDef(id) || { emoji: '❓', name: '?', rarity: 'common', element: 'scissors' }
const slotPetOf = (id) => owned.value.find(p => p.id === id) || { id }
const RANK_LETTER = { common: 'C', rare: 'R', epic: 'E', legendary: 'L' }
const SKILL_LV = 1
const SKILL_MAX = 3 // สกิลมี 3 ขั้น (Lv1 → Lv2 → Lv.MAX)
const rarityOf = (id) => slotPetOf(id).rarity || defOf(id).rarity || 'common'
const rarityColor = (id) => RARITY[slotPetOf(id).rarity || defOf(id).rarity]?.color || '#94a3b8'

// rarity อ่านแบบเดียวกับเอนจิน: inst.rarity || def.rarity || 'common' (resolveBattleTeam)
const teamNow = computed(() => edit.value.slots.filter(Boolean).map(id => ({
  id, rarity: slotPetOf(id)?.rarity || defOf(id).rarity || 'common',
})))
const formOn = computed(() => degreeFormActive(teamNow.value))
const synergy = computed(() => teamSynergy(edit.value.slots))

/** ป้ายใต้ช่องของ 🌍 — ฤดูของตำแหน่งจริง · ร่างองศาไม่มีป้าย ให้ไปเจอเองในไฟต์ (26 ต.ค. user) (icon แยกเพื่อเดินผ่าน <Emoji>) */
function earthTag(i) {
  if (edit.value.slots[i] !== 'earth') return null
  if (formOn.value) return null
  const s = seasonOfSlot(edit.value.slots.slice(0, i).filter(Boolean).length)
  return { icon: s.icon, text: s.label }
}

async function save(next) {
  let patch = editPresetPatch(presets.value, viewIdx.value, next)
  // แก้ทีมที่เปิดดูอยู่ (มีเพ็ท) = ทีมนี้คือทีมที่ใช้ทันที
  if (next.length && viewIdx.value !== presets.value.idx) patch = { ...patch, activePets: next.slice(), teamPresetIdx: viewIdx.value }
  await auth.patchUser(patch, patch)
  if (patch.activePets) syncRosterRow()   // ทีมที่ใช้เปลี่ยน → คู่ต่อสู้ใน Arena ต้องเห็นทีมใหม่
}
/** แตะแท็บทีม = เปิดดู และถ้ามีเพ็ทก็ใช้ทีมนั้นเลย (ไม่มี toast — สลับแท็บเป็นเรื่องปกติ) */
async function pickTab(i) {
  const prev = viewIdx.value
  viewIdx.value = i
  if (i === presets.value.idx || !presets.value.presets[i].length) return
  const patch = usePresetPatch(presets.value, i)
  const ok = await auth.patchUser(patch, patch)
  if (ok) syncRosterRow()
  else { viewIdx.value = prev; toast('เปลี่ยนทีมไม่สำเร็จ', 'error') }   // กลับแท็บเดิม — กันจอโชว์ทีมที่ไม่ได้ใช้จริง (รีวิว 28 ต.ค.)
}
function setSlots(next) {
  const before = compact(edit.value.slots).join()
  edit.value = { slots: next }
  if (compact(next).join() !== before) save(compact(next))
}

// เลือกจากหน้าต่าง: ตัวที่อยู่ช่องอื่นแล้ว = สลับช่องกัน · ตัวใหม่ = แทนตัวเดิม (ตัวเดิมออกจากทีม)
function onChoose(id) {
  const i = sheetSlot.value
  if (i == null) return
  const next = edit.value.slots.slice()
  const at = next.indexOf(id)
  if (at >= 0) { next[at] = next[i]; next[i] = id } else next[i] = id
  sheetSlot.value = null
  setSlots(next)
}
function onRemove() {
  const i = sheetSlot.value
  if (i == null) return
  sheetSlot.value = null
  setSlots(removeAt({ slots: edit.value.slots, sel: null }, i).slots)
}

// ── ลากสลับตำแหน่ง ──
const dragFrom = ref(null)
const dropAt = ref(null)
let ghost = null
const slotUnder = (x, y) => {
  if (ghost) ghost.style.display = 'none'
  const el = document.elementFromPoint(x, y)?.closest('[data-slot]')
  if (ghost) ghost.style.display = ''
  return el ? Number(el.dataset.slot) : null
}
function dragFor(i) {
  return {
    start(e) {
      const id = edit.value.slots[i]
      if (!id) return
      dragFrom.value = i
      ghost = document.createElement('div')
      ghost.className = 'tp-ghost'
      const src = fluentFile(defOf(id).emoji)   // WebP เท่านั้น (CLAUDE.md ข้อ 17) · ไม่มีไฟล์ = ตัวอักษรอีโมจิ
      if (src) { const img = document.createElement('img'); img.src = src; img.alt = ''; ghost.appendChild(img) } else ghost.textContent = defOf(id).emoji
      document.body.appendChild(ghost)
      this.move(e)
    },
    move(e) {
      if (!ghost) return
      ghost.style.left = `${e.clientX}px`; ghost.style.top = `${e.clientY}px`
      const j = slotUnder(e.clientX, e.clientY)
      dropAt.value = (j != null && j !== i) ? j : null
    },
    end(_e, cancelled) {
      const j = dropAt.value
      ghost?.remove(); ghost = null
      dragFrom.value = null; dropAt.value = null
      if (cancelled || j == null || !edit.value.slots[i]) return
      const next = edit.value.slots.slice();
      [next[i], next[j]] = [next[j], next[i]]
      setSlots(next)
    },
  }
}
onUnmounted(() => ghost?.remove())
// listener ต่อช่องสร้างครั้งเดียว (สร้างใหม่ทุกเรนเดอร์ = สถานะกดค้าง/ลากหายกลางคัน)
const slotPress = Array.from({ length: BATTLE_SLOTS }, (_, i) => pressHandlers({
  onTap: () => { sheetSlot.value = i },
  onLong: () => { const id = edit.value.slots[i]; if (id) peekId.value = id; else sheetSlot.value = i },
  drag: dragFor(i),
}))

// Esc ปิดทีละชั้น — ฟังแบบ capture ให้ได้ก่อนโมดัลการ์ด (ที่ปิดตัวเองอยู่แล้ว) จะได้ไม่ปิดซ้อนสองชั้น
function onKey(e) {
  if (e.key !== 'Escape' || !shown.value) return
  if (peekId.value) return
  if (sheetSlot.value !== null) { sheetSlot.value = null; return }
  if (!props.inline) close()
}
watch(shown, (o) => (o ? window.addEventListener('keydown', onKey, true) : window.removeEventListener('keydown', onKey, true)), { immediate: true })
onUnmounted(() => window.removeEventListener('keydown', onKey, true))
</script>

<style scoped>
.tp-full { position: fixed; inset: 0; z-index: 400; display: flex; flex-direction: column; background: linear-gradient(170deg, #fde8f1, #e3f3fc 55%, #e2f7ee); }
.tp-bar { flex: none; width: 100%; max-width: 520px; margin: 0 auto; box-sizing: border-box; display: flex; align-items: center; gap: 8px; padding: calc(10px + env(safe-area-inset-top, 0px)) 14px 10px; }
.tp-back { border: var(--bw) solid var(--line); background: #fff; width: 40px; height: 40px; border-radius: 12px; font-size: 1.4rem; line-height: 1; cursor: pointer; color: var(--ink); box-shadow: var(--pop); }
.tp-bar-t { display: flex; flex-direction: column; min-width: 0; }
.tp-bar-t b { font-family: var(--font-display); font-weight: 400; font-size: 1.2rem; color: var(--ink); }
.tp-bar-t small { font-size: .74rem; color: var(--muted); }
.tp-scroll { flex: 1; overflow-y: auto; overscroll-behavior: contain; padding: 4px 16px 20px; width: 100%; max-width: 520px; margin: 0 auto; }
.tp-cta { flex: none; padding: 10px 16px calc(12px + env(safe-area-inset-bottom, 0px)); background: rgba(255,255,255,.85); border-top: 1px solid rgba(43,53,80,.08); }
.tp-cta-btn { display: block; width: 100%; max-width: 488px; margin: 0 auto; border: 0; border-radius: 14px; padding: 13px; font: inherit; font-size: 1rem; font-weight: 800; color: #fff; background: linear-gradient(135deg, var(--primary), var(--primary-2)); box-shadow: var(--pop); cursor: pointer; }
.tp-cta-btn:disabled { opacity: .5; cursor: default; }
.tp-inline { padding-bottom: 8px; }

.tp-presets { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 8px; }
.tp-preset { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 6px 4px; border-radius: 12px; border: var(--bw) solid var(--line); background: #fff; font-family: inherit; color: var(--ink); cursor: pointer; }
.tp-preset.on { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 10%, #fff); box-shadow: 0 0 0 1px var(--primary); }
.tp-preset-n { font-size: .78rem; font-weight: 800; }
.tp-use { margin-bottom: 8px; text-align: center; font-size: .8rem; font-weight: 700; color: var(--muted); }   /* แท็บทีมว่าง — ข้อความเตือน ไม่ใช่ปุ่มแล้ว */
.tp-foes { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 0 0 8px; padding: 6px 10px; border-radius: 12px; background: #fdf0f4; border: var(--bw) solid #f3c6d6; }
.tp-foes-l { font-size: .74rem; font-weight: 800; color: #b0386a; margin-right: 2px; }
.tp-foe { position: relative; font-size: 1.35rem; line-height: 1; }
.tp-foe-el { position: absolute; right: -7px; bottom: -4px; font-size: .7rem; }

.tp-slots { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 14px; }
.tp-slot { position: relative; aspect-ratio: .8; padding: 24px 6px 10px; border-radius: 20px; cursor: pointer; overflow: hidden;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  border: 2px dashed #b9d7ea; background: rgba(255,255,255,.7); transition: transform .15s, box-shadow .15s, opacity .15s;
  touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
.tp-slot.filled { border: 2px solid var(--rc); background:
  radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--rc) 30%, #fff) 0, transparent 62%),
  linear-gradient(175deg, color-mix(in srgb, var(--rc) 22%, #fff), #fff 78%); box-shadow: var(--pop); }
.tp-slot.pressing { transform: scale(.96); }
.tp-slot.dragging { opacity: .35; }
.tp-slot.drop { box-shadow: 0 0 0 3px var(--primary), var(--pop); transform: scale(1.03); }
.tp-slot:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.tp-slotno { position: absolute; top: 7px; left: 50%; transform: translateX(-50%); min-width: 22px; padding: 1px 7px; border-radius: 999px; text-align: center;
  font-size: .74rem; font-weight: 800; line-height: 1.4; color: #fff; background: var(--rc, #9cc8e4); }
.tp-el { position: absolute; top: 6px; left: 7px; font-size: 1.15rem; line-height: 1; }
.tp-rk { position: absolute; left: 5px; bottom: 1px; z-index: 2; pointer-events: none; transform: skewX(-8deg);
  font: 400 2.3rem/1 'Lilita One', 'Kanit', sans-serif; letter-spacing: -.02em; }
.tp-rk span { display: block; color: transparent; -webkit-background-clip: text; background-clip: text;
  -webkit-text-stroke: 1.5px #2b3550; paint-order: stroke fill; filter: drop-shadow(2px 2px 0 #fff) drop-shadow(2px 3px 0 #2b3550); }
.tp-rk[data-r=common] { font-size: 1.9rem; }
.tp-rk[data-r=common] span { background-image: linear-gradient(180deg, #f1f5f9 0, #cbd5e1 45%, #94a3b8 55%, #e2e8f0); }
.tp-rk[data-r=rare] { font-size: 2.1rem; }
.tp-rk[data-r=rare] span { background-image: linear-gradient(180deg, #e0f2ff 0, #7cc0ff 45%, #2563eb 55%, #93c5fd); }
.tp-rk[data-r=epic] span { background-image: linear-gradient(180deg, #fae8ff 0, #e879f9 40%, #7c3aed 56%, #c4b5fd); }
.tp-rk[data-r=legendary] { font-size: 2.6rem; }
.tp-rk[data-r=legendary] span { background-image: linear-gradient(180deg, #fffbe0 0, #fde047 38%, #f59e0b 52%, #ff7ab6 78%, #fde68a);
  background-size: 100% 200%; animation: tp-gold 2.4s ease-in-out infinite alternate; }
@keyframes tp-gold { to { background-position: 0 100%; } }
.tp-stars { position: absolute; right: 6px; bottom: 8px; z-index: 2; display: flex; flex-direction: column-reverse; font-size: .7rem; line-height: 1; pointer-events: none; }
.tp-stars i { font-style: normal; color: #d7dbe6; text-shadow: 0 1px 0 #fff; }
.tp-stars i.on { color: #ffb800; text-shadow: 0 1px 0 #8a5a00; }
.tp-sklv { display: flex; align-items: center; gap: 5px; font-size: .78rem; }
.tp-pips { display: flex; gap: 2px; }
.tp-pips i { width: 9px; height: 6px; border-radius: 2px; background: #dfe3ec; }
.tp-pips i.on { background: #3a9fd6; }
.tp-pips i.max { background: #ff8fab; }
@media (prefers-reduced-motion: reduce) { .tp-rk span { animation: none; } }
.tp-face { flex: 1; display: flex; align-items: center; justify-content: center; font-size: clamp(50px, 15vw, 80px); line-height: 1; pointer-events: none;
  filter: drop-shadow(0 6px 8px rgba(43,53,80,.18)); }
.tp-slotname { font-size: .9rem; font-weight: 800; color: var(--ink); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tp-season { font-size: .72rem; font-weight: 700; color: var(--primary); white-space: nowrap; }
.tp-empty { flex: 1; display: flex; align-items: center; color: #8ec6e8; font-size: 2.2rem; }
.tp-howto { font-size: .7rem; color: var(--muted); text-align: center; margin: 10px 0 0; }
.tp-syn { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin: 10px 0 0; }
.tp-syn-chip { display: inline-flex; align-items: center; gap: 4px; font-size: .72rem; font-weight: 600; color: var(--ink); padding: 3px 9px; border-radius: 999px; background: var(--mint-light); border: var(--bw) solid var(--line); }
.tp-syn-chip.off { background: transparent; color: var(--muted); opacity: .85; border-style: dashed; }

.tp-stats { margin-top: 44px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 12px 10px; border-radius: 16px; background: rgba(255,255,255,.72); border: var(--bw) solid var(--line); }
.tp-stat { display: flex; flex-direction: column; gap: 4px; min-width: 0; font-size: .95rem; }
.tp-stat-name { font-weight: 800; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tp-stat-row { display: flex; justify-content: space-between; gap: 4px; font-variant-numeric: tabular-nums; }
.tp-stat-row span { font-size: .76rem; font-weight: 700; color: var(--muted); letter-spacing: .04em; }
.tp-stat-sk { margin-top: 3px; font-size: .82rem; line-height: 1.35; color: var(--ink); overflow-wrap: anywhere; }
.tp-lv { font-weight: 800; color: var(--primary-dark, #3a9fd6); white-space: nowrap; }
.tp-stat-empty { color: var(--muted); text-align: center; }

.tp-none { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; font-size: .8rem; color: var(--muted); padding: 24px 0; }
.tp-none-cta { border: var(--bw) solid var(--line); background: var(--primary); color: #fff; border-radius: 11px; padding: 9px 18px; font-weight: 800; font-size: .8rem; text-decoration: none; box-shadow: var(--pop); }
</style>

<style>
/* ตัวที่ลากตามนิ้ว — อยู่ที่ body (ไม่ scoped) เหนือทุกชั้น */
.tp-ghost { position: fixed; z-index: 420; pointer-events: none; width: 84px; aspect-ratio: .78; border-radius: 16px; background: #fff;
  box-shadow: 0 14px 40px rgba(0,0,0,.25); display: flex; align-items: center; justify-content: center; font-size: 2.6rem; transform: translate(-50%, -60%) rotate(-4deg); }
.tp-ghost img { width: 62%; height: auto; }
</style>
