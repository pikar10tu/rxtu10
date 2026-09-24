<!-- src/components/battle/PvpHistory.vue -->
<!-- ประวัติสนามประลอง 2 แท็บ — กางเองเมื่อมีของจริง · แท็บแรกคือแท็บที่มีของ
     อ่านจาก roster ที่โหลดอยู่แล้วทั้งหมด ⇒ ไม่มี read เพิ่ม
     ⚠️ ฝั่งตั้งรับห้ามโชว์เหรียญและห้ามให้รางวัล — ผู้บุกเป็นคนจดผลเอง (ดูสเปก) -->
<template>
  <div class="ph">
    <!-- พับเฉพาะตอน "ไม่มีอะไรอยู่ข้างใน" — เดิมพับไว้เสมอ ทำให้คนที่มีประวัติจริง
         เห็นแค่หัวข้อลอยๆ แล้วแจ้งว่า "ประวัติบุกไม่ขึ้น" (31 ส.ค.)
         กดเองเมื่อไหร่ค่าที่กดชนะเสมอ (manual) — ไม่ให้ของที่โหลดมาทีหลังไปเด้งกลับ -->
    <button class="ph-toggle" :aria-expanded="open" @click="manual = !open">
      <span class="ph-title"><Emoji char="📜" /> ประวัติการต่อสู้</span>
      <span v-if="summary" class="ph-sum">{{ summary }}</span>
      <span class="ph-caret" :class="{ open }">▸</span>
    </button>

    <div v-if="open" class="ph-tabs" role="tablist">
      <button class="ph-tab" :class="{ on: tab === 'def' }" role="tab" :aria-selected="tab === 'def'"
        @click="pickedTab = 'def'">มีคนมาหาเรา<span v-if="defense.length" class="ph-n">{{ defense.length }}</span></button>
      <button class="ph-tab" :class="{ on: tab === 'atk' }" role="tab" :aria-selected="tab === 'atk'"
        @click="pickedTab = 'atk'">เราไปบุก<span v-if="attacks.length" class="ph-n">{{ attacks.length }}</span></button>
    </div>

    <template v-if="open && tab === 'def'">
      <div v-if="!defense.length" class="ph-empty">ยังไม่มีใครมาบุกเลย — ทีมที่จัดไว้กำลังเฝ้าอยู่</div>
      <div v-for="(r, i) in defense" :key="'d' + i" class="ph-row" :class="{ fr: r.friendly }">
        <button class="ph-who" type="button" @click="$emit('open', r.uid)">
          <Emoji :char="r.friendly ? '🤝' : '🛡️'" /> <b>{{ r.name }}</b> {{ r.friendly ? 'มาท้าสู้กระชับมิตร' : 'บุกเรา' }}
        </button>
        <span class="ph-res" :class="r.won ? 'ok' : 'no'">{{ r.friendly ? (r.won ? 'เราชนะ' : 'เราแพ้') : (r.won ? 'เรารอด' : 'เราแพ้') }}</span>
        <span class="ph-ago">{{ agoLabel(r.t, now) }}</span>
      </div>
    </template>

    <template v-else-if="open">
      <div v-if="!attacks.length" class="ph-empty">ยังไม่ได้ออกบุกใครเลย — เลือกสักคนจากกระดานด้านบน</div>
      <div v-for="(r, i) in attacks" :key="'a' + i" class="ph-row" :class="{ fr: r.friendly }">
        <button class="ph-who" type="button" @click="$emit('open', r.uid)">
          <Emoji :char="r.friendly ? '🤝' : '⚔️'" /> {{ r.friendly ? 'ท้า' : 'บุก' }} <b>{{ r.name }}</b>
        </button>
        <span class="ph-res" :class="r.won ? 'ok' : 'no'">{{ r.won ? 'ชนะ' : 'แพ้' }}</span>
        <span v-if="r.coin" class="ph-coin">+{{ r.coin.toLocaleString() }}<Emoji char="🪙" /></span>
        <span class="ph-ago">{{ agoLabel(r.t, now) }}</span>
      </div>
    </template>

    <div v-if="open" class="ph-note">🤝 = ท้าสู้กระชับมิตร (ไม่มีเหรียญ ไม่กระทบแต้ม) · กดชื่อเพื่อดูโปรไฟล์/ท้ากลับ · เก็บ {{ HISTORY_MAX }} รายการล่าสุดของแต่ละคน</div>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { useMembersStore } from '../../stores/members.js'
