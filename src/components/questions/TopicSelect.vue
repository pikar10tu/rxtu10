<template>
  <div>
    <select class="ts-input" :value="modelValue || ''" @change="onSelect">
      <option value="">— ไม่ระบุหมวด —</option>
      <!-- ค่าเดิมที่ไม่อยู่ใน list (ข้อเก่าพิมพ์อิสระ) ยังแสดง/คงค่าได้ -->
      <option v-if="modelValue && !topics.includes(modelValue)" :value="modelValue">{{ modelValue }}</option>
      <option v-for="t in topics" :key="t" :value="t">{{ t }}</option>
      <option value="__add">➕ เพิ่มหัวข้อใหม่…</option>
    </select>
    <div v-if="adding" class="ts-add">
      <input v-model="newName" :maxlength="LIMITS.category" class="ts-input" placeholder="ชื่อหัวข้อใหม่ เช่น ยาปฏิชีวนะ" @keydown.enter.prevent="confirmAdd" />
      <button type="button" class="ts-btn" :disabled="busy || !newName.trim()" @click="confirmAdd">เพิ่ม</button>
      <button type="button" class="ts-btn ts-cancel" @click="adding = false; newName = ''">ยกเลิก</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTopics } from '../../composables/useTopics.js'
import { useToast } from '../../composables/useToast.js'
import { LIMITS } from '../../utils/text.js'

const props = defineProps({ modelValue: { type: String, default: null } })
const emit = defineEmits(['update:modelValue'])
const { topics, loadTopics, addTopic } = useTopics()
const { toast } = useToast()
const adding = ref(false)
const newName = ref('')
const busy = ref(false)

onMounted(loadTopics)

function onSelect(e) {
  const v = e.target.value
  if (v === '__add') {
    adding.value = true
    e.target.value = props.modelValue || ''   // ไม่ให้ "__add" ค้างเป็นค่าใน select
    return
  }
  emit('update:modelValue', v || null)
}

async function confirmAdd() {
  if (busy.value) return
  busy.value = true
  try {
    const name = await addTopic(newName.value)
    if (name) { emit('update:modelValue', name); adding.value = false; newName.value = '' }
    else toast('ชื่อหัวข้อใช้ไม่ได้ ลองพิมพ์ใหม่', 'error')   // cleanText strip จนว่าง
  } catch (e) { console.error('[topic add]', e); toast('เพิ่มหัวข้อไม่สำเร็จ', 'error') }
  finally { busy.value = false }
}
</script>

<style scoped>
.ts-input { width: 100%; box-sizing: border-box; border: 2px solid var(--ink); border-radius: 10px; padding: 9px 11px; font-family: inherit; font-size: .82rem; background: #fff; }
.ts-input:focus { outline: none; box-shadow: var(--pop); }
.ts-add { display: flex; gap: 6px; margin-top: 6px; }
.ts-add .ts-input { flex: 1; }
.ts-btn { flex-shrink: 0; border: 2px solid var(--ink); border-radius: 9px; padding: 6px 12px; font-family: inherit; font-size: .75rem; font-weight: 800; background: var(--primary); color: #fff; cursor: pointer; }
.ts-btn:disabled { background: #cbd5e1; cursor: default; }
.ts-cancel { background: #fff; color: var(--ink); }
</style>
