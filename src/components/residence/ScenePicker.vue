<!-- 🏠 เลือกฉากบ้านที่จะโชว์ (20 พ.ย. 2026) — เลือกได้ทุกขั้นที่ผ่านมาแล้ว ขั้นที่ยังไม่ถึงล็อกไว้ให้เห็นเป็นเป้า
     เขียน residence.scene (null = ตามเลเวลปัจจุบัน) แล้วอัปแถว roster ให้เพื่อนเห็นฉากเดียวกัน -->
<template>
  <BottomSheet :open="open" icon="🏠" title="เลือกฉากบ้าน" @update:open="$emit('update:open', $event)">
    <p class="sp-hint">เลือกได้ทุกฉากที่เคยอยู่มาแล้ว เพื่อนจะเห็นฉากนี้ในการ์ดโปรไฟล์ของเรา</p>
    <div class="sp-grid">
      <button v-for="t in RESIDENCE_TIERS" :key="t.level" type="button" class="sp-item"
        :class="{ on: t.level === current }" :disabled="t.level > level || busy" :aria-pressed="t.level === current" @click="pick(t.level)">
        <span class="sp-thumb"><img :src="thumb(t.level)" :alt="t.tierName" width="180" height="100" /><b>{{ t.level }}</b><i v-if="t.level > level">🔒</i></span>
        <span class="sp-name">{{ t.tierName }}</span>
      </button>
    </div>
  </BottomSheet>
</template>

<script setup>
import { computed, ref } from 'vue'
import BottomSheet from '../shared/BottomSheet.vue'
import { RESIDENCE_TIERS, clampLevel, sceneOf } from '../../data/residence.js'
import { useAuthStore } from '../../stores/auth.js'
import { useToast } from '../../composables/useToast.js'
import { useRosterSync } from '../../composables/useRosterSync.js'

defineProps({ open: Boolean })
defineEmits(['update:open'])
const IMGS = import.meta.glob('../../assets/residence/res-*.png', { eager: true, import: 'default' })
const thumb = (n) => IMGS[`../../assets/residence/res-${String(n).padStart(2, '0')}.png`]
const auth = useAuthStore()
const { toast } = useToast()
const { syncRosterRow } = useRosterSync()
const level = computed(() => clampLevel(auth.userData?.residence?.level))
const current = computed(() => sceneOf(auth.userData?.residence))
const busy = ref(false)

async function pick(n) {
  if (n === current.value || n > level.value) return
  busy.value = true
  const scene = n === level.value ? null : n   // เลือกฉากปัจจุบัน = กลับไปตามเลเวล (อัปบ้านแล้วเปลี่ยนตาม)
  const ok = await auth.patchUser(
    { residence: { ...(auth.userData?.residence || {}), scene } },
    { 'residence.scene': scene },
  )
  busy.value = false
  if (ok) syncRosterRow()
  else toast('เปลี่ยนฉากไม่สำเร็จ ลองใหม่อีกครั้ง', 'error')
}
</script>

<style scoped>
.sp-hint { font-size: .76rem; color: var(--muted); margin: 0 0 10px; }
.sp-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.sp-item { display: flex; flex-direction: column; gap: 4px; padding: 4px; border: var(--bw) solid var(--line); border-radius: 12px; background: #fff; font: inherit; cursor: pointer; text-align: left; }
.sp-item.on { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent); }
.sp-item:disabled { cursor: not-allowed; }
.sp-item:disabled .sp-thumb img { filter: grayscale(1) brightness(.75); opacity: .5; }
.sp-thumb { position: relative; line-height: 0; }
.sp-thumb img { width: 100%; height: auto; image-rendering: pixelated; border-radius: 8px; }
.sp-thumb b { position: absolute; left: 4px; top: 4px; line-height: 1.3; font-size: .7rem; background: rgba(0,0,0,.55); color: #fff; border-radius: 6px; padding: 0 6px; }
.sp-thumb i { position: absolute; inset: 0; display: grid; place-items: center; font-style: normal; font-size: 1.2rem; }
.sp-name { font-size: .72rem; font-weight: 700; line-height: 1.3; padding: 0 2px 2px; }
</style>