import { myAttacks, defenseLog, agoLabel, HISTORY_MAX } from '../../utils/pvpHistory.js'

// startOpen: หน้าฉันกางไว้เสมอ (สนามประลองยังพับเมื่อว่างตามเดิม) · open(uid) = กดชื่อ → ผู้ใช้หน้าแม่เปิดโปรไฟล์
const props = defineProps({ startOpen: { type: Boolean, default: false } })
defineEmits(['open'])

const auth = useAuthStore()
const members = useMembersStore()

const now = Date.now()   // แช่ไว้ตอน mount — ป้ายเวลาไม่ต้องเดินสด (เลี่ยง re-render ทั้งลิสต์)

const uid = computed(() => auth.currentUser?.uid)
const attacks = computed(() => myAttacks(members.rosterRows || {}, uid.value))
const defense = computed(() => defenseLog(members.rosterRows || {}, uid.value))

// กาง/พับ: null = ยังไม่ได้กดเอง → ตัดสินจาก "มีของไหม"
// (roster โหลดเสร็จทีหลังได้ · computed จึงกางเองตอนของมาถึง)
const manual = ref(null)
const open = computed(() => manual.value ?? (props.startOpen || attacks.value.length > 0 || defense.value.length > 0))

// แท็บ: null = ยังไม่ได้เลือกเอง → เปิดแท็บที่มีของ (ตั้งรับก่อนถ้ามีทั้งคู่ — ของที่ไม่เคยเห็นมาก่อน)
const pickedTab = ref(null)
const tab = computed(() =>
  pickedTab.value ?? (defense.value.length ? 'def' : attacks.value.length ? 'atk' : 'def'))

// บรรทัดสรุปบนหัวข้อ — นับจาก computed ที่มีอยู่แล้ว ไม่ได้สแกน roster ซ้ำ
const summary = computed(() => {
  const parts = []
  if (defense.value.length) {
    parts.push(`มีคนมาหา ${defense.value.length} ครั้ง (ชนะ/รอด ${defense.value.filter(r => r.won).length})`)
  }
  if (attacks.value.length) parts.push(`เราไปบุก ${attacks.value.length} ครั้ง`)
  return parts.join(' · ')
})
</script>

<style scoped>
.ph { background: #fff; border: var(--bw) solid var(--line); border-radius: 16px; box-shadow: var(--pop); padding: 12px 14px; margin-top: 14px; }
.ph-toggle { display: flex; align-items: center; gap: 8px; width: 100%; background: none; border: none; padding: 0; font-family: inherit; cursor: pointer; text-align: left; color: inherit; }
.ph-title { font-size: .88rem; font-weight: 800; flex-shrink: 0; }
.ph-sum { flex: 1; font-size: .74rem; color: var(--muted); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ph-caret { margin-left: auto; font-size: .8rem; color: var(--muted); transition: transform .15s ease; }
.ph-caret.open { transform: rotate(90deg); }
.ph-who { background: none; border: 0; padding: 0; font: inherit; color: inherit; text-align: left; cursor: pointer; }
.ph-who b { font-weight: 800; }
.ph-row.fr { background: var(--accent-light); border-radius: 10px; padding-left: 6px; padding-right: 6px; }
.ph-tabs { display: flex; gap: 6px; margin: 10px 0 4px; }
.ph-tab { border: var(--bw) solid var(--line); background: #fff; border-radius: 999px; padding: 4px 12px; font-family: inherit; font-weight: 800; font-size: .72rem; cursor: pointer; }
.ph-tab.on { background: var(--primary); color: #fff; }
.ph-n { display: inline-block; margin-left: 5px; font-size: .7rem; opacity: .75; }
.ph-row { display: flex; align-items: center; gap: 6px; padding: 7px 0; border-top: 1px dashed rgba(0,0,0,.12); font-size: .76rem; }
.ph-who { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 700; }
.ph-res { font-weight: 800; flex-shrink: 0; }
.ph-res.ok { color: #15803d; }
.ph-res.no { color: #b91c1c; }
.ph-coin { font-weight: 800; color: #b45309; flex-shrink: 0; }
.ph-ago { color: rgba(0,0,0,.45); font-size: .7rem; flex-shrink: 0; }
.ph-empty { text-align: center; color: rgba(0,0,0,.45); font-size: .76rem; padding: 16px 8px; line-height: 1.6; }
.ph-note { margin-top: 10px; font-size: .7rem; color: rgba(0,0,0,.4); line-height: 1.5; }
</style>
