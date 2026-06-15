<template>
  <div v-if="helpOpen" class="help-ov" @click.self="closeHelp">
    <div class="help-box">
      <div class="help-head">
        <span><Emoji char="📖" /> วิธีเล่น</span>
        <button class="help-x" @click="closeHelp">✕</button>
      </div>

      <div class="help-scroll">
        <div v-for="(s, i) in sections" :key="i" class="help-sec">
          <button class="help-sec-head" @click="toggle(i)">
            <span class="help-sec-title"><Emoji :char="s.icon" /> {{ s.title }}</span>
            <span v-if="s.soon" class="help-soon">เร็วๆ นี้</span>
            <span class="help-caret">{{ open === i ? '−' : '+' }}</span>
          </button>
          <ul v-if="open === i" class="help-sec-body">
            <li v-for="(line, j) in s.body" :key="j">{{ line }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { ref } from 'vue'
import { GUIDE_SECTIONS } from '../../data/guide.js'
import { useHelp } from '../../composables/useHelp.js'

const { helpOpen, closeHelp } = useHelp()
const sections = GUIDE_SECTIONS
const open = ref(0) // first section expanded by default

function toggle(i) { open.value = open.value === i ? -1 : i }
</script>

<style scoped>
.help-ov {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0, 0, 0, .45);
  display: flex; align-items: flex-end; justify-content: center;
}
.help-box {
  background: #fff; width: 100%; max-width: 480px;
  max-height: 85vh; border: 2px solid var(--ink); border-bottom: none;
  border-radius: 18px 18px 0 0;
  display: flex; flex-direction: column;
  animation: help-up .2s ease;
}
.help-head span:first-child { font-family: var(--font-display); font-weight: 400; font-size: 1.25rem; color: var(--ink); }
@keyframes help-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
.help-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px; font-weight: 800; font-size: 1rem;
  border-bottom: 1px solid rgba(0,0,0,.07);
}
.help-x {
  border: none; background: rgba(0,0,0,.06); border-radius: 8px;
  width: 30px; height: 30px; font-size: .9rem; cursor: pointer;
}
.help-scroll { overflow-y: auto; padding: 8px 12px 20px; }
.help-sec { border-bottom: 1px solid rgba(0,0,0,.05); }
.help-sec-head {
  width: 100%; display: flex; align-items: center; gap: 8px;
  background: none; border: none; padding: 13px 4px;
  font-family: inherit; font-size: .9rem; font-weight: 700;
  cursor: pointer; text-align: left;
}
.help-sec-title { flex: 1; }
.help-soon {
  font-size: .58rem; font-weight: 700; color: #b45309;
  background: rgba(251,191,36,.18); padding: 2px 7px; border-radius: 999px;
}
.help-caret { color: rgba(0,0,0,.35); font-size: 1.1rem; width: 16px; text-align: center; }
.help-sec-body {
  margin: 0 0 12px; padding-left: 22px;
  display: flex; flex-direction: column; gap: 6px;
}
.help-sec-body li { font-size: .78rem; color: rgba(0,0,0,.62); line-height: 1.5; }
</style>
