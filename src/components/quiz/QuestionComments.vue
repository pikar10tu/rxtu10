<template>
  <!-- 💬 ความเห็นเพื่อนต่อข้อ — แผ่นเลื่อนขึ้น (user เคาะแบบ B 18 พ.ย.) · เรียงตามใจ · ปักหมุดอยู่บนสุด -->
  <BottomSheet :open="open" icon="💬" title="ความเห็นเพื่อน" @update:open="$emit('update:open', $event)">
    <div class="qc">
      <div v-if="!items.length" class="qc-empty">ยังไม่มีใครคอมเม้นข้อนี้<br>เป็นคนแรกที่แชร์วิธีคิดเลย</div>
      <div v-for="c in items" :key="c.id" class="qc-item" :class="{ pin: c.pinned }">
        <div class="qc-head">
          <span class="qc-name">{{ c.name || 'ไม่ระบุชื่อ' }}</span>
          <span v-if="c.pinned" class="qc-pin"><Emoji char="📌" /> ปักหมุด</span>
          <small class="qc-ago">{{ ago(c) }}</small>
        </div>
        <div class="qc-text">{{ c.text }}</div>
        <div class="qc-foot">
          <button class="qc-like" :class="{ on: liked(c) }" :aria-pressed="liked(c)" @click="toggleQLike(c, uid)">
            {{ liked(c) ? '❤️' : '🤍' }} {{ Object.keys(c.likes || {}).length || '' }}
          </button>
          <button v-if="auth.isAdmin && c.anon" class="qc-link" @click="reveal(c)">{{ who[c.id] || 'ใครเขียน?' }}</button>
          <button v-if="auth.isAdmin" class="qc-link" @click="pin(c)">{{ c.pinned ? 'เลิกปัก' : 'ปักหมุด' }}</button>
          <button v-if="mineIds.has(c.id) || auth.isAdmin" class="qc-link" @click="del(c)">ลบ</button>
        </div>
      </div>

      <form class="qc-form" @submit.prevent="send">
        <textarea
          id="qc-text" v-model="text" :maxlength="QCOMMENT_MAX" rows="3"
          aria-label="เขียนความเห็น" placeholder="แชร์วิธีคิด ทริกจำ หรือความเห็นเกี่ยวกับข้อนี้…"
        />
        <div class="qc-row">
          <label class="qc-anon"><input id="qc-anon" v-model="anon" type="checkbox" /> ไม่ระบุชื่อ</label>
          <small class="qc-count">{{ text.length }}/{{ QCOMMENT_MAX }}</small>
          <button class="qc-send" :disabled="!text.trim() || busy">{{ busy ? 'กำลังส่ง…' : 'ส่ง' }}</button>
        </div>
        <div class="qc-hint">ถ้าเฉลยผิดหรือข้อมูลเก่า กด 🚩 แจ้งข้อผิด จะได้แก้ให้ทุกคน</div>
        <div v-if="err" class="qc-err">{{ err }}</div>
      </form>
    </div>
  </BottomSheet>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import BottomSheet from '../shared/BottomSheet.vue'
import Emoji from '../shared/Emoji.vue'
import { useAuthStore } from '../../stores/auth.js'
import { useQComments, qCommentsFor, addQComment, toggleQLike, deleteQComment, toggleQPin, whoWroteQ, QCOMMENT_MAX } from '../../composables/useQComments.js'

const props = defineProps({ open: Boolean, qid: { type: String, default: '' } })
defineEmits(['update:open'])
const auth = useAuthStore()
const { byQ, mineIds } = useQComments()
const uid = computed(() => auth.currentUser?.uid)
const items = computed(() => (byQ.value, qCommentsFor(props.qid)))
const liked = c => !!c.likes?.[uid.value]

const text = ref('')
const anon = ref(false)
const busy = ref(false)
const err = ref('')
const who = reactive({})
watch(() => props.qid, () => { text.value = ''; err.value = '' })   // ข้อใหม่ = ร่างใหม่

function ago(c) {
  const s = c.createdAt?.seconds
  if (!s) return ''
  const m = Math.floor((Date.now() / 1000 - s) / 60)
  if (m < 1) return 'เมื่อกี้'
  if (m < 60) return `${m} นาที`
  if (m < 1440) return `${Math.floor(m / 60)} ชม.`
  return `${Math.floor(m / 1440)} วัน`
}
async function send() {
  if (!text.value.trim() || busy.value) return
  busy.value = true; err.value = ''
  try {
    await addQComment({ uid: uid.value, nickname: auth.userData?.nickname, qid: props.qid, text: text.value, anon: anon.value })
    text.value = ''
  } catch (e) { console.error(e); err.value = 'ส่งไม่สำเร็จ ลองใหม่อีกครั้งนะ' }
  busy.value = false
}
async function del(c) {
  try { await deleteQComment(c, mineIds.value.has(c.id) ? uid.value : null) } catch (e) { console.error(e); err.value = 'ลบไม่สำเร็จ' }
}
async function pin(c) {
  try { await toggleQPin(c) } catch (e) { console.error(e); err.value = 'ปักหมุดไม่สำเร็จ' }
}
async function reveal(c) { who[c.id] = await whoWroteQ(c.id).catch(() => '?') }
</script>

<style scoped>
.qc { display: grid; gap: 8px; }
.qc-empty { font-size: .8rem; color: var(--muted); text-align: center; padding: 10px 0; line-height: 1.6; }
.qc-item { background: var(--surface, #fff); border: var(--bw) solid var(--line); border-radius: 12px; padding: 9px 11px; }
.qc-item.pin { border-color: #f59e0b; background: #fffbeb; }
.qc-head { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: .76rem; }
.qc-name { font-weight: 700; color: var(--ink); }
.qc-pin { font-size: .7rem; color: #92400e; }
.qc-ago { font-size: .7rem; color: var(--muted); margin-left: auto; }
.qc-text { font-size: .85rem; color: var(--ink); white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.5; margin-top: 3px; }
.qc-foot { display: flex; align-items: center; gap: 12px; margin-top: 5px; }
.qc-like { font: inherit; font-size: .8rem; background: none; border: var(--bw) solid var(--line); border-radius: 999px; padding: 1px 10px; color: var(--ink); min-width: 46px; cursor: pointer; }
.qc-like.on { border-color: #fda4af; background: #fff1f2; }
.qc-link { font: inherit; font-size: .72rem; background: none; border: 0; padding: 0; color: var(--muted); text-decoration: underline; cursor: pointer; }
.qc-form { border-top: var(--bw) solid var(--line); padding-top: 10px; margin-top: 2px; }
.qc-form textarea { width: 100%; box-sizing: border-box; font: inherit; font-size: .85rem; border: var(--bw) solid var(--line); border-radius: 10px; padding: 8px 10px; resize: vertical; background: var(--surface, #fff); color: var(--ink); }
.qc-row { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
.qc-anon { font-size: .78rem; color: var(--muted); display: flex; align-items: center; gap: 4px; }
.qc-count { font-size: .7rem; color: var(--muted); margin-left: auto; }
.qc-send { font: inherit; font-size: .8rem; font-weight: 700; border: 0; border-radius: 999px; padding: 6px 18px; background: var(--primary); color: #fff; cursor: pointer; }
.qc-send:disabled { opacity: .45; cursor: default; }
.qc-hint { font-size: .7rem; color: var(--muted); margin-top: 6px; line-height: 1.5; }
.qc-err { font-size: .76rem; color: #b91c1c; margin-top: 4px; }
</style>
