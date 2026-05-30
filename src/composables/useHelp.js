import { ref } from 'vue'

// shared singleton open-state for the Help / วิธีเล่น modal
const helpOpen = ref(false)

export function useHelp() {
  function openHelp()  { helpOpen.value = true }
  function closeHelp() { helpOpen.value = false }
  return { helpOpen, openHelp, closeHelp }
}
