<!-- การ์ดอ่าน MBTI แบบเต็ม (โทนดูดวง) — เด้งทับได้ทั้งจากแผ่นเลือกในหน้าฉัน (z400) และการ์ดโปรไฟล์เพื่อน (z220)
     ⇒ z 410 ตามบันได CLAUDE.md ข้อ 12 · Teleport ไป body · แตะนอกการ์ด/✕ = ปิด -->
<template>
  <Teleport to="body">
    <div v-if="t" class="mc-ov" @click.self="$emit('close')">
      <div class="mc" :style="{ '--c': t.color }" role="dialog" :aria-label="`${t.code} ${t.name}`">
        <button class="mc-x" aria-label="ปิด" @click="$emit('close')">✕</button>
        <div class="mc-hero">
          <span class="mc-ic"><Emoji :char="MBTI_ICON[t.code]" /></span>
          <div class="mc-code">{{ t.code }}</div>
          <div class="mc-name">{{ t.name }}</div>
          <div class="mc-grp">{{ t.groupLabel }}</div>
          <div class="mc-letters">
            <span v-for="ch in t.code.split('')" :key="ch" class="mc-letter"><b>{{ ch }}</b> {{ MBTI_LETTERS[ch] }}</span>
          </div>
        </div>
        <div class="mc-body">
          <p class="mc-lead">{{ m.about || t.desc }}</p>
          <section v-for="s in sections" :key="s.k" class="mc-sec">
            <h4><Emoji :char="s.icon" /> {{ s.label }}</h4>
            <p>{{ m[s.k] }}</p>
          </section>
          <section v-if="m.fortune" class="mc-sec mc-fortune">
            <h4><Emoji char="🔮" /> คำทำนายช่วงสอบ</h4>
            <p>{{ m.fortune }}</p>
          </section>
          <!-- ใครในรุ่นเป็นแบบนี้ (แถว roster ที่โหลดอยู่แล้ว · 0 read) -->
          <section v-if="who.length" class="mc-sec">
            <h4><Emoji char="👥" /> ใครในรุ่นเป็น {{ t.code }}</h4>
            <div class="mc-who"><span v-for="n in who" :key="n.uid" class="mc-name" :class="{ me: n.me }">{{ n.name }}</span></div>
          </section>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import Emoji from '../shared/Emoji.vue'
import { mbtiOf, MBTI_MORE, MBTI_ICON, MBTI_LETTERS } from '../../data/mbti.js'
import { useEscapeKey } from '../../composables/useEscapeKey.js'
import { useAuthStore } from '../../stores/auth.js'
import { useMembersStore } from '../../stores/members.js'

const props = defineProps({ code: { type: String, default: null } })
const emit = defineEmits(['close'])
const t = computed(() => mbtiOf(props.code))
const m = computed(() => (t.value && MBTI_MORE[t.value.code]) || {})
const sections = [
  { k: 'friends', icon: '💬', label: 'เวลาอยู่กับเพื่อน' },
  { k: 'team', icon: '🤝', label: 'เวลาทำงานเป็นทีม' },
  { k: 'good', icon: '✨', label: 'จุดเด่น' },
  { k: 'study', icon: '📚', label: 'สไตล์อ่านหนังสือ' },
  { k: 'tip', icon: '💡', label: 'เคล็ดลับ' },
]
useEscapeKey(() => !!t.value, () => emit('close'))
const auth = useAuthStore()
const members = useMembersStore()
const who = computed(() => {
  const code = t.value?.code
  if (!code) return []
  const me = auth.currentUser?.uid
  const out = Object.entries(members.rosterRows || {})
    .filter(([uid, r]) => uid !== me && mbtiOf(r?.mb)?.code === code)
    .map(([uid, r]) => ({ uid, name: r.n || '?', me: false }))
  if (me && mbtiOf(auth.userData?.mbti)?.code === code) out.unshift({ uid: me, name: 'คุณ', me: true })
  return out
})
</script>

<style scoped>
.mc-ov { position: fixed; inset: 0; z-index: 410; background: rgba(20, 16, 40, .55); display: flex; align-items: center; justify-content: center; padding: 16px; }
.mc { position: relative; width: 100%; max-width: 440px; max-height: calc(100% - 24px); overflow-y: auto; background: #fff; border-radius: 22px; box-shadow: 0 20px 50px rgba(0,0,0,.3); }
.mc-x { position: absolute; top: 10px; right: 10px; z-index: 2; width: 32px; height: 32px; border-radius: 50%; border: 0; background: rgba(255,255,255,.85); font-size: .95rem; cursor: pointer; color: var(--ink); }
.mc-hero { text-align: center; padding: 22px 16px 16px; color: #fff; background: var(--c); background: linear-gradient(160deg, var(--c), color-mix(in srgb, var(--c) 55%, #1e1b4b)); border-radius: 22px 22px 0 0; }
.mc-ic { display: inline-grid; place-items: center; width: 72px; height: 72px; border-radius: 50%; background: rgba(255,255,255,.22); font-size: 2.6rem; }
.mc-code { font-size: 1.8rem; font-weight: 800; letter-spacing: .08em; margin-top: 6px; }
.mc-name { font-size: 1.05rem; font-weight: 700; }
.mc-grp { font-size: .76rem; opacity: .85; margin-top: 2px; }
.mc-letters { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 10px; margin-top: 12px; text-align: left; font-size: .74rem; }
.mc-letter { background: rgba(255,255,255,.16); border-radius: 8px; padding: 4px 8px; }
.mc-letter b { font-size: .86rem; margin-right: 2px; }
.mc-body { padding: 14px 16px 18px; display: flex; flex-direction: column; gap: 12px; }
.mc-lead { margin: 0; font-size: .9rem; line-height: 1.7; color: var(--ink); font-weight: 600; }
.mc-sec h4 { margin: 0 0 3px; font-size: .84rem; color: var(--c); }
.mc-sec p { margin: 0; font-size: .84rem; line-height: 1.65; color: var(--ink); }
.mc-fortune { background: #f6f2fb; background: color-mix(in srgb, var(--c) 10%, #fff); border-radius: 14px; padding: 10px 12px; }
.mc-who { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.mc-name { font-size: .76rem; background: #f6f2fb; border-radius: 999px; padding: 2px 9px; color: var(--ink); }
.mc-name.me { background: var(--c); color: #fff; font-weight: 700; }
</style>
