import { ref } from 'vue'

// shared singleton: topic ที่กำลังเปิดอยู่ (null = ปิด)
const helpTopic = ref(null)

export function useHelp() {
  function openHelp(topic) { helpTopic.value = topic }
  function closeHelp() { helpTopic.value = null }
  return { helpTopic, openHelp, closeHelp }
}
