// ค้นหารวม ยา · เคส CC2 · สรุป — โหลด public/search-index.json ครั้งเดียวต่อการเปิดแอป (ไฟล์ static, 0 Firestore read)
// ใช้ร่วม: ปุ่ม 🔍 หน้าหลัก + ช่องค้นหา Study · ดู utils/searchIndex.js
import { ref, computed } from 'vue'
import { searchAll } from '../utils/searchIndex.js'

const index = ref(null)
let loading = null

export function loadSearchIndex() {
  if (index.value) return Promise.resolve(index.value)
  loading ||= fetch(import.meta.env.BASE_URL + 'search-index.json', { cache: 'no-cache' })
    .then(r => (r.ok ? r.json() : null))
    .then(j => (index.value = j))
    .catch(() => { loading = null; return null })
  return loading
}

export function useGlobalSearch(query) {
  loadSearchIndex()
  const results = computed(() => searchAll(index.value, query.value))
  const ready = computed(() => !!index.value)
  return { results, ready, index }
}
