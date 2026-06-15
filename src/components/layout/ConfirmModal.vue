<template>
  <div class="modal-ov" :class="{ active: visible }" @click.self="cancel">
    <div class="modal-box" style="max-width:300px;text-align:center">
      <div style="font-size:1.3rem;margin-bottom:8px"><Emoji char="🤔" /></div>
      <div style="font-weight:700;font-size:1rem;margin-bottom:18px" v-html="msgHtml"></div>
      <div style="display:flex;gap:8px">
        <button class="btn-gold" style="flex:1" @click="ok">ยืนยัน</button>
        <button class="btn-gray" style="flex:1" @click="cancel">ยกเลิก</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import Emoji from '../shared/Emoji.vue'
import { computed } from 'vue'
import { useConfirm } from '../../composables/useConfirm.js'
const { visible, message, ok, cancel } = useConfirm()
const msgHtml = computed(() =>
    message.value.split('\n').map(l => `<div>${l}</div>`).join('')
)
</script>
