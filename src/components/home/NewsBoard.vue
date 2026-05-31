<template>
  <div class="news">
    <div class="news-head">📢 กระดานข่าว</div>
    <div v-if="loading" class="news-empty">กำลังโหลด…</div>
    <div v-else-if="!items.length" class="news-empty">ยังไม่มีข่าว</div>
    <ul v-else class="news-list">
      <li v-for="n in items" :key="n.id" class="news-item">
        <span class="news-icon">{{ n.icon || '📢' }}</span>
        <div class="news-body">
          <div class="news-msg">{{ n.msg }}</div>
          <div class="news-time">{{ fmt(n.ts) }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../../firebase/config.js'

const items = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const snap = await getDocs(query(collection(db, 'news'), orderBy('ts', 'desc'), limit(10)))
    items.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('[news]', e)
  } finally {
    loading.value = false
  }
})

function fmt(ts) {
  const d = ts?.toDate ? ts.toDate() : null
  return d ? d.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : ''
}
</script>

<style scoped>
.news { background: #fff; border: 1px solid var(--border, #efe7fb); border-radius: 16px; padding: 14px; margin-bottom: 14px; box-shadow: 0 2px 10px rgba(170,140,210,.1); }
.news-head { font-weight: 800; font-size: .95rem; margin-bottom: 10px; }
.news-empty { font-size: .74rem; color: rgba(0,0,0,.4); text-align: center; padding: 6px 0; }
.news-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; max-height: 240px; overflow-y: auto; }
.news-item { display: flex; gap: 10px; align-items: flex-start; padding-bottom: 8px; border-bottom: 1px solid rgba(0,0,0,.05); }
.news-item:last-child { border-bottom: none; padding-bottom: 0; }
.news-icon { font-size: 1.2rem; flex-shrink: 0; }
.news-body { flex: 1; min-width: 0; }
.news-msg { font-size: .8rem; color: rgba(0,0,0,.75); line-height: 1.4; word-break: break-word; }
.news-time { font-size: .6rem; color: rgba(0,0,0,.4); margin-top: 2px; }
</style>
