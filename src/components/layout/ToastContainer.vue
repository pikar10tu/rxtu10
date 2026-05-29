<template>
  <div id="toast" :class="['toast', type, { show: visible }]">{{ message }}</div>
</template>

<script setup>
import { useToast } from '../../composables/useToast.js'
const { message, type, visible } = useToast()
</script>
