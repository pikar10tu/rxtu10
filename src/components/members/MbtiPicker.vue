<!-- MBTI ของฉัน (หน้าฉัน) — แถวเดียว กดแล้วเปิดแผ่นเลือก (user 25 ต.ค. 2026: dropdown ในหน้าดูแปลก)
     ในแผ่น: 16 แบบแยก 4 กลุ่ม · แตะการ์ด = กางอ่าน + เลือก · ใครในรุ่นเป็นแบบไหน (แถว roster 0 read) · กด "บันทึก" ค่อยเขียน
     เลือกครั้งแรก = เควสครั้งเดียวได้เหรียญ · เพื่อนเห็นตอนกดเข้าการ์ดโปรไฟล์เท่านั้น -->
<template>
  <div id="mbti">
    <button class="mb-row" @click="openSheet">
      <span class="mb-row-ic"><Emoji char="🧠" /></span>
      <span class="mb-row-t">
        <b>MBTI ของฉัน</b>
        <small v-if="cur">{{ cur.code }} · {{ cur.name }}</small>
        <small v-else>ยังไม่ได้ตั้ง</small>
      </span>
      <span v-if="!auth.userData?.mbtiQuest" class="mb-row-quest">+{{ MBTI_QUEST_COINS.toLocaleString() }} <Emoji char="🪙" /></span>
      <span class="mb-row-go">{{ cur ? 'แก้ไข' : 'ตั้งเลย' }} ›</span>
    </button>

    <BottomSheet :open="open" @update:open="open = $event" icon="🧠" title="MBTI ทั้ง 16 แบบ">
      <div class="mb-all">
        <section v-for="(g, k) in MBTI_GROUPS" :key="k" class="mb-grp">
          <div class="mb-grp-h" :style="{ color: g.color }">{{ g.label }}</div>
          <div v-for="t in MBTI_TYPES.filter(x => x.group === k)" :key="t.code" :id="'mb-' + t.code" class="mb-type"
               :class="{ sel: pick === t.code, open: openCode === t.code }" :style="{ '--c': g.color }">
            <button class="mb-type-btn" :aria-expanded="openCode === t.code" @click="openCode = openCode === t.code ? null : t.code">
              <span class="mb-type-h">
                <Emoji :char="MBTI_ICON[t.code]" /> <b>{{ t.code }}</b> · {{ t.name }}
                <span v-if="t.code === cur?.code" class="mb-me">ของฉัน</span>
                <span class="mb-n">{{ (byType[t.code] || []).length }} คน</span>
                <span class="mb-chev">{{ openCode === t.code ? '▴' : '▾' }}</span>
              </span>
              <span class="mb-desc">{{ t.desc }}</span>
            </button>
            <div v-if="openCode === t.code" class="mb-more">
              <div v-if="MBTI_MORE[t.code]">{{ MBTI_MORE[t.code].about }}</div>
              <button class="mb-read" @click="readCode = t.code"><Emoji :char="MBTI_ICON[t.code]" /> อ่านแบบเต็ม ›</button>
              <div v-if="(byType[t.code] || []).length" class="mb-names">
                <span v-for="n in byType[t.code]" :key="n.uid" class="mb-name" :class="{ me: n.me }">{{ n.name }}</span>
              </div>
              <button class="mb-pick" :class="{ on: pick === t.code }" @click="pick = pick === t.code ? null : t.code">
                {{ pick === t.code ? '✓ เลือกแบบนี้แล้ว' : 'เลือกแบบนี้' }}
              </button>
            </div>
          </div>
        </section>
        <a class="mb-test" href="https://www.16personalities.com/th" target="_blank" rel="noopener">ยังไม่รู้ว่าเป็นแบบไหน? ลองทำแบบทดสอบ ›</a>
      </div>
      <!-- ปุ่มบันทึกติดล่าง — เขียนจริงตอนกดเท่านั้น -->
      <div class="mb-dock">
        <span class="mb-dock-t">{{ pick ? `เลือก ${pick}` : 'ไม่ระบุ' }}</span>
        <button v-if="pick" class="mb-clear" @click="pick = null">ล้าง</button>
        <button class="mb-save" :disabled="saving || pick === (cur?.code || null)" @click="save">บันทึก</button>
      </div>
    </BottomSheet>
    <MbtiCard :code="readCode" @close="readCode = null" />
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { increment } from 'firebase/firestore'
import Emoji from '../shared/Emoji.vue'
import BottomSheet from '../shared/BottomSheet.vue'
import { MBTI_GROUPS, MBTI_TYPES, MBTI_MORE, MBTI_ICON, mbtiOf, MBTI_QUEST_COINS } from '../../data/mbti.js'
import MbtiCard from './MbtiCard.vue'
import { useAuthStore } from '../../stores/auth.js'
import { useMembersStore } from '../../stores/members.js'
import { useToast } from '../../composables/useToast.js'
import { useRosterSync } from '../../composables/useRosterSync.js'

const auth = useAuthStore()
const members = useMembersStore()
const { toast } = useToast()
const { syncRosterRow } = useRosterSync()

const cur = computed(() => mbtiOf(auth.userData?.mbti))
const open = ref(false)
const openCode = ref(null)   // การ์ดที่กางอ่านอยู่ (ทีละใบ)
const pick = ref(null)       // ที่เลือกในแผ่น ยังไม่บันทึก
const saving = ref(false)
const readCode = ref(null)   // การ์ดอ่านเต็มที่เปิดอยู่

function openSheet() {
  pick.value = cur.value?.code || null
  openCode.value = cur.value?.code || null
  open.value = true
  // เปิดมาที่แบบของตัวเองเลย (ถ้าตั้งไว้แล้ว)
  if (cur.value) nextTick(() => document.getElementById('mb-' + cur.value.code)?.scrollIntoView({ block: 'center' }))
}

