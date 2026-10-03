<template>
  <div class="tab-content sv">
    <router-link to="/study?tab=sum" class="sv-back">‹ คลังสรุป</router-link>
    <div v-if="!meta || !meta.ready" class="sv-card">เรื่องนี้อยู่ระหว่างดำเนินการ</div>
    <template v-else>
      <header class="sv-card">
        <div class="sv-sys">{{ sysName }}</div>
        <h1>{{ meta.title }}</h1>
        <span class="pill" :class="reviewPill(meta).cls">{{ reviewPill(meta).text }}</span>
        <div class="sv-credit">
          <div><span>จัดทำโดย</span><b>{{ meta.authors.join(', ') || 'ยังไม่ระบุ' }}</b><i v-if="doc?.date"> · {{ doc.date }}</i></div>
          <div><span>ตรวจโดย</span><b v-if="meta.reviewers.length">{{ meta.reviewers.join(', ') }}</b><i v-else>ไม่มีคนตรวจ</i></div>
        </div>
        <div v-if="!meta.reviewers.length && !meta.final" class="sv-draft">สรุปนี้ไม่มีคนตรวจ อ่านแล้วเจอจุดผิดกด "แจ้งข้อมูลผิด" ท้ายหน้าได้เลย</div>
        <div class="sv-size">
          <span>ตัวหนังสือ</span>
          <button v-for="s in SIZES" :key="s[0]" :class="{ on: size === s[0] }" @click="setSize(s[0])">{{ s[1] }}</button>
        </div>
      </header>
      <nav v-if="doc" class="sv-toc">
        <a v-for="s in doc.sections" :key="s.id" :href="`#${s.id}`" @click.prevent="jump(s.id)">{{ s.t }}</a>
      </nav>
      <div v-if="!doc" class="sv-card">กำลังโหลด…</div>
      <article v-else class="sv-article" :style="{ fontSize: fontPx }" @click="onClick">
        <section v-for="s in doc.sections" :id="s.id" :key="s.id" class="sv-card">
          <h2>{{ s.t }}</h2>
          <div v-if="s.by" class="sv-secby">ส่วนนี้จัดทำโดย {{ s.by }}</div>
          <!-- html มาจากไฟล์ในรีโปที่เราแปลงเอง ไม่ใช่ข้อความจากผู้ใช้ -->
          <div v-html="withFigs(s.html)" />
        </section>
        <section class="sv-card sv-refs">
          <h2>อ้างอิง</h2>
          <ul><li v-for="r in doc.refs" :key="r">{{ r }}</li></ul>
        </section>
      </article>
      <section v-if="doc" class="sv-card sv-report">
        <button v-if="!repOpen" class="sv-rep-btn" @click="repOpen = true">⚠️ แจ้งข้อมูลผิด</button>
        <template v-else>
          <b>แจ้งข้อมูลผิดในสรุปนี้</b>
          <select v-model="repSec" aria-label="หัวข้อที่ผิด">
            <option value="">ทั้งเรื่อง / ไม่ระบุหัวข้อ</option>
            <option v-for="s in doc.sections" :key="s.id" :value="s.t">{{ s.t }}</option>
          </select>
          <textarea v-model="repText" rows="3" placeholder="ผิดตรงไหน ควรแก้เป็นอะไร" />
          <textarea v-model="repWhy" rows="2" placeholder="เหตุผล / แหล่งอ้างอิง เช่น guideline ปีไหน หน้าไหน" />
          <div class="sv-rep-act">
            <button @click="repOpen = false">ยกเลิก</button>
            <button class="go" :disabled="!repText.trim() || !repWhy.trim() || repBusy" @click="sendReport">ส่ง</button>
          </div>
        </template>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { summaryMeta, loadSummary, SYSTEMS, reviewPill } from '../data/summaryIndex.js'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from '../composables/useToast.js'
import { cleanText, LIMITS } from '../utils/text.js'

const route = useRoute()
const router = useRouter()
const meta = computed(() => summaryMeta(route.params.id))
const sysName = computed(() => { const s = SYSTEMS.find(x => x.key === meta.value?.sys); return s ? `${s.n}. ${s.th}` : '' })
const doc = ref(null)
watch(() => route.params.id, async id => { doc.value = null; if (summaryMeta(id)?.ready) doc.value = await loadSummary(id) }, { immediate: true })

