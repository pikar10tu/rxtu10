<template>
  <!-- คอมเม้นใต้แถวฐาน · เรียงตามใจ · ปักหมุด (คอมเม้นอาจารย์) อยู่บนสุด -->
  <div class="sc">
    <div v-if="!items.length" class="sc-empty">ยังไม่มีใครเขียน — แชร์ทริกฐานนี้เป็นคนแรกเลย</div>
    <div v-for="c in items" :key="c.id" class="sc-item" :class="{ pin: c.pinned }">
      <div class="sc-text">{{ c.text }}</div>
      <div class="sc-meta">
        <span class="sc-name">{{ c.pinned ? '📌 ' : '' }}{{ c.name || 'ไม่ระบุชื่อ' }}</span>
        <button v-if="auth.isAdmin && c.anon" class="sc-link" @click="reveal(c)">{{ who[c.id] || 'ใครเขียน?' }}</button>
        <button v-if="mineIds.has(c.id) || auth.isAdmin" class="sc-link" @click="del(c)">ลบ</button>
        <button class="sc-like" :class="{ on: liked(c) }" @click="toggleMockLike(c, uid)">
          {{ liked(c) ? '❤️' : '🤍' }} {{ Object.keys(c.likes || {}).length || '' }}
        </button>
      </div>
    </div>

    <form class="sc-form" @submit.prevent="send">
      <textarea v-model="text" :maxlength="COMMENT_MAX" rows="2" placeholder="ทริก จุดที่โดนหัก หรือสิ่งที่อยากบอกเพื่อน…" />
      <div class="sc-row">
        <label class="sc-anon"><input v-model="anon" type="checkbox" /> ไม่ระบุชื่อ</label>
        <small class="sc-count">{{ text.length }}/{{ COMMENT_MAX }}</small>
        <button class="sc-send" :disabled="!text.trim() || busy">{{ busy ? 'กำลังส่ง…' : 'ส่ง' }}</button>
      </div>
      <div v-if="err" class="sc-err">{{ err }}</div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { useMockComments, commentsFor, addMockComment, toggleMockLike, deleteMockComment, whoWrote, stationKey, COMMENT_MAX } from '../../composables/useMockComments.js'

const props = defineProps({ station: { type: String, required: true } })
const auth = useAuthStore()
const { list, mineIds } = useMockComments()
const uid = computed(() => auth.currentUser?.uid)
const items = computed(() => (list.value, commentsFor(stationKey(props.station))))
const liked = c => !!c.likes?.[uid.value]

const text = ref('')
const anon = ref(false)
const busy = ref(false)
const err = ref('')
const who = reactive({})

async function send() {
  if (!text.value.trim() || busy.value) return
  busy.value = true; err.value = ''
  try {
    await addMockComment({ uid: uid.value, nickname: auth.userData?.nickname, station: props.station, text: text.value, anon: anon.value })
    text.value = ''
  } catch (e) { console.error(e); err.value = 'ส่งไม่สำเร็จ ลองใหม่อีกครั้งนะ' }
  busy.value = false
}
async function del(c) {
  try { await deleteMockComment(c, mineIds.value.has(c.id) ? uid.value : null) } catch (e) { console.error(e); err.value = 'ลบไม่สำเร็จ' }
}
async function reveal(c) { who[c.id] = await whoWrote(c.id).catch(() => '?') }
</script>

<style scoped>
.sc { margin-top: 8px; padding: 10px; border-radius: 12px; background: #f6f9fc; display: grid; gap: 8px; }
.sc-empty { font-size: .78rem; color: var(--muted); text-align: center; padding: 4px 0; }
.sc-item { background: var(--surface); border: var(--bw) solid var(--line); border-radius: 12px; padding: 8px 10px; }
.sc-item.pin { border-color: #f59e0b; background: #fffbeb; }
.sc-text { font-size: .85rem; color: var(--ink); white-space: pre-wrap; word-break: break-word; line-height: 1.45; }
.sc-meta { display: flex; align-items: center; gap: 10px; margin-top: 4px; font-size: .74rem; color: var(--muted); }
.sc-name { font-weight: 600; }
.sc-link { font: inherit; background: none; border: 0; padding: 0; color: var(--muted); text-decoration: underline; }
.sc-like { margin-left: auto; font: inherit; font-size: .8rem; background: none; border: var(--bw) solid var(--line); border-radius: 999px; padding: 1px 9px; color: var(--ink); min-width: 44px; }
.sc-like.on { border-color: #fda4af; background: #fff1f2; }
.sc-form textarea { width: 100%; box-sizing: border-box; font: inherit; font-size: .85rem; border: var(--bw) solid var(--line); border-radius: 10px; padding: 7px 9px; resize: vertical; background: var(--surface); color: var(--ink); }
.sc-row { display: flex; align-items: center; gap: 10px; margin-top: 5px; }
.sc-anon { font-size: .78rem; color: var(--muted); display: flex; align-items: center; gap: 4px; }
.sc-count { font-size: .7rem; color: var(--muted); margin-left: auto; }
.sc-send { font: inherit; font-size: .8rem; font-weight: 700; border: 0; border-radius: 999px; padding: 5px 16px; background: var(--primary); color: #fff; }
.sc-send:disabled { opacity: .45; }
.sc-err { font-size: .76rem; color: #b91c1c; margin-top: 4px; }
</style>
