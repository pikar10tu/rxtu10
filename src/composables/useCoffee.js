// ☕ เปิดแผ่นเลี้ยงกาแฟผู้พัฒนาจากที่ไหนก็ได้ (ท้ายหน้าแรก · เคาน์เตอร์คาเฟ่ใน Co-working) — แผ่นอยู่ที่ App.vue ระดับ root
import { ref } from 'vue'
const open = ref(false)
export function useCoffee() {
  return { coffeeOpen: open, openCoffee: () => { open.value = true } }
}
