<!-- พื้นการ์ดโปรไฟล์จากร้านตกแต่ง — ชั้นพื้นหลังเต็มกล่องแม่ (แม่ต้อง position: relative + overflow: hidden)
     เนื้อหาของแม่ต้องอยู่เหนือชั้นนี้ (position: relative; z-index: 1) · emit dark ให้แม่เปลี่ยนสีตัวอักษร -->
<template>
  <div v-if="item" class="cz-bgl" :class="'cz-' + item.id" aria-hidden="true">
    <template v-if="item.fall"><span v-for="i in 8" :key="i" class="cz-fall" :style="drop(i)"><Emoji :char="item.fall" /></span></template>
    <template v-if="item.rise"><span v-for="i in 7" :key="i" class="cz-rise" :style="drop(i)"><Emoji :char="item.rise" /></span></template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Emoji from '../shared/Emoji.vue'
import { getCosmetic } from '../../data/cosmetics.js'

const props = defineProps({ id: { type: String, default: null } })
const item = computed(() => { const c = getCosmetic(props.id); return c && c.kind === 'g' ? c : null })
const drop = (i) => ({ left: `${(i * 97) % 100}%`, animationDuration: `${5 + (i % 4) * 1.5}s`, animationDelay: `-${i * 1.3}s` })
</script>

<style scoped>
.cz-bgl { position: absolute; inset: 0; z-index: 0; overflow: hidden; border-radius: inherit; pointer-events: none; }
</style>
