<!-- แก้ตู้โชว์ในหน้าฉัน — วิธีเลือกแบบเดียวกับจัดทีม (utils/slotEdit.js)
     แตะช่อง = เลือก · แตะอีกช่อง = สลับ · ✕ = เอาออก · เลือกช่องแล้วแตะความสำเร็จด้านล่าง/กด "ใส่ตู้โชว์" = ใส่ช่องนั้น
     pinnedAch เก็บเป็นอาเรย์ 3 ช่อง (มี null ได้) ⇒ ตำแหน่งคงที่ตามที่จัด -->
<template>
  <div class="sc-ed">
    <div class="sc-head"><Emoji char="🏆" /> ตู้โชว์ของฉัน <small>เพื่อนเห็นในการ์ดโปรไฟล์</small></div>
    <div class="sc-slots">
      <div v-for="(id, i) in edit.slots" :key="i" class="sc-wrap">
        <button type="button" class="sc-slot" :class="{ filled: id, sel: edit.sel === i }" :aria-pressed="edit.sel === i" @click="onSlot(i)">
          <span class="sc-no">{{ i + 1 }}</span>
          <template v-if="byId(id)">
            <span class="sc-icon"><Emoji :char="byId(id).icon" /></span>
            <span class="sc-name">{{ byId(id).label }}</span>
          </template>
          <span v-else class="sc-empty">＋</span>
        </button>
        <button v-if="byId(id)" type="button" class="sc-x" :aria-label="`เอา ${byId(id).label} ออกจากตู้`" @click="onRemove(i)">✕</button>
      </div>
    </div>
    <div class="sc-status" :class="{ warn }">{{ status }}</div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Emoji from './Emoji.vue'
import { useAuthStore } from '../../stores/auth.js'
import { useToast } from '../../composables/useToast.js'
import { tapSlot, tapItem, removeAt } from '../../utils/slotEdit.js'
import { SHOWCASE_MAX } from '../../utils/achievements.js'

const props = defineProps({ items: { type: Array, default: () => [] } })
const auth = useAuthStore()
const { toast } = useToast()

const toSlots = (arr) => Array.from({ length: SHOWCASE_MAX }, (_, i) => (Array.isArray(arr) && arr[i]) || null)
const edit = ref({ slots: toSlots(auth.userData?.pinnedAch), sel: null })
watch(() => auth.userData?.pinnedAch, (p) => { edit.value = { slots: toSlots(p), sel: edit.value.sel } })

const byId = (id) => (id && props.items.find(a => a.docId === id)) || null
const warn = ref(false)
const status = computed(() => {
  const i = edit.value.sel
  const cur = i == null ? null : byId(edit.value.slots[i])
  if (cur) return `เลือกช่อง ${i + 1} (${cur.label}) · แตะความสำเร็จด้านล่างเพื่อใส่แทน หรือแตะช่องอื่นเพื่อสลับ`
  if (i != null) return `เลือกช่อง ${i + 1} (ว่าง) · แตะความสำเร็จด้านล่างแล้วกด "ใส่ตู้โชว์"`
  if (edit.value.slots.some(x => !byId(x))) return 'แตะความสำเร็จด้านล่างแล้วกด "ใส่ตู้โชว์" · แตะช่องเพื่อเลือก/สลับ'
  return 'ตู้เต็มแล้ว · แตะช่องที่อยากเปลี่ยนก่อน แล้วค่อยเลือกความสำเร็จ'
})

async function apply(res) {
  edit.value = { slots: res.slots, sel: res.sel }
  const next = res.slots.map(x => x || null)
  const ok = await auth.patchUser({ pinnedAch: next }, { pinnedAch: next })
  if (!ok) toast('บันทึกไม่สำเร็จ', 'error')
}
function onSlot(i) { warn.value = false; const r = tapSlot(edit.value, i); edit.value = { slots: r.slots, sel: r.sel }; if (r.event === 'swap') apply(r) }
function onRemove(i) { warn.value = false; apply(removeAt(edit.value, i)) }

/** จาก popup ความสำเร็จ (ปุ่ม ใส่ตู้โชว์) · คืน event ให้ผู้เรียกรู้ผล */
function pick(docId) {
  // ของที่ไม่มีจริงในช่อง (ปักไว้แต่ id หาย) ถือเป็นช่องว่าง
  const clean = { slots: edit.value.slots.map(x => (byId(x) ? x : null)), sel: edit.value.sel }
  const r = tapItem(clean, docId)
  warn.value = r.event === 'full'
  if (r.event === 'full') { toast('ตู้เต็มแล้ว — แตะช่องที่อยากเปลี่ยนก่อน', 'info'); return r.event }
  if (r.event !== 'select') apply(r)
  else edit.value = { slots: r.slots, sel: r.sel }
  return r.event
}
defineExpose({ pick })
</script>

<style scoped>
.sc-ed { margin-top: 10px; padding: 12px; border-radius: 18px; background: linear-gradient(170deg, var(--primary-light), #fff 75%); border: var(--bw) solid var(--line); box-shadow: var(--pop); }
.sc-head { font-weight: 800; font-size: .9rem; margin-bottom: 10px; }
.sc-head small { font-weight: 600; font-size: .7rem; color: var(--muted); margin-left: 4px; }
.sc-slots { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.sc-wrap { position: relative; }
.sc-slot { position: relative; width: 100%; min-height: 86px; padding: 14px 4px 8px; font-family: inherit; border-radius: 14px; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; border: 2px dashed #b9d7ea; background: rgba(255,255,255,.75); transition: transform .12s, box-shadow .15s; }
.sc-slot.filled { border: 1.5px solid var(--line); background: #fff; box-shadow: var(--pop); }
.sc-slot.sel { box-shadow: 0 0 0 3px var(--accent), var(--pop); transform: translateY(-2px); }
.sc-no { position: absolute; top: 4px; left: 7px; font-size: .7rem; font-weight: 800; color: var(--muted); }
.sc-icon { font-size: 1.6rem; line-height: 1; }
.sc-name { font-size: .7rem; font-weight: 700; color: var(--ink); text-align: center; line-height: 1.2; }
.sc-empty { color: #8ec6e8; font-size: 1.4rem; }
.sc-x { position: absolute; top: -7px; right: -7px; width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid #fff; background: #e0719a; color: #fff; font: inherit; font-size: .7rem; font-weight: 800; cursor: pointer; display: grid; place-items: center; box-shadow: 0 1px 4px rgba(43,53,80,.25); }
.sc-status { margin-top: 12px; font-size: .74rem; font-weight: 600; text-align: center; padding: 6px 10px; border-radius: 10px; background: rgba(255,255,255,.8); color: var(--ink); }
.sc-status.warn { background: #fde7ef; color: #b0386a; }
</style>
