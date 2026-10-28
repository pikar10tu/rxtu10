<!-- src/components/admin/AdminBattleLab.vue
     🧪 ไฟต์ทดลองสำหรับแอดมิน — ดูจอจริงของเพ็ทที่ยังไม่เปิดตัว (wave ใหม่) ก่อนวันเปิดตู้
     ซิมในเครื่องล้วน ไม่อ่าน/เขียน Firestore · ไม่ให้รางวัล · ใช้ได้เฉพาะในหน้าแอดมิน -->
<template>
  <section class="admin-card">
    <div class="admin-card-head"><span><Emoji char="🧪" /> ไฟต์ทดลอง (แอดมิน)</span></div>
    <div class="admin-hint">ทีมเรา = เพ็ทที่เลือก + ตัวประกอบ · ซิมในเครื่อง ไม่บันทึกอะไร · กดซ้ำได้ผลสุ่มใหม่</div>
    <div class="lab-btns">
      <button v-for="s in SCENES" :key="s.key" class="btn-mini" @click="play(s)">{{ s.label }}</button>
    </div>
    <BattleReplay v-if="replay" :data="replay" theme="tower" exitable exit-label="ปิด ✕" @close="replay = null" @done="() => {}" />
  </section>
</template>

<script setup>
import { ref } from 'vue'
import Emoji from '../shared/Emoji.vue'
import BattleReplay from '../battle/BattleReplay.vue'
import { simulateBattle } from '../../utils/battleEngine.js'
import { PETS } from '../../data/index.js'

const pet = (id, grade = 4) => { const d = PETS.find(p => p.id === id); return { id, rarity: d.rarity, element: d.element, grade } }
const filler = (id) => pet(id, 3)
const SCENES = [
  { key: 'ghost', label: '👻 ผีน้อย', a: ['ghost', 'cat'], b: ['lion', 'wolf', 'shark'], g: 1 },
  { key: 'comet', label: '☄️ ดาวหาง', a: ['comet', 'cat', 'turtle'], b: ['virus', 'luna', 'earth'] },
  { key: 'nemesis', label: '👤 เนเมซิส', a: ['nemesis', 'cat', 'hamster'], b: ['wolf', 'shark', 'fox'] },
  { key: 'robot', label: '🤖 โรบอท', a: ['robot', 'butterfly'], b: ['rabbit', 'cerberus', 'shark'] },
  { key: 'alien', label: '👽 เอเลี่ยน', a: ['alien', 'cat'], b: ['hedgehog', 'kirin', 'luna'] },
  { key: 'ufo', label: '🛸 UFO', a: ['ufo', 'cat', 'turtle'], b: ['wolf', 'shark', 'fox'] },
  { key: 'mix', label: '🎲 รวม 6 ตัว', a: ['ufo', 'alien', 'ghost'], b: ['nemesis', 'robot', 'comet'] },
  // 🧾 ระบบสถานะ 28 ต.ค.: ป้ายเทิร์น/หลายก้อน "+" · ป้ายนับ ×n · ล้าง
  { key: 'burn', label: '🐉 พ่นไฟ 🔥', a: ['bahamut', 'cat', 'turtle'], b: ['unicorn', 'butterfly', 'wolf'] },
  { key: 'mask', label: '🤍 มาสก์ ×n', a: ['rabbit', 'cat', 'turtle'], b: ['wolf', 'shark', 'fox'] },
  { key: 'burn2', label: '🔥 ไฟหลายก้อน +', a: ['bahamut', 'cat', 'turtle'], b: ['bahamut', 'butterfly', 'wolf'] },
  { key: 'virus', label: '🦠 เชื้อ vs ล้าง', a: ['virus', 'cat', 'turtle'], b: ['unicorn', 'butterfly', 'wolf'] },
]
const replay = ref(null)
function play(s) {
  const A = s.a.map((id, i) => (i === 0 ? pet(id, s.g ?? 4) : filler(id)))
  const B = s.b.map(filler)
  const result = simulateBattle(A, B, Date.now() % 1e9)
  replay.value = { result, playerTeam: A, botTeam: B, won: result.winner === 'A', vsLabel: `ทดลอง: ${s.label}`,
    winText: 'ชนะ (ทดลอง)', loseText: 'แพ้ (ทดลอง)', rewardText: 'ไฟต์ทดลอง ไม่มีรางวัล' }
}
</script>

<style scoped>
.lab-btns { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
</style>