const SIZES = [['s', 'เล็ก', 15], ['m', 'กลาง', 17], ['l', 'ใหญ่', 20]]
const size = ref((() => { try { return localStorage.getItem('rx-sum-size') || 'm' } catch { return 'm' } })())
const fontPx = computed(() => (SIZES.find(s => s[0] === size.value) || SIZES[1])[2] + 'px')
function setSize(s) { size.value = s; try { localStorage.setItem('rx-sum-size', s) } catch { /* private mode */ } }

const base = import.meta.env.BASE_URL
function withFigs(html) { return html.replace(/data-fig="([^"]+)"/g, (_, f) => `src="${base}summaries/${f}" loading="lazy"`) }
// แจ้งข้อมูลผิด → ใช้ collection `drugReports` เดียวกับแฟลชการ์ดตัวยา (แอดมินเห็นในแท็บรายงานเดิม ไม่ต้องแก้ rules)
const authStore = useAuthStore()
const { toast } = useToast()
const repOpen = ref(false)
const repSec = ref('')
const repText = ref('')
const repBusy = ref(false)
const repWhy = ref('')
watch(() => route.params.id, () => { repOpen.value = false; repSec.value = ''; repText.value = ''; repWhy.value = '' })
// เหตุผล/อ้างอิงบังคับ (user 3 ต.ค. 2026) — Claude เป็นคนตรวจแล้วแก้ไฟล์สรุปแทนวิชาการ ต้องมีหลักฐานให้เช็ค
async function sendReport() {
  const what = cleanText(repText.value, LIMITS.report)
  const why = cleanText(repWhy.value, LIMITS.report)
  if (!what || !why || repBusy.value || !meta.value) return
  const note = `${what}\n— เหตุผล: ${why}`
  repBusy.value = true
  try {
    await addDoc(collection(db, 'drugReports'), {
      drug: `📄 สรุป: ${meta.value.title}`,
      currentClass: repSec.value || 'ทั้งเรื่อง',
      summaryId: meta.value.id,
      note, what, why,
      reporterUid: authStore.currentUser?.uid || null,
      reporterName: authStore.userData?.nickname || authStore.userData?.name || null,
      status: 'open',
      ts: serverTimestamp(),
    })
    repOpen.value = false; repText.value = ''; repWhy.value = ''; repSec.value = ''
    toast('ส่งแล้ว ขอบคุณที่ช่วยตรวจ 🙏', 'success')
  } catch (e) {
    console.error('[summaryReport]', e)
    toast('ส่งไม่สำเร็จ', 'error')
  } finally {
    repBusy.value = false
  }
}
function jump(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
function onClick(e) {
  const a = e.target.closest('[data-calc]')
  if (a) { e.preventDefault(); router.push(a.dataset.calc === 'ped-dose' ? '/study/ped-dose' : '/study/crcl') }
}
</script>

<style scoped>
.sv-back { display: inline-block; color: var(--primary); text-decoration: none; padding: 4px 0 8px; }
.sv-card { background: var(--surface); border: var(--bw) solid var(--line); border-radius: 16px; padding: 14px 16px; margin-bottom: 12px; }
.sv-sys { font-size: .8rem; color: var(--muted); }
h1 { font-size: 1.5rem; margin: 2px 0 8px; }
.pill { font-size: .75rem; border-radius: 999px; padding: 2px 9px; font-weight: 600; }
.pill.ok { background: var(--mint-light); color: var(--mint); }
.pill.wait { background: #fff3d6; color: #a06a00; }
.pill.none { background: #f1f4f8; color: var(--muted); }
.sv-credit { display: grid; gap: 4px; margin: 10px 0 0; font-size: .9rem; }
.sv-credit span { display: inline-block; min-width: 70px; color: var(--muted); }
.sv-credit i { color: var(--muted); font-style: normal; }
.sv-draft { background: #fff3d6; color: #a06a00; border-radius: 10px; padding: 8px 12px; font-size: .85rem; margin-top: 8px; }
.sv-size { display: flex; gap: 6px; align-items: center; margin-top: 10px; font-size: .8rem; color: var(--muted); }
.sv-size button { border: var(--bw) solid var(--line); background: var(--bg); border-radius: 8px; padding: 3px 10px; font: inherit; cursor: pointer; }
.sv-size button.on { border-color: var(--primary); background: var(--primary-light); color: var(--primary-dark); }
.sv-toc { display: flex; gap: 6px; overflow-x: auto; padding: 4px 0 10px; scrollbar-width: none; position: sticky; top: 0; z-index: 2; background: var(--bg); }
.sv-toc a { flex: none; font-size: .8rem; color: inherit; text-decoration: none; border: var(--bw) solid var(--line); background: var(--surface); border-radius: 999px; padding: 4px 11px; white-space: nowrap; }
.sv-article { line-height: 1.75; }
.sv-article section { scroll-margin-top: 50px; }
.sv-article h2 { font-size: 1.2em; color: var(--primary-dark); margin: 4px 0 8px; }
.sv-secby { font-size: .8rem; color: var(--muted); margin-bottom: 6px; }
.sv-article :deep(h3) { font-size: 1.05em; margin: 14px 0 4px; }
.sv-article :deep(ul), .sv-article :deep(ol) { padding-left: 1.3em; margin: 4px 0; }
.sv-article :deep(mark) { background: #fff1a8; padding: 0 3px; border-radius: 3px; }
.sv-article :deep(.key) { background: var(--accent-light); border-radius: 12px; padding: 10px 14px; margin: 10px 0; }
.sv-article :deep(.key .k) { display: block; color: var(--accent); font-size: .85em; }
.sv-article :deep(.tbl) { overflow-x: auto; margin: 10px 0; border: var(--bw) solid var(--line); border-radius: 10px; }
.sv-article :deep(table) { border-collapse: collapse; width: 100%; min-width: 420px; font-size: .88em; line-height: 1.5; }
.sv-article :deep(th), .sv-article :deep(td) { border-bottom: 1px solid var(--line); padding: 7px 10px; text-align: left; vertical-align: top; }
.sv-article :deep(th) { background: var(--bg); }
.sv-article :deep(figure) { margin: 10px 0; }
.sv-article :deep(figure img) { max-width: 100%; border-radius: 10px; border: 1px solid var(--line); background: #fff; }
.sv-article :deep(figcaption) { font-size: .8em; color: var(--muted); margin-top: 4px; }
.sv-article :deep(.calc-link) { display: inline-block; border: 1px solid var(--primary); color: var(--primary-dark); background: var(--primary-light); border-radius: 999px; padding: 2px 12px; font-size: .85em; text-decoration: none; margin: 4px 0; }
.sv-article :deep(.kd) { display: grid; grid-template-columns: auto repeat(3, 1fr); gap: 3px; font-size: .8em; min-width: 420px; }
.sv-article :deep(.kd div) { padding: 6px; border-radius: 6px; }
.sv-article :deep(.kd .h), .sv-article :deep(.kd .r) { background: var(--bg); }
.sv-article :deep(.c1) { background: #cdeccf; } .sv-article :deep(.c2) { background: #fbefa6; }
.sv-article :deep(.c3) { background: #f8c98f; } .sv-article :deep(.c4) { background: #f2a3a3; }
.sv-article :deep(.steps) { display: grid; grid-template-columns: repeat(5, minmax(110px, 1fr)); gap: 6px; font-size: .8em; min-width: 600px; }
.sv-article :deep(.steps .s) { border-radius: 10px; padding: 8px; }
.sv-article :deep(.s1), .sv-article :deep(.s2) { background: #cdeccf; } .sv-article :deep(.s3) { background: #fbefa6; }
.sv-article :deep(.s4) { background: #f8c98f; } .sv-article :deep(.s5) { background: #f2a3a3; }
.sv-article :deep(.fig) { border: 1px dashed var(--line); border-radius: 10px; padding: 8px 12px; color: var(--muted); font-size: .85em; }
.sv-report { display: grid; gap: 8px; }
.sv-rep-btn { justify-self: start; border: var(--bw) solid var(--line); background: var(--bg); border-radius: 999px; padding: 6px 14px; font: inherit; font-size: .85rem; cursor: pointer; }
.sv-report select, .sv-report textarea { width: 100%; border: var(--bw) solid var(--line); border-radius: 10px; padding: 8px 10px; font: inherit; background: var(--bg); }
.sv-rep-act { display: flex; justify-content: flex-end; gap: 8px; }
.sv-rep-act button { border: var(--bw) solid var(--line); background: var(--bg); border-radius: 10px; padding: 6px 16px; font: inherit; cursor: pointer; }
.sv-rep-act .go { background: var(--primary); border-color: var(--primary); color: #fff; }
.sv-rep-act .go:disabled { opacity: .5; }
.sv-refs { font-size: .8rem; color: var(--muted); word-break: break-word; }
</style>
