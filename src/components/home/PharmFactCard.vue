<!-- เกร็ดความรู้เภสัชประจำวัน (หน้า Home · user ขอ 13 พ.ย. 2026 แทนสถิติเว็บ)
     tile = ช่องเล็กในแถวประจำวันสนุกๆ · ไม่ใส่ = การ์ดเต็มกว้าง · กดแล้วเปิดอ่านเต็ม + ปุ่มสุ่ม · เลข # = ลำดับในไฟล์ (ตายตัว ห้ามแทรกกลาง) -->
<template>
  <button v-if="tile" type="button" class="ft pf-tile" @click="openSheet">
    <span class="ft-em"><Emoji char="💡" /></span>
    <b>เกร็ดความรู้ #{{ todayIdx + 1 }}</b>
    <small>{{ today.t }}</small>
  </button>
  <button v-else type="button" class="pf-card" @click="openSheet">
    <span class="pf-em"><Emoji char="💡" /></span>
    <span class="pf-t"><small>เกร็ดความรู้ #{{ todayIdx + 1 }}</small><b>{{ today.t }}</b></span>
    <span class="pf-go">›</span>
  </button>

  <BottomSheet :open="open" icon="💡" title="เกร็ดความรู้เภสัช" @update:open="open = $event">
    <div class="pf-body">
      <div class="pf-no">เกร็ดความรู้ #{{ idx + 1 }}</div>
      <div class="pf-h">{{ shown.t }}</div>
      <p class="pf-p">{{ shown.b }}</p>
      <div v-if="reporting" class="pf-rep">
        <textarea v-model="repText" :maxlength="LIMITS.report" rows="3" class="pf-rep-in" placeholder="ผิดตรงไหน ควรแก้เป็นอะไร (ใส่แหล่งอ้างอิงได้ยิ่งดี)" aria-label="รายละเอียดข้อมูลที่ผิด"></textarea>
        <div class="pf-rep-act">
          <button type="button" class="pf-mini" @click="reporting = false">ยกเลิก</button>
          <button type="button" class="pf-mini pf-send" :disabled="!repText.trim() || busy" @click="sendReport">{{ busy ? 'กำลังส่ง…' : 'ส่ง' }}</button>
        </div>
      </div>
      <div v-else class="pf-tools">
        <button type="button" class="pf-mini" :disabled="busy || sharedToday" @click="share"><Emoji char="📣" /> {{ sharedToday ? 'วันนี้แชร์แล้ว' : 'แชร์เข้ากระดานรุ่น' }}</button>
        <button type="button" class="pf-mini pf-flag" @click="reporting = true; repText = ''"><Emoji char="🚩" /> แจ้งข้อมูลผิด</button>
      </div>
      <div class="pf-foot">
        <button type="button" class="pf-next" @click="roll"><Emoji char="🎲" /> สุ่มเรื่องอื่น</button>
      </div>
    </div>
  </BottomSheet>
</template>

<script setup>
import { ref, computed } from 'vue'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config.js'
import { useAuthStore } from '../../stores/auth.js'
import { useToast } from '../../composables/useToast.js'
import { useNewsPost } from '../../composables/useNewsPost.js'
import { cleanText, LIMITS } from '../../utils/text.js'
import Emoji from '../shared/Emoji.vue'
import BottomSheet from '../shared/BottomSheet.vue'
import { PHARM_FACTS } from '../../data/pharmFacts.js'
import { dayKey } from '../../utils/dailyChallenge.js'

defineProps({ tile: { type: Boolean, default: false } })

// สุ่มใหม่ทุกครั้งที่เข้าหน้า (user ขอ 13 พ.ย. — เดิมวันละเรื่อง เข้ากี่รอบก็เรื่องเดิม)
const todayIdx = Math.floor(Math.random() * PHARM_FACTS.length)
const today = PHARM_FACTS[todayIdx]
const open = ref(false)
const idx = ref(todayIdx)
const shown = computed(() => PHARM_FACTS[idx.value])
function openSheet() { idx.value = todayIdx; reporting.value = false; open.value = true }

const auth = useAuthStore()
const { toast } = useToast()
const busy = ref(false)

// ── แจ้งข้อมูลผิด → drugReports (การ์ดรายงานในแอดมิน แท็บข้อสอบ) · factNo = เลข # ไว้ตามแก้ ──
const reporting = ref(false)
const repText = ref('')
async function sendReport() {
  const note = cleanText(repText.value, LIMITS.report)
  if (!note || busy.value) return
  busy.value = true
  try {
    await addDoc(collection(db, 'drugReports'), {
      drug: `💡 เกร็ดความรู้ #${idx.value + 1}`, currentClass: shown.value.t, factNo: idx.value + 1,
      note, reporterUid: auth.currentUser?.uid || null,
      reporterName: auth.userData?.nickname || auth.userData?.name || null,
      status: 'open', ts: serverTimestamp(),
    })
    reporting.value = false
    toast('ส่งแล้ว ขอบคุณที่ช่วยตรวจ 🙏', 'success')
  } catch (e) { console.error('[factReport]', e); toast('ส่งไม่สำเร็จ', 'error') } finally { busy.value = false }
}

