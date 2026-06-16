<template>
  <div id="toast" role="status" aria-live="polite" aria-atomic="true" :class="['toast', type, { show: visible }]">{{ message }}</div>
</template>

<script setup>
import { useToast } from '../../composables/useToast.js'
const { message, type, visible } = useToast()
</script>
