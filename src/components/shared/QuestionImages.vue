<template>
  <!-- รูปประกอบโจทย์ (ตารางแล็บ โครงสร้างเคมี กราฟ) — กดรูปเพื่อขยายเต็มจอ -->
  <div v-if="list.length" class="qimg">
    <img
      v-for="src in list" :key="src" :src="src" alt="รูปประกอบโจทย์"
      loading="lazy" decoding="async" @click="zoom = src"
    />
    <Teleport to="body">
      <div v-if="zoom" class="qimg-zoom" @click="zoom = null">
        <img :src="zoom" alt="รูปประกอบโจทย์ (ขยาย)" />
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { questionImages } from '../../utils/questionImages.js'

const props = defineProps({ question: { type: Object, default: null } })
const list = computed(() => questionImages(props.question))
const zoom = ref(null)
</script>

<style scoped>
.qimg { display: flex; flex-direction: column; gap: 8px; margin: 8px 0 12px; }
.qimg img {
  max-width: 100%; height: auto; border-radius: 10px; background: #fff;
  border: 1px solid rgba(0, 0, 0, .08); cursor: zoom-in;
}
.qimg-zoom {
  position: fixed; inset: 0; z-index: 9999; background: rgba(0, 0, 0, .85);
  display: flex; align-items: center; justify-content: center; padding: 12px; cursor: zoom-out;
  overflow: auto;
}
.qimg-zoom img { max-width: 100%; max-height: 100%; background: #fff; border-radius: 8px; }
</style>