// ── แชร์เข้ากระดานข่าวรุ่น — วันละครั้งต่อเครื่อง (เลนข่าวไม่มีเพดานต่อคน กันกระดานรก) ──
const SHARE_KEY = 'rxtu10.factShareDay'
const readShare = () => { try { return localStorage.getItem(SHARE_KEY) } catch { return null } }
const sharedDay = ref(readShare())
const sharedToday = computed(() => sharedDay.value === dayKey())
const { postNews, myName } = useNewsPost()
async function share() {
  if (busy.value || sharedToday.value) return
  busy.value = true
  const n = idx.value + 1
  const ok = await postNews({ type: 'fact', icon: '💡', msg: `${myName()} แชร์เกร็ดความรู้ #${n}: ${shown.value.t}` })
  busy.value = false
  if (!ok) { toast('แชร์ไม่สำเร็จ', 'error'); return }
  sharedDay.value = dayKey()
  try { localStorage.setItem(SHARE_KEY, sharedDay.value) } catch { /* ไม่เป็นไร */ }
  toast('แชร์เข้ากระดานรุ่นแล้ว', 'success')
}
// สุ่มเรื่องอื่น — ไม่ซ้ำกับ 10 เรื่องล่าสุดที่เพิ่งเห็นในรอบนี้
const recent = []
function roll() {
  recent.push(idx.value); if (recent.length > 10) recent.shift()
  let i
  do { i = Math.floor(Math.random() * PHARM_FACTS.length) } while (recent.includes(i) && PHARM_FACTS.length > recent.length)
  idx.value = i
}
</script>

<style scoped>
.ft { font: inherit; display: flex; flex-direction: column; align-items: flex-start; gap: 3px; min-width: 0; height: 100%; box-sizing: border-box; padding: 10px; border-radius: 14px; border: var(--bw) solid var(--line); box-shadow: var(--pop); text-align: left; cursor: pointer; color: var(--ink); }
.ft-em { font-size: 1.35rem; line-height: 1; }
.ft b { font-size: .84rem; }
.ft small { font-size: .7rem; color: var(--muted); line-height: 1.3; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.pf-tile { background: var(--mint-light); }
.pf-card { font: inherit; width: 100%; display: flex; align-items: center; gap: 12px; text-align: left; cursor: pointer; margin-bottom: 12px; padding: 12px 14px; border-radius: 16px; border: var(--bw) solid var(--line); background: var(--mint-light); box-shadow: var(--pop); color: var(--ink); }
.pf-em { font-size: 1.5rem; }
.pf-t { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.pf-t small { font-size: .72rem; color: var(--muted); }
.pf-t b { font-size: .9rem; }
.pf-go { font-size: 1.3rem; color: var(--muted); }
.ft:focus-visible, .pf-card:focus-visible, .pf-next:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.pf-body { padding: 4px 2px 8px; }
.pf-no { font-size: .74rem; font-weight: 800; color: var(--primary-dark); margin-bottom: 2px; }
.pf-h { font-size: 1rem; font-weight: 800; color: var(--ink); margin-bottom: 8px; }
.pf-p { font-size: .88rem; line-height: 1.7; color: var(--ink); margin: 0 0 14px; }
.pf-tools { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.pf-mini { border: var(--bw) solid var(--line); background: #fff; border-radius: 10px; padding: 7px 11px; font: inherit; font-size: .78rem; font-weight: 700; color: var(--ink); cursor: pointer; }
.pf-mini:disabled { opacity: .55; cursor: default; }
.pf-mini:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.pf-flag { color: #dc2626; }
.pf-rep { margin-bottom: 12px; }
.pf-rep-in { width: 100%; box-sizing: border-box; border: var(--bw) solid var(--line); border-radius: 12px; padding: 9px 11px; font: inherit; font-size: .84rem; resize: vertical; }
.pf-rep-act { display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px; }
.pf-send { background: #ef4444; color: #fff; }
.pf-foot { display: flex; justify-content: flex-end; }
.pf-next { border: var(--bw) solid var(--line); background: var(--primary); color: #fff; border-radius: 11px; padding: 8px 14px; font: inherit; font-size: .84rem; font-weight: 800; cursor: pointer; }
</style>
