<template>
  <div class="sl">
    <div class="sl-count">{{ SUMMARIES.length }} เรื่องจากเพื่อน RxTU10 · อ่านได้แล้ว {{ readyCount }} · ที่เหลืออยู่ระหว่างดำเนินการ</div>
    <input v-model="q" class="sl-search" placeholder="ค้นหาโรค เช่น gout, เบาหวาน, asthma" aria-label="ค้นหาสรุป">
    <div class="sl-chips" role="group" aria-label="กรองตามระบบ">
      <button :class="{ on: sys === 'all' }" @click="sys = 'all'">ทั้งหมด</button>
      <button v-for="s in SYSTEMS" :key="s.key" :class="{ on: sys === s.key }" @click="sys = s.key">{{ s.n }}. {{ s.th }}</button>
    </div>
    <section v-for="g in groups" :key="g.key" class="sl-sys">
      <h3>{{ g.n }}. {{ g.th }} <span>{{ g.items.length }} เรื่อง</span></h3>
      <component :is="it.ready ? 'router-link' : 'div'" v-for="it in g.items" :key="it.id"
        :to="it.ready ? `/study/summary/${it.id}` : undefined" class="sl-item" :class="{ off: !it.ready }">
        <span class="sl-t">{{ it.title }}</span>
        <span class="sl-tags">
          <span v-if="!it.ready" class="pill soon">กำลังดำเนินการ</span>
          <span class="pill" :class="it.final ? 'ok' : 'wait'">{{ it.final ? 'ตรวจแล้ว' : 'รอตรวจ' }}</span>
        </span>
        <span class="sl-by">{{ it.authors.length ? 'โดย ' + it.authors.join(', ') : 'ยังไม่ระบุผู้จัดทำ' }}</span>
      </component>
    </section>
    <div v-if="!groups.length" class="sl-empty">ไม่พบเรื่องที่ค้นหา</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { SUMMARIES, SYSTEMS } from '../../data/summaryIndex.js'

const q = ref('')
const sys = ref('all')
const readyCount = SUMMARIES.filter(s => s.ready).length
const groups = computed(() => {
  const term = q.value.trim().toLowerCase()
  return SYSTEMS.filter(s => sys.value === 'all' || sys.value === s.key).map(s => ({
    ...s,
    items: SUMMARIES.filter(x => x.sys === s.key && (!term || `${x.title} ${s.th} ${x.authors.join(' ')}`.toLowerCase().includes(term)))
      .sort((a, b) => b.ready - a.ready),
  })).filter(g => g.items.length)
})
</script>

<style scoped>
.sl-count { font-size: .8rem; color: var(--muted); margin-bottom: 8px; }
.sl-search { width: 100%; padding: 10px 12px; border: var(--bw) solid var(--line); border-radius: 12px; font: inherit; background: var(--surface); }
.sl-chips { display: flex; gap: 6px; overflow-x: auto; padding: 8px 0; scrollbar-width: none; }
.sl-chips button { flex: none; border: var(--bw) solid var(--line); background: var(--surface); border-radius: 999px; padding: 5px 12px; font: inherit; font-size: .8rem; white-space: nowrap; cursor: pointer; }
.sl-chips button.on { background: var(--primary); border-color: var(--primary); color: #fff; }
.sl-sys { margin-top: 14px; }
.sl-sys h3 { font-size: .9rem; color: var(--muted); margin: 0 0 6px; }
.sl-sys h3 span { font-weight: 400; font-size: .75rem; }
.sl-item { display: grid; grid-template-columns: 1fr auto; gap: 2px 8px; align-items: center; padding: 10px 12px; margin-bottom: 6px; background: var(--surface); border: var(--bw) solid var(--line); border-radius: 12px; text-decoration: none; color: inherit; }
.sl-item.off { opacity: .55; }
.sl-t { font-weight: 600; }
.sl-tags { grid-row: 1 / 3; grid-column: 2; display: flex; flex-direction: column; gap: 3px; align-items: flex-end; }
.sl-by { font-size: .75rem; color: var(--muted); }
.pill { font-size: .7rem; border-radius: 999px; padding: 1px 8px; font-weight: 600; white-space: nowrap; }
.pill.ok { background: var(--mint-light); color: var(--mint); }
.pill.wait { background: #fff3d6; color: #a06a00; }
.pill.soon { background: var(--bg); color: var(--muted); font-weight: 400; }
.sl-empty { text-align: center; color: var(--muted); padding: 20px; }
</style>
