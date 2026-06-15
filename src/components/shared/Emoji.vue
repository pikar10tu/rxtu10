<!--
  <Emoji> — render emoji เป็นรูป Twemoji (เหมือนกันทุกเครื่อง)
  ถ้าโหลดรูปไม่ได้ (ออฟไลน์/CDN ล่ม) fallback กลับเป็น emoji ของเครื่องอัตโนมัติ
  ใช้แทน {{ pet.emoji }} ได้เลย เช่น  <Emoji :char="pet.emoji" />
  ขนาดอิง 1em → ใส่ font-size ที่ container เดิมได้ตามปกติ
-->
<template>
  <img
    v-if="!failed && url"
    :src="url"
    :alt="char"
    class="twemoji"
    draggable="false"
    loading="lazy"
    @error="failed = true"
  />
  <span v-else class="twemoji-fallback">{{ char }}</span>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { twemojiUrl } from '../../utils/emoji.js'

const props = defineProps({ char: { type: String, default: '' } })
const failed = ref(false)
const url = computed(() => twemojiUrl(props.char))
// เปลี่ยน emoji แล้วรีเซ็ตสถานะ error
watch(() => props.char, () => { failed.value = false })
</script>

<style scoped>
.twemoji {
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
  object-fit: contain;
  display: inline-block;
}
.twemoji-fallback { display: inline-block; }
</style>
