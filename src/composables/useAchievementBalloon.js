import { ref } from 'vue'

// คิว balloon ปลดล็อก achievement (singleton ข้ามทั้งแอป)
const queue = ref([])   // [{ title, icon }]

export function useAchievementBalloon() {
  function celebrate(item) { if (item) queue.value = [...queue.value, item] }
  function dismiss() { queue.value = queue.value.slice(1) }
  return { queue, celebrate, dismiss }
}