async function save() {
  const code = mbtiOf(pick.value)?.code || null
  // ⚠️ หยิบก่อน patchUser (CLAUDE.md ข้อ 9) — เควสครั้งเดียว: ตั้งครั้งแรกได้เหรียญ
  const firstTime = !!code && !auth.userData?.mbtiQuest
  saving.value = true
  const ok = await auth.patchUser(
    { mbti: code, ...(firstTime ? { mbtiQuest: true, coins: (auth.userData?.coins || 0) + MBTI_QUEST_COINS } : {}) },
    { mbti: code, ...(firstTime ? { mbtiQuest: true, coins: increment(MBTI_QUEST_COINS) } : {}) },
  )
  saving.value = false
  if (!ok) { toast('บันทึกไม่สำเร็จ', 'error'); return }
  toast(firstTime ? `บันทึกแล้ว รับ ${MBTI_QUEST_COINS.toLocaleString()} เหรียญ` : 'บันทึกแล้ว', 'success')
  open.value = false
  syncRosterRow()
}

// ใครในรุ่นเป็นแบบไหน — อ่านจากแถว roster ที่โหลดอยู่แล้ว (0 read เพิ่ม) · ตัวเองใช้ค่าล่าสุดในเครื่อง
const byType = computed(() => {
  const me = auth.currentUser?.uid
  const out = {}
  for (const [uid, r] of Object.entries(members.rosterRows || {})) {
    if (uid === me) continue
    const code = mbtiOf(r?.mb)?.code
    if (code) (out[code] ||= []).push({ uid, name: r.n || '?', me: false })
  }
  if (cur.value && me) (out[cur.value.code] ||= []).unshift({ uid: me, name: 'คุณ', me: true })
  return out
})
</script>

<style scoped>
.mb-row { font: inherit; width: 100%; display: flex; align-items: center; gap: 10px; text-align: left; margin-top: 14px; border: var(--bw) solid var(--line); border-radius: 14px; box-shadow: var(--pop); background: #fff; padding: 10px 12px; cursor: pointer; color: var(--ink); }
.mb-row-ic { font-size: 1.4rem; }
.mb-row-t { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.mb-row-t b { font-size: .88rem; }
.mb-row-t small { font-size: .76rem; color: var(--muted); }
.mb-row-quest { font-size: .74rem; font-weight: 800; color: #b45309; background: #fff7ed; border-radius: 999px; padding: 2px 8px; white-space: nowrap; }
.mb-row-go { font-size: .8rem; font-weight: 800; color: var(--primary); white-space: nowrap; }
.mb-all { display: flex; flex-direction: column; gap: 14px; padding-bottom: 76px; }
.mb-grp { display: flex; flex-direction: column; gap: 6px; }
.mb-grp-h { font-weight: 800; font-size: .9rem; }
.mb-type { border: var(--bw) solid var(--line); border-left: 4px solid var(--c); border-radius: 12px; padding: 8px 10px; background: #fff; }
.mb-type.sel { box-shadow: 0 0 0 2px var(--c); }
.mb-type-btn { all: unset; cursor: pointer; display: flex; flex-direction: column; width: 100%; }
.mb-type-h { font-size: .88rem; display: flex; gap: 4px; align-items: baseline; flex-wrap: wrap; }
.mb-me { font-size: .7rem; font-weight: 800; color: #fff; background: var(--c); border-radius: 999px; padding: 0 7px; }
.mb-n { margin-left: auto; font-size: .74rem; color: var(--muted); font-weight: 700; }
.mb-chev { font-size: .8rem; color: var(--muted); margin-left: 6px; }
.mb-desc { display: block; font-size: .78rem; color: var(--muted); margin-top: 2px; }
.mb-more { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--line); font-size: .8rem; line-height: 1.55; color: var(--ink); }
.mb-more b { display: block; font-size: .78rem; color: var(--c); }
.mb-names { display: flex; flex-wrap: wrap; gap: 4px; }
.mb-name { font-size: .74rem; background: #f6f2fb; border-radius: 999px; padding: 2px 8px; }
.mb-name.me { background: var(--c); color: #fff; font-weight: 700; }
.mb-read { font: inherit; font-size: .8rem; font-weight: 800; align-self: flex-start; border: 0; background: color-mix(in srgb, var(--c) 12%, #fff); color: var(--c); border-radius: 999px; padding: 5px 12px; cursor: pointer; }
.mb-pick { font: inherit; font-size: .84rem; font-weight: 800; border: var(--bw) solid var(--c); color: var(--c); background: #fff; border-radius: 10px; padding: 8px; cursor: pointer; }
.mb-pick.on { background: var(--c); color: #fff; }
.mb-test { font-size: .78rem; font-weight: 700; color: var(--primary); text-decoration: none; text-align: center; }
.mb-dock { position: sticky; bottom: 0; z-index: 2; display: flex; align-items: center; gap: 8px; background: #fff; border-top: 1px solid var(--line); box-shadow: 0 -6px 12px rgba(43,53,80,.08); padding: 10px 4px; margin: 0 -4px; }
.mb-dock-t { flex: 1; font-size: .84rem; font-weight: 800; color: var(--ink); }
.mb-clear { font: inherit; font-size: .8rem; font-weight: 700; border: 0; background: none; color: var(--muted); cursor: pointer; }
.mb-save { font: inherit; font-size: .9rem; font-weight: 800; border: 0; border-radius: 12px; padding: 10px 20px; background: linear-gradient(135deg, var(--primary), var(--primary-2)); color: #fff; cursor: pointer; }
.mb-save:disabled { opacity: .45; cursor: default; }
</style>
